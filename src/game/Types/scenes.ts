// Scene management types and utilities

export enum GameScene {
  Tutorial = "tutorial",
  Main = "main",
  Ending = "ending",
}

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
