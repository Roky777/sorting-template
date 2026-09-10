export function renderGameUi(state, level) {
  const root = document.querySelector("#game-ui");
  root.replaceChildren();
  if (state.screen === "complete") {
    const card = document.createElement("div");
    card.className = "game-modal";
    card.innerHTML = "<span class=\"game-modal__stars\">★★★</span><h2>Maths Master!</h2><p>You completed all nine Shape & Motion Sorter levels.</p>";
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
  if (state.feedback && state.feedback.type !== "complete") {
    const feedback = document.createElement("div");
    feedback.className = `feedback feedback--${state.feedback.type}`;
    feedback.textContent = state.feedback.message;
    root.append(feedback);
  }
  if (state.completedLevel) {
    const card = document.createElement("div");
    card.className = "game-modal";
    card.innerHTML = `<span class=\"game-modal__stars\">${"★".repeat(state.stars)}${"☆".repeat(state.maxStars - state.stars)}</span><h2>${state.feedback.message}</h2><p>${state.correct} of ${level.items.length} sorted correctly</p>`;
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
