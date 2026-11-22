# Addendum after the bonus chapter switch (b3s18bonusa and b3s18bonus), 2026-11-21

Facts for the next stage (stage 19, third Vibes, after Milestones D and E). Where this and `claude/battle-build.md` differ, this wins until the next stage folds it in.

| Fact | Detail |
|---|---|
| State | `B3_STORY.chapters=[1,...,10,21]`. Chapters 11 to 20 still play on battle 2 under every switch setting except NEW. |
| Seams | `cfg.setup` (`engine/b3-script.js`): `foeHp`, `start` (starting statuses), `midpoint` (hold HP floor, scripted result `flee` or `shell`), `adds` (timer). Rows are `B3_STORY.setup`, keyed by the scene step's `tut`. `F.over` can be a scripted result. New statuses: `frozen`, `birthday_girl`. |
| Chapter 21 floors | `B3_STORY.bonus[21]={level:5,finished:1}` read by `b3sMigrate`; Vibe Points 90 for the chapter (15 x 4 normal fights, 30 for the Brain Freeze win), flee and shell pay 0. |
| Balance | The party reaches level 7 by the real boss from the four earlier fights. Phase 2 with recommended moves wins 1 of 30 at level 5, 16 of 30 at level 6, 29 of 30 at level 7. The slug fight at level 5 is hard (the test lost it once and won on retry). |
| Test | `tools/ns_b3_test.py` (portrait and landscape, about 35 to 40 minutes each, run in the background). `node tools/b3-sim.js check`: 3554 checks. |
| Left alone | Scene lines about Tombos and the bag (Birthday Wish, Boppy's peppers) have no Battle 3 command. Pre-existing failing tests: `board_sync_test` (duplicate `t-lastnight`) and `battle_guide_test` ("the guide still loads no game engine"), both fail without this change. |
| Milestone E | Card t-milestonee: Tom plays the bonus chapter from BONUS on the new battle (mechanics only). |
