"use strict";
class ObjectNode {
    constructor(parent, pos) {
        this.parent = parent !== null && parent !== void 0 ? parent : null;
        this.pos = pos;
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("object-node");
        document.getElementById("workspace").appendChild(this.htmlElement);
        console.log(this.htmlElement.offsetWidth);
        this.htmlElement.style.left = (pos.x - this.htmlElement.offsetWidth / 2) + 'px';
        this.htmlElement.style.top = (pos.y - this.htmlElement.offsetHeight / 2) + 'px';
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
    setParent(parent) {
        this.parent = parent;
    }
    fixNode() {
        var _a;
        this.fixed = true;
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.constructor.name) === "Pulley") {
            this.parent.fixPulley();
        }
        this.htmlElement.classList.remove("object-node");
        this.htmlElement.classList.add("fixed-node");
    }
}
module.exports = ObjectNode;
