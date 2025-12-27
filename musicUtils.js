import utils from './utils.js'
import axios from 'axios'
import { create, all, randomInt } from 'mathjs'
const math = create(all)
let plotlyUtils
if (typeof window !== 'undefined') {
  const { default: plotlyUtils0 } = await import('./plotlyUtils.js')
  plotlyUtils = plotlyUtils0
}
if (plotlyUtils != undefined) {
  // plotlyUtils.plot(Math.sin, [1, 2, 3, 4, 5, 6, 7, 8, 9])
  plotlyUtils.plotBetween(x => Math.sin(9 * x), 0, 1, 9, false, false)
}

let major = [0, 2, 4, 5, 7, 9, 11]
let pentatonic = [0, 2, 5, 7, 9]
let chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
// let wonkyScale = [0, 3, 4, 6, 8, 9, 10]
let wonkySeed = 'lol'
let seedRandom = utils.seedRandom(wonkySeed)
let wonkyScales = utils.arithmeticProgression(999).map(i => {
  let wonkyScale = utils.arithmeticProgression(Math.floor(seedRandom() * 12))
    .map(j => Math.floor(seedRandom() * 12))
  return wonkyScale
})
console.log('wonk', wonkyScales[0])
console.log('first 9 wonky scales', wonkyScales.slice(0, 9))
let minor = [0, 2, 3, 5, 7, 8, 10]
let transposedScales = scale => utils.ap(12).map(base => scale.map(i => utils.mod(i + base, 12)).sort((a, b) => a - b))
let majorsAndMinors = utils.cycle(transposedScales(major).concat(transposedScales(minor)), 99)
console.log('first 9 major and minor scales', majorsAndMinors.slice(0, 9))
let transposedScalesInMajor = scale => major.map(base => scale.map(i => utils.mod(i + base, 12)).sort((a, b) => a - b))
let majorsAndMinorsInMajor = utils.cycle(transposedScalesInMajor(major).concat(transposedScalesInMajor(minor)), 99)
console.log('first 9 majors and minors in major', majorsAndMinorsInMajor.slice(0, 9))
/*
actually it needs to be alternating majors and minors
major minor minor major major minor minor diminished
but that all just maps straight to the major
so, just have it be major
*/

function snapToScale(i, scale) {
  return utils.concatLists(utils.ap(9).map(octave => scale.map(i => i + octave * 12))).find(j => j >= i)
}

let freqToInt = f => Math.round(utils.logBase(2, f / (55 / 2)) * 12 - 3)
function intToFreq(i) { return 2 ** ((i + 3) / 12) * 55 / 2 }

/*
make chord song where notes are played at the beginning of each bar, mostly, I want chords to be played at the most rational points, so out of 8, 0,4,2,6, then the rest
rather than most rational, choose those which are most akin to a multiple of two
assign probability 0.5 to the highest power of two, then 0.25 to the multiples of the second highest power of two

so out of 16 we have this
0;8;4,12;2,6,10,14;
then we have 1 and 15, since they are extremely close to the highest power 16=0, then 7 and 9, then 3,5,11 and 13
similarly we should have 2 and 14 before 6 and 10
so altogether the list is as follows
0;8;4,12;2,14;6,10;1,15;7,9;3,5,11,13

actually, I can just hardcode it since I'll only use it for intervals of size 16 or 8
so, what shall the hardcoding be?
1/2: 0
1/4: 8
1/8: 4,12
1/10: 2,14
1/12: 6,10
1/14: 1,15
1/16: 7,9
1/18: 3,5,11,13
calculate distances to all powers of two with weights, so the distance to 0=16 has weight 0.5 and so on
actually it is recursive
it is a set of equations self referential to be solved
try with interval of 4
0 is 0.5, then 2 is 2 away from 0 and 1 away from 1
let's call a the weight of 2 and b the weights of 1 and 3
a=1/distanceTo0*weight0+1/distanceTo1*weight1
=1/2*0.5+1/1*b
and b=1/1*0.5+1/1*a
or rather, should I include duplicates? surely
so
actually 0.5 for 0 may be too little, try naming it a to begin with
also where do I factor in the fact that 2 is a power of two and needs to be held in high regard?
regardless for now try solving the simple system of equations
a = 1/1*b+1/2*c+1/1*d
b = 1/1*a+1/1*c+1/2*d
c = 1/2*a+1/1*b+1/1*d
d = b
->
a = b+c/2+d
b = a+c+d/2
c = a/2+b+d
d = b
actually put its power of two into the formula itself
that is, a = 1a, b = 1/4b, c = 1/2c,...
so, proximity and the largest power of two that it includes
yeah that's actually the formula then
so
a = 1(1/1*b+1/2*c+1/1*d)
b = 1/4(1/1*a+1/1*c+1/2*d)
c = 1/2(1/2*a+1/1*b+1/1*d)
d = b
->
3/5a = c
b = 16/35a
d = b
pick a to be 1, then calculate the total and divide all by that to normalize the whole set
c = 3/5
b = d = 16/35

then try with interval 8
a = b+1/2c+1/3d+1/4e+1/3f+1/2g+h
I will always end up with a matrix
now what is its diagonal?
what is the coefficient of 2 or 6? it's the same for both, it's 2*1/8
so the diagonal at index is the negation of 2-adic_valuation(i)/width_of_matrix
twoAdicValuation(n)
and then there is on each row centered at the diagonal and wrapping around a harmonic sequence or a sequence of negative powers of consecutive integers
how to express that?
first create the template sequence for all the rows

this actually also pertains harmony, I can create chords from these ratios
*/
function measureOfPowerOfTwo(width, base) {
  let power = -1
  // base = 1.35
  let powerReciprocalSequenceTemplate = utils.ap(width / 2 + 1).slice(2).map(i => i ** power).concat(utils.ap(width / 2 + 2).slice(2).map(i => (width / 2 + 3 - i) ** power))
  // let powerReciprocalSequenceTemplate = utils.ap(width / 2 + 1).slice(2).map(i => -Math.log(1 + i)).concat(utils.ap(width / 2 + 2).slice(2).map(i => -Math.log(1 + (width / 2 + 3 - i))))
  function row(i) {
    let t = powerReciprocalSequenceTemplate
    let center = -(base ** (width / 2 - utils.twoAdicValuation(i == 0 ? width : i)))
    return t.slice(width - i - 1).concat([center]).concat(t.slice(0, width - i - 1))
  }
  let matrix = utils.ap(width).map(row)
  // console.log('matrix', matrix)
  let unnormalizedMeasureVector = utils.concatLists(math.lusolve(matrix, utils.ap(width).map(i => 1 + 0 * 1.5 ** (1 + utils.twoAdicValuation((i == 0 ? width : i))))))
  // console.log('unnormalized measure vector', unnormalizedMeasureVector)
  return utils.normalize(unnormalizedMeasureVector)
}
{
  let width = 8
  let base = 1.5
  // console.log(measureOfPowerOfTwo(width, power))
  //console.log('([0,...,16],[' + (measureOfPowerOfTwo(16, 1.5).toString()) + '])')
  //console.log('([0,...,16],[' + (measureOfPowerOfTwo(16, 2.5).toString()) + '])')
}

