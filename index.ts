type Position = {
    x: number,
    y: number
}

type SimulationObject = RopeSegment | Pulley | Mass

type IDList = Record<string, SimulationObject | ObjectNode>

var snapDistance = 30

const workspace: HTMLElement = document.getElementById("workspace")!
const gridCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("grid-canvas")!
var mode: string = 'f' //'f' for first click     's' for second click
var firstClickPos: Position
var globalElementList: IDList = {}
var ropeCount: number = 0
var massCount: number = 0
var pulleyCount: number = 0

import Pulley = require('./Pulley')
import RopeSegment = require('./RopeSegment')
import Mass = require('./Mass')
import ObjectNode = require('./ObjectNode')
import _, { create, invert } from "underscore"
import { Matrix, solve} from 'ml-matrix'

var scalingHtmlElement: HTMLElement
var ropeLabel: HTMLElement

type Edit = {
    type: "create" | "delete" | "move",
    objectID: string,
    data?: {
        objectData?: SimulationObject,
        nodesToRender?: ObjectNode[]
    }
}

interface CommandManager {
    editStack: Edit[],
    undoStack: Edit[]
}

class CommandManager {
    constructor() {
        this.editStack = [] // edits that have been made, can be undone
        this.undoStack = [] // edits that have already been undone and can be redone
    } 

    add(edit: Edit) {
        this.editStack.unshift(edit)
        this.undoStack = []
    }

    undo() {
        if (this.editStack.length > 0) {
            let undone = this.editStack.shift()!

            switch(undone.type) {
                case "create": {
                    let createdElement = globalElementList[undone.objectID]

                    if (!(createdElement instanceof ObjectNode)) {
                        let nodesToDelete = createdElement.delete()
                        delete globalElementList[undone.objectID]
                        nodesToDelete.forEach(node => {
                            node.delete()
                            delete globalElementList[node.id]
                        })
                        this.undoStack.unshift({
                            type: "create",
                            objectID: undone.objectID,
                            data: {
                                objectData: createdElement,
                                nodesToRender: nodesToDelete
                            }
                        })
                    }
                }
                
            }
        }
    }

    redo() {
        if(this.undoStack.length > 0) {
            let redone = this.undoStack.shift()!

            switch (redone.type) {
                case "create": {
                    redone.data?.objectData?.render()
                    redone.data?.nodesToRender?.forEach(node => {
                        node.render()
                    })
                    globalElementList[redone.objectID] = redone.data?.objectData!
                    this.editStack.unshift({
                        type: "create",
                        objectID: redone.objectID
                    })
                }
            }
        }
    }
}

const editManager = new CommandManager()

document.getElementById("undo")!.onclick = () => {
    editManager.undo()
}

document.getElementById("redo")!.onclick = () => {
    editManager.redo()
}

document.onkeyup = (e) => {
    if (e.ctrlKey && e.code === "KeyZ") {
        editManager.undo()
    } else if (e.ctrlKey && e.code === "KeyY") {
        editManager.redo()
    }
}

(function drawGrid() {
    gridCanvas.width = 1300
    gridCanvas.height = 900
    gridCanvas.style.width = 1300 + 'px'
    gridCanvas.style.height = 900 + 'px'
    let ctx: CanvasRenderingContext2D = gridCanvas.getContext("2d")!

    for (let i = 0; i < gridCanvas.width; i += snapDistance) {
        ctx.moveTo(i, 0)
        ctx.lineTo(i, gridCanvas.height)
        ctx.strokeStyle = "#e0ddd3"
        ctx.stroke()
    }

    for (let i = 0; i < gridCanvas.height; i += snapDistance) {
        ctx.moveTo(0, i)
        ctx.lineTo(gridCanvas.width, i)
        ctx.strokeStyle = "#e0ddd3"
        ctx.stroke()
    }
})()

