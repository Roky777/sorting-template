const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function decodeImage(image) {
  if (image.complete) {
    if (!image.naturalWidth) return Promise.resolve();
    return image.decode?.().catch(() => {}) ?? Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener("load", finish);
      image.removeEventListener("error", finish);
      Promise.resolve(image.decode?.()).catch(() => {}).finally(resolve);
    };
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
  });
}

export function waitForImages(root) {
  if (!root) return Promise.resolve();
  return Promise.all([...root.querySelectorAll("img")].map(decodeImage));
}

export function scheduleIdle(task, timeout = 2500) {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(() => task(), { timeout });
  }
  return window.setTimeout(() => task(), Math.min(timeout, 900));
}

export async function runStartupLoader({ screen, tasks, minimumVisibleMs = 650 }) {
  const startedAt = performance.now();
  const fill = screen?.querySelector("[data-loading-fill]");
  const track = screen?.querySelector(".loading-screen__track");
  const percent = screen?.querySelector("[data-loading-percent]");
  const status = screen?.querySelector("[data-loading-status]");
  let completed = 0;

  const update = (label) => {
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 100;
    fill?.style.setProperty("--loading-progress", `${progress}%`);
    track?.setAttribute("aria-valuenow", String(progress));
    if (percent) percent.textContent = `${progress}%`;
    if (status && label) status.textContent = label;
  };

  update("Warming up the sorting line…");
  await Promise.all(tasks.map(async ({ label, run }) => {
    try {
      await run();
    } catch (error) {
      console.warn(`[Startup] ${label} could not be fully prepared.`, error);
    } finally {
      completed += 1;
      update(completed === tasks.length ? "Ready to sort!" : "Loading pictures…");
    }
  }));

  const remaining = minimumVisibleMs - (performance.now() - startedAt);
  if (remaining > 0) await delay(remaining);
  document.body.classList.add("game-start-ready");
  screen?.classList.add("loading-screen--leaving");
  await delay(260);
  if (screen) screen.hidden = true;
}

export function registerRuntimeCache() {
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.info("Runtime cache is unavailable in this WebView.", error);
    });
  }, { once: true });
}
