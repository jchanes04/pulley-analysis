import { IDList, Position, SimulationObject } from "."

export function positionsEqual(pos1: Position, pos2: Position) {
    return (pos1.x === pos2.x && pos1.y === pos2.y)
}

export function getMousePos(canvas: HTMLCanvasElement, e: MouseEvent) {
    var rect = canvas.getBoundingClientRect()
    return {
        x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
        y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
    }
}

export function getDist(pos1: Position, pos2: Position) {
    return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)
}

export function getSnappedDist(pos1: Position, pos2: Position, snapDistance: number) {
    return Math.round(Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2) / snapDistance) * snapDistance
}

export function getSnappedPos(pos: Position, snapDistance: number) {
    let newX = Math.round(pos.x / snapDistance) * snapDistance
    let newY = Math.round(pos.y / snapDistance) * snapDistance
    return {x: newX, y: newY}
}

let IDsGenerated: string[] = []
export function generateID() {
    let id
    do {
        id = (Math.floor(Math.random() * 1000000)).toString()
    } while (IDsGenerated.includes(id))
    IDsGenerated.push(id)
    return id
}