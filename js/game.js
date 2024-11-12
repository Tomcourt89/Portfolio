document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    let gridSize = 20; // Size of each segment in pixels

    if (window.innerWidth >= 640) {
        gridSize = 40;
    }

    let snakeSegments = [];
    let direction = { x: 0, y: 0 };
    let mouseX, mouseY;
    let lastMoveTime = Date.now();
    let autoMove = false;
    let immune = false;
    let immunityTimer;
    let food = null;

    const initialLength = 6; 
    const newSnakeLength = 7; 
    const immunityDuration = 2000;

    let currentSpeed = 400;
    let moveInterval;

    // Set game board size to be a multiple of gridSize
    function setGameBoardSize() {
        let padding = gridSize * 2;

        let width = Math.floor((window.innerWidth / gridSize) * gridSize) - padding;
        let height = Math.floor((window.innerHeight / gridSize) * gridSize) - (padding * 2);

        if (window.innerWidth >= 640) {
            height = Math.floor((window.innerHeight / gridSize) * gridSize) - padding;
        }

        width -= width % padding;
        height -= height % padding;

        gameBoard.style.width = `${width}px`;
        gameBoard.style.height = `${height}px`;
    }

    function createSnake(length) {
        // TODO update starting position, on reset it should face the menu so that an instant reset doesnt happen on mouse move.
        const startX = Math.floor((gameBoard.clientWidth / gridSize - length) / 2) * gridSize;
        const startY = Math.floor(gameBoard.clientHeight / gridSize / 2) * gridSize;

        for (let i = 0; i < length; i++) {
            const segment = document.createElement('div');
            segment.classList.add('snake-segment');
            segment.style.left = `${startX + (i * gridSize)}px`;
            segment.style.top = `${startY}px`;

            snakeSegments.push(segment);
            gameBoard.appendChild(segment);
        }
    }

    function createFood() {
        if (food) {
            gameBoard.removeChild(food);
        }

        let foodX, foodY;
        let isOccupied;

        do {
            isOccupied = false;

            // Randomly place food
            foodX = Math.floor(Math.random() * (gameBoard.clientWidth / gridSize)) * gridSize;
            foodY = Math.floor(Math.random() * (gameBoard.clientHeight / gridSize)) * gridSize;

            // Check if the generated position is occupied by the snake
            for (let segment of snakeSegments) {
                if (segment.offsetLeft === foodX && segment.offsetTop === foodY) {
                    isOccupied = true;
                    break;
                }
            }
        } while (isOccupied);

        food = document.createElement('div');
        food.classList.add('snake-segment');
        food.style.left = `${foodX}px`;
        food.style.top = `${foodY}px`;

        gameBoard.appendChild(food);
    }

    setGameBoardSize();
    createSnake(initialLength);
    createFood();

    // Set the initial mouse position
    mouseX = gameBoard.clientWidth / 2;
    mouseY = gameBoard.clientHeight / 2;

    document.addEventListener('mousemove', (event) => {
        lastMoveTime = Date.now();
        autoMove = false;

        mouseX = event.clientX - gameBoard.getBoundingClientRect().left;
        mouseY = event.clientY - gameBoard.getBoundingClientRect().top;

        const head = snakeSegments[0];

        if (Math.abs(mouseX - head.offsetLeft) > Math.abs(mouseY - head.offsetTop)) {
            const newDirectionX = (mouseX > head.offsetLeft) ? 1 : -1;
            if (direction.x !== -newDirectionX) {
                direction.x = newDirectionX;
                direction.y = 0;
            }
        } else {
            const newDirectionY = (mouseY > head.offsetTop) ? 1 : -1;
            if (direction.y !== -newDirectionY) {
                direction.y = newDirectionY;
                direction.x = 0;
            }
        }
    });

    // TODO Add keyboard controls option when content is hidden.
    function setSpeed(speed) {
        currentSpeed = speed;
        clearInterval(moveInterval);
        moveInterval = setInterval(moveSnake, currentSpeed);
        resetGame();
    }

    document.querySelector('.slow').addEventListener('click', () => setSpeed(800));
    document.querySelector('.medium').addEventListener('click', () => setSpeed(400));
    document.querySelector('.fast').addEventListener('click', () => setSpeed(300));
    document.querySelector('.fastest').addEventListener('click', () => setSpeed(50));

    setInterval(() => {
        // Check for inactivity to enable auto-play after 5 seconds
        // May need to increase this as on large screen sizes and slow speed it can take longer than 5 to get from a to b
        if (Date.now() - lastMoveTime > 5000) {
            autoMove = true;

            const head = snakeSegments[0];
            const possibleDirections = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];

            let bestDirection = null;
            let minDistance = Infinity;

            possibleDirections.forEach(dir => {
                const newX = head.offsetLeft + dir.x * gridSize;
                const newY = head.offsetTop + dir.y * gridSize;

                // Ensures new direction doesn't lead to a collision
                if (!snakeSegments.some(segment => segment.offsetLeft === newX && segment.offsetTop === newY)) {
                    const dist = Math.abs(food.offsetLeft - newX) + Math.abs(food.offsetTop - newY);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestDirection = dir;
                    }
                }
            });

            if (bestDirection) {
                direction = bestDirection;
            }
        }
    }, 500);
    
    function moveSnake() {
        if (window.gamePause()) return;

        // Ensure the snake doesn't move if it hasn't been directed yet
        if (!autoMove && direction.x === 0 && direction.y === 0) return;

        // Move each segment to the position of the previous segment
        for (let i = snakeSegments.length - 1; i > 0; i--) {
            snakeSegments[i].style.left = `${snakeSegments[i - 1].offsetLeft}px`;
            snakeSegments[i].style.top = `${snakeSegments[i - 1].offsetTop}px`;
        }

        // Calculate new head position based on direction
        let headX = snakeSegments[0].offsetLeft + (direction.x * gridSize);
        let headY = snakeSegments[0].offsetTop + (direction.y * gridSize);

        // Wrap around logic for the head
        if (headX < 0) {
            headX = gameBoard.clientWidth - gridSize;
        } else if (headX >= gameBoard.clientWidth) {
            headX = 0;
        }

        if (headY < 0) {
            headY = gameBoard.clientHeight - gridSize;
        } else if (headY >= gameBoard.clientHeight) {
            headY = 0;
        }

        // Check for collision with itself, considering immunity
        if (!immune) {
            for (let i = 1; i < snakeSegments.length; i++) {
                if (headX === snakeSegments[i].offsetLeft && headY === snakeSegments[i].offsetTop) {
                    resetGame();
                    return;
                }
            }

            // TODO Immunity and new auto logic helps prevent colliding with itself, need to test further.
            if (snakeSegments.length > 2) {
                const secondSegmentX = snakeSegments[1].offsetLeft;
                const secondSegmentY = snakeSegments[1].offsetTop;

                if (headX === secondSegmentX && headY === secondSegmentY) {
                    resetGame();
                    return;
                }
            }
        }

        // Update the position of the head segment
        snakeSegments[0].style.left = `${headX}px`;
        snakeSegments[0].style.top = `${headY}px`;

        // Check for collision with food
        if (headX === food.offsetLeft && headY === food.offsetTop) {
            // Increase snake length by adding a new segment
            const newSegment = document.createElement('div');
            newSegment.classList.add('snake-segment');
            newSegment.style.left = `${snakeSegments[snakeSegments.length - 1].offsetLeft}px`;
            newSegment.style.top = `${snakeSegments[snakeSegments.length - 1].offsetTop}px`;
            snakeSegments.push(newSegment);
            gameBoard.appendChild(newSegment);

            createFood();
        }
    }

    moveInterval = setInterval(moveSnake, currentSpeed);

    function resetGame() {
        // Remove existing snake segments from the game board
        snakeSegments.forEach(segment => {
            gameBoard.removeChild(segment);
        });

        snakeSegments = [];
        direction = { x: 1, y: 0 }; // Reset direction, added immunity to prevent double resets.

        createSnake(newSnakeLength);
        createFood();

        immune = true;
        clearTimeout(immunityTimer);
        immunityTimer = setTimeout(() => {
            immune = false;
        }, immunityDuration);
    }

    window.addEventListener('resize', () => {
        setGameBoardSize();
        resetGame();
    });
});
