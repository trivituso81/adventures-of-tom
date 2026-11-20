# POSE EDITOR: where it stands and the one next job (2026-11-14 23:40, main ad85a6b, build `posefaces2`)

Prompt Tom pastes: **"Read claude/pose-editor-next.md and apply my pose sizes."**

Read, in this order: this file, `docs/POSE_EDITOR.md` in the repo (the rules in force; it wins), then claude/pose-editor-poseedit2.md section "How the bakes size these poses today" and "NEXT: the apply build" for method notes. claude/pose-editor-plan.md is background only.

## State (fact)
| Thing | State |
|---|---|
| Page `poses.html` | Built: walking, feelings, talking poses; two lines per pose; rule sizing (one head size, exactly the real height); Picture zoom, Whole pose and Head only sliders; face preview; EVERYONE tab with Portrait frame master setting |
| Tom's save `data/pose-requests.json` (23:23) | COMPLETE: all 15 poses of Tom, TNB, Justin, Boppy, Amy, Deedee, Olivia, Ellie, Grace, Rose and Jojo's 3 standing poses are lined and checked (`ok:true`). Olivia head target 96. No height changes. No portrait frame change. Many poses carry `sAdj` (whole pose) and `hAdj` (head only): they are Tom's and must be honoured |
| Dialogue faces | APPLIED (`posefaces1`, `posefaces1b`, `posefaces2`): every face of the ten, and Jojo's plain face, is cut from his lines |
| Saved hero crops | Deleted on Tom's order; menu and battle portraits are back to the standard crop |
| Pose sizes in the game | NOT APPLIED. This is the next job |

## The next job: apply the sizes
Bake Tom's checked poses into the game so the figures on the map match what the Result picture shows. Order: FEELINGS and TALKING first (Tom: "the most important thing ... where I'm seeing the most discrepancy"), then WALKING.
- Every checked entry carries `page:{f, h, a, headRows, wholeRows}`: body multiplier, head multiplier, anchor row (his chin line), and the results in rows. Reproduce those within 0.5 row. `f` and `h` multiply the manifest's `s0` (rows per picture px as the game draws the body now); see `data/pose-manifest.json` and `tools/pose-editor/manifest.py` `story_sets` for how `s0` and `now` were derived.
- Zero-change proof first, then one person (Amy) end to end, LOOK at game frames next to her standing pose in portrait and landscape, push, then the rest.
- What his slider pattern says (use it to sanity check, do not second-guess it): on sad, angry and scared he pulled Whole pose down to about 0.86 to 0.93 and Head only up to about 1.1 to 1.3. Those are crouched or bowed poses that the exact-height rule stretches; he corrected them by eye. On proud he pulled Head only down to about 0.8.
- Watch the 15 percent no-fuzz limit and the 0.75 to 1.45 head limit; list any pose that breaks them for Tom instead of baking it.
- After the bake: `python3 tools/pose-editor/manifest.py` (so "in the game now" is true again; `now` for applied poses must then come from the applied sizes), rerun the three face bakers only if a sheet changed (faces come from the lines, not the sizes).

## Open points to raise with Tom (one line each, when relevant)
- Hero paintings have no lines, so menu and battle portraits do not follow the Portrait frame. Recommended: add each hero painting to the Pose Editor as a "Menu portrait" pose and retire PORTRAIT CROPS. Not asked for yet.
- Nara and Michael are locked in the editor; townsfolk, battle, ability and Tombo poses are not in it yet.
- Tom's front standing pose has its top line at the very top of the picture (0.6 px) and he has checked it, so his head, the measure for everyone, is taken hair-top to chin. Treat it as intended.
- Touch behaviour was only ever tested with simulated touches; Tom has now used it on the phone for every pose without reporting a new problem.
