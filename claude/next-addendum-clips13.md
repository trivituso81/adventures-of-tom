# clips13 (2026-11-14 ~16:10): 232 chapter 7 phone takes merged, pushed (main b37a064)

- Export: local-clips-pending_11.json made 2026-11-14 23:33 UTC, 232 clips, all dialogue, all live lines, none had a clip before. Voices: tom 62, grace 57, rose 28, log 22, deedee 19, pagew 16, boppy 11, tnb 6, page 5, grump 2, sal 2, bigone 1, mudling 1. This is the chapter 7 queue (ch7assets1 voice lines).
- Merged with merge-local.js (36 s) into data/voice/dialog-ch29.js: 232 added, 0 replaced. data/merged-takes.json updated, so Pending upload clears on Tom's phone. Voice index 5,293 lines after rebasing on bern1b.
- Checks: unused_voice.py 1, 2, 3, 5 are 0. Check 4 is 68 now (52 before on main, same 52 as clips12); none of the 232 are in it. The extra 16 came from other sessions (bern1b Bernadette rewrite). Speakers in the list: amy, dot, grace, la_woman, log, michael, narrator, rose, sal, tnb, tom. A session that touches voice should look at it.
- smoke FAILS [] before and after push. Two upstream pushes landed during the work (bern1b, ch6s2g): the tag commit was dropped and bump_tags rerun each time, per the rules.
- Not touched: script directions (ch07-story-directions.json) were not compared with the export `script` field; chapter 7 stage 2 build session owns the scenes that play these lines.
- claude/next.md NOT edited (other sessions write it): add "clips13 (b37a064)" to its Recent builds line.
