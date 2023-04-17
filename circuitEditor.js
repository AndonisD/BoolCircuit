// var red = "orangered"; // 0 or false
// var green = "forestgreen"; // 1 or true
var red = "#FF504A";
var green = "#45BD4F";

function init() {
	// Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
	// For details, see https://gojs.net/latest/intro/buildingObjects.html
	const $ = go.GraphObject.make; // for conciseness in defining templates

	myDiagram = $(
		go.Diagram,
		"myDiagramDiv", // create a new Diagram in the HTML DIV element "myDiagramDiv"
		{
			"dragSelectingTool.canStart": function () {
				if (!this.isEnabled) return false;
				const diagram = this.diagram;
				if (!diagram.allowSelect) return false;
				const e = diagram.lastInput;
				if (!e.left) return false; // require left button
				// don't include the following checks when this tool is running modally
				if (diagram.currentTool !== this) {
					if (!this.isBeyondDragSize()) return false; // must not be a click
					// don't start if we're over a selectable part
					if (diagram.findPartAt(e.documentPoint, true) !== null) return false;
				}
				return e.shift; // only when the Shift key is also held down
			},
			"draggingTool.isGridSnapEnabled": true, // dragged nodes will snap to a grid of 10x10 cells
			"undoManager.isEnabled": true,
		}
	);

	// when the document is modified, add a "*" to the title and enable the "Save" button
	myDiagram.addDiagramListener("Modified", (e) => {
		var button = document.getElementById("saveModel");
		if (button) button.disabled = !myDiagram.isModified;
		var idx = document.title.indexOf("*");
		if (myDiagram.isModified) {
			if (idx < 0) document.title += "*";
		} else {
			if (idx >= 0) document.title = document.title.slice(0, idx);
		}
	});

	var palette = new go.Palette("palette"); // create a new Palette in the HTML DIV element "palette"

	// creates relinkable Links that will avoid crossing Nodes when possible and will jump over other Links in their paths
	myDiagram.linkTemplate = $(
		go.Link,
		{
			routing: go.Link.AvoidsNodes,
			curve: go.Link.JumpOver,
			corner: 4,
			reshapable: true,
			resegmentable: true,
			relinkableFrom: true,
			relinkableTo: true,
			selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
			shadowOffset: new go.Point(0, 0),
			shadowBlur: 5,
			shadowColor: "blue",
		},
		new go.Binding("isShadowed", "isSelected").ofObject(),
		$(go.Shape, { name: "SHAPE", strokeWidth: 2, stroke: red })
	);

	// node template helpers
	var sharedToolTip = $(
		"ToolTip",
		{ "Border.figure": "RoundedRectangle" },
		$(
			go.TextBlock,
			{ margin: 2 },
			new go.Binding("text", "", (d) => d.category)
		)
	);

	// define some common property settings
	function nodeStyle() {
		return [
			new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
				go.Point.stringify
			),
			new go.Binding("isShadowed", "isSelected").ofObject(),
			{
				selectionAdorned: false,
				shadowOffset: new go.Point(0, 0),
				shadowBlur: 15,
				shadowColor: "#14BDEB",
				toolTip: sharedToolTip,
			},
		];
	}

	function shapeStyle() {
		return {
			name: "NODESHAPE",
			fill: "lightgray",
			stroke: "#2B2D31",
			desiredSize: new go.Size(40, 40),
			strokeWidth: 2,
		};
	}

	function portStyle(input) {
		return {
			desiredSize: new go.Size(6, 6),
			fill: "black",
			fromSpot: go.Spot.Right,
			fromLinkable: !input,
			toSpot: go.Spot.Left,
			toLinkable: input,
			toMaxLinks: 1,
			cursor: "pointer",
		};
	}
	//CUSTOM
	function dynamicInputPortStyle() {
		return {
			desiredSize: new go.Size(6, 24),
			fill: "black",
			fromSpot: go.Spot.Right,
			fromLinkable: false,
			toSpot: go.Spot.LeftSide,
			toLinkable: true,
			toMaxLinks: 6,
			cursor: "pointer",
		};
	}

	function makeButton(text, action, visiblePredicate) {
		return $(
			"ContextMenuButton",
			$(go.TextBlock, text),
			{ click: action },
			// don't bother with binding GraphObject.visible if there's no predicate
			visiblePredicate
				? new go.Binding("visible", "", (o, e) =>
						o.diagram ? visiblePredicate(o, e) : false
				  ).ofObject()
				: {}
		);
	}

	function addPort() {
		alert("adding port");
	}

	// define templates for each type of node
	var inputTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "Circle", shapeStyle(), { fill: red }),
		$(
			go.TextBlock,
			{ margin: 8, stroke: "white", font: "bold 20px courier new" },
			new go.Binding("text", "key")
		),
		$(
			go.Shape,
			"Rectangle",
			portStyle(false), // the only port
			{ portId: "", alignment: new go.Spot(1, 0.5) }
		),
		{
			// if double-clicked, an input node will change its value, represented by the color.
			doubleClick: (e, obj) => {
				e.diagram.startTransaction("Toggle Input");
				var shp = obj.findObject("NODESHAPE");
				shp.fill = shp.fill === green ? red : green;
				updateStates();
				e.diagram.commitTransaction("Toggle Input");
			},
		}
	);

	var outputTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "Rectangle", shapeStyle(), { fill: red }), // override the default fill (from shapeStyle()) to be green
		$(
			go.Shape,
			"Rectangle",
			portStyle(true), // the only port
			{ portId: "", alignment: new go.Spot(0, 0.5) }
		)
	);

	var andTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "AndGate", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in1",
			alignment: new go.Spot(0, 0.3),
		}),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in2",
			alignment: new go.Spot(0, 0.7),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	//CUSTOM
	// var andTemplate = $(
	// 	go.Node,
	// 	"Spot",
	// 	nodeStyle(),
	// 	$(go.Shape, "AndGate", shapeStyle()),
	// 	$(go.Shape, "Rectangle", dynamicInputPortStyle(), {
	// 		portId: "in",
	// 		alignment: new go.Spot(0, 0.5),
	// 	}),
	// 	$(go.Shape, "Rectangle", portStyle(false), {
	// 		portId: "out",
	// 		alignment: new go.Spot(1, 0.5),
	// 	})
	// );

	var orTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "OrGate", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in1",
			alignment: new go.Spot(0.16, 0.3),
		}),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in2",
			alignment: new go.Spot(0.16, 0.7),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	//CUSTOM
	// var orTemplate = $(
	// 	go.Node,
	// 	"Spot",
	// 	nodeStyle(),
	// 	$(go.Shape, "OrGate", shapeStyle()),
	// 	$(go.Shape, "Rectangle", dynamicInputPortStyle(), {
	// 		portId: "in",
	// 		alignment: new go.Spot(0.16, 0.5),
	// 	}),
	// 	$(go.Shape, "Rectangle", portStyle(false), {
	// 		portId: "out",
	// 		alignment: new go.Spot(1, 0.5),
	// 	})
	// );

	var xorTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "XorGate", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in1",
			alignment: new go.Spot(0.26, 0.3),
		}),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in2",
			alignment: new go.Spot(0.26, 0.7),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	var norTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "NorGate", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in1",
			alignment: new go.Spot(0.16, 0.3),
		}),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in2",
			alignment: new go.Spot(0.16, 0.7),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	var xnorTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "XnorGate", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in1",
			alignment: new go.Spot(0.26, 0.3),
		}),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in2",
			alignment: new go.Spot(0.26, 0.7),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	var nandTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "NandGate", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in1",
			alignment: new go.Spot(0, 0.3),
		}),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in2",
			alignment: new go.Spot(0, 0.7),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	var notTemplate = $(
		go.Node,
		"Spot",
		nodeStyle(),
		$(go.Shape, "Inverter", shapeStyle()),
		$(go.Shape, "Rectangle", portStyle(true), {
			portId: "in",
			alignment: new go.Spot(0, 0.5),
		}),
		$(go.Shape, "Rectangle", portStyle(false), {
			portId: "out",
			alignment: new go.Spot(1, 0.5),
		})
	);

	// add the templates created above to myDiagram and palette
	myDiagram.nodeTemplateMap.add("input", inputTemplate);
	myDiagram.nodeTemplateMap.add("output", outputTemplate);
	myDiagram.nodeTemplateMap.add("and", andTemplate);
	myDiagram.nodeTemplateMap.add("or", orTemplate);
	myDiagram.nodeTemplateMap.add("xor", xorTemplate);
	myDiagram.nodeTemplateMap.add("not", notTemplate);
	myDiagram.nodeTemplateMap.add("nand", nandTemplate);
	myDiagram.nodeTemplateMap.add("nor", norTemplate);
	myDiagram.nodeTemplateMap.add("xnor", xnorTemplate);

	// share the template map with the Palette
	palette.nodeTemplateMap = myDiagram.nodeTemplateMap;

	palette.model.nodeDataArray = [
		{ key: "", category: "input" },
		{ category: "output" },
		{ category: "and" },
		{ category: "or" },
		{ category: "xor" },
		{ category: "not" },
		{ category: "nand" },
		{ category: "nor" },
		{ category: "xnor" },
	];

	// listen for new nodes dropped and set custom keys
	myDiagram.addDiagramListener("ExternalObjectsDropped", function (e) {
		e.subject.each(function (node) {
			e.diagram.model.setKeyForNodeData(
				node.data,
				keyGenerator(node.data.category)
			);
		});
	});

	// load the initial diagram
	load();

	// continually update the diagram
	loop();
}

