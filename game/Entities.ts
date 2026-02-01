import { Instantiate } from "../src/engine_core/utils.js";
import { Transform } from "../src/components/transform.js";
import { SkyboxRenderer } from "../src/components/skyboxRenderer.js";
import { TextRenderer } from "../src/components/textRenderer.js";
import {
  AllocateUniformBuffer,
  AllocateInstancedBuffer,
} from "../src/engine_core/renderer.js";
import { Play } from "../src/engine_core/audio.js";
import { Time } from "../src/engine_core/time.js";
import { input } from "../src/engine_core/input.js";
import { material as HDRmaterial } from "../src/hdrMaterial.js";
import {
  InitTextSystem,
  textboxAt,
  DrawPage,
  ClearPage,
} from "../build/module.js";
import { SpriteDependencies } from "./LoadAssets.js";
import { Game } from "./Game.js";
import type {
  SkyboxEntity,
  BackgroundEntity,
  ExplosionEntity,
  TextEntity,
  CameraType,
} from "./types.js";

declare global {
  var screenLeft: number;
  var screenTop: number;
}

export function createSkybox(
  cubeMesh: any,
  skyboxShader: any,
  skyboxTexture: any,
  game: Game
): SkyboxEntity {
  const skybox = (game.scene.heirachy["skybox"] = Instantiate(
    SkyboxRenderer,
    new Transform(),
    {
      vertexBuffer: cubeMesh,
      cameraMatrixBuffer: AllocateUniformBuffer(2 * 64),
      shaderModule: skyboxShader,
      texture: skyboxTexture,
    }
  ));
  return skybox;
}

export function createBackground(
  backgroundTexture: any,
  game: Game
): BackgroundEntity {
  const background =
    ((window as any).background =
    game.scene.heirachy["background"] =
      Instantiate(SpriteDependencies, {
        texture: backgroundTexture,
        Start() {
          this.position = [0, 0, 0];
        },
      }));
  return background;
}



export function createExplosion(){};
/*
export function createExplosion(
  explosionTexture: any,
  spriteShaderWithAtlus: any,
  audioClips: any[],
  canvas: HTMLCanvasElement,
  camera: CameraType,
  game: Game
): ExplosionEntity {
  const explosion = (game.scene.heirachy["explosion"] = Instantiate(
    SpriteDependencies,
    {
      shaderModule: spriteShaderWithAtlus,
      material: HDRmaterial,
      texture: explosionTexture,

      startTime: Date.now() / 1000,

      Start() {
        canvas.addEventListener("mousedown", (e) => {
          console.log("updating Explosiion position");
          // CALULATE ANIMATION START TIME
          const currentTime = Date.now() / 1000;
          explosion.startTime = currentTime;

          // POSITION AT CURSOR POSITION ON THE Z PLANE
          const x = document.pointerLockElement ? 0 : (input as any).mouseX;
          const y = document.pointerLockElement ? 0 : (input as any).mouseY;
          const ray = camera.screenPositionToRay(x, y);
          const hit = camera.rayPlaneZ0(ray);
          console.log(ray, hit);

          this.position = hit;

          // PLAY AUDIO CLIP
          console.log("playing clip");
          const clip = Math.floor(Math.random() * 2);
          const volume = 0.9 + Math.random() * 0.1;
          const pitch = 0.7 + Math.random() * 0.3;

          Play(audioClips[clip], { delay: 0, offset: 0, volume, pitch });
        });
      },

      Update() {
        const currentTime = Time.getCurrentTime();
        const animStartTime = this.startTime || currentTime;
        const timePerFrame = 1 / 12;
        const currentFrame = Math.min(
          Math.floor((currentTime - animStartTime) / timePerFrame),
          explosionTexture.layers - 1
        );

        this.textureIndex = currentFrame;
      },
    }
  ));
  return explosion;
}
*/

export function createTextObj(){}
/*
export function createTextObj(
  textMesh: any,
  textShader: any,
  fontTexture: any,
  camera: CameraType,
  game: Game
): TextEntity {
  const textObj = (game.scene.heirachy["textObj"] = Instantiate(
    TextRenderer,
    new Transform(),
    {
      vertexBuffer: textMesh,
      cameraMatrixBuffer: AllocateUniformBuffer(88),
      transformBuffer: AllocateInstancedBuffer(256, 1000, 255),
      shaderModule: textShader,
      texture: fontTexture,

      //for better fps tracking

      lastFPS: 0,
      timeLastUpdate: 0,

      Start() {
        InitTextSystem();
      },
      Update() {
        // Layout For a page
        ClearPage();

        screenLeft = -camera.aspect * (0.5 / camera.pixelScale);
        screenTop = 0.5 / camera.pixelScale;

        // updates fps for
        const roundedTime = Time.getCurrentTime().toFixed(1);
        if (this.timeLastUpdate != roundedTime) {
          this.timeLastUpdate = roundedTime;
          this.lastFPS = 1 / Time.deltaTime;
        }

        // textboxAt(
        //   screenLeft + 2,
        //   screenTop - 8,
        //   `fps ${this.lastFPS.toFixed(1)}`
        // );
        // textboxAt(Math.sin(Date.now() / 1000) * 20, 10, "wooo!!");
        // textboxAt(0, 0, "hello world");

        // textboxAt(0, -10, "this is a test");
        // textboxAt(0, -20, "the more lines the better");
        // const el = document.getElementById("text") as HTMLInputElement | null;
        // if (el) textboxAt(0, -40, el.value);
        // textboxAt(
        //   0,
        //   -50,
        //   `mouse x:${(input as any).mouseX.toPrecision(3)} y${(
        //     input as any
        //   ).mouseY.toPrecision(3)}`
        // );

        // completes page draw
        textObj.textLayout = DrawPage();
      },
    }
  ));
  return textObj;
}
*/


