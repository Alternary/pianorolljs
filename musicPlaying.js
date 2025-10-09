import utils from './utils.js'
import axios from 'axios'

function tweakGain(sendGainToSimpleGainWorklet) {
  sendGainToSimpleGainWorklet(Math.random()+0.5)
}

async function playEffect(toggleSimpleGainWorklet) {
  toggleSimpleGainWorklet()
  // await utils.sleep(1000)
  // toggleSimpleGainWorklet()
  // await utils.sleep(1000)
  // toggleSimpleGainWorklet()
  // await utils.sleep(1000)
  // toggleSimpleGainWorklet()
  // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // let oscillator = null
  // oscillator = audioContext.createOscillator()
  // oscillator.type = 'sine'
  // oscillator.frequency.setValueAtTime(420, audioContext.currentTime)
  // oscillator.connect(audioContext.destination)
  // oscillator.start()
  // oscillator.stop(audioContext.currentTime + 0.1)

  // const audioContext = new AudioContext();
  // await audioContext.audioWorklet.addModule("white-noise-processor.js");
  // const whiteNoiseNode = new AudioWorkletNode(
  //   audioContext,
  //   "white-noise-processor",
  // );
  // whiteNoiseNode.connect(audioContext.destination);
  // whiteNoiseNode.start()
}


// Create audio context
const audioContext3 = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a sample
async function playSample(samplePath, duration, offset = 0, gain = 0.1, pan = 0, rate = 1) {
  try {
    // Load audio file
    const response = await fetch(samplePath);
    const arrayBuffer = await response.arrayBuffer();

    // Decode audio data
    const audioBuffer = await audioContext3.decodeAudioData(arrayBuffer);

    // Create source node
    const source = audioContext3.createBufferSource();
    source.buffer = audioBuffer;
    // source.loop = true
    const gainNode = audioContext3.createGain();
    gainNode.gain.value = gain; // Set volume (0.0 to 1.0)
    const stereoPannerNode = audioContext3.createStereoPanner()
    // console.log('in playSample, here is sample and its pan', samplePath, pan)
    // console.log('here is its rate', rate)
    stereoPannerNode.pan.value = pan//pan || 0

    // Connect to output
    source.connect(gainNode)
    source.playbackRate.value = rate
    gainNode.connect(stereoPannerNode)
    stereoPannerNode.connect(audioContext3.destination);

    source.start(0, offset, duration);
  } catch (error) {
    console.error('Error playing sample:', samplePath, error);
  }
}

async function playSampleLoopingly(samplePath, times, duration) {
  let sleepTime = duration * 1000
  for (let i = 0; i < times; i++) {
    playSample(samplePath, duration, 0, 0.1, 0)
    await utils.sleep(sleepTime)
  }
}
async function playSampleLoopinglyAtOffset(samplePath, times, duration, offset = 0, gain = 0.1, pan = 0, rate = 1) {
  let sleepTime = duration * 1000
  for (let i = 0; i < times; i++) {
    playSample(samplePath, duration, offset, gain, pan, rate)
    await utils.sleep(sleepTime)
  }
}

let audio
let bassAudio
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
let bassSamples = Array.from(Array(80).keys())
  .map(i =>
    i == 0
      ? './samples/squares/silence.mp3'
      : './samples/squares/square'
      + i + '.mp3')
// + (
//   Math.random() < 0.3
//     ? i
//     : Math.random() < 0.5
//       ? i + 12
//       : i + 24)
// + '.mp3')
// console.log('bassSamples', bassSamples)
// console.log(bassSamples[0])
let drumPattern
let bassPattern
let skip = 0//2000
let drumPatternNumbers
let bassPatternNumbers
drumPattern = Array.from(Array(999)).map(_ => Math.floor(Math.random() * drumFiles.length)).map(i => drumFiles[i])
fetch('./drumPattern.json')
  .then(res => res.text())
  .then(text => {
    //at 2000 it's good and at 2500
    drumPattern = JSON.parse(text).slice(skip).map(i => drumFiles[i])
    console.log(drumPattern)
    drumPatternNumbers = JSON.parse(text)
  })
fetch('./bassPattern.json')
  .then(res => res.text())
  .then(text => {
    //at 2000 it's good and at 2500
    bassPattern = JSON.parse(text).slice(skip).map(i => bassSamples[i])
    console.log(bassPattern)
  })
async function playDrumPattern() {
  drumPatternNumbers = utils.cycle(utils.makeDrumBeat('seed lol', 0.9, 0.1), 99)
  console.log(drumPatternNumbers.slice(0, 32))
  drumPattern = drumPatternNumbers.map(i => drumFiles[i])
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
      playSampleLoopingly(s, times, sampleDuration)
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
async function playMelody() {
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
    // melodyAudio = new Audio(s)
    // melodyAudio.playbackRate = (1 + Math.random()) / 2
    // melodyAudio.preservesPitch = false
    // melodyAudio.volume = 0.02
    // melodyAudio.play()
    playSample(s, 15, 0, 0.04, Math.random() * 2 - 1, (1 + Math.random()) / 2)
    // await utils.sleep(baseTempo * utils.sigmoid(Math.random(), 4) * 2)
    await utils.sleep(Math.random() * 299)
  }
}

