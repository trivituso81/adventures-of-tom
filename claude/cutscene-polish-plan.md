# Cutscene polish: repo diagnostic and phased patch spec (cutpolish0, 2026-11-19)

Read-only session. No repo file was edited and nothing was pushed. Checked against main aefd6b6 (b3s7); main has since moved to a19ec9f (board1), which touched none of the files below except cache tags in index.html.

How it was checked: the code was read, then three scenes were played in a headless browser at phone size (430 x 860, portrait) the way a player plays them: no SKIP, no FAST, Enter pressed only after a line finished typing. Engine state was logged every 100 ms. Harness: claude/cutscene-polish/cut_natural_run.py (modes `open`, `row`, `theft`). Not checked: landscape, a real iPhone, touch input, sound.

FIRST THING THE PHASE 1 SESSION DOES (this session could not, it was read-only): add a board card for this work to data/board.json and one line to claude/next.md under ORDER NOW pointing at this file.

## 0. The short version

The video this audit came from is older than main. It shows Rose's cut line "Come on, Tata! Let's go!" (removed by roselets1) and kitchen problems that roofnpc2 already fixed. So each of the 30 items was re-tested on main. Result: 11 are already fixed or no longer happen (3 of those left a new defect behind), 13 are confirmed still wrong, 5 are partly done or need art, and 1 could not be reproduced. Three of the requested fixes collide with a standing rule of Tom's.

