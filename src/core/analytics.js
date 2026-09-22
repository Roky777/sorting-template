const ANALYTICS_QUEUE_KEY = "ignite_pending_sessions_jsplugin";
export const CAMPAIGN_XP_CAP = 200;

const now = () => globalThis.performance?.now?.() ?? Date.now();
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function createRunId(gameId) {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const slug = String(gameId).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `${slug || "sorter"}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getLevelXpMaximum(levelNumber, levelCount) {
  const safeCount = Math.max(1, Math.trunc(Number(levelCount) || 1));
  const safeLevel = clamp(Math.trunc(Number(levelNumber) || 1), 1, safeCount);
  const base = Math.floor(CAMPAIGN_XP_CAP / safeCount);
  const remainder = CAMPAIGN_XP_CAP % safeCount;
  return base + (safeLevel <= remainder ? 1 : 0);
}

export function calculateLevelXp(levelNumber, levelCount, stars) {
  const multiplier = Number(stars) >= 3 ? 1 : Number(stars) >= 2 ? 0.8 : 0.6;
  return Math.round(getLevelXpMaximum(levelNumber, levelCount) * multiplier);
}

function readQueue() {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(ANALYTICS_QUEUE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function savePending(payload) {
  try {
    const pending = readQueue();
    pending.push(payload);
    globalThis.localStorage?.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(pending));
  } catch {
    // Analytics must never interrupt the game.
  }
}

function deliver(payload, { queue = true } = {}) {
  if (typeof window === "undefined") return false;
  let sent = false;

  try {
    if (typeof window.myJsAnalytics?.trackGameSession === "function") {
      window.myJsAnalytics.trackGameSession(payload);
      sent = true;
    }
  } catch {
    // Continue to the next compatible host bridge.
  }

  try {
    if (typeof window.ReactNativeWebView?.postMessage === "function") {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      sent = true;
    }
  } catch {
    // Continue to the iframe bridge.
  }

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(payload, window.__GodotAnalyticsParentOrigin || "*");
      sent = true;
    }
  } catch {
    // Queue the payload when no host bridge accepted it.
  }

  if (!sent && queue) savePending(payload);
  return sent;
}

function flushPending() {
  const pending = readQueue();
  if (!pending.length) return;
  const unsent = pending.filter((payload) => !deliver(payload, { queue: false }));
  try {
    if (unsent.length) globalThis.localStorage?.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(unsent));
    else globalThis.localStorage?.removeItem(ANALYTICS_QUEUE_KEY);
  } catch {
    // The next launch can retry if storage is temporarily unavailable.
  }
}

let listenersInstalled = false;
function installDeliveryListeners() {
  if (listenersInstalled || typeof window === "undefined") return;
  listenersInstalled = true;
  window.addEventListener("online", flushPending);
  window.addEventListener("load", flushPending, { once: true });
  window.addEventListener("message", (event) => {
    try {
      const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (data?.type === "ANALYTICS_CONFIG" && data.parentOrigin) {
        window.__GodotAnalyticsParentOrigin = data.parentOrigin;
      }
    } catch {
      // Ignore unrelated host messages.
    }
  });
  window.setTimeout(flushPending, 2000);
}

export function createGameAnalytics({ gameId, levelCount, enabled = true }) {
  const totalLevels = Math.max(1, Math.trunc(Number(levelCount) || 1));
  let runId = "";
  let currentLevel = null;
  let levelStartedAt = 0;
  let taskStartedAt = 0;
  let taskSequence = 0;
  let tasks = [];
  let submittedLevels = new Set();

  const beginRun = () => {
    runId = createRunId(gameId);
    currentLevel = null;
    submittedLevels = new Set();
  };

  const startLevel = (levelNumber) => {
    if (!enabled) return;
    const normalizedLevel = clamp(Math.trunc(Number(levelNumber) || 1), 1, totalLevels);
    if (!runId || (normalizedLevel === 1 && submittedLevels.size) || submittedLevels.has(normalizedLevel)) beginRun();
    currentLevel = normalizedLevel;
    levelStartedAt = now();
    taskStartedAt = levelStartedAt;
    taskSequence = 0;
    tasks = [];
  };

  const recordTask = ({ itemName, correctChoice, choiceMade, successful }) => {
    if (!enabled || currentLevel === null) return;
    const timestamp = now();
    taskSequence += 1;
    tasks.push({
      taskId: `task_${taskSequence}`,
      question: `Sort ${itemName || "item"}`,
      options: "[]",
      correctChoice: String(correctChoice ?? ""),
      choiceMade: String(choiceMade ?? ""),
      successful: Boolean(successful),
      timeTaken: Math.max(0, Math.round(timestamp - taskStartedAt)),
      xpEarned: 0,
    });
    taskStartedAt = timestamp;
  };

  const completeLevel = ({ levelNumber, stars, attempts, firstTryCorrect, score }) => {
    if (!enabled) return null;
    const normalizedLevel = clamp(Math.trunc(Number(levelNumber) || currentLevel || 1), 1, totalLevels);
    if (submittedLevels.has(normalizedLevel)) return null;
    if (currentLevel !== normalizedLevel) startLevel(normalizedLevel);

    const xp = calculateLevelXp(normalizedLevel, totalLevels, stars);
    const level = {
      levelId: String(normalizedLevel),
      levelNumber: normalizedLevel,
      completed: true,
      successful: true,
      timeTaken: Math.max(0, Math.round(now() - levelStartedAt)),
      timeDirection: false,
      xpEarned: xp,
      tasks: clone(tasks),
    };
    const safeAttempts = Math.max(0, Math.trunc(Number(attempts) || 0));
    const safeFirstTry = Math.max(0, Math.trunc(Number(firstTryCorrect) || 0));
    const payload = {
      gameId: String(gameId),
      name: runId,
      runId,
      highestLevelPlayed: normalizedLevel,
      level,
      xpEarned: xp,
      xpEarnedTotal: xp,
      rawData: [
        { key: "level", value: String(normalizedLevel) },
        { key: "stars", value: String(clamp(Math.trunc(Number(stars) || 1), 1, 3)) },
        { key: "attempts", value: String(safeAttempts) },
        { key: "first_try_correct", value: String(safeFirstTry) },
        { key: "accuracy", value: String(safeAttempts ? safeFirstTry / safeAttempts : 0) },
        { key: "score", value: String(Math.round(Number(score) || 0)) },
        { key: "xp_earned", value: String(xp) },
        { key: "level_xp_max", value: String(getLevelXpMaximum(normalizedLevel, totalLevels)) },
        { key: "campaign_xp_cap", value: String(CAMPAIGN_XP_CAP) },
      ],
      diagnostics: { levels: [level] },
      timestamp: new Date().toISOString(),
    };

    submittedLevels.add(normalizedLevel);
    deliver(payload);
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("sorter-analytics-submitted", { detail: clone(payload) }));
    }
    return payload;
  };

  const resetRun = () => {
    if (!enabled) return;
    beginRun();
  };

  if (enabled) {
    beginRun();
    installDeliveryListeners();
  }

  return Object.freeze({
    startLevel,
    recordTask,
    completeLevel,
    resetRun,
    getRunId: () => runId,
    getCampaignXpCap: () => CAMPAIGN_XP_CAP,
  });
}
