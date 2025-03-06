// Cart functionality
let cart = [];
const sizes = ['S', 'M', 'L', 'XL'];

// Initialize the store
document.addEventListener('DOMContentLoaded', () => {
    initializeSizeSelectors();
    initializeBuyButtons();
    setupCartToggle();
});

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
    `;

    dialog.innerHTML = `
        <h3 style="margin-bottom: 1rem;">Select Size</h3>
        <div class="size-buttons" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            ${sizes.map(size => `
                <button class="size-button" style="
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                ">${size}</button>
            `).join('')}
        </div>
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
            dialog.remove();
            backdrop.remove();
        });

        // Add hover effect
        button.addEventListener('mouseover', () => {
            button.style.background = '#f5f5f5';
        });
        button.addEventListener('mouseout', () => {
            button.style.background = 'white';
        });
    });

    backdrop.addEventListener('click', () => {
        dialog.remove();
        backdrop.remove();
    });
}

function addToCart(item) {
    cart.push(item);
    updateCartDisplay();
    showCartPopup();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #ddd;
        ">
            <div>
                <h4 style="margin: 0;">${item.name}</h4>
                ${item.size ? `<small>Size: ${item.size}</small>` : ''}
            </div>
            <div>$${item.price.toFixed(2)}</div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function showCartPopup() {
    const popup = document.getElementById('cartPopup');
    popup.classList.add('active');
}

function setupCartToggle() {
    // Add cart icon to header
    const headerRight = document.querySelector('.header-right');
    const cartButton = document.createElement('div');
    cartButton.className = 'cart-button';
    cartButton.innerHTML = `
        <i class="fas fa-shopping-cart" style="
            font-size: 1.5rem;
            color: white;
            cursor: pointer;
            margin-left: 2rem;
        "></i>
        <span class="cart-count" style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        ">0</span>
    `;
    cartButton.style.position = 'relative';
    headerRight.insertBefore(cartButton, headerRight.firstChild);

    // Toggle cart popup
    cartButton.addEventListener('click', () => {
        const popup = document.getElementById('cartPopup');
        popup.classList.toggle('active');
    });

    // Update cart count
    function updateCartCount() {
        const count = document.querySelector('.cart-count');
        count.textContent = cart.length;
    }

    // Add observer for cart changes
    setInterval(updateCartCount, 100);
}
