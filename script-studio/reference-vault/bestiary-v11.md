# The Adventures of Tom: Bestiary v11

Written 2026-11-17 as v10.1. Revised to v11 on 2026-11-18 after the balance check. A design draft. Nothing here is built, and the built game's battle system is unchanged.

| Question | Answer |
|---|---|
| What is this | Every enemy, boss and encounter for the v11 battle system: 90 entries (63 regular enemies, 23 bosses and mini-bosses, 4 special entries), plus one rule that brings the Part 1 Long Island monsters back in chapters 13 and 14. |
| What it replaces | `claude/bestiary-v10.1.md`, and before that Gemini's draft, `claude/bestiary-v10-gemini-draft-part1.md` to `part3.md`. Those stay as history. |
| What it reads with | `claude/battle-spec-v11.md`. Where the two disagree, the spec wins. |
| Story details | The locked chapter script wins over anything here. Only stats, acts and battle rules are this file's job. Chapters 15 to 20 are marked PROVISIONAL: their names, places and looks wait for each chapter's script. |
| Are the numbers tested | No. Boss HP comes from a written-out model (section 1.6), not from play. Gemini's balance check of 2026-11-17 was a paper estimate too (section 7). It needs a pass in the Battle Lab once the system is built. |
| Ids | The `id` of each foe is the built game's code id and stays as it is, even where the display name changes. Art is `art/foes/<id>.webp`, and bosses also have `<id>-end.webp`. |

## 0. What changed

### 0.1 From v10.1 to v11 (2026-11-18)

Full list with reasons: `claude/battle-v11-changelog.md`.

| # | What v11 does |
|---|---|
| 1 | Adds 13 enemy rules to section 1.1 that the entries already relied on (Mark, counter acts, Recovery numbers, waits, acts that hit 2 or 3 allies, two-flavor enemy acts, helper links, helper feedback, debuff block and bounce, damage-taken penalties, bounced damage, shield soak, phase lines) and extends the Rows rule. |
| 2 | Section 1.3: the four lines owed to the spec are now in spec v11. |
| 3 | Citation Slip (chapter 16): 2 Pet Peeves instead of 3, and 1,000 HP in its own fight instead of 808. |
| 4 | The Square's Sign: the bounce no longer says "projectile", because party Skills carry no such tag. |
| 5 | The Dead-Letter Censor: the REDACTED stamp now says what happens on a tie and when the Pep is lost. |
| 6 | The Collector: phase lines stop extra damage, waiting does not clear Still Frame, and only a Break stops the countdown. |
| 7 | Not changed: Log Lump, Skeeter Swarm, Tar Pit Blob, Ticket Flurry, Dead Letter and Rubber Stamp keep their HP (reasons in the change log). |

### 0.2 From Gemini's draft to v10.1 (2026-11-17)

| # | Problem in the draft | What v10.1 did |
|---|---|---|
| 1 | The chapter 13 Gold Knight fight was missing. | Added as a full boss entry (The Gold Knight). The Drill Worm becomes the tunnel's boss partway through the chapter. |
| 2 | The Part 1 monsters and bosses that wake up again on Long Island were missing. | Added as one rule with a stat table (section 3), so no art or act list is duplicated. |
| 3 | The Boppy fight used a halberd, and stopped Grace and Rose from dropping below 1 HP. | Rewritten as Boppy's Gold Armor: a normal fight, seven silly attacks, no weapon, the girls can be hit and can hit back, all damage lands on the armor. |
| 4 | Late bosses ran about twice the 5 to 7 round target. | Every boss's HP is reset from one model. Chapter 20's boss goes from about 12.5 rounds to about 8.5 with its two lenses. Table in section 1.6. |
| 5 | The draft added rules the spec does not have. | Each one is either written down here as an enemy rule (section 1.1) or taken out (section 1.2). Four lines were owed to the spec (section 1.3). |
| 6 | Chapters 15 to 20 stated story details as locked. | Marked PROVISIONAL. Where the draft contradicted the story thread, the story thread's version is used. |
| 7 | Chapter 3 was moved onto a boat, with Boppy on the wrong starting Vibes. | Back at the pier. Iron-Gill's dive can be answered with everyone's starting Vibes. |
| 8 | Chapters 15 and 16 were moved to Los Angeles. | Back where the built game and the story thread have them. Tom's real house number is removed from the file. |
| 9 | Chapter 18 had the party smash the camera, which the story needs intact in chapter 20. | The enemy is the studio's lighting rig. The camera is never the target. |
| 10 | The final boss was violet-black. Canon says it is the same gold as Boppy's armor. | Gold. Lines that explain what it is are removed. |
| 11 | Chapter 19 paired two Elites in normal fights. | One Elite per fight. |
| 12 | Some "answers" named Skills that do not do that job in the spec (for example Panic Boil! removing a buff). | Each boss's answers were checked against the spec's kit lines and trimmed to the ones that work. |

## 1. Enemy rules

The spec (section 2.1) leaves enemy stat lines, Pet Peeves and behavior to the bestiary. These are those rules.

### 1.1 Rules this bestiary sets

