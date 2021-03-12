type Position = {
    x: number,
    y: number
}

type SimulationObject = RopeSegment | RopeObject | PulleyObject

type IDList = Record<string, SimulationObject | ObjectNode>

const workspace: HTMLElement = document.getElementById("workspace")!
var mode: string = 'a' //'a' for anchoring     's' for sizing   'n' for sizing after first selecting a node
var firstClickPos: Position, firstClickNode: ObjectNode
var globalIDList: IDList = {}

workspace.onclick = (event: MouseEvent) => {
    let selectedObject = (<HTMLInputElement>document.querySelector('input[name="selected-object"]:checked'))?.value //getting the pulley/rope/mass type of selected-object
    let pos = getMousePos(event)
    let nodeTargeted: boolean = (<HTMLElement>event?.target)?.classList?.contains?.("object-node")
    let targetNodeID: string = (<HTMLElement>event?.target).dataset.ID!
    switch (selectedObject) {
        case "pulley-configuration-1": {
            if (mode === 'a') {
                firstClickPos = pos
                mode = 's'
            } else if (mode === 's') {
                let createdElement = new PulleyConfiguration1(firstClickPos, 0, getDist(firstClickPos, pos), false)
                mode = 'a'
            }
            break
        }
        case "pulley-configuration-2": {
            if (mode === 'a') {
                firstClickPos = pos
                mode = 's'
            } else if (mode === 's') {
                let createdElement = new PulleyConfiguration2(firstClickPos, 0, getDist(firstClickPos, pos), false)
                mode = 'a'
            }
        } break
        case "pulley-configuration-3": {
            if (mode === 'a') {
                firstClickPos = pos
                mode = 's'
            } else if (mode === 's') {
                let createdElement = new PulleyConfiguration3(firstClickPos, 0, getDist(firstClickPos, pos), false)
                mode = 'a'
            }
        } break
        case "pulley-configuration-4": {
            if (mode === 'a') {
                firstClickPos = pos
                mode = 's'
            } else if (mode === 's') {
                let createdElement = new PulleyConfiguration4(firstClickPos, 0, getDist(firstClickPos, pos), false)
                mode = 'a'
            }
        } break
        case "rope-segment": {
            if (mode === 'a') {
                if (nodeTargeted) {
                    firstClickNode = <ObjectNode>globalIDList[targetNodeID]
                    mode = 'n'
                } else {
                    firstClickPos = pos
                    mode = 's'
                }
            } else if (mode === 's') {
                if (nodeTargeted) {
                    let newSegment = new RopeSegment({
                        startX: firstClickPos.x,
                        startY: firstClickPos.y
                    },
                    {
                        endNode: <ObjectNode>globalIDList[targetNodeID]
                    })
                } else {
                    let newSegment = new RopeSegment({
                        startX: firstClickPos.x,
                        startY: firstClickPos.y,
                        endX: pos.x,
                        endY: pos.y
                    }, {})
                    let newRope = new RopeObject([newSegment], [newSegment.startNode, newSegment.endNode])
                    newSegment.setRope(newRope)
                }
                mode = 'a'
            } else if (mode === 'n') {
                if (nodeTargeted) {
                    let newSegment = new RopeSegment({}, {
                        startNode: firstClickNode,
                        endNode: <ObjectNode>globalIDList[targetNodeID]
                    })
                } else {
                    let newSegment = new RopeSegment({
                        endX: pos.x,
                        endY: pos.y
                    },
                    {
                        startNode: firstClickNode
                    })
                }
                mode = 'a'
            }
        } break
        // case "mass-configuration-1": {
        //     if (mode === 'a') {
        //         firstClickPos = pos
        //         mode = 's'
        //     } else if (mode === 's') {
        //         let createdElement = new MassConfiguration1()
        //     }
        // }
        // case "mass-configuration-2": {
        //     if (mode === 'a') {
        //         firstClickPos = pos
        //         mode = 's'
        //     } else if (mode === 's') {
        //         let createdElement = new MassConfiguration2()
        //     }
        // }
    }
}

function getMousePos(evt: MouseEvent) {
    var rect = workspace.getBoundingClientRect()
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    }
}

function getDist(pos1: Position, pos2: Position) {
    return (Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2))
}

interface PulleyConfiguration1 {
    pulley: PulleyObject,
    ropeAround: RopeObject,
    ropeUp: RopeObject
}

