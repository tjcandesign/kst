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
    preorderForm.addEventListener('submit', (e) => {
        console.log('Form submission started');
        e.preventDefault();
        const email = document.getElementById('preorderEmail').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Create a form that submits to Google
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = SCRIPT_URL;
        form.target = 'hidden_iframe';

        // Add email input
        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = 'email';
        emailInput.value = email;
        form.appendChild(emailInput);

        // Add timestamp
        const timestampInput = document.createElement('input');
        timestampInput.type = 'hidden';
        timestampInput.name = 'timestamp';
        timestampInput.value = new Date().toISOString();
        form.appendChild(timestampInput);

        // Create hidden iframe for response
        let iframe = document.getElementById('hidden_iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = 'hidden_iframe';
            iframe.id = 'hidden_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        // Handle response
        iframe.onload = () => {
            console.log('Submission completed');
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
        };

        // Submit the form
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    });
    });
});
