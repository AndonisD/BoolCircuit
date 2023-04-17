import { getBits } from "./util.js";

/**
 * Generates an html table representing a boolean function
 */
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
			: "<td class='output-false'> 0";
		table += "</td>";

		table += "</tr>";
	}

	table += "</table>";

	return table;
}

/**
 * Validates the inputs of the boolean function component and returns them in the desired formats
 */
export function processFunction(varsInput, minTermsInput, dontCaresInput) {
	const varList = /^[a-z|A-Z](,[a-z|A-Z])*$/g;
	const numList = /^[0-9]+(,[0-9]+)*[0-9]*$/g;

	if (!varsInput.match(varList)) throw "Please check the format of variables";

	const vars = varsInput.split(",");

	const maxTerm = Math.pow(2, vars.length) - 1;

	let minTerms = [];

	if (minTermsInput !== "") {
		if (!minTermsInput.match(numList))
			throw "Please check the format of minterms";

		minTerms = minTermsInput.split(",").map((str) => {
			return parseInt(str);
		});

		let minTermWithinBounds = minTerms.every((term) => {
			return term >= 0 && term <= maxTerm;
		});

		let minTermDuplicates = new Set(minTerms).size !== minTerms.length;

		if (!minTermWithinBounds || minTermDuplicates)
			throw "Please check minterms";
	}

	let dontCares = [];

	if (dontCaresInput !== "") {
		if (!dontCaresInput.match(numList))
			throw "Please check the format of don't care terms";

		dontCares = dontCaresInput.split(",").map((str) => {
			return parseInt(str);
		});

		let dontCaresWithinBounds = dontCares.every((term) => {
			return term >= 0 && term <= maxTerm;
		});

		let dontCareDuplicates = new Set(dontCares).size !== dontCares.length;

		let combinedArray = minTerms.concat(dontCares);

		//if there are duplicates in the combined array, then minterms and don't cares share values
		let combinedDuplicates =
			new Set(combinedArray).size !== combinedArray.length;

		if (!dontCaresWithinBounds || dontCareDuplicates)
			throw "Please check don't care terms";

		if (combinedDuplicates)
			throw "Please make sure minterms and don't cares don't share any values";
	}

	return { vars, minTerms, dontCares };
}
