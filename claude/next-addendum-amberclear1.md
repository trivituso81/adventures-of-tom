# amberclear1 (2026-11-12 ~22:30 PT, main ae42c21): chapter 12 explains amber

Tom 21:17: people are suddenly in amber and nobody says what amber is. Source: claude/dialogue-ch12-amber-delta.md (+ .json).

## Fact (pushed)
- data/scenes-ch12.js: 9 lines reworded, 10 added (ch12Marlowe 9, ch12Carmen 5, ch12Alvarez 3, ch12After 2 touched; 19 lines to record, list in docs/CHANGES.md `amberclear1`).
- Staging: `ch12AtWashington()` (data/scenes-ch12.js, above `SCENES.ch12Marlowe`) puts Tom 2 tiles below Mr. Washington facing up, TNB beside him, others spread, camera on him, `{zoom:1.7}` (the jpark camera cannot scroll vertically, so without zoom he sits under the dialogue box). `{zoom:1,time:.6}` and `{cam:null}` follow the "neighbors" lines.
- Voice: 8 old clips purged (docs/PURGED_VOICE.md). Needed `python3 tools/voice-library/harvest.py` BEFORE `make-index.js` for new scene lines to appear (index lists only harvested lines). Stale entries in tools/voice-library/scripts/zz-v4-overrides.json updated to the new wording. Emotion rows in docs/emotion-index-lines.tsv updated, `emotion-apply.py $(seq 1 21)` rerun. Index: 19 under No clip yet.
- Canon: amber line added to docs/CANON.md and this Project's claude/canon-addendum.md.
- Tests: smoke FAILS [], tag_check ok, `tools/amber_test.py` passes portrait and landscape, unused_voice.py 0 on all five, Marlowe scene frames viewed (portrait).

## Not done
- Carmen, Alvarez and After scenes not rendered. Not played on a phone.
- Long lines (up to 175 characters, same as the longest page Phase 1 kept) not measured against the portrait box: a DOM measure of `#dialog-text` returned nothing usable (text is not in the DOM when read). If Tom reports a cut-off page in these scenes, split that line at a sentence break into two strings (it has no clip yet, so splitting costs nothing).

## Tom must
- Record the 19 lines in the Voice Library (No clip yet, chapter 12), then export pending and send it; merge per "Phone clip exports" in claude/next.md.
- Play chapter 12 from Marlowe through Alvarez and the ending. Check: after Marlowe's snap the camera zooms on Mr. Washington with the family around him; TNB explains amber; Carmen and Alvarez scenes repeat the rule; the ending has Grace and Tom talking about Deedee.
