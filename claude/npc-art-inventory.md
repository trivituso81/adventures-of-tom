# NPC art inventory (2026-10-26)

Audit of every townsperson in the live game (v280). Method: loaded the game headless, listed every npc in LE_AREAS, LE_ROOMS, LA_AREAS, LA_ROOMS plus story-spawned ones (data/scenes.js, data/bonus-nine-scoops.js), and drew each one with the game's own drawActor.

## How a townsperson gets drawn (engine/town-render.js, drawActor)

| Tier | Rule | Look |
|---|---|---|
| Sheet | npc has sheet:'<id>' and OW[id] exists | Detailed traced sprite, 3 directions, walk frames |
| Villager | npc look name exists in VILLAGERS (data/villagers.js, engine/travel.js) | Detailed sprite from the man or woman base, recolored, scaled |
| Procedural | look name is NOT in VILLAGERS | Fallback drawNpc: blocky 16x30 box figure, no neck, arms or legs, flat colors |

## Result: 64 placed npcs plus 4 story spawns

| Tier | Count | Who |
|---|---|---|
| Sheet | 9 | Boomie, Michael, Olivia, TNB, Amy, Justin, Aunt Ellie, Boppy, Deedee |
| Villager | 44 | All of town, row, every shop and house interior, Blvd, Jefferson Park, the Casa, Kenji, Priya, Odette and the rest of the LA rooms |
| Procedural | 12 | see below |

## The 12 procedural figures (need real sprites)

| Person | Where | Chapter |
|---|---|---|
| Reel | Cattail Pier | 3 |
| Ray | Studio Gate | 4 |
| Toni | Studio Gate | 4 |
| Kiki | Studio Gate | 4 |
| Dana | Studio Gate | 4 |
| Principal Pruitt | Long Island Elementary (schoolyard, also spawned in scene) | 5 |
| Mr. Delgado | Long Island Elementary schoolyard | 5 |
| Mrs. Kowalski | Long Island Elementary school | 5 |
| Grandpa Ike | Long Island Elementary school | 5 |
| Mr. Halverson | Long Island Elementary school | 5 |
| Bernadette | Old Oak Park (placed and scene spawn) | 6 |
| Long coat | scene spawn only (school and later) | 5 and later |

## Pattern

Tom's hunch holds for chapters 3 to 6, not for "newer areas" in general. Everything built before chapter 3 is fine, and so are the later LA interiors (Casa, Pupuseria, Tower and so on) because they got villager entries. Chapters 7 to 10 place no townspeople. The gap is the outdoor areas of chapters 3 to 6: each npc was given a color palette in data/maps-le.js or data/maps-la.js but no VILLAGERS entry, so the renderer fell back to the box figure.

## Fix once Tom's character image arrives

1. Trace each figure into a sheet in data/npc-sprites.js (down, up, side, 3 frames each, same format as OLIVIA_OW) and register OW.<id>.
2. Set sheet:'<id>' on the npc in the map file and on the scene spawn.
3. Test in the area, look at frames, publish only after Tom approves a build.
Cheaper fallback for any person who does not need a unique look: add a VILLAGERS entry (base man or woman, hair, skin, top, bottom, shoes, scale).
