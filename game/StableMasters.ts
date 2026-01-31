import { Instantiate } from "../src/engine_core/utils.js";
import { SpriteDependencies, placeholderTexture } from "./LoadAssets.js";
import { createInteractablePerson } from "./InteractablePerson.js";
import {
  VISISING_BARON,
  STABLEMASTER,
  HEADCHEF,
  HEAD_ENGINEER,
  JESTER,
  BISHOP,
  STEWARD,
  MAYOR,
  GENERAL,
  JUDGE,
} from "../inkle/index.js";
import { Game } from "./Game.js";

const stableMasterPositions = {
  [VISISING_BARON]: [10, 5, 0],
  [STABLEMASTER]: [10, -1, 0],
  [HEADCHEF]: [10, -7, 0],
  [HEAD_ENGINEER]: [5, 8, 0],
  [JESTER]: [-5, 8, 0],
  [BISHOP]: [-10, 5, 0],
  [STEWARD]: [-10, -1, 0],
  [MAYOR]: [-10, -7, 0],
  [GENERAL]: [1, -7, 0],
  [JUDGE]: [-1, 0, 0],
};
const interactablePerson = createInteractablePerson();

export function createStableMasters(game: Game) {
  for (const [character, position] of Object.entries(stableMasterPositions)) {
    game.scene.heirachy[character] = Instantiate(
      SpriteDependencies,
      interactablePerson,
      {
        texture: placeholderTexture,
        characterProfile: character,
        Start() {
          this.position = position;
        },
        Update() {
          this.CheckPosition();
        },
      }
    );
  }
}
