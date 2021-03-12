const workspace = document.getElementById("workspace")
    var mode = 'a' //'a' for anchoring     's' for sizing   'n' for sizing after first selecting a node
    var firstClickPos, firstClickNode
    var globalIDList = {}

    workspace.onclick = (event) => {
        let selectedObject = document.querySelector('input[name="selected-object"]:checked').value //getting the pulley/rope/mass type of selected-object
        let pos = getMousePos(event)
        let nodeTarget =  nodeTarget
        switch (selectedObject) {
            case "pulley-configuration-1": {
                if (mode === 'a') {
                    firstClickPos = pos
                    mode = 's'
                } else if (mode === 's') {
                    let createdElement = new PulleyConfiguration1(firstClickPos, 0, getDist(firstClickPos, pos), false)
                    mode = 'a'
                }
                break
            }
            case "pulley-configuration-2": {
                if (mode === 'a') {
                    firstClickPos = pos
                    mode = 's'
                } else if (mode === 's') {
                    let createdElement = new PulleyConfiguration2(firstClickPos, 0, getDist(firstClickPos, pos), false)
                    mode = 'a'
                }
            } break
            case "pulley-configuration-3": {
                if (mode === 'a') {
                    firstClickPos = pos
                    mode = 's'
                } else if (mode === 's') {
                    let createdElement = new PulleyConfiguration3(firstClickPos, 0, getDist(firstClickPos, pos), false)
                    mode = 'a'
                }
            } break
            case "pulley-configuration-4": {
                if (mode === 'a') {
                    firstClickPos = pos
                    mode = 's'
                } else if (mode === 's') {
                    let createdElement = new PulleyConfiguration4(firstClickPos, 0, getDist(firstClickPos, pos), false)
                    mode = 'a'
                }
            } break
            case "rope-segment": {
                if (mode === 'a') {
                    if (nodeTarget) {
                        firstClickNode = globalIDList[event.target.dataset.ID]
                        mode = 'n'
                    } else {
                        firstClickPos = pos
                        mode = 's'
                    }
                } else if (mode === 's') {
                    if (nodeTarget) {
                        let newSegment = new RopeSegment({
                            startX: firstClickPos.x,
                            startY: firstClickPos.y
                        },
                        {
                            endNode: globalIDList[event.target.dataset.ID]
                        })
                    } else {
                        let newSegment = new RopeSegment({
                            startX: firstClickPos.x,
                            startY: firstClickPos.y,
                            endX: pos.x,
                            endY: pos.y
                        })
                        let newRope = new RopeObject([newSegment], [newSegment.startNode, newSegment.endNode])
                        newSegment.setRope(newRope)
                    }
                    mode = 'a'
                } else if (mode === 'n') {
                    if (nodeTarget) {
                        let newSegment = new RopeSegment(undefined, {
                            startNode: firstClickNode,
                            endNode: globalIDList[event.target.dataset.ID]
                        })
                    } else {
                        let newSegment = new RopeSegment({
                            endX: pos.x,
                            endY: pos.y
                        },
                        {
                            startNode: firstClickNode
                        })
                    }
                    mode = 'a'
                }
            } break
            // case "mass-configuration-1": {
            //     if (mode === 'a') {
            //         firstClickPos = pos
            //         mode = 's'
            //     } else if (mode === 's') {
            //         let createdElement = new MassConfiguration1()
            //     }
            // }
            // case "mass-configuration-2": {
            //     if (mode === 'a') {
            //         firstClickPos = pos
            //         mode = 's'
            //     } else if (mode === 's') {
            //         let createdElement = new MassConfiguration2()
            //     }
            // }
        }
    }

    function getMousePos(evt) {
        var rect = workspace.getBoundingClientRect()
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        }
    }

    function getDist(pos1, pos2) {
        return (Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2))
    }


    class PulleyConfiguration1 {
        constructor(position, mass, radius, isFixed) {
            this.pulley = new PulleyObject(position.x - 2, position.y, radius - 2)

            let ropeSegmentUp = new RopeSegment({
                endX: position.x,
                endY: position.y - 2 * radius
            },
            {
                startNode: this.pulley.centerNode
            })
            let ropeSegmentLeft = new RopeSegment({
                endX: position.x - radius + 1,
                endY: position.y + 2 * radius
            },
            {
                startNode: this.pulley.leftNode
            })
            let ropeSegmentRight = new RopeSegment({
                endX: position.x + radius - 1,
                endY: position.y + 2 * radius
            },
            {
                startNode: this.pulley.rightNode
            })
            this.ropeAround = new RopeObject([ropeSegmentLeft, ropeSegmentRight], [ropeSegmentLeft.startNode, ropeSegmentLeft.endNode, ropeSegmentRight.startNode, ropeSegmentRight.endNode])
            this.ropeUp = new RopeObject([ropeSegmentUp], [ropeSegmentUp.startNode, ropeSegmentUp.endNode])
        }
    }

    class PulleyConfiguration2 extends PulleyConfiguration1 {
        constructor(position, mass, radius, isFixed) {
            super(position, mass, radius, isFixed)
            let ropeSegmentDown = new RopeSegment({
                startX: position.x,
                startY: position.y,
                endX: position.x,
                endY: position.y + 2 * radius
            })
            this.ropeDown = new RopeObject([ropeSegmentDown], [ropeSegmentDown.startNode, ropeSegmentDown.endNode])
        }
    }

    class PulleyConfiguration3 {
        constructor(position, mass, radius, isFixed) {
            this.pulley = new PulleyObject(position.x - 2, position.y, radius - 2)

            let ropeSegmentDown = new RopeSegment({
                startX: position.x,
                startY: position.y,
                endX: position.x,
                endY: position.y - 2 * radius
            })
            let ropeSegmentLeft = new RopeSegment({
                startX: position.x - radius + 1,
                startY: position.y,
                endX: position.x - radius + 1,
                endY: position.y - 2 * radius
            })
            let ropeSegmentRight = new RopeSegment({
                startX: position.x + radius - 1,
                startY: position.y,
                endX: position.x + radius - 1,
                endY: position.y - 2 * radius
            })
            this.ropeAround = new RopeObject([ropeSegmentLeft, ropeSegmentRight], [ropeSegmentLeft.startNode, ropeSegmentLeft.endNode, ropeSegmentRight.startNode, ropeSegmentRight.endNode])
            this.ropeDown = new RopeObject([ropeSegmentDown], [ropeSegmentDown.startNode, ropeSegmentDown.endNode])
        }
    }

    class PulleyConfiguration4 extends PulleyConfiguration3 {
        constructor(position, mass, radius, isFixed) {
            super(position, mass, radius, isFixed)
            let ropeSegmentUp = new RopeSegment({
                startX: position.x,
                startY: position.y,
                endX: position.x,
                endY: position.y - 2 * radius
            })
            this.ropeUp = new RopeObject([ropeSegmentUp], [ropeSegmentUp.startNode, ropeSegmentUp.endNode])
        }
    }

    class ObjectNode {
        constructor(parent, elementOptions, nodeOptions) {
            while (this.id in globalIDList || this.id === undefined) {
                this.id = (Math.floor(Math.random() * 1000000)).toString() //generating a random ID from 0-999999
            }
            globalIDList[this.id] = this

            this.parent = parent ?? null

            this.x = elementOptions.x
            this.y = elementOptions.y

            this.htmlElement = document.createElement("div")
            this.htmlElement.classList.add("object-node")
            this.htmlElement.dataset.ID = this.id
            this.htmlElement.style.left = (elementOptions.x - 3.5) + 'px'
            this.htmlElement.style.top = (elementOptions.y - 4.5) + 'px'
            document.getElementById("workspace").appendChild(this.htmlElement)

            if (this.nodeOptions?.inputNode === true) {
                this.inputNode = true
            } else {
                this.inputNode = false
            }

            if (this.nodeOptions?.outputNode === true) {
                this.outputNode = true
            } else {
                this.outputNode = false
            }

            if (Array.isArray(nodeOptions?.attachments)) {
                this.attachments = nodeOptions?.attachments
            } else {
                this.attachments = []
            }
        }

        addAttachment(att) {
            if ('') {
                if (this.attachments.length < 3) {
                    this.attachments.push(att)
                    return true
                } else {
                    return false
                }
            } else {
                if (this.attachments.length < 2) {
                    this.attachments.push(att)
                    return true
                } else {
                    return false
                }
            }
        }
    }

    class RopeSegment {
        constructor(elementOptions, objectOptions) {
            while (this.id in globalIDList || this.id === undefined) {
                this.id = Math.floor(Math.random() * 1000000) //generating a random ID from 0-999999
            }
            globalIDList[this.id] = this

            this.valid = false

            if (objectOptions?.startNode) {
                this.startNode = objectOptions.startNode
                let validAttachment = objectOptions.startNode.addAttachment(this)
                if (!validAttachment) {
                    return
                }
            } else {
                this.startNode = new ObjectNode(this, { x: elementOptions?.startX, y: elementOptions?.startY }, { attachments: [this] })
            }
            
            if (objectOptions?.endNode) {
                this.endNode = objectOptions.endNode
                let validAttachment = objectOptions.endNode.addAttachment(this)
                if (!validAttachment) {
                    return
                }
            } else {
                this.endNode = new ObjectNode(this, { x: elementOptions?.endX, y: elementOptions?.endY }, { attachments: [this] })
            }

            this.htmlElement = document.createElement("div")
            this.htmlElement.classList.add("rope-segment")
            this.htmlElement.dataset.ID = this.id


            let xDiff = this.startNode.x - this.endNode.x
            let yDiff = this.startNode.y - this.endNode.y
            let length = Math.sqrt(xDiff ** 2 + yDiff ** 2)
            this.htmlElement.style.height = length + 'px'
            let angle = 180 / Math.PI * Math.acos(yDiff / length)

            if (xDiff > 0) {
                angle *= -1
            }

            this.htmlElement.style.webkitTransform = `rotate(${angle}deg)`

            if (this.endNode.y > this.startNode.y) {
                var top = (this.endNode.y - this.startNode.y) / 2 + this.startNode.y;
            } else {
                var top = (this.startNode.y - this.endNode.y) / 2 + this.endNode.y;
            }
            top -= length / 2

            if (this.endNode.x > this.startNode.x) {
                var left = (this.endNode.x - this.startNode.x) / 2 + this.startNode.x;
            } else {
                var left = (this.startNode.x - this.endNode.x) / 2 + this.endNode.x;
            }

            this.htmlElement.style.top = top + 'px'
            this.htmlElement.style.left = (left - 1) + 'px'

            this.valid = true

            document.getElementById("workspace").appendChild(this.htmlElement)
        }

        setRope(rope) {
            this.rope = rope
        }
    }

    class RopeObject {
        constructor(segments, nodes) {
            while (this.id in globalIDList || this.id === undefined) {
                this.id = Math.floor(Math.random() * 1000000) //generating a random ID from 0-999999
            }
            globalIDList[this.id] = this

            this.tension = null

            if (Array.isArray(segments) && !segments.some(item => !item.valid)) {
                this.segments = segments
            } else {
                this.segments = []
            }

            if (Array.isArray(nodes) && !nodes.some(item => !item.valid)) {
                this.nodes = nodes
            } else {
                this.nodes = []
            }
        }
    }

    class PulleyObject {
        constructor(x, y, radius, objectOptions) {
            while (this.id in globalIDList || this.id === undefined) {
                this.id = Math.floor(Math.random() * 1000000) //generating a random ID from 0-999999
            }
            globalIDList[this.id] = this

            this.valid = false

            if (objectOptions?.leftNode) {
                this.leftNode = objectOptions?.leftNode
                let validAttachment = objectOptions.leftNode.addAttachment(this)
                if (!validAttachment) {
                    return
                }
            } else {
                this.leftNode = new ObjectNode(this, {x: x - radius + 1, y: y}, {attachments: [this]})
            }

            if (objectOptions?.rightNode) {
                this.rightNode = objectOptions?.rightNode
                let validAttachment = objectOptions.rightNode.addAttachment(this)
                if (!validAttachment) {
                    return
                }
            } else {
                this.rightNode = new ObjectNode(this, {x: x + radius + 3, y: y}, {attachments: [this]})
            }

            if (objectOptions?.centerNode) {
                this.rightNode = objectOptions?.centerNode
                let validAttachment = objectOptions.centerNode.addAttachment(this)
                if (!validAttachment) {
                    return
                }
            } else {
                this.centerNode = new ObjectNode(this, {x: x + 2, y: y}, {attachments: [this]})
            }

            this.htmlElement = document.createElement("div")
            this.htmlElement.classList.add('pulley')
            this.htmlElement.dataset.ID = this.id
            this.htmlElement.style.width = radius * 2 + 'px'
            this.htmlElement.style.height = radius * 2 + 'px'
            this.htmlElement.style.top = (y - radius) + 'px'
            this.htmlElement.style.left = (x - radius) + 'px'
            document.getElementById('workspace').appendChild(this.htmlElement)
        }
    }

    

    // class MassConfiguration1 {
    //     constructor(x, y, s, mass) { //s holds sidelength
    //         this.htmlElement = document.createElement("div")
    //         this.htmlElement.classList.add('pulley')
    //         this.htmlElement.dataset.ID = this.id
    //         this.htmlElement.style.width = s + 'px'
    //         this.htmlElement.style.height = s + 'px'
    //         this.htmlElement.style.top = (y - s/2) + 'px'
    //         this.htmlElement.style.left = (x - s/2) + 'px'
