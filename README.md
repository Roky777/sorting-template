# Brain Match

A dependency-free, asset-ready browser game scaffold. Serve this folder locally (for example `npx serve .`) because the ES modules in `src/` cannot be loaded reliably from `file://` URLs.

## Project map

```
assets/
  characters/    # mascot/player art
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
