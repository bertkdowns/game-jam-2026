import { Story, Compiler } from 'inkjs/compiler/Compiler';
import { Choice } from 'inkjs/engine/Choice';
import inkStory from './inkstory.ink?raw'
import { StateSystem,State, StateList } from '../src/components/StateMachine.js';



export const ModalState = new StateSystem(this);


class Modal {
   skillSystem = new StateSystem(this);

    // setter for state allows some transformation before updating the state
    set state(newState) { this.skillSystem.set(newState) };
    get state() { return this.skillSystem.currentState };

  static STATES = new StateList({
        inModal: new State("inModal", {
            onStart: () => { console.log(`switching to idle`) },
            onExit: () => { console.log(`finishing idle`) },
            onEvent: e => e.whileIdle(e),
        }),
        outOfModal: new State("outOfModal", {
            onStart: e => e.onJump(e),
            onExit: () => { console.log("end of jump"); },
        }),

        
    });
}

console.log("Inkle test")





export function openModal() {
  let modal = document.querySelector("#modal").style.display = "flex";
}

export function closeModal() {
  let modal = document.querySelector("#modal").style.display = "none";
}


let compiler = new Compiler(inkStory);

const gameStory = compiler.Compile()

gameStory.BindExternalFunction("closeModal", closeModal);

//gameStory.ChoosePathString("SecretStory");

class Character {
  story: Story;
  characterImage: string
  name: string
  constructor(name: string, image: string) {
    this.characterImage = image
    this.name = name // the character name is used to jump to their story path whenever you chat with them.
  }

  chat() {
    clearText()
    this.setCharacterImage()
    gameStory.ChoosePathString(this.name)
    openModal()
    continueStory()
  }

  private setCharacterImage() {
    let img = document.getElementById("CharacterImage") as HTMLImageElement
    img.src = this.characterImage
  }


}
function continueStory() {
  displayText()
  setDialogOptions(gameStory.currentChoices)
}

function setDialogOptions(choices: Choice[]) {
  let dialogChoicesDiv = document.getElementById("DialogChoices")
  dialogChoicesDiv.innerHTML = ""
  for (let i = 0; i < choices.length; i++) {
    let choice = choices[i]
    let button = document.createElement("button")
    button.innerText = choice.text
    button.onclick = () => {
      gameStory.ChooseChoiceIndex(i)
      continueStory()
    }
    dialogChoicesDiv.appendChild(button)
  }
}
function displayText() {
  let characterTalkDiv = document.getElementById("CharacterTalk")
  characterTalkDiv.innerHTML = ""
  while (gameStory.canContinue) {
    characterTalkDiv.innerHTML += `<span>${gameStory.Continue()}</span>`
  }

}
function clearText() {
  let characterTalkDiv = document.getElementById("CharacterTalk")
  characterTalkDiv.innerHTML = ""
}

export const HEAD_ENGINEER = "HeadEngineer"
export const STABLEMASTER = "StableMaster"
export const HEADCHEF = "HeadChef"
export const VISISING_BARON = "VisitingBaron"
export const JESTER = "Jester"
export const JUDGE = "Judge"
export const BISHOP = "Bishop"
export const STEWARD = "Steward"
export const GENERAL = "General"
export const MAYOR = "Mayor"





let character = new Character("HeadEngineer", "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG")
const characters: { [key: string]: Character } = {
  "HeadEngineer": character,
  "StableMaster": new Character(STABLEMASTER, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "HeadChef": new Character(HEADCHEF, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "VisitingBaron": new Character(VISISING_BARON, "./assets/sprites/characterPortraits/characters.portraits/barron.PNG"),
  "Jester": new Character(JESTER, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Judge": new Character(JUDGE, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Bishop": new Character(BISHOP, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Steward": new Character(STEWARD, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "General": new Character(GENERAL, "./assets/sprites/characterPortraits/characters.portraits/general.PNG"),
  "Mayor": new Character(MAYOR, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),




}





export function switchCharacter(characterName: string) {
  let charact = characters[characterName]
  charact.chat()
}


gameStory.BindExternalFunction("switchCharacter", switchCharacter);


export function testrun() {
  character.chat()
  gameStory.ChoosePathString("CharacterSelection")
  continueStory()
}