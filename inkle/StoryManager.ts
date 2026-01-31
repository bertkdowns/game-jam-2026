import { Story, Compiler } from "inkjs/compiler/Compiler";
import { Choice } from "inkjs/engine/Choice";
// @ts-ignore
import inkStory from "./inkstory.ink?raw";
// @ts-ignore
import tutorialStory from "./tutorial.ink?raw";
// @ts-ignore
import endingStory from "./ending.ink?raw";
import { closeModal } from "./Modal.js";
import { GameScene, SCENE_CONFIGS } from "../game/Types/scenes.js";

// Store stories for each scene
const stories: Map<GameScene, Story> = new Map();
let currentScene: GameScene = GameScene.Tutorial;
let currentStory: Story;

// Initialize all stories
function initializeStories() {
  try {
    // Main story
    const mainCompiler = new Compiler(inkStory);
    const mainStory = mainCompiler.Compile();
    mainStory.BindExternalFunction("closeModal", closeModal);
    stories.set(GameScene.Main, mainStory);

    // Tutorial story
    const tutorialCompiler = new Compiler(tutorialStory);
    const tutorialStoryInstance = tutorialCompiler.Compile();
    tutorialStoryInstance.BindExternalFunction("closeModal", closeModal);
    stories.set(GameScene.Tutorial, tutorialStoryInstance);

    // Ending story
    const endingCompiler = new Compiler(endingStory);
    const endingStoryInstance = endingCompiler.Compile();
    endingStoryInstance.BindExternalFunction("closeModal", closeModal);
    stories.set(GameScene.Ending, endingStoryInstance);

    // Set current story to tutorial (will be switched by Game.init())
    currentStory = tutorialStoryInstance;
  } catch (error) {
    console.error("Error initializing stories:", error);
    // Try to at least get the main story working
    if (!stories.has(GameScene.Main)) {
      const mainCompiler = new Compiler(inkStory);
      const mainStory = mainCompiler.Compile();
      mainStory.BindExternalFunction("closeModal", closeModal);
      stories.set(GameScene.Main, mainStory);
      currentStory = mainStory;
    }
    throw error;
  }
}

// Initialize stories on module load
initializeStories();

// Switch to a different scene's story
export function switchScene(scene: GameScene, startKnot?: string) {
  const story = stories.get(scene);
  if (!story) {
    console.error(`Story not found for scene: ${scene}`);
    return;
  }

  currentScene = scene;
  currentStory = story;

  // Clear conversation history when switching scenes
  clearText();

  // Start at the specified knot or use the scene's default
  const config = SCENE_CONFIGS[scene];
  const knotToStart = startKnot || config.startKnot;
  if (knotToStart) {
    try {
      story.ChoosePathString(knotToStart);
    } catch (e) {
      console.warn(`Could not start at knot "${knotToStart}":`, e);
    }
  }
}

// Conversation history
interface DialogMessage {
  type: "character" | "player";
  text: string;
  characterName?: string;
  animated?: boolean;
}

let conversationHistory: DialogMessage[] = [];
let currentCharacterName: string = "";
let isAnimating = false;
let currentAnimationInterval: NodeJS.Timeout | null = null;

// This will be called from index.ts after all modules are loaded
export function bindExternalFunctions(
  switchCharacterFn: (name: string) => void,
  switchToMainGameFn?: () => void
) {
  // Bind to all stories
  stories.forEach((story) => {
    story.BindExternalFunction("switchCharacter", switchCharacterFn);
    if (switchToMainGameFn) {
      story.BindExternalFunction("switchToMainGame", switchToMainGameFn);
    }
  });
}

export async function continueStory() {
  await displayText();
  setDialogOptions(currentStory.currentChoices);
}

