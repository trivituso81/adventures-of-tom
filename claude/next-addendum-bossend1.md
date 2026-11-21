# Boss endings: assessment and proposal (bossend1, 2026-11-11, main at 5c8fb6b, NOTHING BUILT OR PUSHED)

Tom (11-11 12:54): after each boss battle the narrator describes what happens to the boss, but the boss is no longer there. Assess each boss, then propose a visually stunning ending for each. He will paint extra frames.

## Cause (fact)
- `b2RewardsData()` in engine/battle2.js calls `monsterFall(npc)` on every win. `monsterFall` (engine/world.js) moves any monster that is not `scripted` out of `map.npcs` into `map.fallen` until the player re-enters the area (Tom's 10-31 rule for ordinary monsters). Bosses are not exempt.
- So a boss that is a map monster is off the map before its after scene starts. It still talks (dialogue portrait), and the narrator line plays over an empty spot.
- Reproduced with a real win (not the auto-win harness) for bigone, redpen, drillworm: before `inNpcs:true`, after `inNpcs:false, inFallen:<map>`. `tools/boss_stage_test.py` replaces the battle with a flag, so stage1 never saw this.
- Where the boss does stay (scripted actors), the change the narrator describes is one instant step (a flag or `hidden=true` plus a whoosh sound). No boss has an animated ending.
- Every boss sheet has only stance, hurt, attack1 to attack4. No calm, happy or leaving frame exists for any boss.

## Assessment
| Ch | Boss | Kind of actor | On screen in after scene now | What the script says happens |
|---|---|---|---|---|
| 1 | The Big One | map monster | No (run) | Gives the tin back, goes back in the pond |
| 2 | The Big Shake | map monster | No (code) | Goes back under the hill, sky turns blue |
| 3 | Old Iron-Gill | map monster | No (code) | Gives the jar back, sinks into the Deep Pool, friendly bubbles |
| 4 | The Director's Cut | map monster | No (code) | Hops off the rack, rolls away under the set |
| 5 | The Red Pen | map monster | No (run) | Clicks shut, rolls off the podium, hops down the hall |
| 6 | Chairman Cheeks | map monster | No (code) | Hops off the hoard, straightens tie, scampers down the Oak |
| 7 | The Unread | map monster | No (code) | Closes slowly, settles on the lectern, lamps stop flickering |
| 8 | Old Ironbelly | map monster | No (code) | Blue flames drift up the flue, her own fire settles gold |
| 9 | The Mirrorball | map monster | No (code) | Turns once, the moon rises out of her; Tom and Deedee sway |
| 10 | The Last Call | map monster | No (code) | Gives coin eight; every clock starts |
| 11 | FINAL CALL | map monster | No (code) | Gets a boarding pass; board updates |
| 12 | Gridlock Prime | map monster | No (code) | Turns green, takes the exit; green lamp pops off |
| 13 | Drill Worm | map monster | No (run) | Bit down, engine off; hush chip pops out |
| 14 | The Warden (Boppy) | scripted | Yes, armour switches off in one frame | Gold melts like wax, helmet rolls down the steps |
| 15 | HUSH-9 | scripted | Yes, no change shown | Chip cracks, glove lowers, the train laughs |
| 16 | Marlowe | scripted | Yes, no change shown | The amber goes out of him; wind, no song |
| 17 | Twin Lenses | findMonster | Probably no (code, not run) | Amber lens cracks, cold lens goes dark |
| 18 | Vance | findMonster | Not a win ending: Tom is unwritten | Leave as is |
| 19 | Oblivion Censor | findMonster | Probably no (code, not run) | Lowers stamp, black bar slides off, a small tired man |
| 20a | Chronos-Leviathan | findMonster | Hidden by the scene in one step | Comes apart like a watch, gear by gear |
| 20b | Julian | findMonster | Probably no (code, not run) | Sits in the armchair, lets go, every clock ticks to five |
| NS | Brain Freeze | scripted | Yes, no change shown | Gives the scoops back, hums |

## Proposal
Step 1 (no art): a boss never falls. It stays on the map through its after scene, faces the family, and leaves at the narrator line with a short move built from frames it already has. Fixes the missing boss in all chapters. New engine piece: a `{finale:'<id>'}` scene step and one finale function per boss (same pattern as the Tombo animations). Real-win test added to the staging harness.
Step 2 (art): one ending sheet per boss, Art Library entries `foe-<id>-ending`, frames face right like the battle sheets. Kind win and plain win share the frames and differ in the last beat.

| Ch | Boss | Ending | New frames |
|---|---|---|---|
| 1 | The Big One | Laughs (kind) or huffs, flips the tin off his head in a high sparkling arc to Deedee, belly-flops into the pond: tall splash, rings across the whole pond, lily pads bobbing. Stays as two eyes above the water. | 4: belly laugh, tin toss, dive, eyes above water |
| 2 | The Big Shake | Yawns and sinks into the hill, the cracks sealing with gold light. Pipes cough one clean white cloud, then the brown sky peels back to blue from the Observatory outward, sun rays crossing the plate. | 3: yawn, half sunk, top of head with one eye closed |
| 3 | Old Iron-Gill | Catch and release. Spits the jar to Boppy, then one last leap right over the pool, slow at the top, backlit, gold water trail, big slap-down, a column of bubbles (hearts on a kind win). | 4: jar spit, leap rising, leap peak, tail wave |
| 4 | The Director's Cut | Set lights snap to one spotlight. Tips the beret, bows, a clapper snaps, rolls off under the set while the picture closes to a circle around it and reopens warm. Kind win: GREAT TAKE in marquee bulbs. | 4: beret tip, bow, rolling x2 |
| 5 | The Red Pen | Draws one huge glowing gold star (kind) or a red check mark in the air in a single stroke. Clicks shut, hops off the podium and out, each hop leaving a red dot that fades. | 4: flourish, clicked shut, hop x2 |
| 6 | Chairman Cheeks | Bangs an acorn gavel. The hoard slides away in a gold acorn avalanche and uncovers the jar, glowing. Straightens tie, salutes, leaps: a small silhouette gliding across the sunset canopy, leaves spinning behind. | 4: gavel, tie, salute, glide |
| 7 | The Unread | Pages fan and the letters lift off as gold motes, circle the Reading Room like fireflies (kind: they form Rose's dragon for a second), pour back in. Closes slowly, lamps go steady one by one, coin slides out. Stays on the lectern for good. | 3: fanning, half closed, closed and content |
| 8 | Old Ironbelly | She stays. Blue flames rise off her grate in a spiral up the flue, each a small star. Her window turns from cold blue to deep gold and warm light sweeps the Boiler Room. | 2: content face with gold fire, door ajar and glowing |
| 9 | The Mirrorball | Biggest of Part 1. Turns once, every tile lights, the moon rises out of her and through the glass, the Dome goes dark then silver, a thousand small moons circle the room, Tom and Deedee sway under her. | 4: calm and softly lit, full glow, Tom and Deedee sway x2 |
| 10 | The Last Call | Flaps ripple top to bottom and settle on HERE (kind) or ON TIME. Coin drops from the bottom row. When Tom sets it in the gate clock a ring of light rolls across the terminal and every board and clock ticks at once. Stays, showing 12:01. | 3: flaps mid-ripple, lit warm, coin offered |
| 11 | FINAL CALL | Takes the boarding pass, every row flips to ON TIME in a gold cascade, walks down the jet bridge into the light with the pass held up, turns once to look back. | 3: holding the pass, walking away x2 |
| 12 | Gridlock Prime | All three lamps go green, blinker on, merges away down the street. Headlights of every stuck car come on in a wave and colour floods back into the grey street from where it stood. | 3: all green, signalling, driving away |
| 13 | Drill Worm | Bit spins down with last sparks, coils up like a cat, one long steam sigh, the chip pops out in a small arc. Stays asleep in the chamber. | 3: winding down, coiled asleep, chip (prop) |
| 14 | The Warden | Gold drips off Boppy top to bottom with light in it and soaks into the porch; the helmet bounces down the steps to Rose. | 3: armour half melted, helmet only, helmet (prop) |
| 15 | HUSH-9 | A line of light splits the chip. Sound comes back as coloured ripples filling the grey room. Glove lowers; it sits down when the train laughs. | 3: glove lowered, cracked chip, seated |
| 16 | Marlowe | Kept small on purpose (the script says nobody cheers). The amber drains down out of him into the cobbles and blows away as dust on the wind. | 2: amber gone and head down, kneeling |
| 17 | Twin Lenses | A crack of light crosses the amber lens, the cold lens irises shut, and the kept days pour out as hundreds of small glowing photographs drifting up through the building. | 3: amber cracked, both dark, Archivist without lenses |
| 18 | Vance | No change. | 0 |
| 19 | Oblivion Censor | Black bar slides off in jerks, falls and breaks into loose letters that scatter; every struck-out word in the room re-inks itself, and Tom is written back in line by line. | 3: stamp lowered, bar half off, face shown |
| 20a | Leviathan | Un-builds in order: gears lift off and hang in the air, still turning, a slow ring of them round the room, and the glass living room is uncovered in the middle. | 3: half apart, coil open, loose gears (prop sheet) |
| 20b | Julian | Seen in the armchair with the cardigan, tennis ball and crisp, light coming through the cracks. When he lets go, every hanging gear reverses together and turns gold, and the clocks tick to five. | 3: hat in hands, with the gifts, breath out and head up |
| NS | Brain Freeze | Frost melts off the lid, lid lifts with gold light and cold mist over nine scoops in a row, a contented hum. | 2: lid open and glowing, content |

Total: 66 new frames on 21 sheets.

## Next session, if Tom says go
1. Step 1 for all 22 (engine/world.js boss exemption, `{finale}` step, exits from existing frames), real-win case in tools/boss_stage_test.py, both orientations, CHANGES entry, push.
2. Write the 21 ending sheet entries into the Art Library (prompt pattern from docs/ENEMY_SHEETS.md, refs = each boss's current sheet). Chapter 1 first as the pilot; build its finale when Tom's sheet is approved, show him, then the rest in chapter order.
3. Add `claude/next-addendum-bossend1.md` to next.md's read list. next.md was NOT rewritten by this session (nothing built).
