import { editManager, Position } from "..";
import { addElementToList, addFuncToRender, currentMousePos, removeFuncToRender, snapDistance } from "../canvas";
import RopeSegment from "../SimulationObjects/RopeSegment";
import { getSnappedPos } from "../utility";

export function createRopeSegment(workspace: HTMLElement, mousePos: Position) {
    let pos = {x: mousePos.x, y: mousePos.y}

    function showRopeSegmentPreview(ctx: CanvasRenderingContext2D) { // have a grayed out preview size with the cursor movement
        if (Math.abs(currentMousePos().y - pos.y) > snapDistance) {
            ctx.beginPath()
            ctx.moveTo(getSnappedPos(pos, snapDistance).x, getSnappedPos(pos, snapDistance).y)
            ctx.lineWidth = 3
            ctx.strokeStyle = "#F99"
            ctx.lineTo(getSnappedPos(currentMousePos(), snapDistance).x, getSnappedPos(currentMousePos(), snapDistance).y)
            ctx.stroke()
        }
    }
    addFuncToRender(showRopeSegmentPreview)  // add the function to get rendered every frame

    function removeListeners() {    // cleanup and inserting new element into the list
        workspace.removeEventListener("mouseup", removeListeners)

        if (Math.abs(currentMousePos().y - pos.y) > snapDistance) {   // dont create if its's too small
            let newRopeSegment = new RopeSegment(getSnappedPos(pos, snapDistance), getSnappedPos(currentMousePos(), snapDistance))
            addElementToList(newRopeSegment)
            editManager.add({
                type: "create",
                target: newRopeSegment
            })
        }

        removeFuncToRender(showRopeSegmentPreview)   // remove preview rendering function
    }
    workspace.addEventListener("mouseup", removeListeners)
}