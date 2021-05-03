import {ctx, Position} from './index'

interface Mass {
    id: string,
    pos: Position,
    mass: number,
    vel: number,
    acc: number,
    dimensions: {width: number, height: number},
    fixed: boolean,
    massNumber: number, //keeps track of the mass number (M1, M2, etc.)
}

class Mass {
    constructor(pos: Position, dimensions: { width: number, height: number }, mass: number) {
        this.pos = pos
        this.mass = mass
        this.dimensions = dimensions

        this.vel = 0
        this.acc = 0
    }

    render() {
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.strokeStyle = "#000"
        ctx.rect(this.pos.x - this.dimensions.width / 2, this.pos.y - this.dimensions.height / 2, this.dimensions.width, this.dimensions.height)
        ctx.stroke()

        return [this.pos]
    }

    update(dt: number) {
        this.pos.y += this.vel * dt
        this.vel += this.acc * dt
    }

    setID(id: string) {
        this.id = id
    }

    move(pos: Position) {
        this.pos = pos
    }

    setAcceleration(acc: number) {
        this.acc = acc
    }
}

export = Mass