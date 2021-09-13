import { Position, SimulationObject } from ".."
import { addElementToList, addFuncToRender, currentMousePos, removeFuncToRender, snapDistance } from "../canvas"
import { MoveEdit } from "../CommandManager"
import RopeSegment from "../SimulationObjects/RopeSegment"
import { getSnappedPos, positionsEqual } from "../utility"

export function moveRopeSegment(r: RopeSegment, nodeMousedOver: {pos: Position, parents: SimulationObject[]}): [Function, MoveEdit] {
    let ropeNodePosition: "start" | "end" = positionsEqual(nodeMousedOver.pos, r.startPos) ? "start" : "end"

    function showMovePreview(ctx: CanvasRenderingContext2D) {
        let unmovingNode: "startPos" | "endPos" = ropeNodePosition === "start" ? "endPos" : "startPos"

        ctx.beginPath()
        ctx.moveTo(r[unmovingNode].x, r[unmovingNode].y)
        ctx.lineWidth = 3
        ctx.strokeStyle = "#F99"
        ctx.lineTo(currentMousePos().x, currentMousePos().y)
        ctx.stroke()
    }

    addFuncToRender(showMovePreview)

    function removeListeners() {
        r.move(ropeNodePosition, getSnappedPos(currentMousePos(), snapDistance))
        addElementToList(r)

        removeFuncToRender(showMovePreview)
    }

    return [
        removeListeners,
        {
            type: "move",
            target: r,
            oldPosition: {x: r[ropeNodePosition === "start" ? "startPos" : "endPos"].x, y: r[ropeNodePosition === "start" ? "startPos" : "endPos"].y},
            newPosition: getSnappedPos(currentMousePos(), snapDistance),
            node: ropeNodePosition
        }
    ]
}