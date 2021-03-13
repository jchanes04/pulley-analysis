"use strict";
const ObjectNode = require("./ObjectNode");
class Mass {
    constructor(pos, dimensions, mass, node) {
        this.pos = pos;
        this.mass = mass;
        if (node) {
            this.centerNode = node;
            node.setParent(this);
        }
        else {
            this.centerNode = new ObjectNode(this, pos);
        }
        //display stuff
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add('mass');
        this.htmlElement.style.width = dimensions.width + 'px';
        this.htmlElement.style.height = dimensions.height + 'px';
        this.htmlElement.style.top = (pos.y - dimensions.height / 2) + 'px';
        this.htmlElement.style.left = (pos.x - dimensions.width / 2) + 'px';
        document.getElementById('workspace').appendChild(this.htmlElement);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = Mass;
