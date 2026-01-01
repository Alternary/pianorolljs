import seedrandom from 'seedrandom'
import axios from 'axios'
import fs from 'fs'
import { create, all } from 'mathjs'
const math = create(all)
// import { sqrt } from 'mathjs'
// console.log(sqrt(-4))
//import Plotly from 'plotly.js-dist'
let plotlyUtils
if (typeof window !== 'undefined') {
  const { default: plotlyUtils0 } = await import('./plotlyUtils.js')
  plotlyUtils = plotlyUtils0
  // import('./plotlyUtils.js')
  //   .then(plotlyUtils0 => {
  //     console.log('importing')
  //     plotlyUtils = plotlyUtils0
  //     console.log(plotlyUtils)
  //     // plotlyUtils.plotBetween(x => Math.sin(x), 0, 1, 9, false, false)
  //   })
}
if (plotlyUtils != undefined) {
  // plotlyUtils.plot(Math.sin, [1, 2, 3, 4, 5, 6, 7, 8, 9])
  plotlyUtils.plotBetween(x => Math.sin(9 * x), 0, 1, 9, false, false)
}

const arithmeticProgression = n => n < 0 ? [] : Array.from(Array(n)).map((x, i) => i)
const ap = arithmeticProgression
// console.log(ap(-1))
const range = (start, end) => ap(end - start).map(i => start + i)
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
let seedRandom = seed => seedrandom(seed)
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
    l2 = l2.concat(structuredClone(l))
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
function sum(l) {
  return l.reduce((s, n) => s + n, 0)
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

function ifThenReturn(condition, thenReturn, elseReturn) {
  return condition ? thenReturn : elseReturn
}

function sortByNumber(l, f) {
  let l2 = [...l]
  return l2.sort((a, b) => f(a) - f(b))
}

function snapFloatToRange(f, start, end) {
  return start + Math.floor(f * (end + 1 - start))
}

function twoAdicValuation(n) {
  let v = 0
  let x = n / 2
  while (x % 1 == 0 && x != 0) {
    x /= 2
    v++
  }
  return v
}
// console.log(ap(9).map(twoAdicValuation))

function normalize(l) {
  let s = sum(l)
  return l.map(el => el / (s == 0 ? 1 : s))
}
// console.log(normalize([1, 2, 3]))

function countNonCommentLines(lines) {
  let lineAmount = 0
  let inComment = false
  for (let line of lines) {
    if (line.trim().startsWith('//')) {
      //do nothing
    }
    else if (line.trim().startsWith('/*')) {
      inComment = true
    }
    else if (line.includes('*/')) {
      inComment = false
    }
    else if (inComment) {
      //do nothing
    }
    else {
      lineAmount++
    }
  }
  return lineAmount
}

async function countNonCommentLinesOfFiles() {
  let lsCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'ls *.js' })
  let filenames = lsCommandResponse.data.split('\n').sort().slice(1)
  let lineAmount = 0
  for (let filename of filenames) {
    let data = fs.readFileSync('./' + filename, 'utf8')
    let lines = data.split('\n')
    lineAmount += countNonCommentLines(lines)
  }
  console.log(lineAmount)
}
// countNonCommentLinesOfFiles()

function primeFactors(n) {
  // console.log(n)
  let factorAmountPairs = []
  let x = n
  let primes = ap(n + 1).filter(i => math.isPrime(i))
  let primeIndex = 0
  while (primeIndex < primes.length) {
    // console.log(factorAmountPairs)
    let prime = primes[primeIndex]
    if (x % prime == 0) {
      x = x / prime
      let primeAmountPairIndex0 = factorAmountPairs.findIndex(pair => pair[0] == prime)
      let primeAmountPairIndex = primeAmountPairIndex0 == -1 ? factorAmountPairs.length : primeAmountPairIndex0
      let primeAmountPair = factorAmountPairs[primeAmountPairIndex]
      let amount = primeAmountPair == undefined ? 0 : primeAmountPair[1]
      factorAmountPairs[primeAmountPairIndex] = [prime, amount + 1]
      primeIndex = 0
    }
    else {
      primeIndex++
    }
  }
  return factorAmountPairs
}
// console.log(ap(9).map(primeFactors))

