# The Adventures of Tom: the 210 kit lines sorted into "ops" or "custom" (2026-11-18)

Architecture risk 1 (`claude/battle-architecture.md` section 6) asked for this before stage 2's code: can each kit line in `claude/battle-spec-v11.md` section 3 be written as data, or does it need its own function? No code was written for this table. It is the reference for stages 5, 9, 10 and 19 to 21.

## Result

Counted from the table below: 210 rows.

| Verdict | Meaning | Lines | Share |
|---|---|---|---|
| OPS | Written as a data row with the op list, the hook list and a named condition. No engine edit when the kit stage arrives. | 152 | 72% |
| OPS+ | Still a data row, but it needs one small general piece added to the engine first (a new op, hook, target kind or status field). Each piece is shared by several lines, listed in the next table. | 33 | 16% |
| CUSTOM | Needs its own named function in `engine/b3-custom.js`. Its numbers still live in the data row. | 25 | 12% |

Fact: 88% of the lines are data. The architecture's estimate was "about three quarters", and its alarm line was "more than a third custom". Risk 1 is closed: tuning without engine edits holds.

## The general pieces the OPS+ lines need

| Piece | Kind | Lines that use it | Stage that should add it |
|---|---|---|---|
| Target kind `either` (a foe OR an ally, with a second effects list for the ally) | Target kind | Starter Splash, Backup Iced Coffee, Baby-Wipe Swipe | 9 or 10 (first kit that has one) |
| `extend` (add turns to a buff or regen) and `refresh` (reset buffs to full length) | Op | Starter Splash, Classroom Lights-Out Reset, TAP-Card Transfer | 10 |
| `tick` (make a damage-over-time status tick now) | Op | The Ghost One That Looks Back | 9 |
| `mix` (two allies, two flavors, one foe, one round) | Hook | Four-Tab Binder (and the bestiary's Strict Grading) | 6 (the Ruckus file already keeps the record) |
| A condition on a passive's stat mod (`when`: target below X% HP, holder is shielded, attacker is debuffed, flavor is X, the act is `aoe`) | Status and passive field | Too Loud for Secrets, Mint-Condition Backup, Coaster Policy, Forty-Seven Rewatches, Emergency Purse Tissue, "My Stomach Is Doing Something", Rubber-Soled Workboots, Mom-Arm Seatbelt Stop, Stud-Finder Beep & Knock, Cool-Mist Humidifier, Vacuum-Cleaner Bolt! | 5 |
| A mod that scales with a number (`per`: counter stacks, unique buffs, unspent Pep) | Status and passive field | Preheated Oven, Workout Streak, Trophy-Shelf Ego, Nervous Vibrations (if kept as data) | 5 |
| Damage option `pierce` (ignore shields, guard stances or evasion) | Op option | Upside-Down Pilot Wings, Stunt-Double Squirrel Intercept, Follow-Along Finale Burnout | 9 |
| Status field `peeve` or `resistStep` (a status that changes a foe's Pet Peeves or Resists) | Status field | Masterpiece Portrait Makeover, LivNews Breaking Exclusive | 19 to 21 |
| Skill field `cooldown` in rounds | Skill field | Sofa-Cushion Citadel, "Bring a Jacket!" Ward, Eyes in the Back of Her Head | 5 |
| Status length `hits` (ends after N hits taken) | Status field | Hang Fresh Drywall | 10 |
| Hits or targets read from a counter | Skill field | Criss-Cross Double-Under, Regional Championship Freestyle, Trophy Striper Haul | 9 and 10 |

## Spec lines that do not say enough to build (each gets a call when its kit stage arrives)

| Line | What is missing |
|---|---|
| Konami Code, "Tom glows rainbow-invincible" | Whether that is a rule (untargetable for 1 turn) or only the picture |
| Mega Whoopee-Cushion Trap, "fumbles multi-hits" | What a fumbled multi-hit does |
| Caramelized Crust, "on attacker" | Who is hit when a shield runs out by itself and nobody attacked |
| 1989 Pickle-Jar Bomb, Five-Alarm Burn | Whether it still counts as Toasty for Detonations |
| Flag on the Play!, "locks strongest AoE/buff" | How "strongest" is chosen |
| Nap-Window Efficiency, "add 0 extra Recovery Ticks" | Extra compared with what |
| Investigative Scoop, "bypasses half-resistance" | The spec has no rule for a boss resisting debuffs |
| Tattered Lamby Boomerang, "free fast tackle" | When the free tackle happens (same turn, or Rose's next) |
| Wine O'Clock Pour, "-10% Eva 1t" | Whether it lands on the foes or on the ally |

## The table

Slot: T Trait, B Basic, S1 and S2 Skills, QA and QB Quirks, C Grand Capstone. Ops and hooks are the names in architecture section 2.3.

### Tom

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 1 | Priority Boarding | T | OPS | `battleStart`: status Guard Stance. Intercept row carries an extra 20% reduction with the condition "ally below 50% HP" |
| 2 | Lounge Pass Flex | B | OPS | damage, status Eyes On Me (built in stage 1) |
| 3 | Zone One Blockade | S1 | OPS | status with a ward: when hit by `melee` or `projectile`, damage and composure on the attacker (built in stage 2) |
| 4 | Suite Door Slide | S2 | OPS | intercept on adjacent allies (built in stage 2) |
| 5 | Upgrade Certificate | QA | OPS | `intercept`: counter +1 (max 3). Damage bonus "per counter, spend" on a Clobber Skill |
| 6 | Tarmac Porsche Transfer | C | OPS | damage on all foes, strip 1 buff, taunt |
| 7 | Million-Miler Status | QB | OPS | `counter` and `intercept`: composure 1, pull 10 |
| 8 | Gamer's Intuition | T | OPS | passive damage bonus with the condition "target has a Pet Peeve hit or a Prime"; `detonation`: ruckus 5 |
| 9 | Cartridge Blow | B | CUSTOM | Showing the enemy's next target means choosing that target early and holding the foe to it |
| 10 | Controller Toss | S1 | OPS | damage with the condition "took or blocked a hit since last turn" |
| 11 | Winged Shell Lock-On | S2 | OPS | damage, a mark on the foe that fires a Razzle hit when the foe acts, gone at Tom's next turn |
| 12 | Elixir Hoarder | QA | OPS | `turnStart` with the condition "6 or more Pep": status (Speed and Crit Rate, 1 turn) |
| 13 | Konami Code | C | OPS | damage on all foes with a Crit Rate bonus per Prime, composure 2 |
| 14 | New Game Plus | QB | OPS | `detonation` and `counter`: status that cuts the next Skill's cost by 2 (once a round, Skills of 4 Pep or less) |
| 15 | Preheated Oven | T | OPS+ | `turnEnd`: counter +1 (max 3). Mod "per counter" on healing given and Sizzle |
| 16 | Starter Splash | B | OPS+ | `either` target; `extend` for the ally side |
| 17 | Sheet-Pan Bribe | S1 | OPS | heal, then `later` (2 turns): heal and pep 2 |
| 18 | Five-Hundred-Degree Boule | S2 | OPS | damage on all foes, shield on allies sized by the counter |
| 19 | Parchment Lined | QA | OPS | passive Recovery mod with the condition "Support, heal or shield Skill" |
| 20 | Three-Tier Showstopper Cake | C | CUSTOM | The party heal and cleanse are ops. "Infuses allies' next attacks with bonus Sizzle" adds a flavor part to someone else's move |
| 21 | Caramelized Crust | QB | OPS | `shieldBroken`, `shieldEnded`, `statusEnded`: damage on the attacker |

### Grace

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 22 | Choreographed Momentum | T | CUSTOM | Counting the bar icons Grace jumped past since her last turn |
| 23 | Five-Six-Seven-Eight! | B | OPS | damage, stance Airborne (flag: `ground_sweep` acts miss) |
| 24 | Jazz-Hands Cartwheel | S1 | OPS | damage, swapBar with the next enemy, 25 at most |
| 25 | Good-Scrunchie Pirouette | S2 | OPS | status Poise (Crit Rate on the next Skill, push immune), pull 30 on self |
| 26 | Standing Ovation | QA | OPS | `crit`: pep 1, pull 15 |
| 27 | Grand Jeté Spotlight Finale | C | OPS | damage with a Crit Damage bonus on the condition "Airborne", composure 2 |
| 28 | Encore Poise | QB | CUSTOM | A used-up single-attack buff comes back at half strength for a turn |
| 29 | Creative Mess | T | OPS | `primeApplied` and `statusApplied` by Grace: splash 25% Razzle to adjacent foes |
| 30 | Glitter-Brush Flick | B | OPS | damage |
| 31 | Open-String Violin Screech | S1 | OPS | damage on all foes (Racket sets off Dazzled by the normal rule), status Attack down |
| 32 | Bedazzle-Gun Glue Trap | S2 | OPS | hazard for 2 rounds: a foe that acts takes chip damage and Fatigue |
| 33 | Permanent Marker | QA | OPS | passive: Primes Grace puts on last 1 more turn |
| 34 | Masterpiece Portrait Makeover | C | OPS+ | damage, status with field `peeve` (Razzle) |
| 35 | Double Coat | QB | CUSTOM | Remembering the flavor of Grace's last Skill, and a "mini-detonation" that is not one of the six |
| 36 | Sensory Satisfying | T | OPS | `turnEnd`: if the next unit on the bar is an ally, status (+15% potency, 1 turn) |
| 37 | Soup-Dumpling Squeeze | B | OPS | damage, mark Squished (built in stage 1) |
| 38 | NeeDoh Stretch Pass | S1 | OPS | place, status (built in stage 1) |
| 39 | Crunchy Sugar-Cube Pop | S2 | OPS | damage, interrupt, push 30 (built in stage 2) |
| 40 | Slow-Rise Memory Foam | QA | OPS | `barMoved` by Grace: status Evasion until her next turn |
| 41 | Colossal Diamond-Gold Dumpling | C | OPS | grant (a free Skill of 4 Pep or less), pep 1 to both |
| 42 | Ultra-Rare Limited Edition | QB | OPS | passive Recovery mod with the condition "Skill aimed at an ally" |

### Rose

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 43 | Too Loud for Secrets | T | OPS+ | passive reduction with the condition "attacker below half its Composure" |
| 44 | Sneaky Nose Boop | B | OPS | damage, steal (10% Speed, 1 turn) |
| 45 | Supersonic Raspberry | S1 | OPS | damage, composure with the condition "target is charging" |
| 46 | Backup-Lamby Bait & Switch | S2 | OPS | status (untargetable), `later` (next turn): damage, push 35 |
| 47 | Nana's Card Trick | QA | OPS | `barMoved` on a foe by Rose: steal 1 buff, else pep 1 to a random ally |
| 48 | Mega Whoopee-Cushion Trap | C | OPS | damage on all foes, strip stances, status Attack down, composure 1 |
| 49 | Upside-Down Pilot Wings | QB | OPS+ | passive: damage option `pierce` with the condition "8 or more Pep" |
| 50 | Bouncy Physics | T | OPS | `afterHit` on a multi-hit move: ruckus 2 |
| 51 | Lamb-Tuck Ankle Tackle | B | OPS | damage, 2 hits (built in stage 1) |
| 52 | The Floor Is Lava! | S1 | OPS | damage, 3 random hits, bonus on a Toasty or Dazzled target (built in stage 1) |
| 53 | "Giddyup, Tata!" Launch | S2 | OPS | status on an ally, two-flavor damage (built in stage 2) |
| 54 | Twin-Lamb Relay | QA | CUSTOM | Makes every hit of a multi-hit move set off other people's enchantments at 40% |
| 55 | Double-Lamby Return-Cart Blitz | C | OPS | damage, 6 hits, bonus that grows per hit on the condition "Flustered" |
| 56 | "It's OUR Longboard Now" | QB | OPS | `actionEnd` with the condition "3 or more hits landed": status Speed |
| 57 | Well-Loved Original | T | OPS | `roundStart`, every 2nd round: pep 1 |
| 58 | Pocket Pretzel & Pat | B | OPS | damage, heal (tiny) on the lowest-HP ally |
| 59 | Tattered Lamby Boomerang | S1 | OPS | damage, mark, `later`: damage (2 hits) and shield on self |
| 60 | Sofa-Cushion Citadel | S2 | OPS+ | shield on the party, status (push immune), `cooldown` 3 rounds |
| 61 | Mint-Condition Backup | QA | OPS+ | passive mod on allies with the condition "has a Rose shield" |
| 62 | Kingdom of Ten-Thousand Blankets | C | OPS | heal 60%, cleanse, `later` (next turn): damage on all foes |
| 63 | Emergency Stuffy Swap | QB | OPS | `shieldBroken` (Rose's shield): damage on the attacker, once a round |

### Amy

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 64 | Workout Streak | T | OPS+ | `turnEnd`: counter Reps +1 (max 4). Mod "per counter" on Speed and Clobber |
| 65 | Kettlebell Swing | B | OPS | damage, counter +1, its own Recovery number |
| 66 | Burpee Blitz | S1 | OPS | damage, grant to self on the condition "3 or more Reps" (Basic or a 2-Pep Skill, once a round) |
| 67 | Pace-Partner Run | S2 | CUSTOM | Sets an ally's Speed to Amy's Speed: a copied value, not a percent |
| 68 | "Walk It Off, Hydrate" | QA | OPS | counter reaching 4, or every 3rd turn: heal 20%, pep 1 |
| 69 | Follow-Along Finale Burnout | C | OPS+ | damage on all foes with a bonus "per counter, spend", `pierce`, status on allies (Recovery -20%) |
| 70 | Active Recovery | QB | OPS | passive Recovery mod with the condition "Skill of 2 Pep or less", once a round |
| 71 | "I'm Counting to Three" | T | OPS | `foeDoubleTurn`: status Detention, composure 1 |
| 72 | "Eyes on Me" Clap | B | OPS | damage, strip 1 buff that changes Speed or Evasion |
| 73 | Four-Tab Binder | S1 | OPS+ | mark on the foe; hook `mix`: composure, pep 1 to each party member |
| 74 | Gold-Star Sticker | S2 | OPS | status on an ally (+35% potency, cannot miss) |
| 75 | "Good Try" Margin Note | QA | OPS | `break` with the condition "foe carries an Amy debuff": heal 15%, pep 1 |
| 76 | Classroom Lights-Out Reset | C | OPS+ | damage on all foes, status (no party-wide acts, 1 turn), `refresh` on ally buffs |
| 77 | Never Late Once | QB | OPS | `statusApplied` (a buff from Amy on an ally): pull 15 |
| 78 | Eyes in the Back of Her Head | T | OPS+ | `allyBelowHp` (35%): pull 25 on self, `cooldown` 2 rounds |
| 79 | Backup Iced Coffee | B | OPS+ | `either` target: damage on a foe, or status and heal on an ally |
| 80 | Mom-Arm Seatbelt Stop | S1 | OPS+ | status on 2 allies: reduction with the condition "the act is `aoe`" |
| 81 | Dairy-Free Snack Pack | S2 | OPS | heal on the party, cleanse Slow and Fatigue |
| 82 | Emergency Purse Tissue | QA | OPS+ | passive healing mod with the condition "target below 40% HP" |
| 83 | Act-One "Inside Voice" Belt | C | OPS | damage on all foes, status on the party (Defense, immune to statuses) |
| 84 | The Rivituso Rule | QB | OPS | `afterHit` on an ally with the condition "crit, or a heavy hit with no shield": pep 1, once a round |

### Deedee

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 85 | Forty Years a Nurse | T | OPS | heal option: half of the overheal becomes a shield, up to 25% Max HP |
| 86 | "Little Pinch!" Syringe Poke | B | OPS | damage, status (Crit Rate taken, 1 turn) |
| 87 | Deedee Makes It Better | S1 | OPS | heal, cleanse, status Attack up on the condition "something was cleansed" |
| 88 | "Bring a Jacket!" Ward | S2 | OPS+ | status on 2 allies (regen, survive one knock-out at 1 HP), `cooldown` 3 rounds |
| 89 | First-Ring Pickup | QA | OPS | passive cost mod with the condition "target below 50% HP" |
| 90 | To the Moon & Back | C | OPS | revive 80% or heal 100%, damage on all foes, composure 2 |
| 91 | "Warm Beats Cold" | QB | OPS | passive: immune to Stun and Slow. `cleansed` by Deedee: heal 10% on self |
| 92 | "Did You Eat?" | T | OPS | Mods on the Stuffed status row |
| 93 | Wooden-Spoon Taste Test | B | OPS | damage, status Stuffed on a random ally |
| 94 | Warm Apple Muffins | S1 | OPS | heal on the party, status Stuffed with a ward (burns `melee` attackers) |
| 95 | Wine O'Clock Pour | S2 | OPS | damage on a row, pep 2 on an ally, status Evasion down |
| 96 | Tupperware Send-Off | QA | CUSTOM | Copies a single heal or buff onto a second ally at half strength, by chance |
| 97 | Full-House Sunday Dinner | C | OPS | hazard on the party's side for 2 rounds: each ally's turn starts with heal 15%, pep 1 and a random status |
| 98 | "Everything Gives Me Gas" | QB | OPS | `statusEnded` (Stuffed): pep 1 |
| 99 | Spotless Floor | T | OPS | `pipsShaved` by Deedee with the condition "foe is Drenched": composure 1, once a round |
| 100 | Windex Spritz | B | OPS | damage, status (built in stage 1) |
| 101 | Wet-Floor Hazard | S1 | OPS | hazard: the next 2 foes that use a `melee` act slip (built in stage 2) |
| 102 | "Hand Me My Glasses" Scrub | S2 | OPS | strip all buffs, damage with a bonus per buff stripped (built in stage 2) |
| 103 | Car-Crumb Vacuum | QA | OPS | `buffStripped` by Deedee: status on the party (Attack, 1 turn) |
| 104 | Fifty-Year Dust Tsunami | C | OPS | damage on all foes, strip all buffs and enemy hazards |
| 105 | Spit Shine | QB | OPS | `primeApplied` (Drenched from Deedee): mark that adds 30% to the next ally Clobber hit |

### Boppy

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 106 | "It Was THIS Big!" | T | OPS | `actionEnd` on an Angler Skill: counter Tally +1 (max 4). The wider AoE is read by the Skills |
| 107 | Choppy-Water Cast | B | OPS | pullForward, damage |
| 108 | Lead-Sinker Boat Slam | S1 | OPS | damage with the condition "target is Drenched or was pulled" |
| 109 | Trophy Striper Haul | S2 | OPS+ | two-flavor damage; targets read from the counter (1 or 2 foes, all at 2 or more) |
| 110 | 2006 Lucky Boat Lure | QA | OPS | `barMoved` on a foe by Boppy: composure 1, status Drenched |
| 111 | Long Island Sound Leviathan | C | OPS | damage on all foes with a bonus "per counter, spend", composure 2 |
| 112 | Star in Grace's Key | QB | OPS | `battleStart`: counter +2 |
| 113 | "My Stomach Is Doing Something" | T | OPS+ | passive reduction with the condition "flavor is Sizzle"; on taking Sizzle chip: status Attack up |
| 114 | Seeds of Trouble | B | OPS | damage |
| 115 | "It's Nothing, It's Fine" Chomp | S1 | OPS | heal on self, status Spiced Up with a ward (burns `melee` attackers) |
| 116 | 1989 Pickle-Jar Bomb | S2 | OPS | damage on all foes; on the condition "target is Toasty": status Five-Alarm Burn |
| 117 | "The Hose Flinched" | QA | CUSTOM | Burn ticks roll for a crit: a change inside the tick code |
| 118 | The Ghost One That Looks Back | C | OPS+ | damage on all foes, `tick` twice |
| 119 | No Reach for Water | QB | OPS | `detonation` (Steam Cloud!): pep 2, once a round |
| 120 | Boppy Speed | T | OPS | passive: push immune on the condition "above 50% HP"; aggro +40% |
| 121 | Warden's Nightstick Rap | B | OPS | damage, status Attack down (1 turn) |
| 122 | "Nobody Gets Past Me!" | S1 | OPS | taunt, status (Defense, a ward that answers with Racket) |
| 123 | 1970 Cross-Country Story | S2 | OPS | status Slow on self and the foe, a status on the foe that locks its aim onto Boppy |
| 124 | "Gold Like My Teeth" | QA | OPS | passive: survive one knock-out at 1 HP, once a battle; pep 3 |
| 125 | Warden's Iron Gate | C | OPS | hazard on the party's side for 2 rounds: `aoe` reduction, a ward against `melee` |
| 126 | "The Mailbox Moved" | QB | CUSTOM | Counters copy the flavor and the extra effects of Boppy's last Skill |

### TNB

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 127 | Wet Clay to Stoneware | T | CUSTOM | Shields that absorb more of one kind of hit, and turn into a reflecting shield when Sizzle touches them |
| 128 | Wheel-Thrown Lump | B | OPS | damage, status Speed down |
| 129 | Center the Bowl | S1 | OPS | shield 30%, cleanse Toasty and Bleed |
| 130 | Three-AM Kiln Firing | S2 | CUSTOM | The damage and the Attack buff are ops. Firing shields into Fired Glaze shares the function of line 127 |
| 131 | Coaster Policy | QA | OPS+ | passive damage mod on allies with the condition "has a shield" |
| 132 | Grand Amphora Masterpiece | C | CUSTOM | A vessel that soaks 2 hits and then goes off |
| 133 | Kintsugi Gold Seam | QB | CUSTOM | The heal is an op. "Razzle-detonating strikes" lets other flavors set off Detonations |
| 134 | Carving Momentum | T | OPS | passive Recovery mod on Basics |
| 135 | Longboard Push & Carve | B | OPS | damage, a "seen" flag on the foe, its own Recovery number |
| 136 | E-Bike Tag-Along | S1 | OPS | cleanse, status (blocks 1 debuff), status (Speed, Attack, Defense) |
| 137 | Waymo Tailgate Rescue | S2 | CUSTOM | The blind and the revive are ops. "Safe HP rebalance" moves HP between allies |
| 138 | TAP-Card Transfer | QA | OPS+ | passive: buff length +1 (`extend`), Evasion; pull 15 on the slowest ally |
| 139 | Baxter Hill Longboard Express | C | CUSTOM | The damage and the ruckus are ops. Doubling a buff that is already on someone is not |
| 140 | No Car, No Tickets | QB | OPS | passive: immune to Slow. `detonation` (Dazzled, first time on that foe): crack 10% |
| 141 | "Don't Look Behind You" | T | OPS | passive damage and composure bonus with the condition "target has a Racket debuff or is slower" |
| 142 | Flashlight Under Chin | B | OPS | damage |
| 143 | Flying Popcorn Jump-Scare | S1 | OPS | damage, status Spooked (accuracy and damage on its next hit; crits taken from fast or Airborne attackers) |
| 144 | "Don't Go In The Basement!" | S2 | OPS | damage on all foes, pull 20 on the next ally |
| 145 | Forty-Seven Rewatches | QA | OPS+ | passive Evasion with the condition "attacker carries a debuff" |
| 146 | Act-Three Mask Reveal | C | OPS | damage with the condition "2 or more debuffs" |
| 147 | Sequel Hook | QB | OPS | `ko` and `break`: pep 2, once a round |

### Nara

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 148 | Locked On the Gold Ball | T | CUSTOM | Remembering which foe Nara hit last. The My Toy mark itself is a status row |
| 149 | Grip-Chicken Snap | B | OPS | damage, heal 5% on self with the condition "target has a debuff" |
| 150 | Relentless Tug-of-War | S1 | OPS | damage, status (Attack and Defense down), strip stances |
| 151 | "No Take, Only Throw!" | S2 | OPS | damage, steal 1 buff, else status Attack up |
| 152 | Sandbox Clue Digger | QA | CUSTOM | A random treasure from a small table, at battle start and on a Break |
| 153 | Stunt-Double Squirrel Intercept | C | OPS+ | damage, 3 hits, `pierce`, bonus on My Toy or Flustered |
| 154 | Forty-Pound Counterweight | QB | OPS | `afterHit` by an ally on a My Toy foe: pull 15 on Nara |
| 155 | Nervous Vibrations | T | CUSTOM | Evasion worked out from unspent Pep every time it is read, halved against party-wide acts |
| 156 | Startled Water-Bowl Flip | B | OPS | damage on the Front row |
| 157 | Jittery Shake-It-Off | S1 | OPS | status Drenched on all foes, cleanse self, status Evasion |
| 158 | Vacuum-Cleaner Bolt! | S2 | OPS+ | damage on a row, status accuracy down, status on self (reduction with the condition "`aoe`") |
| 159 | "Where Are You Going?!" | QA | OPS | `dodge` by Nara: pep 1, status Drenched on the attacker, once a round |
| 160 | "Don't Leave Me!" Meltdown | C | OPS | two-flavor damage on all foes, detonateAll |
| 161 | Pressed Against Your Shins | QB | CUSTOM | Attack worked out from the size of Nara's Speed buffs |
| 162 | High Standards | T | OPS | `healed` and `statusApplied` on Nara by an ally: pep 1 and status Crit Rate for that ally |
| 163 | Unimpressed Sniff | B | OPS | damage, status (its next hit does 20% less) |
| 164 | Weaponized Puppy Eyes | S1 | OPS | damage, status on the foe (cannot aim at Nara, damage down), composure |
| 165 | "Only Off Your Plate" | S2 | OPS | heal 30% on both, shield, status Attack up |
| 166 | Belly-Rub Tax | QA | OPS | `afterHit` on Nara with the condition "more than 20% HP, no shield": status Speed on allies, once a round |
| 167 | Eighth-Chair Pie-Crust Decree | C | OPS | composure on all foes, cleanse (Mental), pull 20 on allies |
| 168 | Allowed on the Couch | QB | CUSTOM | Copies a buff put on Nara onto the lowest-HP ally at half strength (same family as lines 28 and 96) |

### Justin

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 169 | Live Circuit | T | OPS | `afterHit` with the condition "target is Dazzled or Drenched": status Wired. Hitting a Wired foe: splash 30% Razzle to the others |
| 170 | Voltage-Tester Poke | B | OPS | damage |
| 171 | "Don't Touch the Copper!" Banner | S1 | OPS | damage, a linked status on 2 foes; `pipsShaved` on one: composure 1 on the other, once a round |
| 172 | Main Breaker Flip | S2 | OPS | damage, interrupt, status (no passives, 1 turn), composure |
| 173 | Rubber-Soled Workboots | QA | OPS+ | passive reduction with the condition "flavor is Razzle or Sizzle"; `detonation` (Short Circuit!): pep 1 |
| 174 | Flashlight Block Rewire | C | OPS | damage, splash 75% to Wired or Drenched foes |
| 175 | Rare Heart-Emoji Text | QB | OPS | `break` and `ko`: status Static Charge (+40% Razzle on his next action) |
| 176 | "ARE YOU BLIND, REF?!" | T | OPS | `crit` by a foe and `foeDoubleTurn`: status Yellow Flag, push 15 |
| 177 | Couch-Side Boo! | B | OPS | damage, push 10 |
| 178 | Flag on the Play! | S1 | OPS | damage, push 25, status (no party-wide acts or buffs, 1 turn) |
| 179 | Giant Dad-Sneeze | S2 | OPS | damage on all foes, push 20 on all, detonateAll |
| 180 | Home-Field Advantage | QA | OPS | `barMoved` with the condition "the push crossed a round divider": composure 1 |
| 181 | Jumbotron Instant Replay | C | CUSTOM | Remembering the last hit an ally took and who dealt it |
| 182 | "Unmailed Invitations" | QB | CUSTOM | Repeating a Skill the player already used, free, at half power |
| 183 | Load-Bearing Swing | T | OPS | passive Recovery mod on Clobber; composure 1 with the condition "target has a shield or high Defense", once a round |
| 184 | Stud-Finder Beep & Knock | B | OPS+ | damage, status (takes more damage, with the condition "flavor is Clobber") |
| 185 | Demo-Day Prybar | S1 | CUSTOM | Breaks a shield or guard and deals its remaining value as splash |
| 186 | Hang Fresh Drywall | S2 | OPS+ | status on 2 allies (50% reduction against `melee` and `projectile`), length 2 `hits` |
| 187 | Measure Twice, Cut Once | QA | OPS | `actionEnd` on a Support turn: status (the next Clobber or Razzle hit crits) |
| 188 | Dropped-Screw Toolbox Punt | C | OPS | damage with a bonus on the condition "Flustered", crack 15% once per foe |
| 189 | Store-Bought Bread Peace Offering | QB | OPS | `shieldBroken` (anyone's): status Attack up, pep 1, once a round |

### Olivia

| # | Line | Slot | Verdict | How |
|---|---|---|---|---|
| 190 | On The Record | T | OPS | `battleStart`: a "seen" flag on every foe, status (Crit Rate taken) |
| 191 | Hot-Mic Question | B | OPS | damage, status (no stealth, no Evasion) |
| 192 | Camera-Crew Spotlight | S1 | OPS | damage, splash 25% Racket to all other foes |
| 193 | "Is This Real?" Fact-Check | S2 | OPS | damage with a bonus per buff on the target, invert 1 buff |
| 194 | Inverted Pyramid | QA | OPS | `afterHit` with the condition "Pet Peeve hit": pep 1, once a turn |
| 195 | LivNews Breaking Exclusive | C | OPS+ | damage on all foes, status with field `resistStep`, composure 2 on buffed foes, status on the party (Ruckus gain) |
| 196 | Investigative Scoop | QB | CUSTOM | Rests on a rule the spec does not have (bosses half-resisting debuffs) |
| 197 | Multitasking Pro | T | OPS | `turnEnd`: counter Mom Prep +1 (max 3) |
| 198 | Baby-Wipe Swipe | B | OPS+ | `either` target: damage on a foe, or cleanse and heal on an ally |
| 199 | Diaper-Bag Snack Drop | S1 | OPS | heal on the party sized by the counter (spent), pep 1 to the lowest-Pep ally at 3 |
| 200 | Cool-Mist Humidifier | S2 | OPS+ | status on the party (reduction with the condition "`projectile` or `aoe`"), status Drenched on all foes |
| 201 | Nap-Window Efficiency | QA | OPS | passive Recovery mod on Support Skills |
| 202 | "Michael, Grab the Kids!" | C | OPS | push 25 on all foes, heal on the party, cleanse (Mental and Stun) |
| 203 | Childproofed Locks | QB | OPS | `healed` and `statusApplied` from a party-wide Skill: status (blocks 1 debuff) on a random ally |
| 204 | Unbroken Rhythm | T | OPS | `turnEnd`: counter Cadence +1 after an attacking turn, reset otherwise. Crit Damage "per counter" |
| 205 | Rusty Speed-Rope Snap | B | OPS | damage, counter +1 |
| 206 | Criss-Cross Double-Under | S1 | OPS+ | damage with hits read from the counter, status (Evasion and Attack) |
| 207 | "Better Than Bobby!" Hype | S2 | OPS | counter +1, status Crit Rate, pull 25 on self |
| 208 | Muscle Memory | QA | OPS | passive flag: the Cadence rule holds instead of resetting on a Support turn |
| 209 | Regional Championship Freestyle | C | OPS+ | damage with hits read from the counter and a bonus per buff on Olivia, composure 2 |
| 210 | Trophy-Shelf Ego | QB | OPS+ | passive damage mod "per unique buff", up to 32% |

## The 25 CUSTOM lines by stage

| Stage | Lines | Count |
|---|---|---|
| 5 (Tom, Grace, Rose, Deedee's two Sig Vibes) | Cartridge Blow, Double Coat, Twin-Lamb Relay | 3 |
| 9 (TNB, Nara, Boppy) | Wet Clay to Stoneware, Three-AM Kiln Firing, Grand Amphora Masterpiece, Kintsugi Gold Seam, Waymo Tailgate Rescue, Baxter Hill Longboard Express, Locked On the Gold Ball, Sandbox Clue Digger, Nervous Vibrations, Pressed Against Your Shins, "The Hose Flinched", "The Mailbox Moved" | 12 |
| 10 (Amy, Justin, Olivia) | Pace-Partner Run, Demo-Day Prybar | 2 |
| 19 to 21 (third Vibes) | Three-Tier Showstopper Cake, Choreographed Momentum, Encore Poise, Tupperware Send-Off, Allowed on the Couch, Jumbotron Instant Replay, "Unmailed Invitations", Investigative Scoop | 8 |

Sig Vibes: Tom Frequent Flier and Gamer Geek, Grace Squishy Collector and Craft Artist, Rose Sugar Rush and Cozy Rosie, Deedee Neat Freak and Registered Nut, Boppy The Dep and Pepper Boss, TNB Ceramicist and Longboarder, Nara Attached Pup and Guard Dog, Amy Fitness Queen and Classroom Boss, Justin Basement Boss and Live Wire, Olivia Rope Champ and Working Mom. Fact: stage 9 is the heavy one (12 of the 25 custom lines, 6 of them TNB's). Recommendation: when stage 9 is planned, give TNB his own conversation.
