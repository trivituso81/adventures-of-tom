# Handoff: b3s5b (Battle 3, stage 5b of 23), 2026-11-18

Plan: `claude/battle-architecture.md` in the Project (sections 2 and 5). Tracker: `claude/battle-build.md` (it holds the rule for when Tom tests: only at four milestones, the first after stage 8). Repo doc: `docs/BATTLE3.md`. Kit lines sorted into ops or custom: `claude/battle-kit-ops.md` (5c's lines: 57 to 63 Rose, 85 to 91 Deedee, minus those 5a built).

## What stage 5b left

| Item | State |
|---|---|
| The six finished Sig Vibes | Frequent Flier, Squishy Collector, Sugar Rush, Neat Freak (5a), Gamer Geek and Craft Artist (5b). None is `soon`; none of their Skills is in `B3_SOON`. |
| Rose's Cozy Rosie and Deedee's Registered Nut | As stage 4 left them, minus 5a: Cozy Rosie's Skill 1 (Tattered Lamby Boomerang), Skill 2, Capstone, Trait and Quirks are `soon`; Registered Nut's Skill 2, Capstone, Trait and Quirks are `soon`. |
| One-off rules | `engine/b3-custom.js`: Twin-Lamb Relay (5a) and Double Coat (5b). Cartridge Blow needed no custom code. |
| Foresee | `foresee` op, `aimLock` and `intent` on a foe, `b3Foresee`, `b3FoePick(F,e,peek)`, `b3LockOk`, `b3IntentRefresh` (`engine/b3-foe.js`); the screen reads `f.intent.aim` (`b3ViewAimed` in `engine/b3-play.js`, the `b3-nx` chip in `engine/b3-ui.js`). |
| Rule tests | `node tools/b3-sim.js check`: CHECKS: 787, FAILS: []. Stage 5b's groups are 101 to 113 in `tools/b3-check-s5b.js`. |
| Screen test | `python3 tools/b3_test.py s5b` (about 2 minutes); the whole file is about 40 minutes now. |
| Tom's phone check | Not asked for (the tracker's rule). |

## Things stage 5c should know

- New row fields since 5a (all documented at the top of `engine/b3-hooks.js` and `data/b3-status.js`): duration `srcBegin`, `answer:'putter'`, `peeve`, listener `pepAtLeast`, `kinds`, `tgtFoe`, `attacks`, `limitKey`, `limit:'actionTarget'`; mod `when` conditions `peeveOrPrime` and `skillPep`; cost mods via `b3Sum(u,'cost',{skill:S})`; `primeTurns`; `critPerPrime`; splash `of:'dealt'`; hazard `any:true`, `pop`, `verb`.
- Still open from the 5a handoff: `cooldown` on a Skill, a `later` op (Tattered Lamby Boomerang, Kingdom of Ten-Thousand Blankets), immunity flags (Warm Beats Cold), a shield from overheal (Forty Years a Nurse), survive-at-1-HP (the Ward), "holder has a Rose shield" (Mint-Condition Backup). First Ring Pickup can use the cost mod 5b built.
- The simple player still has no score for a shield or a buff on an ally except the Winged Shell bonus (`std(t)*power.standard*.4` for a skill whose status has `on.actionDeclared`). Sofa-Cushion Citadel, "Bring a Jacket!" Ward and Kingdom of Ten-Thousand Blankets need a score or the simulator never uses them. A score that is too high steals the Capstones (the Glue Trap score was capped for that reason; at .8 for Winged Shell Tom's Tarmac Capstone went unused).
- Tests that count pips: a Detonation or a Hydro-Slip! moves the count. Wipe `f.st` before each move in a pip test and use `t_mix` (Sizzle and Razzle) for a two-flavor move.
- The Lab party's Pocket Vibes now carry finished Skills, which probably moves every unswapped simulator number a little (The Big One at Rank 5 was 3.64 in 5a, now 3.19); 5c will move it again.
- Spoken lines: still none for any Battle 3 move (`line:null`), 28 moves waiting, Pick-Me-Up included (architecture risk 8).

## Still owed from the architecture's risk table

| Risk | Owed |
|---|---|
| 4 | Balance is still paper. Stage 14 owns it. |
| 6 | Tom's verdict on the turn bar in portrait (milestone A). |
| 8 | Lines for the built moves (28 now). |
