export function getStarThresholds(levelXpMaximum) {
  const maximum = Math.max(0, Math.trunc(Number(levelXpMaximum) || 0));
  return {
    twoStars: Math.ceil(maximum * 0.7),
    threeStars: Math.ceil(maximum * 0.9),
    maximum,
  };
}

export function getStarsForXp(xpEarned, levelXpMaximum) {
  const { twoStars, threeStars } = getStarThresholds(levelXpMaximum);
  const xp = Math.max(0, Number(xpEarned) || 0);
  return xp >= threeStars ? 3 : xp >= twoStars ? 2 : 1;
}
