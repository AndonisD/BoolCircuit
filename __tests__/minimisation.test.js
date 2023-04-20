import { createInitialGroups, getPrimeImplicants } from "../modules/qm";
import { minimiseFunction } from "../modules/minimisationController";

const reformatInitGroups = (initGroups) => {
	let extractedGroups = [];
	initGroups.forEach((group) => {
		let extractedGroup = [];
		group.forEach((minterm) => {
			extractedGroup.push(minterm.binValue);
		});
		extractedGroups.push(extractedGroup);
	});
	return extractedGroups;
};

const reformatPrimeImplicants = (primeImplicants) => {
	let extractedPIs = [];

	primeImplicants.forEach((pi) => {
		extractedPIs.push(pi.binValue);
	});

	return extractedPIs;
};

const exercise1 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 1, 2, 3, 4, 6, 7, 11, 12, 15],
	dc: [],
	initGroups: [
		["0000"],
		["0001", "0010", "0100"],
		["0011", "0110", "1100"],
		["0111", "1011"],
		["1111"],
	],
	primeImplicants: ["-100", "00--", "0--0", "0-1-", "--11"],
	expression:
		"(not a and not b) or (c and d) or (b and not c and not d) or (not a and not d)",
};
const exercise2 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 4, 8, 10, 12, 13, 15],
	dc: [1, 2],
	initGroups: [
		["0000"],
		["0100", "1000", "0001", "0010"],
		["1010", "1100"],
		["1101"],
		["1111"],
	],
	primeImplicants: ["000-", "110-", "11-1", "--00", "-0-0"],
	expression:
		"(a or not d) and (b or not d) and (not b or not c or d) and (a or b)",
};
const exercise3 = {
	vars: ["a", "b", "c", "d"],
	terms: [1, 3, 5, 7, 13, 15],
	dc: [],
	initGroups: [[], ["0001"], ["0011", "0101"], ["0111", "1101"], ["1111"]],
	primeImplicants: ["0--1", "-1-1"],
	expression: "(not a and d) or (b and d)",
};
const exercise4 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 8, 10, 12, 13, 15],
	dc: [1, 2, 3],
	initGroups: [
		["0000"],
		["1000", "0001", "0010"],
		["1010", "1100", "0011"],
		["1101"],
		["1111"],
	],
	primeImplicants: ["1-00", "110-", "11-1", "-0-0", "00--"],
	expression: "a and (b or not d) and (not b or not c or d)",
};
const exercise5 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 2, 5, 6, 7, 8, 10, 12, 13, 14, 15],
	dc: [],
	initGroups: [
		["0000"],
		["0010", "1000"],
		["0101", "0110", "1010", "1100"],
		["0111", "1101", "1110"],
		["1111"],
	],
	primeImplicants: ["-0-0", "--10", "1--0", "-1-1", "-11-", "11--"],
	expression:
		"(not b and not d) or (b and d) or (c and not d) or (a and not d)",
};
const exercise6 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	dc: [],
	initGroups: [
		["0000"],
		["0010", "0100", "1000"],
		["0011", "0101", "0110", "1001", "1010", "1100"],
		["0111", "1011", "1101"],
		[],
	],
	primeImplicants: [
		"0--0",
		"-0-0",
		"--00",
		"0-1-",
		"-01-",
		"01--",
		"-10-",
		"10--",
		"1-0-",
	],
	expression:
		"(not a and not d) or (not a and c) or (b and not c) or (a and not b)",
};
const exercise7 = {
	vars: ["a", "b", "c", "d"],
	terms: [2, 3, 7, 9, 11, 13],
	dc: [1, 10, 15],
	initGroups: [
		[],
		["0010", "0001"],
		["0011", "1001", "1010"],
		["0111", "1011", "1101"],
		["1111"],
	],
	primeImplicants: ["-01-", "-0-1", "--11", "1--1"],
	expression: "(not b and c) or (c and d) or (a and d)",
};

