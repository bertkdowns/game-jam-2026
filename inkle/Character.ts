import {
  HEAD_ENGINEER,
  STABLEMASTER,
  HEADCHEF,
  VISISING_BARON,
  JESTER,
  JUDGE,
  BISHOP,
  STEWARD,
  GENERAL,
  MAYOR,
} from "./constants.js";
import {
  getGameStory,
  continueStory,
  clearText,
  setCharacterName,
} from "./StoryManager.js";
import { openModal } from "./Modal.js";

export class Character {
  story: any;
  characterImage: string;
  name: string;

  constructor(name: string, image: string) {
    this.characterImage = image;
    this.name = name; // the character name is used to jump to their story path whenever you chat with them.
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

const characters: { [key: string]: Character } = {
  HeadEngineer: new Character(
    HEAD_ENGINEER,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  StableMaster: new Character(
    STABLEMASTER,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  HeadChef: new Character(
    HEADCHEF,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  VisitingBaron: new Character(
    VISISING_BARON,
    "./assets/sprites/characterPortraits/characters.portraits/barron.PNG"
  ),
  Jester: new Character(
    JESTER,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  Judge: new Character(
    JUDGE,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  Bishop: new Character(
    BISHOP,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  Steward: new Character(
    STEWARD,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
  General: new Character(
    GENERAL,
    "./assets/sprites/characterPortraits/characters.portraits/general.PNG"
  ),
  Mayor: new Character(
    MAYOR,
    "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"
  ),
};

export function switchCharacter(characterName: string) {
  let charact = characters[characterName];
  if (charact) {
    charact.chat();
  }
}
