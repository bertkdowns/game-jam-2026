# Scene Management Usage Guide

This guide explains how to use the scene management system to switch between tutorial, main, and ending scenes.

## Overview

The game now supports three distinct scenes:
- **Tutorial Scene**: Introduction/tutorial environment
- **Main Scene**: The main ballroom game environment
- **Ending Scene**: Final scene/credits environment

Each scene has:
- Its own ink script file (`tutorial.ink`, `inkstory.ink`, `ending.ink`)
- Separate environment setup (different entities visible/hidden)
- Independent story state

## Switching Scenes

### From Game.ts

```typescript
import { Game } from "./game/Game";
import { GameScene } from "./game/scenes";

const game = Game.getInstance();

// Switch to tutorial scene
game.switchToScene(GameScene.Tutorial);

// Switch to main scene
game.switchToScene(GameScene.Main);

// Switch to ending scene
game.switchToScene(GameScene.Ending);
```

### From Ink Scripts

You can switch scenes from within ink scripts by binding external functions. Add this to your ink script:

```ink
EXTERNAL switchToTutorial()
EXTERNAL switchToMain()
EXTERNAL switchToEnding()

== SomeKnot
You've completed the tutorial!
* [Start Main Game] {switchToMain()} -> END
```

Then bind these functions in your code:

```typescript
import { Game } from "./game/Game";
import { GameScene } from "./game/scenes";
import { getGameStory } from "./inkle/index";

const game = Game.getInstance();

// Bind scene switching functions to ink
const story = getGameStory();
story.BindExternalFunction("switchToTutorial", () => {
  game.switchToScene(GameScene.Tutorial);
});
story.BindExternalFunction("switchToMain", () => {
  game.switchToScene(GameScene.Main);
});
story.BindExternalFunction("switchToEnding", () => {
  game.switchToScene(GameScene.Ending);
});
```

## Customizing Scenes

### Adding Scene-Specific Entities

Edit the scene setup functions in `Game.ts`:

```typescript
setupTutorialScene() {
  // ... existing code ...
  
  // Add tutorial-specific entities
  // Example: tutorial markers, instructions, etc.
  this.createTutorialMarker([0, 0, 0]);
}
```

### Modifying Ink Scripts

Each scene has its own ink file:
- `inkle/tutorial.ink` - Tutorial dialogue
- `inkle/inkstory.ink` - Main game dialogue
- `inkle/ending.ink` - Ending dialogue

Edit these files to customize the dialogue for each scene.

## Scene Configuration

Scene configurations are defined in `game/scenes.ts`:

```typescript
export const SCENE_CONFIGS: Record<GameScene, SceneConfig> = {
  [GameScene.Tutorial]: {
    name: GameScene.Tutorial,
    inkFile: "tutorial.ink",
    startKnot: "Start",
  },
  // ...
};
```

You can modify the `startKnot` to change where each scene's story begins.

## Example: Starting with Tutorial

To start the game with the tutorial scene, modify `main.ts`:

```typescript
import { Game } from "./game/Game";
import { GameScene } from "./game/scenes";

const game = Game.getInstance();
await game.init();

// Start with tutorial instead of main scene
game.switchToScene(GameScene.Tutorial);
```
