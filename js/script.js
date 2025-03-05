// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]:not(#merchPreorderLink)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        // Only scroll if href is not just '#'
        if (href && href !== '#') {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});


