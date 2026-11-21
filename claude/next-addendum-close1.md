# close1 (2026-11-12 18:20 to ~23:30 PT, main d78148c): group spacing, facing, boss footprint. PARTLY DONE, one open problem

## What Tom reported
- 18:20, screenshot after the opening: the three stand far apart and all face the camera. "Scan every part of the game where the characters get together and position for dialogue and make sure they are as close as possible without significantly overlapping each other."
- 18:32, chapter 1 pond: party standing on The Big One. "Characters need to stand to the left in this case and probably most other cases. Never overlapping the boss!"
- 18:34, after the win: still overlapping and facing the wrong way; The Big One dives into the pond but ends up back on land.

## What is pushed (fact, tag close1, smoke FAILS [], tag_check ok)
| Area | Change | Where |
|---|---|---|
| Conversations | People stand in neighbouring columns, each as near the middle of the cluster as the no-overlap rule allows (never the same column within two rows). New fail `spread` re-forms a group standing apart. People a scene posed, placed or walked keep their marks. Middle person faces the camera. | `huddleLayout`, `huddleFails`, `hudNear`, `hudTight`, `huddleTurn` in engine/story.js |
| Facing | A mood pose (`em_*`) is drawn only when the person already faces the camera, for every mood. Otherwise the normal sprite, turned toward the group. Dialogue box face unchanged. | `emoFrontOk` in engine/emotions.js |
| Bosses | `stageBox` is a monster's drawn footprint; nobody is placed on it. In boss scenes Tom walks to the nearest clear tile on the boss's LEFT when he stands on it or is not on its left; the others form a tight block behind him, facing the boss. In boss scenes `{huddle}` only turns people. | `stageBox`, `stageBoxes`, `stageInBox`, `stageLeftSpot`, `stageClearSpot`, `gatherStep`, `stageSpots` |
| Boss ending | A boss with `end:'stay'` and a `path` stays where its ending landed (The Big One stays in the pond). | `finish()` in engine/boss-finale.js |
| Monsters in ordinary scenes | `{huddle}` hands over to `{gather}` on the monster (no left rule, `intro.monGather`). | `huddleStep` |
| Audit tool | New `apart` column; mood-posed people count for facing; facing a monster passes. | tools/scene_stage_audit.py |

## What was looked at (fact)
- Frames viewed, 0 page errors: opening plus ch1Goal, ch1Pond plus ch1AfterBoss, portrait and landscape.
- Re-run on near-final code: ch1-goal, ch2-smog, ch3-story, ch14-open (all tight, 0 overlap, 0 apart).

## NOT done, say so to Tom
- The full 188-scene scan never finished on the final code (it takes about 75 minutes and the session was interrupted twice). Two partial runs only.
- Bosses of chapters 2 to 20 were not looked at with the left rule. `python3 tools/boss_stage_test.py tools/boss_stage_cases.json /tmp/bs` (25 cases, about 25 minutes) then `python3 tools/boss_stage_report.py /tmp/bs/result.json`, and look at each case's sheet.
- OPEN PROBLEM, two attempts failed (stop-loss): ordinary monster encounters where the party ends up on both sides of the monster or strung out. Seen in the scan at ch4Moth (backlot), ch6Spy (oakpark), ch1Grump (hollow), ch5Music (school), ch7Non (stacks). Tried: (1) handing the huddle to `{gather}` on the monster, (2) a +4 cost for tiles on the far side of the monster in `stageSpots`. Neither changed those five. What I think is wrong: in those scenes Tom himself stands hard against the monster with walls behind him, so there is no free tile on his side and the fallback levels put the others wherever is free. The fix is probably to move Tom too (apply `stageLeftSpot` or a "most open side" spot for ordinary monsters), not another cost tweak. Note the audit starts Tom at the middle of the trigger area, which is not always where a player stands: reproduce one with `reaction_test.py` from a real approach tile before changing code.
- The audit's `offcenter` column now fails often (centroid clearance 1 of 2): a tight group next to a wall. `huddleLayout` now charges +2 for that and +8 for a group that is not together, on purpose (Tom's newer instruction wins over "middle of open space"). `huddleFails` still raises `place` for it, so the layout is recomputed before each line; positions were stable in the runs viewed.
- After a scene ends the followers collapse onto Tom's tile (seen at ch10Lounge after the fight). Pre-existing, not changed.

## Next session
1. Run the boss cases and the full scan on main, fresh OUT directories, one at a time. Report the `overlap`, `hidden` and `apart` columns.
2. Fix the monster encounter line-up by a different method (move Tom), test on the five scenes above, frames in portrait and landscape.
