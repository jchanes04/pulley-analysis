type Position = {
    x: number,
    y: number
}

import ObjectNode = require('./ObjectNode')

interface Mass {
    id: string,
    pos: Position,
    mass: number,
    fixed: boolean,
    massNumber: number, //keeps track of the mass number (M1, M2, etc.)
    centerNode: ObjectNode,
    htmlElement: HTMLElement,
    massLabel: HTMLElement
}

class Mass {
    constructor(pos: Position, dimensions: { width: number, height: number }, mass: number, node?: ObjectNode) {
        this.pos = pos
        this.mass = mass

        if (node) {
            this.centerNode = node
            node.setParent(this)
        } else {
            this.centerNode = new ObjectNode(this, pos)
        }

        //display stuff
        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add('mass')
        this.htmlElement.style.width = (dimensions.width - 2) + 'px'
        this.htmlElement.style.height = (dimensions.width - 2) + 'px'
        this.htmlElement.style.top = (pos.y - 1 - dimensions.height / 2) + 'px'
        this.htmlElement.style.left = (pos.x - 1 - dimensions.width / 2) + 'px'
        document.getElementById('workspace')!.appendChild(this.htmlElement)

        this.massLabel = document.createElement("div")
        this.massLabel.classList.add("label")
        this.massLabel.style.height = length + 'px'
        this.massLabel.style.top = (pos.y + 0.125 * dimensions.height) + 'px'
        this.massLabel.style.left = (pos.x - 20) + 'px'
        this.massLabel.innerText =  this.mass.toString() + " kg"
        document.getElementById("workspace")!.appendChild(this.massLabel)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    delete() {
        this.htmlElement.remove()
        this.massLabel.remove()
        return [this.centerNode]
    }

    render() {
        document.getElementById('workspace')!.appendChild(this.htmlElement)
        document.getElementById("workspace")!.appendChild(this.massLabel)
    }
}

export = Mass