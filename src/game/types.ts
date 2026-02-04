export { CameraInterface, TransformInterface } from "@components/types";

export interface InteractablePersonEntity extends TransformInterface {
  interactionRadius: number;
  characterProfile: string;
  hasTalked: boolean;
  CheckPosition: () => void;
}

export interface PlayerEntity extends TransformInterface {
  Move2D: () => void;
}

export interface SkyboxEntity extends TransformInterface { }

export interface BackgroundEntity extends TransformInterface { }


declare global {
  interface Window {
    player: PlayerEntity;
  }
}



/*
import { Camera } from "@components/camera";
import { Vector3 } from "@engine_core/math";

// Common entity properties
export interface BaseEntity {
  position: Vector3;
  scale: Vector3;
  texture?: any;
  Start?: () => void;
  Update?: () => void;
}

// Player entity type
export interface PlayerEntity extends BaseEntity {
  isFrozen: boolean;
  state: number;
  stateSystem: {
    call: (event: string) => void;
    currentState: number;
  };
  texture: any;
}

// Interactable NPC entity type
export interface InteractablePersonEntity extends BaseEntity {
  interactionRadius: number;
  hasTalked: boolean;
  characterProfile: string;
  CheckPosition: () => void;
  texture: any;
}

// Explosion entity type
export interface ExplosionEntity extends BaseEntity {
  shaderModule: any;
  material: any;
  texture: any;
  startTime: number;
  textureIndex?: number;
}

// Text entity type
export interface TextEntity extends BaseEntity {
  vertexBuffer: any;
  cameraMatrixBuffer: any;
  transformBuffer: any;
  shaderModule: any;
  texture: any;
  lastFPS: number;
  timeLastUpdate: number;
  textLayout?: any;
}

// Skybox entity type
export interface SkyboxEntity extends BaseEntity {
  vertexBuffer: any;
  cameraMatrixBuffer: any;
  shaderModule: any;
  texture: any;
}

// Background entity type
export interface BackgroundEntity extends BaseEntity {
  texture: any;
}

// Camera type (matches the actual Camera class from components/camera)
export interface CameraType {
  position:
  | {
    x: number;
    y: number;
    z: number;
  }
  | [number, number, number];
  aspect: number;
  pixelScale: number;
  initialise: (canvas: HTMLCanvasElement) => void;
  screenPositionToRay: (
    x: number,
    y: number,
    z?: number
  ) => {
    origin: [number, number, number];
    direction: [number, number, number];
  };
  rayPlaneZ0: (ray: {
    origin: Vector3;
    direction: Vector3;
  }) => Vector3 | null;
}

// Game type
export interface GameInstance {
  canvas: HTMLCanvasElement;
  camera: Camera;
  renderer: any;
  scene: {
    heirachy: Record<string, any>;
    ForAllObjects: (callback: (obj: any) => void) => void;
  };
  player: PlayerEntity;
  background: BackgroundEntity;
  skybox: SkyboxEntity;
  explosion: ExplosionEntity;
  textObj: TextEntity;
}

// Texture type
export interface Texture {
  view?: any;
  width?: number;
  height?: number;
  pixelScale?: number;
  layers?: number;
}

// Shader type
export interface Shader {
  label?: string;
  code?: string;
}

// Mesh type
export interface Mesh {
  vertCount?: number;
}
*/