import axios from 'axios'
import utils from './utils.js'
import musicUtils from './musicUtils.js'
import samplePlaying from './samplePlaying.js'

async function sampler() {
  let getMilliseconds = () => (new Date()).getTime()
  let startMilliseconds = getMilliseconds()
  let loopLength = 16
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
  // setInterval(() => samplePlaying.playSample('./samples/drums/snare6.mp3', 1, 0, 0.2, 0, 1), tempo)
  console.log('in sampler')
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
  let samples = utils.ap(96 + 1).map(i => melodySampleTemplate + i + '.mp3').concat(utils.ap(100 - (96 + 1)).map(i => '_')).concat(samplePlaying.drumFiles) //into this list place drum sample names and such at their respective indices, such as 101 for bassdrum
  document.getElementById('sampler_instructions').innerHTML = '. shows recordingList(s), - toggles recordOn, , toggles metronome, / undoes recordingLists, * redoes recordingLists, Escape reloads, Numpad7 doubles loopLength, Numpad9 halves loopLength, Numpad1 decrements loopStart, Numpad3 increments loopStart, ArrowLeft decrements melodyNoteStart, ArrowRight increments melodyNoteStart, n saves recordingList, m loads recordingList'
  document.addEventListener('keydown', (event) => {
    event.preventDefault()

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
    if (event.key == '.') {
      // console.log('recording list', recordingLis
      console.log('recordingLists', recordingLists)
      console.log('current recording list', recordingLists[currentRecordingListsIndex])
    }
    else if (event.key == '-') {
      recordOn = !recordOn
      console.log(recordOn)
    }
    else if (event.key == ',') {
      metronomeOn = !metronomeOn
      console.log(metronomeOn)
    }
    else if (event.key == '/') {
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
    else if (event.key == 'Clear'/*Numpad5*/) {
      console.log('todo, no functionality yet')
    }
    else if (event.key == 'ArrowLeft') {
      melodyNoteStart = Math.max(0, melodyNoteStart - 1)
      console.log('decrementing melodyNoteStart, melodyNoteStart now', melodyNoteStart)
    }
    else if (event.key == 'ArrowRight') {
      melodyNoteStart = Math.min(96 - keyMinorNoteIndexPairs[keyMinorNoteIndexPairs.length - 1][1], melodyNoteStart + 1)
      console.log('incrementing melodyNoteStart, melodyNoteStart now', melodyNoteStart)
    }
    else if (event.key == 'n') {
      //save recordingList
      let filename = prompt('type file name')
      // console.log('filename', filename)
      axios.post('http://localhost:3001/saveFile', { body: ['/home/bruh/k/testdir/interactjs-lol/recordingLists/' + filename, JSON.stringify(recordingLists[currentRecordingListsIndex])] })
    }
    else if (event.key == 'm') {
      //load recordingList
      let filename = prompt('type file name')
      axios.post('http://localhost:3001/readFile', { body: '/home/bruh/k/testdir/interactjs-lol/recordingLists/' + filename })
        .then(response => {
          // console.log('response data', response.data)
          currentRecordingListsIndex += 1
          recordingLists[currentRecordingListsIndex] = response.data
        })
    }
    else if (keySampleIndexTriple == undefined) {
      console.log('event.key', event.key)
      //nothing
    }
    else {
      let sample = keySampleIndexTriple[1]
      // console.log(samples)
      // return
      let noteNumber = keyNoteNumberPairs.find(p => p[0] == event.key)[1]
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
        let previousRecordingList = recordingLists[currentRecordingListsIndex]
        let newRecordingList = structuredClone(previousRecordingList)
        // console.log(newRecordingList)
        // newRecordingList[beat].push(i)
        newRecordingList[beat].push(noteNumber)
        //pop past future lists in recordingLists
        for (let j in utils.range(currentRecordingListsIndex + 1, recordingLists.length - 1)) {
          recordingLists.pop()
        }
        setTimeout(() => { recordingLists.push(newRecordingList); currentRecordingListsIndex += 1 }, tempo)
        // console.log('recordingLists', recordingLists)
      }
    }
  })
  for (let i of utils.ap(99999)) {
    let keyMajorNoteSampleNameIndexTriples = keyMajorNoteIndexPairs.map(pair => { let key = pair[0]; let i = melodyNoteStart + pair[1]; return [key, melodySampleTemplate + i + '.mp3', i] })
    let keyMinorNoteSampleNameIndexTriples = keyMinorNoteIndexPairs.map(pair => { let key = pair[0]; let i = melodyNoteStart + pair[1]; return [key, melodySampleTemplate + i + '.mp3', i] })
    let keySampleIndexTriples = (majorOn ? keyMajorNoteSampleNameIndexTriples : keyMinorNoteSampleNameIndexTriples).concat(keyDrumSampleNameIndexTriples)

    let currentMillisecondsModified = (Math.round((getMilliseconds() - startMilliseconds) / tempo) * tempo) % (tempo * loopLength)
    let beat = currentMillisecondsModified / tempo

    if (metronomeOn) {
      if (beat == 0) {
        samplePlaying.playSample('./samples/drums/bassdrum4.mp3', 1, 0, 0.2, 0, 1)
      }
      samplePlaying.playSample('./samples/drums/snare6.mp3', 1, 0, 0.2, 0, 1)
      if (beat == 8) {
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
  }
}

export default {
  sampler
}
