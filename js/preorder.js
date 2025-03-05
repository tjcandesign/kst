document.addEventListener('DOMContentLoaded', () => {
    const merchLink = document.getElementById('merchPreorderLink');
    const preorderTray = document.getElementById('preorderTray');
    const preorderForm = document.getElementById('preorderForm');
    const submitButton = document.querySelector('.submit-btn');

    // Google Apps Script URL - Updated with new deployment
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRYZO_2FLxsHzRhDoQJ9H9fHNGz4h_-4_qOpPMoVtqz2SxDRmQGJZhxVRQy6Hy7Ck/exec';

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
        console.log('Form submission started');
        e.preventDefault();
        const email = document.getElementById('preorderEmail').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            console.log('Submitting email:', email);
            
            const formData = new FormData();
            formData.append('email', email);
            formData.append('timestamp', new Date().toISOString());

            console.log('Sending request to:', SCRIPT_URL);
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);
            // Check if submission was successful
            if (response.ok || response.status === 0) { // status 0 for no-cors
                console.log('Submission successful');
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
            console.error('Detailed error:', error);
            console.error('Error stack:', error.stack);
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
            alert('Something went wrong. Please try again.');
        }
    });
});
