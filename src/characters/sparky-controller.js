const DEFAULT_STATES = {
  idle: {
    src: "assets/characters/idle.webp",
    columns: 4,
    rows: 3,
    frameCount: 12,
    anchorBottom: 356,
    frameBottoms: [356, 356, 356, 356, 352, 352, 352, 352, 346, 346, 346, 346],
    priority: 0,
    interruptible: true,
  },
  correct: {
    src: "assets/characters/modified_thubms_up.webp",
    columns: 4,
    rows: 2,
    frameCount: 8,
    // The first row is the cleanest complete gesture in the revised sheet.
    // Reverse those poses for a controlled recovery instead of flashing the
    // duplicated second row through in a fraction of a second.
    frameSequence: [0, 1, 2, 3, 3, 2, 1, 0],
    frameCenterX: 52.65,
    anchorY: 98.3425,
    // Both hands finish on the same physical baseline in these source cells.
    frameBottoms: [443, 443, 443, 443, 443, 443, 443, 443],
    frameOffsetX: [0, 0.28, 0.03, -0.01, 0, 0, 0, 0],
    frameDurations: [65, 70, 75, 105, 180, 85, 75, 65],
    priority: 2,
    interruptible: true,
  },
  nod: {
    src: "assets/characters/updated_nod.webp",
    columns: 4,
    rows: 3,
    frameCount: 12,
    anchorY: 98.3425,
    // Align the overall buttons and glove baseline, which remain stable even
    // while the face moves. This removes the generated sheet's side-to-side
    // and vertical body drift without weakening the nod itself.
    frameBottoms: [356, 356, 357, 357, 351, 352, 352, 352, 347, 347, 347, 347],
    frameOffsetX: [-1.04, 1.56, 2.9, -0.35, -1.15, 1.06, 2.97, 0.64, -1.37, 1.35, 2.13, 0.03],
    // Packed-row edge pixels in the supplied sheet are hidden without
    // cropping any part of Sparky's silhouette.
    frameClipTop: [0, 0, 0, 0, 1.4, 1.4, 1.4, 1.4, 0.8, 0.8, 0.8, 0.8],
    frameDurations: [45, 45, 50, 55, 65, 80, 100, 70, 55, 50, 45, 45],
    priority: 2,
    interruptible: true,
  },
  happy: {
    src: "assets/characters/happy.webp",
    columns: 4,
    rows: 3,
    frameCount: 9,
    // A compact open-hands cheer: rise to the strongest happy pose, hold it
    // briefly, then return through the same clean silhouettes. The remaining
    // duplicate sheet poses are intentionally skipped to prevent eye flicker.
    frameSequence: [0, 1, 2, 3, 4, 3, 2, 1, 0],
    anchorY: 98.3425,
    frameBottoms: [356, 356, 356, 356, 352, 352, 352, 352, 347, 347, 347, 347],
    frameOffsetX: [-0.06, -0.05, 0.03, 0.14, 0.08, 0, 0, 0, 0, 0, 0, 0],
    frameDurations: [55, 55, 60, 70, 230, 70, 60, 55, 55],
    priority: 3,
    interruptible: true,
  },
  presentingDomo: {
    src: "assets/characters/final_presentation_clean.webp",
    columns: 4,
    rows: 3,
    frameCount: 12,
    frameSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    // The mouth is open for 940 ms (frames 2-8), matching domo.wav.
    frameDurations: [90, 90, 140, 150, 140, 130, 130, 130, 120, 110, 100, 140],
    holdPlaybackFrame: 11,
    // The final presentation sheet plays as one complete speaking gesture.
    // Each row sits slightly higher in its source cell, so the measured lower
    // silhouette is anchored back to the same conveyor line.
    // Preserve the source sheet's 4:3 ratio and leave a small transparent
    // safety margin so the tallest flame tip is never clipped.
    sheetWidth: 417.333,
    sheetHeight: 313,
    frameCenterX: 50,
    anchorY: 98.3425,
    frameBottoms: [356, 356, 356, 356, 353, 353, 353, 353, 348, 348, 348, 348],
    priority: 3,
    interruptible: false,
  },
  presentingDomoDomo: {
    src: "assets/characters/final_presentation_clean.webp",
    columns: 4,
    rows: 3,
    frameCount: 12,
    frameSequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    // The mouth is open for 1.35 s (frames 2-8), matching domodomo.wav.
    frameDurations: [90, 90, 150, 180, 190, 200, 200, 220, 210, 110, 100, 140],
    holdPlaybackFrame: 11,
    sheetWidth: 417.333,
    sheetHeight: 313,
    frameCenterX: 50,
    anchorY: 98.3425,
    frameBottoms: [356, 356, 356, 356, 353, 353, 353, 353, 348, 348, 348, 348],
    priority: 3,
    interruptible: false,
  },
  thinking: {
    src: "assets/characters/thinking.webp",
    columns: 4,
    rows: 3,
    frameCount: 8,
    frameSequence: [0, 1, 2, 3, 3, 2, 1, 0],
    anchorY: 98.3425,
    frameBottoms: [356, 356, 356, 356, 352, 352, 352, 352, 347, 347, 347, 347],
    frameOffsetX: [-0.09, -0.03, -0.08, -1.21, 0, 0, 0, 0, 0, 0, 0, 0],
    frameDurations: [55, 70, 80, 110, 210, 100, 75, 55],
    priority: 2,
    interruptible: true,
  },
  surprised: {
    src: "assets/characters/surprised.webp",
    columns: 4,
    rows: 3,
    frameCount: 8,
    frameSequence: [0, 1, 2, 3, 3, 2, 1, 0],
    sheetWidth: 432,
    sheetHeight: 324,
    frameCenterX: 50,
    anchorY: 98.3425,
    frameBottoms: [362, 362, 362, 362, 362, 362, 362, 362, 362, 362, 362, 362],
    frameOffsetX: [0.74, 0.61, 1.79, 1.14, 0, 0, 0, 0, 0, 0, 0, 0],
    frameDurations: [45, 50, 55, 80, 100, 65, 50, 45],
    priority: 2,
    interruptible: true,
  },
  levelComplete: {
    src: "assets/characters/updated_dance_normalized.webp",
    columns: 9,
    rows: 1,
    frameCount: 16,
    // The updated sheet's first row is one coherent standing dance. Travel
    // forward through its celebration poses, then reverse them so the loop
    // returns smoothly instead of snapping from the final pose to the first.
    frameSequence: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    sheetWidth: 900,
    sheetHeight: 100,
    frameCenterX: 50,
    anchorY: 98.3425,
    // Every normalized pose meets the same 220px ground line.
    // Keeping that source baseline fixed prevents the body from bobbing due
    // to transparent padding differences between poses.
    frameBottoms: [220, 220, 220, 220, 220, 220, 220, 220, 220],
    frameDurations: [100, 90, 100, 105, 105, 110, 110, 120, 110, 110, 105, 105, 100, 90, 100, 130],
    loop: true,
    priority: 4,
    interruptible: false,
  },
  streak: { src: null, priority: 2, duration: 780, interruptible: true },
};

