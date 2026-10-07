export interface RecordedAudio {
  blob: Blob;
  durationSeconds: number;
}

/** Microphone audio is encoded locally as mono, PCM16 WAV at 16 kHz. */
export class WavRecorder {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private chunks: Float32Array[] = [];
  private startedAt = 0;

  async start(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      throw new Error(
        "Trình duyệt này chưa hỗ trợ ghi âm. Hãy dùng Chrome hoặc Edge qua HTTPS.",
      );
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      this.context = new AudioContext();
      await this.context.resume();
      this.source = this.context.createMediaStreamSource(this.stream);
      this.processor = this.context.createScriptProcessor(4096, 1, 1);
      this.processor.onaudioprocess = (event) => {
        this.chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
        event.outputBuffer.getChannelData(0).fill(0);
      };
      this.source.connect(this.processor);
      this.processor.connect(this.context.destination);
      this.startedAt = Date.now();
    } catch (error) {
      this.cancel();
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        throw new Error(
          "Chưa được cấp quyền microphone. Cho phép microphone trong trình duyệt hoặc nhập bản chép lời bên dưới.",
        );
      }
      throw error;
    }
  }

  stop(): RecordedAudio {
    const sampleRate = this.context?.sampleRate ?? 48000;
    const durationSeconds = Math.max(0, (Date.now() - this.startedAt) / 1000);
    const chunks = this.chunks;
    this.cancel();
    const sampleCount = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    if (!sampleCount)
      throw new Error("Chưa thu được âm thanh. Hãy thử ghi âm lại.");
    const samples = new Float32Array(sampleCount);
    let cursor = 0;
    for (const chunk of chunks) {
      samples.set(chunk, cursor);
      cursor += chunk.length;
    }
    return {
      blob: encodeWav(resample(samples, sampleRate, 16000)),
      durationSeconds,
    };
  }

  cancel(): void {
    if (this.processor) this.processor.onaudioprocess = null;
    this.source?.disconnect();
    this.processor?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    if (this.context && this.context.state !== "closed")
      void this.context.close().catch(() => undefined);
    this.context = null;
    this.stream = null;
    this.source = null;
    this.processor = null;
    this.chunks = [];
  }
}

function resample(
  input: Float32Array,
  inputRate: number,
  targetRate: number,
): Float32Array {
  if (inputRate === targetRate) return input;
  const ratio = inputRate / targetRate;
  const output = new Float32Array(Math.floor(input.length / ratio));
  for (let index = 0; index < output.length; index += 1) {
    const start = index * ratio;
    const end = Math.min(input.length, (index + 1) * ratio);
    let sum = 0;
    let weight = 0;
    for (
      let position = Math.floor(start);
      position < Math.ceil(end);
      position += 1
    ) {
      const overlap = Math.max(
        0,
        Math.min(end, position + 1) - Math.max(start, position),
      );
      sum += input[position] * overlap;
      weight += overlap;
    }
    output[index] = weight ? sum / weight : 0;
  }
  return output;
}

function encodeWav(samples: Float32Array): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1)
      view.setUint8(offset + index, value.charCodeAt(index));
  };
  write(0, "RIFF");
  view.setUint32(4, buffer.byteLength - 8, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 16000, true);
  view.setUint32(28, 32000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(
      44 + index * 2,
      sample < 0 ? sample * 32768 : sample * 32767,
      true,
    );
  }
  return new Blob([buffer], { type: "audio/wav" });
}
