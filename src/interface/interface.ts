import {
  DisableCanvasLock,
  Enable2DMouse,
  Disable2DMouse,
  EnableCanvasLock,
} from "../engine_core/input/DeviceMouseKeyboard";

export function setupInputHandlers() {
  document.getElementById("to2D")?.addEventListener("click", () => {
    DisableCanvasLock();
    Enable2DMouse();
  });

  document.getElementById("to3D")?.addEventListener("click", () => {
    Disable2DMouse();
    EnableCanvasLock();
  });

  const fsBtn = document.getElementById("fullscreen");
  fsBtn?.addEventListener(
    "click",
    (e) => {
      e.stopImmediatePropagation();
      // Dialog elements cannot be put into fullscreen, so use documentElement instead
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen)
        (el as any).webkitRequestFullscreen();
      else if ((el as any).msRequestFullscreen)
        (el as any).msRequestFullscreen();
    },
    true
  );

  // Mute button handler
  const muteBtn = document.getElementById("mute-button");
  muteBtn?.addEventListener("click", () => {
    const mixer = (window as any).audioMixer;
    if (mixer) {
      const isMuted = mixer.toggleMute();
      // Update button icon: f6a9 = volume-mute, f028 = volume-high
      muteBtn.innerHTML = isMuted ? "&#xf6a9;" : "&#xf028;";
    }
  });

  console.log("added external 'inputs'");
}
