let previousScore;

// Measured directly from assets/ui/ui-progress-bar.png (2172 x 400).
// These bounds describe only the recessed dark-brown track, never the frame
// or the independent orange counter capsule.
const PROGRESS_TRACK_BOUNDS = Object.freeze({ x: 151, y: 127, width: 1453, height: 124, radius: 62 });
const PROGRESS_COUNTER_BOUNDS = Object.freeze({ x: 1620, y: 108, width: 440, height: 160 });
let progressGeometryInitialized = false;

function syncProgressGeometry() {
  const card = document.querySelector(".progress-card");
  const art = document.querySelector("#progress-art");
  if (!card || !art?.complete || !art.naturalWidth || !art.naturalHeight) return;

  const cardRect = card.getBoundingClientRect();
  const artRect = art.getBoundingClientRect();
  const scaleX = artRect.width / art.naturalWidth;
  const scaleY = artRect.height / art.naturalHeight;
  const setBounds = (prefix, bounds) => {
    card.style.setProperty(`--${prefix}-x`, `${artRect.left - cardRect.left + bounds.x * scaleX}px`);
    card.style.setProperty(`--${prefix}-y`, `${artRect.top - cardRect.top + bounds.y * scaleY}px`);
    card.style.setProperty(`--${prefix}-width`, `${bounds.width * scaleX}px`);
    card.style.setProperty(`--${prefix}-height`, `${bounds.height * scaleY}px`);
  };

  setBounds("progress-track", PROGRESS_TRACK_BOUNDS);
  setBounds("progress-counter", PROGRESS_COUNTER_BOUNDS);
  card.style.setProperty("--progress-track-radius", `${PROGRESS_TRACK_BOUNDS.radius * scaleY}px`);
  card.dataset.geometryReady = "true";
}

function ensureProgressGeometry() {
  if (progressGeometryInitialized) return syncProgressGeometry();
  progressGeometryInitialized = true;
  const card = document.querySelector(".progress-card");
  const art = document.querySelector("#progress-art");
  art?.addEventListener("load", syncProgressGeometry, { once: true });
  if (typeof ResizeObserver === "function" && card && art) {
    const observer = new ResizeObserver(syncProgressGeometry);
    observer.observe(card);
    observer.observe(art);
  } else {
    window.addEventListener("resize", syncProgressGeometry, { passive: true });
  }
  syncProgressGeometry();
}

export function renderHud(state, level) {
  ensureProgressGeometry();
  const levelIcon = document.querySelector("#level-icon");
  const fill = document.querySelector("#mastery-fill");
  const track = document.querySelector(".progress-card__track");
  const progress = state.totalRequired ? state.completedMastery / state.totalRequired : 0;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  levelIcon.textContent = `Level ${state.level} / ${state.maxStars * 3}`;
  document.querySelector("#level-title").textContent = level.title;
  fill.style.setProperty("--progress-width", `${clampedProgress * 100}%`);
  track.setAttribute("aria-valuenow", String(Math.round(clampedProgress * 100)));
  document.querySelector("#mastery-text").textContent = `${state.completedMastery} / ${state.totalRequired}`;
  const scoreCard = document.querySelector("#score-card");
  document.querySelector("#score-text").textContent = String(state.score);
  if (previousScore !== undefined && state.score !== previousScore) {
    scoreCard.classList.remove("hud__score--gain", "hud__score--penalty");
    void scoreCard.offsetWidth;
    scoreCard.classList.add(state.score > previousScore ? "hud__score--gain" : "hud__score--penalty");
  }
  previousScore = state.score;
  const soundButton = document.querySelector("#sound-button");
  soundButton.classList.toggle("icon-button--muted", state.muted);
  soundButton.setAttribute("aria-pressed", String(state.muted));
}
