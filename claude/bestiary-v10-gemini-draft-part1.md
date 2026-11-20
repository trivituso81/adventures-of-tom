# THE ADVENTURES OF TOM: PURE v10 BESTIARY & ENCOUNTER DIRECTORY (`bestiary-v10.md`)

Canonical pure `Battle Spec v10` enemy, mini-boss, boss, and formation specification converting all **86 repository entries** plus **1 new Chapter 19 mini-boss (`mailcourier`)** (**87 total entries**). All legacy `B2` mechanics and quarantined cut lore are permanently purged, and all 22 boss/mini-boss fights are mathematically tuned for **5–7 round Time-to-Kill (TTK)** (3–4 rounds for `mailcourier`; 8–10 rounds for 3-phase `leviathan`).

---

## 1. Global v10 Enemy Architecture & Conversion Rules

### 1.1 Zero Legacy B2 Holdovers
- **Purged Systems:** Zero `B2_GRUMP` gauges, zero `likes` lists, zero `praise` or `Kindness` combat menu commands, zero `shield` element-locks, zero `goofEasy` flags, and zero `vpDrain` effects. Story empathy and character resolutions play out in post-fight cutscenes after HP reaches 0.
- **Drain Replacements:** All legacy `vpDrain` and MP-drain specials convert to `-1 Pep` (respecting 0 floor) and/or `Fatigue` (+20% Recovery Ticks, 2 turns).
- **Strippable Passives:** Legacy passive `dodge`/`evade`, `armor`, and `regen` traits convert to active, strippable v10 states (`+20% Evasion` buff, `Guard Stance` [-25% damage taken], or `Mend` regen buff) so cast buff-strippers, stance-breakers, and inverters (`Shatter Glitz!`, `Panic Boil!`, Tom, Amy, Deedee, Rose, Nara, Justin, Olivia) interact with every defensive gimmick.

### 1.2 Damage Flavors, Primes, Pet Peeves & Resists
- **5 Damage Flavors + Support:**
  - `Clobber` (from legacy `kinetic`): Physical impact. Detonates `Drenched` (`Hydro-Slip!`: 25% pushback, -1 pip) and `Dazzled` (`Shatter Glitz!`: strips 1 positive buff, -1 pip). Back-row targets take -20% single-target `Clobber`.
  - `Sizzle` (from legacy `cozy` + exhaust/tar/pepper/furnace heat): Applies `Toasty` (2t Sizzle burn). Detonates `Drenched` (`Steam Cloud!`: `Blind` next single-target hit, -2 pips).
  - `Drench` (from legacy `splash`): Applies `Drenched` (2t, -15% Speed). Detonates `Toasty` (`Steam Cloud!`, -2 pips).
  - `Razzle` (from legacy `sparkle`): Light and voltage. Applies `Dazzled` (2t, +15% incoming Crit Rate). Detonates `Drenched` (`Short Circuit!`: 40% splash to adjacent foes, -2 pips).
  - `Racket` (from legacy `chatter`): Noise and scolding. Detonates `Toasty` (`Panic Boil!`: drops `Guard Stance` or counter-stance, -1 pip) and `Dazzled` (`Sensory Overload!`: -25% outgoing damage 2t, -1 pip).
  - `Support`: Non-damaging heals, stances, buffs, and add summons.
- **Multipliers:**
  - **Pet Peeve:** `1.5x` damage taken and `-1 Composure pip` per action on Elites/Bosses.
  - **Resist:** `0.65x` damage taken.

### 1.3 Six Pep-Free Role Chassis & Composure Rules
Enemies do **not** use Pep (`Pep: 0` across all foes) and instead run deterministic/weighted AI act cycles governed by Recovery Ticks (`Base Recovery x 100 / Spd`).

| Chassis | Source Rank | HP Mult | Atk Mult | Def Mult | Spd Mult | Default Row | Composure Pips |
|---|---|---|---|---|---|---|---|
| `Swarmer` | `EASY` | 0.65x | 0.85x | 0.80x | 1.05x | Front (Back for `acorncache`) | 0 |
| `Skirmisher` | `TRICKY` / fast `MEDIUM` | 0.80x | 1.05x | 0.85x | 1.20x | Front or Back | 0 |
| `Hexer` | Ranged/status `TRICKY` | 0.85x | 0.95x | 0.90x | 1.05x | Back | 0 |
| `Bruiser` | Heavy `MEDIUM` / `TRICKY` | 1.15x | 1.10x | 1.05x | 0.95x | Front | 0 |
| `Bulwark Elite` | `TOUGH` / Mini-Boss | 1.80x | 1.15x | 1.25x | 0.90x | Front | 4 (Ch. 1–15 & Bonus), 5 (Ch. 16–20) |
| `Boss` | `BOSS` (`noRun`) | 5.0x / 5.8x / 6.0x / 6.5x* | 1.25x | 1.15x | 1.02x | Front | 6 (Ch. 1–6 & Bonus), 7 (Ch. 7–15*), 8 (Ch. 16–20) |

