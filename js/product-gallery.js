class ProductGallery {
    constructor() {
        this.mainImage = document.getElementById('mainImage');
        this.thumbnails = document.querySelectorAll('.thumbnail-card');
        this.currentIndex = 0;
        this.images = [
            'product-image/ddd.jpg',
            'product-image/d2.jpg',
            'product-image/d3.jpeg',
            'product-image/d4.jpg',
        ];
        this.isAnimating = false;

        this.init();
    }

    init() {
        // Initialize GSAP timeline
        this.timeline = gsap.timeline({
            defaults: {
                duration: 0.6,
                ease: 'power3.inOut'
            }
        });

        // Add click events to thumbnails
        this.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                if (!this.isAnimating && this.currentIndex !== index) {
                    this.switchImage(index);
                }
            });
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;

            if (e.key === 'ArrowLeft') {
                this.prevImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });

        // Add touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.mainImage.parentElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.mainImage.parentElement.addEventListener('touchend', (e) => {
            if (this.isAnimating) return;

            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextImage();
                } else {
                    this.prevImage();
                }
            }
        });

        // Initialize zoom functionality
        this.initZoom();
    }

    switchImage(newIndex) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Update active thumbnail
        this.thumbnails[this.currentIndex].classList.remove('active');
        this.thumbnails[newIndex].classList.add('active');

        // Create a temporary image for crossfade
        const tempImage = document.createElement('img');
        tempImage.src = this.images[newIndex];
        tempImage.style.position = 'absolute';
        tempImage.style.top = '0';
        tempImage.style.left = '0';
        tempImage.style.width = '100%';
        tempImage.style.height = '100%';
        tempImage.style.objectFit = 'cover';
        tempImage.style.opacity = '0';
        this.mainImage.parentElement.appendChild(tempImage);

        // Animate the transition
        this.timeline.clear();
        this.timeline
            .to(this.mainImage, {
                opacity: 0,
                scale: 0.95,
                duration: 0.4
            })
            .to(tempImage, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                onComplete: () => {
                    this.mainImage.src = this.images[newIndex];
                    this.mainImage.style.opacity = '1';
                    this.mainImage.style.transform = 'scale(1)';
                    tempImage.remove();
                    this.currentIndex = newIndex;
                    this.isAnimating = false;
                }
            }, '-=0.2');
    }

    nextImage() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.switchImage(nextIndex);
    }

    prevImage() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.switchImage(prevIndex);
    }

    initZoom() {
        const zoomBtn = document.querySelector('.zoom-btn');
        const mainImageCard = document.querySelector('.main-image-card');
        let isZoomed = false;

        zoomBtn.addEventListener('click', () => {
            if (this.isAnimating) return;

            isZoomed = !isZoomed;
            if (isZoomed) {
                this.zoomIn(mainImageCard);
            } else {
                this.zoomOut(mainImageCard);
            }
        });

        // Add mouse move zoom effect when zoomed
        mainImageCard.addEventListener('mousemove', (e) => {
            if (!isZoomed) return;

            const bounds = mainImageCard.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            
            const xPercent = mouseX / bounds.width;
            const yPercent = mouseY / bounds.height;

            gsap.to(this.mainImage, {
                duration: 0.5,
                x: (0.5 - xPercent) * 100,
                y: (0.5 - yPercent) * 100,
                ease: 'power2.out'
            });
        });

        mainImageCard.addEventListener('mouseleave', () => {
            if (isZoomed) {
                this.zoomOut(mainImageCard);
                isZoomed = false;
            }
        });
    }

    zoomIn(element) {
        gsap.to(element, {
            scale: 1.5,
            duration: 0.5,
            ease: 'power2.out'
        });
        element.style.zIndex = '1000';
    }

    zoomOut(element) {
        gsap.to(element, {
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                element.style.zIndex = '';
                gsap.to(this.mainImage, {
                    x: 0,
                    y: 0,
                    duration: 0.3
                });
            }
        });
    }
}

// Initialize the gallery when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductGallery();
});
