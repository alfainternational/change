// ========================================
// نظام إدارة التخزين المحلي
// ========================================

class StorageManager {
    constructor() {
        this.storageKey = 'lifeTransformationData';
        this.backupKey = 'lifeTransformationBackup';
    }

    // حفظ البيانات
    save(data) {
        try {
            const timestamp = new Date().toISOString();
            const dataWithTimestamp = {
                ...data,
                lastSaved: timestamp
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataWithTimestamp));
            
            // إنشاء نسخة احتياطية
            this.createBackup(dataWithTimestamp);
            
            return { success: true, timestamp };
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return { success: false, error: error.message };
        }
    }

    // تحميل البيانات
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            return null;
        }
    }

    // إنشاء نسخة احتياطية
    createBackup(data) {
        try {
            const backups = this.getBackups();
            backups.push({
                timestamp: new Date().toISOString(),
                data: data
            });
            
            // الاحتفاظ بآخر 5 نسخ احتياطية فقط
            if (backups.length > 5) {
                backups.shift();
            }
            
            localStorage.setItem(this.backupKey, JSON.stringify(backups));
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
        }
    }

    // الحصول على النسخ الاحتياطية
    getBackups() {
        try {
            const backups = localStorage.getItem(this.backupKey);
            return backups ? JSON.parse(backups) : [];
        } catch (error) {
            console.error('خطأ في تحميل النسخ الاحتياطية:', error);
            return [];
        }
    }

    // استعادة من نسخة احتياطية
    restoreBackup(index) {
        try {
            const backups = this.getBackups();
            if (backups[index]) {
                localStorage.setItem(this.storageKey, JSON.stringify(backups[index].data));
                return { success: true, data: backups[index].data };
            }
            return { success: false, error: 'النسخة الاحتياطية غير موجودة' };
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return { success: false, error: error.message };
        }
    }

    // تصدير البيانات كـ JSON
    exportJSON() {
        const data = this.load();
        if (data) {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(dataBlob);
            downloadLink.download = `life-transformation-${new Date().toISOString().split('T')[0]}.json`;
            downloadLink.click();
            
            return { success: true };
        }
        return { success: false, error: 'لا توجد بيانات للتصدير' };
    }

    // استيراد البيانات من JSON
    importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.save(data);
                    resolve({ success: true, data });
                } catch (error) {
                    reject({ success: false, error: 'ملف JSON غير صالح' });
                }
            };
            
            reader.onerror = () => {
                reject({ success: false, error: 'خطأ في قراءة الملف' });
            };
            
            reader.readAsText(file);
        });
    }

    // مسح كل البيانات
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            return { success: true };
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return { success: false, error: error.message };
        }
    }

    // الحفظ التلقائي
    enableAutoSave(callback, interval = 30000) {
        return setInterval(() => {
            const data = callback();
            if (data) {
                this.save(data);
                console.log('تم الحفظ التلقائي');
            }
        }, interval);
    }

    // إيقاف الحفظ التلقائي
    disableAutoSave(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
        }
    }
}

// تصدير instance واحد
const storage = new StorageManager();
