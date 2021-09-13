import Pulley from './SimulationObjects/Pulley'
import Mass from './SimulationObjects/Mass'
import RopeSegment from './SimulationObjects/RopeSegment'

export type Position = {
    x: number,
    y: number
}

export type SimulationObject = RopeSegment | Pulley | Mass

export type IDList = Record<string, SimulationObject>
export type Status = "editing" | "animating" | "calculated"
var status: Status = "editing"
export var globalElementList: IDList = {}   // used to store references to all elements currently in the workspace

import CommandManager from './CommandManager'
import { init, setCursor } from './canvas'
import { calculate } from './handlers/calculate'

export const editManager = new CommandManager()    // used to keep track of edits and undo/redo them

document.getElementById("undo")!.onclick = () => {  // undo button
    setStatus("editing")
    editManager.undo()
}

document.getElementById("redo")!.onclick = () => {  // redo button
    setStatus("editing")
    editManager.redo()
}

document.getElementById("calculate-button")!.onclick = () => {
    calculate(Object.values(globalElementList))
}

document.getElementById("clear")!.onclick = () => {
    globalElementList = {}
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
            setCursor("crosshair")
        } else {
            setCursor("default")
        }
    }
})

init()

export function getStatus() {
    return status
}

export function setStatus(s: Status) {
    status = s
}