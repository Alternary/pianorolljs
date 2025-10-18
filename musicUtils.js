import utils from './utils.js'

function snapToScale(i, scale) {
  return utils.concatLists(utils.ap(9).map(octave => scale.map(i => i + octave * 12))).find(j => j >= i)
}

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
  let overallDuration = 32 * 111//* 999

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

  let duration = i => Math.floor(overallDuration / (2 ** i))

  let len = overallDuration
  let continuum = i => loopContinuum(randomness(i), duration(i), drumBeat1(i), drumBeat2(i), utils.randomInts(0, drumFiles.length, seed + 'asdfa' + i, len), utils.randomFloats(seed + 'asdlkj', len))
  return continuum(0)

  // return utils.zipWith((l,i) => l[i],zipLists(continuums),choiceSequence)
}
let multiContinuumDrum = multiContinuumDrum0(0, 0.1)
{
  console.log('multiContinuumDrum', multiContinuumDrum)
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


//if I pick a numeric seed, it might fuck some seed stuff up by introducing same seeds for different parts, but that might just be a feature rather than a bug

export default {
  snapToScale,
  drumFiles,
  makeDrumBeat,
  randomFloatContinuum,
  randomIntContinuum,
  chainContinuumDrum
}
