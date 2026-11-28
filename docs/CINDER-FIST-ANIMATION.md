# Cinder Fist

This is the approved Cinder Fist from the Cove Way dock playtest, ported to the repository’s free-movement scene. The grid prototype, combat rules and skill progression are unchanged.

- Frames 1–12 use Bruno’s Sorceress sheet, saved losslessly as a transparent 1448 × 1086 WebP (four columns, three rows, 362 × 362 per cel). The front idle’s skin tone was matched on unlit skin. All twelve frames share the same width correction (about 11% narrower than the original import), effectively unchanged height, and each cel’s boot anchor.
- Frame 13 is the exact approved glowing front idle, aligned with the existing south-facing sprite. The glow is a separate transparent texture. Its colors, sampled from frame 12, are deep ember `#B6470F`, flame orange `#F17C30`, warm amber `#FCC75F`, and pale gold `#FDEA92`.
- **F** or the **Cinder Fist** button starts the cast. The character stays in place for the full 1,855 ms. Movement requests and repeat casts are ignored until frame 13 finishes. The cast is painted facing the camera without changing locomotion facing.
- After frame 13, the glow tracks the character’s left hand in all eight walking directions. It shimmers subtly on the four cardinal standing poses. East idle shows only light spill behind the body. Fully hidden hands do not show a flame. The glow lasts ten seconds from cast completion and fades during the last half-second. Reduced-motion mode keeps idle glow static and shows the final cast pose while the cast lock runs.

Frame timing and geometry are in `dist/cinder-fist.mjs`. Hand offsets, palette overlay alignment, shimmer and occlusion are in `dist/cinder-ember.mjs`. Preserve the base walk artwork and verify hand placement by walking all eight directions.
