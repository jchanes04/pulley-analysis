import { Position } from '../index'
import { generateID } from '../utility'

export default interface Pulley {
    id: string,
    pos: Position,
    mass: number,
    radius: number,
    vel: number,
    acc: number,
    fixed: boolean,
    pulleyNumber: number,
}
export default class Pulley {
    constructor(pos: Position, radius: number, objectOptions?: { mass?: number, isFixed?: boolean }) {
        this.id = generateID()
        this.pos = pos

        this.mass = ((isNaN(objectOptions?.mass ?? NaN)) ? 0 : objectOptions?.mass) || 0
        this.radius = radius

        this.vel = 0
        this.acc = 0
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#000"
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI)
        ctx.stroke()

        // return positions of nodes that need to be rendered
        return [this.pos, {x: this.pos.x - this.radius, y: this.pos.y}, {x: this.pos.x + this.radius, y: this.pos.y}]
    }

    update(dt: number) {
        this.pos.y += this.vel * dt
        this.vel += this.acc * dt
    }

    fixPulley(){
        this.fixed = true
    }

    move(node: "left" | "right" | "center", pos: Position) {
        if (node === "right") {
            this.pos = {x: pos.x - this.radius, y: pos.y}
        } else if (node === "center") {
            this.pos = pos
        } else if (node === "left") {
            this.pos = {x: pos.x + this.radius, y: pos.y}
        }
    }

    setAcceleration(acc: number) {
        this.acc = acc
    }
}