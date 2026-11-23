# Grid village · Ferry Landing

This iteration tests the space and the movement before introducing combat. It lives at `/grid/` so the original ferry landing remains available unchanged.

## Visual construction

The new environment plate is `dist/grid/village.png` (1672 × 941). It provides irregular cobbles, dirt, a natural riverbank, and a wide bridge approach; the tactical grid is not painted into the art. The plaza is wide enough to route around the crate stack and planter. When changing the art, re-check the bridge, stairs, ferry office, and vendor entries against the logical grid rather than relying on the image's boundaries alone.

The game uses the exact approved [V4 courier atlas](COURIER-MODEL.md). Interpolate the sprite across tile centers when walking, but use cell coordinates for navigation and future action range. A blocked cell or an unreachable destination should never look like an available move.

## Boundary of the prototype

Grid positioning and a movement-range preview are in scope. Initiative, enemy AI, attacks, damage, and party mechanics are not implemented by this map. The village art and movement should be evaluated separately from decisions about those systems.

## Map and controls

- `dist/grid/terrain.mjs`: named interaction points plus explicit walkable rectangles and independently blocked cells.
- `dist/grid/tiles.mjs`: reusable four-neighbor movement, tile centers, shortest paths, and budget-limited reachable cells.
- With the grid switched off, movement still uses the same 48 px tiles and collision rules. The grid overlay is diagnostic; it does not change which tiles are valid.
- Retain the original village at `/` for side-by-side playtests.
