//creates an equation of the type a_1*x_1 + a_2*x_2 + ... + a_n*x_n = b , where a_m is a coefficent and x_m is an unknown, and b is a constant
interface Equation {
    coeffDict: Record<string, number>, //holds pairs of (unknown variable's coefficent, unknown variable's string representaion)
    b: number
}
class Equation {
    constructor() {
        this.coeffDict = {}
    }

    addTerm(coeff: number, unknown: string) {
        this.coeffDict[unknown] = coeff
    }

    toString() {
        let str = ""
        for (let unknown in this.coeffDict) {
            let coeff = this.coeffDict[unknown]
            if (str === "") { 
                if (coeff > 0) { //do not add plus sign in front of the first term even if its coeff is positive (ex: "2x" instead of "+ 2x")
                    str += `${coeff === 1 ? "" : `${coeff}*`}${unknown}`
                }
                else if (coeff < 0) { //do not add a space after the negative sign for the first term's coeff (ex: "-2x" instead of "- 2x")
                    str += `-${coeff === -1 ? "" : `${Math.abs(coeff)}*`}${unknown}`
                }
            }
            else if (coeff > 0) { //add plus sign and space in front of the later terms (ex: "____ + 2x")
                str += ` + ${coeff === 1 ? "" : `${coeff}*`}${unknown}`
            }
            else if (coeff < 0) { //add a negative sign and space in front of the later terms (ex: "____ - 2x")
                str += ` - ${coeff === -1 ? "" : `${Math.abs(coeff)}*`}${unknown}`
            }
        }
        str += ` = ${this.b}`
        return (str)
    }
}

export = Equation