import { createGame } from "./core/game.js";
import { startConveyorAnimation } from "./render/conveyor.js";
import { hydrateDeferredImages } from "./data/assets.js";

const launchParams = new URLSearchParams(window.location.search);
const requestedLevel = Number(launchParams.get("level"));
const requestedSuccessLevel = Number(launchParams.get("success"));
const isDebugLaunch = (Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 9)
  || (Number.isInteger(requestedSuccessLevel) && requestedSuccessLevel >= 1 && requestedSuccessLevel <= 9);
const game = createGame({ persistProgress: !isDebugLaunch });
let sparky;
let successDance;
let controllerRequest;
let sparkyFrameTime = performance.now();

function loadControllers() {
  if (controllerRequest) return controllerRequest;
  controllerRequest = Promise.all([
    import("./characters/sparky-controller.js"),
    import("./characters/success-dance-controller.js"),
  ]).then(([sparkyModule, danceModule]) => {
    sparky = new sparkyModule.SparkyController(document.querySelector("#sparky"));
    successDance = new danceModule.SuccessDanceController();
  });
  return controllerRequest;
}

window.addEventListener("conveyor-motion", () => {
  const now = performance.now();
  sparky?.update(now - sparkyFrameTime);
  sparkyFrameTime = now;
});
window.addEventListener("sparky-reaction", ({ detail }) => {
  sparky?.play(detail?.name ?? "idle", detail?.options);
});
window.addEventListener("sparky-control", ({ detail }) => {
  if (detail?.type === "pause") sparky?.pause();
  if (detail?.type === "activity") sparky?.noteItemInteraction();
  if (detail?.type === "resume") {
    sparkyFrameTime = performance.now();
    sparky?.resume();
  }
});
window.addEventListener("success-dance-start", () => {
  sparky?.pause();
  successDance?.start();
});
window.addEventListener("success-dance-stop", () => {
  successDance?.stop();
  sparky?.play("idle", { force: true });
  sparkyFrameTime = performance.now();
  sparky?.resume();
});
if (Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 9) {
  game.state.levelIndex = requestedLevel - 1;
  game.state.level = requestedLevel;
}

let transitioning = false;
let gameBooted = false;
let bootRequest;
const startScreen = document.querySelector("#start-screen");

function bootGame() {
  if (gameBooted) return Promise.resolve();
  if (bootRequest) return bootRequest;
  bootRequest = Promise.all([
    hydrateDeferredImages(document.querySelector("#game-stage")),
    loadControllers(),
  ]).then(() => {
    document.body.classList.add("game-runtime-loaded");
    gameBooted = true;
    sparky.start();
    sparkyFrameTime = performance.now();
    game.start();
    startConveyorAnimation();
  });
  return bootRequest;
}

async function openSuccessPreview(levelNumber, stars = 3, score) {
  transitioning = false;
  startScreen.hidden = true;
  startScreen.classList.remove("start-screen--leaving");
  game.enableAudio();
  await bootGame();
  return game.showSuccessPreview(levelNumber, stars, score);
}

const successScreen = {
  open: openSuccessPreview,
  list() {
    const commands = Array.from({ length: 9 }, (_, index) => ({
      level: index + 1,
      command: `successScreen.level${index + 1}()`,
    }));
    console.table(commands);
    console.info("Custom preview: successScreen.open(level, stars, score)");
    return commands;
  },
};

for (let levelNumber = 1; levelNumber <= 9; levelNumber += 1) {
  successScreen[`level${levelNumber}`] = (stars = 3, score) => openSuccessPreview(levelNumber, stars, score);
}

window.successScreen = Object.freeze(successScreen);

const previewParams = launchParams;
if (Number.isInteger(requestedSuccessLevel) && requestedSuccessLevel >= 1 && requestedSuccessLevel <= 9) {
  const requestedStars = Number(previewParams.get("stars")) || 3;
  const requestedScore = previewParams.has("score") ? Number(previewParams.get("score")) : undefined;
  requestAnimationFrame(() => openSuccessPreview(requestedSuccessLevel, requestedStars, requestedScore));
}

document.querySelector("#start-button").addEventListener("click", () => {
  if (transitioning) return;
  transitioning = true;
  game.enableAudio();
  startScreen.classList.add("start-screen--leaving");
  const ready = gameBooted ? Promise.resolve() : bootGame();
  window.setTimeout(async () => {
    await ready;
    startScreen.hidden = true;
    startScreen.classList.remove("start-screen--leaving");
    if (gameBooted) game.dispatch({ type: "resume" });
    transitioning = false;
  }, 260);
});

window.addEventListener("game-home", () => {
  successDance?.stop();
  sparky?.pause();
  transitioning = false;
  startScreen.hidden = false;
  startScreen.classList.remove("start-screen--leaving");
});
