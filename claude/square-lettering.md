# The Square: painted lettering, blocked dead ends, higher boards (v2, written 2026-10-30)

Tom's feedback after playing: (1) the game-drawn serif lettering looks plain and out of place, so the generator paints the words; (2) the east SCHOOL board reads as pointing the wrong way because a cobbled street runs north beside it, and a path leads off the west edge: neither goes anywhere (the game has only three exits: north steps, south street, east opening), so both must be closed with fences and trees; (3) boards must never overlap doors (the shop boards sit 10 to 15 px above the door tops and some touch awnings); (4) the RIVITUSO ROW exit board sits at the foot of its posts, it should be higher on taller posts.

Input: the-square-for-lettering.png = art/town.webp as installed (blank boards, 1920 x 1664). Same file as sent earlier.

## Prompt v2 (paste into the image generator; it replaces the first one)

EDIT THE ATTACHED IMAGE. It is the painted town square of a family RPG in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A to D. Everything else stays exactly the same: buildings, roofs, doors, windows, props, fountain, benches, lamp posts, cobbles, trees. Output 1920 x 1664 px, PNG, painted to all four edges, no border or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

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
- West: the cobbled path leaving the LEFT edge around y 560 to 940 (with the small wooden fence at about x 0 to 110, y 760 to 880 and the hedge above it). Close it completely: a continuous wooden fence along the left edge from y 560 to 940, with dense trees and bushes behind and beside it. The cobbles end at the fence. No gap, no path, no gate, nothing that reads as a way out.
- North-east: the cobbled street that runs north along the right side (about x 1700 to 1900, from y 430 up to the top edge). Close it: a wooden fence across the street at about y 330 to 420 with two large trees, hedges and flower beds behind it, so the street ends in a quiet dead end and does not continue north. The shop board at (1558, 310) and the PENNY'S POCKETS building stay as they are.

C. MAKE THE EAST EXIT UNMISTAKABLE
The east opening is the cobbled gap on the right edge at y 576 to 704. Keep it wide open, with the cobbles continuing to the right edge and a worn trail clearly continuing off the picture, so it is the only way east. The SCHOOL board stays on its posts directly above the opening, perfectly straight on, facing the viewer.

D. RAISE THE SOUTH EXIT BOARD ON ITS POSTS
The RIVITUSO ROW board at the bottom (about x 830 to 1096, y 1376 to 1440) sits at the very foot of its two posts. Make the two posts taller, with their feet at about y 1540 and the board mounted high on them, about 100 px above the post feet, keeping the board the same size and place. The street between the posts stays clear to the bottom edge.

DO NOT: add any other text anywhere, add people or animals, add or remove buildings, change the fountain, move doors, or add any new path or gate. 

OUTPUT: one image, 1920 x 1664 px.

## Install plan (no ask of Tom)
1. Check every word letter by letter; check no board touches a door or awning; check both dead ends are closed and the east opening is open. Fix by sending Tom the one thing to redo.
2. Scale to 1920 x 1664, art/town.webp q88, bump ?v= in PLATES.town. Set PLATE_SIGNS.town to [] in engine/plate.js.
3. data/maps-le.js town plateMask: block the north-east street (rows 1 to 7, x 27 to 28, and any other tiles the new fence covers) and any west tiles that painted as path; keep the east opening (29,9),(29,10), north steps (7,0),(8,0), south street (14,25),(15,25) open. Check the 'East signpost' object (28,8) and scenes that place actors on the closed tiles (grep "'town'" in data/scenes*.js, data/bonus-*.js, engine/story.js). Update the fallen-branch and school-gate drawings in engine/story.js if the board or opening moved.
4. Screenshots portrait and landscape at every shop door and exit; reach_test town, smoke, camera_clamp; CHANGES entry; push; rewrite claude/next.md.
