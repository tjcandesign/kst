// Initialize Square
const appId = 'YOUR_SQUARE_APP_ID'; // Replace with your Square application ID
let card;
let payments;

// Cart functionality
let cart = [];
const sizes = ['S', 'M', 'L', 'XL'];

// Initialize the store
document.addEventListener('DOMContentLoaded', () => {
    initializeSizeSelectors();
    initializeBuyButtons();
    setupCartIcon();
    setupHeaderScroll();
});

function setupHeaderScroll() {
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.merch-hero');
    const flag = document.querySelector('.flag img');
    
    // Initial state - red on yellow background
    flag.style.filter = 'brightness(0) saturate(100%) invert(27%) sepia(91%) saturate(2352%) hue-rotate(355deg) brightness(97%) contrast(124%)';
    
    const observer = new IntersectionObserver(
        ([entry]) => {
            header.classList.toggle('scrolled', !entry.isIntersecting);
            
            // When scrolled past hero (yellow background), flag should be yellow
            if (!entry.isIntersecting) {
                flag.style.filter = 'brightness(0) saturate(100%) invert(89%) sepia(27%) saturate(1066%) hue-rotate(359deg) brightness(101%) contrast(94%)';
            } else {
                // When on hero (yellow background), flag should be red
                flag.style.filter = 'brightness(0) saturate(100%) invert(27%) sepia(91%) saturate(2352%) hue-rotate(355deg) brightness(97%) contrast(124%)';
            }
        },
        {
            rootMargin: '-100px 0px 0px 0px'
        }
    );
    
    if (heroSection) {
        observer.observe(heroSection);
    }
}

function initializeSizeSelectors() {
    document.querySelectorAll('.size-selector').forEach(button => {
        button.addEventListener('click', (e) => {
            const item = e.target.closest('.merch-item');
            const name = item.querySelector('h3').textContent;
            const price = parseFloat(item.querySelector('.price').textContent.replace('$', ''));
            
            showSizeDialog(name, price);
        });
    });
}

function initializeBuyButtons() {
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', (e) => {
            const item = e.target.closest('.merch-item');
            const name = item.querySelector('h3').textContent;
            const price = parseFloat(item.querySelector('.price').textContent.replace('$', ''));
            
            addToCart({ name, price });
        });
    });
}

function showSizeDialog(name, price) {
    // Remove any existing size dialog
    const existingDialog = document.querySelector('.size-dialog');
    if (existingDialog) existingDialog.remove();

    // Create new dialog
    const dialog = document.createElement('div');
    dialog.className = 'size-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1001;
        max-width: 400px;
        width: 90%;
    `;

    dialog.innerHTML = `
        <button class="close-dialog" style="
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--primary-color);
            cursor: pointer;
            padding: 0.5rem;
            transition: transform 0.2s;
        ">&times;</button>
        <h3 style="
            font-family: var(--font-heading);
            font-size: 1.8rem;
            color: var(--primary-color);
            margin-bottom: 2rem;
        ">Select Size</h3>
        <div class="size-buttons" style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        ">
            ${sizes.map(size => `
                <button class="size-button" style="
                    padding: 1rem;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: var(--font-heading);
                    font-size: 1.2rem;
                ">${size}</button>
            `).join('')}
        </div>
        <div style="
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            margin-top: 1rem;
        ">Click outside to cancel</div>
    `;

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
    `;

    document.body.style.overflow = 'hidden';
    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);

    // Add event listeners
    dialog.querySelectorAll('.size-button').forEach(button => {
        button.addEventListener('click', () => {
            addToCart({
                name,
                price,
                size: button.textContent
            });
            closeDialog();
        });

        // Add hover effect
        button.addEventListener('mouseover', () => {
            button.style.borderColor = 'var(--primary-color)';
            button.style.color = 'var(--primary-color)';
        });
        button.addEventListener('mouseout', () => {
            button.style.borderColor = '#ddd';
            button.style.color = 'inherit';
        });
    });

    dialog.querySelector('.close-dialog').addEventListener('click', closeDialog);
    backdrop.addEventListener('click', closeDialog);

    // Handle escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
        }
    };
    document.addEventListener('keydown', escHandler);

    function closeDialog() {
        dialog.remove();
        backdrop.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', escHandler);
    }
}

function addToCart(item) {
    cart.push(item);
    updateCartDisplay();
    showCartPopup();
    // Show confirmation message
    showMessage(`Added ${item.name} to cart`);
}

function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    updateCartDisplay();
    // Show confirmation message
    showMessage(`Removed ${item.name} from cart`);
    // Close cart if empty
    if (cart.length === 0) {
        closeCart();
    }
}

