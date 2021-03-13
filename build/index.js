"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workspace = document.getElementById("workspace");
var mode = 'a'; //'a' for anchoring     's' for sizing   'n' for sizing after first selecting a node
var firstClickPos, firstClickNode;
var globalIDList = {};
var connectionList = [];
const Pulley = require("./Pulley");
const RopeSegment = require("./RopeSegment");
const Mass = require("./Mass");
var scalingHtmlElement;
var pulleyScalingFunction = (event) => {
    let mousePos = getMousePos(event);
    let radius = getDist(firstClickPos, mousePos);
    scalingHtmlElement.style.width = radius * 2 + 'px';
    scalingHtmlElement.style.height = radius * 2 + 'px';
    scalingHtmlElement.style.top = (firstClickPos.y - radius) + 'px';
    scalingHtmlElement.style.left = (firstClickPos.x - radius) + 'px';
};
var ropeSegmentScalingFunction = (event) => {
    let mousePos = getMousePos(event);
    let length = getDist(firstClickPos, mousePos);
    let xDiff = firstClickPos.x - mousePos.x;
    let yDiff = firstClickPos.y - mousePos.y;
    let angle = 180 / Math.PI * Math.acos(yDiff / length);
    if (xDiff > 0) {
        angle *= -1;
    }
    if (mousePos.y > firstClickPos.y) {
        var top = (mousePos.y - firstClickPos.y) / 2 + firstClickPos.y;
    }
    else {
        var top = (firstClickPos.y - mousePos.y) / 2 + mousePos.y;
    }
    top -= length / 2;
    if (mousePos.x > firstClickPos.x) {
        var left = (mousePos.x - firstClickPos.x) / 2 + firstClickPos.x;
    }
    else {
        var left = (firstClickPos.x - mousePos.x) / 2 + mousePos.x;
    }
    scalingHtmlElement.style.height = length + 'px';
    scalingHtmlElement.style.top = top + 'px';
    scalingHtmlElement.style.left = (left - 1) + 'px';
    scalingHtmlElement.style.transform = `rotate(${angle}deg)`;
};
var massScalingFunction = (event) => {
    let mousePos = getMousePos(event);
    let xDiff = Math.abs(mousePos.x - firstClickPos.x);
    let yDiff = Math.abs(mousePos.y - firstClickPos.y);
    scalingHtmlElement.style.width = Math.max(xDiff, yDiff) + 'px';
    scalingHtmlElement.style.height = Math.max(xDiff, yDiff) + 'px';
    scalingHtmlElement.style.top = Math.min(mousePos.y, firstClickPos.y) + 'px';
    scalingHtmlElement.style.left = Math.min(mousePos.x, firstClickPos.x) + 'px';
};
workspace.onclick = (event) => {
    var _a, _b;
    let selectedObject = document.querySelector('input[name="selected-object"]:checked').value; //getting the pulley/rope/mass type of selected-object
    let pos = getMousePos(event); // get position of mouse click
    let clickedOnNode = event.target.classList.contains("object-node"); // boolean: did the user click on a node (True) or on empty space (False)
    let targetNodeID = (_a = event.target.dataset.ID) !== null && _a !== void 0 ? _a : null; //unique id of the node
    switch (selectedObject) {
        case "pulley": {
            let mass = parseFloat(document.getElementById("mass-input").value);
            if (mode === 'a') {
                firstClickPos = pos;
                mode = 's';
                scalingHtmlElement = document.createElement("div");
                scalingHtmlElement.classList.add("scaling-pulley");
                workspace.appendChild(scalingHtmlElement);
                workspace.addEventListener('mousemove', pulleyScalingFunction);
            }
            else if (mode === 's') {
                workspace.removeEventListener('mousemove', pulleyScalingFunction);
                scalingHtmlElement.remove();
                let createdElement = new Pulley(firstClickPos, getDist(firstClickPos, pos), { mass: mass });
                mode = 'a';
                setID(createdElement);
                setID(createdElement.leftNode);
                setID(createdElement.rightNode);
                setID(createdElement.centerNode);
            }
            break;
        }
        case "rope-segment": {
            if (mode === 'a') { //placing the first node
                if (clickedOnNode) { //placing on existing node
                    firstClickNode = globalIDList[targetNodeID];
                    firstClickPos = { x: firstClickNode.x, y: firstClickNode.y };
                    mode = 'n';
                    scalingHtmlElement = document.createElement("div");
                    scalingHtmlElement.classList.add("scaling-rope-segment");
                    workspace.appendChild(scalingHtmlElement);
                    workspace.addEventListener("mousemove", ropeSegmentScalingFunction);
                }
                else { //create new node on empty space
                    firstClickPos = pos;
                    mode = 's';
                    scalingHtmlElement = document.createElement("div");
                    scalingHtmlElement.classList.add("scaling-rope-segment");
                    workspace.appendChild(scalingHtmlElement);
                    workspace.addEventListener("mousemove", ropeSegmentScalingFunction);
                }
            }
            else if (mode === 's') { //first node has been placed (and is on empty space), now placing the second node of rope segment
                workspace.removeEventListener("mousemove", ropeSegmentScalingFunction);
                scalingHtmlElement.remove();
                if (clickedOnNode) { // second node is on an existing node
                    let newSegment = new RopeSegment({
                        startX: firstClickPos.x,
                        startY: firstClickPos.y,
                        endNode: globalIDList[targetNodeID]
                    });
                    setID(newSegment);
                    setID(newSegment.startNode);
                }
                else { //second node is on empty space
                    let newSegment = new RopeSegment({
                        startX: firstClickPos.x,
                        startY: firstClickPos.y,
                        endX: pos.x,
                        endY: pos.y
                    });
                    setID(newSegment);
                    setID(newSegment.startNode);
                    setID(newSegment.endNode);
                }
                mode = 'a';
            }
            else if (mode === 'n') { // first node has been placed (and is on a preexisting node), now placing second node of rope segment
                workspace.removeEventListener("mousemove", ropeSegmentScalingFunction);
                scalingHtmlElement.remove();
                if (clickedOnNode) { // second node is on existing node
                    let newSegment = new RopeSegment({
                        startNode: firstClickNode,
                        endNode: globalIDList[targetNodeID]
                    });
                    setID(newSegment);
                }
                else { // second node is on empty space
                    let newSegment = new RopeSegment({
                        endX: pos.x,
                        endY: pos.y,
                        startNode: firstClickNode
                    });
                    setID(newSegment);
                    setID(newSegment.endNode);
                }
                mode = 'a';
            }
            break;
        }
        case "mass": {
            let mass = (_b = parseFloat(document.getElementById("mass-input").value)) !== null && _b !== void 0 ? _b : 0;
            if (mode === 'a') { //placing the mass
                firstClickPos = pos;
                mode = 's';
                scalingHtmlElement = document.createElement("div");
                scalingHtmlElement.classList.add("scaling-mass");
                workspace.appendChild(scalingHtmlElement);
                workspace.addEventListener('mousemove', massScalingFunction);
            }
            else if (mode === 's') { //second click is done to size the mass
                workspace.removeEventListener('mousemove', massScalingFunction);
                scalingHtmlElement.remove();
                let xDiff = Math.abs(firstClickPos.x - pos.x);
                let yDiff = Math.abs(firstClickPos.y - pos.y);
                let createdElement = new Mass({ x: Math.min(firstClickPos.x, pos.x), y: Math.min(firstClickPos.y, pos.y) }, Math.max(xDiff, yDiff), mass);
                setID(createdElement);
                mode = 'a';
            }
        }
    }
};
function setID(element) {
    let id;
    do {
        id = (Math.floor(Math.random() * 1000000)).toString(); //generating a random ID from 0-999999
    } while (id in globalIDList);
    element.setID(id);
    globalIDList[id] = element;
}
function getMousePos(evt) {
    var rect = workspace.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function getDist(pos1, pos2) {
    return (Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2)));
}
