// Main entry point for the inkle dialogue system
// Re-exports all public APIs

export { modal, openModal, closeModal } from "./Modal.js";
export { switchCharacter } from "./Character.js";
export { continueStory, clearText, getGameStory } from "./StoryManager.js";
export * from "./constants.js";

import { modal } from "./Modal.js";
import { Character, switchCharacter } from "./Character.js";
import {
  getGameStory,
  continueStory,
  bindExternalFunctions,
} from "./StoryManager.js";
import { HEAD_ENGINEER } from "./constants.js";

// Initialize external function bindings
bindExternalFunctions(switchCharacter);

// Test function for initializing the dialogue system
export function testrun() {
  modal.state = 0;
  const character = new Character(
    HEAD_ENGINEER,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  );
  character.chat();
  const gameStory = getGameStory();
  gameStory.ChoosePathString("CharacterSelection");
  continueStory();
}

console.log("Inkle test");
