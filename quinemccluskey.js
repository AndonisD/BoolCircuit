import Minterm from "./minterm.js";
import { decToBin, getAllSubsets, valueIn } from "./util.js";

/**
 * A class to handle processing the Quine-McCluskey Algorithm
 */
export default class QuineMcCluskey {

    /**
     * Creates a new QuineMcCluskey object to process the Quine-Mccluskey Algorithm
     */
    constructor(variables, terms, dontCares = [], isMaxterm = false) {
        terms.sort();
        this.variables = variables;
        this.terms = terms;
        this.allTerms = terms.concat(dontCares);
        this.allTerms.sort();
        this.dontCares = dontCares;
        this.isMaxterm = isMaxterm;
        this.func = null;
        this.func = this.getFunction();
        this.piTable = {};
    }

    // Helper Methods

    /**
     * Returns the binary value equivalent to the decimal value given
     */
    getBits(value) {
        let s = (value >>> 0).toString(2);
        for (let i = s.length; i < this.variables.length; i++)
            s = "0" + s;
        return s;
    }

    // Grouping Methods

    /**
     * Creates the initial grouping for the bits from the values
     * given to the Quine-McCluskey Algorithm
     */
    initialGroup() {

        // Keep track of groups by 2-dimensional array
        let groups = [];
        for (let i = 0; i < this.variables.length + 1; i++) {
            groups.push([]);
        }

        // Iterate through values
        for (const value of this.allTerms) {

            // Count number of 1's in value's bit equivalent
            let count = 0;
            let bits = this.getBits(value);
            for (const bit of bits) {
                if (bit == "1") {
                    count += 1;
                }
            }

            // Add count to proper group
            groups[count].push(new Minterm([value], bits));
        }
        
        console.log('INITIAL GROUPS:')
        console.log(groups)

        return groups;
    }

    /**
     * Creates a power set of all valid prime implicants that covers the rest of an expression.
     * This is used after the essential prime implicants have been found.
     */
    powerSet(values, primeImplicants) {

        // Get the power set of all the prime implicants
        let powerset = [];

        // Iterate through decimal values from 1 to 2 ** size - 1
        for (let i = 1; i < 2 ** primeImplicants.length - 1; i++) {
            let currentset = [];

            // Get the binary value of the decimal value
            let binValue = decToBin(i);
            for (let j = binValue.length; j < primeImplicants.length; j++) {
                binValue = "0" + binValue;
            }

            // Find which indexes have 1 in the binValue string
            for (let j = 0; j < binValue.length; j++) {
                if (binValue.charAt(j) == "1") {
                    currentset.push(primeImplicants[j]);
                }
            }
            powerset.push(currentset);
        }

        // Remove all subsets that do not cover the rest of the implicants
        let newpowerset = [];
        for (const subset of powerset) {

            // Get all the values the set covers
            let tempValues = [];
            for (const implicant of subset) {
                for (const value of implicant.getValues()) {
                    if (!valueIn(value, tempValues) && valueIn(value, values)) {
                        tempValues.push(value);
                    }
                }
            }
            tempValues.sort(function(number1, number2) {return number1 > number2;});

            // Check if this subset covers the rest of the values
            if (tempValues.length == values.length &&
                tempValues.every(function(u, i) {return u === values[i]})) {
                newpowerset.push(subset);
            }
        }
        powerset = newpowerset;

        // Find the minimum amount of implicants that can cover the expression
        let minSet = powerset[0];
        for (const subset of powerset) {
            if (subset.length < minSet.length) {
                minSet = subset;
            }
        }

        if (minSet == undefined) {
            return [];
        }
        return minSet;
    }

    // Compare Methods

