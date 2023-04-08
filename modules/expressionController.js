import { getBits, interleave } from "./util.js";

/**
 * Returns variable names and minterms from a given expression
 */
export function breakDownExpression(expression) {
	let varNodes = math.parse(expression).filter((node) => node.isSymbolNode);
	console.log(varNodes);

	if (
		!varNodes.every((varName) => {
			return varName.name.length === 1;
		})
	) {
		throw "Please only use single character inputs!";
	}

	let vars = [...new Set(varNodes.map((item) => item.name))];

	const numVars = vars.length;

	const totalNumTerms = Math.pow(2, numVars);

	let minTerms = [];

	for (let term = 0; term < totalNumTerms; term++) {
		const bits = getBits(term, numVars);

		let truthValueComb = vars.reduce(function (obj, variable, index) {
			obj[variable] = +bits.charAt(index);
			return obj;
		}, {});

		const evaluation = +math.evaluate(expression, truthValueComb);

		if (evaluation == 1) {
			minTerms.push(term);
		}
	}

	return { vars, minTerms };
}

/**
 * Construcsts and gives an expression from minterms and variables names
 */
export function generateExpressionFromMinterms(minTerms, varNames) {
	let stringMinterms = [];

	for (let i = 0; i < minTerms.length; i++) {
		let minTerm = minTerms[i];
		let bin = getBits(minTerm, varNames.length);
		console.log(bin);
		let stringMinterm = [];

		for (let j = 0; j < varNames.length; j++) {
			let varName = varNames[j];
			let varString = "";
			let varValue = bin.charAt(j) == "1";
			varValue ? (varString = varName) : (varString = "not " + varName);
			stringMinterm.push(varString);
		}
		stringMinterms.push(stringMinterm);
	}

	let andClauses = [];

	stringMinterms.forEach((minTerm) => {
		andClauses.push(interleave(minTerm, "and").join(" "));
	});

	let stringExpression = interleave(andClauses, "or").join(" ");

	return stringExpression;
}

// export function minimiseExpression(vars, minTerms, dontCares) {
// 	let sop = new QuineMcCluskey(vars, minTerms, dontCares, false);

// 	let maxTerms = [];

// 	let numVars = vars.length;

// 	let totalNumTerms = Math.pow(2, numVars);

// 	for (let i = 0; i < totalNumTerms; i++) {
// 		if (!minTerms.includes(i)) {
// 			maxTerms.push(i);
// 		}
// 	}

// 	let reversedDCs = [];

// 	reversedDCs.push(
// 		dontCares.map((term) => {
// 			return totalNumTerms - term;
// 		})
// 	);

// 	console.log(maxTerms);

// 	let pos = new QuineMcCluskey(vars, maxTerms, reversedDCs, true);

// 	let dnf = sop.getFunction();
// 	let cnf = pos.getFunction();

// 	document.getElementById("min_DNF").innerHTML = dnf;
// 	document.getElementById("min_CNF").innerHTML = cnf;
// }
