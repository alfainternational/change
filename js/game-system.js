// ========================================
// نظام اللعبة - تحويل الحياة إلى لعبة فيديو
// ========================================

class LifeGameSystem {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 100;
        this.components = {
            antiVision: '',
            vision: '',
            yearGoal: '',
            monthProject: '',
            dailyLevers: [],
            constraints: []
        };
        this.achievements = [];
        this.dailyProgress = [];

        // تحميل البيانات المحفوظة
        this.loadGameData();
    }

    // تحميل بيانات اللعبة
    loadGameData() {
        const savedData = storage.load();
        if (savedData) {
            if (savedData.gameData) {
                this.level = savedData.gameData.level || 1;
                this.xp = savedData.gameData.xp || 0;
                this.xpToNextLevel = savedData.gameData.xpToNextLevel || 100;
                this.achievements = savedData.gameData.achievements || [];
                this.dailyProgress = savedData.gameData.dailyProgress || [];
            }

            // استخراج المكونات من إجابات البروتوكول
            if (savedData.answers) {
                this.extractComponentsFromProtocol(savedData.answers);
            }
        }
    }

    // استخراج المكونات الستة من إجابات البروتوكول
    extractComponentsFromProtocol(answers) {
        // Anti-Vision من السؤال 26
        if (answers.q26) {
            this.components.antiVision = answers.q26.value;
        }

        // Vision من السؤال 27
        if (answers.q27) {
            this.components.vision = answers.q27.value;
        }

        // Year Goal من عدسة السنة
        if (answers.lens_year) {
            this.components.yearGoal = answers.lens_year.value;
        }

        // Month Project من عدسة الشهر
        if (answers.lens_month) {
            this.components.monthProject = answers.lens_month.value;
        }

        // Daily Levers من عدسة اليوم
        if (answers.lens_daily) {
            const dailyText = answers.lens_daily.value;
            // تقسيم النص إلى مhام منفصلة
            this.components.dailyLevers = dailyText.split('\n')
                .filter(line => line.trim().length > 0)
                .map((lever, index) => ({
                    id: `lever_${index}`,
                    text: lever.trim(),
                    completed: false
                }));
        }
    }

    // تحديد القيود
    setConstraints(constraints) {
        this.components.constraints = constraints;
        this.save();
    }

    // إكمال مهمة يومية
    completeQuest(questId) {
        const quest = this.components.dailyLevers.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.completed = true;
            this.addXP(10);
            this.checkAchievements();
            this.save();
            return { success: true, xpGained: 10 };
        }
        return { success: false };
    }

    // إلغاء إكمال مهمة
    uncompleteQuest(questId) {
        const quest = this.components.dailyLevers.find(q => q.id === questId);
        if (quest && quest.completed) {
            quest.completed = false;
            this.save();
            return { success: true };
        }
        return { success: false };
    }

    // إضافة XP
    addXP(amount) {
        this.xp += amount;

        // التحقق من الترقية
        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }

        this.save();
    }

    // الترقية للمستوى التالي
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);

        // فتح إنجاز
        this.unlockAchievement(`level_${this.level}`);

        // إشعار
        this.showLevelUpNotification();
    }

    // إظهار إشعار الترقية
    showLevelUpNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🎉 مبروك يا بطل! وصلت للمستوى ${this.level}!`, {
                body: 'واصل المشوار، إنت كدا ماشي صح في طريق التغيير.',
                icon: '/assets/images/achievement.png'
            });
        }
    }

    // فتح إنجاز
    unlockAchievement(achievementId) {
        if (!this.achievements.includes(achievementId)) {
            this.achievements.push(achievementId);
            this.save();
        }
    }

    // التحقق من الإنجازات
    checkAchievements() {
        const completedQuests = this.components.dailyLevers.filter(q => q.completed).length;

        // إنجازات بناءً على المهام المكتملة
        if (completedQuests === 1) this.unlockAchievement('first_quest');
        if (completedQuests === this.components.dailyLevers.length) this.unlockAchievement('all_daily_quests');

        // إنجاز إكمال البروتوكول
        const protocolSummary = protocol.getSummary();
        if (protocolSummary.answeredQuestions === 27) {
            this.unlockAchievement('completed_protocol');
        }
        if (protocolSummary.answeredQuestions >= 14) {
            this.unlockAchievement('half_protocol');
        }
    }

    // الحصول على نسبة التقدم اليومي
    getDailyProgress() {
        if (this.components.dailyLevers.length === 0) return 0;
        const completed = this.components.dailyLevers.filter(q => q.completed).length;
        return Math.round((completed / this.components.dailyLevers.length) * 100);
    }

    // الحصول على نسبة XP للمستوى التالي
    getXPPercentage() {
        return Math.round((this.xp / this.xpToNextLevel) * 100);
    }

    // إعادة تعيين المهام اليومية
    resetDailyQuests() {
        // حفظ التقدم اليوم
        const today = new Date().toISOString().split('T')[0];
        this.dailyProgress.push({
            date: today,
            completed: this.components.dailyLevers.filter(q => q.completed).length,
            total: this.components.dailyLevers.length
        });

        // إعادة تعيين المهام
        this.components.dailyLevers.forEach(quest => {
            quest.completed = false;
        });

        this.save();
    }

    // الحصول على إحصائيات
    getStats() {
        return {
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            xpPercentage: this.getXPPercentage(),
            dailyProgress: this.getDailyProgress(),
            totalAchievements: this.achievements.length,
            streakDays: this.calculateStreak()
        };
    }

    // حساب عدد الأيام المتتالية
    calculateStreak() {
        if (this.dailyProgress.length === 0) return 0;

        let streak = 0;
        let today = new Date();

        for (let i = this.dailyProgress.length - 1; i >= 0; i--) {
            const progressDate = new Date(this.dailyProgress[i].date);
            const daysDiff = Math.floor((today - progressDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                if (this.dailyProgress[i].completed > 0) {
                    streak++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return streak;
    }

    // حفظ بيانات اللعبة
    save() {
        const currentData = storage.load() || {};
        const gameData = {
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            achievements: this.achievements,
            dailyProgress: this.dailyProgress,
            components: this.components
        };

        storage.save({
            ...currentData,
            gameData: gameData
        });
    }
}

// قائمة الإنجازات المتاحة
const ACHIEVEMENTS = {
    first_quest: {
        id: 'first_quest',
        name: 'أول الغيث',
        description: 'أكملت أول مهمة يومية ليك.. بداية قوية!',
        icon: '🎯'
    },
    all_daily_quests: {
        id: 'all_daily_quests',
        name: 'زول صبّار',
        description: 'أكملت كل مهام اليوم.. عافي منك.',
        icon: '🏆'
    },
    half_protocol: {
        id: 'half_protocol',
        name: 'نص المشوار',
        description: 'وصلت لنص البروتوكول.. قربت تخلص.',
        icon: '📝'
    },
    completed_protocol: {
        id: 'completed_protocol',
        name: 'الفاهِم نفسو',
        description: 'أكملت البروتوكول بالكامل وفهمت الحاصل شنو.',
        icon: '💎'
    },
    level_5: {
        id: 'level_5',
        name: 'المقاتل',
        description: 'وصلت للمستوى 5.. إنت زول جاد فعلاً.',
        icon: '⚔️'
    },
    level_10: {
        id: 'level_10',
        name: 'الأسطورة',
        description: 'وصلت للمستوى 10.. كدا إنت سيد اللعبة خلاص.',
        icon: '👑'
    },
    streak_7: {
        id: 'streak_7',
        name: 'أسبوع نجاح',
        description: '7 أيام متتالية من الإنجاز.. واصل!',
        icon: '🔥'
    },
    streak_30: {
        id: 'streak_30',
        name: 'شهر التغيير',
        description: '30 يوم متتالي.. حياتك فعلاً اتغيرت.',
        icon: '🌟'
    }
};

// تصدير instance واحد
const gameSystem = new LifeGameSystem();
