import { State, StateList, StateOption, StateMachine, GenericStateMachine, Events } from "@components/StateMachine";
import { createBackground, createPlayer, createCharacters, removeAllCharacters } from "@game/Entities";
import { renderAccusations, CHARACTERS, switchToCharacter, switchToScene, loadInkScene } from "@game/inkle";
import { Game } from "./Game";
// Scene management types and utilities



export enum GameScene {
  Tutorial = "Tutorial",
  Main = "Main",
  Ending = "Ending",
}

console.log("GameScene", GameScene);


export type SceneConfig = {
  name: GameScene;
  inkFile: string;
  startKnot?: string;
};

export const SCENE_CONFIGS: Record<GameScene, SceneConfig> = {
  [GameScene.Tutorial]: {
    name: GameScene.Tutorial,
    inkFile: "tutorial.ink",
    startKnot: "Start",
  },
  [GameScene.Main]: {
    name: GameScene.Main,
    inkFile: "inkstory.ink",
    startKnot: "CharacterSelection",
  },
  [GameScene.Ending]: {
    name: GameScene.Ending,
    inkFile: "ending.ink",
    startKnot: "Start",
  },
};




export class SceneManager implements GenericStateMachine<typeof SceneManager> {
  stateMachine: StateMachine<this, typeof SceneManager>;

  constructor() {
    this.stateMachine = new StateMachine(this);
  }

  // setter for state allows some transformation before updating the state
  set state(newState: StateOption) { this.stateMachine.currentState = newState };
  get state(): Events | undefined { return this.stateMachine.currentState };
  get stateName(): string | undefined { return this.stateMachine.stateName };

  /// static as DemoEntity.STATES being able to be accessed outside of any object 
  /// allows us to create functions in other entities and set our state with the correct label   
  static STATES = new StateList({
    [GameScene.Tutorial]: new State(GameScene.Tutorial, {
      onStart: setupTutorialScene,
    }),
    [GameScene.Main]: new State(GameScene.Main, {
      onStart: SetupMainScene,
      onExit: CleanupMainScene,
    }),
    [GameScene.Ending]: new State(GameScene.Ending, {
      onStart: setupEndingScene
    }),
  });

  // Switch to a different scene
  switchToScene(scene: GameScene | string | number) {
    const state = SceneManager.STATES[scene];
    if (!state)
      console.warn(`Unknown scene: ${scene}`);
    this.state = state;
  }
}







// TUTORIAL SCENE 
function setupTutorialScene() {
  loadInkScene(GameScene.Tutorial);
  ShowTutorialBackground();
  switchToCharacter(CHARACTERS.TUTORIAL_CHARACTER);
}

function ShowTutorialBackground() {
  const div = document.getElementById("Background") as HTMLElement;
  div.style.setProperty("background", `url(assets/sprites/intro_background.png) center / contain no-repeat`);
}

// MAIN SCENE 
function SetupMainScene() {

  loadInkScene(GameScene.Main);

  // Create entities
  createBackground(Game.instance);
  createPlayer(Game.instance);
  createCharacters(Game.instance);

  RemoveBackground();
}
function CleanupMainScene() {
  removeAllCharacters(Game.instance);
}

// ENDING SCENE 
function setupEndingScene() {
  loadInkScene(GameScene.Ending);
  ShowEndBackground();
  renderAccusations(); // Render the accusations before switching to ending
}

function RemoveBackground() {
  const div = document.getElementById("Background") as HTMLElement;
  div.style.removeProperty("background");
}


function ShowEndBackground() {
  const div = document.getElementById("Background") as HTMLElement;
  div.style.setProperty("background", `url(assets/sprites/intro_background.png) center / contain no-repeat`);
}








export function nextScene() {
  // finds the current scene's index within the enum GameScene values 
  const currentSceneName = Game.instance.sceneManager.stateName as string;
  const GameSceneNames = Object.values(GameScene) as string[]
  const nextIndex = GameSceneNames.indexOf(currentSceneName) + 1;

  // if we were already at the last scene, warn and return, so it doesnt break switching to a new scene
  if (nextIndex >= GameSceneNames.length) {
    console.warn(`next scene index ${nextIndex} greater than length of sceneEnum ${GameSceneNames.length} `)
    return;
  }
  // switches to the next scene
  const nextSceneName = GameSceneNames[nextIndex];
  switchToScene(nextSceneName);
}

