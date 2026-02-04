
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}
export type audioClip = {
    buffer: AudioBuffer
}


export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioStream = new MediaStream();
const audioEl = document.createElement('audio');



export function Play(clip: audioClip, {
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




// on user start called only on first user input, 
document.addEventListener("mousedown", function () {
    // makes sure the user permissions haven't paused the audio 
    audioCtx.resume();
    console.log("starting audio");
}, { once: true });


audioEl.srcObject = audioStream;
audioEl.play();