    /**
     * Returns an array of all the prime implicants for an expression
     */
    getPrimeImplicants(groups = null) {

        // Get initial group if group is null
        if (groups === null) {
            groups = this.initialGroup();
        }

        // If there is only 1 group, return all the minterms in it
        if (groups.length == 1) {
            return groups[0];
        }

        // Try comparing the rest
        else {
            let unused = [];
            let comparisons = [...Array(groups.length - 1).keys()];
            let newGroups = [];
            for (let i of comparisons) {
                newGroups.push([]);
            }

            // Compare each adjacent group
            for (const compare of comparisons) {
                let group1 = groups[compare];
                let group2 = groups[compare + 1];

                // Compare every term in group1 with every term in group2
                for (const term1 of group1) {
                    for (const term2 of group2) {

                        // Try combining it
                        let term3 = term1.combine(term2);

                        // Only add it to the new group if term3 is not null
                        //  term3 will only be null if term1 and term2 could not
                        //  be combined
                        if (term3 !== null) {
                            term1.use();
                            term2.use();
                            if (!valueIn(term3, newGroups[compare])) {
                                newGroups[compare].push(term3);
                            }
                        }
                    }
                }
            }

            // Get array of all unused minterms
            for (const group of groups) {
                for (const term of group) {
                    if (!term.isUsed() && !valueIn(term, unused)) {
                        unused.push(term);
                    }
                }
            }

            // Add recursive call
            for (const term of this.getPrimeImplicants(newGroups)) {
                if (!term.isUsed() && !valueIn(term, unused)) {
                    unused.push(term);
                }
            }

            return unused;
        }
    }

    // Solving Methods

    /**
     * Solves for the expression returning the minimal amount of prime implicants needed
     * to cover the expression.
     */
    solve() {

        // Get the prime implicants
        let primeImplicants = this.getPrimeImplicants();

        console.log('PRIME IMPLICANTS')
        console.log(primeImplicants)

        //remove duplicate prime implicants
        

        // Keep track of values with only 1 implicant
        // These are the essential prime implicants
        let essentialPrimeImplicants = [];

        //-----------------------------------------------------------------

        let valuesUsed = [];
        for (let i = 0; i < this.terms.length; i++) {
            valuesUsed.push(false);
        }

        // Iterate through values
        for (let i = 0; i < this.terms.length; i++) {
            let value = this.terms[i];

            let uses = 0;
            let last = null;
            for (const minterm of primeImplicants) {
                if (valueIn(value, minterm.getValues())) {
                    uses += 1;
                    last = minterm;
                }
            }
            if (uses == 1 && !valueIn(last, essentialPrimeImplicants)) {
                for (const v of last.getValues()) {
                    if (!valueIn(v, this.dontCares)) {
                        valuesUsed[this.terms.indexOf(v)] = true;
                    }
                }
                essentialPrimeImplicants.push(last);
            }
        }

        // Check if all values were used
        let found = false;
        for (const value of valuesUsed) {
            if (!value) {
                found = true;
                break;
            }
        }
        if (!found) {
            return essentialPrimeImplicants;
        }

        //-----------------------------------------------------------------

        console.log('ESSENTIAL')
        console.log(essentialPrimeImplicants)
        console.log(valuesUsed)


        // Keep track of prime implicants that cover as many values as possible
        //  with as few variables as possible
        let newPrimeImplicants = [];
        for (const implicant of primeImplicants) {
            if (!valueIn(implicant, essentialPrimeImplicants)) {

                // Check if the current implicant only consists of dont cares
                let add = false;
                for (const value of implicant.getValues()) {
                    if (!valueIn(value, this.dontCares)) {
                        add = true;
                        break;
                    }
                }
                if (add) {
                    newPrimeImplicants.push(implicant);
                }
            }
        }

        primeImplicants = newPrimeImplicants;


        // Check if there is only 1 implicant left (very rare but just in case)
        if (primeImplicants.length == 1) {
            return essentialPrimeImplicants.concat(primeImplicants);
        }

        // Create a power set from the remaining prime implicants and check which
        //  combination of prime implicants gets the simplest form
        let newValues = [];
        for (let i = 0; i < this.terms.length; i++) {
            if (!valuesUsed[i]) {
                newValues.push(this.terms[i]);
            }
        }

        let tempset = this.powerSet(newValues, primeImplicants);

        return essentialPrimeImplicants.concat(
            this.powerSet(
                newValues,
                primeImplicants
            )
        );
    }

    getEssentialPrimeImplicants(){

        let primeImplicants = this.getPrimeImplicants();
        
        this.buildPrimeImplicantTable(primeImplicants)

        let essentialPrimeImplicants = this.initialEssentialPrimeImplicants();

        // if PI table is empty, then all terms are covered by the EPI's
        if (Object.keys(this.piTable).length == 0){
            return essentialPrimeImplicants
        }

        // if not empty, need to find minimum set of the remaining PI's that cover the rest of the terms

        // Get rid of terms covered by EPIs
        essentialPrimeImplicants.forEach(epi => {
            epi.getValues().forEach(term => {
                delete this.piTable[term]
            })
        })

        let uncoveredTerms = Object.keys(this.piTable).map((str) => {return parseInt(str)})

        let remainingPrimeImplicants = this.getRemainingPrimeImplicants(essentialPrimeImplicants);

        let minPrimeImpSet = this.coverUnusedTerms(remainingPrimeImplicants, uncoveredTerms)

        return essentialPrimeImplicants.concat(minPrimeImpSet)

    }

