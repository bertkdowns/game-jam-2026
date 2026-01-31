import { SkyboxRenderer } from "../../src/components/skyboxRenderer";
import { Transform } from "../../src/components/transform";
import { AllocateUniformBuffer } from "../../src/engine_core/renderer";
import { Instantiate } from "../../src/engine_core/utils";
import { Game } from "../Game";
import { SkyboxEntity } from "../types";

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
