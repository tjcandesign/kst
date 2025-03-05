// Add smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Get all anchor links that have an href starting with # and lead to a section
    const menuLinks = document.querySelectorAll('a[href^="#menu"], a[href^="#gallery"]');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});


