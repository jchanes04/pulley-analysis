import ObjectNode = require('./ObjectNode')
import Pulley = require('./Pulley')
import _ from "underscore"
import Mass = require('./Mass')
import { doesNotThrow } from 'assert'


interface RopeSegment {
    id: string
    startNode: ObjectNode,
    endNode: ObjectNode,
    tensionNumber: number, //keeps track if the rope segment is part of greater rope with tension T_1, T_2, etc.
    htmlElement: HTMLElement
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
        this.ropeLabel.style.top = (top+length/2) + 'px'
        this.ropeLabel.style.left = (left+3) + 'px'
        document.getElementById("workspace")!.appendChild(this.ropeLabel)
    }

    setID(id: string) {
        this.id = id
        this.htmlElement.dataset.ID = this.id
    }

    isConnectedToLeftNodeOf(pulley: Pulley) {
        return (_.isEqual(this.startNode.pos, pulley.leftNode.pos) || _.isEqual(this.endNode.pos, pulley.leftNode.pos))
    }

    isConnectedToRightNodeOf(pulley: Pulley) {
        return (_.isEqual(this.startNode.pos, pulley.rightNode.pos) || _.isEqual(this.endNode.pos, pulley.rightNode.pos))
    }

    isConnectedToCenterNodeOf(pulley: Pulley) {
        return (_.isEqual(this.startNode.pos, pulley.centerNode.pos) || _.isEqual(this.endNode.pos, pulley.centerNode.pos))
    }

    loopsAround(pulley: Pulley) {
        return (this.isConnectedToLeftNodeOf(pulley) || this.isConnectedToRightNodeOf(pulley))
    }

    directionOfPullOnMass(mass : Mass){
        if(Math.max(this.startNode.pos.y, this.endNode.pos.y) < mass.pos.y){
            return "up"
        }
        else return "down"
    }

    isConnectedToMass(mass : Mass){
        return (_.isEqual(this.startNode.pos, mass.pos) || _.isEqual(this.endNode.pos, mass.pos))
    }
}

export = RopeSegment