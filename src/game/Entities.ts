import { Instantiate } from "../engine_core/utils";
import { Transform } from "../components/transform";
import { SkyboxRenderer } from "../components/skyboxRenderer";
import { TextRenderer } from "../components/textRenderer";
import {
  AllocateUniformBuffer,
  AllocateInstancedBuffer,
} from "../engine_core/renderer";
import { Play } from "../engine_core/audio";
import { Time } from "../engine_core/time";
import { input } from "../engine_core/input";
import {
  InitTextSystem,
  textboxAt,
  DrawPage,
  ClearPage,
} from "../../build/module";
import { SpriteDependencies } from "./LoadAssets";
import { Game } from "./Game";
import type {
  SkyboxEntity,
  BackgroundEntity,
  ExplosionEntity,
  TextEntity,
  CameraType,
} from "./types";

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
export function createTextObj(){};