var pulleyScalingFunction = (event: MouseEvent) => {
    let mousePos = getMousePos(event)
    let radius = getSnappedDist(firstClickPos, mousePos)
    scalingHtmlElement.style.width = (2 * radius - 2) + 'px'
    scalingHtmlElement.style.height = (2 * radius - 2) + 'px'
    scalingHtmlElement.style.top = (firstClickPos.y - 1 - radius) + 'px'
    scalingHtmlElement.style.left = (firstClickPos.x - 1 - radius) + 'px'
}

var ropeSegmentScalingFunction = (event: MouseEvent) => {
    let mousePos = getMousePos(event)
    let length = getDist(firstClickPos, mousePos)
    let xDiff = firstClickPos.x - mousePos.x
    let yDiff = firstClickPos.y - mousePos.y
    let angle = 180 / Math.PI * Math.acos(yDiff / length)

    if (xDiff > 0) {
        angle *= -1
    }

    if (mousePos.y > firstClickPos.y) {
        var top = (mousePos.y - firstClickPos.y) / 2 + firstClickPos.y;
    } else {
        var top = (firstClickPos.y - mousePos.y) / 2 + mousePos.y;
    }
    top -= length / 2

    if (mousePos.x > firstClickPos.x) {
        var left = (mousePos.x - firstClickPos.x) / 2 + firstClickPos.x;
    } else {
        var left = (firstClickPos.x - mousePos.x) / 2 + mousePos.x;
    }

    scalingHtmlElement.style.height = length + 'px'
    scalingHtmlElement.style.top = top + 'px'
    scalingHtmlElement.style.left = (left - 1) + 'px'
    scalingHtmlElement.style.transform = `rotate(${angle}deg)`
}

var massScalingFunction = (event: MouseEvent) => {
    let mousePos = getMousePos(event)
    let xDiff
    let yDiff
    if (getDist(mousePos, firstClickPos) < snapDistance / 2) {
        xDiff = 0
        yDiff = 0
    } else {
        xDiff = Math.max(Math.abs(mousePos.x - firstClickPos.x), snapDistance)
        yDiff = Math.max(Math.abs(mousePos.y - firstClickPos.y), snapDistance)
    }
    scalingHtmlElement.style.width = 2 * xDiff - 2 + 'px'
    scalingHtmlElement.style.height = 2 * yDiff - 2 + 'px'
    scalingHtmlElement.style.top = firstClickPos.y - yDiff - 1 + 'px'
    scalingHtmlElement.style.left = firstClickPos.x - xDiff - 1 + 'px'
}