// 
    //         let ropeSegmentUp = new RopeSegment({
    //             startX: position.x + radius - 1,
    //             startY: position.y,
    //             endX: position.x + radius - 1,
    //             endY: position.y + 2 * radius
    //         })
    //         this.ropeUp = new RopeObject([ropeSegmentUp])
// 
    //         
    //         document.getElementById('workspace').appendChild(this.htmlElement)
    //     }
    // }

    

    //class MassConfiguration2 {
    //    constructor(x, y, s, mass) {
    //        this.htmlElement = document.createElement("div")
    //        this.htmlElement.classList.add('pulley')
    //        this.htmlElement.dataset.ID = this.id
    //        this.htmlElement.style.width = s + 'px'
    //        this.htmlElement.style.height = s + 'px'
    //        this.htmlElement.style.top = (y - s/2) + 'px'
    //        this.htmlElement.style.left = (x - s/2) + 'px'
//
    //        let ropeSegmentUp = new RopeSegment({
    //            startX: x + radius - 1,
    //            startY: y,
    //            endX: x + radius - 1,
    //            endY: y + 2 * radius
    //        })
    //        
    //        let ropeSegmentUp = new RopeSegment({
    //            startX: x + radius - 1,
    //            startY: y,
    //            endX: x + radius - 1,
    //            endY: y + 2 * radius
    //        })
//
    //        this.ropeUp = new RopeObject([ropeSegmentUp])
    //        this.ropeDown = new RopeObject([ropeSegmentDown])
    //        
    //        document.getElementById('workspace').appendChild(this.htmlElement)
    //    }
    //}