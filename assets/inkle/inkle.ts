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
  constructor(image: string) {
    this.characterImage = image

  }

  chat() {
    this.clearText()
    this.setCharacterImage()
    openModal()
    this.continueStory()
  }
  continueStory() {
    this.displayText()
    this.setDialogOptions(gameStory.currentChoices)
  }
  private setCharacterImage() {
    // let img = document.getElementById("CharacterImage") as HTMLImageElement
    // img.src = this.characterImage
  }

  private setDialogOptions(choices: Choice[]) {
    let dialogChoicesDiv = document.getElementById("DialogChoices")
    dialogChoicesDiv.innerHTML = ""
    for (let i = 0; i < choices.length; i++) {
      let choice = choices[i]
      let button = document.createElement("button")
      button.innerText = choice.text
      button.onclick = () => {
        gameStory.ChooseChoiceIndex(i)
        this.continueStory()
      }
      dialogChoicesDiv.appendChild(button)
    }
  }
  private displayText() {
    let characterTalkDiv = document.getElementById("CharacterTalk")
    characterTalkDiv.innerHTML = ""
    while (gameStory.canContinue) {
      characterTalkDiv.innerHTML += `<span>${gameStory.Continue()}</span>`
    }

  }
  private clearText() {
    let characterTalkDiv = document.getElementById("CharacterTalk")
    characterTalkDiv.innerHTML = ""
  }
}





export function testrun() {
  let character = new Character("assets/sprites/characterPortraits/characters.portraits/noble lady1.PNG")
  character.chat()
}