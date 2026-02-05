import { Story } from "inkjs";
import { Choice } from "inkjs/engine/Choice";

import { State, StateList, StateOption, StateMachine, GenericStateMachine, Events } from "@components/StateMachine";

import { DialogMessage, fetchCharacter, StoryManager } from "./StoryManager";
import { Character, characters, CHARACTERS } from "./Character";


export function openModal() {
  StoryManager.modal.state = "open";
}
export function closeModal() {
  StoryManager.modal.state = "close";
}

// The rendering portion of the dialogue stuff
export class Modal implements GenericStateMachine<typeof Modal> {
  stateMachine: StateMachine<this, typeof Modal>;
  isAnimating = false;
  isOpen(): boolean { return this.stateName != "close"; }
  container: HTMLElement;
  scrollRegion: HTMLElement;



  constructor() {
    this.stateMachine = new StateMachine(this);
    //this.state = "close"; // start closed
    this.container = document.getElementById("ConversationContainer") as HTMLElement;
    if (!this.container)
      throw new Error("container Element #ConversationContainer not found");
    this.scrollRegion = this.container.parentElement as HTMLElement;
  }

  // setter for state allows some transformation before updating the state
  set state(newState: StateOption) { this.stateMachine.currentState = newState };
  get state(): Events | undefined { return this.stateMachine.currentState };
  get stateName(): string | undefined { return this.stateMachine.stateName };

  static STATES = new StateList({
    open: new State("open", {
      onStart: this.showModal,
    }),
    close: new State("close", {
      onStart: this.hideModal,
    }),
  });

  static showModal() {
    const modal = document.querySelector("#modal") as HTMLElement;
    if (modal) modal.style.display = "flex";
  }
  static hideModal() {
    const modal = document.querySelector("#modal") as HTMLElement;
    if (modal) modal.style.display = "none";
  }



  clearDialogue() {
    StoryManager.conversationHistory = [];
    this.container.innerHTML = "";
  }
  ClearChoices = ClearChoices


  switchToCharacter(_character: Character | CHARACTERS | string) {
    // sets the image to the characters image
    const character = fetchCharacter(_character);
    let img = document.getElementById("CharacterImage") as HTMLImageElement;
    // removes old image while the new one loads in. (helps when loading for the first time as it otherwise isnt cached)
    img.src = "";
    img.src = character.imageSrc;
  }


  async displayText(story: Story) {
    if (this.isAnimating)
      console.warn("already displaying text, ideally, wait for animation to finish");

    // Collect all text first
    const text = GetCompleteNextText(story);
    // Add character dialog to conversation history with animation
    if (text)
      await addCharacterDialog(text);


    // assumes we want all text to be appended to a single text box until a question appears.
    function GetCompleteNextText(story: Story) {
      const textSegments: string[] = [];
      while (story.canContinue) {
        textSegments.push(story.Continue() || "");
      }

      // Combine all segments into one text
      return textSegments.join(" ").trim();
    }
  }
}








// ADD DIALOUGUE BOXES
export function addPlayerDialog(text: string) {
  const message: DialogMessage = {
    type: "player",
    text: text,
  };
  StoryManager.conversationHistory.push(message);
  PushDialogueBox(message);
}


export async function addCharacterDialog(text: string) {
  const message: DialogMessage = {
    type: "character",
    text: text,
    characterName: StoryManager.currentCharacter?.name,
    animated: false,
  }
  StoryManager.conversationHistory.push();
  // Disable all choice buttons during animation

  // updates the responses


  PreventChoiceSelection(true);
  PreventScrollBehavior(true);
  // Render all messages, then Re-enable choice buttons after animation
  PushDialogueBox(message)
    .then(el => ApplyTypewriterEffect(el, text))
    .then(el => SetFullText(el, text))
    .then(() => {
      setDialogOptions(StoryManager.currentStory?.currentChoices);
      PreventChoiceSelection(false);
      PreventScrollBehavior(false);
    });
}


async function PushDialogueBox(message: DialogMessage) {
  const bubble = createDialogBubble(message);
  StoryManager.modal.container.appendChild(bubble);
  PositionAtBottomOfContainerNextFrame();
  // returns the text element of the newly created dialogue bubble 
  return bubble.childNodes[0].childNodes[0] as HTMLElement;
}



