import utils from './utils.js'
import musicUtils from './musicUtils.js'
import axios from 'axios'
import seedrandom from 'seedrandom'
import samplePlaying from './samplePlaying.js'



let audio
let bassAudio
let drumPattern
let bassPattern
let skip = 0//2000
let drumPatternNumbers
let bassPatternNumbers
drumPattern = Array.from(Array(999)).map(_ => Math.floor(Math.random() * samplePlaying.drumFiles.length)).map(i => samplePlaying.drumFiles[i])
fetch('./drumPattern.json')
  .then(res => res.text())
  .then(text => {
    //at 2000 it's good and at 2500
    drumPattern = JSON.parse(text).slice(skip).map(i => samplePlaying.drumFiles[i])
    console.log(drumPattern)
    drumPatternNumbers = JSON.parse(text)
  })
fetch('./bassPattern.json')
  .then(res => res.text())
  .then(text => {
    //at 2000 it's good and at 2500
    // console.log('here is bassSamples', samplePlaying.bassSamples)
    bassPattern = JSON.parse(text).slice(skip).map(i => samplePlaying.bassSamples[i])
    console.log(bassPattern)
  })

async function playAmbience2() {
  let randomText
  await fetch('./randomFile.json')
    .then(res => res.text())
    .then(text => {
      // console.log(text.split(''))
      randomText = text //.split('')
    })
  console.log(99, randomText)
  let randomNumbers = randomText.split('').map(c => c.charCodeAt())

  const minNote = 0//35
  const maxNote = 96//85
  const noteIntervalLength = maxNote - minNote
  const baseTempo = 90//330
  let melodyPattern = utils.arithmeticProgression(9999)
    .map(i => {
      //every 99 or so notes, change scale
      const wonkyScale = musicUtils.wonkyScales[Math.floor(i / 222)]
      // console.log(wonkyScale)
      const scale = Math.random() < 0.8
        ? wonkyScale
        : Math.random() < 0.9
          ? musicUtils.major
          : musicUtils.chromatic
      const octave = Math.floor(Math.random() * (noteIntervalLength / 12))
      const note = minNote + (utils.chooseRandom(scale) + 12 * octave) % noteIntervalLength
      // return Math.floor(minNote + Math.random() * noteIntervalLength)
      return note
    })
  // melodyPattern = randomNumbers.map(i => minNote + i % noteIntervalLength)
  let melodyStrings = melodyPattern
    // .map(i => './samples/reverbs/reverb' + i + '.mp3')
    .map(i => './samples/ambient_sines2/ambient_sine' + i + '.mp3')
  for (let i in melodyStrings) {
    let s = melodyStrings[i]
    samplePlaying.playSample(s, 15, 0, 0.04, Math.random() * 2 - 1, (1 + Math.random()) / 2)
    // await utils.sleep(baseTempo * utils.sigmoid(Math.random(), 4) * 2)
    await utils.sleep(Math.random() * 299)
  }
}

//algorithmic industrial type beat
//others' samples
async function playSampleSong3() {
  let seed = 'b'//'lol'
  let seedRandom = seedrandom(seed)
  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  const samplePatternNumbers = drumPatternNumbers.map(i => i % sampleDurationPairs.length)

  let baseTempo = 177//199//90//330

  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length, 0.05, 999, 32, seed)
  console.log('snapToScale', musicUtils.snapToScale(8, musicUtils.major))
  bassPatternNumbers = bassPatternNumbers.map(i => musicUtils.snapToScale(i,
    seedRandom() < 0.9
      ? musicUtils.major
      : seedRandom() < 0.5
        ? musicUtils.wonkyScales[i]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.3 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => samplePlaying.bassSamples[i])

  for (let i in samplePatternNumbers) {
    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.2, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbers[i]]
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumSampleDurationPair[0]
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    let resultingSampleDuration = Math.min(drillTime / 5, 0.02 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.02 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = drillTime / resultingSampleDuration
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (utils.randomFloat(i + 'f') < 0.7) {
      // playSample(sample, 22 * resultingSampleDuration, sampleOffset, 0.15, getPan(1), Math.random() ** 0.5)
      samplePlaying.playSample(drumSample, 9 * resultingDrumSampleDuration, 0, 0.1, getPan(2), getRate(2))
    }
    else {
      // playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.2, getPan(3), getRate(3))
      samplePlaying.playSampleLoopinglyAtOffset(drumSample, times, resultingDrumSampleDuration, drumSampleOffset, 0.1, getPan(4), getRate(4))
    }
    samplePlaying.playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.2, getPan(3), getRate(3))
    console.log('beat')
    await utils.sleep(baseTempo)
  }
}

