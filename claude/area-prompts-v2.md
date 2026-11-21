# Long Island area prompts v2 (rewritten 2026-10-30 16:30)

Tom's rule (16:23): freestanding signs exist ONLY where they lead to another area (exit boards). No joke or informational signs. Boards mounted on buildings (shop boards, house boards, the bait shack board) stay. Supersedes claude/area-prompts-2026-10-30.md and claude/grump-hollow-lettering.md. Inputs: installed art/<id>.webp as PNG at plate size, except Hollow (art/hollow.webp from git commit e8f4424, the version without the big blank boards).

Shared rules in every prompt: generator paints all lettering; no sign overlaps a door (30 px gap); exit boards high on tall posts; fake exits closed; depth rule (ground visible behind and under trees, exit boards, gates, eaves; tall objects have a clear base); same plate size and layout; no people, no other text.

## Freestanding signs removed (game objects and tap lines to handle at install, flag to Tom)
| Area | Removed from painting | Game object affected |
|---|---|---|
| Hollow | Crooked sign, Pond sign, Warning stake | 'Crooked sign' (6,11), 'Pond sign' (9,4), 'Warning stake' (15,11) |
| Pier | Pier sign (two-arrow post) | 'Pier sign' (14,3) |
| Marsh | Marsh sign, Rotten signpost | 'Marsh sign' (22,10), 'Rotten signpost' (6,3) |
| Sundial | Mossy sign, Pool marker | 'Mossy sign' (8,15), 'Pool marker' (14,6) |
| School yard | School sign (marquee), Snail stone | 'marquee' (15,5), 'Snail stone' (14,8) |
| Square | small notice board at (536 to 590, 756 to 810) | 'Town notice' (9,12) |
| Row | notice board (440 to 540, 544 to 660) | check maps-le.js row objects |

## Boards that remain
| Area | Exit boards (green) | Building boards |
|---|---|---|
| Hollow | THE SQUARE / SHOPS | none |
| Pier | RIVITUSO / ROW (north), WHISPERING / MARSH (west) | REEL'S / BAIT |
| Marsh | SUNDIAL / HOLLOW (top left), CATTAIL / PIER (east) | none |
| Sundial | WHISPERING / MARSH (south) | none |
| School yard | THE SQUARE (west, one line) | none |
| Square | GRUMP / HOLLOW, RIVITUSO / ROW, SCHOOL | eight shop boards |
| Row | THE SQUARE / SHOPS, CATTAIL / PIER | three house boards |

## Install notes
- Pier: exits north (x 770 to 900 = tiles 12,13), west rows 3,4 at x 0; update Marsh east exit arrival to pier (1,3),(1,4); remove Pier sign object.
- Marsh: pull the right-edge walkable stub (rows 9 to 11, cols 24,25) back from the edge; remove the two sign objects.
- Sundial: exit x 640 to 770 (tiles 10,11); block right-edge opening cols 20,21 rows 12,13.
- School yard: block bottom rows 15 to 17 where the new fence runs (y 1090 to 1152); west exit rows 8,9 stay.
- Hollow: pull the NW mask pocket (rows 2 to 9, x 5 to 8) back to the painted dirt.
- Square, Row: docs/AREA_PAINTINGS.md.

---

## 1. Grump Hollow (input grump-hollow-no-boards.png, 1536 x 1408)

EDIT THE ATTACHED IMAGE. It is the painted Grump Hollow of a family RPG, a murky woodland pond with a dirt trail, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: the pond, lily pads, logs, cattails, mist, trail loop, puddles, both benches and Boppy's fishing gear, trees, rocks, ferns, flowers, fences. Output 1536 x 1408 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. REMOVE THE THREE SMALL SIGNS
Remove completely the arrow sign on the left trail (x 385 to 495, y 625 to 780), the post at the pond's west edge (x 565 to 645, y 205 to 300) and the post with two small boards beside the pond (x 910 to 1030, y 590 to 740). Paint trail, grass, reeds, bushes and pond edge where they stood. The only sign left in the picture is the exit board from B.

