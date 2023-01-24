(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
var espressoIisojs = require("espresso-iisojs").espresso

global.window.espresso = espressoIisojs;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"espresso-iisojs":2}],2:[function(require,module,exports){
'use strict';

function and(a, b) {
    return a & b;
}
function or(a, b) {
    return a | b;
}
function xor(a, b) {
    return a ^ b;
}
function not(a) {
    return ~a;
}
function lshift(a, b) {
    return a << b;
}
function rshift(a, b) {
    return a >> b;
}
function sub(a, b) {
    return a - b;
}
function toNumber(a) {
    return Number(a);
}
function eq(a, b) {
    return a === b;
}
function ne(a, b) {
    return a !== b;
}
function gte(a, b) {
    return a >= b;
}
function asIntN(a, b) {
    return BigInt.asIntN(a, b);
}
const _BigInt = BigInt;

const MAX_LITERALS = 512;
const BIGINT_0 = _BigInt(0);
const BIGINT_1 = _BigInt(1);
const BIGINT_0C = not(BIGINT_0);
const BIGINT_32 = _BigInt(32);
const BIGINT_INDEX = [];
for (let i = 0; i <= MAX_LITERALS; ++i) {
    const b = lshift(BIGINT_1, _BigInt(i));
    BIGINT_INDEX.push(b);
}
const BIGINT_ODD = BIGINT_INDEX.filter((b, i) => i % 2 === 0).reduce((acc, cur) => or(acc, cur));
function bitIndices(bits) {
    const res = [];
    let offset = 0;
    while (ne(bits, BIGINT_0)) {
        let b = toNumber(asIntN(32, bits));
        bits = rshift(bits, BIGINT_32);
        let i = Math.clz32(b);
        while (i < 32) {
            const li = 31 - i;
            res.push(offset + li);
            b ^= 1 << li;
            i = Math.clz32(b);
        }
        offset += 32;
    }
    return res;
}
function bitIndicesOdd(bits) {
    const ODD = 0b1010101010101010101010101010101;
    const res = [];
    let offset = 0;
    while (ne(bits, BIGINT_0)) {
        let b = toNumber(asIntN(32, bits));
        b = (b & ODD) | ((b >> 1) & ODD);
        bits = rshift(bits, BIGINT_32);
        let i = Math.clz32(b);
        while (i < 32) {
            const li = 31 - i;
            res.push(offset + li);
            b ^= 1 << li;
            i = Math.clz32(b);
        }
        offset += 32;
    }
    return res;
}
function componentReduction(cubes, cols) {
    const map = new Map();
    for (const i of cols) {
        const I = i - (i % 2);
        if (map.has(I))
            continue;
        const s = new Set();
        for (const c of cubes)
            if (c.set.has(i) || c.set.has(i + 1))
                s.add(c);
        if (s.size)
            map.set(I, s);
    }
    if (map.size <= 1)
        return [cubes];
    for (const c of cubes) {
        let prev = -1;
        for (const [k, v] of map) {
            if (!v.has(c))
                continue;
            if (prev === -1) {
                prev = k;
                continue;
            }
            map.set(prev, new Set([...map.get(prev), ...v]));
            map.delete(k);
            if (map.size === 1)
                return [cubes];
        }
    }
    return [...map.values()].map((c) => [...c]);
}
function invBi(n) {
    return or(lshift(and(n, BIGINT_ODD), BIGINT_1), and(rshift(n, BIGINT_1), BIGINT_ODD));
}
function popcount(n, max = MAX_LITERALS) {
    let c = 0;
    for (; c < max && ne(n, BIGINT_0); ++c)
        n = and(n, sub(n, BIGINT_1));
    return c;
}

class Cube {
    constructor(bigint, set, hash) {
        this._bigint = bigint;
        this._set = set;
        this._hash = hash;
    }
    get bigint() {
        return this._bigint;
    }
    get set() {
        return this._set;
    }
    get hash() {
        return this._hash;
    }
    raise(n) {
        if (!this._set.has(n))
            return this;
        const b = xor(this._bigint, BIGINT_INDEX[n]);
        const s = new Set(this._set);
        s.delete(n);
        const h = this._hash ^ (1 << n);
        return new Cube(b, s, h);
    }
    covers(c) {
        return (this.set.size <= c.set.size &&
            eq(and(this.bigint, c.bigint), this.bigint));
    }
    static parse(str) {
        const parts = str.split("");
        let bigint = BIGINT_0;
        let hash = 0;
        const set = new Set();
        for (const [idx, p] of parts.entries()) {
            if (p === "-")
                continue;
            const i = idx * 2;
            if (p === "0") {
                bigint = or(bigint, BIGINT_INDEX[i]);
                set.add(i);
                hash ^= 1 << i;
            }
            else if (p === "1") {
                bigint = or(bigint, BIGINT_INDEX[i + 1]);
                set.add(i + 1);
                hash ^= 2 << i;
            }
            else if (p === "/") {
                bigint = or(bigint, BIGINT_INDEX[i]);
                set.add(i);
                bigint = or(bigint, BIGINT_INDEX[i + 1]);
                set.add(i + 1);
                hash ^= 3 << i;
            }
            else {
                throw new Error("Invalid cube string");
            }
        }
        return new Cube(bigint, set, hash);
    }
    toString() {
        let litStr = this.bigint.toString(2);
        if (litStr.length % 2)
            litStr = "0" + litStr;
        const arr = litStr.match(/.{2}/g).reverse();
        const str = arr.map((s) => {
            if (s === "00")
                return "-";
            else if (s === "01")
                return "0";
            else if (s === "10")
                return "1";
            return "/";
        });
        return str.join("");
    }
    static from(lits) {
        let bigint = BIGINT_0;
        let hash = 0;
        const set = new Set();
        for (const i of lits) {
            set.add(i);
            hash ^= 1 << i;
            bigint = or(bigint, BIGINT_INDEX[i]);
        }
        return new Cube(bigint, set, hash);
    }
    static fromBigInt(bigint) {
        let hash = 0;
        const set = new Set();
        let offset = 0;
        let n = bigint;
        while (ne(n, BIGINT_0)) {
            let b = toNumber(asIntN(32, n));
            hash ^= b;
            n = rshift(n, BIGINT_32);
            let i = Math.clz32(b);
            while (i < 32) {
                const li = 31 - i;
                set.add(offset + li);
                b ^= 1 << li;
                i = Math.clz32(b);
            }
            offset += 32;
        }
        return new Cube(bigint, set, hash);
    }
}

class Cover {
    constructor(cubes, count, bigint) {
        this._cubes = cubes;
        this._count = count;
        this._bigint = bigint;
    }
    static from(arg) {
        const cubes = [];
        let bigint = BIGINT_0;
        const count = [];
        for (const cube of arg) {
            bigint = or(bigint, cube.bigint);
            cubes.push(cube);
            for (const i of cube.set) {
                while (count.length <= i + 1 - (i % 2))
                    count.push(0);
                ++count[i];
            }
        }
        return new Cover(cubes, count, bigint);
    }
    get bigint() {
        return this._bigint;
    }
    get cubes() {
        return this._cubes;
    }
    count(i) {
        return this._count[i];
    }
    filter(callback) {
        const count = this._count.slice();
        let bigint = this._bigint;
        const cubes = this._cubes.filter((c) => {
            if (callback(c))
                return true;
            for (const i of c.set)
                if (!--count[i])
                    bigint = xor(bigint, BIGINT_INDEX[i]);
            return false;
        });
        return new Cover(cubes, count, bigint);
    }
    pop() {
        const c = this._cubes.pop();
        if (!c)
            return undefined;
        for (const i of c.set) {
            if (!--this._count[i])
                this._bigint = xor(this._bigint, BIGINT_INDEX[i]);
        }
        return c;
    }
    push(c) {
        const r = this._cubes.push(c);
        for (const i of c.set)
            ++this._count[i];
        this._bigint = or(this._bigint, c.bigint);
        return r;
    }
    unshift(c) {
        const r = this._cubes.unshift(c);
        for (const i of c.set)
            ++this._count[i];
        this._bigint = or(this._bigint, c.bigint);
        return r;
    }
}

function sat$1(cover, lit = BIGINT_0, free = and(cover.bigint, not(or(lit, invBi(lit))))) {
    let repeat = false;
    let contradiction = false;
    do {
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, 2);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                if (eq(and(BIGINT_ODD, diff), BIGINT_0))
                    free = xor(free, rshift(diff, BIGINT_1));
                else
                    free = xor(free, lshift(diff, BIGINT_1));
                return false;
            }
            if (pc === 0)
                contradiction = true;
            return true;
        });
        if (contradiction)
            return false;
    } while (repeat);
    if (cover.cubes.length <= 1)
        return true;
    free = and(cover.bigint, free);
    let binate = -1;
    let binateness = 0;
    let binatenessMin = 0;
    let sparseness = 0;
    const freeIdx = bitIndicesOdd(free);
    const elim = new Set();
    for (const f of freeIdx) {
        const count0 = cover.count(f);
        const count1 = cover.count(f + 1);
        const count = count0 + count1;
        if (count0 && count1) {
            if (count >= binateness) {
                const min = Math.min(count0, count1);
                if (count > binateness || min > binatenessMin) {
                    binate = f;
                    binateness = count;
                    binatenessMin = min;
                }
            }
        }
        else if (count === cover.cubes.length) {
            return true;
        }
        else {
            elim.add(f);
            lit = or(lit, BIGINT_INDEX[count0 ? f : f + 1]);
            free = xor(free, BIGINT_INDEX[count0 ? f + 1 : f]);
        }
        sparseness = Math.max(sparseness, count);
    }
    if (binate === -1)
        return true;
    if (sparseness * 3 < cover.cubes.length && freeIdx.length - elim.size > 8) {
        const covers = componentReduction(cover.cubes, freeIdx.filter((f) => !elim.has(f)));
        if (covers.length > 1) {
            for (const c of covers)
                if (!sat$1(Cover.from(c), lit, free))
                    return false;
            return true;
        }
    }
    if (sat$1(cover, or(lit, BIGINT_INDEX[binate]), xor(free, BIGINT_INDEX[binate + 1])))
        return true;
    return sat$1(cover, or(lit, BIGINT_INDEX[binate + 1]), xor(free, BIGINT_INDEX[binate]));
}

