import { MATH_LEVELS } from "../data/math-levels.js";
import { getLevelXpMaximum } from "../core/analytics.js?v=20260923-xp-display-1";
import { getStarThresholds } from "../core/scoring.js?v=20260923-xp-display-1";

const formatXp = (value) => Number((Number(value) || 0).toFixed(2)).toString();

export function renderGameUi(state, level) {
  const root = document.querySelector("#game-ui");
  root.classList.toggle("game-ui--success", state.completedLevel);
  root.classList.toggle("game-ui--paused", state.paused && !state.atHome);
  root.classList.toggle("game-ui--certificate", state.screen === "complete");
  root.replaceChildren();
  if (state.screen === "complete") {
    const accuracy = state.attempts ? Math.round((state.firstTryCorrect / state.attempts) * 100) : 100;
    const screen = document.createElement("section");
    screen.className = "certificate-screen";
    screen.setAttribute("aria-label", "Shape and Motion Master certificate");
    const card = document.createElement("article");
    card.className = "game-certificate";
    card.innerHTML = `
      <div class="game-certificate__confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="game-certificate__sparkles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="game-certificate__crest" aria-hidden="true"><span>★</span></div>
      <p class="game-certificate__eyebrow">Shape Lab Champion</p>
      <h2>Shape &amp; Motion <em>Master!</em></h2>
      <p class="game-certificate__subtitle">All 9 levels complete!</p>
      <div class="game-certificate__results" aria-label="Campaign results">
        <div><i aria-hidden="true">XP</i><span><small>XP earned</small><strong>${formatXp(state.campaignXp)}<b>/200</b></strong></span></div>
        <div><i aria-hidden="true">★</i><span><small>Stars</small><strong>${state.campaignStars}<b>/${MATH_LEVELS.length * 3}</b></strong></span></div>
        <div><i aria-hidden="true">✓</i><span><small>First try</small><strong>${accuracy}<b>%</b></strong></span></div>
      </div>
      <div class="game-certificate__stamps" aria-label="Skills mastered">
        <div class="game-certificate__stamp game-certificate__stamp--shapes"><i aria-hidden="true"><b></b><b></b></i><strong>Shapes</strong></div>
        <div class="game-certificate__stamp game-certificate__stamp--families"><i aria-hidden="true"><b></b><b></b><b></b></i><strong>Families</strong></div>
        <div class="game-certificate__stamp game-certificate__stamp--motion"><i aria-hidden="true">↻</i><strong>Motion</strong></div>
      </div>
      <div class="game-certificate__action"></div>
      <div class="game-certificate__buddy game-certificate__buddy--square" aria-hidden="true"><span><i></i><i></i><b></b></span></div>
      <div class="game-certificate__buddy game-certificate__buddy--triangle" aria-hidden="true"><span><i></i><i></i><b></b></span></div>`;
    const restart = document.createElement("button");
    restart.className = "game-modal__button";
    restart.dataset.action = "restart";
    restart.innerHTML = `<span>Play Again</span><i aria-hidden="true">›</i>`;
    card.querySelector(".game-certificate__action").append(restart);
    screen.append(card);
    root.append(screen);
    return;
  }
  const prompt = document.createElement("section");
  prompt.className = "level-prompt";
  prompt.innerHTML = `<span>Level ${state.level} of 9</span><h1>${level.title}</h1><p>${level.instruction}</p>`;
  root.append(prompt);
  if (state.feedback && state.feedback.type !== "complete") {
    const feedback = document.createElement("div");
    feedback.className = `feedback feedback--${state.feedback.type}${state.feedback.category ? ` feedback--bin-${state.feedback.category}` : ""}`;
    feedback.textContent = state.feedback.message;
    if (state.feedback.category && state.feedback.type !== "wrong") {
      const binIndex = level.bins.findIndex((bin) => bin.id === state.feedback.category);
      const feedbackX = ((binIndex + 1) / (level.bins.length + 1)) * 100;
      feedback.style.setProperty("--feedback-x", `${feedbackX}%`);
    }
    root.append(feedback);
  }
  if (state.completedLevel) {
    const levelXpMaximum = getLevelXpMaximum(state.levelIndex + 1, MATH_LEVELS.length);
    const success = document.createElement("section");
    success.className = "success-screen";
    success.setAttribute("aria-label", `Level complete. ${state.stars} out of 3 stars.`);
    success.innerHTML = `
      <img class="success-screen__background" src="assets/ui/start-background.webp" alt="" />
      <div class="success-dance" role="button" tabindex="0" aria-label="Restart Sparky's moonwalk">
        <div class="success-dance__viewport"><img class="success-dance__sheet" src="assets/characters/moon_walk_normalized.webp" alt="" /></div>
        <div class="success-dance__effects" aria-hidden="true"></div>
      </div>
      <img class="success-screen__title" src="assets/ui/image 18.webp" alt="All sorted! Great job!" />
      <div class="success-screen__reward">
        <div class="success-screen__stars" aria-label="${state.stars} out of 3 stars">
          ${[
            "success-star-1.webp",
            "success-star-2.webp",
            "success-star-3.webp",
          ].map((source, index) => `<span class="success-star success-star--${index + 1}${index < state.stars ? " success-star--earned" : ""}" style="--star-index:${index}"><img src="assets/ui/${source}" alt="" /></span>`).join("")}
        </div>
        <div class="success-screen__stats">
          <p class="success-screen__score"><span>XP earned</span><strong>${formatXp(state.levelXp)} / ${formatXp(levelXpMaximum)} XP</strong></p>
        </div>
        <div class="success-screen__actions"></div>
      </div>`;
    const actions = success.querySelector(".success-screen__actions");
    const { twoStars } = getStarThresholds(levelXpMaximum);
    if (state.levelXp < twoStars) {
      const retry = document.createElement("button");
      retry.className = "success-screen__button success-screen__button--secondary";
      retry.dataset.action = "retry-level";
      retry.textContent = "Try Again";
      actions.append(retry);
    }
    const next = document.createElement("button");
    next.className = "success-screen__button";
    next.dataset.action = "next";
    next.innerHTML = `<span>${state.level === 9 ? "Finish" : "Next Level"}</span><i aria-hidden="true">›</i>`;
    actions.append(next);
    root.append(success);
    return;
  }
  if (state.paused) {
    const pause = document.createElement("section");
    pause.className = "pause-screen";
    pause.setAttribute("aria-label", "Game paused");
    pause.innerHTML = `
      <img class="pause-screen__background" src="assets/ui/start-background.webp" alt="" />
      <img class="pause-screen__mascot" src="assets/ui/12_peek_wave_2048 2.webp" alt="Sparky waving" />
      <img class="pause-screen__panel" src="assets/ui/21699a15ad6312465e63b85b73ddad4fbd18816d.webp" alt="Take a Break" />
      <div class="pause-screen__controls">
        <button class="pause-screen__hotspot pause-screen__hotspot--resume" data-action="resume" type="button" aria-label="Resume game"></button>
        <button class="pause-screen__hotspot pause-screen__hotspot--restart" data-action="request-restart" type="button" aria-label="Restart level"></button>
        <button class="pause-screen__hotspot pause-screen__hotspot--home" data-action="home" type="button" aria-label="Return home and preserve progress"></button>
      </div>`;
    if (state.restartConfirm) {
      const confirm = document.createElement("div");
      confirm.className = "pause-confirm";
      confirm.innerHTML = `<strong>Restart this level?</strong><small>Your progress in this level will reset.</small><div><button type="button" data-action="cancel-restart">Cancel</button><button type="button" data-action="retry-level">Restart</button></div>`;
      pause.append(confirm);
    }
    root.append(pause);
  }
}