const BLINK_SEQUENCE = Array.from({ length: 12 }, (_, index) => index);
/* A brisk 312 ms blink. Sparky becomes more attentive when the belt is
   waiting for the child, without adding a continuous body animation. */
const BLINK_FRAME_DURATION = 26;
const NORMAL_BLINK_MIN_DELAY = 1800;
const NORMAL_BLINK_DELAY_RANGE = 1600;
const INACTIVE_AFTER = 2800;
const WAITING_BLINK_MIN_DELAY = 650;
const WAITING_BLINK_DELAY_RANGE = 600;
const POSITIVE_STATES = new Set(["correct", "nod", "happy"]);

export class SparkyController {
  constructor(element, states = DEFAULT_STATES) {
    this.element = element;
    this.viewport = element.querySelector(".sparky__viewport");
    this.states = { ...states };
    this.loaded = new Set();
    this.images = new Map();
    this.sheet = null;
    this.currentName = "idle";
    this.currentFrame = 0;
    this.elapsed = 0;
    this.finished = false;
    this.hold = false;
    this.paused = true;
    this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.blinking = false;
    this.blinkStep = 0;
    this.inactiveFor = 0;
    this.waitingForPick = false;
    this.blinkDelay = this.nextBlinkDelay();
    this.pendingPositive = null;
    this.lastFrameEvent = "";
  }

