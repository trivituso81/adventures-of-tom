# LITTLE ELSEWHERE: COMPLETE BATTLE SYSTEM DESIGN BIBLE

Status: approved by Tom 2026-10-19 (written by another AI from our brief, then corrected). Every move below is an existing animation in the game unless marked NEW (needs a new animation). Rose, Amy, Deedee and Boppy were remapped to their real in-game moves. Damage numbers are starting values to tune in play.

## 1. Design Pillars & The "Nostalgic but Modern" Hook

### Four Core Pillars
1. One-Thumb Phone Clarity: Every command is reachable via four cardinal D-pad directions and A/B buttons in portrait mode, with zero nested scrolling lists and zero mandatory real-time reflexes.
2. Personality IS the Mechanic: Characters do not play like generic stat sticks; Tom physically steps in front of attacks, Boppy lowers enemy morale by complaining, Nara refuses 99% of food items, and Rose turns lethal monsters into giggling goofballs.
3. All Gas, No Hoarding: Classic JRPG MP hoarding is replaced by fast-cycling Vibe Points (VP) and a shared HEART Meter, ensuring kids and adults fire off signature animations and Tombos in every single fight.
4. Kindness Is Optimal Play: Consistent with the story's moral, every enemy can be defeated either by depleting HP or by filling their Warmth Bar to cure their bad mood, which culminates in the final boss's mechanics.

