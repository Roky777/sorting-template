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
  const ENTRY_GAP = 28;
  const DEFAULT_ITEM_WIDTH = 145;
  const MIN_SPAWN_SPACING_RATIO = 0.2;
  const MISS_PENALTY = 10;
  let beltWidth = window.innerWidth;

  const itemKey = (item) => item.name;
  const visualScaleFor = (item) => {
    if (/coin|marble|bangle/i.test(item.name)) return 0.82;
    if (/pencil|ruler|stick|candle|rope/i.test(item.name)) return 1.08;
    if (/orange|ball|football/i.test(item.name)) return 0.98;
    return 1;
  };
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
    const start = level().occupancyStart ?? 2;
    const target = level().occupancyTarget ?? 3;
    const rampAt = level().occupancyRampAt ?? 2;
    const responsiveLimit = beltWidth < 700 ? 2 : beltWidth < 1100 ? 3 : 5;
    if (state.completedMastery >= rampAt) return Math.min(target, responsiveLimit);
    if (start === 1 && state.completedMastery > 0) return Math.min(2, target, responsiveLimit);
    return Math.min(start, responsiveLimit);
  };
  const minOnBelt = () => Math.min(2, maxOnBelt());

  const itemWidthFor = (width = beltWidth) => Math.max(78, Math.min(DEFAULT_ITEM_WIDTH, width * 0.1));

  function entryIsClear() {
    const itemWidth = itemWidthFor();
    // New items launch only after the previous item has travelled far enough
    // into the lane. Once launched, every item moves independently, so a
    // dragged/returning object can never create a queue at the belt exit.
    const launchClearance = Math.max(itemWidth + ENTRY_GAP, beltWidth * MIN_SPAWN_SPACING_RATIO);
    return !state.activeItems.some((item) => (item.x ?? -itemWidth) < launchClearance);
  }

  function syncItemPosition(item) {
    const element = document.querySelector(`[data-draggable-item][data-item-id="${item.id}"]`);
    if (element && !element.classList.contains("game-item--dragging")) element.style.left = `${item.x}px`;
  }

  function advanceItems({ detail }) {
    if (state.paused || state.completedLevel || state.completedMastery >= state.totalRequired || !detail?.dx) return;
    beltWidth = detail.width;
    const itemWidth = itemWidthFor(detail.width);
    const moving = state.activeItems.filter((item) => item.beltState === "moving");

    for (const item of moving) {
      item.width = itemWidth;
      if (!Number.isFinite(item.x)) item.x = -itemWidth - ENTRY_GAP;
      item.x += detail.dx;
      syncItemPosition(item);
    }

    // `x` is the item's left edge. Crossing the lane width means the complete
    // object has visibly passed out of the right side before the miss fires.
    const missed = moving.filter((item) => item.x >= detail.width);
    if (missed.length) handleMissedItems(missed);
  }

  function handleMissedItems(missedItems) {
    const missedIds = new Set(missedItems.map((item) => item.id));
    state.activeItems = state.activeItems.filter((item) => !missedIds.has(item.id));
    if (missedIds.has(Number(state.selectedItemId))) state.selectedItemId = null;
    for (const missedItem of missedItems) {
      const mastery = state.mastery[itemKey(missedItem)];
      mastery.wrong += 1;
      mastery.mistakesSinceCorrect += 1;
      state.weakItemQueue.push({
        item: missedItem,
        readyAt: state.spawnCount + 2 + Math.floor(Math.random() * 4),
      });
    }
    state.attempts += missedItems.length;
    state.levelAttempts += missedItems.length;
    state.correctStreak = 0;
    state.score -= MISS_PENALTY * missedItems.length;
    state.levelScore -= MISS_PENALTY * missedItems.length;
    state.feedback = {
      type: "missed",
      message: missedItems.length > 1 ? `Missed ${missedItems.length}! −${MISS_PENALTY * missedItems.length}` : `Missed! −${MISS_PENALTY}`,
    };
    sounds.retry();
    render();
    window.clearTimeout(feedbackTimer);
    feedbackTimer = window.setTimeout(() => {
      if (state.feedback?.type === "missed") {
        state.feedback = null;
        render();
      }
    }, 520);
    ensureBeltPopulation();
  }

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
    const hasUnseenItems = level().items.some((item) => state.mastery[itemKey(item)]?.lastSeen === -99 && !active.has(itemKey(item)));
    const readyWeak = !hasUnseenItems && state.weakItemQueue.find((entry) => state.spawnCount >= entry.readyAt && eligible(entry.item) && allowsCategory(entry.item.answer));
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
      if (state.paused || state.completedLevel || state.completedMastery >= state.totalRequired) return;
      if (state.activeItems.length >= maxOnBelt()) return;
      // Never place a new card on top of one that is still entering the lane.
      if (!entryIsClear()) return scheduleSpawn(220 + Math.random() * 120);
      const source = pickNextItem();
      // A blocked entry or temporarily ineligible bag must retry; it must
      // never silently leave the conveyor under-populated.
      if (!source) return scheduleSpawn(260 + Math.random() * 140);
      const key = itemKey(source);
      state.mastery[key].lastSeen = ++state.spawnCount;
      state.lastCategory = source.answer;
      state.categoryHistory.push(source.answer);
      if (state.categoryHistory.length > 6) state.categoryHistory.shift();
      state.activeItems.push({
        ...source,
        id: state.itemSerial += 1,
        spawnOrder: state.spawnCount,
        visualScale: visualScaleFor(source),
        rotation: source.answer === "long" ? -8 + Math.random() * 16 : 0,
        x: -DEFAULT_ITEM_WIDTH - ENTRY_GAP,
        width: DEFAULT_ITEM_WIDTH,
        beltState: "moving",
      });
      render();
      if (state.activeItems.length < maxOnBelt()) scheduleSpawn(360 + Math.random() * 240);
    }, delay);
  }

  function ensureBeltPopulation() {
    if (state.paused || state.completedLevel || state.completedMastery >= state.totalRequired) return;
    if (state.activeItems.length < minOnBelt()) scheduleSpawn(120);
    else if (state.activeItems.length < maxOnBelt()) scheduleSpawn(520 + Math.random() * 280);
  }

  function loadBelt() {
    const carryWeakNames = new Set(state.carryWeakNames);
    state.activeItems = [];
    state.spawnCount = 0;
    state.lastCategory = null;
    state.spawnBag = [];
    state.weakItemQueue = [];
    state.categoryHistory = [];
    state.mastery = Object.fromEntries(level().items.map((item) => [itemKey(item), {
      correct: 0, wrong: 0, mistakesSinceCorrect: 0, lastSeen: -99,
    }]));
    state.weakItemQueue = level().items
      .filter((item) => carryWeakNames.has(item.name))
      .map((item, index) => ({ item, readyAt: index * 2 }));
    state.carryWeakNames = [];
    state.totalRequired = level().goal;
    state.completedMastery = 0;
    state.correctStreak = 0;
    state.sortedCategories = [];
    state.reachedMilestones = [];
    state.specialRewards = [];
    state.lastCorrectByCategory = {};
    state.levelAttempts = 0;
    state.levelFirstTryCorrect = 0;
    state.levelScore = 0;
    state.hintCategory = null;
    scheduleSpawn(550);
  }

  function render() {
    renderHud(state, level());
    renderScene(state, level());
    renderGameUi(state, level());
  }

  function finishLevel() {
    if (state.completedLevel) return;
    state.activeItems = [];
    const starBaseline = state.totalRequired * 10 + Math.floor(state.totalRequired / 5) * 5;
    const starRatio = starBaseline ? state.levelScore / starBaseline : 1;
    state.stars = starRatio >= 0.8 ? 3 : starRatio >= 0.45 ? 2 : 1;
    state.campaignStars += state.stars;
    state.completedLevel = true;
    state.feedback = { type: "complete", message: "Wonderful sorting!" };
    render();
    sounds.complete(state.stars);
  }

  function choose(itemId, category) {
    const activeItem = state.activeItems.find((candidate) => String(candidate.id) === String(itemId));
    if (state.paused || state.completedLevel || state.placed || !activeItem) return;
    const correct = activeItem.answer === category;
    if (correct) {
      const mastery = state.mastery[itemKey(activeItem)];
      const wasMastered = mastery.correct >= level().requiredCorrectPerItem;
      const beforeProgress = state.totalRequired ? state.completedMastery / state.totalRequired : 0;
      const firstTry = mastery.mistakesSinceCorrect === 0;
      const points = 10;
      mastery.correct += 1;
      mastery.mistakesSinceCorrect = 0;
      state.completedMastery = Math.min(state.totalRequired, state.completedMastery + 1);
      state.attempts += 1;
      state.levelAttempts += 1;
      if (firstTry) {
        state.firstTryCorrect += 1;
        state.levelFirstTryCorrect += 1;
      }
      state.correctStreak += 1;
      let bonus = 0;
      let rewardTitle;
      const newlyMastered = !wasMastered && mastery.correct === level().requiredCorrectPerItem;
      if (state.correctStreak % 5 === 0) bonus = 5;
      if (!state.sortedCategories.includes(activeItem.answer)) state.sortedCategories.push(activeItem.answer);
      const previousInCategory = state.lastCorrectByCategory[activeItem.answer];
      if (state.levelIndex === 2 && previousInCategory && previousInCategory !== activeItem.name && !state.specialRewards.includes("family-insight")) {
        state.specialRewards.push("family-insight");
        rewardTitle = "Same shape family!";
      }
      if (state.levelIndex === 5 && !state.specialRewards.includes(`motion-${activeItem.answer}`)) {
        state.specialRewards.push(`motion-${activeItem.answer}`);
        rewardTitle = activeItem.answer === "rolls" ? "It rolls!" : "It slides!";
      }
      state.lastCorrectByCategory[activeItem.answer] = activeItem.name;
      state.score += points + bonus;
      state.levelScore += points + bonus;
      state.correct += 1;
      state.placed = { art: activeItem.art, assetSet: activeItem.assetSet, category };
      state.selectedItemId = null;
      state.activeItems = state.activeItems.filter((candidate) => candidate.id !== activeItem.id);
      if (state.completedMastery >= state.totalRequired) state.activeItems = [];
      // The dropped item is now owned by the short bin animation, not the belt.
      render();
      sounds.drop();
      ensureBeltPopulation();
      window.clearTimeout(advanceTimer);
      window.clearTimeout(feedbackTimer);
      advanceTimer = window.setTimeout(() => {
        // Remove it before presenting feedback or allowing the next belt item.
        state.placed = null;
        state.feedback = {
          type: newlyMastered ? "mastered" : "correct",
          message: `${rewardTitle ?? (newlyMastered ? "Mastered!" : "Great job!")} +${points + bonus}`,
          category,
        };
        sounds.success();
        const afterProgress = state.totalRequired ? state.completedMastery / state.totalRequired : 0;
        const milestone = [0.25, 0.5, 0.75].find((value) => beforeProgress < value && afterProgress >= value && !state.reachedMilestones.includes(value));
        if (milestone) {
          state.reachedMilestones.push(milestone);
          sounds.milestone();
        }
        render();
        feedbackTimer = window.setTimeout(() => {
          if (state.completedMastery >= state.totalRequired) return finishLevel();
          state.feedback = null;
          render();
          ensureBeltPopulation();
        }, 280);
      }, 260);
      return;
    }
    const mastery = state.mastery[itemKey(activeItem)];
    mastery.wrong += 1;
    mastery.mistakesSinceCorrect += 1;
    state.attempts += 1;
    state.levelAttempts += 1;
    state.correctStreak = 0;
    state.score -= 10;
    state.levelScore -= 10;
    // A wrong item snaps back onto the moving belt immediately. Pausing it here
    // would let following objects catch up and visually form a stack.
    activeItem.beltState = "moving";
    state.hintCategory = mastery.wrong >= 2 ? activeItem.answer : null;
    state.selectedItemId = null;
    state.feedback = {
      type: "wrong",
      message: mastery.wrong >= 3 ? "Try the glowing box −10" : mastery.wrong >= 2 ? "Look at the shape clue −10" : "Try again! −10",
      category,
    };
    sounds.retry();
    render();
    const returnLevel = state.levelIndex;
    const hintDuration = mastery.wrong >= 2 ? 900 : 320;
    window.setTimeout(() => {
      if (state.levelIndex !== returnLevel) return;
      if (state.feedback?.type === "wrong") state.feedback = null;
      state.hintCategory = null;
      render();
      ensureBeltPopulation();
    }, hintDuration);
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
    // Closely related picture-challenge levels begin by revisiting concepts
    // that caused difficulty in their preceding supported level.
    state.carryWeakNames = [0, 5, 7].includes(state.levelIndex)
      ? Object.entries(state.mastery).filter(([, value]) => value.wrong > 0).map(([name]) => name)
      : [];
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

  function retryLevel() {
    window.clearTimeout(advanceTimer);
    window.clearTimeout(feedbackTimer);
    window.clearTimeout(spawnTimer);
    spawnTimer = undefined;
    state.score -= state.levelScore;
    state.correct = Math.max(0, state.correct - state.completedMastery);
    state.campaignStars = Math.max(0, state.campaignStars - state.stars);
    state.stars = 0;
    state.feedback = null;
    state.placed = null;
    state.completedLevel = false;
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
    if (action.type === "retry-level") retryLevel();
    if (action.type === "restart") restart();
  }

  function start() {
    window.addEventListener("conveyor-motion", advanceItems);
    document.querySelector("#sound-button").addEventListener("click", () => {
      state.muted = !state.muted;
      sounds.setMuted(state.muted);
      document.querySelector("#sound-button").setAttribute("aria-pressed", String(state.muted));
      render();
    });
    document.querySelector("#back-button")?.addEventListener("click", () => dispatch("pause"));
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      if (button.dataset.action === "next") dispatch({ type: "next" });
      if (button.dataset.action === "retry-level") dispatch({ type: "retry-level" });
      if (button.dataset.action === "restart") dispatch({ type: "restart" });
    });
    document.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key) || state.paused || state.completedLevel || state.placed) return;
      const itemTarget = event.target.closest?.("[data-draggable-item]");
      if (itemTarget) {
        state.selectedItemId = itemTarget.dataset.itemId;
        sounds.pickup();
        render();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const binTarget = event.target.closest?.("[data-drop-category]");
      if (binTarget && state.selectedItemId) {
        choose(state.selectedItemId, binTarget.dataset.dropCategory);
        event.preventDefault();
        event.stopPropagation();
      }
    });
    document.addEventListener("pointerdown", (event) => {
      const target = event.target.closest("[data-draggable-item]");
      if (!target || state.paused || state.completedLevel || state.placed) return;
      const layer = document.querySelector("#belt-item-layer");
      const bounds = layer.getBoundingClientRect();
      const itemBounds = target.getBoundingClientRect();
      drag = {
        target, layer, bounds, width: itemBounds.width, height: itemBounds.height, pointerId: event.pointerId,
        offsetX: event.clientX - itemBounds.left, offsetY: event.clientY - itemBounds.top,
      };
      const activeItem = state.activeItems.find((item) => String(item.id) === String(target.dataset.itemId));
      if (activeItem) activeItem.beltState = "dragging";
      state.selectedItemId = null;
      sounds.pickup();
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
      const activeItem = state.activeItems.find((item) => String(item.id) === String(drag.target.dataset.itemId));
      if (activeItem) activeItem.x = Math.max(-drag.width * 0.25, Math.min(x, drag.bounds.width - drag.width * 0.75));
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
      else {
        const activeItem = state.activeItems.find((item) => String(item.id) === String(draggedItemId));
        if (activeItem) activeItem.beltState = "moving";
        render();
      }
    });
    document.addEventListener("pointercancel", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const activeItem = state.activeItems.find((item) => String(item.id) === String(drag.target.dataset.itemId));
      if (activeItem) activeItem.beltState = "moving";
      drag.target.releasePointerCapture?.(event.pointerId);
      document.querySelectorAll("[data-drop-category]").forEach((bin) => bin.classList.remove("sorting-bin--active-drop"));
      drag = null;
      render();
    });
    bindInput(dispatch);
    loadBelt();
    // Self-healing guard: a missed timer or blocked entrance gets another
    // opportunity every short tick, while the guarded scheduler avoids floods.
    refillTimer = window.setInterval(ensureBeltPopulation, 350);
    render();
  }

  function enableAudio() {
    sounds.startMusic();
  }

  return { start, dispatch, state, enableAudio };
}
