# next addendum: conversation staging (talkstage1, pushed to main 2026-11-09; read this together with claude/next.md)

## What Tom asked
"Scan the game for other instances where groups are having a discussion and ensure they never overlap, stand in the center of open space, and face each other in a natural way."

## What was built
- `{huddle}` scene step in engine/story.js (`huddleGroup`, `huddleFails`, `huddleLayout`, `huddleStep`, `huddleTurn`, helpers `huddleClear`, `huddleHidden`, `huddleBadTile`). `playScene` inserts it before every `talk` in every string-id scene that has no `{gather}`. Boss scenes (`BOSS_STAGE`) keep `{gather}` and now also get `{huddle}` right after it (`stageScript(list,focus,mk)`, `mk` may return an array; `stageFocus` returns `actor`).
- Rules: NPCs, monsters and posed people never move. The party picks spots in different columns (`stageApart`), with open floor around them, not on the map edge, not in the bottom two rows (under the dialogue box), not behind painted scenery (PLATE_BEHIND zones). Tom stays put when his tile is fine and clear of fixed people. Nothing moves if the group already passes. Everyone then turns toward the others.
- New scenes need no table entry (boss scenes still need `BOSS_STAGE`).
- `tools/scene_stage_audit.py`: `python3 tools/scene_stage_audit.py run OUT [ch2- | trigger-id ...]` then `report OUT [--all]`. Resumable, `REDO=1` forces. Run ONE job at a time (2 CPUs; parallel browsers crash). It plays each triggered scene with battles auto-won, snapshots every dialogue page, and scores overlap, offcenter, hidden, facing. Posed people (pratfalls) are skipped.

## Result (tag talkstage1)
106 scenes audited, chapter 1 passes completely. Overlaps are gone except deliberate gags and the free-roam monster chat after a scene ends (`endIntro` calls `placeFollowers`, so the party is stacked on Tom for those two pages: ch6-garden, ch6-play, ch10-lounge photo booth is a deliberate squeeze). About 30 scenes still flag soft "centroid clearance 1 of 2/3" (narrow paths where a fixed NPC decides the spot) or "facing" toward a monster the audit cannot see well.
Hand fix: `ch2Smog` Smoglet B stops at (12,19) so it no longer covers Mr. Washington; `ch1End` re-staged earlier (endstage1).

## Possible next steps (only if Tom reports something)
- Phone check: any talk where people still stack, hug a wall or look away. Fix by editing the scene's `place`/`walk` rows, or the scoring rules in `huddleLayout`.
- Optional: run `huddle` at the end of `endIntro` so the free-roam chat after a scene is not stacked; scenes started from NPC talk or opening scenes (not in TRIGGERS) and function scenes `playScene(()=>...)` are not auto-staged or audited.
- Push procedure and tests are unchanged in next.md.
