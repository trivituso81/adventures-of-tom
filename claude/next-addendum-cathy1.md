# cathy1 (2026-11-12 08:05 to 08:40, main c3b52df; admin data only, no tag). Read with claude/next.md

- Tom 08:05: "add Ms Cathy to character sheets so she appears for Rose's ability Ms Cathys Snack Attack". Tom's answers: real height 5'4"; no photos, paint her hero from the canon description (about 60, shoulder-length blonde hair, glasses, teal dress).
- Built (fact): `tools/art-library/cathy-prompts.js` (in make-prompts.js list; `cathy: 'Ms. Cathy'` in groups.js PEOPLE). Three entries spliced into data/art-prompts.json right after the Jojo entries, Characters tab, group "Ms. Cathy":

| Entry | Shape | Refs | Status |
|---|---|---|---|
| `cathy-hero` | 2:3, one full-body pose from the description | deedee-hero-v1, ellie-hero-v1, amy-hero-v2, tom-hero-v2, rose-hero-v1 (style and scale only) | draft, Ready |
| `cathy-walk-sheet` | 3 x 3 walk (same text as Jojo's, brisk cheerful steps) | cathy-hero-v1, deedee-walking-sheet-v2 | hidden in To do until the hero exists |
| `cathy-ab-snack-attack` | 3 x 2, 6 frames: tray on palm, wind-up with cookie, throw cupcake, tray overhead laughing, goodbye wave to viewer, proud with empty tray | cathy-hero-v1, cathy-walk-sheet-v1, rose-ab-lamby-boomerang-v1 (facing) | hidden until hero and walk exist |

- If Tom approves a v2 or later of the hero or walk, change the later entries' refs to that file first (validate.js rejects superseded refs).
- Looked at: art.html 390 x 844, group shows "0 of 3 approved", hero Ready, no page errors. validate.js OK.

## Install when all three are approved (not done)
1. Bake her frames like Jojo (`bake_jojo.py`, `JOJO_BT` in engine/tnb-moves.js is the model): walk profile row (in and out, flip for leaving), the 6 move frames. Lazy atlas: give her prefix to PAINTED_CAST. Battle scale from 5'4" (Deedee is 5'5").
2. engine/rose-moves.js `SC.rf_cathy`: map `idle` to frame 1, `wind` 2, `throw` 3, `celeb` 4, the BYE ROSE wave 5, `hip` 6; `run1/run2` to the walk profile steps. She holds a painted tray, so drop the `rose/snack_tray` overlay and the drawn fallback tray while a sheet frame is shown.
3. Purge the stand-in completely: `cathy()`, `CATHY_`, `drawCathy` (Deedee recolor and drawn glasses) and its comments. grep `cathy(` and `drawCathy` to 0.
4. Test: `python3 tools/kit_test.py rose --only=lamby_boomerang --speed2`, look at the contact sheet, portrait and landscape; smoke FAILS []; bump tags; CHANGES entry; push.
- She has no dialogue lines, so no talk face or emotion sheet is needed (dialogue-face rule only applies to speakers).
