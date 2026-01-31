import { Game } from "../Game";
import { CameraType, ExplosionEntity } from "../types";
import { Instantiate } from "../../src/engine_core/utils";
import { SpriteDependencies } from "../LoadAssets";
import { material as HDRmaterial } from "../../src/hdrMaterial";
import { Time } from "../../src/engine_core/time";
import { Play } from "../../src/engine_core/audio";
import { input } from "../../src/engine_core/input";

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
