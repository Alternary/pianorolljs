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
/*
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
*/
drumPattern = ['commented out code that fetches drum pattern']
bassPattern = ['commented out code that fetches bass pattern']
drumPatternNumbers = ['commented out code that fetches drum pattern numbers']
bassPatternNumbers = ['commented out code that fetches bass pattern numbers']

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
    samplePlaying.playSample(s, 15, 0, 0.025 * Math.random(), Math.random() * 2 - 1, (1 + Math.random()) / 2)
    // await utils.sleep(baseTempo * utils.sigmoid(Math.random(), 4) * 2)
    await utils.sleep(Math.random() * 299)
  }
}

//algorithmic industrial type beat
//others' samples
async function playSamplePattern() {
  let seed = 'n'//'lol'
  let sampleOn = true
  let baseTempo = 99//177//199//90//330

  let seedRandom = seedrandom(seed)
  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  console.log('drum sample duration pairs', drumSampleDurationPairs)
  // return
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  const samplePatternNumbers = drumPatternNumbers.map(i => i % sampleDurationPairs.length)

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
    // samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.2, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)

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
      samplePlaying.playSample(drumSample, 9 * resultingDrumSampleDuration, 0, 0.15, getPan(2), getRate(2))
    }
    else {
      // playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.2, getPan(3), getRate(3))
      samplePlaying.playSampleLoopinglyAtOffset(drumSample, times, resultingDrumSampleDuration, drumSampleOffset, 0.1, getPan(4), getRate(4))
    }
    if (sampleOn) {
      samplePlaying.playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.2, getPan(3), getRate(3))
    }
    console.log('beat')
    await utils.sleep(baseTempo)
  }
}

async function playMelody() {
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



async function testCommand() {
  console.log('testing command')
  try {
    let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' })
    console.log(sampleCommandResponse)
  }
  catch (err) {
    console.log('errored with error', err)
  }
  console.log('done')
}



//hogs memory
async function playSampleSong2() {
  let drumOn = true
  let sampleOn = true
  let melodyOn = false//false
  let bassOn = true
  //e was good chordily, f was also good, and h
  let seed = 'k'//'lol'
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
  console.log('here is sample command response', sampleCommandResponse)
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  console.log('here is drum sample command response', drumSampleCommandResponse)
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)
  // console.log('drum sample duration pairs', drumSampleDurationPairs)
  // return

  let drumDensity = 0.7
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))
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
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    // console.log('here are drum sample duration pairs',drumSampleDurationPairs)
    // console.log('here are drum pattern numbers silenced', drumPatternNumbersSilenced)
    // return
    let drumSample = drumSampleDurationPair[0]
    // console.log('here is drum sample', drumSample)
    // return
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
        samplePlaying.playSample(drumSample, 9 * resultingDrumSampleDuration, 0, 0.1, getPan(2), getRate(2))
      }
    }
    else {
      if (sampleOn) {
        samplePlaying.playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.15, getPan(3), getRate(3))
      }
      if (drumOn) {
        samplePlaying.playSampleLoopinglyAtOffset(drumSample, times, resultingDrumSampleDuration, drumSampleOffset, 0.1, getPan(4), getRate(4))
      }
    }
    // samplePlaying.playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.15, getPan(3), getRate(3))
    console.log('beat')
    await utils.sleep(baseTempo)
  }
}



async function playChordSong() {
  let melodyOn = true//false
  let seed = 'b'//'l'//'lol'
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

  let melodyString = i => './samples/squares/square' + i + '.mp3'
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
        samplePlaying.playSample(s, 15, 0, 0.03 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    console.log('beat')
    await utils.sleep(baseTempo)
  }
}

//works out
/*
fetch('./patterns/testpattern.json')
  .then(res => res.text())
  .then(text => {
    let testPattern = JSON.parse(text)
    console.log('here is testpattern', testPattern, text)
  })
*/