workspace.onclick = (event: MouseEvent) => {
    let selectedObject: string = (<HTMLInputElement>document.querySelector('input[name="selected-object"]:checked')).value //getting the pulley/rope/mass type of selected-object
    let pos = getMousePos(event) // get position of mouse click

    switch (selectedObject) {
        case "pulley": {
            let mass = parseFloat((<HTMLInputElement>document.getElementById("mass-input")).value)
            if (mode === 'f') {
                firstClickPos = pos

                scalingHtmlElement = document.createElement("div")
                scalingHtmlElement.classList.add("scaling-pulley")
                workspace.appendChild(scalingHtmlElement)
                workspace.addEventListener('mousemove', pulleyScalingFunction)

                mode = 's'
            } else if (mode === 's') {
                workspace.removeEventListener('mousemove', pulleyScalingFunction)
                scalingHtmlElement.remove()

                let newPulley = new Pulley(firstClickPos, getSnappedDist(firstClickPos, pos), { mass: mass })

                setID(newPulley)
                setID(newPulley.leftNode)
                setID(newPulley.rightNode)
                setID(newPulley.centerNode)

                editManager.add({
                    type: "create",
                    objectID: newPulley.id
                })

                mode = 'f'
            }
            break
        }
        case "rope-segment": {
            if (mode === 'f') { //placing the first node
                firstClickPos = pos

                scalingHtmlElement = document.createElement("div")
                scalingHtmlElement.classList.add("scaling-rope-segment")
                workspace.appendChild(scalingHtmlElement)
                workspace.addEventListener("mousemove", ropeSegmentScalingFunction)

                mode = 's'
            } else if (mode === 's') { //first node has been placed (and is on empty space), now placing the second node of rope segment
                workspace.removeEventListener("mousemove", ropeSegmentScalingFunction)
                scalingHtmlElement.remove()

                let newRopeSegment = new RopeSegment({
                    startX: firstClickPos.x,
                    startY: firstClickPos.y,
                    endX: pos.x,
                    endY: pos.y
                })

                setID(newRopeSegment)
                setID(newRopeSegment.startNode)
                setID(newRopeSegment.endNode)

                editManager.add({
                    type: "create",
                    objectID: newRopeSegment.id,
                })
                //connectionList.push({ upperNode: ((newSegment.endNode.y > newSegment.startNode.y) ? newSegment.startNode : newSegment.endNode), lowerNode: ((newSegment.endNode.y > newSegment.startNode.y) ? newSegment.endNode : newSegment.startNode) })
                //console.dir(connectionList)
                mode = 'f'
            }
            break
        }
        case "mass": {
            let mass = parseFloat((<HTMLInputElement>document.getElementById("mass-input")).value) ?? 0
            if (mode === 'f') { //placing the mass
                firstClickPos = pos

                scalingHtmlElement = document.createElement("div")
                scalingHtmlElement.classList.add("scaling-mass")
                workspace.appendChild(scalingHtmlElement)
                workspace.addEventListener("mousemove", massScalingFunction)

                mode = 's'
            } else if (mode === 's') { //second click is done to size the mass
                workspace.removeEventListener('mousemove', massScalingFunction)
                scalingHtmlElement.remove()

                let xDiff = Math.abs(firstClickPos.x - pos.x)
                let yDiff = Math.abs(firstClickPos.y - pos.y)
                if (xDiff !== 0 && yDiff !== 0) {
                    let newMass = new Mass(firstClickPos, { width: xDiff * 2, height: yDiff * 2 }, mass)

                    setID(newMass)
                    setID(newMass.centerNode)

                    editManager.add({
                        type: "create",
                        objectID: newMass.id
                    })
                }

                mode = 'f'
            }
            break
        }
        case "fix-node": {
            let nodes = getNodesAtPos(pos) //getting all the nodes that have the same position as "pos"
            nodes.forEach(node => { node.fixNode() })
        }
    }
    //console.log(Object.keys(globalElementList).length)
    //console.dir(globalElementList)
}

function setID(element: SimulationObject | ObjectNode) {
    let id: string
    do {
        id = (Math.floor(Math.random() * 1000000)).toString() //generating a random ID from 0-999999
    } while (id in globalElementList)
    element.setID(id)
    globalElementList[id] = element
}

function getMousePos(evt: MouseEvent) {
    var rect = workspace.getBoundingClientRect()
    return {
        x: Math.round((evt.clientX - rect.left) / snapDistance) * snapDistance,
        y: Math.round((evt.clientY - rect.top) / snapDistance) * snapDistance
    }
}

function getDist(pos1: Position, pos2: Position) {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
}

function getSnappedDist(pos1: Position, pos2: Position) {
    var unsnappedDist = Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
    return Math.round(unsnappedDist / snapDistance) * snapDistance
}

function getNodesAtPos(pos: Position) {
    let allObjects = Object.values(globalElementList)
    return (<Array<ObjectNode>>allObjects.filter((item) => {
        return (item instanceof ObjectNode && _.isEqual(item.pos, pos))
    }))
}

function getRopeSegments() {
    let allObjects = Object.values(globalElementList)
    return (<Array<RopeSegment>>allObjects.filter((item) => {
        return (item instanceof RopeSegment)
    }))
}

function getPulleys() {
    let allObjects = Object.values(globalElementList)
    return (<Array<Pulley>>allObjects.filter((item) => {
        return (item instanceof Pulley)
    }))
}

function getMasses() {
    let allObjects = Object.values(globalElementList)
    return (<Array<Mass>>allObjects.filter((item) => {
        return (item instanceof Mass)
    }))
}

