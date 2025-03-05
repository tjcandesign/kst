document.addEventListener('DOMContentLoaded', () => {
    // Close tray when clicking outside
    document.addEventListener('click', (e) => {
        const tray = document.getElementById('preorderTray');
        const link = document.getElementById('merchPreorderLink');
        
        // If tray is open (has :target) and click is outside tray and not on the link
        if (window.location.hash === '#preorderTray' && 
            !tray.contains(e.target) && 
            !link.contains(e.target)) {
            window.location.hash = '';
        }
    });
    const preorderForm = document.querySelector('#preorderForm');
    const submitButton = document.querySelector('.submit-btn');

    if (!preorderForm || !submitButton) {
        console.error('Form elements not found');
        return;
    }

    // Handle form submission
    preorderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('preorderEmail').value;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Create a form that submits to Google Forms
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfjwsE_NHa-7aRN5sx01r2vjL_weNv009I85yIOcLxD4uq1Lw/formResponse';
        form.target = 'hidden_iframe';

        // Add email input - using the Google Forms entry ID
        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = 'entry.1045781291'; // Email field entry ID
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
                window.location.hash = '';
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreorder);
} else {
    initPreorder();
}