    buildPrimeImplicantTable(primeImplicants){
        
        let table = {}
        // for each term in the table, push PIs that cover that term
        for (let i = 0; i < this.terms.length; i++) {
            let term = this.terms[i];
            
            table[term] = [];
            
            primeImplicants.forEach(pi => {
                if(pi.coversTerm(term)){
                    table[term].push(pi);
                }
            })

        }

        this.piTable = table;
    }
    
    initialEssentialPrimeImplicants(){

        let essentialPrimeImplicants = [];

          //if a term is covered by 1 PI, then it's an essential PI
        for (const [term, coveredBy] of Object.entries(this.piTable)) {
            if (coveredBy.length == 1){
                let epi = coveredBy[0]
                if (!valueIn(epi, essentialPrimeImplicants)){
                    essentialPrimeImplicants.push(epi)
                }
                delete this.piTable[term] //remove that term
            }
        }

        return essentialPrimeImplicants;

    }

    getRemainingPrimeImplicants(essentialPrimeImplicants){

        let remainingPrimeImplicants = []

        for (const [term, coveredBy] of Object.entries(this.piTable)) {
            coveredBy.forEach(pi => {
                if (!valueIn(pi, remainingPrimeImplicants) && !valueIn(pi, essentialPrimeImplicants)){
                    remainingPrimeImplicants.push(pi)
                }
            })
        }

        return remainingPrimeImplicants;
    }

    coverUnusedTerms(remainingPrimeImplicants, uncoveredTerms){
        //get all possible combinations of the remaining PIs and sort by length
        let allCombinations = getAllSubsets(remainingPrimeImplicants).sort((a,b) => {return a.length - b.length});

        for (let comb of allCombinations){

            //get terms covered by this comb
            let termsCovered = new Set()
            comb.forEach((pi) => {
                let arrTerms = pi.getValues()
                arrTerms.forEach((term) => termsCovered.add(term));
            })

            //check that this combination covers all uncoveredTerms
            let covers = uncoveredTerms.every(term => {return termsCovered.has(term)})

            if (covers){
                return comb
            }

        }

    }

    /**
     * Returns the expression in a readable form
     */
    getFunction() {

        // Check if function already exists, return it
        if (this.func != null) {
            return this.func;
        }

        // Get the prime implicants and variables
        let primeImplicants = this.getEssentialPrimeImplicants()

        // Check if there are no prime implicants; Always False
        if (primeImplicants.length == 0) {
            return "0";
        }

        if (primeImplicants.length == 1) {
            let count = 0;
            for (const index of primeImplicants[0].getValue()) {
                if (index == "-") {
                    count += 1;
                }
            }
            if (count == this.variables.length) {
                return "1";
            }
        }

        let result = "";

        // Iterate through the prime implicants
        for (let i = 0; i < primeImplicants.length; i++) {
            let implicant = primeImplicants[i];

            // Add parentheses if necessary
            if ((implicant.getValue().match(/-/g) || []).length < this.variables.length - 1) {
                result += "(";
            }

            // Iterate through all the bits in the implicants value
            for (let j = 0; j < implicant.getValue().length; j++) {
                
                if (implicant.getValue().charAt(j) == (this.isMaxterm? "1": "0")) {
                    result += "NOT ";
                }
                // if (implicant.getValue().charAt(j) == "0") {
                //     result += "NOT ";
                // }
                if (implicant.getValue().charAt(j) != "-") {
                    result += this.variables[j];
                }
                if ((implicant.getValue().substring(j + 1).match(/-/g) || []).length < implicant.getValue().length - j - 1 && implicant.getValue().charAt(j) != "-") {
                    result += this.isMaxterm? " OR ": " AND ";
                }
            }

            // Add parentheses if necessary
            if ((implicant.getValue().match(/-/g) || []).length < this.variables.length - 1) {
                result += ")";
            }

            // Combine minterms with an OR operator
            if (i < primeImplicants.length - 1) {
                result += this.isMaxterm? " AND ": " OR ";
            }
        }

        return result;
    }
}