| # | Audit item | On main today | Evidence and cause |
|---|---|---|---|
| 1a | Grace and Rose stranded at Taxi Co. while Tom walks off | CONFIRMED | Tom walked (24,22) to (16,22) alone for 3.6 s; the girls stood at (23,21) and (23,23), then jumped onto his tile when the scene ended. Cause: scene walks for party members use the townsfolk path rules. `canOccupy` (engine/battle-draw.js 454 to 457) refuses anyone who is not the player every townsfolk no-go tile and Tom's reserved tile. The roofnpc1 roof list plus the lane list close a band at x 18 to 22 on rows 21 to 23, so `routeTo('grace',17,22)` returns 0 steps (7 steps with the list ignored). |
| 1b | Movement tutorial toast missing on natural play | CONFIRMED | engine/intro.js 196 shows it from a 3.4 s wall-clock timer that is dropped if a line is open. ch1Goal's first line is open then. With SKIP no line is open, so it shows. |
| 1c | FAST and SKIP stuck, player trapped until SKIP | NOT REPRODUCED | Scene ended and controls came back about 4 s after Grace's last line closed. `cutWatchdog` (engine/skip.js 71 to 78) is in. Keep as a regression test. |
| 1d | D-pad flashing between lines | FIXED (roofnpc2) | Arrows hidden in every sample of all three scenes. |
| 1e | (A) button and "HOLD + SLIDE" caption showing between lines | CONFIRMED | Nothing hides `#action-wrap` in a scene; its label reads "..." (engine/draw.js 123). |
| 1f | Speakers drop to a plain stand between lines | CONFIRMED | Every `{talk}` step is its own dialogue box; closing it clears the pose (engine/emotions.js 179). |
| 1g | FAST and SKIP over SPARKLING DIAMOND GOLD SOUP DUMPLING SQUISHY | CONFIRMED | engine/skip.js 97 hides them for `closeup.active` only; the squishy is `intro.showcase`. Over THE DOOR FRAME: fixed. |
| 1h | Grace and Rose re-walking doormat to island | FIXED, new defect in its place | They now never walk in: both stand stacked on the doormat (8,14) for the whole greeting (27 s in the run). Same cause as 1a: Tom reserves (8,13) first and the door-front tiles (7,14) and (9,14) are no-go. |
| 1i | Townsfolk walking through scenes, on roofs and rims | FIXED (roofnpc1, roofnpc2) | They stand still in scenes; `noGoRoof` lists. Those lists are what strands the party in 1a. |
| 2a | Poses blurry for 300 to 500 ms | CONFIRMED, and the roofnpc2 fix does not work | Blur is the small row-string copy drawn while the painted sheet loads. Sheets of people not in the party (Deedee, Boppy) are released when not drawn for 20 s (engine/painted.js 139 to 149), and a sheet that was loaded but never drawn counts as idle since page load, so it is dropped at the next 1.5 s tick. In the kitchen run Deedee's and Boppy's sheets were dropped and reloaded 7 times mid-scene, including right as `em_surprised` and Boppy's `tk_tell` were needed. `paintedLoad` (30 to 36) also flips ready on load with no `decode()`. |
| 2b | 10 to 15 percent size jumps | CONFIRMED | Visible figure height against the standing walk frame: Tom 90.5 to 104.8 percent, Boppy 85.7 to 104.8, Deedee 92.9 to 100, Grace 94.9 to 102.6, Rose 94.3 to 105.7. Feet are on the bottom row in every pose except Rose `em_happy` (1 row up). The foot shadow is sized from the pose's own width (engine/town-render.js about 100), so a wide pose (Tom `tk_point`, 200 percent) balloons it. |
| 3a | Two Roses on the Row | NOT ON MAIN, new defect | roofnpc1 takes Rose down in the Square, so on the Row she walks beside Tom while he says "I'm carrying a child" and Aunt Ellie says "you'll stay up there, please". |
| 3b | Both girls vanish after a scene | CONFIRMED | At the end of ch1Amy both snap onto Tom's tile (`placeFollowers`, engine/story.js 1265). Only ch1Theft sets `intro.endTrail`. |
| 3c | Solo Tom pose replacing the carry picture | FIXED | `tr_sit` held through all of ch1Goal; `emoActorFor` skips Tom while Rose rides (engine/emotions.js 29). |
| 3d | Tom turns to the camera for "Hi, Mom" | CONFIRMED | He stands at (8,10) facing up; the line resolves to `tk_ask`, a front painting. No back-view mood or talking painting exists for anyone; mirroring only handles left and right (engine/story.js 357 to 377). |
| 3e | "Oof" hunch held too long | NOT ON MAIN | The stretch plays before the line; during it Tom is `em_happy`. |
| 3f | TATA!!! bubble position | PARTLY | It sits on the left screen edge at Tom's row and glides to the girls (engine/intro.js 222 to 230). |
| 3g | Group hug frozen | CONFIRMED | `hg_group` is one painting held under four lines (6.8 s at test pace, about 13 s with voice); hearts only in the first 0.8 s. Rose says "Tata, up! Up up up!" from inside it. |
| 3h | Grace's cheerful shrug on "You are slow" | FIXED | Verified: she shows `em_unimpressed`. The shrug is her `tk_tell`; that line's talk column is blank today, so the mood wins. |
| 3i | "Got Boppy's Pepper" mid-greeting | FIXED, new defect | It now waits for the scene, then lands 0.9 s after the goal popup and replaces it. The toast is one slot with no queue (engine/world.js 334). |
| 3j | Tom walks to the door frame | PARTLY | He turns right, then up, and stays at (8,10). |
| 3k | Boppy's stomach wince on "Gently. The stomach." | NO ART | That line is a press-A chat (data/maps-le.js 1532), mood `loving` for the whole line. No stomach pose exists. |
| 3l | Rose behind the half-wall | OPEN | Row 11 of the kitchen is walkable behind the wall. |
| 4a | Mudling pops up inside Tom | FIXED, see 1h | It fades in on (8,14), which is where the girls are still standing. |
| 4b | One-frame camera snap | NOT ON MAIN | The camera eases (engine/overworld.js 463). But in portrait the island is half off the left edge during the grab. |
| 4c | Knockdown cluster hidden | CONFIRMED | Rose lands at (5.8,10.6), half behind the left fern; Grace at (10.5,10.4) by the chairs. |
| 4d | Deedee and Boppy drop their shock | CONFIRMED | `em_surprised` is cleared after 0.3 s (data/scenes.js about 194 to 197). Deedee stands smiling through "AHHH! DEEDEE!". |
| 4e | Muffins still on the island after the theft | CONFIRMED | Painted in. See section 2. |
| 4f | Standing up before the floor lines | FIXED (roofnpc2) | All three stay down through the three lines. |
| 5 | Listener reactions on cue words | BUILT, thin in chapter 1 | The whole chain exists. Rows in chapter 1: opening 15, ch1Theft 4, ch1Pond 6, ch1Goal 0, ch1Amy 0, ch1Ellie 0. Breathing, squash, talk bob, hops and pips do not exist. |

