# next-addendum-tomstretch2.md (2026-11-12 ~19:30, main 05c0c52, CHANGES "tomstretch2")

NEWEST item for next.md (merge this line into next.md at its next rewrite): Tom's new approved stretch sheet is installed, waiting on his phone check.

- Tom 18:45: "approved new images there, implement in the game now". The Art Library entry `tom-stretch-intro` got a new picture, `art/raw/characters/tom-stretch-intro-v1.png` (4 x 2, 8 frames).
- Fact (DONE, pushed, smoke FAILS [], tag_check ok): `bake_story_poses.py` set `tom` cuts the new sheet; frame names `st_stiff` to `st_fresh` and the 42-row standing size are unchanged, so `STRETCH_SEQ` in engine/intro.js needed no edit. Rebuilt `art/chars/tom-story.webp` and `data/story-poses.js` only; every other set reproduced byte for byte. Tags `tomstretch2`.
- Painted as painted: `STRETCH_FIT` (per-frame shrink factors made for the old sheet) was purged. If Tom says a bend or the Stiff frame looks bigger than his standing body on the phone, measure head height against `st_fresh` and either re-add per-frame factors or regenerate that frame in the Library.
- New look in the sheet (part of the picture): red heart under the controller on the shirt, belt, arm hair, small breath puff in Exhale.
- Looked at: all 8 frames in the real arrival (chapter 3 jump), portrait and landscape, 0 errors. Not looked at: the Chapter 1 and Nine Scoops openings (same `stretchStep`), the phone.
- Old sheet `tom-stretch-intro-sheet-v1.png` stays in `art/raw/characters` as version 0 of the Library entry (approved sources stay).
- Tom's check: title stamp `build tomstretch2` or later; any arrival (chapter 1 opening, or a flight home): the stretch should show the new painting, ending with the puff in Exhale.
