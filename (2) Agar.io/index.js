import { Blob, Vector2, Game, controller } from "./classes.js";

const canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function UpdateCanvas() {
    canvas.width = window.innerWidth - 1;
    canvas.height = window.innerHeight - 4;
    ctx = canvas.getContext("2d");
}

var shouldClose = false;

var game = null;

function InitializeGame() {
    game = new Game(100);
    UpdateCanvas();
    window.requestAnimationFrame(UpdateGame);
}

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.Draw(ctx);
}

function Tick() {
    game.Tick();
}

function UpdateGame() {
    Tick();
    Draw();
    if (!shouldClose) {
        window.requestAnimationFrame(UpdateGame);
    }
    else {
        document.getElementById("menu").style.display = "";
        document.getElementById("game").style.display = "none";
        shouldClose = false;
    }
}

document.getElementById("play-button").addEventListener("click", function() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "";
    InitializeGame();
});

document.onkeydown = function(event) {
    controller[event.key] = true;
}

document.onkeyup = function(event) {
    controller[event.key] = false;
}

window.addEventListener("resize", UpdateCanvas);