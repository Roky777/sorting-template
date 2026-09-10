// This is the single source of truth for conveyor travel. Both the seam SVG
// and the objects subscribe to this same requestAnimationFrame clock.
const BELT_SPEED = 145;
const PERSPECTIVE_FACTOR = 0.82;

export function startConveyorAnimation() {
  const track = document.querySelector(".conveyor__track");
  const conveyor = document.querySelector(".conveyor");
  const seams = document.querySelector("#conveyor-seams");
  const itemLane = document.querySelector("#belt-item-layer");
  if (!track || !conveyor || !seams || !itemLane) return;

  let offset = 0;
  let lastTime = performance.now();
  let width = 0;
  let height = 0;
  let spacing = 180;

  function measure() {
    const conveyorHeight = Math.round(conveyor.getBoundingClientRect().height);
    const rearRimHeight = Math.max(2, Math.round(conveyorHeight * 0.018));
    const trackTop = Math.max(0, rearRimHeight - 2);
    const trackHeight = Math.round(conveyorHeight * 0.62) + 4;
    const frontTop = trackTop + trackHeight - 3;
    const frontHeight = Math.round(conveyorHeight * 0.7);
    conveyor.style.setProperty("--rear-rim-height", `${rearRimHeight}px`);
    conveyor.style.setProperty("--track-top", `${trackTop}px`);
    conveyor.style.setProperty("--track-height", `${trackHeight}px`);
    conveyor.style.setProperty("--front-top", `${frontTop}px`);
    conveyor.style.setProperty("--front-height", `${frontHeight}px`);

    const rect = track.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    spacing = Math.max(120, Math.min(180, width / 8));
    seams.setAttribute("viewBox", `0 0 ${width} ${height}`);
    seams.setAttribute("preserveAspectRatio", "none");
  }

  function draw() {
    const centerX = width / 2;
    const seamCount = Math.ceil(width / spacing) + 3;
    const stroke = Math.max(1.5, width * 0.0015);
    const paths = [];
    for (let index = -1; index < seamCount; index += 1) {
      const frontX = index * spacing + offset;
      const rearX = centerX + (frontX - centerX) * PERSPECTIVE_FACTOR;
      paths.push(`<line x1="${frontX}" y1="${height}" x2="${rearX}" y2="0" stroke-width="${stroke}" />`);
    }
    seams.innerHTML = paths.join("");
  }

  function tick(now) {
    const deltaSeconds = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const dx = BELT_SPEED * deltaSeconds;
    offset = (offset + dx) % spacing;
    draw();
    // Game objects deliberately do not use a CSS keyframe. Dispatching their
    // per-frame delta makes their movement visually locked to these seams.
    window.dispatchEvent(new CustomEvent("conveyor-motion", {
      detail: { dx, speed: BELT_SPEED, width, height },
    }));
    requestAnimationFrame(tick);
  }

  new ResizeObserver(() => {
    measure();
    draw();
  }).observe(conveyor);
  measure();
  draw();
  requestAnimationFrame(tick);
}
