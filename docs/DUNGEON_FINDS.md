# Dungeon finds: what the party has to find, and the overlay art for it

Made 2026-11-06 from the map and scene code. Rule behind it (Tom, 2026-11-01): collectibles, switches, locks and quest objects are overlays, never painted into the map. Each is a separate transparent picture the game draws at its tile, so it can change state or disappear.

Art Library: tab Props, group "Dungeon finds", 13 sheets (`prop-find-<chapter>`), 92 objects. Source of the prompt text: `tools/art-library/dungeonfind-prompts.js`. Nothing is installed or wired yet; approving a sheet is not installing it.

Chapters with nothing to find: 1 and 2 (walk-in triggers and a boss), 12, 14, 15, 16, 18 (scene triggers and NPCs only).

| Ch | Dungeon (map ids) | Objects the party must find or use (flag, tile) | Sheet |
|---|---|---|---|
| 3 | Sundial Hollow (`sundial`) | Sundial with the gold hourglass coin (`ch3-coin`, 11,12); the coin itself | prop-find-ch03 |
| 4 | Soundstage 7 (`stage7`) | Junction boxes blue 21,15, amber 13,12, red 6,11, switched in the order blue, amber, red (`ch4-rig`); light rig 11,8 | prop-find-ch04 |
| 5 | Elementary (`school`) | Art 5,8, music 15,8 and gym 23,8 clocks set to 7:00 (`ch5-clocks`); locked cafetorium doors 27,7; optional staff fridge 1,12 and plate (`ch5-snack`) | prop-find-ch05 |
| 6 | Old Oak Park, Old Oak, Crown (`oakpark`, `oak`, `crown`) | Three dig mounds 7,9 / 21,5 / 8,17 and the knock scraps they give; little oak door 12,4 (`ch6-door`); corkboard 4,1 (`ch6-board`); bucket on a rope 21,3 (`ch6-ladder`); acorn hoard jar 11,4 (`ch6-take`) | prop-find-ch06 |
| 7 | The Stacks, Reading Room (`stacks`, `readroom`) | Catalog cards S, H, H (`ch7-cards`, dropped by fights); Reading Room doors 14,1 (`ch7-door`, word SHH); staff door in the library 12,4; optional story chair 7,15 | prop-find-ch07 |
| 8 | Car Barn, Boiler Room (`carbarn`, `boiler`) | Three pilot lights (`ch8-pilots`, from the three shop fights); turntable motor 15,16 (`ch8-motor`); turntable lever 24,15 (`ch8-tt`); optional lunch pail 28,13 | prop-find-ch08 |
| 9 | Moon Club, Dome (`moonclub`, `dome`) | Three mirror stands 21,11 / 21,9 / 15,9 turned to aim the moonbeam (`ch9-door`); little silver door 12,5; dome doors 14,2; optional jukebox 19,13 | prop-find-ch09 |
| 10 | Terminal Zero (`terminal`) | Gate clock 14,0 with three missing hands (`ch10-hands`); gate lock doors 14,1 with seven coin slots (`ch10-door`); optional photo booth 28,12 | prop-find-ch10 |
| 11, 13 | Endless Concourse, Sub-Rail (`concourse`, `subchamber`) | Lost and Found door 16,10 (optional); Gate Infinity doors 37,3; amber glass doorway 21,5 that the coins melt to gold (`ch13-melted`) | prop-find-ch11-13 |
| 17 | Glass Tower (`towershelves`, `towerstairs`, `towervault`) | Six shelf cases to smash (`shelf-0` to `shelf-5`: Dunmore, Tallulah Falls, Cedar Hollow, Port Gilly, Hickory Bend, Lower Brightwater); service hatch 14,2; sealed door 10,2 (`ch17-locks`); snow globe plinth 8,5 | prop-find-ch17 |
| 19 | Dead-Letter Office, memory rooms (`deadletter`, `mem*`) | Three memory pages per room, lit and faded (`mem-<who><n>`); pedestal (`ks-<who>`) and the four keepsakes squishy, pink ribbon, stopwatch, first cup; claim desk 10,5; Tom's mailbox | prop-find-ch19 |
| 20 | Stillness Core (`stillcore`) | Eight skill doors (`door-<who>`: Tom codebreaker, Grace beam, Rose crawlspace, Amy sprint, Deedee garden bridge, Boppy heavy lever, TNB rail splice, Nara scent trail); engine lift 12,10 (`ch20-core`) | prop-find-ch20 |
| Bonus | Nine Scoops (Long Island maps) | Boppy's pepper planter 19,13 and the pepper item; cocoa; instant photo printer; light-up banner; party invitation | prop-find-ch21 |

## Notes
- Already drawn live over the painting (`liveKinds`): ch4 junction boxes, light rig and spike tape; ch6 dig mounds; ch9 mirror stands; ch10 gate clock; ch19 memory pages and pedestals; ch20 doors and lift. The new art replaces those code drawings when installed (purge the old drawing then). Everything else is baked into the plate today, so the overlay must be placed over a painted-out spot when the plate is next redone.
- Designed from the object name, not from an existing look: ch20 doors, ch17 shelf towns, ch19 keepsakes, ch11 to 13 doors. Tom's eye decides.
- Not covered: the seven stamped Chronos coins of ch10 (told in dialogue, no map object); ch9 "split-party puzzle" from the story bible (no such code found).

## Trail clues (Tom, 2026-11-06)

Where the player only has to find an enemy, boss or trigger and no object leads there, a trail of 3 clue objects does. Clue 1 is far from the target (ch1: upper left), clue 2 appears once clue 1 is investigated, clue 3 appears after clue 2 and points at the target. Sheets: `tools/art-library/trail-prompts.js`, ids `prop-trail-a` to `prop-trail-f`, group "Trail clues" (6 sheets, 48 objects; chapter 1 is no longer on sheet a, see the next paragraph).

Chapter 1 (Grump Hollow) uses no investigate-and-reveal clues. Its trail is the rhubarb crumbs Deedee calls out, sheet `prop-trail-hollow` (9 pieces, Tom 2026-11-09): cells 1 to 2 appear on the painted Hollow right before "Crumbs! Rhubarb crumbs." (`ch1Mudling`, entrance), cells 3 to 5 right before "The crumbs keep going north." (after the Mudling), cells 6 to 9 right before "The crumbs go around the pond. Toward Boppy's fishing spot." (`ch1Grump`, heading east to Boppy's bench). Not installed: Tom generates and approves the sheet in the Art Library, then Claude cuts and places the pieces. Chapters 14, 15 and 16 and 18 have explicit scripted targets (porch, HUSH-9, etc.) and get no trail. Not built yet: the code that shows the next clue after the previous one (needs a flag per clue, `SCENES` entry, glow).
