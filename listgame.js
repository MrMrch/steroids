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








     




