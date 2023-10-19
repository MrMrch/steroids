let isGameRunning = false;

var canvas;
var canvasContext;
var player = { x: 50, y: 300, speed: 10, size: 40 };
var bullet = { x: 100, y: 150, size: 10, speed: 10 };
var powerUp = { x: 100, y: 150, size: 10, speed: 10 };

// Example box object
var box = { x: 200, y: 200, size: 70, speed: 5 };

var boxes = [];
var score = 0;
var gameInterval;
var boxInterval;
var boxGenerationInterval = 1000; // Intervallo iniziale per la generazione delle scatole

var bulletCount = 3;

var bullets = [];
var powerUps = [];

var powerUp;

var powerUpImage;
var boxImage;
var playerImage;
var bulletImage;

// Object to keep track of which keys are down
var keysDown = {
    w: false,
    a: false,
    s: false,
    d: false
};

function getOpaquePixels(img, width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    let imgData = ctx.getImageData(0, 0, width, height).data;
    let opaquePixels = [];
    
    for(let y = 0; y < height; y++) {
        opaquePixels[y] = [];
        for(let x = 0; x < width; x++) {
            let alpha = imgData[(y * width + x) * 4 + 3];
            opaquePixels[y][x] = alpha > 0;
        }
    }
    return opaquePixels;
}


function boundingBoxCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.size > obj2.y;
}

function pixelPerfectCollision(obj1, obj2, obj1Pixels, obj2Pixels) {
    let xMin = Math.max(obj1.x, obj2.x);
    let yMin = Math.max(obj1.y, obj2.y);
    let xMax = Math.min(obj1.x + obj1.size, obj2.x + obj2.size);
    let yMax = Math.min(obj1.y + obj1.size, obj2.y + obj2.size);
    
    for(let y = yMin; y < yMax; y++) {
        for(let x = xMin; x < xMax; x++) {
            if(obj1Pixels[y - obj1.y][x - obj1.x] && obj2Pixels[y - obj2.y][x - obj2.x]) {
                return true;
            }
        }
    }
    return false;
}

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




function startGame() {
    // Initialize intervals after images are loaded
    gameInterval = setInterval(updateGame, 30); 
    boxInterval = setInterval(generateBox, boxGenerationInterval);
}



function updateGame() {
    if (!isGameRunning) return;

        console.log("Updating game...");  // Debugging line

        movePlayer();
        movePowerUps();  // Make sure to call this function

        moveBoxes();
        moveBullets();
        checkCollisions();
        drawEverything();
}


function movePlayer() {
/*     if(keysDown.w) player.y -= player.speed;
    if(keysDown.a) player.x -= player.speed;
    if(keysDown.s) player.y += player.speed;
    if(keysDown.d) player.x += player.speed;
 */    if(keysDown.w && player.y - player.speed > 0) player.y -= player.speed;
    if(keysDown.a && player.x - player.speed > 0) player.x -= player.speed;
    if(keysDown.s && player.y + player.speed < canvas.height) player.y += player.speed;
    if(keysDown.d && player.x + player.speed < canvas.width) player.x += player.speed;
}



function handleKeyDown(evt) {
    switch(evt.key) {
        case 'w': keysDown.w = true; break;
        case 'a': keysDown.a = true; break;
        case 's': keysDown.s = true; break;
        case 'd': keysDown.d = true; break;
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
        case 'w': keysDown.w = false; break;
        case 'a': keysDown.a = false; break;
        case 's': keysDown.s = false; break;
        case 'd': keysDown.d = false; break;
    }
}



