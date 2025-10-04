import '@interactjs/auto-start/index.js'
import '@interactjs/actions/drag/index.js'
import '@interactjs/actions/resize/index.js'
import '@interactjs/modifiers/index.js'
import '@interactjs/dev-tools/index.js'
import interact from 'interactjs'
import axios from 'axios'
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



//utils
const arithmeticProgression = n => Array.from(Array(n)).map((x, i) => i)
const chooseRandom = l => l[Math.floor(Math.random() * l.length)]
const sigmoid = (x, steepness) =>
  1 / (1 + Math.exp(- 4 * steepness * (x - 0.5)))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
const groupBy = (l, num) => {
  let sublists = []
  let currentSublist = []
  for (let i in l) {
    currentSublist.push(l[i])
    if (i % num == num - 1) {
      sublists.push(currentSublist)
      currentSublist = []
    }
  }
  sublists.push(currentSublist)
  return sublists
}




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



// Create audio context
const audioContext3 = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a sample
async function playSample(samplePath, duration, offset) {
  try {
    // Load audio file
    const response = await fetch(samplePath);
    const arrayBuffer = await response.arrayBuffer();

    // Decode audio data
    const audioBuffer = await audioContext3.decodeAudioData(arrayBuffer);

    // Create source node
    const source = audioContext3.createBufferSource();
    const gainNode = audioContext3.createGain();
    source.buffer = audioBuffer;
    // source.loop = true
    gainNode.gain.value = 0.1; // Set volume (0.0 to 1.0)

    // Connect to output
    source.connect(gainNode)
    gainNode.connect(audioContext3.destination);

    // Play the sample
    source.start(0, offset, duration);

  } catch (error) {
    console.error('Error playing sample:', error);
  }
}

async function playSampleLoopingly(samplePath, times, duration) {
  let sleepTime = duration * 1000
  for (let i = 0; i < times; i++) {
    playSample(samplePath, duration, 0)
    await sleep(sleepTime)
  }
}
async function playSampleLoopinglyAtOffset(samplePath, times, duration, offset) {
  let sleepTime = duration * 1000
  for (let i = 0; i < times; i++) {
    playSample(samplePath, duration, offset)
    await sleep(sleepTime)
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
let bassSamples = Array.from(Array(96).keys())
  .map(i =>
    i == 0
      ? './samples/squares/silence.mp3'
      : './samples/squares/square'
      + (
        Math.random() < 0.3
          ? i
          : Math.random() < 0.5
            ? i + 12
            : i + 24)
      + '.mp3')
console.log(bassSamples[0])
let drumPattern
let bassPattern
let skip = 0//2000
let drumPatternNumbers
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
    if (Math.random() < 0.7) {
      audio.play()
    }
    else {
      playSampleLoopingly(s, times, sampleDuration)
    }
    // console.log(bassString)
    let bassString = bassPattern[i]
    bassAudio = new Audio(bassString)
    bassAudio.volume = 0.1
    bassAudio.play()
    // await sleep(90)//70)
    // 1... 3... .2.. 3...
    // 1... 3... 3... 3...   .2.. 3... 3... 3...
    let swing = 0//0.3
    // console.log(s)
    let swingMilliseconds = baseTempo * swing
    if (i % 4 == 1) {
      await sleep(baseTempo + swingMilliseconds)
    }
    else if (i % 4 == 2) {
      await sleep(baseTempo - swingMilliseconds)
    }
    else {
      await sleep(baseTempo)
    }
  }
}

let major = [0, 2, 4, 5, 7, 9, 11]
// let wonkyScale = [0, 3, 4, 6, 8, 9, 10]
let wonkyScales = arithmeticProgression(999).map(i => {
  let wonkyScale = arithmeticProgression(22)
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
  let melodyPattern = arithmeticProgression(9999)
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
      const note = minNote + (chooseRandom(scale) + 12 * octave) % noteIntervalLength
      // return Math.floor(minNote + Math.random() * noteIntervalLength)
      return note
    })
  // melodyPattern = randomNumbers.map(i => minNote + i % noteIntervalLength)
  let melodyStrings = melodyPattern
    // .map(i => './samples/reverbs/reverb' + i + '.mp3')
    .map(i => './samples/ambient_sines/ambient_sine' + i + '.mp3')
  for (let i in melodyStrings) {
    let s = melodyStrings[i]
    melodyAudio = new Audio(s)
    melodyAudio.playbackRate = (1 + Math.random()) / 2
    melodyAudio.preservesPitch = false
    melodyAudio.volume = 0.02
    melodyAudio.play()
    // await sleep(baseTempo * sigmoid(Math.random(), 4) * 2)
    await sleep(Math.random() * 299)
  }
}

