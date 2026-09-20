import { createGame } from "./core/game.js";
import { startConveyorAnimation } from "./render/conveyor.js";

const game = createGame();
const requestedLevel = Number(new URLSearchParams(window.location.search).get("level"));
if (Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 9) {
  game.state.levelIndex = requestedLevel - 1;
  game.state.level = requestedLevel;
}

let started = false;
const startScreen = document.querySelector("#start-screen");
document.querySelector("#start-button").addEventListener("click", () => {
  if (started) return;
  started = true;
  game.enableAudio();
  startScreen.classList.add("start-screen--leaving");
  window.setTimeout(() => {
    startScreen.hidden = true;
    game.start();
    startConveyorAnimation();
  }, 260);
});
