document.addEventListener('DOMContentLoaded', () => {
    const merchLink = document.getElementById('merchPreorderLink');
    const preorderTray = document.getElementById('preorderTray');
    const preorderForm = document.getElementById('preorderForm');
    const submitButton = document.querySelector('.submit-btn');

    // Google Apps Script URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYT8bAEw1FcBblx7Xz6aQEy6hlxBxODkDP3SmkcoSSmzKdIUMidA5wQeQDPxtAiZN5/exec';

    // Toggle tray
    merchLink.addEventListener('click', (e) => {
        e.preventDefault();
        preorderTray.classList.toggle('active');
    });

    // Close tray when clicking outside
    document.addEventListener('click', (e) => {
        if (!preorderTray.contains(e.target) && 
            !merchLink.contains(e.target) && 
            preorderTray.classList.contains('active')) {
            preorderTray.classList.remove('active');
        }
    });

    // Handle form submission
    preorderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('preorderEmail').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            // Check if submission was successful
            if (response.ok || response.status === 0) { // status 0 for no-cors
                const formContent = preorderForm.innerHTML;
                preorderForm.innerHTML = `
                    <h3>Thanks for signing up!</h3>
                    <p>We'll notify you when merch is available.</p>
                `;

                // Close the tray and reset form after 3 seconds
                setTimeout(() => {
                    preorderTray.classList.remove('active');
                    setTimeout(() => {
                        preorderForm.innerHTML = formContent;
                        document.getElementById('preorderEmail').value = '';
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit';
                    }, 300);
                }, 3000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
            alert('Something went wrong. Please try again.');
        }
    });
});