| Rule | What it means |
|---|---|
| No Kindness in battle | No Warmth, HEART, praise or story commands of any kind. A fight ends at 0 HP. Kindness happens in the scene after. (Tom, 2026-11-17.) |
| Pet Peeve | A flavor the foe is weak to. It takes 1.5x damage from it. Elites and Bosses also lose 1 pip per action, as the spec says. Every foe has 1 or 2. |
| Resist | A flavor the foe shrugs off. It takes 0.65x damage from it. |
| Enemy turns | Enemies have no Pep. They act on Recovery Ticks only, from a set list of acts. |
| Enemy power | Quick act 0.8x, Recovery 80. Standard 1.0x, Recovery 100. Heavy 1.5x on one target, Recovery 120. A party-wide act prints its own power (1.05x to 1.35x), and that number is final: the spec's 70% rule for party-wide Skills is not applied again. |
| Recovery numbers | An act's Recovery is its Base Recovery. 0 means the act fires at once and does not move the foe on the turn bar. Any other number is used as printed (the last boss's 200-tick count). |
| Telegraph (`charge_up`) | The foe announces the act on one turn and fires it on its next turn. An interrupt Skill or a Break cancels it. |
| Mark | "Marks the target" names the ally the follow-up act will hit. It is not a status: it cannot be cleansed, and it stays on that ally through a row change. It ends when the follow-up fires or is cancelled. An intercept (Tom's Suite Door Slide) redirects the follow-up like any single-target hit. If the marked ally is hidden or untargetable when it fires, it misses. If the marked ally is knocked out, it picks a new target by aggro. |
| Counter acts | An act whose target is "the attacker" answers an ally's action. It fires once per ally action, however many hits that action has, and its Recovery is 0. |
| Waits and counts | "X-round wait" means X round dividers must pass before the foe can pick that act again. "Every 3 rounds" means at every 3rd divider. "Every 3rd turn" and "not on the same ally again for 2 turns" count that foe's own turns. |
| Acts that hit 2 or 3 allies | Each target takes the full printed power. The act is not party-wide, so `aoe` answers do not apply. On any use where it reaches every ally standing, it counts as `aoe`. "Adjacent" follows the spec's slots. |
| Two-flavor enemy acts | Written like Sizzle/Drench. Half the printed power lands in each flavor, first-named first, and each half meets the ally's own protection against that flavor. The act puts on the Primes its Effect cell names. |
| Guard Stance | The foe takes 25% less damage for 2 of its turns, unless its entry prints another number. Panic Boil!, a Break and stance-breaking Skills end it. |
| Mend | A buff: the foe heals the printed percent of its Max HP at the start of each of its turns. It can be stripped. |
| Debuff block and bounce | "Blocks 1 debuff": the next stat penalty or status the party puts on the foe does nothing, and the block is used up. "Bounces 1 debuff back": the same, and the penalty lands on the ally who used it, for its printed length. Primes and Composure loss are not debuffs, so they get through. |
| Bounced damage | When a foe bounces damage, it still takes the whole hit. The attacker takes the printed percent of the damage dealt as plain damage: no flavor, not reduced by Defense, absorbed by shields first, and never enough to knock out (it stops at 1 HP). |
| Primes on the party | An enemy Sizzle, Drench or Razzle act that says so puts Toasty, Drenched or Dazzled on an ally, with the spec's effects. Enemies never Detonate. |
| Self-Prime | Some acts leave the foe itself Primed. The party can Detonate that. It is the planned opening on several bosses. |
| Skill Lock | A Mental status: the ally cannot use the Skills from their Pocket Vibe. |
| Taunt | A Mental status: the ally's single-target attacks must aim at the taunter. |
| Damage-taken penalty | "The target takes +X% damage" is one kind of modifier. Penalties of this kind on one ally add together. |
| Soaked by a shield | A hit is soaked when the ally's shield absorbs all of it and no HP is lost. The status that rides on the hit then does not land. |
| Pep drain | "-1 Pep" lowers the ally's Pep by 1, never below 0. |
| Pushes | "X-tick push" adds X ticks to the ally's wait, with the spec's halving for repeat pushes in one round. |
| Rows | If no foe stands in Front, Back-row foes count as Front, unless a trait says otherwise. A foe changes its own row only where its entry says so. An enemy act moves allies between rows only as a trade, one Front ally for one Back ally (spec 2.1). |
| Adds | A foe called in mid-fight arrives at half the HP of its normal entry unless its entry prints a number, has 0 pips and pays 0 VP. |
| Helper links | "While it stands, the boss takes X% less damage" is damage reduction. It adds to Guard Stance and any other reduction, up to the spec's 60% cap. |
| Helper feedback | Pips a boss loses when a helper is knocked out count inside the spec's 3-pip cap for the action that did it. HP a boss loses this way is a flat amount with no modifiers. |
| Phase lines | Where a boss has phases, damage past a phase line is lost: its HP stops at the line and the next phase starts at once. |
| Party of 3 | Boss HP is listed for the party size that chapter expects. One fewer party member: three quarters of it. One more than 3: four thirds. |

### 1.2 Taken out of the draft

| Draft rule | Why it is out | What replaces it |
|---|---|---|
| Accuracy penalties on party members | The spec has no rule for a party member missing. | Blind, Slow or an Atk penalty, all defined in the spec. |
| "Spooked" put on party members, with three different meanings | Spooked is TNB's status in the spec, with one meaning. | Plain named penalties (for example "-20% Atk (2t)"). Enemies never inflict Spooked. |
| Summoned helpers with 3 Composure pips | The spec gives pips only to Elites and Bosses, 4 to 8. | Helpers have 0 pips. Their effect fires when they are knocked out. |
| The 1 HP floor for Grace and Rose, and adults-only targeting, in the Boppy fight | Tom: it is a normal fight and the girls can be hit. | Nothing. |
| "Locked story encounter rules" | Spec rule 2.11 was deleted. | Ordinary boss mechanics. |
| Four kinds of Skill Lock | One is enough to learn. | The single Skill Lock in 1.1. |
| A separate 1,100 HP barrier on the chapter 18 boss | A second HP bar the spec does not describe. | A Guard Stance. |

### 1.3 Lines that were owed to the spec

All four are in `claude/battle-spec-v11.md`. Nothing is owed now.

| Spec section | Line | Status |
|---|---|---|
| 2.4 | A Pet Peeve hit does 1.5x damage and a Resist hit 0.65x. Each is its own kind of modifier, so it multiplies, and it does not count toward the +100% outgoing bonus cap. | In spec v11 |
| 2.7 | A Flustered foe also loses any telegraphed act it was charging. | In spec v11 |
| 2.8 | Guard Stance: 25% less damage taken. Tom's Priority Boarding uses the same stance. | In spec v11 |
| 2.8 | Accuracy: "-X% accuracy" on a foe is an X% chance that each of its attacks misses. | In spec v11 |

### 1.4 Roles

| Role | HP | Atk | Def | Spd | Row | Pips |
|---|---|---|---|---|---|---|
| Swarmer | 0.65x | 0.85x | 0.80x | 1.05x | Front | 0 |
| Skirmisher | 0.80x | 1.05x | 0.85x | 1.20x | Front or Back | 0 |
| Hexer | 0.85x | 0.95x | 0.90x | 1.05x | Back | 0 |
| Bruiser | 1.15x | 1.10x | 1.05x | 0.95x | Front | 0 |
| Elite | 1.80x | 1.15x | 1.25x | 0.90x | Front | 4 (chapters 1 to 15 and the bonus), 5 (16 to 20) |
| Boss | from the model in 1.6 | 1.25x | 1.15x | 1.02x | Front | 6 (chapters 1 to 6 and the bonus), 7 (7 to 15), 8 (16 to 20) |

Each multiplier applies to that chapter's line in 1.5.

### 1.5 Chapter baseline

The foe and player columns are Gemini's and are unchanged. "Output factor" is explained in 1.6.

| Ch | Foe HP | Foe Atk | Foe Def | Foe Spd | Player Lv | Player HP | Player Atk | Player Def | Player Spd | Output factor |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 92 | 22 | 15 | 94 | 2 | 115 | 26 | 16 | 100 | 1.05 |
| 2 | 112 | 26 | 18 | 96 | 4 | 145 | 31 | 19 | 101 | 1.10 |
| 3 | 155 | 33 | 22 | 98 | 7 | 190 | 39 | 23 | 102 | 1.15 |
| 4 | 190 | 38 | 25 | 100 | 9 | 230 | 45 | 26 | 103 | 1.20 |
| 5 | 228 | 44 | 28 | 102 | 12 | 280 | 53 | 30 | 104 | 1.25 |
| 6 | 285 | 52 | 32 | 104 | 14 | 335 | 62 | 34 | 105 | 1.30 |
| 7 | 330 | 59 | 35 | 105 | 17 | 390 | 71 | 37 | 106 | 1.35 |
| 8 | 375 | 66 | 39 | 106 | 19 | 445 | 80 | 41 | 107 | 1.40 |
| 9 | 420 | 74 | 42 | 107 | 22 | 505 | 90 | 45 | 108 | 1.45 |
| 10 | 490 | 84 | 46 | 108 | 25 | 570 | 102 | 49 | 109 | 1.50 |
| 11 | 555 | 92 | 49 | 110 | 27 | 630 | 112 | 52 | 110 | 1.55 |
| 12 | 620 | 100 | 52 | 111 | 30 | 695 | 124 | 56 | 111 | 1.60 |
| 13 | 690 | 109 | 55 | 113 | 32 | 755 | 136 | 60 | 112 | 1.65 |
| 14 | 755 | 118 | 58 | 114 | 35 | 820 | 148 | 63 | 113 | 1.70 |
| 15 | 860 | 130 | 62 | 116 | 37 | 880 | 162 | 67 | 114 | 1.75 |
| 16 | 950 | 140 | 66 | 118 | 40 | 940 | 176 | 70 | 115 | 1.80 |
| 17 | 1,040 | 150 | 70 | 119 | 42 | 995 | 190 | 73 | 116 | 1.85 |
| 18 | 1,130 | 162 | 74 | 120 | 45 | 1,050 | 205 | 76 | 117 | 1.90 |
| 19 | 1,190 | 168 | 77 | 121 | 47 | 1,100 | 220 | 79 | 118 | 1.95 |
| 20 | 1,250 | 175 | 80 | 122 | 50 | 1,150 | 235 | 82 | 120 | 2.00 |

### 1.6 Boss HP model

The draft set boss HP as 5 to 6.5 times the chapter's foe HP. Foe HP grows much faster than the party's damage, so fights stretched as the game went on. Since v10.1, boss HP is set from the number of rounds the fight should last.

| Term | Value |
|---|---|
| One standard hit | Player Atk x 100 / (100 + boss Def) |
| Party damage per round | Party size x 0.75 x one standard hit x output factor |
| Why 0.75 | About one action in four is a heal, shield or other Support move. |
| Output factor | 1.0 + 0.05 per chapter (1.05 in chapter 1, 2.00 in chapter 20). It stands for everything that raises damage above a plain standard hit: stronger Skills at higher ranks, Pet Peeve hits, Stat Leans, Traits and Quirks, crits, the Flustered bonus. It is an estimate. |
| Boss HP | Rounds aimed for x party damage per round |
| Rounds aimed for | 6 for a boss. 5 for a boss that brings helpers, so the whole fight still lands near 6 to 7. 7 for Boppy's Gold Armor and for the last boss. 3.5 for the chapter 19 mini-boss. 4 for a returning Part 1 boss. |

| Ch | Boss | Party | Draft HP | Rounds at draft HP | HP | Rounds aimed for | HP with the other party size |
|---|---|---|---|---|---|---|---|
| 1 | The Big One | 4 | 460 | 6.6 | 420 | 6 | 320 |
| 2 | The Big Shake | 3 | 480 | 7.6 | 380 | 6 | 510 |
| 3 | Old Iron-Gill | 4 | 775 | 7.2 | 650 | 6 | 490 |
| 4 | The Director's Cut | 3 | 800 | 8.5 | 470 | 5 | 630 |
| 5 | The Red Pen | 4 | 1,140 | 7.6 | 900 | 6 | 680 |
| 6 | Chairman Cheeks | 3 | 1,220 | 9.2 | 660 | 5 | 880 |
| 7 | The Unread | 4 | 1,914 | 9.3 | 1,230 | 6 | 920 |
| 8 | Old Ironbelly | 3 | 1,850 | 10.6 | 1,040 | 6 | 1,390 |
| 9 | The Mirrorball | 4 | 2,436 | 9.2 | 1,590 | 6 | 1,190 |
| 10 | The Last Call | 4 | 2,842 | 9.5 | 1,800 | 6 | 1,350 |
| 11 | FINAL CALL | 4 | 3,219 | 9.6 | 1,670 | 5 | 1,250 |
| 12 | Gridlock Prime | 4 | 3,596 | 9.7 | 1,860 | 5 | 1,400 |
| 13 | Dual-Coast Drill Worm | 4 | 4,002 | 9.7 | 2,070 | 5 | 1,550 |
| 13 | The Gold Knight | 4 | new | n/a | 2,480 | 6 | 1,860 |
| 14 | Boppy's Gold Armor | 4 | 4,530 | 10.0 | 3,160 | 7 | 2,370 |
| 15 | The Windowsill Radio (working name) | 4 | 4,988 | 10.0 | 2,490 | 5 | 1,870 |
| 16 | The Square's Sign (working name) | 4 | 5,510 | 10.2 | 2,700 | 5 | 2,020 |
| 17 | The Twin Lenses (working name) | 4 | 6,240 | 10.7 | 2,910 | 5 | 2,180 |
| 18 | The Studio Rig (working name) | 4 | 7,345 | 11.6 | 3,790 | 6 | 2,840 |
| 19 | Brass Mail-Chute Courier | 4 | 2,142 | 3.3 | 2,300 | 3.5 | 1,720 |
| 19 | The Dead-Letter Censor | 4 | 7,735 | 11.4 | 3,400 | 5 | 2,550 |
| 20 | The Collector (working name) | 4 | 9,200 | 12.5 | 5,140 | 7 | 3,860 |
| B | Brain Freeze | 3 | 1,140 | 10.1 | 680 | 6 | 910 |

"Rounds at draft HP" is the same model run on the draft's number. Normal fights were checked on the same model: a pair of Bruisers takes about 3 rounds in chapter 1 and about 4 in chapter 20, and an Elite with a Hexer about 3.5 and 4.5. One normal foe is off its role number in v11: the Citation Slip (chapter 16), raised by hand because a pair of them ran about 2.7 rounds.

### 1.7 Act tags

A tag says which party Skills react to an act. Each pairing below was checked against the spec's kit lines.

| Tag | Party Skills that answer it |
|---|---|
| `melee` | Tom's Zone One Blockade. Deedee's Stuffed burn and Wet-Floor Hazard. Boppy's Spiced Up burn and Warden's Iron Gate thorns. Justin's Hang Fresh Drywall. |
| `projectile` | Tom's Zone One Blockade. Justin's Hang Fresh Drywall. Olivia's Cool-Mist Humidifier. |
| `ground_sweep` | Missed entirely by Grace while she is Airborne. |
| `aoe` (hits the whole party) | Amy's Mom-Arm Seatbelt Stop and Classroom Lights-Out Reset. Boppy's Warden's Iron Gate. Nara's Vacuum-Cleaner Bolt!. Justin's Flag on the Play!. Olivia's Cool-Mist Humidifier. |
| `charge_up` | Cancelled by Grace's Crunchy Sugar-Cube Pop, Justin's Main Breaker Flip, or a Break. Rose's Supersonic Raspberry does not cancel it but takes a pip from a foe that is charging. |
| `guard_stance` | Ended by Panic Boil!, Rose's Mega Whoopee-Cushion Trap, Nara's Relentless Tug-of-War, Justin's Demo-Day Prybar, or a Break. Ignored by Rose's Upside-Down Pilot Wings at 8 Pep or more. |
| `buff` | Stripped by Shatter Glitz!, Tom's Tarmac Porsche Transfer, Amy's "Eyes on Me" Clap (Speed and Evasion buffs), Deedee's "Hand Me My Glasses" Scrub and Fifty-Year Dust Tsunami. Stolen by Nara's "No Take, Only Throw!" and Rose's Nana's Card Trick. Flipped by Olivia's "Is This Real?" Fact-Check. |

## 2. The bestiary

In the act tables, "2t" means 2 turns of the unit carrying the status. Helpers called by bosses use these stats: chapter 12 Gridlock, HP 357 of 713, Atk 110, Def 55, Spd 105. Chapter 15 Hushling pod, HP 366 of 731, Atk 124, Def 56, Spd 122.

### Chapter 1: Grump Hollow, Long Island (`hollow`, `grands`)

Party size the boss HP assumes: 4.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Mudling (`mudling`) | Swarmer, Front | 60 | 19 | 12 | 99 | 0 | Sizzle, Racket | none | none | `mudpie` |
| 2 | Skeeter Swarm (`skeeter`) | Hexer, Back | 78 | 21 | 14 | 99 | 0 | Drench, Racket | none | Jitterflight: +20% Evasion (2t, buff) | `honey` |
| 3 | Pond Grump (`grump`) | Bruiser, Front | 106 | 24 | 16 | 89 | 0 | Razzle, Sizzle | none | none | `hoodie` |
| 4 | Bog Toad (`toad`) | Bruiser, Front | 106 | 24 | 16 | 89 | 0 | Sizzle, Razzle | Drench | none | `lilyhat` |
| 5 | Log Lump (`log`) | Elite, Front | 166 | 25 | 19 | 85 | 4 | Sizzle | none | Mossy Brace: Guard Stance (2t) | `barkslab` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Mudling | Wobble | Clobber | 0.8x | 80 | 1 ally | melee | Fast bog bump. |
| Mudling | Mud Flick | Drench | 1.0x | 100 | 1 ally | projectile | Drenched (2t). |
| Mudling | Mud Pie | Drench | 1.5x | 120 | 1 ally | projectile, charge_up | Every 3rd turn. Drenched (2t). |
| Skeeter Swarm | Darting Bite | Clobber | 0.8x | 80 | 1 ally | melee | Quick sting. |
| Skeeter Swarm | Buzz Cloud | Support | none | 80 | self | buff | Puts Jitterflight back (2t) if it was stripped. |
| Skeeter Swarm | Mosquito Whine | Racket | 1.0x | 100 | 1 ally | projectile | -1 Pep and Fatigue (2t). |
| Pond Grump | Puddle Grumble | Racket | 0.8x | 80 | 1 ally | projectile | Croaking complaint. |
| Pond Grump | Bog Splash | Drench | 1.0x | 100 | 1 ally | projectile | Drenched (2t). |
| Pond Grump | Soggy Slap | Drench | 1.5x | 120 | 1 ally | melee, charge_up | Drenched (2t). |
| Bog Toad | Night Croak | Racket | 0.8x | 80 | 1 ally | projectile | Loud bog call. |
| Bog Toad | Body Slam | Clobber | 1.0x | 100 | 1 ally | melee | Long-legged hop slam. |
| Bog Toad | Tongue Lash | Clobber | 1.1x | 120 | all allies | ground_sweep, aoe, charge_up | Low sweep. Grace dodges it while Airborne. |
| Log Lump | Low Roll | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Rolling shin check. |
| Log Lump | Branch Jab | Clobber | 1.0x | 100 | 1 ally | melee | Knotty poke. |
| Log Lump | Timber! | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Toppling slam. Slow (2t). |

#### 6. The Big One (`bigone`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 420 (320 with 3 in the party) | 28 | 17 | 96 | 6 | Razzle, Racket | none | Dragonfly coin |

- Muffin-Tin Crown (buff): starts the fight wearing Deedee's muffin tin: +15% Atk and Mend 3% (2t). Puts it back on once at 50% HP. Any buff strip knocks it off (Shatter Glitz!, Deedee's "Hand Me My Glasses" Scrub).
- Big Glare then Swamp Chomp: it stares at one Back-row ally, then bites that ally on its next turn. Answers: Tom's Suite Door Slide takes the bite, Grace's Crunchy Sugar-Cube Pop cancels it.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Big Glare | Racket | 0.8x | 80 | 1 ally | projectile, charge_up | Marks the target for Swamp Chomp. |
| Tail Slap | Drench | 1.0x | 100 | 1 ally | melee | Drenched (2t). |
| Swamp Chomp | Clobber | 1.5x | 120 | marked ally | melee, charge_up | Heavy snapping bite. |
| Muddy Belly-Flop | Drench | 1.2x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP, every 3rd turn. Drenched (2t). |
| Crown Polish | Support | none | 80 | self | buff | Once at 50% HP. Muffin-Tin Crown again (2t). |

### Chapter 2: Jefferson Park and Griffith Park, Los Angeles (`jpark`, `griffith`)

Party size the boss HP assumes: 3.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 7 | Smoglet (`smoglet`) | Swarmer, Front | 73 | 22 | 14 | 101 | 0 | Razzle, Drench | none | none | `skyjar` |
| 8 | Ticket Flurry (`tickets`) | Skirmisher, Back | 90 | 27 | 15 | 115 | 0 | Sizzle, Drench | none | Paper Swirl: +20% Evasion (2t, buff) | `parkticket` |
| 9 | Canyon Coyote (`coyote`) | Skirmisher, Front | 90 | 27 | 15 | 115 | 0 | Racket | none | none | `bandana` |
| 10 | Gridlock (`gridlock`) | Bruiser, Front | 129 | 29 | 19 | 91 | 0 | Racket, Razzle | none | none | `hubcap` |
| 11 | Tar Pit Blob (`tarblob`) | Elite, Front | 202 | 30 | 23 | 86 | 4 | Sizzle, Drench | Clobber | Asphalt Crust: Guard Stance (2t) | `fossil` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Smoglet | Soot Cough | Racket | 0.8x | 80 | 1 ally | projectile | Hacking smog puff. |
| Smoglet | Tailpipe Puff | Sizzle | 1.0x | 100 | 1 ally | projectile | Toasty (2t). |
| Smoglet | Brown Haze | Sizzle | 1.15x | 120 | all allies | aoe, charge_up | Blind (1t) on 1 random ally. |
| Ticket Flurry | Windshield Slap | Clobber | 0.8x | 80 | 1 ally | projectile | Sharp paper cut. |
| Ticket Flurry | Tuesday Street Cleaning | Racket | 1.0x | 100 | 1 ally | projectile | Scolding fine notice. |
| Ticket Flurry | Late Fee | Racket | 1.0x | 100 | 1 ally | projectile | -1 Pep and Fatigue (2t). |
| Canyon Coyote | Brush Nip | Clobber | 0.8x | 80 | 1 ally | melee | Bleed (2t). |
| Canyon Coyote | Trail Pounce | Clobber | 1.0x | 100 | 1 ally | melee | Canyon lunge. |
| Canyon Coyote | Pack Howl | Racket | 1.0x | 100 | all allies | aoe, buff | Every foe gains +15% Atk (2t, buff). |
| Gridlock | Lay On The Horn | Racket | 0.8x | 80 | 1 ally | projectile | Blaring honk. |
| Gridlock | Overheated Radiator | Sizzle | 1.0x | 100 | 1 ally | projectile | Toasty (2t). |
| Gridlock | Rush Hour | Clobber | 1.2x | 120 | all allies | ground_sweep, aoe, charge_up | Bumper-to-bumper sweep. |
| Tar Pit Blob | Tar Slurp | Clobber | 0.8x | 80 | 1 ally | melee | Slow (2t). |
| Tar Pit Blob | Bubbling Pitch | Sizzle | 1.0x | 100 | 1 ally | projectile | Toasty (2t). |
| Tar Pit Blob | Sticky Situation | Sizzle | 1.5x | 120 | 1 ally | melee, ground_sweep, charge_up | Toasty and Slow (2t). |

