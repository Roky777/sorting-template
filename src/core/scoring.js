export function getPerfectLevelScore(goal) {
  const safeGoal = Math.max(0, Math.trunc(Number(goal) || 0));
  return safeGoal * 10 + Math.floor(safeGoal / 5) * 5;
}

export function getStarThresholds(goal) {
  const perfectScore = getPerfectLevelScore(goal);
  return {
    twoStars: Math.ceil(perfectScore * 0.45),
    threeStars: Math.ceil(perfectScore * 0.8),
    perfectScore,
  };
}

export function getStarsForScore(score, goal) {
  const { twoStars, threeStars } = getStarThresholds(goal);
  const safeScore = Number(score) || 0;
  return safeScore >= threeStars ? 3 : safeScore >= twoStars ? 2 : 1;
}
