import { createGame } from "./core/game.js";
import { startConveyorAnimation } from "./render/conveyor.js";

const game = createGame();
game.start();
startConveyorAnimation();
