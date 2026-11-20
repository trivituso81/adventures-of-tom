# Handoff: b3s9c (Battle 3, stage 9 part c: Nara and Boppy), 2026-11-20

Stage 9 is finished: TNB (9b), Nara and Boppy (9c). The late joiners' pool is built and TNB uses it.

| Item | State |
|---|---|
| Kits | `data/b3-kit-nara.js` (Attached Pup, Guard Dog) and `data/b3-kit-boppy.js` (The Dep, Pepper Boss), 28 lines, each Skill with a plain `desc`. |
| Own functions | `boppySpeed`, `goldTeeth`, `mailbox`, `hoseFlinched`, `nervous`, `shins` in `engine/b3-custom.js`; ops and seams in docs/BATTLE3.md "What stage 9c holds". |
| Pool | `b3PoolSize`, `b3PoolShift`, `b3PoolConfirm`, `b3IsLate` in `engine/b3-progress.js`; the split panel and the save field in `engine/b3-menu.js`. |
| Lab | `new8` (Tom, TNB, Nara) and `new9` (Tom, Grace, Rose, Boppy). |
| Tests | `node tools/b3-sim.js check` (1178, FAILS: []); `python3 tools/b3_test.py s9c`. |
| Not done on purpose | Pictures and clips (every Skill uses `anim:{kind:'default'}`). |

For stage 10: Amy, Justin and Olivia follow the same recipe, with no pool (they are not late joiners).