function drawEverything() {
    console.log("Updating game...");  // Debugging line

    canvasContext.fillStyle = '#000';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bullet count
    canvasContext.fillStyle = '#FFF';
    canvasContext.font = '20px Arial';
    canvasContext.fillText('Bullets: ' + bulletCount, canvas.width - 120, 30);

    // Draw player as a red ball
    canvasContext.fillStyle = '#F00';
    canvasContext.beginPath();
    canvasContext.arc(player.x, player.y, player.size, 0, Math.PI*2);
    canvasContext.fill();
    
    // Draw yellow boxes as balls
    canvasContext.fillStyle = 'black';
    boxes.forEach(box => {
        canvasContext.beginPath();
        canvasContext.arc(
            box.x + box.size / 2, // center x
            box.y + box.size / 2, // center y
            box.size / 2, // radius
            0, // start angle
            Math.PI * 2 // end angle
        );
        canvasContext.fill();
    });
    
    // Draw score
    canvasContext.fillStyle = '#FFF';
    canvasContext.font = '20px Arial';
    canvasContext.fillText('Score: ' + score, 10, 30);

    // Draw green circles
    canvasContext.fillStyle = '#0F0';
    powerUps.forEach(circle => {
        canvasContext.beginPath();
        canvasContext.arc(circle.x, circle.y, circle.size, 0, Math.PI*2);
        canvasContext.fill();
    });

    // Draw powerUp images
    powerUps.forEach(powerUp => {
        var imageDrawSize = powerUp.size * 3;  // Definisci qui quanto vuoi che l'immagine sia più grande della hitbox
        
        canvasContext.drawImage(
            powerUpImage, 
            powerUp.x - imageDrawSize / 2,  // Centra l'immagine sulla hitbox
            powerUp.y - imageDrawSize / 2,  
            imageDrawSize,  // Utilizza la nuova dimensione per disegnare
            imageDrawSize   
        );
    });

        
    // Draw all bullets as circles
    bullets.forEach(bullet => {
        canvasContext.beginPath();
        canvasContext.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI*2);
        canvasContext.fill();
    });

    // Draw bullet images
    bullets.forEach(bullet => {
        var imageDrawSize = bullet.size * 5; 
        let angleInRadians = 225 * Math.PI / 180; // Convert 30 degrees to radians

        canvasContext.save();  // Save the current context state

        canvasContext.translate(bullet.x, bullet.y);  // Translate to bullet's center
        canvasContext.rotate(angleInRadians);  // Rotate by 30 degrees

        canvasContext.drawImage(
            bulletImage, 
            -imageDrawSize / 2,  // Center the bullet horizontally
            -imageDrawSize / 2,  // Center the bullet vertically
            imageDrawSize,  // Use the adjusted size
            imageDrawSize  // Use the adjusted size
        );

        canvasContext.restore();  // Restore the context to the saved state (pre-transformation)
    });

    
/*     // Draw box images
    boxes.forEach(box => {
        canvasContext.drawImage(boxImage, box.x, box.y, box.size, box.size);
    }); */

    // Draw box images with rotation
    boxes.forEach(box => {
        canvasContext.save();  // Save the current state
        canvasContext.translate(box.x + box.size / 2, box.y + box.size / 2);  // Move to the center of the box
        canvasContext.rotate(box.rotation * Math.PI / 180);  // Rotate the canvas
        canvasContext.drawImage(boxImage, -box.size / 2, -box.size / 2, box.size, box.size);  // Draw the box
        canvasContext.restore();  // Restore the state
    });
    

/*     // Draw player image
    let spaceshipSize = player.size * 2.5; // Adjust the size
    
    canvasContext.drawImage(
        playerImage, 
        player.x - spaceshipSize / 2, // Center the spaceship
        player.y - spaceshipSize / 2, // Center the spaceship
        spaceshipSize, // Use the adjusted size
        spaceshipSize  // Use the adjusted size
    ); */

    // Draw player image
    let spaceshipSize = player.size * 2.5; // Adjust the size if needed
    let angleInRadians = 35 * Math.PI / 180; // Convert angle to radians

    canvasContext.save();  // Save the current context state

    canvasContext.translate(player.x, player.y);  // Translate to player's center
    canvasContext.rotate(angleInRadians);  // Rotate by 35 degrees

    canvasContext.drawImage(
        playerImage, 
        -spaceshipSize / 2,  // Center the spaceship horizontally
        -spaceshipSize / 2,  // Center the spaceship vertically
        spaceshipSize,  // Use the adjusted size
        spaceshipSize  // Use the adjusted size
    );

    canvasContext.restore();  // Restore the context to the saved state (pre-transformation)
}
    
