# Handoff: b3s5c (Battle 3, stage 5c of 23), 2026-11-18

Plan: `claude/battle-architecture.md` in the Project. Tracker: `claude/battle-build.md` (Tom tests only at four milestones, the first after stage 8).

## What stage 5c left

| Item | State |
|---|---|
| Sig Vibes | All eight are complete. None is `soon`; nothing is in `B3_SOON`. |
| New pieces | See `docs/BATTLE3.md` "What stage 5c holds". |
| Rule tests | `node tools/b3-sim.js check`: CHECKS 884, FAILS []. Stage 5c's groups are 114 to 126 in `tools/b3-check-s5c.js`. |
| Screen tests | `python3 tools/b3_test.py s5c` (about 2 minutes), plus s4, s5, s5b, all passing. |
| Tom's phone check | Not asked for (the tracker's rule). |

## Things stage 6 should know

- Simple-player scoring: do not add a score for single-target `later` effects. A first try (a tackle and shield worth .8 or .5 or .25 of their size) made Rose's free Boomerang beat her Capstone every time, so the Capstone check in `tools/b3-check-s5.js` (group 100) failed. The wave scoring (a damage `to:'foes'`, including inside `later`) stays.
- Rose's free Skills now include the Boomerang and the Citadel (free means no Vibe needed).
- Test rows added in the sandbox (`t_heal_all`, `t_slow_ally`, `t_hit_foe`) are deleted at the end of `tools/b3-check-s5c.js`.
- Spoken lines: still none for any Battle 3 move (`line:null`).
