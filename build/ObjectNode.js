"use strict";
class ObjectNode {
    constructor(parent, elementOptions) {
        this.parent = parent !== null && parent !== void 0 ? parent : null;
        this.x = elementOptions.x;
        this.y = elementOptions.y;
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("object-node");
        this.htmlElement.style.left = (elementOptions.x - 3.5) + 'px';
        this.htmlElement.style.top = (elementOptions.y - 4.5) + 'px';
        document.getElementById("workspace").appendChild(this.htmlElement);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = ObjectNode;
