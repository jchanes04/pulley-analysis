"use strict";
const ObjectNode = require("./ObjectNode");
class CommandManager {
    constructor() {
        this.editStack = []; // edits that have been made, can be undone
        this.undoStack = []; // edits that have already been undone and can be redone
    }
    add(edit) {
        this.editStack.unshift(edit);
        this.undoStack = [];
    }
    undo() {
        var _a, _b;
        if (this.editStack.length > 0) {
            let undone = this.editStack.shift();
            switch (undone.type) {
                case "create": {
                    let createdElement = globalElementList[undone.objectIDs[0]];
                    if (!(createdElement instanceof ObjectNode)) {
                        let nodesToDelete = createdElement.delete();
                        delete globalElementList[undone.objectIDs[0]];
                        nodesToDelete.forEach(node => {
                            node.delete();
                            delete globalElementList[node.id];
                        });
                        this.undoStack.unshift({
                            type: "create",
                            objectIDs: undone.objectIDs,
                            data: {
                                objectData: createdElement,
                                nodesToRender: nodesToDelete
                            }
                        });
                    }
                    break;
                }
                case "move": {
                    let movedNodes = undone.objectIDs.map(id => globalElementList[id]);
                    movedNodes.forEach(node => {
                        node.move(undone.data.oldPosition, false);
                    });
                    this.undoStack.unshift({
                        type: "move",
                        objectIDs: undone.objectIDs,
                        data: {
                            oldPosition: (_a = undone.data) === null || _a === void 0 ? void 0 : _a.oldPosition,
                            newPosition: (_b = undone.data) === null || _b === void 0 ? void 0 : _b.newPosition
                        }
                    });
                    break;
                }
            }
        }
    }
    redo() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (this.undoStack.length > 0) {
            let redone = this.undoStack.shift();
            switch (redone.type) {
                case "create": {
                    (_b = (_a = redone.data) === null || _a === void 0 ? void 0 : _a.objectData) === null || _b === void 0 ? void 0 : _b.render();
                    (_d = (_c = redone.data) === null || _c === void 0 ? void 0 : _c.nodesToRender) === null || _d === void 0 ? void 0 : _d.forEach(node => {
                        node.render();
                    });
                    globalElementList[redone.objectIDs[0]] = (_e = redone.data) === null || _e === void 0 ? void 0 : _e.objectData;
                    (_g = (_f = redone.data) === null || _f === void 0 ? void 0 : _f.nodesToRender) === null || _g === void 0 ? void 0 : _g.forEach(node => {
                        globalElementList[node.id] = node;
                    });
                    this.editStack.unshift({
                        type: "create",
                        objectIDs: redone.objectIDs
                    });
                    break;
                }
                case "move": {
                    let movedNodes = redone.objectIDs.map(id => globalElementList[id]);
                    movedNodes.forEach(node => {
                        node.move(redone.data.newPosition, false);
                    });
                    this.editStack.unshift({
                        type: "move",
                        objectIDs: redone.objectIDs,
                        data: {
                            oldPosition: (_h = redone.data) === null || _h === void 0 ? void 0 : _h.oldPosition,
                            newPosition: (_j = redone.data) === null || _j === void 0 ? void 0 : _j.newPosition
                        }
                    });
                    break;
                }
            }
        }
    }
}
module.exports = CommandManager;
