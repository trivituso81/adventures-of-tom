# Battle animation audit (2026-10-31, build jsolo1, commit 2fe188e)

Scope: all 121 character moves (157 recordings with kind-target variants), all 51 Tombos, Family Finishes and Director's Cuts, the non-move states (hit, KO, victory, defeat, flee) and the enemy side (86 monsters). Every move was fired live in a Battle Lab fight at speed 1 and recorded. No page errors, median 60 fps.

## Bottom line

Moves and Tombos are layered and mostly fine (every move has at least 2 effect layers, median 6; the actor changes pose about 3.8 times a second). The thin spots are not in the move scripts. They are in the shared systems every fight uses: the party hit reaction, the enemy attack, victory, KO, flee and defeat. A smaller set of moves and Tombos freeze for 1 to 4 seconds mid-move.

## Findings, ranked by how often the player sees it

| # | Gap | Evidence | Suggested fix | Cost |
|---|---|---|---|---|
| 1 | Party members have no hit reaction | Enemy hit on Grace: her pose stayed `idle` the whole time (only a 0.35s shake and a white flash). Every character already has a `hurtPose` frame, used only in cutscenes (engine/story.js). Under 25% HP they kneel, which is the only hurt look. | In `b2HitParty` (engine/battle2.js) set `fx.poseK='hurtPose'` and `fx.pose=.35` for the target. battle-draw.js already honors both. Look at each character's `hurtPose` first; replace any that look wrong. | Small |
| 2 | Every enemy attack is the same lunge | 84 of 86 monsters have 3 attack text lines, all animated as one forward lunge (`e.lunge=.55`). 63 painted enemies have only 2 attack frames, 22 have 4, none has a hold before the lunge. Idle is one frame plus a bob. Death is a shrink and flash. `deadletter` has no painted frames at all. | (a) Hold attack frame 1 for about 250 ms before the lunge, all enemies, code only. (b) Per-attack variation by tinting or shaking differently. (c) Paint frames for `deadletter`. | (a) small, (b) medium, (c) art |
| 3 | Victory, KO, flee and defeat are one-size | Victory is 1.6s and Tom, Grace, Rose run the identical celeb/celeb/celeb/idle cycle on the same beat (Amy, Deedee, Boppy, TNB, Justin have a 2-frame `cheer`). KO is one lying-down frame that appears in 0.17s, then stars. Flee is only the line "Everyone backs away slowly." and a sound. Defeat is a line and a 1.8s wait. | Per-character victory poses from poses they already have; a 3-frame KO drop; run frames on flee. | Medium |
| 4 | Mid-move freezes (see table below) | Quiet stretch of 1.0 to 3.8s: nothing moves, no new effect, canvas change below idle bobbing. | Add one reaction or beat inside each window (enemy wobble, second pose, prop twitch). | Small each |
| 5 | Pose budget is very uneven by character | See table below. Nara reuses 7 poses for all 14 moves. | Paint move-specific poses for Nara, then Tom and Boppy. | Art |
| 6 | Some Director's Cuts may look like their Primary | boppy1_dc, nara3_dc, ff2_dc, ff4_dc use exactly the same set of scene layers as the Primary (the animation code differs, so this may be fine). Not checked by eye. | Watch each pair once. | Small |

## Mid-move freezes

Verified by eye = frames captured inside the window and compared.

| Move | Longest quiet | Status | What is on screen |
|---|---|---|---|
| rose.bedtime_story (and kind) | 3.8s (about 2.2 to 6.0s) | Verified | Night scene, Tom and the girls sit holding a storybook, same frame |
| rose1_dc (Tombo) | 2.2s | Verified | Rose on Tom's shoulders, a bread thought bubble, nothing moves |
| nara.stranger_alert | 1.2s | Verified | Gate and fence up, Nara barking, enemies frozen box, no motion |
| tom.button_mash | 1.3s | Verified | After the BONK pop, Tom holds the pose, enemies do not react |
| tnb.mug_toss | 1.25s | Verified | Mug sits on the enemy with a small label |
| boppy1_dc (Tombo) | 1.0 to 2.0s | Verified, may be intentional | "SHHH!" on Cattail Pier, fishing pose held |
| tom.sourdough_snob, tom.skincare_10, nara.puppy_eyes, nara.doodle_fluff, tom.seat_1a, tnb.throw_down | 1.1 to 1.4s | Not viewed | Flagged by the detector only |
| amy3, tnb3, ff4, deedee1, rose3, ff1 (Tombos) | 1.0 to 1.4s | Not viewed | Flagged by the detector only |
| deedee.beanie_master, grace3 (Tombo) | 1.1s, 1.4s | False positives | A slow green cloud and a growing dumpling keep moving; the detector misses slow drift |

Counts: 33 of 121 moves and 21 of 51 Tombos have a quiet stretch of 0.7s or more; 11 moves and 9 Tombos have 1.0s or more.

## Pose budget per character (distinct painted or pixel frames drawn across the whole kit)

| Character | Moves | Distinct poses | Used by only one move | Median non-idle poses per move | Note |
|---|---|---|---|---|---|
| Nara | 14 | 7 | 0 | 4 | Sprite has only 25 generic keys; every move shares them |
| Tom | 14 | 17 | 9 | 4.5 | `defend` frame is drawn in 13 of 14 moves as a stand-in |
| TNB | 14 | 24 | 12 | 5 | |
| Boppy | 14 | 26 | 16 | 6 | |
| Rose | 14 | 39 | 33 | 4 | Many unique poses, but short holds |
| Amy | 14 | 39 | 25 | 6 | |
| Deedee | 14 | 51 | 40 | 7 | |
| Grace | 14 | 61 | 50 | 4 | Tumble frames inflate the count |
| Justin | 9 | 133 | 130 | 16 | Painted per-move sheets; the benchmark |

Run frames `run1` and `run2` open almost every move for everyone (the walk up to the enemy).

## Tombos and Finishes

51 rows: 22 Primary, 25 Director's Cut, 4 Family Finish. Duration 7.1 to 11.9s (median 8.7s). Median 6 effect layers, minimum 3.

## Method and limits

Recorder hooks `drawSprite` to log which named pose the actor shows each frame, samples a 144x81 copy of the battle canvas every frame, and counts new scenes, props and texts. A "quiet stretch" is time with no pose or position change, no new scene, prop or text, and canvas change below idle bobbing (about 160 changed pixels). The last 0.8s of each move (closing message) is ignored. Limits: slow drifting effects can read as quiet (two false positives above); the detector says nothing about whether an animation looks good. Scene and prop counters were wrong in the first pass (a global-scope bug in the recorder) and the whole run was redone.

## Re-run

Scripts in this Project: `claude/battle_anim_audit.py` (records), `claude/battle_anim_analyze.py` (ranks). From the repo root with a Playwright Chromium:
`python3 battle_anim_audit.py moves tom,grace,rose,amy out.json`, `python3 battle_anim_audit.py tombos 0:26 out.json`, then `python3 battle_anim_analyze.py move out.json` (set `AUDIT_DIR` to where the json files are). Compare before and after a fix.
