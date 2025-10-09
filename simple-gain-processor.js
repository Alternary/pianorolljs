let lol = 0
function f(t) {
  return ((Math.sin(t * 0.07) + Math.sin(t * 0.06)) * (2 + Math.sin(t * 0.0002)) / 3 * 0.1) % 0.2
}

class SimpleGainProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: 'gain',
      defaultValue: 1.0,
      minValue: Number.MIN_SAFE_INTEGER,
      maxValue: Number.MAX_SAFE_INTEGER,
      automationRate: 'a-rate',
    }];
  }

  process(inputs, outputs, parameters) {
    lol++
    // console.log('lol', lol)
    const input = inputs[0];
    const output = outputs[0];
    const gain = parameters.gain;

    // Process each channel
    // console.log('lol', input.length)
    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      // Apply gain to each sample
      // console.log('lol', inputChannel.length)
      for (let i = 0; i < inputChannel.length; i++) {
        // Use the gain value (could be constant or changing over time)
        // const currentGain = gain.length > 1 ? gain[i] : gain[0];
        // outputChannel[i] = inputChannel[i] * currentGain;
        let x = (i + lol * 128)
        if (lol > 999 && lol < 1001) {
          // console.log('x', x)
        }
        outputChannel[i] = f(x * gain) // * inputChannel[i] * currentGain * 3;
      }
    }

    return true; // Keep processor alive
  }
}

registerProcessor('simple-gain-processor', SimpleGainProcessor);
