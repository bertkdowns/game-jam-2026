import { Story, Compiler } from 'inkjs/compiler/Compiler';
import { Choice } from 'inkjs/engine/Choice';
import inkStory from './inkstory.ink?raw'


console.log("Inkle test")




function openModal() {
  let modal = document.querySelector("#modal").style.display = "flex";
}

function closeModal() {
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

const HEAD_ENGINEER = "HeadEngineer"
const STABLEMASTER = "StableMaster"
const CHEF = "Chef"
const VISISING_BARON = "VisitingBaron"
const JESTER = "Jester"
const JUDGE = "Judge"
const BISHOP = "Bishop"
const STEWARD = "Steward"
const GENERAL = "General"
const MAYOR = "Mayor"


let character = new Character("HeadEngineer", "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG")
const characters: { [key: string]: Character } = {
  "HeadEngineer": character,
  "StableMaster": new Character(STABLEMASTER, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Chef": new Character(CHEF, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "VisitingBaron": new Character(VISISING_BARON, "./assets/sprites/characterPortraits/characters.portraits/barron.PNG"),
  "Jester": new Character(JESTER, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Judge": new Character(JUDGE, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Bishop": new Character(BISHOP, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "Steward": new Character(STEWARD, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),
  "General": new Character(GENERAL, "./assets/sprites/characterPortraits/characters.portraits/General.PNG"),
  "Mayor": new Character(MAYOR, "./assets/sprites/characterPortraits/characters.portraits/noble-lady.PNG"),




}
export function testrun() {
  character.chat()
  gameStory.ChoosePathString("CharacterSelection")
  continueStory()
}