function allSat$1(cover, mask = cover.bigint, lit = BIGINT_0, aux = new Set(bitIndices(and(cover.bigint, not(mask)))), free = cover.bigint) {
    let repeat = false;
    let contradiction = false;
    do {
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, 2);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                if (eq(and(BIGINT_ODD, diff), BIGINT_0))
                    free = xor(free, rshift(diff, BIGINT_1));
                else
                    free = xor(free, lshift(diff, BIGINT_1));
                return false;
            }
            if (pc === 0)
                contradiction = true;
            return true;
        });
        if (contradiction)
            return [];
    } while (repeat);
    if (!cover.cubes.length)
        return [Cube.fromBigInt(and(mask, lit))];
    free = and(cover.bigint, free);
    const res = [];
    if (cover.cubes.length === 1) {
        const l = and(mask, lit);
        for (const f of bitIndices(and(mask, free)))
            res.push(Cube.fromBigInt(or(l, BIGINT_INDEX[f])));
        return res;
    }
    let binate = -1;
    let binateness = 0;
    let binatenessMin = 0;
    let sparseness = 0;
    const freeIdx = bitIndicesOdd(free);
    const elim = new Set();
    for (const f of freeIdx) {
        const count0 = cover.count(f);
        const count1 = cover.count(f + 1);
        const count = count0 + count1;
        if (count0 && count1) {
            if (count >= binateness) {
                const min = Math.min(count0, count1);
                if (count > binateness || min > binatenessMin) {
                    binate = f;
                    binateness = count;
                    binatenessMin = min;
                }
            }
        }
        else if (aux.has(f)) {
            elim.add(f);
            free = xor(free, BIGINT_INDEX[count0 ? f : f + 1]);
        }
        else if (count === cover.cubes.length) {
            elim.add(f);
            res.push(Cube.fromBigInt(and(mask, or(lit, BIGINT_INDEX[count0 ? f : f + 1]))));
            free = xor(free, BIGINT_INDEX[count0 ? f : f + 1]);
        }
        sparseness = Math.max(sparseness, count);
    }
    if (sparseness * 3 < cover.cubes.length && freeIdx.length - elim.size > 8) {
        const covers = componentReduction(cover.cubes, freeIdx.filter((f) => !elim.has(f)));
        if (covers.length > 1) {
            const cov = Cover.from(covers.pop());
            let res1 = allSat$1(cov, mask, lit, aux, free);
            for (const c of covers) {
                if (!res1.length)
                    return res;
                const res2 = allSat$1(Cover.from(c), mask, lit, aux, free);
                const res3 = [];
                for (const r1 of res1) {
                    for (const r2 of res2)
                        res3.push(Cube.fromBigInt(or(r1.bigint, r2.bigint)));
                }
                res1 = res3;
            }
            return [...res, ...res1];
        }
    }
    if (binate === -1) {
        allSatUnate(cover, res, mask, lit, free);
        return res;
    }
    const res1 = allSat$1(cover, mask, or(lit, BIGINT_INDEX[binate]), aux, xor(free, BIGINT_INDEX[binate + 1]));
    let res2 = allSat$1(cover, mask, or(lit, BIGINT_INDEX[binate + 1]), aux, xor(free, BIGINT_INDEX[binate]));
    if (aux.has(binate)) {
        const remove = new Set();
        outer: for (const r1 of res1) {
            for (const r2 of res2) {
                if (r1.hash === r2.hash && eq(r1.bigint, r2.bigint)) {
                    remove.add(r2);
                    continue outer;
                }
            }
        }
        if (remove.size)
            res2 = res2.filter((r) => !remove.has(r));
    }
    else {
        const hashMask = 3 << binate;
        const hashMaskBi = or(BIGINT_INDEX[binate], BIGINT_INDEX[binate + 1]);
        const remove = new Set();
        outer: for (const [i, r1] of res1.entries()) {
            const h = r1.hash ^ hashMask;
            for (const r2 of res2) {
                if (r2.hash === h && eq(xor(r1.bigint, r2.bigint), hashMaskBi)) {
                    res1[i] = Cube.fromBigInt(and(r1.bigint, r2.bigint));
                    remove.add(r2);
                    continue outer;
                }
            }
        }
        if (remove.size)
            res2 = res2.filter((r) => !remove.has(r));
    }
    return [...res, ...res1, ...res2];
}
function allSatUnate(cover, res, mask, lit, free) {
    let repeat = false;
    let tautology = false;
    let largestCubeSize = MAX_LITERALS;
    let largestCube = BIGINT_0;
    do {
        largestCubeSize = MAX_LITERALS;
        largestCube = BIGINT_0;
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, largestCubeSize);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                return false;
            }
            if (pc < largestCubeSize) {
                largestCube = diff;
                largestCubeSize = pc;
            }
            if (pc === 0)
                tautology = true;
            return true;
        });
        if (tautology)
            return;
    } while (repeat);
    if (!cover.cubes.length) {
        res.push(Cube.fromBigInt(and(mask, lit)));
        return;
    }
    const freeIdx = bitIndices(largestCube);
    if (cover.cubes.length === 1) {
        const l = and(mask, lit);
        for (const f of freeIdx)
            res.push(Cube.fromBigInt(or(l, BIGINT_INDEX[f])));
        return;
    }
    let unate = -1;
    let unateness = 0;
    for (const f of freeIdx) {
        const count = cover.count(f);
        if (count > unateness) {
            unate = f;
            unateness = count;
        }
    }
    allSatUnate(cover, res, mask, or(lit, BIGINT_INDEX[unate]), free);
    allSatUnate(cover, res, mask, lit, xor(free, BIGINT_INDEX[unate]));
}

