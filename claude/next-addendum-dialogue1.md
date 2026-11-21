# dialogue1 (2026-11-12 ~19:00, main 04f53d0): dialogue box lifted so the portrait is not cut off

- Tom 18:41 (screenshot of Bev's box): the very bottom of the dialogue portrait was cut off. Ask: shift the dialogue row up slightly.
- Fact (cause): `#dialog` sat at `bottom:0` and the portrait is pinned top 0 to bottom 0 inside it, so its bottom edge ran into the stage's rounded corner.
- Fix (fact, CSS only, index.html right after `#dialog-portrait img{object-fit:cover}`): `#dialog{bottom:10px;border-bottom:2px solid var(--edge);border-radius:8px}`, landscape `bottom:8px`, portrait corners `6px 0 0 6px`. No JS change; `fitDialogPortrait` still sizes the portrait from the box height.
- Checked: real browser 390 x 844 and 844 x 390 (Bev line); portrait bottom sits 2 px inside the box edge, full chin visible. smoke FAILS [], tag_check ok. Stamp `build dialogue1`.
- If Tom wants more or less lift: change the 10px / 8px values only. If another overlay (choices, shop) now looks off because it assumed the box was flush to the bottom, check `#dialog-choices` layouts first.
- Next session: unchanged, see claude/next.md (default: Row 2 of claude/closeup-plan.md).
