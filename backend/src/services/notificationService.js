const { query } = require('../config/database');
const emailService = require('./emailService');
const { cacheHelper } = require('../config/redis');

class NotificationService {
  // Create notification
  async createNotification(data) {
    const {
      userId,
      type,
      title,
      content,
      actionUrl = null,
      referenceType = null,
      referenceId = null,
      priority = 'normal'
    } = data;

    const sql = `
      INSERT INTO notifications (
        user_id, notification_type, title, content,
        action_url, reference_type, reference_id, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    try {
      const result = await query(sql, [
        userId,
        type,
        title,
        content,
        actionUrl,
        referenceType,
        referenceId,
        priority
      ]);

      // Clear user notifications cache
      await cacheHelper.del(`notifications:user:${userId}`);

      // Emit real-time notification (for WebSocket)
      this.emitRealTimeNotification(userId, result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  }

  // Get unread count
  async getUnreadCount(userId) {
    const cacheKey = `notifications:unread:${userId}`;
    let count = await cacheHelper.get(cacheKey);

    if (count === null) {
      const sql = `
        SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND is_read = FALSE
      `;

      const result = await query(sql, [userId]);
      count = parseInt(result.rows[0].count);

      await cacheHelper.set(cacheKey, count, 300);
    }

    return count;
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query(sql, [notificationId, userId]);

    if (result.rows.length > 0) {
      await cacheHelper.del(`notifications:unread:${userId}`);
      await cacheHelper.del(`notifications:user:${userId}`);
    }

    return result.rows[0];
  }

  // Mark all as read
  async markAllAsRead(userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING COUNT(*) as count
    `;

    const result = await query(sql, [userId]);

    await cacheHelper.del(`notifications:unread:${userId}`);
    await cacheHelper.del(`notifications:user:${userId}`);

    return result.rows[0];
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    const sql = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query(sql, [notificationId, userId]);

    if (result.rows.length > 0) {
      await cacheHelper.del(`notifications:unread:${userId}`);
      await cacheHelper.del(`notifications:user:${userId}`);
    }

    return result.rows.length > 0;
  }

  // Delete all notifications for user
  async deleteAllNotifications(userId) {
    const sql = `
      DELETE FROM notifications
      WHERE user_id = $1
      RETURNING COUNT(*) as count
    `;

    const result = await query(sql, [userId]);

    await cacheHelper.del(`notifications:unread:${userId}`);
    await cacheHelper.del(`notifications:user:${userId}`);

    return result.rows[0];
  }

  // === Specific notification types ===

  // New content published
  async notifyNewContent(content, followers) {
    const notifications = followers.map(follower => ({
      userId: follower.id,
      type: 'new_content',
      title: 'محتوى جديد من كاتب تتابعه',
      content: `نشر ${content.author_name} محتوى جديد: ${content.title}`,
      actionUrl: `/content/${content.slug}`,
      referenceType: 'content',
      referenceId: content.id,
      priority: 'normal'
    }));

    return await Promise.all(
      notifications.map(notif => this.createNotification(notif))
    );
  }

  // New reply on discussion
  async notifyNewReply(discussion, reply, authorId) {
    return await this.createNotification({
      userId: authorId,
      type: 'new_reply',
      title: 'رد جديد على مناقشتك',
      content: `رد ${reply.author_name} على مناقشتك: ${discussion.title}`,
      actionUrl: `/discussions/${discussion.id}`,
      referenceType: 'discussion_reply',
      referenceId: reply.id,
      priority: 'normal'
    });
  }

  // Reply mention
  async notifyMention(mentionedUserId, content, type, author) {
    return await this.createNotification({
      userId: mentionedUserId,
      type: 'mention',
      title: 'تم ذكرك',
      content: `ذكرك ${author.full_name} في ${type === 'discussion' ? 'مناقشة' : 'رد'}`,
      actionUrl: content.url,
      referenceType: type,
      referenceId: content.id,
      priority: 'high'
    });
  }

  // Best answer selected
  async notifyBestAnswer(userId, discussion) {
    // Send notification
    await this.createNotification({
      userId,
      type: 'best_answer',
      title: '🏆 تم اختيار إجابتك كأفضل إجابة!',
      content: `تم اختيار إجابتك في المناقشة "${discussion.title}" كأفضل إجابة`,
      actionUrl: `/discussions/${discussion.id}`,
      referenceType: 'discussion',
      referenceId: discussion.id,
      priority: 'high'
    });

    // Send email
    const user = await this.getUserById(userId);
    if (user && user.email_notifications) {
      // TODO: Implement best answer email template
    }
  }

