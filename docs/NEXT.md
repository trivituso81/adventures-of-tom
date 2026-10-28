# NEXT: build Chapter 19, "The Unsent Dead-Letter Office"

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 18 built and on main. Live: https://trivituso81.github.io/adventures-of-tom/
Read docs/C18-DONE.md first (how Tom leaves, tomBack, flags), then docs/CANON.md (end), then claude/part2-map.md row 19 in the Project.

Task (row 19): the Unsent Dead-Letter Office. Party plays WITHOUT Tom: TNB (lead, drawn as the player), Amy, Grace, Rose, Nara. Start: Jefferson Park, ch18-done, tom-gone set. Needs CHAPTERS[19], CHSEL_LAST=19, chselNineteen (copy chselEighteen, then set ch18 flags and run tomGoneApply), ch19 test. Check that Tombos and Family Finishes cope with no Tom (a plain fight starts fine, tested in ch18_test). Decide whether Tom returns inside ch19 or ch20 (tomBack()).

Pattern to copy: data/scenes-ch18.js, data/ch18-battle.js, tools/ch18_test.py.
Tests: python3 tools/smoke.py; tools/bg_test.py; ch11_test, ch11b_test, ch12_test to ch18_test, plus a new ch19 test. Look at tools/shots/ before pushing to main, then ask Tom to check the live URL.

Rules: no em dashes in game text, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md.
Known leftovers: 7 Michael/Olivia lines need a re-bake (docs/CHANGES.md); Vance, the Archivist and "Floor 60" narration need voice cast entries (dialogue-scripts-ch16/17/18.json to bake); tnb.coffee_run voices.json owed; Dot says "ten doors" (should be eleven); ch15 QUIET glyphs do not render; HUD chip shows over the snow globe scene; tower doors on the boulevard are a small sliver. Ch18 fight balance is checked by script only: if it feels off on the phone, tune CH18_PCT in data/ch18-battle.js.
