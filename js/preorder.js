document.addEventListener('DOMContentLoaded', () => {
    const merchLink = document.getElementById('merchPreorderLink');
    const preorderTray = document.getElementById('preorderTray');
    const preorderForm = document.getElementById('preorderForm');

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
        
        // For now, just store in localStorage
        let emails = JSON.parse(localStorage.getItem('preorderEmails') || '[]');
        if (!emails.includes(email)) {
            emails.push(email);
            localStorage.setItem('preorderEmails', JSON.stringify(emails));
            alert('Thanks! We\'ll notify you when merch drops!');
            preorderForm.reset();
            preorderTray.classList.remove('active');
        } else {
            alert('This email is already registered!');
        }
    });
});
