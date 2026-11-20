# Battle animation states for the v10 battle spec: the full list (2026-11-17 16:40)

Source: `claude/battle-spec-v10.md` (10 playable characters, 30 Vibes, 120 active moves), `claude/battle-animation-audit.md` (what the built game lacks today), and the animation test (`claude/animation-tool-test-rose-results.md`). Status: a plan. Nothing is built. The v10 spec itself is a design draft: its engine does not exist in the game yet (the built battle is "battle 2" with 14 moves per character). An earlier estimate in the test notes used the built game's 14 moves; this file replaces it.

Method assumed: Wan 3.0 video clips from one magenta left-facing hero per character, keyed and played as frame strips. The engine does position, travel, scale, props that are not in a hand, effects, icons and numbers.

## The rule that keeps this finite

A "state" needs its own body clip only when the character's BODY looks different. Everything else is a layer the engine draws over a clip. So the work splits into four lists:
1. Core body states: the same for every character, in every Vibe.
2. Move clips: the body action of each Basic and Skill.
3. Engine layers: statuses, Primes, shields, numbers, set pieces. No character clips.
4. Enemy states.

## 1. Core body states (every character, 11 clips)

| # | Clip | Loop | Covers these battle states |
|---|---|---|---|
| 1 | Idle | yes | Waiting on the timeline, target select, most buffs and debuffs (shown as overlays) |
| 2 | Low HP idle (tired, hunched or on one knee) | yes | Under 25% HP (the built game's rule; v10 does not set a number: decide) |
| 3 | Guard and brace | yes | Guard Stance, wards, taunts, shielded, intercepting a hit for an ally, counter stance, a Defend or Wait command if v10 keeps one |
| 4 | Stunned (dizzy sway) | yes | Stun, Spooked, Skill lock, other Mental statuses |
| 5 | Hit reaction (flinch and recover) | no | Normal hit, crit taken (engine adds shake and flash), damage over time tick (short version), Bleed |
| 6 | Dodge (quick lean or hop back) | no | Evasion (a core v10 stat, cap 60%), Blind attacker missing, Airborne evading a sweep |
| 7 | KO fall | no | KO. Last frame held = the KO state and party defeat. Played backwards = revive rise (Pick-Me-Up, Deedee and TNB revives, standing up at 1 HP after a win) |
| 8 | Run in place | yes | Travel to a target and back (engine moves the body), intercept dash, flee (mirrored) |
| 9 | Victory | no | Battle won, level up, Vibe rank up and mastery, a Break cheer if wanted |
| 10 | Give and hand over | no | Pick-Me-Up, single-target heals and buffs on an ally, item use if v10 keeps a bag, story Kindness commands (2.11) |
| 11 | Cast and call (big two-arm gesture, shout) | no | Capstone summons where a set piece does the work, party-wide support skills, Family Ruckus call |

States that need NO new clip: turn start (engine nudge on idle), pushed or pulled on the timeline (UI only), Slow, Fatigue, Blind on self, aggro up, all buffs, all counters (Reps, Tally, Cadence, Oven Temp, Mom Prep, Certificates: numbers on the portrait), Pep changes, receiving a heal (overlay on idle).

## 2. Move clips (per character, 9 to 12 clips)

v10 gives each character 3 Vibes x (1 Basic + 3 Skills) = 12 active moves.

| Move type | Per character | Clip plan |
|---|---|---|
| Basic Action | 3 | Own clip each. Used most often, and Double Team (2.10) replays them. |
| Skill 1 and Skill 2 | 6 | Own clip each when the body does something specific (cartwheel, kettlebell swing, nose boop, mic thrust). Plain "hand it to an ally" skills reuse Give; plain "call it in" skills reuse Cast. |
| Grand Capstone | 3 | Body-driven capstones get their own clip (Grace's leap, Olivia's freestyle, Justin's hop and punt, Nara's pounce, Amy's burnout, Rose's cart). Summon capstones reuse Cast, and the Porsche, cake, whale, moon, gate and Jumbotron are set pieces (list 3). |
| Dual Ruckus | 0 | Double Team = both Basics at once. Full Family Ruckus = both top Skills at once. Reuse. |
| Quirks and Traits | 0 | Passive. Free counters and chase hits reuse a Basic clip. |

## 3. Per-character extras (about 10 clips in total)

| Who | Extra body state |
|---|---|
| Grace | Airborne stance idle (her Basic puts her in it until her next turn) |
| Rose | Both Lambies are in her hands in most clips: needs one hero with tattered Lamby. Hidden state is engine hide plus a Backup Lamby prop on the field. Shoulder ride (Giddyup, Tata!) is two bodies in one frame: unsolved, see risks |
| Nara | Dog: all 11 core clips need dog prompts (sit idle, cower for low HP, flop for KO). Hides behind a person, darts to a person's side |
| TNB | Riding the longboard (rolling stance) for the Longboarder Vibe moves |
| Boppy | Survive at 1 HP (Gold Like My Teeth): stagger and plant, can reuse Guard |
| Olivia | Rope flurry is a loopable segment so the engine can play 2 to 7 hits. Michael runs across the field: an NPC clip |
| Tom | Starts battle in Guard (reuse). Rainbow-invincible is an overlay |

## 4. Engine layers (no character clips)

| Layer | Items |
|---|---|
| Primes on foes | Toasty (burn), Drenched, Dazzled |
| Detonations | Steam Cloud, Panic Boil, Hydro-Slip, Short Circuit, Shatter Glitz, Sensory Overload |
| Flavor hit effects | Clobber, Sizzle, Drench, Razzle, Racket, Support |
| Statuses on anyone | Slow, Stun stars, Blind, Fatigue, Bleed, Spooked, taunt and Eyes On Me marker, Skill lock, Wired, Detention, Yellow Flag, My Toy mark, Five-Alarm Burn |
| Buffs | Speed, Attack, Defense, Evasion, Crit, regen, Stuffed, Poise, Gold Star, Fresh Ride, Childproofed, Spiced Up, status immunity |
| Shields | One shared bubble plus skins: golden crust, clay carapace, Fired Glaze, pillow fort, Clean Bill, drywall, jackets, suite doors |
| Field hazards | Glue trap, wet floor, copper banner, cool mist, iron gate |
| Set pieces | Every Capstone object and vehicle, Sunday dinner table, blanket kingdom, kiln, boat, e-bike, Waymo |
| Composure | Pips, Break burst, Flustered marker |
| Interface | Timeline bar, round divider, Pep, Ruckus gauge, damage and heal numbers, 3 status icons per unit, counters on portraits |

Only three statuses change a body: Stun (clip 4), low HP (clip 2), KO (clip 7).

## 5. Enemy states

| State | Regular monster | Elite and Boss |
|---|---|---|
| Idle | yes | yes |
| Attack (hold, then strike) | yes | yes, one per attack pattern |
| Hit | yes | yes |
| Defeated, or won over by kindness | yes | yes, story-specific |
| Charge-up for a heavy attack (several skills interrupt it) | no | yes |
| Guard and counter stance | no | yes |
| Flustered (Break: slumped until its next turn) | no | yes |
| Slip, pulled forward, stealth, Primes, statuses | overlay or engine motion | overlay or engine motion |

The built game has 86 monsters drawn from painted sheets. Recommendation: monsters stay on painted sheets with engine motion. Video clips go to bosses only, later. The v10 bestiary is not written, so there is no count.

## 6. Totals

| Set | Clips |
|---|---|
| Core, 11 x 10 characters | 110 |
| Moves, 9 to 12 x 10 characters | 90 to 120 |
| Extras | about 10 |
| **Party total** | **about 210 to 240** |
| Generations with retries (x 1.4) | about 300 to 340 |
| First playable pass (spec section 4: one Sig Vibe each): core 11 + 4 moves, x 10 | about 150 |

Cost: unknown until Tom reports the credit price of one 5 second Wan clip. At 70 to 100 credits a generation, the full set is about $210 to $340. Tom's time at about 6 minutes a generation: about 30 to 35 hours.

A different outfit per Vibe multiplies the 11 core clips by 3 (the body is on screen in that outfit the whole fight): about 220 more clips. Recommendation: one battle outfit per character; the Vibe shows through props, set pieces and the subtitle.

## 7. Not yet proven (test before committing)

| Risk | Why it matters |
|---|---|
| A prop held in the hand through a clip | Almost every Basic and Skill has one. Never tested (the controller clip was skipped). If it fails, 90 or more move clips fail. |
| KO fall | The body ends lying down, far outside the standing frame, and prompts cannot say hurt or knocked out. |
| Two bodies in one clip | Rose on an ally's shoulders. Likely needs a painted composite, not video. |
| Memory on the phone | A 5 second clip at 30 frames a second is 150 frames. Clips must be trimmed to 1 to 2 seconds at 12 to 15 frames a second and loaded per battle, or four characters will not fit. |
| The engine | v10 rules are not built. The clip player and the v10 engine get built together. |

## 8. Order of work

1. Two test clips on Rose: a held prop (Lamby boomerang wind-up) and a KO fall. Go or no-go for the whole plan.
2. Rose's full core set (11) so one character is complete end to end in a real battle.
3. Core sets for the other nine (heroes first).
4. Moves by the spec's build order: first Sig Vibe, second Sig Vibe, third Vibe.
