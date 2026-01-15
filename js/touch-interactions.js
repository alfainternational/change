/**
 * Touch Interactions Manager
 * إدارة جميع التفاعلات باللمس على الموبايل
 */

class TouchInteractions {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.init();
    }

    init() {
        this.setupSwipeGestures();
        this.setupPullToRefresh();
        this.setupLongPress();
        this.setupDoubleTap();
        this.setupPinchZoom();
        this.setupHapticFeedback();
    }

    // 1. Swipe Gestures (Left, Right, Up, Down)
    setupSwipeGestures() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.touchStartY = e.changedTouches[0].screenY;
        }, {
            passive: true
        });

        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(e);
        }, {
            passive: true
        });
    }

    handleSwipe(e) {
        const element = e.target.closest('.swipeable');
        if (!element) return;

        const diffX = this.touchStartX - this.touchEndX;
        const diffY = this.touchStartY - this.touchEndY;

        // Horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.minSwipeDistance) {
            if (diffX > 0) {
                this.onSwipeLeft(element);
            } else {
                this.onSwipeRight(element);
            }
        }

        // Vertical swipe
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > this.minSwipeDistance) {
            if (diffY > 0) {
                this.onSwipeUp(element);
            } else {
                this.onSwipeDown(element);
            }
        }
    }

    onSwipeLeft(element) {
        console.log('[Touch] Swipe Left');
        element.dispatchEvent(new CustomEvent('swipeleft'));

        // Example: Navigate to next item
        const next = element.nextElementSibling;
        if (next) {
            element.style.transform = 'translateX(-100%)';
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.display = 'none';
                next.style.display = 'block';
                next.style.transform = 'translateX(0)';
                next.style.opacity = '1';
            }, 300);
        }

        this.hapticFeedback('light');
    }

    onSwipeRight(element) {
        console.log('[Touch] Swipe Right');
        element.dispatchEvent(new CustomEvent('swiperight'));

        // Example: Navigate to previous item
        const prev = element.previousElementSibling;
        if (prev) {
            element.style.transform = 'translateX(100%)';
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.display = 'none';
                prev.style.display = 'block';
                prev.style.transform = 'translateX(0)';
                prev.style.opacity = '1';
            }, 300);
        }

        this.hapticFeedback('light');
    }

    onSwipeUp(element) {
        console.log('[Touch] Swipe Up');
        element.dispatchEvent(new CustomEvent('swipeup'));
        this.hapticFeedback('light');
    }

    onSwipeDown(element) {
        console.log('[Touch] Swipe Down');
        element.dispatchEvent(new CustomEvent('swipedown'));
        this.hapticFeedback('light');
    }

    // 2. Pull to Refresh
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pulling = false;

        const refreshContainer = document.createElement('div');
        refreshContainer.className = 'pull-to-refresh-container';
        refreshContainer.innerHTML = `
            <div class="pull-to-refresh-spinner">
                <div class="spinner"></div>
            </div>
        `;
        document.body.insertBefore(refreshContainer, document.body.firstChild);

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                pulling = true;
            }
        }, {
            passive: true
        });

        document.addEventListener('touchmove', (e) => {
            if (!pulling) return;

            currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 0 && diff < 150) {
                refreshContainer.style.transform = `translateY(${diff}px)`;
                refreshContainer.style.opacity = diff / 100;
            }

            if (diff > 80) {
                refreshContainer.classList.add('active');
            } else {
                refreshContainer.classList.remove('active');
            }
        }, {
            passive: true
        });

        document.addEventListener('touchend', async (e) => {
            if (!pulling) return;

            const diff = currentY - startY;

            if (diff > 80) {
                refreshContainer.style.transform = 'translateY(60px)';
                refreshContainer.classList.add('loading');

                // Trigger refresh
                await this.onRefresh();

                setTimeout(() => {
                    refreshContainer.style.transform = 'translateY(0)';
                    refreshContainer.style.opacity = '0';
                    refreshContainer.classList.remove('loading', 'active');
                }, 500);

                this.hapticFeedback('medium');
            } else {
                refreshContainer.style.transform = 'translateY(0)';
                refreshContainer.style.opacity = '0';
                refreshContainer.classList.remove('active');
            }

            pulling = false;
            startY = 0;
            currentY = 0;
        }, {
            passive: true
        });
    }

    async onRefresh() {
        console.log('[Touch] Refreshing...');
        // Implement your refresh logic
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('[Touch] Refresh complete');
                resolve();
            }, 1000);
        });
    }

    // 3. Long Press
    setupLongPress() {
        let pressTimer;

        document.addEventListener('touchstart', (e) => {
            const element = e.target.closest('.long-pressable');
            if (!element) return;

            pressTimer = setTimeout(() => {
                this.onLongPress(element, e);
            }, 500);
        });

        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    }

    onLongPress(element, e) {
        console.log('[Touch] Long Press');
        element.dispatchEvent(new CustomEvent('longpress', {
            detail: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            }
        }));

        // Visual feedback
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);

        this.hapticFeedback('heavy');

        // Example: Show context menu
        this.showContextMenu(element, e.touches[0].clientX, e.touches[0].clientY);
    }

    showContextMenu(element, x, y) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.innerHTML = `
            <div class="context-menu-item">
                <span class="icon">📋</span>
                <span>نسخ</span>
            </div>
            <div class="context-menu-item">
                <span class="icon">🔗</span>
                <span>مشاركة</span>
            </div>
            <div class="context-menu-item delete">
                <span class="icon">🗑️</span>
                <span>حذف</span>
            </div>
        `;

        document.body.appendChild(menu);

        // Animate in
        setTimeout(() => menu.classList.add('show'), 10);

        // Close on outside click
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.classList.remove('show');
                setTimeout(() => menu.remove(), 300);
                document.removeEventListener('click', closeMenu);
                document.removeEventListener('touchstart', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
            document.addEventListener('touchstart', closeMenu);
        }, 100);
    }

    // 4. Double Tap
    setupDoubleTap() {
        let lastTap = 0;

        document.addEventListener('touchend', (e) => {
            const element = e.target.closest('.double-tappable');
            if (!element) return;

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 300 && tapLength > 0) {
                this.onDoubleTap(element, e);
                lastTap = 0;
            } else {
                lastTap = currentTime;
            }
        });
    }

    onDoubleTap(element, e) {
        console.log('[Touch] Double Tap');
        element.dispatchEvent(new CustomEvent('doubletap'));

        // Visual feedback - heart animation
        const heart = document.createElement('div');
        heart.className = 'double-tap-heart';
        heart.textContent = '❤️';
        heart.style.left = e.changedTouches[0].clientX + 'px';
        heart.style.top = e.changedTouches[0].clientY + 'px';

        document.body.appendChild(heart);

        setTimeout(() => heart.classList.add('animate'), 10);
        setTimeout(() => heart.remove(), 1000);

        this.hapticFeedback('medium');
    }

    // 5. Pinch Zoom
    setupPinchZoom() {
        let initialDistance = 0;
        let currentScale = 1;

        document.addEventListener('touchstart', (e) => {
            const element = e.target.closest('.zoomable');
            if (!element || e.touches.length !== 2) return;

            initialDistance = this.getDistance(e.touches[0], e.touches[1]);
        }, {
            passive: true
        });

        document.addEventListener('touchmove', (e) => {
            const element = e.target.closest('.zoomable');
            if (!element || e.touches.length !== 2) return;

            e.preventDefault();

            const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;

            currentScale = Math.min(Math.max(0.5, scale), 3);
            element.style.transform = `scale(${currentScale})`;
        });

        document.addEventListener('touchend', (e) => {
            const element = e.target.closest('.zoomable');
            if (!element) return;

            // Reset if zoom is too small or too large
            if (currentScale < 0.8 || currentScale > 2.5) {
                element.style.transform = 'scale(1)';
                currentScale = 1;
            }
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 6. Haptic Feedback
    setupHapticFeedback() {
        // Check if device supports haptic feedback
        this.supportsHaptic = 'vibrate' in navigator;
    }

    hapticFeedback(type = 'light') {
        if (!this.supportsHaptic) return;

        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            success: [10, 50, 10],
            error: [20, 100, 20],
            selection: [5]
        };

        navigator.vibrate(patterns[type] || patterns.light);
    }

    // 7. Swipeable Carousel
    initCarousel(container) {
        const items = container.querySelectorAll('.carousel-item');
        let currentIndex = 0;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            container.style.transition = 'none';
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const offset = -(currentIndex * container.offsetWidth) + diff;

            container.style.transform = `translateX(${offset}px)`;
        });

        container.addEventListener('touchend', (e) => {
            if (!isDragging) return;

            const diff = currentX - startX;
            const threshold = container.offsetWidth * 0.3;

            container.style.transition = 'transform 0.3s ease';

            if (diff > threshold && currentIndex > 0) {
                currentIndex--;
                this.hapticFeedback('light');
            } else if (diff < -threshold && currentIndex < items.length - 1) {
                currentIndex++;
                this.hapticFeedback('light');
            }

            const offset = -(currentIndex * container.offsetWidth);
            container.style.transform = `translateX(${offset}px)`;

            isDragging = false;
        });
    }

    // 8. Smooth Scroll
    smoothScrollTo(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const targetPosition = element.offsetTop - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        this.hapticFeedback('light');
    }
}

