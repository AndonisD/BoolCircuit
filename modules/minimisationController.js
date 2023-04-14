import { getEssentialPrimeImplicants } from "./qm.js";

/**
 * Returns minimal SOP and POS functions
 */
export function minimiseFunction(vars, minTerms, dontCares) {
	let minTermPrimeImplicants = getEssentialPrimeImplicants(
		vars,
		minTerms,
		dontCares
	);

	const { maxTerms, reversedDontCares } = extractMaxTerms(
		vars,
		minTerms,
		dontCares
	);

	let maxTermPrimeImplicants = getEssentialPrimeImplicants(
		vars,
		maxTerms,
		reversedDontCares
	);

	const dnf = getFunction(minTermPrimeImplicants, vars);
	const cnf = getFunction(maxTermPrimeImplicants, vars, true);

	return { dnf, cnf };
}

/**
 * Returns maxterms and reversed DCs
 */
function extractMaxTerms(vars, minTerms, dontCares) {
	let maxTerms = [];

	const numVars = vars.length;

	const totalNumTerms = Math.pow(2, numVars);

	for (let i = 0; i < totalNumTerms; i++) {
		if (!minTerms.includes(i)) {
			maxTerms.push(i);
		}
	}

	let reversedDCs = [];

	reversedDCs.push(
		dontCares.map((term) => {
			return totalNumTerms - term;
		})
	);

	return { maxTerms, reversedDCs };
}

/**
 * Generates and returns an SOP or POS function
 *
 * @author Jonah Pierce
 * https://www.npmjs.com/package/quine-mccluskey-js?activeTab=explore
 */
function getFunction(primeImplicants, variables, isMaxterm = false) {
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
		if (count == variables.length) {
			return "1";
		}
	}

	let result = "";

	// Iterate through the prime implicants
	for (let i = 0; i < primeImplicants.length; i++) {
		let implicant = primeImplicants[i];

		// Add parentheses if necessary
		if (
			(implicant.getValue().match(/-/g) || []).length <
			variables.length - 1
		) {
			result += "(";
		}

		// Iterate through all the bits in the implicants value
		for (let j = 0; j < implicant.getValue().length; j++) {
			if (implicant.getValue().charAt(j) == (isMaxterm ? "1" : "0")) {
				result += "not ";
			}
			// if (implicant.getValue().charAt(j) == "0") {
			//     result += "NOT ";
			// }
			if (implicant.getValue().charAt(j) != "-") {
				result += variables[j];
			}
			if (
				(
					implicant
						.getValue()
						.substring(j + 1)
						.match(/-/g) || []
				).length <
					implicant.getValue().length - j - 1 &&
				implicant.getValue().charAt(j) != "-"
			) {
				result += isMaxterm ? " or " : " and ";
			}
		}

		// Add parentheses if necessary
		if (
			(implicant.getValue().match(/-/g) || []).length <
			variables.length - 1
		) {
			result += ")";
		}

		// Combine minterms with an OR operator
		if (i < primeImplicants.length - 1) {
			result += isMaxterm ? " and " : " or ";
		}
	}

	return result;
}
