"use strict";
const ObjectNode = require("./ObjectNode");
class Pulley {
    constructor(pos, radius, objectOptions) {
        var _a;
        this.leftNode = new ObjectNode(this, { x: pos.x - (radius - 7), y: pos.y });
        this.rightNode = new ObjectNode(this, { x: pos.x + radius - 2, y: pos.y });
        this.centerNode = new ObjectNode(this, { x: pos.x, y: pos.y });
        this.mass = (_a = objectOptions.mass) !== null && _a !== void 0 ? _a : 0;
        //display stuff
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add('pulley');
        this.htmlElement.style.width = (radius - 3) * 2 + 'px';
        this.htmlElement.style.height = (radius - 3) * 2 + 'px';
        this.htmlElement.style.top = (pos.y - radius) + 'px';
        this.htmlElement.style.left = (pos.x - (radius - 3)) + 'px';
        document.getElementById('workspace').appendChild(this.htmlElement);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = Pulley;
