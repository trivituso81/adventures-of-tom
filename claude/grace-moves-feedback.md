# Grace moves: Tom's feedback (26 Oct 2026), to build next
Source: Tom's verdicts after watching the Grace Moves viewer (https://claude.ai/artifact/MmVqtyMY1oWmHTPeDoSG1H, db collection grace-feedback), pasted into chat.
Files: engine/grace-moves.js (RM.grace.* shows, "Move review rebuilds" IIFE near line 745), data/battle2-data.js (B2_SKILLS.grace.o3), data/abilities.js (B8_KITS.grace), engine/battle2-moves.js (RM.grace.dance entry), data/lines.js (LINES.grace), engine/audio.js (sfx).

| Move | Verdict | Tom's note | Build decision |
|---|---|---|---|
| Cartwheel (basic) | keep | | No change. |
| DANCE (sig) | tweak | Instead of jumping around randomly, it should look like an actual dance move with good footwork | Rebuild danceShow as a real choreographed routine: clear eight-count (step-touch, grapevine, hip sway, a spin, a final pose), feet visibly planted and moving on the beat, arms matching. Keep the heal numbers, the "Five, six, seven, eight!" count and her lines. |
| Squishy Squeeze (A1) | keep | | No change. |
| Glitter Nails (A2) | keep | | No change. |
| Welcome Back to My Channel (A3) | keep | | No change. |
| Like and Subscribe (A4) | keep | | No change. |
| Dumpling Drop (A5) | keep | | No change. |
| Ten Million Subscribers (A6) | keep | | No change. |
| Dance Battle (B1) | tweak | A much cooler dance animation in which she taunts the enemy | Rebuild as a taunting dance-off: she struts up, points at the monster, beckons it with a "come on", hits two or three sharp moves with attitude (shimmy, hip pop, spin into a pose), the monster flinches or tries a wobbly move and loses. Kid-safe taunt, no insults beyond sass. Keep the effect (hit and steal one buff) and cost. |
| Beam Dismount (B2) | keep | | No change. |
| Handstand Contest (B3) | tweak | Instead of Grace turning upside down, make a custom animation where she is actually in a handstand position | Draw a real handstand pose (hands on the ground, legs straight up, hair hanging) instead of rotating the standing sprite. Tom and Rose attempt it too and wobble; Grace holds it longest and wins. Keep heal 15% and PEP +15% for 2 turns. |
| Split Leap (B4) | keep | | No change. |
| Chalk Up (B5) | keep | | No change. |
| Diamond Leotard Finale (B6) | keep | | No change. |

## Notes for the build
- Only three moves change: DANCE, Dance Battle, Handstand Contest. Do not touch the other eleven.
- Grace's sprite has only idle, act/expr, celeb, celebFlip, kneel, flip, run (see kit-recipe.md). Make the footwork with paths, hops, small steps and rot; the handstand needs new pixel rows or a drawn pose (data/battle-sprites.js or the rig).
- Keep every move's spoken line unchanged where possible so existing baked clips still play. If a line changes, add it to status.md "Lines to bake".
- After the build, republish the Grace viewer so Tom can review the new animations and leave feedback again. Refresh it with the changed files via files:{path:{artifact:<game url>,path}}. Clear grace-feedback only after Tom reviews.
- Build in one batch per move, publish the viewer after each so Tom can react early. Test: smoke.py, kit_test.py grace, and the Grace viewer test (all 14 moves, portrait and landscape).