// update the diagram every 250 milliseconds
function loop() {
	setTimeout(() => {
		updateStates();
		loop();
	}, 0);
}

/**
 * Returns custom key for node dropped onto myDiagram depending on its category
 * @param {string} category - The category of the node
 */
function keyGenerator(category) {
	const nodes = myDiagram.nodes;
	let key;
	if (category === "input") {
		const abc = "abcdefghijklmnopqrstuvwxyz";
		let unusedKeys = abc.split(""); //array containing all possible var names
		nodes.each((node) => {
			if (node.category === "input") {
				unusedKeys = unusedKeys.filter((letter) => letter !== node.key); //filter out used keys
			}
		});
		key = unusedKeys.shift(); //return first element
	} else {
		let i = -1;
		while (myDiagram.model.findNodeDataForKey(i) !== null) i -= 1;
		key = i;
	}
	return key;
}

// update the value and appearance of each node according to its type and input values
function updateStates() {
	var oldskip = myDiagram.skipsUndoManager;
	myDiagram.skipsUndoManager = true;
	// do all "input" nodes first
	myDiagram.nodes.each((node) => {
		if (node.category === "input") {
			doInput(node);
		}
	});
	// now we can do all other kinds of nodes
	myDiagram.nodes.each((node) => {
		switch (node.category) {
			case "and":
				doAnd(node);
				break;
			case "or":
				doOr(node);
				break;
			case "xor":
				doXor(node);
				break;
			case "not":
				doNot(node);
				break;
			case "nand":
				doNand(node);
				break;
			case "nor":
				doNor(node);
				break;
			case "xnor":
				doXnor(node);
				break;
			case "output":
				doOutput(node);
				break;
			case "input":
				break; // doInput already called, above
		}
	});
	myDiagram.skipsUndoManager = oldskip;
}