#### 12. The Big Shake (`bigshake`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 380 (510 with 4 in the party) | 33 | 21 | 98 | 6 | Drench, Razzle | none | Lemon coin |

- Faultline Guard: below 50% HP it takes Guard Stance plus Mend 5% (2t). Answers: Nara's Relentless Tug-of-War pulls it out of guard, Panic Boil! (TNB's Three-AM Kiln Firing, then Tom's Lounge Pass Flex) drops the stance, Shatter Glitz! or Nara's "No Take, Only Throw!" removes the Mend.
- Two party-wide ground sweeps test TNB's Center the Bowl shields and Nara's Vacuum-Cleaner Bolt!.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Smog Puff | Racket | 0.8x | 80 | 1 ally | projectile | Fatigue (2t). |
| Boulder Drop | Clobber | 1.0x | 100 | 1 ally | projectile | Rock from overhead. |
| Aftershock | Clobber | 1.1x | 120 | all allies | ground_sweep, aoe, charge_up | Above 50% HP. |
| Faultline Guard | Support | none | 80 | self | guard_stance, buff | Below 50% HP. Guard Stance and Mend 5% (2t). |
| Big Rumble | Clobber | 1.35x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. Slow (1t). |

### Chapter 3: The pier and the Sundial Hollow inlet, Long Island (`reeds`, `sundial`)

Party size the boss HP assumes: 4.

> Changed from the draft: the fight is at the pier, as built and as the story thread says. The draft moved it onto a boat and gave Boppy the wrong starting Vibes (the spec says The Dep plus Pepper Boss).

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 13 | Soggy Sock (`soggysock`) | Swarmer, Front | 101 | 28 | 18 | 103 | 0 | Sizzle, Razzle | Drench | none | `dampsock` |
| 14 | Bobber (`bobber`) | Skirmisher, Front | 124 | 35 | 19 | 118 | 0 | Drench, Clobber | none | Choppy Bob: +20% Evasion (2t, buff) | `luckybobber` |
| 15 | Tangle (`tangle`) | Bruiser, Front | 178 | 36 | 23 | 93 | 0 | Sizzle, Racket | none | none | `fishline` |
| 16 | Snag (`snag`) | Elite, Front | 279 | 38 | 28 | 88 | 4 | Sizzle | Drench | Sunken Timber: Guard Stance (2t) | `driftwood` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Soggy Sock | Wring Out | Drench | 0.8x | 80 | 1 ally | projectile | Drenched (2t). |
| Soggy Sock | Sock Slap | Drench | 1.0x | 100 | 1 ally | melee | Wet tube-sock thwack. |
| Soggy Sock | Squelch | Drench | 1.5x | 120 | 1 ally | melee, charge_up | Slow (2t). |
| Bobber | Cork Bonk | Clobber | 0.8x | 80 | 1 ally | melee | Bouncing headbutt. |
| Bobber | Plunk! | Drench | 1.0x | 100 | 1 ally | projectile | -1 Pep and Drenched (2t). |
| Bobber | Sink & Pop | Clobber | 1.0x | 100 | 1 ally | melee, buff | Hits, then +20% Evasion (1t). |
| Tangle | Line Snarl | Clobber | 0.8x | 80 | 1 ally | melee | Bleed (2t). |
| Tangle | Wrap Up | Clobber | 1.0x | 100 | 1 ally | melee | Slow (2t). |
| Tangle | Big Knot | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Slow and Fatigue (2t). |
| Snag | Reed Trip | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Low root snag. |
| Snag | Hook Catch | Clobber | 1.0x | 100 | 1 ally | melee | -15% Speed (2t). |
| Snag | Undertow | Drench | 1.5x | 120 | 1 ally | ground_sweep, charge_up | Drenched and a 20-tick push. |

#### 17. Old Iron-Gill (`irongill`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front, dives to Back | 650 (490 with 3 in the party) | 41 | 25 | 100 | 6 | Clobber, Razzle | none | Fish coin |

- Inlet Submerge: every 3rd turn and once at 50% HP it dives to the Back row behind a Soggy Sock it calls, and charges Deep Dive. Answers that work with everyone's starting Vibes: Grace's Crunchy Sugar-Cube Pop cancels the charge, a Break cancels it, or knock out the Soggy Sock so Iron-Gill counts as Front again. If the player has switched Boppy to Boat Angler, Choppy-Water Cast hooks it straight back to Front.
- Pepper Belch: it swallowed Boppy's 1989 pepper jar. The belch leaves Iron-Gill itself Toasty (1t), so a Drench hit sets off Steam Cloud!. Boppy takes 30% less from it with Pepper Boss as his Main Vibe.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Pond Spit | Drench | 0.8x | 80 | 1 ally | projectile | Drenched and Slow (2t). |
| Whisker Whip | Clobber | 1.0x | 100 | 1 ally | melee, ground_sweep | Barbel lash along the planks. |
| Iron Headbutt | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Iron-plated ram. |
| Pepper Belch | Sizzle | 1.15x | 120 | all allies | aoe, charge_up | Toasty (2t) on allies, Toasty (1t) on itself. |
| Inlet Submerge | Support | none | 80 | self | buff, charge_up | Moves to Back, calls 1 Soggy Sock to Front if alone, starts Deep Dive. |
| Deep Dive | Drench | 1.35x | 120 | all allies | aoe, charge_up | Fires on its next turn unless cancelled. Drenched (2t). |

### Chapter 4: Sunset Gold Studios backlot, Los Angeles (`backlot`, `stage7`, `stageset`)

Party size the boss HP assumes: 3.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 18 | Extra Extra (`extra`) | Swarmer, Front | 124 | 32 | 20 | 105 | 0 | Racket, Razzle | none | none | `callsheet` |
| 19 | Boom Mic Moth (`boommoth`) | Hexer, Back | 162 | 36 | 23 | 105 | 0 | Drench, Clobber | Racket | Rafter Hover: +20% Evasion (2t, buff) | `windsock` |
| 20 | Clapper Snapper (`clapper`) | Skirmisher, Front | 152 | 40 | 21 | 120 | 0 | Sizzle, Razzle | none | Opens round 1 with Scene One, Marker! | `slate` |
| 21 | Fog Wisp (`fogwisp`) | Hexer, Back | 162 | 36 | 23 | 105 | 0 | Sizzle, Clobber | Drench | Stage Mist: +20% Evasion (2t, buff) | `fogjuice` |
| 22 | Cue Card Crab (`cuecrab`) | Elite, Front | 342 | 44 | 31 | 90 | 4 | Drench, Racket | Clobber | Posterboard Shell: Guard Stance (2t) | `cuecards` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Extra Extra | Holding Sigh | Racket | 0.8x | 80 | 1 ally | projectile | Fatigue (1t). |
| Extra Extra | Crowd Elbow | Clobber | 1.0x | 100 | 1 ally | melee | Trenchcoat jostle. |
| Extra Extra | Walk Into Shot | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Blunders straight in front of the camera. |
| Boom Mic Moth | Dead-Cat Swoop | Clobber | 0.8x | 80 | 1 ally | melee | Fuzzy mic brush. |
| Boom Mic Moth | Mic Feedback | Racket | 1.0x | 100 | 1 ally | projectile | Skill Lock (1t). |
| Boom Mic Moth | Boom Drop | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Drops the boom pole from the rafters. |
| Clapper Snapper | Slate Snap | Clobber | 0.8x | 80 | 1 ally | melee | Hinged wooden chomp. |
| Clapper Snapper | Chalk Smack | Clobber | 1.0x | 100 | 1 ally | melee | Blind (1t). |
| Clapper Snapper | Scene One, Marker! | Racket | 1.05x | 120 | all allies | aoe | Pulls 1 other foe 15 ticks forward. |
| Fog Wisp | Damp Chill | Drench | 0.8x | 80 | 1 ally | projectile | Drenched (2t). |
| Fog Wisp | Fog Bank | Drench | 1.0x | 100 | 1 ally | projectile | Blind (1t). |
| Fog Wisp | Pea Souper | Drench | 1.05x | 120 | all allies | aoe, charge_up | Drenched (2t), and Blind (1t) on 1 random ally. |
| Cue Card Crab | Claw Pinch | Clobber | 0.8x | 80 | 1 ally | melee | Sideways snap. |
| Cue Card Crab | Flat Line Reading | Racket | 1.0x | 100 | 1 ally | projectile | Fatigue (2t). |
| Cue Card Crab | Card Toss | Clobber | 1.15x | 120 | all allies | projectile, aoe, charge_up | Bleed (2t). |

#### 23. The Director's Cut (`directorscut`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 470 (630 with 4 in the party) | 48 | 29 | 102 | 6 | Razzle, Sizzle | Racket | Hat coin |

- ACTION!: once at 60% HP it calls 1–2 Extra Extras, pulls every foe 25 ticks forward and gives them +15% Speed (2t, buff). The buff can be stripped or stolen.
- CUT!: a charged megaphone blast that stuns one ally and pushes them back 40 ticks. It misses if The Director's Cut is Blind or Spooked when it fires (TNB's Waymo Tailgate Rescue, his Flying Popcorn Jump-Scare, or a Steam Cloud!), if Tom's Suite Door Slide takes it, or if it is interrupted or Broken.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Studio Notes | Racket | 0.8x | 80 | 1 ally | projectile | -15% Def (2t). |
| Script Smack | Clobber | 1.0x | 100 | 1 ally | melee | Rolled script thwack. |
| ACTION! | Support | none | 80 | all foes | buff | See above. |
| CUT! | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | Stun (1t) and a 40-tick push. |
| That's a Wrap! | Clobber | 1.3x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. Tripod sweep. |

### Chapter 5: The school, Long Island (`school`, `cafetorium`)

Party size the boss HP assumes: 4.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 24 | Pop Quiz (`popquiz`) | Swarmer, Front | 148 | 37 | 22 | 107 | 0 | Racket, Sizzle | none | none | `quizsheet` |
| 25 | Tardy Bell (`tardybell`) | Hexer, Back | 194 | 42 | 25 | 107 | 0 | Drench, Racket | Clobber | none | `hallpass` |
| 26 | Glitter Glue (`glitterglue`) | Hexer, Back | 194 | 42 | 25 | 107 | 0 | Drench, Clobber | Razzle | none | `gluestick` |
| 27 | Dodgeball Dread (`dodgeball`) | Elite, Front | 410 | 51 | 35 | 92 | 4 | Racket, Drench | Clobber | Gym Bounce: +20% Evasion (2t, buff) | `dodgeitem` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Pop Quiz | Paper Cut | Clobber | 0.8x | 80 | 1 ally | melee | Bleed (2t). |
| Pop Quiz | Trick Question | Racket | 1.0x | 100 | 1 ally | projectile | -15% Atk (1t). |
| Pop Quiz | Pencils Down! | Racket | 1.0x | 100 | 1 ally | projectile | -1 Pep and Fatigue (2t). |
| Tardy Bell | Brass Clapper | Clobber | 0.8x | 80 | 1 ally | melee | Bell-rim bonk. |
| Tardy Bell | You're Late! | Racket | 1.0x | 100 | 1 ally | projectile | Slow (2t) and a 15-tick push. |
| Tardy Bell | First-Bell Ring | Racket | 1.1x | 120 | all allies | aoe, charge_up | Fatigue (2t). |
| Glitter Glue | Nozzle Squirt | Drench | 0.8x | 80 | 1 ally | projectile | Drenched (2t). |
| Glitter Glue | Paste Down | Drench | 1.0x | 100 | 1 ally | ground_sweep | Slow (2t). |
| Glitter Glue | Glitter Burst | Razzle | 1.1x | 120 | all allies | aoe, charge_up | Blind (1t) on 1 random ally. |
| Dodgeball Dread | Rubber Bank-Shot | Clobber | 0.8x | 80 | 1 ally | projectile | Loud red-rubber PONG. |
| Dodgeball Dread | Picked Last | Racket | 1.0x | 100 | 1 ally | projectile | -20% Atk (2t). |
| Dodgeball Dread | Gym-Wall Ricochet | Clobber | 1.2x | 120 | all allies | projectile, aoe, charge_up | Rebounds across every slot. |

#### 28. The Red Pen (`redpen`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 900 (680 with 3 in the party) | 55 | 32 | 104 | 6 | Drench, Razzle | Clobber | Kickball coin |

