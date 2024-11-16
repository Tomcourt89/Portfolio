document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle input');
    const contentWrapper = document.querySelector('.content-wrapper');
    const playToggle = document.querySelector('.just-play');
    const menuVideo = document.querySelector('video');
    const pauseToggle = document.querySelector('.pause input');
    const links = document.querySelector('.links');
    const modal = document.querySelector('.iframeModal');
    const closeBtn = document.querySelector('.close');
    const iframe = document.querySelector('.iframeContent');

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

        // Menu click/tap off
        contentWrapper.addEventListener('click', () => {
            contentWrapper.classList.remove('menu-open');
            menuVideo.pause();
            gamePause = false;
            menuToggle.checked = false;

            if (pauseToggle.checked) {
                pauseToggle.checked = false;
            }
        });
    });

    // Autocomplete in the html seems to achieve this, may not be necessary.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
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

    function generateProjectCards(projects, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            const content = document.createElement('div');
            content.classList.add('content');

            const imgCont = document.createElement('div');
            imgCont.classList.add('img-cont');
            
            const link = document.createElement('a');
            link.href = project.url;
            
            const title = document.createElement('h3');
            title.textContent = project.title;
            
            if (project.url) {
                const icon = document.createElement('i');
                icon.classList.add('fa-solid', 'fa-up-right-from-square');
                link.appendChild(title);
                link.appendChild(icon);
            } else {
                link.appendChild(title);
            }
            
            content.appendChild(link);
        
            const image = document.createElement('img');
            image.classList.add('screenshot');
            image.classList.add(project.theme); // Just to choose the expand button colour
            image.src = project.imageSrc;
            image.alt = `${project.title} Screenshot`;
            image.setAttribute('data-url', project.url);
        
            card.appendChild(content);
            card.appendChild(imgCont);
            imgCont.appendChild(image);
            container.appendChild(card);
        });
        
        

        const screenshots = document.querySelectorAll('.screenshot');

        screenshots.forEach(screenshot => {
            screenshot.addEventListener('click', openModal);
        });
    }

    // Fetch the JSON data and render the projects
    fetch('./projects.json')
    .then(response => response.json())
    .then(data => {
        generateProjectCards(data.workProjects, 'work-projects');
        generateProjectCards(data.personalProjects, 'personal-projects');
    })
    .catch(error => console.error('Error loading JSON:', error));

    function openModal(event) {
        gamePause = true;
        if (!pauseToggle.checked) {
            pauseToggle.checked = true;
        }
        const clickedScreenshot = event.target;
        
        // Set iframe URL from the data-url attribute
        const url = clickedScreenshot.dataset.url;
        iframe.src = url;

        modal.style.display = "block";
    }

    function closeModal() {
        if (modal.style.display === "block") {
            modal.style.display = "none";
            iframe.src = "";

            gamePause = false;
            pauseToggle.checked = false;
        }
    }
    

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        // if (event.target === modal) {
        //     closeModal();
        // }

        // Cant figure out why above doesnt work, obtuse workaround till i come back to it.
        if (event.target === contentWrapper || event.target === menuToggle || event.target === pauseToggle || event.target === document.querySelector('#game-board') || event.target === document.querySelector('main')) {
            closeModal();
        }
    });
});
