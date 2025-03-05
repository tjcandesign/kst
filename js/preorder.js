document.addEventListener('DOMContentLoaded', () => {
    const merchLink = document.getElementById('merchPreorderLink');
    const preorderTray = document.getElementById('preorderTray');
    const preorderForm = document.getElementById('preorderForm');
    const submitButton = document.querySelector('.submit-btn');

    // Google Form URL
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfLXKK8YtgpBvRqjTiDDSIGYgLHVBIZxZWWEHHHNOGCpZTrVA/formResponse';

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
        e.preventDefault();
        const email = document.getElementById('preorderEmail').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Create a form that submits to Google Forms
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = FORM_URL;
        form.target = 'hidden_iframe';

        // Add email input - using the Google Forms entry ID
        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = 'entry.1234567890'; // Replace with your actual entry ID
        emailInput.value = email;
        form.appendChild(emailInput);

        // Create hidden iframe for response
        let iframe = document.getElementById('hidden_iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = 'hidden_iframe';
            iframe.id = 'hidden_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        // Show success message and reset form
        const showSuccess = () => {
            const formContent = preorderForm.innerHTML;
            preorderForm.innerHTML = `
                <h3>Thanks for signing up!</h3>
                <p>We'll notify you when merch is available.</p>
            `;

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

        // Handle response
        iframe.onload = showSuccess;

        // Submit the form
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Fallback in case iframe doesn't trigger
        setTimeout(showSuccess, 2000);
    });
    });
});
