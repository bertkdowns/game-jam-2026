// Main entry point for the inkle dialogue system
// Re-exports all public APIs

export { modal, openModal, closeModal } from "./Modal.js";
export { switchCharacter } from "./Character.js";
export {
  continueStory,
  clearText,
  getGameStory,
  switchScene,
  getCurrentScene,
} from "./StoryManager.js";
export * from "./constants.js";

import { modal } from "./Modal.js";
import { Character, switchCharacter } from "./Character.js";
import {
  getGameStory,
  continueStory,
  bindExternalFunctions,
} from "./StoryManager.js";
import { CHARACTERS, CHARACTERS_PIC } from "./constants.js";
import { GameScene } from "../game/Types/scenes.js";
import { Game } from "../game/Game.js";


// Test function for initializing the dialogue system
export function testrun() {
  modal.state = "close";
  const character = new Character(CHARACTERS.HEAD_ENGINEER);
  character.chat();
  const gameStory = getGameStory();
  gameStory.ChoosePathString("CharacterSelection");
  continueStory();
}

console.log("Inkle test");
