var canvas;
var canvasContext;

var player = { x: 50, y: 300, speed: 10, size: 40 };
var bullet = { x: 100, y: 150, size: 10, speed: 10 };
var powerUp = { x: 100, y: 150, size: 10, speed: 10 };
var box = { x: 200, y: 200, size: 70, speed: 5 };

var boxes = [];
var bullets = [];
var powerUps = [];

var bulletCount = 3;

var powerUpImage;
var boxImage;
var playerImage;
var bulletImage;

var keysDown = {
    w: false,
    a: false,
    s: false,
    d: false
};

function startGame() {
    gameInterval = setInterval(updateGame, 30); 
    boxInterval = setInterval(generateBox, boxGenerationInterval);
}

// ... Other game functions like movePlayer, movePowerUps, moveBoxes, drawEverything, etc.
function increaseBoxGenerationSpeed() {
    if(score < 50) {
        boxGenerationInterval /= 1.5;
        clearInterval(boxInterval);
        boxInterval = setInterval(generateBox, boxGenerationInterval);
    }
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
    
function movePowerUps() {
    for(let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].x -= 5;  // Adjust speed as needed
        if(powerUps[i].x + powerUps[i].size <= 0) {
            powerUps.splice(i, 1);
        }
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

function moveBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.speed;
    });
    // Remove bullets that have left the canvas
    bullets = bullets.filter(bullet => bullet.x < canvas.width);
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

    // Play the laser gun sound
    let laserSound = document.getElementById("laserGunSound");
    laserSound.currentTime = 0; // Reset sound playback to start
    laserSound.play();function endGame() {
    clearInterval(gameInterval);
    clearInterval(boxInterval);
    // ... other end game logic
    document.getElementById('gameOverPopup').style.display = "block";
}

    
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

function endGame() {
    clearInterval(gameInterval);
    clearInterval(boxInterval);
    isGameRunning = false;
    gameStarted = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverPopup').style.display = "block";
}
 