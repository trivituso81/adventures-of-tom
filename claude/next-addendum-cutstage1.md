# next addendum: cutscene formation, bystanders and camera (cutstage1, main 042e44c, 2026-11-13; read with claude/next.md)

## What Tom asked (2026-11-12 20:34, screenshot of Marlowe's first scene, chapter 12, Jefferson Park)
"It's happening again that the characters are spread out in a weird way, and also covering the NPC that's a key part of the situation, and I also think that we need to be zooming in on the characters and the NPC during cut scenes. Doesn't have to be during regular conversations with NPCs and we need to do this exhaustively for the entire application, the entire game."

## Causes (fact)
- `{huddle}` put the party on a ring around the middle of the group, so with an NPC in the scene people stood beside and behind him.
- Townsfolk keep wandering during scenes (`updateNPCs`) and stopped next to him.
- The camera only zoomed in five arrival scenes that carry their own `{zoom}`.

## What was built
| Part | Where | What it does | Numbers to tune |
|---|---|---|---|
| Formation | engine/story.js `huddleFormation`, `huddleForm`, `huddleAxis` | With someone to talk to: Tom faces them across a gap, walkers line up beside him (row abreast above or below, zig-zag beside), nobody ahead of Tom, nobody within a figure of the NPC. Party alone: same row around Tom. Tom keeps his tile when it works. Falls back to the close1 ring (`huddleLayout`) when no room or people would stack. | `STAGE.rows` 3, `STAGE.cols` 1 (gap and clear space), the `ideal` offset lists in `huddleForm` |
| When it re-stages | `huddleFails` | New: `cover` (`stageCovers`: on the NPC, in front within 2 rows and 1 column, or right behind) and `spread` (over 4 tiles from Tom, or on the NPC's far side). Scene-placed, posed and walked people keep their marks. | the 4 in `huddleFails` |
| Short screens | `huddleAxis` `flat`, `sceneRoomTiles` | Under 7.5 rows of room above the dialogue box (phone landscape): also tries the party beside the NPC and keeps what fits. | 7.5 |
| Facing | `huddleTurn` | Party looks at the named speaker (else nearest NPC); NPCs look at the party. | |
| Bystanders | `stageFrame`, `stageZone`, `stageInZone`; engine/battle-draw.js `updateNPCs` | Wandering townsfolk (roam above 0) inside the picture walk out at 0.55 step time; the scene waits up to 2.2 s; nobody walks in until `endIntro`. | 2.2, .55, zone margins in `stageFrame` |
| Camera | engine/overworld.js `sceneAuto`, `sceneAutoTick`, `sceneAutoCur`, `sceneAutoBox`, `setSceneZoom`, `resize`, `updateCamera` | After each `{huddle}` (also after a monster line-up): centre on the group, zoom until it fills the space between the top bar and the dialogue box. Follows the group, drops people too far to fit (never Tom), eases back at scene end. `{cam}` set: zoom 1. Scene's own `{zoom}`: wins (`sceneZoomManual`). Someone Tom is talking to does not fit: view as before. Rooms zoom too. Bottom rows: view slides up above the dialogue box (rooms always, outdoors only while the box is on screen). | `SCENE_ZOOM_MAX` 1.7, `SCENE_ZOOM_MAX_ROOM` 1.3, `SCENE_SCALE_MAX` 3.4, ease `dt*4` |
| Room figure size | engine/story.js `stageFig` | Used by the camera only (rooms draw people 4 to 5 tiles tall, Tom's house 1.5). Line-up spacing is the same everywhere so near1's close row is kept. | |

## How it fits the other sessions' work the same evening
- close1 ring: fallback only. near1 `{approach}`: unchanged; its result passes `huddleFails`, so the party is not moved again (checked on ch12Carmen). Boss scenes: `{gather}` still owns places, `{huddle}` only turns; camera applies. Monster in an ordinary scene: bossbox1 line-up, then the camera.

## Tested
- Before the merge with close1 and near1: full audit, 157 triggers plus 30 extra, portrait, 1,947 pages; 1,695 zoomed, mean zoom 1.46; party cover in 1 scene (ch4Gate), bystander cover in 3 (ch12Alvarez, ch12Loft, one page of ch8End), overlap only ch6Spy, ch6Gallery, ch6Fetch.
- After the merge: 14 scenes (ch1-goal, ch1-pond, ch2-smog, ch2-odette, ch3-end, ch4-gate, ch4-fetch, ch5-pruitt, ch6-end, ch6-park, ch7-pic, ch8-end, ch9-boss, ch10-end), 167 pages, 159 zoomed, 0 overlap, 0 party cover; ch12Marlowe with six walkers portrait and landscape; ch12Carmen portrait. smoke FAILS [] on the pushed build.

## Not done, and known leftovers
- Full audit not repeated on the merged code. Duo not run. Landscape looked at on Marlowe only. Not played on a phone.
- ch4Gate (studio gate strip): no room, falls back to the ring, TNB stands near Dana.
- ch11Vance: Amy 5 tiles from Tom (narrow concourse). ch10End: someone apart on 15 pages. ch1Pond page 1: Deedee apart, zoom starts on page 2.
- Small rooms with residents (Casa Alvarez, TNB's loft): residents are not moved (no free tile outside the picture, or they do not wander).
- A zoomed view can hide something the dialogue points at that is not a person (the greyed jacaranda, a far amber neighbour). Fix per scene with `{cam:[x,y]}` (turns the zoom off) or `{zoom:1}`.
- The `offcenter` soft flag fires in about 90 scenes (tight line beside a wall); not compared with the build before.

## If Tom reports
| Report | Do |
|---|---|
| Too close or too far | `SCENE_ZOOM_MAX`, `SCENE_ZOOM_MAX_ROOM` |
| Someone cut off at an edge | check `sceneAutoTick` fit maths with `tools/scene_stage_audit.py` (`scr` and `dock` per page) |
| Party too far from the NPC | `STAGE.rows` (3) is the gap; lead cost in `huddleForm` (`leads`) |
| Townsperson still on the NPC | is their `roam` 0 or are they `still`? then `{place}` or hide them in that scene |
| A scene should not zoom | add `{zoom:1,time:.01}` at its start (sets `sceneZoomManual`) |

## clearout1 (2026-11-13, main 1356c1e): extras leave first
- Tom 2026-11-12 23:44: "those NPCs that have nothing to do with it should just be totally cleared out of that area in a different part of the map, giving preference to the player characters."
- Cause (fact): every placement routine counted any NPC tile as taken, and cutstage1 only sent passers-by away after the party had chosen spots, from a small box.

| Part | Where | What it does | Numbers |
|---|---|---|---|
| Who is an extra | engine/story.js `stageExtra`, `stageCast` | Wanders (roam above 0), not held, posed, seated, spawned, a monster or a follower, not the NPC Tom pressed A on, and its name is nowhere in the scene's script text (functions included). | |
| Placement ignores them | `busy` lists in `huddleForm`, `huddleLayout`, `stageSpots`, `stageLeftSpot`, `approachSpot` | The party is placed as if extras were not there. | |
| Clearing | `{clearout:true}` (first step of every staged scene), `stageClearOut`, `stageShooOut` | Area = 8 tiles round Tom and round speakers within 14 tiles. Each extra walks to the nearest free tile outside; if everything reachable is inside, to the farthest reachable tile; if people block the only way, it is put there directly. The scene waits up to 1.6 s while one is within 4 tiles of Tom. | 8, 14, 1.6, 4; walk step time x0.4 in engine/battle-draw.js |
| Staying out | `updateNPCs` (engine/battle-draw.js), `stageFrame` | Nobody walks in while the scene plays; an extra still inside when it goes idle is sent off again; the area is rebuilt round the group after each `{huddle}`. | |

- Looked at (portrait): ch12Marlowe (nobody within 7 tiles on the first pages), ch1Goal, ch2End, ch2Smog, ch3End, ch5Arrive, ch6End, ch8End, ch10End, ch12Loft, ch16Open. ch12Marlowe also in landscape.
- Leftovers: a person only mentioned by name stays (Mr. Washington in ch12Marlowe); one-screen streets leave extras 5 to 7 tiles off; small-room residents stand in the far corner; an extra may cross the scene on its way out during the first second.
- If Tom reports an NPC still in the way: check `stageExtra` for that NPC in the console during the scene (`roam`, name in script). To force one out of a scene, hide it with the scene's own steps; to keep one in, name it in a `{face}` step.
