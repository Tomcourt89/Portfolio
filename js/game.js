document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const gridSize = 40; // Size of each segment in pixels

    let snakeSegments = [];
    let direction = { x: 0, y: 0 };
    let mouseX, mouseY;

    let food = null;

    const initialLength = 6; // Initial length of the snake
    const newSnakeLength = 7; // Length of the snake after collision

    // Set game board size to be a multiple of gridSize
    function setGameBoardSize() {
        let padding = gridSize;
        if(window.innerWidth >= 640) {
            padding = padding * 2;
        }
        
        const width = Math.floor((window.innerWidth / gridSize) * gridSize) - padding;
        const height = Math.floor((window.innerHeight / gridSize) * gridSize) - padding;

        gameBoard.style.width = `${width}px`;
        gameBoard.style.height = `${height}px`;
    }

    // Create the initial snake
    function createSnake(length) {
        // Calculate center starting position
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

    // Function to create food
    function createFood() {
        if (food) {
            gameBoard.removeChild(food); // Remove existing food if any
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

        // Create and style food element, same as snake segment for now
        food = document.createElement('div');
        food.classList.add('snake-segment');
        food.style.left = `${foodX}px`;
        food.style.top = `${foodY}px`;

        gameBoard.appendChild(food);
    }

    // Initialize the board, snake and food
    setGameBoardSize();
    createSnake(initialLength);
    createFood();

    // Set the initial mouse position
    mouseX = gameBoard.clientWidth / 2;
    mouseY = gameBoard.clientHeight / 2;

    // Mouse move event listener
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX - gameBoard.getBoundingClientRect().left;
        mouseY = event.clientY - gameBoard.getBoundingClientRect().top;

        const head = snakeSegments[0];

        if (Math.abs(mouseX - head.offsetLeft) > Math.abs(mouseY - head.offsetTop)) {
            const newDirectionX = (mouseX > head.offsetLeft) ? 1 : -1; // Move right or left
            if (direction.x !== -newDirectionX) {
                direction.x = newDirectionX;
                direction.y = 0;
            }
        } else {
            const newDirectionY = (mouseY > head.offsetTop) ? 1 : -1; // Move down or up
            if (direction.y !== -newDirectionY) {
                direction.y = newDirectionY;
                direction.x = 0;
            }
        }
    });

    // TODO Add keyboard controls option when content is hidden.

    setInterval(() => {
        // Ensure the snake doesn't move if it hasn't been directed yet
        if (direction.x === 0 && direction.y === 0) return;

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

        // Check for collision with itself
        for (let i = 1; i < snakeSegments.length; i++) {
            if (headX === snakeSegments[i].offsetLeft && headY === snakeSegments[i].offsetTop) {
                resetGame();
                return;
            }
        }

        // TODO
        // Preventing 180 degree turn doesnt really work yet 
        // add third segment logic as the only possible collision for the head is the 4th segment
        if (snakeSegments.length > 2) {
            const secondSegmentX = snakeSegments[1].offsetLeft;
            const secondSegmentY = snakeSegments[1].offsetTop;

            if (headX === secondSegmentX && headY === secondSegmentY) {
                resetGame();
                return;
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

            // Create new food after consumption
            createFood();
        }

    }, 400); // Speed of the game // TODO Add variable speeds

    function resetGame() {
        // Remove existing snake segments from the game board
        snakeSegments.forEach(segment => {
            gameBoard.removeChild(segment);
        });

        // Reset the snake and direction
        snakeSegments = [];
        direction = { x: 1, y: 0 }; // Reset direction // TODO Make the direction be wherever the mouse currently is to prevent double resets

        // Reset
        createSnake(newSnakeLength);
        createFood();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        setGameBoardSize();
        resetGame();
    });
});
