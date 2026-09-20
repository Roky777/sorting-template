export function renderGameUi(state, level) {
  const root = document.querySelector("#game-ui");
  root.classList.toggle("game-ui--success", state.completedLevel);
  root.replaceChildren();
  if (state.screen === "complete") {
    const accuracy = state.attempts ? Math.round((state.firstTryCorrect / state.attempts) * 100) : 100;
    const card = document.createElement("div");
    card.className = "game-modal game-certificate";
    card.innerHTML = `<small>Shape Lab Certificate</small><h2>Shape &amp; Motion Master</h2><p>You completed all nine learning levels.</p><div class="game-certificate__results"><strong>★ ${state.score}</strong><strong>${state.campaignStars} / 27 stars</strong><strong>${accuracy}% first try</strong></div><div class="game-certificate__stamps"><span>SHAPES</span><span>FAMILIES</span><span>MOTION</span></div>`;
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
    const starSlots = state.stars === 1 ? [2] : state.stars === 2 ? [1, 3] : [1, 2, 3];
    const success = document.createElement("section");
    success.className = "success-screen";
    success.setAttribute("aria-label", `Level complete. ${state.stars} out of 3 stars.`);
    success.innerHTML = `
      <img class="success-screen__background" src="assets/ui/start-background.png" alt="" />
      <img class="success-screen__mascot" src="assets/ui/1ed7effe2a9a9491769691f9df97b9b8a25a4021.png" alt="Sparky celebrating" />
      <img class="success-screen__title" src="assets/ui/image 18.png" alt="All sorted! Great job!" />
      <div class="success-screen__stars" aria-hidden="true">
        ${starSlots.map((slot, index) => `<span class="success-star success-star--${slot}" style="--star-index:${index}"><img src="assets/ui/image 19.png" alt="" /></span>`).join("")}
        ${state.stars === 3 ? '<img class="success-stars__complete" src="assets/ui/image 19.png" alt="" />' : ""}
      </div>
      <p class="success-screen__score">Score: ${state.levelScore}</p>
      <div class="success-screen__actions"></div>`;
    const actions = success.querySelector(".success-screen__actions");
    const starBaseline = state.totalRequired * 10 + Math.floor(state.totalRequired / 5) * 5;
    if (state.levelScore < starBaseline * 0.45) {
      const retry = document.createElement("button");
      retry.className = "success-screen__button success-screen__button--secondary";
      retry.dataset.action = "retry-level";
      retry.textContent = "Try Again";
      actions.append(retry);
    }
    const next = document.createElement("button");
    next.className = "success-screen__button";
    next.dataset.action = "next";
    next.textContent = state.level === 9 ? "Finish" : "Next Level";
    actions.append(next);
    root.append(success);
    return;
  }
  if (state.paused) {
    const pause = document.createElement("div");
    pause.className = "game-modal";
    pause.innerHTML = "<h2>Paused</h2><p>Press the back button again to continue.</p>";
    root.append(pause);
  }
}
