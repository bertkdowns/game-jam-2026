// Type declarations for the input system
export interface InputTarget {
  moveHorizontal: number;
  moveVertical: number;
  lookHorizontal: number;
  lookVertical: number;
  interact: number;
  [key: string]: any; // Allow other dynamic properties
}

export const input: InputTarget;
export const users: InputTarget[];

export function InputUpdate(): void;
export function InputLateUpdate(): void;
export function Enable2DMouse(): void;
export function Disable2DMouse(): void;
export function EnableCanvasLock(): void;
export function DisableCanvasLock(): void;
