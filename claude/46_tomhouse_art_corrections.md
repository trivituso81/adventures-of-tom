# Area 46 art corrections for the next image pass

Source of truth: `46_tomhouse_geometry.json` and `46_tomhouse_walkmap.txt`. Tags: **V** visual only, **C** collision only, **B** both.

## Canvas

| # | Pri | Fix | Tag |
|---|---|---|---|
| 1 | P0 | Output **1216 x 2752 px**, 19 x 43 tiles at 64 px. Not 1024 x 1536. | B |
| 2 | P0 | Flat top-down (or very low tilt) with **no wall faces overlapping floor**. Walls occupy exactly their tile. Isometric wall faces in the current painting hide floor tiles and break the mask. | B |
| 3 | P0 | Room order north to south: backyard, primary wing, laundry and office band beside the hall, guest suite, kitchen, dining, living, entry. House about 1:3, not 2:3. | B |

## Architecture (numbers match overlay circles)

| # | Pri | Fix | Tag |
|---|---|---|---|
| 4 | P0 | **Front door** is a double door in the south wall at tiles (5,38) (6,38). Painting puts the doors near cols 7..9. Spawn tile (5,37) is entry floor. (circle 6) | B |
| 5 | P0 | **Central hall is 1 tile wide** (col 10, rows 19..28) with a wall tile on each side. Painting draws it wider with a runner rug. Keep a narrow runner. (circle 7) | B |
| 6 | P0 | **Office has no door on the hall.** Entered only through the office closet (7..8, 28). Remove the painted door on the office east wall. (circle 1) | B |
| 7 | P0 | **Add the jetted-tub bath**: tub at (15,17..18), toilet (13,18), sink (12,18), door at (11,17). The painting has one bathroom with a shower. (circle 2) | B |
| 8 | P0 | **Guest bath** (12..13, 20..22) holds tub-shower, sink, toilet. Door opens into the guest bedroom at (12,23). | B |
| 9 | P1 | Draw doors on the 11 D cells and 2 E cells, centered in their wall tile, with a one row lintel. | B |
| 10 | P1 | East storage (15..16, 20..22) juts one tile past the east wall. | B |
| 11 | P1 | Backyard strip (8..15, 1..4) with shrubs on row 4 and a hedge tree at (12,3). A path of three tiles joins the deck corner to the backyard at (6,5) (6,4) (7,4). (circle 4) | B |
| 12 | P1 | Remove the porch planter wall as a barrier. The porch (cols 5..8, rows 39..41) is scenery only and never walkable. (circle 3) | V |
| 13 | P1 | West dining wall: draw a plain wall. The painting's long sideboard is not in the plan; the bay window is decoration only. (circle 5) | V |
| 14 | P2 | Primary bath nook (8,6) (8,7): wood floor, open to the bath, no door. (circle 8) | V |
| 15 | P2 | Wet bar is the black cabinet at (5,28) (6,28), facing the dining area. | V |

## Furniture footprints (must match collision exactly)

| Prop | Cells |
|---|---|
| Primary bed | 13..15, 11..13, nightstands (15,10) (15,14), bench (8,11..12) |
| Guest bed | 13..14, 25..27, nightstand (15,25) |
| Dining table | 6..7, 31..33 |
| Island | (12,32..33), kitchen counters col 15 rows 30..34, cabinets row 29 cols 11..15 |
| Sectional | (10,38..40) and (10..13,40), coffee table (12..13,39), TV (15,38..39), PS5 (15,40) |
| Office | daybed 5..7,22; desk (5,25..26); bookshelf (8,24..25) |
| Walk-behind tops | bookshelf, primary closets, kitchen counter, TV: art must not overhang the row to the south |

## Do not

Do not add rooms, windows that look like doors, or extra passages. Keep every walkable lane at least one full tile wide. Keep a 1 tile clear floor in front of every interactive object.
