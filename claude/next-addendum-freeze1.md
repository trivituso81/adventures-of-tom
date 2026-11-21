# freeze1 (2026-11-12 08:27 to ~09:40, NOT FIXED, could not reproduce; stop-loss applied)

Tom 08:27: "in terminal zero, when i defeat the monster that's supposed to give me the clockhand, the game freezes."
Tom 08:56: "after it freezes and I restart the game I get a new dialogue option with a monster and then the story progresses after battling again."
Reading of the 08:56 report (inference): the wing flag (`ch10-sec`, `ch10-bag`, `ch10-lounge`) was still 'pending' at the freeze, because the story only sets it true after the fight, in the after-scene. A 'pending' flag counts as not set, so the trigger scene fires again after a reload. So the freeze happens between the win and the `{flag:'ch10-<x>'}` step in `CH10_AFTER` (data/scenes.js ~3590 to 3680), or the scene never reached its battle step.

## Tried (all on main fcb1b23, headless Chromium, 430 x 860), all PASS, 0 page errors
- Scene played directly (`playScene('ch10Sec'|'ch10Bag'|'ch10Lounge')`) with a one-hit win, each fight, alone and as the third hand.
- Natural path: `playScene('ch10Start')` (Amy joins, cab, Terminal), ch10Term trigger, then walk up to the monster and press Enter: scene triggers, fight, after scene, flag true.
- A full-length real fight (Unclaimed, about 70 s, attack only, no hp tricks): ends, flag true.
- Finishing blows with Tombos on The Long Line (grace1 to 3, rose1 to 3, amy1 to 3, ff1 to 4): all end the fight or leave it in command (no kill), none stuck. Note: harness must `forceJoin(MEMBERS()['amy'],true)` or Amy's Tombos throw (`pt` undefined in `b2RunTombo`); that is a test setup gap, not a game bug.
- Kindness win (calm forced): ends; 3 caught `fault in battle draw` (`paintHeart` non-finite gradient) from the forced state only.
- Code facts: the main loop guards every stage (`gameFault`, data/battle-sprites.js) and shows a toast "Hiccup in <stage>: <message>" for 4.5 s on any error. So a plain exception would have shown a toast. A freeze with no toast means a step is WAITING (a `walk`, `wait`, `battle` or dialogue step that never completes), not throwing.
- `ch10HandSteps` builds its "Clock hand N of 3" toast text at load time (always the load-time count); small bug, silent toast, not the freeze.

## Never tested (could differ on Tom's phone or save)
- His real save (chapters 1 to 9 played for real, not `chapterJump`), his party levels, iPhone memory (`paintedTick`), real speech and baked voice on the after lines, a loss then retry, a `walk` step blocked by followers (the monster walks to Tom before the fight; a blocked route would hold the scene forever).
- Which of the three monsters it was.

## What the next session does
1. Ask Tom for the one thing only he can give: which monster, and what is on screen at the freeze (battle, victory card, dialogue box, black, the monster scene). Also whether he saw a "Hiccup in ..." line.
2. If it is still unknown: add a stuck-scene watchdog (engine/story.js scene runner): if a scene step has run more than 20 s with no dialogue, battle or fade active, print "stuck: scene <id> step <n> <op>" to the toast and `window.__faults`, and for `walk` steps give up after 8 s. Push with smoke, tell Tom what the line says when it happens.
3. Do not re-run the tests above; they pass.
