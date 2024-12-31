document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.header');
    const body = document.body;

    function toggleMenu() {
        burgerMenu.classList.toggle('active');
        mainNav.classList.toggle('active');
        header.classList.toggle('nav-open');
        body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
    }

    burgerMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = mainNav.contains(event.target) || burgerMenu.contains(event.target);
        if (!isClickInside && mainNav.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu();
        });
    });

    // Prevent body scrolling when menu is open
    mainNav.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
});
