import { createGame } from "./core/game.js?v=20260923-xp-smooth-1";
import { startConveyorAnimation } from "./render/conveyor.js?v=20260923-runtime-smooth-3";
import { assets, hydrateDeferredImages, preloadImage, preloadLevelAssets } from "./data/assets.js?v=20260923-runtime-smooth-2";
import { MATH_LEVELS } from "./data/math-levels.js";
import { registerRuntimeCache, runStartupLoader, waitForImages } from "./core/startup.js?v=20260923-runtime-smooth-2";

const launchParams = new URLSearchParams(window.location.search);
const requestedLevel = Number(launchParams.get("level"));
const requestedSuccessLevel = Number(launchParams.get("success"));
const isDebugLaunch = (Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 9)
  || (Number.isInteger(requestedSuccessLevel) && requestedSuccessLevel >= 1 && requestedSuccessLevel <= 9);
const game = createGame({ persistProgress: !isDebugLaunch, gameId: "sorting-template" });
let sparky;
let successDance;
let controllerRequest;
let sparkyFrameTime = performance.now();

function loadControllers() {
  if (controllerRequest) return controllerRequest;
  controllerRequest = Promise.all([
    import("./characters/sparky-controller.js?v=20260923-runtime-smooth-2"),
    import("./characters/success-dance-controller.js?v=20260923-runtime-smooth-2"),
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
let preparationRequest;
let bootRequest;
let secondaryWarmupScheduled = false;
const startScreen = document.querySelector("#start-screen");
const startButton = document.querySelector("#start-button");
const loadingScreen = document.querySelector("#loading-screen");

registerRuntimeCache();

function prepareGame() {
  if (preparationRequest) return preparationRequest;
  const characterImages = Object.values(assets.characters);
  const successImages = assets.ui.success;
  const tasks = [
    { label: "Loading the welcome screen…", run: () => waitForImages(startScreen) },
    { label: "Loading the factory…", run: () => hydrateDeferredImages(document.querySelector("#game-stage")) },
    { label: "Waking up Sparky…", run: () => loadControllers() },
    ...MATH_LEVELS.map((level, index) => ({
      label: `Loading challenge ${index + 1} of ${MATH_LEVELS.length}…`,
      run: () => preloadLevelAssets(level),
    })),
    { label: "Preparing Sparky…", run: () => Promise.all(characterImages.map(preloadImage)) },
    { label: "Preparing rewards…", run: () => Promise.all(successImages.map(preloadImage)) },
    { label: "Starting the conveyor…", run: () => preloadImage(assets.ui.conveyorRims) },
    { label: "Tuning the sounds…", run: () => game.prepareAudio() },
    { label: "Loading the game letters…", run: () => document.fonts?.ready ?? Promise.resolve() },
  ];
  preparationRequest = runStartupLoader({ screen: loadingScreen, tasks }).then(() => {
    document.body.classList.add("game-runtime-loaded");
    scheduleSecondaryWarmup();
  });
  return preparationRequest;
}

function scheduleSecondaryWarmup() {
  if (secondaryWarmupScheduled) return;
  secondaryWarmupScheduled = true;
  game.warmSecondaryAudio?.();
}

function bootGame() {
  if (gameBooted) return Promise.resolve();
  if (bootRequest) return bootRequest;
  bootRequest = prepareGame().then(() => {
    gameBooted = true;
    sparky.start();
    sparkyFrameTime = performance.now();
    game.start();
    startConveyorAnimation();
  });
  return bootRequest;
}

function scheduleWarmup() {
  prepareGame().catch((error) => {
    // A click retries the boot path and keeps the start art visible if an
    // unusually early/background preload is interrupted by the browser.
    preparationRequest = undefined;
    console.warn("Game warm-up was interrupted; it will retry on Play.", error);
  });
}

// Let the start screen paint first, then use the child's viewing time to make
// the first playable frame ready before Play is normally pressed.
requestAnimationFrame(() => requestAnimationFrame(scheduleWarmup));

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

startButton.addEventListener("click", async () => {
  if (transitioning) return;
  transitioning = true;
  startButton.disabled = true;
  startButton.setAttribute("aria-busy", "true");
  game.enableAudio();

  try {
    // Never fade to an empty/half-loaded game. Usually this has already
    // completed during the start-screen warm-up and resolves immediately.
    await bootGame();
    startScreen.classList.add("start-screen--leaving");
    await new Promise((resolve) => window.setTimeout(resolve, 260));
    startScreen.hidden = true;
    startScreen.classList.remove("start-screen--leaving");
    game.dispatch({ type: "resume" });
  } catch (error) {
    console.error("Unable to start the game.", error);
  } finally {
    startButton.disabled = false;
    startButton.removeAttribute("aria-busy");
    transitioning = false;
  }
});

window.addEventListener("game-home", () => {
  successDance?.stop();
  sparky?.pause();
  transitioning = false;
  startButton.disabled = false;
  startButton.removeAttribute("aria-busy");
  startScreen.hidden = false;
  startScreen.classList.remove("start-screen--leaving");
});
