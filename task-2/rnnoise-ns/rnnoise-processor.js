import createRNNWasmModuleSync from './rnnoise-sync.js';

class RNNoiseProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.processor = new createRNNWasmModuleSync()
        this.nodeSampleRate = 128;
        this.denoisedSampleSize = 480;
        this.circularBufferLength = 1920; //is lcm of 128 and 480
        this.circulearBuffer = new Float32Array(this.circularBufferLength);
        this.inputBufferLength = 0;
        this.denoisedBufferLength = 0;
        this.denoisedBufferIndx = 0;
        this.wasmPcmInput = this.processor._malloc(1920);
        this.wasmPcmInputF32Index = this.wasmPcmInput >> 2;
        this.context = this.processor._rnnoise_create();
        this.SHIFT_16_BIT_NR = 32768;
        this.suppression = false
    }

    process(inputs, outputs) {
        let inData = inputs[0][0];
        let outData = outputs[0][0];

        if (!inData) {
            return true;
        }

        this.circulearBuffer.set(inData, this.inputBufferLength);
        this.inputBufferLength += inData.length;

        for (; this.denoisedBufferLength + this.denoisedSampleSize <= this.inputBufferLength; this.denoisedBufferLength += this.denoisedSampleSize) {
            const denoiseFrame = this.circulearBuffer.subarray(
                this.denoisedBufferLength,
                this.denoisedBufferLength + this.denoisedSampleSize
            );

            // Convert input to 16-bit PCM float view
            for (let i = 0; i < this.denoisedSampleSize; i++) {
                this.processor.HEAPF32[this.wasmPcmInputF32Index + i] = denoiseFrame[i] * this.SHIFT_16_BIT_NR;
            }

            const voiceProb = this.processor._rnnoise_process_frame(this.context, this.wasmPcmInput, this.wasmPcmInput);

            for (let i = 0; i < this.denoisedSampleSize; i++) {
                let val = this.processor.HEAPF32[this.wasmPcmInputF32Index + i] / this.SHIFT_16_BIT_NR;

                if (voiceProb < 0.1) {
                    val *= 0.05;
                } else if (voiceProb < 0.4) {
                    val *= 0.3;
                } else if (voiceProb < 0.7) {
                    val *= 0.6;
                }

                denoiseFrame[i] = val;
            }
        }

        let unsentDenoisedDataLength;
        if (this.denoisedBufferIndx > this.denoisedBufferLength) {
            unsentDenoisedDataLength = this.circularBufferLength - this.denoisedBufferIndx;
        } else {
            unsentDenoisedDataLength = this.denoisedBufferLength - this.denoisedBufferIndx;
        }

        if (unsentDenoisedDataLength >= outData.length) {
            const outputFrame = this.circulearBuffer.subarray(
                this.denoisedBufferIndx,
                this.denoisedBufferIndx + outData.length
            );
            outData.set(outputFrame, 0);
            this.denoisedBufferIndx += outData.length;
        }

        if (this.denoisedBufferIndx === this.circularBufferLength) {
            this.denoisedBufferIndx = 0;
        }

        if (this.inputBufferLength === this.circularBufferLength) {
            this.inputBufferLength = 0;
            this.denoisedBufferLength = 0;
        }

        return true;
    }

}

registerProcessor('rnnoise-processor', RNNoiseProcessor)