function tautology$1(cover, lit = BIGINT_0, free = and(cover.bigint, not(or(lit, invBi(lit))))) {
    let repeat = false;
    let taut = false;
    do {
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, 2);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                if (eq(and(BIGINT_ODD, diff), BIGINT_0))
                    free = xor(free, rshift(diff, BIGINT_1));
                else
                    free = xor(free, lshift(diff, BIGINT_1));
                return false;
            }
            if (pc === 0)
                taut = true;
            return true;
        });
        if (taut)
            return true;
    } while (repeat);
    if (cover.cubes.length <= 1)
        return false;
    free = and(cover.bigint, free);
    let binate = -1;
    let binateness = 0;
    let binatenessMin = 0;
    let sparseness = 0;
    const freeIdx = bitIndicesOdd(free);
    const elim = new Set();
    for (const f of freeIdx) {
        const count0 = cover.count(f);
        const count1 = cover.count(f + 1);
        const count = count0 + count1;
        if (count0 && count1) {
            if (count >= binateness) {
                const min = Math.min(count0, count1);
                if (count > binateness || min > binatenessMin) {
                    binate = f;
                    binateness = count;
                    binatenessMin = min;
                }
            }
        }
        else if (count === cover.cubes.length) {
            return false;
        }
        else {
            elim.add(f);
            lit = or(lit, BIGINT_INDEX[count0 ? f : f + 1]);
            free = xor(free, BIGINT_INDEX[count0 ? f + 1 : f]);
        }
        sparseness = Math.max(sparseness, count);
    }
    if (binate === -1)
        return false;
    if (sparseness * 3 < cover.cubes.length && freeIdx.length - elim.size > 8) {
        const covers = componentReduction(cover.cubes, freeIdx.filter((f) => !elim.has(f)));
        if (covers.length > 1) {
            for (const cov of covers)
                if (!tautology$1(Cover.from(cov), lit, free))
                    return false;
            return true;
        }
    }
    if (!tautology$1(cover, or(lit, BIGINT_INDEX[binate]), xor(free, BIGINT_INDEX[binate + 1])))
        return false;
    return tautology$1(cover, or(lit, BIGINT_INDEX[binate + 1]), xor(free, BIGINT_INDEX[binate]));
}

