export function getStarThresholds(levelXpMaximum) {
  const maximum = Math.max(0, Number(levelXpMaximum) || 0);
  return { twoStars: maximum * 0.7, threeStars: maximum * 0.9, maximum };
}

export function getStarsForXp(xpEarned, levelXpMaximum) {
  const { twoStars, threeStars } = getStarThresholds(levelXpMaximum);
  const xp = Math.max(0, Number(xpEarned) || 0);
  return xp >= threeStars - 0.000001 ? 3 : xp >= twoStars ? 2 : 1;
}
