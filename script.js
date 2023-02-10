window.onload = (event) => {
  // const original = [
  //   [1, 3]
  // ];

  // // The don't-care terms: AB'C'D and ABCD'
  // const dcSet = [

  // ];

  // number = 1

  // console.log(window.espresso(original, dcSet))
  // console.log(number.toString(2))
};

function generateTruthTable() {
  var expr = document.getElementById("input").innerHTML;

  var expressions = expr.split(",");

  if (expressions.length == 0) {
    console.log("detected");
    return;
  }

  const nodes = [];

  expressions.forEach((e) => {
    node = [];
    node = math.parse(e).filter((node) => node.isSymbolNode);
    nodes.push(...node);
  });

  var vars = [...new Set(nodes.map((item) => item.name))];

  const parser = math.parser();

  var table = "<table>";

  table += "<thead><tr>";
  vars.forEach((v) => {
    table += "<th>";
    table += v;
    table += "</th>";
  });
  expressions.forEach((v) => {
    table += "<th>";
    table += v;
    table += "</th>";
  });
  table += "</tr></thead>";

  var output = [];

  var numVars = vars.length;

  var truthConditions = []

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

    var varCounter = 0

    for (const [variable, value] of Object.entries(output[i])) {
      table += "<td>";
      table += value;
      table += "</td>";

      // console.log(varCounter, variable, value)

    //convert var positions (0,1,2...) into binary string
    //append value (0/1)
    //convert to int
      // bin = varCounter.toString(2) + value
      // console.log(parseInt(bin, 2), i)

      // console.log(Math.pow(2, varCounter) + value) /

      // varCounter++;
      
    }

    expressions.forEach((e) => {
      table += "<td>";

      try {
        eval = +math.evaluate(e, output[i]);
        table += eval;

        if (eval == 1){
          truthConditions.push(output[i])
        }

      } catch (err) {
        document.getElementById("demo").innerHTML = err.message;
        return;
      }

      table += "</td>";
    });

    table += "</tr>";
  }

  // console.log(truthConditions)
  // console.log(numVars)

  

  table += "</table>";

  document.getElementById("result").innerHTML = table;

  var binaryMinTerms = feedToEspresso(truthConditions, numVars);

  generateCircuit(binaryMinTerms, vars)

}


function feedToEspresso(truthConditions, numVars) {

  var espressoTable = [];

  for (var i = 0; i < truthConditions.length; i++) {

    var assignmentRow = []

    var varCounter = 0;

    for (const [variable, value] of Object.entries(truthConditions[i])) {
      // console.log(varCounter, variable, value)

      //convert var positions (0,1,2...) into signed binary string
      //append truth value (0/1) to the string 
      var bin = varCounter.toString(2) + value
      //convert the resulting string to int
      var int = parseInt(bin, 2)
      
      assignmentRow.push(int)



      // console.log(Math.pow(2, varCounter) + value) /

      varCounter++;
      
    }

    espressoTable.push(assignmentRow)

  }

  const dcSet = []

  return window.espresso(espressoTable, dcSet)


}


function generateCircuit(binaryMinTerms, varNames){

  // const numOR = binaryMinTerms.length-1

  // const numAND = binaryMinTerms.reduce((sum, arrayItem) => arrayItem.length > 1 ? sum + 1 : sum)

  //^ INCORRECT becuase 

  var output = []
  
  for (var i = binaryMinTerms.length-1; i >= 0; i--) {
    output.push(binaryMinTerms[i].reduce(function (obj, variable, index) {
      //var = 10
      bin = "0" + variable.toString(2);
      binVarIndex = bin.substr(0,bin.length-1);
      truthValue = bin.slice(-1);

      varIndex = parseInt(binVarIndex, 2);

      varName = varNames[varIndex];

      obj[varName] = parseInt(truthValue)

      return obj;
    
      }, {}))

    }

    // var minExpression = "";

    var arrayStrings = [];

    arrayStrings.push()

    output.forEach((minTerm)=>{
      var stringMinTerm = []
      
      Object.keys(minTerm).forEach((varName)=>{
        value = minTerm[varName]
        console.log(value)
        var varValue =""
        value? varValue = varName : varValue = "not " + varName

        stringMinTerm.push(varValue)
      })

      arrayStrings.push(stringMinTerm)

    }) 

    console.log(arrayStrings)

    const interleave = (arr, thing) => [].concat(...arr.map(n => [n, thing])).slice(0, -1)

    var andClauses = []
    var stringTest = arrayStrings.forEach((mintermArray) => {
      var arrayAndClause = interleave(mintermArray, "and")
      andClauses.push(arrayAndClause.join(' '))
    })

    var stringExpression = interleave(andClauses, "or")

    stringExpression = stringExpression.join(' ')

    document.getElementById("minCond").innerHTML = stringExpression;





  // var defaulCircuitObj = { "class": "GraphLinksModel",
  // "linkFromPortIdProperty": "fromPort",
  // "linkToPortIdProperty": "toPort",
  // "nodeDataArray": [],
  // "linkDataArray": []}

  // var nodeDataArray = [{"category":"input","key":1,"loc":"100 100"},
  // {"category":"input","key":2,"loc":"100 100"},
  // {"category":"and","key":3,"loc":"100 100"}]



  // defaulCircuitObj.nodeDataArray = nodeDataArray;



  // var circuitJsonStr = JSON.stringify(defaulCircuitObj)

  // document.getElementById("mySavedModel").innerHTML = circuitJsonStr;

  load()

}