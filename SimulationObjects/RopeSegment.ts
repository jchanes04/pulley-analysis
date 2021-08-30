import { Position } from '../index'

import _ from "underscore"
import { generateID } from '../utility'

export default interface RopeSegment {
    id: string
    startPos: Position,
    endPos: Position,
    ropeNumber: number, //keeps track if the rope segment is part of greater rope with tension T_1, T_2, etc.
}

export default class RopeSegment {
    constructor(startPos: Position, endPos: Position) {
        this.id = generateID()
        this.startPos = startPos
        this.endPos = endPos
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.moveTo(this.startPos.x, this.startPos.y)
        ctx.lineWidth = 3
        ctx.strokeStyle = "red"
        ctx.lineTo(this.endPos.x, this.endPos.y)
        ctx.stroke()

        return [this.startPos, this.endPos] // return positions of nodes to be rendered
    }

    update() {

    }

    move(node: "start" | "end", pos: Position) {
        if (node === "start") {
            this.startPos = pos
        } else if (node === "end") {
            this.endPos = pos
        }
    }
}