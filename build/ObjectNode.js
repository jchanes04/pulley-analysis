"use strict";
class ObjectNode {
    constructor(parent, pos) {
        this.parent = parent !== null && parent !== void 0 ? parent : null;
        this.pos = pos;
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add("object-node");
        document.getElementById("workspace").appendChild(this.htmlElement);
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
    move(pos, alreadyMovedParent) {
        var _a, _b;
        this.pos = pos;
        this.htmlElement.style.left = (pos.x - this.htmlElement.offsetWidth / 2) + 'px';
        this.htmlElement.style.top = (pos.y - this.htmlElement.offsetHeight / 2) + 'px';
        if (alreadyMovedParent) {
            return;
        }
        else {
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.move(pos, this.id);
            let objectsToMove = [];
            if (((_b = this.parent) === null || _b === void 0 ? void 0 : _b.constructor.name) === "Pulley") {
                if (this.id === (this.parent.rightNode.id)) {
                    objectsToMove.push({ id: this.parent.centerNode.id, pos: pos });
                    objectsToMove.push({ id: this.parent.leftNode.id, pos: { x: pos.x - 2 * this.parent.radius, y: pos.y } });
                }
            }
        }
    }
    delete() {
        this.htmlElement.remove();
    }
    render() {
        document.getElementById("workspace").appendChild(this.htmlElement);
    }
}
module.exports = ObjectNode;
