import { editManager, Position, SimulationObject } from ".."
import { addElementToList, addFuncToRender, currentMousePos, removeFuncToRender, snapDistance } from "../canvas"
import Pulley from "../SimulationObjects/Pulley"
import { getDist, getSnappedDist, getSnappedPos } from "../utility"

export function createPulley(workspace: HTMLElement, mousePos: Position) {
    let pos = {x: mousePos.x, y: mousePos.y}

    function showPulleyPreview(ctx: CanvasRenderingContext2D) {  // have a grayed out preview size with the cursor movement
        if (getDist(pos, currentMousePos()) > snapDistance) {
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.strokeStyle = "#AAA"
            ctx.arc(getSnappedPos(pos, snapDistance).x, getSnappedPos(pos, snapDistance).y, getSnappedDist(pos, currentMousePos(), snapDistance), 0, 2 * Math.PI)
            ctx.stroke()
        }
    }
    addFuncToRender(showPulleyPreview)   // add the function to get rendered every frame
    
    function removeListeners() {    // cleanup and inserting new element into the list
        workspace.removeEventListener("mouseup", removeListeners)

        if (getDist(pos, currentMousePos()) > snapDistance) { // dont create if it's too small
            let newPulley = new Pulley(getSnappedPos(pos, snapDistance), getSnappedDist(pos, currentMousePos(), snapDistance))
            addElementToList(newPulley)
            editManager.add({
                type: "create",
                target: newPulley
            })
        }

        removeFuncToRender(showPulleyPreview)    // remove preview rendering function
    }
    workspace.addEventListener("mouseup", removeListeners)
}