import Matrix, { solve } from 'ml-matrix'
import { setStatus, SimulationObject } from '..'
import { fixedPositions, fixPosition } from '../canvas'
import Equation from '../Equation'
import Mass from '../SimulationObjects/Mass'
import Pulley from '../SimulationObjects/Pulley'
import RopeSegment from '../SimulationObjects/RopeSegment'
import { getRopeSegments, getPulleys, getMasses, positionsEqual } from '../utility'

const g = -9.81

export function calculate(elementList: SimulationObject[]) {
    let ropeSegments = getRopeSegments(elementList)
    let pulleys = getPulleys(elementList)
    let masses = getMasses(elementList)

    clearNumberings(ropeSegments, pulleys, masses)

    fixObjects(pulleys, masses)

    let ropeNumber = 0
    let pulleyNumber = 0
    let massNumber = 0

    for (let segment of ropeSegments) {
        if (segment.ropeNumber === null) {
            ropeNumber++
            segment.setRopeNumber(ropeNumber)
            setNumberOfLinkedSegments(segment, ropeNumber, ropeSegments, pulleys)
        }

        if (!(
            masses.some(m => positionsEqual(m.pos, segment.startPos))
            || pulleys.some(p => positionsEqual(p.pos, segment.startPos))
            || pulleys.some(p => positionsEqual(p.leftPos, segment.startPos))
            || pulleys.some(p => positionsEqual(p.rightPos, segment.startPos))
        )) {
            fixPosition(segment.startPos)
        }

        if (!(
            masses.some(m => positionsEqual(m.pos, segment.endPos))
            || pulleys.some(p => positionsEqual(p.pos, segment.endPos))
            || pulleys.some(p => positionsEqual(p.leftPos, segment.endPos))
            || pulleys.some(p => positionsEqual(p.rightPos, segment.endPos))
        )) {
            fixPosition(segment.endPos)
        }
    }

    for (let mass of masses) {
        massNumber++
        mass.setMassNumber(massNumber)
    }

    for (let pulley of pulleys) {
        pulleyNumber++
        pulley.setPulleyNumber(pulleyNumber)
    }

    let dim = ropeNumber + pulleyNumber + massNumber
    let eqns: Equation[] = []
    let A = Matrix.zeros(dim, dim)
    let x = []
    let b = []

    for (let mass of masses) {
        let EQN = new Equation()
        let unknown = `a_m${mass.massNumber}`
        x.push(unknown)

        if (mass.fixed) {
            EQN.addTerm(1, unknown)
            EQN.setRhs(0)
            eqns.push(EQN)
        } else if (mass.mass === 0) {
            EQN.addTerm(1, unknown)
            EQN.setRhs(g)

            let visitedRopes: (number | null)[] = []
            for (let segment of ropeSegments) {
                if (!visitedRopes.includes(segment.ropeNumber)) {
                    if (segment.pullsStraightUpOn(mass)) {
                        throw new CalculateError("ForceOnZeroMass")
                    }
                }
            }

            eqns.push(EQN)
        } else {
            EQN.addTerm(-mass.mass, unknown)
            EQN.setRhs(-g * mass.mass)

            let visitedRopes: (number | null)[] = []
            for (let segment of ropeSegments) {
                if (!visitedRopes.includes(segment.ropeNumber)) {
                    if (segment.pullsStraightUpOn(mass)) {
                        EQN.addTerm(1, `T${segment.ropeNumber}`)
                        visitedRopes.push(segment.ropeNumber)
                    }
                }
            }

            eqns.push(EQN)
        }
    }

    for (let pulley of pulleys) {
        let EQN = new Equation()
        let unknown = `a_p${pulley.pulleyNumber}`
        x.push(unknown)

        if (pulley.fixed) {
            EQN.addTerm(1, unknown)
            EQN.setRhs(0)
            eqns.push(EQN)
        } else {
            EQN.addTerm(-pulley.mass, unknown)
            EQN.setRhs(-g * pulley.mass)

            let visitedRopes: (number | null)[] = []
            for (let segment of ropeSegments) {
                if (!visitedRopes.includes(segment.ropeNumber)) {
                    if (segment.loopsUpAround(pulley)) {
                        EQN.addTerm(2, `T${segment.ropeNumber}`)
                        visitedRopes.push(segment.ropeNumber)
                    } else if (segment.loopsDownAround(pulley)) {
                        EQN.addTerm(-2, `T${segment.ropeNumber}`)
                        visitedRopes.push(segment.ropeNumber)
                    } else if (segment.pullsStraightUpOn(pulley)) {
                        EQN.addTerm(1, `T${segment.ropeNumber}`)
                        visitedRopes.push(segment.ropeNumber)
                    } else if (segment.pullsStraightDownOn(pulley)) {
                        EQN.addTerm(-1, `T${segment.ropeNumber}`)
                        visitedRopes.push(segment.ropeNumber)
                    }
                }
            }

            eqns.push(EQN)
        }
    }

    for (let i = 1; i <= ropeNumber; i++) {
        let EQN = new Equation()
        let unknown = `T${i}`
        EQN.setRhs(0)
        x.push(unknown)

        let visitedPulleys: (number | null)[] = []
        let visitedMasses: (number | null)[] = []

        for (let segment of ropeSegments) {
            if (segment.ropeNumber === i) {
                for (let pulley of pulleys) {
                    if (!visitedPulleys.includes(pulley.pulleyNumber)) {
                        if (segment.loopsUpAround(pulley)) {
                            EQN.addTerm(2, `a_p${pulley.pulleyNumber}`)
                            visitedPulleys.push(pulley.pulleyNumber)
                        } else if (segment.loopsDownAround(pulley)) {
                            EQN.addTerm(-2, `a_p${pulley.pulleyNumber}`)
                            visitedPulleys.push(pulley.pulleyNumber)
                        } else if (segment.pullsStraightUpOn(pulley)) {
                            EQN.addTerm(1, `a_p${pulleyNumber}`)
                            visitedPulleys.push(pulley.pulleyNumber)
                        } else if (segment.pullsStraightDownOn(pulley)) {
                            EQN.addTerm(-1, `a_p${pulleyNumber}`)
                            visitedPulleys.push(pulley.pulleyNumber)
                        }
                    }
                }

                for (let mass of masses) {
                    if (!visitedMasses.includes(mass.massNumber)) {
                        if (segment.pullsStraightUpOn(mass)) {
                            EQN.addTerm(1, `a_m${mass.massNumber}`)
                            visitedMasses.push(mass.massNumber)
                        } else if (segment.pullsStraightDownOn(mass)) {
                            EQN.addTerm(-1, `a_m${mass.massNumber}`)
                            visitedMasses.push(mass.massNumber)
                        }
                    }
                }
            }
        }

        eqns.push(EQN)
    }

    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            A.set(i, j, eqns[i].coeffDict[x[j]] ?? 0)
        }
        b.push(eqns[i].rhs)
    }

    let b_vector = Matrix.columnVector(b)
    let solved_x = solve(A, b_vector)

    console.log(x.toString())
    console.log(solved_x.toString())
    
    setStatus("calculated")
}

