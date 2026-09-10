import { getLevel, MATH_LEVELS } from "../data/math-levels.js";
import { createInitialState } from "./state.js";
import { bindInput } from "./input.js";
import { createSounds } from "./sounds.js";
import { renderHud } from "../render/hud.js";
import { renderScene } from "../render/scene.js";
import { renderGameUi } from "../ui/game-ui.js";

export function createGame() {
  const state = createInitialState();
  let advanceTimer;
  let feedbackTimer;
  let spawnTimer;
  let refillTimer;
  let drag;
  const sounds = createSounds();
  const level = () => getLevel(state.levelIndex);

  const itemKey = (item) => item.name;
  const activeKeys = () => new Set(state.activeItems.map(itemKey));
  const shuffle = (items) => {
    const bag = [...items];
    for (let index = bag.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [bag[index], bag[swap]] = [bag[swap], bag[index]];
    }
    return bag;
  };
  const maxOnBelt = () => {
    // Outside an explicit tutorial, a live conveyor settles at three objects.
    return 3;
  };
  const minOnBelt = () => 2;

  function refillBag() {
    const available = level().items.filter((item) => state.mastery[itemKey(item)]?.correct < level().requiredCorrectPerItem);
    state.spawnBag = shuffle(available);
  }

  function allowsCategory(category) {
    const history = state.categoryHistory;
    if (history.length >= 2 && history.at(-1) === category && history.at(-2) === category) return false;
    // Break an overly predictable A-B-A-B-A-B run with a valid paired category.
    if (history.length >= 5 && history.slice(-5).every((value, index, values) => index === 0 || value !== values[index - 1])) return category === history.at(-1);
    return true;
  }

  function pickNextItem() {
    const active = activeKeys();
    const eligible = (item) => state.mastery[itemKey(item)]?.correct < level().requiredCorrectPerItem && !active.has(itemKey(item));
    const readyWeak = state.weakItemQueue.find((entry) => state.spawnCount >= entry.readyAt && eligible(entry.item) && allowsCategory(entry.item.answer));
    if (readyWeak) {
      state.weakItemQueue = state.weakItemQueue.filter((entry) => entry !== readyWeak);
      return readyWeak.item;
    }
    if (!state.spawnBag.some(eligible)) refillBag();
    let candidates = state.spawnBag.filter((item) => eligible(item) && allowsCategory(item.answer));
    if (!candidates.length) candidates = state.spawnBag.filter(eligible);
    if (!candidates.length) return null;
    // Bag order is shuffled once per cycle; selecting its first valid item makes
    // every remaining material appear before the bag is rebuilt.
    const next = candidates[0];
    state.spawnBag = state.spawnBag.filter((item) => item !== next);
    return next;
  }

  function scheduleSpawn(delay = 0) {
    if (spawnTimer) return;
    spawnTimer = window.setTimeout(() => {
      spawnTimer = undefined;
      if (state.paused || state.completedLevel || state.placed) return;
      if (state.activeItems.length >= maxOnBelt()) return;
      const source = pickNextItem();
      // A blocked entry or temporarily ineligible bag must retry; it must
      // never silently leave the conveyor under-populated.
      if (!source) return scheduleSpawn(260 + Math.random() * 140);
      const key = itemKey(source);
      state.mastery[key].lastSeen = ++state.spawnCount;
      state.lastCategory = source.answer;
      state.categoryHistory.push(source.answer);
      if (state.categoryHistory.length > 6) state.categoryHistory.shift();
      state.activeItems.push({ ...source, id: state.itemSerial += 1, phase: state.activeItems.length * .22, slot: state.activeItems.length });
      render();
      if (state.activeItems.length < maxOnBelt()) scheduleSpawn(360 + Math.random() * 240);
    }, delay);
  }

  function ensureBeltPopulation() {
    if (state.paused || state.completedLevel || state.placed || state.feedback) return;
    if (state.activeItems.length < minOnBelt()) scheduleSpawn(120);
    else if (state.activeItems.length < maxOnBelt()) scheduleSpawn(520 + Math.random() * 280);
  }

  function loadBelt() {
    state.activeItems = [];
    state.spawnCount = 0;
    state.lastCategory = null;
    state.spawnBag = [];
    state.weakItemQueue = [];
    state.categoryHistory = [];
    state.mastery = Object.fromEntries(level().items.map((item) => [itemKey(item), { correct: 0, wrong: 0, lastSeen: -99 }]));
    state.totalRequired = level().items.length * level().requiredCorrectPerItem;
    state.completedMastery = 0;
    scheduleSpawn(0);
  }

  function render() {
    renderHud(state, level());
    renderScene(state, level());
    renderGameUi(state, level());
  }

  function finishLevel() {
    state.score += 50;
    state.stars = Math.max(1, Math.ceil((state.completedMastery / state.totalRequired) * state.maxStars));
    state.completedLevel = true;
    state.feedback = { type: "complete", message: "Wonderful sorting!" };
    render();
  }

  function choose(itemId, category) {
    const activeItem = state.activeItems.find((candidate) => String(candidate.id) === String(itemId));
    if (state.paused || state.completedLevel || state.feedback || state.placed || !activeItem) return;
    const correct = activeItem.answer === category;
    if (correct) {
      const mastery = state.mastery[itemKey(activeItem)];
      const wasMastered = mastery.correct >= level().requiredCorrectPerItem;
      const points = mastery.wrong ? 7 : 10;
      mastery.correct += 1;
      state.completedMastery += 1;
      state.score += points;
      if (!wasMastered && mastery.correct === level().requiredCorrectPerItem) state.score += 15;
      state.correct += 1;
      state.placed = { art: activeItem.art, assetSet: activeItem.assetSet, category };
      state.activeItems = state.activeItems.filter((candidate) => candidate.id !== activeItem.id);
      // The dropped item is now owned by the short bin animation, not the belt.
      render();
      sounds.drop();
      window.clearTimeout(advanceTimer);
      window.clearTimeout(feedbackTimer);
      advanceTimer = window.setTimeout(() => {
        // Remove it before presenting feedback or allowing the next belt item.
        state.placed = null;
        state.feedback = { type: "correct", message: "Great job!", category };
        sounds.success();
        render();
        feedbackTimer = window.setTimeout(() => {
          if (state.completedMastery >= state.totalRequired) return finishLevel();
          state.feedback = null;
          render();
          ensureBeltPopulation();
        }, 280);
      }, 410);
      return;
    }
    state.mastery[itemKey(activeItem)].wrong += 1;
    state.weakItemQueue.push({ item: activeItem, readyAt: state.spawnCount + 2 + Math.floor(Math.random() * 4) });
    // Remove the rejected object from the active belt; its queued return is
    // deliberately spaced behind other materials rather than immediate.
    state.activeItems = state.activeItems.filter((candidate) => candidate.id !== activeItem.id);
    state.feedback = { type: "wrong", message: "Try again!", category };
    sounds.retry();
    render();
    window.clearTimeout(advanceTimer);
    advanceTimer = window.setTimeout(() => {
      state.feedback = null;
      render();
      ensureBeltPopulation();
    }, 600);
  }

  function nextLevel() {
    window.clearTimeout(advanceTimer);
    window.clearTimeout(feedbackTimer);
    window.clearTimeout(spawnTimer);
    spawnTimer = undefined;
    if (state.levelIndex === MATH_LEVELS.length - 1) {
      state.screen = "complete";
      return render();
    }
    state.levelIndex += 1;
    state.level = state.levelIndex + 1;
    state.itemIndex = 0;
    state.correct = 0;
    state.stars = 0;
    state.feedback = null;
    state.placed = null;
    state.completedLevel = false;
    loadBelt();
    render();
  }

  function restart() {
    window.clearTimeout(advanceTimer);
    window.clearTimeout(feedbackTimer);
    window.clearTimeout(spawnTimer);
    spawnTimer = undefined;
    Object.assign(state, createInitialState());
    loadBelt();
    render();
  }

  function dispatch(action) {
    if (typeof action === "string") {
      if (action === "pause") state.paused = !state.paused;
      if (action === "confirm" && state.completedLevel) nextLevel();
      return render();
    }
    if (action.type === "sort") choose(action.category);
    if (action.type === "next") nextLevel();
    if (action.type === "restart") restart();
  }

  function start() {
    document.querySelector("#sound-button").addEventListener("click", () => {
      state.muted = !state.muted;
      sounds.setMuted(state.muted);
      document.querySelector("#sound-button").setAttribute("aria-pressed", String(state.muted));
    });
    document.querySelector("#back-button")?.addEventListener("click", () => dispatch("pause"));
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      if (button.dataset.action === "next") dispatch({ type: "next" });
      if (button.dataset.action === "restart") dispatch({ type: "restart" });
    });
    document.addEventListener("pointerdown", (event) => {
      const target = event.target.closest("[data-draggable-item]");
      if (!target || state.paused || state.completedLevel || state.feedback || state.placed) return;
      const layer = document.querySelector("#belt-item-layer");
      const bounds = layer.getBoundingClientRect();
      const itemBounds = target.getBoundingClientRect();
      drag = {
        target, layer, bounds, width: itemBounds.width, height: itemBounds.height, pointerId: event.pointerId,
        offsetX: event.clientX - itemBounds.left, offsetY: event.clientY - itemBounds.top,
      };
      target.setPointerCapture(event.pointerId);
      target.classList.add("game-item--dragging");
      target.style.animation = "none";
      event.preventDefault();
    });
    document.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const x = event.clientX - drag.bounds.left - drag.offsetX;
      const y = event.clientY - drag.bounds.top - drag.offsetY;
      drag.target.style.left = `${Math.max(-drag.width * 0.25, Math.min(x, drag.bounds.width - drag.width * 0.75))}px`;
      drag.target.style.top = `${Math.max(-drag.height * 0.3, Math.min(y, drag.bounds.height - drag.height * 0.15))}px`;
      drag.target.style.bottom = "auto";
      document.querySelectorAll("[data-drop-category]").forEach((bin) => {
        const rect = bin.getBoundingClientRect();
        const isInside = event.clientX >= rect.left && event.clientX <= rect.right
          && event.clientY >= rect.top && event.clientY <= rect.bottom;
        bin.classList.toggle("sorting-bin--active-drop", isInside);
      });
    });
    document.addEventListener("pointerup", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag.target.style.pointerEvents = "none";
      const droppedOn = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-drop-category]");
      const draggedItemId = drag.target.dataset.itemId;
      drag.target.releasePointerCapture?.(event.pointerId);
      document.querySelectorAll("[data-drop-category]").forEach((bin) => bin.classList.remove("sorting-bin--active-drop"));
      drag = null;
      if (droppedOn) choose(draggedItemId, droppedOn.dataset.dropCategory);
      else render();
    });
    bindInput(dispatch);
    loadBelt();
    // Self-healing guard: a missed timer or blocked entrance gets another
    // opportunity every short tick, while the guarded scheduler avoids floods.
    refillTimer = window.setInterval(ensureBeltPopulation, 350);
    render();
  }

  return { start, dispatch, state };
}
