# Addendum to claude/next.md (2026-11-05 10:40, read right after next.md; fold into next.md at the next rewrite)

- DONE: CHANGES 195, tag `walk7`, pushed a37740f. Tom (10:17): "im seeing stand frames in the walking animation". Cause: OW_WALK_CYCLE=[1,0,2,0] includes the stand frame (index 0). Fix: `OW_WALK_CYCLE_TOM=[1,2,1,2]` in engine/town-render.js, used only when `set===OW.tom`. Idle still shows the stand. Grace, Rose, others unchanged. `IDS=tom` smoke FAILS []. Not watched on the phone.
- Top of CHANGES is now 195; next number is 196.
- ASK TOM ONE LINE: is the walk right now (steps only), should Grace and the others drop the stand frame too, and is the head size right?
- If Tom wants the same for Grace later, use the same per-set cycle approach.
