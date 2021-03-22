type Position = {
    x: number,
    y: number
}

import ObjectNode = require('./ObjectNode')
import Pulley = require('./Pulley')
import _ from "underscore"
import Mass = require('./Mass')


interface RopeSegment {
    id: string
    startNode: ObjectNode,
    endNode: ObjectNode,
    ropeNumber: number, //keeps track if the rope segment is part of greater rope with tension T_1, T_2, etc.
    htmlElement: HTMLElement,
    ropeLabel: HTMLElement
}

class RopeSegment {
    constructor(options: { startX?: number, startY?: number, endX?: number, endY?: number, startNode?: ObjectNode, endNode?: ObjectNode }) {
        if (options.startNode) {
            this.startNode = options.startNode
        } else {
            this.startNode = new ObjectNode(this, { x: options?.startX!, y: options?.startY! })
        }

        if (options.endNode) {
            this.endNode = options.endNode
        } else {
            this.endNode = new ObjectNode(this, { x: options?.endX!, y: options?.endY! })
        }

        //display stuff
        let xDiff = this.startNode.pos.x - this.endNode.pos.x
        let yDiff = this.startNode.pos.y - this.endNode.pos.y
        let length = Math.sqrt(xDiff ** 2 + yDiff ** 2)
        let angle = 180 / Math.PI * Math.acos(yDiff / length)

        if (xDiff > 0) {
            angle *= -1
        }


        if (this.endNode.pos.y > this.startNode.pos.y) {
            var top = (this.endNode.pos.y - this.startNode.pos.y) / 2 + this.startNode.pos.y;
        } else {
            var top = (this.startNode.pos.y - this.endNode.pos.y) / 2 + this.endNode.pos.y;
        }
        top -= length / 2

        if (this.endNode.pos.x > this.startNode.pos.x) {
            var left = (this.endNode.pos.x - this.startNode.pos.x) / 2 + this.startNode.pos.x;
        } else {
            var left = (this.startNode.pos.x - this.endNode.pos.x) / 2 + this.endNode.pos.x;
        }

        this.htmlElement = document.createElement("div")
        this.htmlElement.classList.add("rope-segment")
        this.htmlElement.style.transform = `rotate(${angle}deg)`
        this.htmlElement.style.height = length + 'px'
        this.htmlElement.style.top = top + 'px'
        this.htmlElement.style.left = (left - 1) + 'px'
        document.getElementById("workspace")!.appendChild(this.htmlElement)

        this.ropeLabel = document.createElement("div")
        this.ropeLabel.classList.add("label")
        this.ropeLabel.style.height = length + 'px'
        this.ropeLabel.style.top = (top + length / 2) + 'px'
        this.ropeLabel.style.left = (left + 3) + 'px'
        document.getElementById("workspace")!.appendChild(this.ropeLabel)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    isConnectedTo(node: ObjectNode) { 
        return (_.isEqual(this.startNode.pos, node.pos) || _.isEqual(this.endNode.pos, node.pos))//technically this should be an XOR not OR ( one rope segment should not be connected to the left AND right side of the pulley)
    }

    loopsAround(pulley: Pulley) {
        return (this.isConnectedTo(pulley.leftNode) || this.isConnectedTo(pulley.rightNode))
    }

    loopsUpAround(pulley: Pulley) {
        return (this.loopsAround(pulley) && 
        Math.min(this.startNode.pos.y, this.endNode.pos.y) < pulley.pos.y)
    }

    loopsDownAround(pulley: Pulley) {
        return (this.loopsAround(pulley) && 
        Math.max(this.startNode.pos.y, this.endNode.pos.y) > pulley.pos.y)
    }

    pullsStraightUpOn(obj: (Pulley | Mass)) {
        return (this.isConnectedTo(obj.centerNode) &&
        Math.min(this.startNode.pos.y, this.endNode.pos.y) < obj.pos.y)
    }

    pullsStraightDownOn(obj: (Pulley | Mass)) {
        return (this.isConnectedTo(obj.centerNode) &&
        Math.max(this.startNode.pos.y, this.endNode.pos.y) > obj.pos.y)
    }

    move(pos: Position, nodeID: string) {
        if (nodeID === this.startNode.id) {
            let xDiff = pos.x - this.endNode.pos.x
            let yDiff = pos.y - this.endNode.pos.y
            let length = Math.sqrt(xDiff ** 2 + yDiff ** 2)
            let angle = 180 / Math.PI * Math.acos(yDiff / length) //maybe change to atan2 and elimiate the proceeding polarity setting??

            if (xDiff > 0) {
                angle *= -1
            }


            if (this.endNode.pos.y > pos.y) {
                var top = (this.endNode.pos.y - pos.y) / 2 + pos.y;
            } else {
                var top = (pos.y - this.endNode.pos.y) / 2 + this.endNode.pos.y;
            }
            top -= length / 2

            if (this.endNode.pos.x > pos.x) {
                var left = (this.endNode.pos.x - pos.x) / 2 + pos.x;
            } else {
                var left = (pos.x - this.endNode.pos.x) / 2 + this.endNode.pos.x;
            }
            
            this.htmlElement.style.transform = `rotate(${angle}deg)`
            this.htmlElement.style.height = length + 'px'
            this.htmlElement.style.top = top + 'px'
            this.htmlElement.style.left = (left - 1) + 'px'
        } else if (nodeID === this.endNode.id) {
            console.log("end code running")
            let xDiff = this.startNode.pos.x - pos.x
            let yDiff = this.startNode.pos.y - pos.y
            let length = Math.sqrt(xDiff ** 2 + yDiff ** 2)
            let angle = 180 / Math.PI * Math.acos(yDiff / length)

            if (xDiff > 0) {
                angle *= -1
            }


            if (pos.y > this.startNode.pos.y) {
                var top = (pos.y - this.startNode.pos.y) / 2 + this.startNode.pos.y;
            } else {
                var top = (this.startNode.pos.y - pos.y) / 2 + pos.y;
            }
            top -= length / 2

            if (pos.x > this.startNode.pos.x) {
                var left = (pos.x - this.startNode.pos.x) / 2 + this.startNode.pos.x;
            } else {
                var left = (this.startNode.pos.x - pos.x) / 2 + pos.x;
            }
            
            this.htmlElement.style.transform = `rotate(${angle}deg)`
            this.htmlElement.style.height = length + 'px'
            this.htmlElement.style.top = top + 'px'
            this.htmlElement.style.left = (left - 1) + 'px'
        }
    }

    delete() {
        this.htmlElement.remove()
        this.ropeLabel.remove()
        return [this.startNode, this.endNode]
    }

    render() {
        document.getElementById("workspace")!.appendChild(this.htmlElement)
        document.getElementById("workspace")!.appendChild(this.ropeLabel)
    }
}

export = RopeSegment