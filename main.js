import '@interactjs/auto-start/index.js'
import '@interactjs/actions/drag/index.js'
import '@interactjs/actions/resize/index.js'
import '@interactjs/modifiers/index.js'
import '@interactjs/dev-tools/index.js'
import interact from 'interactjs'
import axios from 'axios'
import seedrandom from 'seedrandom'
import utils from './utils.js'
import musicUtils from './musicUtils.js'
// import musicPlaying from './musicPlaying.js'
import effex from './effex.js'
import songs from './songs.js'
import songs2 from './songs2.js'
import samplePlaying from './samplePlaying.js'

class SimpleGainWorklet {
  constructor() {
    this.audioContext = null;
    this.workletNode = null;
    this.isRunning = false;

    this.initialize();
  }

  async initialize() {
    try {
      // Create audio context
      this.audioContext = new AudioContext();

      // Load and add the worklet module
      await this.audioContext.audioWorklet.addModule('simple-gain-processor.js');

      // this.setupUI();
    } catch (error) {
      console.error('Error initializing AudioWorklet:', error);
    }
  }

  /*setupUI() {
    // const startButton = document.getElementById('start');
    // const gainControl = document.getElementById('gainControl');
    // const gainValue = document.getElementById('gainValue');

    // startButton.addEventListener('click', () => this.toggleAudio());

    // gainControl.addEventListener('input', (e) => {
    //   const gain = parseFloat(e.target.value);
    //   gainValue.textContent = gain.toFixed(1);
    //
    //   if (this.workletNode) {
    //     this.workletNode.parameters.get('gain').value = gain;
    //   }
    // });
  }*/

  sendGain(gain) {
    // console.log('here is gain', gain)
    this.workletNode.parameters.get('gain').value = gain;
  }

  async toggleAudio() {
    if (!this.isRunning) {
      this.initialize() //my addition
      await this.startAudio();
    } else {
      this.stopAudio();
    }
  }

  async startAudio() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    try {
      // Get user media (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Create source from microphone
      const source = this.audioContext.createMediaStreamSource(stream);

      // Create the worklet node
      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        'simple-gain-processor'
      );

      // Set initial gain
      console.log('lol, parameters', this.workletNode.parameters.get('gain'))
      this.workletNode.parameters.get('gain').value =
        1
      // parseFloat(document.getElementById('gainControl').value);

      // Connect: source -> worklet -> destination
      source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);

      this.isRunning = true;
      // document.getElementById('start').textContent = 'Stop';

    } catch (error) {
      console.error('Error starting audio:', error);
    }
  }

  stopAudio() {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    this.isRunning = false;
    // document.getElementById('start').textContent = 'Start';
  }
}

let simpleGainWorklet
let simpleGainWorklet2
// Initialize when page loads
window.addEventListener('load', () => {
  simpleGainWorklet = new SimpleGainWorklet();
  simpleGainWorklet2 = new SimpleGainWorklet();
});

function toggleSimpleGainWorklet() {
  simpleGainWorklet.toggleAudio()
}
function sendGainToSimpleGainWorklet(gain) {
  simpleGainWorklet.sendGain(gain)
  simpleGainWorklet2.toggleAudio()
}
async function createAndPlayWorkletForTime(parameter, time) {
  let worklet = new SimpleGainWorklet()
  worklet.sendGain(parameter)
  await utils.sleep(time)
  worklet.toggleAudio()
}

/*import { app, BrowserWindow } from 'electron'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})*/



//variables
let hzoom = 1
let vzoom = 1
const baseGridWidth = 20//20
const baseGridHeight = 20//20
let gridWidth = baseGridWidth
let gridHeight = baseGridHeight
const noteTypeAmount = 96
const baseBoundingBoxWidth = 9999
const baseBoundingBoxHeight = baseGridHeight * noteTypeAmount
const basePianorollWithLeftMarginHeight = baseBoundingBoxHeight + 20
let boundingBoxHeight = baseBoundingBoxHeight



// elements
let boundingBox = document.getElementById('boundingBox')
let pianorollWithLeftMargin =
  document.getElementById('pianorollWithLeftMargin')
let pianorollView = document.getElementById('pianorollView')
let parallelPianorollScrollBarWrapper = document.getElementById('parallelPianorollScrollBarWrapper')
let parallelPianorollScrollBar = document.getElementById('parallelPianorollScrollBar')
let parallelLolScrollBarWrapper = document.getElementById('parallelLolScrollBarWrapper')
let parallelLolScrollBar = document.getElementById('parallelLolScrollBar')
let lol = document.getElementById('lol')



//initializing some heights
pianorollWithLeftMargin.style.height = basePianorollWithLeftMarginHeight + 'px'
boundingBox.style.height = boundingBoxHeight + 'px'
parallelLolScrollBar.style.height = boundingBoxHeight + 'px'



