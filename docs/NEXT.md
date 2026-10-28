# NEXT: build Chapter 18, "No Touching, Please."

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 17 built and on main. Live: https://trivituso81.github.io/adventures-of-tom/
Read docs/C17-DONE.md first (flags, strike-team design, party rules), then docs/CANON.md (end), then claude/part2-map.md row 18 in the Project.

Task (row 18): the Glass Tower Pinnacle (Chronos-Loom Chamber), floor 60. Party: Tom, TNB, Amy, Grace, Rose, Nara. Vance realizes Tom is the living anchor between both coasts and fires the Unwriting Ray at Grace, Rose, Amy and TNB. Tom triggers an overcharged DEFEND, steps in front, adjusts his glasses, "No touching, please," and absorbs all of it. Boss: Julian Vance, first phase, an unwinnable survival battle where Tom takes every fatal hit until his HP bar turns to light. After: the party is blown back to Jefferson Park and the menu loses Tom's portrait. Set CHAPTERS[18], CHSEL_LAST=18, chselEighteen (copy chselSeventeen), ch18 test.

State at the start of 18: Vault (towervault), party Tom, Grace, Rose, Amy out front, TNB and Nara on the bench. The pinnacle lift at (9,1) already says FLOOR 60, BY INVITATION. Deedee and Boppy are stone (ch16-stone); the snow globe has gone up to floor 60.

Hard design question to decide first: how Tom "leaves the party and the menu" (ch19 plays without him) without breaking saves. Tom is the player and hero in every system; check engine/followers.js loadGame, the menu roster, and what ch19 will need before choosing.

Pattern to copy: data/scenes-ch17.js, data/ch17-battle.js, tools/ch17_test.py.
Tests: python3 tools/smoke.py; tools/bg_test.py; ch11_test, ch11b_test, ch12_test to ch17_test, plus a new ch18 test. Look at tools/shots/ before pushing to main, then ask Tom to check the live URL.

Rules: no em dashes in game text, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md (none reworded in 17).
Known leftovers: Vance and the Archivist need voice cast entries (docs/dialogue-scripts-ch16.json 84 lines and ch17.json 90 lines to bake); tnb.coffee_run voices.json owed; Dot says "ten doors" (should be eleven; needs re-bake); ch15 QUIET glyphs do not render; HUD chip shows over the snow globe scene; the tower doors on the boulevard are a small sliver between two buildings (could be made grander).
