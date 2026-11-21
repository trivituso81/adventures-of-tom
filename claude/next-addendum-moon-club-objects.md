# Moon Club: objects sheet and install (written 2026-11-07)

## Facts
- Map id `moonclub` (data/maps-le.js ~783-890), plate 30x22 tiles, 1920x1408. Approved EMPTY plate is `art/raw/rooms/room-moonclub-v1.png` (Art Library entry room-moonclub, prompt claude/moon-club-empty-v2-prompt.txt). It is approved, NOT installed: art/moonclub.webp is still the old plate.
- Still painted in the approved plate (do not redraw as objects): long coat-check counter (top left), curved bar counter (top right), small cabinet, ONE potted plant (top right), wall shelving with hangers, back bar, brass plaque on the hall wall, dividing walls, round-hall railings, edge structures, Dome doors (closed), rugs, runners.
- Walk-behind masks (4 prompts, claude/moon-club-v1-cutout-prompts.txt) still stand: dividing walls, round hall railings, edge structures, counters and plant. Method doc claude/square-v3-install.md.
- Tom wants ONE object sheet, not one prompt per object (11-07 01:33). Prompt: claude/moon-club-objects-sheet-prompt.txt (12 cells, 4 columns x 3 rows, magenta ground, attach the approved plate as palette reference). Order: 1 empty mirror stand, 2 blank plaque, 3 coat rail with purple coat, 4 empty gold frame, 5 jukebox, 6 piano + bench, 7 card table + 4 chairs, 8 armchair, 9 potted palm, 10 rope posts pair, 11 side table + lamp, 12 bench.
- Reuse: mirror stand x3 (CLUB_MIRRORS A(21,11) B(21,9) C(15,9), drawn live, liveKinds ['mirrorstand']), card table x2, palm x4, rope posts x2, chairs x2. Plaque is blank on purpose (clubplaque text changes, game draws it). Mirror stand and frame are empty on purpose (mirrors return with the moonbeam puzzle).

## Next session does
1. Check the Art Library for Tom's sheet (name likely room-moonclub objects or art/raw/props). If he has not pressed Generate, wait; do not invent work.
2. When the sheet is approved: cut each cell from the ink (see tools/sprite-bake/bake_prop_sheets.py approach and docs/PROP_ART.md; key out #FF00FF, crimson drift needs a keying step), save `art/props/moonclub/<slug>.webp` trimmed, max side sized for the plate.
3. Draw them in engine/club-render.js (kinds: mirrorstand, clubplaque, coatrack, mirrorframe, jukebox, clubpiano, cardtable, clubchair, clubpalm, ropepost; PROPART.draw falls back to the drawn version). Objects and positions come from maps-le.js moonclub objects list: coatcounter (7,3), coatrack (5,3, state-dependent Hanger-On), clubbar (18,2), jukebox (19,13), clubpiano (10,13), mirrorframe (23,15), plaque (21,8), palms x4, chairs x2, cardtables x2, ropeposts x2.
4. Install the approved plate (art/moonclub.webp, bump ART_V) and the 4 walk-behind masks as PLATE_BEHIND layers. Look at both orientations, run smoke, tag_check, CHANGES entry.
5. Tom redoes the walk map in the Area Builder if he wants; do not run mask generators on his rows.

## Canon items to check later
three small brass stands, plaque MEMBERS ARE ADMITTED BY MOONLIGHT, east window moonbeam, ticket seven purple coat, fifty years of dust.