//scrolls
parallelPianorollScrollBarWrapper.addEventListener("scroll", () => {
  pianorollView.scrollLeft = parallelPianorollScrollBarWrapper.scrollLeft
})
pianorollView.addEventListener("scroll", () => {
  parallelPianorollScrollBarWrapper.scrollLeft = pianorollView.scrollLeft
})
parallelLolScrollBarWrapper.addEventListener("scroll", () => {
  lol.scrollTop = parallelLolScrollBarWrapper.scrollTop
})
lol.addEventListener("scroll", () => {
  if (vzoom != 1 && lol.scrollTop > 80) {
    lol.scrollTop = 80;
  }
  parallelLolScrollBarWrapper.scrollTop = lol.scrollTop
})



//temporal margin markers
parallelPianorollScrollBar.innerHTML = [...Array(250).keys()]
  .map(i => {
    const iString = i.toString()
    const padding = "".padEnd(4 - iString.length, '_')
    return ((i % 4 == 0) ? ('<b><i>' + iString + '</i></b>') : iString) + padding
  }).join("")



//pre_absolute_coordinates.js has the implementation pre absolute and relative coordinates
//need to halve notes because transform and style.left and style.top accumulate
let initialNotes = [
  //x, y, width
  [0, 0, 200],
  [40, 40, 200],
  [80, 80, 200],
  [120, 120, 200],
]
//notes are stored as a pairs of absolute and relative coordinates, such as [[0,0,200],[0,0,200]]
let notes = []



const interactNote = (noteNumber) => {
  // let [x, y, w] = notes[noteNumber]
  let element = document.getElementById('note' + noteNumber)
  interact(element)
    .resizable({
      margin: 7,//gridWidth / 3, //controls the resize hover radius
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: false, top: false },

      listeners: {
        move(event) {
          let note = notes[noteNumber]
          console.log('note', note)
          let [absoluteX, absoluteY, absoluteW] = note[0]
          let [relativeX, relativeY, relativeW] = note[1]
          let target = event.target
          relativeW = Math.max(baseGridWidth, Math.round(event.rect.width / baseGridWidth) * baseGridWidth)
          target.style.width = relativeW + 'px'
          relativeX += event.deltaRect.left
          relativeX = Math.round(relativeX / baseGridWidth) * baseGridWidth
          // target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
          event.target.style.left = relativeX + 'px'
          event.target.style.top = relativeY + 'px'

          //TODO calculate absolute coordinates
          absoluteX = 1
          absoluteY = 1
          absoluteW = 1
          notes[noteNumber] = [[absoluteX, absoluteY, absoluteW], [relativeX, relativeY, relativeW]]
        }
      },
      modifiers: [
        // keep the edges inside the parent
        interact.modifiers.restrictEdges({
          outer: 'parent'
        }),

        // minimum size
        interact.modifiers.restrictSize({
          min: { width: baseGridWidth / 2, height: baseGridHeight / 2 }
        }),

        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: baseGridWidth, y: baseGridHeight })
          ],
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }]
        }),
      ],

      inertia: true
    })
    .draggable({
      modifiers: [
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: baseGridWidth, y: baseGridHeight })
          ],
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }]
        }),
        interact.modifiers.restrict({
          restriction: element.parentNode,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
          endOnly: true
        })
      ],
      inertia: false
    })
    .on('dragmove', function(event) {
      let note = notes[noteNumber]
      console.log('note', note, notes)
      let [absoluteX, absoluteY, absoluteW] = note[0]
      let [relativeX, relativeY, relativeW] = note[1]
      // let [[absoluteX, absoluteY, absoluteW], [relativeX, relativeY, relativeW]] = notes[noteNumber]
      console.log('x y w', relativeX, relativeY, relativeW)
      relativeX += event.dx
      relativeX = Math.round(relativeX / baseGridWidth) * baseGridWidth
      relativeY += event.dy
      relativeY = Math.round(relativeY / baseGridHeight) * baseGridHeight
      relativeY = Math.max(-20, relativeY)

      event.target.style.left = relativeX + 'px'
      event.target.style.top = relativeY + 'px'
      // event.target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

      //TODO calculate absolute coordinates
      absoluteX = 1
      absoluteY = 1
      absoluteW = 1
      notes[noteNumber] = [[absoluteX, absoluteY, absoluteW], [relativeX, relativeY, relativeW]]
    })
}



