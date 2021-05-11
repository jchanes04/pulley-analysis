export type Position = {
    x: number,
    y: number
}

export type SimulationObject = RopeSegment | Pulley | Mass

type IDList = Record<string, Pulley | RopeSegment | Mass>

export var snapDistance = 20

const workspace: HTMLElement = document.getElementById("workspace")!
const gridCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("grid-canvas")!
const mainCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("main-canvas")!
export const ctx = mainCanvas.getContext("2d")!
var status: "editing" | "animating" = "editing"
export var globalElementList: IDList = {}   // used to store references to all elements currently in the workspace

export import Pulley = require('./Pulley')
export import RopeSegment = require('./RopeSegment')
export import Mass = require('./Mass')
import Equation = require('./Equation')
import _, { create, first, invert } from "underscore"
import { Matrix, solve } from 'ml-matrix'

let workspaceResizeObserver = new ResizeObserver(entries => {
    mainCanvas.width = workspace.clientWidth
    mainCanvas.height = workspace.clientHeight
    drawGrid()
})
workspaceResizeObserver.observe(workspace)  // redraw the grid and rezise the canvas if the user changes the size of the container

import CommandManager = require('./CommandManager')

const editManager = new CommandManager()    // used to keep track of edits and undo/redo them

document.getElementById("undo")!.onclick = () => {  // undo button
    editManager.undo()
}

document.getElementById("redo")!.onclick = () => {  // redo button
    editManager.redo()
}

document.onkeyup = (e) => {     // undo/redo shortcuts
    if (e.ctrlKey && e.code === "KeyZ") {
        editManager.undo()
    } else if (e.ctrlKey && e.code === "KeyY") {
        editManager.redo()
    }
}

var radios: Array<HTMLInputElement> = <Array<HTMLInputElement>>[...document.querySelectorAll('input[name="selected-object"]')]
radios.forEach(radio => {
    radio.onchange = () => {    // change the crosshair when a different tool is selected
        let selectedTool = (<HTMLInputElement>document.querySelector('input[name="selected-object"]:checked')).value
        if (["mass", "pulley", "rope-segment"].includes(selectedTool)) {
            workspace.style.cursor = "crosshair"
        } else {
            workspace.style.cursor = "default"
        }
    }
})

var functionsToRender: Function[] = []  // set of functions to run when rendering the workspace, mostly used for preview outlines of elements
var nodesToRender: {pos: Position, parents: SimulationObject[]}[] = []  // set of all object nodes to render and which elements they are shared between
var fixedNodes: Position[] = []     // set of all nodes that have been fixed, used to determine which icon to render

function drawGrid() {   // draws the background grid for the workspace
    gridCanvas.width = workspace.clientWidth    // sets size equal to workspace size
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
}

var lastFrame: number = 0   // timestamp of the last frame
var fpsTime: number = 0     // time since fps counter was last updated
var frameCount: number = 0  // number of frames elapsed so far
var fps: number = 0

function init() {
    drawGrid()

    mainCanvas.onmousedown = mainMousedownHandler   // handles clicks and drags
    mainCanvas.onmousemove = trackMousePosition     // tracks current mouse position at all times

    main(0)
}

function main(currentFrame: number) {
    window.requestAnimationFrame(main)  // continue the render loop

    update(currentFrame)
    render()
}

function update(currentFrame: number) {     // updates the frames and the physics
    let dt = (currentFrame - lastFrame) / 1000
    lastFrame = currentFrame
    
    for (let id in globalElementList) {
        if (status === "animating") globalElementList[id].update(dt)
    }

    updateFps(dt)
}

function updateFps(dt: number) {
    if (fpsTime > 0.25) {
        // Calculate fps
        fps = Math.round(frameCount / fpsTime)

        // Reset time and framecount
        fpsTime = 0
        frameCount = 0
    }

    // Increase time and framecount
    fpsTime += dt
    frameCount++
}

const fixedNodeSVG = new Path2D("M 0 2.104 L 2.104 0 L 5 2.896 L 7.896 0 L 10 2.104 L 7.104 5 L 10 7.896 L 7.896 10 L 5 7.104 L 2.104 10 L 0 7.896 L 2.896 5 Z")      

var nodeMousedOver: {pos: Position, parents: SimulationObject[]} | null = null  // information on the node currently moused over