/*
now, do the harmony based on the measure
now instead of using twoAdicValuation, use primeFactors(n) and then depending on how large that factor is, add a term
let's try for 8
a = 1*2*2*2/(1*2*3*2*5*7*2)(...) where we divide by the biggest prime powers that fit inside 8, or maybe we could divide by the powers' sum
b = 1/(1*2*3*2*5*7*2)(...)
c = 1*2/(1*2*3*2*5*7*2)(...)
d = 1*3/...
e = 1*2*2...
f = 1*5...
g = 1*2*3...
h = 1*7...
*/
function measureOfPrimality(width, base) {
  let power = -1
  // base = 1.35
  let powerReciprocalSequenceTemplate = utils.ap(width / 2 + 1).slice(2).map(i => i ** power).concat(utils.ap(width / 2 + 2).slice(2).map(i => (width / 2 + 3 - i) ** power))
  // let powerReciprocalSequenceTemplate = utils.ap(width / 2 + 1).slice(2).map(i => -Math.log(1 + i)).concat(utils.ap(width / 2 + 2).slice(2).map(i => -Math.log(1 + (width / 2 + 3 - i))))
  function row(i) {
    let t = powerReciprocalSequenceTemplate
    //this setup produces the sine wave
    let center0 = -(2 ** utils.product(utils.primeFactors(i == 0 ? width : i).map(pair => pair[0] ** pair[1]))) / utils.product(utils.primePowersSmallerThanNumber(width).map(pair => pair[0] ** pair[1]))
    console.log(center0)
    let center = center0//-(99 ** (0 - center0))
    return t.slice(width - i - 1).concat([center]).concat(t.slice(0, width - i - 1))
  }
  let matrix = utils.ap(width).map(row)
  // console.log('matrix', matrix)
  let unnormalizedMeasureVector = utils.concatLists(math.lusolve(matrix, utils.ap(width).map(i => 1 + 0 * 1.5 ** (1 + utils.twoAdicValuation((i == 0 ? width : i))))))
  // console.log('unnormalized measure vector', unnormalizedMeasureVector)
  return utils.normalize(unnormalizedMeasureVector)
}

function yoccozsFunction(a, iterations) {
  function alpha(m) {
    if (m <= 0) {
      return a % 1
    }
    return (1 / alpha(m - 1)) % 1
  }
  let terms = utils.ap(iterations)
    .map(n => utils.product(utils.ap(n)
      .map(m => alpha(m))) * Math.log(1 / alpha(n)))
  return utils.sum(terms)
}

//for a real number in the unit interval
async function brjunoFunction(a) {
  let index = Math.floor((1000 - 0.0001) * a)
  let data
  let response = await axios.post('http://localhost:3001/readFile', { body: '/home/bruh/k/testdir/interactjs-lol/datata/brjuno_thousand.json' })
  // .then(text => {
  //   data = text.data
  //   // console.log(data)
  //   console.log('data at index', data[index])
  //   return data[index]
  // })
  return response.data[index]
}

/*how do I choose frequencies?
I generate random frequencies and then I check whether a choiceFloat is smaller than the brjunoFunction at that point*/
async function generateBrjunoFrequencies() {
  let initialFrequenciess = utils.zipLists(utils.ap(melodAmount).map(i => randomFloatContinuum(randomness, 999, 32, seed + ' ' + i)))
  let choiceFloatss = utils.zipLists(utils.ap(melodyAmount).map(i => randomFloatContinuum(randomness, 999, 32, seed + ' ' + i)))
  return utils.zipWith((initialFrequencies, choiceFloats) => utils.zipWith(async (initialFrequency, choiceFloat) => { let b = await brjunoFunction(initialFrequency); choiceFloat < b ? initialFrequency : 0 }, initialFrequencies, choiceFloats), initialFrequenciess, choiceFloatss)
}


function selectAmbiharmonic(inputFreq, choiceFloat, sideWidth, ambiharmonicCurvature0, overlyingCurvature0) {
  // console.log('input freq, choice float, side width', inputFreq, choiceFloat, sideWidth)
  let minFreq = 33//33 is the smallest freq that yields a positive freqToInt
  let subharmonicFractions = utils.ap(sideWidth + 1).slice(2).map(i => 1 / i).reverse()
  let harmonicFractions = utils.ap(sideWidth + 1).slice(2)
  let ambiharmonicFractionList = utils.concatLists([subharmonicFractions, [1], harmonicFractions])
  let ambiharmonicList = ambiharmonicFractionList.map(f => inputFreq * f)
  let centralIndex = sideWidth - 1
  let ambiharmonicCurvature = ambiharmonicCurvature0 / sideWidth //maybe rename it as harmonicCurvature
  let ambiharmonicProbabilityDistributionPreOverlyingDistribution = i => Math.exp(-((ambiharmonicCurvature * (i - centralIndex)) ** 2))//bell curve for fractions
  // console.log('over and undertone probability distribution pre overlying distribution', utils.ap(10).map(i => overAndUnderToneProbabilityDistributionPreOverlyingDistribution(i)))
  let overlyingCenter = Math.exp((Math.log(minFreq) + Math.log(15000)) / 2) //550
  let overlyingCurvature = overlyingCurvature0 / Math.log(overlyingCenter)
  let overlyingDistribution = freq => freq < minFreq || freq > 15000 ? 0 : Math.exp(-((overlyingCurvature * (Math.log(overlyingCenter) - Math.log(freq))) ** 2))//bell curve? maybe a very flat one, and then zero beyond endpoints
  // console.log('overlying distribution', utils.ap(10).map(i => [overlyingDistribution(2.1 ** i * 20), 2.1 ** i * 20]))
  let unnormalizedAmbiharmonicRelativeProbabilityPairs = ambiharmonicList.map((ambiharmonic, i) => {
    let ambiharmonicProbabilityPreOverlyingDistribution = ambiharmonicProbabilityDistributionPreOverlyingDistribution(i)
    let overlyingProbability = overlyingDistribution(ambiharmonic)
    let combinedProbability = ambiharmonicProbabilityPreOverlyingDistribution * overlyingProbability
    // console.log(overOrUnderTone, combinedProbability)
    return [ambiharmonic, combinedProbability]
  })
  // console.log('unnormalized over and undertone relative probability pairs', unnormalizedOverAndUnderToneRelativeProbabilityPairs)
  let totalRelativeProbabilities = utils.sum(unnormalizedAmbiharmonicRelativeProbabilityPairs.map(pair => pair[1]))
  let normalizedAmbiharmonicProbabilityPairs = unnormalizedAmbiharmonicRelativeProbabilityPairs.map(pair => {
    let ambiharmonic = pair[0]
    let relativeProbability = pair[1]
    let probability = relativeProbability / totalRelativeProbabilities
    return [ambiharmonic, probability]
  })
  // console.log('normalized over and undertone probability pairs', normalizedOverAndUnderToneProbabilityPairs)
  let cumulatedAmbiharmonicProbabilityPairs = utils.cumulatePairs(normalizedAmbiharmonicProbabilityPairs)
  // console.log('cumulated over and undertone probability pairs', cumulatedOverAndUnderToneProbabilityPairs)
  let chosenPair = cumulatedAmbiharmonicProbabilityPairs.find(pair => pair[1] > choiceFloat)
  // console.log('chosenPair', chosenPair)
  let chosenFreq = chosenPair[0]
  // console.log(freqToInt(33)) //33 is the smallest freq that yields a positive freqToInt
  return chosenFreq
}
{
  let sideWidth = 3//9
  let len = 22//9
  let choiceFloats = utils.randomFloats('lol', len)
  let inputFreqs = utils.randomFloats('lol2', len).map(r => r * 550)
  let ambiharmonicCurvature = 2
  let overlyingCurvature = 2
  console.log('selected ambiharmonics', utils.zipWith((choiceFloat, inputFreq) => [inputFreq, selectAmbiharmonic(inputFreq, choiceFloat, sideWidth, ambiharmonicCurvature, overlyingCurvature)], choiceFloats, inputFreqs))
}
// console.log(undefined[0])