### The "Nostalgic but Modern" Hook
Little Elsewhere blends the beloved sprite theatricality and Dual Techs of Chrono Trigger, the quirky suburban charm of EarthBound, and the story-driven party rotations of Final Fantasy IV with modern turn-order mastery. Instead of waiting on stressful active timers, players manipulate a crisp top-of-screen turn timeline, spend self-replenishing Vibe Points on expressive family antics, and build a shared Heart Meter to unleash Tombos (where Uncle Tom jumps into each family member's signature hobby). Best of all, monsters are not evil creatures to slaughter; they are stressed-out "Friction Sprites" that players can either knock out or soothe through acts of everyday love.

---

## 2. Core Battle Loop

### Turn Structure Pick: CTB (Conditional Turn-Based Timeline)
* The Pick: CTB (Visible Turn-Order Ribbon, Final Fantasy X / Trails style) over real-time ATB.
* Why: On a phone played one-handed (and by a 6-year-old alongside adults), real-time ATB timers punish slow reading, whereas a visible CTB ribbon lets Rose take all the time she wants while letting adults plan deep turn-order bumps, delays, and bodyguard intercepts.

### One-Thumb Portrait UI & Command Menu
The top 55% of the portrait screen displays the battle stage and a horizontal 8-icon Turn Ribbon at the very top. The bottom 45% displays the 4 party portraits (with HP/VP bars and a central Heart Meter) and a 4-Direction Cross Command Menu mapped to D-Pad + A/B:

| Input | Command | Function |
| :--- | :--- | :--- |
| D-Pad UP | Basic Move | Signature 0-VP attack (Button Mash, Cartwheel, Boop, etc.). Generates +1 VP and +5% HEART. |
| D-Pad RIGHT | Skills | Opens a 2x3 radial grid of unlocked Path Skills (costs 2 to 6 VP). Remembers last used skill. |
| D-Pad LEFT | Tombo! | Opens the available Tombo or Family Finish menu (costs 25% to 75% HEART, 0 VP). |
| D-Pad DOWN | Care & Bag | Quick-selects character's Signature Special (DEFEND, DANCE, SILLY, etc.), Snack Bag, or Tag Swap. |
| A Button | Confirm / High-Five | Confirms menu choice. Pressing A during an attack's sparkle frame triggers an optional "High-Five!" (+15% effect & +5% HEART). |
| B Button | Back / Inspect | Cancels selection, or holds to display enemy weaknesses and what Kindness Action cures their grumpiness. |

### Resources & Action Economy
* HP (Heart Points): Character health (100 at Lv. 1 to 999 at Lv. 50). At <25% HP, character enters the Low-HP Kneel (Nara sits). At 0 HP, character plays Knock-Out Collapse; reviving plays Revive Hop at 50% HP without losing their spot on the timeline.
* VP (Vibe Points): Replaces MP. Every character has a fixed cap of 10 VP. Every character starts battle at 5 VP, automatically regenerates +2 VP at the start of their turn, and gains +1 VP on a Basic Move.
* HEART Meter (Shared Party Gauge, 0% to 100%): Divided into 4 hearts (25% each). Persists between normal battles (resets to 25% on Boss start). Fills via:
  * Using any healing, buff, or DEFEND skill: +15% HEART.
  * Hitting an enemy's Elemental or Kindness weakness: +15% HEART.
  * Any ally taking damage: +10% HEART.
* Keeping 4-Member Turns Fast on Phone: Menu memory defaults the cursor to the last-used skill; animations run at a snappy 1.1 to 1.6 seconds with damage numbers popping mid-animation so the next character's command cross appears immediately.

---

## 3. Stats, Formulas, Elements & Status Effects

### Core Stat List (Level 1 to Level 50 Range: 10 to 99)
| Stat | Plain Meaning | Who Excels |
| :--- | :--- | :--- |
| HP | Health pool before Knock-Out Collapse (100 to 999). | Boppy, Tom, Amy |
| POW | Physical impact for strikes, throws, and jumps. | Amy, Boppy, Nara, Tom |
| GRIT | Physical toughness; reduces incoming POW damage. | Boppy, Tom, Deedee |
| WARMTH | Potency of heals, baking, pep talks, and emotional attacks. | Deedee, Grace, TNB, Rose |
| COOL | Emotional composure; reduces incoming WARMTH/status damage. | TNB, Tom, Deedee |
| PEP | Turn speed on the CTB timeline and evasion rate. | Nara, Amy, Grace, Rose |

### Combat Formulas
* Physical / Kinetic Damage:
  Damage = max(1, (POW * 2.5 - Target GRIT * 1.2) * SkillMult) * ElemMult * HighFive(1.0 or 1.15)
* Warmth / Special Damage:
  Damage = max(1, (WARMTH * 2.5 - Target COOL * 1.2) * SkillMult) * ElemMult * HighFive(1.0 or 1.15)
* Healing Output:
  Heal = (BaseHeal + WARMTH * 3.2) * SkillMult * HighFive(1.0 or 1.15)
* CTB Timeline Tick Delay:
  Ticks Until Next Turn = floor((1200 / (PEP + 30)) * MoveWeight)
  (MoveWeight: Quick Skill/Swap = 0.7, Standard Action = 1.0, Heavy Finisher = 1.3)

### Six Everyday Elements
1. Kinetic (Physical): Cartwheels, longboards, tackles, rolling pins (Scene FX: dust, ring).
2. Cozy (Heat/Spice): Sourdough Dutch ovens, spicy peppers, kiln blasts, warm rhubarb crisp (Scene FX: kiln, glow). Beats Amber and Splash.
3. Splash (Water/Bog): Fishing casts, coffee splashes, wet dog shakes, bog mud (Scene FX: burst). Beats Cozy.
4. Sparkle (Glitter/Light): Glitter nails, ring lights, unboxing flashes, confetti (Scene FX: confetti, flash). Beats Dark/Grump and Amber.
5. Chatter (Sound/Vibe): Japanese flashcards, raspberries, pep talks, barks, grumbles (Scene FX: ring). Beats Kinetic stances.
6. Amber (Stasis/Villain): Time-locks, corporate greyscale, silence (Scene FX: dark, flash). Used by Auditors; weak to Cozy and Sparkle.

### Family-Flavored Status Effects & Counterplay
| Status | Type | Effect | Triggered By / Counterplay |
| :--- | :--- | :--- | :--- |
| Bodyguarded | Buff | Tom intercepts 100% of single-target hits aimed at this ally for 2 turns and takes -40% damage ("No touching, please."). | Tom's DEFEND. |
| Pumped Up | Buff | Next attack or heal deals +50% output. | Amy's PEP TALK. |
| Tucked In | Buff | Regenerates 15% Max HP per turn and +25% GRIT/COOL for 3 turns. | Deedee's MOON & BACK / Boppy's Recliner Drop. |
| Wardrobe Fresh | Buff | Grants a 1-hit Auto-Revive (at 50% HP) and immunity to debuffs for 3 turns. | TNB's WARDROBE. |
| Goofed (Confused) | Debuff | Enemy spends its next turn dancing harmlessly or dropping coins for the party. | Rose's SILLY. Cured on enemy if hit by a heavy physical strike. |
| Grumbled | Debuff | Enemy POW and WARMTH reduced by -30% for 3 turns; forces enemy to target Boppy. | Boppy's GRUMBLE. |
| Smitten | Debuff | Enemy skips its next turn completely out of adoration. | Nara's PUPPY EYES. |
| Frantic Pup | Trait | When Tom is at 0 HP (or missing in Ch. 19), Nara gains +50% POW and +30% PEP. | Automatic passive on Nara. |
| Shushed | Debuff | Character cannot use Chatter skills or Tombos for 2 turns. | HUSH-9 / Library enemies. Cured by Deedee's snacks or TNB's WARDROBE. |
| Amber-Stuck | Debuff | Character's CTB timeline speed is halved (-50% PEP). | Glass Tower enemies. Instant-cured by any Cozy skill. |

---

## 4. Enemies, Multi-Enemy Formations & Boss Design

### Formations & Targeting Rules
* Formation Grid: Supports 1 to 4 enemies arranged in a Front Row (up to 3) and Back Row (up to 2) that fits cleanly on a vertical phone screen.
* Targeting:
  * Single: Any enemy.
  * Row Sweep: Hits all Front Row or all Back Row enemies.
  * Splash: Hits primary target for 100% and adjacent enemies for 60%.
  * All: Hits all enemies on screen.

### Boss Phase & Telegraph Rules
Every Boss has an Intent Telegraph Icon on the CTB Turn Ribbon showing who they are targeting and when a heavy attack is coming:
1. Single Lock-On Icon: Boss is preparing a massive single-target hit -> Cue for Tom's DEFEND.
2. Party-Wide Megaphone Icon: Boss is charging a room-wide attack -> Cue for Boppy's GRUMBLE (-30% boss attack) or Grace's DANCE / Deedee's MOON & BACK.
3. Amber Shield Counter (Numbered 1 to 3): Boss puts up a barrier that requires 2 or 3 hits of a specific element or a Tombo before its turn arrives to trigger a Stagger Break (Boss skips turn and takes +50% damage).

### Three Story Boss Designs

| Boss & Chapter | Stats & Weaknesses | Phase Pattern & Mechanics | How It Tests the System |
| :--- | :--- | :--- | :--- |
| 1. The Big One (Ch. 1: Grump Hollow) | HP: 480 | Warmth Goal: 350 | Weak: Sparkle, Chatter | Adds: 2x Mudlings | Phase 1: Wears Deedee's pie tin on its head (+50% GRIT). Locks onto Grace with Swamp Chomp. Phase 2 (<50% HP): Summons 2 Mudlings and charges Muddy Belly-Flop (All). | Tutorial Boss: Teaches Tom to use DEFEND on Grace ("No touching, please"), Rose to use SILLY to make the boss tip its head and drop the pie tin (removing its GRIT buff), and Deedee to heal with MOON & BACK. |
| 2. Warden Boppy (Possessed) (Ch. 14: Rivituso Row) | HP: Infinite (Amber Armor) | Warmth Goal: 1,200 | Weak: Family Memories | Rule: Direct physical attacks heal his Amber Armor. Pattern: Uses Nobody Gets Past Me (blocks path to house) and Track Star Sprint (acts twice per cycle). | Story-Mechanic Test: Players must fight non-violently. Tom uses DEFEND to absorb Boppy's strikes (+150 Warmth), Amy matches his stride with PEP TALK (+200 Warmth), Grace & Rose use DANCE/SILLY (+200 Warmth), freeing Deedee on Turn 4 to finish with MOON & BACK. |
| 3. Chronos-Leviathan & Julian Vance (Ch. 20: Finale) | Phase 1 HP: 6,500 | Phase 2 Hate Shield: 1,000 Warmth | Party: All 8 Active | Phase 1: Erects 4 Resentment Barriers (Distance, Aging, Exhaustion, Fear) that only shatter when hit by specific Tombos. Phase 2: Julian petrifies the UP (Attack) command into stone. | Ultimate Moral Test: In Phase 1, players swap across all 8 family members to fire off Tombos. In Phase 2, with Attack disabled, players must target Julian with each character's signature heal/buff/special (MOON & BACK, DANCE, PUPPY EYES, WARDROBE, DEFEND) to heal his grief. |

---

## 5. Character Identities, Unique Mechanics, Skill Paths & Full Animation Mapping

### The Skill Pathing Twist: "Postcard Stampcards & Shared Habits"
Each character has two 4-node Specialization Paths (8 path nodes + 1 Starting Basic + 1 Signature Special = 10 moves/traits).
* The Modern Twist: Whenever two characters complete a major story chapter together, they unlock a "Shared Habit" Bridge Passive between their paths (e.g., after Ch. 12 in LA, Grace picks up TNB's horror-set lighting flair; after Ch. 15, TNB learns Deedee's kitchen warmth). Players earn 1 Stamp Point (SP) per level and can respec stamps freely anytime outside battle.

### 1. TOM (The Protective Uncle & All-Rounder)
* Classic Roles: Paladin Bodyguard (Path A) / Tech-Scholar Tactician (Path B).
* Unique Mechanic ("Diamond Medallion Status"): Whenever Tom protects an ally with DEFEND or triggers a Tombo, he earns 1 Upgrade Mile (max 3). At 3 Miles, his next skill costs 0 VP and acts instantly on the CTB timeline.
* Complete Animation Mapping (All 9 Existing Animations Kept):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Button Mash | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Fast controller combo hit (1.0x POW) + +5% HEART. |
| DEFEND | Signature Special (D-Pad DOWN) | 1 VP | Buff / 1 Ally | Steps in front of chosen ally ("No touching, please."). Intercepts all hits aimed at them for 2 turns at -40% damage; grants +15% HEART. |
| Starter Splash | Path A: Home Baker (Node 1, Lv. 2) | 2 VP | Splash / Row | Splashes active sourdough starter across enemy row (1.2x WARMTH) and lowers enemy PEP by -20%. |
| Dutch Oven | Path A: Home Baker (Node 2, Lv. 8) | 4 VP | Cozy / Single + Party | Drops a cast-iron baker on enemy (1.8x POW, Cozy) and pops out a hot boule that heals the lowest-HP ally for 30% HP. |
| Unboxing | Path A: Home Baker (Node 3, Lv. 14) | 3 VP | Sparkle / Party | Unboxes a fresh smart-gadget package (flash FX); grants random strong buff (+30% POW, GRIT, or PEP) to entire party for 3 turns. |
| Delta One | Path A Capstone (Node 4, Lv. 22) | 5 VP | Cozy-Kinetic / All | Summons a business-class lie-flat pod across the screen (2.2x WARMTH to all enemies) and fully restores Tom's VP to 10. |
| Flashcard Flurry | Path B: Polyglot Gamer (Node 1, Lv. 4) | 2 VP | Chatter / Multi (3x) | Throws N3 Japanese Quizlet flashcards (thrown props FX, 3x 0.5x WARMTH hits) and reveals all enemy weaknesses. |
| Kanji Strike | Path B: Polyglot Gamer (Node 2, Lv. 10) | 4 VP | Sparkle / Single | Draws a glowing brushstroke kanji in the air (glow FX, 2.0x WARMTH); deals +50% bonus damage if enemy has a debuff. |
| Final Boss | Path B Capstone (Node 4, Lv. 26 / Ch. 19) | 6 VP | Kinetic-Sparkle / All | Unleashes a 16-bit retro RPG limit-break combo (burst + flash FX, 2.8x POW/WARMTH hybrid to all enemies). |

### 2. GRACE (The 9-Year-Old Spotlight Dancer & Hype Healer)
* Classic Roles: White Mage / Bard Healer (Path A) / Gymnast Crit-Striker (Path B).
* Unique Mechanic ("Trending Meter"): Every time Grace uses a different animation than her previous turn, her Subscriber Count rises (1x -> 1.2x -> 1.5x output on heals and crits).
* Complete Animation Mapping (All 9 Existing Animations Kept):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Cartwheel | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Crisp gymnastics cartwheel kick (1.0x POW, high crit rate). |
| DANCE | Signature Special (D-Pad DOWN) | 3 VP | Sparkle / Party | Choreographed party heal (confetti FX; restores 25% Max HP + 1.2x WARMTH to all allies). |
| Squishy Squeeze | Path A: Influencer Cleric (Node 1, Lv. 2) | 2 VP | Cozy / 1 Ally | Squeezes her gold soup dumpling squishy; heals 1 ally for 45% HP and cures 1 debuff (+150 Warmth if targeted at an enemy). |
| Glitter Nails | Path A: Influencer Cleric (Node 2, Lv. 7) | 3 VP | Sparkle / Party | Paints sparkling nails (flash FX); gives party +25% Crit Rate and reflects 20% of magic damage for 3 turns. |
| Runway Walk | Path A: Influencer Cleric (Node 3, Lv. 13) | 3 VP | Sparkle / Row | Struts across the battlefield; pulls enemy aggro off wounded allies and lowers enemy accuracy by -30%. |
| Like and Subscribe | Path A Capstone (Node 4, Lv. 20) | 5 VP | Chatter-Sparkle / All | Ring-light flash (ring + confetti FX); heals party for 35% HP and boosts HEART Meter by +25%. |
| Dance Battle | Path B: Acro-Star (Node 1, Lv. 4) | 3 VP | Kinetic / Single | Challenges enemy to a step-off (1.6x WARMTH) and steals their positive buff. |
| Beam Dismount | Path B: Acro-Star (Node 2, Lv. 10) | 4 VP | Kinetic / Splash | High-flying aerial flip (dust FX, 2.1x POW to target + 60% to adjacent enemies). |
| Perfect 10 | Path B Capstone (Node 4, Lv. 24) | 6 VP | Sparkle-Kinetic / Single | Flawless routine with judge scorecard pop-up (3.0x POW, guaranteed Critical Hit). |

### 3. ROSE (The 6-Year-Old Trickster & Timeline Gremlin)
* Classic Roles: Jester / Status Disruptor (Path A) / Shoulder-Rider Berserker (Path B).
* Unique Mechanic ("Shoulder Ride Stance"): If Tom is in the party, Rose can mount Tom's shoulders at the end of any jump move. While mounted, Tom automatically guards Rose, and Rose's skills hit twice (at 100% + 40% potency).
* Complete Animation Mapping (All 9 Existing Animations Kept; real in-game moves):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Boop | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Boops the monster right on the nose (0.9x POW) and delays its turn slightly on the CTB ribbon. |
| SILLY | Signature Special (D-Pad DOWN) | 2 VP | Chatter / Single | Makes ridiculous faces; inflicts Goofed (Confuse) for 2 turns (and adds +200 Warmth to enemy Kindness bar). |
| Peekaboo | Path A: Giggle Gremlin (Node 1, Lv. 2) | 2 VP | Chatter / Single | Hides, then pops out (0.8x WARMTH); pushes the enemy's next turn back 30% on the CTB ribbon. |
| Twirl Tornado | Path A: Giggle Gremlin (Node 2, Lv. 6) | 3 VP | Kinetic / Row | Spins through the Front Row (1.4x POW); enemies get dizzy (-25% accuracy) and any wind-up telegraph is interrupted. |
| Dress-Up Day | Path A: Giggle Gremlin (Node 3, Lv. 12) | 3 VP | Sparkle / Self + Party | Plays dress-up; Rose gains 50% Evasion and pulls the slowest ally straight up the CTB timeline. |
| Monster Under the Bed | Path A Capstone (Node 4, Lv. 21) | 5 VP | Chatter-Sparkle / All | Her bedtime monster turns out to be on her side (dark + confetti FX, 2.0x WARMTH to all enemies, 75% chance to inflict Goofed). |
| Lamby Launch | Path B: Piggyback Kid (Node 1, Lv. 4) | 2 VP | Kinetic / Single | Hurls her stuffed lamb (thrown props FX, 1.5x POW), then climbs onto Tom's shoulders (activates Shoulder Ride Stance). |
| Piggyback Pounce | Path B: Piggyback Kid (Node 2, Lv. 9) | 4 VP | Kinetic / Splash | Leaps off Tom's back (dust FX, 1.9x POW Splash); knocks the target to the Back Row. |
| Lamby Stampede | Path B Capstone (Node 4, Lv. 23) | 6 VP | Kinetic / All | A herd of stuffed lambs stampedes through the formation (burst FX, 2.7x POW to all enemies). |

### 4. AMY (The Runner Mom & Tempo Commander)
* Classic Roles: Time-Mage / Coach Buffer (Path A) / Striker Monk (Path B).
* Unique Mechanic ("Pace Setter"): Every consecutive turn Amy acts without getting knocked down, her Cadence Counter rises (+5% PEP to the whole party per stack, up to +25% PEP).
* Complete Animation Mapping (real in-game moves: 8 attacks + PEP TALK):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Sprint Tackle | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Runner's tackle (1.0x POW). |
| PEP TALK | Signature Special (D-Pad DOWN) | 3 VP | Chatter / Party | Fierce mom-and-coach speech; all allies' next attack or heal deals +50% output. |
| Red Pen | Path A: Head Teacher (Node 1, Lv. 5) | 2 VP | Chatter / Single | Marks the enemy's mistakes in red (1.3x WARMTH); reveals its weaknesses and lowers its GRIT by -25% for 3 turns. |
| Pop Quiz | Path A: Head Teacher (Node 2, Lv. 9) | 3 VP | Chatter / Single | Surprise test (1.2x WARMTH); shows the enemy's next planned move and pushes its turn back 40% on the CTB ribbon. |
| Personal Best | Path A Capstone (Node 4, Lv. 19) | 5 VP | Sparkle / Party | Coaches everyone to a personal best: every party member gains +3 VP, mental debuffs clear, and POW/WARMTH rise +30% for 3 turns. |
| Burpee Blitz | Path B: Marathon Mom (Node 1, Lv. 5) | 2 VP | Kinetic / Single | Burpee flurry (3x 0.5x POW hits) with a fast 0.7 CTB delay, so Amy acts again quickly. |
| Hill Repeats | Path B: Marathon Mom (Node 2, Lv. 11) | 4 VP | Kinetic / Splash | Charges up and down the hill (dust FX, 2.0x POW Splash) and shatters enemy GRIT shields by -30%. |
| Marathon | Path B: Marathon Mom (Node 3, Lv. 16) | 3 VP | Cozy / Party | Sets a runner's rhythm; party gains +30% PEP and immunity to Amber-Stuck for 3 turns. |
| Finish Line | Path B Capstone (Node 4, Lv. 25) | 6 VP | Kinetic-Sparkle / All | Sprints through the formation and breaks the tape (burst + confetti FX, 2.6x POW to all enemies). |

### 5. DEEDEE (The "Registered Nut" Nurse, Baker & Herbalist)
* Classic Roles: Master Healer / Alchemist Baker (Path A) / Garden Druid Controller (Path B).
* Unique Mechanic ("Fresh Out of the Oven"): Whenever Deedee uses a baking skill, she places 1 Warm Crust Token on the party tray (max 3). Any ally (including picky-eater Nara!) can eat a Crust Token as a free bonus action to heal 20% HP.
* Complete Animation Mapping (real in-game moves: 8 attacks + MOON & BACK):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Spit Shine | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Licks a thumb and scrubs the monster's face (1.0x POW). |
| MOON & BACK | Signature Special (D-Pad DOWN) | 4 VP | Cozy / Party | Warm group-hug heal ("Love you to the moon and back!"); restores 40% Max HP + 1.5x WARMTH and grants Tucked In regen. |
| Registered Nut | Path A: Registered Baker (Node 1, Lv. 2) | 2 VP | Cozy / 1 Ally | Retired-RN check-up; heals 1 ally 45% HP and cures 1 debuff. |
| Rhubarb Crisp | Path A: Registered Baker (Node 2, Lv. 8) | 3 VP | Cozy / 1 Ally or Enemy | Serves a steaming slice (kiln FX); heals an ally 60% HP (or +300 Warmth on an enemy's Kindness Bar) and places 1 Warm Crust Token. |
| Wet Floor | Path A: Registered Baker (Node 3, Lv. 14) | 3 VP | Splash / Party | Mops the battlefield (flash FX); purges all party debuffs and the enemy Front Row slips (-30% PEP). |
| Sunday Dinner | Path A Capstone (Node 4, Lv. 21) | 5 VP | Cozy / Party | Sets out a full Sunday dinner; heals the party 40% HP, places 3 Warm Crust Tokens and fills the HEART Meter +30%. |
| Power Walk | Path B: Busy Bee (Node 1, Lv. 4) | 2 VP | Kinetic / Single | Brisk power-walk charge (dust FX, 1.5x POW) that moves Deedee up the CTB ribbon. |
| Wine O'Clock | Path B: Busy Bee (Node 2, Lv. 10) | 3 VP | Cozy / Self | One glass, now and then (glow FX); doubles Deedee's WARMTH for 3 turns. |
| To the Moon & Back (attack) | Path B Capstone (Node 4, Lv. 24) | 5 VP | Cozy-Sparkle / All | Launches the love all the way to the moon and back down on the enemies (glow + burst FX, 2.3x WARMTH to all enemies). Separate from the MOON & BACK heal special. |

### 6. BOPPY (The Grumbling Warden, Angler & Heavy Tank)
* Classic Roles: Provoke Fortress Tank (Path A) / Spicy Pepper Pyromancer (Path B).
* Unique Mechanic ("Stomach Meter / Nobody Gets Past Me"): Boppy has a 3-pip Heartburn Gauge (his stomach, never his joints). Every time he takes a hit while guarding an ally or eats a hot pepper, he gains +1 Heartburn. At 3 pips, his next attack or GRUMBLE triggers an automatic Warden's Counter-Roar that stuns the attacker.
* Complete Animation Mapping (real in-game moves: 8 attacks + GRUMBLE, plus 1 NEW):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Cap Swat | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Swats with his cap (1.1x POW) while complaining that everyone walks too fast. |
| GRUMBLE | Signature Special (D-Pad DOWN) | 2 VP | Chatter / Row + Self | Complains loudly that everyone walks too fast; drops enemy row POW/WARMTH by -30%, pulls aggro to Boppy, and puts Boppy in Guard (-50% damage taken). |
| Cast Line | Path A: Rikers Warden (Node 1, Lv. 3) | 2 VP | Splash / Single | Casts to yank a Back-Row enemy into the Front Row (1.5x POW) and strips its evasion. |
| Recliner Drop | Path A: Rikers Warden (Node 2, Lv. 8) | 3 VP | Kinetic / Single + Self | Drops his recliner on the enemy (1.8x POW) and sits in it: restores 30% HP, Guard (-50% damage) until his next turn, and the Front Row cannot pass him. |
| Big Catch | Path A: Rikers Warden (Node 3, Lv. 14) | 3 VP | Splash / Single | Reels in a monster (2.0x POW), steals its held item and pushes its turn back 40% on the CTB ribbon. |
| The One That Got Away | Path A Capstone (Node 4, Lv. 22) | 5 VP | Splash / All + Party | The legendary fish finally shows up and crashes through every enemy (2.4x POW to all); "Nobody gets past me!": party takes -40% damage for 2 turns. |
| Pepper Breath | Path B: Pepper Champion (Node 1, Lv. 5) | 2 VP | Cozy / Single | Breathes pure pepper (kiln FX, 1.4x WARMTH); +1 Heartburn pip. |
| Hot Pepper | Path B: Pepper Champion (Node 2, Lv. 11) | 3 VP | Cozy / Self + Splash | Eats a hot pepper: +40% POW for 3 turns, +1 Heartburn pip, and scorches the target and neighbors (1.5x WARMTH Splash). |
| Track Star Story (NEW) | Path B: Pepper Champion (Node 3, Lv. 16) | 3 VP | Chatter / All Enemies | Launches into his college cross-country champion story (he started college in 1970); enemies get Drowsy (-30% PEP) and Boppy gains +30% PEP. |
| Ghost Pepper | Path B Capstone (Node 4, Lv. 25) | 6 VP | Cozy / All | The hottest pepper there is (kiln + burst FX, 2.7x POW/WARMTH to all enemies; consumes Heartburn pips for +30% damage per pip). |

### 7. TNB (The Chill Wardrobe Runner, Potter & Horror Director)
* Classic Roles: Support Costumer / Reviver (Path A) / Artisan Mage & Skater (Path B).
* Unique Mechanic ("Quick-Change Rack"): When TNB uses WARDROBE or Quick Change, he rolls out a costume rack that grants the target a themed Genre Costume (Action Hero = +25% POW; Final Girl = Auto-Revive; Cozy Cardigan = +25% WARMTH).
* Complete Animation Mapping (All 9 Existing Animations Kept):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Mug Toss | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Lobs a chipped ceramic studio mug (thrown props FX, 1.0x WARMTH) with a dry pun. |
| WARDROBE | Signature Special (D-Pad DOWN) | 4 VP | Sparkle / 1 Ally | Wardrobe rack rolls out; Revives a knocked-out ally at 60% HP (or heals a living ally for 50% HP + grants Wardrobe Fresh Auto-Revive). |
| Quick Change | Path A: Set Costumer (Node 1, Lv. 3) | 2 VP | Sparkle / 1 Ally | Swaps an ally's outfit mid-turn (flash FX); cures all status effects and grants a Genre Costume buff (+25% POW & GRIT) for 3 turns. |
| Next Stop | Path A: Set Costumer (Node 2, Lv. 8) | 3 VP | Kinetic / Party | Calls in a mass-transit Metro bell chime; moves the entire party forward by 35% on the CTB timeline. |
| Jump Scare | Path A: Set Costumer (Node 3, Lv. 13) | 3 VP | Chatter / Row | Classic horror-movie lighting flash (dark + flash FX, 1.7x WARMTH); freezes enemy row in place (-40% PEP for 2 turns). |
| That's a Wrap | Path A Capstone (Node 4, Lv. 24) | 6 VP | Sparkle-Cozy / All | Multi-part finale clapperboard cut (dark, flash, confetti FX); deals 2.6x WARMTH to all enemies and heals the party for 30% HP. |
| Carve | Path B: Kiln & Longboard (Node 1, Lv. 5) | 2 VP | Kinetic / Single | Carves into the enemy on his longboard (1.5x POW) and cuts -25% off its COOL defense. |
| Kiln Blast | Path B: Kiln & Longboard (Node 2, Lv. 10) | 4 VP | Cozy / Splash | Opens a roaring 2,000-degree pottery kiln (kiln + burst FX, 2.1x WARMTH Splash); melts Amber shields instantly. |
| Bomb the Hill | Path B Capstone (Node 4, Lv. 20) | 5 VP | Kinetic / All | Shreds down a steep LA street on his longboard (dust FX, 2.4x POW/WARMTH to all enemies) and grants TNB 50% Evasion. |

### 8. NARA (The 40-lb Black Labradoodle & Speed Interceptor)
* Classic Roles: Speed Thief / Fetch Striker (Path A) / Pack Mascot & Debuffer (Path B).
* Unique Mechanics (All 3 Existing Traits Preserved):
  1. Picky Eater: Nara refuses standard store-bought healing potions (shakes her head with a huff). She can still be healed by spells (DANCE, MOON & BACK, WARDROBE), and she ONLY eats Chicken Jerky and homemade family food (Tom's Sourdough, Deedee's Rhubarb Crisp and Warm Crust Tokens, Dona Carmen's Pupusas), which heal her for Double (200%) and give her +30% POW!
  2. Frantic Loyalty: Whenever Tom is at 0 HP (or during Chapter 19 when Tom is missing), Nara gains +50% POW and +30% PEP.
  3. Victory Puddle: At the end of every battle (or via skill), Nara does an excited tail-wag and leaves a tiny Happy Puddle.
* Complete Animation Mapping (All 9 Existing Animations Kept):

| Animation Name | Where It Lands | Cost | Element / Target | Effect & Numbers |
| :--- | :--- | :--- | :--- | :--- |
| Jump Up | Starting Basic (D-Pad UP) | 0 VP (+1 VP) | Kinetic / Single | Excited front-paws pounce (1.0x POW) that steals 5 to 15 Coins from the target. |
| PUPPY EYES | Signature Special (D-Pad DOWN) | 2 VP | Sparkle / Single | Irresistible Labradoodle tilt (glow FX); inflicts Smitten (Enemy skips next turn) and adds +250 Warmth to Kindness Bar. |
| Fetch | Path A: Goodest Girl (Node 1, Lv. 2) | 2 VP | Kinetic / Single | Tom throws a ball/prop and Nara chases it down (1.6x POW, guaranteed critical hit if Tom acted right before her). |
| Zoomies | Path A: Goodest Girl (Node 2, Lv. 7) | 3 VP | Kinetic / Multi (4x) | Blurs across the screen in figure-eights (dust FX, 4x 0.45x POW random hits) and boosts Nara's PEP by +40%. |
| Tug of War | Path A: Goodest Girl (Node 3, Lv. 13) | 3 VP | Kinetic / Single | Latches onto the enemy (1.8x POW), steals their held item, and lowers their POW by -25%. |
| SQUIRREL! | Path A Capstone (Node 4, Lv. 22) | 6 VP | Kinetic-Chatter / All | Spots a phantom squirrel behind the enemy formation (burst + dust FX); supersonic 2.8x POW charge through all enemies. |
| Happy Puddle | Path B: Pack Heart (Node 1, Lv. 4) | 2 VP | Splash / Row + Post-Battle | Excited pee puddle (ring FX); makes enemy Front Row slip (drops enemy PEP & Evasion by -30%). Also plays on victory! |
| Wet Dog Shake | Path B: Pack Heart (Node 2, Lv. 9) | 3 VP | Splash / All | Shakes water droplets everywhere (burst FX, 1.5x WARMTH to all enemies) and clears all status effects from Nara. |
| Lonely Howl | Path B Capstone (Node 4, Lv. 18) | 4 VP | Chatter / Party + Enemies | Heart-tugging pack howl; drops all enemies' COOL by -30% and immediately pulls Tom (or TNB) to the very front of the CTB timeline. |

### Shared Animations Placement
* Knock-out collapse & Revive hop: Played at 0 HP and upon receiving WARDROBE / Sourdough revive.
* Low-HP kneel (Nara sits): Played automatically whenever HP drops below 25%.
* Level-up celebration: Played on the 3-second post-battle victory banner whenever a character crosses 100 XP.
* Thrown props & Scene effects (dust, ring, burst, confetti, flash, dark, glow, kiln): Mapped across skills and Tombos above.

---

## 6. Tombos: System Rules & Complete Story-Unlocked Table

### How Tombos Work
1. Trigger & Payment: Select D-Pad LEFT (Tombo) on either Tom's turn or his partner's turn. Tombos cost 0 VP and instead spend 25% (Tier 1), 50% (Tier 2), or 75% (Tier 3) of the party's shared HEART Meter.
2. Instant Turn Sync: Selecting a Tombo immediately pulls the partner up to act alongside Tom without consuming the partner's upcoming slot on the CTB ribbon.
3. Combo Structure Pick: All 2-person combos are strictly "Tombos" (Tom + 1 Partner) in Act I, and four 3-to-4-person "Family Finishes" unlock in Act II & III after the two coasts unite in Chapter 11. Why: Keeping 2-person combos exclusive to Tom reinforces his role as the sole bridge between coasts in Act I, making the unlock of multi-person Family Finishes after the mid-game twist a massive gameplay payoff.

### Complete Tombo Table (3 Per Partner = 21 Tombos + 4 Family Finishes)

#### Tom + Grace Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What Grace Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Dumpling Unboxed (25% HEART) | Ch. 1 Opening: Grace shows Tom her gold soup dumpling squishy outside the taxi. | Uses Unboxing (flash FX) to hold up a glowing velvet display box. | Uses Squishy Squeeze & DANCE (confetti FX). | Heals party for 35% HP, cures all debuffs, and adds +250 Warmth to all enemies. |
| 2. Uncle Spotter (50% HEART) | Ch. 5: Clearing Little Elsewhere Elementary before the Science & Dance Fair. | Steps in with DEFEND as a gymnastics spotter and boosts Grace upward. | Launches into Beam Dismount + Glitter Nails (flash FX). | Deals 2.6x Sparkle-Kinetic damage to all enemies and grants party +30% Crit Rate. |
| 3. Viral Finale (75% HEART) | Ch. 19: Grace sacrifices her prized squishy in the Dead-Letter Abyss to bring Tom back. | Uses Kanji Strike + Final Boss to create a giant neon stage backdrop. | Executes Like and Subscribe into Perfect 10 (confetti + burst FX). | Deals 3.8x Sparkle damage to all enemies, fully heals party HP, and grants 1 Upgrade Mile. |

#### Tom + Rose Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What Rose Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Double-Decker Boop (25% HEART) | Ch. 1: Grump Hollow trail when Rose demands her first shoulder ride. | Uses DEFEND to hoist Rose onto his shoulders and charges forward. | Uses Piggyback Pounce + Boop from atop Tom's head. | Deals 2.2x Kinetic damage, stuns target for 1 turn, and leaves Rose in Shoulder Ride Stance. |
| 2. No-Touch Tickles (50% HEART) | Ch. 10: Rose stows away under Tom's business-class blanket on the plane. | Uses Delta One + Flashcard Flurry to distract the enemy row. | Pops out from the blanket with Peekaboo + Twirl Tornado. | Deals 2.5x Chatter damage to all enemies, inflicts Goofed, and strips all enemy buffs. |
| 3. Stratosphere Splash (75% HEART) | Ch. 19: Rose listens to Tom's headphones in the dark to guide him home. | Uses Button Mash + Final Boss energy wave to launch Rose sky-high. | Drops down with Lamby Stampede + Monster Under the Bed (burst + confetti FX). | Deals 3.7x Kinetic-Chatter damage to all enemies and delays all enemy turns to the back of the CTB ribbon. |

#### Tom + Amy Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What Amy Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Study Guides & Flashcards (25% HEART) | Ch. 5: Tom helps Amy defend her classroom before the Science & Dance Fair. | Fires Flashcard Flurry across the enemy formation. | Follows up with Pop Quiz + PEP TALK. | Deals 2.0x Chatter damage to all enemies and grants Pumped Up (+50% next hit) to the whole party. |
| 2. Sibling Relay (50% HEART) | Ch. 10: Tom and Amy fight On-Time Orton on the wing of the hijacked plane. | Uses Starter Splash + Button Mash to trip the enemy line. | Sprints through with Burpee Blitz + Hill Repeats (dust FX). | Deals 2.8x Kinetic damage to all enemies and pulls all 4 allies to the front of the CTB timeline. |
| 3. Rivituso Finish Line (75% HEART) | Ch. 17: Scaling the 60-story DTLA Glass Tower side by side. | Strikes with Kanji Strike to mark the finish line in glowing light. | Tears through with Marathon + Finish Line (burst FX). | Deals 3.9x Kinetic-Sparkle damage to all enemies and doubles party PEP for 3 turns. |

#### Tom + Deedee Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What Deedee Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Sourdough & Rhubarb (25% HEART) | Ch. 1: Recovering Deedee's stolen pie tin from The Big One in Grump Hollow. | Bakes a fresh loaf with Dutch Oven (kiln FX). | Serves Rhubarb Crisp + MOON & BACK (glow FX). | Restores 65% HP to the entire party, generates 2 Warm Crust Tokens, and melts all Amber debuffs. |
| 2. Kitchen Cleanup (50% HEART) | Ch. 7: Exploring the Deep Archive beneath The Hush Library together. | Uses Starter Splash to soak the enemy formation. | Charges in with Wet Floor + Spit Shine (flash FX). | Deals 2.5x Splash-Kinetic damage to all enemies, purges all party debuffs, and dispels all enemy buffs. |
| 3. To the Moon & First Class (75% HEART) | Ch. 19: Thawing Deedee from stone with the Jefferson Park feast. | Summons Delta One to fly the party over the Moon (glow FX). | Serves Sunday Dinner and wraps everyone in MOON & BACK. | Revives all knocked-out allies, restores 100% Party HP, and deals 3.5x Cozy damage to all enemies. |

#### Tom + Boppy Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What Boppy Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Quiet on the Pier (25% HEART) | Ch. 3: Fishing for Old Iron-Gill together at Cattail Pier. | Uses DEFEND to hold the tackle box and shush the monsters. | Casts Cast Line + GRUMBLE. | Deals 2.1x Splash damage, yanks all Back-Row enemies forward, and drops their POW/WARMTH by -30%. |
| 2. Five-Alarm Dutch Oven (50% HEART) | Ch. 14: Redeeming Boppy from the Warden's Anchor on Rivituso Row. | Traps the enemy formation inside a giant Dutch Oven (kiln FX). | Drops Hot Pepper + Ghost Pepper right inside the pot (burst FX). | Deals 3.0x Cozy damage to all enemies and inflicts -30% GRIT/COOL. |
| 3. Nobody Gets Past Us (75% HEART) | Ch. 19: Boppy wakes up from stone sneezing at the pepper broth. | Steps forward with DEFEND + Final Boss aura. | Reels in Big Catch + Recliner Drop (ring FX). | Deals 3.6x Kinetic damage to all enemies and makes the entire party Invulnerable for 1 full round. |

#### Tom + TNB Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What TNB Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Glaze & Bake (25% HEART) | Ch. 2: Clearing the smog from 2nd Ave and Griffith Park together. | Heats the chamber with Dutch Oven (kiln FX). | Carves in on his longboard (Carve) and fires Kiln Blast. | Deals 2.4x Cozy damage to all enemies and grants the party +25% WARMTH and COOL. |
| 2. First-Class Express (50% HEART) | Ch. 6: Riding the Expo Line tunnels beneath Los Angeles. | Summons Delta One jet-stream down the tracks. | Calls Next Stop and shreds ahead with Bomb the Hill (dust FX). | Deals 2.9x Kinetic damage to all enemies, grants party +30% PEP, and breaks Distance Barriers. |
| 3. Director's Final Cut (75% HEART) | Ch. 19: TNB places his first hand-thrown ceramic cup on the altar to restore Tom. | Unleashes Kanji Strike + Unboxing spotlight beams (flash FX). | Rolls out WARDROBE into That's a Wrap (dark + confetti FX). | Deals 4.0x Sparkle-Cozy damage to all enemies, revives/heals party for 50% HP, and grants Auto-Revive to all. |

#### Tom + Nara Tombos
| Tombo Name & Cost | Unlock Story Beat | What Tom Does (Animation) | What Nara Does (Animation) | Battle Effect |
| :--- | :--- | :--- | :--- | :--- |
| 1. Boule Fetch (25% HEART) | Ch. 2: Nara greets Tom on the 2nd Ave porch. | Throws a crusty golden sourdough loaf across the screen (thrown props FX). | Chases it down with Fetch + Jump Up. | Deals 2.3x Kinetic damage (Guaranteed Crit), steals enemy item/coins, and heals Nara for 30% HP. |
| 2. Bath Time Zoomies (50% HEART) | Ch. 6: Defeating the Acorn Express in the underground tunnels. | Splashes Nara with Starter Splash. | Goes wild with Wet Dog Shake + Zoomies (burst + dust FX). | Deals 2.8x Splash-Kinetic damage to all enemies and clears all debuffs from the party. |
| 3. Unconditional Pack (75% HEART) | Ch. 19: Nara tracks Tom's scent across the Dead-Letter Abyss when the world forgets him. | Hugs Nara and points forward with Final Boss (glow FX). | Unleashes Lonely Howl into SQUIRREL! (burst FX). | Deals 4.2x Kinetic-Chatter damage to all enemies and fills all allies' VP to 10 VP; shatters Fear Barriers. |

#### Four 3+ Person "Family Finishes" (Unlocked in Act II & III, Cost: 75% HEART)
1. LA Meets Little Elsewhere (Tom + TNB + Grace + Rose, Unlocks Ch. 11): Grace and Rose ride TNB's longboard while Tom launches confetti; deals 3.5x Sparkle damage and heals party for 50% HP.
2. Mom's Little Tornadoes (Amy + Grace + Rose, Unlocks Ch. 12): Usable even when Tom is absent in Ch. 19! Amy uses PEP TALK and launches Grace (Beam Dismount) and Rose (Lamby Stampede) into a triple aerial strike; shatters Exhaustion Barriers.
3. 51 Years & Counting (Deedee + Boppy + Tom, Unlocks Ch. 15): Boppy guards Deedee with his recliner while she and Tom bake a spicy rhubarb-sourdough feast; shatters Aging Barriers and grants party Tucked In + Guard.
4. The Eight-Seat Table (All 8 Characters, Unlocks Ch. 20 Finale): Every single family member (ending with Nara's Happy Puddle) piles in for an 8-hit sequence that deals 5.0x All-Element damage and fully restores the party.

---

## 7. Progression, Gear & Keeping Absent Members on Pace

* XP & Leveling Curve: Flat 100 XP per Level from Level 1 to Level 50. Normal battles award 20 to 35 XP; Bosses award 100 XP (an instant guaranteed Level-Up celebration!).
* Stamp Points (SP): Characters gain 1 SP at every 3rd level (Lv. 3, 6, 9...) plus 1 Bonus SP for completing their side quest (Story Bible section 7). Nodes cost 1 SP (Tier 1), 2 SP (Tier 2), 3 SP (Tier 3), and 4 SP (Capstone), so one full path costs 10 SP. Target: about 13 to 14 SP by the finale, enough for one full path plus the first two nodes of the other. That makes the path choice a real specialization. Level gates on each node still apply. Free respec outside battle stays (kid-friendly).
* How Absent Members Keep Pace ("The Family Group Chat" Rule): 100% Shared Story XP. Whenever the story shifts from Little Elsewhere to Los Angeles (or when a character rejoins after multiple chapters away), returning party members automatically match the exact Level and total XP of Tom. A one-tap "Auto-Stamp (Recommended)" button lets younger players spend accumulated SP in one click.
* Gear's Role (3 Slots):
  1. Signature Tool (Weapon): Upgrades POW and WARMTH (e.g., Tom's Mechanical Keyboard -> Switch 2 Pro Controller; Grace's Sparkling Soup Dumpling Squishy; Boppy's Rikers Bass Rod).
  2. Wardrobe Outfit (Armor): Bought from Marguerite at Backlot Wardrobe or Penny's Pockets; upgrades HP, GRIT, and COOL.
  3. Keepsake Charm (Accessory): Grants fun mechanical perks (e.g., Dona Carmen's Pupusa Box = Nara regenerates 10% HP every turn; Delta One Bag Tag = Tom starts battle with +2 VP).

---

## 8. Party & Roster Management

* Act I (Chapters 1 to 10): Follows story canon rosters (Little Elsewhere: Tom, Grace, Rose + 1 of Amy/Deedee/Boppy swapped by talking at Rivituso Row; Los Angeles: Tom, TNB, Nara).
* Act II & III (Chapters 11 to 20): Unlocks the "Boarding Pass Tag-In" System (4 Active Frontline + up to 4 Reserves):
  * On any character's turn, selecting D-Pad DOWN -> Tag Swap swaps them with a reserve family member as a Free Action (0 VP, 0 CTB delay, usable once per character turn).
  * Reserves regenerate +1 VP and +10% HP every round they rest on the bench.
  * No Sudden Wipeouts: If the 4 active members hit 0 HP while reserves are still standing, the reserves automatically leap onto the field ("Backup Arrives!") to continue the fight.
* Behavior When the Story Removes a Member:
  * When a member leaves for story reasons (Boppy in Ch. 10, Deedee & Boppy petrified in Ch. 16, Tom erased in Ch. 18), their equipped Keepsake Charm automatically returns to the inventory AND leaves behind a permanent "Heart-Trace Passive" on the party until they return (e.g., during Ch. 19 when Tom is gone, every party member gains Tom's "No Touching, Please" passive: -20% damage taken when below 50% HP, and Nara's Frantic +50% POW stays active 100% of the time).

---

## 9. Kindness Mechanics: Feeling the Moral in Gameplay

### Dual Win Condition: "Knock Out" vs. "Un-Grump (Kindness Victory)"
Every regular monster in Grump Hollow, Griffith Park, and the Glass Tower is a Friction Sprite (a stressed-out manifestation of mud, traffic, or noise) with both an HP Bar and a pink Warmth Bar:

| Enemy Archetype | What Makes Them Grumpy (Inspect Hint) | Which Family Kindness Action Fills Their Warmth Bar |
| :--- | :--- | :--- |
| Grump Hollow (Mudling, Pond Grump, Bog Toad, Log Lump) | Cold, muddy, and nobody laughs at their croaks. | Rose's SILLY / Peekaboo, Deedee's Rhubarb Crisp / MOON & BACK, or Nara's PUPPY EYES. |
| Griffith Park & LA (Smoglet, Ticket Flurry, Canyon Coyote, Gridlock, Tar Pit Blob) | Stuck in LA traffic, lonely, or overheated. | TNB's Next Stop / WARDROBE, Grace's DANCE / Squishy Squeeze, or Tom's Starter Splash. |
| Stillness Auditors (Clockwork Sentinels, Censors) | Overworked corporate timers afraid of making mistakes. | Amy's PEP TALK / Personal Best or Boppy's Recliner Drop / GRUMBLE. |

* How It Resolves: The moment an enemy's Warmth Bar fills to 100%, a heart bubble pops over its head (glow + confetti FX), it waves goodbye or does a happy hop off-screen, and it counts as defeated immediately!
* Why Players Want to Use Kindness: Un-Grumping an enemy grants +50% Bonus Coins, +20% HEART Meter, and stamps their entry in Grace's Kindness Scrapbook.
* How the Final Battle Uses It: In Chapter 20 Phase 2, Julian Vance petrifies the party's UP (Attack) command. Because the player has spent 40 hours learning that healing, dancing, feeding, and protecting can be targeted at enemies to soothe their root wounds, the player naturally knows to target Julian with MOON & BACK, GRUMBLE, DANCE, SILLY, PEP TALK, PUPPY EYES, WARDROBE, and finally Tom's DEFEND to break his hatred with love.

---

## 10. Difficulty, Accessibility & Pacing Targets

### Three Difficulty / Assist Modes (Toggleable Anytime in Pause Menu)
| Mode | Target Player | Mechanical Adjustments |
| :--- | :--- | :--- |
| Rose Mode (Story / Kid Assist) | Ages 6+ & casual family play | Incoming enemy damage -40%; High-Five timing bonus triggers 100% automatically; a glowing gold cursor highlights the best recommended move each turn; if party wipes, Deedee tosses an emergency Rhubarb Pie to revive everyone once per battle. |
| Grace Mode (Classic SNES Standard) | Ages 9+ to Adults (Default) | Uses the exact numbers, VP regeneration, and boss telegraphs detailed in this bible. |
| Director Mode (Tactical Challenge) | JRPG Veterans | Enemies gain +25% POW and PEP; Bosses require 2 element/Tombo hits to break Stagger shields; item usage limited to 1 snack per round. |

### Encounter Rate, Speed & Fight Length Targets
* Zero Random Encounters: All monsters are visible sprites wandering Grump Hollow, Griffith Park, and dungeons (Chrono Trigger / EarthBound style).
* Instant-Win Overlevel Rule (EarthBound style): If Tom's level is 5+ levels higher than a zone's monsters, touching a monster on the map triggers an instant confetti pop with full XP and Coins without entering the battle screen.
* Speed & Auto Controls: Top-right corner features a one-tap 1x / 2x Speed Toggle and a "Smart Repeat" Auto-Battle button for clearing familiar fights.
* Target Fight Lengths:
  * Normal Encounter: 25 to 40 seconds (2 to 3 timeline cycles).
  * Elite / Mini-Boss: 75 to 90 seconds (4 to 5 timeline cycles).
  * Chapter Boss: 4 to 6 minutes (8 to 12 timeline cycles).

---

## 11. Rewards, Post-Battle Flow & Optional Superbosses

* 3-Second Post-Battle Flow: Victory triggers character cheers, Nara's signature Happy Puddle animation, and a single overlay card showing XP bars ticking up, Coins earned, and any newly unlocked Stamp Points or Tombos (dismissed with a single tap anywhere).
* Two Currencies:
  1. Pocket Coins: Dropped by all enemies (+50% on Kindness wins); spent at Penny's Pockets, Crumb Bakery, Nickel's Shop, and Jefferson Park food stands.
  2. Mint-State Memory Coins: Earned from Bosses, Un-Grumping rare monsters, and side quests; traded to Penny and Nickel in Act III for ultimate weapons and keepsakes.
* Four Optional Post-Twist Superbosses (Chapters 15 to 20):
  1. The 1970 Phantom Cross-Country Team (Whispering Marsh): A 4-runner speed boss that tests Boppy and Amy's timeline manipulation.
  2. The Golden Soup Dumpling Kaiser (Secret Room in Penny's Pockets): Requires Grace's Perfect 10 and Viral Finale Tombo to crack its diamond shell.
  3. The Mega-Squirrel of Griffith Observatory (Griffith Park Peak): A supersonic boss that only Nara's SQUIRREL! and Unconditional Pack Tombo can catch.
  4. The Director's Uncut Nightmare (Soundstage 13 Basement): A 3-phase horror-movie gauntlet created by Wes and Marguerite that tests full 8-character tag swapping.

---

## 12. Phased Implementation Plan (For a Solo Builder Using AI)

| Phase | Deliverable Scope | What to Build & Test Before Moving On |
| :--- | :--- | :--- |
| Phase 1: The 1v1 Turn & VP Core | Tom vs. 1 Mudling in Portrait UI. | Build the CTB timeline math, the 4-way D-Pad Command Cross, HP/VP bars (+2 VP/turn regen), Tom's Button Mash, Starter Splash, and DEFEND, and basic damage formula. |
| Phase 2: 4-Party Roster & Signatures | Ch. 1 Party (Tom, Grace, Rose, Deedee) vs. The Big One. | Add multi-ally targeting, DEFEND intercept redirect, DANCE heal, SILLY confuse, MOON & BACK group heal, and boss intent telegraph icons on the timeline. |
| Phase 3: Kindness Loop & HEART Meter | Dual HP / Warmth Bars & First Tombos. | Add the enemy Warmth Bar, B-button Inspect hints, the 0-to-100% shared HEART Meter, and the Tombo execution hook (syncing Tom + 1 partner animation for 0 VP). |
| Phase 4: Full 8-Cast & Traits | LA Crew (TNB, Nara) + Amy & Boppy. | Hook up all existing character animations, Nara's Picky Eater / Frantic / Happy Puddle traits, Boppy's Heartburn Gauge, Rose's Shoulder Ride, and the Act II 8-character Tag-Swap bench. |
| Phase 5: Stampcards & Story Locks | Progression & Chapter 14 / 19 / 20 Boss Gimmicks. | Build the 8-node Postcard Stampcard UI per character, Shared Story XP sync, Warden Boppy's non-violent Ch. 14 fight, and Julian Vance's Ch. 20 Phase 2 (where Attack locks and support skills target the boss). |
| Phase 6: Kid Polish & Pacing | Rose Mode, 2x Speed & High-Five Timing. | Add the optional A-button "High-Five" sparkle frame, Rose/Grace/Director difficulty toggles, 2x speed button, and EarthBound instant-win overworld touch check. |