function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'toast-message';
    message.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        font-family: var(--font-body);
        font-size: 0.9rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 1002;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Fade in
    requestAnimationFrame(() => {
        message.style.opacity = '1';
    });
    
    // Remove after delay
    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 300);
    }, 2000);
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                ${item.size ? `<small>Size: ${item.size}</small>` : ''}
                <div class="item-price">$${item.price.toFixed(2)}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function showCartPopup() {
    const popup = document.getElementById('cartPopup');
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    const popup = document.getElementById('cartPopup');
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

function setupCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    
    // Toggle cart popup
    cartIcon.addEventListener('click', () => {
        const popup = document.getElementById('cartPopup');
        if (popup.classList.contains('active')) {
            closeCart();
        } else {
            showCartPopup();
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });

    // Update cart count
    function updateCartCount() {
        cartCount.textContent = cart.length || '0';
    }

    // Add observer for cart changes
    setInterval(updateCartCount, 100);
}

async function showCheckoutForm() {
    const cartItems = document.getElementById('cartItems');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutButton = document.querySelector('.checkout-button');
    
    cartItems.style.display = 'none';
    checkoutForm.style.display = 'block';
    checkoutButton.style.display = 'none';

    try {
        // Initialize Square payments if not already initialized
        if (!payments) {
            payments = window.Square.payments(appId, 'YOUR_LOCATION_ID');
            card = await payments.card();
            await card.attach('#card-container');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to initialize payment form. Please try again.');
    }
}

function hideCheckoutForm() {
    const cartItems = document.getElementById('cartItems');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutButton = document.querySelector('.checkout-button');
    
    cartItems.style.display = 'block';
    checkoutForm.style.display = 'none';
    checkoutButton.style.display = 'block';
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    input.value = value;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

function formatCVV(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    input.value = value;
}

async function submitOrder(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('.submit-order');
    const messageElement = document.getElementById('payment-status-container');
    
    // Disable the submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    messageElement.textContent = '';
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const shippingData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: {
                addressLine1: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                postalCode: formData.get('zip'),
                country: 'US'
            }
        };

        // Calculate total amount
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        // Get a payment token from the card
        const result = await card.tokenize();
        if (result.status === 'OK') {
            // Send payment token to your server
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sourceId: result.token,
                    amount: total,
                    items: cart,
                    shipping: shippingData
                })
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            const paymentResult = await response.json();
            
            // Generate order number and show confirmation
            const orderNumber = 'KST-' + Date.now().toString().slice(-6);
            const cartContent = document.querySelector('.cart-content');
            cartContent.innerHTML = `
                <div class="order-confirmation">
                    <h4>Thank You!</h4>
                    <p>Your order has been placed successfully.</p>
                    <div class="order-number">Order #${orderNumber}</div>
                    <p>We'll send a confirmation email to ${shippingData.email} with your order details.</p>
                    <button class="continue-shopping" onclick="finishOrder()">Continue Shopping</button>
                </div>
            `;
        } else {
            throw new Error(result.errors[0].message);
        }
    } catch (error) {
        console.error('Error:', error);
        messageElement.textContent = error.message || 'An unexpected error occurred. Please try again.';
        submitButton.disabled = false;
        submitButton.textContent = 'Place Order';
    }
}
}

function finishOrder() {
    // Clear cart
    cart = [];
    
    // Update cart count
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = '0';
    
    // Close cart popup
    closeCart();
    
    // Show confirmation message
    showMessage('Thank you for your order!');
    
    // Reset cart content after animation
    setTimeout(() => {
        const cartContent = document.querySelector('.cart-content');
        cartContent.innerHTML = `
            <button class="close-cart" onclick="closeCart()">&times;</button>
            <h3>Shopping Cart</h3>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-total">
                <span>Total:</span>
                <span id="cartTotal">$0.00</span>
            </div>
            <button class="checkout-button" onclick="showCheckoutForm()">Proceed to Checkout</button>
            <div class="checkout-form" id="checkoutForm" style="display: none;">
                <h4>Shipping Information</h4>
                <form id="shippingForm" onsubmit="submitOrder(event)">
                    <div class="form-group">
                        <input type="text" id="name" name="name" placeholder="Full Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="email" name="email" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" id="phone" name="phone" placeholder="Phone Number" required>
                    </div>
                    <div class="form-group">
                        <input type="text" id="address" name="address" placeholder="Street Address" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <input type="text" id="city" name="city" placeholder="City" required>
                        </div>
                        <div class="form-group half">
                            <input type="text" id="state" name="state" placeholder="State" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="text" id="zip" name="zip" placeholder="ZIP Code" required>
                    </div>
                    <div class="form-divider"></div>
                    <h4>Payment Information</h4>
                    <div class="form-group">
                        <input type="text" id="cardName" name="cardName" placeholder="Name on Card" required>
                    </div>
                    <div class="form-group">
                        <input type="text" id="cardNumber" name="cardNumber" placeholder="Card Number" required
                            pattern="[0-9]{16}" title="Please enter a valid 16-digit card number"
                            oninput="formatCardNumber(this)">
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <input type="text" id="expiry" name="expiry" placeholder="MM/YY" required
                                pattern="(0[1-9]|1[0-2])/[0-9]{2}" title="Please enter a valid expiry date (MM/YY)"
                                oninput="formatExpiry(this)">
                        </div>
                        <div class="form-group half">
                            <input type="text" id="cvv" name="cvv" placeholder="CVV" required
                                pattern="[0-9]{3,4}" title="Please enter a valid CVV"
                                oninput="formatCVV(this)">
                        </div>
                    </div>
                    <button type="submit" class="submit-order">Place Order</button>
                    <button type="button" class="back-to-cart" onclick="hideCheckoutForm()">Back to Cart</button>
                </form>
            </div>
        `;
    }, 300);
}