function setTensionIDsOfLinkedRopeSegments(ropeSegment1: RopeSegment, ropeNumber: number) {
    for (let pulley of getPulleys()) { //iterate over all pulleys
        if (ropeSegment1.loopsAround(pulley)) {
            for (let ropeSegment2 of getRopeSegments()) {
                if (ropeSegment2.ropeNumber === undefined && ropeSegment2.loopsAround(pulley)) {
                    ropeSegment2.ropeNumber = ropeNumber
                    setTensionIDsOfLinkedRopeSegments(ropeSegment2, ropeNumber)
                }
            }
        }
    }
}

function labelRopes() {    //labeling the ropes (T1, T2, etc.)
    for (let ropeSegment of getRopeSegments()) {
        if (ropeSegment.ropeNumber === undefined) {
            ropeCount++
            ropeSegment.ropeNumber = ropeCount
            ropeSegment.ropeLabel.innerText = 'T' + ropeSegment.ropeNumber.toString();
            setTensionIDsOfLinkedRopeSegments(ropeSegment, ropeCount)
        }
        ropeSegment.ropeLabel.innerText = 'T' + ropeSegment.ropeNumber.toString();
    }
}

function labelMasses(){    //labeling the masses (m1, m2, etc.)
    for (let mass of getMasses()) {
        massCount++
        mass.massNumber = massCount
        mass.htmlElement.innerText = 'm' + mass.massNumber.toString()
    }
}

function labelPulleys(){    //labeling the pulleys (P1, P2, etc.)
    for (let pulley of getPulleys()) {
        pulleyCount++
        pulley.pulleyNumber = pulleyCount
        pulley.pulleyLabel.innerText = 'P' + pulley.pulleyNumber.toString()
    }
}

