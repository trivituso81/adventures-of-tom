# Deedee moves: Tom's feedback (26 Oct 2026), to build next
Source: Tom's verdicts after watching the Deedee Moves viewer (https://claude.ai/artifact/MY4k555Ma2MuzeQ3zfEM1G, db collection deedee-feedback), pasted into chat.
Files: engine/deedee-moves.js (RECRUIT_MOVES.deedee.*; the "Move review rebuilds" IIFE and later IIFEs win), data/battle2-data.js (B2_SKILLS.deedee.o3), data/abilities.js (B8_KITS.deedee, B8_LIKE_ALIAS), data/lines.js (LINES.deedee), engine/audio.js (sfx).

| Move | Verdict | Tom's note | Build decision |
|---|---|---|---|
| Dish-Towel Flick (basic) | tweak | A more whiplashy flick of the towel, more detailed dish towel throughout | Rework the flick as a sharp whip: wind-up, fast snap with a crack, a motion streak and a small shockwave on the target. Draw the dish towel with more detail in every beat (checked pattern or stripes, hem, folded edges, fringe, a hanging loop). Numbers, line and VP gain unchanged. |
| MOON & BACK (sig) | tweak | Make the rays from the moon to the party more magical looking, like moonbeams | Replace the plain rays with soft moonbeams: wide translucent silver-blue shafts from the moon down onto each party member, drifting dust motes and sparkles, a gentle shimmer and glow on each member as they are Tucked In. Heal numbers, Tucked In, line unchanged. |
| Registered Nut, Reporting (A1) | tweak | The stethoscope covers Deedee's eyes and is not placed on the receiving character properly | Fix the prop: no stethoscope over Deedee's face (hang it round her neck, eyes clear in every frame). The chest piece goes on Grace's chest, at the right height for her pose, earpieces in Deedee's hands or at her ears but never over her eyes. Effect and line unchanged. |
| Corner-Piece Privilege (A2) | keep | | No change. |
| Wet Floor! (A3) | keep | | No change. |
| Wine O'Clock (A4) | keep | | No change. |
| Oven Mitt Ultimatum (A5) | tweak | Don't look like oven mitts | The big pink fluffy props read as something else. Redraw as clearly oven mitts: quilted mitts with a thumb, a cuff, stitching and a pattern (stripes or a small print), shown on Deedee's hands, with scorch marks or steam. Clap, row hit and Grumbled effect unchanged. |
| Sunday Roast Spread (A6) | keep | | No change. |
| Brisk Means Brisk (B1) | tweak | Call it Brisk Walk. She should clearly be holding the weights | Rename to "Brisk Walk" (key brisk_means_brisk stays so likes, saves and aliases keep working; update name in B2_SKILLS, B8_KITS, B8_LIKE_ALIAS, tips, tracker text). Draw clear hand weights in both hands for the whole walk, arms pumping, in every frame. Numbers unchanged. The spoken line mentions the old name ("Brisk means brisk. Keep your arms moving."): keep it, since the baked clip still plays. |
| Garden Shower (B2) | tweak | Improve the water spray | Make the spray read as real water: a wide fan of droplets from the nozzle, arcing streams, splashes where it lands on the row, mist and a few rainbow glints. Hits, delay effect and line unchanged. |
| Rise and Shine (B3) | tweak | She says "rise and shine" in a sing-songy voice | Same words, new delivery. The line stays "Rise and shine! The day is wasting!" so text matches. Voice baker note: rebake with a sing-song, rising melodic delivery (pitch lilt on "rise and shine"). Until baked the old clip plays. Add a direction note to claude/voice-baker-scripts-tombo.json. Animation unchanged. |
| Beanie Master (B4) | tweak | She should say "I am the beanie master" at the start of the move | New opening line "I am the Beanie Master!" spoken as the move begins (before the cloud). Keep "Oh my!" after the toot. Add the new line to LINES.deedee (new kind or a two-line sequence), to status.md "Lines to bake" and claude/voice-baker-scripts-tombo.json. Silent until baked. No em dashes. |
| Grandma Squeeze (B5) | keep | | No change. |
| To the Moon and Back (B6, ult) | no verdict | Tom gave none | No change. |

## Notes for the build
- Only eight moves change: Dish-Towel Flick, MOON & BACK, Registered Nut, Oven Mitt Ultimatum, Brisk Walk, Garden Shower (animations), Rise and Shine (voice delivery only), Beanie Master (new opening line). Do not touch the other six.
- Any changed or new line is silent or old until the all-voices bake; log it to status.md "Lines to bake" and claude/voice-baker-scripts-tombo.json.
- After the build, republish the Deedee viewer (files from the GAME or the working copy, keep engine/deedee-viewer.js; update its SETUP text for changed moves and the new name) with a fresh collection (deedee-feedback2). Do not publish the game link until Tom approves.
- Test: smoke.py, kit_test.py deedee, and the Deedee viewer test (all 14 moves, portrait and landscape; viewer test script is dv_test.py, rebuild from claude/next.md notes if fresh). Look at contact sheets, especially the stethoscope, oven mitts and weights frames.
