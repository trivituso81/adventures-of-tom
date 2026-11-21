# ch10vance1 (2026-11-12 15:00 to ~16:30, main 648250c): Julian painted, Gate Zero ending restaged. DONE and pushed, waiting on Tom's phone check. Plane art waiting on Generate.

Tom 14:50: in chapter 10, Julian was the old pixel frame, appeared and disappeared from the same spot, then Tom noticed a card on the podium on the other side of the screen. Tom 15:00: "Go" on the proposal.

## What was wrong (fact)
| Problem | Cause |
|---|---|
| Pixel Julian | Every Long coat spawn used `look:'longcoat'` = `LONGCOAT_NPC` (old traced pixel set). Three spawns: ch5 school (data/scenes.js ~1685), ch10 Gate Zero (`SCENES.ch10AfterBoss`), ch11 Gate Infinity (`SCENES.ch11Vance`, data/scenes-p2.js). |
| Painted walk sheets swapped | `tools/sprite-bake/src/vance-walk-v1.png` was grey Marlowe (NOTES: LESS clipboard), `marlowe-walk-v1.png` was Julian (coat, hat). Swapped at install 10-29. |
| Pops in and out | Spawned at (16,4), one step, despawn. |
| Podium | Card read from across the room; Julian never went near the podium (4..6, 3..4). |
| Plane never leaves | The plane is painted into art/gatezero.webp; the code plane (`CH10_PLANE`) draws only when there is no plate. |

## What was done (fact, pushed in a4f1a3b + 648250c, tag ch10vance1)
- Source sheets swapped back; heights Julian 6'1" = 43 rows, Marlowe 5'10" = 41 (CAST in bake_townsfolk.py). No-change rebake first was byte for byte; after: only vance-ow.webp and marlowe-ow.webp changed. Talk faces rebaked (`NECK_SET` key 'vance' moved to 'marlowe' in bake_talk_faces.py and emotion_frames.py). bake_story_poses.py rerun (vanceemo-story, marloweemo-story, data/npc-poses.js).
- All three Long coat spawns use look `vance` (painted `OW.vance`). Purged `LONGCOAT_NPC`, `longcoat` villager palette, npc-prompts look (grep 0). 'long coat' -> npc_vance in DIALOG_PORTRAIT_IDS.
- New scene steps: `{fadeActor:name,to,time}`, `spawn` takes `fade:0`; `a.fade` drawn in drawActor (engine/town-render.js).
- `SCENES.ch10AfterBoss`: camera to (13.5,5.5); Julian fades in at (16,4) with door sound; Grace "There's a man"; walks `CH10_COAT_PATH` (row 5 to (7,4)); faces podium; `CH10_CARD` twinkle + ding; turns, bow (`ch10Bow`, two dips); Grace "tipping his hat"; walks back `CH10_COAT_PATH_BACK`; fades out in the doorway; despawn; camera back to Tom; narration; Amy; Tom walks to (7,4), faces left, twinkle stops, reads. `ch10WatchCoat` turns the family and moves the camera with him. Card stays drawn on the counter (Gate Zero map effects). No spoken line changed.
- Tested: reaction_test with FIN=1, cases /tmp only (`ch:10, map:gatezero, scenes:["ch10AfterBoss"], party tom grace rose amy, start [9,7,"up"]`, portrait and `layout:"landscape"`), frames viewed: walk, glint, bow, return and Tom at the podium all on screen. townsfolk_test, unused_voice, smoke pass.
- Known (minor, fact): during Tom's two reading lines his mood pose turns him to face the camera (emotion system), not the podium.

## Waiting on Tom: two Art Library entries (group Airport)
- `room-gatezero-noplane`: the plate with the airplane removed. `room-gatezero-plane`: the airplane alone on magenta, same place and size. Builder tools/art-library/gatezero-plane-prompts.js. Same edit method as the approved room-gatezero-cut1..3.
- Install when both are approved (check: same canvas as art/gatezero.webp 1280 x 896 after scaling, everything else unchanged, plane whole): key the plane from magenta into art/props/gatezero-plane.webp; empty plate as a second plate variant (e.g. art/gatezero-empty.webp) chosen by `plateFor` when `ch10-gone` or chapter > 10, or while the plane is rolling; replace the code plane in the `STORY_MAPFX` gatezero block (data/scenes.js, `CH10_PLANE`) with the plane image sliding left out of the window (clip to the window band, ease in over ~3 s) drawn between the plate and the window frames (needs the frames as a cutout or accept the plane drawn under a frames layer: check how plate fg layers work, `PLATE_BEHIND`, fgSrc). Purge the old code-drawn plane (grep 0). Test with the same reaction_test case.
