import { getBits, interleave } from "./util.js";

export function generateTruthTable(varNames, minTerms, dontCares) {
	var numVars = varNames.length;

	var totalNumTerms = Math.pow(2, numVars);

	var table = "<table>";

	table += "<thead><tr>";
	//column above the term numbers
	table += "<th class='term-column'></th>";
	//columns for each var
	varNames.forEach((v) => {
		table += "<th>";
		table += v;
		table += "</th>";
	});
	//column for output
	table += "<th>";
	table += "output";
	table += "</th>";

	table += "</tr></thead>";

	for (var term = 0; term < totalNumTerms; term++) {
		//truth value comb in binary
		var bits = getBits(term, numVars).split("");

		table += "<tr>";
		//term number
		table += "<td class='term-column'>";
		table += term.toString();
		table += "</td>";
		//var truth values
		for (const bit of bits) {
			table += "<td>";
			table += bit;
			table += "</td>";
		}
		//function output
		// table += "<td>";
		table += minTerms.includes(term)
			? "<td class='output-true'> 1"
			: dontCares.includes(term)
			? "<td> x"
			: "<td class='output-false'>0";
		table += "</td>";

		table += "</tr>";
	}

	table += "</table>";

	document.getElementById("table").innerHTML = table;
}

export function generateExpressionFromMinterms(minTerms, varNames) {
	var stringMinterms = [];

	for (var i = 0; i < minTerms.length; i++) {
		var minTerm = minTerms[i];
		var bin = getBits(minTerm, varNames.length);
		console.log(bin);
		var stringMinterm = [];

		for (var j = 0; j < varNames.length; j++) {
			var varName = varNames[j];
			var varString = "";
			var varValue = bin.charAt(j) == "1";
			varValue ? (varString = varName) : (varString = "not " + varName);
			stringMinterm.push(varString);
		}
		stringMinterms.push(stringMinterm);
	}

	var andClauses = [];

	stringMinterms.forEach((minTerm) => {
		andClauses.push(interleave(minTerm, "and").join(" "));
	});

	var stringExpression = interleave(andClauses, "or").join(" ");

	return stringExpression;
}
