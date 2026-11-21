# Adventures of Tom: menu portrait style (updated 2026-10-19, watercolor set)

Replaces the earlier photo-based rule. Menu portraits (portraits/*.png, 64x64) are now pixelated from Tom's watercolor-and-ink illustrations (one per character, gold flourishes, painted backgrounds). All eight are done: Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara.

- Framing matches Deedee and Boppy: face fills the frame. Size measure S = (cheek width + 1.25 x eye-to-chin) / 2 in source px; crop side = S / 0.58; eye midpoint centered horizontally at 44% down the crop. Off-image edges are reflect-padded (Boppy's cap top is cropped).
- Source measurements (eye mid x,y; cheek width; eye-to-chin): boppy (908,1072) 1067 795; deedee (1025,908) 917 775; tom (903,890) 700 643; tnb (1010,860; centered on head, three-quarter view) 600 540; grace (955,815) 517 485; rose (1018,865) 617 468; amy (670,650) 450 470 (source 1459x2576). Nara is a profile: fixed box (30,230)-(1630,1830).
- Deedee's skin is tinted to Boppy's cheek tone (RGB 227,188,153) by multiplying bright, low-saturation pixels inside her face and neck, with slight darkening toward the face edges.
- Pixel pass: Lanczos to 256, unsharp mask, box-down to 64, color +25%, contrast +8%, then a per-portrait 64-color k-means palette in Lab (chroma weighted 1.6x so small colored areas like Nara's tongue survive), snapped to 15-bit SNES color. Backgrounds from the art are kept.
- PORTRAITS in engine/menu.js uses ?v=3 on each path to bust the cache; bump it when portraits change.
