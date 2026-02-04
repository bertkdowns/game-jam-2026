import { MultiTrackCrossfader } from "./Crossfader";

var audiosystem: MultiTrackCrossfader;

export async function setupAudioSystem() {
  // Init the audio system
  const mixer = new MultiTrackCrossfader(
    [
      "assets/audio/music/Borderlands.wav",
      "assets/audio/music/Background.wav",
      "assets/audio/music/AquaticPulsations.wav",
    ],
    { loop: true, defaultFadeSec: 1.5 }
  );

  await mixer.load();

  const audioButtons = document.querySelectorAll(".audio-button");
  audioButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      mixer.play();
      console.log(`Fading to ${index}`);
      mixer.fadeTo(index, 5);
    });
  });

  // Store mixer globally for mute button access
  window.audioMixer = mixer;
  audiosystem = mixer;
  return mixer;
}



const handleFirstInteraction = () => {
  audiosystem.play();
  console.log("first interaction, starting music!");
};

// Add event listeners for various interactions
window.addEventListener('click', handleFirstInteraction, { once: true });
window.addEventListener('keydown', handleFirstInteraction, { once: true });
window.addEventListener('touchstart', handleFirstInteraction, { once: true });



declare global {
  interface Window {
    audioMixer: MultiTrackCrossfader;
  }
}