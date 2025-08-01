// Initialize Square payment form
let payments;
let card;

async function initializeSquare() {
    try {
        // Initialize payments client
        payments = window.Square.payments(window.env.SQUARE_APP_ID, window.env.SQUARE_LOCATION_ID);
        
        // Initialize card element
        card = await payments.card();
        await card.attach('#card-container');

        const form = document.getElementById('payment-form');
        form.addEventListener('submit', handlePaymentFormSubmit);
    } catch (e) {
        console.error("Initializing Square failed", e);
        const errorDiv = document.getElementById('payment-status');
        errorDiv.textContent = "Failed to load payment system. Please try again later.";
        errorDiv.style.display = 'block';
    }
}

async function handlePaymentFormSubmit(event) {
    event.preventDefault();

    const submitButton = document.getElementById('submit-payment');
    const statusDiv = document.getElementById('payment-status');

    try {
        submitButton.disabled = true;
        statusDiv.textContent = "Processing payment...";
        statusDiv.style.display = 'block';

        // Get payment token
        const result = await card.tokenize();
        if (result.status === 'OK') {
            // Get cart total from localStorage
            const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
            const total = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Send payment to server
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceId: result.token,
                    amount: total,
                    items: cartData
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear cart and redirect to confirmation page
                localStorage.removeItem('cart');
                window.location.href = '/order-confirmation.html';
            } else {
                throw new Error(data.error?.message || 'Payment failed');
            }
        } else {
            throw new Error(result.errors[0].message);
        }
    } catch (e) {
        console.error("Payment failed", e);
        statusDiv.textContent = e.message || "Payment failed. Please try again.";
        submitButton.disabled = false;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeSquare);
