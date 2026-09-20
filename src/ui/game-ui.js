import { assets } from "../data/assets.js";

function tutorialArt(level, artId) {
  return assets.items.mathByLevel?.[level.assetSet]?.[artId] ?? assets.items.math[artId] ?? assets.items.math.ball;
}

function sparkyPlaceholder(className) {
  return `<div class="${className} sparky-placeholder" role="img" aria-label="Sparky placeholder"><span>S</span><small>Placeholder</small></div>`;
}

export function renderGameUi(state, level) {
  const root = document.querySelector("#game-ui");
  root.replaceChildren();
  if (state.screen === "complete") {
    const accuracy = state.attempts ? Math.round((state.firstTryCorrect / state.attempts) * 100) : 100;
    const card = document.createElement("div");
    card.className = "game-modal game-certificate";
    card.innerHTML = `${sparkyPlaceholder("game-certificate__mascot")}<small>Shape Lab Certificate</small><h2>Shape &amp; Motion Master</h2><p>You completed all nine learning levels.</p><div class="game-certificate__results"><strong>★ ${state.score}</strong><strong>${state.campaignStars} / 27 stars</strong><strong>${accuracy}% first try</strong></div><div class="game-certificate__stamps"><span>SHAPES</span><span>FAMILIES</span><span>MOTION</span></div>`;
    const restart = document.createElement("button");
    restart.className = "game-modal__button";
    restart.dataset.action = "restart";
    restart.textContent = "Play Again";
    card.append(restart);
    root.append(card);
    return;
  }
  const prompt = document.createElement("section");
  prompt.className = "level-prompt";
  prompt.innerHTML = `<span>Level ${state.level} of 9</span><h1>${level.title}</h1><p>${level.instruction}</p>`;
  root.append(prompt);
  if (state.introVisible) {
    const tutorial = document.createElement("section");
    tutorial.className = `tutorial-plaque${state.level >= 6 ? " tutorial-plaque--motion" : ""}`;
    const cues = level.bins.map((bin) => `<span><img src="${tutorialArt(level, bin.art)}" alt=""><b>${bin.label}</b></span>`).join("");
    tutorial.innerHTML = `${sparkyPlaceholder("tutorial-plaque__sparky")}<div class="tutorial-plaque__copy"><small>Level ${state.level}</small><strong>${level.title}</strong><p>${level.intro}</p></div><div class="tutorial-plaque__demo" aria-hidden="true">${cues}</div>`;
    root.append(tutorial);
  }
  if (state.milestone) {
    const milestone = document.createElement("div");
    milestone.className = "milestone-pop";
    milestone.innerHTML = `<span>★</span><strong>${state.milestone}% mastered</strong>`;
    root.append(milestone);
  }
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
    const card = document.createElement("div");
    card.className = "game-modal";
    card.innerHTML = `${sparkyPlaceholder("game-modal__mascot")}<span class=\"game-modal__stars\">${"★".repeat(state.stars)}${"☆".repeat(state.maxStars - state.stars)}</span><h2>${state.feedback.message}</h2><p>${state.correct} successful sorts • +50 level bonus</p>`;
    const next = document.createElement("button");
    next.className = "game-modal__button";
    next.dataset.action = "next";
    next.textContent = state.level === 9 ? "See Results" : "Next Level";
    card.append(next);
    root.append(card);
  }
  if (state.paused) {
    const pause = document.createElement("div");
    pause.className = "game-modal";
    pause.innerHTML = "<h2>Paused</h2><p>Press the back button again to continue.</p>";
    root.append(pause);
  }
}
