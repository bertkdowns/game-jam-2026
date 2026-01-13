
export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioStream = new MediaStream();
const audioEl = document.createElement('audio');


function InitAudio() {
    audioEl.srcObject = audioStream;
    audioEl.play();
}
InitAudio();


export function Play(clip, {
    delay = 0,        // seconds from now
    offset = 0,      // seconds into buffer
    volume = 1,
    pitch = 1        // 1 = normal
}) {

    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();

    source.buffer = clip.buffer;
    source.playbackRate.value = pitch;
    gain.gain.value = volume;

    source.connect(gain).connect(audioCtx.destination);
    source.start(audioCtx.currentTime + delay, offset);
}