function calculate() {
    labelRopes()

    //TODO: need to fix pulleys and masses if their centers are connected to a ropesegment that has a fixed node
    
    labelMasses()
    labelPulleys()

    let EOMs = [] //holds the equations of motion in string form
    let dim = ropeCount + massCount + pulleyCount //1 F=ma equation for each mass. 1 F=ma equation for each pulley. 1 string conservation equaiton for each rope
    let A = Matrix.zeros(dim, dim)
    let x = [] //holds the unknowns (acceleration of pulleys, acceleration of masses, tension in ropes)
    let b = []

    //generating equations of motion for masses
    for (let mass of getMasses()) {
        let LHS = ``//left hand side 
        let RHS = ``//right hand side 
        x.push(`a_m${mass.massNumber}`)

        if (!(mass.fixed || mass.mass == 0)) {
            LHS = `${-mass.mass}*a_m${mass.massNumber}`
            RHS = `${mass.mass * 9.81}`
            b.push(mass.mass * 9.81)
        }

        let visitedRopes: number[] = []
        for (let ropeSegment of getRopeSegments()) {
            if (!visitedRopes.includes(ropeSegment.ropeNumber)) { // dont double count the tension due to multiple rope segments that make up the same rope
                if (ropeSegment.pullsStraightUpOn(mass)) {
                    LHS += ` +1*T${ropeSegment.ropeNumber}`
                    visitedRopes.push(ropeSegment.ropeNumber)

                }
                else if (ropeSegment.pullsStraightDownOn(mass)) {
                    LHS += ` -1*T${ropeSegment.ropeNumber}`
                    visitedRopes.push(ropeSegment.ropeNumber)

                }
            }
        }
        EOMs.push(`${LHS} = ${RHS}`)
    }

    //generating equations of motion for pulleys
    for (let pulley of getPulleys()) {
        let LHS = ` ${-pulley.mass}*a_P${pulley.pulleyNumber}` //left hand side 
        let RHS = `${pulley.mass * 9.81}` //right hand side
        x.push(`a_P${pulley.pulleyNumber}`)
        b.push(pulley.mass * 9.81)

        let visitedRopes: number[] = []
        for (let ropeSegment of getRopeSegments()) {
            if (!visitedRopes.includes(ropeSegment.ropeNumber)) { // dont double count the tension due to multiple rope segments that make up the same rope
                if (ropeSegment.loopsUpAround(pulley)) {
                    LHS += ` +2*${ropeSegment.ropeLabel.innerText}`
                    visitedRopes.push(ropeSegment.ropeNumber)
                }
                else if (ropeSegment.loopsDownAround(pulley)) {
                    LHS += ` -2*${ropeSegment.ropeLabel.innerText}`
                    visitedRopes.push(ropeSegment.ropeNumber)
                }
                else if (ropeSegment.pullsStraightUpOn(pulley)) {
                    LHS += ` +1*${ropeSegment.ropeLabel.innerText}`
                    visitedRopes.push(ropeSegment.ropeNumber)
                }
                else if (ropeSegment.pullsStraightDownOn(pulley)) {
                    LHS += ` -1*${ropeSegment.ropeLabel.innerText}`
                    visitedRopes.push(ropeSegment.ropeNumber)
                }
            }
        }
        EOMs.push(`${LHS} = ${RHS}`)
    }

    //generating the conservation of string equations
    for (let i = 1; i <= ropeCount; i++) {
        let LHS = ``//left hand side 
        let RHS = `0`//right hand side
        x.push(`T${i}`)
        b.push(0)

        let visitedPulleys: number[] = []
        let visitedMasses: number[] = []

        for (let ropeSegment of getRopeSegments()) {
            if (ropeSegment.ropeNumber == i) { // only consider the rope segments that make up the same greater rope
                for (let pulley of getPulleys()) {
                    if (!visitedPulleys.includes(pulley.pulleyNumber)) { // dont double count the pulley acceleration due to multiple rope segments that make up the same rope
                        if (ropeSegment.loopsUpAround(pulley)) {
                            LHS += ` +2*a_P${pulley.pulleyNumber}`
                            visitedPulleys.push(pulley.pulleyNumber)
                        }
                        else if (ropeSegment.loopsDownAround(pulley)) {
                            LHS += ` -2*a_P${pulley.pulleyNumber}`
                            visitedPulleys.push(pulley.pulleyNumber)
                        }
                        else if (ropeSegment.pullsStraightUpOn(pulley)) {
                            LHS += ` +1*a_P${pulley.pulleyNumber}`
                            visitedPulleys.push(pulley.pulleyNumber)
                        }
                        else if (ropeSegment.pullsStraightDownOn(pulley)) {
                            LHS += ` -1*a_P${pulley.pulleyNumber}`
                            visitedPulleys.push(pulley.pulleyNumber)
                        }
                    }
                }

                for (let mass of getMasses()) {
                    if (!visitedMasses.includes(mass.massNumber)) { // dont double count the mass acceleration due to multiple rope segments that make up the same rope
                        if (ropeSegment.pullsStraightUpOn(mass)) {
                            LHS += ` +1*a_m${mass.massNumber}`
                            visitedMasses.push(mass.massNumber)
                        }
                        else if (ropeSegment.pullsStraightDownOn(mass)) {
                            LHS += ` -1*a_m${mass.massNumber}`
                            visitedMasses.push(mass.massNumber)
                        }
                    }
                }
            }
        }
        EOMs.push(`${LHS} = ${RHS}`)
    }

    //filling out the A matrix
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            let unknown = x[j]
            let endIDX = EOMs[i].indexOf(unknown)
            let coeefficent = parseInt(EOMs[i].substring(endIDX-3, endIDX-1))
            if(isNaN(coeefficent)){
                coeefficent=0
            }
            A.set(i,j, coeefficent);
        }
    }

    console.log(EOMs)

    //solving the system
    let b_vector = Matrix.columnVector(b)
    let solved_x = solve(A, b_vector)
    for(let i=0; i<dim; i++){
        console.log(`${x[i]} = ${solved_x.get(i,0)}`)
    }  
}

document.getElementById("calculate-button")!.onclick = calculate