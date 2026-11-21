# next addendum: boss staging (stage1, 2026-11-09)

- Tom (11-08 23:21): in any scene before or after a boss the party spreads out, nobody overlaps, everyone faces the right way. Inventory first. DONE and pushed: 21bed65 (stage1) and f5b341f (test harness, tools only).
- Inventory and results: claude/boss-staging-inventory-11-09.md (39 of 47 boss scenes overlapped before, 10 had people facing away; after: 0 and 0).
- How it works: `{gather:focus}` scene step and `BOSS_STAGE` table in engine/story.js ("Boss staging"). playScene adds a gather before the first line and `{gather,check:true}` before every later line of each listed scene. Scene `place`, `walk` and `face` steps mark members (`stagePlaced`, `stageFaced`) so hand choreography wins.
- When a NEW boss scene is written (Part 2 chapters, bonus chapters): add its lead-in, fight and after scene ids to `BOSS_STAGE` with the boss name or monster id (a list like ['monster','Villain'] faces whichever is in view first), and never place two members in the same column within two rows.
- Test: `python3 tools/boss_stage_test.py tools/boss_stage_cases.json /tmp/stage [ch05 ...]` then `python3 tools/boss_stage_report.py /tmp/stage/result.json` (about 1 minute per chapter; run in the background, in chunks). The harness is an approximation (spawn start, battles auto-won).
- Waiting on Tom: phone look at a few boss scenes (for example chapter 1 pond, chapter 5 Red Pen, any after scene).
