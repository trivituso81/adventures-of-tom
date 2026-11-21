# next addendum, 2026-11-11 ~17:45 local: airport1 pushed (main 9fb15ab). Read with claude/next.md; folds into it at the next rewrite. Replaces the airport task in claude/next-addendum-arealay1.md.

## What is live (fact)
- Tom 15:52: "update airport area maps using the newly approved art and cut outs." Terminal Zero, Gate Zero, Flight Zero, Gate 00 and the Endless Concourse now use the paintings approved 2026-11-11 (`art/raw/rooms/room-<id>-v1.png`), each with a walk-behind layer.
- Plates: `python3 tools/make_airport_plates.py [ids] [--grid]` (cover and crop at 64 px per tile; `GEOM` holds tiles and crop anchor; `--grid` writes `tools/shots/airgrid-<id>.png` with numbered tiles).
- Two maps grew because their paintings are 16:9: Flight Zero 19 x 11 (aisle rows 4 to 6), Concourse 40 x 22 (floor rows 9 to 21). All coordinates moved: exits, objects, monster spots, triggers, scene steps (data/maps-le.js, data/maps-p2.js, data/scenes.js, data/scenes-p2.js, data/p2-monsters.js, data/terminal-monsters.js).
- Cutouts: `python3 tools/make_airport_fg.py [ids] [--no-save]` writes `art/<id>-fg.webp`, `data/airport-behind.js` (GENERATED `PLATE_BEHIND` zones, loaded right after engine/plate.js) and `tools/airport-behind.json`; previews `tools/shots/airfg-<id>-green.png` and `-outline.png`. 49 pieces. To add or change a piece: edit `STENCIL` or `HAND` in that file (plate px), rerun, bump tags.

## Stencil verdicts (fact, measured by drawing each stencil's outline over its painting)
| Map | Usable as masks | Not usable, cut from hand boxes and outlines instead |
|---|---|---|
| Terminal Zero | none | cut1 to cut4: objects redrawn at other places and sizes (traced from the older painting) |
| Gate Zero | cut1 plants, cut2 seats, cut3 rail posts | cut3 pillars and podium not needed (nobody stands behind them) |
| Flight Zero | cut2 front pods, cut3 cart | cut1 back pods not needed |
| Gate 00 | none | cut1 to cut3 came back as rearranged sheets |
| Concourse | cut3 walkways and lamp posts | cut1 (same file as Terminal cut1) and cut2 are rearranged sheets |
The method for the unusable ones: a box or outline per piece, then GrabCut on the painting sets the edge. If Tom wants a piece that is missing or an edge cleaned, add it to `HAND` (kinds: rect, poly, exact, line). Do not ask for new stencils for these maps unless a piece cannot be cut this way.

## Tests
- `python3 tools/airport_test.py [map ...]` (objects, monsters, exits, triggers, plate size; portrait and landscape shots `tools/shots/air-<map>-<p|l>-<spot>.png`; landscape uses the game's own toggle and turns the shot upright). Passed, with terminal_test, ch11_test, ch11b_test (moved to the new tiles), reach_test 0 on all five, boss_finale_test ch10 and ch11, smoke, tag_check, unused_voice 0.

## Not done (say so if Tom asks)
- Chapter 10 not played start to finish from chapter select on the new maps (only terminal_test and the boss ending test). Chapter 11 was played by ch11_test and ch11b_test.
- Character size on these five maps was not re-measured against the new paintings (they keep `actorScale` 1.98 or the default).
- Art Library titles for Flight Zero and the Concourse still say 19 x 7 and 40 x 14 (`w`, `h` in tools/art-library/room-prompts.js). Changing them changes the prompts, so it waits for Tom to ask for new paintings of those two.
- The boss stage harness stands the Final Call near the spawn, on the back wall; in the real game it stands at 33,10 by Gate Infinity.

## Waiting on Tom
- Phone checks: walk all five maps in portrait and landscape; stand behind the departure board, Gate Zero seats, Gate 00 sofas, cabin front pods and cart, Concourse seats, walkways and rope; walk through the scanner arch; Gate Zero doors locked and open.
- If a spot walks on furniture or stops on open floor: fix that map's `plateMask` (or ADMIN > AREA BUILDER export, then `tools/apply_walkmap.py`), run reach_test and airport_test.
