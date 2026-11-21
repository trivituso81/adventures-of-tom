STATUS: INSTALLED 2026-10-30, repo main commit 6623b95. Tom's generated image replaced art/town.webp. It differed from the prompt (fountain 125 px right and 6 x 5 tiles; shop boards too small; exit boards smaller), so tools/town_signs.py repaints the shop boards larger and the game letters all 11 boards live (PLATE_SIGNS in engine/plate.js). Details: docs/CHANGES.md top entry. Lesson for future plate prompts: the generator ignores pixel sizes for small items, so give the board faces generous room and expect to repaint them in code. The install plan below is done; keep this doc as the reference for the prompt.

# The Square redo: prompt and install plan (written 2026-10-30)

Tom asked for: every building clearly labeled, a much larger fountain, and all exits clearly labeled (even when closed in the story). Decision: the painting has BLANK sign boards and the game letters them live (spelling guaranteed, crisp on a phone, editable without a re-roll). Tom attaches art/town.webp (sent to him as a 1920 x 1664 PNG) to the generator with the prompt below.

## Prompt (paste into the image generator)

EDIT THE ATTACHED IMAGE. It is the painted town square of a family RPG with a 16-bit era storybook look. Redraw it in exactly the same painting style, lighting, palette and camera angle (three-quarter top-down view, warm afternoon sun from the upper left, hand-painted brush texture, fine detail), with only the changes listed under CHANGES A to D. Everything else stays as it is in the attached image.

CANVAS
- Output 1920 x 1664 px, landscape (15:13), PNG. The painting runs to all four edges: no frame, border, vignette, letterbox bars, caption or watermark.
- All coordinates below are pixels from the top left corner of that 1920 x 1664 canvas. 1 tile = 64 px. Anything may be off by up to 32 px, never more. If your output size differs, scale every number in proportion.
- If you cannot make exactly 15:13, use the nearest landscape ratio and leave a 3% margin of trees and fence on all sides (except at the three exits) so it can be trimmed.

KEEP EXACTLY (do not move, resize, recolor or redesign)
- All eight buildings: same footprints, roofs, colors, doors, windows and roof emblems (gold book on the library, gold crescent moon and brass globe on the Moon Club, hanging gold coin sign on the shop, red mailbox and blue drop box at the post office, the parked yellow taxi at the taxi office).
- Door centers. North row, door center x = 288, 736, 1184, 1632, door bottom y about 500: Crumb Bakery, Hush Library, Sprout House, Penny's Pockets. South row, door center x = 288, 736, 1184, 1632, door bottom y about 1215: Snail Mail, Kettle Cottage, Moon Club, Taxi Co.
- The cobblestone streets: the stone steps going north (x 448 to 576), the street going south (x 896 to 1024), the opening on the right edge (y 576 to 704), the cobbled path along the far right going north, the east-west shopfront street (y 1280 to 1408), and the wide plaza between the two rows of buildings.
- The two benches with flower planters (left about x 225 to 500, right about x 1190 to 1450, both y 600 to 750), the two iron lamp posts, trees, hedges, flower pots, barrels, fences and all other props.

