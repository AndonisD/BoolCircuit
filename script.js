import QuineMcCluskey from "./quinemccluskey.js";

window.onload = (event) => {};

document
	.getElementById("submit_circuit")
	.addEventListener("click", submitCircuit);

document
	.getElementById("submit_expression")
	.addEventListener("click", submitExpression);

document
	.getElementById("submit_table")
	.addEventListener("click", submitMinterms);

// document.getElementById("minimise_button").addEventListener("click", minimise);

function submitExpression() {
	var expression = document.getElementById("expression_input").innerHTML;
	generateTruthTableFromExpression(expression);
	generateCircuit(expression);
}

function submitMinterms() {
	var varNames = document.getElementById("vars_input").innerHTML.split(",");
	var minTerms = document.getElementById("minterms_input").innerHTML.split(",");
	var dontCares = document
		.getElementById("dontcare_input")
		.innerHTML.split(",");

	var expression = generateExpressionFromMinterms(minTerms, varNames);

	document.getElementById("expression_input").innerHTML = expression;

	generateTruthTable(varNames, minTerms, dontCares);

	generateCircuit(expression);
}

function extractMinterms(expression) {}

function generateTruthTable(varNames, minTerms, dontCares) {
	var numVars = varNames.length;

	var totalNumTerms = Math.pow(2, numVars);

	var table = "<table>";

	table += "<thead><tr>";
	//column above the term numbers
	table += "<th class='termColumn'></th>";
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
		table += "<td class='termColumn'>";
		table += term.toString();
		table += "</td>";
		//var truth values
		for (const bit of bits) {
			table += "<td>";
			table += bit;
			table += "</td>";
		}
		//function output
		table += "<td>";
		table += minTerms.includes(term.toString())
			? "1"
			: dontCares.includes(term.toString())
			? "x"
			: "0";
		table += "</td>";

		table += "</tr>";
	}

	table += "</table>";

	document.getElementById("table").innerHTML = table;
}

function generateTruthTableFromExpression(expression) {
	var varNodes = math.parse(expression).filter((node) => node.isSymbolNode);

	var vars = [...new Set(varNodes.map((item) => item.name))];

	var table = "<table>";

	table += "<thead><tr>";
	//column above the term numbers
	table += "<th class='termColumn'></th>";
	//columns for each var
	vars.forEach((v) => {
		table += "<th>";
		table += v;
		table += "</th>";
	});
	//column for output
	table += "<th>";
	table += "output";
	table += "</th>";

	table += "</tr></thead>";

	var output = [];

	var numVars = vars.length;

	var truthConditions = [];

	var termCount = 0;
	//for each row
	for (var i = 0; i < Math.pow(2, numVars); i++) {
		var binary = i.toString(2);
		binary = "0".repeat(numVars - binary.length) + binary;
		output.push(
			vars.reduce(function (obj, variable, index) {
				obj[variable] = +binary.charAt(index);
				return obj;
			}, {})
		);

		table += "<tr>";

		table += "<td class='termColumn'>";
		table += termCount;
		table += "</td>";

		termCount++;

		for (const [variable, value] of Object.entries(output[i])) {
			table += "<td>";
			table += value;
			table += "</td>";
		}

		table += "<td>";

		try {
			var evaluation = +math.evaluate(expression, output[i]);
			table += evaluation;

			if (evaluation == 1) {
				truthConditions.push(output[i]);
			}
		} catch (err) {
			document.getElementById("demo").innerHTML = err.message; //SET TO ERROR MESSAGE ELEMENT
			return;
		}

		table += "</td>";

		table += "</tr>";
	}

	table += "</table>";

	document.getElementById("table").innerHTML = table;
}

function getBits(value, numVars) {
	let s = (value >>> 0).toString(2);
	for (let i = s.length; i < numVars; i++) s = "0" + s;
	return s;
}