  load(name) {
    const animation = this.states[name];
    if (!animation?.src || this.loaded.has(name)) return;
    const image = new Image();
    image.className = "sparky__sheet";
    image.alt = "";
    image.draggable = false;
    image.decoding = "async";
    image.onload = () => {
      this.images.set(name, image);
      this.loaded.add(name);
      if (name === this.currentName || (name === "idle" && !this.loaded.has(this.currentName))) {
        this.render();
      }
      this.element.dataset.ready = "true";
    };
    image.src = animation.src;
  }

  register(name, definition) {
    this.states[name] = { ...this.states[name], ...definition };
    this.load(name);
  }

  start() {
    this.load("idle");
    this.paused = false;
    this.play("idle", { force: true });
  }

  play(name, options = {}) {
    const next = this.states[name];
    if (!next?.src) {
      if (this.currentName !== "levelComplete" && !this.currentName.startsWith("presenting")) this.play("idle", { force: true });
      return false;
    }
    const current = this.states[this.currentName] ?? this.states.idle;
    if (POSITIVE_STATES.has(name) && POSITIVE_STATES.has(this.currentName) && next.priority <= current.priority && !options.force) {
      // Never jerk between positive reactions. During the gesture/hold the
      // current reaction is simply extended; during recovery, retain only one
      // latest follow-up instead of building an unbounded queue.
      const holdEnd = this.currentName === "correct" ? 4 : 7;
      if (this.currentFrame <= holdEnd) {
        this.elapsed = Math.min(this.elapsed, -100);
        return true;
      }
      this.pendingPositive = name;
      return true;
    }
    this.load(name);
    const blocked = !options.force && !current.interruptible && current.priority > next.priority;
    if (blocked) return false;
    this.currentName = name;
    this.currentFrame = 0;
    this.lastFrameEvent = "";
    this.elapsed = 0;
    this.finished = false;
    this.hold = Boolean(options.hold);
    this.blinking = false;
    this.blinkStep = 0;
    if (!POSITIVE_STATES.has(name)) this.pendingPositive = null;
    if (name === "idle") this.blinkDelay = this.nextBlinkDelay();
    if (this.reducedMotion && next.loop) {
      this.currentFrame = next.reducedMotionFrame ?? 0;
      this.finished = true;
    }
    this.render();
    return true;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
    this.elapsed = 0;
  }

  noteItemInteraction() {
    this.inactiveFor = 0;
    this.waitingForPick = false;
    if (this.currentName === "idle" && !this.blinking) {
      this.blinkDelay = this.nextBlinkDelay();
    }
  }

  update(deltaTime) {
    if (this.paused || this.finished || !this.loaded.has(this.currentName)) return;
    const delta = Math.min(100, Math.max(0, deltaTime));
    this.inactiveFor += delta;
    if (this.currentName === "idle") return this.updateIdle(delta);

    const animation = this.states[this.currentName];
    const frameCount = animation.frameCount ?? 1;
    this.elapsed += delta;
    let steps = 0;
    while (steps < 4) {
      const frameDuration = animation.frameDurations?.[this.currentFrame]
        ?? animation.frameDuration
        ?? (Number.isFinite(animation.duration) ? animation.duration / frameCount : 80);
      if (this.elapsed < frameDuration) break;
      this.elapsed -= frameDuration;
      this.currentFrame += 1;
      steps += 1;
      if (this.currentFrame >= frameCount) {
        if (animation.loop) this.currentFrame = 0;
        else if (this.hold) {
          this.currentFrame = animation.holdPlaybackFrame ?? frameCount - 1;
          this.finished = true;
          return this.render();
        }
        else if (POSITIVE_STATES.has(this.currentName) && this.pendingPositive) {
          const pending = this.pendingPositive;
          this.pendingPositive = null;
          return this.play(pending, { force: true });
        }
        else return this.play("idle", { force: true });
      }
    }
    if (steps) this.render();
  }