Three collisions with standing rules, and the call made for each:

| Requested | Standing rule | Call |
|---|---|---|
| Speakers never face the camera unless tagged | Tom 2026-11-12: a mood pose is shown in full whichever way the person faces; never gate on facing | Keep the rule. Fix by staging: people who talk stand side by side and face left or right, where the paintings already mirror. |
| Automatic height normalizing from the trimmed outline | Tom 2026-11-14: automatic sizing kept missing; he sets the skull and chin lines himself in the Pose Editor | Do not build outline normalizing. A raised arm makes a correct pose 124 percent tall and a crouch 76 percent, so the outline is the wrong measure. Build the Pose Editor's unbuilt "apply" step instead. |
| Rose carried from the Square to the kitchen | roofnpc1 took her down in the Square | Carry her. The locked lines say she is up there. This reverses one roofnpc1 change. |

## 1. File and function map

| Area | File | Lines | Names |
|---|---|---|---|
| Scene runner | engine/intro.js | 6, 95 to 102, 105 to 128, 201 to 217 | `intro` state; `endIntro`; step helpers `S.wait call talk walk hop all seq`; `updateIntro` |
| Step types | engine/story.js | 276 to 356 | `SCENE_OPS`: wait, call, talk, walk, face, place, hop, cam, zoom, pose, knock, getup, show, hide, fadeActor, fade, flag, battle, give, join, leave, toast, sfx, save, noGo, spawn, despawn, hold, all, seq, if |
| Step types elsewhere | engine/scene-props.js 123 to 131; data/closeup-ch1.js 12 to 17; engine/story.js 874 | | `prop`, `propTo`, `note`; `ch1Reveal` (the door frame); `clearout`, `gather`, `huddle`, `approach`, `around` |
| Start of a scene | engine/story.js | 1045 to 1097 | `stageScript`, `compileScene`, `playScene` (adds `{clearout}` and huddles; `{noHuddle}`; ends with `endIntro` unless `opts.keep`) |
| Natural end | engine/emotions.js 181; engine/story.js 1250 to 1266; engine/intro.js 95 to 102 | | `endIntro` chain: clear poses, release camera and held NPCs, `intro.endTrail` or `placeFollowers` |
| SKIP and FAST | engine/skip.js | 9 to 67 | `cut`, `cutsceneOn`, `cutSkip`, `cutFF`, wrapped `updateIntro` (SKIP runs up to 600 steps of 0.1 s in one frame through the same steps, so both paths end in the same `endIntro`) |
| Opening hand-off | engine/intro.js 184 to 198; engine/story.js 1178 to 1190; engine/overworld.js 290 to 304 | | `finishOpening` (two 4 s timers, the 3.4 s toast timer, autosave); `storyTriggers`; `update` |
| HUD: D-pad, minimap | index.html about 1063 and 1079; engine/skip.js 99 | | `html.cutscene` class |
| HUD: (A) button | index.html 48 to 51, 1479; engine/draw.js 115 to 123 | | `#action-wrap`, `updateUI` |
| HUD: FAST and SKIP | engine/skip.js 80 to 104; index.html 1059 | | `#cut-ctrl`, `refreshCutUI` |
| HUD: dialogue box | engine/overworld.js 64 to 89, 125 to 153 | | `openDialog`, `advanceDialog` |
| HUD: modals | engine/intro.js 265 to 283; engine/closeup.js | | `intro.showcase` (squishy); `closeup.active`, `closeupReveal` |
| HUD: toasts, banners | engine/world.js 334 to 337; engine/draw.js 116; engine/party-banner.js | | `showToast` (one slot), `toastUntil`, `partyBanner` |
| Pose resolver | engine/emotions.js 135 to 166; engine/story.js 357 to 399; engine/town-render.js 86 to 110 | | `emoApply`, `talkTypeOf`, `poseFacingWant`, `scenePoseDraw`, `drawSheetActor` |
| Pose data | data/story-poses.js; data/story-poses-use.js 5 to 16; data/emotion-moods.js; data/talk-types.js; data/pose-facing.js | | `STORY_POSES_SRC`, `STORY_POSES`, `storyPosesLoad`, `EMOTION_MOODS`, `TALK_TYPES`, `POSE_FACING` |
| Image loader and cache | engine/painted.js | 14 to 36, 80 to 99, 113 to 150 | `ART_V`, `paintedAtlas`, `paintedLoad`, `paintedCanvas`, `paintedWanted`, `paintedTick`, `PAINTED_IDLE` |
| Rose on Tom's shoulders | engine/rose-ride.js 102 to 105; data/tomride-use.js; engine/intro.js 101, 185 to 191; data/scenes.js 37 to 40, 80 to 91 | | `roseRider`, `OW.tomRide`, the `seat` field, `CH1_DISMOUNT`. `seat` is not saved and `endIntro` clears it. |
| Followers | engine/followers.js 14 to 36, 40 to 52, 238 to 242 | | `movePlayer`, `trail`, `followerToSpot`, `placeFollowers` |
| Follower parking in scenes | engine/story.js 543 to 826, 892 to 953 | | `huddleClear`, `huddleHidden` (554), `huddleStep` (780), `approachStep` (914) |
| Townsfolk movement | engine/battle-draw.js 449 to 460, 568 to 619, 621 to 655 | | `occupied`, `canOccupy`, `findPath`, `choosePath`, `updateNPCs`. There are no waypoint lists: a townsperson picks a random wander spot within its `roam` and paths to it. |
| Townsfolk data | data/maps-le.js | town 99 to 178 (no-go 138, roof 141, people 162); row 179 to 246 (212, 214, 232); grands 1471 to 1512 (walk map 1483 to 1499, no-go 1501, people 1502) | Square: Pip, Moss, Dot. Row: Gus, Bean. Kitchen: Deedee, Boppy. |
| Clearing extras from a scene | engine/story.js 836 to 876 | | `stageExtra`, `stageCast`, `stageShooOut`, `stageClearOut` |
| Chapter 1 scenes | data/scenes.js | opening 8 to 64; `routeTo` 67; ch1Goal 93 to 112; ch1Amy 115 to 125; ch1Ellie 128 to 149; ch1Theft 152 to 238 (door frame 165, heist 166 to 212); triggers 742 to 754; Boppy's seat rule 783 to 789 | |
| Heist pictures | engine/story.js 1286 to 1298; data/mudling-heist.js | | `mudlingHeistDraw`, `MUDLING_HEIST` |
| First-visit souvenir (the pepper) | engine/battle-draw.js 681 to 682; data/party.js 270 | | `souvenirs.grands='pepper'` |
| Save and load | engine/followers.js 139 to 152, 176 to 214; engine/story.js 1149 to 1156 | | `saveSnapshot`, `loadGame`; story flags are saved |
| Listener reactions | docs/emotion-reactions.tsv (column `at` holds the cue words); tools/reaction-apply.py 29; data/emotion-reactions.js; engine/emotions.js 35 to 114 | | `EMOTION_REACTIONS`, `REACTION_CHAPTERS` (1 and 2), `emoReact`, `emoCueReached`, `emoCueTick`, `emoPose` |
| Workshop format `<listener>: <mood> on "<cue>"` | script.html 197, 283, 298; tools/script-index/apply.py 355 to 365; tools/script-index/workshop.py | | Tom's edits arrive as `react` in data/script-edits.json and are written to the tsv |

