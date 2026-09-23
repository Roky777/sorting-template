// This is the single source of truth for conveyor travel. Both the seam SVG
// and the objects subscribe to this same requestAnimationFrame clock.
// Move a fixed fraction of the lane each second so phones, tablets, and
// desktops all give the child the same amount of time to classify an item.
// Grade 1 pacing: a full lane crossing takes about 9.5 seconds on every
// device. The rate is viewport-relative, so phones and desktops give the
// child the same decision time.
export const BELT_TRAVEL_RATE = 0.105;
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
  let seamGroup;

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
    spacing = Math.max(64, width / 8);
    seams.setAttribute("viewBox", `0 0 ${width} ${height}`);
    seams.setAttribute("preserveAspectRatio", "none");
    buildSeams();
  }

  function buildSeams() {
    const centerX = width / 2;
    const seamCount = Math.ceil(width / spacing) + 3;
    const stroke = Math.max(1.5, width * 0.0015);
    const namespace = "http://www.w3.org/2000/svg";
    seamGroup = document.createElementNS(namespace, "g");
    for (let index = -2; index < seamCount + 1; index += 1) {
      const frontX = index * spacing;
      const rearX = centerX + (frontX - centerX) * PERSPECTIVE_FACTOR;
      const line = document.createElementNS(namespace, "line");
      line.setAttribute("x1", String(frontX));
      line.setAttribute("y1", String(height));
      line.setAttribute("x2", String(rearX));
      line.setAttribute("y2", "0");
      line.setAttribute("stroke-width", String(stroke));
      seamGroup.append(line);
    }
    seams.replaceChildren(seamGroup);
  }

  function tick(now) {
    const deltaSeconds = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const beltSpeed = width * BELT_TRAVEL_RATE;
    const dx = beltSpeed * deltaSeconds;
    offset = (offset + dx) % spacing;
    // Move the cached seams with the same perspective geometry as the
    // original renderer: the front edge travels at full speed while the
    // rear edge travels at PERSPECTIVE_FACTOR. At the modulo wrap, every
    // seam lands exactly on its neighbour, so there is no visible snap.
    const perspectiveShear = (offset * (1 - PERSPECTIVE_FACTOR)) / height;
    seamGroup?.setAttribute(
      "transform",
      `matrix(1 0 ${perspectiveShear} 1 ${offset * PERSPECTIVE_FACTOR} 0)`,
    );
    // Game objects deliberately do not use a CSS keyframe. Dispatching their
    // per-frame delta makes their movement visually locked to these seams.
    window.dispatchEvent(new CustomEvent("conveyor-motion", {
      detail: { dx, speed: beltSpeed, width, height },
    }));
    requestAnimationFrame(tick);
  }

  new ResizeObserver(() => {
    measure();
  }).observe(conveyor);
  measure();
  requestAnimationFrame(tick);
}
