import utils from './utils.js'
import musicUtils from './musicUtils.js'
import axios from 'axios'
import seedrandom from 'seedrandom'

function tweakGain(sendGainToSimpleGainWorklet) {
  sendGainToSimpleGainWorklet(Math.random() + 0.5)
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
    gainNode.gain.value = gain * 0.35; // Set volume (0.0 to 1.0)
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

function playFreq(filepath, freq, duration, offset, gain = 0.1, pan = 0) {
  let i = musicUtils.freqToInt(freq)
  if (freq < 33 || freq > 15000 || i > 96) {
    return
  }
  let rate = freq / musicUtils.intToFreq(i)
  playSample(filepath + i + '.mp3', duration, offset, gain, pan, rate)
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





//other stuff
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
  playFreq,
  drumFiles,
  bassSamples,
  audio,
  playSample,
  playSampleLoopingly,
  playSampleLoopinglyAtOffset
}
