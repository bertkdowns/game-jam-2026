import { SkyboxRenderer } from "@components/rendering";
import { Transform } from "@components/transform";
import { AllocateUniformBuffer } from "@engine_core/renderer";
import { Instantiate } from "@engine_core/utils";
import { Game } from "@game/Game";
import { SkyboxEntity } from "@game/types";


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
