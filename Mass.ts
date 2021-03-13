type Position = {
    x: number,
    y: number
}

import ObjectNode = require('./ObjectNode')

interface Mass {
    id: string,
    pos: Position,
    mass: number,
    centerNode: ObjectNode
    htmlElement: HTMLElement
}

class Mass {
    constructor(pos: Position, size: number, mass: number) {
        this.pos = pos
        this.mass = mass

        //display stuff
        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add('mass')
        this.htmlElement.style.width = size + 'px'
        this.htmlElement.style.height = size + 'px'
        this.htmlElement.style.top = pos.y + 'px'
        this.htmlElement.style.left = pos.x + 'px'
        document.getElementById('workspace')!.appendChild(this.htmlElement)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }
}

export = Mass