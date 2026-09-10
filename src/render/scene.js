import { assets } from "../data/assets.js";

function art(artId, className = "", assetSet) {
  const icon = document.createElement("img");
  icon.className = `math-art ${className}`.trim();
  icon.src = assets.items.mathByLevel?.[assetSet]?.[artId] ?? assets.items.math[artId] ?? assets.items.math.ball;
  icon.alt = "";
  return icon;
}

function renderItems(items, showName) {
  const layer = document.querySelector("#belt-item-layer");
  layer.replaceChildren();
  for (const currentItem of items) {
    const object = document.createElement("div");
    object.className = "game-item";
    object.dataset.draggableItem = "true";
    object.dataset.itemId = currentItem.id;
    // `x` is advanced by the shared conveyor controller. Keeping the value in
    // state means a harmless UI re-render cannot restart or desynchronise it.
    object.style.left = `${currentItem.x ?? -160}px`;
    object.setAttribute("role", "img");
    object.setAttribute("aria-label", `Drag ${currentItem.name} to the correct box`);
    object.append(art(currentItem.art, "game-item__art", currentItem.assetSet));
    if (showName) {
      const name = document.createElement("span");
      name.className = "game-item__name";
      name.textContent = currentItem.name;
      object.append(name);
    }
    layer.append(object);
  }
}

function createBin(bin, itemName, state) {
  const root = document.createElement("div");
  root.className = `sorting-bin sorting-bin--cardboard sorting-bin--${bin.id}${state.feedback?.type === "wrong" && state.feedback.category === bin.id ? " sorting-bin--shake" : ""}${state.placed?.category === bin.id ? " sorting-bin--receiving" : ""}`;
  root.dataset.dropCategory = bin.id;
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", `${bin.label} sorting box`);
  
  // Invisible hit area slightly larger than visible box for easier dropping
  const hitArea = document.createElement("div");
  hitArea.className = "sorting-bin__hit-area";
  root.append(hitArea);
  
  // Use cardboard box image based on bin type
  // The provided artwork includes the icon and label baked in.
  const boxImageSrc = bin.id === "long" ? assets.items.cardboardBoxLong : assets.items.cardboardBoxRound;
  
  // Main box image
  const boxImage = document.createElement("img");
  boxImage.className = "sorting-bin__image";
  boxImage.src = boxImageSrc;
  boxImage.alt = "";
  root.append(boxImage);
  
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
  document.querySelector("#scene").dataset.level = state.level;
  renderItems(state.completedLevel || state.screen === "complete" ? [] : state.activeItems, level.showNames);
  const root = document.querySelector("#sorting-bins");
  root.dataset.count = String(level.bins.length);
  root.replaceChildren(...level.bins.map((bin) => createBin(bin, "item", state)));
}
