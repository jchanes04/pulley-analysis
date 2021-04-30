type Position = {
    x: number,
    y: number
}

type SimulationObject = RopeSegment | Pulley | Mass

type Edit = {
    type: "create" | "delete" | "move",
    target: SimulationObject,
    data?: {
        nodesToRender?: ObjectNode[],
        oldPosition?: Position,
        newPosition?: Position
    }
}

import Pulley = require('./Pulley')
import RopeSegment = require('./RopeSegment')
import Mass = require('./Mass')
import ObjectNode = require('./ObjectNode')

interface CommandManager {
    editStack: (Edit[])[],
    undoStack: (Edit[])[]
}

class CommandManager {
    constructor() {
        this.editStack = [] // edits that have been made, can be undone
        this.undoStack = [] // edits that have already been undone and can be redone
    }

    add(edit: Edit) {
        this.editStack.unshift(edit)
        this.undoStack = []
    }

    undo() {
        if (this.editStack.length > 0) {
            let undone = this.editStack.shift()!

            switch (undone.type) {
                case "create": {
                    let createdElement = globalElementList[undone.objectIDs[0]]

                    if (!(createdElement instanceof ObjectNode)) {
                        let nodesToDelete = createdElement.delete()
                        delete globalElementList[undone.objectIDs[0]]
                        nodesToDelete.forEach(node => {
                            node.delete()
                            delete globalElementList[node.id]
                        })
                        this.undoStack.unshift({
                            type: "create",
                            objectIDs: undone.objectIDs,
                            data: {
                                objectData: createdElement,
                                nodesToRender: nodesToDelete
                            }
                        })
                    }
                    break
                }
                case "move": {
                    let movedNodes = undone.objectIDs.map(id => globalElementList[id])

                    movedNodes.forEach(node => {
                        (<ObjectNode>node).move(undone.data!.oldPosition!, false)
                    })
                    this.undoStack.unshift({
                        type: "move",
                        objectIDs: undone.objectIDs,
                        data: {
                            oldPosition: undone.data?.oldPosition,
                            newPosition: undone.data?.newPosition
                        }
                    })
                    break
                }
            }
        }
    }

    redo() {
        if (this.undoStack.length > 0) {
            let redone = this.undoStack.shift()!

            switch (redone.type) {
                case "create": {
                    redone.data?.objectData?.render()
                    redone.data?.nodesToRender?.forEach(node => {
                        node.render()
                    })
                    globalElementList[redone.objectIDs[0]] = redone.data?.objectData!
                    redone.data?.nodesToRender?.forEach(node => {
                        globalElementList[node.id] = node
                    })
                    this.editStack.unshift({
                        type: "create",
                        objectIDs: redone.objectIDs
                    })
                    break
                }
                case "move": {
                    let movedNodes = redone.objectIDs.map(id => globalElementList[id])

                    movedNodes.forEach(node => {
                        (<ObjectNode>node).move(redone.data!.newPosition!, false)
                    })
                    this.editStack.unshift({
                        type: "move",
                        objectIDs: redone.objectIDs,
                        data: {
                            oldPosition: redone.data?.oldPosition,
                            newPosition: redone.data?.newPosition
                        }
                    })
                    break
                }
            }
        }
    }
}

export = CommandManager