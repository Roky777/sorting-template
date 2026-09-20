import { createGame } from "./core/game.js";
import { startConveyorAnimation } from "./render/conveyor.js";

const game = createGame();
const requestedLevel = Number(new URLSearchParams(window.location.search).get("level"));
if (Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 9) {
  game.state.levelIndex = requestedLevel - 1;
  game.state.level = requestedLevel;
}

let transitioning = false;
let gameBooted = false;
const startScreen = document.querySelector("#start-screen");
document.querySelector("#start-button").addEventListener("click", () => {
  if (transitioning) return;
  transitioning = true;
  game.enableAudio();
  startScreen.classList.add("start-screen--leaving");
  window.setTimeout(() => {
    startScreen.hidden = true;
    startScreen.classList.remove("start-screen--leaving");
    if (gameBooted) game.dispatch({ type: "resume" });
    else {
      gameBooted = true;
      game.start();
      startConveyorAnimation();
    }
    transitioning = false;
  }, 260);
});

window.addEventListener("game-home", () => {
  transitioning = false;
  startScreen.hidden = false;
  startScreen.classList.remove("start-screen--leaving");
});