  updateIdle(deltaTime) {
    if (this.reducedMotion) return;
    if (!this.blinking) {
      if (!this.waitingForPick && this.inactiveFor >= INACTIVE_AFTER) {
        this.waitingForPick = true;
        this.blinkDelay = Math.min(this.blinkDelay, this.nextBlinkDelay());
      }
      this.blinkDelay -= deltaTime;
      if (this.blinkDelay > 0) return;
      this.blinking = true;
      this.blinkStep = 0;
      this.elapsed = 0;
      this.currentFrame = BLINK_SEQUENCE[0];
      return this.render();
    }

    this.elapsed += deltaTime;
    let steps = 0;
    while (this.elapsed >= BLINK_FRAME_DURATION && steps < 4) {
      this.elapsed -= BLINK_FRAME_DURATION;
      this.blinkStep += 1;
      steps += 1;
      if (this.blinkStep >= BLINK_SEQUENCE.length) {
        this.blinking = false;
        this.currentFrame = 0;
        this.blinkDelay = this.nextBlinkDelay();
        this.elapsed = 0;
        return this.render();
      }
      this.currentFrame = BLINK_SEQUENCE[this.blinkStep];
    }
    if (steps) this.render();
  }

  render() {
    const animation = this.states[this.currentName]?.src ? this.states[this.currentName] : this.states.idle;
    const image = this.images.get(this.currentName) ?? this.images.get("idle");
    if (!image) return;
    const columns = animation.columns ?? 1;
    const rows = animation.rows ?? 1;
    const playbackFrame = Math.min(this.currentFrame, (animation.frameCount ?? 1) - 1);
    const frame = animation.frameSequence?.[playbackFrame] ?? playbackFrame;
    const column = frame % columns;
    const row = Math.floor(frame / columns);
    const sourceHeight = image.naturalHeight || rows;
    const sheetWidth = animation.sheetWidth ?? columns * 100;
    const sheetHeight = animation.sheetHeight ?? rows * 100;
    const frameWidth = sheetWidth / columns;
    const sourceScaleY = sheetHeight / sourceHeight;
    const anchorBottom = animation.anchorBottom ?? 0;
    const anchorY = animation.anchorY ?? anchorBottom * sourceScaleY;
    const frameBottom = animation.frameBottoms?.[frame] ?? anchorBottom;
    const frameCenterX = animation.frameCenterX ?? 50;
    if (this.sheet !== image) {
      this.viewport.replaceChildren(image);
      this.sheet = image;
    }
    this.viewport.style.left = `${frameCenterX - frameWidth / 2 + (animation.frameOffsetX?.[frame] ?? 0)}%`;
    this.viewport.style.width = `${frameWidth}%`;
    const clipTop = animation.frameClipTop?.[frame] ?? 0;
    const clipRight = animation.frameClipRight?.[frame] ?? 0;
    const clipBottom = animation.frameClipBottom?.[frame] ?? 0;
    const clipLeft = animation.frameClipLeft?.[frame] ?? 0;
    this.viewport.style.clipPath = `inset(${clipTop}% ${clipRight}% ${clipBottom}% ${clipLeft}%)`;
    image.style.width = `${columns * 100}%`;
    image.style.height = `${sheetHeight}%`;
    image.style.left = "0%";
    image.style.top = `${anchorY - frameBottom * sourceScaleY + (animation.frameOffsetY?.[frame] ?? 0)}%`;
    image.style.transform = `translate(${-column * (100 / columns)}%, ${-row * (100 / rows)}%)`;
    this.element.dataset.animation = this.currentName;
    this.element.dataset.frame = String(frame);
    this.element.dataset.step = String(playbackFrame);
    const frameEvent = `${this.currentName}:${playbackFrame}`;
    if (frameEvent !== this.lastFrameEvent) {
      this.lastFrameEvent = frameEvent;
      window.dispatchEvent(new CustomEvent("sparky-animation-frame", {
        detail: { name: this.currentName, step: playbackFrame, frame },
      }));
    }
  }

  nextBlinkDelay() {
    const minimum = this.waitingForPick ? WAITING_BLINK_MIN_DELAY : NORMAL_BLINK_MIN_DELAY;
    const range = this.waitingForPick ? WAITING_BLINK_DELAY_RANGE : NORMAL_BLINK_DELAY_RANGE;
    return minimum + Math.random() * range;
  }
}

export const SPARKY_STATE_NAMES = Object.freeze(Object.keys(DEFAULT_STATES));
