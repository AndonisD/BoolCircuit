import QuineMcCluskey from "./quinemccluskey.js";
import { getBits } from "./util.js";

export function minimiseExpression(vars, minTerms, dontCares) {
	let sop = new QuineMcCluskey(vars, minTerms, dontCares, false);

	let maxTerms = [];

	let numVars = vars.length;

	let totalNumTerms = Math.pow(2, numVars);

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

	let pos = new QuineMcCluskey(vars, maxTerms, reversedDCs, true);

	let dnf = sop.getFunction();
	let cnf = pos.getFunction();

	document.getElementById("min_DNF").innerHTML = dnf;
	document.getElementById("min_CNF").innerHTML = cnf;
}

export function breakDownExpression(expression) {
	var varNodes = math.parse(expression).filter((node) => node.isSymbolNode);

	let vars = [...new Set(varNodes.map((item) => item.name))];

	var numVars = vars.length;

	var totalNumTerms = Math.pow(2, numVars);

	var minTerms = [];

	for (var term = 0; term < totalNumTerms; term++) {
		var bits = getBits(term, numVars);

		let truthValueComb = vars.reduce(function (obj, variable, index) {
			obj[variable] = +bits.charAt(index);
			return obj;
		}, {});

		var evaluation = +math.evaluate(expression, truthValueComb);

		if (evaluation == 1) {
			minTerms.push(term);
		}
	}

	return { vars, minTerms };
}
