# Courier model · V4

**Approved:** November 21, 2026 (Pacific time). This is the approved game model, not the earlier 48 px sketches. The courier is a young adult carrying someone else's package, not dressed for battle: jet-black hair with one white lock at the front, black work clothes with a crimson scarf and accents, dark boots, and a tan delivery satchel. The white lock may be out of view when the head turns away. This outfit does not set the player's elemental affiliation.

| Property | Value |
| --- | --- |
| Texture | `dist/assets/courier.png`, transparent 480 × 384 PNG |
| Native frame | 96 × 96, four rows of five frames |
| Foot anchor | (48, 84) in native coordinates; sole ends at y=83 |
| Direction rows (zero based) | South 0, west 1, east 2, north 3 |
| Columns (zero based) | Idle 0; walk 1, 2, 3 and 4 in order |
| Timing | 120 ms per walk frame; 480 ms per cycle |
| Logical display | 48 × 48, anchor (24, 42); scale with the scene camera, not the file size |

Use hard pixel edges with no texture smoothing. Place the world position at the boot anchor, use a small foot collider rather than the full frame, and retain the last facing when input stops. Do not mirror rows: the hair and bag are asymmetric. Walk and idle are the only approved animations. Keep visual revisions versioned; do not overwrite the approved PNG with a review draft.

The game asset is byte-for-byte the approved V4 sprite atlas. Companion metadata is `dist/assets/courier.json`.