## 2. Sprite and prop inventory

art/chars, the five people (file, size in KB):

| Who | Walk | Battle | Abilities | Knocked down | Mood poses | Talking poses | Scene poses |
|---|---|---|---|---|---|---|---|
| Tom | tom-ow 762 | tom-battle 804 | tom-poses 5,991 | tom-ko 23 | tomemo-story 663 | tomtalk-story 386 | tom-story 613 (stretch), hug-story 829, tomch4-story 394, tomch5-story 412, tomlift-story 101, tomnet-story 116 |
| Tom carrying Rose | tomride-ow 630 | tomride-battle 2,311 | | | | | tomride-story 691, tomride-hero 84, tomride-rose 157, rose-ride-ow 178, rose-ride-bt 74 |
| Grace | grace-ow 865 | grace-battle 1,021 | grace-ab 6,366, grace-wheel 1,346 | grace-ko 54 | graceemo-story 793 | gracetalk-story 411 | grace-story 764 (squishy) |
| Rose | rose-ow 811 | rose-battle 838, rose-battle-x 958 | rose-poses 5,822 | rose-ko 44 | roseemo-story 645 | rosetalk-story 314 | |
| Deedee | deedee-ow 707 | deedee-battle 923, deedee-extra 1,552 | deedee-ab 4,935 | deedee-ko 53 | deedeeemo-story 620 | deedeetalk-story 343 | |
| Boppy | boppy-ow 482 | boppy-battle 942, boppy-stock 661 | boppy-ab 4,871 | boppy-ko 36 | boppyemo-story 861 | boppytalk-story 518 | |