*\*Locked Boss & Party-Size Overrides: Part 1 3-character LA bosses (`bigshake` Ch. 2, `directorscut` Ch. 4, `chairman` Ch. 6, `ironbelly` Ch. 8) are tuned for the canonical 3-unit squad (`Tom, TNB, Nara`: `480 / 800 / 1,220 / 1,850 HP`, plus `+20% Max HP` if optional 4th-slot Olivia is active). Pre-Casual-Mode Ch. 16 `marlowe16` = 5.8x (`5,510 HP`) and Ch. 17 `twinlens` = 6.0x (`6,240 HP`). Ch. 14 `warden` = 6.0x HP / 8 pips (Gold Armor durability; pulled-punch 1 HP floor on Grace and Rose). Ch. 18 `vance` = 6.5x HP / 8 pips (Meteor-Veined Camera Rig). Ch. 20 `leviathan` = 9,200 HP / 8 pips (3-phase Casual Mode apex fight). Ch. 20 `julian` = retired from combat (`combat: false`).*

### 1.4 Chapter 1–20 Baseline Curve, Player Benchmarks, Skill Power & Kit-Feed Tags
- **Chapter Baseline Curve (`1.00x` Enemy Reference) & Un-Leaned Player Stat Benchmark:**

| Ch. | Foe Base HP | Foe Base Atk | Foe Base Def | Foe Base Spd | Player Lv | Player HP | Player Atk | Player Def | Player Spd |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 92 | 22 | 15 | 94 | Lv 2 | 115 | 26 | 16 | 100 |
| 2 | 112 | 26 | 18 | 96 | Lv 4 | 145 | 31 | 19 | 101 |
| 3 | 155 | 33 | 22 | 98 | Lv 7 | 190 | 39 | 23 | 102 |
| 4 | 190 | 38 | 25 | 100 | Lv 9 | 230 | 45 | 26 | 103 |
| 5 | 228 | 44 | 28 | 102 | Lv 12 | 280 | 53 | 30 | 104 |
| 6 | 285 | 52 | 32 | 104 | Lv 14 | 335 | 62 | 34 | 105 |
| 7 | 330 | 59 | 35 | 105 | Lv 17 | 390 | 71 | 37 | 106 |
| 8 | 375 | 66 | 39 | 106 | Lv 19 | 445 | 80 | 41 | 107 |
| 9 | 420 | 74 | 42 | 107 | Lv 22 | 505 | 90 | 45 | 108 |
| 10 | 490 | 84 | 46 | 108 | Lv 25 | 570 | 102 | 49 | 109 |
| 11 | 555 | 92 | 49 | 110 | Lv 27 | 630 | 112 | 52 | 110 |
| 12 | 620 | 100 | 52 | 111 | Lv 30 | 695 | 124 | 56 | 111 |
| 13 | 690 | 109 | 55 | 113 | Lv 32 | 755 | 136 | 60 | 112 |
| 14 | 755 | 118 | 58 | 114 | Lv 35 | 820 | 148 | 63 | 113 |
| 15 | 860 | 130 | 62 | 116 | Lv 37 | 880 | 162 | 67 | 114 |
| 16 | 950 | 140 | 66 | 118 | Lv 40 | 940 | 176 | 70 | 115 |
| 17 | 1,040 | 150 | 70 | 119 | Lv 42 | 995 | 190 | 73 | 116 |
| 18 | 1,130 | 162 | 74 | 120 | Lv 45 | 1,050 | 205 | 76 | 117 |
| 19 | 1,190 | 168 | 77 | 121 | Lv 47 | 1,100 | 220 | 79 | 118 |
| 20 | 1,250 | 175 | 80 | 122 | Lv 50 | 1,150 | 235 | 82 | 120 |

- **Enemy Skill Power & Recovery Tiers:**
  - **Quick Act:** `0.8x` Power, `Rec 80`
  - **Standard Act:** `1.0x` Power, `Rec 100`
  - **Heavy / Telegraphed Act:** `1.5x` Single-Target OR `1.05x–1.35x` AoE telegraphed `charge_up`, `Rec 120` (pre-weighted AoE multiplier; 1-turn visible telegraph/wind-up before firing on bosses and heavy elites)
  - **Support / Stance / Summon:** `0.0x` Power (`Support`), `Rec 80` or `Rec 100`
