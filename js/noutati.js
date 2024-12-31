// Initialize smooth scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Animate section header
gsap.from('.section-header', {
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power3.out'
});

// Animate product cards
const productCards = gsap.utils.toArray('.product-card');
productCards.forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
    });
});

// Hover effect for product cards
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.product-image img'), {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.product-image img'), {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
        });
    });
});

// Gallery Interactions
document.querySelectorAll('.gallery-item').forEach(item => {
    const overlay = item.querySelector('.item-overlay');
    const button = item.querySelector('.btn-view');
    
    // Prevent overlay animation when clicking button
    button.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Show overlay on hover for desktop
    if (window.innerWidth > 768) {
        item.addEventListener('mouseenter', () => {
            overlay.style.transform = 'translateY(0)';
        });
        
        item.addEventListener('mouseleave', () => {
            overlay.style.transform = 'translateY(100%)';
        });
    }
});

// Smooth reveal on scroll
const revealItems = () => {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        
        if (isVisible) {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, i * 100);
        }
    });
};

// Initialize items
document.querySelectorAll('.gallery-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
});

// Listen for scroll
window.addEventListener('scroll', revealItems);
revealItems(); // Initial check
