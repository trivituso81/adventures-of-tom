# amywin1 handoff (2026-11-19 17:05)

SHIPPED: pushed to main as 619a05c (build amywin1) by the same conversation after Tom approved push access. claude/amywin1.patch is history only; do not apply it again.

Tom (16:45): "Amy can't be seen - shouldn't her head be peering out of a window? Why did the party stop when hidden by a sign".
- Cause: the ch1-amy trigger has no `at` region and fires on arrival at the Row steps (13,2), under the LONG ISLAND SQUARE arch cutout.
- Fix: ch1Amy walks Tom (Rose on shoulders) to (8,8) and Grace to (9,8); new prop kind `windowfig` (engine/scene-props.js) shows Amy in the dormer window over the GREGORI door; camera held between; phone dings removed; no spoken line changed.
- Tests: cut_natural_test row (portrait, landscape), theft (landscape): FAILS []. Smoke's only failure (board_sync_test "refuses a build whose card has no after") fails the same on clean main.
- Waiting: Tom card t-amywin1 (play the scene on his phone).
