# Novenara · Visual Style Guide

**Version 0.1 · Living document · November 2026**

**Direction:** Hand-inked storybook magitech. Build like a riverside village, draw like an illustrated adventure, and make the magic look like infrastructure someone maintains.

This guide sets the shared visual language for environments, characters, props, and effects. The ferry landing is our first test case, not the template for how every realm must be built. Core rules are established here; unresolved proportions and untested asset rules are marked as such.

## Reference order

| Reference | Use it for | Do not copy |
| --- | --- | --- |
| [Original ferry-arrival board](art-reference/ferry-arrival-original-board.png), **top panel A only** · 1536 × 1024 source board | Ink weight, warm timber-and-plaster buildings, terracotta roofs, awnings, and practical elemental equipment | The diagonal composition or the painted and pixel treatments in panels B and C |
| [Ferry Dock Playtest](https://novenara-ferry-playtest.bfribeiro.chatgpt.site/) · private review | North-up layout, arrival staging, exploration, and the shift into turn-based movement | The current courier-to-environment ratio, which was flagged as too small; the encounter is a test, not a story beat |
| [V4 courier model](COURIER-MODEL.md) and [source atlas](../dist/assets/courier.png) · 480 × 384, four rows of five 96 × 96 frames | Character identity, color blocking, silhouettes, facing rows, foot anchor, and walk cadence | The current background-to-sprite display ratio as a permanent standard |

![Original ferry-arrival board. The top panel A is the visual reference.](art-reference/ferry-arrival-original-board.png)

## Drawing rules

- **Ink:** Use confident, slightly irregular contours. Put the strongest line at important silhouettes, overlaps, and interaction edges. Use finer lines for joinery, seams, and wear. Save deep outlines for objects that need to read, rather than tracing every paving stone at the same weight.
- **Shading:** Use broad, clearly shaped shadows and a small number of values per material. Keep reflections, glow, and texture local. A lamp can glow; its entire supporting pipe does not need to.
- **Materials:** Use warm plaster, exposed timber, chipped stone and terracotta at Cove Way. Worn awnings, ceramic mounts, brass fasteners, and repaired planks make the place feel used. Show wear where hands, ropes, water, and feet would actually touch.
- **Palette:** Cove Way starts with warm cream and cedar, terracotta red, river teal, and small amber highlights. These are material and contrast roles, not locked swatches. Keep walkable surfaces quieter than the courier, doorways, hazards, and usable props. Other realms can have their own materials and palette while keeping the same ink and shading logic.
- **Avoid style drift:** No pixel filters, flat vector-icon finish, heavy relief-print hatching, loose gouache repaint, photoreal texturing, or neon applied as decoration. Night and rain can change the mood without changing the drawing style.

## Elemental technology

Start with a daily job and ask how a local person would use an element to do it. Then draw the equipment's source, what it moves or powers, and the part a person could operate or repair. A banked-ember dock lamp has a replaceable heat source and a brass collar. A ferry winch can use ceramic fittings where its mechanism needs insulation. A stone channel routes water to where it is useful.

Make regional differences grow out of climate, available materials, craft, and trade. Cove Way is a remote river village. Freight marks and imported components can hint at interrealm travel without putting a portal on the dock. Separate a suggested mechanism from established lore until it is approved.

## Camera, movement, and combat

- **Camera:** North-up, high orthographic 2D. Show enough roof and shallow south-facing wall to read entrances. Do not use a vanishing point, a diagonal isometric camera, or a different view for each asset.
- **Layout:** Block out the map on square cells first. Place walkable paths, gangplanks, doors, stairs, cover, and collision boundaries before painting details. Keep the invisible grid separate from paving joints, planks, and other textures. Props may visually overhang if the passable space underneath remains clear.
- **Combat:** Reuse the same walkability and occupancy rules from exploration. Highlight legal movement or attack tiles when needed. Keep the full grid hidden by default; an inspection overlay is for testing only. Differentiate blocked water, walls, railings, and props through shapes and edges, not color alone.
- **Layering:** Keep actors and movable props separate from the environment painting. Anchor actors at their feet. Where sprites can walk behind an awning or tall prop, split the foreground so occlusion follows where the player stands.

## Open: courier-to-environment proportions

The V4 courier currently reads **too small** beside the ferry, doorway, and surrounding props in the dock test. Keep the approved atlas intact. Before locking a scale, compare the current baseline with two larger on-screen footprints on the **same camera and map**. In each, check the courier against a single human-sized doorway, the rail, a crate and another actor. Judge the visible body and foot position, not the transparent frame dimensions.

Pick the smallest size that feels believable and stays legible while walking or fighting. If a larger body crowds the gangplank or overlaps nearby tiles, test a narrower prop footprint or rebalance the setting before changing the underlying grid. Do not adjust hitboxes automatically when enlarging artwork. Record the approved comparison image, display scale, and foot anchor here once chosen.

## Prompt for new artwork

Feed the relevant reference **image and its role** into each request. The words “storybook magitech” alone are not enough.

> **Novenara | [asset and purpose].** Match the visual language of the original ferry-arrival board, top panel A only: hand-inked contours with restrained line weight, clean shaped shadows, matte material color, and localized wear. Use [area and local materials]. This [object/building] helps people [daily task], by [element and visible mechanism], with [part someone would operate or repair]. Match the production north-up gameplay camera, [tile footprint and dimensions], [light direction], and [anchor or occlusion rule]. Keep [walkable and usable parts] visually obvious. Preserve the approved courier design when it appears. No visible grid, captions, neon decoration, pixel treatment, or photoreal rendering.

For each asset, specify output dimensions and transparency/layer needs. For a sprite, specify the sheet rows, frame count, feet anchor and animation cadence. For a prop, specify its footprint and interaction face. For a background, include the level blockout as a **geometry** reference. Record the final prompt and reference version with approved assets; retain unapproved variants separately.

## Art review checklist

- [ ] At play size, the courier, entrance, usable object, and dangerous edge read without turning the grid on.
- [ ] The camera, line weight, light direction, and visible body-to-object scale match the neighboring assets.
- [ ] The same route works by keyboard and pointer. Check entry, tight corners, water edges, and foreground overlap.
- [ ] Combat highlights remain legible over the art, and both actors' footprints align with their tiles.
- [ ] A separately generated prop such as a lamp or crate still looks like it belongs when composited beside the courier.
- [ ] Save the approved frame and standalone assets, their actual resolutions and anchors, and any changes to the reusable prompt.

### Change log

- **0.1:** Captures Option A and the hidden-grid rules; records courier scale as open pending a side-by-side playtest. No game files changed.
