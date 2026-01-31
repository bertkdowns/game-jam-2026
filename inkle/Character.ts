import { CHARACTERS_PIC, CHARACTERS } from "./constants.js";
import {
  getGameStory,
  continueStory,
  clearText,
  setCharacterName,
  getCurrentScene,
  switchScene,
} from "./StoryManager.js";
import { GameScene } from "../game/Types/scenes.js";
import { openModal } from "./Modal.js";

export class Character {
  story: any;

  characterImage: string;
  name: string;
  accused: boolean = false;
  constructor(character: CHARACTERS) {
    this.characterImage = CHARACTERS_PIC[character];
    this.name = character;
  }

  chat() {
    clearText();
    setCharacterName(this.name);
    this.setCharacterImage();
    const gameStory = getGameStory();
    gameStory.ChoosePathString(this.name);
    openModal();
    continueStory();
  }

  private setCharacterImage() {
    let img = document.getElementById("CharacterImage") as HTMLImageElement;
    img.src = this.characterImage;
  }
}

export const characters: { [key: string]: Character } = {
  HeadEngineer: new Character(CHARACTERS.HEAD_ENGINEER),
  StableMaster: new Character(CHARACTERS.STABLEMASTER),
  HeadChef: new Character(CHARACTERS.HEADCHEF),
  VisitingBaron: new Character(CHARACTERS.VISISING_BARON),
  Jester: new Character(CHARACTERS.JESTER),
  Judge: new Character(CHARACTERS.JUDGE),
  Bishop: new Character(CHARACTERS.BISHOP),
  Steward: new Character(CHARACTERS.STEWARD),
  General: new Character(CHARACTERS.GENERAL),
  Mayor: new Character(CHARACTERS.MAYOR),
  Tutorial: new Character(CHARACTERS.TUTORIAL_CHARACTER),
  King: new Character(CHARACTERS.KING),
};

export function switchCharacter(characterName: string) {
  const currentScene = getCurrentScene();

  // If we're in the tutorial scene, start the tutorial dialogue instead
  if (currentScene === GameScene.Tutorial) {
    clearText();
    setCharacterName("Tutorial");
    // Set a default tutorial character image
    const img = document.getElementById("CharacterImage") as HTMLImageElement;
    if (img) {
      img.src = CHARACTERS_PIC[CHARACTERS.TUTORIAL_CHARACTER];
    }

    // Make sure we're using the tutorial story and start from the beginning
    switchScene(GameScene.Tutorial, "Start");
    openModal();
    continueStory();
    return;
  }

  // For other scenes, use the normal character dialogue
  let charact = characters[characterName];
  if (charact) {
    charact.chat();
  }
}
