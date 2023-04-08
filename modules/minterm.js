/**
 * A class to hold information about a minterm when using the Quine-McCluskey Algorithm
 */
export default class Minterm {

    /**
     * Creates a new minterm object
     */
    constructor(termsCovered, binValue) {

        this.termsCovered = termsCovered.sort();
        this.binValue = binValue;
        this.used = false;

        this.termsCovered.sort();
    }

    /**
     * Returns a String representation of the Minterm
     */
    toString() {
        let values = this.termsCovered.join(", ");
        return `m(${values}) = ${this.binValue}`;
    }

    /**
     * Determines if this Minterm object is equal to another object
     */
    equals(minterm) {

        if (!(minterm instanceof Minterm)) {
            return false;
        }

        return (
            this.binValue == minterm.binValue &&
            this.termsCovered.length == minterm.termsCovered.length &&
            this.termsCovered.every(function(u,i) {return u === minterm.termsCovered[i]})
        );
    }

    /**
     * Returns the values in this Minterm
     */
    getValues() {
        return this.termsCovered;
    }

    /**
     * Returns the binary value of this Minterm
     */
    getValue() {
        return this.binValue;
    }

    /**
     * Returns whether or not this Minterm has been used
     */
    isUsed() {
        return this.used;
    }

    /**
     * Labels this Minterm as "used"
     */
    use() {
        this.used = true;
    }

    coversTerm(term){
        return this.termsCovered.includes(term)
    }
    
    /**
     * Combines 2 Minterms together if they can be combined
     */
    combine(minterm) {
        
        // Check if this value is this same; If so, do nothing
        if (this.binValue == minterm.binValue) {
            return null;
        }
        
        // Check if the values are the same; If so, do nothing
        if (this.termsCovered.length == minterm.termsCovered.length &&
            this.termsCovered.every(function(u,i) {return u === minterm.termsCovered[i]})) {
            return null;
        }
        
        // Keep track of the difference between the minterms
        let diff = 0;
        let result = "";

        // Iterate through the bits in this Minterm's value
        for (const i in this.binValue) {

            // Check if the current bit value differs from the minterm's bit value
            if (this.binValue.charAt(i) != minterm.binValue.charAt(i)) {
                diff += 1;
                result += "-";
            }

            // There is no difference
            else {
                result += this.binValue.charAt(i);
            }

            // The difference has exceeded 1
            if (diff > 1) {
                return null;
            }
        }

        return new Minterm(this.termsCovered.concat(minterm.termsCovered), result);
    }
}