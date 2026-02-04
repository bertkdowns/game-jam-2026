import { SpriteDependencies, backgroundTexture } from "@engine_core/asset_io/LoadAssets";
import { BackgroundEntity } from "@game/types";
import { Game } from "@game/Game";
import { Instantiate } from "@engine_core/utils";

export function createBackground(game: Game): BackgroundEntity {
  const background = (window.background = game.scene.heirachy["background"] =
    Instantiate(SpriteDependencies, {
      texture: backgroundTexture,
      Start(this: BackgroundEntity) {
        this.position = [0, 0, 0];
      },
    }));
  return background;
}


declare global {
  interface Window {
    background: BackgroundEntity;
  }
}

