# NEXT: build Chapter 20, "The Forever Engine & The Open Sky" (the finale)

Opening prompt: "Read docs/NEXT.md in the repo and continue."

State: chapters 1 to 19 built and on main. Live: https://trivituso81.github.io/adventures-of-tom/
Read docs/C19-DONE.md first (Tom is back, flags, party rules), then docs/CANON.md (end), then claude/story-bible.md "Chapter 20" in the Project (search it, do not read all of it) and claude/part2-map.md row 20.

Task: Chapter 20 in two halves. (A) The Stillness Core, inside the Clockwork Moon: the full eight (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara) climb. Field-skill doors, one per member (Tom codebreak, Grace beam walk, Rose crawlspace, Amy timed sprint, Deedee garden bridge, Boppy heavy lever, TNB rail splice, Nara scent trail). Keep each short. (B) Final boss: Julian Vance with four Resentment Barriers (Distance, Aging, Exhaustion, Fear), then phase 2 where you heal his grief with each signature special; then a short epilogue across both towns. Decide yourself how to fit 8 members (PARTY_MAX 4, bench, BENCH CALL) and say which call you made.
Needs: CHAPTERS[20] party rules (lift the Deedee/Boppy bar), CHSEL_LAST=20, chselTwenty, new maps/monsters/battle/scenes/render files in index.html load order, a ch20 test. Tombos still owed in the bible: ff4 all-eight Family Finish unlock, tnb/nara barrier-breakers.
Entry point: the stopped sky clock from ch19-done; Vance waits on floor 60 of the Glass Tower (towerpinnacle) and the Loom Chamber door.

Pattern to copy: data/scenes-ch19.js, data/ch19-battle.js (boss template + Tom return hook), tools/ch19_test.py.
Tests: python3 tools/smoke.py; tools/bg_test.py; ch11_test, ch11b_test, ch12_test to ch19_test, plus a new ch20 test. Look at tools/shots/ before pushing to main, then ask Tom to check the live URL.

Rules: no em dashes in game text, never hand-edit data/voice*, log reworded lines in docs/CHANGES.md.
Known leftovers: 7 Michael/Olivia lines need a re-bake (docs/CHANGES.md); voice cast entries owed for Vance, the Archivist, "Floor 60", Oblivion Censor, "Dead-Letter Office", Mrs. Alvarez, "Floor 59" (dialogue-scripts-ch16 to ch19.json to bake); tnb.coffee_run voices.json owed; Dot says "ten doors" (should be eleven); ch15 QUIET glyphs do not render; HUD chip over the snow globe; tower doors on the boulevard are a small sliver; tools/ch17_test.py fails from "back at the stairs" on (pre-existing). Ch18 and ch19 fight balance is checked by script only: tune CH18_PCT (data/ch18-battle.js) or B2_FOES.censor (data/ch19-battle.js) if it feels off on the phone.
