import { SpriteDependencies } from "../LoadAssets";

import { Instantiate } from "../../src/engine_core/utils";
import { BackgroundEntity } from "../types";
import { Game } from "../Game";

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
