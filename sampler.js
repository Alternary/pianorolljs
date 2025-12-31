import axios from 'axios'
import utils from './utils.js'
import musicUtils from './musicUtils.js'
import samplePlaying from './samplePlaying.js'

async function sampler() {
  let getMilliseconds = () => (new Date()).getTime()
  let startMilliseconds = getMilliseconds()
  let loopLength = 32//8//16//32
  let tempo = 155
  let emptyRecordingList = utils.ap(loopLength).map(_ => [])
  let recordingList = utils.ap(loopLength).map(_ => [])
  let recordingLists = [structuredClone(emptyRecordingList)]
  let currentRecordingListsIndex = 0
  let majorOn = false
  let recordOn = false
  let metronomeOn = false
  let backingTrackOn = true
  let loopStart = 0
  let melodyNoteStart = 36
  let melodyNoteSkip = 0
  let loggingOn = true//false
  let selectionX = 0
  let selectionY = 0
  let temporalMarkerPosition = 0
  let playbackStopped = false
  let shiftDown = false
  let controlDown = false
  let guiPianorollUpdateInterval = 20//20//20
  function sortRecordingList() {
    recordingLists[currentRecordingListsIndex] = recordingLists[currentRecordingListsIndex].map(col => utils.sortByNumber(col, x => x).filter(x => !isNaN(x)))
  }
  function addNote(noteNumber, beat) {
    // console.log('note number', noteNumber, 'typeof note number', typeof noteNumber)
    let previousRecordingList = recordingLists[currentRecordingListsIndex]
    let newRecordingList = structuredClone(previousRecordingList)
    console.log('adding note', noteNumber, 'on beat', beat)
    newRecordingList[beat].push(noteNumber)
    // setTimeout(() => sortRecordingList(), tempo * 0)
    // setTimeout(() => sortRecordingList(), tempo * 1)
    // setTimeout(() => sortRecordingList(), tempo * 2)
    // setTimeout(() => sortRecordingList(), tempo * 3)
    setTimeout(() => { recordingLists.push(newRecordingList); currentRecordingListsIndex += 1 }, tempo * 0)
    //pop past future lists in recordingLists
    for (let j in utils.range(currentRecordingListsIndex + 0, recordingLists.length - 1)) {
      recordingLists.pop()
    }
  }
  function deleteNote(noteNumber, beat) {
    let previousRecordingList = recordingLists[currentRecordingListsIndex]
    let newRecordingList = structuredClone(previousRecordingList)
    newRecordingList[beat] = newRecordingList[beat].filter(n => n != noteNumber)
    sortRecordingList()
    setTimeout(() => { recordingLists.push(newRecordingList); currentRecordingListsIndex += 1 }, tempo * 0)
    //pop past future lists in recordingLists
    for (let j in utils.range(currentRecordingListsIndex + 0, recordingLists.length - 1)) {
      recordingLists.pop()
    }
    // setTimeout(() => sortRecordingList(), tempo * 0)
    // setTimeout(() => sortRecordingList(), tempo * 1)
    // setTimeout(() => sortRecordingList(), tempo * 2)
    // setTimeout(() => sortRecordingList(), tempo * 3)
  }
  function noteInSelection() {
    return recordingLists[currentRecordingListsIndex][selectionX][selectionY]
  }
  // setInterval(() => samplePlaying.playSample('./samples/drums/snare6.mp3', 1, 0, 0.2, 0, 1), tempo)
  console.log('in sampler')
  let squareSamples = utils.ap(96 + 1).map(i => './samples/squares/square' + i + '.mp3')
  let harmonicBassSamples = utils.ap(60 + 1).map(i => './samples/harmonicBasses/harmonicBass' + i + '.mp3')
  let reverb2Samples = utils.ap(96 + 1).map(i => './samples/reverbs2/reverb' + i + '.mp3')
  let melodySampleTemplate = './samples/'
    + 'squares/square'
  let keyDrumNotePairs = [
    ['a', 1],
    ['s', 2],
    ['d', 3],
    ['f', 4],
    ['g', 5],
    ['h', 6],
    ['j', 7],
    ['k', 8],
    ['l', 9],
    ['ö', 10],
    ['ä', 11],
    ['\'', 12],
  ]
  let keyDrumSampleNameIndexTriples = keyDrumNotePairs.map(pair => { let key = pair[0]; let i = pair[1]; let drumSampleName = samplePlaying.drumFiles[i]; return [key, drumSampleName, 100 + i] })
  let keyMajorNoteIndexPairs = [
    ['Tab', 0],
    ['1', 1],
    ['q', 2],
    ['2', 3],
    ['w', 4],
    ['e', 5],
    ['4', 6],
    ['r', 7],
    ['5', 8],
    ['t', 9],
    ['6', 10],
    ['y', 11],
    ['u', 12],
    ['8', 13],
    ['i', 14],
    ['9', 15],
    ['o', 16],
    ['p', 17],
    ['+', 18],
    ['å', 19],
    ['Dead', 20],
    ['Dead', 21],
    ['Backspace', 22],
    ['Enter', 23],
    ['Process', 23],
    ['Delete', 24],
  ]
  let keyMinorNoteIndexPairs = [
    ['Tab', 0],
    ['1', 1],
    ['q', 2],
    ['w', 3],
    ['3', 4],
    ['e', 5],
    ['4', 6],
    ['r', 7],
    ['t', 8],
    ['6', 9],
    ['y', 10],
    ['7', 11],
    ['u', 12],
    ['8', 13],
    ['i', 14],
    ['o', 15],
    ['0', 16],
    ['p', 17],
    ['+', 18],
    ['å', 19],
    ['Dead', 20],
    ['Backspace', 21],
    ['Enter', 22],
    ['Process', 22],
    ['Insert', 23],
    ['Delete', 24],
  ]
  let samples = utils.padRight(utils.padRight(squareSamples.concat(utils.ap(100 - (96 + 1)).map(i => '_')).concat(samplePlaying.drumFiles), 200, '_').concat(harmonicBassSamples), 300, '_').concat(reverb2Samples) //into this list place drum sample names and such at their respective indices, such as 101 for bassdrum
  document.getElementById('sampler_instructions').innerHTML = 'sampler instructions: ; shows recordingList(s), Alt toggles recordOn, _ toggles metronome, / undoes recordingLists, * redoes recordingLists, Escape reloads, Numpad7 doubles loopLength, Numpad9 halves loopLength, Numpad1 decrements loopStart, Numpad3 increments loopStart, z decrements melodyNoteStart, x increments melodyNoteStart, n saves recordingList, m loads recordingList, c changes melodySampleTemplate to square, v changes melodySampleTemplate to harmonicBass, changes melodySampleTemplate to reverbs2, Numpad5 toggles loggingOn, arrow keys move selection, , decrements note, . increments note, CapsLock plays note, < duplicates note, - adds note, : deletes note, space bar pauses and plays, shift plus arrow keys move temporalMarkerPosition, shift and control plus arrow keys move temporalMarkerPosition faster'

  document.addEventListener('keyup', (event) => {
    if (event.key == 'Shift') {
      shiftDown = false
    }
    if (event.key == 'Control') {
      controlDown = false
    }
  })

  document.addEventListener('keydown', (event) => {
    event.preventDefault()
    // let samples = utils.ap(96 + 1).map(i => melodySampleTemplate + i + '.mp3').concat(utils.ap(100 - (96 + 1)).map(i => '_')).concat(samplePlaying.drumFiles) //into this list place drum sample names and such at their respective indices, such as 101 for bassdrum

    let keyNoteNumberPairs = (majorOn ? keyMajorNoteIndexPairs : keyMinorNoteIndexPairs).map(p => [p[0], p[1] + melodyNoteStart]).concat(keyDrumNotePairs.map(p => [p[0], p[1] + 100]))

    let keyMajorNoteSampleNameIndexTriples = keyMajorNoteIndexPairs.map(pair => { let key = pair[0]; let i = melodyNoteStart + pair[1]; return [key, melodySampleTemplate + i + '.mp3', i] })
    let keyMinorNoteSampleNameIndexTriples = keyMinorNoteIndexPairs.map(pair => { let key = pair[0]; let i = melodyNoteStart + pair[1]; return [key, melodySampleTemplate + i + '.mp3', i] })
    // let keySampleIndexTriples = (majorOn ? keyMajorNoteSampleNameIndexTriples : keyMinorNoteSampleNameIndexTriples).concat(keyDrumSampleNameIndexTriples)
    let keySampleIndexTriples = (majorOn ? keyMajorNoteSampleNameIndexTriples : keyMinorNoteSampleNameIndexTriples).concat(keyDrumSampleNameIndexTriples)

    let currentMillisecondsModified = (Math.round((getMilliseconds() - startMilliseconds) / tempo) * tempo) % (tempo * loopLength)
    let beat = currentMillisecondsModified / tempo
    // console.log('current milliseconds modified', currentMillisecondsModified)
    console.log('beat', beat)
    // console.log(event.key)
    let keySampleIndexTriple = keySampleIndexTriples.find(p => p[0] == event.key)

    if (event.key == '/') {
      /*recordingLists.pop()
      if (recordingLists.length == 0) {
        recordingLists = [structuredClone(emptyRecordingList)]
      }*/
      currentRecordingListsIndex = Math.max(0, currentRecordingListsIndex - 1)
      // console.log(recordingLists, recordingLists.length, emptyRecordingList)
      console.log('undoing, current recording lists index now', currentRecordingListsIndex)
    }
    else if (event.key == '*') {
      currentRecordingListsIndex = Math.min(recordingLists.length - 1, currentRecordingListsIndex + 1)
      console.log('redoing, current recording lists index now', currentRecordingListsIndex)
    }
    else if (event.key == 'Escape') {
      location.reload()
    }
    else if (event.key == 'Home') {
      // loopLength = Math.ceil(loopLength * 2)
      console.log('todo doubling loopLength, loopLength now', loopLength)
    }
    else if (event.key == 'PageUp') {
      // loopLength = Math.ceil(loopLength / 2)
      console.log('todo halving loopLength, loopLength now', loopLength)
    }
    else if (event.key == 'End') {
      loopStart = Math.max(0, loopStart - 1)
      console.log('decrementing loopStart, loopStart now', loopStart)
    }
    else if (event.key == 'PageDown') {
      loopStart = loopStart + 1
      console.log('incrementing loopStart, loopStart now', loopStart)
    }

    /*if (pianorollEditOn) {
      if (event.key == '<') {
        pianorollEditOn = false
      }
      else if (event.key == 'ArrowLeft') {
        selectionX = Math.max(0, selectionX - 1)
      }
      else if (event.key == 'ArrowRight') {
        selectionX = Math.min(loopLength - 1, selectionX + 1)
      }
      else if (event.key == 'ArrowUp') {
        selectionY = Math.max(0, selectionY - 1)
      }
      else if (event.key == 'ArrowDown') {
        let currentRecordingList = structuredClone(recordingLists[currentRecordingListsIndex].map(col => utils.sortByNumber(col, x => x)))
        let mostNotesInCols = currentRecordingList.reduce((total, col) => Math.max(total, col.length), 0)
        selectionY = Math.min(mostNotesInCols - 1, selectionY + 1)
      }
      else if (event.key == 'w') {
        //increments note
      }
      else if (event.key == 's') {
        //decrements note
      }
      else if (event.key == 'a') {
        //adds note
      }
      else if (event.key == 'd') {
        //deletes note
      }
      else if (event.key == 'x') {
        //plays note
      }
    }

    if (event.key == '<') {
      pianorollEditOn = true
      loggingOn = true
    }*/ if (false) { }
    else if (event.key == 'ArrowLeft') {
      if (shiftDown) {
        temporalMarkerPosition = Math.max(0, temporalMarkerPosition - (controlDown ? 4 : 1))
      }
      else {
        selectionX = Math.max(0, selectionX - 1)
        console.log('note in selection', noteInSelection())
        let noteNumber = noteInSelection()
        let sample = samples[noteNumber]
        if (sample != undefined) {
          samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
        }
      }
    }
    else if (event.key == 'ArrowRight') {
      if ('shiftDown', shiftDown) {
        temporalMarkerPosition = Math.min(temporalMarkerPosition + (controlDown ? 4 : 1), loopLength - 1)
      }
      else {
        selectionX = Math.min(loopLength - 1, selectionX + 1)
        console.log('note in selection', noteInSelection())
        let noteNumber = noteInSelection()
        let sample = samples[noteNumber]
        if (sample != undefined) {
          samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
        }
      }
    }
    else if (event.key == 'ArrowUp') {
      selectionY = Math.max(0, selectionY - 1)
      console.log('note in selection', noteInSelection())
      let noteNumber = noteInSelection()
      let sample = samples[noteNumber]
      if (sample != undefined) {
        samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      }
    }
    else if (event.key == 'ArrowDown') {
      let currentRecordingList = structuredClone(recordingLists[currentRecordingListsIndex] //.map(col => utils.sortByNumber(col, x => x))
      )
      let mostNotesInCols = currentRecordingList.reduce((total, col) => Math.max(total, col.length), 0)
      selectionY = Math.min(mostNotesInCols - 1, selectionY + 1)
      console.log('note in selection', noteInSelection())
      let noteNumber = noteInSelection()
      let sample = samples[noteNumber]
      if (sample != undefined) {
        samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      }
    }
    else if (event.key == ';') {
      // console.log('recording list', recordingLis
      console.log('recordingLists', recordingLists)
      console.log('current recording list', recordingLists[currentRecordingListsIndex])
      let currentRecordingList = structuredClone(recordingLists[currentRecordingListsIndex].map(col => utils.sortByNumber(col, x => x)))
      console.log(currentRecordingList)
      console.log('current recordingLists index', currentRecordingListsIndex)
      let mostNotesInCols = currentRecordingList.reduce((total, col) => Math.max(total, col.length), 0)
      // console.log('most notes in cols', mostNotesInCols)
      // return
      let currentRecordingRows = utils.zipLists(currentRecordingList.map(col => utils.padRight(col.map(s => ('00' + s).substr((s + '').length - 1, 3)), mostNotesInCols, '..-')))
      console.log(currentRecordingRows)
      for (let row of currentRecordingRows) {
        let rowString = ''
        for (let s of row) {
          rowString += s + ' '
        }
        console.log(rowString)
      }
    }
    else if (event.key == 'AltGraph') {
      recordOn = !recordOn
      console.log(recordOn)
    }
    else if (event.key == '_') {
      metronomeOn = !metronomeOn
      console.log(metronomeOn)
    }
    else if (event.key == 'Clear') {
      loggingOn = !loggingOn
    }
    else if (event.key == 'n') {
      //save recordingList
      playbackStopped = true
      // console.log('filename', filename)
      axios.post('http://localhost:3001/shellCommand', { body: 'ls /home/bruh/k/testdir/interactjs-lol/recordingLists/' })
        .then(response => {
          console.log('saved recordingLists\n' + String(response.data).replaceAll('\n', ' '))

          let filename = prompt('type file name')

          axios.post('http://localhost:3001/saveFile', { body: ['/home/bruh/k/testdir/interactjs-lol/recordingLists/' + filename, JSON.stringify(recordingLists[currentRecordingListsIndex])] })
          playbackStopped = false
        })
    }
    else if (event.key == 'm') {
      //load recordingList
      let filename
      playbackStopped = true
      axios.post('http://localhost:3001/shellCommand', { body: 'ls /home/bruh/k/testdir/interactjs-lol/recordingLists/' })
        .then(response => {
          console.log('saved recordingLists\n' + String(response.data).replaceAll('\n', ' '))

          filename = prompt('type file name')
          axios.post('http://localhost:3001/readFile', { body: '/home/bruh/k/testdir/interactjs-lol/recordingLists/' + filename })
            .then(response => {
              // console.log('response data', response.data)
              currentRecordingListsIndex += 1
              recordingLists[currentRecordingListsIndex] = utils.cycle(response.data, Math.ceil(loopLength / response.data.length))
              playbackStopped = false
            })

        })
      sortRecordingList()
    }
    else if (event.key == 'c') {
      melodyNoteSkip = 0
      melodySampleTemplate = './samples/' + 'squares/square'
    }
    else if (event.key == 'v') {
      melodyNoteSkip = 200
      melodySampleTemplate = './samples/' + 'harmonicBasses/harmonicBass'
    }
    else if (event.key == 'b') {
      melodyNoteSkip = 300
      melodySampleTemplate = './samples/' + 'reverbs2/reverb'
    }
    else if (event.key == 'z') {
      melodyNoteStart = Math.max(0, melodyNoteStart - 1)
      console.log('decrementing melodyNoteStart, melodyNoteStart now', melodyNoteStart)
    }
    else if (event.key == 'x') {
      melodyNoteStart = Math.min(96 - keyMinorNoteIndexPairs[keyMinorNoteIndexPairs.length - 1][1], melodyNoteStart + 1)
      console.log('incrementing melodyNoteStart, melodyNoteStart now', melodyNoteStart)
    }
    else if (event.key == ',') {
      //decrement note
      let noteNumber = noteInSelection()
      deleteNote(noteNumber, selectionX)
      setTimeout(() => addNote(noteNumber - 1, selectionX), tempo * 1 * 0)
      let sample = samples[noteNumber - 1]
      if (sample != undefined) {
        samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      }
    }
    else if (event.key == '.') {
      //increment note
      let noteNumber = noteInSelection()
      deleteNote(noteNumber, selectionX)
      setTimeout(() => addNote(noteNumber + 1, selectionX), tempo * 1 * 0)
      let sample = samples[noteNumber + 1]
      if (sample != undefined) {
        samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      }
    }
    else if (event.key == 'CapsLock') {
      //play note
      let noteNumber = noteInSelection()
      let sample = samples[noteNumber]
      if (sample != undefined) {
        samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      }
      console.log('note in selection', noteNumber, 'type of note in selection', typeof noteNumber)
    }
    else if (event.key == '<') {
      let noteNumber = noteInSelection()
      selectionX = Math.min(loopLength - 1, selectionX + 1)
      addNote(noteNumber, selectionX)
    }
    else if (event.key == '-') {
      //add note
      playbackStopped = true
      // // await guiPianorollUpdateInterval
      let noteNumber = Number(prompt('note number'))
      playbackStopped = false
      addNote(noteNumber, selectionX)
      let sample = samples[noteNumber]
      samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
    }
    else if (event.key == ':') {
      //delete note
      deleteNote(noteInSelection(), selectionX)
    }
    else if (event.key == 'Shift') {
      shiftDown = true
    }
    else if (event.key == 'Control') {
      controlDown = true
    }
    else if (event.key == ' ') {
      playbackStopped = !playbackStopped
    }
    else if (keySampleIndexTriple == undefined) {
      console.log('event.key', event.key)
      //nothing
    }
    else {
      // let sample = keySampleIndexTriple[1]
      let sample
      // console.log(samples)
      // return
      let noteNumber = keyNoteNumberPairs.find(p => p[0] == event.key)[1]
      if (noteNumber >= 100) {
        //don't add melodyNoteSkip
      }
      else {
        //add melodyNoteSkip
        noteNumber = melodyNoteSkip + noteNumber
      }
      sample = samples[noteNumber]
      console.log('note number', noteNumber)
      let i = keySampleIndexTriple[2]
      // console.log('here is sample', sample)
      samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      if (recordOn) {
        /*now the timing is correct but there is the problem that if I press a note just before a beat, at that next beat it already knows that note is saved and plays, so it plays the note twice in a row
        what I could do is asynchronously push the note into the recordingList*/
        // setTimeout(() => { recordingList[beat].push(i) }, tempo)
        // console.log('recordingLists', recordingLists)
        /*let previousRecordingList = recordingLists[currentRecordingListsIndex]
        let newRecordingList = structuredClone(previousRecordingList)
        // console.log(newRecordingList)
        // newRecordingList[beat].push(i)
        newRecordingList[beat].push(noteNumber)
        sortRecordingList()
        //pop past future lists in recordingLists
        for (let j in utils.range(currentRecordingListsIndex + 1, recordingLists.length - 1)) {
          recordingLists.pop()
        }
        setTimeout(() => { recordingLists.push(newRecordingList); currentRecordingListsIndex += 1 }, tempo)
        // console.log('recordingLists', recordingLists)
        */
        //caused trouble when timing out with a nonzero time
        // setTimeout(() => addNote(noteNumber, beat), tempo * 0)
        // if in pause mode, recording records on the selection
        setTimeout(() => addNote(noteNumber, playbackStopped ? selectionX : temporalMarkerPosition), tempo * 0)
      }
    }
  })

  let drawGuiPianoroll = () => {
    let currentRecordingList = structuredClone(recordingLists[currentRecordingListsIndex]//.map(col => utils.sortByNumber(col, x => x))
    )
    let mostNotesInCols = currentRecordingList.reduce((total, col) => Math.max(total, col.length), 0)
    let currentRecordingRows = utils.zipLists(currentRecordingList.map(col => utils.padRight(col.map(s => ('00' + s).substr((s + '').length - 1, 3)), mostNotesInCols, '..-')))
    if (loggingOn) {
      let markerRow = ''
      for (let j of utils.ap(loopLength)) {
        markerRow += j == temporalMarkerPosition ? '||| ' : (j == 8 || j == 4 || j == 12 || j == 16 || j == 20 || j == 24 || j == 28 ? '|.. ' : '..- ')
      }
      let recordingListElement = document.getElementById('recordingListElement')
      let recordingListString = ''
      recordingListString += markerRow
      // console.log(markerRow)
      for (let rowNum in currentRecordingRows) {
        let row = currentRecordingRows[rowNum]
        if (rowNum == selectionY) {
          let selectionRowString = ''
          for (let j of utils.ap(loopLength)) {
            selectionRowString += j == selectionX ? '||| ' : '..- '
          }
          recordingListString += '<br>' + selectionRowString
        }
        let rowString = ''
        for (let s of row) {
          rowString += s + ' '
        }
        // console.log(rowString)
        recordingListString += '<br>' + rowString
      }
      // console.log(markerRow)
      recordingListString += '<br>' + markerRow
      recordingListElement.innerHTML = recordingListString
    }
  }

  let beatsPlayedSinceStart = 0
  while (true) {
    drawGuiPianoroll()

    let millisecondsFromStart = getMilliseconds() - startMilliseconds
    let expectedTimeElapsed = beatsPlayedSinceStart * tempo
    //if I haven't played enough beats since start, play a beat
    let expectedBeatsPlayedSinceStart = millisecondsFromStart / tempo
    if (!playbackStopped && (millisecondsFromStart - expectedTimeElapsed <= guiPianorollUpdateInterval && millisecondsFromStart >= expectedTimeElapsed || beatsPlayedSinceStart < expectedBeatsPlayedSinceStart)) {
      if (metronomeOn) {
        if (temporalMarkerPosition == 0 || temporalMarkerPosition == 16) {
          samplePlaying.playSample('./samples/drums/bassdrum4.mp3', 1, 0, 0.2, 0, 1)
        }
        samplePlaying.playSample('./samples/drums/snare6.mp3', 1, 0, 0.2, 0, 1)
        if (temporalMarkerPosition == 8 || temporalMarkerPosition == 16 + 8) {
          samplePlaying.playSample('./samples/drums/erans19.mp3', 1, 0, 0.2, 0, 1)
        }
      }
      for (let j of recordingLists[currentRecordingListsIndex][temporalMarkerPosition]) {
        let sample = samples[j]
        samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
      }

      await utils.sleep(expectedTimeElapsed + guiPianorollUpdateInterval - millisecondsFromStart)
      temporalMarkerPosition = (temporalMarkerPosition + 1) % loopLength
      beatsPlayedSinceStart += 1
      console.log('played beat')
    }
    else {
      // console.log('expected time elapsed', expectedTimeElapsed)
      // console.log('milliseconds from start', millisecondsFromStart)
      if (playbackStopped) {
        // console.log('stopped')
        startMilliseconds = getMilliseconds()
        beatsPlayedSinceStart = 0
      }
      await utils.sleep(guiPianorollUpdateInterval)
    }
  }

  //old pianoroll loop code
  let i = -1
  while (false) {
    i++
    // for (let i of utils.ap(99999)) {
    // for (let i0 of utils.ap(99999)) {
    //   let i = Math.floor(i0 / 4)

    // let samples = utils.ap(96 + 1).map(i => melodySampleTemplate + i + '.mp3').concat(utils.ap(100 - (96 + 1)).map(i => '_')).concat(samplePlaying.drumFiles) //into this list place drum sample names and such at their respective indices, such as 101 for bassdrum

    // let keyMajorNoteSampleNameIndexTriples = keyMajorNoteIndexPairs.map(pair => { let key = pair[0]; let i = melodyNoteStart + pair[1]; return [key, melodySampleTemplate + i + '.mp3', i] })
    // let keyMinorNoteSampleNameIndexTriples = keyMinorNoteIndexPairs.map(pair => { let key = pair[0]; let i = melodyNoteStart + pair[1]; return [key, melodySampleTemplate + i + '.mp3', i] })
    // let keySampleIndexTriples = (majorOn ? keyMajorNoteSampleNameIndexTriples : keyMinorNoteSampleNameIndexTriples).concat(keyDrumSampleNameIndexTriples)

    let currentMillisecondsModified = (Math.round((getMilliseconds() - startMilliseconds) / tempo) * tempo) % (tempo * loopLength)
    let beat = currentMillisecondsModified / tempo

    let currentRecordingList = structuredClone(recordingLists[currentRecordingListsIndex]//.map(col => utils.sortByNumber(col, x => x))
    )
    let mostNotesInCols = currentRecordingList.reduce((total, col) => Math.max(total, col.length), 0)
    let currentRecordingRows = utils.zipLists(currentRecordingList.map(col => utils.padRight(col.map(s => ('00' + s).substr((s + '').length - 1, 3)), mostNotesInCols, '..-')))
    if (loggingOn) {
      // if (i % 22 == 0) {
      //   console.clear()
      // }
      let markerRow = ''
      for (let j of utils.ap(loopLength)) {
        markerRow += j == (i % loopLength) ? '||| ' : (j == 8 || j == 4 || j == 12 || j == 16 || j == 20 || j == 24 || j == 28 ? '|.. ' : '..- ')
      }
      // console.log(utils.ap(i % loopLength).map(j => '..-') + '|||,' + utils.ap(loopLength - i % loopLength - 1).map(j => '..-'))
      let recordingListElement = document.getElementById('recordingListElement')
      let recordingListString = ''
      recordingListString += markerRow
      // console.log(markerRow)
      for (let rowNum in currentRecordingRows) {
        let row = currentRecordingRows[rowNum]
        if (rowNum == selectionY) {
          let selectionRowString = ''
          for (let j of utils.ap(loopLength)) {
            selectionRowString += j == selectionX ? '||| ' : '..- '
          }
          recordingListString += '<br>' + selectionRowString
        }
        let rowString = ''
        for (let s of row) {
          rowString += s + ' '
        }
        // console.log(rowString)
        recordingListString += '<br>' + rowString
      }
      // console.log(markerRow)
      recordingListString += '<br>' + markerRow
      recordingListElement.innerHTML = recordingListString
    }

    if (metronomeOn) {
      if (beat == 0 || beat == 16) {
        samplePlaying.playSample('./samples/drums/bassdrum4.mp3', 1, 0, 0.2, 0, 1)
      }
      samplePlaying.playSample('./samples/drums/snare6.mp3', 1, 0, 0.2, 0, 1)
      if (beat == 8 || beat == 16 + 8) {
        samplePlaying.playSample('./samples/drums/erans19.mp3', 1, 0, 0.2, 0, 1)
      }
    }
    // for (let j of recordingList[beat]) {
    // console.log('current recordingLists index', currentRecordingListsIndex)
    // console.log(recordingLists.length)
    for (let j of recordingLists[currentRecordingListsIndex][beat]) {
      // let sample = keySampleIndexTriples.find(triple => triple[2] == j)[1]
      let sample = samples[j]
      samplePlaying.playSample(sample, 1, 0, 0.2, 0, 1)
    }
    let millisecondsFromStart = getMilliseconds() - startMilliseconds
    let expectedTimeElapsed = i * tempo
    await utils.sleep(expectedTimeElapsed + tempo - millisecondsFromStart)

    //waiting until playbackStopped becomes false
    while (playbackStopped) {
      startMilliseconds = getMilliseconds()
      await utils.sleep(20)
    }
  }
}

export default {
  sampler
}
