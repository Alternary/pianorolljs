import utils from './utils.js'

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

//if I pick a numeric seed, it might fuck some seed stuff up by introducing same seeds for different parts, but that might just be a feature rather than a bug

export default {
  major,
  pentatonic,
  wonkyScales,
  majorsAndMinors,
  majorsAndMinorsInMajor,
  chromatic,
  snapToScale,
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
  departitionDrumPartitionPattern
}
