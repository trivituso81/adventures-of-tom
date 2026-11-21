# Addendum: stage 15 (b3s15, 2026-11-21). Where it and claude/battle-build.md differ, this wins.

| Topic | Fact |
|---|---|
| What shipped | Chapter 1's story fights on Battle 3 behind ADMIN > Battle system > Story battles (OLD, BY CHAPTER default, NEW). Details: `docs/BATTLE3.md` "What stage 15 holds", `docs/handoff/b3s15.md`. |
| The one door | `startBattle(npc,opts)` is wrapped in `engine/b3-story.js`. The story `battle` op polls `battle.active` and reads `B2.result`; Battle 3 sets `B2.result` in `b3sEnd`. Boss flag `battle:<id>` is set there too. |
| Switch rule | `b3sChapterOn(n)`: OLD false; BY CHAPTER true if n is in `B3_STORY.chapters`; NEW true for any fight with a Battle 3 formation. The demo always uses battle 2. To add a chapter: add it to `chapters`, add its fights and tips to `data/b3-story.js`, move nothing else. |
| Saves | Adds `b3:{v:1,ruckus}`. Migration is idempotent floors (level floor, 135 VP per chapter finished, two thirds to the first Sig Vibe), run on load, Chapter Select, and a switch change. Late joiners (tnb, nara, boppy) get a loadout in `recruitJoin` and `benchAdd`. |
| HP | `cfg.hpShare`; win writes a share back (full on level-up); loss leaves 1 HP; other exits write the actual shares. |
| Balance fact | Rank 1 Big One: 7.83 rounds (Rank 2: 5.78). Not retuned. Milestone B decides. |
| XP fact | Clearing the Hollow pays 250 XP (3 Mudlings 36, skeeter 24, grump 26, toad 30, log 34, Big One 100) = 2.5 levels. The required path pays 136. No XP number changed. |
| Not done | NEW beyond chapter 1; Rose Mode emergency muffin (`b7Pie`); Tombo skins (stage 16). |
| A stale test fixed | `tools/b3_test.py` s4 expected Boppy, TNB and Nara to have loadouts on a new save; they now get them when recruited. |
| A find | Commit 25f41e6 (board-sync) put conflict markers on main; fixed as `fix-conflictmarks` before this build. |
