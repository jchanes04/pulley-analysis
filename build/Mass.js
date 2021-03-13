"use strict";
class Mass {
    constructor(pos, size, mass) {
        this.pos = pos;
        this.mass = mass;
        //display stuff
        this.htmlElement = document.createElement("div");
        this.htmlElement.classList.add('mass');
        this.htmlElement.style.width = size + 'px';
        this.htmlElement.style.height = size + 'px';
        this.htmlElement.style.top = pos.y + 'px';
        this.htmlElement.style.left = pos.x + 'px';
        document.getElementById('workspace').appendChild(this.htmlElement);
    }
    setID(id) {
        this.id = id;
        this.htmlElement.dataset.ID = this.id;
    }
}
module.exports = Mass;
