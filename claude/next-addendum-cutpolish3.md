# cutpolish3 (2026-11-19): cutscene polish phase 3 (carry Rose, kitchen staging, hug, half-wall)

Plan: claude/cutscene-polish-plan.md section 3, phase 3. Repo detail: docs/CHANGES.md "cutpolish3". Next is phase 4 (the heist). CORRECTION 2026-11-19 (follow1): `hiddenSpot` now applies only while a scene runs; see claude/next-addendum-follow1.md. Where this page says it applies in every map, that is withdrawn.

## What was built

| Piece | Where | Fact |
|---|---|---|
| Ride flag | story flag `ride`; set by `SCENES.opening` right after Rose hops up; cleared by `CH1_DISMOUNT` | Saved with the flags. Chapter Select into chapter 1 starts with no flag. |
| rideSync, rideTick | engine/rose-ride.js | `rideSync` makes `rose.seat` match the flag (she must be in the party and not hidden). `rideTick` runs every frame (wrapper on `update` at the end of engine/story.js): a seated Rose is put on the tile Tom stands on or is walking to; outside scenes and fights it also calls `rideSync` (so a fight, a load or a map change reseats her). Inside a scene the scene's own steps decide. |
| After a scene | engine/story.js `endIntro` wrapper | Reads who is seated before the shared clear, skips them in `followersWhereTheyStand` and in the endTrail layout, calls `rideSync` at the end. |
| Line order | engine/followers.js `lineIndex`, `movePlayer`, `followerToSpot` | A seated follower is not in the walking line; the next follower closes up. |
| Half-wall | engine/followers.js `hiddenSpot` | A follower stays on its last spot when its next spot is hidden by a painted cutout (`huddleHidden`) and its own tile is not. SCENES ONLY since follow1 (`intro.active`); in cutpolish3 it also ran in free walking, which froze the followers behind every tree and board in the Square. |
| Dismount | data/scenes.js `CH1_DISMOUNT(land)` | In ch1Theft after the walk-in: tr_kneel .22 s, tr_hopoff, hop 10 px over .3 s to `land` (8,10), flag cleared. A save with no ride flag: Rose walks in to (8,10) instead. |
| ch1Goal, ch1Ellie | data/scenes.js | ch1Goal ends with Tom and Grace walking to (16,22) and (17,22) with Rose on his shoulders. ch1Ellie no longer places Rose. |
| Kitchen staging | data/scenes.js ch1Theft | Deedee (7,9) faces right. Tom (9,9) faces left, Grace (10,10) faces left, Rose lands (8,10). All turn right for Boppy (13,10). Tom walks to (12,6) facing up for THE DOOR FRAME, then back to (9,9) while the Mudling oozes in (parallel `all`). Knock targets unchanged. |
| TATA bubble | engine/intro.js `drawIntroWorld` | y = (player.y + .9) tiles minus 34 px (low, on the girls' rows). |
| Hug | engine/intro.js `intro.hug`, `hugStep`, `hugEndStep`; engine/town-render.js `hugSway` | Sway about 2.5 px at 2.2 rad/s on Tom's hg_group pose; a heart every 1.6 s. `hugEndStep` now sits between Rose's two lines; her two lines are two talk steps. Her second line runs in an `all` with two 8 px hops. |
| Test | tools/cut_natural_test.py | Sets the `ride` flag for the row and kitchen runs. New fails: Rose not seated after open or row; seated Rose more than 1 tile from Tom; Rose riding at Deedee's first line or after the kitchen scene; Rose on Tom's tile at the first line; Rose hidden in the kitchen. A seated Rose may share Tom's tile. |
| Script index | docs/script-convos.tsv | ch1Ellie 7, ch1Theft 12 and 50 (steps moved). |

## Measured

Opening, Row and kitchen pass in portrait and landscape (FAILS: []). Kitchen: Rose at Deedee's first line is on the ground at (8,10), Tom at (9,9), flag cleared; seated Rose was never more than a tile from Tom in the opening or on the Row.

## Not done, and things to know

- Mood and talking paintings are still front-facing paintings; Tom facing left uses the left-leaning versions through `pose-facing`. Nothing gates on facing (Tom's 11-12 rule). Look at the "Hi, Mom" frame on a phone: Tom still reads as facing the camera a little. If Tom reports it, the fix is art (a side-view mood sheet), not code.
- (12,6) for the door frame walk was chosen from the map and the painting (hall arch at tiles 12 and 13, row 3). Tom appears small behind the sofa end there; Tom has not yet judged it.
- If a follower seems stuck behind scenery during a SCENE, check `huddleHidden` for that tile and the zone's `base`. In free walking `hiddenSpot` does nothing (follow1).
- The Pose Editor and heist items (phases 4 and 5) are untouched.

## For phase 4

Read plan section 3 "Phase 4". The kitchen run now starts the heist with Tom at (9,9), Grace (10,10), Rose (8,10), Deedee (7,9). Phase 4 changes Mudling entry, `{cam}` with a `time`, knock targets, shock poses, the empty-counter patch and footprints.
