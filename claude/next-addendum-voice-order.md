# Voice Library story order (Tom 2026-11-06 12:27): QUEUED LAST (item 7), build nothing until Tom releases it

## Ask (Tom's words)
Add to the end of the build queue: in the Voice Library, dialogue should be sequenced in the order it appears in the story. Duplicates can be excluded.

## Decisions (made, say them to Tom once, do not ask)
- Order key: chapter order first (Part 1 chapters 1 to 10, then Part 2 chapters 11 to 20 as they exist, then the bonus chapter Nine Scoops), then the order the line first occurs inside the chapter (scene steps in data/scenes.js in play order, then map NPC and house dialogue in the order a player meets them, then battle lines tied to that chapter's fights). Lines not tied to any chapter (generic battle barks, menu, shop, emotions) go in a final "Anywhere" block, kept in their current order.
- Duplicates: same speaker plus same text (the existing line key `ch|kind|text`, normalized the way `tools/voice-library` already does) appears once, at its FIRST story appearance. The duplicate is not deleted from the game or the voice files; it is just not listed twice. Do not touch baked clips or the unused_voice check.
- Applies to the Voice Library list and its exports. The per-character view keeps working; add the story order as a sort (default) with the old order selectable if cheap. Do not change line keys, clip names or `data/` files.

## Facts found (check before relying on them)
- The baker/build code already maps lines to chapters: `claude/voice-baker-build.js` builds `list` (chapter number and title) and `lineCh[key]` (sorted chapter numbers per line) by scanning scene sources. Start there instead of inventing a new scan. A line with several chapters should sort by its lowest chapter (first appearance).
- Not verified: how the Library currently orders lines (probably by character then kind), whether `lineCh` covers map NPC dialogue and battle scripts (`battle-scripts.py`, `scanBattle`), and whether Part 2 chapters appear in the same scan. Check these first.

## Steps when released
1. Rebase. Read `tools/voice-library/` (index build in `make-index.js`, `harvest.py`, the UI file) and `claude/voice-baker-build.js`.
2. Build a story-position number per line: (chapter rank, in-chapter order). Within a chapter use source order of the scene or map data; if two sources interleave in play, say which rule was used.
3. Dedup by line key at first appearance. Print counts: total lines, listed after dedup, duplicates dropped, lines with no chapter (Anywhere block).
4. Add the sort to the UI and the exported order; keep character filters and the take/keep logic unchanged.
5. Tests: `python3 tools/serve.py 8000` then `python3 tools/voice-library/test.py`; unused_voice must still show 0; smoke FAILS: []; spot-check chapter 1 opening and one Part 2 chapter in the order a player hears them. Bump tags, add a docs/CHANGES.md entry, push with the procedure in claude/next.md.
6. Tell Tom the first 10 lines of chapter 1 in the new order so he can confirm it matches what he hears.

## Do not
- Delete, rename or re-bake any clip. Never change a baked line.
- Touch Deedee's old-voice list (claude/deedee-old-voice-2026-11-05.md) beyond keeping it working.
