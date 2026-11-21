# Long Island area prompts, all remaining areas (written 2026-10-30)

Tom's call (2026-10-30 16:15): generate every picture first, he returns all results at the end. Grump Hollow is in claude/grump-hollow-lettering.md. Inputs are the installed paintings converted to PNG at plate size (art/<id>.webp). Nothing installed.

Shared rules in every prompt: generator paints all lettering; no sign overlaps a door (30 px gap); exit boards high on tall posts; fake exits closed; depth rule (ground visible behind and under trees, signs, gates, eaves; tall objects have a clear base); same plate size and layout; no people, no other text.

## Decisions made by Claude (Tom did not specify)
| Area | Decision |
|---|---|
| Pier | Pier sign CATTAIL / PIER moves to the two posts at the top of the boardwalk (old two-arrow post sat where the north exit board must hang). West exit moves to the painted west road at y 192 to 320 (mask rows 3,4 at install; Marsh east exit arrival rows 13,14 map to pier rows 3,4). Shack board raised to 30 px above the awning. |
| Marsh | Boards: SUNDIAL / HOLLOW (top-left exit), CATTAIL / PIER (east exit), WHISPERING / MARSH (sign), DO NOT / BE LATE (rotten post, scratched look, matches the object text). Bottom-left dirt path and right-edge dirt path closed. Marsh sign moves to about (1220, 640); object (22,10) follows at install. |
| Sundial | Boards: SUNDIAL / HOLLOW (mossy sign), THE DEEP / POOL (pool marker), WHISPERING / MARSH (south exit). Right-edge opening at y 780 to 890 closed. |
| School yard | Boards: LONG ISLAND / ELEMENTARY (marquee, no TONIGHT text so it works before and after chapter 5), FIGHTING / SNAILS (stone), THE SQUARE (west exit, one line). Bottom edge parking roads closed with fence, hedge, trees. Lamp at (175, 450) may be removed. |
| Square | Same as square-lettering v2, plus explicit large fountain lock (x 640 to 1100, y 540 to 880) and depth rule. Input is installed art/town.webp (large fountain). |
| Row | Same as rivituso-row-lettering, plus tall posts and higher south board, dead-end clause, depth rule. |

## Install notes (for the batch)
- Pier: exits become north (11..12 or as painted, x 770 to 900 = tiles 12,13), west rows 3,4 at x 0. Update reeds east exit arrival to pier (1,3),(1,4). Move Pier sign object (14,3) to the boardwalk entrance (about tile 12,5), Boppy bench stays.
- Marsh: mask rows 9 to 11 cols 24,25 walkable stub: pull back from the right edge where the dirt path now ends in reeds. Move Marsh sign object (22,10) to about tile (19,10).
- Sundial: exit x 640 to 770 (tiles 10,11); block right-edge opening cols 20,21 rows 12,13 if painted closed.
- School yard: bottom rows 15 to 17 walkable asphalt must be blocked where the new fence runs (y 1090 to 1152). West exit rows 8,9 stay (sidewalk y 555 to 615).
- Square, Row: see docs/AREA_PAINTINGS.md.

---

## 1. Cattail Pier (input cattail-pier-current.png, 1536 x 1408)

