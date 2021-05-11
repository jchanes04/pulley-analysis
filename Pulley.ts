import {ctx, Position} from './index'

interface Pulley {
    id: string,
    pos: Position,
    mass: number,
    radius: number,
    vel: number,
    acc: number,
    fixed: boolean,
    pulleyNumber: number,
}
class Pulley {
    constructor(pos: Position, radius: number, objectOptions?: { mass?: number, isFixed?: boolean }) {
        this.pos = pos

        this.mass = ((isNaN(objectOptions?.mass ?? NaN)) ? 0 : objectOptions?.mass) || 0
        this.radius = radius

        this.vel = 0
        this.acc = 0
    }

    render() {
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

    setID(id: string) {
        this.id = id
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

export = Pulley