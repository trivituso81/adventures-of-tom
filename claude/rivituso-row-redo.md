# Rivituso Row redo: prompt and install plan (written 2026-10-30)

Tom asked for: any needed labels on Rivituso Row, and clear, clearly labeled exits. Same method as The Square (claude/square-redo.md): the painting carries BLANK boards, the game letters them live (engine/plate.js PLATE_SIGNS), and tools/town_signs.py style repainting is the fallback because generators draw small boards too small. Tom attaches rivituso-row-current.png (art/row.webp as a 1536 x 1408 PNG) to the generator.

## Prompt (paste into the image generator)

EDIT THE ATTACHED IMAGE. It is the painted Rivituso Row of a family RPG, three cottages around a cobbled lane in a 16-bit era storybook style. Redraw it in exactly the same painting style, lighting, palette and camera angle, with only the changes listed under CHANGES A and B. Everything else stays as it is.

CANVAS
- Output 1536 x 1408 px (same as the attachment), PNG. Painting runs to all four edges: no frame, border, vignette, letterbox bars, caption or watermark.
- Coordinates are pixels from the top left. 1 tile = 64 px. Anything may be off by up to 32 px, never more.

KEEP EXACTLY
- All three houses: footprints, roofs, colors, windows, doors, steps, porches, lamps, planters, bikes, luggage, tables. Door centers: Gregori (red door) x 612, Rivituso (teal door on the right) x 1185, Aunt Ellie (teal arched door) x 748.
- The cobbled lane layout: stone steps leaving the top edge (x 768 to 896), the path south ending in steps at the bottom edge (x 704 to 832), the loop paths, plazas and garden paths.
- The gardens (sunflowers and scarecrow, tomato trellis, pepper bed), both benches, the notice board with papers, fences, lamp posts, trees, hedges, flowers.

CHANGE A: THREE BLANK HOUSE NAME BOARDS
Replace the three small painted plaques (they hold tiny text) with one larger board on each house, directly above the front door, so a player can read whose house it is on a phone.
- Size: 288 px wide x 120 px tall including a thin carved wooden frame (about 12 px). The flat writing face is at least 260 x 92 px.
- Position: centered on the door center x above (within 16 px). Bottom edge 8 to 24 px above the top of the door. That puts the board center at about (612, 258) Gregori, (1185, 296) Rivituso, (748, 796) Aunt Ellie. The board may cover the small flower box, balcony rail or lower part of the window above the door. It must not cover the door, the porch roof, the lamps or the chimney.
- Drawn straight on: plain rectangle, level top and bottom, no tilt, no perspective, no shadow across the face. Two small brackets or chains are fine.
- The face is a smooth flat matte cream (about #F4E9CC) with NO letters, numbers, symbols or wood grain. The game adds the words.
- Frame color follows the house: Gregori rose red, Rivituso warm brown, Aunt Ellie plum purple. All three the same size and shape.
- Remove the old plaques completely, including their text.

CHANGE B: TWO CLEARLY MARKED EXITS
The lane has two ways out. Each must be unmistakable on a small phone and read as a deliberate exit that continues off the picture. Draw both OPEN and clear (no closed gate, fallen branch, barrier or lock: the game adds those when needed).
- North exit: the stone steps at the top edge. Remove the small wooden direction signpost at about x 925 to 1000, y 20 to 170. Put two stout wooden posts just outside the steps (x 736 and x 928, feet at about y 150) holding a board across the top: board x 624 to 1040, y 8 to 140 (wider than the steps so it reads from far away). Steps stay clear to the top edge.
- South exit: the path ending in steps at the bottom edge. Remove the small wooden direction signpost at about x 975 to 1050, y 1040 to 1170. Put two stout wooden posts just outside the steps (x 672 and x 864, feet at about y 1380) holding a board: board x 560 to 976, y 1262 to 1394. Steps stay clear to the bottom edge. The two lamp posts and stone pillars beside the south path stay.
- Both boards: about 416 px wide x 132 px tall including a thin carved wooden frame, perfectly straight on, level top and bottom. Writing face a smooth flat matte DEEP FOREST GREEN (about #2F4A35) with a thin gold inner line and NO letters, arrows or symbols. They must look clearly different from the cream house boards.
- A worn cobble or dirt trail visibly continues off the picture at each exit, with a natural gap in the trees.

DO NOT ADD: people, animals, vehicles, extra buildings, extra doors, new paths, closed gates, any text or logos, watermarks. Keep 64 px of clear cobble below every door step.

OUTPUT: one image, 1536 x 1408 px.

## Text the game draws (Claude decides)

| Board | Line 1 | Line 2 |
|---|---|---|
| Amy's house | GREGORI | HOUSE |
| Deedee and Boppy's | RIVITUSO | HOUSE |
| Aunt Ellie's | AUNT ELLIE | HOUSE |
| North exit | THE SQUARE | SHOPS |
| South exit | CATTAIL | PIER |

South stays gated by the fallen branch until Boppy takes everyone fishing (chapter 3); the board shows regardless.

## Install plan (no ask of Tom)
1. Check size and door and exit positions. Install anyway if usable.
2. art/row.webp q88, bump ?v= in PLATES.row (engine/plate.js; row currently has no ?v=).
3. Repaint boards in code if the generator drew them small (see tools/town_signs.py); add PLATE_SIGNS.row entries.
4. Move objects 'Row signpost' (14,1) and 'Pier signpost' (15,17) onto the exit boards or keep the tap targets near them; update plateMask if the removed signposts or new posts change walkable tiles. Row gate (11,21),(12,21) stays.
5. Check scenes that place actors on row near (14,1) and (15,17): grep "'row'" in data/scenes*.js, data/bonus-*.js.
6. Screenshots portrait and landscape at each door and both exits (tools/shots/). Run tools/reach_test.py row, smoke.py, camera_clamp_test.py, tap_test.py row.
7. CHANGES entry, push to main, rewrite claude/next.md.
