import utils from './utils.js'
import axios from 'axios'
import seedrandom from 'seedrandom'
// import { AudioContext, OscillatorNode, GainNode } from 'node-web-audio-api'
import fetch from 'file-fetch'//'node-fetch'//'file-fetch'
// import webAudioApi from 'web-audio-api'
import webAudioApi from 'web-audio-api'
import Speaker from 'speaker'
import fs from 'fs'
let AudioContext = webAudioApi.AudioContext
let AudioBuffer = webAudioApi.AudioBuffer

//tried node-web-audio-api, it used alsa and produced drivel, web-audio-api seems to be old and didn't seem to produce audio on my system


// var AudioContext = webAudioApi.AudioContext
//   , context = new AudioContext
//
// context.outStream = (
//   //process.stdout
//   ///*
//   new Speaker({
//     channels: context.format.numberOfChannels,
//     bitDepth: context.format.bitDepth,
//     sampleRate: context.sampleRate
//   }) //*/
// )
const audioContext3 = (
  // context
  new AudioContext()
)
let audioContext = audioContext3
const speaker = new Speaker({
  channels: 2,
  bitDepth: 16,
  sampleRate: 44100
})
audioContext3.outStream = speaker
audioContext.outStream = speaker
function playSineWave(frequency = 440, duration = 2) {
  // Create oscillator node
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Configure oscillator
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  // Configure gain (volume)
  gainNode.gain.value = 0.1; // 10% volume

  // Connect nodes: oscillator → gain → destination
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Start and stop the oscillator
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}
// Start the audio context and play sound
// playSineWave(440, 2); // Play A4 for 2 seconds

function playAudioFile(filePath) {
  // Read the audio file
  const audioData = fs.readFileSync(filePath);

  // Decode the audio data
  audioContext.decodeAudioData(audioData, (buffer) => {
    // Create buffer source
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Connect to output
    source.connect(audioContext.destination);

    // Start playback
    source.start();

    console.log(`Playing audio file: ${filePath}`);
    console.log(`Duration: ${buffer.duration} seconds`);

    // When playback ends
    source.onended = () => {
      console.log('Playback finished');
      // audioContext.close(); // Uncomment to close context when done
    };
  }, (error) => {
    console.error('Error decoding audio:', error);
  });
}
playAudioFile('./samples/bassdrum.mp3')

// Handle errors
speaker.on('error', (err) => {
  console.error('Speaker error:', err);
});

// setInterval(() => {
//   const now = audioContext.currentTime
//   const frequency = 200 + Math.random() * 2800
//
//   const env = new webAudioApi.GainNode(audioContext, { gain: 0 })
//   env.connect(audioContext.destination)
//   env.gain
//     .setValueAtTime(0, now)
//     .linearRampToValueAtTime(0.2, now + 0.02)
//     .exponentialRampToValueAtTime(0.0001, now + 1)
//
//   const osc = new webAudioApi.OscillatorNode(audioContext, { frequency })
//   osc.connect(env)
//   osc.start(now)
//   osc.stop(now + 1)
// }, 80)

async function playSample(samplePath, duration, offset = 0, gain = 0.1, pan = 0, rate = 1) {
  try {
    // Load audio file
    const response = await fetch(samplePath);
    console.log('here is response', response)
    // const arrayBuffer = await response.arrayBuffer();

    // Decode audio data
    // const audioBuffer = await audioContext3.decodeAudioData(arrayBuffer);

    // Create source node
    const source = audioContext3.createBufferSource();
    // source.buffer = audioBuffer;
    // source.loop = true
    const gainNode = audioContext3.createGain();
    gainNode.gain.value = gain * 0.35; // Set volume (0.0 to 1.0)
    // const stereoPannerNode = audioContext3.createStereoPanner()
    // console.log('in playSample, here is sample and its pan', samplePath, pan)
    // console.log('here is its rate', rate)
    // stereoPannerNode.pan.value = pan//pan || 0

    // Connect to output
    source.connect(gainNode)
    source.playbackRate.value = rate
    gainNode.connect(audioContext3.destination)
    // gainNode.connect(stereoPannerNode)
    // stereoPannerNode.connect(audioContext3.destination);

    source.start(0, offset, duration);
  } catch (error) {
    console.error('Error playing sample:', samplePath, error);
  }
}

// playSample('file:///home/bruh/b/5__auralcalculator/samples/drums/bassdrum.mp3', 1, 0, 0.1, 0, 1)
// playSample('./samples/drums/bassdrum.mp3', 1, 0, 0.1, 0, 1)
// playSample('http://127.0.0.1:8080/samples/drums/bassdrum.mp3', 1, 0, 0.1, 0, 1)

export default {
  playSample,
}
