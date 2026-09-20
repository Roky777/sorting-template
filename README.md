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

The conveyor displays two items on compact screens, three on medium screens, and up to five on wide screens. Its movement speed is 290 px/s (twice the original 145 px/s). Wrong answers and missed objects each deduct 10 points. Sparky is deliberately represented by a styled placeholder until approved character art is supplied.

Normal play intentionally avoids large introduction and milestone popups so the conveyor, sorting bins, progress, and essential feedback remain unobstructed.

## Project map

```
assets/
  characters/    # reserved for future approved character art
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

Place new files in the matching folder under `assets/`, then give them a stable key in `src/data/assets.js`. Game modules should use that key rather than hard-coded filenames.
