import Plotly from 'plotly.js-dist'
import { create, all } from 'mathjs'
const math = create(all)

function plot(f, xs) {
  let data = [{ x: xs, y: xs.map(x => f(x)), mode: 'lines' }]
  Plotly.newPlot('plotlyDiv', data)
}
{
  let xValues = math.range(-10, 10, 0.5).toArray()
  let yValues = xValues.map(x => Math.sin(x))
  let data = [{
    x: xValues,
    y: yValues,
    //type: 'scatter'
    mode: 'lines'
  }]
  Plotly.newPlot('plotlyDiv', data)
}

export default {
  plot
}
