# NARA INSTALL (queued 2026-11-06 10:30, Tom: "TNB and Nara's abilities and objects are all approved, put their implementation in the build instructions")

Fact: Tom approved all 14 Nara ability sheets (`nara-ab-<move>`) and all 14 Nara effects sheets (`nara-fx-<move>`) in the Art Library. Approved is not installed. This session installs them. No Generate presses, no cost to Tom. Build nothing until this task is first in the order.

TNB: already installed and pushed (`tnbinst1`, CHANGES 361, see claude/next.md). Nothing new to build for TNB. One check only (5 minutes, do it first): compare each `tnb-ab-*` and `tnb-fx-*` entry's approved version in data/art-prompts.json against the source the bake used (tools/sprite-bake/src or art/raw/characters). If Tom regenerated and approved a newer picture (most likely Kiln Door Policy and Baxter Street Bomb, the two flagged in 361), re-cut only those moves with `ability_frames_tnb.py` and `bake_tnb.py` (and `bake_tnb_fx.py` for objects), bump tags, add a CHANGES entry, push. If nothing is newer, say so in one line to Tom.

## Before building (5 minutes)
1. Rebase. Read the 28 entries `nara-ab-*` and `nara-fx-*` in data/art-prompts.json: each needs an approved version and a saved picture. If any has none, list them in one line to Tom and install the rest. Do not invent art.
2. The 14 Primary keys (data/abilities.js B8_KITS nara): jump_up, puppy_eyes, tennis_ball_fetch, dont_leave_me, just_one_bite, counter_surfer, stranger_alert, squirrel_ult, doodle_fluff, shake_everyone, not_leaving, happy_puddle, food_inspector, pack_ult. Check every key has both an ab and an fx entry. Map each to its LAST `T.<key>=` or `RECRUIT_MOVES.nara` definition (engine/nara.js has three IIFEs; later ones win: "Option 3" and "Move review rebuilds", prefix `nv_`).
3. Copy the finished TNB recipe: claude/next-addendum-tnb-install.md plus the notes in claude/next.md (DONE: TNB INSTALL). Cutters to copy: `tools/sprite-bake/ability_frames_tnb.py` and `bake_tnb.py` (ab sheets to an atlas), `bake_tnb_fx.py` (fx sheets to props). Pitfalls already found: sheet cell layouts differ (3 x 3 custom sheets, `ONLY_BIG` for tall frames); size frames so the median upright figure equals her ready pose; the fx cutter finds items from the ink, so merged items shift names (check the `--check` contact sheet before installing); the first IIFE in a moves file may not have `ST` (use `RFX.ST`).

## Nara specifics (dog, not a person)
- Her art today: data/nara.js (traced sprites; battle sprites face left; Ready Stance, paw-up celebration, sit, walk frames; HAND points sit at her mouth) and the painted pieces from `nara3`. Check the real current Nara atlas and frame names first. Painted ab frames go in a new atlas `art/chars/nara-ab.webp`, data `data/nara-ab.js`, frames `ab_<short>_<n>`, mirrored `..R` for facing. Keep her HAND/mouth points for props she carries (tennis ball, jerky, dishes); measure them from the new frames.
- She has no hands: props she holds sit at the mouth or under a paw, never in a hand pose. Where a move used the old rig pose (celeb paw-up, sit, run), the painted frames replace it for that move only; keep the old poses for everything else (idle, walk, KO).
- Puddle, shake spray, scent trail, coins and hearts are effect items: wire only if each swap is quick, else list under Left (same as Rose and TNB).

## Build
| Step | What |
|---|---|
| 1. Ability frames | Cut each 3 x 2 ab sheet into 6 painted frames (note any 3 x 3 sheet: smaller figure, softer upscale, tell Tom). Bake `nara-ab.webp` and `data/nara-ab.js`. Painted frames used as painted (CLAUDE.md). |
| 2. Moves | engine/nara.js: new IIFE at the end (prefix `naab_`, later IIFEs win). Each of the 14 moves plays its painted frames. Keep every move's numbers, line, VP, messages, High-Five window and timing unchanged. Use `b7Later`, not setTimeout. PUPPY EYES close-up band, Doodle Fluff and the squirrel ultimate keep their staging; only the dog frames change. |
| 3. Objects | Cut the 14 fx sheets (4 x 3 on magenta) into props in art/props/nara/. Same-shape objects overwrite the older prop of the same name (tennis ball and board, jerky packet and strip, zoomies flags, keep-away rope, squirrel poses, bath bubbles, bone biscuit, dishes and so on; check claude/nara-props-sheet1.txt and claude/nara-props-sheet2-squirrel.txt for what exists). Wire with `PROPART.draw`; where an object is drawn by code, swap it for the painted image and delete the drawn version. Add every new prop to the preload list in engine/prop-art.js. |
| 4. Purge | Same change: replaced Nara frames and rig poses no move uses, code that drew the old look, fallbacks, constants, stale comments and doc notes. Grep every old name: 0 references. Not covered: voice (never delete a clip), frozen demo/, approved art/raw sources. |
| 5. Keep as is | Her barks and lines (no re-bake), Upgrade Mile logic, kindFoe flags, the first-meeting scene and puddle decals. Run the clip audit anyway. |
| 6. Test | `PARTY=tom,nara,grace python3 tools/kit_test.py nara --only=<move> --speed2` for all 14 (`FAILS: []`), portrait and landscape frames of every move, `python3 tools/tag_check.py`, `node --check` on changed files, `python3 tools/smoke.py` (`FAILS: []`), unused_voice.py 0. Look at the frames before pushing. |
| 7. Ship | Bump tags (`ART_V`, prop `V`, preload list, any `?v=`) with `bump_tags.py <NEW> --base origin/main` after the final rebase, docs/CHANGES.md entry, push procedure in next.md. Update next.md (DONE section) and write claude/next-addendum-nara-install-done.md or fold into next.md. |

## Watch items (generated sheets not yet seen in game)
- Likeliest drift: CHAIRMAN CHEEKS! (squirrel ult, two animals in frame), Don't Leave Me!, Doodle Fluff (fluff silhouette), Shake It Off Everyone, Happy Puddle size against the foe.
- Any sheet that came back with a fake checkerboard: `tools/sprite-bake/key_checker.py`.
- Stop-loss: two failed cuts or renders the same way means stop, say what is wrong, write claude/next.md, recommend regenerating that one sheet in the Art Library (only Tom can).

## Final line to Tom
One line: Nara's 14 moves and objects are in the game; ask if they read right on his phone (size, paw and mouth props), and name the one or two moves most likely to need a regenerate. Add TNB re-cut result if any.
