# Cinder Fist: approved front-facing cast

This is the approved playable Cinder Fist from the private Cove Way dock playtest, ported to the repository's free-movement scene. It does not change the grid prototype or implement combat, skill progression, or a persistent buff.

- Source: Bruno’s 12-cel Sorceress cast. The committed transparent WebP is a lossless encoding of the approved color-matched playtest sheet. It is 1448 × 1086, arranged in 4 columns × 3 rows; each cel is 362 × 362.
- Reference: the south-facing (camera-facing) hand-inked idle in the first cel of `courier-ink-walk.webp`. Frame 1 was overlaid on that idle to fit proportions. All 12 cels use the identical width correction (about 11% narrower than the first import), effectively unchanged height, and a small horizontal registration offset. Each cel retains its own boot anchor.
- Skin: sampled the front idle’s diffuse cheek color and matched exposed, unlit skin across the cast. Preserve the fire, sparks and lit hand from ignition onward; the fit changes draw geometry, not the original fire art.
- Playback: face the camera with Down, then press **F** or tap **Cinder Fist**. The cast displays the front-facing cels and restores whichever idle direction was active before casting. Movement cancels playback. Reduced-motion mode shows the final pose without playing the intermediate cels.

The atlas, frame timing, and transform live together in `dist/cinder-fist.mjs`. Keep its proportion correction shared across the atlas unless there is a new idle reference.
