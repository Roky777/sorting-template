const STORAGE_KEY = "shape-motion-sorter:tutorials:v1";
function readCompletedTutorials() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.map(Number) : []);
  } catch {
    return new Set();
  }
}

function writeCompletedTutorials(completed) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed].sort((a, b) => a - b)));
  } catch {
    // Storage is optional. The current session still completes normally.
  }
}

function escapeAttribute(value) {
  return CSS.escape(String(value));
}

export class TutorialController {
  constructor({
    layer,
    stage,
    spawnExample,
    clearExample,
    requestRender,
    onPracticeCorrect,
    onPracticeWrong,
    onComplete,
    react,
  }) {
    this.layer = layer;
    this.stage = stage;
    this.spawnExample = spawnExample;
    this.clearExample = clearExample;
    this.requestRender = requestRender;
    this.onPracticeCorrect = onPracticeCorrect;
    this.onPracticeWrong = onPracticeWrong;
    this.onComplete = onComplete;
    this.react = react;
    this.completed = readCompletedTutorials();
    this.active = false;
    this.paused = false;
    this.phase = "";
    this.hintLevel = 0;
    this.dragging = false;
    this.presentationCount = 0;
    this.timers = new Set();

    this.layer.addEventListener("click", (event) => {
      const action = event.target.closest("[data-tutorial-action]")?.dataset.tutorialAction;
      if (action === "skip") this.skip();
    });
    this.resizeObserver = new ResizeObserver(() => this.refreshLayout());
    this.resizeObserver.observe(this.stage);
    window.addEventListener("sparky-animation-frame", () => {
      if (this.active) this.refreshLayout();
    });
  }

  startForLevel(level, levelIndex, { force = false } = {}) {
    const config = level?.tutorial;
    const forcedByUrl = new URLSearchParams(location.search).get("tutorial") === "1";
    if (!config || (!force && !forcedByUrl && this.completed.has(levelIndex))) return false;

    this.stop({ clear: true });
    this.active = true;
    this.paused = false;
    this.level = level;
    this.levelIndex = levelIndex;
    this.config = config;
    this.presentationCount = 0;
    this.guideItems = level.bins.map((bin) => ({
      bin,
      item: level.items.find((candidate) => candidate.answer === bin.id),
    })).filter((entry) => entry.item);
    this.layer.hidden = false;
    this.stage.classList.add("tutorial-active");
    this.showDemonstration();
    return true;
  }

  stop({ clear = false } = {}) {
    this.clearTimers();
    this.dragging = false;
    this.stage.classList.remove("tutorial-active", "tutorial-introducing", "tutorial-guiding", "tutorial-paused");
    this.layer.classList.remove("tutorial-layer--child-active", "tutorial-layer--paused", "tutorial-layer--demonstrating");
    if (clear) this.clearExample();
    this.active = false;
    this.phase = "";
    this.layer.hidden = true;
    this.layer.replaceChildren();
  }

  pause() {
    if (!this.active) return;
    this.paused = true;
    this.clearTimers();
    this.layer.classList.add("tutorial-layer--paused");
    this.stage.classList.add("tutorial-paused");
  }

  resume() {
    if (!this.active) return;
    this.paused = false;
    this.layer.classList.remove("tutorial-layer--paused");
    this.stage.classList.remove("tutorial-paused");
    this.render();
  }

  canInteract(itemId) {
    if (!this.active) return true;
    return this.phase === "guide" && String(itemId) === String(this.exampleItemId);
  }

  noteInteraction(isDragging) {
    if (!this.active || this.phase !== "guide") return;
    this.dragging = isDragging;
    this.clearTimers();
    this.layer.classList.toggle("tutorial-layer--child-active", isDragging);
  }

  handleChoice(item, category) {
    if (!this.active || this.phase !== "guide" || !item?.tutorialMode) return false;
    this.noteInteraction(false);
    if (item.answer !== category) {
      this.hintLevel = 4;
      this.onPracticeWrong(item.answer);
      this.react("thinking", { force: true });
      this.render();
      return true;
    }

    this.clearTimers();
    this.phase = "transition";
    this.onPracticeCorrect(item, category);
    this.react("nod", { force: true });
    this.render();
    this.schedule(() => {
      const nextStep = this.guideIndex + 1;
      if (nextStep < this.guideItems.length) this.showGuidedStep(nextStep);
      else this.showCompletion();
    }, 680);
    return true;
  }

