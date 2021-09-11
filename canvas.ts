import { getStatus, globalElementList, IDList, Position, SimulationObject } from "."
import { mainMousedownHandler } from "./handlers/mainMousedownHandler"
import { getDist, getMousePos, getSnappedPos, positionsEqual } from "./utility"

export var snapDistance = 20

const workspace: HTMLElement = document.getElementById("workspace")!
const gridCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("grid-canvas")!
const mainCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("main-canvas")!
export const ctx = mainCanvas.getContext("2d")!

export function init() {
    drawGrid()

    mainCanvas.onmousedown = () => {
        mainMousedownHandler(workspace, currentMousePosition, nodeMousedOver)
    }   // handles clicks and drags
    mainCanvas.onmousemove = trackMousePosition     // tracks current mouse position at all times

    main(0)
}

var currentMousePosition: Position = {x: 0, y: 0}
function trackMousePosition(e: MouseEvent) {
    currentMousePosition = getMousePos(mainCanvas, e)
}

let workspaceResizeObserver = new ResizeObserver(entries => {
    mainCanvas.width = workspace.clientWidth
    mainCanvas.height = workspace.clientHeight
    drawGrid()
})
workspaceResizeObserver.observe(workspace)  // redraw the grid and rezise the canvas if the user changes the size of the container

export function drawGrid() {   // draws the background grid for the workspace
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

export function setCursor(cursor: "default" | "crosshair") {
    workspace.style.cursor = cursor
}

var functionsToRender: Function[] = []
var nodesToRender: {pos: Position, parents: SimulationObject[]}[] = []
var fixedNodes: Position[] = []
var nodeMousedOver: {pos: Position, parents: SimulationObject[]} | null = null

var lastFrame: number = 0   // timestamp of the last frame
var fpsTime: number = 0     // time since fps counter was last updated
var frameCount: number = 0  // number of frames elapsed so far
var fps: number = 0

function main(currentFrame: number) {
    window.requestAnimationFrame(main)  // continue the render loop

    update(currentFrame)
    render()
}

function update(currentFrame: number) {     // updates the frames and the physics
    let dt = (currentFrame - lastFrame) / 1000
    lastFrame = currentFrame
    
    for (let id in globalElementList) {
        if (getStatus() === "animating") globalElementList[id].update(dt)
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

function render() {     // called every frame, redraws elements in the workspace
    drawWorkspace()

    nodesToRender = []  // list of all nodes that need to be rendered
    for (let id in globalElementList) { // for every element in the workspace
        if (getStatus() === "editing") {
            let nodePositions = globalElementList[id].render(ctx)  // render returns an array of positions to place nodes at 
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
            if (getDist(currentMousePosition, node.pos) < snapDistance) {    // if moused over
                ctx.fillStyle = "lime"
                nodeMousedOver = {pos: node.pos, parents: [...node.parents]}
                currentMousePosition = node.pos
            } else {
                ctx.fillStyle = "green"
            }
            ctx.arc(node.pos.x, node.pos.y, 5, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
        } else {    // for all nodes that are fixed
            if (getDist(currentMousePosition, node.pos) < snapDistance) {    // if moused over
                ctx.fillStyle = "yellow"
                nodeMousedOver = node
            } else {
                ctx.fillStyle = "orange"
            }
            ctx.translate(node.pos.x - 7.5, node.pos.y - 7.5)   // used to position the svg in the correct place
            ctx.fill(fixedNodeSVG)
            ctx.stroke()
            ctx.translate(-node.pos.x + 7.5, -node.pos.y + 7.5)
        }
    }

    for (let func of functionsToRender) {   // call all functions in functionsToRender
        func(ctx)
    }
}

function drawWorkspace() {  // redraws a clean workspace
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
}

export function addFuncToRender(func: Function) {
    functionsToRender.push(func)
}

export function removeFuncToRender(func: Function) {
    functionsToRender = functionsToRender.filter(item => item !== func)
}

export function addElementToList(element: SimulationObject) {
    globalElementList[element.id] = element
}

export function removeElementFromList(id: string) {
    delete globalElementList[id]
}

export function positionFixed(pos: Position) {
    return fixedNodes.some(nodePos => positionsEqual(nodePos, getSnappedPos(currentMousePosition, snapDistance)))
}

export function fixPosition(pos: Position) {
    fixedNodes.push(pos)
}

export function unfixPosition(pos: Position) {
    fixedNodes = fixedNodes.filter(nodePos => !positionsEqual(nodePos, pos))
}

export function fixedPositions(): Position[] {
    return fixedNodes
}

export function currentMousePos(){
    return {x: currentMousePosition.x, y: currentMousePosition.y}
}

const fixedNodeSVG = new Path2D("M 0 3.156 L 3.156 0 L 7.5 4.344 L 11.844 0 L 15 3.156 L 10.656 7.5 L 15 11.844 L 11.844 15 L 7.5 10.656 L 3.156 15 L 0 11.844 L 4.344 7.5 Z")      
