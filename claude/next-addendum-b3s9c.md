# Battle 3, stage 10: where it stands after b3s9c (2026-11-20)

Read with `claude/battle-build.md`. Where they differ, this file wins until the stage 10 session folds it into battle-build.md. It replaces `next-addendum-b3s9b.md`.

## What b3s9c did (fact; build `b3s9c`)

Nara and Boppy are complete (28 lines) and the late joiners' pool is in. Detail: docs/CHANGES.md "b3s9c", docs/BATTLE3.md "What stage 9c holds", docs/handoff/b3s9c.md. Tom was not asked to play.

| Piece | Fact |
|---|---|
| Recipe for a new character | A kit file (`data/b3-kit-<id>.js`), a `data/b3-lab.js` row, a `<script>` tag in index.html. A character who joins later gets `late:true` on the cast row and starts from the pool. |
| New pieces you may reuse | ops `steal`, `tick`, `upgrade`; target `foe_row`; Skill fields `detonatesAll`, `pierce`; mod condition `aoe`; status flags `lockAim`, `noSteal`; the `thorns` answer; listener conditions `pushed`, `byAlly`, `tgtBoss`. |
| Stage 10 own functions | Pace-Partner Run and Demo-Day Prybar (`claude/battle-kit-ops.md`). Amy's Burpee Blitz uses the granted action (`F.grant`). |
| Tests | `node tools/b3-sim.js check` (1178, FAILS: []); `python3 tools/b3_test.py s9c`. Sections s9b, s9ui, s5c, s7, s4 stayed green. |
| Open | Check 4 of `unused_voice.py` lists 39 dialogue clips on clean main too; not from this work. |
