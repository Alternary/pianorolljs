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
  // Plotly.newPlot('plotlyDiv', data)
}

const arithmeticProgression = n => n < 0 ? [] : Array.from(Array(n)).map((x, i) => i)
const ap = arithmeticProgression

function plotBetween(f, start, end, xAmount, xLogarithmic = false, yLogarithmic = false) {
  let xs = ap(xAmount).map(i => i / (xAmount == 0 ? 1 : xAmount - 1) * (end - start) + start)
  plot(f, xs)
}

export default {
  plot,
  plotBetween
}
