We are continuing game design and system architecture for my turn-based JRPG titled **The Adventures of Tom**. This is the **v11 Vibe Shift & Battle System Spec**: a Final Fantasy V-style job switching system ("Vibes"), a tick-based turn timeline with 100-tick rounds, a 0–10 Pep economy with a refund cap, Composure pip-breaking with a per-action cap, and 5 damage flavors with Prime -> Detonate reactions.

Please read and absorb this entire specification as our locked ground-truth rules for game mechanics, character rosters, and ability kits. Where a kit line in Section 3 and a rule in Sections 1–2 seem to disagree, Sections 1–2 win.

v11 (2026-11-18) applies the balance check of v10. Every change is listed in `claude/battle-v11-changelog.md`. It reads with `claude/bestiary-v11.md`.

---

# THE ADVENTURES OF TOM: JRPG BATTLE SYSTEM & ROSTER SPEC (v11 FULL DIRECTORY)

## 1. Dual-Track Progression & Loadout Architecture

- **Track 1: Character Level (Lv 1 -> 50 via XP).** Raises base HP, Attack, Defense, and Speed smoothly across the 20-chapter campaign. All ten characters share XP whether or not they are in the fight. Because damage and healing scale with Character Level, Rank 1 skills stay useful, fast, low-Pep staples all the way to Chapter 20.
- **Track 2: Vibe Mastery (Rank 1 -> 5 ★ via Vibe Points / VP).** Every character has all 3 Vibes unlocked at Rank 1 (0 VP) from the day they join and switches freely outside battle.
  - **Who earns VP:** after every battle, every character earns VP, in the party or on the bench. The equipped **Main Vibe** earns full VP. The equipped **Pocket Vibe** earns half.
  - **Overflow:** a mastered Vibe keeps nothing. If the equipped Main or Pocket Vibe is already mastered, its share goes to that character's lowest unmastered Vibe instead, so equipping a mastered Vibe never wastes VP.
  - **VP budget:** one chapter pays about **90 Main VP** (about 6 normal fights at 10 VP plus one boss at 30 VP). If a chapter has more or fewer fights, scale VP per fight so the chapter still pays about 90.
  - **Pacing this produces:** first Vibe mastered around Chapter 9, all three mastered around Chapter 18 (2,400 VP at 135 per chapter).
  - **Late joiners:** arrive at the Character Level of the highest-level party member, with a VP pool equal to the most total VP any one character has earned so far. The player splits that pool once across the newcomer's three Vibes.
- **The 5 Ranks and 3-Tier Subtitles:**

| Rank | VP | Reached around | Unlocks |
|---|---|---|---|
| 1 | 0 | On joining | Tier-1 comical Subtitle, Innate Trait, Basic Action (0 Pep, gains +2 Pep), Skill 1 (2–3 Pep) |
| 2 | 60 | Chapter 1 | Skill 2 (3–4 Pep counter, barrier, stance, or timeline control) |
| 3 | 220 | Chapter 3 | Tier-2 pro Subtitle + Quirk A |
| 4 | 450 | Chapter 5 | Skill 3, the Grand Capstone (5–6 Pep screen-filling spectacle) |
| 5 ★ | 800 | Chapter 9 | Tier-3 master Subtitle ★ + Quirk B |

- **The 4 Loadout Slots:**
  - **Main Vibe:** gives its Trait, its Basic Action, its unlocked Skills and its Stat Lean.
  - **Pocket Vibe:** adds the unlocked Skills (not the Basic, not the Trait) of a second Vibe.
  - **Quirk Slot 1 and Quirk Slot 2:** any two Quirks this character has unlocked, from any of their own three Vibes.
  - The two Vibes listed as *Sig* in each character heading are that character's default Main and Pocket on joining.
- **Stat Leans:** every Vibe lists one Lean. It applies only while that Vibe is the Main Vibe.

| Lean | Bonus as Main Vibe |
|---|---|
| Guard | +15% Max HP and +15% Defense |
| Striker | +15% Attack |
| Tempo | +15% Speed |
| Support | +15% to heals and shields given |

- **Portable Counters:** some Skills read a counter that their Vibe's Trait builds (Tom's *Oven Temp*, Amy's *Reps*, Boppy's *Whopper Tally*, Olivia's *Mom Prep* and *Cadence*, Nara's *My Toy* mark). When such a Skill is equipped through the Pocket Vibe, its counter comes with it and builds by the same rule the Trait states. The Trait's other bonuses (for example the Speed from Reps) apply only when that Vibe is the Main Vibe. Stances that only a Basic Action grants (Grace's *Airborne*) are Main Vibe only.
- **Casual Mode ("Freelancer"):** the endgame reward. A character unlocks it on mastering all three of their Vibes (around Chapter 18). It is a fourth Vibe with no Skills of its own, and there is no VP left for it to earn. As Main Vibe it gives two Pocket Vibe slots instead of one, the Basic Action of the player's choice from that character's Vibes, and all three of that character's Traits. It has no Stat Lean.

---

## 2. Core Combat Rules

### 2.1 Party and field

- **Party:** 4 active characters. The rest sit on the bench. Swapping happens outside battle only, with one exception: in the last fight of the game the player picks the 4 again at each phase change (see the last boss in the bestiary). A character coming into that fight for the first time arrives at full HP with 4 Pep. One who was in it earlier returns with the HP and Pep they left with. Either way they join the turn bar waiting 100 x 100 / Speed ticks.
- **Rows:** each side has a Front row and a Back row. The party may split 4 characters any way with at least 1 in Front. Back-row units take 20% less single-target Clobber damage. "Pulled forward" moves a Back-row foe to Front. An enemy act can move allies between rows only as a trade, one Front ally for one Back ally, so the Front is never left empty. If either row has nobody to trade, no one moves.
- **Adjacent:** each side stands in one line of numbered slots. Two units are adjacent when their slots are next to each other.
- **Mix:** two different allies hitting the same foe with two different flavors inside one round. Earlier drafts called this a "cross-lane combo". There are no lanes.
- **Roster:** the rules work with any number of recruited characters. A character who has not joined, or who is out of the party for story reasons (Tom included), changes nothing here.
- **Enemies:** stat lines, Pet Peeves and behavior are set per enemy in the bestiary, outside this spec. Every Elite and Boss has 1 or 2 Pet Peeves (flavors it is weak to).

### 2.2 Timeline, turns and rounds

