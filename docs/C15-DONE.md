# Chapter 15 done: The Eight-Seat Dinner Table

Status: built end to end, tested (smoke, bg_test, ch11, ch11b, ch12, ch13, ch14, ch15), not yet baked for voice.

## Flow
ch14-done > walk into the Rivituso house (trigger on the grands map) > ch15Open (card 15; chapter 15 rules; Tom, Amy, Grace, Rose out front, Deedee, Boppy, TNB, Nara on the bench; a six-wide dinner table appears and all eight sit; Deedee feeds Nara crust and dotes on TNB; Boppy and TNB pepper contest, draw, Boppy's gruff nod "...You'll do."; toast; the laughing goes silent) > HUSH-9 Final Form walks in and the fight starts at once (ch15Fight; talk to HUSH-9 to retry after a loss) > ch15After (chip cracks; kind route has HUSH-9 given a seat; Vance's message "Tomorrow, the Square. Bring everyone. I would like a family photograph."; Hush Chip keepsake; Deedee and Boppy "Fifty-one years." / "And counting, Robert."; ff3 unlocks; table goes; Deedee and Boppy go back to their NPC spots) > ch15-done.

## Flags
ch15-open, ch15-fight, battle:hush9final, kind:hush9final (count, set when the Un-Grump route wins), ch15-after, ch15-done, tombo:ff3.

## Files
New: data/ch15-monsters.js (HUSH-9 Final Form sprite and monster), data/ch15-battle.js (boss numbers, B2_HUSH_LINES, Shake-style words, reserves, dining room backdrop key), data/scenes-ch15.js, bgs/18-dinner-table.png (576x324, drawn with PIL), tools/ch15_test.py, docs/dialogue-scripts-ch15.json. Edited: index.html (three script tags), engine/story.js (CHAPTERS[15]), engine/chapter-select.js (CHSEL_LAST=15, CHSEL_LEVEL[15]=20, chselFifteen), engine/battle2.js (praise pool: hush9final).

## Rules to carry into ch16
- After ch15-done TNB and Nara are still on the bench and walk with Tom. Deedee and Boppy are home NPCs again. Chapter 15 party rules: lock tom, grace, rose; allow amy, deedee, boppy, tnb, nara. Chapter 16 needs its own CHAPTERS[16] rules (part2-map: Tom, Amy, TNB, Nara).
- HUSH-9 is done as a villain: it delivers Vance's invitation and leaves. Its chip is the keepsake `hushchip`.
- Fight: HUSH-9 Final Form is a Shake-style boss (B2_SHAKE_STYLE.hush9final): Dead Air every third turn (telegraphed), Hushlings below half HP, hush chip broken by Chatter or Kinetic hits or a Tombo, Total Silence if the chip holds. Kind route PULL UP A CHAIR x3. BENCH CALL works because data/ch15-battle.js wraps b2Start to give the fight reserveIds from the bench (all four).
- Dining room battle picture: battleBgKey returns 'dinner' while a hush9final foe is in the fight.
- Known: the Dead Air and Total Silence telegraphs were not seen in an automated run (the test party won first); the code is the same as the Drill Worm's.
