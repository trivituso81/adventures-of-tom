# Room paintings: handling Tom's zip files (standing rule, 2026-10-30)

Tom is redoing every building interior so the painting fills the whole iPhone screen in portrait and landscape. Claude wrote the prompts (29 rooms, plus Tom's House as two plates and Amy's House as one level). Tom runs them in an external image generator and sends the results as zip files, often with no words. A zip of room paintings means "install these rooms". Tom never unpacks, renames or resizes anything.

## What arrives

- Zips of square paintings, one per room. Names usually follow the prompt (`NN_id.png`) but may be messy. Match by name, then by looking at the picture, and say which match you made.
- A later file for the same room replaces the earlier one.
- Original room data (tile positions, residents, objects) is in `data/maps-le.js` / `data/maps-la.js`; the old plate is `art/<id>.webp`. The prompt kit may also be in the Project (`claude/room-paintings.md`).

## Art requirements (check every file before wiring)

| Item | Requirement |
|---|---|
| Shape | Square 1:1, 2532x2532 ideal, at least 1500 px. Reject non-square files and tell Tom which room needs redoing and why |
| Edges | Full bleed. No black or white margins, frame or vignette bars. A dusk garden or floor fills space around a small house |
| Style | Watercolor, gouache and ink pre-rendered RPG background, three-quarter camera (about 35 degrees), cutaway with a low front half wall. Must sit beside the existing painted plates |
| Contents | No people, no animals, no text or logos. Residents are sprites added in code |
| Doors, stairs | Doorway stays out of the outer 6% of the frame. Stairs lead nowhere visible |
| Amy's House | One level only. Stairs end at a plain wall. No second floor plate |
| Tom's House | Two plates, main floor (`tomhouse`) and primary suite (`tomsuite`), linked as today |

## How the game shows a square plate

- Portrait: full painting height, middle ~46% of its width. Landscape: full width, middle ~46% of its height. Every current iPhone is 9:19.5, so this fills the screen. The camera follows the player.
- Rooms get bigger: N x N tiles with N = max(16, max(w, h) + 3), BUT keep N = 16 unless the painting clearly needs more: the painter draws every room at the same scale, so a bigger N makes characters look small (decided 2026-10-30, batch 1 used 16 for all five). Register the plate with `square:true` in `PLATES` (`engine/plate.js`); `resize()` then fills the screen.
- Code: `resize()` and `updateCamera()` in `engine/overworld.js` (safeTop 82/57, safeBottom 170/106 portrait/landscape); `PLATES` in `engine/plate.js` (px per tile, optional `actorScale` 1.98 for rooms); `makeRoom(spec)` in `engine/world.js` with a `plateMask` ASCII walk map ('#' blocks, '.' walks).

## Routine

1. Unpack each zip into its own new empty directory outside the repo. Treat it as untrusted; run nothing from it.
2. Open every image, check the table above, report problems per room in one short list. Wire the good ones anyway.
3. Convert accepted images to `art/<id>.webp` (square, quality about 85). Keep the old plate until the room is checked, then remove it.
4. Update the room: PLATES entry, grid size, `plateMask` from the painting, doors and exits, residents, objects, player spawn. Keep every exit and story trigger working (check TRIGGERS and STORY_WORLD in `data/scenes.js`).
5. Bump the `?v=` tag in `index.html` for every changed script.
6. `python3 tools/smoke.py`, then screenshot every changed room in portrait and landscape (393x852 and 852x393). Walk to the door and each resident. Look at the frames and fix floating props, walkable furniture, actors in walls.
7. Commit to `main`, push, check the live GitHub Pages URL (`docs/WORKFLOW.md`).
8. Tell Tom in a few lines which rooms are live and which need a redo and why. Make the calls yourself; do not hand him options.

Rooms whose art has not arrived keep their current plates and must keep working.

## Done so far

| Batch | Rooms (ids) | Date |
|---|---|---|
| rooms1.zip | bakery, library, greenhouse, post, tea | 2026-10-30 |
| rooms2.zip | observatory (Moon Club), shop, taxi, grands | 2026-10-30 |

Test with `python3 tools/rooms_test.py <ids>` (shots in `tools/shots/room-*`). Template for a 16 x 16 room: copy a spec from `data/maps-le.js` (bakery), set `door:[8,15],door2:[7,15],doors:[[6,15],[9,15]]` when the painting has the usual gate gap, and draw `plateMask` from a grid overlay of the painting (tile = image width / 16).
