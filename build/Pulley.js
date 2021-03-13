"use strict";
const ObjectNode = require("./ObjectNode");
class Pulley {
    constructor(pos, radius, objectOptions) {
        var _a;
        this.leftNode = new ObjectNode(this, { x: pos.x - radius, y: pos.y });
        this.rightNode = new ObjectNode(this, { x: pos.x + radius, y: pos.y });
        this.centerNode = new ObjectNode(this, { x: pos.x, y: pos.y });
        this.mass = (_a = objectOptions.mass) !== null && _a !== void 0 ? _a : 0;
        //display stuff
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add('pulley');
        document.getElementById('workspace').appendChild(this.htmlElement);
        this.htmlElement.style.width = (radius - 1) * 2 + 'px';
        this.htmlElement.style.height = (radius - 1) * 2 + 'px';
        this.htmlElement.style.top = (pos.y - radius - 1) + 'px';
        this.htmlElement.style.left = (pos.x - radius - 1) + 'px';
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = Pulley;