function primePowersSmallerThanNumber(n) {
  let primes = ap(n + 1).filter(i => math.isPrime(i))
  return primes.map(p => [p, Math.floor(Math.log(n) / Math.log(p))]).filter(p => p[1] > 0)
}
// console.log('prime powers smaller than number', primePowersSmallerThanNumber(9))

function product(l) {
  let p = 1
  for (let i of l) {
    p *= i
  }
  return p
}
// console.log('product', product([1, 2, 3, 4]))

// console.log(math.erf(1))

function cumulatePairs(pairs) {
  //I could do this with reduce, but fuck it, this is simpler to read
  let cumulatedPairs = []
  let sum = 0
  for (let pair of pairs) {
    let item = pair[0]
    let number = pair[1]
    sum += number
    cumulatedPairs.push([item, sum])
  }
  return cumulatedPairs
}
// console.log(cumulatePairs([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]))

//this really only maybe works for monotonic functions
//to compute the inverse at x, we need to solve f(y) = x, so we need to plug in y values so that we get f(yLow) < x and f(yHigh) > x and so we choose yMid = (yLow + yHigh) / 2 and then we see on which side cdf(yMid) is of x and choose it to be the next yLow or yHigh
function inverse(x, f, tolerance) {
  let yLow = -1
  let yHigh = 1
  while (yHigh - yLow > tolerance) {
    //test whether x is left of f(yLow)
    if (x < f(yLow)) {
      yLow = yLow * 2
      continue
    }
    //test whether x is right of f(yHigh)
    if (x > f(yHigh)) {
      yHigh = yHigh * 2
      continue
    }
    let yMid = (yLow + yHigh) / 2
    if (f(yMid) < x) {
      yLow = yMid
    }
    else {
      yHigh = yMid
    }
  }
  return (yLow + yHigh) / 2
}
{
  let f = x => 1 / (1 + Math.exp(-x))
  // console.log('inverse', inverse(0.5, f, 0.01))
}

//i is the number suffix included in the filename
async function saveAndReturnPattern(suffixI, funcNum, seed, randomness, komplexW, start, end, duration, loopLength) {
  let patternNumbers
  let patternFilenamesWithoutSuffix = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum', //seed randomness duration loopLength
    /*7*/'granaryDrumPattern' //seed
  ]
  let patternFilename = patternFilenamesWithoutSuffix[funcNum] + suffixI
  try {
    await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${patternFilename + '.json'} ${funcNum} ${seed} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
    await sleep(1000)
  }
  catch (err) {
    console.log('errored with error', err)
  }
  // await sleep(1000)
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${patternFilename}.json` })
    .then(text => {
      patternNumbers = text.data
    })
  return patternNumbers
}
{
  let suffixI = 0
  let funcNum = 7//0//1//0//6
  let seed = 0
  let randomness = 0.03
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  // let response = await saveAndReturnPattern(suffixI, funcNum, seed, randomness, komplexW, start, end, duration, loopLength)
  // console.log(response)
}

async function plotBetween(f, start, end, xAmount, xLogarithmic, yLogarithmic) {
  let plotlyUtils
  import('./plotlyUtils.js')
    .then(plotlyUtils0 => {
      plotlyUtils = plotlyUtils0
      plotlyUtils.plotBetween(f, start, end, xAmount, xLogarithmic, yLogarithmic)
    })
}
// plotlyUtils.plotBetween(x => Math.sin(x), 0, 1, 9, false, false)

function padRight(l, len, elem) {
  return l.concat(ap(len - l.length).map(i => elem))
}

export default {
  arithmeticProgression,
  ap,
  range,
  chooseRandom,
  sigmoid,
  sleep,
  groupBy,
  mod,
  seedRandom,
  randomFloat,
  randomFloats,
  randomInt,
  randomInts,
  shuffle,
  zip,
  zipWith,
  zipLists,
  zipWithMany,
  cycle,
  cumulate,
  sum,
  concatLists,
  concatStrings,
  intercalateStrings,
  duplicate,
  shrinkList,
  weird4,
  logBase,
  ifThenReturn,
  sortByNumber,
  snapFloatToRange,
  twoAdicValuation,
  normalize,
  countNonCommentLinesOfFiles,
  primeFactors,
  primePowersSmallerThanNumber,
  product,
  cumulatePairs,
  inverse,
  saveAndReturnPattern,
  plotBetween,
  padRight
}
