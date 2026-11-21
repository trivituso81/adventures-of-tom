# near1 (2026-11-12 22:22 to ~23:40 PT, main 487a58e): the party walks up to the person a scene is about; benched walkers are staged. DONE for Carmen, one scene NOT fixed

## What Tom reported
- 22:22, screenshot of Doña Carmen's thaw (chapter 12, pupuseria): "why does the party stay so far away? ... There's no risk of them overlapping with Doña Carmen if they were even three or four spaces forward, but again, I don't want them overlapping. I just want them to be close in a normal way, and I want that to apply to everywhere else in the game where there are situations exactly similar to this, cutscene in nature."

## Causes (fact)
1. `ch12Carmen` starts the moment Tom steps through the door (trigger has no `at`), seven tiles from Carmen (9,6). Nothing walked him over; `{huddle}` only gathers the party where Tom already stands.
2. The staging (`huddleGroup`, `gatherStep` in engine/story.js) only counted `party` (the fighting four). From chapter 11 the bench members (engine/bench.js; Amy and TNB in chapter 12) walk with Tom but were skipped, so they stayed in the walking line. reaction_test.py, boss_stage_test.py and scene_stage_audit.py skipped them the same way, so no test showed it.

## What is pushed (tag near1, smoke FAILS [], tag_check ok)
| Change | Where |
|---|---|
| `{approach:names}`: before the first line of a scene with no staging of its own (no walk, place, cam, zoom) and no boss, Tom walks to the nearest open tile beside the first person on the map who speaks in the scene, when that person is 4 to 14 tiles away (Chebyshev). The party forms in front of them and faces them. If the whole party does not fit tight beside the person, nobody moves. A scene can name its subject itself: `{approach:'Name'}`. | `approachStep`, `approachSubject`, `approachSpot`, `sceneSpeakers`, `sceneSelfStaged`, and the `near` branch in `playScene` |
| Keep-off: while an approach is active (`intro.nearBox`, `intro.nearBoxes`), nobody in the party stands in the three columns around any person in the room down to two rows in front of them. `{huddle}` honours it, looks at the approached person, and `huddleLayout` charges .8 per column the group's middle is off that person's column. | `huddleStep`, `huddleLayout` |
| Benched walkers are staged everywhere (`stageWalks`). | `huddleGroup`, `gatherStep` |
| Test tools: `"bench":["amy","tnb"]` in a case puts people on the bench; snapshots list benched walkers. | tools/reaction_test.py, boss_stage_test.py, scene_stage_audit.py |

## Which scenes it touches (scan of all 159 triggered scenes)
75 stage themselves (walk, place, cam or zoom), 40 are boss scenes, 44 are automatic. Of the 44, six have a speaker standing on the map: ch12Carmen (changed), ch2Odette, ch2Carmen, ch3Tea, ch19Feast (already close, unchanged), ch12Alvarez (not approached, see below). Twelve self-staged scenes also have a speaker on the map and were NOT looked at for distance: ch2-smog, ch2-end, ch4-gate, ch4-end, ch5-pruitt, ch6-nara, ch6-park, ch6-end, ch7-page, ch7-end, ch8-end, ch9-luna.

## Looked at (fact)
- ch12Carmen with all six, portrait and landscape: Rose (7,8), Grace (8,9), Tom (9,9), TNB (10,9), Amy (11,8), Nara (9,12), all facing up, same on all 16 pages, nobody on Carmen.
- First pages of ch2Odette, ch2Carmen, ch3Tea, ch19Feast. ch12Prime, ch13Worm, ch12Marlowe, opening, ch1Pond replayed with 0 page errors.

## NOT fixed, say so to Tom
- `ch12Alvarez` (Casa Alvarez): narrow house, seven frozen people. The six walkers shuffle between lines, some stand on amber figures, Tom ends alone by the door (8,11) while the rest are in the living room (rows 8 to 9). One rule attempt (nearest open floor as a fallback) made it worse and was removed. This needs hand placement, not a rule: `{place}` each walker in the living room (floor x4..9, y7..9; walk mask in data/maps-la.js `casa`), off every amber figure, then look at all 18 pages.
- `ch12Prime` with six walkers: Grace (15,4) and TNB (15,6) share a column two rows apart on the first four pages (harness start tile, not a real approach).
- Oolong in ch3Tea is drawn as a blurry low-detail figure (seen in the frame; not investigated).
- Full 159-scene audit not rerun with bench cases (the audit's PARTY table has no bench). Not played on a phone.

## Test case
`[{"name":"carmen-p","ch":12,"map":"pupuseria","scenes":["ch12Carmen"],"party":["tom","grace","rose","nara"],"bench":["amy","tnb"],"start":[8,14,"up"],"flags":{"ch12-marlowe":true,"ch12-grey":true}}]` (add `"layout":"landscape"`). Alvarez: map `casa`, scene `ch12Alvarez`, same party and bench, flags plus `"ch12-carmen":true`.
