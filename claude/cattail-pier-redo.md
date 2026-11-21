# Cattail Pier redo: prompt and install plan (written 2026-10-30)

Third Long Island area after The Square, Rivituso Row and Grump Hollow (same method as claude/rivituso-row-redo.md and claude/grump-hollow-redo.md). Pier has TWO exits: north road to Rivituso Row and west road to the Whispering Marsh (map id reeds). Tom attaches cattail-pier-current.png (art/pier.webp as a 1536 x 1408 PNG).

Known mismatch to fix at install: the walk mask puts the north exit on tiles x 11,12 (art x 704 to 832) but the painted road at the top edge is at x 768 to 896 (tiles 12,13); the west exit mask is rows 5 and 6 (art y 320 to 448) but the painted west path sits near y 200 to 290 behind a fence. The prompt pins both exits to clear positions; the install re-derives the mask and the exits list from the new painting.

## Prompt (paste into the image generator)

EDIT THE ATTACHED IMAGE. It is the painted Cattail Pier of a family RPG, a sunny lakeside fishing pier with a bait shack, in a 16-bit era storybook style. Redraw it in exactly the same painting style, lighting, palette and camera angle, with only the changes listed under CHANGES A to D. Everything else stays as it is.

CANVAS
- Output 1536 x 1408 px (same as the attachment), PNG. The painting runs to all four edges: no frame, border, vignette, letterbox bars, caption or watermark.
- Coordinates are pixels from the top left. Anything may be off by up to 32 px, never more.

KEEP EXACTLY
- The wooden pier and platform (x 560 to 1060, y 370 to 1000) with its tackle box, bucket, net, buoys and posts, the rowboat, all water, sparkles and weeds, the seagull on its post, the cattails and reeds, rocks and trees, Boppy's bench with the thermos (x 445 to 625, y 185 to 295), the bait shack with its awning, barrels, crates, stool, pots and lobster trap (x 1070 to 1430, y 55 to 370), the dirt road layout around the shack and bench.

CHANGE A: BLANK BAIT SHACK BOARD
Replace the small plank above the shack awning (about x 1120 to 1205, y 140 to 180) with one larger blank board.
- Board 256 px wide x 100 px tall including a thin frame (about 10 px), centered at (1160, 165), face at least 230 x 76 px. It may cover part of the shack front gable and the small window above the awning, never the awning, door or buoys.
- Weathered pale wood (about #D8C79B) matching the shack, smooth and flat, NO letters, symbols or wood grain. Straight on, level top and bottom, no tilt, no perspective.

CHANGE B: BLANK "CATTAIL PIER" SIGN
Remove the tall two-arrow signpost at about x 850 to 935, y 85 to 260. Put one thick wooden post in the same spot, slightly set back from the road, holding a blank board centered at (895, 175), 264 px wide x 108 px tall including a thin frame, face at least 240 x 84 px. Same weathered pale wood, smooth and flat, NO letters or arrows, straight on, level.

CHANGE C: TWO CLEARLY MARKED EXITS
Draw both OPEN and clear (no closed gate, fallen branch, barrier or lock: the game adds those when needed).
- North exit: the dirt road leaving the top edge, between x 768 and x 896. Keep it that wide and clear to the top edge, with a worn trail continuing off the picture and a natural gap in the trees. Two stout wooden posts just outside the road (x 736 and x 928, feet at about y 150) hold a board across the top: board x 624 to 1040, y 8 to 140. Move the sign from CHANGE B if it overlaps the board.
- West exit: a dirt road leaving the LEFT edge at y 320 to 448 (a 128 px wide road), joining the existing dirt road by the bench. Remove the fence pieces that block it (the wooden fence around x 135 to 290, y 295 to 390 and the one at the far left edge). Mount a board on two stout posts directly above the opening, standing on the grass: board x 20 to 436, y 186 to 318, post feet at about (60, 335) and (400, 335).
- Both boards: about 416 px wide x 132 px tall including a thin carved wooden frame, perfectly straight on, level top and bottom, no tilt. The writing face is a smooth, flat, matte DEEP FOREST GREEN (about #2F4A35) with a thin gold inner line and NO letters, arrows or symbols, clearly different from the pale wooden boards.

CHANGE D: DO NOT ADD
People, animals other than the existing seagull, extra boats, extra buildings, closed gates, new piers, any text or logos, watermarks. The pier, platform and water stay exactly as they are.

OUTPUT: one image, 1536 x 1408 px.

## Text the game draws (Claude decides)

| Board | Line 1 | Line 2 |
|---|---|---|
| Bait shack | REEL'S | BAIT |
| Pier sign | CATTAIL | PIER |
| North exit | RIVITUSO | ROW |
| West exit | WHISPERING | MARSH |

Wooden boards: dark brown ink on pale wood. Exit boards: cream on deep green. PLATE_SIGNS.pier in engine/plate.js.

## Install plan (no ask of Tom)
1. Scale to 1536 x 1408 (tools/hollow_signs.py is the template; use tools/row_signs.py if boards need repainting larger). Measure every board face numerically.
2. art/pier.webp q88, bump ?v= in PLATES.pier (engine/plate.js line 5), add PLATE_SIGNS.pier, bump plate.js tag.
3. data/maps-le.js pier (search planMerge({id:'pier'): re-derive plateMask for the north road (x 12,13 or as painted) and the west road, update border.open and exits (north to row (11,20),(12,20); west to reeds (24,13),(24,14)), keep objects 'Bait shack' (17,1,5,4), 'Pier sign' (14,3), 'Boppy's bench' (7,3), 'Tackle box' (10,11) consistent with the painting. Check Reel's NPC start tile (19,5) and spawn (11,1).
4. Check scenes using map 'pier' (grep "'pier'" in data/scenes*.js, data/bonus-*.js, engine/story.js) and the row side exits (11,21),(12,21) landing at pier (11,1),(12,1) so arrivals match the new road.
5. Screenshots portrait and landscape at the shack, sign, both exits. reach_test pier, smoke, camera_clamp.
6. CHANGES entry, push to main, rewrite claude/next.md.
