"use strict";
class ObjectNode {
    constructor(parent, elementOptions) {
        this.parent = parent !== null && parent !== void 0 ? parent : null;
        this.x = elementOptions.x;
        this.y = elementOptions.y;
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("object-node");
        document.getElementById("workspace").appendChild(this.htmlElement);
        console.log(this.htmlElement.offsetWidth);
        this.htmlElement.style.left = (elementOptions.x - this.htmlElement.offsetWidth / 2) + 'px';
        this.htmlElement.style.top = (elementOptions.y - this.htmlElement.offsetHeight / 2) + 'px';
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
    setParent(parent) {
        this.parent = parent;
    }
}
module.exports = ObjectNode;
