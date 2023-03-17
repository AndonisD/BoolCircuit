import Minterm from './minterm.js';

/**
 * Converts a value from decimal to binary
 * 
 * @param value The value to convert to binary
 */
export function decToBin(value) {
    return (value >>> 0).toString(2);
}

/**
 * Returns whether or not a value is in an array
 * 
 * @param value The value to look for in an array
 * @param array The array to look for a value in
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

export function getAllSubsets(array) {
      return array.reduce(
        (subsets, value) => subsets.concat(
         subsets.map(set => [...set,value])
        ),
        [[]]
      );
}

