const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  // Verify transporter connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      return false;
    }
  }

  // Send email helper
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  // Welcome email
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; color: #333; line-height: 1.8; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; }
          h1 { margin: 0; font-size: 32px; }
          .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 مرحباً بك في منصة المعرفة التسويقية</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.full_name}،</h2>
            <p>نحن سعداء جداً بانضمامك إلى مجتمعنا المتنامي من المسوقين الرقميين!</p>

            <p><strong>ما الذي يمكنك فعله الآن؟</strong></p>
            <ul>
              <li>📚 استكشف مسارات التعلم المخصصة لمستواك</li>
              <li>📝 اقرأ مقالات وحالات دراسية حصرية</li>
              <li>💬 شارك في المناقشات وتواصل مع الخبراء</li>
              <li>🏆 اكسب نقاط السمعة والشارات</li>
            </ul>

            <p style="text-align: center;">
              <a href="${config.app.frontendUrl}/dashboard" class="button">ابدأ التعلم الآن</a>
            </p>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666;">
              <strong>نصيحة:</strong> أكمل ملفك الشخصي لتحصل على توصيات محتوى مخصصة!
            </p>
          </div>
          <div class="footer">
            <p>منصة المعرفة التسويقية - المحتوى العربي الاحترافي للمسوقين</p>
            <p>تابعنا على: Twitter | LinkedIn | Facebook</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🎉 مرحباً بك في منصة المعرفة التسويقية',
      html
    });
  }

  // Email verification
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${config.app.frontendUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; color: #333; line-height: 1.8; }
          .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .code-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ تأكيد البريد الإلكتروني</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.full_name}،</h2>
            <p>شكراً لتسجيلك في منصة المعرفة التسويقية!</p>
            <p>للبدء في استخدام حسابك، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه:</p>

            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
            </p>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
              إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد بأمان.
            </p>

            <p style="color: #666; font-size: 14px;">
              <strong>ملاحظة:</strong> هذا الرابط صالح لمدة 24 ساعة فقط.
            </p>
          </div>
          <div class="footer">
            <p>منصة المعرفة التسويقية</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '✉️ تأكيد بريدك الإلكتروني - منصة المعرفة التسويقية',
      html
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f56565 0%, #d53f8c 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; color: #333; line-height: 1.8; }
          .button { display: inline-block; background: #f56565; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border-right: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 إعادة تعيين كلمة المرور</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.full_name}،</h2>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة مرور حسابك.</p>
            <p>إذا كنت أنت من طلب ذلك، انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>

            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
            </p>

            <div class="warning">
              <strong>⚠️ تنبيه أمني:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد. حسابك آمن ولم يتم إجراء أي تغييرات.
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>ملاحظة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط.
            </p>
          </div>
          <div class="footer">
            <p>منصة المعرفة التسويقية - الأمان أولوية</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🔒 إعادة تعيين كلمة المرور - منصة المعرفة التسويقية',
      html
    });
  }

  // Content published notification
  async sendContentPublishedEmail(user, content) {
    const contentUrl = `${config.app.frontendUrl}/content/${content.slug}`;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; color: #333; line-height: 1.8; }
          .button { display: inline-block; background: #48bb78; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .success { background: #d4edda; border-right: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ تم نشر محتواك!</h1>
          </div>
          <div class="content">
            <h2>تهانينا ${user.full_name}! 🎉</h2>

            <div class="success">
              <strong>تم نشر محتواك بنجاح!</strong><br>
              العنوان: <strong>${content.title}</strong>
            </div>

            <p>محتواك أصبح الآن متاحاً للجميع ويمكن لأفراد المجتمع قراءته والاستفادة منه.</p>

            <p style="text-align: center;">
              <a href="${contentUrl}" class="button">عرض المحتوى</a>
            </p>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <strong>💡 نصيحة:</strong> شارك محتواك على وسائل التواصل الاجتماعي للوصول إلى جمهور أكبر!
            </p>
          </div>
          <div class="footer">
            <p>شكراً لمساهمتك في إثراء المحتوى العربي!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '✅ تم نشر محتواك - منصة المعرفة التسويقية',
      html
    });
  }

  // New reply notification
  async sendNewReplyEmail(user, discussion, reply) {
    const discussionUrl = `${config.app.frontendUrl}/discussions/${discussion.id}`;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; color: #333; line-height: 1.8; }
          .button { display: inline-block; background: #4299e1; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .reply-box { background: #f8f9fa; border-right: 4px solid #4299e1; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 رد جديد على مناقشتك</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${user.full_name}،</h2>
            <p>لقد تلقيت رداً جديداً على مناقشتك: <strong>${discussion.title}</strong></p>

            <div class="reply-box">
              <p style="margin: 0; color: #666; font-size: 14px;">رد من: <strong>${reply.author_name}</strong></p>
              <p style="margin-top: 10px;">${reply.content.substring(0, 200)}${reply.content.length > 200 ? '...' : ''}</p>
            </div>

            <p style="text-align: center;">
              <a href="${discussionUrl}" class="button">عرض المناقشة</a>
            </p>
          </div>
          <div class="footer">
            <p>منصة المعرفة التسويقية - مجتمع التسويق الرقمي</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '💬 رد جديد على مناقشتك - منصة المعرفة التسويقية',
      html
    });
  }

  // Badge earned notification
  async sendBadgeEarnedEmail(user, badge) {
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; color: #333; line-height: 1.8; }
          .button { display: inline-block; background: #f6ad55; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .badge { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 لقد حصلت على شارة جديدة!</h1>
          </div>
          <div class="content">
            <h2>مبروك ${user.full_name}! 🎊</h2>

            <div class="badge">
              <h1 style="font-size: 60px; margin: 0;">${badge.icon}</h1>
              <h3 style="margin: 10px 0; font-size: 24px;">${badge.name}</h3>
              <p style="margin: 0; color: #666;">${badge.description}</p>
            </div>

            <p style="text-align: center;">
              <a href="${config.app.frontendUrl}/profile?tab=badges" class="button">عرض جميع شاراتك</a>
            </p>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
              استمر في المساهمة لكسب المزيد من الشارات!
            </p>
          </div>
          <div class="footer">
            <p>منصة المعرفة التسويقية - نفخر بإنجازاتك!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🏆 مبروك! لقد حصلت على شارة جديدة - منصة المعرفة التسويقية',
      html
    });
  }
}

// Export singleton instance
module.exports = new EmailService();
