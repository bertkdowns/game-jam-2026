import { Story, Compiler } from "inkjs/compiler/Compiler";
import { Choice } from "inkjs/engine/Choice";
import inkStory from "./inkstory.ink?raw";
import { closeModal } from "./Modal.js";

let compiler = new Compiler(inkStory);
const gameStory = compiler.Compile();

// Conversation history
interface DialogMessage {
  type: "character" | "player";
  text: string;
  characterName?: string;
  animated?: boolean;
}

let conversationHistory: DialogMessage[] = [];
let currentCharacterName: string = "";

// Bind external functions - these will be set up after Character module loads
gameStory.BindExternalFunction("closeModal", closeModal);

// This will be called from index.ts after all modules are loaded
export function bindExternalFunctions(
  switchCharacterFn: (name: string) => void
) {
  gameStory.BindExternalFunction("switchCharacter", switchCharacterFn);
}

export function continueStory() {
  displayText();
  setDialogOptions(gameStory.currentChoices);
}

function setDialogOptions(choices: Choice[]) {
  let dialogChoicesDiv = document.getElementById("DialogChoices");
  dialogChoicesDiv.innerHTML = "";
  for (let i = 0; i < choices.length; i++) {
    let choice = choices[i];
    let button = document.createElement("button");
    button.innerText = choice.text;
    button.onclick = () => {
      // Add player's choice to conversation history
      addPlayerDialog(choice.text);
      gameStory.ChooseChoiceIndex(i);
      continueStory();
    };
    dialogChoicesDiv.appendChild(button);
  }
}

async function displayText() {
  // Collect all text first
  const textSegments: string[] = [];
  while (gameStory.canContinue) {
    textSegments.push(gameStory.Continue());
  }

  // Combine all segments into one text
  const fullText = textSegments.join(" ");

  // Add character dialog to conversation history with animation
  if (fullText.trim()) {
    await addCharacterDialog(fullText);
  }
}

async function addCharacterDialog(text: string) {
  // Add to history first (mark as not animated yet)
  conversationHistory.push({
    type: "character",
    text: text,
    characterName: currentCharacterName,
    animated: false,
  });

  // Render all messages
  renderConversation();

  // Animate the last character message
  const container = document.getElementById("ConversationContainer");
  if (container && container.children.length > 0) {
    const lastBubble = container.children[
      container.children.length - 1
    ] as HTMLElement;
    const textElement = lastBubble.querySelector("p");
    if (textElement) {
      const message = conversationHistory[conversationHistory.length - 1];
      if (!message.animated) {
        textElement.textContent = "";
        await typewriterEffect(textElement, text);
        message.animated = true;
      }
    }
  }
}

function addPlayerDialog(text: string) {
  conversationHistory.push({
    type: "player",
    text: text,
  });
  renderConversation();
}

function renderConversation() {
  const container = document.getElementById("ConversationContainer");
  if (!container) return;

  container.innerHTML = "";

  for (const message of conversationHistory) {
    const bubble = createDialogBubble(message);
    container.appendChild(bubble);
  }

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function createDialogBubble(message: DialogMessage): HTMLElement {
  const isCharacter = message.type === "character";
  const bubbleContainer = document.createElement("div");
  bubbleContainer.className = `flex ${
    isCharacter ? "items-start justify-start" : "items-end justify-end"
  } gap-2 w-full`;

  const bubble = document.createElement("div");
  bubble.className = `relative rounded-2xl p-5 shadow-lg max-w-[80%] dialog-bubble ${
    isCharacter
      ? "bg-white text-gray-900 dialog-bubble-character"
      : "bg-blue-500 text-white dialog-bubble-player"
  }`;

  // Name tag
  if (isCharacter && message.characterName) {
    const nameTag = document.createElement("div");
    nameTag.className = `text-sm py-1 ${
      isCharacter ? "text-black" : "text-white"
    }`;
    nameTag.textContent = message.characterName;
    bubble.appendChild(nameTag);
  }

  // Text content
  const textElement = document.createElement("p");
  // Only show text immediately if already animated or if it's a player message
  // Character messages that aren't animated yet will be animated by addCharacterDialog
  if (message.type === "player" || message.animated === true) {
    textElement.textContent = message.text;
  }
  bubble.appendChild(textElement);

  // Tail
  const tail = document.createElement("div");
  tail.className = `absolute w-4 h-4 rotate-45 ${
    isCharacter ? "-left-2 top-6 bg-white" : "-right-2 top-6 bg-blue-500"
  }`;
  bubble.appendChild(tail);

  bubbleContainer.appendChild(bubble);
  return bubbleContainer;
}

function typewriterEffect(
  element: HTMLElement,
  text: string,
  speed: number = 30
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = "";

    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

export function clearText() {
  // Clear conversation history when starting a new conversation
  conversationHistory = [];
  const container = document.getElementById("ConversationContainer");
  if (container) {
    container.innerHTML = "";
  }
}

export function setCharacterName(name: string) {
  currentCharacterName = name;
}

export function getGameStory(): Story {
  return gameStory;
}