/*
I want there also to be a chance of picking a non-harmonic frequency
in generateOverOrUnderTone? maybe I want in that to be a distribution of tones to pick from, randomness argument controls sharpness of spikes, whereas preOverlyingDistributionCurvature controls the amplitudes, call it something else, harmonicCurvature
*/
//from https://www.desmos.com/calculator/8fnpixtvfs and https://www.desmos.com/calculator/axccpeiytk
function selectSomewhatAmbiharmonic(inputFreq, choiceFloat, sideWidth, randomness, ambiharmonicCurvature, overlyingCurvature) {
  let sharpness = randomness//these be the same thing
  let c = sharpness
  let w = sideWidth
  let minFreq = 33
  let maxFreq = 15000
  let o = Math.exp((Math.log(minFreq) + Math.log(maxFreq)) / 2)
  let ambiharmonicDistribution = x => Math.exp(-((ambiharmonicCurvature * Math.log(o / x)) ** 2))
  let overlyingDistribution = freq => freq < minFreq || freq > maxFreq ? 0 : Math.exp(-((overlyingCurvature * Math.log(o / freq)) ** 2))
  let rightTermAmountMinusOne = k => w//Math.min(w, Math.ceil(maxFreq / (o * k)) + 1)
  let leftTermAmountMinusOne = k => w//Math.min(w, Math.ceil(o * k / minFreq) + 1)
  let F = (x, k, n2, n3) => Math.sqrt(Math.PI) * math.erf(c ** 2 * n3 * Math.log(x / (n2 * o * k))) / (2 * (c ** 2) * n3) * ambiharmonicDistribution(n2 * o * k) * overlyingDistribution(n2 * o * k)
  let G = (x, k0) => F(x, k0, 1, 1)
    + utils.sum(utils.range(2, rightTermAmountMinusOne(k0)).map(n => F(x, k0, n, n)))
    + utils.sum(utils.range(2, leftTermAmountMinusOne(k0)).map(n => F(x, k0, 1 / n, n)))
  let G2 = (x, k) => (G(x, k) / G(maxFreq, k) + 1) / 2
  // let G3 = (x, k) => (maxFreq / minFreq) ** G2(x, k) * minFreq
  // console.log('ambiharmonic distribution', ambiharmonicDistribution(100))
  // console.log('overlying distribution', overlyingDistribution(100))
  // let [a1, a2, a3, a4] = [3000, 1.74, 2.4, 2.4 ** ((-1) ** 2)]
  // console.log('F', F(a1, a2, a3, a4))
  let k = inputFreq / o
  // console.log('here')
  // console.log(rightTermAmountMinusOne(k))
  // console.log(leftTermAmountMinusOne(k))
  // console.log('G', G(maxFreq, k))
  // console.log('F', F(maxFreq, k, 1, 1))
  // let rangeLeftEdge = Math.max(minFreq, 1 / (w + 1) * o * k)
  // let rangeRightEdge = Math.min(maxFreq, (w + 1) * o * k)
  // let floatInRange = (rangeRightEdge / rangeLeftEdge) ** (choiceFloat) * rangeLeftEdge
  //these do seem to work
  // console.log('range left edge', rangeLeftEdge)
  // console.log('range right edge', rangeRightEdge)
  // console.log('float in range', floatInRange)
  // return G3(floatInRange, k)
  let G4 = x => G2(x, k)
  return utils.inverse(choiceFloat, G4, 0.11)
}
{
  let inputFreq = 703.562363974//700
  let choiceFloat = 0.5
  let sideWidth = 11//9
  let randomness = 2
  let ambiharmonicCurvature = 0.5
  let overlyingCurvature = 0.5
  let ambiharmonicAmount = 22//9//22
  // console.log(selectSomewhatAmbiharmonic(inputFreq, choiceFloat, sideWidth, randomness, harmonicCurvature, overlyingCurvature))
  /*
  console.log('select somewhat ambiharmonic', utils.zipWith(
    (freq, choiceFloat) => [freq, choiceFloat, selectSomewhatAmbiharmonic(freq, choiceFloat, sideWidth, randomness, ambiharmonicCurvature, overlyingCurvature)],
    utils.randomFloats('lol', ambiharmonicAmount).map(f => (15000 / 33) ** f * 33),
    utils.randomFloats('lol2', ambiharmonicAmount)
  ))
  //*/
}
// console.log(undefined[0])
{
  // plotlyUtils.plot(x => Math.cos(x), utils.range(1, 100).map(i => i / 100))
}
// console.log(undefined[0])

//I also want to calculate an ambiharmonic from the neighborhood of a point in a loop, maybe through using somewhatMultiambiharmonic, which relies on the desmos graph
//the neighborhood should include future elements as well, so there should be a variable neghborhoodWidth=7, future elements meaning past elements with with bigger indices in the cycled loop, so in [1,2,3,4,5] 4 has future elements 5 and 1 and past elements 2 and 3
//https://www.desmos.com/calculator/udqyg02bng
function generateAmbiharmonicFromInputFreqs() {
}

//this is just akin to random bits isn't it?
function generateAlternation(seed, len) {
  let zeros = 0
  let ones = 0
  let sequence = []
  let rs = utils.randomFloats(seed, len)
  for (let i = 0; i < len; i++) {
    let bit = rs[i] < zeros / Math.max(1, ones)
      ? 1
      : 0
    if (bit == 0) {
      zeros += 1
    }
    else {
      ones += 1
    }
    sequence.push(bit)
  }
  return sequence
}
// console.log(generateAlternation('lol', 9))

let drumFiles = [
  "silence.mp3", //silence
  "bassdrum3.mp3",
  "ringsnare.mp3",
  "hat.mp3",
  "snare1.mp3",
  "distsnare.mp3", //silence
  "combsnare.mp3", //silence
  "bassdrum5.mp3",
  "chebsnare.mp3", //silence
  "bassdrum2.mp3",
  "snare2.mp3",
  "snare6.mp3",
  "snare18.mp3",
  "snary.mp3",
  "hatty.mp3",
  "bassdrum4.mp3",
  "exptriangle.mp3",
  "goodsnare.mp3",
  "chebbassdrum.mp3", //silence

  'bassdrum2.mp3',
  'bassdrum3.mp3',
  'bassdrum4_modified2.mp3',
  'bassdrum4_modified3.mp3',
  'bassdrum4.mp3',
  'bassdrum5.mp3',
  'bassdrum.mp3',
  'chebbassdrum.mp3',
  'chebsnare.mp3',
  'cmtambassdrum.mp3',
  'combbassdrum.mp3',
  'combsnare.mp3',
  'descender.mp3',
  'distbassdrum.mp3',
  'distsnare.mp3',
  'divbassdrum.mp3',
  'erans19.mp3',
  'exptriangle.mp3',
  'goodsnare.mp3',
  'grainscatterbassdrum.mp3',
  'gverbbassdrum.mp3',
  'gverbsnare.mp3',
  'hat.mp3',
  'hatty.mp3',
  'marble.mp3',
  'mbgatelrbassdrum.mp3',
  'mbgatemsbassdrum.mp3',
  'mbgatestereobassdrum.mp3',
  'ringsnare.mp3',
  'snare18.mp3',
  'snare1.mp3',
  'snare2.mp3',
  'snare6.mp3',
  'snary.mp3',
  'weird4.mp3',
  'zitabassdrum.mp3',
].map(s => './samples/drums/' + s)

