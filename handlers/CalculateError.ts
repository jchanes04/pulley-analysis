type errorName = "ForceOnZeroMass"

interface CalculateError extends Error {
    name: errorName
}

class CalculateError extends Error {
    constructor(name: errorName) {
        super(name)
        this.name = name
    }
}