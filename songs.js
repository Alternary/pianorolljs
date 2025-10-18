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
async function playDrumPattern() {
  // drumPatternNumbers = utils.cycle(musicUtils.makeDrumBeat('seed lol', 0.9, 0.1), 99)
  console.log(drumPatternNumbers.slice(0, 32))
  drumPattern = drumPatternNumbers.map(i => samplePlaying.drumFiles[i])
  // console.log(3)
  // console.log(drumPattern)
  for (let i in drumPattern) {
    let baseTempo = 110//130
    let s = drumPattern[i]
    console.log(2)
    audio = new Audio(s)
    audio.volume = 0.1
    // audio.play()
    let drillTime = baseTempo / 1000
    let sampleDuration = Math.min(drillTime / 5, 0.02 + Math.random() * drillTime)//0.02
    let times = drillTime / sampleDuration
    if (Math.random() < 0.997) {
      audio.play()
    }
    else {
      samplePlaying.playSampleLoopingly(s, times, sampleDuration)
    }
    let bassString = bassPattern[i]
    bassAudio = new Audio(bassString)
    bassAudio.volume = 0.1
    bassAudio.play()
    // console.log(bassString)
    // await utils.sleep(90)//70)
    // 1... 3... .2.. 3...
    // 1... 3... 3... 3...   .2.. 3... 3... 3...
    let swing = 0//0.3
    // console.log(s)
    let swingMilliseconds = baseTempo * swing
    if (i % 4 == 1) {
      await utils.sleep(baseTempo + swingMilliseconds)
    }
    else if (i % 4 == 2) {
      await utils.sleep(baseTempo - swingMilliseconds)
    }
    else {
      await utils.sleep(baseTempo)
    }
  }
}

let major = [0, 2, 4, 5, 7, 9, 11]
// let wonkyScale = [0, 3, 4, 6, 8, 9, 10]
let wonkyScales = utils.arithmeticProgression(999).map(i => {
  let wonkyScale = utils.arithmeticProgression(22)
    .map(j => Math.floor(Math.random() * 12))
  return wonkyScale
})
console.log('wonk', wonkyScales[0])
let chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
let melodyAudio
async function playAmbience() {
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
  const maxNote = 60//85
  const noteIntervalLength = maxNote - minNote
  const baseTempo = 90//330
  let melodyPattern = utils.arithmeticProgression(9999)
    .map(i => {
      //every 99 or so notes, change scale
      const wonkyScale = wonkyScales[Math.floor(i / 222)]
      // console.log(wonkyScale)
      const scale = Math.random() < 0.8
        ? wonkyScale
        : Math.random() < 0.9
          ? major
          : chromatic
      const octave = Math.floor(Math.random() * (noteIntervalLength / 12))
      const note = minNote + (utils.chooseRandom(scale) + 12 * octave) % noteIntervalLength
      // return Math.floor(minNote + Math.random() * noteIntervalLength)
      return note
    })
  // melodyPattern = randomNumbers.map(i => minNote + i % noteIntervalLength)
  let melodyStrings = melodyPattern
    // .map(i => './samples/reverbs/reverb' + i + '.mp3')
    .map(i => './samples/ambient_sines/ambient_sine' + i + '.mp3')
  for (let i in melodyStrings) {
    let s = melodyStrings[i]
    samplePlaying.playSample(s, 15, 0, 0.04, Math.random() * 2 - 1, (1 + Math.random()) / 2)
    // await utils.sleep(baseTempo * utils.sigmoid(Math.random(), 4) * 2)
    await utils.sleep(Math.random() * 299)
  }
}

//algorithmic industrial type beat
//others' samples
async function playSamplePattern() {
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
  console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map(i => musicUtils.snapToScale(i,
    seedRandom() < 0.9
      ? major
      : seedRandom() < 0.5
        ? wonkyScales[i]
        : chromatic
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

async function playMelody() {
  let melodies = utils.ap(4)
    .map(i => musicUtils.randomIntContinuum(0, 96, 0.1, 999, 32, 'lol' + i))
    .map(melody => melody.map(i => musicUtils.snapToScale(i,
      major
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



export default {
  playDrumPattern,
  playAmbience,
  playMelody,
  playSamplePattern,
}
