"use strict";
const ObjectNode = require("./ObjectNode");
class Pulley {
    constructor(pos, radius, objectOptions) {
        this.leftNode = new ObjectNode(this, { x: pos.x - radius + 1, y: pos.y });
        this.rightNode = new ObjectNode(this, { x: pos.x + radius + 3, y: pos.y });
        this.centerNode = new ObjectNode(this, { x: pos.x + 2, y: pos.y });
        //display stuff
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add('pulley');
        this.htmlElement.style.width = radius * 2 + 'px';
        this.htmlElement.style.height = radius * 2 + 'px';
        this.htmlElement.style.top = (pos.y - radius) + 'px';
        this.htmlElement.style.left = (pos.x - radius) + 'px';
        document.getElementById('workspace').appendChild(this.htmlElement);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = Pulley;
