const grade1Math = (path) => new URL(`../../assets/GRADE 1/maths game/${path}`, import.meta.url).href;

const levelArt = {
  level1: { pencil: "LEVEL 1+2/pencil.webp", ball: "LEVEL 1+2/ball (1).webp", ruler: "LEVEL 1+2/scale (1).webp", orange: "LEVEL 1+2/orange (1).webp", candle: "LEVEL 1+2/candle.webp", plate: "LEVEL 1+2/plate (1).webp", rope: "LEVEL 1+2/rope.webp", bangle: "LEVEL 1+2/ring (1).webp" },
  level2: { pencil: "LEVEL 1+2/pencil.webp", ball: "LEVEL 1+2/ball (1).webp", ruler: "LEVEL 1+2/scale (1).webp", orange: "LEVEL 1+2/orange (1).webp", candle: "LEVEL 1+2/candle.webp", plate: "LEVEL 1+2/plate (1).webp", rope: "LEVEL 1+2/rope.webp", bangle: "LEVEL 1+2/ring (1).webp" },
  level3: { football: "level 3/football.webp", orange: "level 3/orange.webp", clayball: "level 3/clay ball.webp", marble: "level 3/marble.webp", roundtoy: "level 3/round toy ball.webp", matchbox: "level 3/matchbox.webp", book: "level 3/book.webp", pencilbox: "level 3/stationary box.webp", cardboard: "level 3/cardboard box.webp", foodbox: "level 3/empty food box.webp" },
  level4: { birthdaycap: "level 4/birthday_cap.webp", funnel: "level 4/funnel.webp", papercone: "level 4/paper_cone.webp", toycone: "level 4/toy_cone.webp", partyhat: "level 4/cone-shaped_party_hat.webp", glass: "level 4/drinking_glass.webp", bottle: "level 4/water_bottle (1).webp", jar: "level 4/tall_jar (1).webp", cylinder: "level 4/cylinderical_container.webp", can: "level 4/tall_can.webp" },
  level5: { football: "LEVEL 5/football.webp", orange: "LEVEL 5/orange.webp", clayball: "LEVEL 5/clay ball.webp", glass: "LEVEL 5/drinking_glass.webp", bottle: "LEVEL 5/water_bottle (1).webp", can: "LEVEL 5/tall_can.webp", matchbox: "LEVEL 5/matchbox.webp", book: "LEVEL 5/book.webp", pencilbox: "LEVEL 5/pencil_box.webp", cardboard: "LEVEL 5/flat_cardboardbox.webp" },
  level6: { ball: "level 6/ball.webp", orange: "level 6/orange.webp", marble: "level 6/marble.webp", clayball: "level 6/clay ball.webp", roundtoy: "level 6/round toy ball.webp", matchbox: "level 6/matchbox.webp", book: "level 6/book.webp", pencilbox: "level 6/stationary box.webp", flatbox: "level 6/FLAT_CARDBOARD_BOX (1).webp" },
  level7: { ball: "level 7/ball (1).webp", orange: "level 7/orange.webp", marble: "level 7/marble.webp", clayball: "level 7/clay ball.webp", roundtoy: "level 7/round toy ball.webp", matchbox: "level 7/matchbox.webp", book: "level 7/book.webp", pencilbox: "level 7/stationary box.webp", flatbox: "level 7/FLAT_CARDBOARD_BOX (1).webp" },
  level8: { football: "level 8/football.webp", orange: "level 8/orange.webp", marble: "level 8/marble.webp", matchbox: "level 8/matchbox.webp", book: "level 8/book.webp", pencilbox: "level 8/stationary box.webp", bottle: "level 8/water_bottle (1).webp", can: "level 8/tin can (1).webp", cylinder: "level 8/toy cylinder (1).webp" },
  level9: { football: "level 9/football.webp", orange: "level 9/orange.webp", clayball: "level 9/clay ball.webp", matchbox: "level 9/matchbox.webp", book: "level 9/book.webp", cardboard: "level 9/cardboard box.webp", bottle: "level 9/water_bottle.webp", can: "level 9/tin can (1).webp", cylinder: "level 9/toy cylinder (1).webp" },
};

const mathByLevel = Object.fromEntries(Object.entries(levelArt).map(([level, entries]) => [level, Object.fromEntries(Object.entries(entries).map(([key, path]) => [key, grade1Math(path)]))]));

export function resolveMathArt(artId, assetSet) {
  return mathByLevel?.[assetSet]?.[artId] ?? assets.items.math[artId] ?? assets.items.math.ball;
}