//algorithmic industrial type beat
//others' samples
async function playSamplePattern() {
  console.log('playSamplePattern() starting')
  //fetch sample names and durations
  let sampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/industrial_freesound/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let drumSampleCommandResponse = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let sampleDurationPairs = utils.groupBy(sampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  let drumSampleDurationPairs = utils.groupBy(drumSampleCommandResponse.data.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // console.log(sampleDurationPairs)
  // await utils.sleep(999999)

  const samplePatternNumbers = drumPatternNumbers.map(i => i % sampleDurationPairs.length)

  let baseTempo = 199//90//330

  bassPatternNumbers = utils.randomIntContinuum(0, bassSamples.length, 0.05, 999, 32, 'lol')
  function snapToScale(i, scale) {
    return utils.concatLists(utils.ap(9).map(octave => scale.map(i => i + octave * 12))).find(j => j >= i)
  }
  console.log('snapToScale', snapToScale(8, major))
  bassPatternNumbers = bassPatternNumbers.map(i => snapToScale(i,
    Math.random() < 0.9
      ? major
      : Math.random() < 0.5
        ? wonkyScales[i]
        : chromatic
  ))
  let bassSilences = utils.randomFloatContinuum(0.1, 999, 32, 'lol')
  bassPatternNumbers = utils.zipWith((r, i) => r < 0.3 ? 0 : i, bassSilences, bassPatternNumbers)
  bassPattern = bassPatternNumbers.map(i => bassSamples[i])

  for (let i in samplePatternNumbers) {
    // console.log(bassPatternNumbers[i])
    let bassString = bassPattern[i]
    playSample(bassString, 2, Math.random() ** 2, 0.15, Math.sign(Math.random() - 0.5) * Math.random() ** 4.5, 1 + 0.003 * Math.random() * 2)

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    let drumSampleDurationPair = drumSampleDurationPairs[drumPatternNumbers[i]]
    // console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let drumSample = drumSampleDurationPair[0]
    let sampleDuration = sampleDurationPair[1]
    let drumSampleDuration = drumSampleDurationPair[1]
    let sampleOffset = (utils.randomFloat(i)) ** 1 * sampleDuration * 0.9
    let drumSampleOffset = (utils.randomFloat(i + 'a')) ** 5 * drumSampleDuration * 0.9
    // console.log(sample)
    let drillTime = baseTempo / 1000
    let resultingSampleDuration = Math.min(drillTime / 5, 0.02 + utils.randomFloat(i + 'b') * drillTime)//0.02
    let resultingDrumSampleDuration = Math.min(drillTime / 5, 0.02 + utils.randomFloat(i + 'c') * drillTime)//0.02
    let times = drillTime / resultingSampleDuration
    let getRate = i => { let x = 0.5; return x + (1 - x) * utils.randomFloat('d' + i) * 2 }
    const getPan = j => Math.sign(utils.randomFloat(i + 'e' + j) - 0.5) * (utils.randomFloat(i + 'f' + j)) ** 9
    // console.log('here is getPan', getPan())
    if (utils.randomFloat(i + 'f') < 0.7) {
      playSample(sample, 22 * resultingSampleDuration, sampleOffset, 0.15, getPan(1), Math.random() ** 0.5)
      playSample(drumSample, 9 * resultingDrumSampleDuration, 0, 0.1, getPan(2), getRate(2))
    }
    else {
      playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, sampleOffset, 0.2, getPan(3), getRate(3))
      playSampleLoopinglyAtOffset(drumSample, times, resultingDrumSampleDuration, drumSampleOffset, 0.1, getPan(4), getRate(4))
    }
    console.log('beat')
    await utils.sleep(baseTempo)
  }
}




const audioElement = document.querySelector('audio')
console.log(audioElement)

const audioContext = new AudioContext()
const bassdrumAudio = new Audio('./samples/drums/bassdrum.mp3')
const oscillator = audioContext.createOscillator()
oscillator.type = 'sine'
oscillator.frequency.setValueAtTime(420, audioContext.currentTime)

const biquadFilter = audioContext.createBiquadFilter()
biquadFilter.type = 'lowpass'
biquadFilter.frequency.setValueAtTime(200, audioContext.currentTime + 1)
oscillator.connect(biquadFilter)

// biquadFilter.connect(audioContext.destination)
// oscillator.start() //plays oscillator
// oscillator.stop(2)

// const source = audioContext.createMediaElementSource(bassdrumAudio)
//
// source.connect()

let attackTime = 0.01//0.2;
const attackControl = document.querySelector("#attack")
attackControl.addEventListener("input", ev => {
  attackTime = parseInt(ev.target.value, 10)
})

let releaseTime = 0.1;
const releaseControl = document.querySelector("#release")
releaseControl.addEventListener("input", ev => {
  releaseTime = parseInt(ev.target.value, 10)
})

import wavetable from './wavetableSaw.json'

const wave = new PeriodicWave(audioContext, {
  real: wavetable.real, //.map(x => x / 99),
  imag: wavetable.imag //.map(x => x / 99),
})

const sweepLength = 0.4;
function playSweep(time) {
  const bassdrumAudio2 = new Audio('./samples/drums/bassdrum.mp3')
  const audioContext2 = new AudioContext()
  const osc = new OscillatorNode(audioContext2, {
    frequency: 380,
    type: "custom",
    periodicWave: wave,
  });

  const sweepEnv = new GainNode(audioContext2);
  sweepEnv.gain.cancelScheduledValues(time);
  sweepEnv.gain.setValueAtTime(0, time);
  sweepEnv.gain.linearRampToValueAtTime(0.1, time + attackTime);
  sweepEnv.gain.linearRampToValueAtTime(0, time + sweepLength - releaseTime);

  osc.connect(sweepEnv).connect(audioContext2.destination);
  osc.start(time);
  osc.stop(time + sweepLength);
}

export default {
  tweakGain,
  playEffect,
  drumFiles,
  audio,
  playDrumPattern,
  playMelody,
  playSamplePattern,
  playSampleLoopingly
}
