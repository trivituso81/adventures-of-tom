# NPC walk timing (npcgait1, main at 9939091; CHANGES "npcgait1")

Read with claude/next.md; fold into it at the next rewrite.

- Tom 11-10 15:29: "NPC walking animation is weird, why doesn't it match the main characters" (after the size fix npcinst3 and the facing fix npcface1).
- Cause (fact): Tom and followers take about .16 s per tile (`duration` .14 x OUTDOOR_STEP_X 1.15) and the cycle changes pose once per tile. NPCs take .8 s per tile (.9 in rooms; engine/world.js `actor`, `npcFromSpec`) but also changed pose once per tile, so one stride pose was held almost a second while the figure slid. Art was not the problem this time.
- Fix: `walkStepIdx(a,ph)` in engine/town-render.js. Moves over .4 s (not a dog) change pose every `OW_POSE_SECONDS` (.2 s), so a full 4-pose gait plays inside each tile. Player, followers, Nara (.34 s) unchanged (traced: identical sequences). Used by `drawSheetActor` and `drawNpc` (pixel villagers).
- NOT changed: NPC walking speed (still about 5x slower than Tom's; a tile in .8 s). If Tom says NPCs still feel slow or floaty, the next lever is `duration` in `actor()` (engine/world.js line 81) and `n.duration=.9` for rooms (line 139); ask first, it changes how long people take to cross a room. A wander that stops between tiles is unaffected.
- Tests: pose trace, Gus on Rivituso Row looked at in the live game, smoke FAILS [], tag_check ok. Not on a phone.
- Waiting on Tom: phone check that NPC legs now look like they walk. If something else still looks off, ask him what specifically (feet sliding, stride too short, a frame jump) before touching art; stop-loss counts this as the third NPC walk report today (size, backwards, now timing), each with a different cause.