class PulleyConfiguration1 {
    constructor(position: Position, mass: number, radius: number, isFixed: boolean) {
        this.pulley = new PulleyObject(position, radius - 2, {})

        let ropeSegmentUp = new RopeSegment({
            endX: position.x,
            endY: position.y - 2 * radius
        },
        {
            startNode: this.pulley.centerNode
        })
        let ropeSegmentLeft = new RopeSegment({
            endX: position.x - radius + 1,
            endY: position.y + 2 * radius
        },
        {
            startNode: this.pulley.leftNode
        })
        let ropeSegmentRight = new RopeSegment({
            endX: position.x + radius - 1,
            endY: position.y + 2 * radius
        },
        {
            startNode: this.pulley.rightNode
        })
        this.ropeAround = new RopeObject([ropeSegmentLeft, ropeSegmentRight], [ropeSegmentLeft.startNode, ropeSegmentLeft.endNode, ropeSegmentRight.startNode, ropeSegmentRight.endNode])
        this.ropeUp = new RopeObject([ropeSegmentUp], [ropeSegmentUp.startNode, ropeSegmentUp.endNode])
    }
}

interface PulleyConfiguration2 {
    pulley: PulleyObject,
    ropeAround: RopeObject,
    ropeUp: RopeObject,
    ropeDown: RopeObject
}

class PulleyConfiguration2 extends PulleyConfiguration1 {
    constructor(position: Position, mass: number, radius: number, isFixed: boolean) {
        super(position, mass, radius, isFixed)
        let ropeSegmentDown = new RopeSegment({
            startX: position.x,
            startY: position.y,
            endX: position.x,
            endY: position.y + 2 * radius
        }, {})
        this.ropeDown = new RopeObject([ropeSegmentDown], [ropeSegmentDown.startNode, ropeSegmentDown.endNode])
    }
}

interface PulleyConfiguration3 {
    pulley: PulleyObject,
    ropeAround: RopeObject,
    ropeDown: RopeObject
}

class PulleyConfiguration3 {
    constructor(position: Position, mass: number, radius: number, isFixed: boolean) {
        this.pulley = new PulleyObject(position, radius - 2, {})

        let ropeSegmentDown = new RopeSegment({
            startX: position.x,
            startY: position.y,
            endX: position.x,
            endY: position.y - 2 * radius
        }, {})
        let ropeSegmentLeft = new RopeSegment({
            startX: position.x - radius + 1,
            startY: position.y,
            endX: position.x - radius + 1,
            endY: position.y - 2 * radius
        }, {})
        let ropeSegmentRight = new RopeSegment({
            startX: position.x + radius - 1,
            startY: position.y,
            endX: position.x + radius - 1,
            endY: position.y - 2 * radius
        }, {})
        this.ropeAround = new RopeObject([ropeSegmentLeft, ropeSegmentRight], [ropeSegmentLeft.startNode, ropeSegmentLeft.endNode, ropeSegmentRight.startNode, ropeSegmentRight.endNode])
        this.ropeDown = new RopeObject([ropeSegmentDown], [ropeSegmentDown.startNode, ropeSegmentDown.endNode])
    }
}

interface PulleyConfiguration4 {
    pulley: PulleyObject,
    ropeAround: RopeObject,
    ropeDown: RopeObject,
    ropeUp: RopeObject
}

class PulleyConfiguration4 extends PulleyConfiguration3 {
    constructor(position: Position, mass: number, radius: number, isFixed: boolean) {
        super(position, mass, radius, isFixed)
        let ropeSegmentUp = new RopeSegment({
            startX: position.x,
            startY: position.y,
            endX: position.x,
            endY: position.y - 2 * radius
        }, {})
        this.ropeUp = new RopeObject([ropeSegmentUp], [ropeSegmentUp.startNode, ropeSegmentUp.endNode])
    }
}

type NodeAttachments = Array<SimulationObject>

interface ObjectNode {
    id: string,
    parent: SimulationObject | null,
    x: number,
    y: number,
    htmlElement: HTMLElement,
    inputNode: boolean,
    outputNode: boolean,
    attachments: NodeAttachments
}

