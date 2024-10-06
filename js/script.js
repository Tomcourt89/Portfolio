document.addEventListener('DOMContentLoaded', () => {

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle input');
    const contentWrapper = document.querySelector('.content-wrapper');

    menuToggle.addEventListener('change', () => {
        if (menuToggle.checked) {
            contentWrapper.classList.add('menu-open');
        } else {
            contentWrapper.classList.remove('menu-open');
        }
    });


});