//others' samples
async function playSamplePattern() {
  //fetch sample names and durations
  //gets durations in the form 00:00:01.50
  //for i in samples/industrial/* ; do echo $i ; ffprobe -i $i 2>&1 |grep -o "Duration: .*, start" |grep -o "[0-9].*[0-9]" ; done
  // let response = await axios.post('http://localhost:3001/shellCommand', { body: "eval \"for i in samples/industrial/* ; do echo $i ; ffprobe -i $i 2>&1 |grep -o 'Duration: .*, start' |grep -o '[0-9].*[0-9]' ; done\"" })
  // let response = await axios.post('http://localhost:3001/shellCommand', { body: "for i in samples/drums/* ; ffprobe -i $i ; done" })
  // let response = await axios.post('http://localhost:3001/shellCommand', { body: "echo $(ffprobe -i bassdrum.mp3) |grep Duration" })
  // let response = await axios.post('http://localhost:3001/shellCommand', { body: "ffprobe bassdrum.mp3 2>&1 |grep Duration" }) //this works
  // let response = await axios.post('http://localhost:3001/shellCommand', { body: "echo |grep 2" }) //it fails due to grep returning a zero success status indicating failure
  // let response = await axios.post('http://localhost:3001/shellCommand', { body: "for i in samples/drums/* ; do echo $i ; mediainfo $i |grep Duration |tail -1 |grep -o [0-9]* ; done" }) //doesn't work
  let response = await axios.post('http://localhost:3001/shellCommand', { body: 'for i in samples/drums/*.mp3 ; do echo $i ; mediainfo $i --Inform="Audio;%Duration%" ; done' }) //does work???
  let responseData = response.data
  let sampleDurationPairs = groupBy(responseData.split('\n'), 2).map(pair => [pair[0], pair[1] / 1000])
  // console.log(sampleDurationPairs)

  const samplePatternNumbers = drumPatternNumbers.map(i => i % sampleDurationPairs.length)

  for (let i in samplePatternNumbers) {
    let baseTempo = 330//330

    let bassString = bassPattern[i]
    bassAudio = new Audio(bassString)
    bassAudio.volume = 0.05
    bassAudio.play()
    await sleep(0)

    let sampleDurationPair = sampleDurationPairs[samplePatternNumbers[i]]
    console.log(sampleDurationPair)
    let sample = sampleDurationPair[0]
    let sampleDuration = sampleDurationPair[1]
    let offset = (Math.random()) ** 2.5 * sampleDuration * 0.9
    console.log(sample)
    let drillTime = baseTempo / 1000
    let resultingSampleDuration = Math.min(drillTime / 5, 0.02 + Math.random() * drillTime)//0.02
    let times = drillTime / resultingSampleDuration
    if (Math.random() < 0.7) {
      playSample(sample, resultingSampleDuration, offset)
    }
    else {
      playSampleLoopinglyAtOffset(sample, times, resultingSampleDuration, offset)
    }
    await sleep(baseTempo)
  }
}

const vzooms = [1 / 4, 1]
const hzooms = [1 / (4 * 4 * 4 * 9), 1 / (4 * 4 * 4), 1 / (4 * 4), 1 / 4, 1, 4, 4 * 4]
let instructions = document.getElementById('instructions')
instructions.innerHTML = '<b>enter adds note, a logs notes, ijkl zoom, s resets zoom, 1234567890 play samples, d plays drum pattern, g plays melody, h plays general samples</b>'
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
      audio = new Audio(drumFiles[0]); audio.volume = 0.2; audio.play(); break
    case '2':
      audio = new Audio(drumFiles[1]); audio.volume = 0.2; audio.play(); break
    case '3':
      audio = new Audio(drumFiles[2]); audio.volume = 0.2; audio.play(); break
    case '4':
      audio = new Audio(drumFiles[3]); audio.volume = 0.2; audio.play(); break
    case '5':
      audio = new Audio(drumFiles[4]); audio.volume = 0.2; audio.play(); break
    case '6':
      audio = new Audio(drumFiles[5]); audio.volume = 0.2; audio.play(); break
    case '7':
      audio = new Audio(drumFiles[6]); audio.volume = 0.2; audio.play(); break
    case '8':
      audio = new Audio(drumFiles[7]); audio.volume = 0.2; audio.play(); break
    case '9':
      audio = new Audio(drumFiles[8]); audio.volume = 0.2; audio.play(); break
    case '0':
      audio = new Audio(drumFiles[9]); audio.volume = 0.2; audio.play(); break
    case 'd':
      console.log(2)
      playDrumPattern()
      break
    case 'f':
      break
    case 'g':
      playMelody()
      break
    case 'h':
      playSamplePattern()
      break
  }
})

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


document.addEventListener('keyup', (event) => {
  let drillTime = 0.3
  let duration = 0.02
  let times = drillTime / duration
  if (event.key == 'f') {
    console.log(2)
    // playSweep(0)
    // playSample('./samples/drums/bassdrum.mp3')
    playSampleLoopingly('./samples/drums/goodsnare.mp3', times, duration)
    // setTimeout(() => playSample('./samples/drums/bassdrum.mp3'), 100)
  }
})

//what I want is to loop a trimmed audio file for drilling sound
//trimming might be possible via an adsr envelope
