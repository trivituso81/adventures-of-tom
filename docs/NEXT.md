# NEXT: build Chapter 15, "The Eight-Seat Dinner Table"

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 14 built. Read docs/C14-DONE.md first (flags, Warden fight hooks, party rules). Then docs/CANON.md and claude/part2-map.md row 15 in the Project.

Task: replace the CHAPTERS[15] stub in engine/story.js. After ch14-done, Deedee and Boppy are back inside the Rivituso house and TNB and Nara are at the breach. Chapter 15: all eight (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara) at one table. Deedee feeds Nara crust and dotes on TNB; Boppy's pepper contest with TNB and a gruff nod; HUSH-9 crashes dinner (final form, whole bench, ally swapping) and loses. Unlock ff3. Add CHSEL_LAST=15 and chselFifteen in engine/chapter-select.js.

Pattern to copy: data/scenes-ch14.js (flow, STORY_WORLD, pressAction wrapper), data/ch14-battle.js (boss rules by wrapping engine/battle2.js), engine/chapter-select.js chselFourteen, tools/ch14_test.py. For a Shake-style boss copy data/ch13-battle.js. The bench: engine/bench.js.

Tests: python3 tools/smoke.py; tools/ch11_test.py, ch11b_test.py, ch12_test.py, ch13_test.py, ch14_test.py, plus a new ch15 test. Look at tools/shots/ before pushing to main, then check https://trivituso81.github.io/adventures-of-tom/.

Rules: no em dashes, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md.
Known leftover: Dot says "ten doors" (should be eleven); needs a re-bake, leave unless Tom asks.
