import { input } from "../src/engine_core/input.js";
import { switchCharacter } from "../inkle/index.js";
import type { InteractablePersonEntity, PlayerEntity } from "./types.js";

export const createInteractablePerson =
  (): Partial<InteractablePersonEntity> => ({
    interactionRadius: 3,
    hasTalked: false,

    CheckPosition() {
      // Calculate distance between player and NPC
      const player = (window as any).player as PlayerEntity;
      const entity = this as InteractablePersonEntity;
      if (!entity.position || !player?.position) return;

      const dx = entity.position[0] - player.position[0];
      const dy = entity.position[1] - player.position[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If close enough and E key pressed, trigger dialogue
      if (
        distance < entity.interactionRadius &&
        (input as any).KeyE &&
        !entity.hasTalked
      ) {
        console.log("Triggering dialogue!");
        switchCharacter(entity.characterProfile);

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
        const aspectRatio = entity.texture.height / entity.texture.width;
        entity.scale = [scale * aspectRatio, scale];
      } else {
        // Reset to default aspect ratio when not in interaction range
        const aspectRatio = entity.texture.height / entity.texture.width;
        entity.scale = [aspectRatio, 1];
      }
    },
  });