Every mood sheet holds the same 8 poses (happy, loving, sad, angry, scared, surprised, proud, unimpressed); every talking sheet holds 4 (tell, point, ask, answer).

Mudling: art/foes/mudling.webp (117 KB, battle), art/foes/mudling-heist.webp (442 KB, 16 frames: ooze_a, ooze_b, spot, windup, charge, shove, barrel, wobble, reach, grab, hug, glance, scurry_a, scurry_b, giggle, sneak), art/clips/mudling-*.webp (7 battle clips).

Kitchen: art/grands.webp and art/grands-fg.webp, both 1254 x 1254. The second is the cutout layer drawn over people who stand behind things (island top, sofa, stools, gate posts; `PLATE_BEHIND.grands`, engine/plate.js). The only separate prop is the muffin pan stand-in drawn by code (`SPK.muffinpan`, engine/scene-props.js 106, placed at tile 3.1, 7.1).

The five confirmations:

| Asked | Answer |
|---|---|
| Grace overworld `unimpressed` | EXISTS (graceemo-story.webp, `em_unimpressed`: dry look, hand on hip; her portrait is cut from the same painting). The shrug that fired was `tk_tell`. Main shows the right pose now. |
| Boppy stomach clutch or wince | DOES NOT EXIST in any sheet. Needs one new Art Library pose. |
| Tom, Grace, Rose knocked down | EXIST as borrowed battle frames: `hurtPose` in the air, the KO picture lying down (tom-ko, grace-ko, rose-ko), `kneel` getting up. No tumble made for the overworld. Good enough to keep. |
| Tom carrying Rose: variants or one walk sheet | One overworld walk sheet (down, up, side; stand and two steps each; right is the mirrored side) plus one 6 frame scene sheet (`tr_kneel`, `tr_lift`, `tr_cheer`, `tr_laugh`, `tr_sit`, `tr_hopoff`), all facing the camera. No mood or talking poses while carrying. Library entry `ch1-rose-shoulders` is a draft; `tomride-intro` was rejected. |
| Muffin tin: prop or painted | PAINTED, in both kitchen pictures, and it is not a tin. The island holds a pie on a stand, a cake under a glass dome and three plates of muffins (5, 4 and 4). |

Pixel boxes on the 1254 px kitchen picture (the same in both files; read off a 5x zoom, accurate to about 3 px):

| Thing | x | y | w | h |
|---|---|---|---|---|
| Plate of 5 muffins with its lace doily | 308 | 558 | 104 | 70 |
| Small plate, left (4 muffins) | 194 | 599 | 72 | 46 |
| Small plate, centre (4 muffins) | 266 | 602 | 84 | 45 |
| ONE PATCH covering all three plates and their shadows | 192 | 556 | 222 | 94 |
| Cake dome and its plate (keep) | 222 | 524 | 96 | 84 |
| Pie on its stand (keep) | 112 | 530 | 110 | 86 |
| Whole island top, about | 108 | 525 | 332 | 143 |

