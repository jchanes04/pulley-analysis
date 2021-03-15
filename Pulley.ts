type Position = {
    x: number,
    y: number
}

import ObjectNode = require('./ObjectNode')

interface Pulley {
    id: string,
    pos: Position,
    mass: number,
    fixed: boolean,
    pulleyNumber: number,
    leftNode: ObjectNode,
    rightNode: ObjectNode,
    centerNode: ObjectNode,
    htmlElement: HTMLElement
}
class Pulley {
    constructor(pos: Position, radius: number, objectOptions: { mass?: number, isFixed?: boolean }) {
        this.leftNode = new ObjectNode(this, { x: pos.x - radius , y: pos.y })
        this.rightNode = new ObjectNode(this, { x: pos.x + radius, y: pos.y })
        this.centerNode = new ObjectNode(this, pos)

        this.mass = objectOptions.mass ?? 0
        
        //display stuff
        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add('pulley')
        this.htmlElement.style.width = (2 * radius - 2) + 'px'
        this.htmlElement.style.height = (2 * radius - 2) + 'px'
        this.htmlElement.style.top = (pos.y - 1 - radius) + 'px'
        this.htmlElement.style.left = (pos.x - 1 - radius) + 'px'

        document.getElementById('workspace')!.appendChild(this.htmlElement)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    fixPulley(){
        this.fixed = true
    }
}

export = Pulley