function setDialogOptions(choices: Choice[]) {
  let dialogChoicesDiv = document.getElementById("DialogChoices");
  dialogChoicesDiv.innerHTML = "";
  for (let i = 0; i < choices.length; i++) {
    let choice = choices[i];
    let button = document.createElement("button");
    button.innerText = choice.text;
    button.disabled = isAnimating; // Disable button if animation is happening
    button.onclick = async () => {
      // Skip animation if one is happening
      if (isAnimating && currentAnimationInterval) {
        clearInterval(currentAnimationInterval);
        currentAnimationInterval = null;
        isAnimating = false;
        // Complete the current animation by showing full text
        const container = document.getElementById("ConversationContainer");
        if (container && container.children.length > 0) {
          const lastBubble = container.children[
            container.children.length - 1
          ] as HTMLElement;
          const textElement = lastBubble.querySelector("p");
          const lastMessage =
            conversationHistory[conversationHistory.length - 1];
          if (
            textElement &&
            lastMessage &&
            lastMessage.type === "character" &&
            !lastMessage.animated
          ) {
            textElement.textContent = lastMessage.text;
            lastMessage.animated = true;
            // Scroll to bottom after completing animation
            requestAnimationFrame(() => {
              container.scrollTop = container.scrollHeight;
            });
          }
        }
      }

      // Add player's choice to conversation history
      addPlayerDialog(choice.text);
      currentStory.ChooseChoiceIndex(i);
      await continueStory();
    };
    dialogChoicesDiv.appendChild(button);
  }
}

async function displayText() {
  // Prevent duplicate calls
  if (isAnimating) {
    return;
  }

  // Collect all text first
  const textSegments: string[] = [];
  while (currentStory.canContinue) {
    textSegments.push(currentStory.Continue());
  }

  // Combine all segments into one text
  const fullText = textSegments.join(" ");

  // Add character dialog to conversation history with animation
  if (fullText.trim()) {
    await addCharacterDialog(fullText);
  }
}

async function addCharacterDialog(text: string) {
  // Prevent duplicate messages - check if the last message is the same
  if (conversationHistory.length > 0) {
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage.type === "character" && lastMessage.text === text) {
      return; // Already added this message
    }
  }

  // Add to history first (mark as not animated yet)
  const messageIndex = conversationHistory.length;
  conversationHistory.push({
    type: "character",
    text: text,
    characterName: currentCharacterName,
    animated: false,
  });

  // Render all messages
  renderConversation();

  // Disable all choice buttons during animation
  disableChoiceButtons(true);

  // Animate the last character message
  const container = document.getElementById("ConversationContainer");
  if (container && container.children.length > 0) {
    const lastBubble = container.children[
      container.children.length - 1
    ] as HTMLElement;
    const textElement = lastBubble.querySelector("p");
    if (textElement) {
      const message = conversationHistory[messageIndex];
      if (!message.animated) {
        isAnimating = true;
        textElement.textContent = "";
        await typewriterEffect(textElement, text, container);
        message.animated = true;
        isAnimating = false;
        currentAnimationInterval = null;
      }
    }
  }

  // Re-enable choice buttons after animation
  disableChoiceButtons(false);
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

  // Auto-scroll to bottom (newest messages)
  // Use requestAnimationFrame to ensure DOM is updated before scrolling
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
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

  // Name tag - hidden cause we aren't suppsoed to know it
  // if (isCharacter && message.characterName) {
  //   const nameTag = document.createElement("div");
  //   nameTag.className = `text-sm py-1 ${
  //     isCharacter ? "text-black" : "text-white"
  //   }`;
  //   nameTag.textContent = message.characterName;
  //   bubble.appendChild(nameTag);
  // }

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
  container: HTMLElement,
  speed: number = 30
): Promise<void> {
  return new Promise((resolve) => {
    // Cancel any existing animation
    if (currentAnimationInterval) {
      clearInterval(currentAnimationInterval);
    }

    let index = 0;
    element.textContent = "";

    currentAnimationInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        index++;
        // Auto-scroll to bottom during animation
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      } else {
        if (currentAnimationInterval) {
          clearInterval(currentAnimationInterval);
          currentAnimationInterval = null;
        }
        // Final scroll to bottom
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
        resolve();
      }
    }, speed);
  });
}

function disableChoiceButtons(disabled: boolean) {
  const dialogChoicesDiv = document.getElementById("DialogChoices");
  if (dialogChoicesDiv) {
    const buttons = dialogChoicesDiv.querySelectorAll("button");
    buttons.forEach((button) => {
      button.disabled = disabled;
    });
  }
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
  return currentStory;
}

export function getCurrentScene(): GameScene {
  return currentScene;
}