// helper predicate
function linkIsTrue(link) {
	// assume the given Link has a Shape named "SHAPE"
	return link.findObject("SHAPE").stroke === green;
}

// helper function for propagating results
function setOutputLinks(node, color) {
	node
		.findLinksOutOf()
		.each((link) => (link.findObject("SHAPE").stroke = color));
}

// update nodes by the specific function for its type
// determine the color of links coming out of this node based on those coming in and node type

function doInput(node) {
	// the output is just the node's Shape.fill
	setOutputLinks(node, node.findObject("NODESHAPE").fill);
}

function doAnd(node) {
	var color = node.findLinksInto().all(linkIsTrue) ? green : red;
	setOutputLinks(node, color);
}
function doNand(node) {
	var color = !node.findLinksInto().all(linkIsTrue) ? green : red;
	setOutputLinks(node, color);
}
function doNot(node) {
	var color = !node.findLinksInto().all(linkIsTrue) ? green : red;
	setOutputLinks(node, color);
}

function doOr(node) {
	var color = node.findLinksInto().any(linkIsTrue) ? green : red;
	setOutputLinks(node, color);
}
function doNor(node) {
	var color = !node.findLinksInto().any(linkIsTrue) ? green : red;
	setOutputLinks(node, color);
}

function doXor(node) {
	var truecount = 0;
	node.findLinksInto().each((link) => {
		if (linkIsTrue(link)) truecount++;
	});
	var color = truecount % 2 !== 0 ? green : red;
	setOutputLinks(node, color);
}
function doXnor(node) {
	var truecount = 0;
	node.findLinksInto().each((link) => {
		if (linkIsTrue(link)) truecount++;
	});
	var color = truecount % 2 === 0 ? green : red;
	setOutputLinks(node, color);
}

function doOutput(node) {
	// assume there is just one input link
	// we just need to update the node's Shape.fill
	node.linksConnected.each((link) => {
		node.findObject("NODESHAPE").fill = link.findObject("SHAPE").stroke;
	});
}

// save a model to and load a model from JSON text, displayed below the Diagram
function save() {
	document.getElementById("mySavedModel").setHTML(myDiagram.model.toJson()); //MODIFIED
	myDiagram.isModified = false;
}
function load() {
	myDiagram.model = go.Model.fromJson(
		document.getElementById("mySavedModel").value
	);
}
function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(a.href);
}
// download(jsonData, 'json.txt', 'text/plain');

function saveJson() {
	download(myDiagram.model.toJson(), "circuit_model.txt", "text/plain");
}
function loadJson() {
	fetch("test.json");
}

document.getElementById("file-upload").onchange = (e) => {
	// getting a hold of the file reference
	var file = e.target.files[0];

	// setting up the reader
	var reader = new FileReader();
	reader.readAsText(file, "UTF-8");

	reader.onload = (readerEvent) => {
		var content = readerEvent.target.result;
		circuitModel = JSON.parse(content);

		document
			.getElementById("mySavedModel")
			.setHTML(JSON.stringify(circuitModel));
		myDiagram.isModified = false;
		console.log(content);
		load();
	};
};

function showError(msg = null) {
	const errText = document.getElementById("error-message");
	const title = "<div class='error_title'>ERROR:</div><br>";
	if (msg) {
		errText.innerHTML = title + msg;
		errText.hidden = false;
	} else {
		errText.hidden = true;
	}
}
showError();

//temporarily applies the TreeLayout
async function arrange() {
	myDiagram.layout = go.GraphObject.make(go.TreeLayout);
	myDiagram.isModified = false; //enables saving even if not modified
	await new Promise((resolve) => setTimeout(resolve, 1000));
	myDiagram.layout = go.GraphObject.make(go.Layout);
}

window.addEventListener("DOMContentLoaded", init);