async function playChordySampleSong() {
  let drumOn = true
  let chordOn = true
  let sampleOn = false
  let bassOn = true
  let seed = '15'//10//'8'//'5'//'4'//'l'//'lol'
  let baseTempo = 166//155//177//199//90//330
  let seedRandom = seedrandom(seed)
  let melodyAmount = 7//10//8//4



  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum' //seed randomness duration loopLength
  ]
  let funcNum = 0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = 5
  let randomness = 0.1
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  try {
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
    // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
    console.log('drumPatternNumbers', drumPatternNumbers)
    await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
    console.log('in here')
    // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
    // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
    // sleeping so that command has time to execute
    await utils.sleep(1000)
  }
  catch (err) {
    console.log('errored with error', err)
    console.log('yo')
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 0.99
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))
  console.log('silenceds', drumPatternNumbersSilenced)
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  let wonkyScaleSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i])
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 77, 0.1, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.8
        ? wonkyScaleSequence[Math.floor(i / 8) % 99]
        : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))

  let melodyString = i => './samples/reverbs2/reverb' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.9
      ? wonkyScaleSequence[Math.floor(i / 8) % 99]
      : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.4 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let strings = melodyStringColumns[i]
    for (let s of strings) {
      //more macrolly control melody volume
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + 0 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 111
      if (chordOn) {
        samplePlaying.playSample(s, 15, 0, 0.024 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
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



async function playChordyPartitionedSampleSong() {
  let drumOn = true
  let chordOn = true
  let sampleOn = false
  let bassOn = true
  let seed = '11'//'10'//'8'//'5'//'4'//'l'//'lol'
  let baseTempo = 166//155//177//199//90//330
  let seedRandom = seedrandom(seed)
  let seedNumber0 = 6//5



  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum' //seed randomness duration loopLength
  ]
  let funcNum = 0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = seedNumber0//5
  let randomness = 0.1
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  try {
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
    // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
    console.log('drumPatternNumbers', drumPatternNumbers)
    await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
    console.log('in here')
    // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
    // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
    // sleeping so that command has time to execute
    await utils.sleep(1000)
  }
  catch (err) {
    console.log('errored with error', err)
    console.log('yo')
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 1//0.8
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))

  //then do the combination of partitioning and departitioning
  let relativeAmounts = [0, 25, 25, 25, 25]
  let drumPartitionPattern = musicUtils.mapDrumPatternToDrumPartitions(drumPatternNumbers, relativeAmounts, seed)
  let intraPartitionFloats = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  let postPartitionDepartitionDrumPattern = musicUtils.departitionDrumPartitionPattern(drumPartitionPattern, intraPartitionFloats)
  console.log('here is post partition departition drum pattern', Math.max(...postPartitionDepartitionDrumPattern))
  console.log('here is drum pattern numbers silenced max', Math.max(...drumPatternNumbersSilenced))
  // drumPatternNumbersSilenced = postPartitionDepartitionDrumPattern
  console.log('silenceds', drumPatternNumbersSilenced)
  // return
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  let melodyAmount = 10//8//4
  let wonkyScaleSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i])
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 77, 0.1, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.8
        ? wonkyScaleSequence[Math.floor(i / 8) % 99]
        : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))

  let melodyString = i => './samples/reverbs2/reverb' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.9
      ? wonkyScaleSequence[Math.floor(i / 8) % 99]
      : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.4 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let strings = melodyStringColumns[i]
    for (let s of strings) {
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + 0 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 111
      if (chordOn) {
        samplePlaying.playSample(s, 15, 0, 0.024 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    drumSampleDurationPair = drumSampleDurationPair == undefined ? ['./samples/silence.mp3', 0] : drumSampleDurationPair
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    drumSample = drumSample == undefined ? './samples/silence.mp3' : drumSample
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
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

async function playChordyPartitionedSampleSong2() {
  let drumOn = true
  let chordOn = false//with chords on, the drum timing wonks up, unless very few melodies are played at a time
  let sampleOn = false
  let bassOn = true
  let drillOn = false//true
  let seed = '30'//'27'//'13'//'10'//'8'//'5'//'4'//'l'//'lol'
  let baseTempo = 99//155//177//199//90//330
  let seedNumber0 = 5//5
  let melodyAmount = 5//10//8//4


  let seedRandom = seedrandom(seed)

  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum' //seed randomness duration loopLength
  ]
  let funcNum = 0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = seedNumber0//5
  let randomness = 0.1
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  try {
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
    // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
    console.log('drumPatternNumbers', drumPatternNumbers)
    await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
    console.log('in here')
    // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
    // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
    // sleeping so that command has time to execute
    await utils.sleep(1000)
  }
  catch (err) {
    console.log('errored with error', err)
    console.log('yo')
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 1//0.8
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))

  //then do the combination of partitioning and departitioning
  let relativeAmounts = [0, 25, 25, 25, 25]
  let drumPartitionPattern = musicUtils.mapDrumPatternToDrumPartitions(drumPatternNumbers, relativeAmounts, seed)
  let intraPartitionFloats = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  let postPartitionDepartitionDrumPattern = musicUtils.departitionDrumPartitionPattern(drumPartitionPattern, intraPartitionFloats)
  console.log('here is post partition departition drum pattern', Math.max(...postPartitionDepartitionDrumPattern))
  console.log('here is drum pattern numbers silenced max', Math.max(...drumPatternNumbersSilenced))
  // drumPatternNumbersSilenced = postPartitionDepartitionDrumPattern
  console.log('silenceds', drumPatternNumbersSilenced)
  // return
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  let wonkyScaleSequence = //utils.duplicate(8,
    musicUtils.generateTransitionsBetweenManyWaypointSets(
      musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i]), 8, 0.3, seed)
  let majorAndMinorSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.majorsAndMinorsInMajor[i])
  // console.log('here is major and minor sequence', majorAndMinorSequence)
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 77, 0.1, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.8//0.9//0//0.99
        ? musicUtils.pentatonic
        : seedRandom() < 0.9//0.5
          ? wonkyScaleSequence[i % 99]
          : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))

  let melodyString = i => './samples/reverbs2/reverb' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))
  melodyStringColumns = utils.concatLists(melodyStringColumns.map(col => [col, []])) //dividing tempo by 2


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.8//0//0.99//0.9
      ? musicUtils.pentatonic
      : seedRandom() < 0.9//0.5
        ? wonkyScaleSequence[i % 99]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.5 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])
  bassPattern = utils.concatLists(bassPattern.map(s => [s, "./samples/silence.mp3"])) //dividing tempo by 2


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let strings = melodyStringColumns[i]
    for (let s of strings) {
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + 0 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 111
      if (chordOn) {
        samplePlaying.playSample(s, 15, 0, 0.024 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    drumSampleDurationPair = drumSampleDurationPair == undefined ? ['./samples/silence.mp3', 0] : drumSampleDurationPair
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    drumSample = drumSample == undefined ? './samples/silence.mp3' : drumSample
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (drillingPattern[i] < 0.7 || !drillOn) {
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

async function playChordyPartitionedSampleSong3() {
  let drumOn = true
  let chordOn = false//with chords on, the drum timing wonks up, unless very few melodies are played at a time
  let sampleOn = false//true
  let bassOn = true
  let drillOn = true
  let seed = '49'//'49'//'27'//'13'//'10'//'8'//'5'//'4'//'l'//'lol'
  let baseTempo = 88//99//111//99//155//177//199//90//330
  let seedNumber0 = 21//21//5
  let melodyAmount = 5//5//10//8//4


  let seedRandom = seedrandom(seed)

  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum', //seed randomness duration loopLength
    /*7*/'granaryDrumPattern' //seed
  ]
  let funcNum = 7//0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = seedNumber0//5
  let randomness = 0.03
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32/*
  try {
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
    // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
    console.log('drumPatternNumbers', drumPatternNumbers)
    await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
    console.log('in here')
    // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
    // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
    // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
    // sleeping so that command has time to execute
    await utils.sleep(1000)
  }
  catch (err) {
    console.log('errored with error', err)
    console.log('yo')
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })*/
  let drumPatternNumbers = await utils.saveAndReturnPattern(0, funcNum, seedNumber, randomness, komplexW, start, end, duration, loopLength)
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 11//0.8
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumSilences = musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd').map((r, i) => r < drumDensity * musicUtils.measureOfPowerOfTwo(8, 2)[i % 8] ? 1 : 0)
  let drumPatternNumbersSilenced = utils.zipWith((i, j) => i * j, drumPatternNumbers, drumSilences)

  //then do the combination of partitioning and departitioning
  let relativeAmounts = [0, 25, 25, 25, 25]
  let drumPartitionPattern = musicUtils.mapDrumPatternToDrumPartitions(drumPatternNumbers, relativeAmounts, seed)
  let intraPartitionFloats = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  let postPartitionDepartitionDrumPattern = musicUtils.departitionDrumPartitionPattern(drumPartitionPattern, intraPartitionFloats)
  console.log('here is post partition departition drum pattern', Math.max(...postPartitionDepartitionDrumPattern))
  console.log('here is drum pattern numbers silenced max', Math.max(...drumPatternNumbersSilenced))
  // drumPatternNumbersSilenced = postPartitionDepartitionDrumPattern
  console.log('silenceds', drumPatternNumbersSilenced)
  // return
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.01, 999, 16, seed)


  let wonkyScaleSequence = //utils.duplicate(8,
    musicUtils.generateTransitionsBetweenManyWaypointSets(
      musicUtils.randomIntContinuum(0, 99, 0.01, 99, 4, seed).map(i => musicUtils.wonkyScales[i]), 8, 0.3, seed)
  let majorAndMinorSequence = musicUtils.randomIntContinuum(0, 99, 0.01, 99, 4, seed).map(i => musicUtils.majorsAndMinorsInMajor[i])
  // console.log('here is major and minor sequence', majorAndMinorSequence)
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 77, 0.1, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.9//0.9//0//0.99
        ? musicUtils.pentatonic
        : seedRandom() < 0.9//0.5
          ? wonkyScaleSequence[i % 99]
          : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))
  let melodyChoiceFloatss = utils.zipLists(utils.ap(melodyAmount).map(i => musicUtils.randomFloatContinuum(0.1, 999, 32, seed + ' ' + i)))

  let melodyString = i => './samples/squares/square' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))
  melodyStringColumns = utils.concatLists(melodyStringColumns.map(col => [col, []])) //dividing tempo by 2


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.01, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.8//0//0.99//0.9
      ? musicUtils.pentatonic
      : seedRandom() < 0.9//0.5
        ? wonkyScaleSequence[i % 99]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.5 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])
  bassPattern = utils.concatLists(bassPattern.map(s => [s, "./samples/silence.mp3"])) //dividing tempo by 2


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let melodyChoiceFloats = melodyChoiceFloatss[i]
    let base = Math.cos(progress / 99) + 2
    let probabilityOfPlaying = musicUtils.measureOfPowerOfTwo(8, base)[i % 8]
    let strings = melodyStringColumns[i]
    for (let j in strings) {
      let melodyChoiceFloat = melodyChoiceFloats[j]
      let isPlaying = melodyChoiceFloat < probabilityOfPlaying
      let s = isPlaying ? strings[j] : './samples/silence.mp3'
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + 0 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 111
      if (chordOn && isPlaying) {
        samplePlaying.playSample(s, 15, 0, 0.1 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 4.5, 1 + 0.003 * seedRandom() * 2)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    drumSampleDurationPair = drumSampleDurationPair == undefined ? ['./samples/silence.mp3', 0] : drumSampleDurationPair
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    drumSample = drumSample == undefined ? './samples/silence.mp3' : drumSample
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (drillingPattern[i] < 0.6 || !drillOn) {
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

async function playMoreChordySong() {
  let drumOn = false
  let chordOn = true//with chords on, the drum timing wonks up, unless very few melodies are played at a time
  let sampleOn = false//true
  let bassOn = true
  let drillOn = true
  let microtonalOn = false
  let seed = '37'//'27'//'13'//'10'//'8'//'5'//'4'//'l'//'lol'
  let drumDoubleTempo = true
  let baseTempo = 99//111//99//155//177//199//90//330
  let seedNumber0 = 8//5
  let melodyAmount = 8//5//10//8//4


  let seedRandom = seedrandom(seed)

  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum' //seed randomness duration loopLength
  ]
  let funcNum = 0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = seedNumber0//5
  let randomness = 0.1
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  if (drumOn) {
    try {
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
      // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
      console.log('drumPatternNumbers', drumPatternNumbers)
      await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
      console.log('in here')
      // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
      // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
      // sleeping so that command has time to execute
      await utils.sleep(1000)
    }
    catch (err) {
      console.log('errored with error', err)
      console.log('yo')
    }
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 1//0.8
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))

  //then do the combination of partitioning and departitioning
  let relativeAmounts = [0, 25, 25, 25, 25]
  let drumPartitionPattern = musicUtils.mapDrumPatternToDrumPartitions(drumPatternNumbers, relativeAmounts, seed)
  let intraPartitionFloats = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  let postPartitionDepartitionDrumPattern = musicUtils.departitionDrumPartitionPattern(drumPartitionPattern, intraPartitionFloats)
  console.log('here is post partition departition drum pattern', Math.max(...postPartitionDepartitionDrumPattern))
  console.log('here is drum pattern numbers silenced max', Math.max(...drumPatternNumbersSilenced))
  // drumPatternNumbersSilenced = postPartitionDepartitionDrumPattern
  console.log('silenceds', drumPatternNumbersSilenced)
  // return
  drumPatternNumbersSilenced = drumDoubleTempo ? drumPatternNumbersSilenced : utils.concatLists(drumPatternNumbersSilenced.map(i => [i, 0]))
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  let wonkyScaleSequence = //utils.duplicate(8,
    musicUtils.generateTransitionsBetweenManyWaypointSets(
      musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i]), 8, 0.3, seed)
  let majorAndMinorSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 999, 4, seed).map(i => musicUtils.majorsAndMinorsInMajor[i])
  // console.log('here is major and minor sequence', majorAndMinorSequence)
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 0 * 77, 0.03, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.98//0.9//0//0.99
        ? musicUtils.pentatonic
        : seedRandom() < 0.9//0.5
          ? wonkyScaleSequence[i % 99]
          : musicUtils.chromatic
    )))
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))
  let melodyChoiceFloatss = utils.zipLists(utils.ap(melodyAmount).map(i => musicUtils.randomFloatContinuum(0.1, 999, 32, seed + ' ' + i)))

  let melodyString = i => './samples/squares/square' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))
  melodyStringColumns = utils.concatLists(melodyStringColumns.map(col => [col, []])) //dividing tempo by 2


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.8//0//0.99//0.9
      ? musicUtils.pentatonic
      : seedRandom() < 0.9//0.5
        ? wonkyScaleSequence[i % 99]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.5 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])
  bassPattern = utils.concatLists(bassPattern.map(s => [s, "./samples/silence.mp3"])) //dividing tempo by 2


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let melodyChoiceFloats = melodyChoiceFloatss[i]
    let base = Math.cos(progress / 99) + 2
    let probabilityOfPlaying = musicUtils.measureOfPowerOfTwo(8, base)[i % 8]
    let strings = melodyStringColumns[i]
    for (let j in strings) {
      let melodyChoiceFloat = melodyChoiceFloats[j]
      let isPlaying = melodyChoiceFloat < probabilityOfPlaying
      let s = isPlaying ? strings[j] : './samples/silence.mp3'
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + (microtonalOn ? 1 : 0) * 1 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 19
      if (chordOn) {
        samplePlaying.playSample(s, 15, 0, 0.075 * melodyVolume, Math.random() * 2 - 1, melodyRate)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      let bassRate = 1 + (microtonalOn ? 1 : 0) * 1 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 19
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 6.5, bassRate)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    drumSampleDurationPair = drumSampleDurationPair == undefined ? ['./samples/silence.mp3', 0] : drumSampleDurationPair
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    drumSample = drumSample == undefined ? './samples/silence.mp3' : drumSample
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (drillingPattern[i] < 0.7 || !drillOn) {
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

async function playAmbiharmonicSong() {
  let drumOn = false
  let chordOn = true//with chords on, the drum timing wonks up, unless very few melodies are played at a time
  let sampleOn = false//true
  let bassOn = false//false//true
  let drillOn = true
  let microtonalOn = false
  let seed = '39'//'27'//'13'//'10'//'8'//'5'//'4'//'l'//'lol'
  let drumDoubleTempo = true
  let baseTempo = 99//111//99//155//177//199//90//330
  let seedNumber0 = 8//5
  let melodyAmount = 8//5//10//8//4


  let seedRandom = seedrandom(seed)

  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum' //seed randomness duration loopLength
  ]
  let funcNum = 0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = seedNumber0//5
  let randomness = 0.1
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  if (drumOn) {
    try {
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
      // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
      console.log('drumPatternNumbers', drumPatternNumbers)
      await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
      console.log('in here')
      // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
      // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
      // sleeping so that command has time to execute
      await utils.sleep(1000)
    }
    catch (err) {
      console.log('errored with error', err)
      console.log('yo')
    }
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 1//0.8
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))

  //then do the combination of partitioning and departitioning
  let relativeAmounts = [0, 25, 25, 25, 25]
  let drumPartitionPattern = musicUtils.mapDrumPatternToDrumPartitions(drumPatternNumbers, relativeAmounts, seed)
  let intraPartitionFloats = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  let postPartitionDepartitionDrumPattern = musicUtils.departitionDrumPartitionPattern(drumPartitionPattern, intraPartitionFloats)
  console.log('here is post partition departition drum pattern', Math.max(...postPartitionDepartitionDrumPattern))
  console.log('here is drum pattern numbers silenced max', Math.max(...drumPatternNumbersSilenced))
  // drumPatternNumbersSilenced = postPartitionDepartitionDrumPattern
  console.log('silenceds', drumPatternNumbersSilenced)
  // return
  drumPatternNumbersSilenced = drumDoubleTempo ? drumPatternNumbersSilenced : utils.concatLists(drumPatternNumbersSilenced.map(i => [i, 0]))
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  let wonkyScaleSequence = //utils.duplicate(8,
    musicUtils.generateTransitionsBetweenManyWaypointSets(
      musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i]), 8, 0.3, seed)
  let majorAndMinorSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 999, 4, seed).map(i => musicUtils.majorsAndMinorsInMajor[i])
  // console.log('here is major and minor sequence', majorAndMinorSequence)
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 0 * 77, 0.03, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.98//0.9//0//0.99
        ? musicUtils.pentatonic
        : seedRandom() < 0.9//0.5
          ? wonkyScaleSequence[i % 99]
          : musicUtils.chromatic
    )))
  // console.log(musicUtils.generateReambiharmonicSequence(seed, 9, 4, 2, 4444, 5).length)
  // console.log(undefined[0])
  melodies = utils.groupBy(
    // musicUtils.generateAmbiharmonicSequence(seed, 9, 5, 2, musicUtils.randomFloatContinuum(0.1, 99 * (melodyAmount + 1), 32, seed))
    // musicUtils.generateSomewhatAmbiharmonicSequence(seed, 9, 3, 0.5, 0.5, musicUtils.randomFloatContinuum(0.1, 99 * (melodyAmount + 1), 32, seed))
    musicUtils.generateReambiharmonicSequence(seed, 9, 4, 2, 999 * 4 * melodyAmount, 5)
    // musicUtils.ambiharmonicLoopContinuum(0.05, seed, 32, 4444 * melodyAmount, musicUtils.randomFloatContinuum(0.1, 99 * (melodyAmount + 1), 32, seed), 7, 5, 2, 5)
    /*.map(freq => musicUtils.freqToInt(freq))
    //the below mapping snaps the int to scale
    // /*
    .map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.9//0.9//0//0.99
        ? musicUtils.pentatonic
        : seedRandom() < 0.9//0.5
          ? wonkyScaleSequence[i % 99]
          : musicUtils.chromatic
    ))//*/
    , melodyAmount + 1)
  melodies = utils.zipLists(melodies) //need to transpose as they get retransposed down below
  console.log('generate somewhat ambiharmonic sequence', musicUtils.generateSomewhatAmbiharmonicSequence(seed, 9, 22, 4, 2, musicUtils.randomFloatContinuum(0.1, 99 * (melodyAmount + 1), 32, seed)))
  // console.log('melodies', melodies)
  // console.log(undefined[0])
  let bassline = melodies[melodyAmount]
  melodies = melodies.slice(0, melodyAmount) //leaving last melody as bassline
  console.log('melodies[0]', melodies[0])
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))
  // console.log(undefined[0])
  let melodyChoiceFloatss = utils.zipLists(utils.ap(melodyAmount).map(i => musicUtils.randomFloatContinuum(0.1, 999, 32, seed + ' ' + i)))

  let melodyString = i => './samples/squares/square' + i + '.mp3'
  // melodyString = i => './samples/ambient_sines2/ambient_sine' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))
  // melodyStringColumns = utils.concatLists(melodyStringColumns.map(col => [col, []])) //dividing tempo by 2


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.8//0//0.99//0.9
      ? musicUtils.pentatonic
      : seedRandom() < 0.9//0.5
        ? wonkyScaleSequence[i % 99]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.5 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPatternNumbers = bassline.map((num, i) => i % 2 == 0 ? num : 0) //effectively dividing bass tempo by two
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])
  // bassPattern = utils.concatLists(bassPattern.map(s => [s, "./samples/silence.mp3"])) //dividing tempo by 2


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let melodyChoiceFloats = melodyChoiceFloatss[i]
    let base = Math.cos(progress / 99) + 2
    let probabilityOfPlaying = musicUtils.measureOfPowerOfTwo(8, base)[i % 8]
    let strings = melodyStringColumns[i]
    let melodyColumn = melodyColumns[i]
    for (let j in strings) {
      let melodyChoiceFloat = melodyChoiceFloats[j]
      let isPlaying = melodyChoiceFloat < probabilityOfPlaying
      let s = isPlaying ? strings[j] : './samples/silence.mp3'
      let freq = melodyColumn[j]
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + (microtonalOn ? 1 : 0) * 1 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 19
      if (chordOn && isPlaying) {
        // samplePlaying.playSample(s, 15, 0, 0.075 * melodyVolume, Math.random() * 2 - 1, melodyRate)
        // samplePlaying.playFreq('./samples/squares/square', freq, 15, 0, 0.075 * melodyVolume, Math.random() * 2 - 1)
        samplePlaying.playFreq('./samples/ambient_sines2/ambient_sine', freq, 15, 0, 0.075 * melodyVolume, Math.random() * 2 - 1)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    let bassFreq = bassPatternNumbers[i]
    if (bassOn) {
      let bassRate = 1 + (microtonalOn ? 1 : 0) * 1 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 19
      // samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 6.5, bassRate)
      samplePlaying.playFreq('./samples/harmonicBasses/harmonicBass', bassFreq, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 6.5)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    drumSampleDurationPair = drumSampleDurationPair == undefined ? ['./samples/silence.mp3', 0] : drumSampleDurationPair
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    drumSample = drumSample == undefined ? './samples/silence.mp3' : drumSample
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (drillingPattern[i] < 0.7 || !drillOn) {
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

async function playMultiambiharmonicSong() {
  let drumOn = false
  let chordOn = true//with chords on, the drum timing wonks up, unless very few melodies are played at a time
  let sampleOn = false//true
  let bassOn = false//true//false//true
  let drillOn = true
  let microtonalOn = false
  let seed = '46'//'27'//'13'//'10'//'8'//'5'//'4'//'l'//'lol'
  let drumDoubleTempo = true
  let baseTempo = 99//111//99//155//177//199//90//330
  let seedNumber0 = 8//5
  let melodyAmount = 8//5//10//8//4


  let seedRandom = seedrandom(seed)

  // let chainContinuumDrumPattern
  let drumPatternFilenames = [
    /*0*/'chainContinuumDrum0', //seed randomness
    /*1*/'multiContinuumDrum0', //seed randomness
    /*2*/'multiContinuumFloat00', //seed randomness
    /*3*/'komplexFloats', //w seed
    /*4*/'komplexContinuumFloats0', //w seed randomness
    /*5*/'permutationReplacementIntContinuum', //start end seed randomness duration loopLength
    /*6*/'permutationReplacementDrumContinuum' //seed randomness duration loopLength
  ]
  let funcNum = 0//1//0//6
  let drumPatternFilename = drumPatternFilenames[funcNum]
  let seedNumber = seedNumber0//5
  let randomness = 0.1
  let komplexW = 1000
  let start = 0
  let end = 96
  let duration = 999
  let loopLength = 32
  if (drumOn) {
    try {
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 & echo 2' })
      // await axios.post('http://localhost:3001/shellCommandUnsynced', { body: '/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32 &' })
      console.log('drumPatternNumbers', drumPatternNumbers)
      await axios.post('http://localhost:3001/shellCommandUnsynced', { body: `/home/bruh/k/haskle/aural-calculator/src/main ${drumPatternFilename + '.json'} ${funcNum} ${seedNumber} ${randomness} ${komplexW} ${start} ${end} ${duration} ${loopLength} &` })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test2.sh' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/sk/test.sh lol.json 2.1' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/test.sh lol.json 2.1' })
      console.log('in here')
      // await axios.post('http://localhost:3001/shellCommand', { body: 'bash "/home/bruh/k/haskle/aural-calculator/src/main chainContinuumDrumPattern2.json 0 69 0.1 999 0 99 999 32"' })
      // await axios.post('http://localhost:3001/shellCommand', { body: '/home/bruh/k/haskle/aural-calculator/src/main lol.json' })
      // await axios.post('http://localhost:3001/shellCommand', { body: 'fys hello' })
      // sleeping so that command has time to execute
      await utils.sleep(1000)
    }
    catch (err) {
      console.log('errored with error', err)
      console.log('yo')
    }
  }
  console.log('here')
  await utils.sleep(1000)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  await axios.post('http://localhost:3001/readFile', { body: `/home/bruh/k/testdir/interactjs-lol/patterns/${drumPatternFilename}.json` })
    .then(res => {
      // console.log('here is res', res)
      return res
    })
    // .then(res => res.text())
    .then(text => {
      // console.log('here is text', text)
      // chainContinuumDrumPattern = text.data//JSON.parse(text)
      drumPatternNumbers = text.data
    })
  console.log('lel')
  console.log('drumPatternNumbers', drumPatternNumbers)
  // return ""


  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairsUnsorted = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.sortByNumber(drumSampleDurationPairsUnsorted, pair => { let string = pair[0]; return samplePlaying.drumFiles.indexOf('./' + string) })
    .slice(1) //slicing away empty string
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  let drumDensity = 1//0.8
  // console.log(chainContinuumDrumPattern)
  // console.log(drumPatternNumbers)
  // return ""
  // drumPatternNumbers = chainContinuumDrumPattern
  let drumPatternNumbersSilenced = utils.zipWith((i, r) => r < drumDensity ? i : 0, drumPatternNumbers, musicUtils.randomFloatContinuum(0.1, 999, 16, seed + 'xd'))

  //then do the combination of partitioning and departitioning
  let relativeAmounts = [0, 25, 25, 25, 25]
  let drumPartitionPattern = musicUtils.mapDrumPatternToDrumPartitions(drumPatternNumbers, relativeAmounts, seed)
  let intraPartitionFloats = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  let postPartitionDepartitionDrumPattern = musicUtils.departitionDrumPartitionPattern(drumPartitionPattern, intraPartitionFloats)
  console.log('here is post partition departition drum pattern', Math.max(...postPartitionDepartitionDrumPattern))
  console.log('here is drum pattern numbers silenced max', Math.max(...drumPatternNumbersSilenced))
  // drumPatternNumbersSilenced = postPartitionDepartitionDrumPattern
  console.log('silenceds', drumPatternNumbersSilenced)
  // return
  drumPatternNumbersSilenced = drumDoubleTempo ? drumPatternNumbersSilenced : utils.concatLists(drumPatternNumbersSilenced.map(i => [i, 0]))
  const samplePatternNumbers = drumPatternNumbersSilenced.map(i => i % sampleDurationPairs.length)

  let drillingPattern = musicUtils.randomFloatContinuum(0.05, 999, 16, seed)


  let wonkyScaleSequence = //utils.duplicate(8,
    musicUtils.generateTransitionsBetweenManyWaypointSets(
      musicUtils.randomIntContinuum(0, 99, 0.05, 99, 4, seed).map(i => musicUtils.wonkyScales[i]), 8, 0.3, seed)
  let majorAndMinorSequence = musicUtils.randomIntContinuum(0, 99, 0.05, 999, 4, seed).map(i => musicUtils.majorsAndMinorsInMajor[i])
  // console.log('here is major and minor sequence', majorAndMinorSequence)
  let melodies = utils.ap(melodyAmount)
    .map(i => musicUtils.randomIntContinuum(0, 96 + 0 * 77, 0.03, 999, 32, seed + i))
    .map(melody => melody.map((note, i) => musicUtils.snapToScale(note,
      seedRandom() < 0.98//0.9//0//0.99
        ? musicUtils.pentatonic
        : seedRandom() < 0.9//0.5
          ? wonkyScaleSequence[i % 99]
          : musicUtils.chromatic
    )))
  melodies = (
    musicUtils.generateMultiambiharmonicSequences(melodyAmount + 1, 0.1, 7777, 9, 4, 2, seed)//.map(sequence => sequence.map(freq => musicUtils.freqToInt(freq)))
    // musicUtils.generateBackbonedReambiharmonicSequences(melodyAmount, 4444, 9, 5, 2, seed, 5)
  )
  let bassline = melodies[melodyAmount]
  melodies = melodies.slice(0, melodyAmount) //leaving last melody as bassline
  console.log('melodies[0]', melodies[0])
  let melodyColumns = utils.zipLists(melodies)
  console.log(melodyColumns.slice(0, 3))
  // console.log(undefined[0])
  let melodyChoiceFloatss = utils.zipLists(utils.ap(melodyAmount).map(i => musicUtils.randomFloatContinuum(0.1, 999, 32, seed + ' ' + i)))

  let melodyString = i => './samples/squares/square' + i + '.mp3'
  // melodyString = i => './samples/ambient_sines2/ambient_sine' + i + '.mp3'
  let melodyStringColumns = melodyColumns.map(melodyColumn => melodyColumn.map(i => i == undefined || i > 96 ? './samples/silence.mp3' : melodyString(i)))
  // melodyStringColumns = utils.concatLists(melodyStringColumns.map(col => [col, []])) //dividing tempo by 2


  bassPatternNumbers = musicUtils.randomIntContinuum(0, samplePlaying.bassSamples.length * 0.5, 0.05, 999, 32, seed)
  // console.log('snapToScale', musicUtils.snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map((note, i) => musicUtils.snapToScale(note,
    seedRandom() < 0.8//0//0.99//0.9
      ? musicUtils.pentatonic
      : seedRandom() < 0.9//0.5
        ? wonkyScaleSequence[i % 99]
        : musicUtils.chromatic
  ))
  let bassSilences = musicUtils.randomFloatContinuum(0.1, 999, 32, seed)
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.5 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPatternNumbers = bassline.map((num, i) => i % 2 == 0 ? num : 0) //effectively diividing bass tempo by two
  bassPattern = bassPatternNumbers.map(i => i > samplePlaying.bassSamples[i] == undefined ? './samples/silence.mp3' : samplePlaying.bassSamples[i])
  // bassPattern = utils.concatLists(bassPattern.map(s => [s, "./samples/silence.mp3"])) //dividing tempo by 2


  // console.log(utils.ap(9).map(i => i / 9).map(utils.weird4))
  //
  //
  //                    Playing in loop
  //
  //
  //
  for (let i in samplePatternNumbers) {
    let progress = i / melodyStringColumns.length
    let melodyChoiceFloats = melodyChoiceFloatss[i]
    let base = Math.cos(progress / 99) + 2
    let probabilityOfPlaying = musicUtils.measureOfPowerOfTwo(8, base)[i % 8]
    let strings = melodyStringColumns[i]
    let melodyColumn = melodyColumns[i]
    for (let j in strings) {
      let melodyChoiceFloat = melodyChoiceFloats[j]
      let isPlaying = melodyChoiceFloat < probabilityOfPlaying
      let s = isPlaying ? strings[j] : './samples/silence.mp3'
      let freq = melodyColumn[j]
      let melodyVolume = 0.5 + 0.5 * (Math.abs(utils.weird4(progress * 4)) % 1)
      let melodyRate = 1 + (microtonalOn ? 1 : 0) * 1 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 19
      if (chordOn && isPlaying) {
        // samplePlaying.playSample(s, 15, 0, 0.075 * melodyVolume, Math.random() * 2 - 1, melodyRate)
        samplePlaying.playFreq('./samples/squares/square', freq, 15, 0, 0.075 * melodyVolume, Math.random() * 2 - 1)
      }
    }

    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    if (bassOn) {
      let bassRate = 1 + (microtonalOn ? 1 : 0) * 1 * Math.sign(seedRandom() * 2 - 1) * seedRandom() ** 19
      samplePlaying.playSample(bassString, 2, seedRandom() ** 2, 0.15, Math.sign(seedRandom() - 0.5) * seedRandom() ** 6.5, bassRate)
    }

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbersSilenced[i]]
    drumSampleDurationPair = drumSampleDurationPair == undefined ? ['./samples/silence.mp3', 0] : drumSampleDurationPair
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumPatternNumbersSilenced[i] == 99 ? './samples/silence.mp3' : drumSampleDurationPair[0]
    drumSample = drumSample == undefined ? './samples/silence.mp3' : drumSample
    // console.log('drum sample', drumSample)
    // console.log()
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(seed + i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(seed + i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    //0.0005 should be made 0.02 if want drill not to overflow, as in     let resultingSampleDuration = Math.min(drillTime / 5, /*here*/0.02 + utils.randomFloat(seed + i + 'b') * drillTime)
    let resultingSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.005 + utils.randomFloat(seed + i + 'c') * drillTime)//0.02
    let times = Math.min(22/*11*/, drillTime / resultingDrumSampleDuration) //it used to be resultingSampleDuration, which messed up this "times" for drums, leading to too many times played on drums, though now this would break sample playing similarly, but samples can be broken this way
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat(seed + 'd' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(seed + i + 'e' + j) - 0.5) * (utils.randomFloat(seed + i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (drillingPattern[i] < 0.7 || !drillOn) {
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

function testPlayFreq() {
  let freq = 452//432//32.703 * 8 * 2 ** (0.5 / 12)
  let i = musicUtils.freqToInt(freq)//16
  samplePlaying.playSample('./samples/ambient_sines2/ambient_sine' + i + '.mp3', 6, 0, 0.7, 0, freq / musicUtils.intToFreq(i))//2 ** (1 / 12))
  // samplePlaying.playSample('./samples/ambient_sines2/ambient_sine' + musicUtils.freqToInt(432) + '.mp3', 6, 0, 0.7, 0, 2 ** (0 * 2 * 0.5 / 12))
}

export default {
  playDrumPattern,
  playAmbience,
  playMelody,
  playSamplePattern,
  playSampleSong2,
  playChordSong,
  playChordySampleSong,
  testCommand,
  playChordyPartitionedSampleSong,
  playChordyPartitionedSampleSong2,
  playChordyPartitionedSampleSong3,
  playMoreChordySong,
  playAmbiharmonicSong,
  playMultiambiharmonicSong,
  testPlayFreq
}