function complement$1(cover, lit = BIGINT_0, free = cover.bigint) {
    let repeat = false;
    let taut = false;
    do {
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, 2);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                if (eq(and(BIGINT_ODD, diff), BIGINT_0))
                    free = xor(free, rshift(diff, BIGINT_1));
                else
                    free = xor(free, lshift(diff, BIGINT_1));
                return false;
            }
            if (pc === 0)
                taut = true;
            return true;
        });
        if (taut)
            return [];
    } while (repeat);
    if (!cover.cubes.length)
        return [Cube.fromBigInt(invBi(lit))];
    free = and(cover.bigint, free);
    const res = [];
    if (cover.cubes.length === 1) {
        const inv = invBi(lit);
        for (const f of bitIndices(free))
            res.push(Cube.fromBigInt(or(inv, BIGINT_INDEX[f ^ 1])));
        return res;
    }
    let binate = -1;
    let binateness = 0;
    let binatenessMin = 0;
    let sparseness = 0;
    const freeIdx = bitIndicesOdd(free);
    const elim = new Set();
    for (const f of freeIdx) {
        const count0 = cover.count(f);
        const count1 = cover.count(f + 1);
        const count = count0 + count1;
        if (count0 && count1) {
            if (count >= binateness) {
                const min = Math.min(count0, count1);
                if (count > binateness || min > binatenessMin) {
                    binate = f;
                    binateness = count;
                    binatenessMin = min;
                }
            }
        }
        else if (count === cover.cubes.length) {
            elim.add(f);
            res.push(Cube.fromBigInt(invBi(or(lit, BIGINT_INDEX[count0 ? f : f + 1]))));
            free = xor(free, BIGINT_INDEX[count0 ? f : f + 1]);
        }
        sparseness = Math.max(sparseness, count);
    }
    if (sparseness * 3 < cover.cubes.length && freeIdx.length - elim.size > 8) {
        const covers = componentReduction(cover.cubes, freeIdx.filter((f) => !elim.has(f)));
        if (covers.length > 1) {
            const cov = Cover.from(covers.pop());
            let res1 = complement$1(cov, lit, free);
            for (const c of covers) {
                if (!res1.length)
                    return res;
                const res2 = complement$1(Cover.from(c), lit, free);
                const res3 = [];
                for (const r1 of res1) {
                    for (const r2 of res2)
                        res3.push(Cube.fromBigInt(or(r1.bigint, r2.bigint)));
                }
                res1 = res3;
            }
            return [...res, ...res1];
        }
    }
    if (binate === -1) {
        complementUnate(cover, res, lit, free);
        return res;
    }
    const res1 = complement$1(cover, or(lit, BIGINT_INDEX[binate]), xor(free, BIGINT_INDEX[binate + 1]));
    let res2 = complement$1(cover, or(lit, BIGINT_INDEX[binate + 1]), xor(free, BIGINT_INDEX[binate]));
    const hashMask = 3 << binate;
    const hashMaskBi = or(BIGINT_INDEX[binate], BIGINT_INDEX[binate + 1]);
    const remove = new Set();
    outer: for (const [i, r1] of res1.entries()) {
        const h = r1.hash ^ hashMask;
        for (const r2 of res2) {
            if (r2.hash === h && eq(xor(r1.bigint, r2.bigint), hashMaskBi)) {
                res1[i] = Cube.fromBigInt(and(r1.bigint, r2.bigint));
                remove.add(r2);
                continue outer;
            }
        }
    }
    if (remove.size)
        res2 = res2.filter((r) => !remove.has(r));
    return [...res, ...res1, ...res2];
}
function complementUnate(cover, res, lit, free) {
    let repeat = false;
    let tautology = false;
    let largestCubeSize = MAX_LITERALS;
    let largestCube = BIGINT_0;
    do {
        largestCubeSize = MAX_LITERALS;
        largestCube = BIGINT_0;
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, largestCubeSize);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                return false;
            }
            if (pc < largestCubeSize) {
                largestCube = diff;
                largestCubeSize = pc;
            }
            if (pc === 0)
                tautology = true;
            return true;
        });
        if (tautology)
            return;
    } while (repeat);
    if (!cover.cubes.length) {
        res.push(Cube.fromBigInt(invBi(lit)));
        return;
    }
    const freeIdx = bitIndices(largestCube);
    if (cover.cubes.length === 1) {
        const inv = invBi(lit);
        for (const f of freeIdx)
            res.push(Cube.fromBigInt(or(inv, BIGINT_INDEX[f ^ 1])));
        return;
    }
    let unate = -1;
    let unateness = 0;
    for (const f of freeIdx) {
        const count = cover.count(f);
        if (count > unateness) {
            unate = f;
            unateness = count;
        }
    }
    complementUnate(cover, res, or(lit, BIGINT_INDEX[unate]), free);
    complementUnate(cover, res, lit, xor(free, BIGINT_INDEX[unate]));
}

