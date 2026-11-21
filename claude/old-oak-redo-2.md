# Old Oak interior, redo (2026-10-31)

## Status
v3 painting INSTALLED (commit aaeafe5, `oak2`). Walk map, objects, ladder, exits, monster spots and golden pulses are wired to it. Not yet confirmed on Tom's phone. Still open: the area tip card covers the top of the screen inside the tree.

## History
1. Original painting: beautiful, but the walk map and objects did not match it (diagonal bridges vs the grid, "corkboard" object on the round table, two hanging baskets and no bucket at either, doormat object two tiles off, nothing marking the key objects).
2. Redo v2 (flat T layout): Tom rejected it as oversimplified, small and less beautiful. Do not go back to it.
3. Redo v3 (Tom's "one more try"): rich hub-and-loop painting. Tom: "I think this works." Installed.

## Installed layout (24 x 20 tiles, art/oak.webp 1536 x 1280)
- Spawn (11,18). Entry steps at the bottom lead to the hub. Left stair to the war room (corkboard object (4,1,3,4), A from the row below). Two-flight right stair to the pantry (bucket object (21,3,3,3), stand at (20,5) facing right). Two rope bridges meet on a middle landing. Ladder cells (11,3),(12,3),(11,4),(12,4),(11,5),(12,5); crown landing row 2; sky exits rows 0-1 to `crown`.
- "The drop" object (11,5,2,1) is removed when the ladder comes down. No doormat object.
- Glint: `STORY_MAPFX` in data/scenes.js pulses on the next target (corkboard, bucket, hooks above the shaft) until `ch6-boss`.
- Tests: tools/oak_test.py, oakpark_test.py, crown_test.py, smoke.py.

## If Tom says the paths still feel off
Tune the `oak` `plateMask` rows in data/maps-la.js using `python3 tools/mask_overlay.py oak`.