CHANGE A: EIGHT BLANK SHOP SIGN BOARDS
A sign board is mounted on the front of every building directly above its door, so a player can tell the buildings apart at a glance on a phone.
- Size: 256 px wide x 112 px tall including a thin carved wooden frame (frame about 12 px). The flat writing face inside is at least 232 x 88 px.
- Position: centered on the door (center x within 16 px of the door center x above). Bottom edge 8 to 24 px above the top of the door. That puts the board center at about y 320 on the north row and about y 1050 on the south row. It may overlap the lowest edge of the roof or the top of an awning and may cover a small window above the door, but never the door, the front of an awning, or the roof emblems.
- Drawn perfectly straight on: a plain rectangle with level top and bottom edges, no perspective skew, no tilt, no shadow across the face. Two small brackets or chains are fine.
- The face is a smooth, flat, matte cream color (about #F4E9CC) with NO letters, numbers, symbols, icons, scribbles or wood grain on it. The game adds the words later.
- Frame color follows each building: Crumb Bakery orange-brown; Hush Library plum purple; Sprout House leaf green; Penny's Pockets red; Snail Mail slate blue; Kettle Cottage terracotta; Moon Club navy with thin gold edge; Taxi Co. golden yellow.
- All eight boards identical in size and shape so they read as one system.

CHANGE B: MUCH LARGER FOUNTAIN
Remove the tiny fountain (at about x 800, y 735) and the small notice board beside it. Draw one large round stone wishing fountain in the plaza.
- All fountain art (basin, column, water spray, splashes) must lie inside the box x 576 to 896, y 576 to 832 (5 tiles wide, 4 tall), centered on x 736. Nothing may poke outside that box except a soft cast shadow on the cobbles to the lower right, 32 px at most. The south roofs begin at about y 850, so the basin's front rim ends at y 832.
- Basin: a wide round pale limestone basin filling the bottom of the box (x 576 to 896, y 656 to 832), thick rim, mossy stone at the base, clear turquoise water with ripples, a few small gold coins glinting under the water.
- Center: a carved stone column with a smaller second bowl on top and a plume of water arcing out and falling back into the basin. The highest point of the water is at y 584, no higher.
- No statue, no figure, no animal, no text, no plaque.
- The street east of it (x 896 to 1024) and the lane north of it (y 512 to 576) stay open cobble.
- Then redraw the small wooden notice board (a little board on two posts, about 48 px wide, nothing readable on it) centered at x 480, y 800, on the plaza cobbles.

CHANGE C: THREE CLEARLY MARKED EXITS
The town has three ways out. Each must be unmistakable at a glance on a small phone screen and must look like a deliberate exit that continues off the picture. Draw all three OPEN and clear (no closed gate, barrier, fallen branch or lock: the game adds those itself when an exit is closed).
- North exit: the stone steps (x 448 to 576) leaving the top edge. Two stout wooden posts just outside the steps (x 416 and x 608, feet at about y 150) hold a board across the top: board x 368 to 656, y 8 to 136. The steps stay clear to the top edge.
- South exit: the street (x 896 to 1024) leaving the bottom edge. Two posts just outside the street (x 880 and x 1040, feet at about y 1566) hold a board: x 816 to 1104, y 1424 to 1552. The street stays clear to the bottom edge.
- East exit: the cobbled opening on the right edge (y 576 to 704). Replace the small double-arrow signpost with a large board on two posts: board x 1632 to 1920, y 424 to 552, post feet at about (1664, 572) and (1888, 572). The opening itself (x 1700 to 1920, y 576 to 704) stays clear and cobbled.
- All three boards: 288 px wide x 128 px tall including a thin carved wooden frame, perfectly straight on, level top and bottom, no tilt. The writing face (at least 264 x 104 px) is a smooth, flat, matte DEEP FOREST GREEN (about #2F4A35) with a thin gold inner line and NO letters, arrows, numbers or symbols. They must look clearly different from the cream shop signs so exits read as their own system.
- A worn cobble or dirt trail visibly continues off the picture at each exit, with a natural gap in the trees or fence.

CHANGE D: DO NOT ADD
- People, animals, vehicles other than the parked yellow taxi, extra buildings, extra doors, new paths, closed gates, any text or logos anywhere, watermarks.
- Anything in front of a door: keep 64 px of clear cobble below every door step.

OUTPUT: one image, 1920 x 1664 px.

## Text the game draws (Claude decides, Tom does not)

| Where | Line 1 | Line 2 |
|---|---|---|
| Bakery (4,7) | CRUMB | BAKERY |
| Library (11,7) | HUSH | LIBRARY |
| Sprout House (18,7) | SPROUT | HOUSE |
| Penny's (25,7) | PENNY'S | POCKETS |
| Post (4,18) | SNAIL | MAIL |
| Kettle (11,18) | KETTLE | COTTAGE |
| Moon Club (18,18) | MOON | CLUB |
| Taxi (25,18) | TAXI | CO. |
| North exit | GRUMP | HOLLOW |
| South exit | RIVITUSO | ROW |
| East exit | ELEMENTARY | SCHOOL |

Shop boards: dark brown #3B2A1A on cream. Exit boards: cream on deep green, plus a small painted-in-code arrow chevron pointing out. Draw in plateLive (engine/plate.js) for map 'town', scale s=T/64, bold canvas font, so it stays crisp.

## Install plan when the image arrives (no ask of Tom)

1. Check size 1920 x 1664 (or crop a 15:13 near miss), doors within 32 px of the table above, fountain art inside x 576..896, y 576..832, boards blank and at the listed spots. Report problems in one line; install anyway if usable.
2. Convert to art/town.webp (quality 88), add ?v= to PLATES.town in engine/plate.js.
3. data/maps-le.js town: re-derive plateMask from the new painting. Block the fountain box (tiles x 9..13, y 9..12), keep the street x 14..15 and the north lane y 8 walkable, keep the three exits open. Object 'fountain' from (12,11,1,1) to (9,9,5,4) so tapping the basin still works and MP refill still fires (engine/overworld.js line 223). Move 'Town notice' from (10,12) to (7,12). Move the three signposts (6,1), (16,24), (28,8) onto the new exit boards (inside the board footprint, keep their text). Check noGo and the exits list.
4. Scenes that use the old fountain spot: data/bonus-nine-scoops.js (zone at [9,8,16,14], nsFountain around lines 672 to 690) and anything else grep finds for map 'town' near (12,11). Move actors that would stand inside the basin.
5. Live lettering in plateLive as above. Screenshot portrait and landscape at each door and each exit; the letters must be readable on a 390 px wide phone (about 32 px per tile).
6. Run tools/reach_test.py town, smoke.py, tap_test.py, camera_clamp_test.py. Fix anything new (reach_test 218 and tap_test blvd (27,21) to (27,23) already fail on main).
7. CHANGES entry, bump ?v=, commit and push (needs add_repo with access push), rewrite claude/next.md.
