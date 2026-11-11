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
- Code: `resize()` and `updateCamera()` in `engine/overworld.js` (safeTop 82/57, safeBottom 170/106 portrait/landscape); `PLATES` in `engine/plate.js` (px per tile; each room's character scale is `ROOM_SCALE`, see below); `makeRoom(spec)` in `engine/world.js` with a `plateMask` ASCII walk map ('#' blocks, '.' walks).

## Character scale (per room, CHANGES 431)

Every room has its own character scale, measured from its painting (Tom 2026-11-07). People do NOT change size by row (Tom 2026-11-10, flatscale1): each room has one size, the middle of its front and back numbers.
- `ROOM_SCALE` in `engine/plate.js`: per room `front:[floor y, art px per foot]` and `back:[floor y, art px per foot]`, in art px of the 1254 px painting. Front comes from the low front half wall (taken as 3 ft); back from a back-wall door (6 ft 8 in), a counter (3 ft), a table or bar stools (2.5 ft). Floor-plan rooms (Amy's house, Tom's house, Tom's suite) use about the same value front and back.
- `actorK(feetY)` draws Tom at 5 ft 11 at one size per room (`roomPxPerFoot` ignores the row); everyone else follows from their real height (each set's `k`). `OW_TOM_ROOM_WORLD_H` (58.1) is Tom's drawn height at actorK 1: re-measure it if `OW_PLAYABLE_BOOST_INDOOR` or `OW_HOUSE_PARTY` in `engine/town-render.js` change.
- New room: measure the two points on the painting (open it with a 50 px grid), add the row to `ROOM_SCALE`, then run `python3 tools/room_scale_test.py <id>` and look at `tools/shots/rscale-<id>-*.png`.
- Tom says a room is too big or too small: change that room's numbers only (bigger number = bigger characters; front for the door end, back for the far wall).

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
| amyshouse.zip | amyhouse (ground floor; second-floor image not wired) | 2026-10-30 |
| tomshouse.zip | tomhouse (main floor), tomsuite (primary suite) | 2026-10-30 |
| rooms3.zip | elliehouse, coffee, ramen, juicebar, nickels | 2026-10-30 |
| rooms4.zip | wardrobe, cinema (starlite), boards, lacab | 2026-10-30 |
| rooms5.zip | casa, loftlobby, lofts, tower | 2026-10-30 |
| rooms6.zip | creole, pupuseria, jordansam, dakota | 2026-10-30 |

Test with `python3 tools/rooms_test.py <ids>` (shots in `tools/shots/room-*`). Template for a 16 x 16 room: copy a spec from `data/maps-le.js` (bakery), set `door:[8,15],door2:[7,15],doors:[[6,15],[9,15]]` when the painting has the usual gate gap, and draw `plateMask` from a grid overlay of the painting (tile = image width / 16).

## Editing a room's walk map (Area Builder, CHANGES 189)

Title screen > ADMIN > AREA BUILDER > BUILDING INTERIORS. Tom paints Walk and Block on the square plate with the same grid tools as the outdoor areas and exports; `python3 tools/apply_walkmap.py <export.json> --dry-run` rewrites that room's `plateMask` (rooms are found by `{id:'<id>',w:`). Door tiles stay portals; the outdoor side of a door is edited in the area. Check with `tools/mask_overlay.py <id>` and `tools/reach_test.py <id>`.
