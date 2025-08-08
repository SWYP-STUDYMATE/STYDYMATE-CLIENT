// PCM Audio Processor Worklet
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // 버퍼 설정
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // 샘플링 설정
    this.targetSampleRate = 16000;
    this.sourceSampleRate = sampleRate; // AudioContext의 샘플레이트
    this.resampleRatio = this.targetSampleRate / this.sourceSampleRate;
  }

  // Float32 샘플을 Int16으로 변환
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }
    
    return buffer;
  }

  // 리샘플링 (선형 보간)
  resample(inputBuffer, inputSampleRate, outputSampleRate) {
    if (inputSampleRate === outputSampleRate) {
      return inputBuffer;
    }
    
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(inputBuffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;
    
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < inputBuffer.length; i++) {
        accum += inputBuffer[i];
        count++;
      }
      
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    
    return result;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0]; // 모노 채널만 사용
      
      // 버퍼에 샘플 추가
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannel[i];
        
        // 버퍼가 가득 찼을 때
        if (this.bufferIndex >= this.bufferSize) {
          // 리샘플링 (44.1kHz -> 16kHz)
          const resampled = this.resample(
            this.buffer.slice(0, this.bufferIndex),
            this.sourceSampleRate,
            this.targetSampleRate
          );
          
          // PCM 변환
          const pcmData = this.floatTo16BitPCM(resampled);
          
          // 메인 스레드로 전송
          this.port.postMessage({
            audioData: pcmData,
            sampleRate: this.targetSampleRate,
            timestamp: currentTime
          });
          
          // 버퍼 리셋
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
}

// 프로세서 등록
registerProcessor('pcm-processor', PCMProcessor);