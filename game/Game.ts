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
import {
  createStableMasters,
  createTutorialCharacters,
  createEndingCharacters,
  removeAllCharacters,
} from "./StableMasters";
import { setupInputHandlers } from "./InputHandlers";
import { setupAudioSystem } from "./AudioSystem";
import { testrun } from "../inkle";
import { GameScene, SCENE_CONFIGS } from "./Types/scenes";
import { switchScene as switchInkScene } from "../inkle/StoryManager";
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
  currentScene: GameScene = GameScene.Main;

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
    // Don't create characters here - they'll be created per scene

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

    // Initialize with tutorial scene
    this.setupTutorialScene();
    // testrun(); // Commented out so modal starts closed
  }

  // Setup main game scene (ballroom)
  setupMainScene() {
    this.currentScene = GameScene.Main;
    switchInkScene(GameScene.Main);

    // Remove characters from previous scene
    removeAllCharacters(this);

    // Show main game background
    if (this.background) {
      this.background.scale = [1, 1, 1];
    }
    if (this.skybox) {
      this.skybox.scale = [1, 1, 1];
    }
    if (this.player) {
      this.player.scale = [1, 1, 1];
    }

    // Create all main game characters
    createStableMasters(this);
  }

  // Setup tutorial scene
  setupTutorialScene() {
    this.currentScene = GameScene.Tutorial;
    switchInkScene(GameScene.Tutorial);

    // Remove characters from previous scene
    removeAllCharacters(this);

    // Hide main game background
    if (this.background) {
      this.background.scale = [0, 0, 1];
    }
    // Keep skybox visible for tutorial
    if (this.skybox) {
      this.skybox.scale = [1, 1, 1];
    }
    // Show player in tutorial
    if (this.player) {
      this.player.scale = [1, 1, 1];
    }

    // Create only tutorial-specific characters
    createTutorialCharacters(this);

    // You can add tutorial-specific entities here
    // For example: tutorial markers, instructions, etc.
  }

  // Setup ending scene
  setupEndingScene() {
    this.currentScene = GameScene.Ending;
    switchInkScene(GameScene.Ending);

    // Remove characters from previous scene
    removeAllCharacters(this);

    // Hide main game background
    if (this.background) {
      this.background.scale = [0, 0, 1];
    }
    // Keep skybox visible for ending
    if (this.skybox) {
      this.skybox.scale = [1, 1, 1];
    }
    // Hide player in ending
    if (this.player) {
      this.player.scale = [0, 0, 1];
    }

    // Create only ending-specific characters
    createEndingCharacters(this);

    // You can add ending-specific entities here
    // For example: credits, final scene elements, etc.
  }

  // Switch to a different scene
  switchToScene(scene: GameScene) {
    switch (scene) {
      case GameScene.Tutorial:
        this.setupTutorialScene();
        break;
      case GameScene.Main:
        this.setupMainScene();
        break;
      case GameScene.Ending:
        this.setupEndingScene();
        break;
      default:
        console.warn(`Unknown scene: ${scene}`);
    }
  }
}
