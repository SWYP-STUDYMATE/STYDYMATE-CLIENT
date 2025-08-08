class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const channelData = input[0];
      // Float32( -1..1 ) -> 16-bit PCM
      const buffer = new ArrayBuffer(channelData.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < channelData.length; i++) {
        let s = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
      this.port.postMessage({ audioData: buffer });
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
