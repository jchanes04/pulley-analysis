export type Position = {
    x: number,
    y: number
}

export type SimulationObject = RopeSegment | Pulley | Mass

type IDList = Record<string, Pulley>

var snapDistance = 30

const workspace: HTMLElement = document.getElementById("workspace")!
const gridCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("grid-canvas")!
const mainCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("main-canvas")!
mainCanvas.width = 10000
mainCanvas.height = 6000
const ctx = mainCanvas.getContext("2d")!
export {ctx}
var clickMode: "f" | "s" = 'f' //'f' for first click     's' for second click
var firstClickPos: Position
var status: "editing" | "animating" = "editing"
var globalElementList: IDList = {}

import Pulley = require('./Pulley')
import RopeSegment = require('./RopeSegment')
import Mass = require('./Mass')
import ObjectNode = require('./ObjectNode')
import Equation = require('./Equation')
import _, { create, first, invert } from "underscore"
import { Matrix, solve } from 'ml-matrix'

export {Pulley, RopeSegment, Mass, ObjectNode}

globalElementList["12345"] = new Pulley({x: 2000, y: 2000}, 600)

var scalingHtmlElement: HTMLElement
var ropeLabel: HTMLElement

// import CommandManager = require('./CommandManager')

// const editManager = new CommandManager()

document.getElementById("undo")!.onclick = () => {
    // editManager.undo()
}

document.getElementById("redo")!.onclick = () => {
    // editManager.redo()
}

document.onkeyup = (e) => {
    if (e.ctrlKey && e.code === "KeyZ") {
        // editManager.undo()
    } else if (e.ctrlKey && e.code === "KeyY") {
        // editManager.redo()
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

var lastFrame: number = 0
var fpsTime: number = 0
var frameCount: number = 0
var fps: number = 0

function init() {
    mainCanvas.onmousedown = mainMousedownHandler
    mainCanvas.onmouseup = mainMouseupHandler
    mainCanvas.onmousemove = mainMousemoveHandler
    mainCanvas.onmouseout = mainMouseoutHandler

    main(0)
}

function main(currentFrame: number) {
    window.requestAnimationFrame(main)

    update(currentFrame)
    render()
}

function update(currentFrame: number) {
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

function render() {
    drawWorkspace()

    for (let id in globalElementList) {
        if (status === "editing" || !(globalElementList[id] instanceof ObjectNode)) globalElementList[id].render()
    }
    ctx.stroke()
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

function mainMousedownHandler(event: MouseEvent) {}
function mainMousemoveHandler(event: MouseEvent) {}
function mainMouseoutHandler(event: MouseEvent) {}
function mainMouseupHandler(event: MouseEvent) {}

function getMousePos(canvas: HTMLCanvasElement, e: MouseEvent) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
        y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
    }
}

init()