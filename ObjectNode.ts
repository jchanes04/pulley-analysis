import Pulley = require('./Pulley')
import RopeSegment = require('./RopeSegment')
import Mass = require('./Mass')

type SimulationObject = Pulley | RopeSegment | Mass

interface ObjectNode {
    id: string,
    parent: SimulationObject | null,
    x: number,
    y: number,
    htmlElement: HTMLElement
}
class ObjectNode {
    constructor(parent: SimulationObject, elementOptions: { x: number, y: number }) {
        this.parent = parent ?? null

        this.x = elementOptions.x
        this.y = elementOptions.y

        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add("object-node")
        this.htmlElement.style.left = (elementOptions.x - 3.5) + 'px'
        this.htmlElement.style.top = (elementOptions.y - 4.5) + 'px'
        document.getElementById("workspace")!.appendChild(this.htmlElement)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }
}

export = ObjectNode