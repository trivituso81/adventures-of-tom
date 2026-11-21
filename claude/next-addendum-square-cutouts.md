# Square v3 cutout masks: check (2026-11-06)

Method (claude/square-v3-install.md): generator layers are MASKS ONLY. Register each piece to the original painting, key out magenta with a tolerance, erode 1 px and feather 1 to 2 px, cut the pixels from the ORIGINAL. No generator pixels reach the game.

## Round 1 (12:55): roofs sheet and street sheet, REJECTED roofs
Roofs came back redrawn about 15 percent larger with different shapes. Superseded by round 2.

## Round 2 (13:12): four new masks, painting 1347 x 1168 (no resize needed; keyed magenta is about 252, 3, 250, flat, noise under 1)
| Mask | Verdict | Detail |
|---|---|---|
| Trees (9 pieces: top-left, 3 top-edge, top-right block, left, right, bottom-left, bottom-center, bottom-right) | USE | Scale 1.00, shift 0. Outlines follow the painted canopies. |
| Roofs (8 pieces) | USE | Scale 1.00, shift 0 (Penny's 2 px). Outlines hug the painted roofs, include chimneys, steam, owl, dome, snail, teapot spout, telescope, awnings. Cut is a scalloped line just below the eaves. Still look at every piece on checkerboard (Library book spines and Moon Club star band come down near the cut). |
| Signs and lamps | USE with 1 exception | 8 building signs with brackets, 3 exit boards, 4 street lamps match the painting (scale 0.94 to 1.00, shift 0 to 2 px). DROP the 8 small wall lanterns: they are not in the painting (match error 40 to 55). |
| Tall props | PARTIAL | USE after per-object scale (0.90 to 0.98) and shift (up to 14 px) fit: fountain upper tiers and spout, 2 plaza benches with flower barrels, library bench, Sprout House plants and wheelbarrow and watering can, mailbox and drop box, parcel stack, globe, telescope, tire stack, taxi, bread barrel, Penny's flower barrel. DROP (not in the painting): cafe table and chairs, velvet rope posts, walking-stick barrel. Flour sacks are redrawn differently from the painted sack: drop or hand cut. |

## Pitfalls for the cut
- Props and signs are each a few percent off in scale and a few px off in position: fit every piece separately, never one global shift.
- Fountain mask includes water arcs: check they match the painted water before cutting.
- Pieces that touch (Sprout House plants and pot) need splitting by base line for y-sorting.
- Show Tom a contact sheet of all pieces on checkerboard plus 4 in-game shots (behind a tree, a lamp, a hanging sign, a roof eave) before pushing.

## Next
Install per claude/square-v3-install.md steps 1 to 5. Needs the painting and the four mask images (Tom re-attaches them in a new session, or this session if it continues).
