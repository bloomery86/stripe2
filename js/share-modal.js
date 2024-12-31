document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if share buttons exist
    const shareButtons = document.querySelectorAll('.share-button');
    if (shareButtons.length > 0) {
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('data-url') || window.location.href;
                const title = this.getAttribute('data-title') || document.title;
                
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        url: url
                    })
                    .catch(console.error);
                } else {
                    // Fallback: Copy to clipboard
                    navigator.clipboard.writeText(url)
                        .then(() => alert('Link copiat!'))
                        .catch(() => alert('Nu s-a putut copia link-ul.'));
                }
            });
        });
    }
});
