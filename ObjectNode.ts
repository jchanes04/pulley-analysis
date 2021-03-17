type Position = {
    x: number,
    y: number
}

import Pulley = require('./Pulley')
import RopeSegment = require('./RopeSegment')
import Mass = require('./Mass')

type SimulationObject = Pulley | RopeSegment | Mass

interface ObjectNode {
    id: string,
    parent: SimulationObject | null,
    pos: Position,
    fixed: boolean,
    htmlElement: HTMLElement
}
class ObjectNode {
    constructor(parent: SimulationObject, pos: Position) {
        this.parent = parent ?? null

        this.pos = pos

        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add("object-node")
        document.getElementById("workspace")!.appendChild(this.htmlElement)
        this.htmlElement.style.left = (pos.x - this.htmlElement.offsetWidth / 2) + 'px'
        this.htmlElement.style.top = (pos.y - this.htmlElement.offsetHeight / 2) + 'px'
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    setParent(parent: SimulationObject) {
        this.parent = parent
    }

    fixNode() {
        this.fixed = true;

        if (this.parent?.constructor.name === "Pulley") {
            (<Pulley>this.parent).fixPulley()
        }

        this.htmlElement.classList.remove("object-node")
        this.htmlElement.classList.add("fixed-node")
    }

    delete() {
        this.htmlElement.remove()
    }

    render() {
        document.getElementById("workspace")!.appendChild(this.htmlElement)
    }
}

export = ObjectNode