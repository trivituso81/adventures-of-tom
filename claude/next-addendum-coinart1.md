# coinart1 (2026-11-14, main 913a7ff): Director's Cut and Iron Gill coin sheets installed. Newer than claude/next.md. Read with next-addendum-ch4build1.md.

## What was done (pushed; smoke FAILS [], tag_check ok)
- ORDER NOW item 0 (six talking sheets) was ALREADY DONE by another session (talk3, main 8384f23) when this session reached it. This session baked the same six independently and the files came out byte for byte identical, so nothing was pushed for it. Do not redo it. Remaining talking sheets: Amy, Justin, Aunt Ellie, Olivia (not approved).
- ch4build1 NEXT item 1, partly: the approved Library sheets `ch4-directorscut-coin` (v2) and `ch3-irongill-coin` (v1) are now the battle and map sheets of the Director's Cut and Iron Gill. Method: both ids added to `CHAPTER_SHEETS` in tools/sprite-bake/bake_foe_sheets.py (same hook as chapter 1's Big One); a rebake with no change first reproduced the old files exactly. Rebaked art/foes/{directorscut,irongill}.webp, data/foes/*-hires.js, portraits/foes/{directorscut,irongill}.webp. Contact sheets looked at: coin visible in all six frames of each.
- Iron Gill: eye and mouth points (MARK in bake_foe_sheets.py) re-measured on the new stance by eye; portrait uses a hand crop `CROP_FOR['irongill']` in bake_foe_portraits.py (the automatic crop cut off the eyes; the second eye only peeks out in this pose).
- docs/CHANGES.md `coinart1`.

## NOT done
- No fight against either boss was looked at on screen, no landscape, Duo or phone. Check that Boop, Flashcard Flurry, pie tin and lock reticle still land on Iron Gill's eyes and mouth (hand-measured marks).
- Director's Cut ENDING sheet (ending-directorscut-v2) has no coin; left as is.
- Still stand-ins (ch4build1 list): ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1/2 (approved files exist in art/raw/characters and art/raw/*, not installed; each needs a decision on which scene frames they replace), ch3-tom-net, ch5 pieces, grey circle (ch4-stage7-grey not returned). ch4-megaphone-normal waits until after chapter 6.

## NEXT SESSION
0. Tom's play report on chapters 2 to 4 first, if any.
1. Install ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1/2, ch3-tom-net (look at each sheet, read how ch4build1 stand-ins use existing frames: docs/CHANGES.md `ch4build1`).
2. Update claude/story-build.md board (chapters 2, 3, 4 BUILT, waiting on Tom to play) and fold the ch2build1, ch3build1, ch4build1 and this addendum into next.md, then delete the addenda.
