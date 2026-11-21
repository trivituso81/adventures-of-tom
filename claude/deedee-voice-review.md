# Deedee voice review (2026-10-26)

Tom's note: Deedee sounds too scratchy and old. She never calls the girls "babies", only "girls". She is kind, loving, but firm. Voice fix plus four small text updates.

## Why she sounds scratchy and old

| Layer | Today | Effect |
|---|---|---|
| ElevenLabs voice | Designed voice "AoT Deedee (Long Island)", id 3atomJkX2UWSHPSg86Z0, stability 0.5, similarity 0.8 | The design brief leaned on age; v4 renders "older woman" as rasp and breath |
| Character direction | empty | Nothing tells v4 she is strong and clear |
| Per-line scripts | Mostly fine, but several lean frail: "fussing grandma", "tired, sweet", "weary sigh", "drowsy" | Her low, ko and basic lines come out feeble |
| Merge | No pitch shift (correct) | Nothing to change |

The fix is a redesigned voice, not a pitch trick: pitching a raspy voice up makes it thinner, not younger.

## Decisions

| Setting | Old | New | Why |
|---|---|---|---|
| Voice | AoT Deedee 3atomJkX2UWSHPSg86Z0 | Redesign in the dialogue baker (Voice Design, keep option 1), then delete the old voice so no slot is used (account is at 30/30; li-fix pattern) | Rasp is in the voice itself |
| Design brief | (older brief) | "Woman in her seventies who sounds fifty-five. Bright, clear, strong voice with no rasp, breathiness or wobble. Long Island accent. A retired nurse who runs the room: warm, affectionate and firm. Natural, energetic, not elderly. Clean studio recording." | Says strong and clear out loud; forbids the rasp |
| Character direction | empty | bright, warm, firm, a nurse who runs the room; strong and clear, never frail | Default read for every line |
| Stability | 0.5 | 0.6 | A little steadier keeps the rasp from creeping back on long lines |
| Similarity | 0.8 | 0.85 | Hold the new design |
| Scripts | old | claude/voice-baker-scripts-deedee.json (46 battle lines), claude/dialogue-scripts-deedee.json (78 dialogue pages) | Frail tags replaced with brisk, composed, firm, bright |
| Scope | | Re-bake all Deedee lines | New voice means every old clip is the wrong voice |

## Text updates (game text; Tom decides, my call shown)

| File | Old | New | Call |
|---|---|---|---|
| data/lines.js deedee.low | Deedee needs a little sit-down, babies. | Deedee needs a little sit-down, girls. | Required by Tom's note |
| data/lines.js deedee.win | My babies did it! To the moon and back! | My girls did it! To the moon and back! | Required |
| data/scenes.js:127 | Good job, babies. The crumbs keep going north. | Good job, girls. The crumbs keep going north. | Required |
| data/scenes.js:82 and data/maps-le.js:972 | And my two angels! Come here, come here. | And my girls! Come here, come here. | My call: "just girls" means no other pet name either. Revert if Tom wants angels |

Kept as is: "honey" (to Tom and Boppy), "sweetheart" (to the Moon Club ball), "Tommy", "Rosie". Not Deedee's but noticed: her marriage is "Fifty-one years" (ff3), "Fifty-two years" (scenes 3063), "fifty years" (Boppy's gin rummy, Deedee's dance floor). Worth one pass later.

## Tone palette

| Situation | Tag words |
|---|---|
| Greeting family | delighted, beaming, arms open |
| Running the house or table | brisk, firm, cheerful, in charge, not angry |
| Nurse moments | calm, brisk, kind, confident |
| With Boppy | dry, fond, pointed, a wife's report |
| Moon and back | loving, strong, emphatic |
| Hurt, low, KO | composed, dignified, catching her breath, half joking (never feeble) |

Banned in any Deedee script: old, elderly, frail, weary, drowsy, tired, fussing, scratchy, quavering.
