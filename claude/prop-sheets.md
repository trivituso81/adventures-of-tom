# Battle prop sheets (started 2026-10-30)

Tom runs one prompt file per sheet in an external image AI and sends the PNG back. The prompts are built by claude/prop-sheets-build.py (all prop names and descriptions live in its `sheet(...)` calls; edit the lists there, set PLAN, run, zip). Output paths in the script point at the old scratchpad; change OUT and zp.

Returned sheets are saved as source images in the repo: `tools/sprite-bake/src/props/` (README there says which cells are right). Project docs cannot hold images, so the repo is the only copy.

Per-sheet routine: check every cell against the prompt list, save the PNG as tools/sprite-bake/src/props/<char>-sheetN-of-M.png, add a README row and a docs/CHANGES.md entry, push to main, tell Tom which cells matched or missed.

## Source of the lists
Inventory of every prop the battle animations draw, Primary versions only (traced from engine/*-moves.js in the artifact, last definition wins). Remix versions have no animation code of their own (rx_* keys), so they fall back to legacy animations; their props are NOT in the sheets. Counts: Tom 31, Grace 15, Rose 25, Amy 39, Deedee 30, Boppy 31, TNB 31 (202 total).

## Lessons
- Tom's first sheet (7x5, 31 props): cells 1 to 15 matched the list, cells 16 to 31 were invented from the theme sentence. Fix: max 16 props per sheet (4x4), no theme sentence, an explicit "never substitute" rule.
- With that fix: Tom sheet 2 (16 props) matched 15 of 16, the last cell (retro console) became a theme item (jade roller). Grace (15 props, last cell empty) matched 15 of 15. Rose sheets 1 and 2 (13 and 12 props) matched 25 of 25. Amy sheets 1 to 3 (13 props each) matched 39 of 39. Deedee sheets 1 and 2 (15 props each) matched 30 of 30. The 14-prop redo sheet matched 14 of 14. So 15 or fewer per sheet is the safe size.
- Boppy and TNB came back as one 7x5 sheet of all 31 each (the single-sheet prompt, not the split files). Same pattern as Tom's first: right up to about cell 23 to 25, then drift into invented props. Items past about 23 on a 31-item sheet are unreliable.
- Cell numbers restart at 1 on every sheet, so match by the order in the prompt file.
- Returned PNGs are not the 1024 square we asked for (1484x1060 and 1254x1254), with light and colored edge halos. Cut cells by gaps, not by numbers.

## Status: ALL PROP SOURCE ART IS IN (2026-10-30)
| Sheet | Items | State |
|---|---|---|
| Tom sheet 1 and 2 | 15 + 15 good | Saved. Retro console came from the redo sheet |
| Grace 1 of 1 | 15 | Done |
| Rose 1 and 2 | 13 + 12 | Done (6283f10, af94bad) |
| Amy 1, 2, 3 | 13 x 3 | Done (744d43b, 6fe4fd7, 2fa26b0) |
| Deedee 1 and 2 | 15 + 15 | Done (c9e636c, 3041d69) |
| Boppy 31-item sheet | cells 1 to 25 good | Saved (8b05487). Cells 26 to 31 replaced by redo sheet, except starter pistol: reuse Amy's |
| TNB 31-item sheet | cells 1 to 23 good | Saved (b1f4840). Cells 24 to 31 replaced by redo sheet |
| Redo sheet | 14 | Done, 14 of 14 (6f28256): console, ghost pepper, fire alarm, cardigan, finish arch, race bib, longboard, painted curb, rocking platform, spirit level, clay wedge, brick kiln, stoneware mugs, street signs |

Console caveat: redo cell 1 (Tom's retro console) looks close to a Super Nintendo. Tom saw it and waived the concern ("there are elements of it that make it clearly different from an SNES"). It stays as is.

## Cut and wired (2026-10-30, af3ea92 on main)
- All 202 props are cut by tools/sprite-bake/bake_prop_sheets.py into art/props/<char>/<slug>.webp (ids in tools/sprite-bake/src/props/props.json). Re-run it after replacing any source sheet. Docs: docs/PROP_ART.md.
- engine/prop-art.js: PROPART.draw(id,x,y,opts) paints the image first and returns false so the caller falls back to the drawn prop. Moves draw props in local helper functions, so each prop needs its own hook (last definition wins; tools/kit_test.py prints PAINTED_PROPS to prove a hook fired).
- Trial wired, one move each: Tom headphones (Noise-Canceling), Grace gold dumpling (Squishy Squeeze), Rose Lamby and Backup Lamby (every move showing them), Amy kettlebell (Kettlebell Swing), Deedee crisp pan (Corner Piece; the corner no longer regrows), Boppy cayenne (Pepper Breath), TNB test mug (Mug Toss).
- Not covered: Remix moves (no animation code of their own); Tom's hair on Lamby in Tombos (stays drawn).
- Next: wait for Tom's verdict from his phone, then wire the remaining props character by character with the same pattern.
