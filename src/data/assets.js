const grade1Math = (path) => new URL(`../../assets/GRADE 1/maths game/${path}`, import.meta.url).href;

const levelArt = {
  level1: { pencil: "LEVEL 1+2/pencil.png", ball: "LEVEL 1+2/ball (1).png", ruler: "LEVEL 1+2/scale (1).png", orange: "LEVEL 1+2/orange (1).png", candle: "LEVEL 1+2/candle.png", plate: "LEVEL 1+2/plate (1).png", rope: "LEVEL 1+2/rope.png", bangle: "LEVEL 1+2/ring (1).png" },
  level2: { pencil: "LEVEL 1+2/pencil.png", ball: "LEVEL 1+2/ball (1).png", ruler: "LEVEL 1+2/scale (1).png", orange: "LEVEL 1+2/orange (1).png", candle: "LEVEL 1+2/candle.png", plate: "LEVEL 1+2/plate (1).png", rope: "LEVEL 1+2/rope.png", bangle: "LEVEL 1+2/ring (1).png" },
  level3: { football: "level 3/football.png", orange: "level 3/orange.png", clayball: "level 3/clay ball.png", marble: "level 3/marble.png", roundtoy: "level 3/round toy ball.png", matchbox: "level 3/matchbox.png", book: "level 3/book.png", pencilbox: "level 3/stationary box.png", cardboard: "level 3/cardboard box.png", foodbox: "level 3/empty food box.png" },
  level4: { birthdaycap: "level 4/birthday_cap.png", funnel: "level 4/funnel.png", papercone: "level 4/paper_cone.png", toycone: "level 4/toy_cone.png", partyhat: "level 4/cone-shaped_party_hat.png", glass: "level 4/drinking_glass.png", bottle: "level 4/water_bottle (1).png", jar: "level 4/tall_jar (1).png", cylinder: "level 4/cylinderical_container.png", can: "level 4/tall_can.png" },
  level5: { football: "LEVEL 5/football.png", orange: "LEVEL 5/orange.png", clayball: "LEVEL 5/clay ball.png", glass: "LEVEL 5/drinking_glass.png", bottle: "LEVEL 5/water_bottle (1).png", can: "LEVEL 5/tall_can.png", matchbox: "LEVEL 5/matchbox.png", book: "LEVEL 5/book.png", pencilbox: "LEVEL 5/pencil_box.png", cardboard: "LEVEL 5/flat_cardboardbox.png" },
  level6: { ball: "level 6/ball.png", orange: "level 6/orange.png", marble: "level 6/marble.png", clayball: "level 6/clay ball.png", roundtoy: "level 6/round toy ball.png", matchbox: "level 6/matchbox.png", book: "level 6/book.png", pencilbox: "level 6/stationary box.png", flatbox: "level 6/FLAT_CARDBOARD_BOX (1).png" },
  level7: { ball: "level 7/ball (1).png", orange: "level 7/orange.png", marble: "level 7/marble.png", clayball: "level 7/clay ball.png", roundtoy: "level 7/round toy ball.png", matchbox: "level 7/matchbox.png", book: "level 7/book.png", pencilbox: "level 7/stationary box.png", flatbox: "level 7/FLAT_CARDBOARD_BOX (1).png" },
  level8: { football: "level 8/football.png", orange: "level 8/orange.png", marble: "level 8/marble.png", matchbox: "level 8/matchbox.png", book: "level 8/book.png", pencilbox: "level 8/stationary box.png", bottle: "level 8/water_bottle (1).png", can: "level 8/tin can (1).png", cylinder: "level 8/toy cylinder (1).png" },
  level9: { football: "level 9/football.png", orange: "level 9/orange.png", clayball: "level 9/clay ball.png", matchbox: "level 9/matchbox.png", book: "level 9/book.png", cardboard: "level 9/cardboard box.png", bottle: "level 9/water_bottle.png", can: "level 9/tin can (1).png", cylinder: "level 9/toy cylinder (1).png" },
};

const mathByLevel = Object.fromEntries(Object.entries(levelArt).map(([level, entries]) => [level, Object.fromEntries(Object.entries(entries).map(([key, path]) => [key, grade1Math(path)]))]));

// Keep filename changes local: game code references stable manifest keys, never paths.
export const assets = {
  characters: {},
  backgrounds: {},
  items: {
    // Resolve from this module rather than the page URL. The old document-relative
    // path can point at a missing location when the game is served from a route.
    sortingBox: new URL("../../assets/items/math-sorting-box.png", import.meta.url).href,
    cardboardBoxLong: new URL("../../assets/ui/long-sort-bin.png", import.meta.url).href,
    cardboardBoxRound: new URL("../../assets/ui/round-sort-bin.png", import.meta.url).href,
    math: {
      pencil: "assets/GRADE 1/maths game/LEVEL 1+2/pencil.png",
      ball: "assets/GRADE 1/maths game/LEVEL 1+2/ball (1).png",
      ruler: "assets/GRADE 1/maths game/LEVEL 1+2/scale (1).png",
      orange: "assets/GRADE 1/maths game/LEVEL 1+2/orange (1).png",
      candle: "assets/GRADE 1/maths game/LEVEL 1+2/candle.png",
      plate: "assets/GRADE 1/maths game/LEVEL 1+2/plate (1).png",
      rope: "assets/GRADE 1/maths game/LEVEL 1+2/rope.png",
      bangle: "assets/GRADE 1/maths game/LEVEL 1+2/ring (1).png",
      book: "assets/GRADE 1/maths game/level 3/book.png",
      matchbox: "assets/GRADE 1/maths game/level 3/matchbox.png",
      pencilbox: "assets/GRADE 1/maths game/level 3/stationary box.png",
      glass: "assets/GRADE 1/maths game/level 4/drinking_glass.png",
      bottle: "assets/GRADE 1/maths game/level 4/water_bottle (1).png",
      can: "assets/GRADE 1/maths game/level 4/tall_can.png",
      cap: "assets/GRADE 1/maths game/level 4/birthday_cap.png",
      marble: "assets/GRADE 1/maths game/level 3/marble.png",
    },
    mathByLevel,
  },
  ui: {
    conveyorFrame: "assets/ui/conveyor-frame.png",
    conveyorTrackMask: "assets/ui/conveyor-track.png",
  },
  audio: {},
  fx: {},
};
