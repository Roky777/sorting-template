export function renderHud(state, level) {
  const levelIcon = document.querySelector("#level-icon");
  const fill = document.querySelector("#mastery-fill");
  const track = document.querySelector(".progress-card__track");
  const progress = state.totalRequired ? state.completedMastery / state.totalRequired : 0;
  levelIcon.textContent = `Level ${state.level} / ${state.maxStars * 3}`;
  document.querySelector("#level-title").textContent = level.title;
  fill.style.width = `${progress * 100}%`;
  track.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  document.querySelector("#mastery-text").textContent = `${state.completedMastery} / ${state.totalRequired}`;
  const scoreCard = document.querySelector("#score-card");
  scoreCard.textContent = `★ ${state.score}`;
  scoreCard.classList.toggle("hud__score--penalty", ["missed", "wrong"].includes(state.feedback?.type));
}