const drumPatterns = [
  /*
  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
  [1,0,0,0, 2,0,0,2, 1,0,0,0, 2,0,0,0],
  [1,0,0,0, 1,0,0,0, 2,0,0,0, 1,0,0,2],
  [1,0,0,1, 2,0,0,1, 1,0,1,0, 2,0,1,0],
  [1,0,3,0, 2,0,0,0, 0,1,1,0, 2,0,4,2],
  [1,0,0,1, 0,3,1,0, 2,0,4,0, 4,1,3,2],
  [1,0,2,1, 0,3,2,0, 0,0,2,0, 4,1,2,0]
  */
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 2, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 2],
  [1, 0, 0, 1, 2, 0, 0, 1, 1, 0, 1, 0, 2, 0, 1, 0],
  [1, 0, 3, 0, 2, 0, 0, 0, 0, 1, 1, 0, 2, 0, 4, 2],
  [1, 0, 0, 1, 0, 3, 1, 0, 2, 0, 4, 0, 4, 1, 3, 2],
  [1, 0, 2, 1, 0, 3, 2, 0, 0, 0, 2, 0, 4, 1, 2, 0]
]

function makeDrumBeat(seed, density, randomness) {
  let drumSilences = utils.randomFloats(seed, 32)
    .map(
      r => density == 0 || r > 0.2 + 0.8 * ((density - 0.08) / (1.00 - 0.08))
        ? 0
        : 1
    )
  // console.log('drumSilences', drumSilences)
  let drumPattern = utils.zipWith(
    (x, y) => x * y,
    drumSilences,
    utils.ap(32)
      .map(i => {
        let newSeed = seed + '§askldhasd' + i
        // console.log('lol', drumPatterns[utils.randomInt(0, drumPatterns.length - 1, newSeed)][i % 16])
        return utils.randomFloat(newSeed) < randomness
          ? utils.randomInt(0, 8, newSeed)
          : drumPatterns[utils.randomInt(0, drumPatterns.length - 1, newSeed)][i % 16]
      })
  )
  return drumPattern
}
// console.log('lol', utils.randomInts(0, 1, 'lol', 8))
{
  // console.log('makeDrumBeat', makeDrumBeat('lol', 0.1, 0.2))
  // console.log('makeDrumBeat', makeDrumBeat('lol', 0.9, 0.2))
  // console.log('makeDrumBeat', makeDrumBeat('lol2', 0.9, 0.9))
  // console.log('makeDrumBeat', makeDrumBeat('lol3', 0.9, 0.2))
}
function mixLists(l1, l2, percentage, seed) {
  let rs = utils.randomFloats(seed, l1.length)
  // console.log(rs)
  return utils.zipWithMany((x, y, r) =>
    r <= percentage
      ? x
      : y,
    [l1, l2, rs]
  )
}
{
  // console.log('mixLists', mixLists([1, 2, 3], [4, 5, 6], 0.5, 'lol'))
  // console.log('mixLists', mixLists([1, 2, 3], [4, 5, 6], 0.5, 'lol4'))
  // console.log('mixLists', mixLists([1, 2, 3], [4, 5, 6], 0.1, 'lol4'))
  // console.log('mixLists', mixLists([1, 2, 3], [4, 5, 6], 0.9, 'lol4'))
}
function mixListsMany(ls, percentages, seedFloats) {
  // console.log('in mixListsMany')
  // console.log(seedFloats)
  // console.log(zipLists(ls))
  // console.log(cumulate(percentages))
  // console.log('exiting')
  return utils.zipWith(
    (column, r) => column[utils.cumulate(percentages).findIndex(x => r <= x)],
    utils.zipLists(ls),
    seedFloats
  )
}
{
  // console.log('mixListsMany', mixListsMany([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [0.1, 0.5, 0.9], utils.randomFloats('seed', 3)))
}

/*
I want to create a loopContinuumWithNoExtraneousElements
it generates l1Cycled and l2Cycled and then with regard to progress chooses at each step an element from either cycle
*/
function loopContinuumWithNoExtraneousElements(l1, l2, mixSeeds) {
  let overallDuration = mixSeeds.length
  let l1Cycled = utils.cycle(l1, overallDuration)
  let l2Cycled = utils.cycle(l2, overallDuration)
  return utils.zipWithMany((el1, el2, r, i) => {
    let progress = i / overallDuration
    return progress < r ? el1 : el2
  }, [l1Cycled, l2Cycled, mixSeeds, utils.ap(overallDuration)])
}
{
  // console.log('loop continuum with no extraneous elements', loopContinuumWithNoExtraneousElements([1, 2], [3, 4], utils.randomFloats('a', 9)))
}
//actually this might be useless

function loopContinuum00(randomness, overallDuration, duration, l1, l2, loopSeeds, mixSeeds) {
  // console.log('in loopContinuum00, overallDuration, duration, l1, l2, loopSeeds, mixSeeds\n', overallDuration, duration, l1, l2, loopSeeds, mixSeeds)
  let len = l1.length
  let progressionPercentage = 1 - duration / overallDuration
  let l12 = mixListsMany([l1, l2, loopSeeds.slice(0, len)], [(1 - progressionPercentage) * (1 - randomness), progressionPercentage * (1 - randomness), randomness], mixSeeds.slice(0, len))
  if (duration <= 0) {
    return [l2]
  }
  else {
    return [l1].concat(loopContinuum00(randomness, overallDuration, duration - 1, l12, l2, loopSeeds.slice(len), mixSeeds.slice(len)))
  }
}
let loopContinuum0 = (randomness, duration, l1, l2, loopSeeds, mixSeeds) => loopContinuum00(randomness, duration, duration, l1, l2, loopSeeds, mixSeeds)

let loopContinuum = (randomness, duration, l1, l2, loopSeeds, mixSeeds) => utils.concatLists(loopContinuum0(randomness, duration, l1, l2, loopSeeds, mixSeeds))

//apparently randomFloatContinuum generates a continuum of length one more than what's given
let randomFloatContinuum0 = (randomness, duration, loopLength, seed) => loopContinuum0(randomness, duration, utils.randomFloats(seed + 'laksjd', loopLength), utils.randomFloats(seed + 'asdlkj', loopLength), utils.randomFloats(seed + 'asdlkhj', loopLength * duration), utils.randomFloats(seed + 'qwejpas', loopLength * duration))
let randomFloatContinuum = (randomness, duration, loopLength, seed) => utils.concatLists(randomFloatContinuum0(randomness, duration, loopLength, seed))
{
  // console.log('randomFloatContinuum', randomFloatContinuum(0.1, 3, 4, 'lol'))
}
let randomIntContinuum0 = (start, end, randomness, duration, loopLength, seed) => loopContinuum0(randomness, duration,
  utils.randomInts(start, end, seed + 'asdlk', loopLength),
  utils.randomInts(start, end, seed + 'alskd', loopLength),
  utils.randomInts(start, end, seed + 'jasdas', loopLength * duration),
  utils.randomFloats(seed + 'asdlkj', loopLength * duration)
)
let randomIntContinuum = (start, end, randomness, duration, loopLength, seed) => utils.concatLists(randomIntContinuum0(start, end, randomness, duration, loopLength, seed))
{
  // console.log('randomIntContinuum', randomIntContinuum(0, 5, 0.1, 4, 4, 'lol'))
}

