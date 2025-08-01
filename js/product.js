// Product data structure
const products = {
    'classic-tee': {
        name: 'Classic KST Logo Tee',
        price: 25,
        description: 'Our signature logo tee in vintage red. Made from 100% organic cotton for maximum comfort and durability.',
        images: [
            'images/merch/classic-tee.jpg',
            'images/merch/classic-tee-back.jpg',
            'images/merch/classic-tee-detail.jpg'
        ],
        details: `
            • 100% organic cotton
            • Pre-shrunk
            • Vintage red color
            • Screen printed logo
            • Unisex fit
            • Machine washable
            • Made in USA
        `
    },
    'street-tee': {
        name: "District's Friendliest Shirt",
        price: 28,
        description: 'Urban design featuring DC street map. A stylish way to show your love for the district.',
        images: [
            'images/merch/street-tee.jpg',
            'images/merch/street-tee-back.jpg',
            'images/merch/street-tee-detail.jpg'
        ],
        details: `
            • 100% organic cotton
            • Pre-shrunk
            • Black color with white print
            • Screen printed design
            • Unisex fit
            • Machine washable
            • Made in USA
        `
    }
};

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
let selectedSize = null;

// Initialize page
function initializeProduct() {
    const product = products[productId];
    if (!product) {
        window.location.href = '/merch.html';
        return;
    }

    // Set page title
    document.title = `${product.name} - Kennedy Street Tacos`;

    // Update product information
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price}`;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productDetails').innerHTML = product.details;

    // Set main image
    const mainImage = document.getElementById('mainImage');
    mainImage.src = product.images[0];
    mainImage.alt = product.name;

    // Create thumbnails
    const thumbnailsContainer = document.getElementById('thumbnails');
    product.images.forEach((image, index) => {
        const thumb = document.createElement('img');
        thumb.src = image;
        thumb.alt = `${product.name} view ${index + 1}`;
        thumb.className = 'product-thumbnail' + (index === 0 ? ' active' : '');
        thumb.onclick = () => {
            mainImage.src = image;
            document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };
        thumbnailsContainer.appendChild(thumb);
    });

    // Initialize size selector
    initializeSizeSelector();
}

function initializeSizeSelector() {
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedSize = option.dataset.size;
        });
    });
}

function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    const newValue = Math.max(1, parseInt(quantityInput.value) + change);
    quantityInput.value = newValue;
}

function addToCart() {
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }

    const product = products[productId];
    const quantity = parseInt(document.getElementById('quantity').value);
    
    const cartItem = {
        name: `${product.name} (${selectedSize})`,
        price: product.price,
        quantity: quantity,
        size: selectedSize,
        image: product.images[0]
    };

    // Add to cart (using the cart.js addToCart function)
    window.addToCart(cartItem.name, cartItem.price, cartItem.quantity);

    // Show success message
    const btn = document.querySelector('.add-to-cart-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Added to Cart!';
    btn.style.backgroundColor = '#28a745';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
    }, 2000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeProduct);
