type Position = {
    x: number,
    y: number
}

import ObjectNode = require('./ObjectNode')

interface Pulley {
    id: string,
    pos: Position,
    mass: number,
    leftNode: ObjectNode,
    rightNode: ObjectNode,
    centerNode: ObjectNode,
    htmlElement: HTMLElement
}
class Pulley {
    constructor(pos: Position, radius: number, objectOptions: { mass?: number, isFixed?: boolean }) {
        this.leftNode = new ObjectNode(this, {x: pos.x - radius, y: pos.y})
        this.rightNode = new ObjectNode(this, {x: pos.x + radius, y: pos.y})
        this.centerNode = new ObjectNode(this, {x: pos.x, y: pos.y})

        this.mass = objectOptions.mass ?? 0
        //display stuff
        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add('pulley')
        document.getElementById('workspace')!.appendChild(this.htmlElement)
        this.htmlElement.style.width = (radius - 1) * 2 + 'px'
        this.htmlElement.style.height = (radius - 1) * 2 + 'px'
        this.htmlElement.style.top = (pos.y - radius - 1) + 'px'
        this.htmlElement.style.left = (pos.x - radius - 1) + 'px'
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }
}

export = Pulley