# Long Island area paintings: handling Tom's upload (standing rule, 2026-10-30)

Tom is redoing every Long Island outdoor area as a new painting, one area at a time, with Claude writing an image-generator prompt for each (prompts live in the Project as `claude/*-redo.md` and `claude/*-lettering.md`). **Decision (Tom, 2026-10-30): do not install the areas one by one. When all Long Island areas are finished he will upload the pictures (a zip or a batch of images, usually with no words). That means "install these areas". Claude knows what to do from this document.** If he sends only some of them, or one corrected picture, install what arrived and say which areas are still missing. Never ask him to unpack, resize, crop or rename anything.

## Which areas

| Map id | Name | Tiles | Plate size (art px, 64 per tile) | Painting now in the game |
|---|---|---|---|---|
| town | The Square | 30 x 26 | 1920 x 1664 | Tom's approved Library painting area-square v3 (2026-11-05, `square5`, 4:3 trimmed to 15:13), lettered by the generator. LIVE as `square6` (2026-11-06) with a walk-behind layer `art/town-fg.webp` (37 pieces: trees, roofs, 3 exit boards, 4 lamps, props), cut by `tools/make_town_fg.py` from `art/raw/areas/town-v3/`; walk map first pass by `tools/make_town_mask.py` plus `tools/town_mask_hand.json`. Hanging shop signs are not cut (feet are always south of them) |
| row | Rivituso Row | 24 x 22 | 1536 x 1408 | Tom's v2 painting, boards repainted in code, game-drawn lettering (disliked) |
| hollow | Grump Hollow | 24 x 22 | 1536 x 1408 | Tom's approved 11-05 painting (area-hollow-v1, cropped 85 px to 12:11), painted board LONG ISLAND / SQUARE, own cutout layer art/hollow-fg.webp (`hollow4`, tools/make_hollow_fg.py) |
| pier | Cattail Pier | 24 x 22 | 1536 x 1408 | original painting, not redone yet |
| reeds | Whispering Marsh | 26 x 23 | 1664 x 1472 | original painting, not redone yet |
| sundial | Sundial Hollow | 22 x 20 | 1408 x 1280 | original painting, not redone yet |
| schoolyard | Long Island Elementary (yard) | 24 x 18 | 1536 x 1152 | original painting, not redone yet |

Identify each uploaded picture by what it shows (shops around a fountain = town; three cottages = row; pond with a trail = hollow; wooden pier and bait shack = pier; and so on). Check the file name too. The painting must have the same aspect ratio as the plate (width of the map in tiles to height); scale it to the exact plate size (Lanczos), save `art/<id>.webp` at quality 88 (method 6), and bump the `?v=` on that map's `PLATES` entry in `engine/plate.js`. Small deviations from the plate size are normal (the generator returned 1309 x 1201 and 1347 x 1167 for the 1536 and 1920 plates). If the aspect is off by more than 3 percent, crop symmetrically and say so.

## Standing decisions (all Tom's)

1. **The generator paints the sign lettering.** The game no longer draws words on boards. `PLATE_SIGNS` in `engine/plate.js` (and `drawPlateSigns`) stay as a fallback: once a lettered painting is installed for a map, set that map's entry to `[]` (or delete it). Tom disliked the game-drawn serif lettering as plain and out of place.
2. **Check every word letter by letter** against the table below. A misspelled board: install the rest, report exactly which board is wrong, and write a one-board redo note for Tom.
3. **Signs never overlap doors, awnings or lamps.** Allow about 30 px of wall above the door frame or awning. A board touching a door is a defect to report (small touches of a roof or window box are fine).
4. **Exits are clearly marked** with a green board on posts, and the painted opening must match the walk map and the `exits` list. Boards for exits that are closed in the story are drawn anyway (the game adds the fallen branch or gate).
5. **Dead-end paths that look like exits are closed in the painting** with fences and trees, and blocked in the walk mask. The Square has exactly three exits (north steps, south street, east opening). If a new painting shows a path leaving the picture that is not in the exits list, block it in the mask and tell Tom.
6. **Exit boards sit high on tall posts**, not at the foot of short ones.
7. **The Square's fountain is large** (about 5 to 6 tiles across, the plaza centrepiece). Tom asked for this at the very start. The lettered Square he generated on 2026-10-30 (`docs/reference/town_v3_lettered_from_tom.png`) REVERTED the fountain to the original small one. When installing the Square, composite the large fountain from the plate that is in the game now (`art/town.webp` before replacing it; also in git history) onto the new painting: copy the region of about x 640 to 1100, y 540 to 880 (art px of the 1920 plate) with a feathered edge so the cobbles blend, keep the small notice board (Town notice object at tile (9,12), art about x 540 to 590, y 760 to 800) by copying the old plate's region x 500 to 640, y 720 to 840 over the new one. Look at the result at phone size. If the seam shows, ask Tom for a one-line redo ("fountain at the original large size") rather than shipping a visible seam.
8. Do not hand-edit generated or baked data (CLAUDE.md rule 4). Do not reword spoken lines.

