class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartCountElements = document.querySelectorAll('.cart-count');
        this.modal = document.getElementById('cartModal');
        this.cartItemsContainer = document.querySelector('.cart-items-container');
        this.cartTotal = document.querySelector('.total-amount');
        // Use the full products list from products.js
        this.products = window.products || {};
        this.setupEventListeners();
        this.updateCartDisplay();
        this.setupGlobalCartControls();
    }

    setupEventListeners() {
        // Add to cart buttons from index page
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAddToCart(e));
        });

        // Cart icon click
        document.querySelectorAll('.cart-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        });

        // Close cart
        const closeCart = document.querySelector('.close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }

        // Close cart when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeCart();
            }
        });

        // Empty cart button
        const emptyCartBtn = document.querySelector('.empty-cart-btn');
        if (emptyCartBtn) {
            emptyCartBtn.addEventListener('click', () => this.emptyCart());
        }

        // Handle checkout button click
        const checkoutButton = document.querySelector('.checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                // Check if cart is empty
                if (!this.items || this.items.length === 0) {
                    alert('Coșul tău este gol. Adaugă produse pentru a continua.');
                    return;
                }
                
                // Create default delivery data if not set
                if (!localStorage.getItem('deliveryData')) {
                    const defaultDeliveryData = {
                        deliveryMethod: 'courier'
                    };
                    localStorage.setItem('deliveryData', JSON.stringify(defaultDeliveryData));
                }
                window.location.href = './checkout.html';
            });
        }
    }

    setupGlobalCartControls() {
        // Handle quantity controls in cart modal
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if clicked element is a quantity button in cart
            if (target.closest('.quantity-controls')) {
                const qtyBtn = target.closest('.qty-btn');
                if (qtyBtn) {
                    e.preventDefault();
                    const productId = qtyBtn.getAttribute('data-product-id');
                    const currentQty = parseInt(qtyBtn.parentElement.querySelector('.quantity').textContent);
                    const newQty = qtyBtn.classList.contains('minus') ? currentQty - 1 : currentQty + 1;
                    
                    if (productId) {
                        this.updateItemQuantity(productId, newQty);
                    }
                }
            }

            // Check if clicked element is remove button in cart
            if (target.closest('.remove-item')) {
                e.preventDefault();
                const removeBtn = target.closest('.remove-item');
                const productId = removeBtn.getAttribute('data-product-id');
                if (productId) {
                    this.removeFromCart(productId);
                }
            }
        });
    }

    handleAddToCart(e) {
        e.preventDefault();
        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        // Get the price text and clean it up
        const priceText = productCard.querySelector('.product-price, .price').textContent;
        // Remove RON, replace dots with empty string (for thousands), and convert commas to dots
        const cleanPrice = priceText
            .replace('RON', '')
            .trim()
            .replace('.', '')
            .replace(',', '.');

        const product = {
            id: productCard.dataset.productId,
            name: productCard.querySelector('.product-title, .product-description').textContent,
            price: parseFloat(cleanPrice),
            image: productCard.querySelector('img').src
        };

        if (product.id && !isNaN(product.price)) {
            this.addToCart(product);
            this.showNotification('Produsul a fost adăugat în coș');
            this.updateCartDisplay();
        }
    }

    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        if (this.cartItemsContainer) {
            this.cartItemsContainer.innerHTML = '';
            let total = 0;

            this.items.forEach(item => {
                total += item.price * item.quantity;
                const itemElement = this.createCartItemElement(item);
                this.cartItemsContainer.appendChild(itemElement);
            });

            // Update cart count
            this.cartCountElements.forEach(element => {
                element.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
            });

            // Update total with proper formatting
            if (this.cartTotal) {
                // Format with thousands separator
                const formattedTotal = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                this.cartTotal.textContent = `${formattedTotal} RON`;
            }
        }
    }

    createCartItemElement(item) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        const totalPrice = item.price * item.quantity;

        // Format prices with thousands separator
        const formattedPrice = item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        const formattedTotal = totalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        div.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${formattedPrice} RON</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total">Total: ${formattedTotal} RON</div>
            </div>
            <button class="remove-item" data-id="${item.id}">&times;</button>
        `;

        // Add event listeners for quantity buttons
        const minusBtn = div.querySelector('.minus');
        const plusBtn = div.querySelector('.plus');
        const removeBtn = div.querySelector('.remove-item');

        minusBtn.addEventListener('click', () => this.updateItemQuantity(item.id, item.quantity - 1));
        plusBtn.addEventListener('click', () => this.updateItemQuantity(item.id, item.quantity + 1));
        removeBtn.addEventListener('click', () => this.removeFromCart(item.id));

        return div;
    }

    updateItemQuantity(id, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(id);
            return;
        }

        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartDisplay();
            
            // Show feedback
            this.showNotification('Cantitate actualizată');
        }
    }

    removeFromCart(id) {
        this.items = this.items.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
        
        // Show feedback
        this.showNotification('Produs eliminat din coș');
    }

    emptyCart() {
        this.items = [];
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartDisplay();
    }

    openCart() {
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when cart is open
            this.updateCartDisplay();
        } else {
            console.error('Cart modal element not found');
        }
    }

    closeCart() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    handleCheckout() {
        // Implement checkout logic here
        console.log('Proceeding to checkout with items:', this.items);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        gsap.to(notification, {
            opacity: 1,
            y: 20,
            duration: 0.3
        });

        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                y: 0,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 2000);
    }
}

// Initialize cart when DOM is loaded (if not already initialized)
if (typeof window.cart === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cart = new Cart();
    });
}
