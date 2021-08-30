import { Position } from "..";
import { addElementToList, addFuncToRender, currentMousePos, removeFuncToRender, snapDistance } from "../canvas";
import { MoveEdit } from "../CommandManager";
import Mass from "../SimulationObjects/Mass";
import { getSnappedPos } from "../utility";

export function moveMass(m: Mass): [Function, MoveEdit] {
    function showMovePreview(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#AAA"
        ctx.rect(
            currentMousePos().x - m.dimensions.width / 2,
            currentMousePos().y - m.dimensions.height / 2,
            m.dimensions.width,
            m.dimensions.height
        )
        ctx.stroke()
    }

    addFuncToRender(showMovePreview)

    function removeListeners() {
        m.move("center", getSnappedPos(currentMousePos(), snapDistance))
        addElementToList(m)

        removeFuncToRender(showMovePreview)
    }
    
    return [
        removeListeners,
        {
            type: "move",
            target: m,
            oldPosition: {x: m.pos.x, y: m.pos.y},
            newPosition: getSnappedPos(currentMousePos(), snapDistance),
            node: "center"
        }
    ]
}