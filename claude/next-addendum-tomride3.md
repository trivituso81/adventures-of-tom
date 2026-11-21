# tomride3 (2026-11-12 ~18:30, main 2801586): ride sheets INSTALLED. Waiting on Tom: the night-light picture and his phone check

Read with claude/next-addendum-tomride2.md. Full detail: docs/CHANGES.md "tomride3".

## Fact
- Installed from Tom's approved Library sheets: press start (4), toss (5), overworld walk (12), plus six single team-move pictures he attached (hoist, airplane level, airplane banked, boop, cloud look, headphones; saved as art/raw/characters/tomride-combo-<name>-v1.png). Baker: tools/sprite-bake/bake_tomride.py. Command: `OW_K=7 HIRES=1.5 HIRES_SHARP=80 HIRES_OUT=/tmp/hires python3 tools/sprite-bake/hires.py tools/sprite-bake/bake_tomride.py` then `python3 tools/sprite-bake/hires_install.py /tmp/hires 1.5 tomride-battle tomride-rose` (from a clean data/tomride-hires.js).
- Mirrored in the bake (generator drew Tom facing the right edge): wind-up, follow-through, toss launch, Rose in the air, hoist, boop, cloud, headphones, side-walk frames.
- The toss already existed in the engine (engine/battle2-kind.js ~177, `rideSkin('grab'|'lift'|'toss')`); the new frames flow in through data/tomride-use.js. Not looked at in a real fight yet beyond tombo_test rose1 (goggles biplane OK) and kit_test.

## Next
1. Night-light: `tomride-night` Library entry (one large picture). When approved: add it to the baker like the other combo pictures (`tomride-combo-night-v1.png`, drop the old s5 slice, delete tools/sprite-bake/src/tomride-s5-combo-v3.png), rebake, push.
2. Look at in a fight with Rose riding: Press Start (hold, annoyed, throw), DEFEND, toss on a non-Press-Start Tom move, Lamby night-light, Headphones, Cloud, and the overworld walk with Rose up (down, up, side, both directions).
3. `tomride-title` approved, not wired (welcome screen no longer uses a ride pose).
