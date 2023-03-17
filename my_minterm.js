export default class Minterm{
    constructor(bitValue, covers, isDontCare = false) {
        this.bitValue = bitValue;
        this.covers = covers;
        this.isDontCare = isDontCare;

        this.covers.sort();
    }

    equals(minterm) {


        return (
            this.bitValue == minterm.bitValue &&
            this.covers.length == minterm.covers.length &&
            this.covers.every(function(term,i) {return term === minterm.covers[i]})
        );
    }

    pair(minterm){
        
    }

}



