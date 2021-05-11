"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalElementList = exports.ctx = exports.snapDistance = void 0;
exports.snapDistance = 20;
const workspace = document.getElementById("workspace");
const gridCanvas = document.getElementById("grid-canvas");
const mainCanvas = document.getElementById("main-canvas");
exports.ctx = mainCanvas.getContext("2d");
var status = "editing";
exports.globalElementList = {}; // used to store references to all elements currently in the workspace
exports.Pulley = require("./Pulley");
exports.RopeSegment = require("./RopeSegment");
exports.Mass = require("./Mass");
let workspaceResizeObserver = new ResizeObserver(entries => {
    mainCanvas.width = workspace.clientWidth;
    mainCanvas.height = workspace.clientHeight;
    drawGrid();
});
workspaceResizeObserver.observe(workspace); // redraw the grid and rezise the canvas if the user changes the size of the container
const CommandManager = require("./CommandManager");
const editManager = new CommandManager(); // used to keep track of edits and undo/redo them
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
var functionsToRender = []; // set of functions to run when rendering the workspace, mostly used for preview outlines of elements
var nodesToRender = []; // set of all object nodes to render and which elements they are shared between
var fixedNodes = []; // set of all nodes that have been fixed, used to determine which icon to render
function drawGrid() {
    gridCanvas.width = workspace.clientWidth;
    gridCanvas.height = workspace.clientHeight;
    let ctx = gridCanvas.getContext("2d");
    for (let i = 0; i < gridCanvas.width; i += exports.snapDistance) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gridCanvas.height);
        ctx.strokeStyle = "#e0ddd3";
        ctx.stroke();
    }
    for (let i = 0; i < gridCanvas.height; i += exports.snapDistance) {
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
    for (let id in exports.globalElementList) {
        if (status === "animating")
            exports.globalElementList[id].update(dt);
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
const fixedNodeSVG = new Path2D("M 0 2.104 L 2.104 0 L 5 2.896 L 7.896 0 L 10 2.104 L 7.104 5 L 10 7.896 L 7.896 10 L 5 7.104 L 2.104 10 L 0 7.896 L 2.896 5 Z");
var nodeMousedOver = null;
function render() {
    drawWorkspace();
    nodesToRender = [];
    for (let id in exports.globalElementList) {
        if (status === "editing") {
            let nodePositions = exports.globalElementList[id].render();
            for (let position of nodePositions) {
                if (!nodesToRender.some(p => positionsEqual(p.pos, position))) {
                    nodesToRender.push({ pos: position, parents: [exports.globalElementList[id]] });
                }
                else {
                    let item = nodesToRender.find(x => positionsEqual(x.pos, position));
                    item.parents.push(exports.globalElementList[id]);
                }
            }
        }
    }
    nodeMousedOver = null;
    for (let node of nodesToRender) {
        exports.ctx.beginPath();
        if (!fixedNodes.some(n => positionsEqual(n, node.pos))) {
            exports.ctx.lineWidth = 3;
            exports.ctx.strokeStyle = "#000";
            if (getDist(currentMousePos, node.pos) < exports.snapDistance) {
                exports.ctx.fillStyle = "lime";
                nodeMousedOver = { pos: node.pos, parents: [...node.parents] };
                currentMousePos = node.pos;
            }
            else {
                exports.ctx.fillStyle = "green";
            }
            exports.ctx.arc(node.pos.x, node.pos.y, 5, 0, 2 * Math.PI);
            exports.ctx.fill();
            exports.ctx.stroke();
        }
        else {
            if (getDist(currentMousePos, node.pos) < exports.snapDistance) {
                exports.ctx.fillStyle = "yellow";
                nodeMousedOver = node;
            }
            else {
                exports.ctx.fillStyle = "orange";
            }
            exports.ctx.translate(node.pos.x - 5, node.pos.y - 5);
            exports.ctx.fill(fixedNodeSVG);
            exports.ctx.stroke();
            exports.ctx.translate(-node.pos.x + 5, -node.pos.y + 5);
        }
    }
    for (let func of functionsToRender) {
        func();
    }
}
function drawWorkspace() {
    exports.ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
}
function mainMousedownHandler(event) {
    let selectedTool = document.querySelector('input[name="selected-object"]:checked').value;
    let inputtedMass = parseFloat(document.getElementById("mass-input").value);
    switch (selectedTool) {
        case "pulley":
            {
                let pos = { x: currentMousePos.x, y: currentMousePos.y };
                function showPulleyPreview() {
                    if (getDist(pos, currentMousePos) > exports.snapDistance) {
                        exports.ctx.beginPath();
                        exports.ctx.lineWidth = 3;
                        exports.ctx.strokeStyle = "#AAA";
                        exports.ctx.arc(getSnappedPos(pos).x, getSnappedPos(pos).y, getSnappedDist(pos, currentMousePos), 0, 2 * Math.PI);
                        exports.ctx.stroke();
                    }
                }
                functionsToRender.push(showPulleyPreview);
                function removeListeners() {
                    workspace.removeEventListener("mouseup", removeListeners);
                    if (getDist(pos, currentMousePos) > exports.snapDistance) {
                        let newPulley = new exports.Pulley(getSnappedPos(pos), getSnappedDist(pos, currentMousePos));
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
                    if (getDist(pos, currentMousePos) > 0.73 * exports.snapDistance) {
                        exports.ctx.beginPath();
                        exports.ctx.lineWidth = 3;
                        exports.ctx.strokeStyle = "#AAA";
                        exports.ctx.rect(getSnappedPos(currentMousePos).x, getSnappedPos(currentMousePos).y, 2 * (getSnappedPos(pos).x - getSnappedPos(currentMousePos).x), 2 * (getSnappedPos(pos).y - getSnappedPos(currentMousePos).y));
                        exports.ctx.stroke();
                    }
                }
                functionsToRender.push(showMassPreview);
                function removeListeners() {
                    workspace.removeEventListener("mouseup", removeListeners);
                    if (getDist(pos, currentMousePos) > 0.73 * exports.snapDistance && getSnappedPos(pos).x - getSnappedPos(currentMousePos).x !== 0 && getSnappedPos(pos).y - getSnappedPos(currentMousePos).y) {
                        let newMass = new exports.Mass(getSnappedPos(pos), { width: 2 * Math.abs(getSnappedPos(pos).x - getSnappedPos(currentMousePos).x), height: 2 * Math.abs(getSnappedPos(pos).y - getSnappedPos(currentMousePos).y) }, inputtedMass);
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
                    if (Math.abs(currentMousePos.y - pos.y) > exports.snapDistance) {
                        exports.ctx.beginPath();
                        exports.ctx.moveTo(getSnappedPos(pos).x, getSnappedPos(pos).y);
                        exports.ctx.lineWidth = 3;
                        exports.ctx.strokeStyle = "#F99";
                        exports.ctx.lineTo(getSnappedPos(currentMousePos).x, getSnappedPos(currentMousePos).y);
                        exports.ctx.stroke();
                    }
                }
                functionsToRender.push(showRopeSegmentPreview);
                function removeListeners() {
                    workspace.removeEventListener("mouseup", removeListeners);
                    if (Math.abs(currentMousePos.y - pos.y) > exports.snapDistance) {
                        let newRopeSegment = new exports.RopeSegment(getSnappedPos(pos), getSnappedPos(currentMousePos));
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
        case "fix-node":
            {
                if (fixedNodes.some(nodePosition => positionsEqual(nodePosition, getSnappedPos(currentMousePos)))) {
                    fixedNodes = fixedNodes.filter(nodePosition => !positionsEqual(nodePosition, getSnappedPos(currentMousePos)));
                }
                else {
                    fixedNodes.push(getSnappedPos(currentMousePos));
                }
            }
            ;
            break;
        case "move":
            {
                if (nodeMousedOver !== null) {
                    let removeListenerFunctions = [];
                    let moveEdits = [];
                    nodeMousedOver.parents.forEach(p => {
                        delete exports.globalElementList[p.id];
                        if (p instanceof exports.Pulley) {
                            var pulleyNodePosition = "center";
                            if (positionsEqual(currentMousePos, { x: p.pos.x - p.radius, y: p.pos.y })) {
                                pulleyNodePosition = "left";
                            }
                            else if (positionsEqual(currentMousePos, { x: p.pos.x + p.radius, y: p.pos.y })) {
                                pulleyNodePosition = "right";
                            }
                            function showMovePreview() {
                                exports.ctx.beginPath();
                                exports.ctx.strokeStyle = "#AAA";
                                exports.ctx.lineWidth = 3;
                                exports.ctx.arc(currentMousePos.x + (pulleyNodePosition === "left" ? p.radius : (pulleyNodePosition === "right" ? -p.radius : 0)), currentMousePos.y, p.radius, 0, 2 * Math.PI);
                                exports.ctx.stroke();
                            }
                            functionsToRender.push(showMovePreview);
                            function removeListeners() {
                                p.move(pulleyNodePosition, getSnappedPos(currentMousePos));
                                exports.globalElementList[p.id] = p;
                                functionsToRender = functionsToRender.filter(item => item !== showMovePreview);
                            }
                            removeListenerFunctions.push(removeListeners);
                            moveEdits.push({
                                type: "move",
                                target: p,
                                oldPosition: { x: p.pos.x, y: p.pos.y },
                                newPosition: getSnappedPos(currentMousePos),
                                node: pulleyNodePosition
                            });
                        }
                        else if (p instanceof exports.RopeSegment) {
                            var ropeNodePosition = positionsEqual(currentMousePos, p.startPos) ? "start" : "end";
                            function showMovePreview() {
                                let unmovingNode = ropeNodePosition === "start" ? "endPos" : "startPos";
                                exports.ctx.beginPath();
                                exports.ctx.moveTo(p[unmovingNode].x, p[unmovingNode].y);
                                exports.ctx.lineWidth = 3;
                                exports.ctx.strokeStyle = "#F99";
                                exports.ctx.lineTo(currentMousePos.x, currentMousePos.y);
                                exports.ctx.stroke();
                            }
                            functionsToRender.push(showMovePreview);
                            function removeListeners() {
                                p.move(ropeNodePosition, getSnappedPos(currentMousePos));
                                exports.globalElementList[p.id] = p;
                                functionsToRender = functionsToRender.filter(item => item !== showMovePreview);
                            }
                            removeListenerFunctions.push(removeListeners);
                            moveEdits.push({
                                type: "move",
                                target: p,
                                oldPosition: { x: p[ropeNodePosition === "start" ? "startPos" : "endPos"].x, y: p[ropeNodePosition === "start" ? "startPos" : "endPos"].y },
                                newPosition: getSnappedPos(currentMousePos),
                                node: ropeNodePosition
                            });
                        }
                        else if (p instanceof exports.Mass) {
                            function showMovePreview() {
                                exports.ctx.beginPath();
                                exports.ctx.lineWidth = 3;
                                exports.ctx.strokeStyle = "#AAA";
                                exports.ctx.rect(currentMousePos.x - p.dimensions.width / 2, currentMousePos.y - p.dimensions.height / 2, p.dimensions.width, p.dimensions.height);
                                exports.ctx.stroke();
                            }
                            functionsToRender.push(showMovePreview);
                            function removeListeners() {
                                p.move("center", getSnappedPos(currentMousePos));
                                exports.globalElementList[p.id] = p;
                                functionsToRender = functionsToRender.filter(item => item !== showMovePreview);
                            }
                            removeListenerFunctions.push(removeListeners);
                            moveEdits.push({
                                type: "move",
                                target: p,
                                oldPosition: { x: p.pos.x, y: p.pos.y },
                                newPosition: getSnappedPos(currentMousePos),
                                node: "center"
                            });
                        }
                    });
                    workspace.addEventListener("mouseup", () => {
                        editManager.add(...moveEdits);
                        removeListenerFunctions.forEach(f => f());
                        moveEdits = [];
                        removeListenerFunctions = [];
                    });
                }
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
    return Math.round(Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2)) / exports.snapDistance) * exports.snapDistance;
}
function getSnappedPos(pos) {
    let newX = Math.round(pos.x / exports.snapDistance) * exports.snapDistance;
    let newY = Math.round(pos.y / exports.snapDistance) * exports.snapDistance;
    return { x: newX, y: newY };
}
init();
function setID(element) {
    let id;
    do {
        id = (Math.floor(Math.random() * 1000000)).toString(); //generating a random ID from 0-999999
    } while (id in exports.globalElementList);
    element.setID(id);
    exports.globalElementList[id] = element;
}
function positionsEqual(pos1, pos2) {
    return (pos1.x === pos2.x && pos1.y === pos2.y);
}
