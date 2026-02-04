import { Input } from ".";
import { MouseKeyboardDevice } from "./DeviceMouseKeyboard";
import { gamepads } from "./DeviceGamepad";
import { InputTarget } from "./inputTarget";
import { mouse } from "./inputProfiles";





// currently configured to use 'input' as if there is only one player.
// with a bit of code you should be able to bind create and bind new controllers to new users if you wanted a multiplayer game.
export const users: InputTarget[] = [new InputTarget()];
export const [input] = users;

// adds mouse and keyboard to the main user input. 
const MKBDevice = new MouseKeyboardDevice();
MKBDevice.connect(input);

// adds mouse and keyboard device to 'input' (user 1)

export function InputUpdate() {
  // updates the gamepad values
  for (const pad of navigator.getGamepads()) {
    if (pad) gamepads[pad.index] = pad;
  }
}
export function InputLateUpdate() {
  if (document.pointerLockElement) {
    mouse.x = 0;
    mouse.y = 0;
  }
}

