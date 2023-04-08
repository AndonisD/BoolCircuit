import { generateCircuit, parseCircuit } from "./modules/circuitController.js";
import {
	breakDownExpression,
	generateExpressionFromMinterms,
} from "./modules/expressionController.js";
import { generateTruthTable } from "./modules/truthTableController.js";
import { minimiseFunction } from "./modules/minimisationController.js";

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

	updateExpression(expression);
	updateMinterms(vars, minTerms);
	updateTruthTable(vars, minTerms, dontCares);
	updateMinimisedFunctions(vars, minTerms, dontCares);
}

function submitExpression() {
	showError();
	const expression = document.getElementById("expression_input").innerHTML;
	let vars, minTerms;
	try {
		({ vars, minTerms } = breakDownExpression(expression));
	} catch (error) {
		showError(error);
		return;
	}

	let dontCares = [];

	updateTruthTable(vars, minTerms, dontCares);
	generateCircuit(expression);
	updateMinterms(vars, minTerms);
	updateMinimisedFunctions(vars, minTerms, dontCares);
}

function submitMinterms() {
	const vars = document.getElementById("vars_input").innerHTML.split(",");
	const minTerms = document
		.getElementById("minterms_input")
		.innerHTML.split(",")
		.map((str) => {
			return parseInt(str);
		});
	const dontCares = document
		.getElementById("dontcare_input")
		.innerHTML.split(",")
		.map((str) => {
			return parseInt(str);
		});
	const expression = generateExpressionFromMinterms(minTerms, vars);

	updateExpression(expression);
	generateCircuit(expression);
	updateTruthTable(vars, minTerms, dontCares);
	updateMinimisedFunctions(vars, minTerms, dontCares);
}

function updateMinimisedFunctions(vars, minTerms, dontCares) {
	let dnf = "";
	let cnf = "";

	({ dnf, cnf } = minimiseFunction(vars, minTerms, dontCares));

	document.getElementById("min_DNF").innerHTML = dnf;
	document.getElementById("min_CNF").innerHTML = cnf;
}

function updateMinterms(vars, minTerms) {
	document.getElementById("vars_input").innerHTML = vars;
	document.getElementById("minterms_input").innerHTML = minTerms;
}

function updateTruthTable(vars, minTerms, dontCares) {
	const htmlTable = generateTruthTable(vars, minTerms, dontCares);
	document.getElementById("table").innerHTML = htmlTable;
}

function updateExpression(expression) {
	document.getElementById("expression_input").innerHTML = expression;
}

function generateUpdateExpression(minTerms, vars) {
	const expression = generateExpressionFromMinterms(minTerms, vars);
	document.getElementById("expression_input").innerHTML = expression;
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
