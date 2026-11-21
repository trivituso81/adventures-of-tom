# Addendum after stage 18 (b3s18a to b3s18), 2026-11-21

Facts for the next stage (the bonus chapter, card c-b3s18bonus, then stage 19). Where this and `claude/battle-build.md` differ, this wins until the next stage folds it in. The long form is `docs/handoff/b3s18.md`; the reference table and results are in `docs/BATTLE3.md` "What stage 18 holds".

| Fact | Detail |
|---|---|
| State | `B3_STORY.chapters=[1,...,10]`. Chapters 11 to 20 and the bonus chapter (21) play on battle 2 under every switch setting except NEW. |
| Bonus chapter | Not switched on purpose: Brain Freeze's first run ends at half HP with result `flee` and the second with `shell` (`data/bonus-nine-scoops.js` 318 to 345, 738, 890), with adds and a Rose frozen status, all battle 2 code. `levelFloor` stops at chapter 10, so chapter 21 would get level 25. Do not add 21 to the list before those seams exist. |
| Tests not run | Tom asked for no browser tests in stage 18. Chapters 6 to 10 have never been played through on Battle 3 by a test: if Tom's Milestone D note reports a stall, write `tools/chN_b3_test.py` from `tools/ch5_b3_test.py` and `tools/b3_chapter_lib.py` for that chapter. |
| Tips | One tip per family turn, once each, shown when the cross menu opens (never under `B3.cfg.auto`). A tip about a wind-up uses `f.charge.name` (a move object with `.name`) or `f.charge&&f.id`; a status tip uses `u.st[statusId]`. Texts are at most 240 characters, no em dash, no battle 2 word. |
| Pushes | Use the cherry-pick landing recipe in `docs/handoff/b3s18.md`; verify with `git rev-parse HEAD` against `origin/main`. |
| Milestone D | Card t-milestoned: Tom plays chapters 6 to 10 from Chapter Select on the new battle (mechanics only, no animation review). Its notes and answer come first in the next card. |
