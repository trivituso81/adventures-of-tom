# Boss pond scene fix (bosspond1, 2026-11-09, main at 5bb4350)

Tom (10:07, screenshot of the chapter 1 boss scene): the Mudling and The Big One stood too close; The Big One should be further right and facing the party; he should not look surprised.

## What changed
- `MONSTER_SPOTS` (data/monsters.js): bigone home spot 15,11 to 19,11.
- `SCENES.ch1Pond` (data/scenes.js): thief spawns at 21,12, scurries left along row 12 and stops at column 16 (3 tiles from The Big One), then walks to 17,12 and despawns. `{cam:[16,12]}` holds the camera so The Big One (far right) is fully in frame in portrait. The Big One rises with `{pose:'The Big One',foe:'attack3',dir:'left'}` and the pose is cleared (`f:null`) before the fight.
- New scene option `foe` on `{pose}` (engine/story.js `foePoseRows`, engine/town-render.js `drawActor`): shows any painted enemy frame by name ('stance', 'hurt', 'attackN') on a story monster. Painted enemy sheets face RIGHT (data/foes/use.js), so `dir:'left'` mirrors the frame. No other monster changed.
- Frame choice: all six Big One frames are shocked or angry. `attack3` (scowl, mouth nearly shut) is the least surprised. The stance frame (shocked) is still what free-roaming Big One and the dialogue portrait use.

## Tests
- `tools/boss_stage_test.py` (ch01 case): ch1Pond 7 pages, 0 overlap, 0 facing wrong; ch1AfterBoss 4 pages, 0, 0. Portrait and landscape frames looked at. smoke FAILS [], tag_check ok.

## Open (for Tom, phone)
- Check the scene on the phone. If he still wants a calmer face, the only other painted options are the six frames on the sheet (none is neutral); a new frame needs an Art Library sheet (hero pose with a smug or sleepy face). The dialogue portrait (stance crop) still shows the shocked face: change it in tools/sprite-bake/bake_foe_portraits.py if he wants it to match (not done, not asked).
- Tom may be standing closer to the pond than the harness assumed (the test starts him at 14,13): if the thief ends up too near Tom, move its stop from 16 to 17 in ch1Pond.
