# Rose Mode verification session (2026-10-27)

Tom reported nothing, so the session ran the tests against the live build and fixed what failed.

## Results
- rosetest.py: 12/12 pass.
- picturetest.py (new): all 8 characters, cross / moves / tombo / bag / look / target, every img.bi loads, no label over one word, Grace Mode shows 0 pictures, portrait plus landscape shots. Clean.
- kit_test.py rose and tom: one failure, Rose RASPBERRY (Rm.sillyShow, last definition in engine/rose-moves.js) had no spoken line. Fixed: added say(m.id,'silly') at t=0. Published as v316 (1793105288-71f4).

## Observations, no fix made
- TOMBO grey in the lab is by design (story-gated).
- Landscape cross icons are 24px (html.landscape .bp-cross .bi); portrait/grid 34px. Enlarge only if Tom says they are small.
- Moves grid auto-scrolls so the selected card sits at the bottom.
- A single tap on a target row fires immediately, by design. Preview-tap applies to skills, bag, tombo only.

## Test notes
- Bare globals work inside page.evaluate: b2Open, b2Pick, b7SetDiff, B2.
- Another session published data/maps-le.js and data/scenes.js in 1793105153-1864 (Deedee glasses gag). Diff before any publish.
