import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors())

let notes = [

]

app.use(express.json())

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

app.post('/shellCommand', (request, response) => {
  console.log('here is request', request.body.body)
  const command = request.body.body
  const output = execSync(command, { encoding: 'utf-8' })
  console.log('here is output', output)
  response.send(output)
})

app.post('/saveFile', (request, response) => {
})

app.get('/readFile', (request, response) => {
  const filepath = request.data
  const output = execSync('cat ' + filepath, { encoding: 'utf-8' })
  response.send(output)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
