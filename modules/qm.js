import Minterm from "./minterm.js";
import {
	decToBin,
	getAllSubsets,
	valueIn,
	getBits,
	countOnesInBinary,
} from "./util.js";

/**
 * Main function that controlls the whole minimisation process.
 * Returns the essential prime implicants for given function.
 */
export function getEssentialPrimeImplicants(vars, terms, dontCares) {
	let initialGroups = createInitialGroups(vars, terms.concat(dontCares).sort());

	let primeImplicants = getPrimeImplicants(initialGroups);

	console.log(primeImplicants);

	let piTable = buildPrimeImplicantTable(primeImplicants, terms);

	let essentialPrimeImplicants = initialEssentialPrimeImplicants(piTable);

	// if PI table is empty, then all terms are covered by the EPI's
	if (Object.keys(piTable).length == 0) {
		return essentialPrimeImplicants;
	}

	// if not empty, need to find minimum set of the remaining PI's that cover the rest of the terms

	// get rid of terms covered by EPIs
	essentialPrimeImplicants.forEach((epi) => {
		epi.getValues().forEach((term) => {
			delete piTable[term];
		});
	});
	// get terms yet to be covered
	let uncoveredTerms = Object.keys(piTable).map((str) => {
		return parseInt(str);
	});
	//extract the remaining PIs from the PI table
	let remainingPrimeImplicants = getRemainingPrimeImplicants(
		essentialPrimeImplicants,
		piTable
	);
	//find the minimal combination of PIs to cover the uncovered terms
	let minPrimeImpSet = coverUnusedTerms(
		remainingPrimeImplicants,
		uncoveredTerms
	);

	return essentialPrimeImplicants.concat(minPrimeImpSet);
}

/**
 * Returns an array of all the prime implicants for an expression
 */
export function getPrimeImplicants(groups) {
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
		for (const term of getPrimeImplicants(newGroups)) {
			if (!term.isUsed() && !valueIn(term, unused)) {
				unused.push(term);
			}
		}

		return unused;
	}
}

/**
 * Builds and returns a prime implicant table which shows which prime implicants cover which terms
 */
function buildPrimeImplicantTable(primeImplicants, terms) {
	let piTable = {};
	// for each term in the table, push PIs that cover that term
	for (let i = 0; i < terms.length; i++) {
		let term = terms[i];

		piTable[term] = [];

		primeImplicants.forEach((pi) => {
			if (pi.coversTerm(term)) {
				piTable[term].push(pi);
			}
		});
	}

	return piTable;
}

/**
 * Returns prime implicants which cover a term not covered by any other implicant
 */
function initialEssentialPrimeImplicants(piTable) {
	let essentialPrimeImplicants = [];

	//if a term is covered by 1 PI, then it's an essential PI
	for (const [term, coveredBy] of Object.entries(piTable)) {
		if (coveredBy.length == 1) {
			let epi = coveredBy[0];
			if (!valueIn(epi, essentialPrimeImplicants)) {
				essentialPrimeImplicants.push(epi);
			}
			delete piTable[term]; //remove that term
		}
	}

	return essentialPrimeImplicants;
}

/**
 * Returns the remaining PIs from the PI table
 */
function getRemainingPrimeImplicants(essentialPrimeImplicants, piTable) {
	let remainingPrimeImplicants = [];

	for (const [term, coveredBy] of Object.entries(piTable)) {
		coveredBy.forEach((pi) => {
			if (
				!valueIn(pi, remainingPrimeImplicants) &&
				!valueIn(pi, essentialPrimeImplicants)
			) {
				remainingPrimeImplicants.push(pi);
			}
		});
	}

	return remainingPrimeImplicants;
}

/**
 * Returns the minimal combination of PIs required to cover all terms
 */
function coverUnusedTerms(remainingPrimeImplicants, uncoveredTerms) {
	//get all possible combinations of the remaining PIs and sort by length
	let allCombinations = getAllSubsets(remainingPrimeImplicants).sort((a, b) => {
		return a.length - b.length;
	});

	for (let comb of allCombinations) {
		//get terms covered by this comb
		let termsCovered = new Set();
		comb.forEach((pi) => {
			let arrTerms = pi.getValues();
			arrTerms.forEach((term) => termsCovered.add(term));
		});

		//check that this combination covers all uncoveredTerms
		let covers = uncoveredTerms.every((term) => {
			return termsCovered.has(term);
		});

		if (covers) {
			return comb;
		}
	}
}

/**
 * Returns terms grouped by number of 1s
 */
export function createInitialGroups(variables, allTerms) {
	let groups = new Array(variables.length + 1).fill(null).map(() => []);

	for (const term of allTerms) {
		const bits = getBits(term, variables.length);
		const count = countOnesInBinary(bits);
		groups[count].push(new Minterm([term], bits));
	}

	return groups;
}
