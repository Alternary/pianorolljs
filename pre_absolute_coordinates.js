//need to halve notes because transform and style.left and style.top accumulate
let initialNotes = [
  //x, y, width
  [0, 0, 200],
  [20, 20, 200],
  [40, 40, 200],
  [60, 60, 200],
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
          let [x, y, w] = notes[noteNumber]
          let target = event.target
          w = Math.max(baseGridWidth, Math.round(event.rect.width / baseGridWidth) * baseGridWidth)
          target.style.width = w + 'px'
          x += event.deltaRect.left
          x = Math.round(x / baseGridWidth) * baseGridWidth
          // target.style.transform = 'translate(' + x + 'px,' + y + 'px)'
          event.target.style.left = x + 'px'
          event.target.style.top = y + 'px'
          notes[noteNumber] = [x, y, w]
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
      let [x, y, w] = notes[noteNumber]
      console.log('x y w', x, y, w)
      // let w = event.target.style.width || 20
      x += event.dx
      x = Math.round(x / baseGridWidth) * baseGridWidth
      y += event.dy
      y = Math.round(y / baseGridHeight) * baseGridHeight
      y = Math.max(-20, y)

      event.target.style.left = x + 'px'
      event.target.style.top = y + 'px'
      // event.target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

      notes[noteNumber] = [x, y, w]
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
    let [x, y, w] = notes[noteNumber]
    let noteDisplayWidth = w * hzoom
    console.log([x, y, w, noteDisplayWidth])
    let note = document.getElementById('note' + noteNumber)
    note.style.width = Math.max(20, noteDisplayWidth) + 'px'
    // note.style.transform = `translate(${x * hzoom}px, ${y * vzoom}px)`
    // note.style.transform = 'translate(0px, 0px)'
    console.log('lol', x * hzoom, y * vzoom)
    note.style.left = x * hzoom + 'px'
    note.style.top = y * vzoom + 'px'
    //updating x, y and w directly
    notes[noteNumber] = [x * hzoom, y * vzoom, noteDisplayWidth]
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
  let [x, y, w] = notes[noteNumber]
  let element = document.createElement('div')
  boundingBox.appendChild(element)
  element.className = 'grid-snap'
  element.id = 'note' + noteNumber
  element.style.width = w + 'px'
  element.style.position = 'absolute'
  // element.style.transform = `translate(${x}px, ${y}px)`
  // element.style.transform = `translate(${0}px, ${0}px)`
  console.log('in drawNote, x y w', x, y, w)

  // element.style.left = x + 'px'
  // element.style.top = y + 'px'
  element.style.left = '0px'
  element.style.top = '0px'


  interact(element)
    .on('tap', function(event) {
      event.preventDefault()
      axios
        .post('http://localhost:3001', 'this is an axios message')
      let [x, y, w] = notes[noteNumber]
      console.log('here are coordinates', x, y, w)
    })
  interactNote(noteNumber)
}
const addNote = ([x, y, w]) => {
  notes.push([[x, y, w],[x, y, w]])
  const noteNumber = notes.length - 1
  drawNote(noteNumber)
}
// for (let noteNumber in notes) {
//   drawNote(noteNumber)
//   console.log('lol', noteNumber)
// }
for (let note of initialNotes) { addNote(note) }
applyZoom()