// CSS للـ Touch Interactions
const touchStyles = document.createElement('style');
touchStyles.textContent = `
    /* Pull to Refresh */
    .pull-to-refresh-container {
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%) translateY(0);
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .pull-to-refresh-container.active .spinner {
        animation: spin 1s linear infinite;
    }

    .pull-to-refresh-spinner .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #FF6B35;
        border-radius: 50%;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Context Menu */
    .context-menu {
        position: fixed;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 0.5rem;
        z-index: 10000;
        transform: scale(0);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .context-menu.show {
        transform: scale(1);
        opacity: 1;
    }

    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
        white-space: nowrap;
    }

    .context-menu-item:hover,
    .context-menu-item:active {
        background: #f5f5f5;
    }

    .context-menu-item.delete {
        color: #FF6B35;
    }

    .context-menu-item .icon {
        font-size: 1.25rem;
    }

    /* Double Tap Heart */
    .double-tap-heart {
        position: fixed;
        font-size: 3rem;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }

    .double-tap-heart.animate {
        animation: heartPop 1s ease-out forwards;
    }

    @keyframes heartPop {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -80%) scale(0.8);
            opacity: 0;
        }
    }

    /* Smooth transitions */
    .swipeable,
    .long-pressable,
    .double-tappable,
    .zoomable {
        transition: all 0.3s ease;
    }

    /* Prevent text selection during touch */
    .swipeable,
    .long-pressable,
    .double-tappable {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    /* Touch feedback */
    .swipeable:active,
    .long-pressable:active,
    .double-tappable:active {
        opacity: 0.8;
    }

    /* Carousel */
    .carousel-container {
        display: flex;
        overflow: hidden;
        touch-action: pan-y;
    }

    .carousel-item {
        flex-shrink: 0;
        width: 100%;
    }
`;
document.head.appendChild(touchStyles);

// Initialize Touch Interactions
const touchInteractions = new TouchInteractions();

// Export for use in other scripts
window.touchInteractions = touchInteractions;

// Usage Examples:
/*
// 1. Swipe
document.querySelector('.swipeable').addEventListener('swipeleft', () => {
    console.log('Swiped left!');
});

// 2. Long Press
document.querySelector('.long-pressable').addEventListener('longpress', (e) => {
    console.log('Long pressed at:', e.detail.x, e.detail.y);
});

// 3. Double Tap
document.querySelector('.double-tappable').addEventListener('doubletap', () => {
    console.log('Double tapped!');
});

// 4. Carousel
const carousel = document.querySelector('.carousel-container');
touchInteractions.initCarousel(carousel);

// 5. Smooth Scroll
touchInteractions.smoothScrollTo('section-id', 60);

// 6. Manual Haptic
touchInteractions.hapticFeedback('success');
*/
