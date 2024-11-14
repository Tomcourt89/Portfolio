document.addEventListener('DOMContentLoaded', () => {

    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle input');
    const contentWrapper = document.querySelector('.content-wrapper');
    const playToggle = document.querySelector('.just-play');
    const menuVideo = document.querySelector('video');
    const pauseToggle = document.querySelector('.pause input');
    const links = document.querySelector('.links');

    let gamePause = false;

    const initialPlayText = playToggle.textContent;

    // Game previously paused on menu open but will now toggle the pause button too
    menuToggle.addEventListener('change', () => {
        if (menuToggle.checked) {
            contentWrapper.classList.add('menu-open');
            menuVideo.play();
            gamePause = true;

            if (!pauseToggle.checked) {
                pauseToggle.checked = true;
            }

        } else {
            contentWrapper.classList.remove('menu-open');
            menuVideo.pause();
            gamePause = false;

            if (pauseToggle.checked) {
                pauseToggle.checked = false;
            }
        }
    });

    // Autocomplete in the html seems to achieve this, may not be necessary.
    window.addEventListener('pageshow', (ev) => {
        if (ev.persisted) {
            menuToggle.checked = false;
        }
    });

    playToggle.addEventListener('click', () => {
        if (playToggle.classList.contains('active')) {
            playToggle.classList.remove('active');
            playToggle.textContent = initialPlayText;

            if (window.innerHeight < 800 && links.style.display == "none") {
                links.style.display = "block";
            }
        } else {
            playToggle.classList.add('active');
            playToggle.textContent = 'Back to the content';

            if (window.innerHeight < 800) {
                links.style.display = "none"; 
            }
        }
    });

    // Pause button to stop the game if the user wants less motion
    // If the menu is open and the pause button is clicked will close the menu.
    pauseToggle.addEventListener('change', () => {
        if (pauseToggle.checked) {
            gamePause = true;
        } else {
            gamePause = false;
        }

        if (menuToggle.checked) {
            menuToggle.checked = false;
            contentWrapper.classList.remove('menu-open');
        }
    });

    window.gamePause = () => gamePause;
});
