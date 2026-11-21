# Long Island areas 03 to 07: handoff for the next conversation (2026-11-02)

Tom starts a new conversation to run the remaining Long Island outdoor areas. Prompt pack: claude/li-areas/ (00_READ_ME_FIRST.txt, then NN_area_painting.txt and NN_area_cutouts.txt for 03 Grump Hollow, 04 Cattail Pier, 05 Whispering Marsh, 06 Sundial Hollow, 07 Long Island Elementary schoolyard). Current zip sent to Tom: Long_Island_Areas_03-07_Prompts_v2.zip.

Status of 01 and 02: Square v3 and Row v3 approved; stencils being made; install pending (claude/square-v3-install.md, claude/row-v3-plan.md, claude/row-v3-install.md, claude/row-v3-cutout-prompts.txt).

## Result log
- Tom must PASTE the prompt text into the generator, not attach the .txt file (attached, the generator reviews the file instead of drawing). Never paste the read-me or handoff into the generator.
- 03 Hollow v1 (10:48): style, pond, both benches, clearing, LONG ISLAND / SQUARE spelled right and high. Miss: camera far too close; the picture is a zoomed-in corner (bench about one sixth of the width, board about one third), so game characters would be tiny next to the props. Cause: the natural-area prompts had no size anchors (town prompts got scale from building widths). Fix (v2, all five painting prompts): a SCALE AND CAMERA DISTANCE block (person about 1/15 of picture height, paths about 1/12 width, exit board about 1/7 width, bench 1/12, shack 1/5, sundial 1/8, cars 1/12). If v2 is still zoomed in, that is the second miss: stop-loss, change method (for example a reference to the approved Row painting attached as scale reference, if Tom allows, or say so).
- 03 Hollow v2b (2026-11-02, later session): the 03 painting file in this folder was strengthened before Tom ran it (NOT yet run, no result). Changes to the SCALE block only: "drone shot of the entire hollow", wide forest margin on every side, do not crop any landmark at the edge, about thirty people shoulder to shoulder span the picture width, clearing about one third of the width and mostly empty, at least eight trees visible, entrance fence only one person tall, benches look small. Everything else is unchanged from v2. Run in a NEW chat, pasted as text. If this still comes back zoomed in, that is the second scale miss for Hollow: stop-loss, ask Tom to attach the approved Rivituso Row painting as a scale-only reference (one line: "match the camera distance of the attached, not its content"), and apply the same v2b scale wording to areas 04 to 07 before they are run.

## Standing rules (all from Tom, in claude/project-instructions-box.md v7)
- Never ask the generator to edit; a miss means a corrected full prompt run in a NEW chat. Only exception: the stencil (mask) prompts, used only as masks.
- Walkable maps; every exit connects to every landmark; buildings freestanding.
- Generator designs and letters every sign in theme; freestanding signs only as exit boards, high on two posts, set back from the bottom edge.
- Words leading to the Square read LONG ISLAND / SQUARE. House signs: family name only.
- No collectibles or interactive items painted; anything that changes in the story is painted in its open state and the game draws the changing part.
- Painting and walk map must line up; rebuild the mask from the painting.
- Cutouts: from the ORIGINAL painting, using generator stencils as masks only; check each piece; show Tom before pushing.
- Stop-loss: two misses the same way means stop and change method.

## Review procedure for each returned painting (do this before sending stencils)
1. Size and aspect against the plate (table in 00_READ_ME_FIRST.txt). Scale: a person should be about 1/15 of the picture height (one and a half tiles).
2. Read every sign letter by letter (crop and zoom).
3. Exit boards high enough (board bottom above a character's head at game scale), exits open, no extra exits.
4. Draw the walk map on the plate's tile grid (w x h from data/maps-le.js) with labels A1 style (columns letters, rows numbers), green walk, red blocked, yellow doors, blue exits; flood fill from the exits must reach every walkable tile; send it to Tom with SendUserFile (render). Also send a cutout plan (boxes per class, numbered, legend).
5. Apply Tom's tile feedback, re-render, repeat until he approves. Then give him the stencil prompts (adjust object names to what was actually painted).
6. Save the approved mask and piece list as claude/li-areas/NN-plan.md.

## Install notes per area (game side, for the install session)
| Area | Notes |
|---|---|
| 03 hollow | Remove tap objects for painted signs that no longer exist (Crooked sign, Pond sign, Warning stake); keep Soggy bench and Boppy's fishing spot on their painted tiles. Exit south to town. ch1Pond scene positions to recheck. |
| 04 pier | Exits north to row, west to reeds (update reeds east arrival). Remove Pier sign object. Reel NPC by the shack counter. Tackle box object on the platform. |
| 05 reeds | Exits east to pier, top left to sundial. The 'reedwall' objects block the top-left path until ch3OpenReeds; the painting shows the path open. Remove Marsh sign and Rotten signpost objects. |
| 06 sundial | Spillway channel painted DRY; the game draws water over it and keeps drainOpen tiles blocked until ch3DrainSpillway. Remove Mossy sign and Pool marker objects. Sundial object on its painted tiles; coin is a game overlay. |
| 07 schoolyard | Exits west to town, front doors to school. Remove marquee and Snail stone objects (no freestanding signs); move the marquee's chapter text to the school-name letters or drop it. Cars, bike rack, benches, swings, slide on their painted tiles. Bottom and right edges closed. |