  showDemonstration() {
    const entry = this.guideItems[0];
    if (!entry) return this.showCompletion();
    this.clearTimers();
    this.clearExample();
    this.phase = "demonstration";
    this.guideIndex = 0;
    this.currentItem = entry.item;
    this.currentCategory = entry.bin;
    this.currentStep = { instruction: "Watch!" };
    this.hintLevel = 0;
    this.dragging = false;
    this.exampleItemId = this.spawnExample(entry.item, "watch");
    this.playPresentation();
    this.requestRender();
    this.render();
    this.schedule(() => {
      if (!this.active || this.phase !== "demonstration") return;
      this.phase = "transition";
      this.onPracticeCorrect({ ...entry.item, id: this.exampleItemId }, entry.bin.id);
      this.react("nod", { force: true });
      this.render();
      this.schedule(() => {
        if (this.guideItems.length > 1) this.showGuidedStep(1);
        else this.showCompletion();
      }, 520);
    }, 1750);
  }

  skip() {
    if (!this.active) return;
    this.finish();
  }

  showGuidedStep(index) {
    const entry = this.guideItems[index];
    if (!entry) return this.showCompletion();
    this.clearTimers();
    this.clearExample();
    this.phase = "guide";
    this.guideIndex = index;
    this.currentItem = entry.item;
    this.currentCategory = entry.bin;
    this.currentStep = { instruction: `Drag ${entry.item.name} to ${entry.bin.label}.`, allowHints: true };
    this.hintLevel = 4;
    this.dragging = false;
    this.exampleItemId = this.spawnExample(entry.item, "try");
    this.playPresentation();
    this.requestRender();
    this.render();
  }

  showCompletion() {
    if (!this.active) return;
    this.clearTimers();
    this.clearExample();
    this.phase = "complete";
    this.currentStep = this.config.steps.find((candidate) => candidate.type === "completion")
      ?? { instruction: "Great work! Now keep sorting." };
    this.hintLevel = 0;
    this.requestRender();
    this.react("happy", { force: true });
    this.render();
    this.schedule(() => this.finish(), 900);
  }

  finish() {
    if (!this.active) return;
    const completedLevel = this.levelIndex;
    this.completed.add(completedLevel);
    writeCompletedTutorials(this.completed);
    this.stop({ clear: true });
    this.onComplete();
  }

  playPresentation() {
    const animation = this.presentationCount % 2 === 0 ? "presentingDomo" : "presentingDomoDomo";
    this.presentationCount += 1;
    this.react(animation, { force: true, hold: true });
  }

  schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
  }

  clearTimers() {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
  }

  getItemElement() {
    if (this.exampleItemId == null) return null;
    return this.stage.querySelector(`[data-draggable-item][data-item-id="${escapeAttribute(this.exampleItemId)}"]`);
  }

  getTargetElement() {
    const category = this.currentCategory?.id ?? this.currentItem?.answer;
    if (!category) return null;
    return this.stage.querySelector(`[data-drop-category="${escapeAttribute(category)}"]`);
  }

  refreshLayout() {
    if (!this.active) return;
    const item = this.getItemElement();
    const target = this.getTargetElement();
    const objectCopy = this.layer.querySelector(".tutorial-object-copy");
    const sparkyCopy = this.layer.querySelector(".tutorial-sparky-copy");
    const targetCopy = this.layer.querySelector(".tutorial-target-copy");
    const stageRect = this.stage.getBoundingClientRect();
    const itemArt = item?.querySelector(".game-item__art");
    const artRect = itemArt?.getBoundingClientRect();
    const showObjectCopy = Boolean(artRect && ["guide", "demonstration"].includes(this.phase));
    if (sparkyCopy) {
      const sourceSparky = this.stage.querySelector("#sparky");
      const sparkyRect = sourceSparky?.getBoundingClientRect();
      const sourceViewport = sourceSparky?.querySelector(".sparky__viewport");
      const showSparky = Boolean(sparkyRect && sourceViewport && this.phase !== "complete");
      sparkyCopy.hidden = !showSparky;
      if (showSparky) {
        sparkyCopy.style.left = `${sparkyRect.left - stageRect.left}px`;
        sparkyCopy.style.top = `${sparkyRect.top - stageRect.top}px`;
        sparkyCopy.style.width = `${sparkyRect.width}px`;
        sparkyCopy.style.height = `${sparkyRect.height}px`;
        sparkyCopy.replaceChildren(sourceViewport.cloneNode(true));
      }
    }
    if (targetCopy) {
      const revealTarget = target && ["guide", "demonstration"].includes(this.phase);
      const targetImage = revealTarget ? target.querySelector(".sorting-bin__image") : null;
      const targetRect = targetImage?.getBoundingClientRect();
      targetCopy.hidden = !targetRect;
      if (targetRect) {
        targetCopy.src = targetImage.currentSrc || targetImage.src;
        targetCopy.style.left = `${targetRect.left - stageRect.left}px`;
        targetCopy.style.top = `${targetRect.top - stageRect.top}px`;
        targetCopy.style.width = `${targetRect.width}px`;
        targetCopy.style.height = `${targetRect.height}px`;
      }
    }
    if (objectCopy) {
      objectCopy.hidden = !showObjectCopy;
      if (showObjectCopy) {
        objectCopy.src = itemArt.currentSrc || itemArt.src;
        objectCopy.style.left = `${artRect.left - stageRect.left}px`;
        objectCopy.style.top = `${artRect.top - stageRect.top}px`;
        objectCopy.style.width = `${artRect.width}px`;
        objectCopy.style.height = `${artRect.height}px`;
        if (this.phase === "demonstration" && target) {
          const destination = target.getBoundingClientRect();
          objectCopy.style.setProperty("--tutorial-dx", `${destination.left + destination.width * 0.5 - artRect.left - artRect.width * 0.5}px`);
          objectCopy.style.setProperty("--tutorial-dy", `${destination.top + destination.height * 0.2 - artRect.top - artRect.height * 0.5}px`);
          if (!this.layer.classList.contains("tutorial-layer--demonstrating")) {
            requestAnimationFrame(() => {
              if (this.active && this.phase === "demonstration") this.layer.classList.add("tutorial-layer--demonstrating");
            });
          }
        }
      }
    }
  }

  render() {
    if (!this.active) return;
    const isGuide = this.phase === "guide";
    const isDemonstration = this.phase === "demonstration";
    const isTransition = this.phase === "transition";
    const isComplete = this.phase === "complete";
    const targetBin = this.currentCategory;
    const instruction = isTransition ? "Great!" : this.currentStep?.instruction;
    const showSpotlight = !isComplete;
    const card = !isComplete ? `
      <div class="tutorial-card" role="status">
        <strong>${instruction ?? this.config.intro}</strong>
      </div>
      <button class="tutorial-skip" type="button" data-tutorial-action="skip" aria-label="Skip tutorial">Skip</button>` : "";

    this.layer.className = `tutorial-layer tutorial-layer--${this.phase} tutorial-layer--hint-${this.hintLevel}${showSpotlight ? " tutorial-layer--show-spotlight" : ""}`;
    this.layer.innerHTML = `
      <div class="tutorial-dimmer" aria-hidden="true"></div>
      <div class="tutorial-sparky-copy" aria-hidden="true" hidden></div>
      <img class="tutorial-target-copy" alt="" aria-hidden="true" hidden />
      <img class="tutorial-object-copy" alt="" hidden />
      ${card}`;

    this.stage.classList.remove("tutorial-introducing");
    const item = this.getItemElement();
    item?.classList.toggle("game-item--tutorial-highlight", isGuide || isDemonstration);
    this.stage.querySelectorAll("[data-drop-category]").forEach((bin) => {
      const isTarget = Boolean(targetBin && bin.dataset.dropCategory === targetBin.id);
      bin.classList.toggle("sorting-bin--tutorial-target", isTarget && (isGuide || isDemonstration));
      bin.classList.remove("sorting-bin--tutorial-intro");
    });
    requestAnimationFrame(() => this.refreshLayout());
  }
}
