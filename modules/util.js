import Minterm from "./minterm.js";

/**
 * Returns binary string for a term
 */
export function getBits(value, numVars) {
	let s = (value >>> 0).toString(2);
	for (let i = s.length; i < numVars; i++) s = "0" + s;
	return s;
}

/**
 * Converts a value from decimal to binary
 */
export function decToBin(value) {
	return (value >>> 0).toString(2);
}

/**
 * Counts the number of 1s in a binary string
 */
export function countOnesInBinary(binString) {
	return binString.split("").filter((bit) => bit === "1").length;
}

/**
 * Inserts an element in between every element in the given array
 */
export function interleave(arr, thing) {
	return [].concat(...arr.map((n) => [n, thing])).slice(0, -1);
}

/**
 * Returns whether or not a value is in an array
 */
export function valueIn(value, array) {
	for (const compare of array) {
		if (compare == value) {
			return true;
		}

		if (value instanceof Minterm) {
			if (compare.equals(value)) {
				return true;
			}
		}
	}
	return false;
}

/**
 * Returns all combinations of elements in the given array
 */
export function getAllSubsets(array) {
	return array.reduce(
		(subsets, value) => subsets.concat(subsets.map((set) => [...set, value])),
		[[]]
	);
}
