# cutpolish2 (2026-11-19, main 1b0f7f9): cutscene polish phase 2 (sheet preload, foot shadow, Pose Editor sizes)

Plan: claude/cutscene-polish-plan.md section 3, phase 2. Repo detail: docs/CHANGES.md "cutpolish2". Next is phase 3 (carrying Rose, facing, chapter 1 staging).

## What was built

| Piece | Where | Fact |
|---|---|---|
| Decode before ready | engine/painted.js `paintedLoad` | A sheet is `ready` only after `Image.decode()` (before: on load). |
| Pin set | engine/painted.js `paintedPin(ids)`, `paintedUnpin()`, `paintedPinReady()`; `paintedTick` treats a pinned id as wanted | Pinned sheets are never released. Pins also drop at a fight (`paintedTick`). |
| Scene preflight | engine/story.js `scenePreflightIds(list)`, `scenePreflightPin(list)`, `SCENE_OPS.preload`; `playScene` puts `{preload:true}` first | Collects speakers (`talk` names via DIALOG_PORTRAIT_IDS), `{pose}` owners and `mid`, spawned monsters (`foe_<id>`), the heist sheet when any step text holds `"mh_`, the party, and listeners from `EMOTION_REACTIONS` for the scene's speakers in `STORY.chapter`. Also warms dialogue faces, talking-pose faces and `CH1_REVEAL` images. The preload step ends when `paintedPinReady()` or after 2.5 s, at once on SKIP. |
| Unpin | `endIntro` wrapper in engine/story.js; a 1 s interval drops a pin 6 s old when no scene or transition runs | |
| Arrival | `storyArriveFace` pins the scene found by the arrival trigger and sets `transition.pinHold`; `updateTransition` (engine/battle-draw.js) holds the fade-in until ready, 2.5 s cap | |
| Heist atlas | `mhAtlas()` (engine/story.js) | The atlas is now created by the preflight, not on first draw. |
| Foot shadow | engine/town-render.js `drawSheetActor` | Width from the standing frame (`frames[0]`) when a scene pose is drawn. |
| Pose Editor apply | tools/sprite-bake/bake_story_poses.py `warp_figure`, `apply_pose_lines`, `APPLY_REQ` | See next table. |
| Rose em_happy | `hard()` in the same file | A faint bottom row is kept if it holds paint. The painted frame itself already touched the bottom (gap 0 for every frame measured); only the quantized row copy could float. Rose's atlas and rows did not change in this bake. |
| Test | tools/cut_natural_test.py | New facts `story_sheets_released_in_scene` and `blurred_pose_draws`, both must be 0. Toast limit 2.4 s (0.1 s samples). |

## Pose Editor apply, as built

- Input: data/pose-requests.json (`frames[person][pose]` with `ok:true` and `page:{h,f,a}`; saved 2026-11-16). 60 poses applied: feelings (8) and talking (4) for Tom, TNB, Justin, Boppy, Amy. All checked.
- Method: source figure from `emotion_frames.cut` or `talk_frames.cut` (ungrown); rows above Tom's chin line `a` scaled by `page.h`, rows from `a + 12` px down by `page.f`, linear blend between, same factor across each row, then the set's one strip scale as before (`f` in the bake loop). Old head growth is not applied again because h and f are relative to the source.
- Parity: visible height times the walk scale (data/walk-scale.js `k`) is within 0.16 row of `page.wholeRows` for all 60. Raw atlas heights are larger than the page numbers by 1 / walk scale (Boppy 1.05, Justin 1.18); that is correct, the game multiplies by the walk scale when it draws.
- Not applied: walking poses (`down_stand`, `up_stand`, `left_stand`, Boppy `up_stand`) of Tom, TNB, Justin, Amy, Boppy. They need `walk_sheet_frames.py` and a walk rebake and change every map. Grace, Rose, Deedee: no lines saved. Plan said "Tom and Boppy"; the file holds five people and all five were applied.
- Dialogue faces: not rebaked (they are cut from Tom's lines by pose_faces.py already). Pose Editor page "in the game now" (manifest.py `now`) still shows the pre-apply sizes for these 60 poses.
- `POSE_APPLY=0 python3 tools/sprite-bake/bake_story_poses.py` bakes without it. The bake takes about 7 minutes; afterwards `git checkout art/chars/pipemo-story.webp data/npc-poses.js` (as before). Atlases of every person not applied came out byte for byte the same.
- Looked at: /tmp contact sheet of old and new feelings for the five (no seams or warp artifacts); kitchen frames in portrait and landscape.

## Measured (kitchen, `theft` mode, same harness)

| | Before | After |
|---|---|---|
| Story sheets released mid-scene | 3 (boppytalkStory, deedeeemoStory, deedeetalkStory) | 0 |
| Painted pose drawn from the small blurry copy | 12 | 0 |

Opening, Row and kitchen pass in portrait and landscape (`FAILS: []`). Smoke passes.

## Mistake to avoid (hit this session)

`python3 tools/art-library/bump_tags.py -h` does NOT print help: it treats `-h` as the tag and rewrites ART_V and the build files. Reverted with `git checkout data/build-history.js engine/main.js index.html` and restoring `ART_V` by hand before the real bump.

## For phase 3

Read plan section 3 "Phase 3". Tom's lines still missing for Grace, Rose, Deedee: size those only when he saves them in the Pose Editor. Walking-pose apply is its own build (say so to Tom if he asks about size jumps in walking).