class ObjectNode {
    constructor(parent: SimulationObject, elementOptions: {x: number, y: number}, nodeOptions: {inputNode?: boolean, outputNode?: boolean, attachments: NodeAttachments}) {
        while (this.id in globalIDList || this.id === undefined) {
            this.id = (Math.floor(Math.random() * 1000000)).toString() //generating a random ID from 0-999999
        }
        globalIDList[this.id] = this

        this.parent = parent ?? null

        this.x = elementOptions.x
        this.y = elementOptions.y

        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add("object-node")
        this.htmlElement.dataset.ID = this.id
        this.htmlElement.style.left = (elementOptions.x - 3.5) + 'px'
        this.htmlElement.style.top = (elementOptions.y - 4.5) + 'px'
        document.getElementById("workspace")!.appendChild(this.htmlElement)

        if (nodeOptions?.inputNode === true) {
            this.inputNode = true
        } else {
            this.inputNode = false
        }

        if (nodeOptions?.outputNode === true) {
            this.outputNode = true
        } else {
            this.outputNode = false
        }

        if (Array.isArray(nodeOptions?.attachments)) {
            this.attachments = nodeOptions?.attachments
        } else {
            this.attachments = []
        }
    }

    addAttachment(att: SimulationObject) {
        if ('') {
            if (this.attachments.length < 3) {
                this.attachments.push(att)
                return true
            } else {
                return false
            }
        } else {
            if (this.attachments.length < 2) {
                this.attachments.push(att)
                return true
            } else {
                return false
            }
        }
    }
}

interface RopeSegment {
    id: string
    valid: boolean
    startNode: ObjectNode,
    endNode: ObjectNode,
    htmlElement: HTMLElement,
    rope?: RopeObject
}

class RopeSegment {
    constructor(elementOptions: {startX?: number, startY?: number, endX?: number, endY?: number}, objectOptions: {startNode?: ObjectNode, endNode?: ObjectNode}) {
        while (this.id in globalIDList || this.id === undefined) {
            this.id = Math.floor(Math.random() * 1000000).toString() //generating a random ID from 0-999999
        }
        globalIDList[this.id] = this

        this.valid = false

        if (objectOptions?.startNode) {
            this.startNode = objectOptions.startNode
            let validAttachment = objectOptions.startNode.addAttachment(this)
            if (!validAttachment) {
                return
            }
        } else {
            this.startNode = new ObjectNode(this, { x: elementOptions?.startX!, y: elementOptions?.startY! }, { attachments: [this] })
        }
        
        if (objectOptions?.endNode) {
            this.endNode = objectOptions.endNode
            let validAttachment = objectOptions.endNode.addAttachment(this)
            if (!validAttachment) {
                return
            }
        } else {
            this.endNode = new ObjectNode(this, { x: elementOptions?.endX!, y: elementOptions?.endY! }, { attachments: [this] })
        }

        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add("rope-segment")
        this.htmlElement.dataset.ID = this.id.toString()


        let xDiff = this.startNode.x - this.endNode.x
        let yDiff = this.startNode.y - this.endNode.y
        let length = Math.sqrt(xDiff ** 2 + yDiff ** 2)
        this.htmlElement.style.height = length + 'px'
        let angle = 180 / Math.PI * Math.acos(yDiff / length)

        if (xDiff > 0) {
            angle *= -1
        }

        this.htmlElement.style.webkitTransform = `rotate(${angle}deg)`

        if (this.endNode.y > this.startNode.y) {
            var top = (this.endNode.y - this.startNode.y) / 2 + this.startNode.y;
        } else {
            var top = (this.startNode.y - this.endNode.y) / 2 + this.endNode.y;
        }
        top -= length / 2

        if (this.endNode.x > this.startNode.x) {
            var left = (this.endNode.x - this.startNode.x) / 2 + this.startNode.x;
        } else {
            var left = (this.startNode.x - this.endNode.x) / 2 + this.endNode.x;
        }

        this.htmlElement.style.top = top + 'px'
        this.htmlElement.style.left = (left - 1) + 'px'

        this.valid = true

        document.getElementById("workspace")!.appendChild(this.htmlElement)
    }

    setRope(rope: RopeObject) {
        this.rope = rope
    }
}

interface RopeObject {
    id: string,
    tension: number | null,
    segments: Array<RopeSegment>,
    nodes: Array<ObjectNode>
}

class RopeObject {
    constructor(segments: Array<RopeSegment>, nodes: Array<ObjectNode>) {
        while (this.id in globalIDList || this.id === undefined) {
            this.id = Math.floor(Math.random() * 1000000).toString() //generating a random ID from 0-999999
        }
        globalIDList[this.id] = this

        this.tension = null

        if (Array.isArray(segments) && !segments.some(item => !item.valid)) {
            this.segments = segments
        } else {
            this.segments = []
        }

        if (Array.isArray(nodes)) {
            this.nodes = nodes
        } else {
            this.nodes = []
        }
    }

