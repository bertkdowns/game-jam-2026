import { Input } from ".";
import { InputDeviceBase } from "./DeviceBase";
import { input as player1 } from "./input";
import { gamepadProfiles } from "./inputProfiles";

export const gamepads: Record<number, Gamepad> = {}; // the source of all gamepad state, is updated everyframe with the new state.

// device is per controller
export class GamepadDevice extends InputDeviceBase {
  profile: Input.DeviceProfile;
  gamepadIndex;
  constructor(gamepad: Gamepad) {
    super();
    // stores the gamepad in a dictionary
    gamepads[gamepad.index] = gamepad;
    this.gamepadIndex = gamepad.index;
    // fetches gamepad layout profile based on its name if its not using the standard mapping
    this.profile =
      gamepad.mapping != "standard" &&
        Object.keys(gamepadProfiles).includes(gamepad.id)
        ? gamepadProfiles[gamepad.id as keyof typeof gamepadProfiles]
        : gamepadProfiles["standard"];
  }

  bindProperties() {
    // looks through the buttons and axes in this gamepads profile.
    // if there is a known alias we will bind input to the alias instead (allows us to call input.shoot instead of input.r2) etc.
    // then we create the properties on the target, making their getter return the value of the button or axis it represents.

    if (this.profile.mapAxes == null)
      this.profile.mapAxes = gamepadProfiles["standard"].mapAxes;

    for (const [label, index] of Object.entries(this.profile.axes))
      Object.defineProperty(this, label, {
        enumerable: true,
        get() {
          return this.profile.mapAxes(
            label,
            gamepads[this.gamepadIndex].axes[index as number],
          );
        },
      });

    for (const [label, index] of Object.entries(this.profile.buttons))
      Object.defineProperty(this, label, {
        enumerable: true,
        get() {
          return gamepads[this.gamepadIndex].buttons[index as number].value;
        },
      });
  }
}

// connection & disconnection
window.addEventListener("gamepadconnected", (e) => {
  console.log(
    `Gamepad ${e.gamepad.id} connected at index ${e.gamepad.index}: ${e.gamepad.buttons.length} buttons, ${e.gamepad.axes.length} axes.`,
  );

  // creates a new inputDevice then binds it to its desired user
  const gamepad = new GamepadDevice(e.gamepad);
  gamepad.connect(player1);
  console.log("here");
});

window.addEventListener("gamepaddisconnected", (e) => {
  // disconnects the device then deletes its entry in gamepads

  // .disconnect();
  gamepads[e.gamepad.index];
  delete gamepads[e.gamepad.index];
});

//#region /* console button detector */
const last: Record<string, Record<string, number>> = {
  axes: {},
  buttons: {},
};

// call this function from the console to help figure out button bindings
window.detectGameadChanges = () => {
  // makes it repeat 10 times per second
  setInterval(() => navigator.getGamepads().map(detectGameadChanges), 100);
};

function detectGameadChanges(gamepad: Gamepad | null): void {
  if (gamepad == null) return;

  for (const key in gamepad.axes) {
    if (last.axes[key] != gamepad.axes[key])
      console.warn(
        `axis ${key} changed from ${last.axes[key]} to ${gamepad.axes[key]}`,
      );
    last.axes[key] = gamepad.axes[key];
  }
  for (const key in gamepad.buttons) {
    if (last.buttons[key] != gamepad.buttons[key].value)
      console.warn(
        `button ${key} changed from ${last.buttons[key]} to ${gamepad.buttons[key].value}`,
      );
    last.buttons[key] = gamepad.buttons[key].value;
  }
}
//#endregion /* console button detector */
