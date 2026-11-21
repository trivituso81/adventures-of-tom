# Rivituso Row: painted lettering and raised house boards (written 2026-10-30)

Tom: the live serif lettering on the house signs does not fit the look and feel of the app, and signs must never overlap doors. Measured on the installed plate: Gregori board bottom y 324 vs door top about 332; Rivituso board bottom 374 vs door top about 380; Aunt Ellie board bottom 861 vs door arch top about 870.

Input: rivituso-row-for-lettering.png = art/row.webp as installed (blank boards, 1536 x 1408).

## Prompt (paste into the image generator)

EDIT THE ATTACHED IMAGE. It is the painted Rivituso Row of a family RPG in a 16-bit era storybook style. Keep the painting style, lighting, palette and camera exactly as they are. Make only the changes listed under A and B. Everything else stays exactly the same: houses, roofs, doors, windows, steps, lamps, gardens, paths, trees. Output 1536 x 1408 px, PNG, painted to all four edges, no border or watermark. Coordinates are pixels from the top left; anything may be off by up to 32 px.

A. RAISE THE THREE HOUSE BOARDS AND PAINT LETTERING ON ALL FIVE BOARDS
The three house boards sit almost on top of the doors. MOVE EACH HOUSE BOARD UP so its bottom edge is at least 30 px above the highest part of the door frame below it (and clear of the lamps). Keep each board the same size (about 240 x 96 px, face 216 x 72), centered above its door, drawn straight on. Paint the wall, window box or roof that the old board position leaves behind so no old board remains. A board must never overlap a door.
Lettering style: hand-painted signwriter lettering that belongs in the painting: bold, slightly rounded capitals, a little irregular like brush work, a thin lighter highlight on the top edge of the letters and a soft shadow underneath, lit from the upper left. ALL CAPITALS. Spell every word exactly as written, letter by letter. No extra words, numbers, icons, arrows, flourishes or tiny text. Two centered lines, both lines the same letter height, filling about 85% of the face width and 80% of its height, never touching the frame. House boards: dark brown paint (about #3B2A1A). Exit boards: warm cream-gold paint (about #F2E6B8) with a thin dark green outline.
1. Gregori house board, new center (598, 252): GREGORI / HOUSE
2. Rivituso house board, new center (1186, 302): RIVITUSO / HOUSE
3. Aunt Ellie's house board, new center (748, 790): AUNT ELLIE / HOUSE
4. North exit board (green, keep size and place), center (852, 76), face about 232 x 72: THE SQUARE / SHOPS
5. South exit board (green, keep size and place), center (801, 1262), face about 282 x 72: CATTAIL / PIER

B. NOTHING ELSE
Do not add any other text anywhere, add people or animals, move doors, change the paths, or add gates. Both exits stay open and clear.

OUTPUT: one image, 1536 x 1408 px.

## Install plan (no ask of Tom)
1. Check every word letter by letter and that no board touches a door.
2. Scale to 1536 x 1408 (tools/hollow_signs.py is the template), art/row.webp q88, bump ?v= in PLATES.row, set PLATE_SIGNS.row to [] in engine/plate.js.
3. Walk mask should not change; reach_test row, smoke, camera_clamp, shots at each door and exit, CHANGES, push.
