"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mass = exports.RopeSegment = exports.Pulley = exports.globalElementList = exports.ctx = void 0;
var snapDistance = 20;
const workspace = document.getElementById("workspace");
const gridCanvas = document.getElementById("grid-canvas");
const mainCanvas = document.getElementById("main-canvas");
const ctx = mainCanvas.getContext("2d");
exports.ctx = ctx;
var status = "editing";
var globalElementList = {};
exports.globalElementList = globalElementList;
const Pulley = require("./Pulley");
exports.Pulley = Pulley;
const RopeSegment = require("./RopeSegment");
exports.RopeSegment = RopeSegment;
const Mass = require("./Mass");
exports.Mass = Mass;
let workspaceResizeObserver = new ResizeObserver(entries => {
    mainCanvas.width = workspace.clientWidth;
    mainCanvas.height = workspace.clientHeight;
    drawGrid();
});
workspaceResizeObserver.observe(workspace);
const CommandManager = require("./CommandManager");
const editManager = new CommandManager();
document.getElementById("undo").onclick = () => {
    editManager.undo();
};
document.getElementById("redo").onclick = () => {
    editManager.redo();
};
document.onkeyup = (e) => {
    if (e.ctrlKey && e.code === "KeyZ") {
        editManager.undo();
    }
    else if (e.ctrlKey && e.code === "KeyY") {
        editManager.redo();
    }
};
var radios = [...document.querySelectorAll('input[name="selected-object"]')];
radios.forEach(radio => {
    radio.onchange = () => {
        let selectedTool = document.querySelector('input[name="selected-object"]:checked').value;
        if (["mass", "pulley", "rope-segment"].includes(selectedTool)) {
            workspace.style.cursor = "crosshair";
        }
        else {
            workspace.style.cursor = "default";
        }
    };
});
var functionsToRender = [];
function drawGrid() {
    gridCanvas.width = workspace.clientWidth;
    gridCanvas.height = workspace.clientHeight;
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
}
var lastFrame = 0;
var fpsTime = 0;
var frameCount = 0;
var fps = 0;
function init() {
    drawGrid();
    mainCanvas.onmousedown = mainMousedownHandler;
    mainCanvas.onmousemove = trackMousePosition;
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
    let nodesToRender = [];
    for (let id in globalElementList) {
        if (status === "editing") {
            let nodePositions = globalElementList[id].render();
            for (let position of nodePositions) {
                if (!nodesToRender.some(p => (p.x === position.x && p.y === position.y))) {
                    nodesToRender.push(position);
                }
            }
        }
    }
    for (let nodePos of nodesToRender) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        if (getDist(currentMousePos, nodePos) < snapDistance) {
            ctx.fillStyle = "lime";
            currentMousePos = nodePos;
        }
        else {
            ctx.fillStyle = "green";
        }
        ctx.arc(nodePos.x, nodePos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    for (let func of functionsToRender) {
        func();
    }
}
function drawWorkspace() {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
}
function mainMousedownHandler(event) {
    let selectedTool = document.querySelector('input[name="selected-object"]:checked').value;
    let inputtedMass = parseFloat(document.getElementById("mass-input").value);
    switch (selectedTool) {
        case "pulley":
            {
                let pos = { x: currentMousePos.x, y: currentMousePos.y };
                function showPulleyPreview() {
                    if (getDist(pos, currentMousePos) > snapDistance) {
                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#AAA";
                        ctx.arc(getSnappedPos(pos).x, getSnappedPos(pos).y, getSnappedDist(pos, currentMousePos), 0, 2 * Math.PI);
                        ctx.stroke();
                    }
                }
                functionsToRender.push(showPulleyPreview);
                function removeListeners() {
                    workspace.removeEventListener("mouseup", removeListeners);
                    if (getDist(pos, currentMousePos) > snapDistance) {
                        let newPulley = new Pulley(getSnappedPos(pos), getSnappedDist(pos, currentMousePos));
                        setID(newPulley);
                        editManager.add({
                            type: "create",
                            target: newPulley
                        });
                    }
                    functionsToRender = functionsToRender.filter(item => item !== showPulleyPreview);
                }
                workspace.addEventListener("mouseup", removeListeners);
            }
            ;
            break;
        case "mass":
            {
                let pos = { x: currentMousePos.x, y: currentMousePos.y };
                function showMassPreview() {
                    if (getDist(pos, currentMousePos) > 0.73 * snapDistance) {
                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#AAA";
                        ctx.rect(getSnappedPos(currentMousePos).x, getSnappedPos(currentMousePos).y, 2 * (getSnappedPos(pos).x - getSnappedPos(currentMousePos).x), 2 * (getSnappedPos(pos).y - getSnappedPos(currentMousePos).y));
                        ctx.stroke();
                    }
                }
                functionsToRender.push(showMassPreview);
                function removeListeners() {
                    workspace.removeEventListener("mouseup", removeListeners);
                    if (getDist(pos, currentMousePos) > 0.73 * snapDistance) {
                        let newMass = new Mass(getSnappedPos(pos), { width: 2 * Math.abs(getSnappedPos(pos).x - getSnappedPos(currentMousePos).x), height: 2 * Math.abs(getSnappedPos(pos).y - getSnappedPos(currentMousePos).y) }, inputtedMass);
                        setID(newMass);
                        editManager.add({
                            type: "create",
                            target: newMass
                        });
                    }
                    functionsToRender = functionsToRender.filter(item => item !== showMassPreview);
                }
                workspace.addEventListener("mouseup", removeListeners);
            }
            ;
            break;
        case "rope-segment":
            {
                let pos = { x: currentMousePos.x, y: currentMousePos.y };
                function showRopeSegmentPreview() {
                    if (Math.abs(currentMousePos.y - pos.y) > snapDistance) {
                        ctx.beginPath();
                        ctx.moveTo(getSnappedPos(pos).x, getSnappedPos(pos).y);
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#F99";
                        ctx.lineTo(getSnappedPos(currentMousePos).x, getSnappedPos(currentMousePos).y);
                        ctx.stroke();
                    }
                }
                functionsToRender.push(showRopeSegmentPreview);
                function removeListeners() {
                    workspace.removeEventListener("mouseup", removeListeners);
                    if (Math.abs(currentMousePos.y - pos.y) > snapDistance) {
                        let newRopeSegment = new RopeSegment(getSnappedPos(pos), getSnappedPos(currentMousePos));
                        setID(newRopeSegment);
                        editManager.add({
                            type: "create",
                            target: newRopeSegment
                        });
                    }
                    functionsToRender = functionsToRender.filter(item => item !== showRopeSegmentPreview);
                }
                workspace.addEventListener("mouseup", removeListeners);
            }
            ;
            break;
    }
}
var currentMousePos = { x: 0, y: 0 };
function trackMousePosition(e) {
    currentMousePos = getMousePos(mainCanvas, e);
}
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
        y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    };
}
function getDist(pos1, pos2) {
    return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
}
function getSnappedDist(pos1, pos2) {
    return Math.round(Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2)) / snapDistance) * snapDistance;
}
function getSnappedPos(pos) {
    let newX = Math.round(pos.x / snapDistance) * snapDistance;
    let newY = Math.round(pos.y / snapDistance) * snapDistance;
    return { x: newX, y: newY };
}
init();
function setID(element) {
    let id;
    do {
        id = (Math.floor(Math.random() * 1000000)).toString(); //generating a random ID from 0-999999
    } while (id in globalElementList);
    element.setID(id);
    globalElementList[id] = element;
}