// const { default: utils } = await import('./utils.js')
// const { default: musicUtils } = await import('./musicUtils.js')
/*
wait, I'm mixing sets here, not their elements into a sequence
I'm mixing sets into a sequence of sets
 
I could use mixLists
but I want there to be a continuum of changed elements
that can be achieved by doing the loopContinuumWithNoExtraneous Elements and grouping into groups the size of the two input lists
except, the two input lists may have different sizes
what then?
how do I mix two lists of different size?
I assign probabilities to both lists' elements and then I generate a new list with the corresponding probabilities of having each element in that resulting list
so I could have [1,2,3] and [4,5]
so then I generate a new list with probability 33% of having 1,2 and 3 and 50% probability of having 4 and 5
or
I could have [1,2,3,4] and [5,6] and have the transitionary sets [1,2,3,4], [1,2,3] [1,2,5], [1,2,6], [1,5,6], [5,6]
where elements can stand for a particular amount of elements, here 5 stands for 2 elements of l1
so, to morph one set to another of different size
I could try by restricting current set size in the transition, where at the endpoints of the transition, the set sizes are the initial set sizes, and everywhere in between the set size is the linear combination of the two endpoint set sizes
 
what I could do is generate a randomFloatContinuum for each set element of the two sets and choose that element to be in a given transitionary set if the corresponding randomFloatContinuum value r at the transitionary index i is smaller than 1/set.length where where set is the set containing that element to choose
except I need to account for progress too
maybe by multiplying r by progress
also what loopLength would I choose for randomFloatContinuum? 1? sure, that certainly creates a smoothish sequence containing duplicates, which I want
 
actually (with set1=[1,2,3,4] and set2=[5,6]) I need to have expected value 4 of the first ones included and 2 of the second ones included
but I need to divide the probability by two
actually, the progress does that?
at first I need to have 100% probability of including each of the set1 elems and 0% of including each of the set2 elems
and at middle I need to have 50% probability of including each set1 elems and similarly for set2 elems
*/
function generateTransitionBetweenTwoWaypointSets(set1, set2, len, randomness, seed) {
  let setElemChoiceFloatPairss = set => set.map((elem, i) => randomFloatContinuum(randomness, len, 1, seed + ' ' + i).map(choiceFloat => [elem, choiceFloat]).slice(0, len)) //apparently randomFloatContinuum generates a continuum of length one more than what's given
  // console.log('set elem choice float pairss', setElemChoiceFloatPairss([1,2,3]))
  let set1ElemChoiceFloatPairss = setElemChoiceFloatPairss(set1)
  let set2ElemChoiceFloatPairss = setElemChoiceFloatPairss(set2)
  let set1And2ElemChoiceFloatPairss = utils.zipLists(set1ElemChoiceFloatPairss.concat(set2ElemChoiceFloatPairss))
  // console.log('set 1 and 2 elem choice float pairss', set1And2ElemChoiceFloatPairss)
  function chooseSetElements(set1And2ElemChoiceFloatPairs, progress) {
    // console.log('in here')
    // console.log('set 1 and 2 elem choice float pairs', set1And2ElemChoiceFloatPairs)
    // console.log('progress', progress)
    let setElemIsIncludedPairs = set1And2ElemChoiceFloatPairs.map((elemChoiceFloatPair, i) => {
      let elem = elemChoiceFloatPair[0]
      let choiceFloat = elemChoiceFloatPair[1]
      let isSet1 = i < set1.length
      // console.log('elem', elem)
      // console.log('choice float', choiceFloat)
      // console.log('progress', progress)
      let elemIsIncluded = choiceFloat < (isSet1 ? (1 - progress) : progress)
      return [elem, elemIsIncluded]
    })
    // console.log('set elem is included pairs', setElemIsIncludedPairs)
    let resultingSet = setElemIsIncludedPairs.filter(pair => pair[1]).map(pair => pair[0])
    return resultingSet
  }
  // console.log('here')
  let setContinuum = utils.zipWith(
    (set1And2ElemChoiceFloatPairs, progress) => { /*console.log('and in here');*/ return chooseSetElements(set1And2ElemChoiceFloatPairs, progress) },
    set1And2ElemChoiceFloatPairss, utils.ap(len).map(i => (i + 1) / (len + 1)))
  return setContinuum
}
console.log('generate transition between two waypoint sets', generateTransitionBetweenTwoWaypointSets([1, 2, 3, 4], [5, 6], 5, 0.1, 'a'))
console.log('generate transition between two waypoint sets', generateTransitionBetweenTwoWaypointSets([1, 2, 3, 4], [5, 6, 7, 8], 5, 0.1, 'b'))

/*
I need a function that takes a list of waypoints and generates transitions between them
needs to first create pairs of waypoints
by duplicating elements by 2, removing endpoints and groupBy 2
*/
function generateTransitionsBetweenManyWaypointSets(waypointSets, len, randomness, seed) {
  let duplicatedWaypoints = utils.duplicate(2, waypointSets)
  let waypointPairs = utils.groupBy(duplicatedWaypoints.slice(1, duplicatedWaypoints.length - 1), 2)
  let transitions = waypointPairs.map(pair => {
    let set1 = pair[0]
    let set2 = pair[1]
    let transition = generateTransitionBetweenTwoWaypointSets(set1, set2, len, randomness, seed)
    return transition
  })
  let continuum = utils.concatLists(transitions)
  return continuum
}
console.log('generate transitions between many waypoint sets', generateTransitionsBetweenManyWaypointSets([[1, 2, 3], [4, 5], [6, 7, 8]], 3, 0.3, 'b'))

