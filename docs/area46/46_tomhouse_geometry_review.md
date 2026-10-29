# Area 46 Tom's House: geometry review (proposal, not implemented)

Status: proposal for approval. No game file was changed. Nothing was published.

## 1. Result

| Item | Value |
|---|---|
| Map id | `tomhouse` (interior), exit target `jpark` door tile (4,17) |
| Grid | **19 cols x 43 rows** |
| Art resolution | **1216 x 2752 px** at the engine's 64 art px per 32 logic px tile |
| Old grid | 16 x 35 (discarded, not reused) |
| Rooms modeled | all 14 requested spaces plus pantry, east storage, office closet, west lawn, porch (visual only) |
| Reachability | flood fill from spawn reaches every walkable cell (0 unreachable) |
| Assumed doors/passages | 5, listed in section 6 |

Files: `46_tomhouse_walkmap.txt`, `46_tomhouse_geometry.json`, `46_tomhouse_geometry_overlay.png`, `46_tomhouse_art_corrections.md`.

## 2. Why not 16 x 24

The plan is a 25 ft x 76 ft house plus a 11 ft backyard, about 1:3. A 1024 x 1536 canvas is 2:3. Three hard reasons it fails:

1. **Walls cost a whole tile.** Collision is per tile, so every wall is 1 tile thick. The real central hall is 3.4 ft between walls, which needs 3 tiles (wall, floor, wall). The real vertical chain north to south is: backyard, wall, primary bath, wall, bedroom, wall, laundry, wall, office, wall, closet, open living area, wall. That chain alone is about 33 rows.
2. **Party of four walks single file.** The narrowest passages (hall, closet, bath 2) must be at least 1 floor tile with a wall tile on each side.
3. **16 columns cannot hold the widest row.** Lower house: wall, office 4, wall, hall 1, wall, guest suite 5, wall = 14 cols, plus lawn and deck on the west = 19.

I chose **2.5 ft per tile** (48 plan px). A larger tile (3 ft) collapses the 2 tile bathrooms to 1 and the 4 tile wardrobe to 3. A smaller tile (2 ft) grows the map past 22 x 50 for no gameplay gain. 19 x 43 is the smallest grid I found that keeps every room, every drawn door, and 1 tile walls.

Distortion: walls are inflated, so the grid is taller than the plan scale by about 3 rows and wider by about 2 cols. Topology and order of rooms are exact; proportions are within about 1 tile.

## 3. Layout (tile coordinates, col,row)

| Space | Floor bounds | Notes |
|---|---|---|
| Backyard | 8..15, 1..4 | shrubs row 4, hedge tree (12,3) |
| Yard connector | (6,4) (6,5) (7,4) | ASSUMED A4 |
| West lawn | 1..3, 6..15 | open to deck, no wall |
| Rear deck | 4..6, 6..15 | north steps at rows 6..9; rear door D (5,16) |
| Primary bath | 8..10, 6..8 | includes 23 sq ft nook (8,6) (8,7); door D (9,9) |
| Primary wardrobe | 12..15, 6..8 | door D (13,9) |
| Primary bedroom | 8..15, 10..15 | door from hall D (10,16) |
| Laundry | 5..10, 17..18 and 5..6, 19..20 | washer/dryer (5,20); opens to hall and rear door |
| Pantry storage (12 sq ft) | 7..8, 20 | door D (8,19) ASSUMED A3 |
| Central hall | col 10, rows 19..28 | opens to laundry above and living area below |
| Office | 5..8, 22..26 | only entry via office closet D (7,27) |
| Office closet (10.6 sq ft) | 7..8, 28 | doors D (7,27) north, D (8,29) south |
| Wet bar | (5,28) (6,28) | black cabinet under office wall, faces dining area |
| Jetted tub bath | 12..15, 17..18 | door from hall D (11,17) ASSUMED A2 |
| Guest bath (tub/toilet/sink) | 12..13, 20..22 | door from guest bedroom D (12,23) |
| East storage (37 sq ft) | 15..16, 20..22 | door from guest bedroom D (15,23) |
| Guest bedroom | 12..16, 24..27 | door from hall D (11,24) ASSUMED A1 |
| Kitchen | 11..15, 29..35 | cabinets row 29, counters col 15, island (12,32) |
| Dining | 5..9, 29..35 | table (6,31) 2x3 |
| Living room | 10..15, 36..40 | sectional (10,38..40), TV (15,38) |
| Front entry | 5..9, 36..37 | double door at (5,38) (6,38) |
| Front porch | cols 5..8, rows 39..41 | visual only, blocked |

