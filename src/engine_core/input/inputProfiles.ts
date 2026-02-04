import type { Input } from ".";

// buffer for the keys pressed, needs to be initialised for all its listening for
export const keysPressed: Record<string, number> = {
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0,
  KeyW: 0,
  KeyS: 0,
  KeyA: 0,
  KeyD: 0,
  KeyE: 0,
};
export const mouse = { x: 0, y: 0 };

// adds the alility to use an alias that maps to a button,
// should allow for easy remapping for the inputs, and falls back when not implemented
export const aliasMap: Input.AliasMap = {
  axes: {
    lHorizontal: "moveHorizontal",
    lVertical: "moveVertical",
    rHorizontal: "lookHorizontal",
    rVertical: "lookVertical",
  },
  buttons: {
    x: "interact",
  },
};

// button mapping
const deadzone = 0.04;
export const gamepadProfiles: Record<string, Input.DeviceProfile> = {
  standard: {
    // indices for the button layout
    axes: {
      lHorizontal: 0,
      lVertical: 1,
      rHorizontal: 2,
      rVertical: 3,
    },
    mapAxes: (axis: string, value: number) =>
      Math.abs(value) > deadzone ? value : 0, // adds a deadzone
    buttons: {
      dpadUp: 12,
      dpadDown: 13,
      dpadLeft: 14,
      dpadRight: 15,
      x: 0,
      y: 3,
      a: 1,
      b: 2,
      back: 8,
      start: 9,
      l1: 4,
      l2: 6,
      l3: 11,
      r1: 5,
      r2: 7,
      r3: 11,
    },
  },
  "3537-0102-GameSir-X2 Pro-Xbox": {
    axes: {
      lHorizontal: 0,
      lVertical: 1,
      rHorizontal: 2,
      rVertical: 5,
    },
    //(0 -> 2) not -1 -> 1 so need the -1 to push it into range
    mapAxes: (axis: string, value: number) => {
      value -= 1; //  ["lHorizontal","lVertical", "rHorizontal"].includes(axis)? 1: 0;
      return Math.abs(value) > deadzone ? value : 0;
      // adds a deadzone
    },
    buttons: {
      dpadUp: 12,
      dpadDown: 13,
      dpadLeft: 14,
      dpadRight: 15,
      x: 0,
      y: 3,
      a: 1,
      b: 2,
      back: 8,
      start: 9,
      l1: 4,
      l2: 6,
      l3: 11,
      r1: 5,
      r2: 7,
      r3: 11,
    },
  },
  "054c-0ce6-DualSense Wireless Controller": {
    axes: {
      lHorizontal: 0,
      lVertical: 1,
      rHorizontal: 2,
      rVertical: 5,
    },
    buttons: {
      dpadUp: 12,
      dpadDown: 13,
      dpadLeft: 14,
      dpadRight: 15,
      x: 0,
      y: 3,
      a: 1,
      b: 2,
      back: 8,
      start: 9,
      l1: 4,
      l2: 6,
      l3: 11,
      r1: 5,
      r2: 7,
      r3: 11,
    },
  },
};
