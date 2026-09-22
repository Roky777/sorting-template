# Shape and Motion Sorter — Grade 1

A dependency-free browser sorting game based on the supplied Grade 1 GDD. Serve this folder locally (for example `npx serve .`) because the ES modules in `src/` cannot be loaded reliably from `file://` URLs.

## Complete campaign

| Level | Challenge | Goal | Name labels |
| --- | --- | ---: | --- |
| 1 | Long or Round | 15 | On |
| 2 | Long or Round Pictures | 15 | Off |
| 3 | Ball-like or Box-like | 16 | On |
| 4 | Cap-like or Glass-like | 16 | On |
| 5 | Shape Family Mix | 18 | On |
| 6 | Roll or Slide | 16 | On |
| 7 | Roll or Slide Pictures | 16 | Off |
| 8 | Roll, Slide or Both | 18 | On |
| 9 | Motion Master | 20 | Off |

The responsive conveyor keeps five or six evenly spaced items in play at a consistent world-space speed. Wrong answers and missed objects each deduct 10 points. Sparky uses event-driven sprite animations for tutorials, correct answers, mistakes, idle reactions, and the success celebration.

The first level includes a forced, skippable learn-by-doing tutorial. Progress is saved locally, and the game resumes from the highest unlocked level. Runtime assets are loaded in stages: the start screen first, the active level after Play, and reaction/success assets only when needed.

## Project map

```
assets/
  characters/    # production-ready Sparky animation sheets
  backgrounds/   # level backdrops and scenery
  items/         # matchable objects
  ui/            # buttons, icons, HUD artwork
  audio/         # music and sound effects
  fx/            # particles and decorative effects
src/
  core/          # serializable game state, rules, input
  data/          # asset manifest and level definitions
  render/        # visual scene and HUD updates
  ui/            # DOM overlays, menus, dialogs
styles/          # reset, shared rules, game layout
```

`src/core/` owns game rules and state. `src/render/` and `src/ui/` only draw that state, so game logic stays independent of the artwork supplied later.

## Adding assets

Place production files in the matching folder under `assets/`, then give them a stable key in `src/data/assets.js`. Game modules should use that key rather than hard-coded filenames. Keep raw exports and alternate takes outside the committed runtime set.
