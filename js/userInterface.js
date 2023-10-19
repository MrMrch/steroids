var isGameRunning = false;
var score = 0;
var gameInterval;
var boxInterval;
var initialBoxGenerationInterval = 1000;  // The original interval for generating boxes
var boxGenerationInterval = initialBoxGenerationInterval;  // The current interval, which can change as the game progresses

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Load the box and player images
    boxImage = new Image();
    boxImage.src = 'img/boxes.webp';

    playerImage = new Image();
    playerImage.src = 'img/spaceship.webp';

    powerUpImage = new Image();
    powerUpImage.src = 'img/powerUp.webp';
    
    bulletImage = new Image();
    bulletImage.src = 'img/bullet.webp';

    // Ensure all images are loaded before starting the game
    let imagesLoaded = 0;
    boxImage.onload = playerImage.onload = powerUpImage.onload = function() {
        imagesLoaded++;
    }
    
}

function handleKeyDown(evt) {
    switch(evt.key) {
        case 'w':
        case 'ArrowUp':
            keysDown.w = true;
            break;
        case 'a':
        case 'ArrowLeft':
            keysDown.a = true;
            break;
        case 's':
        case 'ArrowDown':
            keysDown.s = true;
            break;
        case 'd':
        case 'ArrowRight':
            keysDown.d = true;
            break;
        case ' ':  // Added case for spacebar
            if(bulletCount > 0) {
                shootBullet();
                bulletCount--;
            }
            break;
    }
}

function handleKeyUp(evt) {
    switch(evt.key) {
        case 'w':
        case 'ArrowUp':
            keysDown.w = false;
            break;
        case 'a':
        case 'ArrowLeft':
            keysDown.a = false;
            break;
        case 's':
        case 'ArrowDown':
            keysDown.s = false;
            break;
        case 'd':
        case 'ArrowRight':
            keysDown.d = false;
            break;
    }
}

const restartBtn = document.getElementById('restartGame');

restartBtn.addEventListener('click', function() {
    // Hide game over popup
    document.getElementById('gameOverPopup').style.display = "none";

    // 1. Resetting game variables
    score = 0;
    player.x = 50;
    player.y = 300;
    bulletCount = 3;
    boxGenerationInterval = initialBoxGenerationInterval;
    clearInterval(boxInterval);  // Clear the old interval
    boxInterval = setInterval(generateBox, boxGenerationInterval);  // Restart with the original interval

    // 2. Clearing arrays
    bullets.length = 0;
    powerUps.length = 0;
    boxes.length = 0;

    // 3. Stopping active intervals 
    clearInterval(gameInterval);
    clearInterval(boxInterval);

    // 4. Start the game
    isGameRunning = true;
    startGame();
});
