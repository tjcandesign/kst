document.addEventListener('DOMContentLoaded', () => {
    const preorderForm = document.querySelector('#preorderForm');
    const submitButton = document.querySelector('.submit-btn');

    if (!preorderForm || !submitButton) {
        console.error('Form elements not found');
        return;
    }

    // Handle form submission
    preorderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('preorderEmail').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const response = await fetch('https://formspree.io/f/mbjnqkjw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    subject: 'KST Merch Preorder Interest'
                })
            });

            if (response.ok) {
                const formContent = preorderForm.innerHTML;
                preorderForm.innerHTML = `
                    <h3>Thanks for signing up!</h3>
                    <p>We'll notify you when merch is available.</p>
                `;

                setTimeout(() => {
                    window.location.hash = '';
                    setTimeout(() => {
                        preorderForm.innerHTML = formContent;
                        document.getElementById('preorderEmail').value = '';
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit';
                    }, 300);
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
            alert('Something went wrong. Please try again.');
        }
    });
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreorder);
} else {
    initPreorder();
}
