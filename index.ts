import Pulley from './SimulationObjects/Pulley'
import Mass from './SimulationObjects/Mass'
import RopeSegment from './SimulationObjects/RopeSegment'

export type Position = {
    x: number,
    y: number
}

export type SimulationObject = RopeSegment | Pulley | Mass

export type IDList = Record<string, SimulationObject>

var status: "editing" | "animating" = "editing"
export var globalElementList: IDList = {}   // used to store references to all elements currently in the workspace

import CommandManager, { MoveEdit } from './CommandManager'
import { fixPosition, init, positionFixed, removeElementFromList, removeFuncToRender, setCursor, snapDistance, unfixPosition } from './canvas'
import { getSnappedPos } from './utility'
import { createPulley } from './handlers/createPulley'
import { createMass } from './handlers/createMass'
import { createRopeSegment } from './handlers/createRopeSegment'
import { movePulley } from './handlers/movePulley'
import { moveRopeSegment } from './handlers/moveRopeSegment'
import { moveMass } from './handlers/moveMass'

export const editManager = new CommandManager()    // used to keep track of edits and undo/redo them

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
            setCursor("crosshair")
        } else {
            setCursor("default")
        }
    }
})

init()

export function mainMousedownHandler(workspace: HTMLElement, mousePos: Position, nodeMousedOver: {pos: Position, parents: SimulationObject[]} | null) {  // handles clicks/drags
    let selectedTool = (<HTMLInputElement>document.querySelector('input[name="selected-object"]:checked')).value
    // which tool is currently selected
    let inputtedMass = parseFloat((<HTMLInputElement>document.getElementById("mass-input")).value)
    // what the current mass input is
    if (selectedTool === "pulley") {
        createPulley(workspace, mousePos)
    } else if (selectedTool === "mass") {
        createMass(workspace, mousePos, inputtedMass)
    } else if (selectedTool === "rope-segment") {
        createRopeSegment(workspace, mousePos)
    } else if (selectedTool === "fix-node") {  // add or remove node to/from the list of fixed nodes
        if (positionFixed(mousePos)) {
            unfixPosition(getSnappedPos(mousePos, snapDistance))
        } else {
            fixPosition(getSnappedPos(mousePos, snapDistance))
            
        }
    } else if (selectedTool === "move") {
        if (nodeMousedOver === null) return  // there is a node being moused over
        /*  movements of multiple elements connected to the same node have to be batched, 
            as well as the functions that render previews */
        let removeListenerFunctions: Function[] = []
        let moveEdits: MoveEdit[] = []
        nodeMousedOver.parents.forEach(p => {   // for every element connected to node
            removeElementFromList(p.id)  // remove it from the list temporarily (stop rendering the element in its current position)
            if (p instanceof Pulley) {
                // determine which node is being moved
                let [removeListeners, moveEdit] = movePulley(p, nodeMousedOver)

                removeListenerFunctions.push(removeListeners)
                moveEdits.push(moveEdit)
            } else if (p instanceof RopeSegment) {
                // determine which node is being moved
                let [removeListeners, moveEdit] = moveRopeSegment(p, nodeMousedOver)

                removeListenerFunctions.push(removeListeners)
                moveEdits.push(moveEdit)
            } else if (p instanceof Mass) {
                let [removeListeners, moveEdit] = moveMass(p)

                removeListenerFunctions.push(removeListeners)
                moveEdits.push(moveEdit)
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
}

export function getStatus() {
    return status
}