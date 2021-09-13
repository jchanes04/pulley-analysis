import { editManager, Position, setStatus, SimulationObject } from ".."
import { fixPosition, getNodeList, positionFixed, removeElementFromList, snapDistance, unfixPosition } from "../canvas"
import { MoveEdit } from "../CommandManager"
import Mass from "../SimulationObjects/Mass"
import Pulley from "../SimulationObjects/Pulley"
import RopeSegment from "../SimulationObjects/RopeSegment"
import { getSnappedPos, positionsEqual } from "../utility"
import { createMass } from "./createMass"
import { createPulley } from "./createPulley"
import { createRopeSegment } from "./createRopeSegment"
import { moveMass } from "./moveMass"
import { movePulley } from "./movePulley"
import { moveRopeSegment } from "./moveRopeSegment"

export function mainMousedownHandler(workspace: HTMLElement, mousePos: Position, nodeMousedOver: {pos: Position, parents: SimulationObject[]} | null) {  // handles clicks/drags
    let selectedTool = (<HTMLInputElement>document.querySelector('input[name="selected-object"]:checked')).value
    // which tool is currently selected
    let inputtedMass = parseFloat((<HTMLInputElement>document.getElementById("mass-input")).value)
    console.log(inputtedMass)
    // what the current mass input is
    if (selectedTool === "pulley") {
        createPulley(workspace, mousePos)
    } else if (selectedTool === "mass") {
        createMass(workspace, mousePos, inputtedMass)
    } else if (selectedTool === "rope-segment") {
        createRopeSegment(workspace, mousePos)
    } else if (selectedTool === "fix-node") {  // add or remove node to/from the list of fixed nodes
        let nodes = getNodeList()
        if (nodes.some(n => positionsEqual(n.pos, getSnappedPos(mousePos, snapDistance)))) {
            if (positionFixed(mousePos)) {
                unfixPosition(getSnappedPos(mousePos, snapDistance))
            } else {
                fixPosition(getSnappedPos(mousePos, snapDistance))
            }
            setStatus("editing")
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
            setStatus("editing")
            editManager.add(...moveEdits)
            removeListenerFunctions.forEach(f => f())   // call all cleanup functions

            moveEdits = []
            removeListenerFunctions = []
        })
    }
}