const applyZoom = () => {
  //have to combine both zoom and transform
  // boundingBox.style.zoom = 100 * hzoom + '%'
  // boundingBox.style.transform = `scaleY(${vzoom / hzoom})`
  // leftMargin.style.transform = `scaleY(${vzoom})`
  // parallelPianorollScrollBar.style.zoom = 100 * hzoom + '%'
  // parallelPianorollScrollBar.style.transform = `scaleY(${1 / hzoom})`
  // parallelLolScrollBar.style.zoom = 100 * vzoom + '%'

  console.log('hzoom', hzoom)
  boundingBox.style.width = hzoom * baseBoundingBoxWidth + 'px'
  boundingBox.style.height = vzoom * baseBoundingBoxHeight + 'px'
  leftMargin.style.height = vzoom * baseBoundingBoxHeight + 20 + 'px'
  // leftMargin.style.height = baseBoundingBoxHeight * 2 + 'px'
  console.log('left margin height', leftMargin.style.height)
  leftMargin.style.top = '0px'
  console.log('left margin height', leftMargin.style.top)
  pianorollWithLeftMargin.style.height = basePianorollWithLeftMarginHeight * vzoom + 'px'
  parallelLolScrollBar.style.height = boundingBox.style.height
  parallelPianorollScrollBar.style.width = boundingBox.style.width

  gridWidth = baseGridWidth / hzoom
  gridHeight = baseGridHeight / vzoom
  console.log('grid width', gridWidth)
  console.log('grid height', gridHeight)

  for (const noteNumber in notes) {
    interactNote(noteNumber)
    let [[absoluteX, absoluteY, absoluteW], [relativeX, relativeY, relativeW]] = notes[noteNumber]
    let noteDisplayWidth = relativeW * hzoom
    console.log([relativeX, relativeY, relativeW, noteDisplayWidth])
    let note = document.getElementById('note' + noteNumber)
    note.style.width = Math.max(20, noteDisplayWidth) + 'px'
    // note.style.transform = `translate(${x * hzoom}px, ${y * vzoom}px)`
    // note.style.transform = 'translate(0px, 0px)'
    console.log('lol', relativeX * hzoom, relativeY * vzoom)
    note.style.left = relativeX * hzoom + 'px'
    note.style.top = relativeY * vzoom + 'px'
    //updating x, y and w directly
    notes[noteNumber][1] = [relativeX * hzoom, relativeY * vzoom, noteDisplayWidth]
    // interact(note)
    //   .on('tap', function(event) {
    //     event.preventDefault()
    //     console.log(2)
    //   })
  }
}
//have to apply initial zoom so notes are initially snapped into grid
{
  // boundingBox.style.zoom = '100%'//100 * hzoom + '%'
  boundingBox.style.transform = 'scaleX(1)'//`scaleY(${vzoom / hzoom})`
  // leftMargin.style.transform = `scaleY(${vzoom})`
  // parallelPianorollScrollBar.style.zoom = 100 * hzoom + '%'
  // parallelPianorollScrollBar.style.transform = `scaleY(${1 / hzoom})`
  // parallelLolScrollBar.style.zoom = 100 * vzoom + '%'
}



const drawNote = (noteNumber) => {
  let [[absoluteX, absoluteY, absoluteW], [relativeX, relativeY, relativeW]] = notes[noteNumber]
  let element = document.createElement('div')
  boundingBox.appendChild(element)
  element.className = 'grid-snap'
  element.id = 'note' + noteNumber
  element.style.width = relativeW + 'px'
  element.style.position = 'absolute'
  // element.style.transform = `translate(${x}px, ${y}px)`
  // element.style.transform = `translate(${0}px, ${0}px)`
  console.log('in drawNote, x y w', relativeX, relativeY, relativeW)

  // element.style.left = x + 'px'
  // element.style.top = y + 'px'
  element.style.left = '0px'
  element.style.top = '0px'

  interact(element)
    .on('tap', function(event) {
      event.preventDefault()
      axios
        .post('http://localhost:3001', 'this is an axios message')
      let [relativeX, relativeY, relativeW] = notes[noteNumber]
      console.log('here are coordinates', relativeX, relativeY, relativeW)
    })
  interactNote(noteNumber)
}
const addNote = ([x, y, w]) => {
  const noteNumber = notes.length
  notes[noteNumber] = ([[x, y, w], [x, y, w]])
  console.log('notes', notes[noteNumber], noteNumber)
  drawNote(noteNumber)
}
// for (let noteNumber in notes) {
//   drawNote(noteNumber)
//   console.log('lol', noteNumber)
// }
for (let note of initialNotes) { addNote(note) }
console.log('note0', notes[0])
applyZoom()
// /*
let boundingBox2 = document.getElementById('boundingBox2')
boundingBox2.style.height = '100px'
boundingBox2.style.width = '800px'
boundingBox2.style.backgroundColor = 'red'
let dragItem = document.getElementById('dragitem')
interact(dragItem)
  .draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      }),
      interact.modifiers.snap({
        targets: [
          interact.snappers.grid({ x: baseGridWidth, y: baseGridHeight })
        ],
        range: Infinity,
        relativePoints: [{ x: 0, y: 0 }]
      }),
    ],
    autoScroll: true,
    listeners: {
      move: dragMoveListener
    }
  })
  .on('tap', function(event) {
    event.preventDefault()
    let target = event.target
    console.log(
      target.getAttribute('data-x'),
      target.getAttribute('data-y'))
  })
