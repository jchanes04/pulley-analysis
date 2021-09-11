import { Position } from '../index'
import { generateID } from '../utility'

export default interface Mass {
    id: string,
    pos: Position,
    mass: number,
    vel: number,
    acc: number,
    dimensions: {width: number, height: number},
    fixed: boolean,
    massNumber: number | null, //keeps track of the mass number (M1, M2, etc.)
}

export default class Mass {
    constructor(pos: Position, dimensions: { width: number, height: number }, mass: number) {
        this.id = generateID()
        this.pos = pos
        this.mass = mass
        this.dimensions = dimensions

        this.vel = 0
        this.acc = 0

        this.massNumber = null
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#000"
        ctx.rect(this.pos.x - this.dimensions.width / 2, this.pos.y - this.dimensions.height / 2, this.dimensions.width, this.dimensions.height)
        ctx.stroke()

        return [this.pos]   // return positions of nodes to be rendered
    }

    update(dt: number) {
        this.pos.y += this.vel * dt
        this.vel += this.acc * dt
    }

    move(node: "center", pos: Position) {
        if (node === "center") {
            this.pos = pos
        }
    }

    setMassNumber(num: number) {
        this.massNumber = num
    }

    setAcceleration(acc: number) {
        this.acc = acc
    }

    fixMass() {
        this.fixed = true
    }

    unfixMass() {
        this.fixed = false
    }
}