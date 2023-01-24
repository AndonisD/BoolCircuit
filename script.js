window.onload = (event) => {
  const original = [
    [1, 3]
  ];

  // The don't-care terms: AB'C'D and ABCD'
  const dcSet = [

  ];

  number = 1

  console.log(window.espresso(original, dcSet))
  console.log(number.toString(2))
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

  var n = vars.length;

  for (var i = 0; i < Math.pow(2, n); i++) {
    var binary = i.toString(2);
    binary = "0".repeat(n - binary.length) + binary;
    output.push(
      vars.reduce(function (obj, variable, index) {
        obj[variable] = +binary.charAt(index);
        return obj;
      }, {})
    );

    table += "<tr>";

    for (const [variable, value] of Object.entries(output[i])) {
      table += "<td>";
      table += value;
      table += "</td>";
    }

    expressions.forEach((e) => {
      table += "<td>";

      try {
        table += +math.evaluate(e, output[i]);
      } catch (err) {
        document.getElementById("demo").innerHTML = err.message;
        return;
      }

      table += "</td>";
    });

    table += "</tr>";
  }

  table += "</table>";

  document.getElementById("result").innerHTML = table;
}