// Keep filename changes local: game code references stable manifest keys, never paths.
export const assets = {
  characters: {
    idle: "assets/characters/idle.webp",
    presentation: "assets/characters/final_presentation_clean.webp",
    correct: "assets/characters/modified_thubms_up.webp",
    nod: "assets/characters/updated_nod.webp",
    happy: "assets/characters/happy.webp",
    thinking: "assets/characters/thinking.webp",
    surprised: "assets/characters/surprised.webp",
    successDance: "assets/characters/moon_walk_normalized.webp",
  },
  backgrounds: {},
  items: {
    // Resolve from this module rather than the page URL. The old document-relative
    // path can point at a missing location when the game is served from a route.
    sortingBox: new URL("../../assets/items/math-sorting-box.webp", import.meta.url).href,
    cardboardBoxLong: new URL("../../assets/ui/long-sort-bin.webp", import.meta.url).href,
    cardboardBoxRound: new URL("../../assets/ui/round-sort-bin.webp", import.meta.url).href,
    math: {
      pencil: "assets/GRADE 1/maths game/LEVEL 1+2/pencil.webp",
      ball: "assets/GRADE 1/maths game/LEVEL 1+2/ball (1).webp",
      ruler: "assets/GRADE 1/maths game/LEVEL 1+2/scale (1).webp",
      orange: "assets/GRADE 1/maths game/LEVEL 1+2/orange (1).webp",
      candle: "assets/GRADE 1/maths game/LEVEL 1+2/candle.webp",
      plate: "assets/GRADE 1/maths game/LEVEL 1+2/plate (1).webp",
      rope: "assets/GRADE 1/maths game/LEVEL 1+2/rope.webp",
      bangle: "assets/GRADE 1/maths game/LEVEL 1+2/ring (1).webp",
      book: "assets/GRADE 1/maths game/level 3/book.webp",
      matchbox: "assets/GRADE 1/maths game/level 3/matchbox.webp",
      pencilbox: "assets/GRADE 1/maths game/level 3/stationary box.webp",
      glass: "assets/GRADE 1/maths game/level 4/drinking_glass.webp",
      bottle: "assets/GRADE 1/maths game/level 4/water_bottle (1).webp",
      can: "assets/GRADE 1/maths game/level 4/tall_can.webp",
      cap: "assets/GRADE 1/maths game/level 4/birthday_cap.webp",
      marble: "assets/GRADE 1/maths game/level 3/marble.webp",
    },
    mathByLevel,
  },
  ui: {
    success: [
      "assets/ui/start-background.webp",
      "assets/ui/image 18.webp",
      "assets/ui/success-star-1.webp",
      "assets/ui/success-star-2.webp",
      "assets/ui/success-star-3.webp",
    ],
    conveyorRims: "assets/ui/conveyor-rims.webp",
    conveyorFrame: "assets/ui/conveyor-frame.webp",
    conveyorTrackMask: "assets/ui/conveyor-track.webp",
    sortingBins: {
      long: "assets/ui/long-sort-bin.webp",
      round: "assets/ui/round-sort-bin.webp",
      ball: "assets/ui/ball-like-sort-bin.webp",
      box: "assets/ui/box-like-sort-bin.webp",
      cap: "assets/ui/cap-like-sort-bin.webp",
      glass: "assets/ui/glass-like-sort-bin.webp",
      rolls: "assets/ui/rolls-sort-bin.webp",
      slides: "assets/ui/slides-sort-bin.webp",
      both: "assets/ui/both-sort-bin.webp",
    },
    boxLeaves: "assets/ui/ui-box-leaves.webp",
  },
  audio: {},
  fx: {},
};

// A small shared cache keeps staged preloads from requesting the same image
// more than once. The browser cache still does the heavy lifting; this map
// also lets callers await readiness before revealing a new game surface.
const imageRequests = new Map();

export function preloadImage(src) {
  if (!src) return Promise.resolve();
  if (imageRequests.has(src)) return imageRequests.get(src);
  const request = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = async () => {
      // An image can be downloaded but still cost a visible decode on its
      // first painted frame. Decode it during the hidden warm-up instead.
      await image.decode?.().catch(() => {});
      resolve({ src, loaded: true });
    };
    image.onerror = () => resolve({ src, loaded: false });
    image.src = src;
  });
  imageRequests.set(src, request);
  return request;
}

export function hydrateDeferredImages(root = document) {
  const images = [...root.querySelectorAll("img[data-src]")];
  return Promise.all(images.map((image) => {
    const src = image.dataset.src;
    delete image.dataset.src;
    image.src = src;
    return image.decode?.().catch(() => {}) ?? preloadImage(src);
  }));
}

export function preloadLevelAssets(level) {
  if (!level) return Promise.resolve([]);
  const urls = new Set([
    assets.ui.boxLeaves,
    ...level.items.map((entry) => resolveMathArt(entry.art, entry.assetSet)),
    ...level.bins.flatMap((entry) => [
      resolveMathArt(entry.art, entry.assetSet),
      assets.ui.sortingBins[entry.id] ?? assets.ui.sortingBins.long,
    ]),
  ]);
  return Promise.all([...urls].map(preloadImage));
}