## 4. Gameplay anchors

| Anchor | Value |
|---|---|
| Spawn | (5,37), facing up, directly above the exit |
| Exit | `E` at (5,38) and (6,38), both route to jpark (4,17). Double door, so two portals. |
| Door cells | 11 `D` cells, table in JSON `doors` |
| Primary lane `=` | spawn, hall, primary suite, deck and backyard route, guest suite, kitchen, living |
| Interactive objects | 40 original objects re-placed (couch is two pieces, list in JSON `objects`), plus 7 collision-only props with no flavor text |
| NPC anchors | none exist today (`npcs:[]`). Proposed TNB at (13,33). |
| Walk-behind zones | 6, in JSON `walk_behind` |

Both leaves of the front door are `E`. The old rule "spawn is the tile above the exit door" still holds.

## 5. Engine findings (read only, nothing modified)

| Question | Finding |
|---|---|
| Backgrounds | `engine/plate.js` `PLATES={town,row,hollow}`, each `{src,px:64}`. A plate is drawn at `map.w*T x map.h*T`, so 64 art px per 32 logic px. Plate replaces tile and object rendering. |
| Collision | `map.solid[y*w+x]`, `walkable()` checks bounds and solid. A plate mask (ASCII, `#` blocks) is applied by `applyPlateMask`; portals always walk, placed objects always block. |
| Per-area resize | Yes. Every map has its own `w`,`h`. `makeRoom` takes `w,h,plan`. |
| Interior plates | `makeRoom` has **no plate or mask support today**. Needed at implementation. `buildArea` has `plateMask`. |
| Movement | 4 direction, one tile per step, 0.14 s. Sprites about 31 x 51 px, feet at tile bottom, drawn 1:1. Followers trail via `trail`. |
| Depth | With a plate, only actors are sorted: `(y+1+depthBias)*T`. Objects are not drawn, so a tall prop cannot hide an actor. **There is no foreground overlay layer.** Walk-behind needs a new overlay or per-prop depthBias. |
| Camera | Maps wider than the view follow the player. Phone portrait shows about 12 x 18 tiles, so 19 cols scrolls horizontally. |
| Transitions | Portals keyed `key(x,y)`. `makeRoom` puts the exit at the door tile and `spawn` one tile above, return target is the house door on jpark. |
| **Gap** | `startMove`, `canOccupy`, `advanceMove`, `position`, `beginTransition`, `updateTransition` are called but not defined in the artifact copy I could read. The artifact is stale scratch; the live build is on GitHub Pages. Movement and transition behavior above is inferred from call sites. Re-verify against the live repo before implementing. |

## 6. Conflicts with the plan and assumptions

| # | Plan shows | Proposal | Reason | Fix type |
|---|---|---|---|---|
| A1 | white bar in guest bedroom west wall, no door | door D (11,24) | suite would be sealed | collision + art |
| A2 | white bar in jetted bath west wall, no door | door D (11,17) | bath would be sealed | collision + art |
| A3 | 12 sq ft storage with only a white bar on its north face | door D (8,19) | otherwise unreachable | collision + art |
| A4 | backyard touches nothing walkable | 3 connector cells off the deck | backyard unreachable. Fallback: fill with `#`, yard becomes view only | collision only |
| A5 | office has no door in its east wall; closet has two door bars | office entered only through the closet | preserves drawn topology | none |
| A6 | 23 sq ft wood nook, no door | open alcove of the primary bath | only access that needs no wall change | none |
| B1 | wet bar not labeled | black cabinet under office wall | matches 5'11" dimension. The dark east cabinet is kept as a "Sideboard" with no flavor text | confirm with Tom |
| B2 | angled bay at dining west wall | straight wall, bay is visual only | 4 direction grid | visual only |
| B3 | storage east of guest suite juts 0.9 tile past house wall | modeled (col 17 wall) | preserves plan | both |
| B4 | porch 137 sq ft | visual only, blocked | outside the exit | visual only |
| B5 | proportions | walls inflate house about 3 rows, 2 cols | 1 tile walls | accepted |

Questions only Tom can settle (none block approval, each has a default above): where the jetted bath and guest bedroom are really entered, whether the backyard should be walkable, which cabinet is the wet bar.

## 7. Overlay caveat

`46_tomhouse_geometry_overlay.png` stretches the 19 x 43 grid onto the 1024 x 1536 painting. Cells are 53.9 x 35.7 px, not square. The painting does not match this geometry, which is the point. A grid drawn over a picture does not validate the geometry; the flood-fill and plan trace do.
