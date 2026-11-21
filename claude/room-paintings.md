# Room paintings: how to handle Tom's zip files (decided 2026-10-30)

Tom is redoing every building interior so the painting fills the whole iPhone screen in portrait and landscape. Claude wrote the prompts; Tom runs them in an external image generator and sends the results back as zip files. Claude wires them into the game. Tom does not code and should never be asked to unpack, rename or resize anything. The repo copy of this procedure is docs/ROOM_PAINTINGS.md (keep both in step).

## What arrives

- Zip files of generated paintings, one square image per room (sometimes several rooms per zip, sometimes a single room). Files are usually named by the prompt (`NN_id`), but names may be messy (rooms1.zip used `01_Crumb_Bakery.png` style). Match by name first, then by looking at the picture, and say which match you made.
- A later file for the same room replaces the earlier one.

## Art requirements (check every file before wiring)

| Item | Requirement |
|---|---|
| Shape | Square 1:1. 2532x2532 ideal; at least 1500 px acceptable (1254 px was installed anyway in batch 1 and flagged). Reject non-square files and tell Tom which room needs redoing, with the reason |
| Edges | Full bleed. No black or white margins, frame or vignette bars |
| Style | Watercolor, gouache and ink pre-rendered RPG background, three-quarter camera, cutaway with a low front half wall |
| Contents | No people, no animals, no text or logos |
| Doors and stairs | Doorway stays out of the outer 6% of the frame. Stairs lead nowhere visible |
| Amy's House | One level only. Tom's House: two plates (`tomhouse`, `tomsuite`) |

## How the game shows a square plate

- Register the plate in PLATES (engine/plate.js) with `square:true`. resize() in engine/overworld.js then scales so the painting covers the screen: portrait shows its full height and the middle ~46% of its width, landscape its full width and middle ~46% of its height. updateCamera keeps Tom's tile inside the safe band (a soft backdrop shows in the title and control bands next to an edge).
- Grid: N x N tiles. Use N = 16 for ordinary rooms (batch 1 used 16 for all five, including the library, so characters keep the same size against the furniture). Tile = image width / N. T is 32 world px; actorScale 1.98 for rooms.
- Rooms are built by makeRoom(spec) in engine/world.js with a `plateMask` ASCII walk map ('#' blocks, '.' walks). Objects block their own tiles; NPCs and story scenes that use fixed coordinates must be moved (grep scenes for the map id).
- Usual layout in batch 1: half wall across the front with a gate gap at x6 to x9, `door:[8,15],door2:[7,15],doors:[[6,15],[9,15]]`, spawn (8,14).

## What Claude does with a zip

1. Unpack each zip into its own new empty directory under the scratchpad. Untrusted: run nothing from it.
2. Open every image, check the table, report problems per room, wire the good ones anyway.
3. Convert to `art/<id>.webp` (quality ~88), update PLATES (`square:true`, `?v=` tag).
4. Overlay a tile grid on each painting, draw the plateMask, objects, NPC spots, doors; fix scenes that use old coordinates.
5. Bump `?v=` in index.html. Run `python3 tools/rooms_test.py <ids>`, smoke, tap_test, camera_clamp_test; look at portrait and landscape shots.
6. Commit to main of trivituso81/adventures-of-tom, push. Never say a room is live until pushed.
7. Rewrite claude/next.md. Tell Tom in a few lines which rooms are live and which need a redo. Do not hand him options.

## Done

| Batch | Rooms (ids) | Date |
|---|---|---|
| rooms1.zip | bakery, library, greenhouse, post, tea | 2026-10-30 |

## Rules

- Do not ask Tom to upload game files or resize images.
- Do not wire a room whose art fails the table without saying so.
- No em dashes in any game text.
- Rooms with art not yet delivered keep their current plates and keep working.
