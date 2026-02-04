import { InputDeviceBase } from "./DeviceBase";
import { keysPressed, mouse } from "./inputProfiles";
import { Input } from ".";

// to add new button/action

export class MouseKeyboardDevice extends InputDeviceBase {
  bindProperties() {
    // looks through the buttons and axes in this gamepads profile.
    // if there is a known alias we will bind input to the alias instead (allows us to call input.shoot instead of input.r2) etc.
    // then we create the properties on the target, making their getter return the value of the button or axis it represents.
    for (const label of Object.keys(this.profile.axes))
      Object.defineProperty(this, label, {
        get() {
          return this.profile.axes[label]();
        },
      });

    for (const label of Object.keys(this.profile.buttons))
      Object.defineProperty(this, label, {
        get() {
          return this.profile.buttons[label]();
        },
      });
  }

  // allows the mapping of inputs to this
  profile: Input.DeviceProfile = {
    axes: {
      lHorizontal: () =>
        (keysPressed.ArrowRight || keysPressed.KeyD) -
        (keysPressed.ArrowLeft || keysPressed.KeyA),
      lVertical: () =>
        (keysPressed.ArrowDown || keysPressed.KeyS) -
        (keysPressed.ArrowUp || keysPressed.KeyW),
      rHorizontal: () => 0,
      rVertical: () => 0,
      mouseX: () => mouse.x,
      mouseY: () => mouse.y,
    },
    buttons: {
      KeyE: () => keysPressed.KeyE,
    },
  };
}

// ====  MOUSE INPUT   ====
const allCanvas = document.querySelectorAll("canvas");

export const Enable2DMouse = () =>
  allCanvas.forEach((canvas) =>
    canvas.addEventListener("mousemove", HandleUnlockedMouse),
  );
export const Disable2DMouse = () =>
  allCanvas.forEach((canvas) =>
    canvas.removeEventListener("mousemove", HandleUnlockedMouse),
  );
Enable2DMouse();

export const EnableCanvasLock = () =>
  allCanvas.forEach((canvas) => {
    canvas.addEventListener("click", () => canvas.requestPointerLock());
    document.addEventListener("mousemove", HandleLockedMouse);
    mouse.x = 0;
    mouse.y = 0;
    window.using3D = true;
  });

export const DisableCanvasLock = () =>
  allCanvas.forEach((canvas) => {
    canvas.removeEventListener("click", () => canvas.requestPointerLock());
    document.removeEventListener("mousemove", HandleLockedMouse);
    mouse.x = 0;
    mouse.y = 0;
    window.using3D = false;
  });

function HandleLockedMouse(e: MouseEvent) {
  const canvas = e.target;
  //console.log(canvas);

  if (document.pointerLockElement === canvas) {
    mouse.x = e.movementX;
    mouse.y = e.movementY;
  }
}
function HandleUnlockedMouse(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;
  //console.log(canvas);

  if (document.pointerLockElement) return;
  const rect = canvas.getBoundingClientRect();

  const canvasAspect = canvas.width / canvas.height;
  const rectAspect = rect.width / rect.height;

  let viewX = rect.left;
  let viewY = rect.top;
  let viewW = rect.width;
  let viewH = rect.height;

  // letterbox or pillarbox
  if (rectAspect > canvasAspect) {
    // pillarbox (bars left/right)
    viewW = rect.height * canvasAspect;
    viewX += (rect.width - viewW) * 0.5;
  } else {
    // letterbox (bars top/bottom)
    viewH = rect.width / canvasAspect;
    viewY += (rect.height - viewH) * 0.5;
  }

  // mouse relative to visible canvas
  const mx = e.clientX - viewX;
  const my = e.clientY - viewY;

  // normalize to [-1, 1], Y up
  mouse.x = (mx / viewW) * 2 - 1;
  mouse.y = -(my / viewH) * 2 + 1;
}

// KEYBOARD INPUT
document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (keysPressed[event.code] != undefined) {
    keysPressed[event.code] = 1;
  } else console.log(`missed ${event.code}`);
});
document.addEventListener("keyup", (event: KeyboardEvent) => {
  if (keysPressed[event.code] != undefined) {
    keysPressed[event.code] = 0;
  }
});
