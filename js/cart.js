// Cart functionality
let cart = [];

function addToCart(name, price, quantity = 1) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateQuantity(name, newQuantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity = Math.max(0, newQuantity);
        if (item.quantity === 0) {
            removeFromCart(name);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-container');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const paymentForm = document.getElementById('payment-form');

    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        paymentForm.style.display = 'none';
        return;
    }

    cartContainer.style.display = 'block';
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee;">
            <div>
                <span>${item.name}</span>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.name}', ${item.quantity - 1})" style="margin-right: 5px;">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', ${item.quantity + 1})" style="margin-left: 5px;">+</button>
                </div>
            </div>
            <div>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button onclick="removeFromCart('${item.name}')" style="margin-left: 10px; color: red;">×</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee;">
            <strong>Total:</strong>
            <strong>$${total.toFixed(2)}</strong>
        </div>
        <button onclick="proceedToCheckout()" style="width: 100%; margin-top: 20px; padding: 10px; background: #e31837; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Proceed to Checkout
        </button>
    `;
}

function proceedToCheckout() {
    const paymentForm = document.getElementById('payment-form');
    paymentForm.style.display = 'block';
    paymentForm.scrollIntoView({ behavior: 'smooth' });
}

// Initialize cart from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // Add click handlers to menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        const name = item.querySelector('h3').textContent;
        const priceElement = item.querySelector('.price .amount');
        if (priceElement) {
            const price = parseFloat(priceElement.textContent);
            if (!isNaN(price)) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => addToCart(name, price));
            }
        }
    });
});
