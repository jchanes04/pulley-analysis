"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ObjectNode = require("./ObjectNode");
const underscore_1 = __importDefault(require("underscore"));
class RopeSegment {
    constructor(options) {
        if (options.startNode) {
            this.startNode = options.startNode;
        }
        else {
            this.startNode = new ObjectNode(this, { x: options === null || options === void 0 ? void 0 : options.startX, y: options === null || options === void 0 ? void 0 : options.startY });
        }
        if (options.endNode) {
            this.endNode = options.endNode;
        }
        else {
            this.endNode = new ObjectNode(this, { x: options === null || options === void 0 ? void 0 : options.endX, y: options === null || options === void 0 ? void 0 : options.endY });
        }
        //display stuff
        let xDiff = this.startNode.pos.x - this.endNode.pos.x;
        let yDiff = this.startNode.pos.y - this.endNode.pos.y;
        let length = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        let angle = 180 / Math.PI * Math.acos(yDiff / length);
        if (xDiff > 0) {
            angle *= -1;
        }
        if (this.endNode.pos.y > this.startNode.pos.y) {
            var top = (this.endNode.pos.y - this.startNode.pos.y) / 2 + this.startNode.pos.y;
        }
        else {
            var top = (this.startNode.pos.y - this.endNode.pos.y) / 2 + this.endNode.pos.y;
        }
        top -= length / 2;
        if (this.endNode.pos.x > this.startNode.pos.x) {
            var left = (this.endNode.pos.x - this.startNode.pos.x) / 2 + this.startNode.pos.x;
        }
        else {
            var left = (this.startNode.pos.x - this.endNode.pos.x) / 2 + this.endNode.pos.x;
        }
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("rope-segment");
        this.htmlElement.style.transform = `rotate(${angle}deg)`;
        this.htmlElement.style.height = length + 'px';
        this.htmlElement.style.top = top + 'px';
        this.htmlElement.style.left = (left - 1) + 'px';
        document.getElementById("workspace").appendChild(this.htmlElement);
        this.ropeLabel = document.createElement("div");
        this.ropeLabel.classList.add("label");
        this.ropeLabel.style.height = length + 'px';
        this.ropeLabel.style.top = (top + length / 2) + 'px';
        this.ropeLabel.style.left = (left + 3) + 'px';
        document.getElementById("workspace").appendChild(this.ropeLabel);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
    isConnectedTo(node) {
        return (underscore_1.default.isEqual(this.startNode.pos, node.pos) || underscore_1.default.isEqual(this.endNode.pos, node.pos)); //technically this should be an XOR not OR ( one rope segment should not be connected to the left AND right side of the pulley)
    }
    loopsAround(pulley) {
        return (this.isConnectedTo(pulley.leftNode) || this.isConnectedTo(pulley.rightNode));
    }
    loopsUpAround(pulley) {
        return (this.loopsAround(pulley) &&
            Math.min(this.startNode.pos.y, this.endNode.pos.y) < pulley.pos.y);
    }
    loopsDownAround(pulley) {
        return (this.loopsAround(pulley) &&
            Math.max(this.startNode.pos.y, this.endNode.pos.y) > pulley.pos.y);
    }
    pullsStraightUpOn(obj) {
        return (this.isConnectedTo(obj.centerNode) &&
            Math.min(this.startNode.pos.y, this.endNode.pos.y) < obj.pos.y);
    }
    pullsStraightDownOn(obj) {
        return (this.isConnectedTo(obj.centerNode) &&
            Math.max(this.startNode.pos.y, this.endNode.pos.y) > obj.pos.y);
    }
}
module.exports = RopeSegment;