- **Action Tags (Cast Kit Triggers):**
  - `melee`: Triggers Tom `Zone One Blockade`, Deedee `Stuffed` burn & `Wet-Floor Hazard`, Boppy `Spiced Up` burn & `Warden's Iron Gate` thorns, Justin `Hang Fresh Drywall`.
  - `projectile`: Triggers Tom `Zone One Blockade`, Justin `Hang Fresh Drywall`, Olivia `Cool-Mist Humidifier`.
  - `ground_sweep`: Evaded completely by Grace's `Airborne` stance (`Five-Six-Seven-Eight!`).
  - `aoe`: Mitigated/locked by Amy `Mom-Arm Seatbelt Stop` & `Classroom Lights-Out Reset`, Boppy `Warden's Iron Gate`, Nara `Vacuum-Cleaner Bolt!`, Justin `Flag on the Play!`, Olivia `Cool-Mist Humidifier`.
  - `charge_up`: Telegraphed preparation broken/interrupted by Grace `Crunchy Sugar-Cube Pop`, Rose `Supersonic Raspberry`, Justin `Main Breaker Flip`, or `Flustered` Composure Break.
  - `guard_stance`: Dropped/ignored by `Panic Boil!`, Rose `Mega Whoopee-Cushion Trap` & `Upside-Down Pilot Wings`, Nara `Relentless Tug-of-War` & `Stunt-Double Squirrel Intercept`, Justin `Demo-Day Prybar`.
  - `buff`: Stripped/stolen/inverted by `Shatter Glitz!`, Tom `Tarmac Porsche Transfer`, Amy `"Eyes on Me" Clap`, Deedee `"Hand Me My Glasses" Scrub` & `Fifty-Year Dust Tsunami`, Rose `Nana's Card Trick`, Nara `"No Take, Only Throw!"` & `Weaponized Puppy Eyes`, Olivia `"Is This Real?" Fact-Check`.

---

## 2. Complete Pure-v10 Bestiary (87 Entries)

### Chapter 1: *The Soup Dumpling Protocol* (`hollow` / `grands` - Grump Hollow, LI)

#### 01. `mudling` | Mudling
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 60, Atk 19, Def 12, Spd 99, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/mudling.webp` (cutscene pose `mudling-heist.webp` in `ch1Theft`) | Drop: `mudpie`
- **Traits:** None (legacy `skittish` removed for snappy tutorial pacing).
- **Acts:**
  - `Wobble` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Fast bog bump.
  - `Mud Flick` (`Drench`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Drenched` (2t).
  - `Mud Pie` (`Drench`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Winds up every 3rd turn and splats heavy mud (`Drenched` 2t).

#### 02. `skeeter` | Skeeter Swarm
- **Role & Row:** `Hexer` | `Back` (placed behind Front `mudling` or `grump`) | **Stats:** HP 78, Atk 21, Def 14, Spd 99, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/skeeter.webp` | Drop: `honey`
- **Traits:** Starts battle with strippable `Jitterflight` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Darting Bite` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Quick sting.
  - `Buzz Cloud` (`Support`, 0.0x, Rec 80, self, `[buff]`): Refreshes `+20% Evasion` (2t) if stripped.
  - `Mosquito Whine` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): High-pitched drone; inflicts `-1 Pep` and `Fatigue` (2t).

