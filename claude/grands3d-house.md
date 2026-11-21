# Deedee and Boppy's house (map `grands`), clear paths and 3D (`grands3d`, 2026-11-01)

Tom: "no clear paths in and out around furniture and nooks and crannies; use cut outs to give it a 3d effect."

## What changed
- Walk map (`plateMask` in data/maps-le.js, block `grands`) redrawn: 68 walkable tiles, every one reachable from the front door. Lanes: front door (7..9,15) up the gate lane (x7..9, y11..14) to open floor (6..11,7..9); kitchen aisle (2..5,7) behind the cookie counter, kitchen nook (3..5,5..6); sofa aisle (6..10,5) behind the sofa; arch (10..13,3..5) to the east hall; stool lane (2..5,10) west and dining lane (12..14,10) east.
- Object footprints now match the painting: recliner, TV, coffee table, plaid sofa, end table, pepper plant, big fern, hall table, hall chair, dining table, cookie counter, sideboard. Existing spoken texts unchanged; new object texts have no em dashes.
- `noGo` list on the room spec (engine/world.js `makeRoom` adds it to `map.npcNoGo`): one-tile link tiles the wandering residents must not stand on, so Deedee and Boppy never plug a lane.
- 3D walk-behind: `art/grands-fg.webp` (cutout of the cookie counter top with pie, dome and muffins; the plaid sofa; the two ivy plants on the half wall), made by `tools/make_grands_fg.py` (hand polygons, HSV mask for the ivy). Zones in `PLATE_BEHIND.grands` (engine/plate.js), `fgSrc` on the PLATES entry. Tom reads as behind the counter, the sofa and the ivy.
- Chapter 15 dinner table (`ch15AddTable` / `ch15RemoveTable`, data/scenes-ch15.js): removing it now restores the floor exactly (object tile solid from another object, portal, or the plateMask).
- Call made: the foyer sides stay decoration (not walkable).

## Tests
`python3 tools/grands_walk_test.py` (reach, lanes, 16 furniture touches, real key-press routes, ch15 table restore, screenshots tools/shots/grands-3d-*.png in portrait and landscape). Residents are parked on open rug before each walk and each step waits for the move to start; 9 of 9 runs passed after that (before it, a resident standing in a lane failed about half the runs, which is correct game behaviour, not a bug). Also run smoke, reach_test, tap_test, jpark_test, ch14_test, ch15_test.

## Status
Pushed to main (5010a8d, ca7d1a4, test tidy 43a37de). Not yet played on the phone. Knobs if Tom reports: lane too tight or a tile that should walk, edit the mask rows and `noGo`; a cutout edge too hard or the wrong draw order, edit the polygons in make_grands_fg.py or the `base` of the zone in `PLATE_BEHIND.grands`.