function dragMoveListener(event) {
  var target = event.target

  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}
window.dragMoveListener = dragMoveListener //*/


let audio
const vzooms = [1 / 4, 1]
const hzooms = [1 / (4 * 4 * 4 * 9), 1 / (4 * 4 * 4), 1 / (4 * 4), 1 / 4, 1, 4, 4 * 4]
let instructions = document.getElementById('instructions')
instructions.innerHTML = "<b>enter adds note, a logs notes, ijkl zoom, s resets zoom, 1234567890 play samples, d plays drum pattern, g plays melody, h plays sample pattern, q plays effects, w changes q's parameter, e plays effected sample, r plays ambience, t plays sampleSong2, y plays chordSong, u plays chordy sample song, o tests command, p plays chordy partitioned sample song, å plays chordy partitioned sample song 2, z plays chordy partitioned sample song 3</b>"
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'Enter':
      addNote([140, 140, 20])
      break
    case 'a':
      console.log(notes)
      console.log(gridWidth, gridHeight)
      audio = new Audio('./bassdrum.mp3')
      audio.play()
      break
    //ijkl
    case 'l':
      hzoom = hzooms[hzooms.findIndex(z => z == hzoom) + 1] || hzoom
      applyZoom()
      break
    case 'k':
      vzoom = vzooms[vzooms.findIndex(z => z == vzoom) + 1] || vzoom
      applyZoom()
      break
    case 'j':
      hzoom = hzooms[hzooms.findIndex(z => z == hzoom) - 1] || hzoom
      applyZoom()
      break
    case 'i':
      vzoom = vzooms[vzooms.findIndex(z => z == vzoom) - 1] || vzoom
      applyZoom()
      break
    case 's':
      hzoom = 1
      vzoom = 1
      applyZoom()
      break
    case '1':
      audio = new Audio(musicUtils.drumFiles[0]); audio.volume = 0.2; audio.play(); break
    case '2':
      audio = new Audio(musicUtils.drumFiles[1]); audio.volume = 0.2; audio.play(); break
    case '3':
      audio = new Audio(musicUtils.drumFiles[2]); audio.volume = 0.2; audio.play(); break
    case '4':
      audio = new Audio(musicUtils.drumFiles[3]); audio.volume = 0.2; audio.play(); break
    case '5':
      audio = new Audio(musicUtils.drumFiles[4]); audio.volume = 0.2; audio.play(); break
    case '6':
      audio = new Audio(musicUtils.drumFiles[5]); audio.volume = 0.2; audio.play(); break
    case '7':
      audio = new Audio(musicUtils.drumFiles[6]); audio.volume = 0.2; audio.play(); break
    case '8':
      audio = new Audio(musicUtils.drumFiles[7]); audio.volume = 0.2; audio.play(); break
    case '9':
      audio = new Audio(musicUtils.drumFiles[8]); audio.volume = 0.2; audio.play(); break
    case '0':
      audio = new Audio(musicUtils.drumFiles[9]); audio.volume = 0.2; audio.play(); break
    case 'd':
      console.log(2)
      songs.playDrumPattern()
      break
    case 'f':
      break
    case 'g':
      songs.playMelody()
      break
    case 'h':
      songs.playSamplePattern()
      break
    case 'q':
      samplePlaying.playEffect(toggleSimpleGainWorklet)
      break
    case 'w':
      samplePlaying.tweakGain(sendGainToSimpleGainWorklet)
      break
    case 'e':
      effex.f()
      break
    case 'r':
      songs.playAmbience()
      break
    case 't':
      songs.playSampleSong2()
      break
    case 'y':
      songs.playChordSong()
      break
    case 'u':
      songs.playChordySampleSong()
      break
    case 'o':
      songs.testCommand()
      break
    case 'p':
      songs.playChordyPartitionedSampleSong()
      break
    case 'å':
      songs.playChordyPartitionedSampleSong2()
      break
    case 'z':
      songs.playChordyPartitionedSampleSong3()
      break
  }
})

// document.addEventListener('keyup', (event) => {
//   let drillTime = 0.3
//   let duration = 0.02
//   let times = drillTime / duration
//   if (event.key == 'f') {
//     console.log(2)
//     // playSweep(0)
//     // playSample('./samples/drums/bassdrum.mp3')
//     samplePlaying.playSampleLoopingly('./samples/drums/goodsnare.mp3', times, duration)
//     // setTimeout(() => playSample('./samples/drums/bassdrum.mp3'), 100)
//   }
// })
