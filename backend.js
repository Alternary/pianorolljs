import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors())

let notes = [
  ""
]

import { execSync } from 'child_process';
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
