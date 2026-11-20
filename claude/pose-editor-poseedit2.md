# POSE EDITOR addendum: `poseedit2` (2026-11-14). Read with claude/pose-editor-plan.md. Where they differ, THIS FILE WINS.

Prompt for the next conversation: **"Read claude/pose-editor-plan.md and claude/pose-editor-poseedit2.md, then build the next phase."**

## Why (Tom 2026-11-14 21:20)
"I'm having a hard time figuring out how this thing works, and also I don't see how to resize their emotion states and talking states, which is probably the most important thing because that's where I'm seeing the most discrepancy."

So in the same conversation the page was reworked and the feelings and talking poses were added (the plan's phase 3 page work, done early). Pushed as `poseedit2`.

## STATUS (replaces section 0 of the plan)

| Step | State |
|---|---|
| Page: walking, feelings (em_), talking (tk_) poses for the ten main people; one-flow design | DONE (`poseedit1`, `poseedit2`) |
| APPLY: bake Tom's checked poses into the game, FEELINGS AND TALKING FIRST, then walking | NEXT |
| Battle, KO, extra, story poses (plan phase 4) | not started |
| Ability and Tombo frames (plan phase 5) | not started |
| Townsfolk, Michael, Nara, Cathy, young Boppy, Jojo's feelings; retire HEAD SIZES (plan phase 6) | not started |

## The page as it is now (replaces sections 2.2, 2.3, 5 and 6 of the plan)

| Thing | Now |
|---|---|
| Lines | TWO per pose: TOP (skull) and CHIN. No feet line: feet = the bottom of the cut picture. |
| Flow | Pick person > set (WALKING, FEELINGS, TALKING) > pose in the strip. The picture is always zoomed on the head. Drag the lines (or pick one and use the arrows). Tap LINES ARE RIGHT: the pose is "checked" and moves to the next unchecked one. |
| Sizing | No modes, no auto buttons. A checked pose is sized by rule. An unchecked pose stays as in the game now. |
| Result picture | Standing pose (the guide), this pose in the game now, this pose resized, plus one sentence: head N% too small or big against the target. |
| Fine tune | Folded away: Head and Body, smaller or bigger in 2 percent steps (`hAdj`, `fAdj`, multipliers on the rule), Back to automatic, Leave this pose as it is in the game (unchecks it). |
| EVERYONE tab | Cast in any one pose (select list), head row, Height (ft, in) and Head target (percent of Tom's) for the picked person. |
| Removed | Feet line, Mark and Size steps, AUTO SIZE buttons, Figure and Head sliders, LINE-UP tab, modes `now/auto/set`. |
| Walking steps | Follow their standing pose (grey dot). "Mark this step by itself" sets `own`. |
| Help | The four-step how-to shows on first visit and behind the ? button. |

## Request file, version 2 (`data/pose-requests.json`)
`{version:2, saved, heights:{id:inches}, target:{id:percent}, frames:{id:{key:{sheet, top, chin, ok, hAdj?, fAdj?, own?, page?}}}}`
- `ok:true` = Tom checked the lines: apply this pose. `ok:false` or missing = lines moved but not checked: do NOT apply.
- `page:{f, h, a, headRows, wholeRows}` on checked poses = what the page computed (body multiplier, head multiplier, anchor row, results). The bake must reproduce it.
- Version 1 files (Tom's first save, 2026-11-14 21:11: one unchecked line on his front standing pose, TOP at 0.6) load fine: `tidy()` keeps top, chin, ok, hAdj, fAdj, own and drops the rest. NOTE: that TOP of 0.6 means Tom put his own skull top at the very top of the picture (he is bald). My proposal was 21 px. Respect his.
- His phone also keeps an unsaved copy (`aot-pose-draft`), which wins on load.

## The sizing rule as built (poses.html: `autoH`, `hairRows`, `bodyOf`, `autoF`, `size`, `span`)
Manifest gives per frame: `s0` (rows on screen per picture px of the body as the game draws it now, at the person's current height), `now:{f, h, anchor}`, `marks:{top, chin, feet}`. `S = s0 x R_new / R_manifest`. `tp` = 12.
- Head target `T` = Tom's front standing head (`(chin - top) x S x hAdj`) x target percent / 100. Adults default 100; Grace 80, Rose 69 (their share today).
- Head multiplier: `h = T / ((chin - top) x S)` x `hAdj`.
- Hair allowance (rows) = the person's front standing `top x S x h`: every pose of the person carries the same hair above the skull line.
- Body for one upright frame: `bodyOf = (R/S - hair/S - h x (chin - top + tp/2)) / (feet - chin - tp/2)`.
- Walking frame: `f = bodyOf(its own standing frame)`. Feelings and talking: `f = median of bodyOf over the set's upright frames` (feelings: happy, loving, surprised, proud, unimpressed; talking: tell, point), so the whole set shares one body size. Then x `fAdj`.
- Anchor `a` = Tom's chin line. Head above `a` at `h`, linear blend to `f` over 12 px below, body at `f`.
- Back and side standing poses can read up to about 0.6 row off the real height by the picture's own top, because they carry the front pose's hair allowance. That is by design.

## How the bakes size these poses today (fact, measured while building; this is what APPLY replaces)
| Set | Today | Where |
|---|---|---|
| Feelings | Each figure's head grown by the HEAD SIZES factor about a measured chin row (`emotion_chin.json`), strip written to `art/emotions/<id>.webp`; then ONE scale per person: rows per strip px = walk draw scale / (`EMO_HEAD[id]` x `hg` x walk atlas k) | `emotion_frames.py`, `bake_story_poses.py` (`EMO_HEAD`, `EMO_HG`, the `f = S['k'] / (EMO_HEAD x stand k)` line) |
| Talking | Head grown by `talk_frames.head_grow` (to the walk's head share) about a chin share; strip `art/talk/<id>.webp`; then the Telling figure is scaled to `EMO_H[id]` bake rows | `talk_frames.py`, `bake_story_poses.py` (`'talk': True` sets) |
| Walking | plan section 3 | `walk_sheet_frames.py` |
`manifest.py` (`story_sets`) reproduces these numbers without importing bake_story_poses (it parses `EMO_HEAD` and `EMO_H` from the file text). Check: the Telling figure comes out at the real height for all ten people.

Measured today with my rule-placed lines (Tom's lines will move these): feelings heads 7.3 to 10.2 rows, talking heads 6.5 to 12.1, Tom's standing head 10.9. That gap is what Tom sees.

## NEXT: the apply build (do it in this order)
1. `git show origin/main:data/pose-requests.json`. If no pose is checked (`ok:true`) for feelings or talking, ask Tom one line: has he checked poses and pressed SAVE. Handle first anything he reports about the page.
2. `tools/pose-editor/apply.py` + `pose_fit.py` + sources of truth `pose_marks.json`, `pose_size.json` (plan section 4). `apply` copies checked poses in, with the page numbers, and empties nothing Tom has not saved.
3. FEELINGS and TALKING first (Tom: "the most important thing"). Recommended method, least risk: keep the strip machinery. In `emotion_frames.bake` and `talk_frames.bake`, for a pose with an entry: grow the head about Tom's chin row by `h / f` (`EF.grow_frame_head`, which already keeps raised hands as painted), then resize the whole figure by `f x S / u`, where `u` is the one strip scale bake_story_poses will apply (so that after the strip scale the body is `f x S` rows per px). Poses with no entry keep today's code path byte for byte. `hg` and `EMO_HEAD` must then not be applied a second time to resized figures: simplest is to pre-divide. Never upscale beyond the source by more than 15 percent (list those poses for Tom instead).
4. Zero-change proof first (no entries = identical output), then parity with `page` numbers within 0.5 row, then `bake_story_poses.py` in the background (about 11 minutes; restore `art/chars/pipemo-story.webp` and `data/npc-poses.js` after), the three face bakes, `pose-facing-apply.py --check`, bump `EMO_V` and `TALK_V`.
5. Look: `reaction_test.py` frames with a mood line and a talking line next to a standing person, portrait and landscape, before and after, for every person applied.
6. Then walking (plan phase 2 as written, with this file's formulas and two lines instead of three).
7. After any apply run `python3 tools/pose-editor/manifest.py` so "in the game now" is true again. Its `now` for applied poses must come from pose_size.json.

## Known weak spots to tell the next session
- My first lines on feelings and talking poses were placed by rule (chin from `emotion_chin.json`, top from the standing pose's skull share), not read one by one. Hair spikes (Justin), open laughing mouths (Tom happy) and tilted heads are off. Tom corrects them; do not "improve" a line he has checked.
- Jojo has no feelings sheet entry in `EMO_HEAD` and no talking sheet, so she has walking only.
- All 237 pictures load at once (11 MB). Fine on the test machine; if Tom reports a slow or reloading page on the phone, load only the picked person's pictures.
- Touch dragging has still not been tried on a real phone.
