document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Load product data
    loadProductData(productId);

    // Initialize add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn && productId) {
        // Get product data
        const product = products[productId];
        if (product) {
            // Set initial button data
            addToCartBtn.dataset.id = productId;
            addToCartBtn.dataset.name = product.name;
            addToCartBtn.dataset.price = product.price;
            addToCartBtn.dataset.image = product.images[0];
            addToCartBtn.dataset.cover = 'standard';

            // Handle cover selection
            const coverBtns = document.querySelectorAll('.cover-btn');
            coverBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    coverBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    addToCartBtn.dataset.cover = btn.dataset.cover;
                });
            });

            // Add click handler
            addToCartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                const quantity = parseInt(document.querySelector('.qty-input').value) || 1;
                
                const productData = {
                    id: this.dataset.id,
                    name: this.dataset.name,
                    price: parseFloat(this.dataset.price),
                    image: this.dataset.image,
                    quantity: quantity,
                    cover: this.dataset.cover
                };

                if (window.cart) {
                    window.cart.addToCart(productData);
                    gsap.to(this, {
                        scale: 0.95,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            window.cart.showNotification('Produsul a fost adăugat în coș');
                        }
                    });
                }
            });
        }
    }

    // Quantity Selector
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const qtyInput = document.querySelector('.qty-input');

    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        if (currentValue > 1) {
            qtyInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        qtyInput.value = currentValue + 1;
    });

    // Color Options
    setupColorOptions();

    // Package Options
    setupPackageOptions();

    // Wishlist Toggle
    const wishlistBtn = document.querySelector('.wishlist-btn');
    
    wishlistBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.style.color = 'var(--color-primary)';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.style.color = 'var(--color-text)';
        }
    });
});

function loadProductData(productId) {
    if (!productId) {
        console.error('No product ID provided');
        return;
    }

    const product = products[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    // Update page title
    document.title = `Bloomery - ${product.name}`;

    // Update breadcrumb
    const breadcrumbSpan = document.querySelector('.product-breadcrumb span');
    if (breadcrumbSpan) {
        breadcrumbSpan.textContent = product.name;
    }

    // Update product title and rating
    const titleElement = document.querySelector('.product-title');
    if (titleElement) {
        titleElement.textContent = product.name;
    }

    const ratingElement = document.querySelector('.product-rating span');
    if (ratingElement) {
        ratingElement.textContent = `(${product.rating}/5 din ${product.reviews} review-uri)`;
    }

    // Update prices
    const originalPriceElement = document.querySelector('.original-price');
    const currentPriceElement = document.querySelector('.current-price');
    const saveAmountElement = document.querySelector('.save-amount');

    if (originalPriceElement) {
        originalPriceElement.textContent = `${product.originalPrice.toFixed(2)} Lei`;
    }
    if (currentPriceElement) {
        currentPriceElement.textContent = `${product.price.toFixed(2)} Lei`;
    }
    if (saveAmountElement) {
        const savings = product.originalPrice - product.price;
        saveAmountElement.textContent = `Economisești: ${savings.toFixed(2)} Lei`;
    }

    // Update images
    const mainImage = document.getElementById('mainImage');
    if (mainImage && product.images.length > 0) {
        mainImage.src = product.images[0];
        mainImage.alt = product.name;
    }

    // Update thumbnails
    const thumbnailGrid = document.querySelector('.thumbnail-grid');
    if (thumbnailGrid && product.images.length > 0) {
        thumbnailGrid.innerHTML = product.images.map((image, index) => `
            <div class="thumbnail-card ${index === 0 ? 'active' : ''}">
                <div class="image-wrapper">
                    <img src="${image}" alt="${product.name} ${index + 1}">
                    <div class="hover-overlay">
                        <i class="fas fa-expand"></i>
                    </div>
                </div>
            </div>
        `).join('');

        // Setup thumbnail click handlers
        setupThumbnailHandlers();
    }

    // Update add to cart button data attributes
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.dataset.name = product.name;
        addToCartBtn.dataset.price = product.price;
        addToCartBtn.dataset.image = product.images[0];
    }
}

function setupThumbnailHandlers() {
    const thumbnails = document.querySelectorAll('.thumbnail-card');
    const mainImage = document.getElementById('mainImage');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');
            // Update main image
            const newImageSrc = thumbnail.querySelector('img').src;
            mainImage.src = newImageSrc;
        });
    });
}

function setupColorOptions() {
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setupPackageOptions() {
    const coverBtns = document.querySelectorAll('.cover-btn');
    coverBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            coverBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}
