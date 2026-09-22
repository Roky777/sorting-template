export const SAVE_KEY = "shapeMotionSorter_progress";
const SAVE_VERSION = 1;

function getStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function validLevel(value, levelCount) {
  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= levelCount ? level : null;
}

function readLocalHighestLevel(levelCount) {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const data = JSON.parse(storage.getItem(SAVE_KEY) ?? "null");
    if (!data || data.version !== SAVE_VERSION) return null;
    return validLevel(data.highestLevelPlayed, levelCount);
  } catch {
    return null;
  }
}

function readInjectedHighestLevel(levelCount) {
  // Matches the reference game's React Native/WebView bridge contract.
  const payload = globalThis.window?.userInfo;
  return validLevel(payload?.highestLevelPlayed, levelCount);
}

export function saveHighestLevel(level, levelCount) {
  const storage = getStorage();
  const nextLevel = validLevel(level, levelCount);
  if (!storage || nextLevel === null) return false;
  try {
    const existing = readLocalHighestLevel(levelCount) ?? 1;
    storage.setItem(SAVE_KEY, JSON.stringify({
      highestLevelPlayed: Math.max(existing, nextLevel),
      lastUpdated: Date.now(),
      version: SAVE_VERSION,
    }));
    return true;
  } catch {
    return false;
  }
}

export function readGameSave(levelCount) {
  const localLevel = readLocalHighestLevel(levelCount);
  const injectedLevel = readInjectedHighestLevel(levelCount);
  const highestLevelPlayed = Math.max(localLevel ?? 1, injectedLevel ?? 1);

  // Keep the offline copy synchronized when a WebView/backend payload is newer.
  if (injectedLevel !== null && injectedLevel > (localLevel ?? 0)) {
    saveHighestLevel(injectedLevel, levelCount);
  }

  return highestLevelPlayed > 1
    ? { levelIndex: highestLevelPlayed - 1, level: highestLevelPlayed }
    : null;
}

export function clearGameSave() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
