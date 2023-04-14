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
	showError();
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
	const expression = document
		.getElementById("expression_input")
		.innerHTML.trim();
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
	showError();
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
	const expression = generateExpressionFromMinterms(vars, minTerms);

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

function useMinExpression(type) {
	let isDNF = type === "DNF";
	let expression = document.getElementById(
		isDNF ? "min_DNF" : "min_CNF"
	).innerHTML;
	let { vars, minTerms } = breakDownExpression(expression);
	let dontCares = [];
	generateCircuit(expression);
}

document.getElementById("info_button").addEventListener("click", () => {
	const expression = "a and b or b and c or (not b or c)";
	document.getElementById("expression_input").innerHTML = expression;
	document.getElementById("submit_expression").click();

	introJs()
		.setOptions({
			showProgress: true,
			showBullets: false,
			disableInteraction: false,
			tooltipClass: "customTooltip",
			steps: [
				{
					title:
						"Welcome to  <img style='height: 30px; left: 100%; margin-top:5px' src='https://fontmeme.com/permalink/230408/b0698910e76c71bb85eae67c9fcecdc2.png' alt='pixel-fonts' border='0'>",
					intro: "Lightweight combinational logic circuit visualiser",
				},
				{
					intro:
						"There are 3 ways for you to input and interact with boolean functions...",
				},
				{
					title: "Circuits",
					element: document.querySelector(".circuit_container"),
					intro:
						"This is the circuit editor. You can build your logic circuits here.",
				},
				{
					title: "Boolean Expressions",
					element: document.querySelector(".expression_container"),
					intro: "Or you can input a boolean expression",
				},
				{
					title: "Boolean Functions",
					element: document.querySelector(".function_container"),
					intro: "Or define a boolean function directly",
				},
				{
					title: "Truth Tables",
					element: document.querySelector(".table_container"),
					intro: "This is where the truth table will appear",
				},
				{
					title: "Minimisation",
					element: document.querySelector(".min_container"),
					intro: "You can also view the minimised forms of your functions!",
				},
				{
					element: document.querySelector(".min_info"),
					intro: "Hover over these for more info",
				},
				{
					title:
						"<img style='height: 30px; left: 100%;' src='https://fontmeme.com/permalink/230407/714842a4c8050a8c984484ae7621f3e4.png' alt='pixel-fonts' border='0'>",
					intro: "Have fun exploring the world of combinational logic!",
				},
			],
		})
		.start();
});
