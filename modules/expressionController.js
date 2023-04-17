import { getBits, interleave } from "./util.js";

/**
 * Returns variable names and minterms from a given expression
 */
export function breakDownExpression(expression) {
	if (!expression) throw "Please enter a valid expression";

	if (expression.includes("nbsp")) throw "Plase omit any unnecessary spaces";

	let expressionTree;

	try {
		expressionTree = math.parse(expression);
	} catch (error) {
		throw "Please enter a valid expression";
	}

	let varNodes = expressionTree.filter((node) => node.isSymbolNode);

	if (
		!varNodes.every((varName) => {
			return varName.name.match(/^[a-z|A-Z]$/g);
		})
	) {
		throw "Please only use single character inputs!";
	}

	if (
		!varNodes.every((varName) => {
			return varName.name.length === 1;
		})
	) {
		throw "Please only use single character inputs!";
	}

	let opNodes = expressionTree.filter((node) => node.isOperatorNode);

	if (
		!opNodes.every((opNode) => {
			return opNode.op === "and" || opNode.op === "or" || opNode.op === "not";
		})
	) {
		throw "Please use the correct operators (and, or, not)!";
	}

	let allNodes = [];
	expressionTree.traverse(function (node) {
		allNodes.push(node);
	});

	if (
		!allNodes.every((node) => {
			return (
				node.type === "ParenthesisNode" ||
				node.isSymbolNode ||
				node.isOperatorNode
			);
		})
	) {
		throw "Please enter a valid expression";
	}

	let vars = [...new Set(varNodes.map((item) => item.name))];

	const numVars = vars.length;

	const totalNumTerms = Math.pow(2, numVars);

	let minTerms = [];

	for (let term = 0; term < totalNumTerms; term++) {
		const bits = getBits(term, numVars);

		const truthValueComb = vars.reduce(function (obj, variable, index) {
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
 * Construcsts and returns a boolean expression in caconical sop form
 * @param {String[]} varNames - array of variable names
 * @param {Number[]} minTerms - array of minterms
 */
export function generateExpressionFromMinterms(varNames, minTerms) {
	let stringMinterms = []; //holds arrays of string minterms

	for (let i = 0; i < minTerms.length; i++) {
		let minTerm = minTerms[i];
		let bin = getBits(minTerm, varNames.length); //term as a binary string
		let stringMinterm = []; // e.g. [a, not b, c]

		for (let j = 0; j < varNames.length; j++) {
			const varName = varNames[j];
			let varString = "";
			const varValue = bin.charAt(j) == "1";
			varValue ? (varString = varName) : (varString = "not " + varName);
			stringMinterm.push(varString);
		}
		stringMinterms.push(stringMinterm);
	}

	let andClauses = [];

	// [a, not b, c] --> "a and not b and c"
	stringMinterms.forEach((minTerm) => {
		andClauses.push(interleave(minTerm, "and").join(" "));
	});

	//insert "or" between the clauses
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

// export function breakDownExpression(expressionTree) {
// 	let varNodes = expressionTree.filter((node) => node.isSymbolNode);

// 	let vars = [...new Set(varNodes.map((item) => item.name))];

// 	const numVars = vars.length;

// 	const totalNumTerms = Math.pow(2, numVars);

// 	let minTerms = [];

// 	for (let term = 0; term < totalNumTerms; term++) {
// 		const bits = getBits(term, numVars);

// 		const truthValueComb = vars.reduce(function (obj, variable, index) {
// 			obj[variable] = +bits.charAt(index);
// 			return obj;
// 		}, {});

// 		const evaluation = +expressionTree.evaluate(truthValueComb);

// 		if (evaluation == 1) {
// 			minTerms.push(term);
// 		}
// 	}

// 	return { vars, minTerms };
// }
