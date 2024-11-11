document.addEventListener('DOMContentLoaded', () => {

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle input');
    const contentWrapper = document.querySelector('.content-wrapper');
    const playToggle = document.querySelector('.just-play');

    let gamePause = false;

    const initialPlayText = playToggle.textContent;

    menuToggle.addEventListener('change', () => {
        if (menuToggle.checked) {
            contentWrapper.classList.add('menu-open');
            gamePause = true;
        } else {
            contentWrapper.classList.remove('menu-open');
            gamePause = false;
        }
    });

    playToggle.addEventListener('click', () => {
        if (playToggle.classList.contains('active')) {
            playToggle.classList.remove('active');
            playToggle.textContent = initialPlayText;
        } else {
            playToggle.classList.add('active');
            playToggle.textContent = 'Back to the content';
        }
    });

    window.gamePause = () => gamePause;
    window.contentWrapper = () => contentWrapper;
});
