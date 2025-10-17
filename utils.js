import seedrandom from 'seedrandom'

const arithmeticProgression = n => Array.from(Array(n)).map((x, i) => i)
const ap = arithmeticProgression
const chooseRandom = l => l[Math.floor(Math.random() * l.length)]
const sigmoid = (x, steepness) =>
  1 / (1 + Math.exp(- 4 * steepness * (x - 0.5)))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const groupBy = (l, num) => {
  let sublists = []
  let currentSublist = []
  for (let i = 0; i < l.length + 1; i++) {
    if (((i % num == 0) && i != 0) || i == l.length) {
      sublists.push(currentSublist)
      currentSublist = []
    }
    currentSublist.push(l[i])
  }
  return sublists
}
{
  // console.log('groupBy', groupBy([1, 2, 3], 2))
  // console.log('groupBy', groupBy([1, 2, 3, 4], 2))
}
function mod(n, m) { return ((n % m) + m) % m }
{
  // console.log('mod',mod(-9, 4))
}
function randomFloat(seed) { return seedrandom(seed)() }
function randomFloats(seed, length) {
  let seedRandom = seedrandom(seed)
  return arithmeticProgression(length).map(_ => seedRandom())
}
function randomInt(min, max, seed) {
  return min + mod(seedrandom(seed).int32(), max - min + 1)
}
function randomInts(min, max, seed, length) {
  let seedRandom = seedrandom(seed)
  return arithmeticProgression(length)
    .map(_ => min + mod(seedRandom.int32(), max - min + 1))
}
{
  // console.log('randomFloat', randomFloat('lol'))
  // console.log('randomInt', randomInt(0, 9, 'lol'))
  // console.log('randomInts', randomInts(0, 9, 'lol', 9))
}
function shuffle(seed, inputArray) {
  let seedRandom = seedrandom(seed)
  let array = structuredClone(inputArray)
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(seedRandom() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array
}
{
  let arr = [2, 11, 37, 42];
  // console.log('shuffle', shuffle('lol', arr));
  // console.log('shuffle', shuffle('lol', arr));
  // console.log('shuffle', shuffle('lol2', arr));
}
function zip(l1, l2) { return l1.map((e, i) => [e, l2[i]]) }
{
  let x = [1, 2, 3]
  // console.log(zip(x, x))
}
function zipWith(f, l1, l2) {
  return zip(l1, l2).map(l => f(...l))
}
{
  // console.log('zipWith', zipWith((a, b) => a + b, [1, 2, 3], [4, 5, 6]))
}
function zipLists(ls) {
  let ls2 = []
  for (let horizontalIndex in ls[0]) {
    let l = []
    for (let l2 of ls) {
      l.push(l2[horizontalIndex])
    }
    ls2.push(l)
  }
  return ls2
}
{
  // console.log('zipLists', zipLists([[1, 2], [3, 4]]))
}
function zipWithMany(f, ls) { return zipLists(ls).map(l => f(...l)) }
{
  // console.log('zipWithMany', zipWithMany((a, b) => a + b, [[1, 2], [3, 4]]))
}
function cycle(l, amount) {
  let l2 = []
  for (let x in arithmeticProgression(amount)) {
    l2 = l2.concat(l)
  }
  return l2
}
{
  // console.log('cycle', cycle([1, 2], 7))
}
function cumulate(l) {
  if (l.length <= 1) {
    return l
  }
  let x = l[0]
  let y = l[1]
  let xs = l.slice(2)
  return [x].concat(cumulate([x + y].concat(xs)))
}
{
  //1,3,6 from 1,2,3
  // console.log('cumulate', cumulate([1, 2, 3]))
}
function takeWhile(predicate, l) {
  return l.slice(0, l.find(x => !predicate(x)) - 1)
}
{
  // console.log('takeWhile', takeWhile(i => i < 2, [1, 2, 3]))
}
function concatLists(ls) {
  let l2 = []
  for (let l of ls) {
    // console.log(l2, l)
    l2 = l2.concat(l)
  }
  return l2
}
{
  // console.log('concatLists', concatLists([[1, 2], [3, 4]]))
}
let concatStrings = l => {
  let output = ""
  for (let s of l) {
    output += s
  }
  return output
}
// console.log(concatStrings(["a", "b"]))
let intercalateStrings = (l, x) => {
  return concatStrings(concatLists(l.map(s => [s, x])).slice(0, 2 * l.length - 1))
}
// console.log(intercalateStrings(["a", "b"], ","))
function logBase(base, x) { return Math.log(x) / Math.log(base) }

function lfsr(seed, len) {
  // has period 2^128-1
  let state = seed
  // let state = (BigInt(1) << BigInt(127)) | BigInt(1)
  let bits = []
  for (let i = 0; i < len; i++) {
    // console.log(Number(state & BigInt(1)))
    bits.push(Number(state & BigInt(1)))
    let newbit = (state ^ (state >> BigInt(1)) ^ (state >> BigInt(2)) ^ (state >> BigInt(7))) & BigInt(1)
    state = (state >> BigInt(1)) | (newbit << BigInt(127))
  }
  return bits
}
{
  // console.log('lfsr', lfsr(BigInt(2), 99))
  // console.log('lfsr', groupBy(lfsr(BigInt(9), 53 * 9), 53))
}
function lfsrFloats(seed, len) {
  //skip through, because with similar sized seeds, generates similar initial numbers
  let skip = 9999
  let bitGroupLength = 53 //same as in Math.random()
  let bits = lfsr(seed + BigInt(1), bitGroupLength * len + skip).slice(skip)
  let output = []
  let groupedBits = groupBy(bits, bitGroupLength)
  // console.log(bits.length)
  for (let bitGroup of groupedBits) {
    let floatingPointNumber = 0
    for (let bitIndex in bitGroup) {
      floatingPointNumber += bitGroup[bitIndex] * (2 ** (-bitIndex - 1))
    }
    output.push(floatingPointNumber)
  }
  return output
}
{
  // console.log('lfsrFloats', lfsrFloats(BigInt(0), 9))
  // console.log('lfsrFloats', lfsrFloats(BigInt(1), 9))
  // console.log('lfsrFloats', lfsrFloats(BigInt(999), 9))
  // console.log('lsfrFloats', lfsrFloats(BigInt(9), 39))
}
function lfsrInts(seed, len) {
  let skip = 9999
  let bitGroupLength = 52
  let bits = lfsr(seed, bitGroupLength * len + skip).slice(skip)
  let output = []
  let groupedBits = groupBy(bits, bitGroupLength)
  // console.log(bits.length)
  for (let bitGroup of groupedBits) {
    let floatingPointNumber = 0
    for (let bitIndex in bitGroup) {
      floatingPointNumber += bitGroup[bitIndex] * (2 ** bitIndex)
    }
    output.push(floatingPointNumber)
  }
  return output
}
let lfsrIntsInRange = (min, max, seed, len) => lfsrFloats(seed, len).map(r => min + Math.floor(r * (max + 1 - min)))
{
  // console.log('lfsrIntsInRange', lfsrIntsInRange(0, 3, BigInt(0), 22))
}

let duplicate = (amount, list) => {
  let output = []
  for (let x of list) {
    for (let i = 0; i < amount; i++) {
      output.push(x)
    }
  }
  return output
}
{
  // console.log('duplicate', duplicate(4, [1, 2, 3]))
}
let shrinkList0 = (percentage, currentLength, removedAmount, l) => {
  if (l.length >= 1) {
    if (percentage >= removedAmount / currentLength) {
      return shrinkList0(percentage, currentLength + 1, removedAmount + 1, l.slice(1))
    }
    else {
      let rest = shrinkList0(percentage, currentLength + 1, removedAmount, l.slice(1))
      // console.log('rest', rest)
      return [l[0]].concat(rest)
    }
  }
  else {
    return []
  }
}
let shrinkList = (percentage, l) => shrinkList0(1 - percentage, 0, 0, l)
{
  // console.log('shrinkList', shrinkList(0.5, [1, 2, 3, 4, 5, 6, 7, 8]))
}
let square = x => 2 * Math.floor(2 * x) - 4 * Math.floor(x) - 1
let sawtooth = x => x - 2 * Math.floor((x + 1) / 2)
let scaledsaw = (s, x) => sawtooth(x * s) / s
let step = 0.02
let frequency = 48000
let sustain = (l, x, y) => x < step * frequency * l ? y : 0
let complexLog = (a, b) => [Math.log(Math.sqrt(a * a + b * b)), Math.atan2(b, a)]
let complexMagnitude = (a, b) => a * a + b * b
let weird4 = x => x == 0 ? 0 : sustain(0.1, x, sawtooth(complexMagnitude(...complexLog(Math.sin(x / 4), sawtooth(x * Math.PI)))))
function goodsnare() {
  let len = 6000//6000
  let len2 = 480000//480000
  let b = 1
  let maxDensity = 1 / 10
  let minDensity = 1 / 70
  let l = lfsrIntsInRange(Math.floor(1 / maxDensity), Math.floor(1 / minDensity), BigInt(0), len2)
  // console.log(l.slice(99)) //l looks in order
  let c = 1
  let d = 50
  let checkWhetherNaN = (val, fx) => { if (isNaN(fx)) { throw new Error(val + ' was NaN under x') } else { return fx } }
  let a2 =
    l.reduce(
      (i, is) => concatLists([[1].concat(
        ap(i)
          .map(x => x * 0.001)
          .map(x => square(scaledsaw(1 / 9, weird4(x))))
      ), is]),
      [])

  let a = duplicate(c,
    shrinkList(1 / c, duplicate(b,
      l.reduce(
        (i, is) => concatLists([[1].concat(
          ap(i)
            .map(x => x * 0.001)
            .map(x => square(scaledsaw(1 / 9, weird4(x))))
        ), is]),
        [])
    ))
  )
  return a.slice(0, len)
  return zipWith((x, y) => x * y,
    ap(len).map(x => 0.0004 * x).map(x => Math.exp(-x)),
    a.slice(0, len)
  ).map(x => Math.floor(x * d) / d)
}
{
  // console.log(goodsnare().slice(0, 99))
}

export default {
  arithmeticProgression,
  ap,
  chooseRandom,
  sigmoid,
  sleep,
  groupBy,
  mod,
  randomFloat,
  randomFloats,
  randomInt,
  randomInts,
  shuffle,
  zip,
  zipWith,
  zipLists,
  cycle,
  cumulate,
  concatLists,
  concatStrings,
  intercalateStrings,
  logBase
}
