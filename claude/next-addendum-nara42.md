# next-addendum nara42 (2026-11-11 ~16:30, main b3c1a02)

## Canon line (to merge into claude/canon-addendum.md under "Sizes on screen", one line)
- 2026-11-11 16:09 (Tom): Nara's height is up to Tom's waist. Typed in `data/heights.json` as `nara: 42` (3'6", about 0.6 of Tom's 5'11); on the map she is 24.85 rows next to Tom's 42. Live in `nara42`.

## Facts
- `data/heights.json` has `nara: 42`; `heights.py write` generates her `OW.nara.k` (0.8015). `NARA_OW_SIZE` (0.9) is purged. `data/walk-scale.js` now loads AFTER `data/nara-hires-use.js` in index.html (needed so her scale is not overwritten).
- Interpretation made: top of her head (front stand frame) reaches Tom's waist. If Tom meant her back/shoulder at his waist, she should be taller: raise the number in heights.json, run `heights.py write`, `heights_test.py`.
- Untouched: battle, knocked out, welcome screen (`NARA_SIZE` 1.15).
- Tests: heights_test ok, smoke FAILS [], tag_check ok, unused_voice 0. Not looked at in a map screenshot; Tom's phone check: walk Nara beside Tom in Jefferson Park.
