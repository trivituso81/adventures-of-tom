# NEXT: build Chapter 17, "Ascent of the Glass Tower"

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 16 built and on main. Live: https://trivituso81.github.io/adventures-of-tom/
Read docs/C16-DONE.md first (flags, party rules, statues, quiet switch), then docs/CANON.md (end), then claude/part2-map.md row 17 in the Project.

Task: replace the CHAPTERS[17] stub in engine/story.js. Row 17: 6 heroes (Tom, Amy, TNB, Grace, Rose, Nara) in two strike teams of 3. Downtown LA, Vance's 60-story Glass Tower (new dungeon). Smash the shelves of paused towns. Amy and Tom race the stairs. Boss: The Archivist's Twin Lenses. Unlocks amy3. Add CHSEL_LAST=17 and chselSeventeen (copy chselSixteen).

State at the start of 17: Tom, Amy, TNB, Nara are at the Angel City cab stand (map lacab). Grace and Rose wait there as NPCs (girlAtHome); they must rejoin. Deedee and Boppy are statues in the Square (flag ch16-stone, object kind 'statue'). Long Island is a snow globe.

Pattern to copy: data/scenes-ch16.js, data/ch16-battle.js (boss as thin wrappers on B2_SHAKE_STYLE), tools/ch16_test.py.

Carry-over for chapter select 17+: it must set ch16-stone and ch16-done itself. Vance still needs a voice cast entry (docs/dialogue-scripts-ch16.json, 84 lines to bake).

Tests: python3 tools/smoke.py; tools/bg_test.py; ch11_test, ch11b_test, ch12_test to ch16_test, plus a new ch17 test. Look at tools/shots/ before pushing to main, then ask Tom to check the live URL.

Rules: no em dashes in game text, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md (none reworded in 16).
Known leftovers: Dot says "ten doors" (should be eleven; needs re-bake); voices.json for tnb.coffee_run still owed; ch15 QUIET glyphs do not render; HUD chip shows over the snow globe scene.
