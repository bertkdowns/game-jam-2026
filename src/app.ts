//@ts-ignore
import { Game } from "@game/Game";


// Initialize and start the game
const game = Game.getInstance();
await game.init();
game.start(); 
