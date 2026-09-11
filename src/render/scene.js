import { assets } from "../data/assets.js";

function art(artId, className = "", assetSet) {
  const icon = document.createElement("img");
  icon.className = `math-art ${className}`.trim();
  icon.src = assets.items.mathByLevel?.[assetSet]?.[artId] ?? assets.items.math[artId] ?? assets.items.math.ball;
  icon.alt = "";
  return icon;
}

function renderItems(items, level, state) {
  const layer = document.querySelector("#belt-item-layer");
  const existing = new Map(
    [...layer.querySelectorAll("[data-draggable-item]")].map((element) => [element.dataset.itemId, element]),
  );
  const nextElements = [];
  for (const currentItem of items) {
    const showName = level.showNames && (!level.showNamesUntilSpawn || currentItem.spawnOrder <= level.showNamesUntilSpawn);
    let object = existing.get(String(currentItem.id));
    if (!object) {
      object = document.createElement("div");
      object.className = "game-item";
      object.dataset.draggableItem = "true";
      object.dataset.itemId = currentItem.id;
      object.setAttribute("role", "button");
      object.tabIndex = 0;
      object.setAttribute("aria-label", `Drag ${currentItem.name} to the correct box`);
      object.append(art(currentItem.art, "game-item__art", currentItem.assetSet));
    }
    let name = object.querySelector(".game-item__name");
    if (showName && !name) {
      name = document.createElement("span");
      name.className = "game-item__name";
      object.append(name);
    }
    if (name) {
      name.textContent = currentItem.name;
      name.hidden = !showName;
    }
    if (currentItem.beltState !== "dragging") {
      object.className = `game-item${String(state.selectedItemId) === String(currentItem.id) ? " game-item--selected" : ""}`;
      object.style.top = "";
      object.style.bottom = "";
      object.style.pointerEvents = "";
    }
    // `x` is advanced by the shared conveyor controller. Keeping the value in
    // state means a harmless UI re-render cannot restart or desynchronise it.
    object.style.left = `${currentItem.x ?? -160}px`;
    object.style.setProperty("--item-scale", String(currentItem.visualScale ?? 1));
    object.style.setProperty("--item-rotation", `${currentItem.rotation ?? 0}deg`);
    nextElements.push(object);
  }
  layer.replaceChildren(...nextElements);
}

function createBin(bin, itemName, state) {
  const root = document.createElement("div");
  const hasBakedArtwork = bin.id === "long" || bin.id === "round";
  root.className = `sorting-bin sorting-bin--cardboard sorting-bin--${bin.id}${hasBakedArtwork ? " sorting-bin--baked" : " sorting-bin--dynamic"}${state.feedback?.type === "wrong" && state.feedback.category === bin.id ? " sorting-bin--shake" : ""}${state.placed?.category === bin.id ? " sorting-bin--receiving" : ""}${state.hintCategory === bin.id ? " sorting-bin--hint" : ""}`;
  root.dataset.dropCategory = bin.id;
  root.setAttribute("role", "button");
  root.tabIndex = 0;
  root.setAttribute("aria-label", `${bin.label} sorting box`);
  
  // Invisible hit area slightly larger than visible box for easier dropping
  const hitArea = document.createElement("div");
  hitArea.className = "sorting-bin__hit-area";
  root.append(hitArea);
  
  // Use cardboard box image based on bin type
  // The provided artwork includes the icon and label baked in.
  const boxImageSrc = bin.id === "round" ? assets.items.cardboardBoxRound : assets.items.cardboardBoxLong;
  
  // Main box image
  const boxImage = document.createElement("img");
  boxImage.className = "sorting-bin__image";
  boxImage.src = boxImageSrc;
  boxImage.alt = "";
  root.append(boxImage);

  if (!hasBakedArtwork) {
    const category = document.createElement("div");
    category.className = "sorting-bin__category";
    category.append(art(bin.art, "sorting-bin__category-icon", bin.assetSet));
    const label = document.createElement("strong");
    label.className = "sorting-bin__category-label";
    label.textContent = bin.label.toUpperCase();
    category.append(label);
    root.append(category);
  }
  
  if (state.placed?.category === bin.id) {
    // Drop mask for the animation of item entering the box
    // Positioned to match the opening of the cardboard box in the artwork
    const dropMask = document.createElement("div");
    dropMask.className = "sorting-bin__drop-mask";
    dropMask.append(art(state.placed.art, "sorting-bin__dropped-item", state.placed.assetSet));
    root.append(dropMask);
  }
  
  return root;
}

export function renderScene(state, level) {
  const scene = document.querySelector("#scene");
  scene.dataset.level = state.level;
  scene.classList.toggle("scene--focused-hint", Boolean(state.hintCategory));
  renderItems(state.completedLevel || state.screen === "complete" ? [] : state.activeItems, level, state);
  const root = document.querySelector("#sorting-bins");
  root.dataset.level = String(state.level);
  root.dataset.count = String(level.bins.length);
  root.replaceChildren(...level.bins.map((bin) => createBin(bin, "item", state)));
}
