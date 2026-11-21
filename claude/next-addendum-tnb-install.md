# TNB INSTALL (queued 2026-11-06 08:13, Tom: "All of TNBs moves and objects are approved, add it to the build instructions")

Fact: Tom approved all 14 TNB ability sheets (`tnb-ab-<move>`) and all 14 TNB effects sheets (`tnb-fx-<move>`) in the Art Library. Approved is not installed: nothing in the game uses them yet. This session installs them. No Generate presses, no cost to Tom. Queue position: right after DEEDEE FX REST, before NPC BUILDER (same recipe, approved work waiting).

## Before building (5 minutes)
1. Rebase, then read the 28 entries in data/art-prompts.json: confirm every `tnb-ab-*` and `tnb-fx-*` has an approved version and a saved picture in art/raw/characters (or wherever the Library saves). If any entry has no picture, list them in one line to Tom and install the rest. Do not invent art.
2. Get the 14 move keys and names from data/abilities.js B8_KITS (TNB) and the last `T.<key>=` definition of each in engine/tnb-moves.js (later IIFEs win). Check that every key has both an ab and an fx entry.
3. Read the two finished recipes and copy them: claude/next-addendum-rose.md (`rose1`, CHANGES 318) and claude/next-addendum-grace-abilities.md (`gab1`, CHANGES 316 and 317). Cutters to copy: `tools/sprite-bake/ability_frames_rose.py` or `grace_ability_frames.py` (ab sheets to frames), `bake_rose_fx.py` or `bake_grace_fx.py` (fx sheets to props), `bake_prop_sheets.py` pattern.

## Build
| Step | What |
|---|---|
| 1. Ability frames | Cut each 3 x 2 ab sheet into 6 painted frames (3 x 3 sheets: note the smaller figure and softer upscale, tell Tom). Atlas `art/chars/tnb-poses.webp` (check the real current TNB atlas names first), frames `ab_<move>_<n>`, mirrored `...R` for facing. Painted frames used as painted (CLAUDE.md). |
| 2. Moves | engine/tnb-moves.js: each of the 14 moves plays its painted frames (new IIFE at the end, prefix `tnbab_`, later IIFEs win). Keep every move's numbers, line, VP, messages, High-Five window and timing unchanged. Use `b7Later`, not setTimeout. |
| 3. Objects | Cut the 14 fx sheets (4 x 3 on magenta) into props in art/props/tnb/. Same-shape objects overwrite the older prop of the same name (laptop, gantt board, disc, basket, cloche, tasting table, check folder, receipt, plated courses, trail sign, clay pieces, mug, metro card, rack, steamer and so on: see claude/tnb-custom-art-needed.md for what is already painted). Wire with `PROPART.draw`; where an object is still drawn by code (Gantt board resizing, receipt text, tasting table cloths, TOP sign, Baxter Street street and houses) swap it for the painted image and delete the drawn version. Effect items (hearts, steam, sparkles, flames, poofs): wire only if each swap is quick; otherwise list them under Left, like Rose. |
| 4. Purge (standing rule) | Remove in the same change: replaced TNB atlases and frames, code that drew the old look, fallbacks, constants, stale comments and doc notes. Grep every old name: 0 references. Not covered: voice (never delete a clip), frozen demo/, approved art/raw sources. |
| 5. Keep as is | WARDROBE and Quick Change rack costume cycle (Action Hero, Cozy Cardigan, Final Girl) and Upgrade Mile logic. No spoken line changes, so no voice re-bake. No unused voice: run the clip audit anyway. |
| 6. Test | `PARTY=tnb,grace,rose python3 tools/kit_test.py tnb --only=<move> --speed2` for all 14 (FAILS []), portrait and landscape frames of every move, `python3 tools/tag_check.py`, `node --check` on changed files, `python3 tools/smoke.py` (FAILS []), unused_voice.py 0. Look at the frames before pushing. |
| 7. Ship | Bump tags (`ART_V`, prop `V` and the preload list in engine/prop-art.js, any `?v=`), docs/CHANGES.md entry, push procedure in next.md. Write claude/next-addendum-tnb-install-done.md (what shipped, what is left) or fold into next.md. |

## Watch items (from next.md Known risks, not yet seen generated)
- Frames were written from move beats, so a sheet may show drift. Check Kiln Door Policy and Baxter Street Bomb first; Don't Split Up and Round with Jojo (Jojo has no sheet: she must read as a small prop-level figure or be left out).
- Any ab sheet that came back 3 x 3 or with a fake checkerboard: `tools/sprite-bake/key_checker.py` removes a baked checkerboard.
- Stop-loss: two failed renders or cuts the same way means stop, say what is wrong, write claude/next.md, recommend regenerating that one sheet in the Art Library (the one thing only Tom can do).

## Final line to Tom
One line: TNB's 14 moves and objects are in the game; ask if they read right on his phone (size, position, props), name the one or two moves most likely to need a regenerate.

## After this
Nara, Boppy, Olivia, Justin ability and fx sheets install the same way, one character per push, only when Tom says they are approved (Generate presses are his; do not wait on them).
