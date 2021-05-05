"use strict";
const index_1 = require("./index");
class CommandManager {
    constructor() {
        this.editStack = []; // edits that have been made, can be undone
        this.undoStack = []; // edits that have already been undone and can be redone
    }
    add(...edits) {
        this.editStack.unshift(edits);
        this.undoStack = [];
    }
    undo() {
        if (this.editStack.length > 0) {
            let undoneEdits = this.editStack.shift();
            let insertToStack = [];
            for (let edit of undoneEdits) {
                switch (edit.type) {
                    case "create":
                        {
                            let createdElement = edit.target;
                            delete index_1.globalElementList[createdElement.id];
                            insertToStack.push({
                                type: "create",
                                target: createdElement
                            });
                        }
                        ;
                        break;
                    case "move":
                        {
                            let movedElement = edit.target;
                            movedElement.move(edit.node, edit.oldPosition);
                            insertToStack.push({
                                type: "move",
                                target: movedElement,
                                oldPosition: edit.oldPosition,
                                newPosition: edit.newPosition,
                                node: edit.node
                            });
                        }
                        ;
                        break;
                    case "delete": {
                        let deletedElement = edit.target;
                        delete index_1.globalElementList[deletedElement.id];
                        insertToStack.push({
                            type: "delete",
                            target: deletedElement
                        });
                    }
                }
            }
            this.undoStack.unshift(insertToStack);
        }
    }
    redo() {
        if (this.undoStack.length > 0) {
            let redoneEdits = this.undoStack.shift();
            let insertToStack = [];
            for (let edit of redoneEdits) {
                switch (edit.type) {
                    case "create":
                        {
                            let createdElement = edit.target;
                            index_1.globalElementList[createdElement.id] = createdElement;
                            insertToStack.push({
                                type: "create",
                                target: createdElement
                            });
                        }
                        ;
                        break;
                    case "move": {
                    }
                }
            }
            this.editStack.unshift(insertToStack);
        }
    }
}
module.exports = CommandManager;
