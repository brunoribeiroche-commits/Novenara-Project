# Movement

**Decision, November 24, 2026:** Free movement is the preferred default for Novenara exploration. Future areas do not need a tile grid for movement or level layout. Combat movement is a separate decision.

## What the player should feel

- Hold WASD or the arrow keys to walk continuously. Two directions together produce diagonal movement at the same speed as walking straight.
- Click or tap clear ground to walk to the exact point. Route around obstructions when possible. Water and solid objects are not destinations.
- Face the direction of travel, stop where the input ends, and walk straight up or down without a sideways weave. No snapping to cell centers in exploration.
- The courier uses eight visual facings. The original V4 atlas supplies front, back, left and right; the four diagonal facings have independently drawn front and rear three-quarter poses. Use the same foot anchor and silhouette when switching directions.

## Collision and level design

Place walkable terrain, physical hazards and solid prop bases in world coordinates. Measure against the courier’s feet and visible size. A bench should stay long enough to look like a bench; check clearance around both ends instead of shortening the prop or blocking a large invisible area. Roofs, awnings, shadows and sprite padding do not extend the object’s collision. Water, railing edges and stairs should read clearly in the artwork.

Use an independent navigator for click-to-move. The ferry test checks a direct line first, then finds a detour using fine internal navigation samples. Those samples help find a route; they do not decide where the player can stand. Keyboard input can slide along an obstacle rather than getting caught on a corner.

## How we got here

The original square-grid prototype made small spaces feel restrictive. Smaller hexes gave directional variety, but pointy-top rows made held north/south input alternate diagonal steps. Straightening legal pairs hid most of the weave while preserving the tactical rules. Free movement felt better in the same dock scene and replaces the need to design exploration around either grid. Keep the earlier experiment as a reference, not a requirement.

## What is running where

The private ferry playtest defaults to **Movement: Free** and includes a **Movement** toggle for comparison. Its optional crab encounter still snaps into nearby legal hexes, uses the existing hex budget, and returns to the selected exploration mode afterward. This does not commit the game to hex combat. Future combat, targeting, and range rules remain open.

Prototype implementation (paths below are relative to the private playtest source, not GitHub main):

| File | Role |
| --- | --- |
| `dist/free-walk.mjs` | Normalized input, 8-way facing, collision substeps, exact click targets and safe detours |
| `dist/map.mjs` and `dist/scene-spec.mjs` | Walkable shapes and prop ground footprints |
| `dist/game.mjs` | Movement toggle, input and camera, interactions, transition to optional hex combat |
| `dist/courier-sprites.mjs` | Original and diagonal atlas rows; stand and walk frame selection |
| `tests/free-walk.test.mjs` | Straight motion, exact destinations, obstruction checks, ferry route, and safe combat entry |

Prototype tuning: 382 world px/s, 10 px collision radius, 15 px navigation sample spacing. Those are starting values from Cove Way, not design limits for the full game. The original V4 and companion diagonal atlases both use 96 × 96 frames, a foot anchor at (48, 84), and a 120 ms walk-frame cadence. The dock display uses a 108 px sprite box; the visible figure is about 83 px tall.

## Regression checks

- Hold up and down along the center of the pier and stop between the old hex centers. The feet stay in one column; the original back/front facings show.
- Compare horizontal and diagonal travel over the same key-hold duration. Arrows and WASD have the same directions.
- Walk up to both ends of the full-size bench, and approach a crate, the ticket window, and the waterline. Stop close to the base or edge without clipping.
- Click an off-center point on clear paving, then click around an obstruction. A blocked destination does not pull the courier into the river.
- Play the arrival in Free mode. The optional combat test should enter a reachable hex and leave free exploration available afterward.
