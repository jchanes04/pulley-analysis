"use strict";
const ObjectNode = require("./ObjectNode");
class Pulley {
    constructor(pos, radius, objectOptions) {
        var _a;
        this.pos = pos;
        this.leftNode = new ObjectNode(this, { x: pos.x - radius, y: pos.y });
        this.rightNode = new ObjectNode(this, { x: pos.x + radius, y: pos.y });
        this.centerNode = new ObjectNode(this, pos);
        this.mass = (_a = objectOptions.mass) !== null && _a !== void 0 ? _a : 0;
        //display stuff
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add('pulley');
        this.htmlElement.style.width = (2 * radius - 2) + 'px';
        this.htmlElement.style.height = (2 * radius - 2) + 'px';
        this.htmlElement.style.top = (pos.y - 1 - radius) + 'px';
        this.htmlElement.style.left = (pos.x - 1 - radius) + 'px';
        document.getElementById('workspace').appendChild(this.htmlElement);
        this.pulleyLabel = document.createElement("div");
        this.pulleyLabel.classList.add('label');
        this.pulleyLabel.style.top = (pos.y + .16 * radius) + 'px';
        this.pulleyLabel.style.left = (pos.x + .16 * radius) + 'px';
        document.getElementById('workspace').appendChild(this.pulleyLabel);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
    fixPulley() {
        this.fixed = true;
    }
}
module.exports = Pulley;
