import { createGame } from "./core/game.js";
import { startConveyorAnimation } from "./render/conveyor.js";

const game = createGame();
const requestedLevel = Number(new URLSearchParams(window.location.search).get("level"));
if (Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 9) {
  game.state.levelIndex = requestedLevel - 1;
  game.state.level = requestedLevel;
}
game.start();
startConveyorAnimation();
