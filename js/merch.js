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