function render() {     // called every frame, redraws elements in the workspace
    drawWorkspace()

    nodesToRender = []  // list of all nodes that need to be rendered
    for (let id in globalElementList) { // for every element in the workspace
        if (status === "editing") {
            let nodePositions = globalElementList[id].render()  // render returns an array of positions to place nodes at 
            for (let position of nodePositions) {   // either add new position or update parents of existing position in the list
                if (!nodesToRender.some(p => positionsEqual(p.pos, position))) {
                    nodesToRender.push({pos: position, parents: [globalElementList[id]]})
                } else {
                    let item = nodesToRender.find(x => positionsEqual(x.pos, position))
                    item!.parents.push(globalElementList[id])
                }
            }
        }
    }

    nodeMousedOver = null   // reset which node is moused over
    for (let node of nodesToRender) {
        ctx.beginPath()
        if (!fixedNodes.some(n => positionsEqual(n, node.pos))) {   // for all nodes that are not fixed
            ctx.lineWidth = 3
            ctx.strokeStyle = "#000"
            if (getDist(currentMousePos, node.pos) < snapDistance) {    // if moused over
                ctx.fillStyle = "lime"
                nodeMousedOver = {pos: node.pos, parents: [...node.parents]}
                currentMousePos = node.pos
            } else {
                ctx.fillStyle = "green"
            }
            ctx.arc(node.pos.x, node.pos.y, 5, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
        } else {    // for all nodes that are fixed
            if (getDist(currentMousePos, node.pos) < snapDistance) {    // if moused over
                ctx.fillStyle = "yellow"
                nodeMousedOver = node
            } else {
                ctx.fillStyle = "orange"
            }
            ctx.translate(node.pos.x - 5, node.pos.y - 5)   // used to position the svg in the correct place
            ctx.fill(fixedNodeSVG)
            ctx.stroke()
            ctx.translate(-node.pos.x + 5, -node.pos.y + 5)
        }
    }

    for (let func of functionsToRender) {   // call all functions in functionsToRender
        func()
    }
}

function drawWorkspace() {  // redraws a clean workspace
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
}

function mainMousedownHandler(event: MouseEvent) {  // handles clicks/drags
    let selectedTool = (<HTMLInputElement>document.querySelector('input[name="selected-object"]:checked')).value
    // which tool is currently selected
    let inputtedMass = parseFloat((<HTMLInputElement>document.getElementById("mass-input")).value)
    // what the current mass input is
    switch(selectedTool) {
        case "pulley": {
            let pos = {x: currentMousePos.x, y: currentMousePos.y}

            function showPulleyPreview() {  // have a grayed out preview size with the cursor movement
                if (getDist(pos, currentMousePos) > snapDistance) {
                    ctx.beginPath()
                    ctx.lineWidth = 3
                    ctx.strokeStyle = "#AAA"
                    ctx.arc(getSnappedPos(pos).x, getSnappedPos(pos).y, getSnappedDist(pos, currentMousePos), 0, 2 * Math.PI)
                    ctx.stroke()
                }
            }
            functionsToRender.push(showPulleyPreview)   // add the function to get rendered every frame
            
            function removeListeners() {    // cleanup and inserting new element into the list
                workspace.removeEventListener("mouseup", removeListeners)

                if (getDist(pos, currentMousePos) > snapDistance) { // dont create if it's too small
                    let newPulley = new Pulley(getSnappedPos(pos), getSnappedDist(pos, currentMousePos))
                    setID(newPulley)
                    editManager.add({
                        type: "create",
                        target: newPulley
                    })
                }

                functionsToRender = functionsToRender.filter(item => item !== showPulleyPreview)    // remove preview rendering function
            }
            workspace.addEventListener("mouseup", removeListeners)
        }; break

        case "mass": {
            let pos = {x: currentMousePos.x, y: currentMousePos.y}

            function showMassPreview() {    // have a grayed out preview size with the cursor movement
                if (getDist(pos, currentMousePos) > 0.73 * snapDistance) {
                    ctx.beginPath()
                    ctx.lineWidth = 3
                    ctx.strokeStyle = "#AAA"
                    ctx.rect(getSnappedPos(currentMousePos).x, getSnappedPos(currentMousePos).y, 2 * (getSnappedPos(pos).x - getSnappedPos(currentMousePos).x), 2 * (getSnappedPos(pos).y - getSnappedPos(currentMousePos).y))
                    ctx.stroke()
                }
            }
            functionsToRender.push(showMassPreview) // add the function to get rendered every frame

            function removeListeners() {    // cleanup and inserting new element into the list
                workspace.removeEventListener("mouseup", removeListeners)

                // dont create if its too small
                if (getDist(pos, currentMousePos) > 0.73 * snapDistance && getSnappedPos(pos).x - getSnappedPos(currentMousePos).x !== 0 && getSnappedPos(pos).y - getSnappedPos(currentMousePos).y) {
                    let newMass = new Mass(getSnappedPos(pos), {width: 2 * Math.abs(getSnappedPos(pos).x - getSnappedPos(currentMousePos).x), height: 2 * Math.abs(getSnappedPos(pos).y - getSnappedPos(currentMousePos).y)}, inputtedMass)
                    setID(newMass)
                    editManager.add({
                        type: "create",
                        target: newMass
                    })
                }

                functionsToRender = functionsToRender.filter(item => item !== showMassPreview)  // remove preview rendering function
            }
            workspace.addEventListener("mouseup", removeListeners)
        }; break

        case "rope-segment": {
            let pos = {x: currentMousePos.x, y: currentMousePos.y}

            function showRopeSegmentPreview() { // have a grayed out preview size with the cursor movement
                if (Math.abs(currentMousePos.y - pos.y) > snapDistance) {
                    ctx.beginPath()
                    ctx.moveTo(getSnappedPos(pos).x, getSnappedPos(pos).y)
                    ctx.lineWidth = 3
                    ctx.strokeStyle = "#F99"
                    ctx.lineTo(getSnappedPos(currentMousePos).x, getSnappedPos(currentMousePos).y)
                    ctx.stroke()
                }
            }
            functionsToRender.push(showRopeSegmentPreview)  // add the function to get rendered every frame

            function removeListeners() {    // cleanup and inserting new element into the list
                workspace.removeEventListener("mouseup", removeListeners)

                if (Math.abs(currentMousePos.y - pos.y) > snapDistance) {   // dont create if its's too small
                    let newRopeSegment = new RopeSegment(getSnappedPos(pos), getSnappedPos(currentMousePos))
                    setID(newRopeSegment)
                    editManager.add({
                        type: "create",
                        target: newRopeSegment
                    })
                }

                functionsToRender = functionsToRender.filter(item => item !== showRopeSegmentPreview)   // remove preview rendering function
            }
            workspace.addEventListener("mouseup", removeListeners)
        }; break

        case "fix-node": {  // add or remove node to/from the list of fixed nodes
            if (fixedNodes.some(nodePosition => positionsEqual(nodePosition, getSnappedPos(currentMousePos)))) {
                fixedNodes = fixedNodes.filter(nodePosition => !positionsEqual(nodePosition, getSnappedPos(currentMousePos)))
            } else {
                fixedNodes.push(getSnappedPos(currentMousePos))
                
            }
        }; break

        case "move": {
            if (nodeMousedOver !== null) {  // there is a node being moused over
                /*  movements of multiple elements connected to the same node have to be batched, 
                    as well as the functions that render previews */
                let removeListenerFunctions: Function[] = []
                let moveEdits: any = []
                nodeMousedOver.parents.forEach(p => {   // for every element connected to node
                    delete globalElementList[p.id]  // remove it from the list temporarily (stop rendering the element in its current position)
                    if (p instanceof Pulley) {
                        // determine which node is being moved
                        var pulleyNodePosition : "left" | "right" | "center" = "center"
                        if (positionsEqual(currentMousePos, {x: p.pos.x - p.radius, y: p.pos.y})) {
                            pulleyNodePosition = "left"
                        } else if (positionsEqual(currentMousePos, {x: p.pos.x + p.radius, y: p.pos.y})) {
                            pulleyNodePosition = "right"
                        }

                        function showMovePreview() {
                            ctx.beginPath()
                            ctx.strokeStyle = "#AAA"
                            ctx.lineWidth = 3
                            ctx.arc(
                                currentMousePos.x + (pulleyNodePosition === "left" ? (<Pulley>p).radius : (pulleyNodePosition === "right" ? -(<Pulley>p).radius : 0)),
                                currentMousePos.y, 
                                (<Pulley>p).radius, 
                                0, 
                                2 * Math.PI
                            )
                            ctx.stroke()
                        }

                        functionsToRender.push(showMovePreview)

                        function removeListeners() {
                            p.move(<never>pulleyNodePosition, getSnappedPos(currentMousePos))
                            globalElementList[p.id] = p

                            functionsToRender = functionsToRender.filter(item => item !== showMovePreview)
                        }

                        removeListenerFunctions.push(removeListeners)
                        moveEdits.push({
                            type: "move",
                            target: p,
                            oldPosition: {x: (<Pulley>p).pos.x, y: (<Pulley>p).pos.y},
                            newPosition: getSnappedPos(currentMousePos),
                            node: pulleyNodePosition
                        })
                    } else if (p instanceof RopeSegment) {
                        // determine which node is being moved
                        var ropeNodePosition: "start" | "end" = positionsEqual(currentMousePos, p.startPos) ? "start" : "end"

                        function showMovePreview() {
                            let unmovingNode: "startPos" | "endPos" = ropeNodePosition === "start" ? "endPos" : "startPos"

                            ctx.beginPath()
                            ctx.moveTo((<RopeSegment>p)[unmovingNode].x, (<RopeSegment>p)[unmovingNode].y)
                            ctx.lineWidth = 3
                            ctx.strokeStyle = "#F99"
                            ctx.lineTo(currentMousePos.x, currentMousePos.y)
                            ctx.stroke()
                        }

                        functionsToRender.push(showMovePreview)

                        function removeListeners() {
                            p.move(<never>ropeNodePosition, getSnappedPos(currentMousePos))
                            globalElementList[p.id] = p

                            functionsToRender = functionsToRender.filter(item => item !== showMovePreview)
                        }

                        removeListenerFunctions.push(removeListeners)
                        moveEdits.push({
                            type: "move",
                            target: p,
                            oldPosition: {x: (<RopeSegment>p)[ropeNodePosition === "start" ? "startPos" : "endPos"].x, y: (<RopeSegment>p)[ropeNodePosition === "start" ? "startPos" : "endPos"].y},
                            newPosition: getSnappedPos(currentMousePos),
                            node: ropeNodePosition
                        })
                    } else if (p instanceof Mass) {
                        function showMovePreview() {
                            ctx.beginPath()
                            ctx.lineWidth = 3
                            ctx.strokeStyle = "#AAA"
                            ctx.rect(
                                currentMousePos.x - (<Mass>p).dimensions.width / 2,
                                currentMousePos.y - (<Mass>p).dimensions.height / 2,
                                (<Mass>p).dimensions.width,
                                (<Mass>p).dimensions.height
                            )
                            ctx.stroke()
                        }

                        functionsToRender.push(showMovePreview)

                        function removeListeners() {
                            p.move(<never>"center", getSnappedPos(currentMousePos))
                            globalElementList[p.id] = p

                            functionsToRender = functionsToRender.filter(item => item !== showMovePreview)
                        }

                        removeListenerFunctions.push(removeListeners)
                        moveEdits.push({
                            type: "move",
                            target: p,
                            oldPosition: {x: p.pos.x, y: p.pos.y},
                            newPosition: getSnappedPos(currentMousePos),
                            node: "center"
                        })
                    }
                })

                // when the user finishes moving elements
                workspace.addEventListener("mouseup", () => {
                    editManager.add(...moveEdits)
                    removeListenerFunctions.forEach(f => f())   // call all cleanup functions

                    moveEdits = []
                    removeListenerFunctions = []
                })
            }
        }; break
    }
}

var currentMousePos: Position = {x: 0, y: 0}
function trackMousePosition(e: MouseEvent) {
    currentMousePos = getMousePos(mainCanvas, e)
}

function getMousePos(canvas: HTMLCanvasElement, e: MouseEvent) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
        y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
    }
}

function getDist(pos1: Position, pos2: Position) {
    return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)
}

function getSnappedDist(pos1: Position, pos2: Position) {
    return Math.round(Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2) / snapDistance) * snapDistance
}

function getSnappedPos(pos: Position) {
    let newX = Math.round(pos.x / snapDistance) * snapDistance
    let newY = Math.round(pos.y / snapDistance) * snapDistance
    return {x: newX, y: newY}
}

init()

function setID(element: SimulationObject) {
    let id: string
    do {
        id = (Math.floor(Math.random() * 1000000)).toString() //generating a random ID from 0-999999
    } while (id in globalElementList)
    element.setID(id)
    globalElementList[id] = element
}

function positionsEqual(pos1: Position, pos2: Position) {
    return (pos1.x === pos2.x && pos1.y === pos2.y)
}