import { StoryManager } from "./StoryManager";


// names and imagepaths

export enum CHARACTERS {
  HEAD_ENGINEER = "HeadEngineer",
  STABLEMASTER = "StableMaster",
  HEADCHEF = "HeadChef",
  VISITING_BARON = "VisitingBaron",
  JESTER = "Jester",
  JUDGE = "Judge",
  BISHOP = "Bishop",
  STEWARD = "Steward",
  GENERAL = "General",
  MAYOR = "Mayor",
  TUTORIAL_CHARACTER = "TutorialCharacter",
  KING = "King",
}

export const CHARACTERS_PIC = {
  [CHARACTERS.HEAD_ENGINEER]:
    "assets/sprites/characterPortraits/characters.portraits/engineer.PNG",
  [CHARACTERS.STABLEMASTER]:
    "assets/sprites/characterPortraits/characters.portraits/stable-master.PNG",
  [CHARACTERS.HEADCHEF]:
    "assets/sprites/characterPortraits/characters.portraits/chef.PNG",
  [CHARACTERS.VISITING_BARON]:
    "assets/sprites/characterPortraits/characters.portraits/baron.PNG",
  [CHARACTERS.JESTER]:
    "assets/sprites/characterPortraits/characters.portraits/jester.PNG",
  [CHARACTERS.JUDGE]:
    "assets/sprites/characterPortraits/characters.portraits/judge.PNG",
  [CHARACTERS.BISHOP]:
    "assets/sprites/characterPortraits/characters.portraits/bishop.PNG",
  [CHARACTERS.STEWARD]:
    "assets/sprites/characterPortraits/characters.portraits/steward.PNG",
  [CHARACTERS.GENERAL]:
    "assets/sprites/characterPortraits/characters.portraits/general.PNG",
  [CHARACTERS.MAYOR]:
    "assets/sprites/characterPortraits/characters.portraits/mayor.PNG",
  [CHARACTERS.KING]:
    "assets/sprites/characterPortraits/characters.portraits/king.PNG",
  [CHARACTERS.TUTORIAL_CHARACTER]:
    "assets/sprites/characterPortraits/characters.portraits/tutorial-knight.PNG",
};




export class Character {
  story: any;

  imageSrc: string;
  imageBitmap?: ImageBitmap;

  name: string;
  accused: boolean = false;
  constructor(character: CHARACTERS) {
    this.imageSrc = CHARACTERS_PIC[character];
    this.name = character;

  }

  chat() {
    StoryManager.StartConversationWith(this);
  }
}


// creates all the characters 
export const characters: { [key: string]: Character } = {
  [CHARACTERS.HEAD_ENGINEER]: new Character(CHARACTERS.HEAD_ENGINEER),
  [CHARACTERS.STABLEMASTER]: new Character(CHARACTERS.STABLEMASTER),
  [CHARACTERS.HEADCHEF]: new Character(CHARACTERS.HEADCHEF),
  [CHARACTERS.VISITING_BARON]: new Character(CHARACTERS.VISITING_BARON),
  [CHARACTERS.JESTER]: new Character(CHARACTERS.JESTER),
  [CHARACTERS.JUDGE]: new Character(CHARACTERS.JUDGE),
  [CHARACTERS.BISHOP]: new Character(CHARACTERS.BISHOP),
  [CHARACTERS.STEWARD]: new Character(CHARACTERS.STEWARD),
  [CHARACTERS.GENERAL]: new Character(CHARACTERS.GENERAL),
  [CHARACTERS.MAYOR]: new Character(CHARACTERS.MAYOR),
  [CHARACTERS.TUTORIAL_CHARACTER]: new Character(CHARACTERS.TUTORIAL_CHARACTER),
  [CHARACTERS.KING]: new Character(CHARACTERS.KING),
};




