const FRAME_COUNT = 28;
const FRAME_DURATION = 112;
const PASS_DURATION = 6800;

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const easeAtEnds = (value) => .5 - Math.cos(clamp01(value) * Math.PI) * .5;

export class SuccessDanceController {
  constructor() {
    this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.raf = 0;
    this.running = false;
    this.tick = this.tick.bind(this);
    this.handleActivation = this.handleActivation.bind(this);
  }

  start() {
    this.stop();
    this.element = document.querySelector(".success-dance");
    this.viewport = this.element?.querySelector(".success-dance__viewport");
    this.image = this.element?.querySelector(".success-dance__sheet");
    this.effects = this.element?.querySelector(".success-dance__effects");
    if (!this.element || !this.viewport || !this.image) return;

    // The 1.6 MB dance sheet is requested only when the success screen opens.
    this.image.decoding = "async";
    this.image.src = "assets/characters/moon_walk_normalized.png";
    this.element.addEventListener("click", this.handleActivation);
    this.element.addEventListener("keydown", this.handleActivation);
    this.setFrame(0);
    this.applyWorldMotion(0, 0, -1);
    this.play(300);
  }

  play(delay = 0) {
    if (!this.element) return;
    this.startedAt = performance.now() + delay;
    this.running = true;
    this.element.dataset.phase = "moonwalk";
    this.viewport.hidden = false;
    cancelAnimationFrame(this.raf);
    if (this.reducedMotion) {
      this.setFrame(0);
      this.applyWorldMotion(0, 0, -1);
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  }

  handleActivation(event) {
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    this.play();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.element?.removeEventListener("click", this.handleActivation);
    this.element?.removeEventListener("keydown", this.handleActivation);
    this.effects?.replaceChildren();
    this.element = null;
    this.viewport = null;
    this.image = null;
    this.effects = null;
  }

  tick(now) {
    if (!this.running || !this.element?.isConnected) return this.stop();
    const elapsed = now - this.startedAt;
    if (elapsed < 0) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }

    const passIndex = Math.floor(elapsed / PASS_DURATION);
    const passTime = elapsed % PASS_DURATION;
    const passProgress = passTime / PASS_DURATION;
    const movingRight = passIndex % 2 === 0;
    const laneProgress = movingRight ? easeAtEnds(passProgress) : 1 - easeAtEnds(passProgress);
    const stage = this.element.parentElement.getBoundingClientRect();
    const laneStart = -stage.width * .035;
    const laneEnd = stage.width * .185;
    const x = laneStart + (laneEnd - laneStart) * laneProgress;
    const step = passTime / FRAME_DURATION;
    const frame = Math.floor(step) % FRAME_COUNT;
    const bob = -Math.abs(Math.sin(step * Math.PI)) * stage.height * .0045;

    this.setFrame(frame);
    // The sprite faces opposite the travel direction so the world slide reads
    // as a moonwalk rather than a normal walk.
    this.applyWorldMotion(x, bob, movingRight ? -1 : 1);
    this.raf = requestAnimationFrame(this.tick);
  }

  setFrame(frame) {
    const safeFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
    this.image.style.transform = `translateX(${-safeFrame * (100 / FRAME_COUNT)}%)`;
    this.element.dataset.frame = String(safeFrame);
  }

  applyWorldMotion(x, y, facing) {
    this.element.style.setProperty("--dance-x", `${x}px`);
    this.element.style.setProperty("--dance-y", `${y}px`);
    this.element.style.setProperty("--dance-rotation", "0deg");
    this.element.style.setProperty("--dance-scale", "1");
    this.element.style.setProperty("--dance-facing", String(facing));
  }
}
