# Square v3: install plan (rewritten 2026-11-01 22:25 ET)

SUPERSEDES for the Square: the Square section of claude/next.md, claude/square-kit-handoff.md, claude/square-kit2-*, claude/square-cutout-spec.md decisions and every older square prompt. Rules in force: claude/project-instructions-box.md v7 (navigation, walk-map alignment, cutout method, overlays for collectibles, no generator edits except masks). Tom will start the install session with the approved painting plus 4 mask images attached.

Tom approved the v3 Square render (prompt: claude/square-spec-prompt.txt v3). 1347 x 1167 px, aspect 1.1542 (plate 1920 x 1664 is 1.1538, no crop). The painting supports walk-behind (bases visible, ground around every tall object, nothing touching).

## Cutout method (Tom 22:07: sandbox-only cutouts looked bad before, background got cut with the object; do it right)
Cause of the old failures: masks drawn by Claude from color and hand polygons do not know where a canopy or bracket ends, so paving and wall came along.
Right way, used before for DTLA (claude/dtla-cutout-layers-prompt.txt):
1. Tom sends the four MASK prompts (claude/square-v3-cutout-prompts.txt) in the same generator chat: 1 trees, 2 posts/lamps/signs, 3 roofs/eaves/awnings, 4 tall props. Exception to the no-edits rule: mask layers only, never used as art.
2. Claude uses each result ONLY as a mask: register it to the original (feature matching plus per-object local shift, because generators drift a few px), threshold magenta with a margin, clean islands, erode 1 px and feather 1 to 2 px, then cut the pixels from the ORIGINAL painting. No generator pixels reach the game.
3. Split each mask into separate pieces (connected objects) with their own base line (lowest painted ground-contact row) for y-sorting.
4. Look at every piece at full size on a checkerboard and on bright green; any piece carrying paving, wall or grass beyond its own base is fixed by hand or dropped. Show Tom a contact sheet of all pieces plus 4 in-game shots (behind a tree, a lamp, a hanging sign, a roof eave) before pushing.
5. If a mask comes back unusable (redrawn layout, objects missing), cut only that class by hand with the same check, and say which.

## Install steps
1. Upscale to 1920 x 1664 (Lanczos), save `art/town.webp` q88 m6; keep original in docs/reference/town_v3_from_tom.png. Scale masks the same way after registration.
2. Rebuild `plateMask` for `town` FROM the painting: `tools/mask_overlay.py town`, fix doors, exits (north stair top, right lane, bottom lane under RIVITUSO / ROW), building footprints, fountain, benches. Move objects and door portals to their painted tiles; NPC starts on walkable tiles; grep scenes for `'town'` tiles that are now blocked. Send Tom the overlay image.
3. `PLATE_SIGNS.town = []` (lettering is painted).
4. Foreground layer `art/town-fg.webp` plus zones in `PLATE_BEHIND.town` (same shape as `grands3d`, tools/make_grands_fg.py).
5. Tests: reach_test town (0 fails), camera_clamp, rooms_test, smoke. CHANGES entry, `?v=` on plate.js and maps-le.js, ART_V, push (procedure in claude/next.md).
6. Interactives stay overlays or tap targets, never painted.
7. At the end, rewrite claude/next.md (re-read and merge first): replace its Square section with a pointer to this doc and the result.
