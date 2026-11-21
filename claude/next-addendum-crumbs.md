# next addendum: Grump Hollow crumb trail, chapter 1 (current state = crumbs3, 2026-11-12, main b558697)

History: crumbs1 (11-09) added Art Library sheet `prop-trail-hollow` (9 cells, approved v1). crumbs2 (11-09) drew the nine cells whole. Tom 11-12 14:39 (screenshot): "the crumbs look very strange and the placement isn't right. Make the crumbs make sense in terms of how they are discovered." crumbs3 replaced crumbs2 completely.

## What was wrong in crumbs2 (fact, from Tom's screenshot and the code)
| Problem | Cause |
|---|---|
| Stiff vertical "bead strings" | Sheet cells 3 to 9 are straight rows painted flat; drawn whole they stand up like columns |
| A string on top of THE SQUARE SHOPS board | Piece 3 centred at plate (440,880); the board covers y 890 to 1015 |
| Scatter sitting on the right gate post | Piece 2 at (575,1075) |
| "North" trail ran up the left edge to the old bench | Pieces 4 and 5 at x 420 to 440, y 500 to 700; the story sends the player east right after the arch (Skeeter trigger row 15 and up, Pond Grump row 14 and up) |
| Pink rim on every piece | The cut kept the magenta shadow under each object |
| Pile as big as Tom's torso | Drawn at half the 214 px cut |

## crumbs3 (fact, DONE, pushed, not seen on a phone)
- `tools/sprite-bake/bake_hollow_crumbs.py` cuts single painted bits from the approved sheet (27 crumb clusters, 4 rhubarb pieces, 5 oat flakes, plus the pile of cell 1), keys out the magenta rim, scatters them unevenly along three paths with a soft ground shadow, writes `art/props/hollow/trail_a.webp`, `trail_b.webp`, `trail_c.webp` and prints the `HOLLOW_TRAIL` table for `engine/plate.js` (`drawHollowCrumbs`). `--check` writes tools/shots/hollow-crumbs-check.jpg (trail on the plate).
- Purged: `crumb_1..9.webp`, `HOLLOW_CRUMBS`, `HOLLOW_CRUMB_SCALE`.

| Overlay | Flag (set in data/scenes.js, unchanged) | Shown right before | Where (plate px, 64 per tile) |
|---|---|---|---|
| trail_a | `ch1-crumbs-a` | Deedee: "Crumbs! Rhubarb crumbs. That little thief went right through here." | small pile on the steps at (506,1166), beside the party at tiles (6..7,19..20); bits up to the arch, y 1030 |
| trail_b | `ch1-crumbs-b` | Deedee: "Good job, girls. The crumbs keep going north." (after the Mudling) | from above the board (494,878) north to (506,756), west of the puddle |
| trail_c | `ch1-crumbs-c` | Deedee: "The crumbs go around the pond. Toward Boppy's fishing spot." (after the Pond Grump) | from (546,730) east along the dirt to (1262,694), in front of Boppy's bench |

All hide when `ch1-tin` is set. Nothing is drawn between y 890 and 1015 (under the board).

## To move or restyle the trail
Edit `PATHS`, `PILE_AT`, `STEP` or `SCALE` at the top of the baker, run it with `--check`, look at the picture, paste the printed `HOLLOW_TRAIL` line into engine/plate.js, run `python3 tools/crumbs_test.py` (16 checks; shots tools/shots/crumbs-<view>-*.png in portrait, landscape and Duo), bump tags, push. Do not go back to drawing sheet cells 3 to 9 whole.

## If Tom still dislikes the look
The bits are the approved painting, so a second miss on look means the art, not the placement: say so and add a new Art Library entry by the parts method (single crumbs, each alone), do not keep tweaking sizes.
