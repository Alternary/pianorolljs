import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors())

let notes = [

]

app.use(express.json())

import { execSync, exec } from 'child_process';
// const execSync = require('child_process').execSync;

app.get('/', (request, response) => {
  response.send('lol')
  const output = execSync('ls', { encoding: 'utf-8' });  // the default is 'buffer'
  console.log('Output was:\n', output);
})

app.post('/', (request, response) => {
  const output = execSync('ls', { encoding: 'utf-8' });  // the default is 'buffer'
  execSync('ffplay -autoexit -nodisp -volume 33 /home/bruh/Code/haskle/aural-calculator/samples/drums/bassdrum.mp3')
  console.log('Output was:\n', output)
  response.send('output of ls was' + output)
})

app.post('/shellCommand', (request, response) => {
  console.log('here is request', request.body.body)
  const command = request.body.body
  try {
    // execSync(command, { encoding: 'utf-8' })
    // execSync('/home/bruh/sk/test.sh', { encoding: 'utf-8' })
    const output = execSync(command, { encoding: 'utf-8' })
    console.log('123')
    console.log('here is output', output)
    response.send(output)
  }
  catch (err) {
    console.error('shell command error ' + err.toString())
  }
})

app.post('/shellCommandUnsynced', (request, response) => {
  console.log('here is request', request.body.body)
  const command = request.body.body
  try {
    exec(command, { encoding: 'utf-8' })
    response.send('done')
  }
  catch (err) {
    console.error('shell command error ' + err.toString())
  }
})

app.post('/saveFile', (request, response) => {
})

import fetch from 'file-fetch'
import fs from 'node:fs'
import eol from 'eol'

//all this just to test whether frontend can be sent large strings at once, and yes, this works
// let largeString
// fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
//   .then(res => res.text())
//   .then(text => {
//     largeString = JSON.parse(text)
//     console.log('fetched large string, which is here',largeString)
//   })

app.post('/readFile', (request, response) => {
  console.log('here is request', request.body.body)
  const filepath = request.body.body//request.data
  // const output = execSync('echo $(cat ' + filepath + ')', { encoding: 'utf-8' })
  // console.log('here is output', output)
  // fetch('file:///home/bruh/k/testdir/interactjs-lol/patterns/chainContinuumDrumPattern2.json')
  //   .then(res => res.text())
  //   .then(res => {
  //     console.log('here is res from fetch', res)
  //   })
  // response.send(output)
  // response.sendFile(filepath)
  //
  // fs.readFile('/home/bruh/sk/test.sh'/*filepath*/,'utf8', (err, data) => {
  //   if (err) {
  //     console.log('fs errored with error', err)
  //   }
  //   else {
  //     console.log('here is data', data)
  //     response.send(data)
  //   }
  // })
  // console.log(largeString, 'here is largeString')
  // response.send(largeString)
  //
  let streamOutput = ''
  const readStream = fs.createReadStream(filepath)
  // const readStream = fs.createReadStream('/home/bruh/sk/test.sh')
  readStream.on('data', function(chunk) {
    // console.log('here is streamOutput', streamOutput)
    // streamOutput += eol.auto(chunk.toString('utf8'))
    // console.log('here is chunk', chunk)
    streamOutput += chunk.toString()
  })
  readStream.on('end', function() {
    console.log('finished reading')
    // console.log('here is finished output', streamOutput)
    response.send(streamOutput)
  })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
