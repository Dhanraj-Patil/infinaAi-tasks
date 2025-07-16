const context = new AudioContext();
let micBuffer, sysBuffer;

async function loadBuffer(url) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return context.decodeAudioData(arrayBuffer);
}

async function start() {
    micBuffer = await loadBuffer('Recording.wav');
    sysBuffer = await loadBuffer('nf-no-name-ceenaijacom_KCHD2nqB.wav');

    await context.audioWorklet.addModule('echo-canceller-processor.js');

    const micSource = context.createBufferSource();
    micSource.buffer = micBuffer;

    const sysSource = context.createBufferSource();
    sysSource.buffer = sysBuffer;

    const echoCanceller = new AudioWorkletNode(context, 'echo-canceller', {
        numberOfInputs: 2,
        numberOfOutputs: 1,
        channelCount: 1,
    });

    micSource.connect(echoCanceller, 0, 0);
    sysSource.connect(echoCanceller, 0, 1);

    echoCanceller.connect(context.destination);

    micSource.start();
    sysSource.start();
}

document.getElementById('start').onclick = start;
