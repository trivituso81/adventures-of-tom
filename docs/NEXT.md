# NEXT: build Chapter 14, "The Rikers Wall of Rivituso Row"

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 13 built. Read docs/C13-DONE.md first (flags, girls handling, armored Boppy). Then docs/CANON.md and claude/part2-map.md row 14 in the Project.

Task: replace the CHAPTERS[14] stub in engine/story.js. Start at Rivituso Row with armored Boppy at the gate. Girls rejoin via setGirlsAway(false) (it clears girlAtHome NPCs everywhere). Remove the persistent Boppy re-spawn in data/scenes-ch13.js STORY_WORLD when chapter 14 starts or make it chapter-aware. Add CHSEL_LAST=14 and a chselFourteen in engine/chapter-select.js.

Pattern to copy: data/scenes-ch13.js, data/maps-ch13.js, engine/ch13-render.js, tools/ch13_test.py.

Tests: python3 tools/smoke.py; tools/ch11_test.py, ch11b_test.py, ch12_test.py, ch13_test.py, plus a new ch14 test. Look at tools/shots/ before pushing to main, then check https://trivituso81.github.io/adventures-of-tom/.

Rules: no em dashes, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md.