function setNumberOfLinkedSegments(segment: RopeSegment, ropeNumber: number, ropeList: RopeSegment[], pulleyList: Pulley[]) {
    for (let pulley of pulleyList) {
        if (segment.loopsAround(pulley)) {
            for (let connectedSegment of ropeList) {
                if (connectedSegment.ropeNumber === null && connectedSegment.loopsAround(pulley)) {
                    connectedSegment.setRopeNumber(ropeNumber)
                    setNumberOfLinkedSegments(connectedSegment, ropeNumber, ropeList, pulleyList)
                }
            }
        }
    }
}

function fixObjects(pulleys: Pulley[], masses: Mass[]) {
    let positions = fixedPositions()
    for (let pulley of pulleys) {
        if (
            positions.some(p => positionsEqual(p, pulley.pos))
            || positions.some(p => positionsEqual(p, pulley.leftPos))
            || positions.some(p => positionsEqual(p, pulley.rightPos))
        ) {
            pulley.fixPulley()
        } else {
            pulley.unfixPulley()
        }
    }

    for (let mass of masses) {
        if (positions.some(p => positionsEqual(p, mass.pos))) {
            mass.fixMass()
        } else {
            mass.unfixMass()
        }
    }
}

function clearNumberings(ropeSegments: RopeSegment[], pulleys: Pulley[], masses: Mass[]) {
    for (let r of ropeSegments) {
        r.ropeNumber = null
    }
    for (let p of pulleys) {
        p.pulleyNumber = null
    }
    for (let m of masses) {
        m.massNumber = null
    }
}