async function playMelody2() {
  let melodies = utils.ap(4)
    .map(i => musicUtils.randomIntContinuum(0, 96, 0.1, 999, 32, 'lol' + i))
    .map(melody => melody.map(i => musicUtils.snapToScale(i,
      musicUtils.major
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))

  const baseTempo = 330//90//330
  let melodyString = i => './samples/reverbs2/reverb' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => melodyString(i)))
  for (let i in melodyStringColumns) {
    let strings = melodyStringColumns[i]
    for (let s of strings) {
      samplePlaying.playSample(s, 15, 0, 0.04, Math.random() * 2 - 1, 1 + (Math.random() * 2 - 1) ** 39 * 0.5)
    }
    // await utils.sleep(baseTempo * utils.sigmoid(Math.random(), 4) * 2)
    // await utils.sleep(Math.random() * 299)
    await utils.sleep(baseTempo)
  }
}



async function playSampleSong4() {
  let drumOn = true
  let sampleOn = true
  let melodyOn = true//false
  let bassOn = false
  //e was good chordily, f was also good, and h
  let seed = 'j'//'lol'
  let baseTempo = 155//177//199//90//330
  let seedRandom = seedrandom(seed)

  let melodyAmount = 4//4
  let wonkyScaleSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 999, 4, seed).map(i => musicUtils.wonkyScales[i])
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96, 0.1, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.8
        ? wonkyScaleSequence[Math.floor(i / 8) % (wonkyScaleSequence.length)]
        : seedRandom() < 0.5
          ? musicUtils.pentatonic
          : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  let melodyDensity = 0.3
  let melodyColumnsSilenced = utils.zipWith((column, r) => r < melodyDensity ? column : [], melodyColumns, musicUtils.randomFloatContinuum(0.05, 999, 16, seed + 'lollol'))
  console.log(melodyColumns.slice(0, 3))

  let melodyString = i => './samples/reverbs2/reverb' + i + '.mp3'
  let melodyStringColumns = melodyColumnsSilenced.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 0.4
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 99, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map(i => musicUtils.snapToScale(i,
    seedRandom() < 0.9
      ? musicUtils.pentatonic
      : seedRandom() < 0.5
        ? musicUtils.wonkyScales[Math.floor(seedRandom() * 9)]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.8 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => samplePlaying.bassSamples[i])

  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / samplePatternNumbers.length
    let strings = melodyStringColumns[i]
    for (let s of strings) {
      let melodyVolume = 1.5//0.0 + 1.0 * (Math.abs(utils.weird4(progress * 4)) % 1)
        * (utils.sigmoid(Math.abs(utils.weird4(progress)), 1 / 4))
      let melodyRate = 1 + Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 77
      if (melodyOn) {
        samplePlaying.playSample(s, 15, 0, 0.04 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.19, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbers[i]]
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumSampleDurationPair[0]
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = drillTime / resultingSampleDuration
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (drillingPattern[i] < 0.7) {
      if (sampleOn) {
        samplePlaying.playSample(sample, 22 * resultingSampleDuration, sampleOffset, 0.07, getPan(1), Math.random() ** 0.5)
      }
      if (drumOn) {
        samplePlaying.playSample(drumSample, 9 * resultingDrumSampleDuration, 0, 0.08, getPan(2), getRate(2))
      }
    }
    else {
      if (sampleOn) {
        samplePlaying.playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.15, getPan(3), getRate(3))
      }
      if (drumOn) {
        samplePlaying.playSampleLoopinglyAtOffset(drumSample, times, resultingDrumSampleDuration, drumSampleOffset, 0.08, getPan(4), getRate(4))
      }
    }
    // samplePlaying.playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.15, getPan(3), getRate(3))
    console.log('beat')
    await utils.sleep(baseTempo)
  }
}



async function playChordSong2() {
  let melodyOn = true//false
  let seed = 'e'//'lol'
  let baseTempo = 155//177//199//90//330
  let seedRandom = seedrandom(seed)

  let melodyAmount = 10//8//4
  let wonkyScaleSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i])
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 77, 0.1, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.8
        ? wonkyScaleSequence[Math.floor(i / 8) % 99]
        : seedRandom() < 0.5
          ? musicUtils.pentatonic
          : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))

  let melodyString = i => './samples/reverbs2/reverb' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))



  //
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in melodyStringColumns) {
    let progress = i / melodyStringColumns.length
    let strings = melodyStringColumns[i]
    for (let s of strings) {
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 77
      if (melodyOn) {
        samplePlaying.playSample(s, 15, 0, 0.05 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    console.log('beat')
    await utils.sleep(baseTempo)
  }
}



export default {
  playAmbience2,
  playMelody2,
  playSampleSong3,
  playSampleSong4,
  playChordSong2
}
