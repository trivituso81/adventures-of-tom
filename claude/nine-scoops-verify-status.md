# Nine Scoops monster art verify (v319, 2026-10-27)

Checked all four fights in battle (gremlin, slushslug, conehead, brainfreeze) with frame captures.

| Monster | Ground | Overflow | Marks | Fix |
|---|---|---|---|---|
| gremlin | ok | none | ok | none |
| slushslug | ok | none | wrong | eyes [[27,18],[36,16]], mouth [35,24] |
| conehead | ok | none | wrong, overlapped in 2-foe fights | scale 2.5, eyes [[7,13],[12,13]], mouth [8,19] |
| brainfreeze | ok | none | ok | none |

- Only file changed: data/bonus-nine-scoops.js. Published as v319.
- Marks feed Rose's nose/mouth targeting (engine/rose-moves.js) and the eye effect in engine/battle2-kind.js.
- All 14 Rose moves against conehead and slushslug ran with no errors.
- ns_test.py updated for the new title flow (START NEW, BONUS, NINE SCOOPS). It passes end to end with FAILS: [].
- The slug has goofEasy: kindness wins can end a fight early in tests. Set warmGoal=1e9 to avoid it.
