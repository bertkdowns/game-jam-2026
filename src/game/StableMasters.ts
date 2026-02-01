import { Instantiate } from "../engine_core/utils";
import { SpriteDependencies, placeholderTexture } from "./LoadAssets";
import { createInteractablePerson } from "./InteractablePerson";
import { CHARACTERS } from "../inkle/constants";
import { Game } from "./Game";

const NPCPositions = {
  [CHARACTERS.VISITING_BARON]: [10, 5, 0],
  [CHARACTERS.STABLEMASTER]: [10, -1, 0],
  [CHARACTERS.HEADCHEF]: [10, -7, 0],
  [CHARACTERS.HEAD_ENGINEER]: [5, 8, 0],
  [CHARACTERS.JESTER]: [-5, 8, 0],
  [CHARACTERS.BISHOP]: [-10, 5, 0],
  [CHARACTERS.STEWARD]: [-10, -1, 0],
  [CHARACTERS.MAYOR]: [-10, -7, 0],
  [CHARACTERS.GENERAL]: [1, -7, 0],
  [CHARACTERS.JUDGE]: [-1, 0, 0],
  [CHARACTERS.KING]: [0, 15, 0],
};

const tutorialPositions = {
  [CHARACTERS.TUTORIAL_CHARACTER]: [5, 0, 0], // Tutorial character position
};

const endingPositions = {
  // Add ending-specific character positions here if needed
  // Example: [KING]: [0, 0, 0],
};

const interactablePerson = createInteractablePerson();

// Helper function to create a single character
function createCharacter(
  game: Game,
  characterName: string,
  position: [number, number, number]
) {
  game.scene.heirachy[characterName] = Instantiate(
    SpriteDependencies,
    interactablePerson,
    {
      texture: placeholderTexture,
      characterProfile: characterName,
      Start() {
        this.position = position;
      },
      Update() {
        this.CheckPosition();
      },
    }
  );
}

// Remove all characters from the scene
export function removeAllCharacters(game: Game) {
  Object.values(CHARACTERS).forEach((char: string) => {
    if (game.scene.heirachy[char]) {
      delete game.scene.heirachy[char];
    }
  });
}

// Create all main game characters
export function createStableMasters(game: Game) {
  for (const [character, position] of Object.entries(NPCPositions)) {
    createCharacter(game, character, position as [number, number, number]);
  }
}

// Create tutorial scene characters
export function createTutorialCharacters(game: Game) {
  for (const [character, position] of Object.entries(tutorialPositions)) {
    createCharacter(game, character, position as [number, number, number]);
  }
}

// Create ending scene characters
export function createEndingCharacters(game: Game) {
  for (const [character, position] of Object.entries(endingPositions)) {
    createCharacter(game, character, position as [number, number, number]);
  }
}
