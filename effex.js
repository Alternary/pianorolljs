// import musicPlaying from './musicPlaying.js'
import utils from './utils.js'
import musicUtils from './musicUtils.js'
import axios from 'axios'

let effectTemplates
fetch('./lv2_datata/lv2_functioning.json')
  .then(res => res.text())
  .then(text => {
    effectTemplates = JSON.parse(text)
  })

let f = async () => {
  // ffplay -volume 22 ~/Audios/I/bassdrum.mp3 -af "lv2=p=http\\\\://au.tomatl.org/essp:c=lv2_freewheel=0"
  let effectNumber = Math.floor(Math.random() * effectTemplates.length)//11
  let drumFileNumber = Math.floor(Math.random() * musicUtils.drumFiles.length)
  console.log(drumFileNumber)
  // let sample = './samples/drums/bassdrum.mp3'
  let sample = musicUtils.drumFiles[drumFileNumber]
  let effectTemplate = effectTemplates[effectNumber]
  console.log(effectTemplate)
  let effect = effectTemplate[0]
  // console.log(effect)
  let parametrizedEffect = effectTemplate.length == 0 //if there are parameters to begin with
    ? effect
    : effect + ':c='
    + utils.intercalateStrings(effectTemplate.slice(1).map(parameter => parameter[0] + '=' + (parameter[1] + Math.random() * (parameter[2] - parameter[1]))), '|')
  let effectedSampleCreationResponse = await axios.post(
    'http://localhost:3001/shellCommand', {
    body:
      // 'ffplay -volume 100 -nodisp -autoexit ' + sample
      'ffmpeg -i ' + sample
      // + ' -af lv2=p=\"$(echo \"' + effect + '\" |sed \"s/:/\\\\\\\\\\\\\\\\\\:/\")\"'
      + ' -af lv2=p=\"$(echo \"' + parametrizedEffect + '\" |sed \"s/:/\\\\\\\\\\\\\\\\\\:/\")\",alimiter=level_in=64'
      + ' -f mp3 ' + './link_to_mytmpfs/drum' + drumFileNumber + '_' + effectNumber + '.mp3'
  })
  console.log(effectedSampleCreationResponse)
}

export default {
  f
}
