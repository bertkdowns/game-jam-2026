import { MultiTrackCrossfader } from "../audio/Crossfader";

export async function setupAudioSystem() {
  // Init the audio system
  const mixer = new MultiTrackCrossfader(
    [
      "/assets/audio/music/AquaticPulsations.wav",
      "/assets/audio/music/Background.wav",
      "/assets/audio/music/Borderlands.wav",
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
  (window as any).audioMixer = mixer;

  return mixer;
}
