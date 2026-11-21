# Addendum after stage 17 (b3s17a to b3s17), 2026-11-21

Facts for the next stage (18: chapters 6 to 10 and the bonus chapter). Where this and `claude/battle-build.md` differ, this wins until stage 18 folds it in. The long form is `docs/handoff/b3s17.md`; the reference table and results are in `docs/BATTLE3.md` "What stage 17 holds".

| Fact | Detail |
|---|---|
| State | `B3_STORY.chapters=[1,2,3,4,5]`. Chapters 6 to 20 still play on battle 2 under every switch setting except NEW. |
| Recipe per chapter | List the battle 2 references by kind; add the chapter to `chapters`; give the fights tips (and a new row if a scripted fight has no formation, like `smoglet2`); gate the Tombo toasts and the retry coaching lines with `B3_CH_ON(n)`; write `tools/chN_b3_test.py` with `tools/b3_chapter_lib.py`; run the checks; one push per chapter (`b3s18a`, `b3s18b`, ...). |
| Kind ending | `b3sEnd` sets `kind:<boss>` on a boss win from chapter 2 on, so every chapter's after-boss scene sees the kind ending. Check that each new chapter's boss uses the same flag name as its `battle:` id. |
| Retry lines | A new Battle 3 line goes under `{if:()=>B3_CH_ON(n),then:[...],else:[old]}` and keeps the first line identical so its recorded clip plays. New lines are unrecorded (speech synthesis; listed under No clip yet). Run `python3 tools/clip-audit/unused_voice.py` (0 on all checks) and `python3 tools/script-index/build.py`. |
| Tests | `b3_chapter_lib.py` plays every open menu (not only the cross), records only story tips, presses Enter through a close-up. Do not set `B3.cfg.auto`. Run portrait and landscape together in the background; each takes 8 to 14 minutes. |
| Known flake | `tools/b3_story_test.py` step "a save made on Battle 3 loads with the switch on Old, and chapter 1's scene fight plays on battle 2" failed twice after a long run and passed alone: the scene fight had not started after 30 seconds and an intro card was up. Not caused by stage 17; re-run alone before treating it as a failure. |
| Open from stage 15 | The Big One at Rank 1 is 7.83 rounds (target 5 to 7); Rose Mode's emergency muffin is not ported. Tom judges both at the milestones. |
| Milestone C | Card t-milestonec: Tom plays chapters 2 to 5 from Chapter Select on the new battle (mechanics only, no animation review). Its notes and answer come first in stage 18. Stage 16 (Tombo skins) is still skipped. |
