# Grump Hollow: check of the installed painting (2026-11-05, after `hollow4`)

Scope (Tom's ask): all approved Long Island area images except Rivituso Row and The Square. Fact: the only one is Grump Hollow (area-hollow v1 and v2 in the Art Library; v2 is a byte-identical copy of v1). Pier, Marsh, Sundial Hollow and the school yard are still drafts with no picture. The six other approved area paintings (blvd, jpark, griffith, studio, backlot, oakpark) are Los Angeles and were not checked. The four Hollow stencil entries are drafts, unused (layers were cut by hand).

Checked: art/hollow.webp, art/hollow-fg.webp and its 31 pieces (PLATE_BEHIND.hollow), the hollow map in data/maps-le.js, mask_overlay and reach_test, and the real game at 393 x 852 and 852 x 393 at six spots (spawn, under the board, clearing, trail top, left bench, fishing spot). No page errors.

| Requirement (docs/AREA_PAINTINGS.md and prompt) | Result |
|---|---|
| Plate is 12:11, 1536 x 1408 | PASS (cropped 85 px from the 1024 square, scaled) |
| Board lettering LONG ISLAND / SQUARE, only words in the picture | PASS, read letter by letter at 3x |
| Board clear of doors, awnings, lamps | PASS (no doors here) |
| Exit board high on two tall posts, set back from the bottom edge | PASS (board at about 70 to 77 percent down, trail continues about 300 px below) |
| Exactly one exit, painted opening matches `exits` and `border.open` (tiles 9 to 13, row 21, to the Square) | PASS |
| No dead-end path that looks like an exit | PASS (left trail ends at the pond shore, as designed) |
| Walk mask matches the painting (trees, boulders, benches, fence, posts, pond blocked) | PASS, reach_test 0 fails, every monster spot reachable |
| Tap objects sit on painted things | PASS (Soggy bench (3,8), Boppy's fishing spot (17,8) land on the two benches; the three removed signs are gone) |
| No people, monsters, collectibles painted | PASS |
| Cutout layer: continuous ground, visible bases, crisp edges | PASS (checked on magenta and in game; Tom passes behind the canopy and under the board correctly) |
| Painted style, golden light from upper left | PASS |
| Scale target from the v2b prompt (bench 1/12 of width, board 1/7) | NOTE: camera is closer (bench about 1/7, board about 1/4). In game Tom is about one bench wide, so it reads right. No action. |
| Raw resolution | NOTE: 1024 px source scaled 1.5x to the plate. Same for every approved area (generator maximum). |

## Minor notes (no action unless Tom raises them)
- Standing directly under the board (rows 17 and 18) hides Tom from head to waist behind it. Correct depth, about two tiles.
- In landscape at the spawn, the quest "!" marker lands on the O of LONG (known item, CHANGES 184 `qicon1`).
- About 16 free tiles at the pond's top edge (row 0, plus (23,7)) are sealed off from the spawn. reach_test prints them as X; nobody can reach them.
- A thin strip of dirt hangs under the arch of the board in the cutout piece (about 10 px). Cosmetic.

## Verdict
PASS. No redo, no code change, nothing pushed.
