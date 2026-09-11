const item = (name, art, answer) => ({ name, art, answer });

const shapeIcons = {
  long: "pencil",
  round: "ball",
  ball: "football",
  box: "matchbox",
  cap: "cap",
  glass: "glass",
  rolls: "ball",
  slides: "book",
  both: "bottle",
};

const bins = (entries) => entries.map(([id, label]) => ({ id, label, art: shapeIcons[id] }));

const LEVELS = [
  {
    title: "Long or Round",
    instruction: "Sort each object: long or round?",
    showNames: true,
    bins: bins([["long", "Long"], ["round", "Round"]]),
    items: [
      item("Pencil", "pencil", "long"), item("Ball", "ball", "round"), item("Ruler", "ruler", "long"), item("Orange", "orange", "round"), item("Candle", "candle", "long"),
      item("Plate", "plate", "round"), item("Straight rope", "rope", "long"), item("Bangle", "bangle", "round"), item("Stick", "pencil", "long"), item("Coin", "bangle", "round"),
    ],
  },
  {
    title: "Long or Round Pictures",
    instruction: "Look carefully. Is it long or round?",
    showNames: false,
    bins: bins([["long", "Long"], ["round", "Round"]]),
    items: [
      item("Pencil", "pencil", "long"), item("Ball", "ball", "round"), item("Candle", "candle", "long"), item("Orange", "orange", "round"), item("Ruler", "ruler", "long"),
      item("Plate", "plate", "round"), item("Stick", "pencil", "long"), item("Coin", "bangle", "round"), item("Straight rope", "rope", "long"), item("Bangle", "bangle", "round"),
    ],
  },
  {
    title: "Ball-like or Box-like",
    instruction: "Which shape family does it look like?",
    showNames: true,
    bins: bins([["ball", "Ball-like"], ["box", "Box-like"]]),
    items: [
      item("Football", "ball", "ball"), item("Orange", "orange", "ball"), item("Clay ball", "marble", "ball"), item("Marble", "marble", "ball"), item("Toy ball", "ball", "ball"),
      item("Matchbox", "matchbox", "box"), item("Book", "book", "box"), item("Pencil box", "pencilbox", "box"), item("Cardboard box", "matchbox", "box"), item("Food box", "pencilbox", "box"),
    ],
  },
  {
    title: "Cap-like or Glass-like",
    instruction: "Match the object to its shape family.",
    showNames: true,
    bins: bins([["cap", "Cap-like"], ["glass", "Glass-like"]]),
    items: [
      item("Birthday cap", "cap", "cap"), item("Funnel", "cap", "cap"), item("Paper cone", "cap", "cap"), item("Toy cone", "cap", "cap"), item("Party hat", "cap", "cap"),
      item("Drinking glass", "glass", "glass"), item("Water bottle", "bottle", "glass"), item("Tall jar", "glass", "glass"), item("Cylinder", "can", "glass"), item("Tall can", "can", "glass"),
    ],
  },
  {
    title: "Shape Family Mix",
    instruction: "Choose the matching shape family.",
    showNames: true,
    bins: bins([["ball", "Ball-like"], ["glass", "Glass-like"], ["box", "Box-like"]]),
    items: [
      item("Football", "ball", "ball"), item("Orange", "orange", "ball"), item("Clay ball", "marble", "ball"), item("Drinking glass", "glass", "glass"), item("Water bottle", "bottle", "glass"),
      item("Tall can", "can", "glass"), item("Matchbox", "matchbox", "box"), item("Book", "book", "box"), item("Pencil box", "pencilbox", "box"), item("Cardboard box", "matchbox", "box"),
    ],
  },
  {
    title: "Roll or Slide",
    instruction: "What will it do on a surface?",
    showNames: true,
    bins: bins([["rolls", "Rolls"], ["slides", "Slides"]]),
    items: [
      item("Ball", "ball", "rolls"), item("Book", "book", "slides"), item("Orange", "orange", "rolls"), item("Matchbox", "matchbox", "slides"), item("Marble", "marble", "rolls"),
      item("Notebook", "book", "slides"), item("Clay ball", "marble", "rolls"), item("Pencil box", "pencilbox", "slides"), item("Toy ball", "ball", "rolls"), item("Flat box", "matchbox", "slides"),
    ],
  },
  {
    title: "Roll or Slide Pictures",
    instruction: "Look at the picture. Does it roll or slide?",
    showNames: false,
    bins: bins([["rolls", "Rolls"], ["slides", "Slides"]]),
    items: [
      item("Ball", "ball", "rolls"), item("Book", "book", "slides"), item("Orange", "orange", "rolls"), item("Matchbox", "matchbox", "slides"), item("Marble", "marble", "rolls"),
      item("Notebook", "book", "slides"), item("Clay ball", "marble", "rolls"), item("Pencil box", "pencilbox", "slides"), item("Toy ball", "ball", "rolls"), item("Flat box", "matchbox", "slides"),
    ],
  },
  {
    title: "Roll, Slide or Both",
    instruction: "Can it roll, slide, or do both?",
    showNames: true,
    bins: bins([["rolls", "Rolls"], ["both", "Both"], ["slides", "Slides"]]),
    items: [
      item("Ball", "ball", "rolls"), item("Orange", "orange", "rolls"), item("Marble", "marble", "rolls"), item("Book", "book", "slides"), item("Matchbox", "matchbox", "slides"),
      item("Pencil box", "pencilbox", "slides"), item("Water bottle", "bottle", "both"), item("Tin can", "can", "both"), item("Toy cylinder", "can", "both"), item("Cylinder", "bottle", "both"),
    ],
  },
  {
    title: "Motion Master",
    instruction: "Use everything you know about movement!",
    showNames: false,
    bins: bins([["rolls", "Rolls"], ["both", "Both"], ["slides", "Slides"]]),
    items: [
      item("Football", "ball", "rolls"), item("Orange", "orange", "rolls"), item("Clay ball", "marble", "rolls"), item("Book", "book", "slides"), item("Matchbox", "matchbox", "slides"),
      item("Cardboard box", "matchbox", "slides"), item("Water bottle", "bottle", "both"), item("Tin can", "can", "both"), item("Toy cylinder", "can", "both"), item("Cylindrical jar", "bottle", "both"),
    ],
  },
];

