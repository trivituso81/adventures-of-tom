# Chapter 20 done: The Forever Engine & The Open Sky (the finale)
Files: data/ch20-monsters.js, data/maps-ch20.js, data/ch20-battle.js, data/scenes-ch20.js, engine/ch20-render.js, tools/ch20_test.py. Edited: index.html, engine/story.js (CHAPTERS[20]), engine/chapter-select.js (CHSEL_LAST=20, chselTwenty), engine/benchcall.js (B2_BENCH_FIGHTS, B2.benchFree).
Eight-member call: four out front, four on the bench. Relays are staged bench set pieces. In the Julian fight BENCH CALL is near free so each signature special can come in.
Flags: ch20-open, door-<who> x8, ch20-core, ch20-heart, ch20-fight, battle:leviathan, relay:<key> x4, ch20-shatter, ch20-julian, battle:julian, ch20-calm, ch20-epi, ch20-done, game-complete.
Tests: ch20_test.py passes (doors, 4 relays, both fights, epilogue). smoke, bg, ch14, ch18, ch19 pass. Fight balance is checked by script only (tune B2_FOES.leviathan/julian, CH20_BARS).
Not done: ch11 to ch13, ch15 to ch17 tests not re-run this session. The Julian fight in the test is shortcut (acts7 set directly). Real play of the seven acts is untested.
