# Rivituso Row v3 install result (2026-11-02, `row3`, pushed to main as cc523c7)

Method: docs/AREA_PAINTINGS.md plus claude/square-v3-install.md. Script: tools/make_row_fg.py (builds art/row.webp and art/row-fg.webp, prints PLATE_BEHIND.row). Originals and masks: docs/reference/row_v3_from_tom.png and docs/reference/row_v3_masks/.

What went in
- Plate 1536 x 1408 (24 x 22 tiles). 26 walk-behind zones in PLATE_BEHIND.row (engine/plate.js). Masks used only as masks, pixels from Tom's painting.
- Houses (data/maps-le.js LE_HOUSES): amyhouse x7 y1 (door 9,5); grands x12 y4 `door2:true` (doors 14,8 and 15,8); elliehouse x5 y13 `door2:true` (doors 7,17 and 8,17). `door2` is new in engine/world.js placeHouse.
- Exits: north (13..15,1) to the Square (arrive row 24), south (12..14,21) to Cattail Pier (gate unchanged: chapter 3 and flag ch3-boppy). Square and Pier exits into the Row repointed.
- noGo tiles added so a wandering NPC cannot seal a door (reach_test found 14,10 and 15,10).
- Scripted coordinates changed: scenes.js (Row arrival 14,10), scenes-ch13.js, scenes-ch14.js (Tom 14,12; walks and exits), bonus-nine-scoops.js (Pier gate tiles). PLATE_SIGNS.row is empty (lettering is painted).

Not cut (fact): the five grouped prop clusters (alignment failed) and the thin cafe chair back (only partly cut). Both minor.

Tested: reach_test row 0 fails, camera_clamp, rooms_test amyhouse grands elliehouse, smoke FAILS: [] (twice, also after rebase), all five doors, Square to Row, Row to Pier to Row, ch14Open scene played on the Row, portrait and landscape looked at. NOT run: ch13 final scene frames, tap_test, the phone.

Look first on the phone: anyone hidden wrongly behind a tree, lamp, roof or awning; a spot he cannot walk; a door that opens the wrong house; the Gregori and Ellie two-tile doors; the ch14 scene positions.
