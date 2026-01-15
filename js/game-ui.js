// ========================================
// واجهة المستخدم لنظام اللعبة
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    initGameUI();

    // تحديث كل دقيقة
    setInterval(updateStats, 60000);
});

function initGameUI() {
    // تحديث الإحصائيات
    updateStats();

    // عرض المكونات الستة
    renderGameComponents();

    // عرض الإنجازات
    renderAchievements();

    // التحقق من وجود بيانات البروتوكول
    checkProtocolCompletion();
}

function updateStats() {
    const stats = gameSystem.getStats();

    document.getElementById('player-level').textContent = stats.level;
    document.getElementById('xp-bar').style.width = stats.xpPercentage + '%';
    document.getElementById('xp-text').textContent = `${gameSystem.xp} / ${gameSystem.xpToNextLevel} XP`;
    document.getElementById('streak-days').textContent = stats.streakDays;
    document.getElementById('achievements-count').textContent = stats.totalAchievements;
}

function checkProtocolCompletion() {
    const summary = protocol.getSummary();
    const warning = document.getElementById('no-protocol-warning');
    const components = document.getElementById('game-components');

    if (summary.answeredQuestions < 10) {
        warning.style.display = 'block';
        components.style.display = 'none';
    } else {
        warning.style.display = 'none';
        components.style.display = 'block';
    }
}

function renderGameComponents() {
    const container = document.getElementById('game-components');
    const components = gameSystem.components;

    let html = '';

    // 1. Anti-Vision
    html += `
        <div class="game-section">
            <h3><span class="game-section-icon">⚠️</span> الحاجة الـ بتخسرها (الرؤية المضادة)</h3>
            <div class="vision-text" style="background: #f8d7da; border-color: #dc3545;">
                ${components.antiVision || '<em>خلص البروتوكول أول عشان تشوف الحاجة دي.</em>'}
            </div>
        </div>
    `;

    // 2. Vision
    html += `
        <div class="game-section">
            <h3><span class="game-section-icon">🎯</span> كيف حتنتصر (الرؤية الإيجابية)</h3>
            <div class="vision-text" style="background: #d4edda; border-color: #28a745;">
                ${components.vision || '<em>خلص البروتوكول أول عشان تشوف الحاجة دي.</em>'}
            </div>
        </div>
    `;

    // 3. Year Goal
    html += `
        <div class="game-section">
            <h3><span class="game-section-icon">🗓️</span> المهمة (تحدي السنة)</h3>
            <div class="vision-text">
                ${components.yearGoal || '<em>خلص البروتوكول أول عشان تشوف الحاجة دي.</em>'}
            </div>
        </div>
    `;

    // 4. Month Project
    html += `
        <div class="game-section">
            <h3><span class="game-section-icon">⚔️</span> معركة الزعيم (مهمة الشهر)</h3>
            <div class="vision-text">
                ${components.monthProject || '<em>خلص البروتوكول أول عشان تشوف الحاجة دي.</em>'}
            </div>
            <div class="progress mt-3">
                <div class="progress-bar" id="month-progress" style="width: ${gameSystem.getDailyProgress()}%">
                    ${gameSystem.getDailyProgress()}%
                </div>
            </div>
        </div>
    `;

    // 5. Daily Levers (Quests)
    html += `
        <div class="game-section">
            <h3><span class="game-section-icon">✅</span> عادات النجاح اليومية (Daily Quests)</h3>
    `;

    if (components.dailyLevers && components.dailyLevers.length > 0) {
        html += '<ul class="quest-list">';
        components.dailyLevers.forEach(quest => {
            html += `
                <li class="quest-item">
                    <input type="checkbox" 
                           class="quest-checkbox" 
                           id="${quest.id}"
                           ${quest.completed ? 'checked' : ''}
                           onchange="toggleQuest('${quest.id}')">
                    <label for="${quest.id}" class="quest-text">${quest.text}</label>
                    <span class="quest-reward">+10 XP</span>
                </li>
            `;
        });
        html += '</ul>';

        // زر إعادة تعيين المهام
        html += `
            <button onclick="resetDailyQuests()" class="btn btn-outline btn-sm mt-3">
                🔄 تصفير المهام (البداية من جديد)
            </button>
        `;
    } else {
        html += '<p><em>خلص البروتوكول أول عشان تشوف عاداتك اليومية.</em></p>';
    }

    html += '</div>';

    // 6. Constraints
    html += `
        <div class="game-section">
            <h3><span class="game-section-icon">📏</span> الممنوعات (حاجات ما بتعملها)</h3>
            <div id="constraints-list">
    `;

    if (components.constraints && components.constraints.length > 0) {
        html += '<ul>';
        components.constraints.forEach(constraint => {
            html += `<li>${constraint}</li>`;
        });
        html += '</ul>';
    } else {
        html += `
            <p><em>لسه ما عندك ممنوعات.</em></p>
            <button onclick="addConstraints()" class="btn btn-primary btn-sm">+ أكتب الممنوعات</button>
        `;
    }

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    let html = '';

    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const unlocked = gameSystem.achievements.includes(achievement.id);
        html += `
            <div class="achievement-badge ${unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function toggleQuest(questId) {
    const checkbox = document.getElementById(questId);

    if (checkbox.checked) {
        const result = gameSystem.completeQuest(questId);
        if (result.success) {
            showXPGain(result.xpGained);
            updateStats();
            renderGameComponents();
            renderAchievements();
        }
    } else {
        gameSystem.uncompleteQuest(questId);
        updateStats();
        renderGameComponents();
    }
}

function showXPGain(xp) {
    // إظهار إشعار بسيط
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); z-index: 9999; animation: fadeIn 0.3s ease-out;';
    notification.innerHTML = `<strong>🎉 +${xp} XP</strong>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function resetDailyQuests() {
    if (confirm('متأكد إنك عايز تصفّر المهام وتبدأ من جديد؟')) {
        gameSystem.resetDailyQuests();
        updateStats();
        renderGameComponents();
    }
}

function addConstraints() {
    const constraints = prompt('أكتب الممنوعات (إفصل بينها بفاصلة):');
    if (constraints) {
        const constraintsList = constraints.split(',').map(c => c.trim()).filter(c => c);
        gameSystem.setConstraints(constraintsList);
        renderGameComponents();
    }
}
