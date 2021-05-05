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
