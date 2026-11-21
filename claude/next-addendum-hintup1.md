# hintup1 (2026-11-12 23:50 PT, main 332d026): interaction prompt above the A, menu and save buttons, sideways on Duo and tablets

- Tom 23:19: the prompt ("A . Talk to Marisol") overlapped the A, menu and save buttons at the bottom left; he wanted it just above them.
- Fact: one CSS rule in index.html, `html.tablet.landscape #hint`, changed from bottom 24 x `--ts`, left 76 x `--ts` to bottom 82 x `--ts`, left 73 x `--ts` (A's left edge). Measured at Duo 951 x 648: prompt bottom 546 px, buttons top 566 px.
- Phone landscape and all portrait layouts unchanged (A is on the right there).
- Not played on a phone. If Tom says the prompt now collides with the quest text (it opens upward from the button row, `html.duo.landscape #hud #objective`), raise the prompt or open the quest text higher.
- No tag bump needed (index.html is always fetched from the network). docs/CHANGES.md entry `hintup1`.
- next.md was NOT rewritten this session (other sessions edit it; this change leaves the ORDER NOW list unchanged). The next session still starts at ORDER NOW item 1 or 2 in claude/next.md.
