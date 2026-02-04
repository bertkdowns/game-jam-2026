import { Game } from "@game/Game";
import { StoryManager, CHARACTERS } from "@game/inkle";
import { InteractablePersonEntity, PlayerEntity } from "@game/types";
import { SpriteDependencies, placeholderTexture } from "@engine_core/asset_io/LoadAssets";
import { input } from "@engine_core/input";
import { Instantiate } from "@engine_core/utils";

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


export const createInteractablePerson =
  (): Partial<InteractablePersonEntity> => ({
    interactionRadius: 3,
    hasTalked: false,

    CheckPosition() {
      const entity = this as InteractablePersonEntity;
      // Calculate distance between player and NPC
      const player = window.player as PlayerEntity;

      if (!entity.position || !player?.position) return;

      const dx = entity.position.x - player.position.x;
      const dy = entity.position.y - player.position.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      // If close enough and E key pressed, trigger dialogue
      if (distance < entity.interactionRadius && input.KeyE && !entity.hasTalked) {
        console.log("Triggering dialogue!");
        StoryManager.StartConversationWith(entity.characterProfile);

        entity.hasTalked = true; // Prevent multiple triggers in one frame
      }

      // Reset state when leaving interaction range (can talk again)
      if (distance > entity.interactionRadius * 1.5) {
        entity.hasTalked = false;
      }

      // Optional: Visual feedback (scale when close)
      if (entity.hasTalked) {
        const scale = 1 + (1 - distance / entity.interactionRadius) * 0.2;
        // Maintain aspect ratio when scaling

        entity.scale = [scale, scale];
      } else {
        entity.scale = [1, 1];
      }
    },
  });




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
      Start(this: InteractablePersonEntity) {
        this.position = position;
      },
      Update(this: InteractablePersonEntity) {
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
export function createCharacters(game: Game) {
  for (const [character, position] of Object.entries(NPCPositions)) {
    createCharacter(game, character, position as [number, number, number]);
  }
}