- Strict Grading: at 55% HP and every 3rd turn after, a counter stance for 2 turns: 30% less damage taken, and any hit answers with Points Off. It ends at once on a Mix (two different allies, two different flavors, same round; Amy's Four-Tab Binder rewards the same play), on Rose's Mega Whoopee-Cushion Trap, or on a Panic Boil!.
- Final Grade cannot fire while Amy's Classroom Lights-Out Reset has foes locked out of party-wide attacks.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Margin Note | Racket | 0.8x | 80 | 1 ally | projectile | -15% Def (2t). |
| Red Ink Slash | Drench | 1.0x | 100 | 1 ally | melee, ground_sweep | Drenched (2t). |
| SEE ME | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | Taunt and Fatigue (2t). |
| Strict Grading | Support | none | 80 | self | guard_stance | See above. |
| Points Off | Racket | 0.8x | 0 | the attacker | projectile | Automatic counter during Strict Grading, once per ally action. -15% Atk (1t). |
| Final Grade | Racket | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. Report-card slam. |

### Chapter 6: Old Oak Park (`oakpark`, `oak`, `crown`)

Party size the boss HP assumes: 3.

> The draft places this park in Los Angeles with the 3-person squad. The story thread lists "the park" among the Long Island places that wake up again in chapter 13. Which park that is gets settled when the chapter 13 script is written.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 29 | Acorn Agent (`acornagent`) | Swarmer, Front | 185 | 44 | 26 | 109 | 0 | Racket, Drench | none | none | `acorn` |
| 30 | Sticky Sap (`stickysap`) | Bruiser, Front | 328 | 57 | 34 | 99 | 0 | Sizzle, Clobber | Drench | none | `sapjar` |
| 31 | Peanut Gallery (`peanutgallery`) | Hexer, Back | 242 | 49 | 29 | 109 | 0 | Racket, Sizzle | Clobber | none | `peanuts` |
| 32 | Twig Spy (`twigspy`) | Skirmisher, Back | 228 | 55 | 27 | 125 | 0 | Sizzle, Razzle | Racket | Leaf Camo: +20% Evasion (2t, buff) | `binoculars` |
| 33 | Cheek Stuffer (`cheekstuffer`) | Elite, Front | 513 | 60 | 40 | 94 | 4 | Drench, Racket | Clobber | none | `cheekpouch` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Acorn Agent | Cap Bonk | Clobber | 0.8x | 80 | 1 ally | melee | Earpiece-first headbutt. |
| Acorn Agent | Pebble Toss | Clobber | 1.0x | 100 | 1 ally | projectile | Blind (1t). |
| Acorn Agent | Code Red! | Racket | 1.05x | 120 | all allies | aoe | One Front foe gains +15% Speed (1t, buff). |
| Sticky Sap | Resin Drip | Drench | 0.8x | 80 | 1 ally | projectile | Drenched (2t). |
| Sticky Sap | Bark Glue | Drench | 1.0x | 100 | 1 ally | ground_sweep | Slow (2t). |
| Sticky Sap | Sap Flow | Drench | 1.1x | 120 | all allies | ground_sweep, aoe, charge_up | Slow (2t). |
| Peanut Gallery | Shell Boo | Racket | 0.8x | 80 | 1 ally | projectile | Jeering heckle. |
| Peanut Gallery | Cheap Seat Heckle | Racket | 1.0x | 100 | 1 ally | projectile | -15% Atk (2t). |
| Peanut Gallery | Standing Boo-vation | Racket | 1.1x | 120 | all allies | aoe, charge_up | Fatigue (2t). |
| Twig Spy | Branch Poke | Clobber | 0.8x | 80 | 1 ally | melee | Quick jab. |
| Twig Spy | Stakeout Mark | Racket | 1.0x | 100 | 1 ally | projectile | Attacks on the target gain +20% Crit Rate (2t). |
| Twig Spy | Leaf Storm | Clobber | 1.1x | 120 | all allies | projectile, aoe | Dead-leaf flurry. |
| Cheek Stuffer | Crumb Spray | Racket | 0.8x | 80 | 1 ally | projectile | Blind (1t). |
| Cheek Stuffer | Cheek Bump | Clobber | 1.0x | 100 | 1 ally | melee | Pouch body-check. |
| Cheek Stuffer | Snack Snatch | Clobber | 1.5x | 120 | 1 ally | melee, buff, charge_up | -1 Pep. It gains +20% Def (2t, buff). |

**34. Acorn Cache (`acorncache`).** A stash the boss calls into the Back row. It never attacks. HP 150, Atk 0, Def 26, Spd 109, 0 pips, 0 VP. Pet Peeves: Clobber, Sizzle. Resists: none. If it is still standing on Chairman Cheeks' 2nd turn after the call, he eats it: heals 15% HP and gains +25% Atk and Def (2t, buff). Knock it out first and every party member gains +1 Pep, and Chairman Cheeks takes 10% of his Max HP and loses 1 pip.

#### 35. Chairman Cheeks (`chairman`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 660 (880 with 4 in the party) | 65 | 37 | 106 | 6 | Drench, Sizzle | Racket | Picnic Basket coin |

- Cache race: he calls an Acorn Cache to the Back row every 3 rounds (see above). Party-wide and ranged Skills reach it.
- Executive Monocle: starts with +20% Crit Rate and +20% Atk (3t, buff). This and Winter Hoard are what Nara's "No Take, Only Throw!" is for.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Filibuster | Racket | 0.8x | 80 | 1 ally | projectile | Fatigue (2t). |
| Acorn Volley | Clobber | 1.0x | 100 | 2 random allies | projectile | Rapid cap tosses. |
| Cheek Slam | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Tail smash from the velvet throne. |
| Stash for Winter | Support | none | 80 | field | buff | Calls 1 Acorn Cache, or eats the one already there. |
| The Big Stash | Clobber | 1.35x | 120 | all allies | projectile, ground_sweep, aoe, charge_up | Below 50% HP. Avalanche of stolen shiny things. |

### Chapter 7: The library, Long Island (`stacks`, `readroom`)

Party size the boss HP assumes: 4.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 36 | Shusher (`shusher`) | Hexer, Back | 281 | 56 | 32 | 110 | 0 | Razzle, Sizzle | none | none | `tassel` |
| 37 | Dog-Ear (`dogear`) | Swarmer, Front | 215 | 50 | 28 | 110 | 0 | Drench, Sizzle | Racket | none | `flatpage` |
| 38 | The Cliffhanger (`cliffhanger`) | Bruiser, Front | 379 | 65 | 37 | 100 | 0 | Sizzle, Racket | Clobber | none | `sequel` |
| 39 | The Know-It-All (`knowitall`) | Hexer, Back | 281 | 56 | 32 | 110 | 0 | Racket, Razzle | Sizzle | none | `readglasses` |
| 40 | Pop-Up Panic (`popup`) | Elite, Front | 594 | 68 | 44 | 95 | 4 | Clobber, Razzle | Racket | Coiled Paper Spring: +20% Evasion (2t, buff) | `popcard` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Shusher | Tassel Flick | Clobber | 0.8x | 80 | 1 ally | melee | Gold-cord snap. |
| Shusher | SHHH! | Racket | 1.0x | 100 | 1 ally | projectile | Skill Lock (1t). |
| Shusher | Hush Hour | Racket | 1.05x | 120 | all allies | aoe, charge_up | -15% Atk (2t). |
| Dog-Ear | Page Nip | Clobber | 0.8x | 80 | 1 ally | melee | Bleed (2t). |
| Dog-Ear | Corner Fold | Clobber | 1.0x | 100 | 1 ally | melee | -15% Def (2t). |
| Dog-Ear | Hard Crease | Clobber | 1.1x | 120 | all allies | ground_sweep, aoe | Origami shockwave along the floor. |
| The Cliffhanger | Chain Swing | Clobber | 0.8x | 80 | 1 ally | melee | Hardback pendulum hit. |
| The Cliffhanger | Plot Twist! | Racket | 1.0x | 100 | 1 ally | projectile | 20-tick push. |
| The Cliffhanger | To Be Continued... | Racket | 1.15x | 120 | all allies | aoe, charge_up | Slow (2t). |
| The Know-It-All | Pointer Tap | Clobber | 0.8x | 80 | 1 ally | melee | Wooden pointer rap. |
| The Know-It-All | "Actually..." | Racket | 1.0x | 100 | 1 ally | projectile | -20% Def (2t). |
| The Know-It-All | "Well, Technically" | Racket | 1.1x | 120 | all allies | aoe, buff, charge_up | Fatigue (2t). It gains +20% Def (2t, buff). |
| Pop-Up Panic | Spring Pop! | Clobber | 0.8x | 80 | 1 ally | melee | Sudden cardboard lunge. |
| Pop-Up Panic | Jump-Out Scare | Racket | 1.0x | 100 | 1 ally | projectile | -20% Atk (2t). |
| Pop-Up Panic | Big Reveal | Clobber | 1.25x | 120 | all allies | aoe, charge_up | Two-page spread slam. |

#### 41. The Unread (`unread`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 1,230 (920 with 3 in the party) | 74 | 40 | 107 | 7 | Racket, Sizzle | Clobber | Book Cart coin |

- It shoves the party down the turn bar: Turn Back the Page pushes one ally 45 ticks, THE END pushes everyone without a shield 35 ticks. Answers: Boppy's Boppy Speed, Grace's Good-Scrunchie Pirouette, Rose's Sofa-Cushion Citadel.
- Bookmark Ribbon: Guard Stance plus Mend 5% (2t) before THE END. Panic Boil! drops the guard, any buff strip removes the Mend.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Dust Cloud | Racket | 0.8x | 80 | 1 ally | projectile | Blind (1t). |
| Cover Slam | Clobber | 1.0x | 100 | 1 ally | melee | Leather binding thud. |
| Turn Back the Page | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | 45-tick push. |
| Bookmark Ribbon | Support | none | 80 | self | guard_stance, buff | Guard Stance and Mend 5% (2t). |
| Dead-Quiet Reading Room | Racket | 1.05x | 100 | all allies | aoe | Fatigue (2t). |
| THE END | Racket | 1.35x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. 35-tick push on allies without a shield, and Slow (2t). |

### Chapter 8: Division Nine Car Barn, Los Angeles (`carbarn`, `boiler`)

Party size the boss HP assumes: 3.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 42 | Lukewarm (`lukewarm`) | Swarmer, Front | 244 | 56 | 31 | 111 | 0 | Sizzle, Razzle | Drench | none | `tepidcoffee` |
| 43 | Leftover (`leftover`) | Swarmer, Front | 244 | 56 | 31 | 111 | 0 | Sizzle, Clobber | Racket | none | `leftovers` |
| 44 | Wet Blanket (`wetblanket`) | Bruiser, Front | 431 | 73 | 41 | 101 | 0 | Sizzle, Clobber | Drench | none | `warmblanket` |
| 45 | The Draft (`thedraft`) | Skirmisher, Back | 300 | 69 | 33 | 127 | 0 | Sizzle, Razzle | Racket | Crosswind: +20% Evasion (2t, buff) | `draftstopper` |
| 46 | The Picky Eater (`pickyeater`) | Elite, Front | 675 | 76 | 49 | 95 | 4 | Racket, Drench | Clobber | Tin Lunchbox Lid: Guard Stance (2t) | `hotsauce` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Lukewarm | Tepid Slosh | Drench | 0.8x | 80 | 1 ally | projectile | Drenched (2t). |
| Lukewarm | Cold Shoulder | Racket | 1.0x | 100 | 1 ally | projectile | Slow (2t). |
| Lukewarm | Room Temperature | Drench | 1.05x | 120 | all allies | aoe | Drenched (2t). |
| Leftover | Snap-Lid Flip | Clobber | 0.8x | 80 | 1 ally | projectile | Plastic lid frisbee. |
| Leftover | Mystery Tupperware | Racket | 1.0x | 100 | 1 ally | projectile | Blind (1t). |
| Leftover | Freezer Burn | Clobber | 1.1x | 120 | all allies | ground_sweep, aoe | Slow (1t). |
| Wet Blanket | "Why Bother?" | Racket | 0.8x | 80 | 1 ally | projectile | -20% Atk (2t). |
| Wet Blanket | Damp Smother | Clobber | 1.0x | 100 | 1 ally | melee | Drenched (2t). |
| Wet Blanket | Dampen Spirits | Drench | 1.15x | 120 | all allies | aoe, charge_up | Fatigue and Drenched (2t). |
| The Draft | Pilot-Light Gust | Clobber | 0.8x | 80 | 1 ally | projectile | Strips 1 shield or buff from the target. |
| The Draft | Hallway Chill | Racket | 1.0x | 100 | 1 ally | projectile | Slow (2t). |
| The Draft | Slam the Door! | Clobber | 1.15x | 120 | all allies | aoe | Wind tunnel blast. |
| The Picky Eater | "EW, It Touched!" | Racket | 0.8x | 80 | 1 ally | projectile | -15% Def (2t). |
| The Picky Eater | Lid Snap | Clobber | 1.0x | 100 | 1 ally | melee | Metal latch bite. |
| The Picky Eater | Push It Away | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | -1 Pep, Fatigue (2t) and a 20-tick push. |

#### 47. Old Ironbelly (`ironbelly`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 1,040 (1,390 with 4 in the party) | 83 | 45 | 108 | 7 | Drench | Sizzle | Rosebush coin |

- Its heat fires TNB's clay: Hot Coal and BROIL are Sizzle, which turns TNB's Center the Bowl shields into Fired Glaze (they reflect 30% of damage).
- Red-Hot Firebox: BROIL and Full Furnace leave Old Ironbelly itself Toasty (2t). A Drench hit then sets off Steam Cloud!: 2 pips, plus 1 for the Pet Peeve, the most one action can take.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Soot Puff | Racket | 0.8x | 80 | 1 ally | projectile | Blind (1t). |
| Belly Bump | Clobber | 1.0x | 100 | 1 ally | melee, ground_sweep | Cast-iron stove check. |
| Hot Coal | Sizzle | 1.0x | 100 | 1 ally | projectile | Toasty (2t). |
| BROIL | Sizzle | 1.25x | 120 | all allies | aoe, charge_up | Toasty (2t) on allies and on itself. |
| Full Furnace | Sizzle | 1.35x | 120 | all allies | aoe, buff, charge_up | Below 50% HP. Toasty (2t) on itself, and +20% Atk (2t, buff). |

### Chapter 9: The Moon Club, Long Island (`moonclub`, `dome`)

Party size the boss HP assumes: 4.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 48 | Velvet Rope (`velvetrope`) | Swarmer, Front | 273 | 63 | 34 | 112 | 0 | Clobber, Racket | none | none | `velvetbow` |
| 49 | Stuffed Shirt (`stuffedshirt`) | Bruiser, Front | 483 | 81 | 44 | 102 | 0 | Racket, Drench | Razzle | none | `cufflink` |
| 50 | The Hanger-On (`coathanger`) | Bruiser, Front | 483 | 81 | 44 | 102 | 0 | Clobber, Drench | Sizzle | none | `coatticket` |
| 51 | The Sore Loser (`soreloser`) | Hexer, Back | 357 | 70 | 38 | 112 | 0 | Sizzle, Razzle | Racket | none | `luckychip` |
| 52 | The Wallflower (`wallflower`) | Elite, Front | 756 | 85 | 53 | 96 | 4 | Razzle, Sizzle | Clobber | Wall Hug: +20% Evasion (2t, buff) | `corsage` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Velvet Rope | Rope Lash | Clobber | 0.8x | 80 | 1 ally | melee | Velvet cord snap. |
| Velvet Rope | "Not On The List" | Racket | 1.0x | 100 | 1 ally | projectile | 15-tick push. |
| Velvet Rope | Members Only | Racket | 1.05x | 120 | all allies | aoe, buff | Front foes gain +15% Def (2t, buff). |
| Stuffed Shirt | "Hmph." | Racket | 0.8x | 80 | 1 ally | projectile | -15% Def (2t). |
| Stuffed Shirt | Stiff Arm | Clobber | 1.0x | 100 | 1 ally | melee | Starched cuff shove. |
| Stuffed Shirt | "How Gauche!" | Racket | 1.15x | 120 | all allies | aoe, charge_up | -15% Atk (2t). |
| The Hanger-On | Wire Hook | Clobber | 0.8x | 80 | 1 ally | melee | Collar tug. |
| The Hanger-On | 1971 Coat Cling | Clobber | 1.0x | 100 | 1 ally | melee | Slow (2t). |
| The Hanger-On | Hang On Tight | Clobber | 1.15x | 120 | all allies | ground_sweep, aoe, charge_up | Slow (1t). |
| The Sore Loser | Card Flick | Clobber | 0.8x | 80 | 1 ally | projectile | Bleed (2t). |
| The Sore Loser | "Cheater!" | Racket | 1.0x | 100 | 1 ally | projectile | Taunt (1t). |
| The Sore Loser | Fifty-Two Pickup | Clobber | 1.15x | 120 | all allies | projectile, aoe | -1 Pep and Fatigue (2t) on the first target. |
| The Wallflower | "Sorry!" | Clobber | 0.8x | 80 | 1 ally | melee | Terracotta pot bump. |
| The Wallflower | "Do Not Look At Me" | Racket | 1.0x | 100 | 1 ally | projectile, buff | Blind (1t). Wall Hug again (2t). |
| The Wallflower | Petal Storm | Razzle | 1.2x | 120 | all allies | projectile, aoe, charge_up | Dazzled (2t). |

#### 53. The Mirrorball (`mirrorball`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 1,590 (1,190 with 3 in the party) | 93 | 48 | 109 | 7 | Racket, Clobber | Razzle | Piano coin |

- Facet Spin: starts with +25% Evasion (buff) and renews it with Facet Dazzle.
- Her own glare is the opening: Facet Dazzle and Spotlight Solo leave The Mirrorball herself Dazzled (2t). A Clobber hit then sets off Shatter Glitz! (strips Facet Spin, 2 pips with the Pet Peeve). A Racket hit sets off Sensory Overload! (25% less damage from her, 2 pips with the Pet Peeve).

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Chain Swing | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Low ceiling-chain arc. |
| Facet Dazzle | Razzle | 1.0x | 100 | 1 ally | projectile, buff | Blind (1t). Facet Spin again (2t). Dazzled (2t) on herself. |
| Glitter Beam | Razzle | 1.1x | 100 | all allies | projectile, aoe | Sweeping prisms. |
| Spotlight Solo | Razzle | 1.5x | 120 | 1 ally | projectile, charge_up | Dazzled (2t) on herself. |
| LAST DANCE | Razzle | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. Full-dome finale. |

### Chapter 10: Long Island airport (`terminal`)

Party size the boss HP assumes: 4.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 54 | Carry-On (`carryon`) | Swarmer, Front | 319 | 71 | 37 | 113 | 0 | Razzle, Drench | none | none | `pretzels` |
| 55 | Jet Lag (`jetlag`) | Hexer, Back | 417 | 80 | 41 | 113 | 0 | Clobber, Sizzle | Racket | none | `coldbrew` |
| 56 | The Long Line (`longline`) | Bruiser, Front | 564 | 92 | 48 | 103 | 0 | Clobber, Razzle | Racket | none | `prioritytag` |
| 57 | The Unclaimed (`unclaimed`) | Bruiser, Front | 564 | 92 | 48 | 103 | 0 | Drench, Sizzle | Clobber | none | `bagtag` |
| 58 | The Armrest Hog (`armresthog`) | Elite, Front | 882 | 97 | 58 | 97 | 4 | Racket, Razzle | Sizzle | Both Armrests Claimed: Guard Stance (2t) | `eyemask` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Carry-On | Four-Wheel Roll | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Toe-crushing caster roll. |
| Carry-On | Overhead Bin Drop | Clobber | 1.0x | 100 | 1 ally | melee | -15% Def (2t). |
| Carry-On | Sizer Frame Check | Clobber | 1.1x | 120 | all allies | ground_sweep, aoe | Rattles down the boarding lane. |
| Jet Lag | Contagious Yawn | Racket | 0.8x | 80 | 1 ally | projectile | Fatigue (2t). |
| Jet Lag | 3 AM Glare | Razzle | 1.0x | 100 | 1 ally | projectile | Blind (1t). |
| Jet Lag | Three-Hour Time Diff | Racket | 1.1x | 120 | all allies | aoe, charge_up | Slow (2t). |
| The Long Line | Retractable Belt Snap | Clobber | 0.8x | 80 | 1 ally | melee | Blue nylon belt sting. |
| The Long Line | "Step Back Behind Yellow" | Clobber | 1.0x | 100 | 1 ally | melee | 20-tick push. |
| The Long Line | Random Screening | Racket | 1.15x | 120 | all allies | aoe, charge_up | Slow (2t). |
| The Unclaimed | Carousel Spin | Racket | 0.8x | 80 | 1 ally | ground_sweep | Slow (1t). |
| The Unclaimed | Overweight Trunk | Clobber | 1.0x | 100 | 1 ally | melee | Brass-latched leather thud. |
| The Unclaimed | Excess Baggage | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Fatigue (2t) and -1 Pep. |
| The Armrest Hog | Middle-Seat Elbow | Clobber | 0.8x | 80 | 1 ally | melee | -20% Atk (2t). |
| The Armrest Hog | Neck-Pillow Squeeze | Clobber | 1.0x | 100 | 1 ally | melee | Smug plushie shove. |
| The Armrest Hog | Full Recline | Clobber | 1.25x | 120 | all allies | ground_sweep, aoe, charge_up | Fatigue (2t). |

#### 59. The Last Call (`lastcall`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 1,800 (1,350 with 3 in the party) | 105 | 53 | 110 | 7 | Drench, Sizzle | Racket | Airplane coin |

- Boarding Group Nine then GATE CLOSED: it marks one Back-row ally, then slams that ally on its next turn and puts Skill Lock (2t) on them. Tom's Suite Door Slide takes the slam and stops the lock. An interrupt or a Break cancels it.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| DELAYED | Racket | 0.8x | 80 | 1 ally | projectile | 25-tick push. |
| Split-Flap Slap | Clobber | 1.0x | 100 | 1 ally | melee | Mechanical leg strike. |
| Boarding Group Nine | Support | none | 80 | 1 ally | charge_up, buff | Marks the target. It gains +20% Atk (1t, buff). |
| PA Static | Razzle | 1.05x | 100 | all allies | projectile, aoe | Crackling speaker burst. |
| GATE CLOSED | Clobber | 1.5x | 120 | marked ally | melee, charge_up | Skill Lock (2t). |
| FINAL BOARDING | Razzle | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. Fatigue (2t). |

### Chapter 11: The airport the family is diverted to (`concourse`)

Party size the boss HP assumes: 4.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 60 | Lost Luggage (`lostluggage`) | Bruiser, Front | 638 | 101 | 51 | 105 | 0 | Clobber, Racket | none | none | `pretzels` |
| 61 | Red-Eye (`redeye`) | Hexer, Back | 472 | 87 | 44 | 116 | 0 | Razzle, Sizzle | Racket | none | `coldbrew` |
| 62 | Standby Sprite (`standbysprite`) | Elite, Front | 999 | 106 | 61 | 99 | 4 | Drench, Clobber | none | Podium Counter: Guard Stance (2t) | `prioritytag` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Lost Luggage | Handle Swing | Clobber | 0.8x | 80 | 1 ally | melee | Telescoping handle whack. |
| Lost Luggage | Caster Wheelie | Clobber | 1.0x | 100 | 1 ally | melee, ground_sweep | Hard-shell ram. |
| Lost Luggage | Frantic Rummage | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Flings mismatched socks. -20% Def (2t). |
| Red-Eye | Sleepy Yawn | Racket | 0.8x | 80 | 1 ally | projectile | Fatigue (2t). |
| Red-Eye | Midnight Contrail | Razzle | 1.0x | 100 | 1 ally | projectile | Blind (1t). |
| Red-Eye | Cabin Lights Dim | Racket | 1.1x | 120 | all allies | aoe, charge_up | Slow (2t). |
| Standby Sprite | Paddle Swat | Clobber | 0.8x | 80 | 1 ally | melee | Gate-paddle smack. |
| Standby Sprite | Seat Seventeen | Clobber | 1.0x | 100 | 1 ally | melee | -15% Speed (2t). |
| Standby Sprite | Waitlist Bump | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | 30-tick push and Fatigue (2t). |

#### 63. FINAL CALL (`finalcall`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 1,670 (1,250 with 3 in the party) | 115 | 56 | 112 | 7 | Razzle, Racket | Clobber | none listed |

- Gate Change: it trades 1 Front ally with 1 Back ally, pushes both 20 ticks, and leaves FINAL CALL itself Dazzled (1t). If either row has nobody to trade, both allies are still hit and pushed but no one changes row.
- Rebooking Stampede: once at 60% HP it calls 1–2 Lost Luggage to the Front and gives every foe +20% Speed (2t, buff), then follows with a party-wide floor sweep.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Gate Change | Racket | 0.85x | 80 | 2 allies | projectile | See above. |
| Rebooking Stampede | Support | none | 80 | all foes | buff | See above. |
| Concourse Strobe Arc | Razzle | 1.05x | 100 | all allies | projectile, aoe | Blind (1t) on 1 random ally. |
| Baggage-Claim Avalanche | Clobber | 1.25x | 120 | all allies | ground_sweep, aoe, charge_up | Slow (1t). |
| ALL FLIGHTS CANCELLED | Razzle | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. -1 Pep and Fatigue (2t). |

### Chapter 12: Tom's street, Los Angeles (`jpark`)

Party size the boss HP assumes: 4.

> The story thread has the family win back three coins and free the three neighbors one at a time. The draft has one boss carry all three. Left as the draft has it until the chapter 12 script is written.

#### 64. Gridlock Prime (`gridlockprime`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 1,860 (1,400 with 3 in the party) | 125 | 60 | 113 | 7 | Drench, Racket | none | The three neighbor coins |

- Four-Way Red Light: Guard Stance at 30% less damage, plus +30% Def and +25% Atk (2t, buff), and it calls 1 Gridlock, once above and once below 50% HP. Olivia's "Is This Real?" Fact-Check flips the Def buff into a Def penalty.
- Overheated Radiator: Exhaust Heatwave leaves Gridlock Prime itself Toasty (2t). A Drench hit sets off Steam Cloud! (3 pips with the Pet Peeve). A Racket hit sets off Panic Boil! and drops Four-Way Red Light.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Air-Horn Honk | Racket | 0.8x | 80 | 1 ally | projectile | Transit-bus blast. |
| No-Signal Merge | Clobber | 1.0x | 100 | 1 ally | melee | Slow (2t). |
| Exhaust Heatwave | Sizzle | 1.1x | 100 | all allies | aoe | Toasty (2t) on allies and on itself. |
| Gridlocked Intersection | Support | none | 80 | all foes | guard_stance, buff | Four-Way Red Light, and calls 1 Gridlock. |
| Total Gridlock | Clobber | 1.35x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. Multi-lane pileup. |

### Chapter 13: The tunnel under the dome, then frozen Long Island (`subtunnel`, `subchamber`, the dent in the dome wall)

Party size the boss HP assumes: 4.

> New in v10.1: the Gold Knight fight that ends the chapter. The Drill Worm is now the tunnel's boss partway through, not the chapter's last fight.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 65 | Hushling (`hushling`) | Hexer, Back | 587 | 104 | 50 | 119 | 0 | Racket, Clobber | none | none | `pretzels` |
| 66 | Signal Fault (`signalfault`) | Elite, Front | 1,242 | 125 | 69 | 102 | 4 | Drench, Clobber | none | Track-Block Arm: Guard Stance (2t) | `coldbrew` |
| 67 | Turnstile Grump (`turnstile`) | Elite, Front | 1,242 | 125 | 69 | 102 | 4 | Clobber, Racket | none | Locked Tripod: Guard Stance (2t) | `prioritytag` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Hushling | Static Drift | Clobber | 0.8x | 80 | 1 ally | projectile | Speaker-box bump. |
| Hushling | Tinny Shush | Racket | 1.0x | 100 | 1 ally | projectile | Skill Lock (2t). Not on the same ally again for 2 turns. |
| Hushling | Dead-Channel Hum | Racket | 1.0x | 100 | 1 ally | projectile | Fatigue (2t) and -1 Pep. |
| Signal Fault | Amber Strobe | Razzle | 0.8x | 80 | 1 ally | projectile | Blind (1t). |
| Signal Fault | Crossing-Arm Drop | Clobber | 1.0x | 100 | 1 ally | melee | Striped metal bar smack. |
| Signal Fault | Eleven-Year Red Light | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | 30-tick push and Slow (2t). |
| Turnstile Grump | Hip Clip | Clobber | 0.8x | 80 | 1 ally | melee | Steel-bar lock on the waist. |
| Turnstile Grump | Three-Bar Spin | Clobber | 1.0x | 100 | 1 ally | melee | Turnstile whack. |
| Turnstile Grump | Tap Out! | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | -20% Def (2t). |

**68. Wired Relay Hushling (`relayhushling`).** A Hushling wired to the Drill Worm, in the Back row. It uses the Hushling's acts. HP 400, Atk 104, Def 60, Spd 115, 0 pips, 0 VP. Pet Peeves: Racket, Clobber. Resists: none. While it stands, the Drill Worm takes 25% less damage. Knock it out and the feedback costs the Drill Worm 2 pips and leaves it Dazzled (2t).

#### 69. Dual-Coast Drill Worm (`drillworm`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Tunnel boss, no running | Front | 2,070 (1,550 with 3 in the party) | 136 | 63 | 115 | 7 | Racket, Clobber | Drench | none (tunnel boss) |

- Starts with 1 Wired Relay Hushling (see above) and calls one more, once, at 50% HP.
- Tunnel Friction Spark leaves the Drill Worm itself Toasty (1t), which a Racket hit turns into Panic Boil!.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Bit Grind | Clobber | 0.8x | 80 | 1 ally | melee | Bleed (2t). |
| Tunnel Friction Spark | Sizzle | 1.0x | 100 | 2 random allies | projectile | Toasty (2t) on allies, Toasty (1t) on itself. |
| Gravel Spray | Clobber | 1.05x | 100 | all allies | projectile, aoe | Tunnel rubble. |
| Deep Bore | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | -20% Def (2t). |
| Relay Call | Support | none | 80 | field | buff | Once at 50% HP. Calls 1 Wired Relay Hushling. |
| Full Bore Cave-In | Clobber | 1.35x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. |

#### 70. The Gold Knight (`goldknight`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 2,480 (1,860 with 3 in the party) | 136 | 63 | 102 | 7 | Sizzle, Racket | Clobber | The town's coin drops, then the scene takes it back |

- The chapter's last fight, at the dent in the dome wall. He never speaks. The town's coin is set in his chest plate. The family believes he is the boss, the biggest thing that woke up.
- Nobody Rushes Him: he is slow, and above 50% HP nothing pushes him back on the turn bar. This is Boppy's own Boppy Speed trait, and it is the first tell.
- Every act is a silent version of something Boppy does. Chapter 14 uses the same seven motions with their real names. No act uses a weapon.
- Gold Guard: Guard Stance (2t) while he stands still. Visor Heat leaves him Toasty (2t), so a Racket hit sets off Panic Boil! and drops the guard. Both are his Pet Peeves.
- At 0 HP he drops to one knee and the coin falls out of the chest plate. The armor does not break. What follows is a scene, not battle: Grace runs to the dent, a gold hand closes over hers, the helmet opens.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Raised Palm | Clobber | 0.8x | 80 | 1 ally | melee | One gold palm up, a short shove. -15% Atk (1t). |
| Slow Walk | Clobber | 1.0x | 100 | fastest ally | melee | He walks in front of the fastest ally and blocks the way. Slow (2t) and a 20-tick push. |
| Wide Arms | Clobber | 1.0x | 100 | 2 adjacent allies | melee | He throws both gauntlets wide. The 2nd use hits 3 allies, later uses hit all. A use that reaches every ally counts as `aoe`. |
| Visor Heat | Sizzle | 1.1x | 120 | all allies | aoe, charge_up | Heat pours from the visor. Toasty (2t) on allies and on himself. |
| Stand Still | Support | none | 80 | self | guard_stance, buff | Knees lock, a low rumble comes from the helmet. Gold Guard and Mend 3% (2t). |
| Gold Squeeze | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Arms open, he clanks forward and squeezes. Tom's Suite Door Slide can take it. |
| Helmet Hum | Racket | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. A long wordless echo. Slow and Fatigue (2t). |

### Chapter 14: Long Island under the dome

Party size the boss HP assumes: 4.

> Rewritten in v10.1. The draft's fight is replaced, and the returning Part 1 monsters are added. See section 3 for the returning monsters and bosses the family gets past on the way.

#### 71. Boppy's Gold Armor (`warden`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 3,160 (2,370 with 3 in the party) | 148 | 67 | 103 | 8 | Sizzle, Racket | Clobber | The town's coin, handed to Grace by Boppy himself |

- A normal fight (Tom, 2026-11-17). The party's hits land on the gold armor, never on Boppy. The enemy name says so and the HP bar is labelled as the armor's.
- What the player sees on a hit: the helmet flinches, because he feels the knock, and the hit shows as a crack in the gold. Cracks spread in three stages, at 75%, 50% and 25% HP. At 0 HP the armor breaks off him and the battle ends. Everything after that is the scene.
- His attacks are normal attacks. They take HP, they can hit Grace and Rose, and the girls hit back. The draft's rule that the girls cannot drop below 1 HP is removed, and so is the adults-only targeting.
- Every attack is silly, and none throws or swings a weapon. The draft's halberd is removed.
- Nobody Rushes Boppy: slow, and above 50% HP nothing pushes him back on the turn bar.
- Resting My Eyes is his Guard Stance. Pepper Breath leaves the armor Toasty (2t), so a Racket hit sets off Panic Boil! and wakes him out of it: the family's noise is the answer, and Sizzle and Racket are both Pet Peeves. Justin's Demo-Day Prybar and a Break also end the guard.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| "Back Behind the Line!" | Racket | 0.8x | 80 | 1 ally | projectile | Gold palm up, voice booming in the helmet. -15% Atk (1t). |
| "Walk Slower!" | Racket | 1.0x | 100 | fastest ally | projectile | He clanks along beside the fastest ally, complaining. Slow (2t) and a 20-tick push. |
| "It Was THIS Big!" | Clobber | 1.0x | 100 | 2 adjacent allies | melee | He throws his arms wide to show the fish and bonks whoever is next to him. The fish grows: 3 allies on the 2nd use, everyone after that. A use that reaches every ally counts as `aoe`. |
| Pepper Breath | Sizzle | 1.1x | 120 | all allies | aoe, charge_up | Visor up, one pepper, one big huff. Toasty (2t) on allies and on the armor. |
| Resting My Eyes | Support | none | 80 | self | guard_stance, buff | The armor locks at the knees and he naps standing up, snoring. Guard Stance and Mend 3% (2t). |
| Great Big Gold Hug | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Arms open, he clanks forward and hugs much too hard. Tom's Suite Door Slide can take it. |
| The 1970 Cross-Country Story | Racket | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. The 42nd retelling, echoing in the helmet. Slow and Fatigue (2t). |

### Chapter 15: The family dinner (`grands` in the built game)

Party size the boss HP assumes: 4.

> PROVISIONAL. The draft moved this fight to Tom's house in Los Angeles. v10.1 put it back where the built game has it, since the story thread has everyone at dinner together right after the town comes back. Open conflict to settle in the chapter 15 script: the story thread says the camera freezes the radio on the windowsill, and it also says the radio is the thing that woke up. A frozen thing cannot be the boss. Stats and acts below hold either way. The name and look wait for the script.

#### 72. The Windowsill Radio (working name) (`hush9final`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 2,490 (1,870 with 3 in the party) | 163 | 71 | 118 | 7 | Racket, Clobber | Razzle | That block's coin |

- Starts with 2 Hushlings in the Back row as speaker pods (chapter 15 stats, half HP) and calls them back once at 50% HP.
- Knocking out a pod sends feedback into the radio: 1 pip and Dazzled (2t).
- To keep locks fair: a pod's Tinny Shush cannot hit the same ally twice within 2 turns, and Mute Button has a 2-round wait.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Squelch Knob | Racket | 0.8x | 80 | 1 ally | projectile | White-noise hiss. Fatigue (1t). |
| Cabinet Thump | Clobber | 1.0x | 100 | 1 ally | melee, ground_sweep | The wooden casing hops across the floorboards. |
| Mute Button | Racket | 1.0x | 100 | 1 ally | projectile | Skill Lock (2t) and -1 Pep. 2-round wait. |
| Dead Air | Racket | 1.15x | 120 | all allies | aoe, charge_up | Fatigue (1t). At 50% HP it also calls the pods back. |
| Total Silence | Racket | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. Window-rattling low hum. |

### Chapter 16: The town square (`town` in the built game)

Party size the boss HP assumes: 4.

> PROVISIONAL. Deedee and Boppy are frozen in this chapter, so the party is without them. The draft moved the fight to Los Angeles and re-themed the removed Marlowe as a "Plaza Permit Cutout" with "Citation Slip" helpers. That theme is Gemini's idea and Tom has not seen it. v10.1 moved the fight back to the square, where the story thread puts it, and keeps the stats and acts under working names.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 73 | Citation Slip (working name) (`greynote`) | Hexer, Back | 1,000 (404 as a called helper) | 133 | 59 | 124 | 0 | Racket, Drench | none | none | `pretzels` |

> Changed in v11. HP is set by hand at 1,000. The Hexer role would give 808, and a pair at 808 ran about 2.7 rounds on the 1.6 model, the shortest normal fight in the game and this chapter's only one. At 1,000 the pair runs about 3.3. Clobber is no longer a Pet Peeve: three made nearly every hit a weak-point hit, and every other foe has 1 or 2. The two left match the boss's own. As a helper in the boss fight it stays at 404 HP, so the boss fight is unchanged.

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Citation Slip (working name) | Adhesive Slap | Clobber | 0.8x | 80 | 1 ally | projectile | Blind (1t). |
| Citation Slip (working name) | Ordinance Flutter | Clobber | 1.0x | 100 | 1 ally | projectile | Bleed (2t). |
| Citation Slip (working name) | Permit Revoked | Racket | 1.0x | 100 | 1 ally | projectile | Fatigue (2t) and strips 1 buff. |

#### 74. The Square's Sign (working name) (`marlowe16`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 2,700 (2,020 with 3 in the party) | 175 | 76 | 120 | 8 | Racket, Drench | Clobber | none: Julian takes the grandparents' coin |

- Red-Tape Wall: calls up to 2 Citation Slips to the Back row (404 HP each) and takes Guard Stance at 30% less damage, plus +20% Def (2t, buff). While it lasts, 15% of the damage it takes from any flavor that is not one of its Pet Peeves bounces back at the attacker (rule in 1.1: the attacker cannot be knocked out by it).
- Built to be beaten without Deedee and Boppy: Olivia's "Is This Real?" Fact-Check, Justin's Demo-Day Prybar, and a Panic Boil! all open the wall.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Red-Line Strike | Clobber | 0.8x | 80 | 1 ally | melee | Steel sign-edge chop. |
| Zoning Fine | Racket | 1.0x | 100 | 1 ally | projectile | -1 Pep and -20% Atk (2t). |
| Issue Citations | Support | none | 80 | field | guard_stance, buff | Red-Tape Wall. |
| Plaza Curfew | Racket | 1.2x | 120 | all allies | aoe, charge_up | Blind and Slow (1t). |
| Total Shut-Down | Clobber | 1.35x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. Sign-post slam. |

### Chapter 17: Julian's building, Los Angeles (`towerstairs`, `towershelves`, `towervault`)

Party size the boss HP assumes: 4.

> PROVISIONAL. The story thread says only that the family climbs his building. The draft's "Pacific Exchange & Post Building", its 12 floors and its darkroom are Gemini's ideas. The snow globe is removed from the story, so the snow-globe enemy needs a new look either way.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 75 | Pause Sprite (`pausesprite`) | Hexer, Back | 884 | 143 | 63 | 125 | 0 | Clobber, Racket | none | none | `coldbrew` |
| 76 | Brass Desk Weight (working name) (`paperweight`) | Elite, Front | 1,872 | 173 | 88 | 107 | 5 | Clobber, Razzle | Drench | Heavy Brass Base: Guard Stance (2t) | `pretzels` |
| 77 | Curator (`curator`) | Elite, Front | 1,872 | 173 | 88 | 107 | 5 | Clobber, Racket | none | White-Glove Protocol: +25% Def and blocks 1 debuff (2t, buff) | `prioritytag` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Pause Sprite | Shutter Tap | Clobber | 0.8x | 80 | 1 ally | melee | Quick timer bump. |
| Pause Sprite | Hold That Pose | Racket | 1.0x | 100 | 1 ally | projectile | 25-tick push and Slow (2t). |
| Pause Sprite | Self-Timer Beep | Support | none | 100 | 1 Front foe | buff | +20% Speed (2t, buff). |
| Brass Desk Weight (working name) | Brass Roll | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Desk-weight roll. |
| Brass Desk Weight (working name) | Magnifier Glare | Razzle | 1.0x | 100 | 1 ally | projectile | Blind (1t). |
| Brass Desk Weight (working name) | Hold The Stack | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | -20% Def and Slow (2t). |
| Curator | Label-Gun Tag | Racket | 0.8x | 80 | 1 ally | projectile | The target takes +20% damage (2t). |
| Curator | Frame Straighten | Clobber | 1.0x | 100 | 1 ally | melee | Crisp ruler rap. |
| Curator | "Do Not Touch The Proofs" | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | Skill Lock (2t) and -1 Pep. |

#### 78. The Twin Lenses (working name) (`twinlens`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 2,910 (2,180 with 3 in the party) | 188 | 81 | 121 | 8 | changes by stance | changes by stance | none |

- Two stances that swap at each round divider and on Rack Focus. Blue: Pet Peeves Sizzle and Clobber, resists Drench and Razzle. Orange: Pet Peeves Drench and Razzle, resists Sizzle and Racket. It starts Blue.
- A Prime put on in one stance can be set off in the next, for example Drenched during Orange, then a Clobber hit in Blue for Hydro-Slip!.
- Once at 50% HP it calls 1 Curator to the Front and gains +20% Def (2t, buff).

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Rack Focus | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep, buff | Swaps stance. +15% Atk (1t, buff). |
| Cold Safelight | Drench | 1.0x | 100 | 1 ally | projectile | Blue only. Drenched and Slow (2t). |
| Enlarger Burn | Sizzle | 1.0x | 100 | 1 ally | projectile | Orange only. Toasty (2t) and Blind (1t). |
| Darkroom Call | Support | none | 80 | field | buff | Once at 50% HP. See above. |
| Long Exposure | Razzle | 1.2x | 120 | all allies | aoe, charge_up | Slow and Fatigue (1t). |
| Contact-Sheet Archive | Sizzle/Drench | 1.3x | 120 | all allies | aoe, charge_up | Below 50% HP. Half the power is Sizzle and lands first, half is Drench. Toasty and Drenched (1t). |

### Chapter 18: The studio on the top floor (`towerpinnacle`)

Party size the boss HP assumes: 4.

> PROVISIONAL, and changed from the draft. The draft has the party fight and smash the camera itself. That cannot stand: the camera has to survive to chapter 20, where the thing from the meteor comes out of it, and the story thread describes no camera fight here. Since v10.1 there is still a boss fight in the room, but the enemy is the studio's lighting rig that woke up, under a working name. Whether chapter 18 has a fight at all is the chapter 18 script's call. The draft's ending (an overload aimed at Grace) is removed. The scene after the fight is the story thread's: Julian raises the camera, Tom steps in front.

#### 79. The Studio Rig (working name) (`vance`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 3,790 (2,840 with 3 in the party) | 203 | 85 | 122 | 8 | Clobber, Racket | Razzle | none: the coins go down the mail chute in the scene |

- Spotlight Lock then Big Flash: it locks its lights on one Back-row ally, then fires a flash at that ally on its next turn. Tom's Suite Door Slide takes it, which is the same thing he does in the scene that follows. An interrupt or a Break cancels it.
- Once at 50% HP it takes Guard Stance behind a rolled-down backdrop with +20% Atk (2t, buff). The lamps overheat and leave it Toasty (2t), so Panic Boil! brings the backdrop down.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Tripod Sweep | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Brass tripod-leg sweep. |
| Hot Bulb Pop | Sizzle | 1.0x | 100 | 2 random allies | projectile | Toasty (2t). |
| Spotlight Lock | Support | none | 80 | 1 ally | charge_up, buff | Marks the target. It gains +20% Crit Rate (1t, buff). |
| Big Flash | Razzle | 1.5x | 120 | marked ally | projectile, charge_up | Stun (1t) unless taken by Tom or soaked by a shield. |
| Backdrop Wall | Support | none | 80 | self | guard_stance, buff | Once at 50% HP. See above. |
| Every Light On | Razzle | 1.35x | 120 | all allies | aoe, charge_up | Below 50% HP. Fatigue (2t). |

### Chapter 19: The lost-mail office (`deadletter`)

Party size the boss HP assumes: 4.

> PROVISIONAL. Tom is frozen and out of the party for the whole chapter. Normal fights here are one Elite at a time (the draft paired two Elites, which ran about as long as a boss).

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 80 | Dead Letter (`deadletter`) | Elite, Front | 2,142 | 193 | 96 | 109 | 5 | Clobber, Sizzle | none | Wax-Seal Ward: +20% Def and bounces 1 debuff back (2t, buff) | `pretzels` |
| 81 | Rubber Stamp (`rubberstamp`) | Elite, Front | 2,142 | 193 | 96 | 109 | 5 | Clobber, Razzle | Drench | Ink-Pad Stance: Guard Stance (2t) | `coldbrew` |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Dead Letter | Paper-Edge Slash | Clobber | 0.8x | 80 | 1 ally | melee | Bleed (2t). |
| Dead Letter | Flap Seal | Clobber | 1.0x | 100 | 1 ally | melee | Red wax-seal smack. |
| Dead Letter | Return To Sender | Racket | 1.5x | 120 | 1 ally | projectile, charge_up | 30-tick push and Slow (2t). |
| Rubber Stamp | Ink Stomp | Clobber | 0.8x | 80 | 1 ally | melee, ground_sweep | Wooden-handle thud. |
| Rubber Stamp | Postmark | Drench | 1.0x | 100 | 1 ally | melee | Drenched (2t) and Blind (1t). |
| Rubber Stamp | DENIED! | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | -20% Def and Fatigue (2t). |

#### 82. Brass Mail-Chute Courier (`mailcourier`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Mini-boss, no running | Back, behind 1 Dead Letter | 2,300 (1,720 with 3 in the party) | 193 | 96 | 109 | 5 | Razzle, Drench | Clobber | Tom's coin and the grandparents' coin |

- Mini-boss with Elite stats. No art exists yet.
- Wall Perch: it may sit in the Back row even with no foe in Front. It swaps rows every turn with Pneumatic Whoosh: Back for +20% Evasion, Front to land Special Delivery Slam. Pulling it forward or a Break pins it in Front until its next turn.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Pneumatic Whoosh | Clobber | 0.8x | 80 | 1 ally | projectile, buff | Swaps its row. +20% Evasion (1t, buff). |
| Sorting-Claw Ricochet | Clobber | 1.0x | 100 | 2 random allies | projectile | Brass coin-slot pinch. |
| Hot Steam Vent | Sizzle | 1.0x | 100 | all allies | aoe | Toasty (2t) on allies, Toasty (1t) on itself. |
| Special Delivery Slam | Clobber | 1.5x | 120 | 1 ally | melee, charge_up | Launches from Back to Front. -1 Pep and a 25-tick push. |

#### 83. The Dead-Letter Censor (`censor`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 3,400 (2,550 with 3 in the party) | 210 | 89 | 123 | 8 | Razzle, Sizzle | Racket | Clara's coin, inside the returned card |

- REDACTED stamp: from round 2 on, at each round divider it stamps whichever flavor did the most damage to it in the round before. If two flavors tie, or nothing damaged it, it stamps nothing that round. For 1 round, attacks of only that flavor do half damage and take no pips, and the attacker loses 1 Pep after the action (never below 0, and a Basic Action still gains its +2 first). A two-flavor move loses only its matching half (the spec splits such a move half and half). A Break tears the stamp down. The answer is to rotate flavors.
- No single-target spikes, because Tom is not there to take them. Pressure is spread across the party so Amy, TNB and Rose can keep everyone up.
- Calls 1 Dead Letter (half HP) with Dead-Letter Sort.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Black-Marker Strike | Clobber | 0.8x | 80 | 1 ally | melee | -20% Atk (2t). |
| "No Such Address" | Racket | 1.0x | 100 | 1 ally | projectile | Fatigue (2t) and strips 1 buff. |
| Dead-Letter Sort | Support | none | 80 | field | buff | Calls 1 Dead Letter. It gains +20% Def (2t, buff). |
| Strike It Out | Racket | 1.15x | 120 | all allies | ground_sweep, aoe, charge_up | Slow (1t). |
| UNDELIVERABLE | Clobber | 1.3x | 120 | all allies | projectile, aoe, charge_up | Below 50% HP. Hurricane of stamped mailbags. |

### Chapter 20: The studio again (`foreverheart`)

Party size the boss HP assumes: 4.

> PROVISIONAL. "The Collector" is Gemini's name for the thing from the meteor. Canon fix applied: it is the same gold as Boppy's armor, never said out loud. The draft painted it violet-black. The draft's lines that explain what it is are removed, because the story thread says to seed it and never explain it. The story thread says all eight family members beat it. To let that happen inside a 4-person party, the player picks the 4 again at each of the two phase changes. That is the one exception to the rule that swaps happen outside battle, and spec v11 section 2.1 now carries it, with how a character arrives.

**84. Blue Lens and Orange Lens (`lens`).** Two lenses it sets in the Back row for phase 2. They do not attack. HP 500 each, Atk 0, Def 75, Spd 115, 0 pips, 0 VP. Pet Peeves: Blue: Sizzle, Clobber. Orange: Drench, Racket. Resists: Blue: Drench, Razzle. Orange: Sizzle, Clobber. While the Blue Lens stands, The Collector takes half damage from Sizzle and Razzle, its own Pet Peeves. While the Orange Lens stands, it takes 25% less damage from everything. With both standing, a Sizzle or Razzle hit is cut by 60%, the spec's cap. Knocking out a lens costs The Collector 2 pips and 5% of its Max HP.

#### 85. The Collector (working name) (`leviathan`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 5,140 (3,860 with 3 in the party) | 219 | 92 | 124 | 8 | Sizzle, Razzle | none | The end of the game |

- Three phases: 100% to 66%, 65% to 31%, 30% to 0. Damage past a phase line is lost: its HP stops at 66% and at 31%, and the next phase starts at once. The player may pick the 4 again at each change (spec 2.1).
- Phase 1, Still Frame: it snapshots where every ally stands on the turn bar. Before or on their next turn, each ally must either be moved on the bar or in the rows (a pull, a push, a swap, a row change or a granted action, from either side) or take part in a Mix or a Detonation. Simply waiting for a turn to come up does not count. An ally who does neither loses 2 Pep and is Slowed (1t).
- Phase 2, the lenses: it sets the Blue Lens and the Orange Lens in the Back row (see above). Pulls, party-wide Skills and ranged Skills reach them.
- Phase 3, the countdown: it refills all 8 pips, drops its resistances and counts down 200 ticks (two round dividers) to one huge flash. Break it before the count ends and the flash never fires. Only a Break stops the count: interrupt Skills do not cancel this one. A Full Family Ruckus takes 4 pips in one action, which makes it the tool for this.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Gold Shard | Clobber | 0.8x | 80 | 1 ally | projectile | Bleed (2t). |
| Still Frame | Razzle | 1.0x | 100 | all allies | aoe | Phase 1. See above. |
| Shutter Blade Snap | Clobber | 1.5x | 120 | 1 ally | melee, ground_sweep, charge_up | -25% Def (2t). |
| Lens Set | Support | none | 80 | field | buff | Start of phase 2. Sets both lenses. |
| Low Whisper | Racket | 1.15x | 100 | all allies | aoe | Phase 2. Fatigue (1t). |
| Countdown | Support | none | 200 | self | charge_up | Start of phase 3. Refills 8 pips, 200-tick count. Only a Break cancels it. |
| The Biggest Picture | Razzle | 3.0x | 120 | all allies | aoe, charge_up | Fires if the count ends unbroken. -3 Pep and Slow (2t). |

**86. Julian Vance (`julian`).** Not a fight. No stats. Pet Peeves: n/a. Resists: n/a. He never starts a battle. After the last fight the family gets through to him with kindness alone, in the scene, as the story thread says. The built game's Julian battle trigger comes out at the rebuild. What happens in that scene belongs to the chapter 20 script, and the draft's invented details of it are not carried over.

### Bonus chapter: Nine Scoops (`scoops`)

Party size the boss HP assumes: 3.

> Party is Tom, Grace and Rose. Stats use the chapter 5 baseline. In the built chapter the first run at Brain Freeze ends in the midpoint scene and the second run is the real fight. That stays. How the first run ends is the bonus chapter script's call.

| # | Foe (`id`) | Role, row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Starts with | Drop |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 87 | Sprinkle Gremlin (`gremlin`) | Swarmer, Front | 148 | 37 | 22 | 107 | 0 | Sizzle, Drench | none | none | none |
| 88 | Slushie Slug (`slushslug`) | Elite, Front | 410 | 51 | 35 | 92 | 4 | Sizzle, Razzle | Drench | Blue-Ice Glaze: Guard Stance (2t) | none |
| 89 | Cone Head (`conehead`) | Hexer, Back | 194 | 42 | 25 | 107 | 0 | Sizzle, Racket | none | none | none |

| Foe | Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|---|
| Sprinkle Gremlin | Sprinkle Flick | Clobber | 0.8x | 80 | 1 ally | projectile | Rainbow jimmies sting. |
| Sprinkle Gremlin | Sugar Hop | Clobber | 1.0x | 100 | 1 ally | melee | Bouncy pink pounce. |
| Sprinkle Gremlin | Sprinkle Spray | Razzle | 1.05x | 120 | all allies | projectile, aoe | Dazzled (2t). |
| Slushie Slug | Syrup Ooze | Drench | 0.8x | 80 | 1 ally | ground_sweep | Drenched (2t). |
| Slushie Slug | Slush Sneeze | Drench | 1.0x | 100 | 1 ally | projectile | Slow (2t). |
| Slushie Slug | Slush Rush | Clobber | 1.2x | 120 | all allies | ground_sweep, aoe, charge_up | Slow (1t). Renamed from "Brain Freeze" so it does not share the boss's name. |
| Cone Head | Waffle Poke | Clobber | 0.8x | 80 | 1 ally | melee | Pointed cone jab. |
| Cone Head | Mint-Chip Drip | Drench | 1.0x | 100 | 1 ally | projectile | Drenched (2t). |
| Cone Head | Scoop Pass | Support | none | 100 | 1 hurt foe | buff | Heals it 20% of Max HP. +15% Def (2t, buff). |

#### 90. Brain Freeze (`brainfreeze`)

| Kind | Row | HP | Atk | Def | Spd | Pips | Pet Peeves | Resists | Story reward |
|---|---|---|---|---|---|---|---|---|---|
| Boss, no running | Front | 680 (910 with 4 in the party) | 55 | 32 | 104 | 6 | Sizzle, Razzle | Drench | The nine scoops |

- Frosted Lid: Guard Stance plus +15% Def (2t, buff) before he charges Deep Freeze. Panic Boil! pops the lid, and Sizzle is his Pet Peeve.

| Act | Flavor | Power | Recovery | Hits | Tags | Effect |
|---|---|---|---|---|---|---|
| Frost Breath | Racket | 0.8x | 80 | 1 ally | projectile | Slow (2t). |
| Cold Shoulder | Clobber | 1.0x | 100 | 1 ally | melee | Blocky ice-fist check. |
| Frosted Lid | Support | none | 80 | self | guard_stance, buff | See above. |
| Ice-Cube Pitch | Clobber | 1.5x | 120 | 1 ally | projectile, charge_up | Stun (1t) unless a shield soaks it. |
| Temple Throb | Clobber | 1.15x | 120 | all allies | aoe, charge_up | Fatigue (2t). |
| Deep Freeze | Drench | 1.35x | 120 | all allies | ground_sweep, aoe, charge_up | Below 50% HP. Drenched and Slow (2t). |


## 3. The Part 1 monsters that come back (chapters 13 and 14)

Story thread, chapter 13: the camera's picture of the whole town spilled color over all of Long Island, so everything the family fixed there in Part 1 woke up again, bigger and brighter, and every boss they befriended stands with the knight. Chapter 14: the family gets past their old friends to reach Boppy.

| Rule | Detail |
|---|---|
| Which foes | Every regular enemy and boss from the Long Island chapters of Part 1: chapter 1 (the pond), 3 (the pier), 5 (the school), 7 (the library), 9 (the Moon Club) and 10 (the airport). The story thread also names "the park" (see the note at chapter 6). The chapter 13 and 14 scripts decide which places the player actually walks through. |
| When they are fought | They are seen at the end of chapter 13. The fights are in chapter 14. |
| Regular enemies | Same id, acts, Pet Peeves, Resists, traits and formation as the Part 1 entry. Stats use the same role on the chapter 14 baseline (table below). |
| Returning bosses | Same acts, mechanics, Pet Peeves and Resists as the Part 1 entry, including the below-50% acts. They are sized as a gate, not as a chapter boss: about 4 rounds, 4 pips, one stat line for all of them (table below). |
| Look | The Part 1 art, drawn 25% larger with a brighter palette. No new paintings. |
| Name on screen | The Part 1 name. The size and color carry the change. |
| After the armor breaks | They all turn back for good, with the rest of Long Island. No fight is repeatable after chapter 14. |
| Tone | These are friends. No new act is added that makes them crueler than they were. |

| Role | HP | Atk | Def | Spd | Pips |
|---|---|---|---|---|---|
| Swarmer | 491 | 100 | 46 | 120 | 0 |
| Skirmisher | 604 | 124 | 49 | 137 | 0 |
| Hexer | 642 | 112 | 52 | 120 | 0 |
| Bruiser | 868 | 130 | 61 | 108 | 0 |
| Elite | 1,359 | 136 | 73 | 103 | 4 |
| Returning boss | 1,810 | 148 | 67 | 116 | 4 |

## 4. Formations

Back-row foes sit behind a Front blocker so the Back row's protection from single-target Clobber, and the party's pulls and party-wide Skills, matter in every area.

| Ch | Fight | Formation |
|---|---|---|
| 1 | `mudling` | 2 Mudlings (Front). The story's first fight is 1 Mudling. |
| 1 | `skeeter` | Mudling (Front), Skeeter Swarm (Back) |
| 1 | `grump` | Pond Grump (Front), Mudling (Front) |
| 1 | `toad` | Bog Toad (Front), Skeeter Swarm (Back) |
| 1 | `log` | Log Lump (Front), Skeeter Swarm (Back) |
| 1 | `bigone` | The Big One |
| 2 | `smoglet` | 2 Smoglets (Front) |
| 2 | `tickets` | Smoglet (Front), Ticket Flurry (Back) |
| 2 | `coyote` | Canyon Coyote (Front), Ticket Flurry (Back) |
| 2 | `gridlock` | Gridlock (Front), Smoglet (Front) |
| 2 | `tarblob` | Tar Pit Blob (Front), Ticket Flurry (Back) |
| 2 | `bigshake` | The Big Shake |
| 3 | `soggysock` | 2 Soggy Socks (Front) |
| 3 | `bobber` | Bobber (Front), Soggy Sock (Front) |
| 3 | `tangle` | Tangle (Front), Bobber (Back) |
| 3 | `snag` | Snag (Front), Bobber (Back) |
| 3 | `irongill` | Old Iron-Gill (Front, dives to Back behind a called Soggy Sock) |
| 4 | `extra` | 3 Extra Extras (Front) |
| 4 | `boommoth` | Extra Extra (Front), Boom Mic Moth (Back) |
| 4 | `clapper` | Clapper Snapper (Front), Extra Extra (Front) |
| 4 | `fogwisp` | Extra Extra (Front), Fog Wisp (Back) |
| 4 | `cuecrab` | Cue Card Crab (Front), Boom Mic Moth (Back) |
| 4 | `directorscut` | The Director's Cut (calls 1–2 Extra Extras at 60% HP) |
| 5 | `popquiz` | 2 Pop Quizzes (Front) |
| 5 | `tardybell` | Pop Quiz (Front), Tardy Bell (Back) |
| 5 | `glitterglue` | Pop Quiz (Front), Glitter Glue (Back) |
| 5 | `dodgeball` | Dodgeball Dread (Front), Tardy Bell (Back) |
| 5 | `redpen` | The Red Pen |
| 6 | `acornagent` | 2 Acorn Agents (Front) |
| 6 | `stickysap` | Sticky Sap (Front), Acorn Agent (Front) |
| 6 | `peanutgallery` | Acorn Agent (Front), Peanut Gallery (Back) |
| 6 | `twigspy` | Acorn Agent (Front), Twig Spy (Back) |
| 6 | `cheekstuffer` | Cheek Stuffer (Front), Peanut Gallery (Back) |
| 6 | `chairman` | Chairman Cheeks (calls Acorn Caches to Back) |
| 7 | `shusher` | Dog-Ear (Front), Shusher (Back) |
| 7 | `dogear` | 2 Dog-Ears (Front) |
| 7 | `cliffhanger` | The Cliffhanger (Front), Shusher (Back) |
| 7 | `knowitall` | Dog-Ear (Front), The Know-It-All (Back) |
| 7 | `popup` | Pop-Up Panic (Front), Shusher (Back) |
| 7 | `unread` | The Unread |
| 8 | `lukewarm` | 2 Lukewarms (Front) |
| 8 | `leftover` | Leftover (Front), Lukewarm (Front) |
| 8 | `wetblanket` | Wet Blanket (Front), Lukewarm (Front) |
| 8 | `thedraft` | Leftover (Front), The Draft (Back) |
| 8 | `pickyeater` | The Picky Eater (Front), The Draft (Back) |
| 8 | `ironbelly` | Old Ironbelly |
| 9 | `velvetrope` | 2 Velvet Ropes (Front) |
| 9 | `stuffedshirt` | Stuffed Shirt (Front), Velvet Rope (Front) |
| 9 | `coathanger` | The Hanger-On (Front), Velvet Rope (Front) |
| 9 | `soreloser` | Stuffed Shirt (Front), The Sore Loser (Back) |
| 9 | `wallflower` | The Wallflower (Front), The Sore Loser (Back) |
| 9 | `mirrorball` | The Mirrorball |
| 10 | `carryon` | 2 Carry-Ons (Front) |
| 10 | `jetlag` | Carry-On (Front), Jet Lag (Back) |
| 10 | `longline` | The Long Line (Front), Jet Lag (Back) |
| 10 | `unclaimed` | The Unclaimed (Front), Carry-On (Front) |
| 10 | `armresthog` | The Armrest Hog (Front), Jet Lag (Back) |
| 10 | `lastcall` | The Last Call |
| 11 | `lostluggage`, `redeye` | Lost Luggage (Front), Red-Eye (Back) |
| 11 | `standbysprite` | Standby Sprite (Front), Red-Eye (Back) |
| 11 | `finalcall` | FINAL CALL (calls 1–2 Lost Luggage at 60% HP) |
| 12 | `gridlockprime` | Gridlock Prime (calls 1 Gridlock, twice) |
| 13 | `hushling`, `turnstile` | Turnstile Grump (Front), Hushling (Back) |
| 13 | `signalfault` | Signal Fault (Front), Hushling (Back) |
| 13 | `drillworm` | Dual-Coast Drill Worm (Front), Wired Relay Hushling (Back) |
| 13 | `goldknight` | The Gold Knight, alone |
| 14 | returning packs | The Part 1 formation of that foe, on chapter 14 stats |
| 14 | returning bosses | The returning boss, alone |
| 14 | `warden` | Boppy's Gold Armor, alone |
| 15 | `hush9final` | The radio (Front), 2 Hushling pods (Back) |
| 16 | `greynote` | Citation Slip (Front), Citation Slip (Back) |
| 16 | `marlowe16` | The sign (Front), 2 Citation Slips (Back) |
| 17 | `pausesprite`, `curator` | Curator (Front), Pause Sprite (Back) |
| 17 | `paperweight` | Brass Desk Weight (Front), Pause Sprite (Back) |
| 17 | `twinlens` | The Twin Lenses (calls 1 Curator at 50% HP) |
| 18 | `vance` | The Studio Rig, alone |
| 19 | `deadletter` | Dead Letter, alone |
| 19 | `rubberstamp` | Rubber Stamp, alone |
| 19 | `mailcourier` | Dead Letter (Front), Brass Mail-Chute Courier (starts Back) |
| 19 | `censor` | The Dead-Letter Censor (calls 1 Dead Letter) |
| 20 | `leviathan` | The Collector (sets 2 lenses in Back for phase 2) |
| Bonus | `gremlin` | 3 Sprinkle Gremlins (Front) |
| Bonus | `conehead` | Sprinkle Gremlin (Front), 2 Cone Heads (Back) |
| Bonus | `slushslug` | Slushie Slug (Front), Cone Head (Back) |
| Bonus | `brainfreeze` | Brain Freeze |

## 5. VP per chapter

The spec pays about 90 Main VP a chapter (45 for the Pocket Vibe). Helpers called mid-fight pay nothing. If a script places more or fewer fights, scale the per-fight number so the chapter still pays 90.

| Ch | Normal fights | VP each | Boss VP | Total |
|---|---|---|---|---|
| 1 | 6 | 10 | The Big One 30 | 90 |
| 2 | 6 | 10 | The Big Shake 30 | 90 |
| 3 | 7 | 9 | Old Iron-Gill 27 | 90 |
| 4 | 8 | 8 | The Director's Cut 26 | 90 |
| 5 | 5 | 12 | The Red Pen 30 | 90 |
| 6 | 10 | 6 | Chairman Cheeks 30 | 90 |
| 7 | 7 | 9 | The Unread 27 | 90 |
| 8 | 7 | 9 | Old Ironbelly 27 | 90 |
| 9 | 7 | 9 | The Mirrorball 27 | 90 |
| 10 | 8 | 8 | The Last Call 26 | 90 |
| 11 | 6 | 10 | FINAL CALL 30 | 90 |
| 12 | 3 | 15 | Gridlock Prime 45 | 90 |
| 13 | 6 | 7 | Drill Worm 18, The Gold Knight 30 | 90 |
| 14 | 4 returning packs | 5 | 4 returning bosses at 10 each, Boppy's Gold Armor 30 | 90 |
| 15 | 0 | 0 | The radio 90 | 90 |
| 16 | 2 | 15 | The sign 60 | 90 |
| 17 | 12 | 5 | The Twin Lenses 30 | 90 |
| 18 | 0 | 0 | The Studio Rig 90 | 90 |
| 19 | 4 | 10 | Courier 20, Censor 30 | 90 |
| 20 | 0 | 0 | The Collector 90 | 90 |
| Bonus | 6 | 10 | Brain Freeze 30 | 90 |

## 6. Art and data this would need

Nothing in this list should be painted yet. All images are made in the Art Library, and the provisional looks wait for their chapter scripts.

| Item | Need |
|---|---|
| The Gold Knight and Boppy's Gold Armor | The built armor art exists. New: a helmet-closed set for chapter 13, three crack stages, the armor breaking off, and frames for the seven motions (palm up, slow walk, arms wide, visor up, standing nap, hug, storytelling). |
| Returning Part 1 monsters | No new paintings: larger draw size and a brighter palette on the Part 1 art. |
| Brass Mail-Chute Courier | New art. No sprite exists. |
| Chapter 15 radio, chapter 16 sign and slips, chapter 17 desk weight, chapter 18 rig | The built art shows things the story no longer has (a railcar, Marlowe, a snow globe, a ray gun). Each needs a new look once its script says what it is. |
| The Collector | Gold, matching Boppy's armor. |
| Julian | The built art holds a ray gun. He needs a camera, and he is no longer a battle entry. |
| Data | Chapter 2's five regular enemies need explicit stat blocks (the built game derives them at run time). Remove the Julian battle trigger at the rebuild. |

## 7. Known gaps, for the Battle Lab and the chapter scripts

| Gap | Detail |
|---|---|
| Enemy damage falls behind late | On the baseline, a boss's Heavy hit takes about 31% of a party member's HP in chapter 1 and about 16% in chapter 20, while the party gains shields and heals. Late bosses may feel soft. Gemini's Atk curve is left alone, because raising it is a guess until the fights can be played. |
| The output factor is an estimate | If real play shows the party doing more or less than the model says, change the factor in 1.6 and every boss HP follows. |
| Gemini's balance check (2026-11-17) is paper, not play | It reported every boss at 4 to 7 rounds with no knock-outs, but it seated a party of 4 with Deedee in the Los Angeles chapters (2, 4, 6 and 8), which are 3-person parties without her. Its "no problem" rows prove little. |
| Dead Letter or Rubber Stamp alone (chapter 19) | Gemini says 2 rounds, the 1.6 model says 3.3. Left at 2,142 HP, because Gemini's 3,100 would give a normal foe more HP than the chapter's mini-boss. Watch it in the Battle Lab. |
| The Courier fight (chapter 19) | The Courier's 2,300 HP aims at 3.5 rounds, but it starts behind a full 2,142 HP Dead Letter, so the whole fight is about 6.8 rounds on the model. Not changed in v11. |
| Interrupts against telegraphs | Grace's Crunchy Sugar-Cube Pop (4 Pep since v11) and Justin's Main Breaker Flip cancel any telegraphed act except the last boss's count. If bosses never land a big hit in play, more big acts may need that same "only a Break" line. |
| Chapters 13 and 17 | Every normal fight there includes an Elite, at about 4.5 rounds each. Chapter 17 has 12 of them. |
| Which Part 1 places return | Set by the chapter 13 and 14 scripts (section 3). |
| The chapter 15 radio | Frozen or woken up: the story thread says both. |
| Whether chapter 18 has a fight | Set by its script. |
| Chapter 14 in the story thread | Section 7 of `claude/story-thread.md` still says nobody hits Boppy. Tom changed that on 2026-11-17. It is owed the change when chapter 14's script is written. |
