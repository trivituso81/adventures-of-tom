# Addendum: facts from stage 11 (b3s11, 2026-11-20)

Where this and `claude/battle-build.md` differ, this wins until stage 12 folds it in.

| Topic | Fact |
|---|---|
| What is built | Chapters 2 to 4: `data/b3-foes-ch02.js`, `ch03.js`, `ch04.js` (15 regular monsters, Big Shake, Old Iron-Gill, The Director's Cut, 17 formations). Lab fights `new11` to `new27`. |
| Seams | Foe flag `surfaces` (comes up from the back row at its next turn); act flag `stopByIntercept` (an intercept soaks the stun and push); op `row`; summon `ifNoFront`; targets `otherAllies` and `randomOtherAlly` (from a monster's view `allies` includes itself, `foes` is the family); Skill Lock (`skillLock` flag blocks only `pocketSkills`, which is a subset of `u.skills`). |
| Data rule | Each wind-up act must name its own follow-up in `after` (the data check fails otherwise), so a boss that dives at two thresholds has two Deep Dive acts. |
| Statuses | `b3EndTurn` must skip a status whose unit is not `turn` (Toasty ending inside the loop ended Five-Alarm Burn). |
| Tests | `tools/b3-check-s11.js` (registered in `tools/b3-sim.js`), `python3 tools/b3_test.py s11` (Iron-Gill new21, Director new27, Big Shake new16 with maxHp x4, Boom Moth new23, Clapper new24). Browser test gotcha: a Break cancels the dive so Deep Dive_low can play; assert on either. `console.error` is stubbed in the sim vm, so throw to debug. |
| Balance | Plain-player rounds: bosses 4.1 to 4.7 (target 5 to 7, chapter 1's Big One is 3.5), normal fights 0.7 to 3.5. Stage 14 owns it. |
| Known failing test, not from this work | `python3 tools/board_sync_test.py` (R5 replay and the rescue count) fails on unmodified main, so `tools/smoke.py` reports it. |
