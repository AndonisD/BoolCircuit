import { getBits } from "./util.js";

export function generateTruthTable(varNames, minTerms, dontCares) {
	var numVars = varNames.length;

	var totalNumTerms = Math.pow(2, numVars);

	var table = "<table id='truth_table'>";

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

	return table;
}