function COVERS(cover, cube) {
    return tautology$1(cover, invBi(cube.bigint));
}
// Bias towards 1s and lower indices
function bias(a, b) {
    return (a % 2) - (b % 2) || b - a;
}
function EXPAND1(cube, onSet, offSet, canRaise) {
    const cubeInv = invBi(cube.bigint);
    let blockingMatrix = offSet.map((c) => new Set(bitIndices(and(cubeInv, c.bigint))));
    blockingMatrix = blockingMatrix.filter((c) => c.size);
    let coveringMatrix = onSet.map((c) => new Set(bitIndices(and(cube.bigint, xor(cube.bigint, c.bigint)))));
    coveringMatrix = coveringMatrix.filter((c) => c.size);
    const toRaise = new Set([...cube.set].sort(bias));
    const count = [];
    for (let i = Math.max(...toRaise); i >= 0; --i)
        count.push(0);
    for (const c of coveringMatrix)
        for (const i of c)
            ++count[i];
    while (coveringMatrix.length && blockingMatrix.length) {
        const essential = new Set();
        for (const b of blockingMatrix)
            if (b.size === 1)
                essential.add(b.values().next().value);
        if (essential.size) {
            for (const e of essential) {
                toRaise.delete(e ^ 1);
                blockingMatrix = blockingMatrix.filter((b) => !b.has(e));
                coveringMatrix = coveringMatrix.filter((c) => !c.has(e ^ 1));
            }
            const inessentialColumns = new Set(toRaise);
            for (const b of blockingMatrix)
                for (const i of b)
                    inessentialColumns.delete(i ^ 1);
            for (const i of inessentialColumns) {
                toRaise.delete(i);
                cube = cube.raise(i);
                coveringMatrix = coveringMatrix.filter((c) => !(c.delete(i) && !c.size));
            }
            if (!blockingMatrix.length || !coveringMatrix.length)
                break;
        }
        const feasible = new Set();
        for (const c of coveringMatrix)
            if (c.size === 1)
                feasible.add(c.values().next().value);
        if (feasible.size) {
            let cnt = 0;
            let raise = -1;
            for (const r of [...feasible].sort(bias)) {
                if (count[r] > cnt && canRaise(r, cube.set)) {
                    cnt = count[r];
                    raise = r;
                }
            }
            if (raise >= 0) {
                toRaise.delete(raise);
                cube = cube.raise(raise);
                coveringMatrix = coveringMatrix.filter((c) => !(c.delete(raise) && !c.size));
                for (const b of blockingMatrix)
                    b.delete(raise ^ 1);
                continue;
            }
        }
        let cnt = 0;
        let raise = -1;
        for (const r of toRaise) {
            if (count[r] > cnt && canRaise(r, cube.set)) {
                cnt = count[r];
                raise = r;
            }
        }
        if (raise < 0) {
            toRaise.clear();
            break;
        }
        toRaise.delete(raise);
        cube = cube.raise(raise);
        for (const c of coveringMatrix)
            c.delete(raise);
        for (const b of blockingMatrix)
            b.delete(raise ^ 1);
    }
    if (blockingMatrix.length) {
        const MINLOW = MINUCOV(blockingMatrix);
        for (const m of MINLOW)
            toRaise.delete(m ^ 1);
    }
    for (const t of toRaise)
        if (canRaise(t, cube.set))
            cube = cube.raise(t);
    return cube;
}
function EXPAND1_PRESTO(cube, onSet, cover, canRaise) {
    let coveringMatrix = onSet.map((c) => new Set(bitIndices(and(cube.bigint, xor(cube.bigint, c.bigint)))));
    coveringMatrix = coveringMatrix.filter((c) => c.size);
    const toRaise = [...cube.set];
    const count = [];
    for (let i = Math.max(...toRaise); i >= 0; --i)
        count.push(0);
    for (const c of coveringMatrix)
        for (const i of c)
            ++count[i];
    while (toRaise.length) {
        const feasible = new Set();
        for (const c of coveringMatrix)
            if (c.size === 1)
                feasible.add(c.values().next().value);
        toRaise.sort((a, b) => +feasible.has(a) - +feasible.has(b) || count[a] - count[b] || bias(b, a));
        const cantRaise = [];
        while (toRaise.length) {
            const r = toRaise.pop();
            if (!canRaise(r, cube.set)) {
                cantRaise.unshift(r);
                continue;
            }
            const nc = cube.raise(r);
            if (!COVERS(cover, nc)) {
                coveringMatrix = coveringMatrix.filter((c) => !c.has(r));
                toRaise.push(...cantRaise);
                break;
            }
            cube = nc;
            for (const c of coveringMatrix)
                c.delete(r);
            coveringMatrix = coveringMatrix.filter((c) => c.size);
            toRaise.push(...cantRaise.splice(0));
        }
    }
    return cube;
}
function EXPAND(onSet, dcSet, offSet, primes, canRaise) {
    if (!onSet.length)
        return onSet;
    onSet = onSet.slice();
    onSet.sort((a, b) => a.set.size - b.set.size);
    const firstCube = onSet[0];
    do {
        let cube = onSet[0];
        if (!primes.has(cube)) {
            cube = offSet
                ? EXPAND1(cube, onSet, offSet, canRaise)
                : EXPAND1_PRESTO(cube, onSet, Cover.from([...onSet, ...dcSet]), canRaise);
        }
        onSet = onSet.filter((o) => !cube.covers(o));
        onSet.push(cube);
    } while (onSet[0].set.size >= firstCube.set.size &&
        ne(onSet[0].bigint, firstCube.bigint));
    return onSet;
}
function REDUNDANT(onSet, dcSet) {
    const cover = Cover.from([...dcSet, ...onSet]);
    const E = []; // Relatively essential
    const R = []; // Redundant
    for (let i = 0; i < onSet.length; ++i) {
        const cube = cover.pop();
        if (COVERS(cover, cube))
            R.push(cube);
        else
            E.push(cube);
        cover.unshift(cube);
    }
    return [E, R];
}
function PARTIALLY_REDUNDANT(R, E, dcSet) {
    const cover = Cover.from([...dcSet, ...E]);
    return R.filter((c) => !COVERS(cover, c));
}
function MAXCLIQ(covers) {
    const neighbors = new Map();
    const len = covers.length;
    for (let i = 0; i < len; ++i)
        neighbors.set(i, new Set());
    for (let i = 0; i < len; ++i) {
        const c1 = covers[i];
        const set1 = neighbors.get(i);
        for (let j = i + 1; j < len; ++j) {
            const c2 = covers[j];
            let connected = false;
            for (const n of c1) {
                if (c2.has(n)) {
                    connected = true;
                    break;
                }
            }
            if (!connected) {
                const set2 = neighbors.get(j);
                set1.add(j);
                set2.add(i);
            }
        }
    }
    const keys = Array.from(covers.keys());
    keys.sort((a, b) => neighbors.get(b).size -
        neighbors.get(a).size);
    let solution = [];
    let solutionWeight = 0;
    let exitCounter = 0;
    function bronKerbosch(R, P, X) {
        if (exitCounter > len)
            return;
        if (!P.length && !X.length) {
            ++exitCounter;
            if (R.length >= solution.length) {
                const w = R.reduce((acc, cur) => acc + neighbors.get(cur).size, 0);
                if (w > solutionWeight || R.length > solution.length) {
                    solution = R;
                    solutionWeight = w;
                    exitCounter = 0;
                }
            }
            return;
        }
        const excl = new Set();
        const pivotNeigh = neighbors.get(P[0]);
        for (const p of P) {
            if (pivotNeigh.has(p))
                continue;
            const neigh = neighbors.get(p);
            const newP = P.filter((i) => neigh.has(i) && !excl.has(i));
            const newX = X.filter((i) => neigh.has(i));
            bronKerbosch([...R, p], newP, newX);
            if (solution.length > R.length + P.length)
                return;
            X.push(p);
            excl.add(p);
        }
    }
    bronKerbosch([], keys, []);
    return solution.map((i) => covers[i]);
}
function WEED(covers, cover) {
    let points = covers.map((m) => new Set([...m].filter((x) => cover.has(x))));
    const essential = new Set();
    for (;;) {
        for (const point of points) {
            if (point.size === 1) {
                const [p] = point;
                essential.add(p);
            }
        }
        points = points.filter((point) => {
            for (const p of point)
                if (essential.has(p))
                    return false;
            return point.size > 1;
        });
        if (!points.length)
            break;
        const candidates = new Map();
        for (const point of points) {
            for (const p of point)
                if (!candidates.has(p))
                    candidates.set(p, new Set());
            if (point.size === 2) {
                const [p1, p2] = point;
                const cand1 = candidates.get(p1);
                const cand2 = candidates.get(p2);
                cand1.add(p2);
                cand2.add(p1);
            }
        }
        const eliminate = Array.from(candidates).reduce((acc, cur) => cur[1].size < acc[1].size ? cur : acc)[0];
        for (const point of points)
            point.delete(eliminate);
    }
    return essential;
}
function MINUCOV(covers) {
    let res = new Set();
    const I = MAXCLIQ(covers);
    let remaining = covers;
    for (const i of I) {
        const freq = new Map();
        for (const c of covers) {
            for (const j of c) {
                if (i.has(j)) {
                    let s = freq.get(j);
                    if (!s)
                        freq.set(j, (s = new Set()));
                    s.add(c);
                }
            }
        }
        const [v, set] = Array.from(freq).reduce((acc, cur) => cur[1].size > acc[1].size ? cur : acc);
        remaining = remaining.filter((m) => !set.has(m));
        res.add(v);
    }
    res = WEED(covers, res);
    if (remaining.length)
        res = new Set([...res, ...MINUCOV(remaining)]);
    return res;
}
function LTAUT1(cover, index, lit, free) {
    let repeat = false;
    let dc = false;
    const S = [];
    do {
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, 2);
            if (pc === 1 && !index.has(c)) {
                repeat = true;
                lit = or(lit, diff);
                if (eq(and(BIGINT_ODD, diff), BIGINT_0))
                    free = xor(free, rshift(diff, BIGINT_1));
                else
                    free = xor(free, lshift(diff, BIGINT_1));
                return false;
            }
            if (pc === 0) {
                const i = index.get(c);
                if (i != null) {
                    S.push(i);
                    return false;
                }
                dc = true;
            }
            return true;
        });
        if (dc)
            return [];
    } while (repeat);
    if (cover.cubes.length <= 1)
        return [new Set(S)];
    free = and(cover.bigint, free);
    let binate = -1;
    let binateness = 0;
    let binatenessMin = 0;
    let sparseness = 0;
    const freeIdx = bitIndicesOdd(free);
    const elim = new Set();
    for (const f of freeIdx) {
        const count0 = cover.count(f);
        const count1 = cover.count(f + 1);
        const count = count0 + count1;
        if (count0 && count1) {
            if (count >= binateness) {
                const min = Math.min(count0, count1);
                if (count > binateness || min > binatenessMin) {
                    binate = f;
                    binateness = count;
                    binatenessMin = min;
                }
            }
        }
        else {
            elim.add(f);
            lit = or(lit, BIGINT_INDEX[count0 ? f : f + 1]);
            free = xor(free, BIGINT_INDEX[count0 ? f + 1 : f]);
        }
        sparseness = Math.max(sparseness, count);
    }
    if (binate === -1)
        return [new Set(S)];
    if (sparseness * 3 < cover.cubes.length && freeIdx.length - elim.size > 8) {
        const covers = componentReduction(cover.cubes, freeIdx.filter((f) => !elim.has(f)));
        if (covers.length > 1) {
            let res = [new Set(S)];
            for (const cov of covers) {
                const res2 = res;
                res = LTAUT1(Cover.from(cov), index, lit, free);
                const res3 = [];
                for (const r1 of res)
                    for (const r2 of res2)
                        res3.push(new Set([...r1, ...r2]));
                res = res3;
            }
            return res;
        }
    }
    let res1 = LTAUT1(cover, index, or(lit, BIGINT_INDEX[binate]), xor(free, BIGINT_INDEX[binate + 1]));
    let res2 = LTAUT1(cover, index, or(lit, BIGINT_INDEX[binate + 1]), xor(free, BIGINT_INDEX[binate]));
    const rem1 = new Set();
    const rem2 = new Set();
    for (const r1 of res1) {
        for (const r2 of res2) {
            if (r1.size <= r2.size) {
                let found = true;
                for (const n of r1) {
                    if (!r2.has(n)) {
                        found = false;
                        break;
                    }
                }
                if (found)
                    rem2.delete(r2);
            }
            else {
                let found = true;
                for (const n of r2) {
                    if (!r1.has(n)) {
                        found = false;
                        break;
                    }
                }
                if (found)
                    rem1.delete(r1);
            }
        }
    }
    if (rem1.size)
        res1 = res1.filter((r) => !rem1.has(r));
    if (rem2.size)
        res2 = res2.filter((r) => !rem2.has(r));
    return [...res1, ...res2].map((s) => new Set([...S, ...s]));
}
function NOCOVERMAT(Rp, E, dcSet) {
    const res = new Map();
    const index = new WeakMap();
    for (const [i, p] of Rp.entries())
        index.set(p, i);
    const cover = Cover.from([...Rp, ...E, ...dcSet]);
    for (const r of Rp) {
        const lit = invBi(r.bigint);
        const free = and(cover.bigint, not(or(r.bigint, lit)));
        const res2 = LTAUT1(cover, index, lit, free);
        // Merge and eliminate duplicates
        for (const r2 of res2) {
            let hash = 0;
            for (const i of r2)
                hash ^= 1 << i;
            const grp = res.get(hash);
            if (!grp) {
                res.set(hash, [r2]);
                continue;
            }
            let found = false;
            loop: for (const g of grp) {
                if (g.size !== r2.size)
                    continue;
                for (const i of g)
                    if (!r2.has(i))
                        continue loop;
                found = true;
                break;
            }
            if (!found)
                grp.push(r2);
        }
    }
    return [...res.values()].flat();
}
function MINIMAL_IRREDUNDANT(Rp, E, dcSet) {
    const CM = NOCOVERMAT(Rp, E, dcSet);
    const J = MINUCOV(CM);
    return Rp.filter((c, i) => J.has(i));
}
function IRREDUNDANT_COVER(onSet, dcSet) {
    const [E, R] = REDUNDANT(onSet, dcSet);
    const Rp = PARTIALLY_REDUNDANT(R, E, dcSet);
    const Rc = MINIMAL_IRREDUNDANT(Rp, E, dcSet);
    return [...E, ...Rc];
}
function ESSENTIAL_PRIMES(onSet, dcSet) {
    const cover = [...dcSet, ...onSet];
    const res = [];
    for (let i = 0; i < onSet.length; ++i) {
        const ess = cover.pop();
        const essInv = invBi(ess.bigint);
        const cov = [];
        for (const cube of cover) {
            const conflict = and(essInv, cube.bigint);
            const dist = popcount(conflict, 2);
            if (dist === 0)
                cov.push(cube);
            else if (dist === 1)
                cov.push(Cube.fromBigInt(xor(cube.bigint, conflict)));
        }
        if (!tautology$1(Cover.from(cov), essInv))
            res.push(ess);
        cover.unshift(ess);
    }
    return res;
}
function CUBE_ORDER(cubes) {
    if (cubes.length <= 1)
        return;
    const seed = cubes.reduce((acc, cur) => cur.set.size <= acc.set.size ? cur : acc);
    cubes.sort((a, b) => {
        const pc1 = popcount(and(a.bigint, seed.bigint));
        const dist1 = a.set.size - pc1 + (seed.set.size - pc1);
        const pc2 = popcount(and(b.bigint, seed.bigint));
        const dist2 = b.set.size - pc2 + (seed.set.size - pc2);
        return dist1 - dist2;
    });
}
// Returns inverted cube
function SCCC(cover, lit, free) {
    let repeat = false;
    let taut = false;
    do {
        repeat = false;
        cover = cover.filter((c) => {
            if (ne(and(lit, c.bigint), BIGINT_0))
                return false;
            const diff = and(c.bigint, free);
            const pc = popcount(diff, 2);
            if (pc === 1) {
                repeat = true;
                lit = or(lit, diff);
                if (eq(and(BIGINT_ODD, diff), BIGINT_0))
                    free = xor(free, rshift(diff, BIGINT_1));
                else
                    free = xor(free, lshift(diff, BIGINT_1));
                return false;
            }
            if (pc === 0)
                taut = true;
            return true;
        });
        if (taut)
            return BIGINT_0C;
    } while (repeat);
    if (cover.cubes.length <= 1)
        return lit;
    free = and(cover.bigint, free);
    let binate = -1;
    let binateness = 0;
    let binatenessMin = 0;
    let sparseness = 0;
    const freeIdx = bitIndicesOdd(free);
    const elim = new Set();
    for (const f of freeIdx) {
        const count0 = cover.count(f);
        const count1 = cover.count(f + 1);
        const count = count0 + count1;
        if (count0 && count1) {
            if (count >= binateness) {
                const min = Math.min(count0, count1);
                if (count > binateness || min > binatenessMin) {
                    binate = f;
                    binateness = count;
                    binatenessMin = min;
                }
            }
        }
        else {
            elim.add(f);
            if (count0)
                cover = cover.filter((c) => !c.set.has(f));
            else
                cover = cover.filter((c) => !c.set.has(f + 1));
        }
        sparseness = Math.max(sparseness, count);
    }
    if (binate === -1)
        return lit;
    if (sparseness * 3 < cover.cubes.length && freeIdx.length - elim.size > 8) {
        const covers = componentReduction(cover.cubes, freeIdx.filter((f) => !elim.has(f)));
        let res = BIGINT_0C;
        if (covers.length > 1) {
            for (const cov of covers)
                res = and(res, SCCC(Cover.from(cov), lit, free));
            return res;
        }
    }
    const res1 = SCCC(cover, or(lit, BIGINT_INDEX[binate]), xor(free, BIGINT_INDEX[binate + 1]));
    const res2 = SCCC(cover, or(lit, BIGINT_INDEX[binate + 1]), xor(free, BIGINT_INDEX[binate]));
    return and(res1, res2);
}
function REDUCE(onSet, dcSet, primes) {
    onSet = onSet.slice();
    CUBE_ORDER(onSet);
    for (let i = onSet.length; i > 0; --i) {
        const cube = onSet.shift();
        const cubeInv = invBi(cube.bigint);
        const cubeMask = or(cube.bigint, cubeInv);
        const cov = [...onSet, ...dcSet].filter((c) => eq(and(cubeInv, c.bigint), BIGINT_0));
        const sccc = SCCC(Cover.from(cov), cubeInv, not(cubeMask));
        if (gte(sccc, BIGINT_0)) {
            if (eq(sccc, cubeInv)) {
                onSet.push(cube);
                primes.add(cube);
            }
            else {
                onSet.push(Cube.fromBigInt(invBi(sccc)));
            }
        }
    }
    return onSet;
}
function MAXIMUM_REDUCTION(onSet, dcSet) {
    const reduced = [];
    for (let i = onSet.length; i > 0; --i) {
        const cube = onSet.shift();
        const cubeInv = invBi(cube.bigint);
        const cubeMask = or(cube.bigint, cubeInv);
        const cov = [...onSet, ...dcSet].filter((c) => eq(and(cubeInv, c.bigint), BIGINT_0));
        const sccc = SCCC(Cover.from(cov), cubeInv, not(cubeMask));
        if (ne(sccc, cubeInv) && gte(sccc, BIGINT_0))
            reduced.push(Cube.fromBigInt(invBi(sccc)));
        onSet.push(cube);
    }
    return reduced;
}
function LAST_GASP(onSet, dcSet, canRaise, offSet) {
    const reduced = MAXIMUM_REDUCTION(onSet, dcSet);
    const newCubes = [];
    const cover = offSet ? null : Cover.from([...onSet, ...dcSet]);
    for (let i = reduced.length; i > 0; --i) {
        const cube = reduced.shift();
        const expanded = offSet
            ? EXPAND1(cube, reduced, offSet, canRaise)
            : EXPAND1_PRESTO(cube, reduced, cover, canRaise);
        for (const c of reduced)
            if (expanded.covers(c))
                newCubes.push(expanded);
        reduced.push(cube);
    }
    if (!newCubes.length)
        return onSet;
    return IRREDUNDANT_COVER([...onSet, ...newCubes], dcSet);
}
function COST(cover) {
    return cover.reduce((a, c) => a + c.set.size, 0);
}
function espresso$1(onSet, dcSet, offSet, canRaise = () => true) {
    if (!onSet.length)
        return onSet;
    const primes = new WeakSet();
    onSet = EXPAND(onSet, dcSet, offSet, primes, canRaise);
    onSet = IRREDUNDANT_COVER(onSet, dcSet);
    const essentialPrimes = ESSENTIAL_PRIMES(onSet, dcSet);
    if (essentialPrimes.length) {
        onSet = onSet.filter((c) => !essentialPrimes.includes(c));
        dcSet = [...dcSet, ...essentialPrimes];
    }
    let cost = COST(onSet);
    for (;;) {
        let onSet2 = REDUCE(onSet, dcSet, primes);
        onSet2 = EXPAND(onSet2, dcSet, offSet, primes, canRaise);
        onSet2 = IRREDUNDANT_COVER(onSet2, dcSet);
        let cost2 = COST(onSet2);
        if (cost2 >= cost) {
            onSet2 = LAST_GASP(onSet, dcSet, canRaise, offSet);
            cost2 = COST(onSet2);
            if (cost2 >= cost)
                break;
        }
        cost = cost2;
        onSet = onSet2;
    }
    return [...essentialPrimes, ...onSet];
}

function toCubes(input) {
    return input.map((i) => Cube.from(i));
}
function fromCubes(input) {
    return input.map((i) => [...i.set]);
}
function sat(cnf) {
    const cover = Cover.from(toCubes(cnf));
    return sat$1(cover);
}
function allSat(cnf) {
    const cover = Cover.from(toCubes(cnf));
    const res = allSat$1(cover);
    return fromCubes(res);
}
function tautology(dnf) {
    const cover = Cover.from(toCubes(dnf));
    return tautology$1(cover);
}
function complement(dnf) {
    const cover = Cover.from(toCubes(dnf));
    const res = complement$1(cover);
    return fromCubes(res);
}
function espresso(onSet, dcSet = [], options = {}) {
    const _onSet = toCubes(onSet);
    const _dcSet = toCubes(dcSet);
    const _offSet = options.computeOffSet
        ? complement$1(Cover.from([..._onSet, ..._dcSet]))
        : undefined;
    const res = espresso$1(_onSet, _dcSet, _offSet, options.canRaise);
    return fromCubes(res);
}

exports.allSat = allSat;
exports.complement = complement;
exports.espresso = espresso;
exports.sat = sat;
exports.tautology = tautology;

},{}]},{},[1]);