const exactArt = {
  level3: { Football: "football", "Clay ball": "clayball", "Toy ball": "roundtoy", "Cardboard box": "cardboard", "Food box": "foodbox" },
  level4: { "Birthday cap": "birthdaycap", Funnel: "funnel", "Paper cone": "papercone", "Toy cone": "toycone", "Party hat": "partyhat", "Drinking glass": "glass", "Water bottle": "bottle", "Tall jar": "jar", Cylinder: "cylinder", "Tall can": "can" },
  level5: { Football: "football", "Clay ball": "clayball", "Cardboard box": "cardboard" },
  level6: { "Clay ball": "clayball", "Toy ball": "roundtoy", "Flat box": "flatbox" },
  level7: { "Clay ball": "clayball", "Toy ball": "roundtoy", "Flat box": "flatbox" },
  level8: { Ball: "football", Football: "football", "Toy cylinder": "cylinder", Cylinder: "cylinder" },
  level9: { Football: "football", "Clay ball": "clayball", "Cardboard box": "cardboard", "Toy cylinder": "cylinder", "Cylindrical jar": "cylinder" },
};

// Every item carries its source art set.  Rendering stays reusable while the
// assets follow the supplied Grade 1 Maths folder structure for Levels 1–9.
export const MATH_LEVELS = LEVELS.map((level, index) => ({
  ...level,
  assetSet: `level${index + 1}`,
  requiredCorrectPerItem: 2,
  maxObjectsStart: [1, 2, 1, 2, 2, 1, 2, 1, 3][index],
  bins: level.bins.map((entry) => ({
    ...entry,
    art: index >= 7 && entry.id === "rolls" ? "football" : entry.art,
    assetSet: `level${index + 1}`,
  })),
  items: level.items.map((entry) => ({
    ...entry,
    art: exactArt[`level${index + 1}`]?.[entry.name] ?? entry.art,
    assetSet: `level${index + 1}`,
  })),
}));

export const getLevel = (index) => MATH_LEVELS[index];
