"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var snapDistance = 30;
const workspace = document.getElementById("workspace");
const gridCanvas = document.getElementById("grid-canvas");
var mode = 'f'; //'f' for first click     's' for second click
var firstClickPos;
var globalElementList = {};
const Pulley = require("./Pulley");
const RopeSegment = require("./RopeSegment");
const Mass = require("./Mass");
const ObjectNode = require("./ObjectNode");
// import Equation = require('./Equation')
const underscore_1 = __importDefault(require("underscore"));
var scalingHtmlElement;
var ropeLabel;
class CommandManager {
    constructor() {
        this.editStack = []; // edits that have been made, can be undone
        this.undoStack = []; // edits that have already been undone and can be redone
    }
    add(edit) {
        this.editStack.unshift(edit);
        this.undoStack = [];
    }
    undo() {
        if (this.editStack.length > 0) {
            let undone = this.editStack.shift();
            switch (undone.type) {
                case "create": {
                    let createdElement = globalElementList[undone.objectID];
                    if (!(createdElement instanceof ObjectNode)) {
                        let nodesToDelete = createdElement.delete();
                        delete globalElementList[undone.objectID];
                        nodesToDelete.forEach(node => {
                            node.delete();
                            delete globalElementList[node.id];
                        });
                        this.undoStack.unshift({
                            type: "create",
                            objectID: undone.objectID,
                            data: {
                                objectData: createdElement,
                                nodesToRender: nodesToDelete
                            }
                        });
                    }
                }
            }
        }
    }
    redo() {
        var _a, _b, _c, _d, _e;
        if (this.undoStack.length > 0) {
            let redone = this.undoStack.shift();
            switch (redone.type) {
                case "create": {
                    (_b = (_a = redone.data) === null || _a === void 0 ? void 0 : _a.objectData) === null || _b === void 0 ? void 0 : _b.render();
                    (_d = (_c = redone.data) === null || _c === void 0 ? void 0 : _c.nodesToRender) === null || _d === void 0 ? void 0 : _d.forEach(node => {
                        node.render();
                    });
                    globalElementList[redone.objectID] = (_e = redone.data) === null || _e === void 0 ? void 0 : _e.objectData;
                    this.editStack.unshift({
                        type: "create",
                        objectID: redone.objectID
                    });
                }
            }
        }
    }
}
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
var pulleyScalingFunction = (event) => {
    let mousePos = getMousePos(event);
    let radius = getSnappedDist(firstClickPos, mousePos);
    scalingHtmlElement.style.width = Math.max(2 * radius - 2, 0) + 'px';
    scalingHtmlElement.style.height = Math.max(2 * radius - 2, 0) + 'px';
    scalingHtmlElement.style.top = (firstClickPos.y - 1 - radius) + 'px';
    scalingHtmlElement.style.left = (firstClickPos.x - 1 - radius) + 'px';
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
    let xDiff;
    let yDiff;
    if (getDist(mousePos, firstClickPos) < snapDistance) {
        xDiff = 0;
        yDiff = 0;
    }
    else {
        xDiff = Math.max(Math.abs(mousePos.x - firstClickPos.x), snapDistance);
        yDiff = Math.max(Math.abs(mousePos.y - firstClickPos.y), snapDistance);
    }
    console.log(`X: ${xDiff}    Y: ${yDiff}`);
    scalingHtmlElement.style.width = Math.max(2 * xDiff - 2, 0) + 'px';
    scalingHtmlElement.style.height = Math.max(2 * yDiff - 2, 0) + 'px';
    scalingHtmlElement.style.top = firstClickPos.y - yDiff - 1 + 'px';
    scalingHtmlElement.style.left = firstClickPos.x - xDiff - 1 + 'px';
};
var radios = [...document.querySelectorAll('input[name="selected-object"]')];
radios.forEach(radio => {
    radio.onchange = () => {
        var _a;
        mode = "f";
        workspace.removeEventListener('mousemove', pulleyScalingFunction);
        workspace.removeEventListener('mousemove', massScalingFunction);
        workspace.removeEventListener('mousemove', ropeSegmentScalingFunction);
        (_a = scalingHtmlElement === null || scalingHtmlElement === void 0 ? void 0 : scalingHtmlElement.remove) === null || _a === void 0 ? void 0 : _a.call(scalingHtmlElement);
    };
});
workspace.onclick = (event) => {
    let selectedObject = document.querySelector('input[name="selected-object"]:checked').value; //getting the pulley/rope/mass type of selected-object
    let pos = getMousePos(event); // get position of mouse click
    switch (selectedObject) {
        case "pulley": {
            let mass = parseFloat(document.getElementById("mass-input").value) || 1;
            if (mode === 'f') {
                firstClickPos = pos;
                scalingHtmlElement = document.createElement("div");
                scalingHtmlElement.classList.add("scaling-pulley");
                workspace.appendChild(scalingHtmlElement);
                workspace.addEventListener('mousemove', pulleyScalingFunction);
                mode = 's';
            }
            else if (mode === 's') {
                workspace.removeEventListener('mousemove', pulleyScalingFunction);
                scalingHtmlElement.remove();
                let newPulley = new Pulley(firstClickPos, getSnappedDist(firstClickPos, pos), { mass: mass });
                setID(newPulley);
                setID(newPulley.leftNode);
                setID(newPulley.rightNode);
                setID(newPulley.centerNode);
                editManager.add({
                    type: "create",
                    objectID: newPulley.id
                });
                mode = 'f';
            }
            break;
        }
        case "rope-segment": {
            if (mode === 'f') { //placing the first node
                firstClickPos = pos;
                scalingHtmlElement = document.createElement("div");
                scalingHtmlElement.classList.add("scaling-rope-segment");
                workspace.appendChild(scalingHtmlElement);
                workspace.addEventListener("mousemove", ropeSegmentScalingFunction);
                mode = 's';
            }
            else if (mode === 's') { //first node has been placed (and is on empty space), now placing the second node of rope segment
                workspace.removeEventListener("mousemove", ropeSegmentScalingFunction);
                scalingHtmlElement.remove();
                let newRopeSegment = new RopeSegment({
                    startX: firstClickPos.x,
                    startY: firstClickPos.y,
                    endX: pos.x,
                    endY: pos.y
                });
                setID(newRopeSegment);
                setID(newRopeSegment.startNode);
                setID(newRopeSegment.endNode);
                editManager.add({
                    type: "create",
                    objectID: newRopeSegment.id,
                });
                mode = 'f';
            }
            break;
        }
        case "mass": {
            let mass = parseFloat(document.getElementById("mass-input").value) || 1;
            if (mode === 'f') { //placing the mass
                firstClickPos = pos;
                scalingHtmlElement = document.createElement("div");
                scalingHtmlElement.classList.add("scaling-mass");
                workspace.appendChild(scalingHtmlElement);
                workspace.addEventListener("mousemove", massScalingFunction);
                mode = 's';
            }
            else if (mode === 's') { //second click is done to size the mass
                workspace.removeEventListener('mousemove', massScalingFunction);
                scalingHtmlElement.remove();
                let xDiff = Math.abs(firstClickPos.x - pos.x);
                let yDiff = Math.abs(firstClickPos.y - pos.y);
                if (xDiff !== 0 && yDiff !== 0) {
                    let newMass = new Mass(firstClickPos, { width: xDiff * 2, height: yDiff * 2 }, mass);
                    setID(newMass);
                    setID(newMass.centerNode);
                    editManager.add({
                        type: "create",
                        objectID: newMass.id
                    });
                }
                mode = 'f';
            }
            break;
        }
        case "fix-node": {
            let nodes = getNodesAtPos(pos); //getting all the nodes that have the same position as "pos"
            nodes.forEach(node => { node.fixNode(); });
        }
    }
};
workspace.onmousedown = (event) => {
    let selectedObject = document.querySelector('input[name="selected-object"]:checked').value; //getting the pulley/rope/mass type of selected-object
    let pos = getMousePos(event);
    if (selectedObject === "move-node") {
        let nodes = getNodesAtPos(pos);
        let currentSnappedPos = pos;
        function moveListener(moveEvent) {
            if (getMousePos(moveEvent).x !== currentSnappedPos.x || getMousePos(moveEvent).y !== currentSnappedPos.y) {
                nodes.forEach(node => {
                    node.move(getMousePos(moveEvent), false);
                });
                currentSnappedPos = getMousePos(moveEvent);
            }
        }
        function mouseupListener(mouseupEvent) {
            workspace.removeEventListener("mousemove", moveListener);
            workspace.removeEventListener("mouseup", mouseupListener);
        }
        workspace.addEventListener("mousemove", moveListener);
        workspace.addEventListener("mouseup", mouseupListener);
    }
};
function setID(element) {
    let id;
    do {
        id = (Math.floor(Math.random() * 1000000)).toString(); //generating a random ID from 0-999999
    } while (id in globalElementList);
    element.setID(id);
    globalElementList[id] = element;
}
function getMousePos(evt) {
    var rect = workspace.getBoundingClientRect();
    return {
        x: Math.round((evt.clientX - rect.left) / snapDistance) * snapDistance,
        y: Math.round((evt.clientY - rect.top) / snapDistance) * snapDistance
    };
}
function getDist(pos1, pos2) {
    return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
}
function getSnappedDist(pos1, pos2) {
    var unsnappedDist = Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    return Math.round(unsnappedDist / snapDistance) * snapDistance;
}
function getNodesAtPos(pos) {
    let allObjects = Object.values(globalElementList);
    return allObjects.filter((item) => {
        return (item instanceof ObjectNode && underscore_1.default.isEqual(item.pos, pos));
    });
}
function getRopeSegments() {
    let allObjects = Object.values(globalElementList);
    return allObjects.filter((item) => {
        return (item instanceof RopeSegment);
    });
}
function getPulleys() {
    let allObjects = Object.values(globalElementList);
    return allObjects.filter((item) => {
        return (item instanceof Pulley);
    });
}
function getMasses() {
    let allObjects = Object.values(globalElementList);
    return allObjects.filter((item) => {
        return (item instanceof Mass);
    });
}
function setTensionIDsOfLinkedRopeSegments(ropeSegment1, ropeNumber) {
    for (let pulley of getPulleys()) { //iterate over all pulleys
        if (ropeSegment1.loopsAround(pulley)) {
            for (let ropeSegment2 of getRopeSegments()) {
                if (ropeSegment2.ropeNumber === undefined && ropeSegment2.loopsAround(pulley)) {
                    ropeSegment2.ropeNumber = ropeNumber;
                    setTensionIDsOfLinkedRopeSegments(ropeSegment2, ropeNumber);
                }
            }
        }
    }
}
function clearNumberings() {
    for (let ropeSegment of getRopeSegments()) {
        ropeSegment.ropeNumber = undefined;
        ropeSegment.ropeLabel.innerText = undefined;
    }
    for (let mass of getMasses()) {
        mass.massNumber = undefined;
        mass.htmlElement.innerText = undefined;
    }
    for (let pulley of getPulleys()) {
        pulley.pulleyNumber = undefined;
        pulley.pulleyLabel.innerText = undefined;
    }
}
function calculate() {
    //     clearNumberings()
    //     let ropeCount: number = 0
    //     let massCount: number = 0
    //     let pulleyCount: number = 0
    // 
    //     for (let ropeSegment of getRopeSegments()) {
    //         if (ropeSegment.ropeNumber === undefined) {
    //             ropeCount++
    //             ropeSegment.ropeNumber = ropeCount
    //             ropeSegment.ropeLabel.innerText = 'T' + ropeSegment.ropeNumber.toString();
    //             setTensionIDsOfLinkedRopeSegments(ropeSegment, ropeCount)
    //         }
    //         ropeSegment.ropeLabel.innerText = 'T' + ropeSegment.ropeNumber.toString();
    //     }
    // 
    // 
    //     //TODO: need to fix pulleys and masses if their centers are connected to a ropesegment that has a fixed node
    // 
    //     for (let mass of getMasses()) { //labeling the masses (m1, m2, etc.)
    //         massCount++
    //         mass.massNumber = massCount
    //         mass.htmlElement.innerText = 'm' + mass.massNumber.toString()
    //     }
    // 
    //     for (let pulley of getPulleys()) {//labeling the pulleys (P1, P2, etc.)
    //         pulleyCount++
    //         pulley.pulleyNumber = pulleyCount
    //         pulley.pulleyLabel.innerText = 'P' + pulley.pulleyNumber.toString()
    //     }
    // 
    //     let dim = ropeCount + massCount + pulleyCount //1 F=ma equation for each mass. 1 F=ma equation for each pulley. 1 string conservation equaiton for each rope
    //     let EQNs: Equation[] = [] //holds the equations of motion in string form
    //     let A = Matrix.zeros(dim, dim)
    //     let x = [] //holds the unknowns (acceleration of pulleys, acceleration of masses, tension in ropes)
    //     let b = []
    // 
    //     //generating equations of motion for masses
    //     for (let mass of getMasses()) {
    //         let EQN: Equation = new Equation();
    //         let unknown: string = `a_m${mass.massNumber}`
    //         x.push(unknown)
    // 
    //         if (!(mass.fixed || mass.mass == 0)) {
    //             EQN.addTerm(-mass.mass, unknown)
    //             EQN.b = mass.mass * 9.81
    //         }
    // 
    //         let visitedRopes: number[] = []
    //         for (let ropeSegment of getRopeSegments()) {
    //             if (!visitedRopes.includes(ropeSegment.ropeNumber)) { // dont double count the tension due to multiple rope segments that make up the same rope
    //                 if (ropeSegment.pullsStraightUpOn(mass)) {
    //                     EQN.addTerm(1, `T${ropeSegment.ropeNumber}`)
    //                     visitedRopes.push(ropeSegment.ropeNumber)
    //                 }
    //                 else if (ropeSegment.pullsStraightDownOn(mass)) {
    //                     EQN.addTerm(-1, `T${ropeSegment.ropeNumber}`)
    //                     visitedRopes.push(ropeSegment.ropeNumber)
    // 
    //                 }
    //             }
    //         }
    //         EQNs.push(EQN)
    //     }
    // 
    //     //generating equations of motion for pulleys
    //     for (let pulley of getPulleys()) {
    //         let EQN: Equation = new Equation();
    //         let unknown: string = `a_P${pulley.pulleyNumber}`
    //         x.push(unknown)
    // 
    //         if (!pulley.fixed) {
    //             EQN.addTerm(-pulley.mass, unknown)
    //             EQN.b = pulley.mass * 9.81
    //         }
    // 
    //         let visitedRopes: number[] = []
    //         for (let ropeSegment of getRopeSegments()) {
    //             if (!visitedRopes.includes(ropeSegment.ropeNumber)) { // dont double count the tension due to multiple rope segments that make up the same rope
    //                 if (ropeSegment.loopsUpAround(pulley)) {
    //                     EQN.addTerm(2, ropeSegment.ropeLabel.innerText)
    //                     visitedRopes.push(ropeSegment.ropeNumber)
    //                 }
    //                 else if (ropeSegment.loopsDownAround(pulley)) {
    //                     EQN.addTerm(-2, ropeSegment.ropeLabel.innerText)
    //                     visitedRopes.push(ropeSegment.ropeNumber)
    //                 }
    //                 else if (ropeSegment.pullsStraightUpOn(pulley)) {
    //                     EQN.addTerm(1, ropeSegment.ropeLabel.innerText)
    //                     visitedRopes.push(ropeSegment.ropeNumber)
    //                 }
    //                 else if (ropeSegment.pullsStraightDownOn(pulley)) {
    //                     EQN.addTerm(-1, ropeSegment.ropeLabel.innerText)
    //                     visitedRopes.push(ropeSegment.ropeNumber)
    //                 }
    //             }
    //         }
    //         EQNs.push(EQN)
    //     }
    // 
    //     //generating the conservation of string equations
    //     for (let i = 1; i <= ropeCount; i++) {
    //         let EQN: Equation = new Equation();
    //         let unknown: string = `T${i}`
    //         EQN.b = 0
    //         x.push(unknown)
    // 
    //         let visitedPulleys: number[] = []
    //         let visitedMasses: number[] = []
    // 
    //         for (let ropeSegment of getRopeSegments()) {
    //             if (ropeSegment.ropeNumber == i) { // only consider the rope segments that make up the same greater rope
    //                 for (let pulley of getPulleys()) {
    //                     if (!visitedPulleys.includes(pulley.pulleyNumber)) { // dont double count the pulley acceleration due to multiple rope segments that make up the same rope
    //                         if (ropeSegment.loopsUpAround(pulley)) {
    //                             EQN.addTerm(2, `a_P${pulley.pulleyNumber}`)
    //                             visitedPulleys.push(pulley.pulleyNumber)
    //                         }
    //                         else if (ropeSegment.loopsDownAround(pulley)) {
    //                             EQN.addTerm(-2, `a_P${pulley.pulleyNumber}`)
    //                             visitedPulleys.push(pulley.pulleyNumber)
    //                         }
    //                         else if (ropeSegment.pullsStraightUpOn(pulley)) {
    //                             EQN.addTerm(1, `a_P${pulley.pulleyNumber}`)
    //                             visitedPulleys.push(pulley.pulleyNumber)
    //                         }
    //                         else if (ropeSegment.pullsStraightDownOn(pulley)) {
    //                             EQN.addTerm(-1, `a_P${pulley.pulleyNumber}`)
    //                             visitedPulleys.push(pulley.pulleyNumber)
    //                         }
    //                     }
    //                 }
    // 
    //                 for (let mass of getMasses()) {
    //                     if (!visitedMasses.includes(mass.massNumber)) { // dont double count the mass acceleration due to multiple rope segments that make up the same rope
    //                         if (ropeSegment.pullsStraightUpOn(mass)) {
    //                             EQN.addTerm(1, `a_m${mass.massNumber}`)
    //                             visitedMasses.push(mass.massNumber)
    //                         }
    //                         else if (ropeSegment.pullsStraightDownOn(mass)) {
    //                             EQN.addTerm(-1, `a_m${mass.massNumber}`)
    //                             visitedMasses.push(mass.massNumber)
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //         EQNs.push(EQN)
    //     }
    // 
    //     //filling out the A matrix
    //     for (let i = 0; i < dim; i++) {
    //         for (let j = 0; j < dim; j++) {
    //             A.set(i, j, EQNs[i].coeffDict[x[j]] ?? 0); //if the qeuaiton sdeosnt have the unknown, set its coeff to 0 in the A matrix
    //         }
    //         b.push(EQNs[i].b)
    //         console.log(EQNs[i].toString())
    //     }
    // 
    //     //solving the system
    //     let b_vector = Matrix.columnVector(b)
    //     let solved_x = solve(A, b_vector)
    //     for (let i = 0; i < dim; i++) {
    //         console.log(`${x[i]} = ${solved_x.get(i, 0)}`)
    //     }
    // 
    //     /*for(let unknown of x){
    //         for(let object in [...getMasses(), ...getPulleys()]){
    //         }
    //     }*/
    //     console.dir(x)
    //     console.dir([...getMasses(), ...getPulleys()])
    // 
    // 
    //     
    //     // getMasses().filter(item => massNumber === num)[0]
}
document.getElementById("calculate-button").onclick = calculate;
function animate() {
}
document.getElementById("animate").onclick = animate;
