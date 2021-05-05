"use strict";
const index_1 = require("./index");
class RopeSegment {
    constructor(startPos, endPos) {
        this.startPos = startPos;
        this.endPos = endPos;
    }
    render() {
        index_1.ctx.beginPath();
        index_1.ctx.moveTo(this.startPos.x, this.startPos.y);
        index_1.ctx.lineWidth = 3;
        index_1.ctx.strokeStyle = "red";
        index_1.ctx.lineTo(this.endPos.x, this.endPos.y);
        index_1.ctx.stroke();
        return [this.startPos, this.endPos];
    }
    update() {
    }
    setID(id) {
        this.id = id;
    }
    move(node, pos) {
        if (node === "start") {
            this.startPos = pos;
        }
        else if (node === "end") {
            this.endPos = pos;
        }
    }
}
module.exports = RopeSegment;