function increaseBoxGenerationSpeed() {
    if(score < 50) {
        boxGenerationInterval /= 1.5;
        clearInterval(boxInterval);
        boxInterval = setInterval(generateBox, boxGenerationInterval);
    }
}
 

function moveBoxes() {
    for(let i = boxes.length - 1; i >= 0; i--) {
        boxes[i].x -= boxes[i].speed;
        boxes[i].rotation += boxes[i].rotationSpeed;  // Update the rotation
        if (boxes[i].rotation >= 360) boxes[i].rotation -= 360;  // Keep rotation in 0-360 range
        if (boxes[i].rotation < 0) boxes[i].rotation += 360;  // Keep rotation in 0-360 range
        if(boxes[i].x + boxes[i].size <= 0) {
            score += 1;
            boxes.splice(i, 1);
            // Verifica se la velocità di generazione delle scatole deve essere aumentata
            if(score % 10 === 0) {
                increaseBoxGenerationSpeed();
                generatePowerUp();  // Generate a power-up every 10 boxes passed

            }
        }
    }
}

function movePowerUps() {
    for(let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].x -= 5;  // Adjust speed as needed
        if(powerUps[i].x + powerUps[i].size <= 0) {
            powerUps.splice(i, 1);
        }
    }
}



 


function generateBox() {
    var boxSize = 50;
    var box = {
        x: canvas.width,
        y: Math.random() * (canvas.height - boxSize),
        size: boxSize,
        speed: 5,
        rotation: Math.random() * 360,  // 0 to 360 degrees
        rotationSpeed: (Math.random() - 0.5) * 10  // -5 to 5 degrees per frame
    };
    boxes.push(box);
}


function checkCollisions() {
        // Check for collision between player and asteroids

    for(let box of boxes) {
        if(player.x < box.x + box.size &&
           player.x + player.size > box.x &&
           player.y < box.y + box.size &&
           player.y + player.size > box.y) {
            clearInterval(gameInterval);
            clearInterval(boxInterval);
            endGame();
        }
    }

    // Check for collision between player and power-ups
    for(let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        if(boundingBoxCollision(player, powerUp)) {
            bulletCount += 5; // Increase bullet count by 10
            powerUps.splice(i, 1); // Remove the power-up
        }
    }

    
    // Check for collision between bullets and boxes
    for(let i = boxes.length - 1; i >= 0; i--) {
        let box = boxes[i];
        for(let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if(boundingBoxCollision(bullet, box)) {
                boxes.splice(i, 1); // Remove the box
                bullets.splice(j, 1); // Remove the bullet
                score += 2; // Add score for destroying a box
                break;
            }
        }
    }
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(boxInterval);
    isGameRunning = false;
    gameStarted = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverPopup').style.display = "block";
}


function generatePowerUp() {
    var powerUpSize = player.size / 2;
    var powerUp;
    var hasCollision;

    do {
        hasCollision = false;
        powerUp = {
            x: canvas.width,
            y: Math.random() * (canvas.height - powerUpSize),
            size: powerUpSize
        };

        // Check if the new power-up collides with any box
        for(let box of boxes) {
            if(boundingBoxCollision(powerUp, box)) {
                hasCollision = true;
                break;
            }
        }
    } while (hasCollision);  // If collision, generate a new position

    powerUps.push(powerUp);
}

function shootBullet() {
    var bulletSize = 10;  // Define the bullet size
    var bullet = {
        x: player.x + player.size,
        y: player.y + player.size/2 - bulletSize/2,  
        size: bulletSize,  // Use the defined size here
        width: bulletSize,  
        height: 30, 
        speed: 10
    };
    bullets.push(bullet);

    
}

function moveBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.speed;
    });
    // Remove bullets that have left the canvas
    bullets = bullets.filter(bullet => bullet.x < canvas.width);
}

 

const restartBtn = document.getElementById('restartGame');

restartBtn.addEventListener('click', function() {
    // Hide game over popup
    document.getElementById('gameOverPopup').style.display = "none";

    // Reset game variables if needed (e.g. score, player position, etc.)
    // ... reset logic ...

    // Start the game
    isGameRunning = true;
    startGame();
});
