export { input, InputUpdate, InputLateUpdate } from "./input";


export namespace Input {
  // Type declarations for the input system
  export type AliasMap = {
    axes: Record<string, string>;
    buttons: Record<string, string>;
  };


  export type DeviceProfile = {
    axes: Record<string, number> | Record<string, () => number>;
    mapAxes?: (axis: string, value: number) => number;
    buttons: Record<string, number> | Record<string, () => number>;
  };
  export interface InputTarget {
    [key: string]: any; // Allow other dynamic properties
    addDevice: (device: Device) => void;
    removeDevice: (device: Device) => void;

    // added as aliases in inputProfiles.ts
    moveHorizontal?: number;
    moveVertical?: number;
    lookHorizontal?: number;
    lookVertical?: number;
    interact?: number;
  }


  export interface Device {
    profile: DeviceProfile;
    inputTarget?: InputTarget;

    connect: (target: InputTarget) => void;
    disconnect: () => void;
    bindProperties: () => void;
  }
}


declare global {
  interface Window {
    detectGamepadLoop?: () => void;
    detectGameadChanges?: () => void;
    using3D: boolean;

  }
  interface Canvas {
    requestPointerLock(options?: Event): Promise<void>;
  }
}


