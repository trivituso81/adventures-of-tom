# NEXT: build Chapter 16, "The Amber Eclipse"

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 15 built. Read docs/C15-DONE.md first (flags, bench state, fight hooks). Then docs/CANON.md (end) and claude/part2-map.md row 16 in the Project.

Task: replace the CHAPTERS[16] stub in engine/story.js (give it party rules; part2-map says Tom, Amy, TNB, Nara fight). Chapter 16: the morning after the dinner, the Square, Vance's "family photograph". Vance fires at Grace and Rose; Deedee and Boppy step in front, arms locked, and turn to stone; Long Island shrinks into a snow globe that Vance takes. No victory fanfare. Boss: Marlowe Transformed. Unlocks none. Add CHSEL_LAST=16 and chselSixteen in engine/chapter-select.js (copy chselFifteen).

Pattern to copy: data/scenes-ch15.js (the fight chained onto the opening scene, pressAction retry, STORY_WORLD), data/ch15-battle.js and data/ch14-battle.js (boss rules as thin wrappers), tools/ch15_test.py. Marlowe debuted in chapter 12 (data/ch12-monsters.js, data/ch12-battle.js).

Carry-over: after chapter 15, TNB and Nara are on the bench and walk with Tom; Deedee and Boppy are home NPCs (they must be petrified in the Square, then absent from the house). Hush chip keepsake `hushchip`; ff3 unlocked.

Tests: python3 tools/smoke.py; tools/bg_test.py; ch11_test.py, ch11b_test.py, ch12_test.py, ch13_test.py, ch14_test.py, ch15_test.py, plus a new ch16 test. Look at tools/shots/ before pushing to main, then check https://trivituso81.github.io/adventures-of-tom/.

Rules: no em dashes in game text, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md.
Known leftovers: Dot says "ten doors" (should be eleven); needs a re-bake, leave unless Tom asks.