B. ONE CLEARLY MARKED EXIT ON TALL POSTS (SOUTH)
The Hollow has one way out, the stone path and steps leaving the bottom edge. Add a green exit board on two tall stout wooden posts, one at about x 520 and one at about x 840, feet at about y 1300 where the fences end on either side of the path. The board hangs high between them like a gate header: board center (680, 1108), about 340 x 108 px including a thin carved wooden frame, top at about y 1054, bottom at about y 1162. The face is deep forest green (about #2F4A35) with a thin gold inner line, writing face about 300 x 76. Lettering: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left, cream-gold paint (about #F2E6B8) with a thin dark green outline. ALL CAPITALS, two centered lines, both lines the same letter height, the longer line filling about 85% of the face width, never touching the frame. Spell it exactly, letter by letter: THE SQUARE / SHOPS. No other words, numbers, icons, arrows or flourishes. Open air and the stone path stay fully visible under the board. The steps and path (x 576 to 704) stay clear and open to the bottom edge with a worn trail continuing off the picture. No closed gate, barrier or lock.

C. CLOSE THE NORTH-WEST TRAIL
The dirt trail at the top left (x 340 to 430, y 0 to 260) currently runs off the top edge. Make it a dead end: a thick tangle of bushes, roots and a fallen mossy branch across the trail at about y 260, with dense forest behind it up to the top edge. No gap, no path, no glow, no gate or sign. It must read as a quiet dead end, not an exit.

D. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, the exit board and fences, so the ground must read clearly there. Under the exit board the stone path and steps stay fully visible, with a strip of visible ground about 40 px tall behind it. Tall objects such as trees and posts have a clear base with ground around them. Do not move the trail, benches, trees or rocks.

Do not add any other sign, path, people, animals, boats, buildings or any other text.
OUTPUT: one image, 1536 x 1408 px.

---

## 2. Cattail Pier (input cattail-pier-current.png, 1536 x 1408)

EDIT THE ATTACHED IMAGE. It is the painted Cattail Pier of a family RPG, a sunny lakeside fishing pier with a bait shack, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to E. Everything else stays exactly the same: the wooden pier and platform with tackle box, bucket, net, buoys and posts, the rowboat, water and sparkles, the seagull, cattails, reeds, rocks, trees, Boppy's bench with the thermos (x 445 to 625, y 185 to 295), the bait shack with its awning, barrels, crates, stool and lobster trap, the dirt road layout. Output 1536 x 1408 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. LETTERING ON THREE BOARDS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, the longer line filling about 85% of the face width and 80% of its height, never touching the frame. (The face is the flat writing surface of a board.)
1. Bait shack board, REEL'S / BAIT (apostrophe between L and S): replace the small plank on the shack gable (x 1120 to 1210, y 140 to 185) with a larger wooden board about 232 x 84 px (face 208 x 62), center (1185, 112), pale weathered wood (about #D8C79B), dark brown paint (about #3B2A1A), straight on, level, mounted on the shack wall. It may cover the gable window and the roof edge. Its bottom edge must stay at least 30 px above the awning (awning top about y 185) and clear of the door (x 1305 to 1360, y 190 to 290) and the lantern. Paint over the old plank so none remains.
2. North exit board (green), RIVITUSO / ROW: see B.
3. West exit board (green), WHISPERING / MARSH: see C.
Green exit boards: deep forest green face (about #2F4A35) with a thin gold inner line in a thin carved wooden frame, cream-gold paint (about #F2E6B8) with a thin dark green outline, straight on, level, no tilt.

B. NORTH EXIT
The dirt road leaving the top edge (x 770 to 900) stays wide open and clear to the top edge, with a worn trail continuing off the picture. Board 2 is about 300 x 96 px (face 264 x 68), center (835, 80), hanging high between two tall stout wooden posts at x 735 and x 935 with feet at about y 240. Open air and the road visible under it. No closed gate, fallen branch or lock.

C. WEST EXIT
The dirt road that runs west from Boppy's bench stops at a wooden fence at the left edge (x 0 to 110, y 150 to 260). Remove that fence so the road leaves the LEFT edge at y 192 to 320, with a worn trail continuing off the picture. Board 3 is about 340 x 108 px (face 300 x 76), center (225, 95), hanging high between two tall stout wooden posts at x 95 and x 355 with feet at about y 190 on the grass just north of the road. It may cover lake edge and reeds, never the road.

D. REMOVE THE FREESTANDING SIGN, CLOSE OTHER EXITS
Remove completely the two-arrow signpost at x 850 to 935, y 70 to 260 and paint road and grass over it. No other freestanding sign appears anywhere. Only the north road and the west road leave the picture. The right edge, the shoreline and the bottom stay closed (fences, reeds, rocks, water). Do not add any other path.

E. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, exit boards, gates and eaves, so the ground must read clearly there. Show open ground (road, dirt) under each exit board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, posts and the shack have a clear base with ground around it. Do not paint leaves, awnings or roofs over the roads. Do not move paths or objects to do this.

Do not add people, other animals, boats, buildings, closed gates or any other text.
OUTPUT: one image, 1536 x 1408 px.

---

## 3. Whispering Marsh (input whispering-marsh-current.png, 1664 x 1472)

EDIT THE ATTACHED IMAGE. It is the painted Whispering Marsh of a family RPG, a misty marsh of boardwalks, reeds and cattails, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: the water, the boardwalks and their pilings (the long boardwalk from the east platform running west, then the zigzag north-west up to the path at the top left), reeds, cattails, lily pads, logs, trees, reed islands, stumps and mist. Output 1664 x 1472 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. REMOVE THE TWO SMALL SIGNS
Remove completely the small sign at x 1340 to 1430, y 620 to 670 and the small rotten sign at x 360 to 430, y 160 to 250. Paint reeds, grass and ground where they stood. The only signs left in the picture are the two exit boards below.

B. TWO EXIT BOARDS
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, the longer line filling about 85% of the face width and 80% of its height, never touching the frame. Both boards: deep forest green face (about #2F4A35) with a thin gold inner line in a thin carved wooden frame, cream-gold paint (about #F2E6B8) with a thin dark green outline, about 300 x 96 px (face 264 x 68), straight on, level, no tilt.
1. North-west exit, SUNDIAL / HOLLOW: the path at the top left (x 190 to 260, y 0 to 180) leaves the top edge. Keep it open and clear, with a worn trail continuing off the picture. Board center (225, 100), hanging high between two tall stout wooden posts at x 100 and x 335 with feet at about y 215 on the grass beside the path. No gate, no branch.
2. East exit, CATTAIL / PIER: the east platform at the right edge (x 1440 to 1664, y 740 to 940) is the exit. Keep the boardwalk reaching the right edge, with a worn trail continuing off the picture. Board center (1505, 650), hanging high between two tall stout posts at x 1380 and x 1630 with feet at about y 775 at the north edge of the boardwalk.

C. CLOSE TWO OTHER PATHS
Two paths look like exits and must be closed:
- the dirt path in the bottom-left corner (from the left edge near y 940 to 1040 down to the bottom edge near x 500 to 660): end both ends in dense reeds, bushes and a fallen log so no path touches the left or bottom edge.
- the dirt path on the right edge north of the platform (x 1520 to 1664, y 560 to 770): end it in tall reeds and a rotting log before the edge, so it does not reach the right edge.

D. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, exit boards and posts, so the ground must read clearly there. Show boardwalk or path under each board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, posts and stumps have a clear base. Do not paint reeds or leaves over the boardwalks. Do not move paths or objects to do this.

Do not add any other sign, people, animals, boats, buildings, closed gates or any other text.
OUTPUT: one image, 1664 x 1472 px.

---

## 4. Sundial Hollow (input sundial-hollow-current.png, 1408 x 1280)

EDIT THE ATTACHED IMAGE. It is the painted Sundial Hollow of a family RPG, a mossy clearing with a stone sundial and a dark pool, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: the pool, lily pads, the stepping-stone path across the water, the central path, the sundial, the stone bench, rocks, roots, reeds, flowers. Output 1408 x 1280 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. REMOVE THE TWO SMALL SIGNS
Remove completely the leaning sign at x 465 to 570, y 920 to 1050 and the small sign at x 890 to 960, y 390 to 440. Paint grass, moss, flowers and bank where they stood. The only sign left in the picture is the exit board from B.

B. SOUTH EXIT BOARD AND ONE CLOSED OPENING
The dirt path leaving the bottom edge (x 650 to 800) is the only exit. Keep it open and clear to the bottom edge, with a worn trail continuing off the picture. Add a green exit board about 340 x 108 px (face 300 x 76), center (730, 1090), hanging high between two tall stout wooden posts at x 570 and x 890 with feet at about y 1220 on either side of the path. Open air and the path visible under it. No closed gate, branch or lock. The face is deep forest green (about #2F4A35) with a thin gold inner line in a thin carved wooden frame. Lettering: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left, cream-gold paint (about #F2E6B8) with a thin dark green outline. ALL CAPITALS, two centered lines, both lines the same letter height, the longer line filling about 85% of the face width, never touching the frame. Spell it exactly, letter by letter: WHISPERING / MARSH. No other words, numbers, icons, arrows or flourishes.
Close the opening on the right edge (the grass and dirt gap at x 1240 to 1408, y 780 to 890) with a thicket of reeds, boulders and a fallen log, so no path or gap touches the right edge. No other path leaves the picture.

C. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees and the exit board, so the ground must read clearly there. Show grass or path under the board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as the sundial, trees and posts have a clear base. Do not paint leaves or roots over the central path. Do not move paths or objects to do this.

Do not add any other sign, people, animals, boats, buildings, closed gates or any other text (no numerals on the sundial).
OUTPUT: one image, 1408 x 1280 px.

---

## 5. Long Island Elementary yard (input school-yard-current.png, 1536 x 1152)

EDIT THE ATTACHED IMAGE. It is the painted front yard of Long Island Elementary at dusk in a family RPG, in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to C. Everything else stays exactly the same: the school building and its front doors, flagpole and flag, bike rack and bike, benches, lamps, planters, the playground (slide, swings, tetherball), the three cars, parking lines, crosswalks, arrows, traffic island, trees. Output 1536 x 1152 px, PNG, painted to all four edges, no border, vignette or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. REMOVE THE TWO FREESTANDING SIGNS
Remove completely the standing school sign beside the path (x 940 to 1050, y 304 to 400, including its small text) and the small stone sign (x 890 to 970, y 480 to 570, including its text). Replace each with a flower bed or shrubs in the same style as the nearby planters, so the path and lawn still look finished. The only sign left in the picture is the exit board from B.

B. WEST EXIT BOARD AND CLOSED EDGES
The sidewalk leaving the left edge (y 555 to 615) is the exit to town. Keep it open and clear, with the sidewalk continuing off the picture. Add a green exit board about 280 x 84 px (face 248 x 56), center (175, 445), hanging high between two tall stout wooden posts at x 60 and x 320 with feet at about y 565 on the lawn just above the sidewalk. The lamp post at (175, 450) may be removed, and the bike rack and bike may shift about 60 px right, to make room. The sidewalk stays visible under the board. The face is deep forest green (about #2F4A35) with a thin gold inner line in a thin carved wooden frame. Lettering: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left, cream-gold paint (about #F2E6B8) with a thin dark green outline. ALL CAPITALS, ONE line, filling about 85% of the face width. Spell it exactly, letter by letter: THE SQUARE. No other words, numbers, icons, arrows or flourishes.
The front doors stay as they are (the way into the school).
Close every other edge:
- the road and crosswalk leaving the bottom edge (x 260 to 1240, y 1090 to 1152): a continuous black iron fence with a hedge row and two trees along the bottom edge from x 380 to x 1300. The asphalt and the crosswalk end at the fence.
- the asphalt lane touching the left edge below the sidewalk (y 620 to 700): end it at a curb with bushes.
- the playground on the right: keep the fence and trees closing the right edge.
The only ways out are the front doors and the left sidewalk.

C. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, the exit board, the flagpole and eaves, so the ground must read clearly there. Show pavement under the exit board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, lamps, the flagpole and posts have a clear base with ground around them. Do not paint tree canopies over the sidewalks or entrance path. Do not move paths or objects to do this.

Do not add any other sign, people, animals, new buildings, closed gates or any other text.
OUTPUT: one image, 1536 x 1152 px.

---

## 6. The Square (input the-square-current.png = installed art/town.webp, large fountain, 1920 x 1664)

EDIT THE ATTACHED IMAGE. It is the painted town square of a family RPG in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to G. Everything else stays exactly the same: buildings, roofs, doors, windows, props, benches, lamp posts, cobbles, trees. Output 1920 x 1664 px, PNG, painted to all four edges, no border or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

F. THE FOUNTAIN STAYS LARGE (IMPORTANT, DO THIS FIRST)
The fountain in the middle of the plaza is LARGE: a round stone basin with flowers around it, about 380 px across, from x 640 to x 1100 and y 540 to y 880, with a tiered fountain and water jets. Keep it exactly as it is in the attached image, same size, same place, same detail. Do not shrink it, simplify it or replace it.

A. PAINT LETTERING ON THE ELEVEN BUILDING AND EXIT BOARDS, AND RAISE THE EIGHT SHOP BOARDS
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
A game character will later walk behind trees, exit boards, gates and eaves, so the ground must read clearly there. Show cobbles under each exit board between its posts and a strip about 40 px tall of visible ground behind it. Tall objects such as trees, lamp posts and posts have a clear base with cobbles around them. Do not paint tree canopies, awnings or roofs over the plaza cobbles beyond what is there now. Do not move paths or objects to do this.

G. REMOVE THE SMALL NOTICE BOARD
Remove completely the small freestanding notice board on the left of the fountain (x 536 to 590, y 756 to 810) and paint plain cobbles over it. The only freestanding signs in the picture are the three green exit boards.

Do not add any other text, people or animals, add or remove buildings, move doors, or add any new path or gate.
OUTPUT: one image, 1920 x 1664 px.

---

## 7. Rivituso Row (input rivituso-row-current.png = installed art/row.webp, 1536 x 1408)

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

C. REMOVE THE NOTICE BOARD, NO OTHER EXITS
Remove completely the small freestanding notice board on posts at the left (x 440 to 540, y 544 to 660) and paint garden, flowers or path over it. The only freestanding signs in the picture are the two green exit boards. The only ways out are the north steps and the south path. If any cobbled side path touches the left or right edge, end it in a fence, hedge and trees before the edge. Do not add any gate.

D. KEEP WALKABLE GROUND VISIBLE BEHIND AND UNDER THINGS
A game character will later walk behind trees, exit boards, gates and eaves, so the ground must read clearly there. Show path under each exit board between its posts and a strip about 40 px tall of visible ground behind it. Keep the ground in front of each door and under the porch roofs visible. Tall objects such as trees, lamp posts and posts have a clear base with ground around them. Do not paint tree canopies or roofs over the paths beyond what is there now. Do not move paths or objects to do this.

Do not add any other text anywhere, add people or animals, move doors, or change the paths.
OUTPUT: one image, 1536 x 1408 px.