    static joinRopes(ropes: Array<RopeObject>): RopeObject {
        let newRopeSegments = ropes.reduce((segmentsArray: Array<RopeSegment>, currentRope: RopeObject) => {return segmentsArray.concat(currentRope.segments)})
        return new RopeObject(ropes.reduce((segmentsArray: Array<RopeSegment>, currentRope: <RopeObject>) => {return segmentsArray.concat(currentRope.segments)}))
    }
}

interface PulleyObject {
    id: string,
    valid: boolean,
    leftNode: ObjectNode,
    rightNode: ObjectNode,
    centerNode: ObjectNode
    htmlElement: HTMLElement
}

class PulleyObject {
    constructor(pos: Position, radius: number, objectOptions: {leftNode?: ObjectNode, rightNode?: ObjectNode, centerNode?: ObjectNode}) {
        while (this.id in globalIDList || this.id === undefined) {
            this.id = Math.floor(Math.random() * 1000000).toString() //generating a random ID from 0-999999
        }
        globalIDList[this.id] = this

        this.valid = false

        if (objectOptions?.leftNode) {
            this.leftNode = objectOptions?.leftNode
            let validAttachment = objectOptions.leftNode.addAttachment(this)
            if (!validAttachment) {
                return
            }
        } else {
            this.leftNode = new ObjectNode(this, {x: pos.x - radius + 1, y: pos.y}, {attachments: [this]})
        }

        if (objectOptions?.rightNode) {
            this.rightNode = objectOptions?.rightNode
            let validAttachment = objectOptions.rightNode.addAttachment(this)
            if (!validAttachment) {
                return
            }
        } else {
            this.rightNode = new ObjectNode(this, {x: pos.x + radius + 3, y: pos.y}, {attachments: [this]})
        }

        if (objectOptions?.centerNode) {
            this.rightNode = objectOptions?.centerNode
            let validAttachment = objectOptions.centerNode.addAttachment(this)
            if (!validAttachment) {
                return
            }
        } else {
            this.centerNode = new ObjectNode(this, {x: pos.x + 2, y: pos.y}, {attachments: [this]})
        }

        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add('pulley')
        this.htmlElement.dataset.ID = this.id
        this.htmlElement.style.width = radius * 2 + 'px'
        this.htmlElement.style.height = radius * 2 + 'px'
        this.htmlElement.style.top = (pos.y - radius) + 'px'
        this.htmlElement.style.left = (pos.x - radius) + 'px'
        document.getElementById('workspace')!.appendChild(this.htmlElement)
    }
}



// class MassConfiguration1 {
//     constructor(x, y, s, mass) { //s holds sidelength
//         this.htmlElement = document.createElement("div")
//         this.htmlElement.classList.add('pulley')
//         this.htmlElement.dataset.ID = this.id
//         this.htmlElement.style.width = s + 'px'
//         this.htmlElement.style.height = s + 'px'
//         this.htmlElement.style.top = (y - s/2) + 'px'
//         this.htmlElement.style.left = (x - s/2) + 'px'
// 
//         let ropeSegmentUp = new RopeSegment({
//             startX: position.x + radius - 1,
//             startY: position.y,
//             endX: position.x + radius - 1,
//             endY: position.y + 2 * radius
//         })
//         this.ropeUp = new RopeObject([ropeSegmentUp])
// 
//         
//         document.getElementById('workspace').appendChild(this.htmlElement)
//     }
// }



//class MassConfiguration2 {
//    constructor(x, y, s, mass) {
//        this.htmlElement = document.createElement("div")
//        this.htmlElement.classList.add('pulley')
//        this.htmlElement.dataset.ID = this.id
//        this.htmlElement.style.width = s + 'px'
//        this.htmlElement.style.height = s + 'px'
//        this.htmlElement.style.top = (y - s/2) + 'px'
//        this.htmlElement.style.left = (x - s/2) + 'px'
//
//        let ropeSegmentUp = new RopeSegment({
//            startX: x + radius - 1,
//            startY: y,
//            endX: x + radius - 1,
//            endY: y + 2 * radius
//        })
//        
//        let ropeSegmentUp = new RopeSegment({
//            startX: x + radius - 1,
//            startY: y,
//            endX: x + radius - 1,
//            endY: y + 2 * radius
//        })
//
//        this.ropeUp = new RopeObject([ropeSegmentUp])
//        this.ropeDown = new RopeObject([ropeSegmentDown])
//        
//        document.getElementById('workspace').appendChild(this.htmlElement)
//    }
//}