let chainContinuumDrum = (seed, randomness0) => {
  let overallDuration = 7777//9999 //loopContinuum fails at too large durations, thankfully only quite large, so I need not probably fix it
  let randomness = randomness0
  let randomness2 = 0.5
  let density = 0.9
  let maxAmount = Math.floor(logBase(2, 128))
  let drumBeat1 = i =>
    utils.concatLists(
      utils.ap(Math.ceil((2 ** i) / 32))
        .map(j => makeDrumBeat(seed + i + 'asdjh' + j, density, randomness))
    ).slice(0, 2 ** i)
  let drumBeat2 = i =>
    utils.concatLists(
      utils.ap(Math.ceil((2 ** i) / 32))
        .map(j => makeDrumBeat(seed + i + 'asdlk' + j, density, randomness))
    ).slice(0, 2 ** i)
  // console.log(continuum(0))
  // console.log(continuum(1))
  // console.log(continuum(8))
  function continuum(i) {
    if (i == 0) {
      return utils.randomInts(0, drumFiles.length, seed, overallDuration)
    }
    else {
      let loopSeeds = continuum(i - 1)
      // console.log('stuffs', overallDuration / (2 ** i), drumBeat1(i), drumBeat2(i), loopSeeds, utils.randomFloats(seed + i, loopSeeds.length), '\nend')
      // console.log('randomFloatContinuum of large duration', randomFloatContinuum(0.1, overallDuration / (2 ** i), drumBeat1(i).length, 'lol seed'))
      let l = loopContinuum(randomness2, overallDuration / (2 ** i), drumBeat1(i), drumBeat2(i), loopSeeds, utils.randomFloats(seed + i, loopSeeds.length))
      return l
    }
  }
  return continuum(maxAmount)
}
{
  //loopContinuum 990.19 4 [1,2] [3,4] [99..] (utils.randomFloats 99 99)
  // console.log('loopContinuum', loopContinuum(0.1, 4, [1, 2], [3, 4], utils.randomInts('lol1', 9), utils.randomFloats('lol2', 9)))
  // console.log('randomFloatContinuum of large duration', randomFloatContinuum(0.1, 4200, 2, 'lol seed')) //around 4200 is the limit for loopContinuum with loopLength 2
  // console.log('chainContinuumDrum', chainContinuumDrum('lol', 0.1))
}
//the capabilities of loopContinuum are slim, might need to use an ffi for another programming language to do the job of calculating long lists
function multiContinuumDrum0(seed, randomness0) {
  let overallDuration = 16 * 111//32 * 111//* 999

  let loopLength = i => 2 ** i
  let randomness = i => randomness0
  let density = 0.9

  let drumBeat1 = i =>
    utils.concatLists(
      utils.ap(Math.ceil(loopLength(i) / 32))
        .map(j => makeDrumBeat(seed + i + 'asdjh' + j, density, randomness(i)))
    ).slice(0, loopLength(i))
  // return drumBeat1(4)
  let drumBeat2 = i =>
    utils.concatLists(
      utils.ap(Math.ceil(loopLength(i) / 32))
        .map(j => makeDrumBeat(seed + i + 'asdlk' + j, density, randomness(i)))
    ).slice(0, loopLength(i))
  console.log('drumBeat1(6)', drumBeat1(6))

  let duration = i => Math.floor(overallDuration / (2 ** i))

  let len = overallDuration
  let continuum = i => loopContinuum(randomness(i), duration(i), drumBeat1(i), drumBeat2(i), utils.randomInts(0, drumFiles.length, seed + 'asdfa' + i, len), utils.randomFloats(seed + 'asdlkj', len))
  return continuum(0)

  // return utils.zipWith((l,i) => l[i],zipLists(continuums),choiceSequence)
}
let multiContinuumDrum = multiContinuumDrum0(0, 0.1)
{
  console.log('multiContinuumDrum', multiContinuumDrum)
  console.log('multiContinuumDrum', multiContinuumDrum0(1, 0.1))
  console.log('multiContinuumDrum', multiContinuumDrum0(2, 0.1))
  console.log('multiContinuumDrum', multiContinuumDrum0(3, 0.1))
  console.log('multiContinuumDrum', multiContinuumDrum0(4, 0.1))
}

/*
:{
chainContinuumDrum seed = chainContinuumDrum' seed 0.1
chainContinuumDrum' seed randomness' = continuum 1--maxAmount
  where
    overallDuration = 9999
    randomness = randomness'--0.1 --controls how random the generated drum beats are
    randomness2 = 0.5 --controls how much to emphasize from previous layer
    --layer amount
    maxAmount = floor $ logBase 2 $ 128
 
    drumBeat1 i = take (2^i) $ concat $ map (\j -> makeDrumBeat (((seed*maxAmount+i)*2)*8+j) randomness) [0..]
    drumBeat2 i = take (2^i) $ concat $ map (\j -> makeDrumBeat (((seed*maxAmount+i)*2+1)*8+j) randomness) [0..]
 
    continuum 0 = take overallDuration $ randomInts 0 (length drumNumerals) seed
 
    continuum i =
      trace (show (
        drumBeat1 i,
        drumBeat2 i,
        length $ continuum $ i-1))
      $ loopContinuum randomness2 (div overallDuration (2^i)) (drumBeat1 i) (drumBeat2 i) (continuum $ i-1) (randomFloats2 $ seed*maxAmount+i)
:}
length $ chainContinuumDrum 0
 
*/


//partitioning stuff

// const { default: utils } = await import('./utils.js')
function listPartitionedByRelativeAmounts(l, relativeAmounts, seed) {
  let totalRelativeAmounts = utils.sum(relativeAmounts)
  let relativeAmountPercentages = relativeAmounts.map(i => i / totalRelativeAmounts)
  let cumulatedRelativeAmountPercentages = utils.cumulate(relativeAmountPercentages)
  cumulatedRelativeAmountPercentages[cumulatedRelativeAmountPercentages.length - 1] = 1 / 0
  // console.log(cumulatedRelativeAmountPercentages)
  function partitionNumberAssigner0(i, l0) {
    // console.log('here is i', i)
    // console.log('here is l0', l0)
    if (l0.length == 0) { return [] }
    let progress = i / l.length
    // console.log('here is progress', progress)
    let head = l0[0]
    let rest = l0.slice(1)
    return [[head, cumulatedRelativeAmountPercentages.findIndex(cumulatedRelativeAmountPercentage => progress < cumulatedRelativeAmountPercentage)]].concat(partitionNumberAssigner0(i + 1, rest))
  }
  function partitionNumberAssigner(l) {
    return partitionNumberAssigner0(0, l)
  }
  return partitionNumberAssigner(utils.shuffle(seed, l))
}
// listPartitionedByRelativeAmounts(utils.ap(5),[2,4,4],'a')
console.log('list partitioned by relative amounts', listPartitionedByRelativeAmounts([1, 2, 3, 4, 5], [2, 5, 3], 'a'))

function mapDrumPatternToDrumPartitions(drumPattern, relativeAmounts, seed) {
  let itemPartitionNumberPairs = listPartitionedByRelativeAmounts(utils.ap(33), relativeAmounts, seed)
  //mapper maps an int from 0 to 33 to a corresponding partitionNumber
  function mapper(x00) {
    let x0 = utils.mod(x00, 33)
    //find the index of [x,partitionNumber] in itemPartitionNumberPairs and return partitionNumber
    let itemPartitionNumberPair = itemPartitionNumberPairs.find(pair => pair[0] == x0)
    let partitionNumber0 = itemPartitionNumberPair[1]
    return partitionNumber0
  }
  let partitionNumber = x => x < 4 ? x : (x == 4 ? 3 : mapper(utils.mod(x - 4, 33)))
  return drumPattern.map(partitionNumber)
}
{
  let testSeed = 'a'
  let testDrumPattern = utils.ap(33 + 4)//[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let testRelativeAmounts = [20, 20, 20, 20, 20]
  console.log('map drum pattern to drum partitions', mapDrumPatternToDrumPartitions(testDrumPattern, testRelativeAmounts, testSeed))
}
let drumFilesPartitioned = [[0], [1, 7, 9, 15, 19, 20, 21, 22, 23, 24, 25, 32, 34, 38], [2, 5, 6, 8, 17, 27, 30, 37, 40, 47], [3, 4, 14, 41, 49], [10, 11, 12, 13, 16, 18, 26, 28, 29, 31, 33, 35, 36, 39, 42, 43, 44, 45, 46, 48, 50, 51, 52, 53, 54]]
function departitionDrumPartitionPattern(partitionPattern, intraPartitionFloats) {
  return partitionPattern.map((partitionNumber, i) => {
    let drumPartition = drumFilesPartitioned[partitionNumber]
    let intraPartitionNumber = utils.snapFloatToRange(intraPartitionFloats[i], 0, drumPartition.length - 1)
    let drumNumber = drumPartition[intraPartitionNumber]
    return drumNumber
  })
}
{
  let partitionPattern = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4]
  let intraPartitionFloats = randomFloatContinuum(0.1, 99, 32, 'a')
  console.log('departition drum partition pattern', departitionDrumPartitionPattern(partitionPattern, intraPartitionFloats))

}

