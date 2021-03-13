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
        document.getElementById("workspace")!.appendChild(this.htmlElement)
        console.log(this.htmlElement.offsetWidth)
        this.htmlElement.style.left = (elementOptions.x - this.htmlElement.offsetWidth / 2) + 'px'
        this.htmlElement.style.top = (elementOptions.y - this.htmlElement.offsetHeight / 2) + 'px'
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    setParent(parent: SimulationObject) {
        this.parent = parent
    }
}

export = ObjectNode