#### 03. `grump` | Pond Grump
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 106, Atk 24, Def 16, Spd 89, Pep 0, Pips 0
- **Pet Peeves:** `Razzle`, `Sizzle` | **Resists:** None
- **Assets & Drop:** `art/foes/grump.webp` | Drop: `hoodie`
- **Acts:**
  - `Puddle Grumble` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Croaking complaint.
  - `Bog Splash` (`Drench`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Drenched` (2t).
  - `Soggy Slap` (`Drench`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Heavy weed-draped belly slap (`Drenched` 2t).

#### 04. `toad` | Bog Toad
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 106, Atk 24, Def 16, Spd 89, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/toad.webp` | Drop: `lilyhat`
- **Acts:**
  - `Night Croak` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Loud bog call.
  - `Body Slam` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Long-legged hop slam.
  - `Tongue Lash` (`Clobber`, 1.1x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Sweeps low across the party; Grace evades in `Airborne`.

#### 05. `log` | Log Lump
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 166, Atk 25, Def 19, Spd 85, Pep 0, Pips 4
- **Pet Peeves:** `Sizzle` | **Resists:** None
- **Assets & Drop:** `art/foes/log.webp` | Drop: `barkslab`
- **Traits:** Starts in `Mossy Brace` `[guard_stance]` (-25% damage taken, 2t; dropped by `Panic Boil!` or Composure Break).
- **Acts:**
  - `Low Roll` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee, ground_sweep]`): Rolling shin check.
  - `Branch Jab` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Heavy knotty poke.
  - `Timber!` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Telegraphs a toppling slam; applies `Slow` (2t).

#### 06. `bigone` | The Big One
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 460, Atk 28, Def 17, Spd 96, Pep 0, Pips 6
- **Pet Peeves:** `Razzle`, `Racket` | **Resists:** None
- **Assets & Story Reward:** `art/foes/bigone.webp`, `bigone-end.webp` | Story Reward: `Dragonfly Coin` + Deedee's 12-cup muffin tin (cut `lure` drop purged).
- **Mechanics & Kit Checks (Tuned for Default Sig Loadouts):**
  - **Muffin-Tin Crown (`[buff]`):** Starts battle wearing Deedee's stolen muffin pan (`+15% Atk` and `3% HP Mend` for 2t). Knocked loose by **Deedee's `"Hand Me My Glasses" Scrub`**, **`Panic Boil!`** (`Toasty` + `Racket` from Rose's `"Giddyup, Tata!" Launch` or Deedee's `Warm Apple Muffins` + Tom's `Lounge Pass Flex` / Grace's `Crunchy Sugar-Cube Pop`), **`Shatter Glitz!`** (`Dazzled` + `Clobber`), or a **Composure Break**; re-applied once at 50% HP.
  - **Swamp Chomp Intercept & Interrupt Check:** Locks onto a back-row kid (`Grace` or `Rose`) with `Big Glare` (`charge_up`), inviting Tom's `Lounge Pass Flex` / `Zone One Blockade` / `Suite Door Slide`, Grace's `Crunchy Sugar-Cube Pop` (`charge_up` interrupt), or Deedee's `Deedee Makes It Better` before `Swamp Chomp` lands.
- **Acts:**
  - `Big Glare` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile, charge_up]`): Marks target for `Swamp Chomp` next turn.
  - `Tail Slap` (`Drench`, 1.0x, Rec 100, 1 ally, `[melee]`): Applies `Drenched` (2t).
  - `Swamp Chomp` (`Clobber`, 1.5x, Rec 120, marked ally, `[melee, charge_up]`): Heavy snapping bite; Tom's `Zone One Blockade` counters for `-1 Pip` + `+1 Pep`.
  - `Muddy Belly-Flop` (`Drench`, 1.2x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 2 (<50% HP) 3-turn rhythm tidal belly-flop (`Drenched` 2t).
  - `Crown Polish` (`Support`, 0.0x, Rec 80, self, `[buff]`): Used once at 50% HP to restore `Muffin-Tin Crown` (2t).

---

### Chapter 2: *Smog on 2nd Avenue* (`jpark` / `griffith` - Jefferson Park & Griffith Park, LA)

#### 07. `smoglet` | Smoglet
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 73, Atk 22, Def 14, Spd 101, Pep 0, Pips 0
- **Pet Peeves:** `Razzle`, `Drench` | **Resists:** None
- **Assets & Drop:** `art/foes/smoglet.webp` | Drop: `skyjar`
- **Acts (Explicit v10 Block):**
  - `Soot Cough` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Hacking smog puff.
  - `Tailpipe Puff` (`Sizzle`, 1.0x, Rec 100, 1 ally, `[projectile]`): Hot exhaust blast; applies `Toasty` (2t).
  - `Brown Haze` (`Sizzle`, 1.15x, Rec 120, all allies, `[aoe, charge_up]`): Choking warm exhaust cloud; applies `Blind` (1t) to 1 random target.

#### 08. `tickets` | Ticket Flurry
- **Role & Row:** `Skirmisher` | `Back` (behind `smoglet` or `coyote`) | **Stats:** HP 90, Atk 27, Def 15, Spd 115, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Drench` | **Resists:** None
- **Assets & Drop:** `art/foes/tickets.webp` | Drop: `parkticket`
- **Traits:** Starts with strippable `Paper Swirl` `[buff]` (`+20% Evasion`, 2t).
- **Acts (Explicit v10 Block):**
  - `Windshield Slap` (`Clobber`, 0.8x, Rec 80, 1 ally, `[projectile]`): Sharp paper cut.
  - `Tuesday Street Cleaning` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Scolding fine notice.
  - `Late Fee` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Inflicts `-1 Pep` and `Fatigue` (2t).

#### 09. `coyote` | Canyon Coyote
- **Role & Row:** `Skirmisher` | `Front` | **Stats:** HP 90, Atk 27, Def 15, Spd 115, Pep 0, Pips 0
- **Pet Peeves:** `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/coyote.webp` | Drop: `bandana`
- **Acts (Explicit v10 Block):**
  - `Brush Nip` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Fast ankle snap; applies `Bleed` (2t).
  - `Trail Pounce` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Agile canyon lunge.
  - `Pack Howl` (`Racket`, 1.0x, Rec 100, all foes/allies, `[aoe, buff]`): Grants all foes `+15% Atk` `[buff]` (2t; prime target for Nara's `"No Take, Only Throw!"` or TNB's `Shatter Glitz!`).

#### 10. `gridlock` | Gridlock
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 129, Atk 29, Def 19, Spd 91, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Razzle` | **Resists:** None
- **Assets & Drop:** `art/foes/gridlock.webp` | Drop: `hubcap`
- **Acts (Explicit v10 Block):**
  - `Lay On The Horn` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Blaring 405 honk.
  - `Overheated Radiator` (`Sizzle`, 1.0x, Rec 100, 1 ally, `[projectile]`): Scalding hood exhaust; applies `Toasty` (2t).
  - `Rush Hour` (`Clobber`, 1.2x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Bumper-to-bumper lane sweep.

#### 11. `tarblob` | Tar Pit Blob
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 202, Atk 30, Def 22, Spd 86, Pep 0, Pips 4
- **Pet Peeves:** `Sizzle`, `Drench` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/tarblob.webp` | Drop: `fossil`
- **Traits:** Starts in `Asphalt Crust` `[guard_stance]` (-25% damage taken, 2t).
- **Acts (Explicit v10 Block):**
  - `Tar Slurp` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Heavy sticky slap; applies `Slow` (2t).
  - `Bubbling Pitch` (`Sizzle`, 1.0x, Rec 100, 1 ally, `[projectile]`): Spits hot La Brea pitch; applies `Toasty` (2t).
  - `Sticky Situation` (`Sizzle`, 1.5x, Rec 120, 1 ally, `[melee, ground_sweep, charge_up]`): Engulfs target in hot tar (`Toasty` + `Slow` 2t).

#### 12. `bigshake` | The Big Shake
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 480 *(3-Unit Squad Baseline; 575 HP if optional 4th-slot Olivia is active)*, Atk 32, Def 21, Spd 98, Pep 0, Pips 6
- **Pet Peeves:** `Drench`, `Razzle` | **Resists:** None
- **Assets & Story Reward:** `art/foes/bigshake.webp`, `bigshake-end.webp` | Drop: `quakemedal` | Story Reward: `Lemon Coin` (sneezed out in post-fight cutscene).
- **Mechanics & Kit Checks (Tuned for 3-Unit `Tom/TNB/Nara` Squad):**
  - **Tectonic Brace (`[guard_stance, buff]`):** Enters `Faultline Guard` (-25% damage taken + `5% HP Mend`, 2t) at start of Phase 2; Nara's `Relentless Tug-of-War` yanks him out of guard while **`Panic Boil!`** (`Three-AM Kiln Firing` `Toasty` + Tom's `Lounge Pass Flex` `Racket`) drops the stance and **`Shatter Glitz!`** (`Waymo Tailgate Rescue` `Dazzled` + `Clobber`) or Nara's `"No Take, Only Throw!"` strips the `Mend` buff cleanly.
  - **Ground-Sweep Cadence:** `Aftershock` and `Big Rumble` test TNB's `Center the Bowl` shields and Nara's `Vacuum-Cleaner Bolt!` AoE mitigation.
- **Acts:**
  - `Smog Puff` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Coughs purple canyon smog; applies `Fatigue` (2t).
  - `Boulder Drop` (`Clobber`, 1.0x, Rec 100, 1 ally, `[projectile]`): Tumbles rock overhead.
  - `Aftershock` (`Clobber`, 1.1x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 1 fault tremor.
  - `Faultline Guard` (`Support`, 0.0x, Rec 80, self, `[guard_stance, buff]`): Phase 2 (<50% HP) stance + `5% HP Mend` (2t).
  - `Big Rumble` (`Clobber`, 1.35x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 2 major quake (`Slow` 1t).

---

### Chapter 3: *Paces & Peppers* (`reeds` / `sundial` - Long Island Sound Boat & Sundial Hollow Inlet, LI)

#### 13. `soggysock` | Soggy Sock
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 101, Atk 28, Def 18, Spd 103, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/soggysock.webp` | Drop: `dampsock`
- **Acts:**
  - `Wring Out` (`Drench`, 0.8x, Rec 80, 1 ally, `[projectile]`): Cold marsh spray (`Drenched` 2t).
  - `Sock Slap` (`Drench`, 1.0x, Rec 100, 1 ally, `[melee]`): Wet tube-sock thwack.
  - `Squelch` (`Drench`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Heavy waterlogged slam (`Slow` 2t).

#### 14. `bobber` | Bobber
- **Role & Row:** `Skirmisher` | `Front` (or `Back` behind `tangle`) | **Stats:** HP 124, Atk 35, Def 19, Spd 118, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Clobber` | **Resists:** None
- **Assets & Drop:** `art/foes/bobber.webp` | Drop: `luckybobber`
- **Traits:** Starts with strippable `Choppy Bob` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Cork Bonk` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Bouncing headbutt.
  - `Plunk!` (`Drench`, 1.0x, Rec 100, 1 ally, `[projectile]`): Splashes wake; inflicts `-1 Pep` and `Drenched` (2t).
  - `Sink & Pop` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee, buff]`): Strikes and refreshes `+20% Evasion` (1t).

#### 15. `tangle` | Tangle
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 178, Atk 36, Def 23, Spd 93, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/tangle.webp` | Drop: `fishline`
- **Acts:**
  - `Line Snarl` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Hooked monofilament whip (`Bleed` 2t).
  - `Wrap Up` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Applies `Slow` (2t).
  - `Big Knot` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Heavy snagged bind (`Slow` + `Fatigue` 2t).

#### 16. `snag` | Snag
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 279, Atk 38, Def 28, Spd 88, Pep 0, Pips 4
- **Pet Peeves:** `Sizzle` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/snag.webp` | Drop: `driftwood`
- **Traits:** Starts in `Sunken Timber` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `Reed Trip` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee, ground_sweep]`): Low root snag.
  - `Hook Catch` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Snatches attacker's line (-15% Spd 2t).
  - `Undertow` (`Drench`, 1.5x, Rec 120, 1 ally, `[ground_sweep, charge_up]`): Drags target in inlet current (`Drenched` + 20% timeline pushback).

#### 17. `irongill` | Old Iron-Gill
- **Role & Row:** `Boss` (`noRun`) | `Front` (shifts to `Back` via `Inlet Submerge`) | **Stats:** HP 775, Atk 41, Def 25, Spd 100, Pep 0, Pips 6
- **Pet Peeves:** `Clobber`, `Razzle` | **Resists:** None
- **Assets & Story Reward:** `art/foes/irongill.webp`, `irongill-end.webp` | Story Reward: `Fish Coin` (kept in Boppy's hatband) + `Boppy's 1989 Pepper Jar` (`pepperjar`). All legacy pier references purged; fought from Boppy's Sound Boat at the Sundial Hollow inlet.
- **Mechanics & Kit Checks:**
  - **Inlet Submerge (Back-Row Pull & Interrupt Check):** Every 3rd turn (and at 50% HP), Old Iron-Gill dives to the `Back` row behind a summoned `soggysock` (`-20%` Clobber taken + preparing `Deep Dive`). Boppy joins in Ch. 3 with `Boat Angler` as his default Main Vibe (`Sig: Boat Angler + The Dep`), so his `Choppy-Water Cast` hooks Iron-Gill straight back to `Front` (`+1 Whopper Tally`, `-1 Pip` with `2006 Lucky Boat Lure`), setting up `Lead-Sinker Boat Slam`. If Boppy is running another Vibe, Grace's `Crunchy Sugar-Cube Pop` or Rose's `Supersonic Raspberry` can also interrupt `Deep Dive` directly!
  - **1989 Pepper Belch (`Sizzle`):** Swallowed Boppy's 1989 pickled pepper jar, giving him an outgoing `Sizzle` AoE (`Toasty`) and leaving his gullet self-`Toasty` (1t) so answering with `Drench` triggers `Steam Cloud!`.
- **Acts:**
  - `Pond Spit` (`Drench`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `Drenched` and `Slow` (2t).
  - `Whisker Whip` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee, ground_sweep]`): Riveted barbel lash across the deck.
  - `Iron Headbutt` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Heavy iron-plated ram.
  - `Pepper Belch` (`Sizzle`, 1.15x, Rec 120, all allies, `[aoe, charge_up]`): Belches 1989 chili fire across the boat (`Toasty` 2t on allies + self-`Toasty` 1t; Boppy's `Pepper Boss` trait takes -30% damage).
  - `Inlet Submerge` (`Support`, 0.0x, Rec 80, self, `[buff, charge_up]`): Shifts to `Back` row (spawning 1 Front `soggysock` if alone; 0 VP add) and charges `Deep Dive`.
  - `Deep Dive` (`Drench`, 1.35x, Rec 120, all allies, `[aoe, charge_up]`): Fires if not pulled back to `Front`, interrupted, or Broken before next turn (`Drenched` 2t).

---

### Chapter 4: *Backlot Bedlam* (`backlot` / `stage7` / `stageset` - Sunset Gold Studios, LA)

#### 18. `extra` | Extra Extra
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 124, Atk 32, Def 20, Spd 105, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Razzle` | **Resists:** None
- **Assets & Drop:** `art/foes/extra.webp` | Drop: `callsheet`
- **Acts:**
  - `Holding Sigh` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Nine-hour waiting groan (`Fatigue` 1t).
  - `Crowd Elbow` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Trenchcoat jostle.
  - `Walk Into Shot` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Blunders directly in front of camera (`+50%` self-aggro 1t).

#### 19. `boommoth` | Boom Mic Moth
- **Role & Row:** `Hexer` | `Back` (behind Front `extra` or `cuecrab`) | **Stats:** HP 162, Atk 36, Def 22, Spd 105, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Clobber` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/boommoth.webp` | Drop: `windsock`
- **Traits:** Starts with strippable `Rafter Hover` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Dead-Cat Swoop` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Fuzzy mic brush.
  - `Mic Feedback` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Piercing monitor squeal; inflicts `Mental` Skill Lock on highest-Pep skill (1t).
  - `Boom Drop` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Drops heavy boom pole from the rafters.

#### 20. `clapper` | Clapper Snapper
- **Role & Row:** `Skirmisher` | `Front` | **Stats:** HP 152, Atk 40, Def 21, Spd 120, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** None
- **Assets & Drop:** `art/foes/clapper.webp` | Drop: `slate`
- **Traits:** High base Speed; opens Round 1 with `Scene One, Marker!`.
- **Acts:**
  - `Slate Snap` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Hinged wooden chomp.
  - `Chalk Smack` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Blinding chalk dust (`Blind` 1t).
  - `Scene One, Marker!` (`Racket`, 1.05x, Rec 120, all allies, `[aoe]`): Sharp clapboard crack; pulls 1 ally foe 15% forward.

#### 21. `fogwisp` | Fog Wisp
- **Role & Row:** `Hexer` | `Back` (behind Front `extra`) | **Stats:** HP 162, Atk 36, Def 22, Spd 105, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Clobber` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/fogwisp.webp` | Drop: `fogjuice`
- **Traits:** Starts with strippable `Stage Mist` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Damp Chill` (`Drench`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `Drenched` (2t).
  - `Fog Bank` (`Drench`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Blind` (1t).
  - `Pea Souper` (`Drench`, 1.05x, Rec 120, all allies, `[aoe, charge_up]`): Floods Stage 7 floor with mist (`Drenched` 2t + `-15%` accuracy 1t).

#### 22. `cuecrab` | Cue Card Crab
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 342, Atk 44, Def 31, Spd 90, Pep 0, Pips 4
- **Pet Peeves:** `Drench`, `Racket` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/cuecrab.webp` | Drop: `cuecards`
- **Traits:** Starts in `Posterboard Shell` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `Claw Pinch` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Sharp sideways snap.
  - `Flat Line Reading` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Inflicts `Fatigue` (2t).
  - `Card Toss` (`Clobber`, 1.15x, Rec 120, all allies, `[projectile, aoe, charge_up]`): Flings razor-edged cue cards across the set (`Bleed` 2t).

#### 23. `directorscut` | The Director's Cut
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 800 *(3-Unit Squad Baseline; 960 HP if optional 4th-slot Olivia is active)*, Atk 48, Def 29, Spd 102, Pep 0, Pips 6
- **Pet Peeves:** `Razzle`, `Sizzle` | **Resists:** `Racket`
- **Assets & Story Reward:** `art/foes/directorscut.webp`, `directorscut-end.webp` | Story Reward: `Hat Coin` (handed to TNB in post-fight cutscene).
- **Mechanics & Kit Checks (Tuned for 3-Unit `Tom/TNB/Nara` Squad):**
  - **`ACTION!` Tempo Pull:** Summons up to 2 `extra` Swarmers (0 VP) at 60% HP and pulls all active foes 25% forward on the timeline (`+15% Spd` `[buff]` 2t; prime target for Nara's `"No Take, Only Throw!"` or `Shatter Glitz!`).
  - **`CUT!` Megaphone Misfire Check:** Winds up a telegraphed `charge_up` megaphone blast (`CUT!`) that stuns and pushes its target back 40 ticks unless `directorscut` is afflicted with **`Spooked` or `Blind`** (spotlighting TNB's `Flying Popcorn Jump-Scare`, `Waymo Tailgate Rescue`, or a **`Steam Cloud!`** detonation from `Three-AM Kiln Firing` / `Five-Hundred-Degree Boule` + `Startled Water-Bowl Flip`), intercepted by Tom's `Suite Door Slide`, or Composure Broken!
- **Acts:**
  - `Studio Notes` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `-15% Def` (2t).
  - `Script Smack` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Rolled script thwack.
  - `ACTION!` (`Support`, 0.0x, Rec 80, all foes, `[buff]`): Pulls foes 25% forward + `+15% Spd` (2t); calls 1–2 `extra` once at 60% HP.
  - `CUT!` (`Racket`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Megaphone roar; misfires harmlessly if `Spooked`, `Blind`, interrupted, or Broken, otherwise inflicts `Stun` (1t) + 40-tick pushback.
  - `That's a Wrap!` (`Clobber`, 1.3x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 2 (<50% HP) tripod sweep across the soundstage.

---

### Chapter 5: *Parent-Teacher Conference of Doom* (`school` / `cafetorium` - Long Island Elementary, LI)

#### 24. `popquiz` | Pop Quiz
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 148, Atk 37, Def 22, Spd 107, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Sizzle` | **Resists:** None
- **Assets & Drop:** `art/foes/popquiz.webp` | Drop: `quizsheet`
- **Acts:**
  - `Paper Cut` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Pencil-sword jab (`Bleed` 2t).
  - `Trick Question` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Mental` Spooked (`-20%` accuracy 1t).
  - `Pencils Down!` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Inflicts `-1 Pep` and `Fatigue` (2t).

#### 25. `tardybell` | Tardy Bell
- **Role & Row:** `Hexer` | `Back` (behind Front `popquiz` or `dodgeball`) | **Stats:** HP 194, Atk 42, Def 25, Spd 107, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Racket` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/tardybell.webp` | Drop: `hallpass`
- **Acts:**
  - `Brass Clapper` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Bell-rim bonk.
  - `You're Late!` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Slow` (2t) and 15% timeline pushback.
  - `First-Bell Ring` (`Racket`, 1.1x, Rec 120, all allies, `[aoe, charge_up]`): Hallway-wide brass ring; applies `Fatigue` (2t).

#### 26. `glitterglue` | Glitter Glue
- **Role & Row:** `Hexer` | `Back` (behind Front `popquiz`) | **Stats:** HP 194, Atk 42, Def 25, Spd 107, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Clobber` | **Resists:** `Razzle`
- **Assets & Drop:** `art/foes/glitterglue.webp` | Drop: `gluestick`
- **Acts:**
  - `Nozzle Squirt` (`Drench`, 0.8x, Rec 80, 1 ally, `[projectile]`): Sticky dab (`Drenched` 2t).
  - `Paste Down` (`Drench`, 1.0x, Rec 100, 1 ally, `[ground_sweep]`): Glues sneakers (`Slow` 2t).
  - `Glitter Burst` (`Razzle`, 1.1x, Rec 120, all allies, `[aoe, charge_up]`): Craft-drawer burst; applies `Blind` (1t) to 1 random ally.

#### 27. `dodgeball` | Dodgeball Dread
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 410, Atk 51, Def 35, Spd 92, Pep 0, Pips 4
- **Pet Peeves:** `Racket`, `Drench` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/dodgeball.webp` | Drop: `dodgeitem`
- **Traits:** Starts with strippable `Gym Bounce` `[buff]` (`+20% Evasion`, 2t; Amy's `"Eyes on Me" Clap` strips it on Basic).
- **Acts:**
  - `Rubber Bank-Shot` (`Clobber`, 0.8x, Rec 80, 1 ally, `[projectile]`): Loud red-rubber PONG.
  - `Picked Last` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `-20% Atk` (2t).
  - `Gym-Wall Ricochet` (`Clobber`, 1.2x, Rec 120, all allies, `[projectile, aoe, charge_up]`): Rebounds across every slot.

#### 28. `redpen` | The Red Pen
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 1,140, Atk 55, Def 32, Spd 104, Pep 0, Pips 6
- **Pet Peeves:** `Drench`, `Razzle` | **Resists:** `Clobber`
- **Assets & Story Reward:** `art/foes/redpen.webp`, `redpen-end.webp` | Story Reward: `Kickball Coin` (given to Amy in post-fight cutscene).
- **Mechanics & Kit Checks:**
  - **Phase 2 `Strict Grading` Counter-Stance (`[guard_stance]`):** At <=55% HP (and every 3rd turn thereafter), enters `Strict Grading` (-30% damage taken and counters single-flavor hits with `Points Off`). Immediately shattered by **any 2-flavor Mix** in the same round (spotlighting Amy's `Four-Tab Binder`!), Rose's `Mega Whoopee-Cushion Trap`, OR a **`Panic Boil!`** detonation (`Toasty` + `Racket`).
- **Acts:**
  - `Margin Note` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Critiques posture (`-15% Def` 2t).
  - `Red Ink Slash` (`Drench`, 1.0x, Rec 100, 1 ally, `[melee, ground_sweep]`): Low gold-nib ink sweep (`Drenched` 2t).
  - `SEE ME` (`Racket`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Circles target in red ink (`Mental` taunt + `Fatigue` 2t).
  - `Strict Grading` (`Support`, 0.0x, Rec 80, self, `[guard_stance]`): Phase 2 counter-stance (2t); broken by a 2-flavor Mix, `Mega Whoopee-Cushion Trap`, or `Panic Boil!`.
  - `Points Off` (`Racket`, 0.8x, Rec 0, attacking ally, `[projectile]`): Automatic counterattack fired when struck by a single un-Mixed flavor while `Strict Grading` is active (`-15% Atk` 1t).
  - `Final Grade` (`Racket`, 1.35x, Rec 120, all allies, `[aoe, charge_up]`): Phase 2 cafetorium-wide report-card slam (cancelled if `Classroom Lights-Out Reset` is active or Broken).

---

### Chapter 6: *The Great Squirrel Conspiracy* (`oakpark` / `oak` / `crown` - Old Oak Park, LA)

#### 29. `acornagent` | Acorn Agent
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 185, Atk 44, Def 26, Spd 109, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Drench` | **Resists:** None
- **Assets & Drop:** `art/foes/acornagent.webp` | Drop: `acorn`
- **Acts:**
  - `Cap Bonk` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Earpiece-first headbutt.
  - `Pebble Toss` (`Clobber`, 1.0x, Rec 100, 1 ally, `[projectile]`): Sharp sting (`Blind` 1t).
  - `Code Red!` (`Racket`, 1.05x, Rec 120, all allies, `[aoe]`): Chirps into cuff mic; grants Front ally foe `+15% Spd` `[buff]` (1t).

#### 30. `stickysap` | Sticky Sap
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 328, Atk 57, Def 34, Spd 99, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Clobber` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/stickysap.webp` | Drop: `sapjar`
- **Acts:**
  - `Resin Drip` (`Drench`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `Drenched` (2t).
  - `Bark Glue` (`Drench`, 1.0x, Rec 100, 1 ally, `[ground_sweep]`): Applies `Slow` (2t).
  - `Sap Flow` (`Drench`, 1.1x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Coats trunk floor in sticky pitch (`Slow` 2t).

#### 31. `peanutgallery` | Peanut Gallery
- **Role & Row:** `Hexer` | `Back` (behind Front `acornagent`) | **Stats:** HP 242, Atk 49, Def 29, Spd 109, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Sizzle` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/peanutgallery.webp` | Drop: `peanuts`
- **Acts:**
  - `Shell Boo` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Jeering heckle.
  - `Cheap Seat Heckle` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `-15% Atk` (2t).
  - `Standing Boo-vation` (`Racket`, 1.1x, Rec 120, all allies, `[aoe, charge_up]`): Rowdy balcony chorus (`Fatigue` 2t).

#### 32. `twigspy` | Twig Spy
- **Role & Row:** `Skirmisher` | `Back` (behind Front `acornagent`) | **Stats:** HP 228, Atk 55, Def 27, Spd 125, Pep 0, Pips 0
