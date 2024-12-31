// Load components
document.addEventListener('DOMContentLoaded', function() {
    // Load social media bar
    const socialMediaBar = document.createElement('div');
    socialMediaBar.innerHTML = `
        <div class="social-media-bar">
            <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-pinterest"></i></a>
        </div>
    `;
    document.body.appendChild(socialMediaBar.firstElementChild);
});