function createDialogBubble(message: DialogMessage): HTMLElement {
  const isCharacter = message.type === "character";

  const bubbleContainer = document.createElement("div");
  bubbleContainer.className = `flex ${isCharacter ? "items-start justify-start" : "items-end justify-end"} gap-2 w-full`;
  bubbleContainer.style = "overflow: clip; box-sizing: border-box;";

  const bubble = document.createElement("div");
  bubble.className = `relative rounded-2xl p-5 shadow-lg max-w-[80%] dialog-bubble ${isCharacter
    ? "bg-white text-gray-900 dialog-bubble-character"
    : "bg-blue-500 text-white dialog-bubble-player"
    }`;


  // Text content
  const textElement = document.createElement("p");
  textElement.textContent = message.type === "player" || !message.animated ? message.text : "";
  bubble.appendChild(textElement);

  // Tail
  const tail = document.createElement("div");
  tail.className = `absolute w-4 h-4 rotate-45 ${isCharacter ? "-left-2 bottom-0 bg-white" : "-right-2 top-6 bg-blue-500"}`;
  bubble.appendChild(tail);

  bubbleContainer.appendChild(bubble);
  return bubbleContainer;
}

// Name tag - hidden cause we aren't suppsoed to know it
// if (isCharacter && message.characterName) {
//   const nameTag = document.createElement("div");
//   nameTag.className = `text-sm py-1 ${
//     isCharacter ? "text-black" : "text-white"
//   }`;
//   nameTag.textContent = message.characterName;
//   bubble.appendChild(nameTag);
// }







export function SetFullText(el: HTMLElement, text: string) {
  // Clear conversation history when starting a new conversation
  el.innerText = text;
}








// TYPEWRITER EFFECT 
let currentAnimationInterval: any = undefined;
let lastPromiseResolve: () => void;

async function ApplyTypewriterEffect(element: HTMLElement, text: string, speed: number = 30): Promise<HTMLElement> {
  // Cancel any existing animation
  if (StoryManager.modal.isAnimating) {
    console.log("is animating, skipping to next");
    lastPromiseResolve();

  }

  clearInterval(currentAnimationInterval);
  console.log("clearing current");

  let index = 0;
  element.textContent = "";
  StoryManager.modal.isAnimating = true;

  return new Promise<HTMLElement>((resolve) => {
    const thisInterval = currentAnimationInterval = setInterval(TypeWriterUpdateTextbox, speed);
    lastPromiseResolve = () => resolve(element);

    function TypeWriterUpdateTextbox() {
      // does the Auto-scrolling to bottom during animation
      PositionAtBottomOfContainerNextFrame();

      if (index++ < text.length) {
        element.textContent = text.substring(0, index);
        return;
      }
      // when done remove the interval updating this. 
      clearInterval(thisInterval);
      StoryManager.modal.isAnimating = false;
      resolve(element);
    }
  });
}
function PositionAtBottomOfContainerNextFrame() {
  requestAnimationFrame(() => {
    StoryManager.modal.scrollRegion.scrollTop = StoryManager.modal.container.scrollHeight;
  });
}






// CHOICES 
function setDialogOptions(choices?: Choice[]) {

  ClearChoices();
  if (choices)
    choices.map((choice, index) => PresentChoice(choice.text, index));
}

function ClearChoices() {
  const dialogChoicesDiv = document.getElementById("DialogChoices") as HTMLElement;
  dialogChoicesDiv.innerHTML = "";
}

function PresentChoice(text: string, index: number) {
  const dialogChoicesDiv = document.getElementById("DialogChoices") as HTMLElement;

  const button = document.createElement("button");
  button.innerText = text;
  button.onclick = () => SelectChoice(text, index);
  dialogChoicesDiv.appendChild(button);
}


function SelectChoice(text: string, index: number) {
  console.log(`selected choice ${index}: ${text} `);

  // Add player's choice to conversation history
  addPlayerDialog(text);
  StoryManager.currentStory?.ChooseChoiceIndex(index);
  StoryManager.continueStory();
}


// 
function PreventChoiceSelection(disabled: boolean) {
  const dialogChoicesDiv = document.getElementById("DialogChoices");
  if (dialogChoicesDiv) {
    const buttons = dialogChoicesDiv.querySelectorAll("button");
    buttons.forEach((button) => {
      button.disabled = disabled;
    });
  }
}



function PreventScrollBehavior(locked: boolean) {
  const region = StoryManager.modal.scrollRegion;
  if (locked)
    lockScroll();
  else
    unlockScroll();

  function lockScroll() {
    // unlock first to prevent duplicates. 
    unlockScroll();
    console.log("locked");
    region.addEventListener("wheel", preventEvent, { passive: false });
    region.addEventListener("touchmove", preventEvent, { passive: false });
    region.classList.add("no-scrollbar");
  }

  function unlockScroll() {
    console.log("unlocked");
    region.removeEventListener("wheel", preventEvent);
    region.removeEventListener("touchmove", preventEvent);
    region.classList.remove("no-scrollbar");
  }
}

function preventEvent(e: Event) {
  e.preventDefault();
}




