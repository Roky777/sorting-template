export function renderHud(state, level) {
  const levelIcon = document.querySelector("#level-icon");
  const fill = document.querySelector("#mastery-fill");
  const progress = state.totalRequired ? state.completedMastery / state.totalRequired : 0;
  levelIcon.textContent = `Level ${state.level} / ${state.maxStars * 3}`;
  document.querySelector("#level-title").textContent = level.title;
  fill.style.width = `${progress * 100}%`;
  document.querySelector("#mastery-text").textContent = `${state.completedMastery} / ${state.totalRequired}`;
  document.querySelector("#score-card").textContent = `★ ${state.score}`;
}
