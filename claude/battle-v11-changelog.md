# The Adventures of Tom: Battle Spec v10 -> v11 and Bestiary v10.1 -> v11 Change Log

Written 2026-11-18. Source of the review: Gemini's "v10 Balance Check Report" (2026-11-17), checked line by line against the spec's formulas and the bestiary's own model (section 1.6).

| File | Was | Is now |
|---|---|---|
| Spec | `claude/battle-spec-v10.md` | `claude/battle-spec-v11.md` |
| Bestiary | `claude/bestiary-v10.1.md` | `claude/bestiary-v11.md` |

The old files stay as history. Nothing here is built into the game. The numbers are still untested in play.

## 1. Verdict on each Gemini finding

| # | Gemini's finding | Verdict | What v11 does | Why |
|---|---|---|---|---|
| 1 | Ch 1 Log Lump + Skeeter Swarm ends in 2 rounds. Raise HP to 220 and 105. | Wrong | Nothing | The 1.6 model gives 3.5 rounds. Even if all 8 actions of two rounds attack a weak point with no guard and no misses, the party deals about 197 of the 244 HP. Gemini's HP would make it 4.7 rounds, longer than a pair of late-game Bruisers. |
| 2 | Ch 2 Tar Pit Blob + Ticket Flurry ends in 2 rounds. Raise HP to 265 and 120. | Wrong | Nothing | Gemini used Deedee and a party of 4. Chapter 2 is a 3-person Los Angeles party without her. The model gives 4.6 rounds with 3 (3.4 with 4). |
| 3 | Ch 16 two Citation Slips end in 2 rounds. Raise HP to 1,150. | Right, smaller fix | HP 808 -> 1,000 in its own fight. Stays 404 as the boss's helper. | The model gives 2.7 rounds, the shortest normal fight in the game and the chapter's only one. 1,000 gives 3.3. 1,150 would overshoot, and keeping 404 leaves the boss fight unchanged. |
| 4 | Citation Slip has 3 Pet Peeves. Trim to Racket and Drench. | Right | Done | Every other foe has 1 or 2. Three of five flavors made nearly every hit a weak-point hit. The two left match the boss. |
| 5 | Ch 19 Dead Letter alone ends in 2 rounds. Raise Dead Letter and Rubber Stamp to 3,100. | Wrong | Nothing. Logged as a thing to watch. | The model gives 3.3 rounds. 3,100 would give a normal foe more HP than the chapter's mini-boss (2,300) and nearly the boss (3,400), and would stretch the Courier fight from about 6.8 to 8.2 rounds. |
| 6 | Loop A: Boppy, Grace and Justin lock a boss out of ever acting. | Partly right | (a) `1970 Cross-Country Story`: "locking foe" now means locking that foe's aggro onto Boppy, and the foe still takes its turns. (b) Spec 2.7: a Flustered foe cannot be pushed further, and always gets its next turn. | "Locking foe 2t" was undefined, so it could be read as lost turns. There is no true lock: pips refill on the foe's next turn, so it always acts after a Break, and halving caps pushes at about 61 ticks a round even if the whole party pushes. The real gap was pushing an already Flustered foe to stretch its +35% damage window. No cooldown is needed once the wording is fixed. |
| 7 | Loop B: `Jazz-Hands Cartwheel` swaps a boss to the back of the bar every round. | Right | The swap now moves each side 25 ticks at most, and is defined as a push on the foe and a pull on Grace. No cooldown. | A swap had no size limit: a boss 5 ticks from acting went back about 95 ticks for 2 Pep, and Grace could repeat it every round at no net Pep. 25 matches Justin's 2 Pep push. With a cap, the normal halving rule does the rest. |
| 8 | Loop C: `New Game Plus` lets Tom fire a Grand Capstone every turn. | Partly right | The discount works only on Skills costing 4 Pep or less. | Gemini's Pep count is off by one inside a single round (Tom ends on 3, Konami costs 4). But a Capstone turn spans two rounds, so gifts can reach him under two separate caps, and two feeders do make it every turn. Taking Capstones out of the discount is the smallest fix. |
| 9 | Loop D: Grace's Dumpling plus Deedee's Home Cook is a free-turn battery. Remove the +1 Pep and add a cooldown. | Wrong | Nothing | It is not a loop. Each cycle costs Grace two turns, and Deedee's free Skill is spent on Wine O'Clock to refuel Grace. The whole output is one row splash per cycle, less than Grace attacking. The one-granted-action-per-round rule already limits it. |
| 10 | Squishy Collector is the best Vibe. Cut `Ultra-Rare Limited Edition` to 15%, and make `Crunchy Sugar-Cube Pop` 4 Pep with a 15% push. | Partly right | `Crunchy Sugar-Cube Pop` costs 4 Pep. Push stays 30. `Ultra-Rare` stays 30%. | The real problem is the Pop: at 3 Pep Grace could cancel nearly every telegraphed boss attack in the game. At 4 Pep it matches Justin's Main Breaker Flip and needs two Basics between uses. `Ultra-Rare` is in line with Tom's 25% and Amy's 40%, and her ally Skills are limited by Pep anyway. |
| 11 | Longboarder is the best buffer. Make `E-Bike Tag-Along` 3 Pep and +15%. | Right, one lever | +25% -> +15% Spd/Atk/Def. Cost stays 2 Pep. | Three +25% stats plus a cleanse and a debuff block for 2 Pep was well above every other 2 Pep Skill, and the Capstone doubled it to +50%. At +15% (doubling to +30%) it sits beside Deedee Makes It Better. Changing both cost and size would overshoot. |
| 12 | Boat Angler is useless. Lower the AoE threshold to Tally 2 and give +2 Tally on pulls and boss hits. | Partly right | `Trophy Striper Haul` hits all foes at Tally 2+ (was 3+). No extra Tally. | "Useless" is overstated: most normal formations have a Back-row foe for him to hook. But Tally 3 arrives on his 4th action and normal fights last 3 to 4 rounds. +2 Tally per pull would open the 6 Pep Capstone on turn 2. |
| 13 | Pet Peeve 1.5x and Resist 0.65x are missing from the spec. | Right | Added to spec 2.4. | Already listed as owed in bestiary 1.3. |
| 14 | "Marks the target" is undefined (Big One, Last Call, Studio Rig). | Right | Bestiary 1.1: Mark rule. | Not a status, cannot be cleansed, an intercept redirects it. Different from Gemini: it misses a hidden ally, so Rose's Bait & Switch is a real answer. |
| 15 | The Red Pen's counter with Recovery 0 is undefined. | Right | Bestiary 1.1: Counter acts, Recovery numbers. | Once per ally action however many hits, and it does not move the foe on the bar. |
| 16 | Helper links and knock-out feedback are undefined. Let feedback pips ignore the 3-pip cap, and multiply links with Guard Stance. | Right that it is undefined, wrong fix | Bestiary 1.1: Helper links, Helper feedback. Spec 2.7: feedback pips count inside the cap. | The spec wins: same-kind reductions add up to the 60% cap, and the 3-pip cap is "from all sources combined". An exception would let one AoE take 5 pips. |
| 17 | Enemy waits and per-ally lockouts are undefined. | Right | Bestiary 1.1: Waits and counts. | Rounds count dividers, turns count that foe's own turns. |
| 18 | Enemy row swaps could leave the Front empty. | Right | Spec 2.1 and bestiary 1.1: a row move is a trade, one Front ally for one Back ally. `Gate Change` reworded. | Gemini's second half (a penalty for Back-row-only foes) is not needed: the Rows rule and Wall Perch already cover it. |
| 19 | Acts that hit 2 or 3 allies have no rule, and the growing ones never gain `aoe`. | Right | Bestiary 1.1: Acts that hit 2 or 3 allies. Note added to `Wide Arms` and `"It Was THIS Big!"`. | Full power each, not party-wide, `aoe` on any use that reaches everyone. |
| 20 | Red-Tape Wall's bounce is undefined. | Right, and one more problem | Bestiary 1.1: Bounced damage. The wall now bounces 15% of damage from any flavor that is not its Pet Peeve. | Gemini's definition is used (plain damage, cannot knock out). Also fixed: it said "projectile damage", but party Skills carry no projectile tag, so the rule could not work. |
| 21 | Debuff block, debuff bounce and "+20% damage taken" are undefined. | Right | Bestiary 1.1: Debuff block and bounce, Damage-taken penalty. | Primes and pip loss get through. |
| 22 | `Contact-Sheet Archive` puts on two Primes, against spec 2.5. | Half right | Bestiary 1.1: Two-flavor enemy acts. Spec 2.5: a two-flavor move splits its damage half and half. | Spec 2.5's Prime line is about party moves that detonate. Enemies never detonate, so there is no conflict. The missing piece was the damage split, which the spec did not give for the party either. |
| 23 | "Soaked by a shield" is undefined. | Right | Bestiary 1.1: Soaked by a shield. | The shield must absorb the whole hit. |
| 24 | REDACTED stamp: ties, half of a two-flavor move, and the Pep cost are undefined. | Right, simpler tie rule | Entry reworded. | On a tie or no damage it stamps nothing (Gemini wanted a fixed flavor order, one more thing to memorize). Pep is lost after the action, and a Basic still gains its +2 first. |
| 25 | The last fight's party swap breaks spec 2.1, and Still Frame, phase lines and the 200 Recovery are undefined. | Right | Spec 2.1 carries the exception and says how a character arrives. Bestiary: phase lines stop extra damage, waiting does not clear Still Frame, Recovery numbers rule. | A newcomer arrives at full HP with 4 Pep, and one who returns keeps what they left with, so swapping out and back is not a free heal. |
| 26 | Every boss lands at 4 to 7 rounds with no knock-outs ("No problem" on 37 rows). | Not checked, and weak | Nothing. Logged in bestiary section 7. | It is a paper estimate with nearly identical numbers on every row, and it seated the wrong party in chapters 2, 4, 6 and 8. It neither proves nor disproves the boss HP. |

