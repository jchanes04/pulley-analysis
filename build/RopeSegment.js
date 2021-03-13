"use strict";
const ObjectNode = require("./ObjectNode");
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
        let xDiff = this.startNode.x - this.endNode.x;
        let yDiff = this.startNode.y - this.endNode.y;
        let length = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        let angle = 180 / Math.PI * Math.acos(yDiff / length);
        if (xDiff > 0) {
            angle *= -1;
        }
        if (this.endNode.y > this.startNode.y) {
            var top = (this.endNode.y - this.startNode.y) / 2 + this.startNode.y;
        }
        else {
            var top = (this.startNode.y - this.endNode.y) / 2 + this.endNode.y;
        }
        top -= length / 2;
        if (this.endNode.x > this.startNode.x) {
            var left = (this.endNode.x - this.startNode.x) / 2 + this.startNode.x;
        }
        else {
            var left = (this.startNode.x - this.endNode.x) / 2 + this.endNode.x;
        }
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("rope-segment");
        this.htmlElement.style.transform = `rotate(${angle}deg)`;
        this.htmlElement.style.height = length + 'px';
        this.htmlElement.style.top = top + 'px';
        this.htmlElement.style.left = (left - 1) + 'px';
        document.getElementById("workspace").appendChild(this.htmlElement);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = RopeSegment;
