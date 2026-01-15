/**
 * PWA Manager - Progressive Web App Management
 * التحكم بـ PWA، التثبيت، Push Notifications، Offline Mode
 */

class PWAManager {
    constructor() {
        this.swRegistration = null;
        this.deferredPrompt = null;
        this.isStandalone = false;
        this.init();
    }

    async init() {
        this.checkStandaloneMode();
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupPushNotifications();
        this.setupOfflineDetection();
        this.setupBeforeInstallPrompt();
    }

    // 1. Check if running as standalone PWA
    checkStandaloneMode() {
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');

        if (this.isStandalone) {
            console.log('[PWA] Running in standalone mode');
            document.body.classList.add('standalone');
            this.trackPWALaunch();
        }
    }

    // 2. Register Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('[PWA] Service Worker registered:', this.swRegistration);

                // Check for updates
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        }
    }

    // 3. Setup Install Prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.deferredPrompt = null;
            this.trackInstall();
            this.showInstallSuccessMessage();
        });
    }

    // Show Install Button
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'pwa-install-floating';
        installBtn.innerHTML = `
            <div class="install-icon">📱</div>
            <div class="install-text">
                <div class="install-title">ثبّت التطبيق</div>
                <div class="install-subtitle">للوصول السريع</div>
            </div>
        `;

        installBtn.addEventListener('click', () => this.promptInstall());

        document.body.appendChild(installBtn);

        // Animation
        setTimeout(() => {
            installBtn.classList.add('show');
        }, 1000);
    }

    // Prompt Install
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('[PWA] Install prompt not available');
            return;
        }

        this.deferredPrompt.prompt();
        const {
            outcome
        } = await this.deferredPrompt.userChoice;
        console.log(`[PWA] User response: ${outcome}`);

        if (outcome === 'accepted') {
            // Hide install button
            const btn = document.getElementById('pwa-install-btn');
            if (btn) btn.remove();
        }

        this.deferredPrompt = null;
    }

    showInstallSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'pwa-toast success';
        message.innerHTML = `
            <div class="toast-icon">✓</div>
            <div class="toast-content">
                <div class="toast-title">تم التثبيت بنجاح! 🎉</div>
                <div class="toast-message">يمكنك الآن الوصول للتطبيق من الشاشة الرئيسية</div>
            </div>
        `;

        document.body.appendChild(message);
        setTimeout(() => message.classList.add('show'), 100);
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }

    // 4. Push Notifications Setup
    async setupPushNotifications() {
        if (!('Notification' in window)) {
            console.log('[PWA] Notifications not supported');
            return;
        }

        if (Notification.permission === 'granted') {
            await this.subscribeToPushNotifications();
        } else if (Notification.permission !== 'denied') {
            // Show permission request after some engagement
            setTimeout(() => {
                this.showNotificationPermissionRequest();
            }, 60000); // After 1 minute
        }
    }

    showNotificationPermissionRequest() {
        const modal = document.createElement('div');
        modal.className = 'permission-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="permission-icon">🔔</div>
                <h2>إشعارات يومية</h2>
                <p>احصل على تذكير يومي لمواصلة رحلتك في التطوير الذاتي</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" id="allow-notifications">
                        نعم، فعّل الإشعارات
                    </button>
                    <button class="btn btn-outline" id="deny-notifications">
                        ليس الآن
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('allow-notifications').addEventListener('click', async () => {
            modal.remove();
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await this.subscribeToPushNotifications();
                this.showNotification('تم تفعيل الإشعارات! 🎉', 'سنرسل لك تذكيرات يومية مفيدة');
            }
        });

        document.getElementById('deny-notifications').addEventListener('click', () => {
            modal.remove();
        });
    }

    async subscribeToPushNotifications() {
        if (!this.swRegistration) return;

        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'YOUR_PUBLIC_VAPID_KEY_HERE' // Replace with your VAPID key
                )
            });

            console.log('[PWA] Push subscription:', subscription);

            // Send subscription to your server
            await this.sendSubscriptionToServer(subscription);

            // Schedule daily reminder
            await this.scheduleDailyReminder();
        } catch (error) {
            console.error('[PWA] Push subscription failed:', error);
        }
    }

    async sendSubscriptionToServer(subscription) {
        // Send to your backend
        try {
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });
        } catch (error) {
            console.error('[PWA] Failed to send subscription:', error);
        }
    }

    async scheduleDailyReminder() {
        if ('periodicSync' in this.swRegistration) {
            try {
                await this.swRegistration.periodicSync.register('daily-reminder', {
                    minInterval: 24 * 60 * 60 * 1000 // 24 hours
                });
                console.log('[PWA] Daily reminder scheduled');
            } catch (error) {
                console.error('[PWA] Periodic sync failed:', error);
            }
        }
    }

    showNotification(title, body, options = {}) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                vibrate: [200, 100, 200],
                ...options
            });

            notification.addEventListener('click', () => {
                window.focus();
                notification.close();
            });
        }
    }

    // 5. Offline Detection
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            console.log('[PWA] Back online');
            this.hideOfflineBanner();
            this.syncWhenOnline();
        });

        window.addEventListener('offline', () => {
            console.log('[PWA] Gone offline');
            this.showOfflineBanner();
        });

        // Check initial state
        if (!navigator.onLine) {
            this.showOfflineBanner();
        }
    }

    showOfflineBanner() {
        let banner = document.getElementById('offline-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'offline-banner';
            banner.className = 'offline-banner';
            banner.innerHTML = `
                <div class="offline-icon">📡</div>
                <div class="offline-text">
                    <strong>لا يوجد اتصال بالإنترنت</strong>
                    <span>يمكنك الاستمرار في التصفح، سنحفظ تقدمك</span>
                </div>
            `;
            document.body.appendChild(banner);
        }

        setTimeout(() => banner.classList.add('show'), 100);
    }

    hideOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }

        // Show "back online" message
        this.showToast('✓ عدت متصلاً بالإنترنت', 'success');
    }

    async syncWhenOnline() {
        if ('serviceWorker' in navigator && 'sync' in this.swRegistration) {
            try {
                await this.swRegistration.sync.register('sync-answers');
                console.log('[PWA] Background sync registered');
            } catch (error) {
                console.error('[PWA] Background sync failed:', error);
            }
        }
    }

    // 6. Update Notification
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🚀</div>
                <div class="update-text">
                    <strong>تحديث جديد متوفر!</strong>
                    <span>انقر لإعادة التحميل وتطبيق التحديث</span>
                </div>
                <button class="btn btn-primary btn-sm" id="update-btn">
                    تحديث الآن
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        document.getElementById('update-btn').addEventListener('click', () => {
            // Tell SW to skip waiting
            if (this.swRegistration && this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({
                    type: 'SKIP_WAITING'
                });
            }

            // Reload page
            window.location.reload();
        });
    }

    // 7. Utility Functions
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `pwa-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 8. Analytics
    trackPWALaunch() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_launch', {
                'event_category': 'PWA',
                'event_label': 'Standalone Launch'
            });
        }
    }

    trackInstall() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                'event_category': 'PWA',
                'event_label': 'App Installed'
            });
        }
    }

    // 9. Setup Before Install Prompt (iOS)
    setupBeforeInstallPrompt() {
        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

        if (isIOS && !isInStandaloneMode) {
            // Show iOS install instructions
            setTimeout(() => {
                this.showIOSInstallInstructions();
            }, 5000);
        }
    }

    showIOSInstallInstructions() {
        const modal = document.createElement('div');
        modal.className = 'ios-install-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" id="close-ios-modal">×</button>
                <h2>ثبّت التطبيق على iOS</h2>
                <div class="ios-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <div class="step-icon">⬆️</div>
                            <p>اضغط على زر المشاركة في Safari</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <div class="step-icon">➕</div>
                            <p>اختر "إضافة إلى الشاشة الرئيسية"</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <div class="step-icon">✓</div>
                            <p>اضغط "إضافة" للتأكيد</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('close-ios-modal').addEventListener('click', () => {
            modal.remove();
            localStorage.setItem('ios-install-shown', 'true');
        });

        // Don't show again if already seen
        if (localStorage.getItem('ios-install-shown')) {
            return;
        }
    }
}

// CSS للـ PWA UI Elements
const pwaStyles = document.createElement('style');
pwaStyles.textContent = `
    /* Install Button */
    .pwa-install-floating {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: white;
        border: none;
        border-radius: 15px;
        padding: 1rem 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        z-index: 999;
        transform: translateX(150%);
        transition: transform 0.3s ease;
    }

    .pwa-install-floating.show {
        transform: translateX(0);
    }

    .install-icon {
        font-size: 2rem;
    }

    .install-title {
        font-weight: 600;
        color: #1A1A2E;
    }

    .install-subtitle {
        font-size: 0.85rem;
        color: #666;
    }

    /* Offline Banner */
    .offline-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #FF6B35;
        color: white;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }

    .offline-banner.show {
        transform: translateY(0);
    }

    .offline-icon {
        font-size: 1.5rem;
    }

    .offline-text strong {
        display: block;
        margin-bottom: 0.25rem;
    }

    .offline-text span {
        font-size: 0.85rem;
        opacity: 0.9;
    }

    /* Update Notification */
    .update-notification {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        transform: translateY(150%);
        transition: transform 0.3s ease;
    }

    .update-notification.show {
        transform: translateY(0);
    }

    .update-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
    }

    .update-icon {
        font-size: 2rem;
    }

    .update-text {
        flex: 1;
    }

    .update-text strong {
        display: block;
        color: #1A1A2E;
        margin-bottom: 0.25rem;
    }

    .update-text span {
        font-size: 0.85rem;
        color: #666;
    }

    /* Toast Notifications */
    .pwa-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        color: #1A1A2E;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
    }

    .pwa-toast.show {
        transform: translateX(0);
    }

    .pwa-toast.success {
        border-left: 4px solid #4CAF50;
    }

    /* Permission Modal */
    .permission-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(5px);
    }

    .modal-content {
        position: relative;
        background: white;
        padding: 2rem;
        border-radius: 20px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        animation: modalPop 0.3s ease-out;
    }

    @keyframes modalPop {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    .permission-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    .modal-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    /* iOS Install Modal */
    .ios-install-modal .modal-content {
        max-width: 500px;
    }

    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #999;
    }

    .ios-steps {
        margin-top: 2rem;
    }

    .step {
        display: flex;
        gap: 1rem;
        align-items: start;
        text-align: right;
        margin-bottom: 1.5rem;
    }

    .step-number {
        width: 30px;
        height: 30px;
        background: #FF6B35;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
    }

    .step-content {
        flex: 1;
    }

    .step-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    @media (min-width: 768px) {
        .pwa-install-floating {
            bottom: 20px;
        }
    }
`;
document.head.appendChild(pwaStyles);

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Export for use in other scripts
window.pwaManager = pwaManager;