The cake plate's lower right rim (x 222 to 317, y 556 to 607) lies inside the patch box, so the patch picture must keep that rim. The patch has to be drawn in both layers.

Waiting in the Art Library as drafts (group Chapter 1 or Report fixes): `ch1-muffin-pan`, `ch1-muffin-pan-empty`, `ch1-muffin-papers`, `ch1-mudling-muffins`, `ch1-mudling-heist`. The 16 heist frames in the game show the Mudling with a pie tin.

## 3. The five phases

One phase per conversation. Tags cutpolish1 to cutpolish5. No dialogue text changes in any phase. Every phase ends with smoke, the natural-play harness, frames in portrait and landscape, docs/CHANGES.md, the board card and a push.

### Phase 1: scene lifecycle (no new art)

| File | Change |
|---|---|
| engine/battle-draw.js `canOccupy` 454 to 460 | A party member walking under a scene step (`who.sceneWalk`) skips the townsfolk no-go test and the "Tom's tile" test. Townsfolk rules stay as they are. |
| engine/story.js (new `sceneRoute`), data/scenes.js 67 `routeTo` | `routeTo` calls `sceneRoute`, which sets `sceneWalk` around `findPath`. Fixes 1a, 1h and the end of ch1Theft (Rose jumped 4 tiles to (11,10) because that target is a no-go tile). 31 follower routes use it game-wide (grace 7, rose 8, nara 9, tnb 5, deedee 1, boppy 1). |
| engine/world.js 334 | Add `queueToast(text,sec,low)`: toasts show one after another, each for its full time, and wait while a scene, a line or a fight is on. `showToast` stays for menus. |
| engine/intro.js 196; data/scenes.js 111 and 237; engine/battle-draw.js 681 to 682 | The movement tutorial, both goal popups and the souvenir use the queue. The 3.4 s timer goes. Fixes 1b and 3i. |
| engine/skip.js 93 to 102; index.html about 1079 | FAST and SKIP also hide for `intro.showcase` and `intro.card`. The `cutscene` class lingers 250 ms after a scene so the D-pad never blinks between two scenes. New class `talking` while a box is open; `html.cutscene:not(.talking) #action-wrap` is hidden. Fixes 1e and 1g. |
| engine/emotions.js 55 to 59, 179 to 182 | Inside a scene, the speaker keeps the pose for up to 0.6 s of scene time after the box closes, or until the next box opens or a walk, place, pose or knock step moves that person. Cleared at once on SKIP, at a fight and at scene end. Fixes 1f. |
| engine/story.js 1250 to 1266 | With no `endTrail`: if every follower stands on its own walkable tile within 3 tiles of Tom, keep them there and build the trail from where they stand. Otherwise `placeFollowers` as now. Fixes 3b. |
| tools/cut_natural_test.py (from the harness) | Fails when: a scene has not ended 5 s after its last line; a party member named in a walk step does not move; two party members share a tile at the end; arrows show during a scene; FAST or SKIP show over a modal; a queued toast shows for under 2.5 s. |

Edge cases. Save and load: nothing new is saved; the autosave in `finishOpening` still lands before ch1Goal, and loading it replays ch1Goal with Rose on the ground (the `if up` guard at data/scenes.js 82 covers it). SKIP at any step: the pose hold counts scene time, so SKIP passes through it; queued toasts play after the skip. Fight hand-off: the `battle` step and `cutReset` are untouched; the pose hold and the toast queue both yield while `battle.active`.

### Phase 2: preload, then sizes

