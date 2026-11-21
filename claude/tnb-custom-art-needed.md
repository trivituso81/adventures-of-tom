# TNB moves: custom art status (updated 2026-10-31, night 18)

Tom returned the 15-prop sheet and the hill backdrop (no words, so "install it"). Installed in commit 4c416bd (`tpa2`). The original two prompts were consumed; ask Tom if he wants them again (they described the 15 props: laptop, gantt_board, disc_golf_basket, flying_disc, cloche, tasting_table, check_folder, receipt, course_scallops, course_beet, course_choc, trail_sign, clay_lump, clay_cylinder, clay_bowl, and a 16:9 golden-hour LA hill).

## Status by move

| Move | Painted now | Still code-drawn |
|---|---|---|
| Mug Toss, WARDROBE, Metro Tap Card, Coffee Run, Kiln Door Policy, Don't Split Up, Slasher Jump Scare | all props | nothing |
| Foraged at Dawn | pea plate | speech bubble (interface) |
| Scope Creep | laptop | Gantt board (image exists, `art/props/tnb/gantt_board.webp`; the drawn board resizes per step, so it needs a stretch plan) |
| Throw Down | pottery wheel, clay bowl, clay lump and cylinder (via `clayOn`) | nothing; in kit_test only wheel and bowl register hits, check lump and cylinder timing if Tom says the clay looks drawn |
| Just Around the Bend | hill backdrop, `0.2 MI` signs; TNB walks the painted switchbacks (pts forced to [440,168], [508,120], [470,64]) | TOP sign at the summit |
| Round with Jojo | disc golf basket, flying disc | nothing |
| Tasting Menu | cloche, three plated courses, THE CHECK folder | tasting table cloths (image `tasting_table.webp` exists), receipt shape (image `receipt.webp` exists; TOTAL/$1200 text is drawn over the old white shape) |
| Baxter Street Bomb | street signs, mug, painted sky/skyline/hillside behind the drawn street and houses | street, houses, palms |

## Where it lives

- Backdrop: `art/props/tnb/hill_backdrop.webp` (1152x648), drawn with `PROPART.draw('tnb/hill_backdrop',288,162,{w:576,h:324})` in `SC.t6_trail` and `SC.t5_hill` (drawn versions kept as fallback).
- Hooks in engine/tnb-moves.js: `laptop()`, `disc()`, `basket()`, `cloche()`, `folder()`, `bowlProp()`, `clayOn()`, `plate()` (`courseId` map), `SC.t6_trail`, `SC.t5_hill`, and the pts override in `T.around_the_bend`.
- Bake: tools/sprite-bake/bake_prop_sheets.py (sheet 'tnb-sheet2-custom.png', hand-set ROWCUTS/COLCUTS [313,627,940], `drop_specks`), `tools/sprite-bake/key_checker.py` removes a baked fake checkerboard from a sheet. Use it for any generator sheet that arrives with a checkerboard instead of alpha.
- No spoken lines changed, so no voice re-bake.

## Optional polish if Tom asks

Paint the Gantt board (needs stretching art), swap the receipt and tasting table to the painted images, replace the TOP sign with a painted one, a painted street for Baxter Street Bomb.
