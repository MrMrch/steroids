// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    const homepage = document.getElementById("homepage");
    const gameCanvas = document.getElementById("gameCanvas");
    const audioElement = document.querySelector('audio');
    const toggleAudioBtn = document.getElementById('toggleAudio');
    
    let gameStarted = false;

    // Initially, hide the game canvas and the mute/unmute button
    gameCanvas.style.display = "none";
    toggleAudioBtn.style.display = "none";

    // Mute/Unmute logic
    toggleAudioBtn.addEventListener('click', function() {
        if (audioElement.muted) {
            audioElement.muted = false;
            this.textContent = "Mute";
        } else {
            audioElement.muted = true;
            this.textContent = "Unmute";
        }
    });

    

    // Listen for spacebar press on the document
    document.addEventListener("keydown", function(event) {
        if (event.code === "Space" && !gameStarted) {
            // Prevent the event from being propagated to other listeners
            event.stopPropagation();

            // Hide homepage, show game canvas and the mute/unmute button
            homepage.style.display = "none";
            gameCanvas.style.display = "block";
            toggleAudioBtn.style.display = "block";

            // Play audio
            audioElement.muted = false; // Ensure audio is unmuted
            audioElement.play();

            gameStarted = true;

            // Start the game after a delay
            setTimeout(function() {
                isGameRunning = true;
                startGame();
            }, 10);
        }
    });
});
