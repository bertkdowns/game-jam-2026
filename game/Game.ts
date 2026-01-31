import { Camera } from "../src/components/camera";
import { Transform } from "../src/components/transform";
import { Renderer, newFrameView } from "../src/engine_core/renderer";
import { Scene } from "../src/engine_core/scene";
import { Instantiate } from "../src/engine_core/utils";
import { Manager } from "../src/engine_core/manager";
import { InputUpdate, InputLateUpdate } from "../src/engine_core/input";
import {
  loadAllAssets,
  backgroundTexture,
  playerTexture,
  skyboxTexture,
  explosionTexture,
  fontTexture,
  skyboxShader,
  spriteShaderWithAtlus,
  textShader,
  cubeMesh,
  textMesh,
  audioClips,
} from "./LoadAssets";
import {
  createSkybox,
  createBackground,
  createExplosion,
  createTextObj,
} from "./Entities";
import { createPlayer } from "./Player";
import { createStableMasters } from "./StableMasters";
import { setupInputHandlers } from "./InputHandlers";
import { setupAudioSystem } from "./AudioSystem";
import { testrun } from "../inkle";
import type {
  PlayerEntity,
  BackgroundEntity,
  SkyboxEntity,
  ExplosionEntity,
  TextEntity,
  CameraType,
} from "./types";

interface Assets {
  images: Record<string, HTMLImageElement>;
  audio: Record<string, HTMLAudioElement>;
  objects: Record<string, any>;
}

// Singleton class for the game
export class Game {
  static instance: Game;
  assets: Assets;

  canvas = document.querySelector("canvas") as HTMLCanvasElement;
  camera = Instantiate(new Camera(), new Transform()) as CameraType;
  renderer = new Renderer();
  scene = ((window as any).scene = new Scene());
  player!: PlayerEntity;
  background!: BackgroundEntity;
  skybox!: SkyboxEntity;
  explosion!: ExplosionEntity;
  textObj!: TextEntity;

  static getInstance() {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  constructor() {
    if (Game.instance) {
      throw new Error("Game already exists");
    }
    Game.instance = this;
  }

  async init() {
    // Initialize renderer first (required for asset loading)
    await Promise.all([this.renderer.initialise(this.canvas)]);

    // Set up window globals for compatibility
    (window as any).renderer = this.renderer;
    (window as any).camera = this.camera;
    (window as any).scene = this.scene;

    // Initialize camera (sets up ResizeObserver and initial canvas size)
    this.camera.initialise(this.canvas);

    // Load all assets (must happen after renderer is initialized)
    await loadAllAssets();

    this.camera.position = [0, -1, -15];

    (window as any).playerTexture = playerTexture;

    // Create entities
    this.skybox = createSkybox(cubeMesh, skyboxShader, skyboxTexture, this);
    this.background = createBackground(backgroundTexture, this);
    this.explosion = createExplosion(
      explosionTexture,
      spriteShaderWithAtlus,
      audioClips,
      this.canvas,
      this.camera,
      this
    );
    this.textObj = createTextObj(
      textMesh,
      textShader,
      fontTexture,
      this.camera,
      this
    );
    this.player = createPlayer(playerTexture, this);
    createStableMasters(this);

    // Set up input handlers
    setupInputHandlers();

    // Set up audio system
    await setupAudioSystem();

    // Set up update loop
    Manager.AddUpdateEvents([
      InputUpdate,
      () => Scene.HandleUpdate(this.scene),
      () =>
        this.renderer.RenderPasses([
          {
            // RENDER PASS
            init: newFrameView,
            drawPass: (pass: any, gpu: any) =>
              this.scene.ForAllObjects((obj: any) =>
                obj?.handlePass?.(pass, gpu, this.camera)
              ), // draws the scene heirachy
          },
        ]),
      InputLateUpdate,
    ]);

    // Start the game loop
    Manager.StartUpdateLoop();
    console.log("started gameloop");
    // testrun(); // Commented out so modal starts closed
  }
}
