# Gust · Cove Way free movement

Face the practice barrel on the quay below the ticket office and press **R**, or select **Gust**. Move nearer or farther to compare when the wind reaches the barrel; a missed or blocked burst does not reposition it. Restart returns the barrel to its starting position. Gust does not change the optional grid/combat prototype.

- **Character:** twelve cels for each of South, North, East, and West, with directional idle bookends. North and East have the revised braced poses and padded 256 × 256 cels; South and West use 192 × 256. Diagonals use East or West as an interim cast, but the diagonal wind is its own effect.
- **Wind:** separate transparent effects in all eight directions, based on the same Sorceress-derived art. South uses the straighter down-screen revision. Its launch stays at native cast coordinate (154, 118), the approved offset (+8, +23). Other hand placements are provisional.
- **Timing:** the courier is locked during the cast. Frame 6 begins at 520 ms. The palm holds for 300 ms while the wind plays; recovery starts at 820 ms. The effects and caster use the same native pixel scale and retain independent pivots.
- **Interaction:** the barrel reacts when the leading portion of the burst reaches its near edge. It can only move where its footprint fits. The public illustration has a separate practice barrel below the ticket office so that its existing painted background and story remain intact.
- **Still open:** diagonal character casts, non-South palm fine-tuning, and Gust interactions for combat or quests.

Run `node --test tests/*.test.mjs` to verify the sprite sizes, anchor, timings, moved footprint, and the cast through the actual free-movement entry point.
