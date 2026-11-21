# next-addendum: clubwalk1 (2026-11-11 13:30, main 2a4a214)
- Tom sent two Area Builder exports (moonclub, dome). Installed with `tools/apply_walkmap.py`: moonclub 108 mask tiles, dome 32. No door or exit edits.
- Two object edits so Tom's Walk tiles open: moonclub Potted palm (8,11) moved to (11,11); dome Old telescope 3x3 shrunk to 3x2.
- Tests: reach_test moonclub and dome 0 fails, moonclub_test 0, dome_test 0, smoke FAILS [], tag_check ok. Tag `maps-le.js?v=clubwalk1`.
- Not looked at: portrait and landscape screenshots of the palm's new spot (11,11). If Tom says the palm looks wrong, the palm is drawn by `clubPaint` in engine/club-render.js; move the object entry in data/maps-le.js (moonclub objects).
- Does not change the ONE NEXT TASK in claude/next.md.
