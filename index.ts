type Position = {
    x: number,
    y: number
}

type SimulationObject = RopeSegment | Pulley | Mass

type IDList = Record<string, SimulationObject | ObjectNode>
type ConnectionList = Array<{ upperNode: ObjectNode, lowerNode: ObjectNode }>

var snapDistance = 25

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
import { Script } from 'vm'
import _ from "underscore"

var scalingHtmlElement: HTMLElement
var ropeLabel: HTMLElement

(function drawGrid() {
    gridCanvas.width = workspace.clientWidth
    gridCanvas.height = workspace.clientHeight
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
    let length = getSnappedDist(firstClickPos, mousePos)
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
    let xDiff = Math.abs(mousePos.x - firstClickPos.x)
    let yDiff = Math.abs(mousePos.y - firstClickPos.y)
    scalingHtmlElement.style.width = 2 * xDiff + 'px'
    scalingHtmlElement.style.height = 2 * yDiff + 'px'
    scalingHtmlElement.style.top = firstClickPos.y - yDiff + 'px'
    scalingHtmlElement.style.left = firstClickPos.x - xDiff + 'px'
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
                //connectionList.push({ upperNode: ((newSegment.endNode.y > newSegment.startNode.y) ? newSegment.startNode : newSegment.endNode), lowerNode: ((newSegment.endNode.y > newSegment.startNode.y) ? newSegment.endNode : newSegment.startNode) })
                //console.dir(connectionList)
                mode = 'f'
            }
            break
        }
        case "mass": {
            let mass = parseFloat((<HTMLInputElement>document.getElementById("mass-input")).value) ?? 0
            console.log(`Mass: ${mass}`)
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
                let newMass = new Mass(firstClickPos, { width: xDiff * 2, height: yDiff * 2 }, mass)
                setID(newMass)
                setID(newMass.centerNode)

                mode = 'f'
            }
            break
        }
        case "fix-node": {
            let nodes = getNodesAtPos(pos) //getting all the nodes that have the same position as "pos"
            console.dir(nodes)

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

function setTensionIDsOfLinkedRopeSegments(ropeSegment1: RopeSegment, tensionNumber: number) {
    for (let pulley of getPulleys()) { //iterate over all pulleys
        if (ropeSegment1.loopsAround(pulley)) {
            for (let ropeSegment2 of getRopeSegments()) {
                if (ropeSegment2.tensionNumber === undefined && ropeSegment2.loopsAround(pulley)) {
                    ropeSegment2.tensionNumber = tensionNumber
                    setTensionIDsOfLinkedRopeSegments(ropeSegment2, tensionNumber)
                }
            }
        }
    }
}

function calculate() {
    //labeling the ropes (T1, T2, etc.)
    for (let ropeSegment of getRopeSegments()) {
        if (ropeSegment.tensionNumber === undefined) {
            ropeCount++
            ropeSegment.tensionNumber = ropeCount
            ropeSegment.ropeLabel.innerText = 'T' + ropeSegment.tensionNumber.toString();
            setTensionIDsOfLinkedRopeSegments(ropeSegment, ropeCount)
        }
        ropeSegment.ropeLabel.innerText = 'T' + ropeSegment.tensionNumber.toString();
    }

    //labeling the masses (M1, M2, etc.)
    for (let mass of getMasses()) {
        massCount++
        mass.massNumber = massCount
        mass.htmlElement.innerText = 'm_' + mass.massNumber.toString()
    }

    //labeling the pulleys (P1, P2, etc.)
    for (let pulleys of getPulleys()) {
        pulleyCount++
        pulleys.pulleyNumber = pulleyCount
    }

    for (let mass of getMasses()) {
        for (let ropeSegment of getRopeSegments()) {
            if (ropeSegment.isConnectedToMass(mass)) {
                console.log(ropeSegment)
                console.log(mass)
                console.log(`m_${mass.massNumber}*a_m_${mass.massNumber} = T_${ropeSegment.tensionNumber} - 9.81*m_${mass.massNumber}`)
            }
        }
    }
}

document.getElementById("calculate-button")!.onclick = calculate