function interleave(arr, thing) {
	return [].concat(...arr.map((n) => [n, thing])).slice(0, -1);
}

function generateExpressionFromMinterms(minTerms, varNames) {
	console.log(minTerms);
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

function NodeData(category, key) {
	this.category = category;
	this.key = key;
	this.loc = "";
}

//toPort only required for AND and OR
function LinkData(fromKey, toKey, toPort = "") {
	this.from = fromKey;
	this.to = toKey;
	this.fromPort = "";
	this.toPort = toPort;
}

function generateCircuit(expression) {
	var circuitModel = {
		class: "GraphLinksModel",
		linkFromPortIdProperty: "fromPort",
		linkToPortIdProperty: "toPort",
		nodeDataArray: [],
		linkDataArray: [],
	};

	var nodeDataArray = [];

	var linkDataArray = [];

	const expressionTree = math.parse(expression);

	var inputNum = 0;

	var isFirst = true;

	var keyID = 0;

	var outputNode = new NodeData("output", "o");

	nodeDataArray.push(outputNode);

	var preOrderTraversal = [];

	//when just 1 symbol is passed...need to generate without espresso

	expressionTree.traverse(function (node) {
		preOrderTraversal.push(node);
	});

	var operandStack = [];
	// operatorStack = []

	console.log(preOrderTraversal.length);

	preOrderTraversal.reverse();

	for (let i = 0; i < preOrderTraversal.length; i++) {
		var node = preOrderTraversal[i];
		console.log();
		switch (node.type) {
			case "OperatorNode":
				console.log(node.type, node.op);

				var nodeKey = ++keyID;

				var nodeData = new NodeData(node.op, nodeKey);

				console.log(node.op);
				if (node.op == "and" || node.op == "or") {
					var input1 = operandStack.pop();
					var input2 = operandStack.pop();
					//reversed on purpose

					var link1 = new LinkData(input1.key, nodeKey, "in1");
					var link2 = new LinkData(input2.key, nodeKey, "in2");

					linkDataArray.push(link1, link2);
				} else if (node.op == "not") {
					var input = operandStack.pop();

					var link = new LinkData(input.key, nodeKey);

					linkDataArray.push(link);
				}

				nodeDataArray.push(nodeData);

				if (i == preOrderTraversal.length - 1) {
					var finalLink = new LinkData(nodeKey, outputNode.key);
					linkDataArray.push(finalLink);
				}

				operandStack.push(nodeData);

				break;
			case "SymbolNode":
				console.log(node.type, node.name);

				var nodeData = new NodeData("input", node.name);

				var alreadyExists = false;

				nodeDataArray.forEach((existingNode) => {
					if (existingNode.key == node.name) {
						alreadyExists = true;
						return;
					}
				});

				if (!alreadyExists) {
					nodeDataArray.push(nodeData);
				}

				if (i == preOrderTraversal.length - 1) {
					var finalLink = new LinkData(node.name, outputNode.key);
					linkDataArray.push(finalLink);
				}

				operandStack.push(nodeData);

				break;
			default:
				console.log(node.type);
		}
	}

	circuitModel.nodeDataArray = nodeDataArray.reverse();
	circuitModel.linkDataArray = linkDataArray;

	var circuitJsonStr = JSON.stringify(circuitModel);

	document.getElementById("mySavedModel").setHTML(circuitJsonStr);

	load();

	arrange();
}

function submitCircuit() {
	save();

	var circuitModel = JSON.parse(
		document.getElementById("mySavedModel").innerHTML
	);

	// const node1 = new math.SymbolNode('a')
	// const node2 = new math.SymbolNode('b')
	// const node3 = new math.SymbolNode('a')
	// const node4 = new math.OperatorNode('and', 'and', [node1, node2])
	// console.log(node4.toString())

	console.log(circuitModel.nodeDataArray);

	var outputKeys = [];

	var nodeMap = new Map();

	var inputVarMap = new Map();

	var keyIndex = 0;

	circuitModel.nodeDataArray.forEach((nodeData) => {
		switch (nodeData.category) {
			case "output":
				nodeMap.set(nodeData.key, nodeData.category);
				outputKeys.push(nodeData.key);
				break;
			case "input":
				var key = nodeData.key;
				if (typeof key != "string") {
					inputVarMap.set(nodeData.key, inputVarNameGenerator(keyIndex));
					keyIndex++;
				} else {
					inputVarMap.set(nodeData.key, nodeData.key);
				}
				nodeMap.set(nodeData.key, nodeData.category);
				break;
			case "and":
			case "or":
			case "not":
				nodeMap.set(nodeData.key, nodeData.category);
				break;
			default:
				console.log("gate not supported!"); //GIVE VISIBLE ERROR AND RETURN
		}
	});

	if (outputKeys.length > 1) {
		//ONLY 1 OUTPUT SUPPORTED AND RETURN
	} else if (outputKeys.length < 1) {
		//PLEASE ADD AN OUTPUT AND RETURN
	}

	var outputKey = outputKeys[0];

	var linkDataArray = circuitModel.linkDataArray;

	var end = linkDataArray.filter(({ to }) => {
		return to == outputKey;
	});

	console.log("END:" + end);

	console.log(nodeMap);

	var lastNode = end[0];

	var tree = "";

	try {
		tree = iterateLinkData(nodeMap, inputVarMap, linkDataArray, lastNode.from);
	} catch (err) {
		alert(err.message);
	}

	console.log(tree.toString());
}

// const node1 = new math.SymbolNode('a')
// const node2 = new math.SymbolNode('b')
// const node3 = new math.SymbolNode('a')
// const node4 = new math.OperatorNode('and', 'and', [node1, node2])
// console.log(node4.toString())

//varnames currently depend on order in which nodes were place. Set temp varnames and change in final expression?

//GIVE ERROR FOR CYCLES
function iterateLinkData(nodeMap, inputVarMap, linkDataArray, key) {
	var toLinks = linkDataArray.filter(({ to }) => {
		return to == key;
	});

	var type = nodeMap.get(key);

	console.log(type);

	switch (type) {
		case "input":
			return new math.SymbolNode(key);
			break;
		case "and":
		case "or":
			//CHECK THAT toLinks HAS 2 RETURN ERROR OTHERWISE
			var child1 = iterateLinkData(
				nodeMap,
				inputVarMap,
				linkDataArray,
				toLinks[0].from
			);
			var child2 = iterateLinkData(
				nodeMap,
				inputVarMap,
				linkDataArray,
				toLinks[1].from
			);
			return new math.OperatorNode(type, type, [child1, child2]);
			break;
		case "not":
			//CHECK THAT toLinks HAS 2 RETURN ERROR OTHERWISE
			var child = iterateLinkData(
				nodeMap,
				inputVarMap,
				linkDataArray,
				toLinks[0].from
			);
			return new math.OperatorNode(type, type, [child]);
			break;
		default: //GIVE VISIBLE ERROR AND RETURN
			console.log("gate not supported!");
			console.log(type);
	}
}

function inputVarNameGenerator(i) {
	const abc = "abcdefghijklmnopqrstuvwxyz";
	return abc[i];
}

function minimise() {
	// let sop = new QuineMcCluskey("abc", [3,6,7]);
	// let pos = new QuineMcCluskey("abc", [0,1,2,4,5], [], true);
	// let sop = new QuineMcCluskey("abcd", [1,3,7,11,15], [0,2,5], true);
	// let sop = new QuineMcCluskey("abcd", [4,5,6,9,11,12,13,14], [0,1,3,7]);
	let sop = new QuineMcCluskey("abcd", [0], [], false);

	// console.log(sop.getFunction())
	console.log(sop.getFunction());
	// console.log(pos.getFunction())
}
