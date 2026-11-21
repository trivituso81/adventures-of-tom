# Story gates: inventory and Art Library entries (Tom 2026-11-06 15:58, CHANGES 401)

Fact: 9 exits are closed by the story in Part 1. Each is drawn in code, not painted. The three code drawings live in `b7DrawMapFx` in engine/story.js (fallen branch is the default, `look:'schoolgate'`, `look:'barrier'`). Gate data is the `gates:` list in each map spec (data/maps-le.js, data/maps-la.js). Closing logic is `storyGate` in engine/story.js (Tom steps back, gets the gate's lines).

| # | Area (map id, painting) | Blocked opening (tiles) | Opens when | Old code graphic | Library entry (1 press) |
|---|---|---|---|---|---|
| 1 | Square (`town`, art/town.webp) | Stairs to Grump Hollow (7-8, rows 2-4) | Chapter 1 flag `ch1-theft` (Deedee joins) | Fallen branch | `prop-gate-town-hollow` |
| 2 | Square (`town`) | East lane to school (28-29, 5-6) | Chapter 5 flag `ch5-goal` | Chain-link school gate, red and white sign | `prop-gate-town-school` |
| 3 | Rivituso Row (`row`, art/row.webp) | South path to Cattail Pier (12-14, 20) | Chapter 3 flag `ch3-boppy` | Fallen branch (the sign text is only in dialogue) | `prop-gate-row-pier` |
| 4 | Downtown plaza (`blvd`, art/blvd.webp) | Griffith steps (2-3, 2) | Chapter 2 flag `ch2-source` | Sawhorse barrier | `prop-gate-blvd-trail` |
| 5 | Downtown plaza (`blvd`) | Studio road arch (27-28, 7) | Chapter 4 start (chapter < 4) | Sawhorse barrier | `prop-gate-blvd-studio` |
| 6 | Jefferson Park (`jpark`, art/jpark.webp) | South road to Old Oak Park (13-16, 21) | Chapter 6 flag `ch6-nara` | Sawhorse barrier | `prop-gate-jpark-oak` |
| 7 | Jefferson Park (`jpark`) | East side street to Car Barn (29, 10-11) | Chapter 8 flag `ch8-block` | Chain-link school gate | `prop-gate-jpark-barn` |
| 8 | Studio backlot (`backlot`, art/backlot.webp) | Stage 7 doorway (12-13, 2) | Chapter 4 flag `ch4-sets` | Sawhorse barrier | `prop-gate-backlot-stage7` |
| 9 | Soundstage 7 (`stage7`, art/stage7.webp) | Stairs to the set (15-16, 3) | Chapter 4 flag `ch4-rig` | Sawhorse barrier | `prop-gate-stage7-catwalk` |

Entries: tab Props, group "Story gates", one reference each (the live area painting), one transparent object, source `tools/art-library/gate-prompts.js`. Nothing installed.

Install (only after Tom approves a picture): cut the object, add it to the prop art set, and in `b7DrawMapFx` draw it with `PROPART.draw` across the gate tiles in place of the code drawing (keep the code drawing as the fallback until it loads). Bump tags, add a CHANGES entry.

Found, not fixed (data/bonus-nine-scoops.js ~line 1099, Nine Scoops adds 4 gates):
- None has a `look`, so all draw the fallen branch, including the one on the school lane.
- Its Pier gate is at Row y 21, but the Row exit is y 20, so the pier path is open in that chapter.
- Its two Square north gates cover x 8 only; the Hollow stairs exits are x 7 and 8.

Not exit gates (locked doors, already covered by Dungeon finds art): school cafetorium doors (`prop-find-ch05`), Moon Club silver door (`prop-find-ch09`), Reading Room doors (`prop-find-ch07`), Gate 0 (`prop-find-ch10`).
