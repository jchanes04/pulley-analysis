import { editManager, Position } from "..";
import { addElementToList, addFuncToRender, currentMousePos, removeFuncToRender, snapDistance } from "../canvas";
import Mass from "../SimulationObjects/Mass";
import { getDist, getSnappedPos } from "../utility";

export function createMass(workspace: HTMLElement, mousePos: Position, inputtedMass: number) {
    let pos = {x: mousePos.x, y: mousePos.y}

    function showMassPreview(ctx: CanvasRenderingContext2D) {    // have a grayed out preview size with the cursor movement
        if (getDist(pos, currentMousePos()) > 0.73 * snapDistance) {
            ctx.beginPath()
            ctx.lineWidth = 3
            ctx.strokeStyle = "#AAA"
            ctx.rect(
                getSnappedPos(currentMousePos(), snapDistance).x, 
                getSnappedPos(currentMousePos(), snapDistance).y, 
                2 * (getSnappedPos(pos, snapDistance).x - getSnappedPos(currentMousePos(), snapDistance).x), 
                2 * (getSnappedPos(pos, snapDistance).y - getSnappedPos(currentMousePos(), snapDistance).y)
            )
            ctx.stroke()
        }
    }
    addFuncToRender(showMassPreview) // add the function to get rendered every frame

    function removeListeners() {    // cleanup and inserting new element into the list
        workspace.removeEventListener("mouseup", removeListeners)

        // dont create if its too small
        if (
            getDist(pos, currentMousePos()) > 0.73 * snapDistance && 
            getSnappedPos(pos, snapDistance).x - getSnappedPos(currentMousePos(), snapDistance).x !== 0 && 
            getSnappedPos(pos, snapDistance).y - getSnappedPos(currentMousePos(), snapDistance).y !== 0) {
            let newMass = new Mass(
                getSnappedPos(pos, snapDistance), 
                {
                    width: 2 * Math.abs(getSnappedPos(pos, snapDistance).x - getSnappedPos(currentMousePos(), snapDistance).x),
                    height: 2 * Math.abs(getSnappedPos(pos, snapDistance).y - getSnappedPos(currentMousePos(), snapDistance).y)
                }, 
                inputtedMass
            )
            addElementToList(newMass)
            editManager.add({
                type: "create",
                target: newMass
            })
        }

        removeFuncToRender(showMassPreview)  // remove preview rendering function
    }
    workspace.addEventListener("mouseup", removeListeners)
}