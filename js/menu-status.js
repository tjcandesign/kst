async function updateMenuStatus() {
    try {
        const response = await fetch('/api/menu-status.json');
        const data = await response.json();

        // Update weekly special
        const weeklySpecialInfo = document.querySelector('.special-item .menu-item-info');
        if (weeklySpecialInfo) {
            const title = weeklySpecialInfo.querySelector('h3');
            const description = weeklySpecialInfo.querySelector('p');
            const priceElement = document.querySelector('.special-item .price');

            title.textContent = data.weeklySpecial.name;
            description.textContent = data.weeklySpecial.description;
            
            if (data.weeklySpecial.price) {
                if (!priceElement) {
                    const priceDiv = document.createElement('div');
                    priceDiv.className = 'price';
                    priceDiv.innerHTML = `<span class="currency">$</span><span class="amount">${data.weeklySpecial.price}</span>`;
                    weeklySpecialInfo.parentElement.appendChild(priceDiv);
                } else {
                    priceElement.querySelector('.amount').textContent = data.weeklySpecial.price;
                }
            } else if (priceElement) {
                priceElement.remove();
            }
        }

        // Update sold out items
        document.querySelectorAll('.menu-item').forEach(item => {
            const title = item.querySelector('h3').textContent;
            if (data.soldOutItems.includes(title)) {
                item.classList.add('sold-out');
            } else {
                item.classList.remove('sold-out');
            }
        });

    } catch (error) {
        console.error('Error updating menu status:', error);
    }
}

// Check for updates every minute
setInterval(updateMenuStatus, 60000);
// Initial check
updateMenuStatus();
