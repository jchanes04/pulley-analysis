"use strict";
const index_1 = require("./index");
class Mass {
    constructor(pos, dimensions, mass) {
        this.pos = pos;
        this.mass = mass;
        this.dimensions = dimensions;
        this.vel = 0;
        this.acc = 0;
    }
    render() {
        index_1.ctx.beginPath();
        index_1.ctx.lineWidth = 3;
        index_1.ctx.strokeStyle = "#000";
        index_1.ctx.rect(this.pos.x - this.dimensions.width / 2, this.pos.y - this.dimensions.height / 2, this.dimensions.width, this.dimensions.height);
        index_1.ctx.stroke();
        return [this.pos];
    }
    update(dt) {
        this.pos.y += this.vel * dt;
        this.vel += this.acc * dt;
    }
    setID(id) {
        this.id = id;
    }
    move(pos) {
        this.pos = pos;
    }
    setAcceleration(acc) {
        this.acc = acc;
    }
}
module.exports = Mass;
