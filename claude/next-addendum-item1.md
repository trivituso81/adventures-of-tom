# item1 and item1b (2026-11-12 23:11 to 2026-11-13, main 83a02c8): the party stands around the object a scene is about

## What Tom reported
- 23:11, screenshot of the sourdough starter scene (chapter 2, Tom's kitchen): the party stood in the middle of the house, not around the starter. He wants: everyone around the object, each one visible, nobody overlapping, nobody in a strange relationship to the object, everyone facing it, nobody hidden behind map layers. Then the same check "for every single possible instance of when you interact with an item in the game".

## Cause (fact)
- `ch2Starter` walked Tom to (8,5), the left end of the island. The jar is drawn at the right end (tile 11.7, 4.1; `drawHomeJar` in engine/plate.js). The `{huddle}` before each line then moved the party to open floor and turned them toward each other.

## What is pushed (tags item1 and item1b; smoke FAILS [], tag_check ok, unused_voice 0)
| Change | Where |
|---|---|
| `{around:[px,py],tom:[x,y],at:{id:[x,y]},size:[w,h]}`: Tom and every walker (bench included) go to the nearest good tiles around an object and face it. `[px,py]` is the bottom middle of the object's picture in tiles; `{around:{x,y,w,h}}` is a tile rectangle. A good tile: on the floor, reachable, within 7 steps of Tom on foot (nobody across a wall, fence or the object), not the map edge or under the dialogue box, not behind painted scenery (`huddleHidden`), not on anyone's picture or the object's picture, never the same column as another walker within two rows. They set off one after another. | engine/story.js `aroundStep`, `aroundSpots`, `aroundFace`, `aroundRect`, `aroundGap` |
| While `{around}` is active the `{huddle}` before each line leaves the group alone and they keep facing the object. `{around:null}` or the end of the scene lets go. | `huddleStep` (first line), `intro.objStage` |
| Automatic: any scene started with A on an object gets an `{around}` on that object's tiles before its first line, Tom staying on his tile, unless the scene stages itself (walk, place, cam, zoom) or is a boss scene. Skipped if the scene already changed the map or moved Tom. | `objPress`, `objPressNote`, `objPressLive`, the `pressAction` wrapper added on window load, `playScene` |
| The cutscene camera (cutstage1) frames and zooms on the group at the object (item1b). | `stageFrame` call in `aroundStep` |
| `ch2Starter`: Tom (12,4) beside the jar, TNB (11,5), Nara (10,5). `ch6Kitchen` (missing jar): TNB waits at (10,5), Tom walks to (11,5); on "Look at the island" TNB steps to (12,4) and both look at the jar's spot. | data/scenes.js |
| Test tools: `"obj":"<property, name or kind>"` in a reaction_test.py case walks Tom up to that object, presses A, then plays the scene (roaming monsters hidden for the walk). `tools/item_stage_report.py OUT/result.json` checks overlap, distance, facing and behind-scenery on every page. Cases: `tools/item_stage_cases.json`. | tools/ |

## Checked (fact)
- 22 object scenes, all ok in the report, first pages looked at in portrait: ch4Rig, ch4Snack, ch5Clocks, ch5Snack, ch6Dig_play, ch6Door, ch6Fetch, ch6Board, ch6Ladder, ch7Door, ch7Story, ch8Motor, ch8Turn, ch8Plate, ch8Pail, ch9Door, ch10Door, ch10Photo, ch11Lost, ch19Mem, ch19Keep, ch20Door.
- ch2Starter and ch6Kitchen looked at in portrait and landscape. ch12Carmen replayed, unchanged.

## NOT done, say so to Tom
- The 22 object scenes were not looked at in landscape (places are chosen by tile, so they are the same; only the camera differs).
- Loose but accepted: ch8Motor (Nara 3.5 tiles left of the motor), ch8Plate (Nara 3 tiles right of the table), ch6Ladder (Nara three rows down the stairs). Narrow floor.
- Not covered: ch9Dance (the scene poses the dancers itself); chapter 17 hatch and snow globe scenes (played from a function, which gets no staging of any kind: needs `{stage:true}` and a look); the other two ch6 mounds; one-page object descriptions with no scene (the party does not move, Tom faces the object); scenes that start on entering a room and talk about the room (ch5Hall, ch7Stacks, ch8Barn, ch9Club, ch10Term, ch11Gate00, ch3Hollow).
- Harness note: a case with `obj` can fail with `press: False` when a scripted monster talks to Tom as he arrives (seen once each on ch6Board, ch8Turn, ch6Fetch). Rerun that case alone before blaming the staging.
- Not played on a phone.

## Test
`ROOT=$PWD python3 tools/reaction_test.py tools/item_stage_cases.json /tmp/item [case names]` (about 25 s a case), then `python3 tools/item_stage_report.py /tmp/item/result.json`. Starter: `[{"name":"starter-p","ch":2,"map":"tomhouse","scenes":["ch2Starter"],"party":["tom","tnb","nara"],"start":[8,13,"up"],"flags":{"ch2-nara":true},"unflag":["ch2-starter"]}]`; missing jar: ch 6, scene `ch6Kitchen`, party `["tom"]`, unflag `["ch6-tnb"]`.
