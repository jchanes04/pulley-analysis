import { Position, SimulationObject } from ".."
import { addElementToList, addFuncToRender, currentMousePos, removeFuncToRender, snapDistance } from "../canvas"
import { MoveEdit } from "../CommandManager"
import Pulley from "../SimulationObjects/Pulley"
import { getSnappedPos, positionsEqual } from "../utility"

export function movePulley(p: Pulley, nodeMousedOver: {pos: Position, parents: SimulationObject[]}): [Function, MoveEdit] {
    var pulleyNodePosition : "left" | "right" | "center"
    if (positionsEqual(nodeMousedOver.pos, {x: p.pos.x - p.radius, y: p.pos.y})) {
        pulleyNodePosition = "left"
    } else if (positionsEqual(nodeMousedOver.pos, {x: p.pos.x + p.radius, y: p.pos.y})) {
        pulleyNodePosition = "right"
    } else {
        pulleyNodePosition = "center"
    }

    function showMovePreview(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.strokeStyle = "#AAA"
        ctx.lineWidth = 3
        ctx.arc(
            currentMousePos().x + (pulleyNodePosition === "left" ? p.radius : (pulleyNodePosition === "right" ? -p.radius : 0)),
            currentMousePos().y, 
            p.radius, 
            0, 
            2 * Math.PI
        )
        ctx.stroke()
    }

    addFuncToRender(showMovePreview)

    function removeListeners() {
        p.move(pulleyNodePosition, getSnappedPos(currentMousePos(), snapDistance))
        addElementToList(p)

        removeFuncToRender(showMovePreview)
    }

    return [
        removeListeners,
        {
            type: "move",
            target: p,
            oldPosition: {x: (<Pulley>p).pos.x, y: (<Pulley>p).pos.y},
            newPosition: getSnappedPos(currentMousePos(), snapDistance),
            node: pulleyNodePosition
        }
    ]
}