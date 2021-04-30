"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectNode = exports.Mass = exports.RopeSegment = exports.Pulley = exports.ctx = void 0;
var snapDistance = 30;
const workspace = document.getElementById("workspace");
const gridCanvas = document.getElementById("grid-canvas");
const mainCanvas = document.getElementById("main-canvas");
mainCanvas.width = 10000;
mainCanvas.height = 6000;
const ctx = mainCanvas.getContext("2d");
exports.ctx = ctx;
var clickMode = 'f'; //'f' for first click     's' for second click
var firstClickPos;
var status = "editing";
var globalElementList = {};
const Pulley = require("./Pulley");
exports.Pulley = Pulley;
const RopeSegment = require("./RopeSegment");
exports.RopeSegment = RopeSegment;
const Mass = require("./Mass");
exports.Mass = Mass;
const ObjectNode = require("./ObjectNode");
exports.ObjectNode = ObjectNode;
globalElementList["12345"] = new Pulley({ x: 2000, y: 2000 }, 600);
var scalingHtmlElement;
var ropeLabel;
// import CommandManager = require('./CommandManager')
// const editManager = new CommandManager()
document.getElementById("undo").onclick = () => {
    // editManager.undo()
};
document.getElementById("redo").onclick = () => {
    // editManager.redo()
};
document.onkeyup = (e) => {
    if (e.ctrlKey && e.code === "KeyZ") {
        // editManager.undo()
    }
    else if (e.ctrlKey && e.code === "KeyY") {
        // editManager.redo()
    }
};
(function drawGrid() {
    gridCanvas.width = 1300;
    gridCanvas.height = 900;
    gridCanvas.style.width = 1300 + 'px';
    gridCanvas.style.height = 900 + 'px';
    let ctx = gridCanvas.getContext("2d");
    for (let i = 0; i < gridCanvas.width; i += snapDistance) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gridCanvas.height);
        ctx.strokeStyle = "#e0ddd3";
        ctx.stroke();
    }
    for (let i = 0; i < gridCanvas.height; i += snapDistance) {
        ctx.moveTo(0, i);
        ctx.lineTo(gridCanvas.width, i);
        ctx.strokeStyle = "#e0ddd3";
        ctx.stroke();
    }
})();
var lastFrame = 0;
var fpsTime = 0;
var frameCount = 0;
var fps = 0;
function init() {
    mainCanvas.onmousedown = mainMousedownHandler;
    mainCanvas.onmouseup = mainMouseupHandler;
    mainCanvas.onmousemove = mainMousemoveHandler;
    mainCanvas.onmouseout = mainMouseoutHandler;
    main(0);
}
function main(currentFrame) {
    window.requestAnimationFrame(main);
    update(currentFrame);
    render();
}
function update(currentFrame) {
    let dt = (currentFrame - lastFrame) / 1000;
    lastFrame = currentFrame;
    for (let id in globalElementList) {
        if (status === "animating")
            globalElementList[id].update(dt);
    }
    updateFps(dt);
}
function updateFps(dt) {
    if (fpsTime > 0.25) {
        // Calculate fps
        fps = Math.round(frameCount / fpsTime);
        // Reset time and framecount
        fpsTime = 0;
        frameCount = 0;
    }
    // Increase time and framecount
    fpsTime += dt;
    frameCount++;
}
function render() {
    drawWorkspace();
    for (let id in globalElementList) {
        if (status === "editing" || !(globalElementList[id] instanceof ObjectNode))
            globalElementList[id].render();
    }
    ctx.stroke();
}
function drawWorkspace() {
    // ctx.fillStyle = "#303030"
    // ctx.fillRect(0, 0, mainCanvas.width, 65)
    // ctx.fillStyle = "#ffffff"
    // ctx.font = "24px Verdana"
    // ctx.fillText("Text text", 10, 25)
    // ctx.fillStyle = "blue"
    // ctx.font = "14px Arial"
    // ctx.fillText("fps: " + fps, 10, 35)
}
function mainMousedownHandler(event) { }
function mainMousemoveHandler(event) { }
function mainMouseoutHandler(event) { }
function mainMouseupHandler(event) { }
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    };
}
init();
