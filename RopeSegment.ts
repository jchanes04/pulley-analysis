import {ctx, Position} from './index'

import _ from "underscore"

interface RopeSegment {
    id: string
    startPos: Position,
    endPos: Position,
    ropeNumber: number, //keeps track if the rope segment is part of greater rope with tension T_1, T_2, etc.
}

class RopeSegment {
    constructor(startPos: Position, endPos: Position) {
        this.startPos = startPos
        this.endPos = endPos
    }

    render() {
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

    setID(id: string) {
        this.id = id
    }

    move(node: "start" | "end", pos: Position) {
        if (node === "start") {
            this.startPos = pos
        } else if (node === "end") {
            this.endPos = pos
        }
    }
}

export = RopeSegment