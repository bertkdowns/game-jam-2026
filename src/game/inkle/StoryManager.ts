// @ts-ignore
import { Story, Compiler as InkCompiler } from "inkjs/full";



import { inkStory, tutorialStory, endingStory } from "@engine_core/asset_io/LoadAssets";
import { SCENE_CONFIGS, GameScene, nextScene } from "@game/SceneManager";
import { CHARACTERS, openModal, closeModal } from "@game/inkle";


import { Game } from "@game/Game";
import { Modal } from "./Modal";
import { Character, characters } from "./Character";




// bind to all stories. 
interface ExternalFunctions { [key: string]: ((...args: any[]) => any) }
// This will be called from index.ts after all modules are loaded
export function bindExternalFunctions(ExternalFunctions: ExternalFunctions) {
  for (const [key, func] of Object.entries(ExternalFunctions))
    bindExternalFunction(key, func)
}
export function bindExternalFunction(externalFunctionName: string, externalFunction: (...args: any) => any) {
  // Bind function to all stories
  for (const [sceneName, story] of StoryManager.stories)
    story.BindExternalFunction(externalFunctionName, externalFunction);
}


// Conversation history
export interface DialogMessage {
  type: "character" | "player";
  text: string;
  characterName?: string | CHARACTERS;
  animated?: boolean;
}




export class StoryManager {
  static instance: StoryManager;

  // Store stories for each scene
  static stories: Map<GameScene, Story> = new Map();
  // current state

  static conversationHistory: DialogMessage[] = [];
  static currentStory?: Story;

  static currentCharacter?: Character;
  static modal: Modal;



  constructor() {
    if (StoryManager.instance)
      throw new Error("StoryManager already exists");
    StoryManager.instance = this;
    StoryManager.modal = new Modal();


  }

  init() {
    try {
      console.log(inkStory);
      // Main story
      // associates GameScene with the appropriate Story 
      const StoryMap = {
        [GameScene.Tutorial]: tutorialStory,
        [GameScene.Main]: inkStory,
        [GameScene.Ending]: endingStory
      }
      Object.entries(StoryMap).forEach(([sceneName, inkTxt]) => StoryManager.stories.set(sceneName as GameScene, new InkCompiler(inkTxt).Compile()));

      // binds external functions to all stories 
      const externalFunctions: ExternalFunctions = {
        switchToCharacter,
        switchToMainGame,
        switchToScene,
        closeModal,
        openModal,
        nextScene
      }
      bindExternalFunctions(externalFunctions);


      // Set current story to tutorial (will be switched by Game.init())
      StoryManager.currentStory = StoryManager.FetchStory(GameScene.Tutorial);

    } catch (error) {
      console.error("Error initializing stories:", error);
      throw error;
    }
  }



  static StartConversationWith(_character: Character | CHARACTERS | string, startThread?: string) {
    const character = fetchCharacter(_character);

    StoryManager.modal.clearDialogue();
    StoryManager.modal.ClearChoices();
    switchToCharacter(character);

    // the each characters start thread is their name 
    StoryManager.currentStory?.ChoosePathString(startThread || character.name);
    StoryManager.continueStory();

    // open last so its all initalised when it displays it. 
    openModal();
  }

  // progresses the current story. 
  static async continueStory() {
    const story = StoryManager.currentStory;

    if (!story)
      throw new Error("currentStory not set");

    await StoryManager.modal.displayText(story);
  }

  static FetchStory(scene: GameScene): Story {
    if (!StoryManager.stories.has(scene))
      throw new Error(`couldn't fetchStory: ${scene}, story of that name doesnt exist within StoryManager.stories`);
    return StoryManager.stories.get(scene) as Story;
  }

  static openModal = openModal;
  static closeModal = closeModal;
}




export function fetchCharacter(character: Character | CHARACTERS | string): Character {
  // character by name to Character (a sanitation process so we can reliably use Character type, but still pass in string names when needed)
  return (character instanceof Character) ? character as Character : characters[character];
}




// EXTERNAL FUNCTIONS 
export const switchToCharacter = (name: Character | CHARACTERS | string) => StoryManager.modal.switchToCharacter(name);
export const switchToMainGame = () => Game.instance.sceneManager.switchToScene(GameScene.Main);


export function switchToScene(scene: GameScene | string) {
  // switches the actualGameScene
  Game.instance.sceneManager.switchToScene(scene);
  // loads the story from the scene
  loadInkScene(scene as GameScene);
}

// Switch to a different scene's story
export function loadInkScene(scene: GameScene, startKnot?: string) {

  const story = StoryManager.stories.get(scene);
  if (!story) {
    console.error(`Story not found for scene: ${scene}`);
    return;
  }

  // set current story 
  StoryManager.currentStory = story;
  // Clear conversation history when switching scenes (not needed, as new conversation will always clear it) // StoryManager.modal.clearDialogueContainer();

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