- **Turn bar:** a visible bar shows who acts next. After acting, a unit waits **Recovery Ticks = the move's Base Recovery x 100 / Speed**. Average Speed is 100.
- **Base Recovery:** Basic Action 80, Skill 100, Grand Capstone 120. "X% faster or slower Recovery Ticks" changes this number.
- **Round:** a 100-tick window, marked on the bar by a divider. "1/round" effects reset at each divider. Durations written in rounds count dividers.
- **Turn:** durations written as "1t", "2t" or "turns" count the affected unit's own turns.
- **Push and pull:** "X% on the timeline" means X ticks. A push adds ticks to a foe's wait. A pull removes ticks from an ally's wait. A swap of timeline positions pushes the foe and pulls the ally by the gap between them, and each half follows the rules for pushes and pulls. A Skill that places an ally at a set spot on the bar (NeeDoh Stretch Pass) is a pull, and can move each ally once per round.
- **Diminishing returns:** each further push on the same foe inside one round is halved (35, then 17.5, then 8.75). Each further pull on the same ally inside one round is halved the same way.
- **Flustered foes:** a Flustered foe (2.7) cannot be pushed again until its next turn begins.
- **Granted actions:** a unit can receive only one granted or bonus action per round (Burpee Blitz's mini-turn, Colossal Diamond-Gold Dumpling).

### 2.3 Pep

- Every character has their own Pep, from 0 to 10. Everyone starts each battle at **4 Pep**.
- Basic Action costs 0 and gains **+2 Pep**. Skills cost 2–6 Pep.
- Triggering a Detonation gains +1 Pep. Intercepting a hit for an ally gains +1 Pep.
- **Refund cap:** from all sources other than their own Basic Action (gifts from allies, refunds, Quirks, Detonations, intercepts), a character can gain at most **+3 Pep per round**. Extra Pep is lost.
- Cost reductions cannot take a Skill below 1 Pep.

### 2.4 Damage, healing and caps

- **Damage = Attack x Skill Power x 100 / (100 + target Defense) x modifiers.**
- **Skill Power tiers:** light 0.5, standard 1.0, heavy 1.6, capstone 2.2. An AoE (hits all foes or a row) uses 70% of its tier.
- **Pet Peeve and Resist:** a hit with a flavor that is the foe's Pet Peeve does 1.5x damage. A hit with a flavor the foe Resists does 0.65x. Each is its own kind of modifier, so it multiplies, and it does not count toward the +100% outgoing bonus cap.
- **Crits:** base Crit Rate 5%, Crit Damage x1.5.
- **Healing:** stated as a percent of the target's Max HP. Unlabelled heals are: tiny 5%, small 10%, standard 20%, moderate party heal 15% each.
- **Stacking:** bonuses of the same kind add together. Bonuses of different kinds multiply.
- **Caps:** outgoing damage bonus +100%. Damage reduction 60%. Evasion 60%. Shields on one unit 40% of Max HP in total. Battle-long Defense cracks on one foe 25% in total.
- **Shields** absorb damage before HP and last 3 turns unless the Skill says otherwise.

### 2.5 Flavors and Primes

- **5 Damage Flavors:** `Clobber` (physical), `Sizzle` (heat), `Drench` (water), `Razzle` (light and voltage), `Racket` (noise and scolding), plus `Support` (no damage).
- **3 Primes**, each lasting 2 of the foe's turns:

| Prime | Applied by | Effect while it lasts |
|---|---|---|
| **Toasty** | Sizzle | Burn: light Sizzle damage at the start of each of the foe's turns |
| **Drenched** | Drench | -15% Speed |
| **Dazzled** | Razzle | Attacks against it gain +15% Crit Rate |

- Clobber and Racket never apply a Prime. They only detonate.
- A foe can hold more than one Prime at once.
- A hit that triggers a Detonation does not also apply its own Prime.
- **Two-flavor moves** (written like Drench/Clobber): the first flavor resolves first, then the second. Its damage is split half and half between the two flavors unless the Skill says otherwise, and each half meets the foe's own Pet Peeve or Resist for that flavor. Each can trigger a Detonation, within the one-per-target limit. The move applies the first flavor's Prime only if it detonated nothing on that target.
- One action triggers at most one Detonation per target, on the oldest matching Prime, unless the Skill says it detonates all.

### 2.6 Detonations

Each Detonation consumes the Prime, gives the attacker +1 Pep and shaves Composure as listed.

| Detonation | Recipe | Effect | Composure |
|---|---|---|---|
| **Steam Cloud!** | Toasty + Drench, or Drenched + Sizzle | Blinds the foe's next single-target attack | -2 |
| **Panic Boil!** | Toasty + Racket | Drops the foe's guard or counter stance | -1 |
| **Hydro-Slip!** | Drenched + Clobber | Pushes the foe back 25% on the timeline | -1 |
| **Short Circuit!** | Drenched + Razzle | 40% splash voltage to adjacent foes | -2 |
| **Shatter Glitz!** | Dazzled + Clobber | Strips 1 positive buff | -1 |
| **Sensory Overload!** | Dazzled + Racket | -25% foe outgoing damage for 2 turns | -1 |

### 2.7 Composure and Break

- Elites and Bosses have 4–8 Composure pips.
- **What shaves pips:**
  - A hit with a flavor that is the foe's Pet Peeve: -1 pip per action (not per hit of a multi-hit).
  - A Detonation: the amount in the table above.
  - A Skill or Quirk that prints a Composure number: that number. Skills 1 and 2 and Quirks print 1, rising to 2 only where the line says so (when the same action hits a Pet Peeve or triggers a Detonation). Grand Capstones may print 2.
- **Cap:** one action can shave at most **3 pips** in total from one foe, from all sources combined. Pips a foe loses because the action knocked out one of its helpers count inside this cap.
- **0 pips = Flustered:** the foe is moved behind every unit waiting inside the next 100 ticks (this ignores diminishing returns), loses any telegraphed act it was charging, takes +35% damage and loses its counter-auras until its next turn begins. While Flustered it cannot be pushed any further. Its pips then refill, and it cannot lose pips until that turn ends. A foe always gets that turn.

### 2.8 Aggro and statuses

- **Aggro:** a foe's single-target attack picks its target by weight. Front-row characters weigh 100, Back-row 60. "+X% aggro" raises that character's weight by X%. A taunt or "locks aggro" forces single-target attacks onto that character for the stated time.
- **Common statuses** (2 turns unless stated):

| Status | Effect |
|---|---|
| Slow | -20% Speed |
| Stun | Loses its next turn. Bosses lose 30 ticks instead |
| Blind | Its next single-target attack misses |
| Fatigue | +20% Recovery Ticks |
| Bleed | Light Clobber damage at the start of each turn |
| Guard Stance | 25% less damage taken. Tom's Priority Boarding and enemy stances both use it |
| Accuracy down | "-X% accuracy" on a foe: each of its attacks has an X% chance to miss |
| Mental | The group name for Stun, Spooked, taunts and Skill locks. A "mental cleanse" removes these |

- **Screen rule:** each unit shows at most 3 status icons (its Prime, its strongest debuff, its strongest buff). Tapping the unit opens the full list. Counters (Reps, Tally and so on) show as a number on their owner's portrait.

### 2.9 KO and revive

- **Pick-Me-Up** (4 Pep, Support): every character has this command in every Vibe. It revives a knocked-out ally at 25% HP. Deedee's and TNB's own revive Skills are stronger and stay as written.
- After a won battle, knocked-out characters stand back up at 1 HP.

### 2.10 Family Ruckus

- **Gauge (0–100%):** one meter shared by the party. It keeps its value between battles.
- **What fills it:** a Mix +5%, a Detonation +8%, each hit after the first in a multi-hit move +1%, a Break +15%.
- **Dual Ruckus:** on an ally's turn, if the next unit on the bar is also an ally, the pair may spend the gauge in place of the first ally's action. It costs 0 Pep and does not use up the second ally's coming turn.

| Spend | Name | What happens |
|---|---|---|
| 50% | **Double Team** | Both use their Main Vibe's Basic Action on one foe at +50% power. Both flavors count, so the pair can Prime and Detonate by themselves. |
| 100% | **Full Family Ruckus** | Both fire their highest unlocked Main Vibe Skill at no cost as one action. The Composure cap for this action is 4 pips. |

- Every pair works by this rule, so no pair needs a custom combo. Pairs that include Tom may later get their own name, line and animation on top of it.

---

## 3. All 10 Playable Character Kits & 30 Finalized Vibes (v11 Full Detail)

### 1. TOM: The Designated Uncle *(Sig: Frequent Flier + Gamer Geek)*
- **Vibe 1: Frequent Flier** (Intercept Guardian / Aggro Paladin; Clobber/Racket)
  - Subtitles: `Sky Club Applicant` -> `Diamond Medallion` -> `Delta 360° VIP ★`
  - Visual Arc: Smug lounge-pass flashes & Zone 1 boarding blocks escalate into sliding Delta One suite doors and climax with an invite-only tarmac Porsche screeching across the battlefield.
  - Lean: Guard
  - Trait `Priority Boarding`: Starts battle in Guard Stance (1t); takes 20% less damage when intercepting hits for allies <50% HP.
  - Basic `Lounge Pass Flex` (Racket, +2 Pep): Flashes VIP Sky Club pass & clanks metal brag tag for light Racket damage + Eyes On Me (+50% aggro 1t).
  - R1 `Zone One Blockade` (2 Pep, Clobber): Steps in front of gate-rushers with a hard-shell carry-on: 2-turn ward hip-checks any physical or projectile attack for Clobber + -1 Composure.
  - R2 `Suite Door Slide` (3 Pep, Support): Slides sleek Delta One pod doors shut around adjacent allies for 2 turns, redirecting single-target hits to Tom at -35% damage.
  - R3 Quirk A `Upgrade Certificate`: Each redirected hit Tom takes stamps 1 Certificate (max 3); next Clobber skill cashes all Certificates for +20% bonus damage each.
  - R4 `Tarmac Porsche Transfer` (5 Pep, Racket): Summons Delta 360° black Porsche SUV onto tarmac: heavy AoE high-beam & jet-wash Racket damage, strips 1 buff, locks aggro.
  - R5 Quirk B `Million-Miler Status`: Counterattacks and intercepts shave +1 extra Composure & pull Tom 10% forward on timeline.
- **Vibe 2: Gamer Geek** (Console Trickster / Spellblade Striker; Razzle/Clobber)
  - Subtitles: `Button Smasher` -> `Pro Controller Owner` -> `Epic Completionist ★`
  - Visual Arc: Retro cartridge-blowing and flying controllers escalate into buzzing winged-shell traps and culminate in a screen-wide Konami Code cheat barrage.
  - Lean: Striker
  - Trait `Gamer's Intuition`: Deals +20% damage against enemy Pet Peeves or Primed States, and builds +5% extra Family Ruckus on Detonations.
  - Basic `Cartridge Blow` (Racket, +2 Pep): Blows dust out of a retro cartridge (`PFFFFT`) for light Racket chip and highlights enemy's next intended target.
  - R1 `Controller Toss` (2 Pep, Clobber): Hurls controller (wrist-strap trailing) like a boomerang for Clobber damage; +40% bonus damage if Tom took or blocked a hit since last turn.
  - R2 `Winged Shell Lock-On` (4 Pep, Clobber): Smacks foe + hovers blue winged shell overhead; if they attack before Tom's next turn, slams down in a free Razzle explosion.
  - R3 Quirk A `Elixir Hoarder`: Starting turn at 6+ Pep grants +15% Speed and +15% Crit Rate.
  - R4 `Konami Code` (6 Pep, Razzle): Flashes `↑ ↑ ↓ ↓ ← → ← → B A` across screen: Tom glows rainbow-invincible as pixel fireballs, starbeams, and retro meteors rain on all foes (-2 Composure; +15% Crit Rate per Prime on each foe).
  - R5 Quirk B `New Game Plus`: Triggering a Detonation or Counterattack reduces Pep cost of Tom's next skill by 2 (once/round; only on Skills costing 4 Pep or less, so never on a Grand Capstone).
- **Vibe 3: Star Baker** (Culinary Alchemist / Shield & Regen Chemist; Sizzle/Drench)
  - Subtitles: `Underproofer` -> `Stand-Mixer Pro` -> `Grand Pâtissier ★`
  - Visual Arc: Splashing bubbly sourdough starter and sliding sheet-pan treats escalates into 500°F Dutch-oven boule bakes and finishes with a towering three-tier celebration cake blazing with sparkler candles.
  - Lean: Support
  - Trait `Preheated Oven`: Oven Temp rises +1 Stage after Tom's turn (max 3), adding +10% outgoing healing and Sizzle potency per stage.
  - Basic `Starter Splash` (Drench, +2 Pep): Tosses bubbly 3-day primed sourdough starter for Drenched on foe OR extends an active buff/regen by 1 turn.
  - R1 `Sheet-Pan Bribe` (2 Pep, Support): Slides warm cinnamon roll or cookie square to an ally: heals now, triggers Sugar Kick in 2 turns for 2nd heal & +2 Pep.
  - R2 `Five-Hundred-Degree Boule` (4 Pep, Sizzle): Uncovers roaring 500°F Dutch oven for AoE Sizzle (Toasty) + coats allies in 10% Max HP golden-crust shield per Oven Temp stage.
  - R3 Quirk A `Parchment Lined`: Using a heal, shield, or support skill cuts Tom's Recovery Ticks on that turn by 25%.
  - R4 `Three-Tier Showstopper Cake` (5 Pep, Sizzle): Rolls out frosted three-layer cake blazing with sparklers: heals party, cleanses debuffs, infuses allies' next attacks with bonus Sizzle.
  - R5 Quirk B `Caramelized Crust`: Whenever a Tom-applied shield or heal-over-time breaks or expires, sugar-glass crust shatters for moderate Sizzle damage on attacker.

### 2. GRACE: The Nine-Year-Old Triple Threat *(Sig: Squishy Collector + Craft Artist)*
- **Vibe 1: Stage Performer** (Aerial Acro-Dancer / Critical Finisher; Clobber)
  - Subtitles: `Back-Row Dancer` -> `Recital Soloist` -> `Spotlight Headliner ★`
  - Visual Arc: Living-room cartwheels and jazz-square warmups grow into balance-beam pirouettes and finish in a Broadway-meets-Olympics spotlight dismount.
  - Lean: Striker
  - Trait `Choreographed Momentum`: +25% damage when leaping past 2+ timeline icons since last turn; Airborne/Grounded stances.
  - Basic `Five-Six-Seven-Eight!` (Clobber, +2 Pep): Snaps an eight-count dance pose and springs into Airborne stance (evades ground sweeps).
  - R1 `Jazz-Hands Cartwheel` (2 Pep, Clobber): Cartwheels past foe in dining-car routine, dealing Clobber damage and trading places on the timeline with the next enemy due to act: it is pushed and Grace is pulled by the gap between them, 25 ticks at most.
  - R2 `Good-Scrunchie Pirouette` (3 Pep, Support): Ties hair up with the good scrunchie and spins onto toes: grants Poise (+50% Crit Rate next skill, pushback immune) + 30% turn advance.
  - R3 Quirk A `Standing Ovation`: Critical hits trigger stage applause, refunding 1 Pep & pulling next turn forward 15%.
  - R4 `Grand Jeté Spotlight Finale` (6 Pep, Clobber): Theatre spotlights and flashbulbs converge on a split-leap triple-twist dismount; +50% Crit Damage from Airborne, -2 Composure.
  - R5 Quirk B `Encore Poise`: Single-attack buffs retain half their bonus for 1 additional turn after firing.
- **Vibe 2: Craft Artist** (Multi-Element Saboteur / Status Hexer; Razzle/Racket)
  - Subtitles: `Finger-Paint Dabbler` -> `Serial Bedazzler` -> `Grand Mixed-Media Master ★`
  - Visual Arc: Squeaky beginner violin practice and glitter-brush flicks escalate into hot-glue rhinestone hazards and climax in a giant easel masterpiece exploding with neon paint and gems.
  - Lean: Striker
  - Trait `Creative Mess`: Applying any Primed State or debuff splatters 25% Razzle glitter-paint damage onto adjacent foes.
  - Basic `Glitter-Brush Flick` (Razzle, +2 Pep): Whips wet watercolor and craft glitter off paintbrush at foe (Dazzled).
  - R1 `Open-String Violin Screech` (3 Pep, Racket): Drags rosin-heavy bow horribly across all four strings: AoE Racket that detonates Dazzled and cuts enemy Attack by 20% (2 turns).
  - R2 `Bedazzle-Gun Glue Trap` (4 Pep, Sizzle): Coats enemy floor in hot glue, googly eyes, and rhinestones for 2 rounds; acting foes take Sizzle/Razzle chip + +20% Recovery Ticks.
  - R3 Quirk A `Permanent Marker`: Written in pen: any Primed State Grace inflicts lasts +1 extra enemy turn.
  - R4 `Masterpiece Portrait Makeover` (5 Pep, Razzle): Flips giant canvas portrait and blasts target with watercolor waves and gems, forcing temporary Razzle Pet Peeve weakness (2t).
  - R5 Quirk B `Double Coat`: Alternating between Razzle and Racket skills triggers free mini-detonation (-1 Composure).
- **Vibe 3: Squishy Collector** (Tactician / Timeline & Stress-Relief Buffer; Clobber/Racket)
  - Subtitles: `NeeDoh Molder` -> `Dumpling Squeezer` -> `Golden Squishy Keeper ★`
  - Visual Arc: Squeezing mini bamboo-steamer dumplings and stretchy gel balls escalates into loud sugar-crunch cubes and culminates in dropping a house-sized diamond-gold soup dumpling.
  - Lean: Tempo
  - Trait `Sensory Satisfying`: Allies acting immediately after Grace on timeline gain +15% skill potency.
  - Basic `Soup-Dumpling Squeeze` (Clobber, +2 Pep): Squeezes mini soup-dumpling squishy (`squish-pop!`) to bounce foe; next ally to hit that foe gains +1 Pep.
  - R1 `NeeDoh Stretch Pass` (3 Pep, Support): Tosses neon gel NeeDoh ball to ally for stress-melting squeeze, pulling them directly behind Grace on timeline with +20% Speed (2t). Each ally can be moved this way once per round.
  - R2 `Crunchy Sugar-Cube Pop` (4 Pep, Racket): Crushes ultra-loud crispy ice-cube gel squishy beside enemy, interrupting charge-ups and pushing them back 30% on timeline.
  - R3 Quirk A `Slow-Rise Memory Foam`: Moving any unit on timeline rebounds Grace into shape (+15% Evasion until next turn).
  - R4 `Colossal Diamond-Gold Dumpling` (6 Pep, Support): Unlatches giant sky-steamer to drop house-sized Sparkling Diamond Gold Soup Dumpling Squishy; target ally immediately takes any skill costing up to 4 Pep for free (Grace and that ally each gain +1 Pep; counts as the ally's one granted action this round).
  - R5 Quirk B `Ultra-Rare Limited Edition`: Only two in the world: skills targeting allies have 30% faster Recovery Ticks for Grace.

### 3. ROSE: The Six-Year-Old Whirlwind (& Both Lambies) *(Sig: Sugar Rush + Cozy Rosie)*
- **Vibe 1: Prankster** (Trickster / Composure & Stance Disruptor; Racket)
  - Subtitles: `Giggle Bug` -> `Twin-Lamb Trickster` -> `Master of Mischief ★`
  - Visual Arc: Sneaky nose boops and cheek-flapping raspberries escalate into bait-and-switch ambushes using spotless Backup Lamby and finish with a trampoline-sized pink whoopee cushion going off under the whole enemy side.
  - Lean: Tempo
  - Trait `Too Loud for Secrets`: Enemies below 50% Composure are so rattled by Rose's volume that they deal 20% less damage to her.
  - Basic `Sneaky Nose Boop` (Racket, +2 Pep): Rose darts up and boops a monster right on the nose herself, stealing 10% Speed (1t).
  - R1 `Supersonic Raspberry` (2 Pep, Racket): Cheek-flapping raspberry; shaves 1 Composure if enemy is preparing heavy attack (2 on a Pet Peeve hit or Detonation).
  - R2 `Backup-Lamby Bait & Switch` (4 Pep, Racket): Spotless Backup Lamby set down as bait while Rose & tattered Lamby hide untargetable; leaps out next turn roaring *"BOOOOO!"* for Racket + 35% pushback.
  - R3 Quirk A `Nana's Card Trick`: Cheating at cards just like Nana taught her: delaying an enemy's turn steals 1 minor buff or tosses +1 Pep candy to a random ally.
  - R4 `Mega Whoopee-Cushion Trap` (5 Pep, Racket): Slides a trampoline-sized pink whoopee cushion under the entire enemy side for an earth-shaking, tuba-blasting *PFFFFRT!* shockwave: AoE Racket damage that embarrasses foes out of active stances and fumbles multi-hits (-25% Atk & -1 Composure on bosses).
  - R5 Quirk B `Upside-Down Pilot Wings`: Wearing pilot wings upside down on purpose: at 8+ Pep, Rose's skills completely ignore enemy shields and guard stances.
- **Vibe 2: Sugar Rush** (Ricochet Brawler / Multi-Hit Ruckus Builder; Clobber/Sizzle)
  - Subtitles: `Ankle Tackler` -> `Shoulder Jockey` -> `Human Pinball ★`
  - Visual Arc: Shin-tackles with tattered Lamby tucked like a football grow into shoulder-ride launches and climax with Rose and both Lambies riding a runaway library return cart.
  - Lean: Striker
  - Trait `Bouncy Physics`: Each individual hit of a multi-hit move builds +2% Family Ruckus Gauge.
  - Basic `Lamb-Tuck Ankle Tackle` (Clobber, +2 Pep): Tucks worn Lamby under one arm for fast 2-hit shin pounce.
  - R1 `The Floor Is Lava!` (3 Pep, Clobber): Hops 3 times across imaginary sofa cushions onto random foes; +25% dmg/bounce vs Toasty/Dazzled.
  - R2 `"Giddyup, Tata!" Launch` (4 Pep, Sizzle): Climbs onto ally's shoulders (strapping tiny goggles on Lamby) to grant +20% ally Atk before cannonballing foe for heavy Clobber + Sizzle friction.
  - R3 Quirk A `Twin-Lamb Relay`: Clean Backup Lamby tags in mid-bounce so multi-hit skills trigger weapon/elemental enchantments on every hit at 40% power.
  - R4 `Double-Lamby Return-Cart Blitz` (6 Pep, Clobber): Rose, tattered Lamby, and spotless Backup Lamby pile into library book-return cart and launch off neon ramp for 6 ricochet hits (+10% escalating dmg/hit vs Flustered).
  - R5 Quirk B `"It's OUR Longboard Now"`: Claiming TNB's board: landing 3+ hits in 1 turn grants Rose +25% Speed (1t).
- **Vibe 3: Cozy Rosie** (Plushie Warder / Barrier & Delayed-Burst Healer; Sizzle/Clobber)
  - Subtitles: `Blanket Burrito` -> `Fort Architect` -> `Keeper of the Two Lambies ★`
  - Visual Arc: Snuggling threadbare Lamby and throwing him while holding Backup Lamby grows into couch-cushion citadels and ends in a star-lit twin-plushie blanket kingdom.
  - Lean: Support
  - Trait `Well-Loved Original`: Clutching worn, tattered Lamby restores +1 Pep every 2 rounds.
  - Basic `Pocket Pretzel & Pat` (Clobber, +2 Pep): Bonks foe with Lamby + hands slightly squished pocket pretzel to lowest-HP ally for tiny heal.
  - R1 `Tattered Lamby Boomerang` (2 Pep, Clobber): Hurls scruffy Lamby to mark foe (holding clean Backup Lamby meanwhile!) -> free fast "Give Lamby Back!" 2x Clobber tackle + self-shield.
  - R2 `Sofa-Cushion Citadel` (3 Pep, Support): Stacks cushions and blankets into 25% Max HP party pillow fort with both Lambies as lookouts, blocking timeline pushback (3-round cooldown).
  - R3 Quirk A `Mint-Condition Backup`: Spotless Backup Lamby reinforces Rose's shields, granting +20% Crit Resistance to shielded allies.
  - R4 `Kingdom of Ten-Thousand Blankets` (5 Pep, Sizzle): Star-lit sleepover castle guarded by giant plushies of both Lambies; heals ally 60% HP, cleanses all, erupts in AoE Sizzle warmth wave next turn.
  - R5 Quirk B `Emergency Stuffy Swap`: When any Rose-applied shield breaks, Backup Lamby springs from backpack for free counter-bonk (1/round).

### 4. AMY: The Fitness Queen & Classroom General *(Sig: Fitness Queen + Classroom Boss)*
- **Vibe 1: Fitness Queen** (Tempo Striker / Extra-Turn HIIT Engine; Clobber)
  - Subtitles: `Living-Room Lunger` -> `Home-Gym Regular` -> `Undefeated HIIT Icon ★`
  - Visual Arc: Swinging kettlebells on a yoga mat and dropping into rapid-fire burpees escalates into brisk road runs and finishes in a multi-station home-gym & workout-video burnout circuit.
  - Lean: Tempo
  - Trait `Workout Streak`: Consecutive active turns build +1 Rep (max 4: +5% Speed & +5% Clobber/stack).
  - Basic `Kettlebell Swing` (Clobber, +2 Pep): Crisp two-handed kettlebell swing +1 Rep with ultra-fast recovery.
  - R1 `Burpee Blitz` (2 Pep, Clobber): Lightning-fast burpee jump-kick; at 3+ Reps, grants immediate Bonus Mini-Turn for Basic or 2-Pep skill (1/round; counts as Amy's one granted action this round).
  - R2 `Pace-Partner Run` (3 Pep, Support): Calls chosen ally onto brisk outdoor run beside her, matching Speed (2t).
  - R3 Quirk A `"Walk It Off, Hydrate"`: Reaching 4 Reps (or every 3rd turn) restores 20% HP & +1 Pep.
  - R4 `Follow-Along Finale Burnout` (6 Pep, Clobber): Workout stream countdown; spends all Reps (+25% dmg/stack) for piercing AoE Clobber + -20% ally Recovery Ticks.
  - R5 Quirk B `Active Recovery`: 1/round, skills <=2 Pep have 40% faster Recovery Ticks.
- **Vibe 2: Classroom Boss** (Classroom Coach / Debuffer & Buffer; Racket/Razzle)
  - Subtitles: `Recess Monitor` -> `Four-Tab Planner` -> `Teacher of the Year ★`
  - Visual Arc: A five-beat attention clap and flipping color-coded binder tabs grows into sparkling gold-star stickers and climaxes with a calm teacher hush and classroom light reset.
  - Lean: Support
  - Trait `"I'm Counting to Three"`: Foe acting twice before an ally acts gets Detention (-20% Atk & -1 Composure).
  - Basic `"Eyes on Me" Clap` (Racket, +2 Pep): Classic 5-beat elementary attention clap (*clap-clap, clap-clap-clap!*) for sharp Racket chip that strips 1 minor Spd/Eva buff.
  - R1 `Four-Tab Binder` (3 Pep, Racket): Slams open color-coded 3-inch binder to mark foe (2t); the first time allies hit it with 2 different flavors, it loses 1 Composure (2 if either hit struck a Pet Peeve or detonated) & each party member gains +1 Pep.
  - R2 `Gold-Star Sticker` (3 Pep, Razzle): Slaps giant sparkling gold star onto ally for +35% potency & guaranteed accuracy.
  - R3 Quirk A `"Good Try" Margin Note`: Allies breaking an Amy-debuffed foe heal 15% HP & +1 Pep.
  - R4 `Classroom Lights-Out Reset` (5 Pep, Racket): Flicks overhead classroom lights off with calm teacher hush (*"Lights off, everybody reset"*); AoE Racket locks foes out of AoEs (1t) & refreshes ally buffs.
  - R5 Quirk B `Never Late Once`: Amy's buffs pull target ally 15% forward on timeline.
- **Vibe 3: SuperMom** (Emergency Guardian / Party Protector & Belter; Drench/Racket)
  - Subtitles: `Double-Cold-Brew Driver` -> `Ford Explorer Captain` -> `Unstoppable Mama ★`
  - Visual Arc: Tossing backup iced coffees and throwing a mom-arm across car seat escalates into snack breaks and ends in a roof-shaking Broadway vocal belt.
  - Lean: Guard
  - Trait `Eyes in the Back of Her Head`: Jumps 25% forward when ally drops <35% HP (2-round CD).
  - Basic `Backup Iced Coffee` (Drench, +2 Pep): Drench splash on foe OR +15% Spd + small heal on ally.
  - R1 `Mom-Arm Seatbelt Stop` (2 Pep, Clobber): Fast protective lunge across the formation, halving incoming AoE damage on 2 allies.
  - R2 `Dairy-Free Snack Pack` (4 Pep, Support): Passes out fruit leather, apple slices, and dairy-free protein bites for moderate party heal + slow/fatigue cleanse.
  - R3 Quirk A `Emergency Purse Tissue`: +35% healing potency on allies <40% HP.
  - R4 `Act-One "Inside Voice" Belt` (5 Pep, Racket): Chandelier-rattling vocal belt: heavy AoE Racket damage + party +25% Defense & status immunity (2t).
  - R5 Quirk B `The Rivituso Rule`: +1 Pep whenever an ally takes a critical or heavy unshielded hit (1/round).

### 5. DEEDEE: The Nurse Matriarch & Home Cook *(Sig: Neat Freak + Registered Nut)*
- **Vibe 1: Registered Nut** (Clinical Medic / Overheal Shielder & Reviver; Sizzle)
  - Subtitles: `Band-Aid Dispenser` -> `Forty-Year Floor Nurse` -> `Matron of Moon & Back ★`
  - Visual Arc: Squinting for reading glasses already on head and swabbing alcohol pads escalates into bundling kids in warm jackets and culminates in radiant full-moon revival embrace.
  - Lean: Support
  - Trait `Forty Years a Nurse`: 50% overhealing converts into Clean Bill Shield up to 25% Max HP.
  - Basic `"Little Pinch!" Syringe Poke` (Clobber, +2 Pep): Swabs with alcohol pad and jabs foe with a brisk nurse shot, exposing +15% Crit taken (1t).
  - R1 `Deedee Makes It Better` (2 Pep, Support): *"Come here, Deedee makes it better!"*: snappy single heal + full cleanse (+20% Atk if debuff cleared).
  - R2 `"Bring a Jacket!" Ward` (4 Pep, Support): Bundles 2 allies in extra jackets for 20% HP regen (3t) + once-per-cast 1 HP fatal KO protection (3-round cooldown).
  - R3 Quirk A `First-Ring Pickup`: Skills targeting allies <50% HP cost 1 less Pep (min 1).
  - R4 `To the Moon & Back` (6 Pep, Sizzle): Full moon rises overhead: 80% revive or 100% heal + warm Sizzle shockwave shaving 2 Composure.
  - R5 Quirk B `"Warm Beats Cold"`: Nurse's wisdom: immune to stun/slow; cleansing an ally heals Deedee 10% HP.
- **Vibe 2: Home Cook** (Feast Hostess / Party Regen & Pep Battery; Sizzle/Drench)
  - Subtitles: `Muffin-Tin Baker` -> `Sunday-Roast Pro` -> `Holiday Feast Matriarch ★`
  - Visual Arc: Sneaking sweet samples off wooden spoon grows into pulling fresh tins of warm apple muffins from oven and culminates in rolling out 8-seat Sunday dinner table.
  - Lean: Support
  - Trait `"Did You Eat?"`: Nobody leaves kitchen hungry: allies holding Stuffed buff deal +15% dmg & take 10% less dmg.
  - Basic `Wooden-Spoon Taste Test` (Sizzle, +2 Pep): Warm Sizzle smack + sneaks sweet sample bite to random ally (Stuffed 2t).
  - R1 `Warm Apple Muffins` (3 Pep, Sizzle): Pulls steaming tin of cinnamon-apple muffins from oven: party heal + Stuffed (melee attackers take Sizzle burn).
  - R2 `Wine O'Clock Pour` (3 Pep, Drench): Splashes row Drench on foes while pouring morale boost (+2 Pep to target ally, -10% Eva 1t).
  - R3 Quirk A `Tupperware Send-Off`: Stretching dishes: single heals/buffs bounce at 50% to 2nd ally (35% chance; 100% at 8+ Pep).
  - R4 `Full-House Sunday Dinner` (6 Pep, Support): Sets full 8-seat family table (plus one extra place!) for 2 rounds; every ally turn starts with 15% heal, +1 Pep, random boost.
  - R5 Quirk B `"Everything Gives Me Gas"`: *"And I eat it anyway!"*: when Stuffed expires on an ally, bursts for +1 Pep to that ally.
- **Vibe 3: Neat Freak** (Buff-Stripper / Hazard & Drench Controller; Drench/Clobber)
  - Subtitles: `Crumb Spotter` -> `Mop Marshal` -> `Supreme Dust Terminator ★`
  - Visual Arc: Blue Windex spray-bottle squirts and wet-floor signs escalate into putting on glasses for proper rolling-pin scrubdown and end in tidal wave scrubbing 50 years of dust clean.
  - Lean: Tempo
  - Trait `Spotless Floor`: Deedee's first Composure shave each round against a Drenched foe removes +1 extra pip.
  - Basic `Windex Spritz` (Drench, +2 Pep): Sharp blue Windex squirt in monster's face (Drenched, -15% enemy accuracy).
  - R1 `Wet-Floor Hazard` (3 Pep, Drench): Soapy mop slick: next 2 physical foes slip (-25% dmg & Clobber fall).
  - R2 `"Hand Me My Glasses" Scrub` (4 Pep, Clobber): Puts on glasses and scrubs away ALL positive buffs on 1 foe with rolling pin (+25% Drench dmg/buff removed).
  - R3 Quirk A `Car-Crumb Vacuum`: Catching hidden crumbs: stripping enemy buff/hazard grants party +15% Atk (1t).
  - R4 `Fifty-Year Dust Tsunami` (5 Pep, Drench): Sparkling soapy deluge across screen: wipes enemy hazards/buffs/stealth & leaves all foes Drenched.
  - R5 Quirk B `Spit Shine`: Foes Drenched by Deedee take +30% bonus damage from next ally Clobber hit.

### 6. BOPPY: The Boat Skipper & Rikers Wall *(Sig: The Dep + Pepper Boss)*
- **Vibe 1: Boat Angler** (Scaling Bruiser / Enemy Puller & AoE Nuker; Drench/Clobber)
  - Subtitles: `Deckhand Fibber` -> `Long Island Sound Skipper` -> `Admiral of the Big One ★`
  - Visual Arc: Casting off rocking boat rail in choppy swells grows into hauling cooler-sized striped bass over gunwale and ends with Boppy's boat riding massive wake as whale-sized catch breaches Long Island Sound.
  - Lean: Striker
  - Trait `"It Was THIS Big!"`: Each Angler skill adds +1 Whopper Tally (max 4), growing fish sprites & widening AoEs at 2+.
  - Basic `Choppy-Water Cast` (Drench, +2 Pep): Casts off boat rail to hook back-row foe forward (+1 Tally, light Drench: *"Swell was six feet!"*).
  - R1 `Lead-Sinker Boat Slam` (2 Pep, Clobber): Heavy boat sinker & tackle box thwack; +20% dmg vs Drenched/pulled foes.
  - R2 `Trophy Striper Haul` (4 Pep, Drench): Hauls cooler-sized Long Island Sound striped bass over gunwale across 1–2 foes (all foes at Tally 2+) for Drench/Clobber + Drenched.
  - R3 Quirk A `2006 Lucky Boat Lure`: Lost overboard and still shiny: pulling/pushing enemy shaves +1 Composure & applies Drenched.
  - R4 `Long Island Sound Leviathan` (6 Pep, Drench): Spends Tally (2+ req, +25% power/stack) as boat surges across screen and whale-sized catch breaches onto all foes (-2 Composure).
  - R5 Quirk B `Star in Grace's Key`: *"The star means Boppy says it was bigger"*: start every battle with +2 stacks of any stacking job mechanic active.
- **Vibe 2: Pepper Boss** (Self-Heated Pyromancer / DoT Detonator; Sizzle)
  - Subtitles: `Garden Nibbler` -> `1989 Pickle Keeper` -> `Five-Alarm Iron Gut ★`
  - Visual Arc: Flicking chili seeds and sweating through raw peppers escalates into 1989 Mason-jar firebombs and ends with sentient ghost pepper that made garden hose flinch.
  - Lean: Striker
  - Trait `"My Stomach Is Doing Something"`: Stomach grumbles: -30% Sizzle taken; chip/self-heat grants +25% Atk.
  - Basic `Seeds of Trouble` (Sizzle, +2 Pep): Flicks homegrown chili seeds (Toasty).
  - R1 `"It's Nothing, It's Fine" Chomp` (2 Pep, Sizzle): Eats raw pepper while blaming oven: heals 20% HP + Spiced Up (+30% Sizzle & melee burn aura 3t).
  - R2 `1989 Pickle-Jar Bomb` (4 Pep, Sizzle): Hurls prized 1989 pickled pepper jar at enemy group; upgrades Toasty to Five-Alarm Burn (2x burn & -20% Def).
  - R3 Quirk A `"The Hose Flinched"`: Garden heat so intense that Boppy's DoT ticks can Critically Hit.
  - R4 `The Ghost One That Looks Back` (6 Pep, Sizzle): Unleashes forbidden back-garden ghost pepper in roaring AoE Sizzle cone, instantly triggering 2 full burn ticks without removing burns.
  - R5 Quirk B `No Reach for Water`: Refusing to lose spice contest: Steam Cloud detonations refund +2 Pep (1/round).
- **Vibe 3: The Dep** (Immovable Bastion / Taunt & Thorns Tank; Clobber/Racket)
  - Subtitles: `Sofa Sentry` -> `Rikers Lineup Boss` -> `Immovable Gold Warden ★`
  - Visual Arc: Rapping a warden's nightstick and holding the line escalates into rambling 1970 cross-country stories and climaxes in gleaming brass-and-iron Rikers gates slamming down in front of the party.
  - Lean: Guard
  - Trait `Boppy Speed`: Nobody rushes Boppy: timeline pushback immune >50% HP; +40% aggro.
  - Basic `Warden's Nightstick Rap` (Clobber, +2 Pep): Raps wooden warden nightstick against palm and cracks foe across the shin (*"Back behind the line!"*), -15% foe Atk 1t.
  - R1 `"Nobody Gets Past Me!"` (3 Pep, Racket): Signature Rikers stance: 2t AoE taunt, +35% Def, grumpy Racket counter when hit.
  - R2 `1970 Cross-Country Story` (3 Pep, Racket): Traipses through 41st retelling of passing field on last hill, slowing Boppy & foe 20% (2t) and locking that foe's aggro onto Boppy (2t). The foe still takes its turns.
  - R3 Quirk A `"Gold Like My Teeth"`: Real-gold grit: 1/battle survive lethal hit at 1 HP & gain +3 Pep.
  - R4 `Warden's Iron Gate` (5 Pep, Clobber): Slams gleaming brass-and-iron Rikers Warden gates down in front of party: -40% AoE dmg taken 2 rounds + Clobber melee thorns.
  - R5 Quirk B `"The Mailbox Moved"`: Never admitting fault: counters inherit element & riders of Boppy's last Active Skill.

### 7. TNB: The Studio Potter, Longboarder & Scream King *(Sig: Ceramicist + Longboarder)*
- **Vibe 1: Ceramicist** (Earthen Shielder / Reflective Kiln Alchemist; Sizzle/Clobber)
  - Subtitles: `Pinch-Pot Dabbler` -> `Spring-Street Wheel Thrower` -> `Master of Kintsugi ★`
  - Visual Arc: Tossing wet clay lumps off wheel escalates into 3 AM loft kiln firings and climaxes in museum-sized terracotta amphora shattering into razor-sharp glazed shards.
  - Lean: Support
  - Trait `Wet Clay to Stoneware`: Shields absorb +20% physical; Sizzle vitrifies them into Fired Glaze (reflects 30% dmg).
  - Basic `Wheel-Thrown Lump` (Clobber, +2 Pep): Heavy wet clay, -10% foe Spd.
  - R1 `Center the Bowl` (3 Pep, Support): Pottery wheel under ally (*"It's a bowl, it just doesn't know yet"*) shaping 30% Max HP clay carapace & cleanse burn/bleed.
  - R2 `Three-AM Kiln Firing` (4 Pep, Sizzle): Opens glowing loft kiln for AoE Sizzle (Toasty), firing clay shields into Fired Glaze & +15% ally Atk.
  - R3 Quirk A `Coaster Policy`: *"I'm the reason there are coasters"*: shielded allies deal +15% bonus elemental dmg.
  - R4 `Grand Amphora Masterpiece` (5 Pep, Clobber): Towering Pisa-leaning terracotta vessel absorbing 2 hits before shattering for heavy AoE Clobber/Razzle & -2 Composure.
  - R5 Quirk B `Kintsugi Gold Seam`: *"A better mug, with a gold line where it broke"*: broken ally shield heals 15% HP & grants Razzle-detonating strikes (1t).
- **Vibe 2: Longboarder** (Street-Skater Tactician / Speed Buffer & Transit Rescuer; Razzle/Clobber)
  - Subtitles: `Sidewalk Pusher` -> `Baxter-Hill Bomber` -> `Car-Free Street Legend ★`
  - Visual Arc: Pushing down block on longboard with coffee in hand escalates into chirping open rental e-bikes and hailing lidar-spinning Waymo SUVs, culminating in bombing steep Baxter Street alongside an LA Metro train.
  - Lean: Tempo
  - Trait `Carving Momentum`: Effortless longboard flow & multimodal transit hops cut Basic Recovery Ticks by 10%.
  - Basic `Longboard Push & Carve` (Clobber, +2 Pep): Cruises past on longboard with coffee in hand, scanning stats & -10% own Recovery Ticks.
  - R1 `E-Bike Tag-Along` (2 Pep, Support): Skates alongside while scanning handlebar QR code to unlock rental e-bike for ally (cleanses, Fresh Ride blocks 1 debuff, +15% Spd/Atk/Def 2t).
  - R2 `Waymo Tailgate Rescue` (4 Pep, Razzle): Autonomous SUV spins roof-lidar for AoE Razzle blind flash while popping door for 40% HP revive (or safe HP rebalance).
  - R3 Quirk A `TAP-Card Transfer`: Free Metro transfers: TNB buffs last +1t, +10% Eva, pull slowest ally 15% forward.
  - R4 `Baxter Hill Longboard Express` (5 Pep, Razzle): Bombs down steep Baxter Street alongside arriving LA Metro train (AoE Dazzled, doubles active E-Bike buffs 2t, +20% Family Ruckus).
  - R5 Quirk B `No Car, No Tickets`: *"I take the Metro. You have nothing on me."*: slow immune; the first time TNB detonates Dazzled on a foe, it cracks 10% of that foe's base Def for the rest of the battle (once per foe).
- **Vibe 3: Scream King** (Horror Saboteur / Debuff Executioner; Racket/Razzle)
  - Subtitles: `Popcorn Tosser` -> `Slasher Scholar` -> `Untouchable Final Boy ★`
  - Visual Arc: Shining flashlight under chin and throwing movie-night popcorn bowl escalates into yelling warnings at VHS static and ends in fog-soaked Act-Three slasher reveal.
  - Lean: Striker
  - Trait `"Don't Look Behind You"`: +30% damage & +1 Composure shave vs Racket-debuffed or slower foes.
  - Basic `Flashlight Under Chin` (Razzle, +2 Pep): Spooky campfire uplighting (light Razzle, Dazzled).
  - R1 `Flying Popcorn Jump-Scare` (3 Pep, Racket): Hurls giant movie-night popcorn bowl skyward with horror sting: Spooked (-30% acc/dmg next hit; fast/Airborne hits auto-crit).
  - R2 `"Don't Go In The Basement!"` (4 Pep, Racket): VHS static & slamming cellar door deal AoE Racket damage while pulling next ally 20% forward.
  - R3 Quirk A `Forty-Seven Rewatches`: Knowing every scary trope by heart grants TNB +20% Evasion against debuffed foes.
  - R4 `Act-Three Mask Reveal` (6 Pep, Racket): Kills lights and floods purple theater fog for horror ambush with 1.5x multiplier vs foes with 2+ debuffs.
  - R5 Quirk B `Sequel Hook`: KOs or Composure Breaks refund +2 Pep (1/round).

### 8. NARA: The Guard Dog, Attached Pup & Picky Princess *(Sig: Attached Pup + Guard Dog)*
- **Vibe 1: Guard Dog** (Pursuit Hunter / Buff Snatcher & Shield Piercer; Clobber)
  - Subtitles: `Window Tree-Growler` -> `Porch Patrol Officer` -> `Alpha Block Guardian ★`
  - Visual Arc: Growling at backyard squirrels and playing tug-of-war escalates into hoarding Lachlan's gold tennis ball and finishes in slow-motion Hollywood stunt-double leap.
  - Lean: Striker
  - Trait `Locked On the Gold Ball`: Hitting same foe twice marks My Toy (+20% Clobber + free chase bite on pushback, 1/round).
  - Basic `Grip-Chicken Snap` (Clobber, +2 Pep): Fast bite, 5% HP plain-chicken snack if foe debuffed.
  - R1 `Relentless Tug-of-War` (3 Pep, Clobber): Clamps onto foe: -25% Atk/Def (2t) & yanks out of guard.
  - R2 `"No Take, Only Throw!"` (3 Pep, Clobber): Clenches gold tennis ball and rips 1 buff off foe for herself (or +35% Atk vs unstealable boss buff).
  - R3 Quirk A `Sandbox Clue Digger`: Digs up buried neighborhood treasures (Pep Bone, Squeaky Toy, Chicken Strip) at battle start & on boss Break.
  - R4 `Stunt-Double Squirrel Intercept` (6 Pep, Clobber): Flashes Sunset Gold *HORSE STUNT DOUBLE* lanyard & Watch vest for 3-hit pounce ignoring shields/evasion (+40% vs My Toy/Flustered).
  - R5 Quirk B `Forty-Pound Counterweight`: Pulling all forty pounds: ally hits on My Toy pull Nara 15% forward.
- **Vibe 2: Attached Pup** (Nervous Evasion Skirmisher / Panic-Splash Detonator; Drench/Clobber)
  - Subtitles: `Porch-Step Waiter` -> `Vacuum Survivor` -> `Stage-Five Clinger ★`
  - Visual Arc: Startling at water dish and shaking off jitters escalates into bolting from imaginary vacuum cleaner and climaxes in operatic separation-anxiety meltdown.
  - Lean: Tempo
  - Trait `Nervous Vibrations`: Anxious trembling grants +3% Evasion per unspent Pep held (up to +30%; half vs AoE).
  - Basic `Startled Water-Bowl Flip` (Drench, +2 Pep): Jumps at sudden noise and flips water dish, front-row Drench.
  - R1 `Jittery Shake-It-Off` (3 Pep, Drench): Full-body nervous shake: AoE Drenched, cleanses Nara, +25% Eva (1t).
  - R2 `Vacuum-Cleaner Bolt!` (3 Pep, Clobber): Spots vacuum and scrambles in panic, kicking row debris (-20% acc) before hiding behind Tom's legs (-50% AoE taken 1t).
  - R3 Quirk A `"Where Are You Going?!"`: Separation reflexes: dodging makes Nara dart to human's side (+1 Pep & Drenches attacker, 1/round).
  - R4 `"Don't Leave Me!" Meltdown` (5 Pep, Drench): 9 AM front-door separation howl + frantic circles hit every foe (Drench/Racket) & detonate all Toasty/Dazzled states at once.
  - R5 Quirk B `Pressed Against Your Shins`: Clinging tight: 50% of Speed buff % added to Attack.
- **Vibe 3: Picky Princess** (Pampered Pacifier / Plate-Sharing & Morale Support; Racket/Sizzle)
  - Subtitles: `Bowl Snubber` -> `Plate Bandit` -> `Forbidden Couch Royalty ★`
  - Visual Arc: Snubbing lukewarm dog food and tragic begging eyes escalates into eating warm food off a family plate and finishes with Nara on her own dining chair barking for chicken and pie crust.
  - Lean: Support
  - Trait `High Standards`: Polite routine: allies healing/buffing Nara gain +1 Pep & +15% Crit (2t).
  - Basic `Unimpressed Sniff` (Racket, +2 Pep): Sniffs foe like cold kibble and looks away, -20% foe next dmg.
  - R1 `Weaponized Puppy Eyes` (3 Pep, Racket): Unbearable begging stare: foe refuses to target Nara & -35% dmg next turn (-1 Composure vs buffed foes, or -2 on a Pet Peeve hit or Detonation).
  - R2 `"Only Off Your Plate"` (3 Pep, Sizzle): *"Food on her plate is suspicious. Food on my plate is a gift."*: ally shares warm food off plate with Nara: both heal 30% HP + Sizzle shield + +20% Atk.
  - R3 Quirk A `Belly-Rub Tax`: Nobody messes with baby: >20% HP unshielded hit gives allies +15% Speed to fuss over her (1/round).
  - R4 `Eighth-Chair Pie-Crust Decree` (5 Pep, Racket): Hops onto own human dining chair barking for chicken & crust: -1 Composure all foes, mental cleanse, pulls allies 20% forward.
  - R5 Quirk B `Allowed on the Couch`: Climbs onto forbidden couch and stares until allowed: single buffs on Nara mirror at 50% onto lowest-HP ally.

### 9. JUSTIN: The Night Lineman, Couch Ref & Home Renovator *(Sig: Basement Boss + Live Wire)*
- **Vibe 1: Live Wire** (Chain-Voltage Saboteur / Arcing Razzle Striker; Razzle)
  - Subtitles: `Flashlight Holder` -> `Copper-Banner Pro` -> `High-Voltage Grid Wizard ★`
  - Visual Arc: Poking outlets with tester and tossing wire nuts escalates into stringing glowing copper party banners and culminates in rewiring blacked-out block by flashlight in 240V substation surge.
  - Lean: Striker
  - Trait `Live Circuit`: Dazzled/Drenched foes hit become Wired; hitting one Wired foe arcs 30% Razzle across others.
  - Basic `Voltage-Tester Poke` (Razzle, +2 Pep): Taps foe with pocket tester and wire nuts (Dazzled).
  - R1 `"Don't Touch the Copper!" Banner` (3 Pep, Razzle): Custom light-up copper banner between 2 foes (2 turns): Composure dmg on one shaves 1 Composure on other (1/round).
  - R2 `Main Breaker Flip` (4 Pep, Razzle): Heavy basement breaker switch Razzle blackout: strips charge-ups & disables passives 1t (-1 boss Composure, or -2 on a Pet Peeve hit or Detonation).
  - R3 Quirk A `Rubber-Soled Workboots`: -30% Razzle/Sizzle taken; Short Circuit refunds +1 Pep.
  - R4 `Flashlight Block Rewire` (6 Pep, Razzle): Flashlight between teeth, cross-wires transformer for massive Razzle chaining at 75% splash to Wired/Drenched foes.
  - R5 Quirk B `Rare Heart-Emoji Text`: *"He only uses the heart on special days"*: Breaks/KOs store Static Charge (+40% Razzle next action).
- **Vibe 2: Armchair Ref** (Penalty Caller / Timeline Knockback Controller; Racket)
  - Subtitles: `Couch Heckler` -> `Replay Judge` -> `Hall-of-Fame Whistleblower ★`
  - Visual Arc: Booming heckles and yellow napkins off sofa escalate into window-rattling dad sneezes and finish with stadium Jumbotron replay booth dropping onto field.
  - Lean: Tempo
  - Trait `"ARE YOU BLIND, REF?!"`: Enemy crits or double-turns auto-apply Yellow Penalty Flag (+25% next hit taken & 15% pushback).
  - Basic `Couch-Side Boo!` (Racket, +2 Pep): Cups hands and unleashes booming *"BOOOOO!"*, 10% pushback.
  - R1 `Flag on the Play!` (2 Pep, Racket): Chucks yellow penalty flag: Racket hit + 25% pushback + locks strongest AoE/buff (1t).
  - R2 `Giant Dad-Sneeze` (4 Pep, Racket): Unannounced 110-dB AoE Racket blast: pushes ALL foes back 20% & detonates Toasty/Dazzled board-wide.
  - R3 Quirk A `Home-Field Advantage`: Pushing foe past round divider shaves +1 Composure.
  - R4 `Jumbotron Instant Replay` (5 Pep, Racket): Stadium replay booth rewinds 50% of last ally hit taken + heavy Racket penalty strike (-25% Def) on offender.
  - R5 Quirk B `"Unmailed Invitations"`: Forgot on Monday, delivers double on Saturday: 1/fight (or Break), repeat 2–3 Pep Racket skill at 50% power free.
- **Vibe 3: Basement Boss** (Shield Wrecker / Barrier Framer & Heavy Bruiser; Clobber)
  - Subtitles: `Stud Finder` -> `Drywall Pro` -> `Master Gut-Renovator ★`
  - Visual Arc: Beeping stud-finder against monsters escalates into framing up fresh drywall and ends in clumsy foot-drop tool accident and steel toolbox punt.
  - Lean: Guard
  - Trait `Load-Bearing Swing`: +15% slower Clobber Recovery Ticks, +1 extra Composure pip vs shielded/high-Def foes (1/round).
  - Basic `Stud-Finder Beep & Knock` (Clobber, +2 Pep): Beeping stud finder + hammer rap: +15% Clobber taken (1t).
  - R1 `Demo-Day Prybar` (3 Pep, Clobber): Rips through shields/guards, blasting broken barrier value as splash damage.
  - R2 `Hang Fresh Drywall` (4 Pep, Support): Screws up gypsum wall in front of 2 allies (blocks 50% of next 2 physical/projectile hits).
  - R3 Quirk A `Measure Twice, Cut Once`: Support/wait turn squares up aim, guaranteeing next Clobber/Razzle Crit.
  - R4 `Dropped-Screw Toolbox Punt` (6 Pep, Clobber): Accidentally drops a tiny screw onto his ultra-sensitive foot, yelps, hops wildly on one leg, and punts his 80-pound steel toolbox straight into the enemy: cracking 15% base Def for the rest of the battle (once per foe) + huge multiplier vs Flustered.
  - R5 Quirk B `Store-Bought Bread Peace Offering`: *"It's store-bought." "I'll allow it."*: any broken ally/enemy barrier grants +20% Atk & +1 Pep (1/round).

### 10. OLIVIA: The News Anchor, Working Mom & Jump-Rope Legend *(Sig: Rope Champ + Working Mom)*
- **Vibe 1: News Anchor** (Weakness Exposer / Buff Inverter & Splash Saboteur; Racket/Razzle)
  - Subtitles: `Curbside Reporter` -> `Live Fact-Checker` -> `Prime-Time Broadcast Queen ★`
  - Visual Arc: Sticking handheld mic in monster's face escalates into on-screen *"IS THIS REAL?"* chyrons and climaxes in full *LivNews Live* studio & news-chopper broadcast.
  - Lean: Tempo
  - Trait `On The Record`: Reveals Pet Peeves & Composure at start; exposed foes take +15% Crit Rate from party.
  - Basic `Hot-Mic Question` (Racket, +2 Pep): Thrusts mic into foe's face, blocking stealth and evasion (2t).
  - R1 `Camera-Crew Spotlight` (3 Pep, Razzle): Blinding field camera light (Dazzled 2t); 25% single-target dmg splashes as Racket to all others.
  - R2 `"Is This Real?" Fact-Check` (3 Pep, Racket): Slaps receipts graphic onscreen: +35% per enemy buff, inverts 1 buff into matching debuff.
  - R3 Quirk A `Inverted Pyramid`: Journalistic efficiency: hitting Pet Peeve grants +1 Pep (1/turn).
  - R4 `LivNews Breaking Exclusive` (5 Pep, Racket): *BREAKING NEWS* ticker & news-chopper searchlights: lowers enemy resistances 1 step (2t), -2 Composure on buffed foes, +25% Ruckus gain.
  - R5 Quirk B `Investigative Scoop`: First debuff on boss bypasses half-resistance & cannot be cleansed.
- **Vibe 2: Working Mom** (Multitasking Healer / Toddler-Proof Shielder & Family Commander; Drench/Racket)
  - Subtitles: `One-Handed Emailer` -> `Double-Stroller General` -> `CEO of Bedtime ★`
  - Visual Arc: Answering work messages one-handed while wiping toddler faces escalates into diaper-bag triage and nursery mist, climaxing in ordering 6'4" Michael onto full toddler-interception duty.
  - Lean: Support
  - Trait `Multitasking Pro`: Juggling work alongside Lachlan (4) and Isla (1) generates +1 *Mom Prep* stack per turn (max 3) to scale support moves.
  - Basic `Baby-Wipe Swipe` (Drench, +2 Pep): Cleanses 1 minor debuff + small heal on ally OR swats monster's face with cold wet wipe for light Drench.
  - R1 `Diaper-Bag Snack Drop` (3 Pep, Support): Dumps toddler snacks and sippy cups from bottomless tote, spending *Mom Prep* stacks for party heal (+1 bonus Pep to lowest-Pep ally at 3 stacks).
  - R2 `Cool-Mist Humidifier` (4 Pep, Drench): Blasts Isla's nursery cool-mist humidifier: cloaking allies in -25% ranged/AoE damage taken (2 turns) while leaving all foes *Drenched*.
  - R3 Quirk A `Nap-Window Efficiency`: Getting two hours of work done during a 20-minute nap: support skills add 0 extra Recovery Ticks.
  - R4 `"Michael, Grab the Kids!"` (5 Pep, Racket): Barks *"MICHAEL, GRAB ISLA AND LACHLAN!"* as 6'4" Michael sprints across the field scooping up toddler chaos: startling monsters (-25% enemy timeline progress) while sliding in a hot dinner tray for a moderate party heal and mental/stun cleanse.
  - R5 Quirk B `Childproofed Locks`: Party heals and buffs grant a random ally *Childproofed* (blocks the next incoming debuff).
- **Vibe 3: Rope Champ** (Rhythmic Combo Striker / Self-Buffing Boss Finisher; Clobber)
  - Subtitles: `Rusty Champ` -> `Double-Under Machine` -> `Undisputed Freestyle Legend ★`
  - Visual Arc: Knocking rust off old jump rope and trash-talking rival Bobby escalates into sonic-boom double-unders and culminates in neon gymnasium championship showcase.
  - Lean: Striker
  - Trait `Unbroken Rhythm`: Consecutive offensive turns build Cadence (`1x -> 2x -> 3x`), adding +1 hit & +10% Crit Dmg per rank.
  - Basic `Rusty Speed-Rope Snap` (Clobber, +2 Pep): Sharp jump-rope whip, +1 Cadence.
  - R1 `Criss-Cross Double-Under` (3 Pep, Clobber): 2–5 hit Clobber flurry by Cadence; grants +20% Evasion & +15% Atk (2t).
  - R2 `"Better Than Bobby!" Hype` (2 Pep, Racket): Trash-talks childhood rival: +1 Cadence, +30% Crit (2t), pulls next turn forward 25%.
  - R3 Quirk A `Muscle Memory`: Taking support/healing turn pauses Cadence stacks instead of resetting.
  - R4 `Regional Championship Freestyle` (6 Pep, Clobber): Gym bleachers & pyro appear for up to 7 rapid Clobber strikes (+10% dmg per active buff on Olivia) + -2 Composure slam.
  - R5 Quirk B `Trophy-Shelf Ego`: +8% outgoing damage per unique positive buff on Olivia (up to +32%).

---

## 4. Build Order (recommendation, not a rule)

The directory holds 120 active moves. Build them in three passes so the game is playable after the first:

1. Each character's first *Sig* Vibe (10 Vibes, 40 moves).
2. Each character's second *Sig* Vibe (10 Vibes, 40 moves).
3. Each character's third Vibe (10 Vibes, 40 moves).