## 2. Changes Gemini did not ask for

| Where | Change | Why |
|---|---|---|
| Spec 2.7 | A Flustered foe loses any telegraphed act it was charging. | Owed to the spec by bestiary 1.3. |
| Spec 2.8 | Guard Stance (25% less damage taken) and "Accuracy down" (X% chance each attack misses) added to the status table. | Owed to the spec by bestiary 1.3. |
| Bestiary, The Collector | Only a Break stops the countdown. Interrupt Skills do not cancel it. | The count was tagged `charge_up`, so Grace's Pop or Justin's Breaker Flip would have cancelled the last phase of the last boss for one Skill. The entry itself says "Break it before the count ends". |
| Bestiary, Blue and Orange Lens | With both standing, Sizzle and Razzle are cut by 60%, the spec's cap. | 50% + 25% would be 75%, over the cap. |
| Bestiary 1.3 | Now a record of the four lines, all marked as in spec v11. | Nothing is owed any more. |
| Bestiary 7 | Four new known gaps: Gemini's check is paper, the solo chapter 19 Elites, the Courier fight length, interrupts against telegraphs. | So the Battle Lab pass knows where to look. |

## 3. Every line that changed, by file

### `claude/battle-spec-v11.md`

| Where | v10 | v11 |
|---|---|---|
| Opening lines, title, section 3 heading | v10 | v11, with a pointer to this change log and to bestiary v11. |
| 2.1 Party | Swapping happens outside battle only. | Adds the last-fight exception and how a character arrives (full HP and 4 Pep if new to the fight, what they left with if returning, waiting 100 x 100 / Speed ticks). |
| 2.1 Rows | No rule for enemy row moves. | An enemy act moves allies between rows only as a trade, so the Front is never empty. |
| 2.2 Push and pull | A swap of timeline positions counts as a push. | A swap pushes the foe and pulls the ally by the gap between them, and each half follows the push and pull rules. |
| 2.2 | none | A Flustered foe cannot be pushed again until its next turn begins. |
| 2.4 | none | Pet Peeve 1.5x, Resist 0.65x, multiply, outside the +100% cap. |
| 2.5 Two-flavor moves | Order only. | Damage splits half and half, and each half meets the foe's Pet Peeve or Resist for that flavor. |
| 2.7 Cap | 3 pips from all sources. | Adds: pips lost because the action knocked out a helper count inside the cap. |
| 2.7 Flustered | Moved back, +35% damage, pips refill. | Adds: loses a charging act, cannot be pushed further, always gets its next turn. |
| 2.8 Statuses | none | Guard Stance and Accuracy down rows. |
| Tom, `New Game Plus` | next skill costs 2 less (once/round) | adds: only on Skills costing 4 Pep or less, so never on a Grand Capstone. |
| Grace, `Jazz-Hands Cartwheel` | swapping timeline positions with next slowest enemy | trading places on the timeline with the next enemy due to act: it is pushed and Grace is pulled by the gap between them, 25 ticks at most. |
| Grace, `Crunchy Sugar-Cube Pop` | 3 Pep | 4 Pep |
| Boppy, `"It Was THIS Big!"` trait and `Trophy Striper Haul` | AoEs widen at Tally 3+ | at Tally 2+ |
| Boppy, `1970 Cross-Country Story` | slowing Boppy & foe 20%, locking foe 2t | slowing Boppy & foe 20% (2t) and locking that foe's aggro onto Boppy (2t). The foe still takes its turns. |
| TNB, `E-Bike Tag-Along` | +25% Spd/Atk/Def 2t | +15% Spd/Atk/Def 2t |

