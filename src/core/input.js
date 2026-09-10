const bindings = {
  Escape: "pause", Enter: "confirm", " ": "confirm",
};

export function bindInput(onAction) {
  window.addEventListener("keydown", (event) => {
    const action = bindings[event.key];
    if (!action || event.repeat) return;
    event.preventDefault();
    onAction(action);
  });
}
