# bossend5 (2026-11-12 ~22:50 PT, main 776253b, tag bossend5): chapter 11, 12, 13 bosses stay for their endings

Tom (11-12 22:30): after beating the bus in chapter 12 there is no finish animation.

## Cause (fact)
- The world rules (STORY_WORLD) for FINAL CALL (data/scenes-p2.js), Gridlock Prime (data/scenes-ch12.js) and Drill Worm (data/scenes-ch13.js) hid the boss as soon as `battle:<id>` was 'win'.
- `storyTriggers` (engine/story.js) reruns the world rules before it starts the after scene. So the boss was hidden, and `{finale:'<id>'}` skips itself when the boss is hidden (engine/boss-finale.js `start`).
- Chapters 1 to 10 hide their boss on a wrap or clear flag and were not affected.
- The tests missed it because their fake win never reran the world rules, and `boss_finale_test.py` un-hides the boss before it plays the finale.

## Fix (pushed)
- The three rules now hide on `ch11-closed`, `ch12-clear`, `ch13-clear`.
- The fake win in tools/boss_stage_test.py and tools/reaction_test.py now calls `storyWorld()` after setting the win flag, so every boss case runs the real order.

## Tested
- Cases ch11, ch12, ch13 (scenes: fight scene, then after scene), portrait. Before: boss on 0 after-scene pages in all three. After: boss on screen until it leaves (11, 12) or through the scene (13). smoke FAILS [], tag_check ok.
- Looked at: chapter 12 frames (bus signals, drives right, fades out).
- Seen but not changed: in the chapter 12 after scene Tom stands directly above the bus, close to overlapping it, and the bus ending frame looks small on the street. Belongs to the close1 follow-up.

## Follow-up audit of chapters 14 to 20 (2026-11-13, no code change, nothing pushed, main 487a58e)
- Fact: chapters 14, 15, 16 have no world rule that hides the boss on a win (their after scenes use `camboss`/`pose` with `end:`). Chapters 17, 19, 20 do hide on a win, but `bossStays` (engine/boss-finale.js) sets `bossAwait` when the battle ends and the rules skip hiding while `bossAwait` is set, so the finale still plays.
- Tested (boss_stage_test.py with FIN=1, portrait, party of four, no bench): ch19 (Censor in the frames with its effects, then leaves), ch20 (Leviathan finale frames, then the clock, then Julian in the armchair), ch20j (Julian calm), ch17 (After scene has the boss on 6 of 11 pages). 0 page errors. ch14, 15, 16 ran with 0 errors; their finale frames were NOT looked at.
- Not looked at: ch17 finale frames (the harness sat 90 s on one ch17 case, 1800 frames; ch17_test already fails 12 in the tower on main), landscape, a played battle on a phone.
- Test tip: boss_stage_test.py keys results by case name, so two cases with the same name overwrite each other's frames and result entry; give the second case another name.

## Next session
- If Tom reports a missing or odd boss ending in any chapter: check the title stamp is `build bossend5` or later, then reproduce with `FIN=1 ROOT=$PWD python3 tools/boss_stage_test.py <case file> /tmp/out` and look at the `<case>-fin-NN.png` frames.