### `claude/bestiary-v11.md`

| Where | v10.1 | v11 |
|---|---|---|
| Header and section 0 | v10.1 | v11, with a short table of what changed. |
| 1.1 | 17 rules | 13 new rules (Recovery numbers, Mark, Counter acts, Waits and counts, Acts that hit 2 or 3 allies, Two-flavor enemy acts, Debuff block and bounce, Bounced damage, Damage-taken penalty, Soaked by a shield, Helper links, Helper feedback, Phase lines). Rows rule extended. Pet Peeve rule adds "every foe has 1 or 2". |
| 1.3 | Four lines owed to the spec. | All four marked as in spec v11. |
| 1.6 | Normal fights left alone. | Notes the one foe off its role number (Citation Slip). |
| The Red Pen, `Points Off` | Automatic counter. | Adds "once per ally action". |
| FINAL CALL, `Gate Change` | swaps 2 allies between Front and Back | trades 1 Front ally with 1 Back ally. If a row has nobody to trade, both are still hit and pushed but no one changes row. |
| The Gold Knight `Wide Arms`, Boppy's Gold Armor `"It Was THIS Big!"` | no note | A use that reaches every ally counts as `aoe`. |
| Citation Slip | HP 808. Pet Peeves Racket, Drench, Clobber. | HP 1,000 (404 as a called helper). Pet Peeves Racket, Drench. |
| The Square's Sign, Red-Tape Wall | 15% of projectile damage that is not a Pet Peeve bounces back | 15% of the damage it takes from any flavor that is not one of its Pet Peeves bounces back at the attacker. Helper HP printed (404). |
| The Twin Lenses, `Contact-Sheet Archive` | Sizzle lands first, then Drench. | Half the power is Sizzle and lands first, half is Drench. |
| The Dead-Letter Censor, REDACTED stamp | No tie rule, "cost the attacker 1 Pep". | Tie or no damage: no stamp. The attacker loses 1 Pep after the action, never below 0. |
| Chapter 20 note, Blue and Orange Lens, The Collector | Swap exception lived only here. No phase-line rule. Countdown was a plain `charge_up`. | Points to spec 2.1. Phase lines stop extra damage. Waiting does not clear Still Frame. Only a Break stops the countdown. Both lenses together cut Sizzle and Razzle by 60%. |
| 7 | 8 gaps | "Picking the 4 again" removed (now in the spec). Four gaps added. |

## 4. Calls made here that Tom has not confirmed

| Call | The other option |
|---|---|
| `1970 Cross-Country Story` "locking foe" read as an aggro lock onto Boppy. | A lock on the foe's heavy acts, which would need a cooldown to stay fair. |
| `Jazz-Hands Cartwheel` swaps with "the next enemy due to act", 25 ticks at most. | Gemini's 35 ticks with a 2-round cooldown. |
| `Crunchy Sugar-Cube Pop` at 4 Pep with the full 30 push. | Gemini's 4 Pep and a 15 push. |
| `E-Bike Tag-Along` at +15% for 2 Pep. | Gemini's +15% for 3 Pep. |
| Citation Slip at 1,000 HP. | Gemini's 1,150. |
| A marked ally who is hidden makes the follow-up miss. | The follow-up picks a new target. |
| REDACTED stamps nothing on a tie. | Gemini's fixed flavor order. |
