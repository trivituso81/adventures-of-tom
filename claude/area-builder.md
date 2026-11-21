# Area Builder: build instructions (written 2026-11-03 18:10, approved by Tom in chat)

Status: SPEC, approved. Not built. Build in the order of section 7. Nothing here is a canon change.

## 1. What it is (one paragraph)
An admin page, like the Art Library and Voice Library, that shows any map's painted plate with the 32 px logic grid over it and color codes every tile: Walkable, Blocked, Door, Exit. The colors are prepopulated from what the running engine actually does (plateMask, object footprints, gates, portals, open borders), not from the ASCII file. Tom can paint over tiles to override them, run a reach check, and export the result. The real game never reads Tom's edits (Tom chose option B, 11-03 18:01): edits live only in the builder page until a Claude session installs the export into data/maps-le.js and pushes with tests.

## 2. Why
Today Claude renders tools/mask_overlay.py, Tom describes tile fixes in chat, Claude edits ASCII rows, repeat. The builder makes Tom's tile feedback exact (he taps the tile) and lets him check reachability himself before sending it.

## 3. Page and placement
| Item | Decision |
|---|---|
| File | `areas.html` at the repo root, next to art.html and voices.html. Same look, same computer layout at 1000 px and up (CHANGES 113), phone first. |
| Link | A row in the admin links where the other libraries are listed. Title AREA BUILDER. |
| Engine | Load the same engine and data scripts index.html loads (plate.js, world.js, maps-le.js and whatever `buildArea` and `makeRoom` need), with the splash hidden. Build a map with the engine's own function so `map.solid`, portals, `border.open`, objects, gates and spawn come out exactly as in play. Verify the handles on `window.__LE` before relying on them; do not copy collision logic into the page. |
| Story state | Gates and story props depend on chapter flags. The builder shows the map at a chosen chapter (dropdown, default: latest chapter). Note the chapter in the export. |
| No tag | Like art.html and voices.html, areas.html carries no `?v=` tag; the scripts it loads keep theirs. |

## 4. Screen
| Part | Decision |
|---|---|
| Map list | Every map id from data/maps-le.js, grouped Outdoor / Houses / Shops / Other, using the game's display name plus the id in small text. Remember the last map in localStorage `aot-areas-ui`. |
| Canvas | The plate at its art size (64 art px per 32 px logic tile; interiors without a plate draw the tile render the game draws). Grid lines 1 px. Column letters along the top, row numbers down the left (A1 style, same as the review images Claude sends). |
| Overlay | One filled square per tile in its class color at an opacity set by a slider (default 45%). Door and Exit draw on top of Walkable. Overridden tiles get a thin white inner border so they stand out from system tiles. |
| Legend and colors | Four swatches: Walkable, Blocked, Door, Exit. Defaults green, red, yellow, blue (the convention already in the review images). Tapping a swatch opens the native color input; choices persist in `aot-areas-ui`. A Reset colors link. |
| Context toggles (view only) | Object footprints (hatched), Walk-behind zones (outline), Spawn (white dot), NPC starts (grey dots), Monster starts (purple dots). Off by default except Spawn. |
| Toolbar | Walk, Block, Door, Exit, Reset tile, Undo, Check, Export, Clear all edits. Portrait: docked at the bottom. Landscape and computer: docked on the right. |
| Zoom | 1x, 2x, 3x buttons; two-finger pan when zoomed; one finger paints. At 1x a tile is 32 css px, which is too small to hit reliably on a phone, so the page opens at 2x on phones. |
| Painting | Tap a tile to set it to the selected class. Drag to paint a path of tiles. Reset tile removes the override so the tile follows the system again. Undo steps back one tap or one drag. |
| Diff view | A toggle Show edits only: system tiles go transparent, overrides stay. |

## 5. Data
| Item | Decision |
|---|---|
| System classification | Per tile, from the built map: Exit if the tile is a portal to another outdoor area or an open border edge tile; Door if the tile is a portal into or out of an interior; Walkable if `walkable(x,y)` is true; Blocked otherwise. Portals always count as walkable underneath. |
| Overrides | localStorage key `aot-areas-edit-<mapid>`: `{ "w":19, "h":43, "chapter":17, "tiles": { "x,y": "W" or "B" or "D" or "E" }, "notes": { "x,y": "text" } }`. Only touched tiles appear. The real game never reads these keys. |
| Door and exit edits | Painting Door or Exit on a tile that is not a portal today marks it NEEDS TARGET (dashed outline) and asks for one line of text ("to Aunt Ellie's house", "exit east to schoolyard") stored in `notes`. Moving an existing portal: select Door or Exit, tap the existing portal, then tap the new tile; the page records `move` from old to new in notes. Wiring the real target (map id, arrival tile, return portal) is done by Claude at install. |
| Export | The Export button copies this to the clipboard and shows it in a text box: `{ "map":"town", "w":..,"h":..,"chapter":..,"tiles":{...},"notes":{...},"system_hash":"<sha of the system classification>" }`. system_hash lets the install session see whether the map changed since Tom edited. |
| Check | Flood fill from spawn plus every exit and door tile over the EFFECTIVE classification (system with overrides applied). Walkable tiles not reached get a red X and the count shows in the toolbar. Same rule as tools/reach_test.py; if the two disagree, reach_test.py is the truth and the page is fixed. |

## 6. Install side (Claude, a new tool)
`tools/apply_walkmap.py <export.json>`:
1. Verify `map`, `w`, `h` against data/maps-le.js and warn if `system_hash` differs from a fresh classification.
2. Rewrite the `plateMask` rows for that map: W becomes a space, B becomes `#`. Tiles not in the export are unchanged. If a B tile is blocked only by an object footprint, leave the mask and report it (the object must move instead).
3. Print every D and E tile with its note. Portal wiring stays manual: Claude edits `exits`, `border.open`, portals and arrival tiles in the neighbouring map by hand and greps scenes for the old tiles (claude/area-paintings.md install procedure, steps 3 to 5).
4. Run `python3 tools/reach_test.py <map>` (0 fails), smoke, camera_clamp, tap_test. Look at the shots in portrait and landscape.
5. Bump `?v=` on data/maps-le.js (and plate.js if touched), CHANGES entry, push (procedure in claude/next.md).
6. Tell Tom to tap Clear all edits for that map in the builder, since the live map now matches.

## 7. Build order
1. areas.html skeleton: map list, canvas with plate and grid, system overlay with the four default colors, chapter dropdown. Test: open `town`, `row`, `grands`, `tomhouse` and compare against `tools/mask_overlay.py <id>` output; every tile must match. Send Tom one screenshot of the Square at 2x in portrait.
2. Painting, undo, reset, diff view, color swatches, persistence.
3. Check (reach) and Export. Test: an export with no edits applied through apply_walkmap.py produces no diff in data/maps-le.js.
4. Context toggles and portal moves.
5. tools/apply_walkmap.py plus `tools/areas_test.py` (Playwright: open page, pick town, paint three tiles, check, export, assert JSON; portrait 393x852 and landscape 852x393 screenshots in tools/shots/).
6. Admin link, docs: add a section to docs/AREA_PAINTINGS.md pointing here, CHANGES entry, push.

## 8. Out of scope (first version)
Editing object footprints or walk-behind zones; wiring portal targets in the page; rectangle or fill tools; any game-side reading of the edits.

## 9. Quality bar
Every screen looked at in portrait and landscape on a 393 px wide viewport before pushing. Tile hit accuracy on a phone is the thing to test by hand: the install session asks Tom to paint one lane on his phone and report whether taps land where he expects.
