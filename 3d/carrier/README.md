# Carrier 3D · Matte locomotion snapshot

Separate 3D character assets for Novenara. This snapshot does not change the 2D prototype or replace any Unity scene.

| File | Purpose |
| --- | --- |
| `Carrier.fbx` | Original-face, 219,999-triangle Carrier with a 24-joint rig and embedded Idle and revised Walk clips. |
| `Carrier-Albedo.jpg` | Original 2048 × 2048 painted color texture; the face, hair, outfit and UVs are unchanged. |
| `Carrier-Matte.blend` | Editable character source with the matte material and approved walk. |
| `Carrier-Matte-Preview.png` | Full-body render of the matte finish. |

## Extract the asset pack

From this folder, run `python unpack_carrier.py`. The script checks the archive checksum and extracts the FBX, texture and Blender source into a local `Carrier-3D` folder. The archive is stored in three lossless parts. The preview is available directly without extraction.

## Bring into Unity

1. Import the FBX and color texture. On the FBX's **Rig** tab, use **Generic**, not Humanoid. Keep the hierarchy. The idle and walk are in-place.
2. On the **Animation** tab, enable **Loop Time** for **Carrier Idle** and **Carrier Walk**. Idle lasts 2.40 s and Walk lasts about 1.07 s. Assign those clips to the corresponding Animator states. For the walk, use **1.25 m/s** on the movement controller and leave Animator root motion off. The walk uses heel-to-toe foot contacts, the natural arm swing from the first revision, and reduced hip sway.
3. Assign the albedo as the material's Base Map. Set Metallic to **0** and start with Smoothness at **0.14**. If the finish still looks glossy, disable Specular Highlights and Environment Reflections. The Blender source uses Roughness **0.86** and Specular IOR Level **0.15**. Keep the texture in sRGB.

The previous facial sculpt is not included. The clips and mesh can be opened independently of the current game project.