EDIT THE ATTACHED IMAGE. It is the painted Cattail Pier of a family RPG, a sunny lakeside fishing pier with a bait shack, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to E. Everything else stays exactly the same: the wooden pier and platform with tackle box, bucket, net, buoys and posts, the rowboat, water and sparkles, the seagull, cattails, reeds, rocks, trees, Boppy's bench with the thermos (x 445 to 625, y 185 to 295), the bait shack with its awning, barrels, crates, stool and lobster trap, the dirt road layout. Output 1536 x 1408 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. PAINT LETTERING ON FOUR BOARDS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, the longer line filling about 85% of the face width and 80% of its height, never touching the frame. (The face is the flat writing surface of a board.)
Wooden boards: pale weathered wood (about #D8C79B), dark brown paint (about #3B2A1A), straight on, level top and bottom, no tilt. Green exit boards: deep forest green face (about #2F4A35) with a thin gold inner line in a thin carved wooden frame, cream-gold paint (about #F2E6B8) with a thin dark green outline, clearly different from the wooden boards.
1. Bait shack board, REEL'S / BAIT (apostrophe between L and S): replace the small plank on the shack gable (x 1120 to 1210, y 140 to 185) with a larger wooden board about 232 x 84 px (face 208 x 62), center (1185, 112). It may cover the gable window and the roof edge. Its bottom edge must stay at least 30 px above the awning (awning top about y 185) and clear of the door (x 1305 to 1360, y 190 to 290) and the lantern. Paint over the old plank so none remains.
2. Pier sign, CATTAIL / PIER: remove the two-arrow signpost at x 850 to 935, y 70 to 260 completely and paint road and grass over it. Put the sign at the pier entrance instead: a wooden board about 264 x 108 px (face 240 x 84), center (818, 320), mounted high on the two existing entrance posts at the top of the boardwalk (x 735 and x 900, feet at y 445), which become taller. The boardwalk and the dirt road stay fully visible under and behind it.
3. North exit board (green), RIVITUSO / ROW: see B.
4. West exit board (green), WHISPERING / MARSH: see C.

B. NORTH EXIT
The dirt road leaving the top edge (x 770 to 900) stays wide open and clear to the top edge, with a worn trail continuing off the picture. Board 3 is about 300 x 96 px (face 264 x 68), center (835, 80), hanging high between two tall stout wooden posts at x 735 and x 935 with feet at about y 240. Open air and the road visible under it. No closed gate, fallen branch or lock.

C. WEST EXIT
The dirt road that runs west from Boppy's bench stops at a wooden fence at the left edge (x 0 to 110, y 150 to 260). Remove that fence so the road leaves the LEFT edge at y 192 to 320, with a worn trail continuing off the picture. Board 4 is about 340 x 108 px (face 300 x 76), center (225, 95), hanging high between two tall stout wooden posts at x 95 and x 355 with feet at about y 190 on the grass just north of the road. It may cover lake edge and reeds, never the road.

D. NO OTHER EXITS
Only the north road and the west road leave the picture. The right edge, the shoreline and the bottom stay closed (fences, reeds, rocks, water). Do not add any other path.

E. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, signs, gates and eaves, so the ground must read clearly there. Show open ground (road, dirt, boardwalk) under each board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, posts and the shack have a clear base with ground around it. Do not paint leaves, awnings or roofs over the roads. Do not move paths or objects to do this.

Do not add people, other animals, boats, buildings, closed gates or any other text.
OUTPUT: one image, 1536 x 1408 px.

---

## 2. Whispering Marsh (input whispering-marsh-current.png, 1664 x 1472)

EDIT THE ATTACHED IMAGE. It is the painted Whispering Marsh of a family RPG, a misty marsh of boardwalks, reeds and cattails, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: the water, the boardwalks and their pilings (the long boardwalk from the east platform running west, then the zigzag north-west up to the path at the top left), reeds, cattails, lily pads, logs, trees, reed islands, stumps and mist. Output 1664 x 1472 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. PAINT LETTERING ON FOUR BOARDS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, the longer line filling about 85% of the face width and 80% of its height, never touching the frame. (The face is the flat writing surface of a board.)
1. Marsh sign, WHISPERING / MARSH: replace the small sign at x 1340 to 1430, y 620 to 670 with a wooden board about 264 x 108 px (face 240 x 84), center (1220, 640), pale weathered wood (about #D8C79B), dark brown paint (about #3B2A1A), straight on, level, on two thick posts standing in the reed island. Remove the old sign completely.
2. Rotten signpost, DO NOT / BE LATE: replace the small rotten sign at x 360 to 430, y 160 to 250 with a weathered, slightly rotten dark wood board about 220 x 90 px (face 196 x 66), center (470, 205), straight on, on a leaning post. The letters look scratched into the wood with a knife: rough, pale cream (about #E8DDBB), still easy to read, same spelling rules.
3. North-west exit board (green), SUNDIAL / HOLLOW: see B.
4. East exit board (green), CATTAIL / PIER: see C.
Green exit boards: deep forest green face (about #2F4A35) with a thin gold inner line in a thin carved wooden frame, cream-gold paint (about #F2E6B8) with a thin dark green outline, about 300 x 96 px (face 264 x 68), straight on, level, no tilt.

B. NORTH-WEST EXIT (to Sundial Hollow)
The path at the top left (x 190 to 260, y 0 to 180) leaves the top edge. Keep it open and clear, with a worn trail continuing off the picture. Board 3: center (225, 100), hanging high between two tall stout wooden posts at x 100 and x 335 with feet at about y 215 on the grass beside the path. No gate, no branch.

C. EAST EXIT (to Cattail Pier) AND CLOSED PATHS
The east platform at the right edge (x 1440 to 1664, y 740 to 940) is the exit. Keep the boardwalk reaching the right edge, with a worn trail continuing off the picture. Board 4: center (1505, 650), hanging high between two tall stout posts at x 1380 and x 1630 with feet at about y 775 at the north edge of the boardwalk.
Two other paths look like exits and must be closed:
- the dirt path in the bottom-left corner (from the left edge near y 940 to 1040 down to the bottom edge near x 500 to 660): end both ends in dense reeds, bushes and a fallen log so no path touches the left or bottom edge.
- the dirt path on the right edge north of the platform (x 1520 to 1664, y 560 to 770): end it in tall reeds and a rotting log before the edge, so it does not reach the right edge.

D. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, signs and posts, so the ground must read clearly there. Show boardwalk or path under each board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, posts and stumps have a clear base. Do not paint reeds or leaves over the boardwalks. Do not move paths or objects to do this.

Do not add people, animals, boats, buildings, closed gates or any other text.
OUTPUT: one image, 1664 x 1472 px.

---

## 3. Sundial Hollow (input sundial-hollow-current.png, 1408 x 1280)

EDIT THE ATTACHED IMAGE. It is the painted Sundial Hollow of a family RPG, a mossy clearing with a stone sundial and a dark pool, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: the pool, lily pads, the stepping-stone path across the water, the central path, the sundial, the stone bench, rocks, roots, reeds, flowers. Output 1408 x 1280 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. PAINT LETTERING ON THREE BOARDS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, the longer line filling about 85% of the face width and 80% of its height, never touching the frame. (The face is the flat writing surface of a board.)
Wooden boards: mossy weathered wood (about #B9A877) with a little moss on the top edge, dark brown paint (about #3B2A1A), straight on, level top and bottom, no tilt, on two thick posts.
1. Mossy sign, SUNDIAL / HOLLOW: replace the leaning sign at x 465 to 570, y 920 to 1050 with a board about 240 x 96 px (face 216 x 72), center (480, 950).
2. Pool marker, THE DEEP / POOL: replace the small sign at x 890 to 960, y 390 to 440 with a board about 240 x 96 px, center (925, 405). It stands on the bank between the path and the pool.
3. South exit board (green), WHISPERING / MARSH: see B. Green face: deep forest green (about #2F4A35) with a thin gold inner line in a thin carved wooden frame, cream-gold paint (about #F2E6B8) with a thin dark green outline.

B. SOUTH EXIT AND ONE CLOSED OPENING
The dirt path leaving the bottom edge (x 650 to 800) is the only exit. Keep it open and clear to the bottom edge, with a worn trail continuing off the picture. Board 3 is about 340 x 108 px (face 300 x 76), center (730, 1090), hanging high between two tall stout wooden posts at x 570 and x 890 with feet at about y 1220 on either side of the path. Open air and the path visible under it. No closed gate, branch or lock.
Close the opening on the right edge (the grass and dirt gap at x 1240 to 1408, y 780 to 890) with a thicket of reeds, boulders and a fallen log, so no path or gap touches the right edge. No other path leaves the picture.

C. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, signs and posts, so the ground must read clearly there. Show grass or path under each board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as the sundial, trees and posts have a clear base. Do not paint leaves or roots over the central path. Do not move paths or objects to do this.

Do not add people, animals, boats, buildings, closed gates or any other text (no numerals on the sundial).
OUTPUT: one image, 1408 x 1280 px.

---

## 4. Long Island Elementary yard (input school-yard-current.png, 1536 x 1152)

EDIT THE ATTACHED IMAGE. It is the painted front yard of Long Island Elementary at dusk in a family RPG, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: the school building and its front doors, flagpole and flag, bike rack and bike, benches, lamps, planters, the playground (slide, swings, tetherball), the three cars, parking lines, crosswalks, arrows, traffic island, trees. Output 1536 x 1152 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. PAINT LETTERING ON THREE SIGNS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Both lines the same letter height, the longest line filling about 85% of the face width, never touching the frame. (The face is the flat writing surface of a board.) Remove all the old small text.
1. School sign: the standing sign beside the path (x 940 to 1050, y 304 to 400). Enlarge its board to about 250 x 100 px (face 226 x 76), center (995, 350), warm cream painted face, dark navy paint (about #1F2A44), on its existing base and flowers: LONG ISLAND / ELEMENTARY.
2. Snail stone: the small stone sign (x 890 to 970, y 480 to 570). Enlarge it to about 220 x 120 px with a flat pale stone face, dark navy paint: FIGHTING / SNAILS.
3. West exit board (green), one line: THE SQUARE. See B. Green face: deep forest green (about #2F4A35) with a thin gold inner line in a thin carved wooden frame, cream-gold paint (about #F2E6B8) with a thin dark green outline.

B. WEST EXIT AND CLOSED EDGES
The sidewalk leaving the left edge (y 555 to 615) is the exit to town. Keep it open and clear, with the sidewalk continuing off the picture. Board 3: about 280 x 84 px (face 248 x 56), center (175, 445), hanging high between two tall stout wooden posts at x 60 and x 320 with feet at about y 565 on the lawn just above the sidewalk. The lamp post at (175, 450) may be removed, and the bike rack and bike may shift about 60 px right, to make room. The sidewalk stays visible under the board.
The front doors stay as they are (the way into the school).
Close every other edge:
- the road and crosswalk leaving the bottom edge (x 260 to 1240, y 1090 to 1152): a continuous black iron fence with a hedge row and two trees along the bottom edge from x 380 to x 1300. The asphalt and the crosswalk end at the fence.
- the asphalt lane touching the left edge below the sidewalk (y 620 to 700): end it at a curb with bushes.
- the playground on the right: keep the fence and trees closing the right edge.
The only ways out are the front doors and the left sidewalk.

C. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, signs, the flagpole and eaves, so the ground must read clearly there. Show pavement or ground under each board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, lamps, the flagpole and posts have a clear base with ground around them. Do not paint tree canopies over the sidewalks or entrance path. Do not move paths or objects to do this.

Do not add people, animals, new buildings, closed gates or any other text.
OUTPUT: one image, 1536 x 1152 px.

---

## 5. The Square (input the-square-current.png = installed art/town.webp, large fountain, blank boards, 1920 x 1664)

EDIT THE ATTACHED IMAGE. It is the painted town square of a family RPG in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to F. Everything else stays exactly the same: buildings, roofs, doors, windows, props, benches, lamp posts, cobbles, trees. Output 1920 x 1664 px, PNG, painted to all four edges, no border or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

F. THE FOUNTAIN STAYS LARGE (IMPORTANT, DO THIS FIRST)
The fountain in the middle of the plaza is LARGE: a round stone basin with flowers around it, about 380 px across, from x 640 to x 1100 and y 540 to y 880, with a tiered fountain and water jets. Keep it exactly as it is in the attached image, same size, same place, same detail. Do not shrink it, simplify it or replace it. The small notice board at about (560, 780) also stays.

A. PAINT LETTERING ON THE ELEVEN SIGN BOARDS, AND RAISE THE EIGHT SHOP BOARDS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines (SCHOOL is one line), both lines the same letter height, filling about 85% of the face width and 80% of its height, never touching the frame. Shop boards: dark brown paint (about #3B2A1A). Exit boards: warm cream-gold paint (about #F2E6B8) with a thin dark green outline.
The eight shop boards are too low: their bottom edges sit almost on the door tops and some touch the awnings. MOVE EACH SHOP BOARD UP so its bottom edge is at least 30 px above the highest part of the door frame or awning below it. Keep each board the same size (about 240 x 96 px, face 216 x 72), centered on its door, drawn straight on. Paint the wall, roof or awning that the old board position leaves behind so no old board remains. A board must never overlap a door, awning or lamp.
Shop boards (new center, face about 216 x 72):
1. (243, 309): CRUMB / BAKERY
2. (737, 301): HUSH / LIBRARY
3. (1183, 310): SPROUT / HOUSE
4. (1558, 310): PENNY'S / POCKETS (apostrophe between Y and S)
5. (235, 1038): SNAIL / MAIL
6. (746, 1038): KETTLE / COTTAGE
7. (1197, 1040): MOON / CLUB
8. (1625, 1040): TAXI / CO. (period after CO)
Green exit boards (keep size and place):
9. north exit board, center (557, 63), face about 204 x 60: GRUMP / HOLLOW
10. south exit board, face about 192 x 62: RIVITUSO / ROW (see D for its height)
11. east exit board at the right edge, center (1844, 472), face about 123 x 55: SCHOOL (one line)

B. CLOSE TWO DEAD-END PATHS
The town has exactly three exits (north steps, south street, east opening). Two other paths look like exits and must be closed.
- West: the cobbled path leaving the LEFT edge around y 560 to 940 (with the small wooden fence at about x 0 to 110, y 760 to 880 and the hedge above it). Close it completely: a continuous wooden fence along the left edge from y 560 to 940, with dense trees and bushes behind and beside it. The cobbles end at the fence. No gap, no path, no gate.
- North-east: the cobbled street that runs north along the right side (about x 1700 to 1900, from y 430 up to the top edge). Close it: a wooden fence across the street at about y 330 to 420 with two large trees, hedges and flower beds behind it, so the street ends in a quiet dead end. The shop board at (1558, 310) and the PENNY'S POCKETS building stay as they are.

C. MAKE THE EAST EXIT UNMISTAKABLE
The east opening is the cobbled gap on the right edge at y 576 to 704. Keep it wide open, with the cobbles continuing to the right edge and a worn trail clearly continuing off the picture, so it is the only way east. The SCHOOL board stays on its posts directly above the opening, straight on.

D. RAISE THE SOUTH EXIT BOARD ON ITS POSTS
The RIVITUSO ROW board at the bottom (about x 830 to 1096, y 1376 to 1440) sits at the very foot of its two posts. Make the two posts taller, with their feet at about y 1540 and the board mounted high on them, about 100 px above the post feet, same size and place. The street between the posts stays clear to the bottom edge.

E. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, signs, gates and eaves, so the ground must read clearly there. Show cobbles under each exit board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, lamp posts and posts have a clear base with cobbles around them. Do not paint tree canopies, awnings or roofs over the plaza cobbles beyond what is there now. Do not move paths or objects to do this.

Do not add any other text, people or animals, add or remove buildings, move doors, or add any new path or gate.
OUTPUT: one image, 1920 x 1664 px.

---

## 6. Rivituso Row (input rivituso-row-current.png = installed art/row.webp, 1536 x 1408)

EDIT THE ATTACHED IMAGE. It is the painted Rivituso Row of a family RPG in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: houses, roofs, doors, windows, steps, lamps, gardens, paths, trees. Output 1536 x 1408 px, PNG, painted to all four edges, no border or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. RAISE THE THREE HOUSE BOARDS AND PAINT LETTERING ON ALL FIVE BOARDS
The three house boards sit almost on top of the doors. MOVE EACH HOUSE BOARD UP so its bottom edge is at least 30 px above the highest part of the door frame below it (and clear of the lamps). Keep each board the same size (about 240 x 96 px, face 216 x 72), centered above its door, drawn straight on. Paint the wall, window box or roof that the old board position leaves behind so no old board remains. A board must never overlap a door.
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, filling about 85% of the face width and 80% of its height, never touching the frame. House boards: dark brown paint (about #3B2A1A). Exit boards: warm cream-gold paint (about #F2E6B8) with a thin dark green outline.
1. Gregori house board, new center (598, 252): GREGORI / HOUSE
2. Rivituso house board, new center (1186, 302): RIVITUSO / HOUSE
3. Aunt Ellie's house board, new center (748, 790): AUNT ELLIE / HOUSE
4. North exit board (green), center (852, 76), face about 232 x 72: THE SQUARE / SHOPS
5. South exit board (green), face about 282 x 72: CATTAIL / PIER

B. EXIT BOARDS HIGH ON TALL POSTS
- North: keep the board at the top, but make its two posts much taller, with their feet at about y 230 on either side of the steps, so it hangs high above the stairs. The steps stay clear and open to the top edge.
- South: raise the board to center (801, 1160) and make its two posts taller, with their feet at about y 1340 on either side of the path. The path stays clear and open to the bottom edge, visible under the board.
Both exits stay open, with no closed gate, branch or lock.

C. NO OTHER EXITS
The only ways out are the north steps and the south path. If any cobbled side path touches the left or right edge, end it in a fence, hedge and trees before the edge. Do not add any gate.

D. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, signs, gates and eaves, so the ground must read clearly there. Show path under each exit board between its posts and a strip about 40 px tall of visible ground behind it. Keep the ground in front of each door and under the porch roofs visible. Tall objects such as trees, lamp posts and posts have a clear base with ground around them. Do not paint tree canopies or roofs over the paths beyond what is there now. Do not move paths or objects to do this.

Do not add any other text anywhere, add people or animals, move doors, or change the paths.
OUTPUT: one image, 1536 x 1408 px.