describe("Correct initial groups", () => {
	it("exercise 1", () => {
		let terms = exercise1.terms.concat(exercise1.dc);
		let initGroups = createInitialGroups(exercise1.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise1.initGroups);
	});
	it("exercise 2", () => {
		let terms = exercise2.terms.concat(exercise2.dc);
		let initGroups = createInitialGroups(exercise2.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise2.initGroups);
	});
	it("exercise 3", () => {
		let terms = exercise3.terms.concat(exercise3.dc);
		let initGroups = createInitialGroups(exercise3.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise3.initGroups);
	});
	it("exercise 4", () => {
		let terms = exercise4.terms.concat(exercise4.dc);
		let initGroups = createInitialGroups(exercise4.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise4.initGroups);
	});
	it("exercise 5", () => {
		let terms = exercise5.terms.concat(exercise5.dc);
		let initGroups = createInitialGroups(exercise5.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise5.initGroups);
	});
	it("exercise 6", () => {
		let terms = exercise6.terms.concat(exercise6.dc);
		let initGroups = createInitialGroups(exercise6.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise6.initGroups);
	});
	it("exercise 7", () => {
		let terms = exercise7.terms.concat(exercise7.dc);
		let initGroups = createInitialGroups(exercise7.vars, terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise7.initGroups);
	});
});

describe("Correct determination of prime implicants", () => {
	it("exercise 1", () => {
		let terms = exercise1.terms.concat(exercise1.dc);
		let initGroups = createInitialGroups(exercise1.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise1.primeImplicants);
	});
	it("exercise 2", () => {
		let terms = exercise2.terms.concat(exercise2.dc);
		let initGroups = createInitialGroups(exercise2.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise2.primeImplicants);
	});
	it("exercise 3", () => {
		let terms = exercise3.terms.concat(exercise3.dc);
		let initGroups = createInitialGroups(exercise3.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise3.primeImplicants);
	});
	it("exercise 4", () => {
		let terms = exercise4.terms.concat(exercise4.dc);
		let initGroups = createInitialGroups(exercise4.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise4.primeImplicants);
	});
	it("exercise 5", () => {
		let terms = exercise5.terms.concat(exercise5.dc);
		let initGroups = createInitialGroups(exercise5.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise5.primeImplicants);
	});
	it("exercise 6", () => {
		let terms = exercise6.terms.concat(exercise6.dc);
		let initGroups = createInitialGroups(exercise6.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise6.primeImplicants);
	});
	it("exercise 7", () => {
		let terms = exercise7.terms.concat(exercise7.dc);
		let initGroups = createInitialGroups(exercise7.vars, terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise7.primeImplicants);
	});
});

describe("Correct final expression", () => {
	it("exercise 1", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise1.vars,
			exercise1.terms,
			exercise1.dc
		));

		expect(dnf).toStrictEqual(exercise1.expression);
	});
	it("exercise 2", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise2.vars,
			exercise2.terms,
			exercise2.dc
		));

		expect(cnf).toStrictEqual(exercise2.expression);
	});
	it("exercise 3", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise3.vars,
			exercise3.terms,
			exercise3.dc
		));

		expect(dnf).toStrictEqual(exercise3.expression);
	});
	it("exercise 4", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise4.vars,
			exercise4.terms,
			exercise4.dc
		));

		expect(cnf).toStrictEqual(exercise4.expression);
	});
	it("exercise 5", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise5.vars,
			exercise5.terms,
			exercise5.dc
		));

		expect(dnf).toStrictEqual(exercise5.expression);
	});
	it("exercise 6", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise6.vars,
			exercise6.terms,
			exercise6.dc
		));

		expect(dnf).toStrictEqual(exercise6.expression);
	});
	it("exercise 7", () => {
		let dnf, cnf;
		({ dnf, cnf } = minimiseFunction(
			exercise7.vars,
			exercise7.terms,
			exercise7.dc
		));

		expect(dnf).toStrictEqual(exercise7.expression);
	});
});
