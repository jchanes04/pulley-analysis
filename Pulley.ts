type Position = {
    x: number,
    y: number
}

import ObjectNode = require('./ObjectNode')

interface Pulley {
    id: string,
    pos: Position,
    mass: number,
    radius: number,
    acc: number | null,
    fixed: boolean,
    pulleyNumber: number,
    leftNode: ObjectNode,
    rightNode: ObjectNode,
    centerNode: ObjectNode,
    htmlElement: HTMLElement,
    pulleyLabel: HTMLElement
}
class Pulley {
    constructor(pos: Position, radius: number, objectOptions: { mass?: number, isFixed?: boolean }) {
        this.pos = pos
        this.leftNode = new ObjectNode(this, { x: pos.x - radius , y: pos.y })
        this.rightNode = new ObjectNode(this, { x: pos.x + radius, y: pos.y })
        this.centerNode = new ObjectNode(this, pos)

        this.mass = ((isNaN(objectOptions.mass ?? NaN)) ? 0 : objectOptions.mass) || 0
        this.radius = radius
        this.acc = null
        
        //display stuff
        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add('pulley')
        this.htmlElement.style.width = (2 * radius - 2) + 'px'
        this.htmlElement.style.height = (2 * radius - 2) + 'px'
        this.htmlElement.style.top = (pos.y - 1 - radius) + 'px'
        this.htmlElement.style.left = (pos.x - 1 - radius) + 'px'
        document.getElementById('workspace')!.appendChild(this.htmlElement)

        //displaying the label ("P1", "P2", etc.)
        this.pulleyLabel = document.createElement("div")
        this.pulleyLabel.classList.add('label')
        this.pulleyLabel.style.top = (pos.y+.16*radius)  + 'px'
        this.pulleyLabel.style.left = (pos.x+.16*radius) + 'px'
        document.getElementById('workspace')!.appendChild(this.pulleyLabel)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    fixPulley(){
        this.fixed = true
    }

    move(pos: Position, nodeID : string) {
        if (nodeID === this.rightNode.id) {
            this.pos = {x: pos.x - this.radius, y: pos.y}

            this.htmlElement.style.top = (pos.y - 1 - this.radius) + 'px'
            this.htmlElement.style.left = (pos.x - 1 - 2 * this.radius) + 'px'

            // this.centerNode.move(this.pos, true)
            // this.leftNode.move({x: pos.x - 2 * this.radius, y: pos.y}, true)
            return [this.centerNode.pos, this.leftNode.pos]
        } else if (nodeID === this.centerNode.id) {
            this.pos = pos

            this.htmlElement.style.top = (pos.y - 1 - this.radius) + 'px'
            this.htmlElement.style.left = (pos.x - 1 - this.radius) + 'px'

            this.leftNode.move({x: pos.x - this.radius, y: pos.y}, true)
            this.rightNode.move({x: pos.x + this.radius, y: pos.y}, true)
        } else if (nodeID === this.leftNode.id) {
            this.pos = {x: pos.x + this.radius, y: pos.y}

            this.htmlElement.style.top = (pos.y - 1 - this.radius) + 'px'
            this.htmlElement.style.left = (pos.x - 1) + 'px'

            this.centerNode.move({x: pos.x + this.radius, y: pos.y}, true)
            this.rightNode.move({x: pos.x + 2 * this.radius, y: pos.y}, true)
        }
    }

    setAcceleration(acc: number) {
        this.acc = acc
    }

    delete() {
        this.htmlElement.remove()
        this.pulleyLabel.remove()
        return [this.leftNode, this.rightNode, this.centerNode]
    }

    render() {
        document.getElementById('workspace')!.appendChild(this.htmlElement)
        document.getElementById('workspace')!.appendChild(this.pulleyLabel)
    }
}

export = Pulley