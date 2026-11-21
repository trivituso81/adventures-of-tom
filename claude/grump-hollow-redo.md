# Grump Hollow redo: prompt and install plan (written 2026-10-30)

Second Long Island area after The Square and Rivituso Row (same method: claude/square-redo.md, claude/rivituso-row-redo.md). Hollow has ONE real exit (south steps to the Square, tiles (9,21) and (10,21)). The painted trail in the north-west corner runs off the top edge, but the walk map blocks it and nothing in the story uses it, so the prompt closes it into a dead end. If Tom later wants a north exit it is a new decision.

Tom attaches grump-hollow-current.png (art/hollow.webp as a 1536 x 1408 PNG).

## Prompt (paste into the image generator)

EDIT THE ATTACHED IMAGE. It is the painted Grump Hollow of a family RPG, a murky woodland pond with a dirt trail, in a 16-bit era storybook style. Redraw it in exactly the same painting style, lighting, palette and camera angle, with only the changes listed under CHANGES A to C. Everything else stays as it is.

CANVAS
- Output 1536 x 1408 px (same as the attachment), PNG. The painting runs to all four edges: no frame, border, vignette, letterbox bars, caption or watermark.
- Coordinates are pixels from the top left. Anything may be off by up to 32 px, never more.

KEEP EXACTLY
- The pond with its lily pads, logs, cattails, ripples and mist, the dirt trail loop and its puddles, the stone path and steps at the bottom edge (x 576 to 704), both rocks beside it, the wooden fences at the bottom, the soggy bench on the left (x 110 to 360, y 725 to 890), Boppy's fishing bench with thermos, tackle box, bucket and rod on the right (x 1140 to 1420, y 800 to 970), all trees, ferns, flowers and stumps.

CHANGE A: THREE BLANK WOODEN SIGN BOARDS
Replace three small painted signs with one clearly larger blank board each, so a player can read them on a phone.
- Crooked sign: the arrow sign at about x 385 to 495, y 625 to 780. New board centered at (440, 665).
- Pond sign: the signpost at about x 565 to 645, y 205 to 300. New board centered at (605, 245).
- Warning stake: the post with two small boards at about x 910 to 1030, y 590 to 740. New board centered at (970, 630).
- Each board: 264 px wide x 108 px tall including a thin frame (about 10 px). The flat writing face is at least 240 x 84 px. Weathered pale wood (about #D8C79B), smooth and flat, NO letters, symbols, arrows, nails in a pattern or wood grain on the face. Each board is mounted straight on, level top and bottom, no tilt, no perspective, on one or two thick wooden posts that stand in the ground where the old post stood. Slightly crooked posts are fine, the board itself is not.
- The boards may cover bushes, reeds or a little of the pond edge. They must not cover the trail.
- Remove the old signs completely, including their writing.

CHANGE B: ONE CLEARLY MARKED EXIT (SOUTH)
The Hollow has one way out, the stone path and steps leaving the bottom edge. Draw it OPEN and clear (no closed gate, fallen branch, barrier or lock: the game adds those when needed).
- Two stout wooden posts just outside the steps (x 544 and x 736, feet at about y 1400) hold a board across: board x 432 to 848, y 1262 to 1394, about 416 x 132 px including a thin carved wooden frame, perfectly straight on, level top and bottom.
- The writing face is a smooth, flat, matte DEEP FOREST GREEN (about #2F4A35) with a thin gold inner line and NO letters, arrows or symbols. It must look clearly different from the pale wooden signs.
- The steps and stone path stay clear to the bottom edge, with a worn trail continuing off the picture and a natural gap in the trees.

CHANGE C: CLOSE THE NORTH-WEST TRAIL
The dirt trail at the top left (x 330 to 420, y 0 to 260) currently runs off the top edge. Make it end in a dead end: a thick tangle of bushes, roots and a fallen mossy branch across the trail at about y 120, with dense forest behind it up to the top edge. No gap, no path, no glow, no gate or sign. It should read as a quiet dead end, not an exit.

DO NOT ADD: people, animals, boats, buildings, new paths, closed gates, any text or logos, watermarks. Keep the trail loop and the bottom path otherwise exactly as is.

OUTPUT: one image, 1536 x 1408 px.

## Text the game draws (Claude decides)

| Board | Line 1 | Line 2 |
|---|---|---|
| Crooked sign | GRUMP | HOLLOW |
| Pond sign | NO | SWIMMING |
| Warning stake | NOT A | FROG |
| South exit | THE SQUARE | SHOPS |

Wooden boards: dark brown ink on pale wood. Exit board: cream on deep green. Drawn in plateLive (engine/plate.js) via PLATE_SIGNS.hollow.

## Install plan (no ask of Tom)
1. Check size, board and exit positions. Install anyway if usable.
2. Build with tools/hollow_signs.py (copy of tools/row_signs.py): scale to 1536 x 1408, repaint the three wooden boards (216 x 72 faces) and the south exit board in code if the generator drew them small.
3. art/hollow.webp q88, bump ?v= in PLATES.hollow, add PLATE_SIGNS.hollow, bump engine/plate.js tag.
4. data/maps-le.js hollow: keep plateMask unless new posts or the closed trail change walkable tiles (trail rows 2 to 10 at x 5 to 8 stay walkable up to the dead end); move 'Crooked sign' (6,12), 'Pond sign' (9,4), 'Warning stake' (15,11) objects next to their new boards; check MONSTER_SPOTS and scenes that stand at those tiles (grep "'hollow'" in data/scenes*.js, data/bonus-*.js).
5. Screenshots portrait and landscape at the three signs and the south exit. Run tools/reach_test.py hollow, smoke.py, camera_clamp_test.py.
6. CHANGES entry, push to main, rewrite claude/next.md.
