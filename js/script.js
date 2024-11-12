document.addEventListener('DOMContentLoaded', () => {

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle input');
    const contentWrapper = document.querySelector('.content-wrapper');
    const playToggle = document.querySelector('.just-play');
    const menuVideo = document.querySelector('video');

    let gamePause = false;

    const initialPlayText = playToggle.textContent;

    menuToggle.addEventListener('change', () => {
        if (menuToggle.checked) {
            contentWrapper.classList.add('menu-open');
            menuVideo.play();
            gamePause = true;
        } else {
            contentWrapper.classList.remove('menu-open');
            menuVideo.pause();
            gamePause = false;
        }
    });

    window.addEventListener('pageshow', (ev) => {
        if (ev.persisted) {
            menuToggle.checked = false;
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
});
