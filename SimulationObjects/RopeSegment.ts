import { Position, Status } from '../index'

import _ from "underscore"
import { generateID, positionsEqual } from '../utility'
import Pulley from './Pulley'
import Mass from './Mass'

export default interface RopeSegment {
    id: string
    startPos: Position,
    endPos: Position,
    ropeNumber: number | null, //keeps track if the rope segment is part of greater rope with tension T_1, T_2, etc.
}

export default class RopeSegment {
    constructor(startPos: Position, endPos: Position) {
        this.id = generateID()
        this.startPos = startPos
        this.endPos = endPos
        this.ropeNumber = null
    }

    render(ctx: CanvasRenderingContext2D, status: Status) {
        ctx.beginPath()
        ctx.moveTo(this.startPos.x, this.startPos.y)
        ctx.lineWidth = 3
        ctx.strokeStyle = "red"
        ctx.lineTo(this.endPos.x, this.endPos.y)
        ctx.stroke()

        if (status === "calculated" && this.ropeNumber !== null) {
            ctx.font = "bold 20px sans-serif"
            ctx.fillStyle = "blue"
            let xPos = 0.5 * (this.startPos.x + this.endPos.x)
            let yPos = 0.5 * (this.startPos.y + this.endPos.y)
            ctx.fillText("T" + this.ropeNumber, xPos + 5, yPos)
        }

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

    setRopeNumber(num: number) {
        this.ropeNumber = num
    }

    isConnectedTo(pos: Position) { 
        return (
            positionsEqual(this.startPos, pos) 
            || positionsEqual(this.endPos, pos)
        ) //technically this should be an XOR not OR ( one rope segment should not be connected to the left AND right side of the pulley)
    }

    loopsAround(p: Pulley) {
        return (
            this.isConnectedTo(p.leftPos) 
            || this.isConnectedTo(p.rightPos)
        )
    }

    loopsUpAround(pulley: Pulley) {
        return (
            this.loopsAround(pulley) 
            && Math.min(this.startPos.y, this.endPos.y) < pulley.pos.y
        )
    }

    loopsDownAround(pulley: Pulley) {
        return (
            this.loopsAround(pulley) 
            && Math.max(this.startPos.y, this.endPos.y) > pulley.pos.y
        )
    }

    /*
        ! DOWN IS POSITIVE Y ON CANVAS
    */

    pullsStraightUpOn(obj: (Pulley | Mass)) {
        return (
            this.isConnectedTo(obj.pos) 
            && Math.min(this.startPos.y, this.endPos.y) < obj.pos.y
        )
    }

    pullsStraightDownOn(obj: (Pulley | Mass)) {
        return (
            this.isConnectedTo(obj.pos) 
            && Math.max(this.startPos.y, this.endPos.y) > obj.pos.y
        )
    }
}