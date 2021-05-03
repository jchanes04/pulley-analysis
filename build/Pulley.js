"use strict";
const index_1 = require("./index");
class Pulley {
    constructor(pos, radius, objectOptions) {
        var _a;
        this.pos = pos;
        // this.leftNode = new ObjectNode(this, { x: pos.x - radius , y: pos.y })
        // this.rightNode = new ObjectNode(this, { x: pos.x + radius, y: pos.y })
        // this.centerNode = new ObjectNode(this, pos)
        this.mass = ((isNaN((_a = objectOptions === null || objectOptions === void 0 ? void 0 : objectOptions.mass) !== null && _a !== void 0 ? _a : NaN)) ? 0 : objectOptions === null || objectOptions === void 0 ? void 0 : objectOptions.mass) || 0;
        this.radius = radius;
        this.vel = 0;
        this.acc = 0;
        //display stuff
        // this.htmlElement = document.createElement("div")
        // this.htmlElement.classList.add('pulley')
        // this.htmlElement.style.width = (2 * radius - 2) + 'px'
        // this.htmlElement.style.height = (2 * radius - 2) + 'px'
        // this.htmlElement.style.top = (pos.y - 1 - radius) + 'px'
        // this.htmlElement.style.left = (pos.x - 1 - radius) + 'px'
        // document.getElementById('workspace')!.appendChild(this.htmlElement)
        //displaying the label ("P1", "P2", etc.)
        // this.pulleyLabel = document.createElement("div")
        // this.pulleyLabel.classList.add('label')
        // this.pulleyLabel.style.top = (pos.y+.16*radius)  + 'px'
        // this.pulleyLabel.style.left = (pos.x+.16*radius) + 'px'
        // document.getElementById('workspace')!.appendChild(this.pulleyLabel)
    }
    render() {
        index_1.ctx.beginPath();
        index_1.ctx.lineWidth = 3;
        index_1.ctx.strokeStyle = "#000";
        index_1.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        index_1.ctx.stroke();
        return [this.pos, { x: this.pos.x - this.radius, y: this.pos.y }, { x: this.pos.x + this.radius, y: this.pos.y }];
    }
    update(dt) {
        this.pos.y += this.vel * dt;
        this.vel += this.acc * dt;
    }
    setID(id) {
        this.id = id;
        // this.htmlElement.dataset.ID = this.id
    }
    fixPulley() {
        this.fixed = true;
    }
    move(node, pos) {
        if (node === "right") {
            this.pos = { x: pos.x - this.radius, y: pos.y };
        }
        else if (node === "center") {
            this.pos = pos;
        }
        else if (node === "left") {
            this.pos = { x: pos.x + this.radius, y: pos.y };
        }
    }
    setAcceleration(acc) {
        this.acc = acc;
    }
}
module.exports = Pulley;
