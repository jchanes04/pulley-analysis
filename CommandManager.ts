import {globalElementList, Position, SimulationObject, Pulley, Mass, RopeSegment} from './index'

type MoveEdit = {
    type: "move",
    target: SimulationObject,
    oldPosition: Position,
    newPosition: Position,
    node: "left" | "right" | "center" | "start" | "end"
}
type CreateDeleteEdit = {
    type: "create" | "delete",
    target: SimulationObject
}
type Edit = MoveEdit | CreateDeleteEdit

interface CommandManager {
    editStack: (Edit[])[],  // array of edit arrays, so multiple edits done at once can also be undone/redone at once
    undoStack: (Edit[])[]
}

class CommandManager {
    constructor() {
        this.editStack = [] // edits that have been made, can be undone
        this.undoStack = [] // edits that have already been undone and can be redone
    }

    add(...edits: Edit[]) {
        this.editStack.unshift(edits)
        this.undoStack = []
    }

    undo() {
        if (this.editStack.length > 0) {
            let undoneEdits = this.editStack.shift()!
            let insertToStack: Edit[] = []
            for (let edit of undoneEdits) {
                switch (edit.type) {
                    case "create": {
                        let createdElement = edit.target

                        delete globalElementList[createdElement.id]

                        insertToStack.push({
                            type: "create",
                            target: createdElement
                        })
                    }; break
                    case "move": {
                        let movedElement = edit.target

                        movedElement.move(<never>edit.node, edit.oldPosition)
                        
                        insertToStack.push({
                            type: "move",
                            target: movedElement,
                            oldPosition: edit.oldPosition,
                            newPosition: edit.newPosition,
                            node: edit.node
                        })
                    }; break
                    case "delete": {
                        let deletedElement = edit.target
                        delete globalElementList[deletedElement.id]

                        insertToStack.push({
                            type: "delete",
                            target: deletedElement
                        })
                    }
                }
            }
            this.undoStack.unshift(insertToStack)
        }
    }

    redo() {
        if (this.undoStack.length > 0) {
            let redoneEdits = this.undoStack.shift()!
            let insertToStack: Edit[] = []
            for (let edit of redoneEdits) {
                switch(edit.type) {
                    case "create": {
                        let createdElement = edit.target

                        globalElementList[createdElement.id] = createdElement

                        insertToStack.push({
                            type: "create",
                            target: createdElement
                        })
                    }; break
                    case "move": {

                    }
                }
            }
            this.editStack.unshift(insertToStack)
        }
    }
}

export = CommandManager