## Board text (final wording, all capitals, two lines unless noted)

| Area | Boards |
|---|---|
| town | CRUMB / BAKERY, HUSH / LIBRARY, SPROUT / HOUSE, PENNY'S / POCKETS, SNAIL / MAIL, KETTLE / COTTAGE, MOON / CLUB, TAXI / CO. (shops); exits GRUMP / HOLLOW (north), RIVITUSO / ROW (south), SCHOOL (east, one line) |
| row | GREGORI / HOUSE, RIVITUSO / HOUSE, AUNT ELLIE / HOUSE (houses); exits THE SQUARE / SHOPS (north), CATTAIL / PIER (south, closed until chapter 3) |
| hollow | exit board LONG ISLAND / SQUARE (south, painted); no other signs (the old GRUMP HOLLOW, NO SWIMMING and NOT A FROG tap signs were removed 11-05, CHANGES 188) |
| pier | REEL'S / BAIT (shack), CATTAIL / PIER (sign); exits RIVITUSO / ROW (north), WHISPERING / MARSH (west) |
| reeds, sundial, schoolyard | not decided yet: read the map spec, list its signs and exits, and use short names (two lines, 12 letters or fewer per line) |

The final Square from Tom may use dark brown boards with cream lettering (the generator's choice in v3). That is fine; it is legible and fits.

## Install procedure (per area)

1. Read the map spec in `data/maps-le.js` (search the id: `plateMask`, `exits`, `border.open`, `gates`, `objects`, `npcs`, `spawn`). View the old painting and the new one side by side at half size.
2. Scale and save the plate (see above). Template script: `tools/hollow_signs.py` (plain scale); `tools/make_row_fg.py` scales the plate and builds the cutout layer in one go. Keep the uploaded original in `docs/reference/<id>_<version>_from_tom.png`.
3. Overlay the walk map on the new painting: `python3 tools/mask_overlay.py <id>` writes `tools/shots/mask-<id>.png` (red = blocked). Fix `plateMask` rows wherever the painting changed: closed dead ends become `#`, a moved exit road moves with its tiles. Update `exits`, `border.open` and `gates` to match. Run `python3 tools/reach_test.py <id>`; it must report 0 fails.
4. Objects (signposts, benches, signs the player taps) must sit at their painted things. Painted signs that were removed take their tap target to the nearest new board. NPCs and monsters must start on reachable floor.
5. Scenes: grep `'<id>'` in `data/scenes*.js`, `data/bonus-*.js`, `engine/story.js` for actors, starts and arrivals on tiles that are now blocked or moved (chapter starts, `ch17Place`, door arrivals from neighbouring maps such as `pier` (11,1) from the Row). Gates that the story draws (fallen branch, school gate) must still line up with the openings.
6. Lettering: set `PLATE_SIGNS.<id>` to `[]` (or remove it).
7. Bump `?v=` on `engine/plate.js`, `data/maps-le.js` and any other changed script in `index.html`.
8. Test and look: `python3 tools/smoke.py`, `python3 tools/camera_clamp_test.py`, `python3 tools/reach_test.py <ids>`, and phone-size screenshots (390 x 844 at 3x portrait, 852 x 393 landscape) at every door, exit and sign. Read each sign word in the screenshot. Known: in portrait the title bar or D-pad can cover an exit board when Tom stands right at the exit (the camera stops at the map edge); his sprite draws over boards (no foreground layer).
9. `docs/CHANGES.md` entry (top), commit, `git pull --rebase origin main`, push to `main` (conflicts hit CHANGES.md and index.html every time: keep both sides).
10. Tell Tom in a table which areas are live and which need a redo (with the one thing to fix). Do not say anything is live until it is pushed.

## Where the prompts and history are
Project docs: `claude/square-redo.md`, `claude/square-lettering.md` (Square v2 prompt with lettering, raised boards, closed dead ends, higher south board), `claude/rivituso-row-redo.md`, `claude/rivituso-row-lettering.md`, `claude/grump-hollow-redo.md`, `claude/cattail-pier-redo.md` (SUPERSEDED: asks for blank boards; rewrite with painted lettering). Reference images from Tom: `docs/reference/town_v2_from_tom.png`, `row_v2_from_tom.png`, `hollow_v2_from_tom.png`, `town_v3_lettered_from_tom.png`. Repo history: `docs/CHANGES.md` entries for 2026-10-30 (Square, Row, Hollow).

## Tom's feedback on the current game (for the install to fix)
- Square: the east SCHOOL board looked like it pointed north or west because a cobbled street runs north beside it (the walk map allows walking up it, rows 1 to 7, x 27 to 28); a path leads off the west edge (blocked in the mask but painted open). Shop boards sit 10 to 15 px above door tops, some touch awnings. The RIVITUSO ROW board sits at the foot of short posts. All to be fixed by the new painting plus mask changes.
- Row: the house boards almost touch the doors (about 6 to 10 px); the lettering font does not fit the look and feel.

## Area Builder (areas.html, CHANGES 170, two sections in 189)

First screen (CHANGES 189): AREA MAPS (outdoor maps, Long Island then Los Angeles) and BUILDING INTERIORS (every house and shop room, grouped by the area it sits in). A map is an interior when the engine builds it as a room (`map.outside` false). Both sections open the same editor. Export JSON carries `kind` ("area" or "interior"); `apply_walkmap.py` and `mask_overlay.py` take either. `areas.html?map=<id>` opens a map's editor directly.

Zoom and pan (CHANGES 175): pinch to zoom, two fingers to pan, Hand (pan) tool for one-finger pan, minus, plus and Fit buttons. Ctrl or Cmd plus wheel zooms; middle-drag or Space plus drag pans.
Admin page (title screen > ADMIN > AREA BUILDER) that shows any map's painted plate with the 32 px grid and colours every tile Walkable (green), Blocked (red), Door (yellow) or Exit (blue) from what the running engine builds (`map.solid`, portals). It loads the real game in a hidden frame, so no collision logic is copied. Spec: claude/area-builder.md.
- Tom paints over tiles (Walk, Block, Door, Exit, Reset tile, Move portal, Undo), runs Check (same rule as `tools/reach_test.py`: flood from the spawn; red X on unreachable tiles) and Exports JSON. Edits live only in his browser (`aot-areas-edit-<mapid>`); the game never reads them.
- Install: `python3 tools/apply_walkmap.py export.json` (`--dry-run` first). It rewrites that map's `plateMask` rows (`.` walk, `#` block), skips a Walk edit on a tile an object footprint blocks (the object must move), lists every Door or Exit edit with its note (`NEEDS WIRING` if the tile is not a portal today). Portal wiring (exits, `border.open`, doors, arrival tiles, scene coordinates) stays manual. Rooms with no `plateMask` are only reported.
- After installing: `reach_test.py <map>`, smoke, camera_clamp, tap_test, bump the `?v=` on the data file, CHANGES entry, push, then tell Tom to tap Clear all edits for that map.
- Test: `python3 tools/areas_test.py` (paint, undo, door note, persistence, Check, Export, apply_walkmap dry run, portrait and landscape shots in tools/shots/areas-*.png).
