import { createInitialGroups, getPrimeImplicants } from "../modules/qm";

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
	initGroups: [
		["0000"],
		["0001", "0010", "0100"],
		["0011", "0110", "1100"],
		["0111", "1011"],
		["1111"],
	],
	primeImplicants: ["-100", "00--", "0--0", "0-1-", "--11"],
};
const exercise2 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 4, 8, 10, 12, 13, 15, 1, 2], //don't care terms added at the end
	initGroups: [
		["0000"],
		["0100", "1000", "0001", "0010"],
		["1010", "1100"],
		["1101"],
		["1111"],
	],
	primeImplicants: ["000-", "110-", "11-1", "--00", "-0-0"],
};
const exercise3 = {
	vars: ["a", "b", "c", "d"],
	terms: [1, 3, 5, 7, 13, 15],
	initGroups: [[], ["0001"], ["0011", "0101"], ["0111", "1101"], ["1111"]],
	primeImplicants: ["0--1", "-1-1"],
};
const exercise4 = {
	vars: ["a", "b", "c", "d"],
	terms: [0, 8, 10, 12, 13, 15, 1, 2, 3], //don't care terms added at the end
	initGroups: [
		["0000"],
		["1000", "0001", "0010"],
		["1010", "1100", "0011"],
		["1101"],
		["1111"],
	],
	primeImplicants: ["1-00", "110-", "11-1", "-0-0", "00--"],
};

describe("Correct initial groups", () => {
	it("exercise 1", () => {
		let initGroups = createInitialGroups(exercise1.vars, exercise1.terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise1.initGroups);
	});
	it("exercise 2", () => {
		let initGroups = createInitialGroups(exercise2.vars, exercise2.terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise2.initGroups);
	});
	it("exercise 3", () => {
		let initGroups = createInitialGroups(exercise3.vars, exercise3.terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise3.initGroups);
	});
	it("exercise 4", () => {
		let initGroups = createInitialGroups(exercise4.vars, exercise4.terms);

		let output = reformatInitGroups(initGroups);

		expect(output).toStrictEqual(exercise4.initGroups);
	});
});

describe("Correct determination of prime implicants", () => {
	it("exercise 1", () => {
		let initGroups = createInitialGroups(exercise1.vars, exercise1.terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise1.primeImplicants);
	});
	it("exercise 2", () => {
		let initGroups = createInitialGroups(exercise2.vars, exercise2.terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise2.primeImplicants);
	});
	it("exercise 3", () => {
		let initGroups = createInitialGroups(exercise3.vars, exercise3.terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise3.primeImplicants);
	});
	it("exercise 4", () => {
		let initGroups = createInitialGroups(exercise4.vars, exercise4.terms);

		const primeImplicants = getPrimeImplicants(initGroups);

		const output = reformatPrimeImplicants(primeImplicants);

		expect(output).toStrictEqual(exercise4.primeImplicants);
	});
});
