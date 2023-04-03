import { generateCircuit, parseCircuit } from "./circuitController.js";
import { getBits, interleave } from "./util.js";
import {
	breakDownExpression,
	minimiseExpression,
} from "./expressionController.js";
import {
	generateTruthTable,
	generateExpressionFromMinterms,
} from "./truthTableController.js";

document
	.getElementById("submit_circuit")
	.addEventListener("click", submitCircuit);

document
	.getElementById("submit_expression")
	.addEventListener("click", submitExpression);

document
	.getElementById("submit_table")
	.addEventListener("click", submitMinterms);

document.getElementById("go_DNF").addEventListener("click", () => {
	useMinExpression("DNF");
});

document.getElementById("go_CNF").addEventListener("click", () => {
	useMinExpression("CNF");
});

function submitCircuit() {
	let expression = parseCircuit();
	let { vars, minTerms } = breakDownExpression(expression);
	let dontCares = [];
	document.getElementById("expression_input").innerHTML = expression;
	document.getElementById("vars_input").innerHTML = vars;
	document.getElementById("minterms_input").innerHTML = minTerms;
	generateTruthTable(vars, minTerms, dontCares);
	minimiseExpression(vars, minTerms, dontCares);
}

function submitExpression() {
	var expression = document.getElementById("expression_input").innerHTML;
	let { vars, minTerms } = breakDownExpression(expression);
	let dontCares = [];
	document.getElementById("vars_input").innerHTML = vars;
	document.getElementById("minterms_input").innerHTML = minTerms;
	generateTruthTable(vars, minTerms, dontCares);
	generateCircuit(expression);
	minimiseExpression(vars, minTerms, dontCares);
}

function submitMinterms() {
	var vars = document.getElementById("vars_input").innerHTML.split(",");
	var minTerms = document
		.getElementById("minterms_input")
		.innerHTML.split(",")
		.map((str) => {
			return parseInt(str);
		});
	var dontCares = document
		.getElementById("dontcare_input")
		.innerHTML.split(",")
		.map((str) => {
			return parseInt(str);
		});

	var expression = generateExpressionFromMinterms(minTerms, vars);

	document.getElementById("expression_input").innerHTML = expression;

	generateTruthTable(vars, minTerms, dontCares);

	generateCircuit(expression);

	minimiseExpression(vars, minTerms, dontCares);
}

function useMinExpression(type) {
	let isDNF = type === "DNF";
	let expression = document.getElementById(
		isDNF ? "min_DNF" : "min_CNF"
	).innerHTML;
	let { vars, minTerms } = breakDownExpression(expression);
	let dontCares = [];
	generateCircuit(expression);
}
