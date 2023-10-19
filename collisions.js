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

function checkCollisions() {
    // Check for collision between player and asteroids

    for(let box of boxes) {
        if(player.x < box.x + box.size &&
        player.x + player.size > box.x &&
        player.y < box.y + box.size &&
        player.y + player.size > box.y) {
            clearInterval(gameInterval);
            clearInterval(boxInterval);
            boxGenerationInterval = initialBoxGenerationInterval;
            boxInterval = setInterval(generateBox, boxGenerationInterval);  // Restart with the original interval
        
            // Play the explosion sound
            let deathSound = document.getElementById("deathSound");
            deathSound.currentTime = 0; // Reset sound playback to start
            deathSound.play();

            
            endGame();
        }
    }

    // Check for collision between player and power-ups
    for(let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        if(boundingBoxCollision(player, powerUp)) {
            bulletCount += 5; // Increase bullet count by 10
            powerUps.splice(i, 1); // Remove the power-up

            // Play the explosion sound
            let powerUpSound = document.getElementById("powerUpSound");
            powerUpSound.currentTime = 0; // Reset sound playback to start
            powerUpSound.play();
            
            
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

                // Play the explosion sound
                let explosionSound = document.getElementById("explosionSound");
                explosionSound.currentTime = 0; // Reset sound playback to start
                explosionSound.play();

                break;
            }
        }
    }
}
