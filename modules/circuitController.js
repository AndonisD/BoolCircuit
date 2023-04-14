export function generateCircuit(expression) {
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

	var keyID = 0;

	var outputNode = new NodeData("output", "o");

	nodeDataArray.push(outputNode);

	var preOrderTraversal = [];

	expressionTree.traverse(function (node) {
		preOrderTraversal.push(node);
	});

	var operandStack = [];
	// operatorStack = []

	preOrderTraversal = preOrderTraversal
		.filter((node) => {
			return node.type !== "ParenthesisNode";
		})
		.reverse();

	console.log(preOrderTraversal);

	for (let i = 0; i < preOrderTraversal.length; i++) {
		var node = preOrderTraversal[i];

		let nodeData;
		switch (node.type) {
			case "OperatorNode":
				const nodeKey = ++keyID;

				nodeData = new NodeData(node.op, nodeKey);

				if (node.op == "and" || node.op == "or") {
					const input1 = operandStack.pop();
					const input2 = operandStack.pop();

					const link1 = new LinkData(input1.key, nodeKey, "in1");
					const link2 = new LinkData(input2.key, nodeKey, "in2");

					linkDataArray.push(link1, link2);
				} else if (node.op == "not") {
					const input = operandStack.pop();

					const link = new LinkData(input.key, nodeKey);

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
				nodeData = new NodeData("input", node.name);

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
				console.log(node.type); //THROW ERR
		}
	}

	circuitModel.nodeDataArray = nodeDataArray.reverse();
	circuitModel.linkDataArray = linkDataArray;

	var circuitJsonStr = JSON.stringify(circuitModel);

	document.getElementById("mySavedModel").setHTML(circuitJsonStr);

	load();

	arrange();
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

export function parseCircuit() {
	save();

	var circuitModel = JSON.parse(
		document.getElementById("mySavedModel").innerHTML
	);

	console.log(circuitModel);

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

	var lastNode = end[0];

	var tree = "";

	try {
		tree = iterateLinkData(nodeMap, inputVarMap, linkDataArray, lastNode.from);
	} catch (err) {
		alert(err.message);
	}

	return tree.toString();
}

function iterateLinkData(nodeMap, inputVarMap, linkDataArray, key) {
	var toLinks = linkDataArray.filter(({ to }) => {
		return to == key;
	});

	var type = nodeMap.get(key);

	switch (type) {
		case "input":
			return new math.SymbolNode(key);
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
		case "not":
			var child = iterateLinkData(
				nodeMap,
				inputVarMap,
				linkDataArray,
				toLinks[0].from
			);
			return new math.OperatorNode(type, type, [child]);
		default: //GIVE VISIBLE ERROR AND RETURN
			console.log("gate not supported!");
	}
}

function inputVarNameGenerator(i) {
	const abc = "abcdefghijklmnopqrstuvwxyz";
	return abc[i];
}
