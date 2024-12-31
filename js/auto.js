class Carousel {
    constructor() {
        this.container = document.querySelector('.carousel-container');
        this.track = document.querySelector('.carousel-track');
        this.cards = Array.from(document.querySelectorAll('.carousel-card'));
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.observer = null;
        this.isVisible = false;
        
        this.init();
    }

    init() {
        if (!this.container || !this.track || !this.cards.length) return;
        
        // Setup intersection observer for performance
        this.setupIntersectionObserver();
        
        // Initial setup
        this.updateCardsPosition(true);
        this.addEventListeners();
        
        // Optimize images
        this.optimizeImages();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (!this.isVisible) {
                    // Pause all animations when not visible
                    gsap.killTweensOf(this.cards);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px'
        });
        
        this.observer.observe(this.container);
    }

    optimizeImages() {
        this.cards.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                img.loading = 'lazy';
                img.decoding = 'async';
            }
        });
    }

    updateCardsPosition(immediate = false) {
        if (!this.isVisible && !immediate) return;

        const duration = immediate ? 0 : 0.5;
        
        requestAnimationFrame(() => {
            this.cards.forEach((card, index) => {
                // Remove all classes first
                card.classList.remove('center', 'left', 'right', 'hidden-left', 'hidden-right');
                
                // Calculate relative position
                const position = (index - this.currentIndex + this.cards.length) % this.cards.length;
                
                // Add appropriate class based on position
                if (position === 0) {
                    card.classList.add('center');
                    gsap.to(card, {
                        scale: 1,
                        z: 0,
                        x: '-50%',
                        opacity: 1,
                        duration,
                        ease: "power2.out",
                        force3D: true,
                        willChange: "transform"
                    });
                } else if (position === 1 || position === this.cards.length - 1) {
                    card.classList.add(position === 1 ? 'right' : 'left');
                    gsap.to(card, {
                        scale: 0.8,
                        z: -200,
                        x: position === 1 ? '0%' : '-100%',
                        opacity: 1,
                        duration,
                        ease: "power2.out",
                        force3D: true,
                        willChange: "transform"
                    });
                } else {
                    card.classList.add(position < this.cards.length - 1 ? 'hidden-right' : 'hidden-left');
                    gsap.to(card, {
                        scale: 0.6,
                        z: -400,
                        x: position < this.cards.length - 1 ? '50%' : '-150%',
                        opacity: 0,
                        duration,
                        ease: "power2.out",
                        force3D: true,
                        willChange: "transform"
                    });
                }
            });
        });
    }

    moveNext() {
        if (this.isTransitioning || !this.isVisible) return;
        this.isTransitioning = true;
        
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.updateCardsPosition();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    movePrev() {
        if (this.isTransitioning || !this.isVisible) return;
        this.isTransitioning = true;
        
        this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.updateCardsPosition();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    addEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.movePrev());
        this.nextBtn?.addEventListener('click', () => this.moveNext());
        
        // Touch events for mobile with debouncing
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartTime = 0;
        
        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartTime = Date.now();
        };
        
        const handleTouchEnd = (e) => {
            if (!this.isVisible) return;
            
            touchEndX = e.changedTouches[0].screenX;
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // Only process quick swipes (less than 300ms)
            if (touchDuration < 300) {
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.moveNext();
                    } else {
                        this.movePrev();
                    }
                }
            }
        };
        
        this.container?.addEventListener('touchstart', handleTouchStart, { passive: true });
        this.container?.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        gsap.killTweensOf(this.cards);
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Carousel();
});