import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const analyticsSource = await readFile(new URL("../src/core/analytics.js", import.meta.url), "utf8");
const scoringSource = await readFile(new URL("../src/core/scoring.js", import.meta.url), "utf8");
const {
  CAMPAIGN_XP_CAP,
  calculateLevelXp,
  createGameAnalytics,
  getLevelXpMaximum,
  getObjectXp,
} = await import(`data:text/javascript;base64,${Buffer.from(analyticsSource).toString("base64")}`);
const { getStarsForXp } = await import(`data:text/javascript;base64,${Buffer.from(scoringSource).toString("base64")}`);

const rounded = (value) => Math.round(value * 1_000_000) / 1_000_000;

test("all level allocations total exactly 200 XP", () => {
  for (const levelCount of [1, 2, 3, 9, 10, 17]) {
    const total = Array.from(
      { length: levelCount },
      (_, index) => getLevelXpMaximum(index + 1, levelCount),
    ).reduce((sum, xp) => sum + xp, 0);
    assert.equal(total, CAMPAIGN_XP_CAP);
  }
  assert.equal(getLevelXpMaximum(1, 10), 20);
  assert.deepEqual(
    [1, 2, 3].map((level) => getLevelXpMaximum(level, 3)),
    [66, 67, 67],
  );
});

test("object allocations total exactly their level allocation", () => {
  for (const objectCount of [1, 2, 3, 7, 10, 11]) {
    const earned = Array.from(
      { length: objectCount },
      (_, index) => getObjectXp(2, 3, index + 1, objectCount),
    ).reduce((sum, xp) => sum + xp, 0);
    assert.equal(rounded(earned), getLevelXpMaximum(2, 3));
    assert.equal(
      calculateLevelXp(2, 3, objectCount, objectCount),
      getLevelXpMaximum(2, 3),
    );
  }
});

test("analytics gives XP only to first-try eligible successful object tasks", () => {
  const analytics = createGameAnalytics({
    gameId: "xp-test",
    levelCount: 3,
    levels: [{ goal: 2 }, { goal: 3 }, { goal: 5 }],
  });
  analytics.startLevel(2);
  analytics.recordTask({ itemName: "A", correctChoice: "x", choiceMade: "y", successful: false });
  analytics.recordTask({ itemName: "A", correctChoice: "x", choiceMade: "x", successful: true, xpEligible: false });
  analytics.recordTask({ itemName: "B", correctChoice: "x", choiceMade: "x", successful: true });
  analytics.recordTask({ itemName: "C", correctChoice: "x", choiceMade: "x", successful: true });
  const payload = analytics.completeLevel({
    levelNumber: 2,
    stars: 1,
    attempts: 4,
    firstTryCorrect: 2,
    score: 20,
  });
  const expectedXp = rounded(
    getObjectXp(2, 3, 2, 3) + getObjectXp(2, 3, 3, 3),
  );
  assert.equal(payload.xpEarned, expectedXp);
  assert.equal(payload.level.tasks[0].xpEarned, 0);
  assert.equal(
    rounded(payload.level.tasks.reduce((sum, task) => sum + task.xpEarned, 0)),
    payload.xpEarned,
  );
});

test("stars follow level XP percentage thresholds", () => {
  assert.equal(getStarsForXp(60.3, 67), 3);
  assert.equal(getStarsForXp(46.9, 67), 2);
  assert.equal(getStarsForXp(46.89, 67), 1);
});