// console.log('([0,...,16],[' + (measureOfPrimality(16, 2.5).toString()) + '])')
// console.log('([0,...,8],[' + (measureOfPrimality(8, 2.5).toString()) + '])')
// console.log('([0,...,16],[' + (utils.ap(16).map(i => yoccozsFunction(i / 16)).map(x => Math.abs(x) == Infinity ? 99 * Math.sign(x) : x).toString()) + '])')
// console.log('([0,...,64],[' + (utils.ap(64).map(i => yoccozsFunction(i / 64)).map(x => Math.abs(x) == Infinity ? 99 * Math.sign(x) : x).toString()) + '])')
async function lol() {
  let brjunoNumbers = utils.ap(9).map(i => i / 10).map(brjunoFunction)
  for (let brjunoNumber of brjunoNumbers) {
    let x = await brjunoNumber
    console.log('x', x)
  }
  let x = await brjunoFunction(1 / 10)
  console.log(x)
  console.log(await brjunoFunction(1 / 10))
}
lol()
async function lel() {
  let x = await brjunoFunction(1 / 10)
  await utils.sleep(1000)
  console.log('lol', x)
}
lel()

function generateAmbiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, choiceFloats) {
  let len = choiceFloats.length
  let initialFreq = (15000 / 33) ** utils.randomFloat(seed) * 33
  let freqs = [initialFreq]
  for (let i in utils.ap(len)) {
    let inputFreq = freqs[i]
    freqs.push(selectAmbiharmonic(inputFreq, choiceFloats[i], sideWidth, ambiharmonicCurvature, overlyingCurvature))
  }
  return freqs
}
{
  let seed = 'lol'
  let sideWidth = 9
  let len = 44
  let ambiharmonicCurvature = 2
  let overlyingCurvature = 2
  let choiceFloats = randomFloatContinuum(0.5, len, 1, seed)
  // console.log('choice floats', choiceFloats)
  console.log('generate ambiharmonic sequence', generateAmbiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, choiceFloats))
}
{
  // let rs = randomFloatContinuum(0.1, 99, 4, 'lol')
  // for (let r of rs) {
  //   console.log(r)
  // }
  // console.log(rs)
}
// console.log(undefined[0])

function generateAmbiharmonicSequenceFromInputFreq(inputFreq, sideWidth, ambiharmonicCurvature, overlyingCurvature, choiceFloats) {
  let len = choiceFloats.length
  let freqs = [inputFreq]
  for (let i in utils.ap(len)) {
    let previousFreq = freqs[i]
    freqs.push(selectAmbiharmonic(previousFreq, choiceFloats[i], sideWidth, ambiharmonicCurvature, overlyingCurvature))
  }
  return freqs
}

//I could take the last element of generateAmbiharmonicSequence
function generateReambiharmonic(inputFreq, seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, iterations) {
  let choiceFloats = randomFloatContinuum(0.5, iterations, 1, seed)
  let ambiharmonicSequence = generateAmbiharmonicSequenceFromInputFreq(inputFreq, sideWidth, ambiharmonicCurvature, overlyingCurvature, choiceFloats)
  let lastAmbiharmonic = ambiharmonicSequence[ambiharmonicSequence.length - 1]
  return lastAmbiharmonic
}
{
  console.log('generate reambiharmonic', utils.ap(9).map(i => generateReambiharmonic(1000, 'lol' + i, 9, 4, 2, 5)))
}
// console.log(undefined[0])

// console.log(randomIntContinuum(0, 9, 0.5, 1, 32, 'lol')); console.log(undefined[0]) //testing how long a sequence randomIntContinuum generates

function generateReambiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, len, iterations) {
  let loopLength = 32
  let seeds = randomIntContinuum(0, 999, 0.1, Math.ceil(len / loopLength), loopLength, seed).map(i => i.toString())
  let initialFreq = (15000 / 33) ** utils.randomFloat(seed) * 33
  let freqs = [initialFreq]
  for (let i in utils.ap(len)) {
    let previousFreq = freqs[i]
    freqs.push(generateReambiharmonic(previousFreq, seeds[i], sideWidth, ambiharmonicCurvature, overlyingCurvature, iterations))
  }
  return freqs
}
console.log('generate reambiharmonic sequence', generateReambiharmonicSequence('lol', 9, 4, 2, 9, 5))
// console.log(undefined[0])

//just generate an ambiharmonic sequence which you play as bass and generate reambiharmonics of that backbone to play as melodies
function generateBackbonedReambiharmonicSequences(offshootAmount, len, sideWidth, ambiharmonicCurvature, overlyingCurvature, seed, iterations) {
  let backbone = generateReambiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, len, iterations)
  let offshoots = utils.ap(offshootAmount).map(i => backbone.map(freq => generateReambiharmonic(freq, seed + ' ' + i, sideWidth, ambiharmonicCurvature, overlyingCurvature, iterations)))
  // console.log('offshoots', offshoots)
  // console.log('backbone', backbone)
  return offshoots.concat([backbone])
}
{
  console.log('generate backboned reambiharmonic sequences', generateBackbonedReambiharmonicSequences(4, 5, 9, 5, 2, 'lol', 5))
}
// console.log(undefined[0])

/*
how do I create a simple function that promotes large distances between notes?
generate first a baseline backbone, then generate an offshoot that is preferably far from the backbone, then generate another offshoot that is preferably far from the backbone and the previous offshoot
the function to generate an ambiharmonic far from the other tones with respect to weights should be
*/
function generateAmbiharmonicFarFromInputFreqsWithWeights(inputFreqWeightPairs, sideWidth, ambiharmonicCurvature, overlyingCurvature, nearbyNoteExclusionCurvature, seed) {
}

//into looping incorporate ambiharmonicity, maybe all the mutations will be somewhatAmbiharmonic2 or reambiharmonic, and also the beginning and end loops be ambiharmonicSequences
//totalDuration is the length of the resulting list
function ambiharmonicLoopContinuum(randomness, seed, loopLength, totalDuration, choiceFloats, sideWidth, ambiharmonicCurvature, overlyingCurvature, iterations) {
  let startLoop = generateReambiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, loopLength, iterations)
  let continuum = startLoop
  for (let i of utils.ap(totalDuration)) {
    let choiceFloat = choiceFloats[i]
    let elementLoopLengthAway = continuum[i]
    let mutationProbability = randomness * 1 / loopLength
    let newElement = choiceFloat < mutationProbability ? generateReambiharmonic(elementLoopLengthAway, seed + ' ' + i, sideWidth, ambiharmonicCurvature, overlyingCurvature, iterations) : elementLoopLengthAway
    continuum.push(newElement)
  }
  return continuum
}
{
  let randomness = 0.1
  let seed = 'lol'
  let loopLength = 32
  let totalDuration = 999
  let choiceFloats = randomFloatContinuum(randomness, totalDuration / loopLength, loopLength, seed)
  let sideWidth = 9
  let ambiharmonicCurvature = 4
  let overlyingCurvature = 2
  let iterations = 5
  console.log('ambiharmonic loop continuum', ambiharmonicLoopContinuum(randomness, seed, loopLength, totalDuration, choiceFloats, sideWidth, ambiharmonicCurvature, overlyingCurvature, iterations))
}
// console.log(undefined[0])

