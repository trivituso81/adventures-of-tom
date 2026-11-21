# HEAD SIZE ADJUSTER: BUILT 2026-11-10 (headadj1 tool, headadj2 admin page; main at 737b7d3). The 11-06 design below is kept for what is NOT built yet.

## Status (2026-11-10 17:50)
- Tom 11-06 07:53 asked for it (queued then). Tom 11-10 17:11 said it was to be built next; 17:31 asked for ALL characters, a UI in Admin and a preview of the head on the body. Built: ADMIN > HEAD SIZES (`heads.html`); details in claude/next.md NEWEST K and docs/CHANGES.md "headadj2".
- DIFFERENCES from the design below (decided while building; say so to Tom if he asks):
  - One character at a time, big, with before (game now) and after (your change) on the body, a slider (60 to 150 percent), plus a head row of everyone (chins on a red line, not draggable) and a standing row. Not a single sideways-scrolling row of eight adults.
  - Saves requests to `data/head-requests.json` (not `data/head-adjust.json`); Claude runs `python3 tools/sprite-bake/head_adjust.py apply-requests`.
  - Factor only. NO up/down nudge and NO draggable guide lines yet. The chin line comes from stored chin shares (`WALK_MATCH`, `GROW`, `PLAIN` in walk_sheet_frames.py), so if a chin share is off for someone the head row will not line up by eye and Tom cannot correct it in the page. If Tom says a chin line is wrong for a character, add a per-character chin nudge (a second saved number) to heads.html and `HEAD_TWEAK`.
  - Covered: Justin, TNB, Tom, Boppy, Amy, Deedee, Olivia, Ellie, Grace, Rose, Nara. NOT covered: Jojo (bake_jojo.py solves its own head ratio), Michael (carries two kids), the 21 townsfolk (bake_townsfolk.py has its own `CHIN` table and head target `T`; a factor would multiply `T`). Tom asked for all characters, so these are the next job.

## Original design (11-06)
# HEAD SIZE ADJUSTER (Tom 11-06 07:53). Tom: "add it to the build instructions instead of building it right now."

## Why (Tom's words, paraphrased)
Claude's lines sit at the top of the hair and at a guessed chin row, so heads still look unequal on the welcome page (Tom's reference). Tom wants to line the adult heads up himself, by eye, in one big row, zooming each head in or out. Feature name: "Head Size Adjuster", in the admin section next to the Art Library.

## What to build (design decided here; Tom does not choose options)
- New page `heads.html` (same style as areas.html / art.html), reached from the title-screen ADMIN list like Area Builder (`openAreas` pattern in engine/splash.js) and linked from art.html. Phone portrait first.
- One row of the eight adults at game scale: Tom (the model, not adjustable), TNB, Justin, Boppy, Deedee, Amy, Olivia, Ellie. The row scrolls sideways; two guide lines run across the whole row (red = head top, blue = chin). Tom can drag each guide line; both default to Tom's head.
- Per head: Zoom (+ and - buttons and a slider, 1 percent steps, pinch if easy) and Up/Down nudge. Zoom pivots on the blue chin line (head part only above the chin, body below stays), which is exactly what `kidhead.grow_head` does in the bake. Nudge moves that figure vertically so its real chin can sit on the blue line. Reset button per head and for all. A "show hair-less face height" toggle is optional.
- Pictures: the front stand frame of each adult at game scale, pre-rendered by a small tool (e.g. `tools/headadj_bake.py` writes `art/headadj/<id>.webp` plus `data/head-adjust-base.json`: px per on-screen row, chin row used, top row). Regenerate when a walk is rebaked. Purge rule applies.
- Save: stores in the browser (localStorage) AND commits `data/head-adjust.json` through the same GitHub token the Art Library uses (`aot-gh-token`, helper `gh()` in art.html lines ~345 to 376); fall back to a Copy button when no token. JSON per id: `{zoom: <multiplier on current head height>, dy_rows: <nudge in on-screen rows>}` plus the guide line rows.
- Applying (Claude's job, Tom just says "apply my head sizes"): read the committed `data/head-adjust.json`, then in `tools/sprite-bake/walk_sheet_frames.py` multiply that id's head factor by `zoom` (keep body compensation through `BODY_ROWS_PER_PX`), move its chin px by `-dy_rows` converted to art px (rows / (BODY_ROWS_PER_PX*k)), rebake with `python3 tools/sprite-bake/walk_splice.py <ids>`, bump tags, smoke, look at the welcome screen, push, and tell Tom. Store Tom's final numbers in the repo (this file becomes the new `WALK_MATCH` source of truth) so a later rebake keeps them.
- Show Tom the row image before and after, per the head-row rule in CLAUDE.md.

## Starting numbers (walkhead4, CHANGES 346)
Measured head height top of hair to chin, on the welcome page: Tom 245, Deedee 240, Boppy 240, Justin 250, TNB 255 (2x crop). Suspect: Boppy's chin px (154 vs maybe 150), Amy and Olivia read short (long hair), Justin's spikes count as head top. Lineup picture Tom saw: /tmp lineup (regenerate with the 8-head script; heads at P=30 px per on-screen row, red line = alpha top, blue line = top + 11.17 rows).
Method and method notes: claude/next-addendum-walkhead.md.

## Tests when built
Serve the game, open heads.html at 393x852 and 852x393, check: heads draw, zoom changes only that head, Reset works, Save writes the request file (use the `?gh=` stub, tools/art-library/stub.py; `python3 tools/heads_test.py` does this with its own fake GitHub), nothing in the game itself changes until "apply".
