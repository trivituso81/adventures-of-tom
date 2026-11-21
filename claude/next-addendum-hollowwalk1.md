# Grump Hollow walk map installed (hollowwalk1, 2026-11-09)

- Source: Tom's Area Builder export for map `hollow` (chapter 20 view, system_hash 97bdfd46). 28 tiles changed, no door or exit edits, no object conflicts.
- Installed with `tools/apply_walkmap.py`. Only the hollow `plateMask` rows in `data/maps-le.js` changed.
- Tests: `tools/reach_test.py hollow` 0 fails. `tools/mask_overlay.py hollow` looked at (tools/shots/mask-hollow.png). `tools/smoke.py` FAILS [].
- Tags: `data/maps-le.js` and the build stamp in `engine/main.js` moved to `hollowwalk1`.
- Pushed to main at 462831a (CHANGES "hollowwalk1").
- Tom to do on his phone: tap Clear all edits for the hollow map in the Area Builder, then walk the hollow in portrait and landscape.
- Not done in this session: claude/next.md still lists ORDER NOW 0b (crumbs) as the next task. This change does not affect it.
