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
    pulleyNumber: number | null,
}
export default class Pulley {
    constructor(pos: Position, radius: number, objectOptions?: { mass?: number, isFixed?: boolean }) {
        this.id = generateID()
        this.pos = pos

        this.mass = ((isNaN(objectOptions?.mass ?? NaN)) ? 0 : objectOptions?.mass) || 0
        this.radius = radius

        this.vel = 0
        this.acc = 0

        this.pulleyNumber = null
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#000"
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI)
        ctx.stroke()

        // return positions of nodes that need to be rendered
        return [this.pos, this.leftPos, this.rightPos]
    }

    update(dt: number) {
        this.pos.y += this.vel * dt
        this.vel += this.acc * dt
    }

    fixPulley(){
        this.fixed = true
    }

    unfixPulley() {
        this.fixed = false
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

    setPulleyNumber(num: number) {
        this.pulleyNumber = num
    }

    setAcceleration(acc: number) {
        this.acc = acc
    }

    get leftPos(): Position {
        return {
            x: this.pos.x - this.radius,
            y: this.pos.y
        }
    }

    get rightPos(): Position {
        return {
            x: this.pos.x + this.radius,
            y: this.pos.y
        }
    }
}