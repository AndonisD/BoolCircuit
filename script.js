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
	var expr = document.getElementById("expression_input").innerHTML;
	generateTruthTable(expr);
	generateCircuit(expr);
}

function submitMinterms() {}

function generateTruthTable(expression) {
	var varNodes = math.parse(expression).filter((node) => node.isSymbolNode);

	var vars = [...new Set(varNodes.map((item) => item.name))];

	const parser = math.parser();

	var table = "<table>";

	table += "<thead><tr>";

	table += "<th class='termColumn'></th>"; //column above the term numbers

	vars.forEach((v) => {
		table += "<th>";
		table += v;
		table += "</th>";
	});

	table += "<th>";
	table += "output";
	table += "</th>";

	table += "</tr></thead>";

	var output = [];

	var numVars = vars.length;

	var truthConditions = [];

	var termCount = 0;

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

function feedToEspresso(truthConditions, numVars) {
	var espressoTable = [];

	for (var i = 0; i < truthConditions.length; i++) {
		var assignmentRow = [];

		var varCounter = 0;

		for (const [variable, value] of Object.entries(truthConditions[i])) {
			// console.log(varCounter, variable, value)

			//convert var positions (0,1,2...) into signed binary string
			//append truth value (0/1) to the string
			var bin = varCounter.toString(2) + value;
			//convert the resulting string to int
			var int = parseInt(bin, 2);

			assignmentRow.push(int);

			// console.log(Math.pow(2, varCounter) + value) /

			varCounter++;
		}

		espressoTable.push(assignmentRow);
	}

	const dcSet = [];

	return window.espresso(espressoTable, dcSet);
}

function generateMinimisedExpression(binaryMinTerms, varNames) {
	// const numOR = binaryMinTerms.length-1

	// const numAND = binaryMinTerms.reduce((sum, arrayItem) => arrayItem.length > 1 ? sum + 1 : sum)

	//^ INCORRECT becuase

	var output = [];

	for (var i = binaryMinTerms.length - 1; i >= 0; i--) {
		output.push(
			binaryMinTerms[i].reduce(function (obj, variable, index) {
				//var = 10
				var bin = "0" + variable.toString(2);
				var binVarIndex = bin.substr(0, bin.length - 1);
				var truthValue = bin.slice(-1);

				var varIndex = parseInt(binVarIndex, 2);

				var varName = varNames[varIndex];

				obj[varName] = parseInt(truthValue);

				return obj;
			}, {})
		);
	}

	// var minExpression = "";

	var arrayStrings = [];

	arrayStrings.push();

	output.forEach((minTerm) => {
		var stringMinTerm = [];

		Object.keys(minTerm).forEach((varName) => {
			var value = minTerm[varName];
			console.log(value);
			var varValue = "";
			value ? (varValue = varName) : (varValue = "not " + varName);

			stringMinTerm.push(varValue);
		});

		arrayStrings.push(stringMinTerm);
	});

	console.log(arrayStrings);

	const interleave = (arr, thing) =>
		[].concat(...arr.map((n) => [n, thing])).slice(0, -1);

	var andClauses = [];
	var stringTest = arrayStrings.forEach((mintermArray) => {
		var arrayAndClause = interleave(mintermArray, "and");
		andClauses.push(arrayAndClause.join(" "));
	});

	var stringExpression = interleave(andClauses, "or");

	stringExpression = stringExpression.join(" ");

	document.getElementById("minCond").innerHTML = stringExpression;

	generateCircuit(stringExpression);

	var defaultCircuitModel = {
		class: "GraphLinksModel",
		linkFromPortIdProperty: "fromPort",
		linkToPortIdProperty: "toPort",
		nodeDataArray: [],
		linkDataArray: [],
	};

	// defaulCircuitObj.nodeDataArray = nodeDataArray;

	// var circuitJsonStr = JSON.stringify(defaulCircuitObj)

	// document.getElementById("mySavedModel").innerHTML = circuitJsonStr;

	// load()
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
			return new math.SymbolNode(inputVarMap.get(key));
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
