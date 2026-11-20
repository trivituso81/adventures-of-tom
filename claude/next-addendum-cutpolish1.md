# cutpolish1 (2026-11-19, main 4bc48f5): cutscene polish phase 1, scene lifecycle

Plan: claude/cutscene-polish-plan.md (phase 1 of 5). Repo detail: docs/CHANGES.md "cutpolish1". Chat: https://claude.ai/code/session_01RXeukEvTQahQ3J3gZ64XxC

## What was built (all as the plan's phase 1 table, plus two fixes found in testing)

| Piece | Where |
|---|---|
| `who.sceneWalk` skips the townsfolk no-go list and Tom's reserved tile in `canOccupy` | engine/battle-draw.js |
| `sceneRoute(a,x,y)` sets `sceneWalk` around `findPath`; `routeTo` (data/scenes.js) calls it | engine/story.js, data/scenes.js |
| `queueToast(text,sec,low)`: one after another, at least 2.5 s each, waits while a scene, line, fight or map change is on and for 0.8 s after (so it never slips into the gap between two scenes) | engine/world.js |
| Movement tutorial, both Goal popups and the first-visit souvenir use the queue (`grantItem(id,true)`); the 3.4 s timer is gone | engine/intro.js, data/scenes.js, engine/battle-draw.js, data/party.js |
| FAST and SKIP hide for `intro.showcase` and `intro.card`; `cutscene` class lingers 250 ms; class `talking` while a box is open; `html.cutscene:not(.talking) #action-wrap` hidden | engine/skip.js, index.html |
| Pose hold: speaker keeps the pose up to 0.6 s of scene time after the box closes (`emoHold`) | engine/emotions.js |
| `followersWhereTheyStand()`: no `endTrail` and every follower on its own walkable tile within 3 tiles of Tom, none hidden: they stay and the trail is built from where they stand | engine/story.js |
| `tools/cut_natural_test.py` | tools/ |

Found while testing (not in the plan): (1) the queued toast released in the 0.1 s gap between the opening's `endIntro` and ch1Goal, so it showed during ch1Goal in landscape: fixed by the 0.8 s settle; (2) the toast timer runs before intro.js loads, so it reads `intro` inside try/catch.

## Measured (natural play, 430 x 860 and 860 x 430, main 4bc48f5)

| Check | Before (audit) | Now |
|---|---|---|
| Opening: girls' tiles moved during the walk-out | 0 | Grace 7 tiles, Rose 6 |
| Kitchen: girls on the doormat | 27 s stacked | both walk in (4 and 4 tiles), Rose's last walk lands (11,10) |
| Goal popup | 0.9 s, replaced by the pepper | tutorial 4 s, then Goal 4.5 s; pepper waits behind them |
| Arrows or (A) button in a scene | (A) showed between lines | none in any sample |
| Last line to scene end | not measured | open 4.2 s, theft 2.7 s, row 0.1 s (limit 5) |
| Shared tile after a scene | both girls on Tom's tile | all distinct |
| Pose held 0.3 s after a line closed | ~0 | open 6 of 7, theft 0 or 1 of 1 |

Smoke FAILS: []. Test: `python3 -I tools/cut_natural_test.py /tmp/cn open row theft` (about 4 min, add `LAYOUT=landscape`); needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH.

## Not done, by plan (phases 2 to 5)

Phase 2 preload and sizes (blurry poses, size jumps, foot shadow, Pose Editor apply step; Grace, Rose, Deedee sizes wait on Tom's lines), phase 3 carrying Rose, facing and staging, phase 4 the heist, phase 5 breathing and listener reactions. Board card c-cutpolish2 holds the phase 2 prompt. Items 1c (FAST/SKIP stuck) still not reproduced: the harness covers it (scene ends within 5 s of the last line).

## Known and open

- The `row` run had no held poses and no party walks (ch1Amy has none): its followers stand on distinct tiles beside Tom now, so 3b is fixed there, but the pose-hold path is only exercised by the opening and the theft scene.
- 31 follower routes use `routeTo` (grace 7, rose 8, nara 9, tnb 5, deedee 1, boppy 1); only chapter 1 was played. `routeBeside` (chapter 3) and two direct `findPath` walks (chapter 3 Rose, Nara at the snack table) were left alone on purpose.
- The boot toast of a new game (engine/draw.js 417) repeats the tutorial text; the test ignores it.
