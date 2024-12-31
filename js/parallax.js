document.addEventListener('DOMContentLoaded', function() {
    const parallaxBg = document.querySelector('.parallax-bg');
    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxSection = document.querySelector('.parallax-section');
        const sectionTop = parallaxSection.offsetTop;
        const sectionHeight = parallaxSection.offsetHeight;
        
        if (scrolled + window.innerHeight > sectionTop && 
            scrolled < sectionTop + sectionHeight) {
            const speed = 0.5;
            const yPos = (scrolled - sectionTop) * speed;
            parallaxBg.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateParallax();
            });
            ticking = true;
        }
    });

    // Initial update
    updateParallax();
});
