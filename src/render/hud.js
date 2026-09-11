export function renderHud(state, level) {
  const levelIcon = document.querySelector("#level-icon");
  const fill = document.querySelector("#mastery-fill");
  const track = document.querySelector(".progress-card__track");
  const progress = state.totalRequired ? state.completedMastery / state.totalRequired : 0;
  levelIcon.textContent = `Level ${state.level} / ${state.maxStars * 3}`;
  document.querySelector("#level-title").textContent = level.title;
  fill.style.width = `${progress * 100}%`;
  track.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  document.querySelector("#mastery-text").textContent = progress >= 1 ? "Done!" : state.completedMastery ? "Keep going!" : "Start!";
  document.querySelector("#score-card").textContent = `★ ${state.score}`;
}