  // Badge earned
  async notifyBadgeEarned(userId, badge) {
    // Send notification
    await this.createNotification({
      userId,
      type: 'badge_earned',
      title: '🏆 حصلت على شارة جديدة!',
      content: `تهانينا! لقد حصلت على شارة "${badge.name}"`,
      actionUrl: '/profile?tab=badges',
      referenceType: 'badge',
      referenceId: badge.id,
      priority: 'high'
    });

    // Send email
    const user = await this.getUserById(userId);
    if (user && user.email_notifications) {
      await emailService.sendBadgeEarnedEmail(user, badge);
    }
  }

  // Content liked
  async notifyContentLiked(contentId, likerUserId, authorId) {
    if (likerUserId === authorId) return; // Don't notify if user likes their own content

    const liker = await this.getUserById(likerUserId);
    const content = await this.getContentById(contentId);

    return await this.createNotification({
      userId: authorId,
      type: 'content_liked',
      title: 'إعجاب بمحتواك',
      content: `أعجب ${liker.full_name} بمحتواك: ${content.title}`,
      actionUrl: `/content/${content.slug}`,
      referenceType: 'content',
      referenceId: contentId,
      priority: 'low'
    });
  }

  // New follower
  async notifyNewFollower(userId, followerId) {
    const follower = await this.getUserById(followerId);

    return await this.createNotification({
      userId,
      type: 'new_follower',
      title: 'متابع جديد',
      content: `بدأ ${follower.full_name} بمتابعتك`,
      actionUrl: `/users/${follower.username}`,
      referenceType: 'user',
      referenceId: followerId,
      priority: 'normal'
    });
  }

  // Content approved
  async notifyContentApproved(content, userId) {
    // Send notification
    await this.createNotification({
      userId,
      type: 'content_approved',
      title: '✅ تم الموافقة على محتواك',
      content: `تمت الموافقة على محتواك "${content.title}" ونشره`,
      actionUrl: `/content/${content.slug}`,
      referenceType: 'content',
      referenceId: content.id,
      priority: 'high'
    });

    // Send email
    const user = await this.getUserById(userId);
    if (user && user.email_notifications) {
      await emailService.sendContentPublishedEmail(user, content);
    }
  }

  // Content rejected
  async notifyContentRejected(content, userId, reason) {
    return await this.createNotification({
      userId,
      type: 'content_rejected',
      title: '❌ تم رفض محتواك',
      content: `تم رفض محتواك "${content.title}". السبب: ${reason}`,
      actionUrl: `/content/${content.id}/edit`,
      referenceType: 'content',
      referenceId: content.id,
      priority: 'high'
    });
  }

  // Learning path completed
  async notifyPathCompleted(userId, path) {
    return await this.createNotification({
      userId,
      type: 'path_completed',
      title: '🎉 مبروك! أكملت مساراً تعليمياً',
      content: `أكملت مسار "${path.title}" بنجاح`,
      actionUrl: `/learning-paths/${path.slug}/certificate`,
      referenceType: 'learning_path',
      referenceId: path.id,
      priority: 'high'
    });
  }

  // System announcement
  async notifySystemAnnouncement(userIds, announcement) {
    const notifications = userIds.map(userId => ({
      userId,
      type: 'system_announcement',
      title: announcement.title,
      content: announcement.content,
      actionUrl: announcement.url || null,
      priority: announcement.priority || 'normal'
    }));

    return await Promise.all(
      notifications.map(notif => this.createNotification(notif))
    );
  }

  // Broadcast to all users
  async broadcastToAllUsers(announcement) {
    const sql = `
      SELECT id FROM users WHERE status = 'active'
    `;

    const result = await query(sql);
    const userIds = result.rows.map(row => row.id);

    return await this.notifySystemAnnouncement(userIds, announcement);
  }

  // === Helper methods ===

  async getUserById(userId) {
    const sql = `
      SELECT id, username, full_name, email, email_notifications
      FROM users
      WHERE id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[0];
  }

  async getContentById(contentId) {
    const sql = `
      SELECT id, title, slug, author_id
      FROM content
      WHERE id = $1
    `;

    const result = await query(sql, [contentId]);
    return result.rows[0];
  }

  // Emit real-time notification (placeholder for WebSocket implementation)
  emitRealTimeNotification(userId, notification) {
    // TODO: Implement WebSocket/Socket.io integration
    // This would emit the notification to connected clients in real-time
    console.log(`📢 Real-time notification for user ${userId}:`, notification.title);
  }

  // Clean up old notifications
  async cleanupOldNotifications(daysOld = 90) {
    const sql = `
      DELETE FROM notifications
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      RETURNING COUNT(*) as count
    `;

    const result = await query(sql);
    console.log(`Cleaned up ${result.rows[0].count} old notifications`);

    return result.rows[0].count;
  }
}

// Export singleton instance
module.exports = new NotificationService();
