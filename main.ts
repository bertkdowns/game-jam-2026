import { Game } from "./game/Game.js";

// Initialize and start the game
const game = Game.getInstance();
await game.init();
