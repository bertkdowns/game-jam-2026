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


class Character {
  story: Story;
  characterImage
  constructor(storyStr: str, image: string) {
    let compiler = new Compiler(storyStr);
    this.characterImage = image
    this.story = compiler.Compile()
  }

  chat() {
    this.clearText()
    this.setCharacterImage()
    openModal()
    this.continueStory()
  }
  continueStory() {
    this.displayText()
    this.setDialogOptions(this.story.currentChoices)
  }
  private setCharacterImage() {
    let img = document.getElementById("CharacterImage") as HTMLImageElement
    img.src = this.characterImage
  }

  private setDialogOptions(choices: Choice[]) {
    let dialogChoicesDiv = document.getElementById("DialogChoices")
    dialogChoicesDiv.innerHTML = ""
    for (let i = 0; i < choices.length; i++) {
      let choice = choices[i]
      let button = document.createElement("button")
      button.innerText = choice.text
      button.onclick = () => {
        this.story.ChooseChoiceIndex(i)
        this.continueStory()
      }
      dialogChoicesDiv.appendChild(button)
    }
  }
  private displayText() {
    let characterTalkDiv = document.getElementById("CharacterTalk")
    while (this.story.canContinue) {
      characterTalkDiv.innerHTML += `<span>${this.story.Continue()}</span>`
    }

  }
  private clearText() {
    let characterTalkDiv = document.getElementById("CharacterTalk")
    characterTalkDiv.innerHTML = ""
  }
}





export function testrun() {
  let character = new Character(inkStory, "assets/sprites/characterPortraits/characters.portraits/noble lady1 .PNG")
  character.chat()
}