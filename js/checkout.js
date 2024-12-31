document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checkoutForm');
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.querySelector('.subtotal');
    const shippingElement = document.querySelector('.shipping');
    const totalElement = document.querySelector('.total-amount');

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Always clear delivery data when loading checkout page
    localStorage.removeItem('deliveryData');

    // Initialize form with empty values
    if (form) {
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const county = document.getElementById('county');
        const address = document.getElementById('address');

        // Clear all form fields
        if (firstName) firstName.value = '';
        if (lastName) lastName.value = '';
        if (email) email.value = '';
        if (phone) phone.value = '';
        if (county) county.value = '';
        if (address) address.value = '';
        
        // Set default delivery method to courier
        const courierRadio = document.querySelector('input[name="deliveryMethod"][value="courier"]');
        if (courierRadio) {
            courierRadio.checked = true;
        }
    }

    // Render cart items
    function renderCartItems() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">${item.price} lei × ${item.quantity}</p>
                </div>
                <div class="item-total">${item.price * item.quantity} lei</div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Update summary
        updateOrderSummary(subtotal);
    }

    // Update order summary
    function updateOrderSummary(subtotal) {
        const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value;
        const shipping = deliveryMethod === 'pickup' ? 0 : 15;
        const total = subtotal + shipping;

        if (subtotalElement) subtotalElement.textContent = `${subtotal} lei`;
        if (shippingElement) shippingElement.textContent = shipping === 0 ? 'Gratuit' : `${shipping} lei`;
        if (totalElement) totalElement.textContent = `${total} lei`;
    }

    // Handle delivery method change
    const deliveryOptions = document.querySelectorAll('input[name="deliveryMethod"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', () => {
            const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
            updateOrderSummary(subtotal);
        });
    });

    // Save delivery data only on form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            // Save delivery data
            const deliveryData = {
                firstName: document.getElementById('firstName')?.value || '',
                lastName: document.getElementById('lastName')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                county: document.getElementById('county')?.value || '',
                address: document.getElementById('address')?.value || '',
                deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'courier'
            };

            // Save to localStorage only when submitting
            localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
        });
    }

    // Initialize page
    renderCartItems();
});