//just generate on average ambiharmonics but sometimes generate freqs that are just a little bit off
function generateSomewhatAmbiharmonicSequence2(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, choiceFloats) {
  let len = choiceFloats.length
  let detuningFloats = randomFloatContinuum()
  let initialFreq = (15000 / 33) ** utils.randomFloat(seed) * 33
  let freqs = [initialFreq]
  for (let i in utils.ap(len)) {
    let inputFreq = freqs[i]
    freqs.push(selectAmbiharmonic(inputFreq, choiceFloats[i], sideWidth, ambiharmonicCurvature, overlyingCurvature))
  }
  return freqs
}
{
  let seed = 'lol'
  let sideWidth = 9
  let len = 44
  let ambiharmonicCurvature = 2
  let overlyingCurvature = 2
  let choiceFloats = randomFloatContinuum(0.5, len, 1, seed)
  // console.log('choice floats', choiceFloats)
  console.log('generate ambiharmonic sequence', generateAmbiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, choiceFloats))
}

function generateSomewhatAmbiharmonicSequence(seed, sideWidth, randomness, ambiharmonicCurvature, overlyingCurvature, choiceFloats) {
  let len = choiceFloats.length
  let initialFreq = (15000 / 33) ** utils.randomFloat(seed) * 33
  let freqs = [initialFreq]
  for (let i in utils.ap(len)) {
    let inputFreq = freqs[i]
    let choiceFloat = choiceFloats[i]
    let newFreq = selectSomewhatAmbiharmonic(inputFreq, choiceFloat, sideWidth, randomness, ambiharmonicCurvature, overlyingCurvature)
    freqs.push(newFreq)
  }
  return freqs
}
{
  let seed = 'lol'
  let sideWidth = 9
  let len = 44
  let ambiharmonicCurvature = 0.5
  let overlyingCurvature = 0.5
  let choiceFloats = randomFloatContinuum(0.5, len, 1, seed)
  let randomness = 0.1
  // console.log('choice floats', choiceFloats)
  console.log('generate somewhat ambiharmonic sequence', generateSomewhatAmbiharmonicSequence(seed, sideWidth, randomness, ambiharmonicCurvature, overlyingCurvature, choiceFloats))
  // console.log('generate somewhat ambiharmonic sequence', generateSomewhatAmbiharmonicSequence('38', 9, 3, 4, 2, randomFloatContinuum(0.1, 99 * (8 + 1), 32, '38')))
}
// console.log(undefined[0])

//maybe just pick a random harmonic of a random previous tone
//favor self tone by 1/2 probability, do a cumulation
function generateMultiambiharmonicSequences(sequenceAmount, randomness, len, sideWidth, ambiharmonicCurvature, overlyingCurvature, seed) {
  let loopLength = 32
  let toneChoiceFloatColumns = utils.zipLists(utils.ap(sequenceAmount).map(i => randomFloatContinuum(randomness, len / loopLength, loopLength, seed + ' ' + i)))
  let ambiharmonicChoiceFloatColumns = utils.zipLists(utils.ap(sequenceAmount).map(i => randomFloatContinuum(randomness, len / loopLength, loopLength, seed + ' lol ' + i)))
  // let initialFreqs = utils.randomFloats(seed, sequenceAmount).map(f => (15000 / 33) ** f * 33)
  let initialFreqs = generateAmbiharmonicSequence(seed, sideWidth, ambiharmonicCurvature, overlyingCurvature, utils.randomFloats(seed, sequenceAmount))
  let multiambiharmonicSequenceColumns = [initialFreqs]
  // console.log(len / loopLength)
  // console.log('tone choice float columns', toneChoiceFloatColumns)
  // console.log('harmonic choice float columns', harmonicChoiceFloatColumns)
  // console.log('multiharmonic sequence columns', multiHarmonicSequenceColumns)
  // console.log(undefined[0])
  for (let i in utils.ap(len)) {
    // console.log('i', i)
    // console.log('multiharmonic sequence columns', multiHarmonicSequenceColumns[i])
    let toneChoiceFloatColumn = toneChoiceFloatColumns[i]
    let ambiharmonicChoiceFloatColumn = ambiharmonicChoiceFloatColumns[i]
    let previousMultiambiharmonicSequenceColumn = multiambiharmonicSequenceColumns[i]
    // console.log('tone choice float column', toneChoiceFloatColumn)
    // console.log('harmonic choice float column', harmonicChoiceFloatColumn)
    // console.log('previous multiharmonic sequence column', previousMultiHarmonicSequenceColumn)
    // utils.zipWithMany((a,b) => {console.log('lol')},[1,2])
    // console.log(undefined[0])
    let multiambiharmonicSequenceColumn = utils.zipWithMany((toneChoiceFloat, ambiharmonicChoiceFloat, j) => {
      // console.log('in multiharmonic sequence column')
      let toneIndex = j
      let toneProbabilityPairs = previousMultiambiharmonicSequenceColumn.map((tone, k) => [tone, k == toneIndex ? 1 / 2 : 1 / (sequenceAmount - 1)])
      let toneCumulationPairs = utils.cumulatePairs(toneProbabilityPairs)
      //I need two floats, one for selecting the tone, another for selecting its harmonic
      let toneToSelectAmbiharmonicFor = toneCumulationPairs.find(pair => pair[1] > toneChoiceFloat)[0]
      let ambiharmonic = selectAmbiharmonic(toneToSelectAmbiharmonicFor, ambiharmonicChoiceFloat, sideWidth, ambiharmonicCurvature, overlyingCurvature)
      return ambiharmonic
    }
      , [toneChoiceFloatColumn, ambiharmonicChoiceFloatColumn, utils.ap(sequenceAmount)])
    // console.log('multiharmonic sequence column', multiHarmonicSequenceColumn)
    // console.log(undefined[0])
    multiambiharmonicSequenceColumns.push(multiambiharmonicSequenceColumn)
  }
  // console.log(multiambiharmonicSequenceColumns.length)
  // console.log(undefined[0])
  return utils.zipLists(multiambiharmonicSequenceColumns)
}
// console.log('generate multiharmonic sequences'); generateMultiHarmonicSequences(5, 0.1, 3, 9, 5, 2, 'lol')
console.log('generate multiambiharmonic sequences', generateMultiambiharmonicSequences(5, 0.1, 3, 9, 5, 2, 'lol'))


//if I pick a numeric seed, it might fuck some seed stuff up by introducing same seeds for different parts, but that might just be a feature rather than a bug

export default {
  major,
  pentatonic,
  wonkyScales,
  majorsAndMinors,
  majorsAndMinorsInMajor,
  chromatic,
  snapToScale,
  freqToInt,
  intToFreq,
  measureOfPowerOfTwo,
  selectAmbiharmonic,
  drumFiles,
  makeDrumBeat,
  mixLists,
  mixListsMany,
  randomFloatContinuum,
  randomIntContinuum,
  generateTransitionBetweenTwoWaypointSets,
  generateTransitionsBetweenManyWaypointSets,
  chainContinuumDrum,
  listPartitionedByRelativeAmounts,
  mapDrumPatternToDrumPartitions,
  departitionDrumPartitionPattern,
  generateAmbiharmonicSequence,
  generateReambiharmonic,
  generateReambiharmonicSequence,
  generateBackbonedReambiharmonicSequences,
  ambiharmonicLoopContinuum,
  generateSomewhatAmbiharmonicSequence,
  generateMultiambiharmonicSequences
}
