
/*
import { Game } from "../Game";
import { CameraType, TextEntity } from "../types";
import { Instantiate } from "@engine_core/utils";
import { TextRenderer } from "../../components/textRenderer";
import { Transform } from "../../components/transform";
import { AllocateUniformBuffer } from "../../engine_core/renderer";
import { Time } from "../../engine_core/time";
import { DrawPage } from "../../as_wasm/textRenderer";

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
    textMesh,
    {
      cameraMatrixBuffer: AllocateUniformBuffer(88),
      transformBuffer: AllocateUniformBuffer(256, 1000),
      shaderModule: textShader,
      texture: fontTexture,
      timeLastUpdate: 0,
      lastFPS: 0,


      Update() {
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