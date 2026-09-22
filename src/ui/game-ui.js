export function renderGameUi(state, level) {
  const root = document.querySelector("#game-ui");
  root.classList.toggle("game-ui--success", state.completedLevel);
  root.classList.toggle("game-ui--paused", state.paused && !state.atHome);
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
    const success = document.createElement("section");
    success.className = "success-screen";
    success.setAttribute("aria-label", `Level complete. ${state.stars} out of 3 stars.`);
    success.innerHTML = `
      <img class="success-screen__background" src="assets/ui/start-background.png" alt="" />
      <div class="success-dance" role="button" tabindex="0" aria-label="Restart Sparky's moonwalk">
        <div class="success-dance__viewport"><img class="success-dance__sheet" src="assets/characters/moon_walk_normalized.png" alt="" /></div>
        <div class="success-dance__effects" aria-hidden="true"></div>
      </div>
      <img class="success-screen__title" src="assets/ui/image 18.png" alt="All sorted! Great job!" />
      <div class="success-screen__reward">
        <div class="success-screen__stars" aria-label="${state.stars} out of 3 stars">
          ${[
            "success-star-1.png",
            "success-star-2.png",
            "success-star-3.png",
          ].map((source, index) => `<span class="success-star success-star--${index + 1}${index < state.stars ? " success-star--earned" : ""}" style="--star-index:${index}"><img src="assets/ui/${source}" alt="" /></span>`).join("")}
        </div>
        <p class="success-screen__score"><span>Level score</span><strong>${state.levelScore}</strong></p>
        <div class="success-screen__actions"></div>
      </div>`;
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
      <img class="pause-screen__background" src="assets/ui/start-background.png" alt="" />
      <img class="pause-screen__mascot" src="assets/ui/12_peek_wave_2048 2.png" alt="Sparky waving" />
      <img class="pause-screen__panel" src="assets/ui/21699a15ad6312465e63b85b73ddad4fbd18816d.png" alt="Take a Break" />
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
