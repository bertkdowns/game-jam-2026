import { input } from "@engine_core/input";
import { Time } from "@engine_core/time";
import { Game } from "@game/Game";

import { playerTexture, SpriteDependencies } from "@engine_core/asset_io/LoadAssets";
import type { PlayerEntity, CameraInterface, } from "@game/types";
import { StoryManager } from "@game/inkle/StoryManager";
import { Instantiate } from "@engine_core/utils";


const MIN_X = -15;
const MAX_X = 15;
const MIN_Y = -15;
const MAX_Y = 12.5;

var xv = 0,
  yv = 0,
  zv = 0;



// Update the interact prompt visibility
function updateInteractPrompt(isNearNPC: boolean) {
  const prompt = document.getElementById("interact-prompt");
  if (prompt) {
    // Hide prompt if modal is open
    if (StoryManager.modal.stateName == "open") {
      prompt.classList.remove("show");
    } else if (isNearNPC) {
      prompt.classList.add("show");
    } else {
      prompt.classList.remove("show");
    }
  }
}

export function UpdateCamera(x: number, y: number, camera: CameraInterface) {
  // Background boundaries for camera
  const BG_WIDTH = 0.5; // Half-width of the background
  const BG_HEIGHT = 7.3; // Half-height of the background

  // Calculate target camera position (usually follows the player)
  let targetCamX = x;
  let targetCamY = y;

  // Stop the camera at background edges
  if (targetCamX > BG_WIDTH) targetCamX = BG_WIDTH;
  if (targetCamX < -BG_WIDTH) targetCamX = -BG_WIDTH;
  if (targetCamY > BG_HEIGHT) targetCamY = BG_HEIGHT;
  if (targetCamY < -BG_HEIGHT) targetCamY = -BG_HEIGHT;

  // Smoothly follow the target position
  // Handle both array and object position formats
  camera.position.x += (targetCamX - camera.position.x) * 0.05;
  camera.position.y += (targetCamY - camera.position.y) * 0.05;
}

export function createPlayer(game: Game): PlayerEntity {
  const player = window.player = game.scene.heirachy["player"] =
    Instantiate(SpriteDependencies, {
      texture: playerTexture,
      isFrozen: false,

      Update(this: PlayerEntity) {
        this.Move2D();
        UpdateCamera(this.position[0], this.position[1], game.camera);

        // Check if near NPC and update interact prompt
        const isNearNPC = checkNearbyNPC(this, game);
        updateInteractPrompt(isNearNPC);
      },


      // MOVE 2D
      Move2D(this: PlayerEntity): [number, number] {
        if (StoryManager.modal.stateName == "open") {
          xv = 0;
          yv = 0;
          return [0, 0];
        }

        const speed = 2;
        var dx = input.moveHorizontal || 0;
        var dy = -(input.moveVertical || 0);

        // Apply velocity
        xv += dx * speed * Time.deltaTime;
        yv += dy * speed * Time.deltaTime;

        // Apply friction
        xv *= 0.8;
        yv *= 0.8;

        const [x, y] = [...this.position];
        // Predict next position
        let nextX = x + xv;
        let nextY = y + yv;

        // Clamp within world bounds
        nextX = Math.min(Math.max(nextX, MIN_X), MAX_X);
        nextY = Math.min(Math.max(nextY, MIN_Y), MAX_Y);

        // Check collisions with obstacles
        if (checkCollision(nextX, y)) {
          // Hit obstacle in X direction, stop movement in X
          xv = 0;
          nextX = x; // stay in place
        }

        if (checkCollision(x, nextY)) {
          // Hit obstacle in Y direction, stop movement in Y
          yv = 0;
          nextY = y; // stay in place
        }

        const [_, __, z] = this.position;
        this.position = [nextX, nextY, z ?? 0];
        return [nextX, nextY];
      }
    });

  return player;
}













// Check if player is near any interactable NPC
function checkNearbyNPC(player: PlayerEntity, game: Game): boolean {
  if (!player.position) return false;

  const playerPos = player.position;

  // Check all entities in the scene hierarchy for interactable NPCs
  for (const npc of game.interactablePeople) {

    const dx = npc.position.x - playerPos.x;
    const dy = npc.position.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < npc.interactionRadius) {
      return true;
    }
  }

  return false;
}







// Obstacles
export const obstacles = [
  { x: 10, y: 12, width: 13, height: 8 }, // Center (x, y), width, height
  { x: -9, y: 12, width: 13, height: 8 },
];

// Collision check
export function checkCollision(px: number, py: number): boolean {
  for (const obs of obstacles) {
    const left = obs.x - obs.width / 2;
    const right = obs.x + obs.width / 2;
    const top = obs.y + obs.height / 2;
    const bottom = obs.y - obs.height / 2;

    if (px >= left && px <= right && py >= bottom && py <= top) {
      return true; // Collision detected
    }
  }
  return false;
}