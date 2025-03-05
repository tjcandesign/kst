// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = '#ffffff';
        header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    } else {
        header.style.backgroundColor = 'transparent';
        header.style.boxShadow = 'none';
    }
});
