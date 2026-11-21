# next-addendum-rose.md (2026-11-06, `rose1`, CHANGES 318, main 42b5ffa or later)

Read with claude/next.md. Rose's approved ability animations and objects are INSTALLED. This replaces the "install approved fx sheets" step for Rose.

## Done
- 14 `rose-ab-*` sheets -> 90 painted frames (`tools/sprite-bake/ability_frames_rose.py`, atlas `art/chars/rose-poses.webp`, frames `ab_<move>_<n>`, right-facing `...F`). All 14 moves in `engine/rose-moves.js` play them. kit_test on all 14: FAILS [].
- Objects: `tools/sprite-bake/bake_rose_fx.py` cuts `rose-fx-*` sheets and overwrites 13 same-shape props (teapot, table, chair, couch cushion, quilt, snack tray, scissors, crayon, cut-out unicorn, chest plate, rocket fist, lava pool, cushion tower).
- Purged: rose-battle-tk/bm atlases, rose-tickle-v2.png, 38 dead scenes, picture_book, cereal_box_visor, paper_tube_levers.

## Left (only if Tom asks or reports it)
- Effect items still drawn by scenes, not swapped (sheets cut fine, see `python3 tools/sprite-bake/bake_rose_fx.py --check` -> tools/shots/rose-fx-check.png): hearts, stars, poofs, sparkles, flames, steam, geyser, confetti, glow, feathers, cookie, juice box, tray extras, helmet, levers, tape, target, beam, rainbow. Wire each into its scene with PROPART.draw and delete the drawn version.
- `toy_teacups`, `treat_set`, `pink_teapot`, `rainbow_feather` props are older art with no new counterpart wired.
- `rose-battle-x` atlas kept: only `raspberry` is still used (Nine Scoops bonus, battle2-kind.js). Other x_ frames (boop, boo, tiara, hug, lookout, balance, throwWind, throwRel, sitStory, sitTea, boopBack) look unused: verify, then trim from bake_rose.py and data/rose-hires.js.
- Tea Party frame 4 clears painted "DRINK UP" lettering (`CUT_ABOVE` in ability_frames_rose.py).
- Ask Tom ONE line: do Rose's moves read right on the phone (size, position, props)?
- Note: next.md itself was not rewritten this session (too long to merge blind); add a pointer to this file at its top.