| File | Change |
|---|---|
| engine/painted.js 30 to 36, 113 to 150 | `paintedLoad` calls `decode()` before setting ready. New pin set: `paintedPin(ids)` and `paintedUnpin()`; a pinned sheet counts as wanted in `paintedTick`, so it is never released mid-scene. |
| engine/story.js `playScene` 1071 to 1097 (new `scenePreflight`) | Walk the step list (also inside then, else, seq, all) and collect: every `{pose}` owner; every speaker's mood and talking sheets; listeners from `EMOTION_REACTIONS`; `spawn` monster sheets; the heist sheet when a frame starts with `mh_`; close-up pictures (`CH1_REVEAL`); the dialogue faces for the scene's moods; scene prop pictures. Pin them. Put one `preload` step first that ends when all are decoded or after 2.5 s. |
| engine/battle-draw.js `updateTransition`; engine/story.js 1194 `storyArriveFace` | When a scene will start on arrival, run the same preflight during the dark half of the map change and hold the fade-in until ready (2.5 s cap). The room then fades in with the poses already sharp. |
| engine/town-render.js about 100 | The foot shadow is sized from the person's standing frame, not from the pose. |
| tools/sprite-bake/bake_story_poses.py | The Pose Editor "apply" step (docs/POSE_EDITOR.md, "Not built yet"): every pose with Tom's skull and chin lines gets the person's one head size and exactly the real height from data/heights.json (Tom 5'11, Boppy 5'7, Deedee 5'5, Grace 4'2, Rose 3'4), feet on the bottom row, centred on the feet. Fix Rose `em_happy` (1 empty row under the feet). |

Needs Tom: his lines exist for Tom (15 poses) and Boppy (13) but not for Grace, Rose or Deedee. Sizes for those three wait on him. The preload part does not.

Edge cases. Memory: pins hold the decoded sheets of one scene's cast only and drop at scene end and at fight start, so the iPad cap (`PAINTED_PX_CAP`) is not at risk. A sheet that fails to load never blocks (2.5 s cap, then the old fallback). SKIP during the preload step ends it at once. Load a save inside a room: no scene starts, no preflight.

### Phase 3: carrying Rose, facing, chapter 1 staging

| File | Change |
|---|---|
| engine/rose-ride.js (new `rideSync`) | Story flag `ride` (saved with the flags). `rideSync` seats Rose when the flag is set and she is in the party, and unseats her when it is not. Called after `endIntro` (which clears `seat` at engine/intro.js 101), after a map change, after `loadGame` and after a fight. |
| engine/followers.js 24 to 33, 40 to 52 | A seated follower takes no place in the walking line and stays on Tom's tile. |
| engine/intro.js 186 to 191 | The two 4 s timers go; `rideSync` covers them. |
| data/scenes.js 39, 80 to 91, 109, 131, 157 | Opening sets the flag at the hop up. `CH1_DISMOUNT` moves from the end of ch1Goal to ch1Theft, after the walk-in: crouch (`tr_kneel`, 0.22 s), `tr_hopoff`, hop with a 10 px arc over 0.3 s, flag cleared. ch1Goal ends with Tom and Grace walking out. ch1Ellie no longer places Rose on the ground. |
| data/scenes.js 157 to 163 (ch1Theft staging) | Deedee (7,9) facing right; Tom walks to (9,9) facing left; Grace (10,10); Rose, once down, (8,10). Tom and Grace turn right for Boppy at (13,10). Coordinates to be confirmed in frames. Fixes 3d inside Tom's rule. |
| engine/intro.js 222 to 230, 139 to 149; data/scenes.js 33 to 36 | TATA!!! sits low on the left edge on the girls' approach row. The hug gets a slow sway and a heart every 1.6 s; `hugEndStep` moves to between Grace's and Rose's lines so Rose says "Tata, up! Up up up!" as herself with two 8 px hops. Rose's two lines become two talk steps with the same words (then run tools/script-index/build.py). |
| data/scenes.js 164 to 165 | Tom walks toward the door frame before THE DOOR FRAME. Which tile depends on which painted frame it is; settle in frames and move the knock targets with him. |
| engine/followers.js 24 to 33 | A follower whose next spot is hidden behind a cutout (`huddleHidden`, engine/story.js 554) keeps its last visible spot. Tiles stay walkable, so scenes in chapters 3, 7, 9, 10 and 15 are untouched. Fixes 3l. |

Edge cases. Save and load mid-map: the flag is in the save, `rideSync` runs on load. SKIP: the flag is set and cleared by steps that always run. Fight while carrying: at fight start Rose is off his shoulders (the battle rule: she rides only for Press Start, DEFEND and team moves); after the fight `rideSync` seats her again if the flag is still set. Chapter Select into chapter 1 starts with no flag. Nine Scoops seats and unseats her inside one scene and is not touched.

### Phase 4: the heist

| File | Change |
|---|---|
| data/scenes.js about 168 to 173 | The Mudling starts on the door tile (8,15) and comes in fast on `mh_charge` with the door bang. The doorway is clear once phase 1 has the girls walk in. |
| engine/story.js 287 `cam` | Optional `time` on `{cam}` for a set-length pan (0.26 s, cubic ease out). |
| data/scenes.js about 177 to 200 | `{cam:[6,9]}` for the grab so the island is on screen in portrait. Knock targets on the open floor: Tom (8.6,8.6), Grace (9.8,9.4), Rose (7.2,9.6). To be confirmed in frames. |
| data/scenes.js about 194 to 197 | Deedee and Boppy keep `em_surprised` through the grab; Deedee goes to `em_angry` on `mh_hug`; both clear when her line opens. |
| engine/plate.js (new overlay), data/scenes.js 156, about 199 | Empty-counter patch at {x:192, y:556, w:222, h:94}, drawn in both layers. The painted pan prop replaces the code stand-in and still hides on the `mh_grab` frame. Three mud footprints at (8,11), (8,12), (8,13) fading over 4 s; three crumbs at the grab. |
| data/mudling-heist.js | Rebake when the muffin heist sheet is approved. |

Needs Tom: approve `ch1-muffin-pan` and the heist sheet in the Art Library; one new entry for the empty-counter patch (the phase 4 session adds it).

Edge cases. SKIP mid-heist: prop hide, despawn and flags are plain steps and all run; `endIntro` clears every knocked pose. The patch is shown by a story flag test, so a save loaded after the theft shows the empty counter and one from another chapter shows the painted plates.

### Phase 5: movement and listeners

| File | Change |
|---|---|
| engine/town-render.js 86 to 110 | Around the feet: breathing (1.75 percent taller and back over 3.2 s, each person offset); a 120 ms squash and settle (0.94, 1.04, 1.0) when a pose changes or a person starts a line; a 1 px bob on the typing tick while that person's line types. Not for a seated, knocked-down or amber person, not for monsters, off during SKIP. |
| engine/emotions.js 135 to 166 | When a line opens, everyone in the scene without a pose turns toward the speaker after 80 to 180 ms, unless the scene set their facing. |
| docs/emotion-reactions.tsv, tools/reaction-apply.py, tools/script-index/apply.py, script.html 197 to 298, engine/emotions.js 92 to 114, engine/intro.js 220 | New optional column `fx` (hop, !, ?, ..., sweat). `emoPose` also plays an 8 px hop and floats the pip over the head. A row may name the speaker, which changes the speaker's own pose on a cue word (this is how Boppy's wince holds through "Gently. The stomach."). |
| docs/emotion-reactions.tsv | Rows for ch1Goal, ch1Amy, ch1Ellie and the rest of ch1Theft. |

Needs Tom: Art Library entries for the four pips and Boppy's stomach pose (the phase 5 session adds them; code stand-ins until approved).

Edge cases. FAST and SKIP: cues already fall back to the typewriter position, and SKIP shows no poses. Nothing is saved. A fight clears everything through `emoClear`.

## 4. Test recipe for any phase

`export CHROMIUM=$(ls /opt/pw-browsers/chromium*/chrome-linux*/chrome | head -1); export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, then `python3 -I cut_natural_run.py <repo> <out> open` (75 s), `row` (25 s), `theft` (70 s), one at a time. Each writes `<mode>.json` (the 100 ms log) and frames. Numbers to beat from this session: opening, girls' tiles moved during the walk-out 0; kitchen, seconds the girls stood on the doormat 27; kitchen, sheet reloads mid-scene 7; goal popup on screen 0.9 s.
