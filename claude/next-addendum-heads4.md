# heads4 and heads5 (2026-11-12, main 9e6a953): Tom's saved head sizes and welcome positions

Read with claude/next.md. (next.md header still says main c474434 and lists only heads4; heads5 below is newer.)

## Facts
- Tom's message 1: "Updated welcome positions and head sizes." Message 2 (07:51): "one more round, do again".
- Welcome positions: his 07:14 SAVE is already a commit on main (`data/welcome-layout.json`: `land` has Tom and Boppy; `duoland` has Michael, Olivia, Rose, Amy, Deedee, Boppy; `port` and `duoport` empty). Unchanged in round 2. Never touched by Claude.
- heads4: request commit asked Boppy .96 to 1.10 and Michael 1.35 (first factor). Baked with `head_adjust.py apply-requests` (6 min 45 s), talk faces rebaked, `TALK_V` heads4, pushed (c474434).
- heads5 (07:49 request commit 0be9052): Justin 1.25 to 1.18. Same procedure (about 4 min), `bake_talk_faces.py justin`, `TALK_V` heads5, `walk-scale.js` moved slightly (justin k .8423 to .8443, from the generator), smoke FAILS [], pushed (9e6a953).
- Looked at: welcome screen Duo sideways and phone portrait after heads5 (shots /tmp/wl). Looked fine.
- NOT looked at: a real phone, these heads in a game map or dialogue, Michael's profile edge at 1.35 (Lachlan's hair behind his head is inpainted by `fill_behind`).

## If Tom reports
| He says | Do |
|---|---|
| Michael's head edge looks wrong at 1.35 | adjust that view's `POLY` in `tools/sprite-bake/michael_head.py`, `bake_michael.py --contact /tmp/c.png`, look, then `walk_splice.py michael` |
| "do again" / new sizes or positions saved | `git fetch`, read the newest "Head sizes requested" commit and `data/head-requests.json`; positions are already live. Then `head_adjust.py apply-requests`, `bake_talk_faces.py <ids>`, bump `TALK_V`, smoke, push |
