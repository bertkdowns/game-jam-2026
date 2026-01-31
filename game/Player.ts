import { input } from "../src/engine_core/input.js";
import { Time } from "../src/engine_core/time.js";
import { modal } from "../inkle/index.js";
import { Instantiate } from "../src/engine_core/utils.js";
import { DemoEntity } from "../src/components/StateMachine.js";
import { SpriteDependencies } from "./LoadAssets.js";
import { checkCollision } from "./Collision.js";
import { Game } from "./Game.js";
import type {
  PlayerEntity,
  CameraType,
  InteractablePersonEntity,
} from "./types.js";

const MIN_X = -15;
const MAX_X = 15;
const MIN_Y = -15;
const MAX_Y = 12.5;

var xv = 0,
  yv = 0,
  zv = 0;

// MOVE 2D
export function Move2D(entity: PlayerEntity): [number, number] {
  if (modal.stateName == "open") {
    xv = 0;
    yv = 0;
    return [0, 0];
  }

  const speed = 2;
  var dx = input.moveHorizontal;
  var dy = -input.moveVertical;

  // Apply velocity
  xv += dx * speed * Time.deltaTime;
  yv += dy * speed * Time.deltaTime;

  // Apply friction
  xv *= 0.8;
  yv *= 0.8;

  const [x, y] = [...entity.position];
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

  const [_, __, z] = entity.position;
  entity.position = [nextX, nextY, z ?? 0];
  return [nextX, nextY];
}

// Check if player is near any interactable NPC
function checkNearbyNPC(player: PlayerEntity, game: Game): boolean {
  if (!player.position) return false;

  const playerPos = player.position;

  // Check all entities in the scene hierarchy for interactable NPCs
  for (const key in game.scene.heirachy) {
    const entity = game.scene.heirachy[key] as any;

    // Check if this entity has CheckPosition method (interactable person)
    if (
      entity &&
      entity.CheckPosition &&
      entity.position &&
      entity.interactionRadius
    ) {
      const npc = entity as InteractablePersonEntity;
      const dx = npc.position[0] - playerPos[0];
      const dy = npc.position[1] - playerPos[1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < npc.interactionRadius) {
        return true;
      }
    }
  }

  return false;
}

// Update the interact prompt visibility
function updateInteractPrompt(isNearNPC: boolean) {
  const prompt = document.getElementById("interact-prompt");
  if (prompt) {
    // Hide prompt if modal is open
    if (modal.stateName == "open") {
      prompt.classList.remove("show");
    } else if (isNearNPC) {
      prompt.classList.add("show");
    } else {
      prompt.classList.remove("show");
    }
  }
}

export function UpdateCamera(x: number, y: number, camera: CameraType) {
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
  if (Array.isArray(camera.position)) {
    camera.position[0] += (targetCamX - camera.position[0]) * 0.05;
    camera.position[1] += (targetCamY - camera.position[1]) * 0.05;
  } else {
    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
  }
}

export function createPlayer(playerTexture: any, game: Game): PlayerEntity {
  const player =
    ((window as any).player =
    game.scene.heirachy["player"] =
      Instantiate(SpriteDependencies, new DemoEntity(), {
        texture: playerTexture,
        isFrozen: false,
        Start() {
          this.state = 0;
        },
        Update() {
          Move2D(this);
          UpdateCamera(this.position[0], this.position[1], game.camera);

          // Check if near NPC and update interact prompt
          const isNearNPC = checkNearbyNPC(this, game);
          updateInteractPrompt(isNearNPC);

          this.stateSystem.call("onEvent");
        },
      }));

  return player;
}
