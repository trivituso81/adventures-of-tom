# Adventures of Tom: Complete Ability Revamp & Design Plan

## I1. Design Summary

### Overall Approach

* **Active Storytelling in Every Node:** All 8 characters now have 6 active nodes per Stampcard path (12 path skills per character, 96 total across the party). Passive-only nodes have been completely retired so every single Stamp Point buys a button to press, a custom animation, and a character joke.

* **Kindness as a First-Class Tactic:** Every character has 3 to 4 `kindFoe` moves woven naturally into their paths (gifts, food, performances, silly games). Cheering up a Friction Sprite uses the exact same kit as fighting a boss, ensuring the finale's kindness phases feel trained for 40 hours.

* **Trait Engine Synergy:** Path skills actively feed and spend character traits. Tom's skills generate or cash in Upgrade Miles, Grace's skills reward alternating categories to climb her Trending Meter, and Rose's skills smoothly hop on and off Tom's shoulders without wasting turns.

* **Cross-Family Micro-Synergies:** Every character has at least two path moves with a built-in family bonus if a specific relative is in the active party (for example, Grace holding a pose longer if Amy is watching, or Tom serving sourdough straight to Deedee's tray).

* **True Shared Scenes for Tombos:** Tombos are no longer two side-by-side animations. Each of the 21 Tombos and 4 Family Finishes is staged as a single unified activity with its own props, camera framing, and mechanical niche.

* **Cinematic Ultimates:** Node 6 on every path costs 7 to 8 VP and acts as a 4-to-7-second mini-movie with a setup, escalation, punchline, and massive mechanical payoff (or an instant free cast for Tom at 3 Upgrade Miles).

* **Zero Em Dashes & Strict Canon Voice:** All text uses colons, semicolons, parentheses, or periods. Grace and Rose exclusively use "Ta-Ta" in spoken dialogue while all system text refers to "Tom."

### New Stampcard Progression Math

* **Nodes per Path:** 6 nodes per path (A1 to A6, B1 to B6).

* **SP Cost per Node:**

  * Node 1: 1 SP (Gate: Lvl 2 or 3)

  * Node 2: 2 SP (Gate: Lvl 6 or 7)

  * Node 3: 2 SP (Gate: Lvl 11 or 12)

  * Node 4: 3 SP (Gate: Lvl 16 or 17)

  * Node 5: 3 SP (Gate: Lvl 21 or 22)

  * Node 6 (Ultimate): 4 SP (Gate: Lvl 26 or 28)

  * **Total per path:** 15 SP (30 SP for both full paths).

* **SP Earning Rate:** Start at Level 1 with **2 SP**. Earn **+1 SP every 2 levels** (Levels 2, 4, 6 ... 50 = 25 SP from leveling). Combined with **+1 SP per side quest** (assuming 3 to 5 side quests across the 20 chapters), a player reaches 30 to 32 SP by Level 50.

* **Progression Sanity Check (Base Leveling + 1 Side Quest per 12 Levels):**

  * **Level 10:** 2 (start) + 5 (levels) = **7 SP** (unlocks Nodes 1, 2, 3 on Path A + Node 1 on Path B).

  * **Level 20:** 2 + 10 + 1 (quest) = **13 SP** (unlocks up to Node 5 on Path A, poised for Ultimate).

  * **Level 26:** 2 + 13 + 1 (quest) = **16 SP** (unlocks **first Ultimate** right at its Level 26 gate with 1 SP to spare).

  * **Level 30:** 2 + 15 + 2 (quests) = **19 SP** (Path A complete + Nodes 1 to 3 on Path B).

  * **Level 40:** 2 + 20 + 2 (quests) = **24 SP** (Path A complete + up to Node 4 on Path B).

  * **Level 50:** 2 + 25 + 3 (quests) = **30 SP** (Both Path A and Path B 100% complete, both Ultimates unlocked for the finale).

### New Effects & Statuses (Global Registry: 10 Total)

 1. **`NEW EFFECT: mile` (Gain/Spend Upgrade Mile):** Grants `+N` Upgrade Miles to Tom (max 3), or consumes miles for bonus effects.

 2. **`NEW EFFECT: pause` (Freeze-Frame Turn Lock):** Locks target's CTB icon in place for 1 turn so it cannot gain ticks, and guarantees the next hit against it triggers a High-Five sparkle window.

 3. **`NEW EFFECT: trend` (Set/Boost Trending):** Advances Grace's Trending Meter by +1 step immediately (or locks it at `x1.5` for 2 turns so repeating a move does not reset it).

 4. **`NEW EFFECT: choreo` (Linked Follow-Up):** Grants an ally the `Choreographed` buff for 2 turns; whenever Grace acts, that ally performs a free 0.5x basic attack or 10% heal right after her.

 5. **`NEW EFFECT: fort` (Blanket Fort Zone):** Places a party-wide fort for 2 turns that absorbs the first 25% of all incoming group damage and makes the party immune to `Scared Stiff` and `Chilled`.

 6. **`NEW EFFECT: grade` (Red-Pen Rubric):** Marks an enemy with a letter grade (`F`); the next 3 party hits against that target gain +25% crit chance and restore 1 VP to the attacker.

 7. **`NEW EFFECT: tray` (Full Table Spread):** Upgrades Deedee's Warm Crust tokens into **Hot Dish** tokens (eating one as a free action heals 30% HP and cures 1 debuff instead of 20% HP).

 8. **`NEW EFFECT: pace` (1970 Pace Lock):** Sets the CTB turn speed ceiling to Boppy's current PEP for 2 turns; enemies with higher PEP have their turn ticks slowed by 35% ("Nobody walks past me").

 9. **`NEW EFFECT: continuity` (Scene Continuity Snapshot):** Records the target ally's current HP% and buffs; at the end of their next turn, if their HP is lower, restores them back to the recorded snapshot.

10. **`NEW EFFECT: scent` (Tracked Scent):** Marks an enemy with Nara's nose; target cannot hide in the back row, cannot evade, and takes +30% damage from all kinetic and combo moves for 3 turns.

---

## I2. Character Kits (All 8 Characters)

## 1. Tom

**Design Thesis:** Calm, hyper-prepared product director and protective uncle who treats monsters like unruly direct reports, snacks on artisanal sourdough mid-fight, and turns 16-bit JRPG menu mechanics into literal weapons.

* **Path A:** **Bready & Boarded** (Sourdough alchemy, tech unboxings, and Delta One frequent-flyer privileges)

* **Path B:** **Polyglot Player One** (Quizlet kanji streaks, product roadmaps, and classic 16-bit console meta-tricks)

* **Recommended Auto-Stamp Order:** A1 -> B1 -> A2 -> A3 -> B2 -> A4 -> A5 -> A6 (Ultimate 1 at Lvl 26) -> B3 -> B4 -> B5 -> B6.

### Tom's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Button Mash | `mash` | REWORKED | 1 | 0 | 0 | Kinetic | POW | 1.0 | 1 | `enemy` | 1.0 | `+1 VP`, `+5% HEART` | no | 
| Signature | DEFEND | `defend` | KEEP | 1 | 0 | 1 | Kinetic | GRIT | 0.0 | 1 | `ally` | 0.7 | `st bodyguarded 1 ally`, `st guard 1 self`, `mile +1` | no | 
| A1 | Starter Splash | `starter` | KEEP | 2 | 1 | 2 | Splash | WARMTH | 1.25 | 1 | `row` | 1.0 | `st slowed 2 t` (+1 Crust if Deedee in party) | no | 
| A2 | Crumb Shot | `crumb` | NEW | 6 | 2 | 3 | Cozy | WARMTH | 1.4 | 1 | `enemy` | 1.0 | `heal .30 lowest`, `cure amber lowest` | yes | 
| A3 | Mint Unboxing | `unbox` | REWORKED | 11 | 2 | 3 | Sparkle | WARMTH | 0.0 | 1 | `party` | 0.7 | `randbuff 3 party`, `vp +1 others` | yes | 
| A4 | Noise-Canceling | `anc` | NEW | 16 | 3 | 4 | Sparkle | COOL | 1.65 | 1 | `enemy` | 1.0 | `interrupt`, `st shushed 2 t`, `st guard 2 self` | no | 
| A5 | Window Seat | `window` | NEW | 21 | 3 | 5 | Cozy | POW | 1.9 | 1 | `splash` | 1.0 | `ct -0.4 t`, `mile +1` | no | 
| A6 (Ult) | Boarding Group Zero | `delta_ult` | NEW | 26 | 4 | 8 | Cozy | hybrid | 3.4 | 1 | `all` | 1.3 | `refill self`, `heal .35 party`, `shieldBreak` | no | 
| B1 | Flashcard Flurry | `flash` | KEEP | 3 | 1 | 2 | Chatter | WARMTH | 0.55 | 3 | `multi` | 0.7 | `reveal`, `st spotted 2 t` | no | 
| B2 | Kanji Counter | `kanji` | REWORKED | 7 | 2 | 3 | Sparkle | hybrid | 1.6 | 1 | `enemy` | 1.0 | `debuffBonus +50%`, `st cool_down 2 t` | no | 
| B3 | Pause for a Bite | `pause_bite` | NEW | 12 | 2 | 4 | Cozy | WARMTH | 0.0 | 1 | `enemy` | 0.7 | `pause 1 t`, `heal .35 self`, `cure all self` | yes | 
| B4 | Scope Creep | `scope` | NEW | 17 | 3 | 4 | Chatter | WARMTH | 1.45 | 1 | `row` | 1.0 | `st tardy 2 t`, `row back t`, `steal` | no | 
| B5 | 365-Day Streak | `streak` | NEW | 22 | 3 | 5 | Sparkle | POW | 0.65 | 4 | `enemy` | 1.0 | `crit 1` (if Rose in party: `mount`) | no | 
| B6 (Ult) | Cartridge Tilt | `cart_ult` | NEW | 28 | 4 | 8 | Sparkle | POW | 3.8 | 1 | `all` | 1.3 | `goof all`, `st grit_down 3 all`, `st cool_down 3 all` | no | 

### Tom's Ability Cards

### Button Mash (Basic, `mash`)

Menu description: Tom calmly taps a wireless controller while a 16-bit cursor bonks the target. Costs 0 VP.
Spoken line: "Just testing the buttons."
Battle message: "Tom mashes A-A-B-A on the controller!"
Why it is them: Tom has played classic console RPGs his whole life and treats actual combat like a frame-perfect input test.
The joke: He does not even swing a weapon; he clicks a plastic gamepad and reality obeys.
Animation beats:

1. Tom pulls out a grey 16-bit controller and clicks two buttons with deadpan calm (0.3s).

2. A giant white pixel gloved cursor drops from the top of the screen onto the enemy's head (0.3s).

3. IMPACT: The cursor double-clicks the enemy with a crisp "CLICK-BONK!" and a burst of 8-bit stars (0.3s).
   New assets: poses: controller_hold / props: snes_pad, pixel_cursor / scene effects: none / sounds: click_clack

### DEFEND (Signature, `defend` - Enhanced Animation Proposal)

Menu description: Tom steps straight in front of an ally, taking their hits for 1 turn and earning 1 Upgrade Mile.
Spoken line: "No touching, please."
Battle message: "Tom steps in front and puts up a hand!"
Why it is them: Tom is the ultimate protective uncle and partner.
The joke: He stops a charging monster the exact way he stops someone from cutting a boarding line at LAX.
Animation beats:

1. Tom slides smoothly across the floor in front of the chosen ally, raising one open palm (0.3s).

2. A velvet airport stanchion rope snaps into place across the ally with a golden `DIAMOND MEDALLION +1` chime (0.4s).

3. IMPACT: Tom adjusts his collar with a glint on his glasses (0.2s).
   New assets: poses: palm_stop / props: velvet_stanchion / scene effects: medallion_glint / sounds: seatbelt_ding

### Starter Splash (A1, `starter`)

Menu description: Tom opens Bready Mercury's jar and burps a wave of bubbly sourdough starter across a row, slowing enemies.
Spoken line: "Bready Mercury needed a feeding anyway."
Battle message: "Bready Mercury bubbles over onto the enemy row!"
Why it is them: Tom tends to his real-life sourdough starter named Bready Mercury with scientific devotion.
The joke: The starter has a tiny pixel Freddie Mercury crown and mustache drawn on the mason jar.
Animation beats:

1. Tom holds up a glass mason jar labeled "BREADY" that vibrates violently (0.4s).

2. He pops the lid and a frothy, stretchy wave of doughy bubbles erupts across the enemy row (0.5s).

3. IMPACT: Enemies are coated in sticky starter drips (`Slowed`); if Deedee is in the party, a stray dollop lands in her oven and bakes into +1 Warm Crust (0.5s).
   New assets: poses: none / props: starter_jar / scene effects: dough_wave / sounds: wet_bubble_pop

### Crumb Shot (A2, `crumb`)

Menu description: Tom slices a warm sourdough boule; the fragrant steam heals the most hurt ally (or cheers up a monster) while the crusty heel bonks the foe.
Spoken line: "Look at the open crumb on that loaf."
Battle message: "Tom slices a fresh boule of sourdough!"
Why it is them: Every sourdough baker is obsessed with showing off the "crumb" (the airy holes inside the bread).
The joke: He stops mid-battle to make the monster admire the fermentation bubbles before hitting it with the crust.
Animation beats:

1. Tom sets a cutting board down in mid-air and saws through a golden boule with a bread knife (0.5s).

2. He holds the two halves open toward the camera; a warm golden `COZY` aroma wave floats to the lowest-HP ally (or target monster if used as `kindFoe`) with floating hearts (0.5s).

3. IMPACT: Tom flicks the rock-hard crusty heel like a frisbee straight into the enemy's nose (0.4s).
   New assets: poses: bread_show / props: boule_halves, cutting_board / scene effects: aroma_hearts / sounds: crusty_crunch

### Mint Unboxing (A3, `unbox`)

Menu description: Tom peels the plastic film off a brand-new gadget box, giving the whole party a random stat boost and +1 VP. Can be gifted to cheer up a monster.
Spoken line: "Wait, listen to the plastic peel."
Battle message: "Tom unboxes a brand-new gadget!"
Why it is them: Tom loves new tech gadgets and savors the ritual of opening the box cleanly.
The joke: Even stressed-out monsters pause in pure satisfaction when someone peels screen-protector film slowly.
Animation beats:

1. A sleek minimalist white tech box drops into Tom's hands; the screen dims slightly (0.4s).

2. Tom slowly pulls a sparkling plastic film strip off the box with a long, heavenly "sssshhhh-peel" sound (0.6s).

3. IMPACT: The lid floats off in a burst of golden `NEW TECH SMELL` sparkles, showering the party (or target monster) in confetti and buffs (0.5s).
   New assets: poses: peel_film / props: white_gadget_box / scene effects: golden_unbox_glow / sounds: slow_plastic_peel

### Noise-Canceling (A4, `anc`)

Menu description: Tom slips on over-ear headphones and taps Active Noise Cancellation, interrupting a boss wind-up, Shushing the target, and Guarding himself.
Spoken line: "Sorry, you're on mute."
Battle message: "Tom switches on Active Noise Cancellation!"
Why it is them: As a bi-coastal flyer and product director, noise-canceling headphones are Tom's armor against chaos.
The joke: Turning on his headphones physically deletes the monster's soundwaves from the room.
Animation beats:

1. Tom places sleek silver headphones over his ears and presses the side button (0.4s).

2. All game audio drops to dead silence for half a second as an inverted grey soundwave ring expands from Tom's head (0.5s).

3. IMPACT: The ring slams into the enemy, shattering its megaphone/wind-up icon into muted `X` symbols (0.4s).
   New assets: poses: headphones_on / props: anc_headphones / scene effects: silence_ring / sounds: anc_vacuum_hum

### Window Seat (A5, `window`)

Menu description: Tom pulls down a first-class airplane window shade on the target and its neighbors, knocking their turns back and earning 1 Upgrade Mile.
Spoken line: "Window shade stays down for the movie."
Battle message: "Tom claims seat 2A and lowers the shade!"
Why it is them: Tom flies Delta One constantly and always books the window seat.
The joke: A full airplane fuselage wall materializes in the middle of a marsh or school hallway just so Tom can shut the shade on a monster's face.
Animation beats:

1. An oval airplane window frame appears directly in front of the target enemy row (0.4s).

2. Tom leans in from the side in a plush armchair, sips pre-departure sparkling water, and reaches for the shade handle (0.5s).

3. IMPACT: Tom slams the window shade down with a heavy `THUD`, flattening the target and splashing its neighbors while a `MILES +1` counter ticks up (0.5s).
   New assets: poses: lounge_sip / props: plane_window_frame / scene effects: miles_ticker / sounds: shade_slam

### Boarding Group Zero (A6 Ultimate, `delta_ult`)

Menu description: Ultimate. Tom summons a cross-country Delta One red-eye flight that breaks boss shields, hits all foes, heals the party 35%, and refills Tom's VP to 10.
Spoken line: "Thank you for being a Million Miler. Goodnight."
Battle message: "Now boarding Group Zero! Nonstop service through the enemy line!"
Why it is them: The ultimate expression of Tom's coast-to-coast life between LA and the East Coast family.
The joke: Tom gets a full eight hours of sleep under a duvet while the airplane itself runs over the monsters.
Animation beats:

1. Letterbox bars slide in; a boarding gate scanner beeps green (`PRIORITY BOARDING`) and rolls a red carpet across the stage (1.0s).

2. Tom taps his phone, walks through a glowing boarding door, and reclines a lie-flat pod seat to 180 degrees with a sleep mask and warm towel (1.5s).

3. The camera pulls back to show a massive pixel wide-body jet engines roaring to life with `COZY` cabin glow and `KINETIC` thrust (1.2s).

4. IMPACT: The jet streaks across the entire enemy formation in a blinding contrail, shattering shields into boarding-pass confetti while hot towels rain down to heal the party (1.5s).
   New assets: poses: lie_flat_sleep / props: gate_scanner, widebody_jet, hot_towel / scene effects: contrail_sweep / sounds: jet_takeoff_roar

### Flashcard Flurry (B1, `flash`)

Menu description: Tom flicks three rapid-fire Japanese vocabulary flashcards at random foes, revealing their weaknesses and Spotting them.
Spoken line: "Read the radical, not just the kanji."
Battle message: "Tom deals out a three-card Quizlet blitz!"
Why it is them: Tom practices Japanese flashcards every single day without missing his streak.
The joke: The flashcards grade the monsters' elemental weaknesses on the back in bold red hiragana.
Animation beats:

1. Tom fans a deck of glowing index cards in one hand like a magician (0.3s).

2. He flicks three cards across the screen in crisp succession (`ビシ! バシ! ドン!`) (0.5s).

3. IMPACT: The cards flip over on the enemies' foreheads, stamping their elemental weakness icons above their heads (0.4s).
   New assets: poses: card_flick / props: kanji_cards / scene effects: kana_stamps / sounds: triple_card_snap

### Kanji Counter (B2, `kanji`)

Menu description: Tom draws a giant glowing brushstroke character in the air that slashes a foe for +50% damage if it has any debuff, lowering its COOL.
Spoken line: "Stroke order matters. Top to bottom, left to right."
Battle message: "Tom writes a four-stroke takedown!"
Why it is them: Learning kanji stroke order is one of Tom's favorite mental puzzles.
The joke: If the monster is already debuffed, the kanji changes to the character for "Discounted/Half-Off" (`半`).
Animation beats:

1. Tom holds an oversized calligraphy brush and traces four glowing neon strokes in mid-air (0.5s).

2. The completed character (`破` - Break) hangs in the air and catches fire with `SPARKLE` light (0.4s).

3. IMPACT: Tom taps the final dot with the butt of the brush, launching the massive character straight through the target (0.4s).
   New assets: poses: brush_stance / props: giant_ink_brush / scene effects: neon_kanji_slash / sounds: brush_whoosh_gong

### Pause for a Bite (B3, `pause_bite`)

Menu description: Tom pauses the battle in greyscale, locks an enemy's turn icon in place for 1 turn, and eats a slice of buttered sourdough to heal 35% HP and cure himself. Can be shared with a monster (`kindFoe`).
Spoken line: "Hold on, let me check my inventory."
Battle message: "Tom hits START and pauses the battle!"
Why it is them: Combines his love of classic JRPG pause menus with his homemade sourdough.
The joke: The monster is frozen mid-growl in greyscale while Tom casually eats toast right in front of its nose.
Animation beats:

1. Tom presses START; the screen flashes into greyscale and a retro blue `PAUSE` box drops over the target enemy, freezing its sprite and CTB icon (0.5s).

2. In full color, Tom opens a tiny `ITEMS` sub-menu, selects `SOURDOUGH TOAST`, and takes a loud, happy bite (or hands the toast to the monster if `kindFoe`) (0.6s).

3. IMPACT: Tom presses START again; color snaps back with a `DING` and a Guaranteed High-Five sparkle locks onto the frozen foe (0.3s).
   New assets: poses: toast_bite / props: buttered_toast, retro_pause_box / scene effects: greyscale_freeze / sounds: snes_pause_chime

### Scope Creep (B4, `scope`)

Menu description: Tom drops a 40-page product requirements doc on an enemy row, stealing a buff, pushing them to the back row, and making them Tardy.
Spoken line: "Per my last email, that's out of scope."
Battle message: "Tom moves the enemy's action into Q4 Backlog!"
Why it is them: Tom is a product director who knows how to ruthlessly deprioritize a bad feature request.
The joke: He literally drags the monster's sprite across a Kanban board column labeled `ICEBOX`.
Animation beats:

1. A translucent holographic Kanban board (`TO DO | IN PROGRESS | BACKLOG`) appears behind the enemy row (0.4s).

2. Tom points a laser pointer at the enemies; sticky notes plaster over their buffs and peel one buff back to Tom (0.5s).

3. IMPACT: A giant cursor grabs the enemy row and drags them backward into the `BACKLOG` column with a heavy slide-whistle thud (0.5s).
   New assets: poses: laser_point / props: kanban_grid, sticky_notes / scene effects: column_drag / sounds: mac_trash_crunch

### 365-Day Streak (B5, `streak`)

Menu description: Tom unleashes a 4-hit guaranteed-crit combo powered by a full year of unbroken study streaks. If Rose is in the party, she hops onto his shoulders at the end!
Spoken line: "Three hundred and sixty-five days. Do NOT break my streak!"
Battle message: "Tom's study streak hits 365 days! Unstoppable focus!"
Why it is them: Tom guards his daily language streak on his phone even across time zones.
The joke: The tiny flame icon from a study app grows into an absurd Super Saiyan pillar of productivity energy.
Animation beats:

1. Tom's phone chimes; a tiny orange streak flame icon pops above his head reading `364... 365!` (0.4s).

2. Tom blurs forward in four lightning-fast strikes punctuated by golden calendar page tears (`JAN! APR! JUL! DEC!`) (0.6s).

3. IMPACT: A giant golden `365` badge stamps the target for a guaranteed critical finish; if Rose is present, she cheers and vaults onto his shoulders (0.4s).
   New assets: poses: rapid_palm_combo / props: streak_flame_badge / scene effects: calendar_burst / sounds: streak_fanfare

### Cartridge Tilt (B6 Ultimate, `cart_ult`)

Menu description: Ultimate. Tom blows the dust out of the game's own cartridge and tilts the stage, dealing massive damage to all foes, Goofing them, and shredding GRIT and COOL.
Spoken line: "That was UNCALLED for! Give me the cartridge."
Battle message: "Tom pulls the game cartridge out and blows the dust!"
Why it is them: Every 90s kid who grew up on 16-bit consoles knows the ultimate fix when a boss cheats.
The joke: Tom reaches outside the fourth wall of his own video game to blow into the connector pins.
Animation beats:

1. Letterbox bars snap in; Tom looks at the camera, shakes his head, and reaches UP past the top of the screen frame (1.0s).

2. The entire battle screen shrinks into a grey 16-bit plastic game cartridge labeled `ADVENTURES OF TOM` held in giant pixel hands (1.2s).

3. A huge gust of wind (`WHOOOOSH!`) blows across the bottom of the screen, sending dust clouds and scrambled rainbow glitch bars rolling through the enemy side (1.3s).

4. IMPACT: Tom slams the cartridge back into the console (`KA-CHUNK!`); the whole stage tilts 30 degrees, dumping every enemy onto their heads in a massive `SPARKLE` explosion (1.5s).
   New assets: poses: reach_up_fourth_wall / props: game_cartridge_frame / scene effects: scanline_glitch, stage_tilt / sounds: cartridge_blow_clunk

## 2. Grace

**Design Thesis:** Nine-year-old gymnast, self-appointed family choreographer, and YouTube lifestyle creator who alternates between dazzling acro-stunts and ring-light glamour to keep her Trending Meter at `x1.5`.

* **Path A:** **Creator Studio** (Gold soup-dumpling squishy care, ring lights, unboxings, and viral positivity)

* **Path B:** **Center-Stage Acro** (Floor routines, beam dismounts, bossy sister choreography, and Olympic 10s)

* **Recommended Auto-Stamp Order:** A1 -> B1 -> A2 -> B2 -> A3 -> B3 -> A4 -> A5 -> A6 (Ultimate 1 at Lvl 26) -> B4 -> B5 -> B6 (alternating paths maximizes her Trending Meter variety early).

### Grace's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Cartwheel Kick | `cartwheel` | KEEP | 1 | 0 | 0 | Kinetic | POW | 1.0 | 1 | `enemy` | 0.7 | `+1 VP`, `+5% HEART` | no | 
| Signature | DANCE | `dance` | KEEP | 1 | 0 | 3 | Sparkle | WARMTH | 0.0 | 1 | `party` | 1.0 | `heal .25 party`, `cure 1 party` | yes | 
| A1 | Squishy Squeeze | `squishy` | KEEP | 2 | 1 | 2 | Cozy | WARMTH | 0.0 | 1 | `ally` | 0.7 | `heal .45 ally`, `cure 1 ally` | yes | 
| A2 | Glitter Nails | `nails` | KEEP | 6 | 2 | 3 | Sparkle | WARMTH | 0.0 | 1 | `party` | 1.0 | `st glitter_nails 3 party` | yes | 
| A3 | Ring Light Check | `ringlight` | NEW | 11 | 2 | 3 | Sparkle | WARMTH | 1.45 | 1 | `row` | 1.0 | `reveal`, `st dizzy 2 t`, `st spotlight 2 self` | no | 
| A4 | Dumpling Drop | `dumpling` | NEW | 16 | 3 | 4 | Cozy | WARMTH | 1.75 | 1 | `splash` | 1.0 | `st smit 1 main`, `cure amber party` | yes | 
| A5 | Collab Tag | `collab` | NEW | 21 | 3 | 4 | Chatter | WARMTH | 0.0 | 1 | `ally` | 0.7 | `ct +0.5 ally`, `st pumped_up 1 ally`, `trend +1` | no | 
| A6 (Ult) | Ten Million Subscribers | `viral_ult` | NEW | 26 | 4 | 7 | Sparkle | WARMTH | 3.2 | 1 | `all` | 1.3 | `heal .50 party`, `st glitter_nails 3 party`, `trend lock 2` | yes | 
| B1 | Dance Battle | `battle` | KEEP | 3 | 1 | 2 | Chatter | PEP | 1.3 | 1 | `enemy` | 0.7 | `steal`, `st heckled 2 t` | no | 
| B2 | Five-Six-Seven-Eight! | `choreo_count` | NEW | 7 | 2 | 3 | Chatter | WARMTH | 0.0 | 1 | `ally` | 0.7 | `choreo 2 ally`, `st pep_up 2 ally` | no | 
| B3 | Beam Dismount | `beam` | REWORKED | 12 | 2 | 4 | Kinetic | POW | 1.65 | 1 | `splash` | 1.0 | `interrupt`, `st staggered 1 main` | no | 
| B4 | Split Leap | `splitleap` | NEW | 17 | 3 | 4 | Kinetic | POW | 1.5 | 1 | `row` | 0.7 | `st evasive 2 self` (if Rose in party: `heal .20 rose`) | no | 
| B5 | Chalk Up | `chalk` | NEW | 22 | 3 | 5 | Sparkle | POW | 0.7 | 3 | `enemy` | 1.0 | `st grit_down 2 t`, `crit +50%` (if Amy in party: `crit 1`) | no | 
| B6 (Ult) | Diamond Leotard Finale | `olympic_ult` | NEW | 28 | 4 | 8 | Kinetic | hybrid | 3.9 | 1 | `enemy` | 1.3 | `crit 1`, `shieldBreak`, `ct +1.0 others` | no | 

### Grace's Ability Cards

### Cartwheel Kick (Basic, `cartwheel`)

Menu description: Grace snaps off a textbook one-handed cartwheel that taps the foe on the chin. Costs 0 VP.
Spoken line: "Point your toes, Ta-Ta, watch!"
Battle message: "Grace whips through a crisp cartwheel!"
Why it is them: Grace does cartwheels down every hallway, grocery aisle, and airport concourse.
The joke: She judges her own landing with a little nod before returning to her spot.
Animation beats:

1. Grace raises both arms like a gymnast saluting the judges (0.2s).

2. She cartwheels across the stage in a sparkling arc (0.4s).

3. IMPACT: Her pointed toe bonks the enemy's chin on the upswing before she sticks the landing (0.3s).
   New assets: poses: gymnast_salute / props: none / scene effects: toe_sparkle / sounds: whoosh_tap

### DANCE (Signature, `dance` - Enhanced Animation Proposal)

Menu description: Grace leads an upbeat eight-count dance break that heals the party 25% HP and cures 1 debuff. Can cheer up monsters!
Spoken line: "Everybody on the beat! Five, six, here we go!"
Battle message: "Grace kicks off a family DANCE BREAK!"
Why it is them: Grace loves choreographing the whole family in the living room.
The joke: Even grumpy Boppy and Tom do a tiny synchronized shoulder-shimmy on beat three.
Animation beats:

1. Big pixel text `DANCE BREAK!` flashes overhead as a disco ring-light ball drops from the top of the screen (0.4s).

2. Grace hits a three-pose pop routine (`hip pose -> twirl -> peace sign`) while all standing allies bounce in sync (0.6s).

3. IMPACT: Pink musical notes and sparkles wash over the party (or target monster), restoring HP (0.4s).
   New assets: poses: peace_sign_pose / props: mini_disco_ring / scene effects: sync_party_bounce / sounds: pop_synth_chord

### Squishy Squeeze (A1, `squishy`)

Menu description: Grace lets an ally (or a stressed monster) squeeze her prized diamond-gold soup dumpling squishy, healing 45% HP and curing a debuff.
Spoken line: "Be super gentle! It's slow-rising!"
Battle message: "Grace shares her diamond gold soup dumpling squishy!"
Why it is them: Her sparkling gold soup dumpling squishy is her most treasured possession in Chapter 1 and Chapter 19.
The joke: She watches like a hawk to make sure the person does not crease the foam.
Animation beats:

1. Grace reverently presents a velvet pillow holding a glittering golden soup dumpling squishy (0.4s).

2. Two pixel hands give it a big `SQUIIIISH` down to a pancake (0.4s).

3. IMPACT: As the dumpling slowly rises back into shape with a golden sparkle, warm healing light wraps the target (0.5s).
   New assets: poses: present_squishy / props: gold_dumpling_squishy / scene effects: slow_rise_glow / sounds: foam_squish_chime

### Glitter Nails (A2, `nails`)

Menu description: Grace gives everyone a speed manicure with holo-glitter polish, boosting party crit chance by 25% and reflecting 20% damage for 3 turns. Monsters love it too (`kindFoe`).
Spoken line: "Hold still, don't smudge the top coat!"
Battle message: "Grace applies holographic glitter nails to the squad!"
Why it is them: Grace is fashion-forward and obsessed with sparkly manicures.
The joke: Putting holo-glitter nail polish on Tom, Boppy, and Nara's paws makes their attacks refract lasers.
Animation beats:

1. Grace pulls out a giant bottle of pink holographic nail polish and blows on the brush (0.4s).

2. She zips past each party member (or target foe) with three rapid `SWIPE-SWIPE-SWIPE` sparkle strokes (0.5s).

3. IMPACT: Everyone holds up their hands/paws and wiggles their fingers as rainbow lens flares ping off their nails (0.4s).
   New assets: poses: nail_wiggle / props: holo_polish_bottle / scene effects: nail_flare / sounds: sparkle_ting

### Ring Light Check (A3, `ringlight`)

Menu description: Grace turns a blinding 18-inch LED ring light onto an enemy row, revealing weaknesses, Dizzying them, and drawing their attention (`Spotlight`).
Spoken line: "Hold on, the lighting in here is terrible!"
Battle message: "Grace sets up her tripod and cranks the ring light to 100%!"
Why it is them: Every good YouTube video starts with setting up the ring light.
The joke: The monsters are caught like deer in headlights trying to find their good angle.
Animation beats:

1. Grace snaps open a tall tripod with a glowing circular LED light in front of herself (0.4s).

2. She clicks the inline remote three times: `WARM -> COOL -> ULTRA BRIGHT!` (0.4s).

3. IMPACT: A blinding circular halo flashes across the enemy row, leaving purple afterimage rings spinning around their heads while Grace strikes a model pose in the glow (0.5s).
   New assets: poses: tripod_pose / props: led_ring_light / scene effects: halo_flash / sounds: camera_shutter_flash

### Dumpling Drop (A4, `dumpling`)

Menu description: Grace calls in her entire bedroom collection of giant plush squishies to rain down on a target and its neighbors, Smittening the main foe and thawing Amber on the party.
Spoken line: "Welcome to my full Squishy Collection Tour!"
Battle message: "An avalanche of collectible squishies rains from the sky!"
Why it is them: Grace collects dozens of squishies and loves showing off the whole collection at once.
The joke: Being buried under fifty soft foam pastries is both damaging and impossible to stay mad at (`kindFoe`).
Animation beats:

1. Grace unzips a sparkly pastel backpack that is Comically Overstuffed (0.4s).

2. A geyser of pixel squishies (boba tea, macarons, strawberries, and the giant gold soup dumpling) launches into the air (0.5s).

3. IMPACT: The giant gold dumpling lands squarely on the main target (`BOING!`) while smaller squishies bounce across neighbors and knock off any grey Amber crystals on allies (0.6s).
   New assets: poses: backpack_unzip / props: squishy_assortment / scene effects: pastel_bounce_wave / sounds: multi_boing_squeak

### Collab Tag (A5, `collab`)

Menu description: Grace brings an ally into the frame for a "Special Guest Collab," pulling their turn forward 50%, Pumping Up their next move, and boosting her Trending Meter.
Spoken line: "Guys, look who's on the channel today! Say hi!"
Battle message: "Grace tags an ally in for a Special Guest Collab!"
Why it is them: She treats family adventures like high-profile creator collaborations.
The joke: She slaps a floating `@GUEST_STAR` tag onto Tom or Boppy while pointing an arrow at them like a YouTube thumbnail.
Animation beats:

1. Grace dashes next to the target ally and throws one arm around their shoulder, holding up an invisible selfie camera (0.4s).

2. A bright red YouTube-style thumbnail arrow and glowing circle frame the ally with the text `FEATURING!!` (0.4s).

3. IMPACT: The shutter clicks; the ally glows with `PUMPED UP` energy and slides forward on the CTB turn ribbon as Grace's Trending bar ticks up (0.4s).
   New assets: poses: selfie_arm_wrap / props: thumbnail_red_arrow / scene effects: viewfinder_frame / sounds: subscribe_bell_ding

### Ten Million Subscribers (A6 Ultimate, `viral_ult`)

Menu description: Ultimate. Grace goes live for her Diamond Play Button unboxing stream, blasting all foes with Sparkle light, healing the party 50%, granting Glitter Nails, and locking her Trending Meter at `x1.5`.
Spoken line: "Don't forget to smash that like button, Ta-Ta! We're trending number one!"
Battle message: "Grace's stream hits 10,000,000 subscribers! Diamond Play Button unlocked!"
Why it is them: The ultimate fantasy of Grace's YouTube channel persona combined with her role as the party's Cleric.
The joke: A literal storm of thumbs-up icons, flying hearts, and a giant diamond plaque turns the battlefield into a livestream party.
Animation beats:

1. Letterbox bars appear; a livestream overlay frames the screen with a viewer counter rapidly spinning from `999` to `10,000,000!` (1.2s).

2. A golden drone flies in and drops a giant sparkling `DIAMOND PLAY BUTTON` plaque into Grace's hands; she gasps with hands on her cheeks (1.2s).

3. Grace holds the diamond plaque overhead; it catches the stage lights and fires a prism rainbow beam across the entire screen while thousands of pixel `LIKE` thumbs and pink hearts scroll upward (1.5s).

4. IMPACT: The diamond beam explodes across all enemies (`SPARKLE`) while a shower of golden confetti heals the party 50% HP and locks `TRENDING MAX x1.5!` on Grace's HUD (1.3s).
   New assets: poses: gasp_cheeks, hoist_plaque / props: diamond_play_button, stream_overlay / scene effects: scrolling_hearts_storm / sounds: crowd_cheer_bell_symphony

### Dance Battle (B1, `battle`)

Menu description: Grace challenges an enemy to a 1v1 dance-off, stealing one of its buffs and leaving it Heckled for 2 turns.
Spoken line: "Oh, you think you can out-dance ME? Your turn!"
Battle message: "Grace serves the enemy in a Dance Battle!"
Why it is them: Grace is fiercely confident in her dance moves and never backs down from a challenge.
The joke: She hits a move so clean that the enemy's own buff icon gets embarrassed, leaves the monster, and walks over to Grace.
Animation beats:

1. A spotlight snaps onto Grace and the target enemy; a cardboard floor mat unrolls between them (0.4s).

2. Grace hits a lightning-fast spin into a freeze pose (`hip pose`) and points at the enemy (0.4s).

3. IMPACT: A boombox bass drop blasts the enemy; its buff icon sprouts little legs, applauds Grace, and hops onto her side (0.5s).
   New assets: poses: floor_freeze / props: cardboard_mat, boombox / scene effects: spotlight_pair / sounds: scratch_bass_drop

### Five-Six-Seven-Eight! (B2, `choreo_count`)

Menu description: Grace counts an ally into her routine, boosting their PEP and linking them (`Choreographed`) so they perform a free follow-up move after Grace's turns for 2 turns.
Spoken line: "Watch my counts! Five, six, seven, eight, and HIT!"
Battle message: "Grace puts an ally on her eight-count!"
Why it is them: Grace is a bossy big sister who loves directing everyone else's blocking and timing.
The joke: She taps a choreographer's cane and puts glowing numbered footstep stickers (`1-2-3-4`) under her teammate's feet.
Animation beats:

1. Grace puts on a tiny headset mic and claps four times on beat (`5! 6! 7! 8!`) (0.4s).

2. Glowing neon dance-step footprints (`L - R - SPIN`) light up on the floor underneath the target ally (0.4s).

3. IMPACT: Grace and the ally hit matching jazz-hand poses in unison with a synchronized chime (0.4s).
   New assets: poses: headset_clap / props: headset_mic, floor_footprints / scene effects: unison_spark / sounds: metronome_clap

### Beam Dismount (B3, `beam`)

Menu description: Grace vaults off a regulation balance beam into a double pike onto a foe and its neighbors, interrupting wind-ups and Staggering the main target.
Spoken line: "Shoulders back, eyes on the end of the beam!"
Battle message: "Grace nails a double-pike Beam Dismount!"
Why it is them: Grace is a dedicated gymnast who practices balance beam dismounts everywhere.
The joke: A full 16-foot suede balance beam materializes mid-battle just so she can flip off the end of it.
Animation beats:

1. Grace hops onto a regulation gymnastics balance beam that pops up behind the party and does a quick scale balance pose (0.4s).

2. She runs two steps down the beam and launches high into the top of the screen in a tight double-tuck flip (0.5s).

3. IMPACT: Grace drives both feet through the target enemy's head on the way down (`STAGGER!`), bouncing into a crisp two-foot landing on a blue mat (0.5s).
   New assets: poses: scale_balance, double_tuck / props: balance_beam, landing_mat / scene effects: shockwave_mat / sounds: springboard_thwack

### Split Leap (B4, `splitleap`)

Menu description: Grace soars across an entire enemy row in a 180-degree split leap, gaining 50% evasion (`Evasive`) for 2 turns. If Rose is in the party, Grace winks and heals Rose 20% HP.
Spoken line: "Did you see my height, Rose? Total one-eighty!"
Battle message: "Grace sails over the enemy row in a Split Leap!"
Why it is them: Grace always looks out for her little sister Rose while showing off her best gymnastics leaps.
The joke: She clears the monsters' heads so effortlessly that they swing at empty air underneath her.
Animation beats:

1. Grace takes a two-step chassé run toward the enemy row (0.3s).

2. IMPACT: She explodes upward into a mid-air 180-degree split leap, slicing a glittering ribbon trail across the entire enemy row (0.5s).

3. She lands lightly in an evasive stance; if Rose is in the party, Grace tosses her a heart wink that heals Rose (0.4s).
   New assets: poses: midair_split_leap / props: rhythmic_ribbon / scene effects: ribbon_slash_arc / sounds: harp_gliss_slice

### Chalk Up (B5, `chalk`)

Menu description: Grace claps a cloud of gymnastics grip chalk into an enemy's eyes (GRIT down) before landing a 3-hit tumbling pass with +50% crit chance (100% crit if Amy is watching!).
Spoken line: "Mom, watch this pass! Don't look at your phone!"
Battle message: "Grace claps the chalk bowl and hits a tumbling pass!"
Why it is them: Gymnasts chalk their hands before every big bar or floor pass, and Grace always wants her mom Amy watching.
The joke: The chalk cloud acts like a cartoon smoke bomb before Grace comes flying out of it.
Animation beats:

1. Grace dips both hands into a standing gymnastics chalk bowl and claps them together (`POOF!`) (0.4s).

2. A thick white cloud of grip chalk blows into the enemy's face, dropping its GRIT (0.3s).

3. IMPACT: Grace bursts through the chalk cloud in a `roundoff -> back handspring -> layout` 3-hit combo (`BAM-BAM-CRACK!`); if Amy is in the party, Amy holds up a `YES!` sign for guaranteed crits (0.6s).
   New assets: poses: chalk_clap, back_handspring / props: chalk_stand / scene effects: white_chalk_poof / sounds: clap_poof_thud

### Diamond Leotard Finale (B6 Ultimate, `olympic_ult`)

Menu description: Ultimate. Grace performs a championship floor routine that shatters boss shields, lands a guaranteed critical hit, and pulls every ally's turn to the very front of the ribbon.
Spoken line: "And for my final pass... tens across the board!"
Battle message: "Grace steps onto the championship floor mat! Perfect 10.0!"
Why it is them: Combines Grace's gymnastics dreams, her sparkly fashion sense, and her leadership over the party's turn rhythm.
The joke: Four tough monsters in the back row are forced to sit at a judges' table and hold up `10.0` scorecards before getting flattened.
Animation beats:

1. Letterbox bars slide in; the entire battlefield floor turns into a royal-blue Olympic spring floor with white boundary lines as dramatic floor-music chimes play (1.2s).

2. Grace spins into a glittering diamond-sequin leotard, takes a deep breath in the corner, and sprints along the diagonal (1.2s).

3. She launches into a sky-high triple-twisting layout surrounded by a vortex of gold and pink stars, soaring straight past the top of the screen (1.3s).

4. IMPACT: Grace rockets down onto the target like a meteor (`SHIELD BREAK + CRIT!`), sticks the landing with both arms raised (`\o/`), and three `10.0` scorecards pop up behind the enemies while her allies rush to the front of the CTB ribbon (1.5s).
   New assets: poses: olympic_stick_landing / props: judges_scorecards_10 / scene effects: blue_spring_floor, star_vortex / sounds: floor_music_crescendo_boom

## 3. Rose

**Design Thesis:** Fearless, giggly, "travel-sized" six-year-old agent of chaos who treats terrifying monsters like playmates, commands an army of stuffed lambs, and turns Tom's shoulders into a two-story battle mech.

* **Path A:** **Giggle Gremlin** (Peekaboo jump-scares, dress-up tiaras, blanket forts, and unstoppable six-year-old logic)

* **Path B:** **Shoulder Pilot & Lamby** (Piggyback aerial assaults from Tom's shoulders and stuffed-animal cavalry charges)

* **Recommended Auto-Stamp Order:** B1 -> A1 -> B2 -> A2 -> A3 -> B3 -> B4 -> B5 -> B6 (Ultimate 1 at Lvl 26) -> A4 -> A5 -> A6.

### Rose's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Nose Boop | `boop` | KEEP | 1 | 0 | 0 | Kinetic | WARMTH | 1.0 | 1 | `enemy` | 0.7 | `+1 VP`, `+5% HEART` | yes | 
| Signature | SILLY | `silly` | KEEP | 1 | 0 | 2 | Chatter | WARMTH | 0.0 | 1 | `enemy` | 0.7 | `goof 1 t` | yes | 
| A1 | Peekaboo! | `peekaboo` | KEEP | 2 | 1 | 2 | Chatter | WARMTH | 1.25 | 1 | `enemy` | 0.7 | `ct -0.35 t`, `st surprised 1 t` | yes | 
| A2 | Twirl Tornado | `twirl` | KEEP | 6 | 2 | 3 | Kinetic | PEP | 1.4 | 1 | `row` | 1.0 | `st dizzy 2 t`, `interrupt` | no | 
| A3 | Dress-Up Tiara | `dressup` | REWORKED | 11 | 2 | 3 | Sparkle | WARMTH | 0.0 | 1 | `ally` | 0.7 | `st evasive 2 self`, `ct +0.6 ally`, `st warmth_up 2 ally` | yes | 
| A4 | Floor Is Lava! | `lava` | NEW | 16 | 3 | 4 | Cozy | WARMTH | 1.55 | 1 | `front` | 1.0 | `row back t`, `st slowed 2 t`, `cure amber self` | no | 
| A5 | Pillow Fort | `fort_build` | NEW | 21 | 3 | 5 | Cozy | WARMTH | 0.0 | 1 | `party` | 1.0 | `fort 2 party`, `heal .20 party` (if Grace in party: `trend +1`) | yes | 
| A6 (Ult) | Tea Party with Lamby | `teaparty_ult` | NEW | 26 | 4 | 7 | Sparkle | WARMTH | 3.3 | 1 | `all` | 1.3 | `goof all`, `heal .40 party`, `cure all party` | yes | 
| B1 | Lamby Launch | `lamby` | KEEP | 3 | 1 | 2 | Kinetic | POW | 1.35 | 1 | `enemy` | 0.7 | `mount` (puts Rose on Tom's shoulders for 3t) | no | 
| B2 | Piggyback Pounce | `pounce` | KEEP | 7 | 2 | 3 | Kinetic | POW | 1.55 | 1 | `splash` | 1.0 | `row back main`, `st staggered 1 main` | no | 
| B3 | Travel-Sized Tackle | `travelsize` | NEW | 12 | 2 | 3 | Kinetic | PEP | 1.6 | 1 | `enemy` | 0.7 | `steal`, `take`, `mount` | no | 
| B4 | Lamby Boomerang | `boomerang` | NEW | 17 | 3 | 4 | Cozy | WARMTH | 1.45 | 2 | `row` | 1.0 | `st smit 1 t`, `heal .20 self` | yes | 
| B5 | Tallest Kid in School | `totem` | NEW | 22 | 3 | 5 | Chatter | hybrid | 1.9 | 1 | `splash` | 1.0 | `shieldBreak`, `st pow_down 2 t` (`+40%` dmg if mounted) | no | 
| B6 (Ult) | Operation Shoulder Mecha | `mecha_ult` | NEW | 28 | 4 | 8 | Kinetic | hybrid | 4.0 | 1 | `all` | 1.3 | `mount`, `st stunned 1 all`, `mile +2 tom` | no | 

### Rose's Ability Cards

### Nose Boop (Basic, `boop`)

Menu description: Rose marches right up to a monster, reaches up on tiptoes, and boops its nose. Costs 0 VP and can cheer up monsters!
Spoken line: "Boop! Got your nose!"
Battle message: "Rose boops the enemy right on the snoot!"
Why it is them: Rose has zero fear of monsters and treats them like oversized stuffed animals.
The joke: A terrifying boss monster gets booped with one tiny index finger and blinks in total confusion.
Animation beats:

1. Rose skips across the stage and stands on her tiptoes in front of the enemy (0.3s).

2. IMPACT: She pokes the enemy's nose with a giant comic `BOOP!` text bubble and a pink heart pop (0.3s).

3. She giggles and skips backward to her spot (0.2s).
   New assets: poses: tiptoe_poke / props: boop_text_bubble / scene effects: nose_heart_pop / sounds: squeaky_boop

### SILLY (Signature, `silly` - Enhanced Animation Proposal)

Menu description: Rose blows a giant raspberry and pulls a goofy face, Goofing the enemy so it loses its next turn.
Spoken line: "Pbbbbbbt! Look at me, Ta-Ta, I'm a monster!"
Battle message: "Rose makes the silliest face in the world!"
Why it is them: Rose's signature weapon is pure six-year-old silliness that breaks any monster's concentration.
The joke: She puts her thumbs in her ears, wiggles her fingers, and blows a raspberry so loud the enemy drops whatever it was holding.
Animation beats:

1. Rose hops forward, puts her thumbs to her ears with fingers wiggling, and sticks her tongue all the way out (0.4s).

2. A huge wobbly `PBBBBBT!` soundwave with floating goofy eyeballs and springs blasts into the enemy (0.4s).

3. IMPACT: The enemy cracks up laughing (`GOOFED!`) with spinning stars and smiley faces around its head (0.3s).
   New assets: poses: thumb_ears_raspberry / props: goofy_eyeballs / scene effects: wobbly_soundwave / sounds: wet_raspberry_boing

### Peekaboo! (A1, `peekaboo`)

Menu description: Rose hides behind her hands and pops out right in front of an enemy, knocking its turn back 35% on the ribbon. Can be used kindly (`kindFoe`).
Spoken line: "Where did Rose go? ... PEEKABOO!"
Battle message: "Rose vanishes behind her hands and pops out!"
Why it is them: Six-year-old logic dictates that if she covers her own eyes, she is completely invisible.
The joke: She actually turns translucent when she covers her eyes because the game respects six-year-old rules.
Animation beats:

1. Rose covers her eyes with both hands; her sprite turns 80% invisible with a dotted outline (0.4s).

2. She teleports instantly in front of the enemy and throws her hands wide (`PEEKABOO!`) (0.3s).

3. IMPACT: A burst of confetti startles the enemy backward along the CTB turn ribbon (0.4s).
   New assets: poses: cover_eyes, wide_arms_pop / props: none / scene effects: dotted_invis_outline / sounds: slide_whistle_pop

### Twirl Tornado (A2, `twirl`)

Menu description: Rose spins with her arms out until she turns into a tiny pink whirlwind, hitting a row, Dizzying foes, and interrupting wind-ups.
Spoken line: "Look how fast I can spin! Whoaaaa!"
Battle message: "Rose spins into a dizzying Twirl Tornado!"
Why it is them: Every six-year-old loves spinning in the middle of the living room until everyone gets dizzy.
The joke: She makes the enemies dizzy while landing completely fine herself.
Animation beats:

1. Rose stretches both arms out wide and starts spinning in place faster and faster (0.4s).

2. She turns into a pastel pink mini-tornado with ribbons and toys flying out of it, zipping across the enemy row (0.5s).

3. IMPACT: The tornado pops in a burst of stars that leaves the whole row swaying (`Dizzy`) while Rose strikes a ta-da pose (0.4s).
   New assets: poses: spin_blur / props: mini_pink_tornado / scene effects: dizzy_swirls / sounds: whistling_spin_pop

### Dress-Up Tiara (A3, `dressup`)

Menu description: Rose crowns an ally (or a monster!) with a plastic princess tiara and feather boa, pulling their turn up 60%, boosting WARMTH, and making Rose Evasive.
Spoken line: "You get the sparkly crown! Now curtsy!"
Battle message: "Rose declares it Dress-Up Day!"
Why it is them: Rose loves princess dress-up and insists that everyone in the house wear a costume accessory.
The joke: Putting a pink plastic tiara and feather boa on Boppy or Tom makes them feel fabulous and rush to the front of the turn order.
Animation beats:

1. Rose digs into a glittery plastic dress-up trunk and pulls out a feather boa and plastic tiara (0.4s).

2. She hops up and plops the tiara onto the target ally's (or monster's) head while wrapping the pink boa around their neck (0.5s).

3. IMPACT: A royal trumpet kazoo fanfare plays as sparkles launch the target forward on the turn ribbon (0.4s).
   New assets: poses: crown_bestow / props: plastic_tiara, pink_boa, dressup_trunk / scene effects: royal_sparkles / sounds: kazoo_fanfare

### Floor Is Lava! (A4, `lava`)

Menu description: Rose yells "THE FLOOR IS LAVA!" and hops onto a sofa cushion, forcing front-row enemies to scramble to the back row (`Slowed`) while thawing her own Amber.
Spoken line: "Five, four, three, two, THE FLOOR IS LAVA!"
Battle message: "Rose declares the floor is lava! Everybody off the ground!"
Why it is them: The classic kids' living-room game turned into battlefield crowd control.
The joke: The monsters actually panic and jump backward onto folding chairs so their feet do not touch the crayon-drawn lava.
Animation beats:

1. Rose points at the ground and shouts; the floor under the enemy front row turns into bubbling orange crayon-drawn lava with `COZY` heat waves (0.5s).

2. Rose hops safely onto a floating floral sofa cushion (0.3s).

3. IMPACT: A spout of cartoon lava pops under the front-row enemies' toes (`YOWCH!`), sending them scrambling into the back row (0.5s).
   New assets: poses: cushion_hop / props: sofa_cushion / scene effects: crayon_lava_floor / sounds: sizzle_boing_yelp

### Pillow Fort (A5, `fort_build`)

Menu description: Rose stacks couch cushions and blankets over the party for 2 turns (`Blanket Fort`: reduces group damage by 25%, prevents fear/chill) and heals 20% HP. Boosts Grace's Trending if she is present!
Spoken line: "No monsters allowed inside! Secret password only!"
Battle message: "Rose builds a cozy Blanket & Pillow Fort over the party!"
Why it is them: Building a fort out of every blanket and pillow in the house is peak cousin/sister bonding.
The joke: A hand-drawn cardboard sign reading `NO GROWNUPS (EXCEPT TA-TA)` hangs on the front of the fort while fairy lights glow inside.
Animation beats:

1. Rose whistles and three giant couch cushions, two dining chairs, and a quilted blanket fly across the party (0.5s).

2. They snap together into a cozy fort strung with warm fairy lights and a `SECRET CLUB` sign (0.5s).

3. IMPACT: Rose peeks out the front flap with a flashlight under her chin (`COZY` heal wave across the party, or inviting a monster inside if `kindFoe`) (0.4s).
   New assets: poses: flashlight_peek / props: blanket_fort_facade, club_sign / scene effects: fairy_light_glow / sounds: zipper_blanket_poof

### Tea Party with Lamby (A6 Ultimate, `teaparty_ult`)

Menu description: Ultimate. Rose forces all enemies to sit down at a tiny plastic table for imaginary tea with Lamby, dealing huge Sparkle damage, Goofing all foes, and healing/curing the party.
Spoken line: "Pinkies up, everybody! Lamby made invisible chamomile!"
Battle message: "Rose hosts a mandatory Royal Tea Party with Lamby!"
Why it is them: Rose's stuffed lamb Lamby is her constant companion, and nobody can say no when a six-year-old hands you a tiny plastic teacup.
The joke: Even gigantic bosses are squeezed onto tiny pink plastic stools with their knees up by their ears, sipping air out of toy cups.
Animation beats:

1. Letterbox bars slide in; a lacy pink tablecloth rolls across the entire battlefield and tiny plastic chairs pop up under every single enemy (1.2s).

2. Rose sets Lamby (wearing a tiny bow tie) at the head of the table and pours "invisible tea" from a plastic teapot into toy cups in front of the monsters (1.3s).

3. She claps her hands (`"DRINK UP!"`); the enemies dutifully raise their tiny cups with their pinkies out (1.2s).

4. IMPACT: The imaginary tea turns into a geyser of rainbow `SPARKLE` fireworks and floating hearts that launches the table sky-high, leaving all enemies `Goofed` and the whole party refreshed and cured (1.5s).
   New assets: poses: pour_teapot, pinky_sip / props: plastic_teapot, tiny_pink_chairs, bowtie_lamby / scene effects: lacy_tablecloth_stage, teacup_fireworks / sounds: porcelain_clink_fireworks

### Lamby Launch (B1, `lamby`)

Menu description: Rose slingshots her stuffed lamb Lamby into an enemy's face and vaults right onto Tom's shoulders for 3 turns (`Shoulder Ride`).
Spoken line: "Go get 'em, Lamby! Ta-Ta, up please!"
Battle message: "Rose launches Lamby and hops onto Tom's shoulders!"
Why it is them: Establishes her core trait loop ("Ta-Ta, up!") on turn one while letting Lamby join the fight.
The joke: A soft plush lamb hits like a cannonball before bouncing back into Rose's arms on top of Tom's head.
Animation beats:

1. Rose winds up and pitches her stuffed lamb Lamby like a fastball across the screen (0.3s).

2. IMPACT: Lamby bonks the enemy square in the nose with a squeaky `BAA-THUD!` and rebounds in a high arc (0.4s).

3. Rose does a little springboard hop onto Tom's shoulders and catches Lamby at the top (`Shoulder Ride` active) (0.4s).
   New assets: poses: pitch_throw, shoulder_perch / props: lamby_plush / scene effects: plush_impact_puff / sounds: lamb_squeak_boing

### Piggyback Pounce (B2, `pounce`)

Menu description: Rose uses Tom's shoulders like a diving board to double-stomp a foe and its neighbors, knocking the main target into the back row and Staggering it.
Spoken line: "Clear the pool! Cannonball off Ta-Ta!"
Battle message: "Rose leaps off Tom's shoulders for a Piggyback Pounce!"
Why it is them: Once Rose is up on Tom's shoulders, she uses the altitude for maximum chaos.
The joke: Tom braces like an aircraft carrier catapult while Rose yells "CANNONBALL!"
Animation beats:

1. If not already on Tom's shoulders, Rose scrambles up his back in a split second; Tom bends his knees to launch her (0.4s).

2. Rose bounces twice on Tom's shoulders (`BOING, BOING`) and tucks into a cannonball high in the air (0.4s).

3. IMPACT: She lands with a shockwave bounce that punts the target into the back row before spring-boarding right back to her spot (0.5s).
   New assets: poses: cannonball_tuck / props: none / scene effects: trampoline_rings / sounds: diving_board_twang_boom

### Travel-Sized Tackle (B3, `travelsize`)

Menu description: Rose darts between an enemy's legs at knee height, stealing a buff and an item/coins before hopping onto Tom's shoulders (`Shoulder Ride`).
Spoken line: "I'm not little, I'm travel-sized! Coming through!"
Battle message: "Rose zips under the enemy's guard!"
Why it is them: Directly uses her canon catchphrase ("I'm not little, I'm travel-sized!") to turn her small stature into a stealth weapon.
The joke: She fits in the overhead bin and also fits right between a monster's ankles while emptying its pockets.
Animation beats:

1. Rose crouches like a sprinter with a mischievous grin (0.3s).

2. IMPACT: She zips right through the enemy's legs in a pink blur, snagging a coin bag and a glowing buff orb on the way through (0.4s).

3. She uses the momentum to run right up Tom's back onto his shoulders, holding up the loot (0.4s).
   New assets: poses: loot_hold_on_shoulders / props: stolen_coin_pouch / scene effects: pink_speed_streak / sounds: zip_cha_ching

### Lamby Boomerang (B4, `boomerang`)

Menu description: Rose ties her hair ribbon to Lamby and swings him across an enemy row twice (out and back), Smittening foes and healing herself 20% HP when she hugs him at the end.
Spoken line: "Fly, Super Lamby! Come back for a cuddle!"
Battle message: "Rose sends Super Lamby soaring across the row and back!"
Why it is them: Combines her shoulder-ride ribbon (Chapter 19 key item) with her love for Lamby.
The joke: Lamby wears a tiny red superhero cape made from a napkin and flies like Thor's hammer.
Animation beats:

1. Rose ties a pink ribbon cape around Lamby and tosses him forward; he sails across the enemy row (`HIT 1`) (0.4s).

2. IMPACT: Lamby banks a sharp U-turn at the edge of the screen and sweeps back across the row (`HIT 2`) leaving a trail of cute wool puffs that Smitten enemies (0.5s).

3. Rose catches Lamby and gives him a big squeeze, healing herself with a warm heart pop (0.4s).
   New assets: poses: hug_lamby / props: super_cape_lamby / scene effects: wool_heart_trail / sounds: superhero_kazoo_swoosh

### Tallest Kid in School (B5, `totem`)

Menu description: Rose pulls a long trench coat over herself and Tom so they look like one seven-foot-tall kid, shattering boss shields and splashing foes (+40% damage if already on Tom's shoulders).
Spoken line: "Hello, fellow grown-ups! One adult ticket, please!"
Battle message: "Rose and Tom put on a giant trench coat! Eight feet of power!"
Why it is them: The classic kids-on-shoulders cartoon trope played straight with Uncle Tom as the bottom legs.
The joke: Tom's glasses are peeking out of the buttonhole in the middle of the coat while Rose wears a giant fedora on top.
Animation beats:

1. Rose (on Tom's shoulders) pulls a comically oversized tan trench coat and floppy hat down over both of them (0.5s).

2. Tom's voice muffles from the chest buttons as they march forward with heavy `THUD, THUD` giant footsteps (0.4s).

3. IMPACT: Rose swings both giant coat sleeves down in a massive double-hammer smash that shatters shields and flattens the target and neighbors before the coat pops off (0.5s).
   New assets: poses: trenchcoat_totem / props: giant_trenchcoat, oversized_hat / scene effects: heavy_footstep_cracks / sounds: giant_stomp_crash

### Operation Shoulder Mecha (B6 Ultimate, `mecha_ult`)

Menu description: Ultimate. Rose transforms her shoulder ride on Tom into a cardboard-box Voltron mecha, hitting all enemies for massive damage, Stunning them, keeping her mounted, and giving Tom +2 Upgrade Miles.
Spoken line: "Ta-Ta Mecha, combine! Fire the Glitter Lasers!"
Battle message: "Rose and Tom combine into CARDBOARD MECHA TA-TA ZERO!"
Why it is them: To a six-year-old riding on her uncle's shoulders, she is already piloting a giant robot.
The joke: It is made entirely out of taped-up Amazon delivery boxes Tom unboxed earlier, complete with crayon control dials, yet it fires an orbital laser.
Animation beats:

1. Letterbox bars snap in; anime combining-mecha sirens blare as Rose vaults onto Tom's shoulders against a diagonal speed-line background (1.0s).

2. Cardboard shipping boxes snap onto Tom's arms, legs, and chest like robot armor (`DOCKING COMPLETE!`); Rose pulls down a cardboard cockpit visor with crayon-drawn crosshairs (`TARGET LOCKED: BAD GUYS`) (1.5s).

3. Tom strikes a heroic super-robot pose while Rose pulls two paper-towel-tube control levers; the cardboard chest emblem (`TA-TA 01`) charges with blinding `KINETIC` and `SPARKLE` energy (1.2s).

4. IMPACT: A massive rainbow crayon beam combined with a flying cardboard rocket-punch sweeps the entire enemy side (`STUN!`), ending with Rose giving a double thumbs-up from the shoulder cockpit as Tom gets +2 Upgrade Miles (1.5s).
   New assets: poses: cardboard_mecha_stance / props: cardboard_armor_pieces, crayon_hud / scene effects: anime_speedlines, crayon_mega_beam / sounds: retro_mecha_combine_laser

## 4. Amy

**Design Thesis:** Fiercely competitive marathon runner, devoted mom to Grace and Rose, and take-no-nonsense schoolteacher who controls the turn ribbon with stopwatch precision and grades every monster's posture in red ink.

* **Path A:** **Head Teacher** (Red-pen grading, pop quizzes, gold-star stickers, and unshakeable classroom authority)

* **Path B:** **Marathon Mom** (Hill repeats, dairy-free fuel gels, negative splits, and carrying the whole team across the finish line)

* **Recommended Auto-Stamp Order:** A1 -> B1 -> A2 -> B2 -> A3 -> B3 -> A4 -> A5 -> A6 (Ultimate 1 at Lvl 26) -> B4 -> B5 -> B6.

### Amy's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Sprint Tackle | `sprint` | KEEP | 1 | 0 | 0 | Kinetic | POW | 1.0 | 1 | `enemy` | 0.7 | `+1 VP`, `+5% HEART` | no | 
| Signature | PEP TALK | `peptalk` | KEEP | 1 | 0 | 3 | Chatter | WARMTH | 0.0 | 1 | `others` | 1.0 | `st pumped_up 1 others` | yes | 
| A1 | Red Pen | `redpen` | REWORKED | 2 | 1 | 2 | Sparkle | POW | 1.3 | 1 | `enemy` | 0.7 | `reveal`, `grade 3 t`, `st grit_down 2 t` | no | 
| A2 | Pop Quiz | `popquiz` | KEEP | 6 | 2 | 3 | Chatter | WARMTH | 1.45 | 1 | `enemy` | 0.7 | `interrupt`, `ct -0.45 t` | no | 
| A3 | Gold Star Sticker | `goldstar` | NEW | 11 | 2 | 3 | Sparkle | WARMTH | 0.0 | 1 | `ally` | 0.7 | `heal .35 ally`, `vp +2 ally`, `st pow_up 2 ally` (if Grace/Rose: `crit 1`) | yes | 
| A4 | Inside Voices! | `voices` | NEW | 16 | 3 | 4 | Chatter | COOL | 1.55 | 1 | `row` | 1.0 | `st shushed 2 t`, `st pow_down 2 t` | no | 
| A5 | Hall Pass | `hallpass` | NEW | 21 | 3 | 4 | Chatter | WARMTH | 0.0 | 1 | `ally` | 0.7 | `ct +0.75 ally`, `st evasive 2 ally`, `cure 1 ally` | yes | 
| A6 (Ult) | Detention Forever | `detention_ult` | NEW | 26 | 4 | 8 | Chatter | hybrid | 3.5 | 1 | `all` | 1.3 | `st see_me 2 all`, `ct -0.6 all`, `vp +3 party` | no | 
| B1 | Burpee Blitz | `burpee` | KEEP | 3 | 1 | 2 | Kinetic | POW | 0.5 | 3 | `enemy` | 0.7 | `st pep_up 2 self` | no | 
| B2 | Hill Repeats | `hills` | KEEP | 7 | 2 | 3 | Kinetic | POW | 1.6 | 1 | `splash` | 1.0 | `st grit_down 2 t`, `st slowed 2 main` | no | 
| B3 | Oat Milk Gel Pack | `oatgel` | NEW | 12 | 2 | 3 | Cozy | WARMTH | 0.0 | 1 | `party` | 0.7 | `heal .25 party`, `cure amber party`, `st pep_up 2 party` | yes | 
| B4 | Stroller Stride | `stroller` | NEW | 17 | 3 | 4 | Kinetic | POW | 1.75 | 1 | `row` | 1.0 | `row back t`, `shieldBreak` (if Grace & Rose in party: `+30%` dmg) | no | 
| B5 | Negative Split | `negsplit` | NEW | 22 | 3 | 5 | Kinetic | POW | 0.65 | 4 | `multi` | 0.7 | `crit +35%`, `st personal_best 2 self` | no | 
| B6 (Ult) | Boston Qualifier | `marathon_ult` | NEW | 28 | 4 | 8 | Kinetic | POW | 3.8 | 1 | `all` | 1.3 | `st personal_best 3 party`, `cure all party`, `ct +0.5 party` | no | 

### Amy's Ability Cards

### Sprint Tackle (Basic, `sprint`)

Menu description: Amy clicks her running stopwatch and barrels through an enemy in full marathon stride. Costs 0 VP.
Spoken line: "Out of my lane! Passing on your left!"
Battle message: "Amy calls 'ON YOUR LEFT' and sprints through!"
Why it is them: Amy is a fiercely competitive runner who treats every sidewalk and battle stage like a race course.
The joke: She does not even slow down to hit the monster; she checks her wrist split time as she bowls them over.
Animation beats:

1. Amy clicks a yellow stopwatch around her neck (`BEEP!`) and drops into a runner's start (0.2s).

2. IMPACT: She streaks through the enemy in a blur of neon running shoes (`THWACK!`) while checking her wristwatch (0.4s).

3. She jogs backward in place to her starting spot without breaking stride (0.3s).
   New assets: poses: wrist_check_jog / props: yellow_stopwatch / scene effects: lane_streak / sounds: stopwatch_beep_thud

### PEP TALK (Signature, `peptalk` - Enhanced Animation Proposal)

Menu description: Amy rallies everyone else in the party, boosting their next attack or heal by +50% (`Pumped Up`). Can also encourage a monster!
Spoken line: "Eyes up, shoulders back! We do hard things!"
Battle message: "Amy delivers a sideline Pep Talk!"
Why it is them: As a mom and teacher, Amy's voice can instantly make you believe you can run through a brick wall.
The joke: She claps twice with such intense teacher-coach energy that everyone straightens their posture immediately.
Animation beats:

1. Amy blows a silver coach's whistle (`TWEET!`) and steps to the center of the party (0.3s).

2. She points firmly at each teammate (or target monster) while bold text `YOU'VE GOT THIS!` rises behind them (0.5s).

3. IMPACT: Golden rising chevrons and fiery `PUMPED UP` auras ignite around every other party member (0.4s).
   New assets: poses: coach_point / props: silver_whistle / scene effects: rising_chevrons / sounds: whistle_cheer_swell

### Red Pen (A1, `redpen`)

Menu description: Amy grades an enemy's stance with a giant red marker, revealing its weaknesses, lowering GRIT, and marking it with a Red-Pen Rubric (`grade`: next 3 hits gain +25% crit and +1 VP).
Spoken line: "Sloppy posture, no thesis statement. See me after!"
Battle message: "Amy marks up the enemy with her Red Pen!"
Why it is them: Amy is a veteran teacher whose red grading pen misses nothing.
The joke: She literally circles the monster's weak spot in mid-air and writes `SHOW YOUR WORK (F)` next to its head.
Animation beats:

1. Amy pulls the cap off an oversized red felt-tip grading pen with a sharp `POP!` (0.3s).

2. She darts forward and slashes three bright red correction marks (`X! X! CIRCLE!`) across the enemy sprite (0.5s).

3. IMPACT: A giant circled red `F-` and `SEE ME` stamp hangs in the air over the foe as its weakness icons pop out (0.4s).
   New assets: poses: pen_slash / props: giant_red_pen / scene effects: red_ink_grade_stamp / sounds: marker_squeak_stamp

### Pop Quiz (A2, `popquiz`)

Menu description: Amy slams a surprise test packet onto an enemy's desk, interrupting its wind-up and knocking its turn back 45% on the ribbon.
Spoken line: "Clear your desks! Number two pencils only!"
Battle message: "Amy drops a surprise Pop Quiz!"
Why it is them: Nothing stops a room dead in its tracks faster than a teacher announcing an unscheduled quiz.
The joke: The monster freezes in sheer academic panic because it forgot to study.
Animation beats:

1. A wooden school desk materializes around the target enemy (0.3s).

2. IMPACT: Amy drops a thick stack of test papers onto the desk with a thunderous `SMACK!` that shatters any boss wind-up icon (0.4s).

3. Sweat drops fly off the enemy's head as it scrambles for a pencil, sliding backward down the CTB ribbon (0.4s).
   New assets: poses: slam_papers / props: school_desk, test_stack / scene effects: panic_sweat_drops / sounds: paper_slam_gasp

### Gold Star Sticker (A3, `goldstar`)

Menu description: Amy awards a shiny foil gold star sticker to an ally (or monster!), healing 35% HP, granting +2 VP, and boosting POW (plus guaranteed next crit if used on Grace or Rose).
Spoken line: "A-plus effort! You earned the shiny foil star!"
Battle message: "Amy awards a Gold Star Sticker for excellence!"
Why it is them: Every elementary teacher knows the unreasonable motivating power of a metallic foil sticker.
The joke: Grown adults like Tom and Boppy beam with pride when Amy sticks a gold star on their forehead.
Animation beats:

1. Amy peels a sparkling metallic gold star off a long sticker roll (0.3s).

2. She steps up and presses the sticker right onto the target's forehead or chest with a warm smile (0.4s).

3. IMPACT: The gold star flashes with a rainbow prism chime (`A+!`), restoring HP and VP while the target puffs their chest out proudly (0.4s).
   New assets: poses: sticker_place / props: foil_gold_star, sticker_roll / scene effects: a_plus_sparkle / sounds: harp_ding_shine

### Inside Voices! (A4, `voices`)

Menu description: Amy flicks the classroom lights off and on and does the teacher clap, Shushing an entire enemy row and lowering their POW for 2 turns.
Spoken line: "Excuse me! If you can hear me, clap once!"
Battle message: "Amy flicks the lights and calls for Inside Voices!"
Why it is them: The classic teacher crowd-control technique that silences thirty noisy kids in two seconds flat.
The joke: The monsters instinctively clap twice in response before realizing they have been Silenced.
Animation beats:

1. Amy reaches to the side of the screen and flicks a wall light switch (`CLICK-DARK, CLICK-LIGHT!`) (0.4s).

2. She claps a rhythm (`CLAP-CLAP, CLAP-CLAP-CLAP`) with an icy teacher stare (0.4s).

3. IMPACT: A wave of `SHHH!` text bubbles sweeps the enemy row; the monsters sheepishly clap back and zip their mouths shut (`Shushed` + `POW Down`) (0.5s).
   New assets: poses: teacher_stare_clap / props: wall_light_switch / scene effects: light_flicker_shh / sounds: switch_click_clap

### Hall Pass (A5, `hallpass`)

Menu description: Amy hangs an official laminated wooden Hall Pass around an ally's neck (or a monster's!), pulling their turn forward 75%, curing 1 debuff, and making them Evasive.
Spoken line: "Take the hall pass. Straight there and straight back!"
Battle message: "Amy issues an Official Laminated Hall Pass!"
Why it is them: With a teacher's hall pass, you are legally untouchable in the corridors.
The joke: The Hall Pass is attached to a comically huge wooden classroom ruler so nobody loses it.
Animation beats:

1. Amy pulls a giant yellow laminated `HALL PASS` lanyard off a classroom hook (0.3s).

2. She drapes it over the target ally's shoulders and points down the turn ribbon (0.4s).

3. IMPACT: A green school-zone crossing light flashes `WALK`, zooming the ally past everyone on the CTB ribbon in a protective `Evasive` glow (0.4s).
   New assets: poses: pass_handover / props: giant_hall_pass / scene effects: green_walk_signal / sounds: school_bell_whoosh

### Detention Forever (A6 Ultimate, `detention_ult`)

Menu description: Ultimate. Amy rings the final school bell, traps all enemies in after-school detention, hits all foes, inflicts `See Me` (double damage next hit), knocks turns back 60%, and gives the party +3 VP.
Spoken line: "Nobody leaves this room until that chalkboard is spotless!"
Battle message: "BZZZZT! Amy sentences the entire enemy side to Detention!"
Why it is them: Chapter 5's boss is literally "Parent-Teacher Conference of Doom," and this is Amy's ultimate teacher authority unleashed.
The joke: The monsters have to write "I WILL NOT CAUSE FRICTION" on a massive blackboard while the clock ticks backward.
Animation beats:

1. Letterbox bars snap in; a brass school hallway bell rings deafeningly (`RRRRRING!`) as green chalkboards slam down behind the enemies (1.2s).

2. Amy stands at a podium, taps her pointer stick three times, and flips a wall clock backward from `3:00` to `4:00 DETENTION` (1.2s).

3. Giant pieces of chalk fly across the blackboard writing `SEE ME AFTER CLASS!` in glowing letters that crackle with `CHATTER` shockwaves (1.3s).

4. IMPACT: The entire blackboard explodes outward in a storm of erasers, red ink, and report cards (`SEE ME` on all foes + `-60% CT`), while an apple on Amy's desk bursts into `+3 VP` for the whole party (1.5s).
   New assets: poses: podium_pointer_tap / props: brass_school_bell, wall_clock, giant_chalkboard / scene effects: chalk_dust_explosion / sounds: school_bell_chalk_boom

### Burpee Blitz (B1, `burpee`)

Menu description: Amy drops and cranks out three lightning-fast burpee jumps that uppercut an enemy three times and boost her own PEP for 2 turns.
Spoken line: "Up, down, plank, jump! Keep the heart rate up!"
Battle message: "Amy powers through a three-rep Burpee Blitz!"
Why it is them: Amy actually enjoys doing burpees at 6:00 AM while normal people are asleep.
The joke: Every vertical jump at the top of each burpee happens to uppercut the monster in the jaw.
Animation beats:

1. Amy drops into a crisp plank and springs up into jump one (`POW!`) (0.3s).

2. She hits rep two (`BAM!`) and rep three (`SMASH!`) at double speed with sweat sparkles flying (0.5s).

3. IMPACT: On the third jump she claps overhead, sending a shockwave through the target as `PEP UP` chevrons wrap her legs (0.3s).
   New assets: poses: plank_drop, vertical_jump_clap / props: none / scene effects: rep_counter_123 / sounds: triple_woosh_smack

### Hill Repeats (B2, `hills`)

Menu description: Amy drags a steep 12%-grade asphalt hill onto the stage and sprints up and down it across a foe and its neighbors, lowering GRIT and Slowing the main target.
Spoken line: "Love the hill! The hill is where you build strength!"
Battle message: "Amy makes the enemies run Hill Repeats!"
Why it is them: Marathon runners train on brutal inclines and cheerfully try to convince their family it is fun.
The joke: The monsters are left wheezing with their hands on their knees at the bottom of the incline while Amy isn't even winded.
Animation beats:

1. A steep triangular road-grade sign (`12% GRADE`) pops up and tilts the floor under the enemies into an uphill slope (0.4s).

2. Amy sprints up the incline right over the enemies' heads and back down in a figure-eight blur (0.5s).

3. IMPACT: The asphalt slope collapses onto the target and its neighbors in a cloud of road dust, leaving them hunched over gasping (`GRIT Down` + `Slowed`) (0.4s).
   New assets: poses: uphill_drive / props: grade_12_sign / scene effects: tilted_road_slope / sounds: sneaker_scuff_rumble

### Oat Milk Gel Pack (B3, `oatgel`)

Menu description: Amy hands out dairy-free marathon energy gels and oat-milk iced lattes, healing the party 25% HP, thawing Amber, and boosting party PEP for 2 turns. Can be shared with a monster (`kindFoe`).
Spoken line: "Hundred percent dairy-free! Tear the tab and keep moving!"
Battle message: "Amy runs an aid-station handoff with dairy-free fuel!"
Why it is them: Canon fact: Amy is a marathoner who strictly does not do dairy.
The joke: She runs past the party like a marathon hydration table volunteer, tossing oat-milk cartons and energy gels into everyone's hands at full speed.
Animation beats:

1. A folding marathon `AID STATION - MILE 18` banner pops up behind the party (0.4s).

2. Amy zips across the party row handing out silver `ENERGY GEL` packets and little `OAT MILK` cups (0.5s).

3. IMPACT: Everyone downs the fuel at once; warm `COZY` energy shatters any Amber crystals and lights up green `PEP UP` wings on their shoes (0.4s).
   New assets: poses: aid_handoff / props: oat_milk_cup, energy_gel_pack / scene effects: hydration_splash_glow / sounds: tear_slurp_ding

### Stroller Stride (B4, `stroller`)

Menu description: Amy pushes a double jogging stroller at 15 mph through an enemy row, shattering boss shields and knocking the row backward (+30% damage if Grace and Rose are both in the party!).
Spoken line: "Hold on, girls! Mom is making the green light!"
Battle message: "Amy charges through with the All-Terrain Jogging Stroller!"
Why it is them: Amy carried the load raising Grace and Rose (while Justin is at work) and probably logged a thousand miles behind a double jogging stroller.
The joke: If Grace and Rose are in the party, they hop into the stroller wearing sunglasses even though they are 9 and 6 years old.
Animation beats:

1. Amy grips the handlebars of an aerodynamic three-wheeled double jogging stroller (if Grace and Rose are present, they hop in and point forward!) (0.4s).

2. Amy lowers her head and charges across the stage like a battering ram with flaming stroller wheels (0.5s).

3. IMPACT: The front wheel smashes straight through boss shields (`SHIELD BREAK!`) and bowls the entire enemy row into the back wall (0.5s).
   New assets: poses: stroller_push / props: double_jogger_stroller / scene effects: wheel_fire_tracks / sounds: tire_screech_crash

### Negative Split (B5, `negsplit`)

Menu description: Amy runs the second half faster than the first, hitting random foes 4 times with +35% crit chance and entering `Personal Best` (+30% POW/WARMTH) for 2 turns.
Spoken line: "Every mile faster than the last! Pick it up!"
Battle message: "Amy drops the hammer for a Negative Split!"
Why it is them: Running a "negative split" (finishing a race faster than you started) is the ultimate runner's flex.
The joke: A digital race clock above her head shows each hit's pace dropping (`7:10 -> 6:45 -> 6:15 -> 5:50!`) as she turns into a sonic boom.
Animation beats:

1. A digital red LED race gantry clock appears overhead ticking split times (0.3s).

2. Amy crisscrosses the enemy side in four accelerating strikes, each faster and louder than the one before (0.6s).

3. IMPACT: On hit four she breaks the sound barrier in a golden `PR! PERSONAL BEST!` burst that buffs her POW and WARMTH (0.4s).
   New assets: poses: sonic_runner_dash / props: led_split_clock / scene effects: sonic_ring_cone / sounds: quad_sonic_boom

### Boston Qualifier (B6 Ultimate, `marathon_ult`)

Menu description: Ultimate. Amy leads the entire family through Mile 26.2, hitting all enemies for massive damage, curing all party debuffs, granting everyone `Personal Best`, and pulling party turns forward 50%.
Spoken line: "Right on Hereford, left on Boylston! Sprint to the tape!"
Battle message: "Mile 26.2! Amy leads the whole family across the Finish Line!"
Why it is them: The iconic final turn of the Boston Marathon is every serious runner's holy grail, and Amy brings her whole family across the line with her.
The joke: The monsters get trampled like stray traffic cones in the final sprint chute while a blimp films from overhead.
Animation beats:

1. Letterbox bars slide in; a blue-and-yellow `MILE 26.2 FINISH` arch and cheering crowd barriers pop up at the far side of the enemy formation (1.2s).

2. Amy checks her stopwatch, grabs her teammates by the hands (`PACE SETTER MAX!`), and yells "KICK NOW!" as triumphant synth horns blare (1.2s).

3. Amy and the party charge in a massive V-formation stampede straight through the center of the enemy side, sending monsters spinning like bowling pins (1.3s).

4. IMPACT: Amy breaks the fluttering yellow finish-line tape with her chest (`3.8x DAMAGE ALL!`); confetti cannons fire, curing all debuffs and wrapping the whole party in golden foil marathon blankets (`Personal Best` + `+50% CT`) (1.5s).
   New assets: poses: tape_break_chest / props: marathon_finish_arch, foil_space_blanket / scene effects: marathon_confetti_chute / sounds: crowd_roar_horn_fanfare

## 5. Deedee

**Design Thesis:** Energetic retired RN and powerhouse grandma ("registered nut") who bakes hot rhubarb crisps mid-battle, scrubs debuffs off the floor, power-walks circles around youngsters, and loves her family to the moon and back.

* **Path A:** **Registered Baker** (Nurse check-ups, hot rhubarb crisp, Sunday roast dinners, and hospital-grade mopdowns)

* **Path B:** **Busy Bee** (5:00 AM power walks, garden shears, one well-earned glass of wine, and 51 years of grandma cosmic love)

* **Recommended Auto-Stamp Order:** A1 -> A2 -> B1 -> A3 -> B2 -> A4 -> A5 -> A6 (Ultimate 1 at Lvl 26) -> B3 -> B4 -> B5 -> B6.

### Deedee's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Spit Shine | `spitshine` | KEEP | 1 | 0 | 0 | Splash | WARMTH | 1.0 | 1 | `enemy` | 1.0 | `+1 VP`, `+5% HEART` | yes | 
| Signature | MOON & BACK | `moonback` | KEEP | 1 | 0 | 4 | Cozy | WARMTH | 0.0 | 1 | `party` | 1.0 | `heal .40 party`, `st tucked_in 2 party` | yes | 
| A1 | Registered Nut | `regnut` | REWORKED | 2 | 1 | 2 | Cozy | WARMTH | 0.0 | 1 | `ally` | 0.7 | `heal .50 ally`, `cure 2 ally`, `st grit_up 2 ally` | yes | 
| A2 | Rhubarb Crisp | `rhubarb` | KEEP | 6 | 2 | 3 | Cozy | WARMTH | 0.0 | 1 | `ally` | 1.0 | `heal .60 ally`, `crust +1`, `cure amber ally` | yes | 
| A3 | Wet Floor! | `wetfloor` | KEEP | 11 | 2 | 3 | Splash | WARMTH | 1.4 | 1 | `front` | 1.0 | `cure 1 party`, `st drowsy 2 t`, `st slowed 2 t` | no | 
| A4 | Triage Check | `triage` | NEW | 16 | 3 | 4 | Chatter | WARMTH | 1.55 | 1 | `enemy` | 0.7 | `reveal`, `st cool_down 2 t`, `heal .30 lowest` | no | 
| A5 | Eat, You're Skinny! | `seconds` | NEW | 21 | 3 | 5 | Cozy | WARMTH | 0.0 | 1 | `party` | 1.0 | `crust +2`, `tray 3`, `st pow_up 2 party` | yes | 
| A6 (Ult) | Sunday Roast Spread | `sunday_ult` | NEW | 26 | 4 | 8 | Cozy | WARMTH | 3.2 | 1 | `all` | 1.3 | `heal .60 party`, `crust +3`, `tray 3`, `cure all party` | yes | 
| B1 | Power Walk | `powerwalk` | KEEP | 3 | 1 | 2 | Kinetic | PEP | 1.35 | 1 | `enemy` | 0.7 | `st pep_up 2 self`, `ct +0.25 self` | no | 
| B2 | Prune the Bushes | `prune` | NEW | 7 | 2 | 3 | Kinetic | POW | 0.8 | 2 | `enemy` | 1.0 | `steal`, `st grit_down 2 t` | no | 
| B3 | Wine O'Clock | `wine` | REWORKED | 12 | 2 | 3 | Cozy | WARMTH | 0.0 | 1 | `self` | 0.7 | `st warmth_up 3 self`, `st pumped_up 1 self`, `vp +2 self` | no | 
| B4 | Pie Tin Boomerang | `pietin` | NEW | 17 | 3 | 4 | Kinetic | hybrid | 1.65 | 1 | `row` | 1.0 | `interrupt`, `shieldBreak` (if Boppy in party: `burn +1 boppy`) | no | 
| B5 | Spring Cleaning | `clean` | NEW | 22 | 3 | 5 | Splash | WARMTH | 1.75 | 1 | `all` | 1.0 | `cure all party`, `row back front` | no | 
| B6 (Ult) | To the Moon and Back | `moon_ult` | NEW | 28 | 4 | 8 | Sparkle | WARMTH | 3.7 | 1 | `all` | 1.3 | `revive .50 party`, `st tucked_in 3 party`, `st smit 1 all` | yes | 

### Deedee's Ability Cards

### Spit Shine (Basic, `spitshine`)

Menu description: Deedee pulls a floral tissue from her sleeve, licks her thumb, and scrubs a smudge right off the enemy's cheek. Costs 0 VP and counts as kind!
Spoken line: "Hold still, you've got schmutz right on your cheek!"
Battle message: "Deedee attacks a smudge with a grandma Spit Shine!"
Why it is them: No child or grandchild has ever escaped Deedee's house without having their face scrubbed with a tissue.
The joke: The monster squirms like an embarrassed eight-year-old in church while Deedee buffs its forehead to a shine.
Animation beats:

1. Deedee whips a handkerchief out of her pocket and gives it a quick dab (0.3s).

2. She marches up to the enemy, grabs its chin with one hand, and scrubs its cheek vigorously (`SCRUB-SCRUB-SCRUB!`) (0.4s).

3. IMPACT: A squeaky-clean sparkle pings off the enemy's cheek as it blushes (0.3s).
   New assets: poses: cheek_scrub / props: floral_hankie / scene effects: clean_ping / sounds: squeak_squeak_ding

### MOON & BACK (Signature, `moonback` - Enhanced Animation Proposal)

Menu description: Deedee wraps the whole party in a warm grandma group hug, healing 40% HP and tucking everyone in (`Tucked In`: 15% regen + +25% GRIT/COOL).
Spoken line: "I love you to the moon and back!"
Battle message: "Deedee wraps everyone in a Moon & Back hug!"
Why it is them: "I love you to the moon and back" is Deedee's signature real-life phrase to her children and grandchildren.
The joke: A glowing crescent moon literally lowers from the night sky so she can pat everyone on the back at once.
Animation beats:

1. The stage dims into a cozy twilight indigo as a smiling pixel crescent moon descends overhead (0.4s).

2. Deedee opens her arms wide and pulls the whole party (or target monster) into a giant warm group hug (0.5s).

3. IMPACT: Golden quilt patterns and floating hearts wrap every ally (`Tucked In` + 40% heal) (0.4s).
   New assets: poses: wide_group_hug / props: smiling_crescent_moon / scene effects: quilt_heart_glow / sounds: lullaby_chime_warm

### Registered Nut (A1, `regnut`)

Menu description: Deedee puts on her RN stethoscope for a rapid grandma check-up, healing an ally 50% HP, curing 2 debuffs, and boosting their GRIT.
Spoken line: "Retired R.N., honey! Open wide and say 'Ahhh'!"
Battle message: "Deedee performs a high-speed Registered Nurse check-up!"
Why it is them: Deedee is a retired Registered Nurse whom Tom affectionately calls a "registered nut."
The joke: She checks reflexes with a tiny rubber hammer, takes a temperature, and hands out a lollipop in 1.2 seconds flat.
Animation beats:

1. Deedee snaps a stethoscope into her ears and taps a tongue depressor in her palm (0.3s).

2. She zips around the target ally checking pulse, forehead temperature, and knee reflex (`BOP!`) (0.5s).

3. IMPACT: She pops a cherry lollipop into their hand as a giant green medical cross and sparkles restore 50% HP and scrub two debuffs away (0.4s).
   New assets: poses: stethoscope_check / props: stethoscope, cherry_lollipop / scene effects: nurse_green_burst / sounds: heartbeat_pop_ding

### Rhubarb Crisp (A2, `rhubarb`)

Menu description: Deedee pulls a bubbling pan of her signature rhubarb crisp from the oven, healing an ally 60% HP, thawing Amber, and placing +1 Warm Crust on the tray.
Spoken line: "Fresh rhubarb from the garden! Have it while it's hot!"
Battle message: "Deedee serves a bubbling dish of Rhubarb Crisp!"
Why it is them: Rhubarb crisp is Deedee's signature baked dessert.
The joke: A full kitchen oven door opens in mid-air wherever she is standing.
Animation beats:

1. Deedee slips on gingham oven mitts and opens a floating oven door with a wave of `COZY` pink-and-gold steam (0.4s).

2. She spoons a heaping serving of ruby-red rhubarb crisp with vanilla ice cream onto a plate for the target (or monster if `kindFoe`) (0.5s).

3. IMPACT: The target devours it for a huge 60% heal while a golden `WARM CRUST +1` icon lands on the party tray (0.4s).
   New assets: poses: oven_mitt_present / props: rhubarb_crisp_pan / scene effects: cinnamon_steam_hearts / sounds: oven_ding_sizzle

### Wet Floor! (A3, `wetfloor`)

Menu description: Deedee furiously mops the stage floor with pine cleaner, curing 1 debuff on the party while sending the enemy front row skidding into Drowsy and Slowed.
Spoken line: "Pick up your feet! I JUST mopped in here!"
Battle message: "Deedee mops the battlefield! Watch your step!"
Why it is them: Deedee cleans constantly and nobody dares walk across her freshly mopped kitchen floor with shoes on.
The joke: The monsters slip and spin like cartoon characters on banana peels because they wore dirty boots onto her clean floor.
Animation beats:

1. Deedee drops a yellow `CAUTION: WET FLOOR` cone and grabs a soapy string mop (0.3s).

2. She scrubs a gleaming, sudsy wave of pine-scented water across the stage (`SWISH-SWASH-SWISH!`) that washes 1 debuff off her allies (0.5s).

3. IMPACT: The sudsy wave hits the enemy front row, sending their feet flying up in the air (`WHOA-CRASH!`) as they land `Slowed` and `Drowsy` (0.5s).
   New assets: poses: furious_mop / props: wet_floor_cone, string_mop / scene effects: soapy_bubble_wave / sounds: scrub_slide_whistle_crash

### Triage Check (A4, `triage`)

Menu description: Deedee shines a nurse penlight into an enemy's eyes to reveal weaknesses and lower COOL, while tossing a bandage that heals the most hurt ally 30% HP.
Spoken line: "Let's see those pupils. Hmm, definitely dehydrated!"
Battle message: "Deedee runs a no-nonsense Triage Check!"
Why it is them: Combines her sharp clinical RN instincts with her maternal reflex to patch up whoever is hurt.
The joke: She diagnoses the monster's bad attitude as low blood sugar while bandaging her own family at the same time.
Animation beats:

1. Deedee clicks a bright silver nurse penlight and shines the beam straight across the enemy's eyes (0.4s).

2. IMPACT: The beam exposes all weakness icons and drops the enemy's `COOL` as it squints in surprise (0.4s).

3. Without looking back, Deedee tosses a roll of gauze and a warm compress to the lowest-HP ally for a 30% heal (0.4s).
   New assets: poses: penlight_shine / props: nurse_penlight / scene effects: diagnostic_scan_beam / sounds: click_hum_chime

### Eat, You're Skinny! (A5, `seconds`)

Menu description: Deedee insists everyone take second helpings, adding +2 Crust tokens, upgrading all Crusts into **Hot Dishes** (`tray`: 30% heal + cure 1), and boosting party POW.
Spoken line: "You barely touched your plate! Take seconds, you're wasting away!"
Battle message: "Deedee piles second helpings onto everyone's plate!"
Why it is them: Every grandma is convinced her family is starving even five minutes after a four-course meal.
The joke: The tray icons on the HUD visibly transform from little bread crusts into steaming casserole dishes with foil lids.
Animation beats:

1. Deedee marches out holding two giant ceramic casserole dishes with floral potholders (0.4s).

2. She clangs the lids off (`TA-DA!`), sending a massive golden cloud of gravy and roast aroma over the party (or target monster if `kindFoe`) (0.5s).

3. IMPACT: Two new tokens drop onto the tray and all tray icons upgrade into glowing `HOT DISH` casseroles while the party gains `POW Up` (0.5s).
   New assets: poses: double_casserole_lift / props: ceramic_casserole_dish / scene effects: golden_gravy_aroma / sounds: lid_clang_fanfare

### Sunday Roast Spread (A6 Ultimate, `sunday_ult`)

Menu description: Ultimate. Deedee rolls out the full eight-seat Sunday family dinner table, hitting all foes with a kitchen cyclone, healing the party 60% HP, curing all debuffs, and filling the tray with 3 upgraded Hot Dishes.
Spoken line: "Wash your hands, everybody! Sunday dinner is on the table!"
Battle message: "Deedee rings the dinner bell for the Full Sunday Roast Spread!"
Why it is them: Deedee's big family dinners (celebrated in Chapter 15's "The Eight-Seat Dinner Table") are the emotional anchor of the family.
The joke: She cooks a seven-course feast at 10x speed that blows the monsters away with pure oven heat before setting a spotless tablecloth for the heroes.
Animation beats:

1. Letterbox bars slide in; Deedee ties her apron strings with an action-movie snap as four stove burners ignite in a ring of `COZY` blue-and-orange flame (1.1s).

2. In a whirlwind blur of wooden spoons, rolling pins, and flying colanders, Deedee chops, bastes, and bakes a towering feast; the kitchen tornado sweeps through the entire enemy side (`3.2x COZY DAMAGE ALL!`) (1.5s).

3. A long oak dining table with a white tablecloth slides under the party, laden with roast turkey, mashed potatoes, garden salad, and rhubarb crisp (1.2s).

4. IMPACT: The whole family raises their forks in a warm golden glow (`60% HEAL + CURE ALL`), and the tray fills to the brim with `3 HOT DISHES` (1.4s).
   New assets: poses: apron_tie_hero, spoon_whirlwind / props: oak_dining_table, roast_turkey_platter / scene effects: kitchen_fire_cyclone / sounds: sizzle_whirlwind_dinner_bell

### Power Walk (B1, `powerwalk`)

Menu description: Deedee pumps her light hand-weights and power-walks right over an enemy, boosting her own PEP and pulling her next turn up 25%.
Spoken line: "Keep your arms at ninety degrees! Feel the burn!"
Battle message: "Deedee zips past in a high-speed Power Walk!"
Why it is them: Deedee is a tireless power-walker who leaves people half her age in the dust.
The joke: She wears a sun visor, pumps 2-pound pink dumbbells, and strictly keeps one foot on the ground per power-walking rules while hitting like a truck.
Animation beats:

1. Deedee pops on a white sun visor and grips two tiny pink 2-lb hand weights (0.3s).

2. IMPACT: Her arms and legs pump like pistons (`chugga-chugga-POW!`) as she power-walks straight through the enemy (0.4s).

3. She power-walks back to her spot with a `PEP UP` breeze trailing behind her sneakers (0.3s).
   New assets: poses: visor_power_stride / props: pink_dumbbells, sun_visor / scene effects: speed_breeze / sounds: sneaker_squeak_bam

### Prune the Bushes (B2, `prune`)

Menu description: Deedee takes her heavy-duty garden loppers to an overgrown enemy twice, snipping off one of its buffs (`steal`) and lowering its GRIT.
Spoken line: "Hold still, I'm just shaping up the deadwood!"
Battle message: "Deedee trims the enemy down to size with her garden shears!"
Why it is them: Deedee is an avid gardener who attacks unruly shrubs with surgical precision.
The joke: She shapes the monster's silhouette like a topiary hedge while snipping its buff right off its head.
Animation beats:

1. Deedee pulls out long-handled steel garden loppers and gives them two test snips (`SNIP-SNIP!`) (0.3s).

2. She lunges in and trims the left and right sides of the enemy (`CHOP! CHOP!`) in a shower of flying leaves (0.5s).

3. IMPACT: The enemy's buff icon is neatly clipped off its head and lands on Deedee while its `GRIT` drops (0.4s).
   New assets: poses: shear_snip / props: garden_loppers / scene effects: flying_hedge_leaves / sounds: metallic_snip_slice

### Wine O'Clock (B3, `wine`)

Menu description: Deedee pours herself one well-earned glass of Pinot Grigio, boosting her WARMTH for 3 turns, Pumping Up her next move, and restoring +2 VP.
Spoken line: "Five o'clock somewhere! Just a little splash for the cook."
Battle message: "It's officially Wine O'Clock for Deedee!"
Why it is them: Deedee works non-stop all day and enjoys a single relaxing glass of wine in the evening (her one wine joke in the kit per canon rules).
The joke: The moment she takes one sip, a serene sunset beach backdrop briefly appears behind her while the battle rages on.
Animation beats:

1. A tiny grandfather clock chimes `5:00` as Deedee holds up a stemmed wine glass (0.4s).

2. She swirls the glass, takes one refined sip, and sighs happily against a 1-second pastel sunset glow (0.5s).

3. IMPACT: Deedee winks (`WARMTH UP + PUMPED UP + 2 VP`), ready to heal or hit for double power on her next turn (0.4s).
   New assets: poses: wine_swirl_sip / props: stemmed_wine_glass / scene effects: mini_sunset_halo / sounds: crystal_clink_sigh

### Pie Tin Boomerang (B4, `pietin`)

Menu description: Deedee hurls her recovered heirloom aluminum pie tin across an enemy row, interrupting wind-ups and shattering shields (if Boppy is in the party, adds +1 Heartburn to Boppy!).
Spoken line: "That's my good pie tin! Bring it right back here!"
Battle message: "Deedee whips her prized pie tin across the row like Captain America!"
Why it is them: Recovering Deedee's stolen pie tin from the bog turtle is the whole plot of Chapter 1!
The joke: The crinkled aluminum pie tin rings like vibranium when it ricochets off boss shields.
Animation beats:

1. Deedee holds her shiny fluted pie tin at her hip like a discus thrower (0.3s).

2. IMPACT: She side-arms the pie tin across the entire enemy row (`CLANG-PING-SMASH!`), shattering shields and interrupting wind-ups (0.5s).

3. The tin curves back into her hand; if Boppy is in the party, a spicy crumb flies into his mouth (`+1 Heartburn`) (0.4s).
   New assets: poses: discus_fling / props: fluted_pie_tin / scene effects: metallic_ricochet_sparks / sounds: aluminum_clang_whoosh

### Spring Cleaning (B5, `clean`)

Menu description: Deedee opens all the windows and unleashes a full-house vacuum and bucket blitz, hitting all enemies, knocking the front row back, and curing all party debuffs.
Spoken line: "Open the windows! Everything in this room is getting aired out!"
Battle message: "Deedee declares a mandatory Spring Cleaning blitz!"
Why it is them: When Deedee decides to deep-clean a room, nothing stays in the same spot.
The joke: She vacuums up the party's status debuffs into a canister vacuum and blows the dust bag out onto the monsters.
Animation beats:

1. Deedee ties a bandana around her hair, throws open two floating window frames for a fresh breeze, and switches on a canister vacuum (`VRRRRR!`) (0.5s).

2. The vacuum hose sucks every dark debuff cloud off the party in one clean zip (`CURE ALL!`) (0.4s).

3. IMPACT: Deedee reverses the switch to `BLOW`, blasting a high-pressure gale of soapy water and dust across all enemies that knocks the front row backward (0.5s).
   New assets: poses: bandana_vacuum / props: canister_vacuum, open_window_frame / scene effects: fresh_breeze_gale / sounds: vacuum_roar_splash

### To the Moon and Back (B6 Ultimate, `moon_ult`)

Menu description: Ultimate. Deedee summons a glowing storybook rocket that loops around the full moon and lands on all foes, reviving any KO'd allies at 50% HP, Tucking In the party for 3 turns, and Smittening all enemies.
Spoken line: "Hold on tight! I love this family to the moon and back!"
Battle message: "Deedee takes the whole family To the Moon and Back!"
Why it is them: Turns her signature real-life expression of unconditional maternal love into a literal cosmic journey.
The joke: Even the monsters look up at the starry sky and tear up (`Smitten`) because nobody loves their family harder than Deedee.
Animation beats:

1. Letterbox bars slide in; the stage transforms into a velvety midnight sky filled with twinkling pixel constellations and a giant golden full moon (1.2s).

2. Deedee hugs the party; a glowing golden storybook trail launches from her heart, loops all the way around the moon in a figure-eight, and gathers a tail of stardust (1.4s).

3. As the golden trail passes over the party, any knocked-out allies hop back to their feet (`REVIVE 50%!`) wrapped in shimmering starlight quilts (`Tucked In 3t`) (1.2s).

4. IMPACT: The returning moonbeam cascades down across the entire enemy side in a breathtaking shower of `SPARKLE` starlight (`3.7x DAMAGE ALL + SMITTEN!`), ending with Deedee blowing a kiss (1.4s).
   New assets: poses: blow_kiss_skyward / props: giant_full_moon / scene effects: figure_eight_moonbeam, starlight_quilt / sounds: orchestral_harp_moon_swell

## 6. Boppy

**Design Thesis:** Grumpy-on-the-outside, toughest-guy-in-the-room retired Rikers Deputy Warden and 1970 college cross-country champ who tanks hits from his recliner, weaponizes homegrown ghost peppers, and refuses to let anyone walk too fast.

* **Path A:** **Rikers & Recliner** (Warden headcounts, Cattail Pier fishing lines, La-Z-Boy fortress defense, and "Nobody got past me")

* **Path B:** **Pepper Champ '70** (Homegrown Scoville bombs, stomach-burn counter-roars, and the legendary 1970 cross-country race story)

* **Recommended Auto-Stamp Order:** A1 -> B1 -> A2 -> B2 -> A3 -> B3 -> B4 -> B5 -> B6 (Ultimate 1 at Lvl 26) -> A4 -> A5 -> A6.

### Boppy's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Cap Swat | `capswat` | KEEP | 1 | 0 | 0 | Kinetic | POW | 1.0 | 1 | `enemy` | 1.0 | `+1 VP`, `+5% HEART` | no | 
| Signature | GRUMBLE | `grumble` | KEEP | 1 | 0 | 2 | Chatter | GRIT | 0.0 | 1 | `row` | 0.7 | `st grumbled 2 t`, `st spotlight 2 self`, `st guard 1 self` | no | 
| A1 | Cast Line | `cast` | KEEP | 2 | 1 | 2 | Splash | POW | 1.3 | 1 | `enemy` | 1.0 | `row front t`, `st hooked 2 t` | no | 
| A2 | Recliner Drop | `recliner` | KEEP | 6 | 2 | 3 | Cozy | GRIT | 1.5 | 1 | `enemy` | 1.0 | `heal .35 self`, `st guard 2 self`, `burn +1` | no | 
| A3 | Warden's Headcount | `headcount` | NEW | 11 | 2 | 3 | Chatter | GRIT | 1.4 | 1 | `all` | 1.0 | `reveal`, `interrupt`, `st spotted 2 all` | no | 
| A4 | Slow Down! | `slowdown` | NEW | 16 | 3 | 4 | Chatter | COOL | 1.55 | 1 | `row` | 1.0 | `pace 2`, `ct -0.4 t` | no | 
| A5 | Butterscotch Pocket | `candy` | NEW | 21 | 3 | 3 | Cozy | WARMTH | 0.0 | 1 | `ally` | 0.7 | `heal .40 ally`, `st nobody_gets_past 2 ally` (if Grace/Rose: `vp +2`) | yes | 
| A6 (Ult) | The One That Got Away | `fish_ult` | REWORKED | 26 | 4 | 8 | Splash | POW | 3.6 | 1 | `all` | 1.3 | `st nobody_gets_past 2 party`, `steal all`, `st stunned 1 all` | no | 
| B1 | Pepper Breath | `pepperbreath` | KEEP | 3 | 1 | 2 | Cozy | POW | 1.35 | 1 | `enemy` | 1.0 | `burn +1`, `st cool_down 2 t` | no | 
| B2 | Homegrown Habanero | `habanero` | REWORKED | 7 | 2 | 3 | Cozy | POW | 1.6 | 1 | `splash` | 1.0 | `burn +1`, `st pow_up 2 self`, `cure amber self` | yes | 
| B3 | My Stomach's Acting Up | `stomach` | NEW | 12 | 2 | 3 | Chatter | GRIT | 0.0 | 1 | `self` | 0.7 | `burn +2`, `st guard 2 self`, `st spotlight 2 self` | no | 
| B4 | Class of 1970 | `story1970` | REWORKED | 17 | 3 | 4 | Chatter | WARMTH | 1.45 | 1 | `all` | 1.0 | `st drowsy 2 all`, `st pep_up 3 self` | yes | 
| B5 | Five-Alarm Jar | `pepperjar` | NEW | 22 | 3 | 5 | Cozy | POW | 1.95 | 1 | `splash` | 1.0 | `shieldBreak`, `burn +1` (if TNB in party: `crit 1`) | no | 
| B6 (Ult) | Van Cortlandt Park '70 | `xc_ult` | NEW | 28 | 4 | 8 | Kinetic | POW | 3.9 | 1 | `all` | 1.3 | `burn +3`, `ct -0.8 all`, `st personal_best 2 self` | no | 

### Boppy's Ability Cards

### Cap Swat (Basic, `capswat`)

Menu description: Boppy takes off his baseball cap and swats an enemy like a pesky mosquito. Costs 0 VP.
Spoken line: "Get outta here with that nonsense!"
Battle message: "Boppy swats the enemy with his cap!"
Why it is them: Boppy has zero patience for flashy monster theatrics when a folded cap handles it just fine.
The joke: He swats a ten-foot monster the exact way a grandpa swats a housefly off the screen porch.
Animation beats:

1. Boppy takes off his baseball cap with one hand while grumbling (0.3s).

2. IMPACT: He steps in and gives the enemy a crisp backhand `THWACK!` across the snout with the cap (0.3s).

3. He plops the cap right back on his head and crosses his arms (0.3s).
   New assets: poses: cap_swat / props: boppy_cap / scene effects: dust_puff / sounds: cloth_whack

### GRUMBLE (Signature, `grumble` - Enhanced Animation Proposal)

Menu description: Boppy grumbles about his stomach and how fast everyone walks, lowering an enemy row's POW/WARMTH by 30%, drawing their attacks (`Spotlight`), and Guarding himself. (At 3 Heartburn: unleashes a Counter-Roar stun!)
Spoken line: "My stomach's not right, and everybody walks too fast!"
Battle message: "Boppy lets out a world-class Grandpa Grumble!"
Why it is them: Captures Boppy's exact canon complaints (always his stomach and people walking too fast, never his knees/joints) while showing he is secretly shielding the whole family.
The joke: His complaining is so gravelly and authoritative that the monsters feel guilty and hit 30% softer.
Animation beats:

1. Boppy pats his belly with one hand, waves the other hand dismissively, and mutters under a dark thundercloud (0.4s).

2. Heavy gravel-voiced text bubbles (`TOO FAST!`, `OOOH MY STOMACH!`) roll across the enemy row (0.4s).

3. IMPACT: The enemies slump (`Grumbled`) and lock their eyes on Boppy as he plants his feet in a brick-wall `Guard` stance (0.4s).
   New assets: poses: belly_pat_grumble / props: grumble_cloud / scene effects: brick_shield_aura / sounds: low_grumble_brass

### Cast Line (A1, `cast`)

Menu description: Boppy casts his heavy saltwater fishing rod into the back row, yanking an enemy to the front row and leaving it Hooked (cannot dodge).
Spoken line: "Got a bite! Reel 'em in slow!"
Battle message: "Boppy hooks the target and reels it to the front row!"
Why it is them: Boppy loves fishing (Cattail Pier in Chapter 3) and never lets a catch slip the hook.
The joke: He snags a back-row monster by the collar and drags it across the stage like a 40-pound striped bass.
Animation beats:

1. Boppy flicks his wrist with a long fiberglass fishing rod (`ZIIIIIP!`) (0.3s).

2. A red-and-white bobber arcs over the front row and hooks onto the target enemy (0.4s).

3. IMPACT: Boppy cranks the reel twice (`CLICK-CLICK-YANK!`), sliding the enemy straight into the front row with a `Hooked` anchor icon (0.4s).
   New assets: poses: rod_cast_reel / props: fishing_rod, red_white_bobber / scene effects: splash_line_tug / sounds: reel_zip_splash

### Recliner Drop (A2, `recliner`)

Menu description: Boppy pulls the lever on his favorite leather recliner, flattening an enemy with the footrest while healing himself 35% HP, Guarding for 2 turns, and gaining +1 Heartburn.
Spoken line: "Don't touch my chair! I just got comfortable!"
Battle message: "Boppy kicks out the footrest on his leather recliner!"
Why it is them: Boppy's recliner is his throne, and even when he is "resting" he hits like a freight train.
The joke: A 200-pound plush brown La-Z-Boy falls out of the sky onto the monster before Boppy sits in it.
Animation beats:

1. A giant brown leather recliner drops from the top of the screen right onto the target enemy (`CRUNCH!`) (0.4s).

2. Boppy hops into the seat and pulls the side wooden handle (`KA-CHUNK!`) (0.4s).

3. IMPACT: The spring-loaded footrest kicks outward into the enemy's chin as Boppy leans back with a contented sigh (`35% Heal + Guard + 1 Heartburn`) (0.5s).
   New assets: poses: recliner_lean / props: leather_recliner / scene effects: footrest_spring_burst / sounds: spring_ka_chunk

### Warden's Headcount (A3, `headcount`)

Menu description: Boppy channels his Rikers Deputy Warden voice for an inspection, hitting all foes, interrupting wind-ups, revealing weaknesses, and Spotting everyone.
Spoken line: "Line up for count! Nobody got past me at Rikers!"
Battle message: "Assistant Deputy Warden Boppy calls a mandatory Headcount!"
Why it is them: Boppy is a retired Assistant Deputy Warden at Rikers Island and proud that "nobody got past me."
The joke: He clicks a metal tally counter and shines a heavy Maglite flashlight down the line, and the monsters instinctively stand at attention.
Animation beats:

1. Boppy stands tall, adjusts his belt, and clicks a silver mechanical tally counter (`CLICK-CLICK!`) (0.4s).

2. He sweeps a heavy-duty black flashlight beam across every enemy in both rows (`1! 2! 3! 4!`) (0.5s).

3. IMPACT: A steel cell-door `CLANG!` echoes across the stage, breaking any boss wind-up and stamping every enemy's weakness and `Spotted` icon into view (0.4s).
   New assets: poses: warden_flashlight_sweep / props: heavy_flashlight, tally_counter / scene effects: spotlight_cone_numbers / sounds: cell_door_clang_click

### Slow Down! (A4, `slowdown`)

Menu description: Boppy yells at everyone to quit rushing, knocking a row's turns back 40% and locking the battlefield speed ceiling to Boppy's pace (`pace`: slows faster enemies by 35% for 2 turns).
Spoken line: "Where's the fire?! Everybody walks too fast around here!"
Battle message: "Boppy enforces a strict speed limit on the turn ribbon!"
Why it is them: Boppy's signature complaint whenever the family walks down the street or through an airport.
The joke: He puts up a `SPEED LIMIT: BOPPY` road sign next to the CTB turn ribbon that flashes red tickets at fast monsters.
Animation beats:

1. Boppy stops dead in his tracks, throws both hands up, and scowls at the CTB turn ribbon (0.4s).

2. A white metal street sign reading `NO RUNNING - BOPPY'S PACE ONLY` slams into the ground in front of the enemy row (0.4s).

3. IMPACT: A radar speed-camera flash (`FLASH!`) blasts the enemy row backward down the ribbon and locks a heavy amber speed-governor bracket over the CTB bar (0.5s).
   New assets: poses: both_hands_stop / props: speed_limit_boppy_sign / scene effects: speed_camera_flash / sounds: whistle_brake_screech

### Butterscotch Pocket (A5, `candy`)

Menu description: Boppy digs into his cardigan pocket and slips a shiny gold butterscotch hard candy to an ally (or monster!), healing 40% HP and granting `Nobody Gets Past` (40% damage reduction) for 2 turns (+2 VP if given to Grace or Rose).
Spoken line: "Here, don't tell your mother I gave you candy before dinner."
Battle message: "Boppy sneaks a pocket butterscotch to his favorite!"
Why it is them: Underneath all the grumbling, Boppy adores his granddaughters and family and always has something in his pocket for them.
The joke: He looks left and right like he is pulling off a prison heist just to hand Rose or Grace a piece of golden candy.
Animation beats:

1. Boppy glances left and right furtively, reaches deep into his pocket, and pulls out a crinkly gold-wrapped butterscotch disc (0.4s).

2. He winks and presses it into the target ally's (or monster's) hand (0.4s).

3. IMPACT: The gold wrapper unwraps with a loud `CRINKLE-SHINE!`, healing 40% HP and wrapping the target in Boppy's protective `Nobody Gets Past` shield (0.4s).
   New assets: poses: secretive_wink_handoff / props: gold_butterscotch / scene effects: wrapper_gold_shield / sounds: wrapper_crinkle_warm_bell

### The One That Got Away (A6 Ultimate, `fish_ult`)

Menu description: Ultimate. Boppy reels in a whale-sized legendary marsh catfish that belly-flops onto the entire enemy team, stealing all enemy buffs, Stunning all foes, and shielding the party (`Nobody Gets Past`).
Spoken line: "Told you the fish was THIS big! Stand back, kids!"
Battle message: "Boppy hooks the legendary hundred-pounder from Whispering Marsh!"
Why it is them: Every fisherman has a story about a monster fish, except Boppy actually reels it onto the stage.
The joke: He measures the fish with his arms wider and wider three times, and the fish grows in mid-air to match his exaggeration before landing on the enemies.
Animation beats:

1. Letterbox bars slide in; water ripples flood the stage floor as Boppy braces one boot against a wooden pier piling and yanks his bent-double fishing rod skyward (1.2s).

2. A giant whiskered catfish leaps into the air; Boppy holds his hands two feet apart (`"IT WAS THIS BIG"`), then four feet (`"NO, THIS BIG"`), then all the way across the screen (`"HONEST TO GOD!"`), and the fish inflates to the size of a city bus (1.5s).

3. The colossal catfish blocks out the ceiling lights, casting a massive shadow over every enemy (1.0s).

4. IMPACT: The mega-catfish belly-flops across the entire enemy side (`3.6x SPLASH DAMAGE ALL + STUN!`), sending a tidal wave that washes all enemy buffs onto Boppy's side and leaves the party behind a wooden pier barricade (`Nobody Gets Past`) (1.5s).
   New assets: poses: pier_brace_haul, fish_size_brag / props: bus_sized_catfish, pier_pilings / scene effects: tidal_bellyflop / sounds: reel_scream_whale_splash

### Pepper Breath (B1, `pepperbreath`)

Menu description: Boppy crunches a homegrown cayenne pepper and exhales a cone of spicy fire onto a foe, lowering its COOL and giving Boppy +1 Heartburn.
Spoken line: "Grew these right in the backyard! Try one!"
Battle message: "Boppy crunches a backyard cayenne and breathes fire!"
Why it is them: Boppy grows his own dangerously hot peppers and eats them straight off the stem.
The joke: His ears whistle like a teakettle before a literal dragon fireball comes out.
Animation beats:

1. Boppy pops a bright red homegrown pepper into his mouth (`CRUNCH!`) (0.3s).

2. His face turns bright red from the chin up as steam shoots out of both ears (`WHEEEEE!`) (0.4s).

3. IMPACT: He exhales a roaring cone of `COZY` pepper flame onto the target while his `HEARTBURN +1` meter ticks up (0.4s).
   New assets: poses: red_face_steam / props: red_cayenne_pepper / scene effects: pepper_fire_cone / sounds: crunch_kettle_roar

### Homegrown Habanero (B2, `habanero`)

Menu description: Boppy tosses a basket of his prize orange habaneros that bursts across a target and its neighbors, boosting Boppy's POW by 40%, thawing his Amber, and adding +1 Heartburn. Can be fed to spicy-food-loving monsters (`kindFoe`)!
Spoken line: "That one's got a little kick! Good for the sinuses!"
Battle message: "Boppy shares his prize harvest of Homegrown Habaneros!"
Why it is them: Boppy takes immense pride in his backyard pepper patch and calls five-alarm heat "just a little kick."
The joke: A single drop of juice from the habanero melts the asphalt under the enemies' feet.
Animation beats:

1. Boppy holds up a gardener's basket overflowing with glowing orange habanero peppers (0.4s).

2. He pitches three prize peppers into the center of the enemy group (0.4s).

3. IMPACT: The peppers detonate in a spicy orange `COZY` cloud of Scoville sparks (`POW UP + HEARTBURN +1` for Boppy, or happy spicy tears if `kindFoe`) (0.5s).
   New assets: poses: basket_toss / props: habanero_basket / scene effects: scoville_orange_burst / sounds: sizzle_boom_crunch

### My Stomach's Acting Up (B3, `stomach`)

Menu description: Boppy clutches his stomach after eating too many peppers, instantly gaining +2 Heartburn (priming his Counter-Roar!), Guarding for 2 turns, and drawing enemy attacks.
Spoken line: "Ooh, I shouldn't have had that third pepper... my stomach!"
Battle message: "Boppy's stomach is rumbling like a volcano! (+2 Heartburn!)"
Why it is them: Directly marries his two favorite things: eating way too many spicy peppers and complaining that his stomach isn't feeling good.
The joke: His stomach rumbles so loudly at 90 decibels that the whole screen shakes and primes his 3-stack Heartburn Counter-Roar in a single button press.
Animation beats:

1. Boppy holds both hands over his belly with a sour expression as a cartoon volcano icon bubbles over his midsection (0.4s).

2. A deep subterranean `GRUUUUUMBLE-GURGLE` shakes the camera (0.4s).

3. IMPACT: Two fiery `HEARTBURN` pips slam into his gauge (`+2`), surrounding him in a red-hot `Guard` + `Spotlight` aura that dares anyone to touch him (0.4s).
   New assets: poses: double_hand_belly_clutch / props: none / scene effects: belly_volcano_glow / sounds: stomach_thunder_rumble

### Class of 1970 (B4, `story1970`)

Menu description: Boppy launches into his unabridged story about entering college in 1970 as a cross-country star, putting all enemies to sleep (`Drowsy`) while boosting his own PEP for 3 turns. Counts as a cozy story for monsters (`kindFoe`)!
Spoken line: "Did I ever tell you kids? Fall of nineteen-seventy, freshman year..."
Battle message: "Boppy starts the 1970 College Cross-Country Story from the beginning!"
Why it is them: Canon fact: Boppy entered college in 1970 as a cross-country champion and LOVES telling the story at every family gathering.
The joke: While the enemies nod off under giant `Zzz` bubbles, Boppy gets so hyped up remembering his 20-year-old self that his own PEP skyrockets.
Animation beats:

1. Boppy raises one finger like a professor as a giant vintage serif `1970` banner unfurls across the top of the screen (0.4s).

2. Long scrolling speech ribbons filled with tiny running-shoe icons and `"...AND THEN THE COACH SAID..."` float across the entire enemy team (0.6s).

3. IMPACT: Heavy `ZZZ` bubbles drop onto every enemy (`Drowsy`), while Boppy puffs his chest out with fiery youthful `PEP UP` energy (0.4s).
   New assets: poses: story_finger_raise / props: banner_1970 / scene effects: scrolling_story_ribbons, sleep_zzz / sounds: grandpa_talk_lullaby_horn

### Five-Alarm Jar (B5, `pepperjar`)

Menu description: Boppy unscrews his secret mason jar of pickled ghost peppers, shattering boss shields, splashing foes with fiery brine, and adding +1 Heartburn (guaranteed crit if TNB is in the party!).
Spoken line: "Aged six months in the basement! Stand downwind!"
Battle message: "Boppy cracks open the forbidden Five-Alarm Pepper Jar!"
Why it is them: References the exact pepper jar swallowed by Old Iron-Gill in Chapter 3 and his Chapter 15 pepper-eating contest with TNB.
The joke: The mason jar has three skull-and-crossbones stickers on it, and if TNB is present, TNB clinks his own pepper against it for a guaranteed critical hit.
Animation beats:

1. Boppy pulls out a glowing red mason jar labeled `XXX DO NOT OPEN - BOPPY'S PRIVATE RESERVE` (0.4s).

2. He twists the lid off with a pressurized `HISSSSS-POP!` (if TNB is in the party, TNB grabs a pepper from the jar and cheers!) (0.4s).

3. IMPACT: A geyser of molten pickled pepper brine erupts across the target and neighbors, melting boss shields on contact (`SHIELD BREAK!`) and adding `+1 Heartburn` (0.5s).
   New assets: poses: jar_twist_open / props: skull_pepper_jar / scene effects: brine_lava_geyser / sounds: pressure_hiss_explosion

### Van Cortlandt Park '70 (B6 Ultimate, `xc_ult`)

Menu description: Ultimate. Boppy relives his 1970 championship cross-country race in glorious sepia tone, lapping the entire enemy formation for massive damage, knocking their turns back 80%, maxing his Heartburn (+3), and granting himself `Personal Best`.
Spoken line: "Nineteen-seventy! Eight miles on the hills and nobody caught me!"
Battle message: "Flashback to 1970! Young Boppy takes the lead on the cross-country course!"
Why it is them: Beneath Boppy's grumbling about slowing down is the heart of a champion runner who wants his granddaughters to see what he could do.
The joke: Present-day Boppy kicks off his slippers, steps into a sepia-toned 1970 film reel, and outruns every monster in the room before complaining about his stomach at the end.
Animation beats:

1. Letterbox bars slide in; a vintage 8mm film projector whirs to life, washing the stage in warm 1970 sepia film grain with a giant `OCTOBER 1970 - CHAMPIONSHIP` title card (1.2s).

2. A starting pistol fires (`BANG!`); Boppy sheds his cardigan to reveal a vintage 1970 varsity singlet with short running shorts and takes off like a rocket across an autumn trail (1.3s).

3. Boppy laps the entire enemy formation three times in a blazing figure-eight tornado of autumn leaves and `KINETIC` shockwaves (`LAPPED! LAPPED! LAPPED!`) (1.3s).

4. IMPACT: Boppy bursts through the championship banner (`3.9x DAMAGE ALL + -80% CT!`); the sepia film snaps back to full color as present-day Boppy catches his breath, pats his belly (`+3 HEARTBURN + PERSONAL BEST`), and mutters "Still got it" (1.5s).
   New assets: poses: varsity_1970_sprint / props: starter_pistol, autumn_finish_banner / scene effects: sepia_8mm_film_overlay, autumn_leaf_tornado / sounds: projector_whir_pistol_crowd_roar

## 7. TNB

**Design Thesis:** Chill, crafty LA potter, backlot wardrobe runner, horror-movie buff, and longboarder who dresses the party in plot-armor costumes, fires Cone Six ceramic kilns, and drops puns while fixing everything.

* **Path A:** **Backlot Costumer** (Wardrobe racks, scene continuity polaroids, horror-movie jump scares, and LA Metro express trains)

* **Path B:** **Kiln & Longboard** (Wheel-thrown stoneware, Cone Six glaze blasts, handy gaffer-tape repairs, and steep LA hill bombs)

* **Recommended Auto-Stamp Order:** A1 -> B1 -> A2 -> B2 -> A3 -> B3 -> A4 -> A5 -> A6 (Ultimate 1 at Lvl 26) -> B4 -> B5 -> B6.

### TNB's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Mug Toss | `mugtoss` | KEEP | 1 | 0 | 0 | Kinetic | WARMTH | 1.0 | 1 | `enemy` | 1.0 | `+1 VP`, `+5% HEART` | no | 
| Signature | WARDROBE | `wardrobe` | KEEP | 1 | 0 | 4 | Sparkle | WARMTH | 0.0 | 1 | `allyko` | 1.0 | `revive .50 ally`, `heal .50 ally`, `rack`, `st wardrobe_fresh 2 ally` | yes | 
| A1 | Quick Change | `quickchange` | KEEP | 2 | 1 | 2 | Sparkle | WARMTH | 0.0 | 1 | `ally` | 0.7 | `cure all ally`, `rack`, `heal .25 ally` (if Tom: `+1 mile`) | yes | 
| A2 | Metro Tap Card | `nextstop` | REWORKED | 6 | 2 | 3 | Kinetic | PEP | 0.0 | 1 | `party` | 0.7 | `ct +0.45 party`, `st pep_up 2 party` | no | 
| A3 | Slasher Jump Scare | `jumpscare` | KEEP | 11 | 2 | 3 | Chatter | COOL | 1.45 | 1 | `row` | 1.0 | `st scared_stiff 2 t`, `interrupt` | no | 
| A4 | Continuity Polaroid | `polaroid` | NEW | 16 | 3 | 4 | Sparkle | COOL | 0.0 | 1 | `ally` | 0.7 | `continuity 1 ally`, `st cool_up 2 ally`, `cure 1 ally` | yes | 
| A5 | Practical Effects | `fx_gore` | NEW | 21 | 3 | 4 | Splash | WARMTH | 1.7 | 1 | `splash` | 1.0 | `st pow_down 2 t`, `st cool_down 2 t`, `steal` | no | 
| A6 (Ult) | That's a Wrap! | `wrap_ult` | REWORKED | 26 | 4 | 8 | Sparkle | WARMTH | 3.5 | 1 | `all` | 1.3 | `heal .40 party`, `rack party`, `st wardrobe_fresh 2 party` | no | 
| B1 | Sunset Carve | `carve` | KEEP | 3 | 1 | 2 | Kinetic | POW | 1.35 | 1 | `enemy` | 0.7 | `st cool_down 2 t`, `st evasive 1 self` | no | 
| B2 | Center the Clay | `wheel` | NEW | 7 | 2 | 3 | Splash | WARMTH | 1.5 | 1 | `enemy` | 1.0 | `st dizzy 2 t`, `st slowed 2 t` | yes | 
| B3 | Cone Six Kiln | `kiln` | REWORKED | 12 | 2 | 4 | Cozy | WARMTH | 1.7 | 1 | `splash` | 1.0 | `shieldBreak`, `cure amber party`, `st kiln_glow 2 self` | no | 
| B4 | Gaffer Tape Fix | `fixit` | NEW | 17 | 3 | 3 | Cozy | WARMTH | 0.0 | 1 | `ally` | 0.7 | `heal .45 ally`, `st grit_up 2 ally` (if Tom: kisses Tom for `+2 VP`) | yes | 
| B5 | Glaze Drip | `glaze` | NEW | 22 | 3 | 5 | Cozy | hybrid | 1.6 | 1 | `row` | 1.0 | `st glued 2 t`, `st cool_down 2 t` | no | 
| B6 (Ult) | Baxter Street Bomb | `hillbomb_ult` | REWORKED | 28 | 4 | 8 | Kinetic | hybrid | 3.9 | 1 | `all` | 1.3 | `st evasive 3 self`, `st staggered 1 all`, `ct +0.5 tom` | no | 

### TNB's Ability Cards

### Mug Toss (Basic, `mugtoss`)

Menu description: TNB casually tosses a slightly crooked bisque-fired test mug that clunks the enemy on the head. Costs 0 VP.
Spoken line: "Well, well, well... that glaze was a test tile anyway."
Battle message: "TNB lobs a stoneware studio reject mug!"
Why it is them: Every potter has a shelf of slightly wonky test mugs waiting for a good use, and TNB's catchphrase is "Well, well, well..."
The joke: He critiques the foot-ring of the mug for a split second before chucking it.
Animation beats:

1. TNB holds up a speckled stoneware mug, squints at the bottom, and shrugs (0.3s).

2. He underhand-tosses it in a lazy arc across the screen (0.3s).

3. IMPACT: The mug bonks the enemy (`CLINK-CRACK!`) into ceramic shards (0.3s).
   New assets: poses: mug_inspect_shrug / props: speckled_mug / scene effects: ceramic_shards / sounds: pottery_clink_bonk

### WARDROBE (Signature, `wardrobe` - Enhanced Animation Proposal)

Menu description: TNB rolls a film-set costume rack across an ally (or KO'd ally), reviving/healing 50% HP, granting `Wardrobe Fresh`, and dressing them in the next Quick-Change costume (`Action Hero -> Cozy Cardigan -> Final Girl`).
Spoken line: "Hold up, let's get you into Hero Wardrobe for Scene Two."
Battle message: "TNB rolls in the Backlot Quick-Change Rack!"
Why it is them: TNB works as a wardrobe runner on film sets managing costume racks for each scene.
The joke: He zips a rolling garment rack past a knocked-out teammate like a Broadway quick-change curtain, and they pop out upright in a fresh movie outfit.
Animation beats:

1. TNB whistles and pushes a Chrome Rolling Wardrobe Rack hung with plastic-bagged movie costumes across the target ally (0.4s).

2. Clothes hangers clatter (`ZIIIIIP-SWISH!`) as a privacy curtain spins around the ally for half a second (0.5s).

3. IMPACT: The rack rolls away; the ally hops up at 50% HP wearing a glowing costume icon (`Action Hero` sunglasses, `Cozy Cardigan` knit, or `Final Girl` jacket) (0.4s).
   New assets: poses: rack_push / props: rolling_costume_rack / scene effects: hanger_sparkle_curtain / sounds: hanger_zip_ta_da

### Quick Change (A1, `quickchange`)

Menu description: TNB steams out all debuffs on an ally, heals 25% HP, and cycles them into the next costume on his Quick-Change Rack (if used on Tom, grants Tom +1 Upgrade Mile!). Can also dress up a monster (`kindFoe`).
Spoken line: "Stand still, Tom, you've got a wrinkle on the lapel."
Battle message: "TNB hits the target with a two-second Quick Change!"
Why it is them: TNB talks about Tom, pottery, and fixing things, and takes pride in keeping Tom looking sharp.
The joke: He blasts a handheld garment steamer that literally melts status debuffs off his teammate's clothes.
Animation beats:

1. TNB dashes up to the target with a handheld garment steamer and a lint roller (0.3s).

2. Two quick blasts of warm steam (`PSSSH-PSSSH!`) evaporate every debuff icon on the target (0.4s).

3. IMPACT: TNB flips a fresh costume piece onto their shoulders (`rack`); if the target is Tom, TNB gives him a quick cheek kiss with a floating pixel heart (`+1 Mile`) (0.4s).
   New assets: poses: steamer_puff, cheek_kiss / props: garment_steamer / scene effects: steam_heart_pop / sounds: steam_hiss_kiss

### Metro Tap Card (A2, `nextstop`)

Menu description: TNB taps his LA Metro card at the turnstile, summoning a light-rail train that pulls the whole party's turns up 45% on the ribbon and boosts PEP.
Spoken line: "Tap in, everybody! E Line train is pulling right up."
Battle message: "TNB taps his Metro card! Express train to the front of the turn order!"
Why it is them: Canon fact: TNB loves mass transit and riding the LA Metro across town.
The joke: A stainless-steel Metro turnstile and yellow light-rail doors slide open right on the battle stage to give the party a lift down the CTB bar.
Animation beats:

1. TNB holds up a blue LA Metro `TAP` card and taps it against a glowing fare gate (`BEEP! GO!`) (0.4s).

2. A sleek yellow-and-silver Metro light-rail car whooshes behind the party with a two-tone station chime (`DING-DONG!`) (0.5s).

3. IMPACT: The whole party slides forward 45% along the CTB turn ribbon on glowing transit map lines (`PEP UP!`) (0.4s).
   New assets: poses: tap_card_swipe / props: metro_turnstile, tap_card / scene effects: transit_line_whoosh / sounds: metro_beep_ding_dong

### Slasher Jump Scare (A3, `jumpscare`)

Menu description: TNB dims the soundstage lights and triggers a classic 80s horror-movie jump scare across a row, interrupting wind-ups and leaving foes Scared Stiff (-40% PEP).
Spoken line: "Whatever you do... don't look behind the wardrobe rack."
Battle message: "TNB cues a classic horror-movie Jump Scare!"
Why it is them: TNB is a huge horror movie buff and Chapter 4 takes place on haunted Soundstage 13.
The joke: He holds a flashlight under his chin and pulls a string on a rubber prop bat, yet a screeching violin sting scares the monsters out of their wits.
Animation beats:

1. The screen suddenly cuts to pitch black except for TNB holding a flashlight under his chin with a spooky grin (0.4s).

2. Suspenseful tiptoe strings play for a beat... then TNB pulls a prop cord (`"BOO!"`) (0.4s).

3. IMPACT: A giant VHS-glitch rubber monster mask flashes across the enemy row with a piercing psycho-violin screech (`SCARED STIFF + INTERRUPT!`) (0.5s).
   New assets: poses: flashlight_chin_spook / props: rubber_prop_mask / scene effects: pitch_black_vhs_flash / sounds: psycho_violin_sting

### Continuity Polaroid (A4, `polaroid`)

Menu description: TNB snaps a wardrobe continuity Polaroid of an ally (or monster!), curing 1 debuff, boosting COOL, and taking a `Continuity` snapshot (if their HP drops before their next turn ends, they revert to the photo's HP!).
Spoken line: "Hang on, let me get a continuity shot for the binder."
Battle message: "TNB snaps a Wardrobe Continuity Polaroid!"
Why it is them: Real film-set costumers take reference photos of actors before every scene so damage or dirt doesn't break continuity between takes.
The joke: If a monster hits the ally after the photo is taken, TNB points at his Polaroid binder and yells "Cut! That bruise wasn't in Scene 4!" and the damage is undone.
Animation beats:

1. TNB holds up a vintage instant Polaroid camera and frames the target ally (0.3s).

2. `FLASH-WHIRRRR!` The camera spits out a white-bordered instant photo that TNB shakes twice and clips into his production binder (0.5s).

3. IMPACT: A glowing white Polaroid frame hovers around the ally (`Continuity` + `COOL Up`), ready to rewind any HP loss back to the snapshot (0.4s).
   New assets: poses: polaroid_snap_shake / props: instant_camera, continuity_photo / scene effects: photo_frame_shield / sounds: shutter_flash_whir

### Practical Effects (A5, `fx_gore`)

Menu description: TNB rig-blasts a foe and its neighbors with a gallon of sticky corn-syrup movie blood and foam latex, lowering POW and COOL and stealing a buff.
Spoken line: "Relax, it's just corn syrup and red food coloring. Mostly."
Battle message: "TNB fires the Practical Effects slime cannon!"
Why it is them: As a horror fan and film-set pro, TNB prefers old-school 1980s practical effects over CGI every time.
The joke: The enemies think they are melting until they taste it and realize it is cherry-flavored pancake syrup.
Animation beats:

1. TNB pumps a brass special-effects pressure tank labeled `STAGE BLOOD - CORN SYRUP` (0.4s).

2. He aims the nozzle and unleashes a high-pressure splat of bright crimson movie goo across the target and neighbors (0.5s).

3. IMPACT: Enemies are drenched in sticky syrup drips (`POW Down` + `COOL Down`) while a loose buff washes off onto TNB (0.4s).
   New assets: poses: fx_pump_spray / props: fx_pressure_tank / scene effects: syrup_splatter_wave / sounds: pump_splat_squelch

### That's a Wrap! (A6 Ultimate, `wrap_ult`)

Menu description: Ultimate. TNB claps the director's slate to wrap production on the enemies, striking the entire set down onto all foes, healing the party 40% HP, and dressing every ally in a fresh costume (`Wardrobe Fresh`).
Spoken line: "Well, well, well... print that take! That's a wrap on you guys!"
Battle message: "CLACK! TNB calls 'THAT'S A WRAP' and strikes the whole soundstage!"
Why it is them: The ultimate backlot production move: when the shoot is over, the crew tears down the walls in thirty seconds flat.
The joke: TNB claps the slate, yells "STRIKE THE SET!", and the literal background scenery of the battle falls forward like a Buster Keaton facade onto the monsters.
Animation beats:

1. Letterbox bars slide in; TNB steps to the front of the screen holding a black-and-white film clapperboard reading `SCENE 20 - FINAL TAKE` and snaps it shut (`CLACK!`) (1.1s).

2. TNB shouts into a megaphone; three rolling wardrobe racks zip across the party, healing everyone 40% HP and cycling all four allies into fresh costumes with `Wardrobe Fresh` sparkles (1.4s).

3. Overhead studio stage lights, boom mics, and the entire painted backdrop of the battlefield unbolt and tilt forward toward the enemies (1.2s).

4. IMPACT: The whole soundstage collapses onto the enemy formation in a massive explosion of `SPARKLE` pyrotechnics and `END CREDITS` text (`3.5x DAMAGE ALL!`), leaving TNB sipping craft-services coffee in a folding canvas chair (1.5s).
   New assets: poses: clapperboard_snap, director_chair_sip / props: film_slate, studio_light_rig / scene effects: falling_backdrop_wall / sounds: slate_clack_crash_applause

### Sunset Carve (B1, `carve`)

Menu description: TNB carves a tight S-turn on his longboard around an enemy, spraying road grit to lower its COOL and making himself Evasive for 1 turn.
Spoken line: "Watch the bushings, carving through!"
Battle message: "TNB carves a smooth longboard arc past the enemy!"
Why it is them: TNB longboards all over Los Angeles with effortless balance.
The joke: He doesn't even step off the deck; he powerslides a half-circle right around the monster's shins.
Animation beats:

1. TNB drops his pintail longboard onto the floor and pushes off with one foot (0.3s).

2. IMPACT: He leans deep into a tight carve right under the enemy's nose (`SKRRRRRT!`), spraying sparks and street grit into its face (`COOL Down`) (0.4s).

3. He rolls smoothly back to his spot in an `Evasive` low crouch (0.3s).
   New assets: poses: longboard_carve_lean / props: pintail_longboard / scene effects: polyurethane_wheel_streak / sounds: skate_roll_powerslide

### Center the Clay (B2, `wheel`)

Menu description: TNB spins an enemy on his electric pottery wheel at 300 RPM while splashing slip water, leaving the foe Dizzy and Slowed. Counts as an art lesson for monsters (`kindFoe`)!
Spoken line: "Elbows locked to your knees... gotta center the clay first."
Battle message: "TNB spins the enemy on the potter's wheel! Hold your center!"
Why it is them: Centering clay on the wheel is the foundational skill of TNB's pottery studio (featured in Chapter 12).
The joke: He splashes pottery water on the monster and shapes its cheeks like a vase while it spins like a top.
Animation beats:

1. TNB steps on a potter's foot pedal (`WHIRRRRR!`); a circular metal wheel-head appears beneath the target enemy's feet (0.4s).

2. The enemy spins rapidly at 300 RPM as TNB splashes a bowl of muddy clay slip water onto it (0.5s).

3. IMPACT: The wheel brakes; the enemy wobbles like wet clay (`Dizzy` + `Slowed`) with a freshly thrown ceramic bowl sitting on its head (0.4s).
   New assets: poses: potter_pedal_hands / props: pottery_wheel_base, slip_bowl / scene effects: clay_water_spiral / sounds: electric_wheel_hum_splat

### Cone Six Kiln (B3, `kiln`)

Menu description: TNB opens his studio kiln at peak Cone Six firing temperature ($2200^\circ\text{F}$), shattering boss shields, splashing foes, thawing party Amber, and granting himself `Kiln Glow` (+25% WARMTH/COOL).
Spoken line: "Careful, we're firing at Cone Six. That's two thousand degrees."
Battle message: "TNB vents the studio kiln at peak Cone Six heat!"
Why it is them: Canon fact: TNB fires his stoneware pottery at "Cone Six" ($2232^\circ\text{F}$) and talks about kiln schedules with real passion.
The joke: A pyrometric witness cone bends to a perfect 90-degree angle on the HUD right before the heat wave melts the boss's shield.
Animation beats:

1. An octagonal brick electric pottery kiln materializes beside TNB; a tiny digital gauge ticks up to `CONE 6 - 2232°F` as the witness cone bends (0.4s).

2. TNB flips on heavy heat-resistant kevlar gloves and cracks the kiln lid open (0.4s).

3. IMPACT: A blinding orange-white `COZY` thermal wave blasts across the target and neighbors (`SHIELD BREAK!`), thawing all Amber on the party and wrapping TNB in a molten `Kiln Glow` (0.5s).
   New assets: poses: kiln_glove_open / props: octagonal_kiln, pyrometric_cone / scene effects: cone_six_heat_wave / sounds: furnace_whoosh_shatter

### Gaffer Tape Fix (B4, `fixit`)

Menu description: TNB patches up an ally (or monster!) with pro gaffer tape and a ceramic mug of tea, healing 45% HP and boosting GRIT (if used on Tom, TNB greets Tom with a kiss and a heart for +2 VP!).
Spoken line: "Well, well, well, nothing a little gaffer tape can't fix, babe."
Battle message: "TNB patches things right up with studio gaffer tape!"
Why it is them: Canon fact: TNB loves fixing things around the house, talks about Tom and pottery, and always greets Tom with a kiss and a heart.
The joke: Matte-black film-set gaffer tape somehow repairs bruised ribs, broken armor, and hurt feelings equally well.
Animation beats:

1. TNB pulls a roll of matte-black gaffer tape off his belt and tears three strips with his teeth (`RIP-RIP-SNAP!`) (0.4s).

2. He crisscrosses the tape over the ally's armor (`GRIT Up`) and hands them a warm hand-thrown mug (`45% Heal`) (0.4s).

3. IMPACT: If the target is Tom, TNB leans in for his signature kiss and a big pixel heart floats up (`+2 VP` to Tom!) (0.4s).
   New assets: poses: tape_tear, kiss_tom / props: gaffer_tape_roll, ceramic_tea_mug / scene effects: big_pixel_heart / sounds: tape_rip_smooch_ding

### Glaze Drip (B5, `glaze`)

Menu description: TNB pours a bucket of thick celadon and cobalt ceramic glaze across an enemy row, Gluing them in place for 2 turns and lowering their COOL.
Spoken line: "Ooh, look at that glaze crawl. Don't stick to the kiln shelf!"
Battle message: "TNB pours a glossy wave of studio glaze across the row!"
Why it is them: Every potter knows the danger of runny glaze fusing a pot permanently to the kiln shelf.
The joke: The monsters are coated in a gorgeous, glossy museum-quality ceramic finish that hardens around their ankles (`Glued`).
Animation beats:

1. TNB hoists a five-gallon studio bucket of shimmering turquoise-and-cobalt glaze (0.4s).

2. He sloshes a thick, glossy ribbon of liquid glaze across the entire enemy row (0.5s).

3. IMPACT: A quick flash of kiln heat vitrifies the glaze into shiny glass puddles around the enemies' feet (`Glued` + `COOL Down`) (0.4s).
   New assets: poses: bucket_pour / props: glaze_bucket / scene effects: glossy_turquoise_wave / sounds: thick_pour_glass_clink

### Baxter Street Bomb (B6 Ultimate, `hillbomb_ult`)

Menu description: Ultimate. TNB drops in from the top of LA's steepest street on his longboard while throwing pots mid-hill, hitting all enemies, Staggering them, making himself Evasive for 3 turns, and pulling Tom's turn up 50%.
Spoken line: "Steepest street in Echo Park! Hang on to your mugs, Tom!"
Battle message: "32% Grade! TNB bombs straight down Baxter Street on his longboard!"
Why it is them: Combines TNB's fearless LA hill-bombing on his longboard with his pottery craft and his devotion to Tom.
The joke: Baxter Street in LA is a real 32%-grade cliff; TNB casually shapes a vase on a portable wheel *while* doing 45 mph downhill through the enemy team.
Animation beats:

1. Letterbox bars slide in; the entire stage tilts into a terrifying vertical LA street cliff with palm trees, Hollywood hills in the background, and a street sign reading `BAXTER ST - 32% GRADE` (1.2s).

2. TNB clicks his longboard tail at the very top of the screen, tucks into a downhill speed-stance, and rockets straight down the asphalt in a trail of wind-shear sparks (1.3s).

3. Halfway down at 50 mph, he casually tosses three spinning stoneware vases off the board that detonate like grenades across the enemy formation (1.2s).

4. IMPACT: TNB hits a massive Bert-slide powerslide straight through all enemies (`3.9x DAMAGE ALL + STAGGER!`), kicking up a rainbow sunset dust cloud that leaves him `Evasive` for 3 turns and pulls Tom forward on the ribbon with a wink (1.5s).
   New assets: poses: downhill_speed_tuck, bert_slide / props: baxter_st_sign, flying_vases / scene effects: la_sunset_cliff_backdrop, speed_sparks / sounds: skate_roar_pottery_shatter_slide

## 8. Nara

**Design Thesis:** Joyful, fast, 40-pound black Labradoodle who never speaks human words (barks only, translated by narrator boxes!), lives for tennis balls and chicken jerky, goes berserk if anyone hurts Tom, and leaves a tiny happy puddle when she gets excited.

* **Path A:** **Goodest Girl** (High-velocity tennis ball fetch, 4-hit living-room zoomies, tug-of-war buff theft, and the Great Squirrel Stampede)

* **Path B:** **Pack Heart** (Excited porch puddles, wet-dog spin shakes, picky chicken-jerky snacks, and scent-tracking Tom across dimensions)

* **Recommended Auto-Stamp Order:** A1 -> B1 -> A2 -> B2 -> A3 -> B3 -> A4 -> A5 -> A6 (Ultimate 1 at Lvl 26) -> B4 -> B5 -> B6.

### Nara's Kit Table

| Slot | Name | Key | Status | Lvl | SP | VP | Element | Stat | Mult | Hits | Target | Weight | Effects | kindFoe | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| Basic | Jump Up | `jumpup` | KEEP | 1 | 0 | 0 | Kinetic | POW | 1.0 | 1 | `enemy` | 0.7 | `coins`, `+1 VP`, `+5% HEART` | yes | 
| Signature | PUPPY EYES | `puppyeyes` | KEEP | 1 | 0 | 2 | Sparkle | WARMTH | 0.0 | 1 | `enemy` | 0.7 | `smit 1 t` | yes | 
| A1 | Tennis Ball Fetch | `fetch` | KEEP | 2 | 1 | 2 | Kinetic | POW | 1.4 | 1 | `enemy` | 0.7 | `critAfterTom`, `ct +0.25 self` | no | 
| A2 | Living-Room Zoomies | `zoomies` | KEEP | 6 | 2 | 3 | Kinetic | PEP | 0.45 | 4 | `multi` | 0.7 | `st pep_up 2 self`, `st dizzy 1 t` | no | 
| A3 | Tug of War | `tug` | KEEP | 11 | 2 | 3 | Kinetic | POW | 1.55 | 1 | `enemy` | 1.0 | `steal`, `st pow_down 2 t`, `row front t` | no | 
| A4 | Drop It! (No Take!) | `notake` | NEW | 16 | 3 | 4 | Chatter | POW | 1.75 | 1 | `enemy` | 0.7 | `interrupt`, `take`, `st guard 2 self` | no | 
| A5 | Belly Rub Roll | `bellyrub` | NEW | 21 | 3 | 3 | Cozy | WARMTH | 0.0 | 1 | `party` | 0.7 | `heal .30 party`, `st warmth_up 2 party`, `cure 1 party` | yes | 
| A6 (Ult) | CHAIRMAN CHEEKS! | `squirrel_ult` | REWORKED | 26 | 4 | 7 | Kinetic | POW | 3.7 | 1 | `all` | 1.3 | `shieldBreak`, `st staggered 1 all`, `st pep_up 3 party` | no | 
| B1 | Happy Puddle | `puddle` | KEEP | 3 | 1 | 2 | Splash | WARMTH | 1.25 | 1 | `front` | 1.0 | `st drowsy 2 t`, `st slowed 2 t` | no | 
| B2 | Wet Dog Shake | `wetshake` | KEEP | 7 | 2 | 3 | Splash | POW | 1.35 | 1 | `all` | 1.0 | `cure all self`, `st cool_down 2 all` | no | 
| B3 | Chicken Jerky Snob | `jerky` | NEW | 12 | 2 | 3 | Cozy | WARMTH | 0.0 | 1 | `self` | 0.7 | `heal .50 self`, `st pow_up 3 self`, `heal .35 tom` | yes | 
| B4 | Nose Boop Patrol | `scent_track` | NEW | 17 | 3 | 4 | Chatter | PEP | 1.6 | 1 | `enemy` | 0.7 | `reveal`, `scent 3 t`, `row front t` | no | 
| B5 | Lonely Howl | `howl` | REWORKED | 22 | 3 | 5 | Chatter | WARMTH | 1.65 | 1 | `all` | 1.0 | `st cool_down 2 all`, `ct +1.0 tom`, `mile +1 tom` | no | 
| B6 (Ult) | The Unsent Scent | `pack_ult` | NEW | 28 | 4 | 8 | Cozy | hybrid | 3.8 | 1 | `all` | 1.3 | `revive .60 tom`, `heal .45 party`, `scent 3 all` | yes | 

### Nara's Ability Cards

### Jump Up (Basic, `jumpup`)

Menu description: Nara bounds across the stage and plants both fluffy front paws on the enemy's chest, shaking loose some coins. Costs 0 VP and counts as a friendly greeting (`kindFoe`)!
Spoken line: "ARF! WOOF!"
Battle message: "Nara jumps up to say hello! (She means: 'Hi! Empty your pockets!')"
Why it is them: Nara is a 40-lb black Labradoodle who jumps up on everyone she loves the second they walk through the door.
The joke: Her enthusiastic paw-hug accidentally knocks loose change right out of the monster's pockets.
Animation beats:

1. Nara wags her whole back half and bounds across the screen in two bouncy leaps (0.3s).

2. IMPACT: She pops up on her hind legs and plants both fluffy black paws on the enemy's chest (`BOOF!`) (0.3s).

3. Gold coins pop out in an arc as Nara trots back wagging her tail (0.3s).
   New assets: poses: hind_leg_paws_up / props: none / scene effects: coin_pop_hearts / sounds: happy_double_bark

### PUPPY EYES (Signature, `puppyeyes` - Enhanced Animation Proposal)

Menu description: Nara rests her chin on her paws and looks up with giant, soulful Labradoodle eyes, leaving the enemy Smitten so it skips its next turn.
Spoken line: "...whine... boof."
Battle message: "Nara deploys maximum Puppy Eyes! (She means: 'You wouldn't hit a good girl, right?')"
Why it is them: Nobody on Earth can resist a curly black Labradoodle staring up from under her eyebrows.
The joke: Her eyes grow to 300% anime size with trembling starlight reflections until the monster melts into a puddle of guilt.
Animation beats:

1. Nara drops flat onto her belly with her curly chin resting between her front paws (0.3s).

2. The camera zooms in as two huge, shimmering liquid-gold puppy eyes blink twice (`BLINK-BLINK`) with tiny violins playing (0.5s).

3. IMPACT: A giant pink heart explodes over the enemy's head (`SMITTEN!`), making it drop its guard and coo at her (0.3s).
   New assets: poses: chin_on_paws_eyes / props: giant_sparkle_eyes_overlay / scene effects: pink_heart_melt / sounds: tiny_whine_harp

### Tennis Ball Fetch (A1, `fetch`)

Menu description: Nara rockets after a bouncing neon-green tennis ball right through the enemy, pulling her next turn up 25% and guaranteeing a critical hit if Tom acted right before her!
Spoken line: "BARK! BARK! BARK!"
Battle message: "BALL?! Nara launches at Mach 2 to fetch the tennis ball!"
Why it is them: Nara is completely, single-mindedly obsessed with fetch and tennis balls.
The joke: The enemy just happens to be standing in the flight path between Nara and a neon-green Wilson ball.
Animation beats:

1. A bright neon-green tennis ball bounces off the enemy's forehead (`BOING!`) (0.3s).

2. Nara's ears perk straight up (`!`) and she launches forward like a furry black missile (0.3s).

3. IMPACT: Nara jaws-snaps the ball mid-air right through the enemy (`CRIT!` if after Tom) and trots back proudly with the ball in her mouth (0.4s).
   New assets: poses: missile_leap_catch / props: neon_tennis_ball / scene effects: mach_cone_fur / sounds: ball_boing_bark_chomp

### Living-Room Zoomies (A2, `zoomies`)

Menu description: Nara tucks her butt and Ricochet-sprints off the walls 4 times across random enemies, boosting her own PEP for 2 turns and Dizzying foes.
Spoken line: "RUFF! AROOO-RUFF!"
Battle message: "Nara tucks her tail and gets the 8:00 PM Living-Room Zoomies!"
Why it is them: Every dog owner knows the sudden, inexplicable burst of 40-mph hallway zoomies when a dog tucks its hindquarters and goes supersonic.
The joke: She banks off the left and right edges of the phone screen like a pinball while rugs and throw pillows fly into the air.
Animation beats:

1. Nara drops into a play-bow, tucks her bum low, and spins her paws like Scooby-Doo for a split second (0.3s).

2. IMPACT: She blurs across the screen four times (`ZIP! BANK! BOING! ZOOM!`), bouncing off the screen borders and bowling through random enemies (0.6s).

3. She skids to a halt panting happily with a massive `PEP UP` aura (0.3s).
   New assets: poses: play_bow_tuck, zoom_blur / props: flying_throw_pillow / scene effects: pinball_wall_bounces / sounds: cartoon_skid_quad_zip

### Tug of War (A3, `tug`)

Menu description: Nara latches onto an enemy with her braided rope toy and yanks with all 40 pounds of Labradoodle muscle, pulling it to the front row, lowering its POW, and stealing a buff.
Spoken line: "GRRRRR-WOOF!"
Battle message: "Nara locks her jaws for Tug of War! (She means: 'Mine now!')"
Why it is them: Nara loves tug-of-war and will happily drag a grown adult across the hardwood floor.
The joke: She shakes her head left-right-left so violently that the monster's buff icon flies right off and lands on Nara.
Animation beats:

1. Nara tosses one end of a colorful knotted cotton rope toy at the enemy (0.3s).

2. She clamps onto her end, plants all four paws, and shakes her head ferociously (`GRRRR-SHAKE-SHAKE!`) (0.4s).

3. IMPACT: With one huge backward yank, she drags the enemy into the front row and rips one of its buffs away (0.4s).
   New assets: poses: tug_plant_shake / props: knotted_rope_toy / scene effects: tug_strain_sparks / sounds: play_growl_yank

### Drop It! (No Take!) (A4, `notake`)

Menu description: Nara clamps her jaws around what the enemy is holding and refuses to let go ("No take! Only throw!"), interrupting a boss wind-up, stealing their item/coins, and Guarding herself for 2 turns.
Spoken line: "Hmph! ...Mmph-woof!"
Battle message: "Nara refuses to Drop It! No take, only throw!"
Why it is them: The universal dog paradox: she wants you to throw the toy, but she will never, ever let you take it out of her mouth.
The joke: Even when a boss tries to wind up a super-attack, Nara clamping onto its sleeve brings the whole animation to a dead halt while she turns her head away stubbornly.
Animation beats:

1. Nara lunges in and chomps onto the enemy's weapon/item right as it winds up (`CHOMP!`) (0.3s).

2. IMPACT: A giant red `NO TAKE! ONLY THROW!` stamp shatters the boss wind-up icon and snags their held item/coins (0.4s).

3. Nara trots back, sits with her back turned stubbornly, and clamps her jaws tight (`Guard` for 2 turns) (0.4s).
   New assets: poses: stubborn_sit_chomp / props: none / scene effects: no_take_stamp / sounds: clamp_hmph_bark

### Belly Rub Roll (A5, `bellyrub`)

Menu description: Nara flops onto her back with all four paws wiggling in the air for belly rubs, healing the party 30% HP, curing 1 debuff, and boosting WARMTH. Monsters can't resist rubbing the belly either (`kindFoe`)!
Spoken line: "Arf! ...thump-thump-thump!"
Battle message: "Nara rolls over for emergency Belly Rubs! (Back leg thumping at maximum speed!)"
Why it is them: Flopping upside-down with a crooked grin and a thumping back leg is peak Labradoodle therapy.
The joke: Petting a good dog lowers blood pressure so fast that it heals the whole family 30% HP on the spot.
Animation beats:

1. Nara walks to the center of the stage and dramatically flops upside-down onto her back (`FLOP!`) with all four curly paws in the air (0.4s).

2. Pixel hands reach in to scratch her belly while her back leg thumps the floor rapidly (`THUMP-THUMP-THUMP!`) (0.5s).

3. IMPACT: A wave of pure `COZY` serotonin hearts washes over the party (or target monster), healing 30% HP and boosting `WARMTH` (0.4s).
   New assets: poses: upside_down_belly_wiggle / props: petting_hands / scene effects: serotonin_heart_wave / sounds: tail_thump_happy_sigh

### CHAIRMAN CHEEKS! (A6 Ultimate, `squirrel_ult`)

Menu description: Ultimate. Nara spots her arch-nemesis Chairman Cheeks the Squirrel hiding behind the enemies and leads a full Old Oak Park stampede, shattering shields, Staggering all foes, and granting the party `PEP Up` for 3 turns.
Spoken line: "BARK! BARK! AROOOOO-BARK!"
Battle message: "SQUIRREL!! Nara spots Chairman Cheeks behind the enemy line!"
Why it is them: Chapter 6 is literally "The Great Squirrel Conspiracy" against Chairman Cheeks in Old Oak Park!
The joke: A tiny smug pixel squirrel wearing a monocle pops out behind the enemies, and Nara loses her mind so completely that she drags a tornado of park leaves, acorns, and picnic tables through the entire enemy team.
Animation beats:

1. Letterbox bars slide in; a tiny chittering squirrel wearing a tiny top hat (Chairman Cheeks!) peeks out from behind the center enemy and waggles its bushy tail (1.1s).

2. Nara's eyes lock on with a telescopic red radar crosshair (`TARGET: SQUIRREL!!`) as giant shaking text `BARK! BARK! BARK!` fills the top of the screen (1.1s).

3. Nara takes off at supersonic speed, kicking up a massive cyclone of oak leaves, acorns, park benches, and tennis balls that zigzags across the entire enemy formation five times (1.5s).

4. IMPACT: Chairman Cheeks zips up an invisible tree just as Nara detonates through all enemies (`3.7x DAMAGE ALL + SHIELD BREAK + STAGGER!`), leaving the whole party energized (`PEP Up 3t`) while Nara barks up at the top of the screen (1.3s).
   New assets: poses: radar_point_bark / props: chairman_cheeks_squirrel, acorn_barrage / scene effects: oak_leaf_cyclone / sounds: squirrel_chitter_frantic_bark_roar

### Happy Puddle (B1, `puddle`)

Menu description: Nara gets so excited to see everyone that she leaves a tiny happy puddle in front of the enemy front row, making them slip into Drowsy and Slowed.
Spoken line: "Yip! Yip! ...oops."
Battle message: "Nara gets way too excited! Tiny happy puddle on the floor!"
Why it is them: Canon fact (and Chapter 2 intro beat): Nara pees a tiny puddle whenever she gets overly excited greeting Tom on the porch.
The joke: She wags her whole body so hard a tiny yellow sparkle puddle appears, and she looks embarrassed for half a second while the front-row enemies slip in it.
Animation beats:

1. Nara does a full-body helicopter tail wag of pure excitement (`YIP-YIP!`) (0.4s).

2. A tiny, discrete yellow puddle pops onto the floor in front of the enemy row as Nara puts her ears back sheepishly (`"oops"`) (0.4s).

3. IMPACT: The front-row enemies step forward, slip on the puddle (`WHOA-SPLAT!`), and land `Slowed` and `Drowsy` (0.4s).
   New assets: poses: helicopter_wag, sheepish_ears / props: tiny_puddle / scene effects: slip_stars / sounds: excited_yip_slide_splat

### Wet Dog Shake (B2, `wetshake`)

Menu description: Nara shakes off a bath from nose to tail, curing all debuffs on herself and spraying a high-velocity mist across all enemies that lowers their COOL.
Spoken line: "Brrrr-ruff!"
Battle message: "Nara unleashes a 360-degree Wet Dog Shake! Take cover!"
Why it is them: A 40-pound curly Labradoodle holds approximately three gallons of water in her coat and waits until she is indoors to shake it all out.
The joke: Her head spins one way while her body spins the other like a washing machine on spin cycle, soaking the entire enemy side.
Animation beats:

1. Nara steps forward dripping with bath bubbles and status debuff icons (0.3s).

2. She goes into a high-speed corkscrew `FLUBBA-FLUBBA-FLUBBA` shake from nose to tail, flinging her own debuffs clean off the screen (0.5s).

3. IMPACT: A 360-degree ring of `SPLASH` droplets blasts every enemy on the stage, dropping their `COOL` as they wipe their faces (0.4s).
   New assets: poses: corkscrew_shake_blur / props: bath_bubbles / scene effects: radial_water_spray / sounds: wet_fur_flubba_splash

### Chicken Jerky Snob (B3, `jerky`)

Menu description: Nara turns her nose up at store-bought kibble and devours a strip of premium chicken jerky, healing herself 50% HP, boosting her POW for 3 turns, and sharing a homemade snack with Tom (+35% HP to Tom). Can be shared with a monster (`kindFoe`)!
Spoken line: "Hmph. ...CHOMP-WOOF!"
Battle message: "Nara rejects cheap kibble and demands artisanal Chicken Jerky!"
Why it is them: Canon fact: Nara is a very picky eater who refuses regular dog treats and only eats chicken jerky and homemade family food.
The joke: A dry bone biscuit bounces off her nose while she holds her snout in the air like a Michelin food critic until real chicken jerky appears.
Animation beats:

1. A generic beige dog biscuit arcs toward Nara; she turns her snout up at a 45-degree angle (`HMPH!`) and lets it bounce off the floor (0.4s).

2. A golden strip of real `ARTISANAL CHICKEN JERKY` and a piece of Tom's homemade roast appear; Nara's tail goes into overdrive (`CHOMP!`) (0.4s).

3. IMPACT: Nara heals 50% HP with `POW Up` for 3 turns while tossing the extra homemade bite to Tom (or target monster if `kindFoe`) for a 35% heal (0.4s).
   New assets: poses: snout_up_snob, happy_chomp / props: beige_biscuit, chicken_jerky_strip / scene effects: gourmet_sparkles / sounds: snooty_sniff_crunch_ding

### Nose Boop Patrol (B4, `scent_track`)

Menu description: Nara sniffs out a hiding foe, yanks it to the front row, reveals its weaknesses, and marks it with her nose (`Tracked Scent`: cannot hide or evade, takes +30% kinetic/combo damage for 3 turns).
Spoken line: "SNIFF-SNIFF-SNIFF... BOOF!"
Battle message: "Nara locks onto the enemy's scent! Nowhere to hide!"
Why it is them: Sets up Nara's legendary nose (which tracks Tom across the Unsent Dead-Letter Office in Chapter 19 when the whole world forgets him).
The joke: A visible dotted pink scent trail leads right to the monster's back pocket, and she boops it with a wet dog nose.
Animation beats:

1. Nara lowers her nose to the floor (`SNIFF-SNIFF-SNIFF!`) as a glowing pink scent ribbon snakes across the stage to the target (0.4s).

2. She bounds straight down the scent line and presses her wet black nose against the enemy (`BOOF!`) (0.4s).

3. IMPACT: The enemy is flushed into the front row with its weaknesses exposed and a glowing paw-print `TRACKED SCENT` mark locked onto it (0.4s).
   New assets: poses: nose_to_ground_sniff / props: none / scene effects: pink_scent_ribbon, paw_target_mark / sounds: rapid_sniff_boof_lock

### Lonely Howl (B5, `howl`)

Menu description: Nara tilts her head back and lets out an aching pack howl that lowers all enemies' COOL, pulls Tom's turn straight to the front of the ribbon (`ct +1.0`), and gives Tom +1 Upgrade Mile.
Spoken line: "Aroooooooo... woof!"
Battle message: "Nara howls for her pack! Tom rushes straight to the front!"
Why it is them: Canon fact: Nara has separation anxiety and a deep bond with Tom; when she calls for him, Tom drops everything and shows up immediately.
The joke: Even if Tom was at the very back of the CTB turn ribbon, hearing Nara whine makes him sprint past everyone else's turn icon to comfort her.
Animation beats:

1. Nara sits, tilts her curly head toward the ceiling, and lets out a long, echoing `AROOOOOOO!` (0.5s).

2. Blue `CHATTER` soundwave rings ripple across all enemies, dropping their `COOL` as they cover their ears (0.4s).

3. IMPACT: Tom's icon on the CTB turn ribbon catches fire and rockets straight to the #1 slot (`CT +100% + 1 MILE`) while Tom steps over to pat Nara's head (0.4s).
   New assets: poses: head_back_howl / props: none / scene effects: pack_howl_moon_rings / sounds: soulful_doodle_howl

### The Unsent Scent (B6 Ultimate, `pack_ult`)

Menu description: Ultimate. Nara follows the golden scent of sourdough and home across the void to reunite her pack, hitting all foes for massive damage, reviving/healing Tom 60% HP, healing the party 45% HP, and marking all enemies with `Tracked Scent`.
Spoken line: "AROOOOO! BARK! BARK!"
Battle message: "Nara never forgets her pack! She tracks the scent of home through anything!"
Why it is them: Directly honors Chapter 19's emotional climax where Tom is erased from history and Nara is the one who tracks his scent through the Unsent Dead-Letter Office to bring him home.
The joke: While cosmic time-barriers try to block her, Nara just smells sourdough toast in Tom's pocket and crashes straight through reality to lick his face.
Animation beats:

1. Letterbox bars slide in; the screen fades into greyscale static as Nara stands alone, ears drooping, before her nose twitches at a single golden crumb floating in the air (1.2s).

2. Nara barks twice (`BARK! BARK!`); a blazing golden scent-trail of sourdough, ceramic clay, and family warmth erupts across the stage, shattering the greyscale into full vibrant color (1.3s).

3. Nara bounds along the golden trail at blinding speed, crashing through every enemy on the screen (`3.8x DAMAGE ALL + TRACKED SCENT ALL!`) in an explosion of golden paw prints (1.3s).

4. IMPACT: Nara leaps straight into Tom's arms (reviving him at 60% HP if downed!) and licks his cheek while a burst of `COZY` pack love heals the entire party 45% HP (1.4s).
   New assets: poses: ears_droop_sniff, leap_lick_tom / props: golden_crumb / scene effects: golden_scent_highway, paw_print_explosion / sounds: quiet_whine_to_triumphant_bark_swell

---

## I3. Tombos (21) and Family Finishes (4)

Every Tombo costs 0 VP, spends HEART (25% / 50% / 75%), grants Tom +1 Upgrade Mile, and is staged as a brand-new shared activity with its own mechanical niche.

### 1. Grace + Tom Tombos (Role: Crit-Reflect Buffing, Acro-Spotter Shield Breaking, and Viral Revival)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Unboxing Collab Live | `tb_grace_1` | Ch 1: Grace shows Tom her gold dumpling squishy | 25% | Sparkle | 2.1 | `row` | `st glitter_nails 3 party`, `reveal`, `trend +1`, `kindFoe` | Party-wide Crit/Reflect enabler + row reveal |
| 2 | Uncle Spotter Toss | `tb_grace_2` | Ch 5: Clearing the school before the Science & Dance Fair | 50% | Kinetic | 2.9 | `splash` | `shieldBreak`, `crit 1`, `choreo 2 tom` | Guaranteed-crit boss shield breaker + linked follow-ups |
| 3 | The Golden Dumpling Wish | `tb_grace_3` | Ch 19: Grace gives up her squishy to bring Tom back | 75% | Sparkle | 3.8 | `all` | `revive .75 party`, `heal .75 party`, `trend lock 3`, `cure all party`, `kindFoe` | Full-party mass resurrection + locked `x1.5` Trending |

#### Unboxing Collab Live (Grace Tier 1, `tb_grace_1`)
* **The shared activity:** Tom acts as Grace's boom-mic operator and lighting assistant while they co-host an ASMR unboxing of her diamond-gold soup dumpling squishy.
* **What Tom does:** Holds a tiny ring-light tripod and a fluffy boom microphone over the box while whispering review scores.
* **What Grace does:** Taps her glittery fingernails on the box lid for the camera, reveals the golden dumpling, and flashes its sparkle across the enemy row.
* **Spoken lines:**
  * Grace: "Welcome back to the channel! Ta-Ta, hold the mic closer!"
  * Tom: "Ten out of ten foam density. Like and subscribe."
* **Animation beats:**
  1. A pastel YouTube viewfinder frame drops over the stage; Tom kneels on one knee holding a boom mic and ring light aimed at a velvet pedestal between them (0.8s).
  2. Grace taps her holo-glitter nails on the box (`TAP-TAP-TAP`) and lifts the lid in slow motion (0.9s).
  3. IMPACT: The diamond-gold soup dumpling squishy levitates and fires a dazzling prism flash across the enemy row (`2.1x SPARKLE + REVEAL`), showering the party in `Glitter Nails` and advancing Grace's `Trending` meter (0.8s).
* **New assets:** poses: tom_boom_mic, grace_asmr_tap / props: boom_mic_pole, velvet_pedestal / scene effects: livestream_hearts_border / sounds: asmr_nail_tap_prism
* **Not a mashup because:** Neither character uses their solo unboxing or heal animation; it is staged as a two-person video shoot with Tom working as crew.

#### Uncle Spotter Toss (Grace Tier 2, `tb_grace_2`)
* **The shared activity:** Tom acts as Grace's gymnastics coach and spotter, basket-tossing her twenty feet into the air for a championship floor pass.
* **What Tom does:** Chalks his hands, locks his fingers into a coach's stirrup step, and launches Grace skyward before saluting the landing.
* **What Grace does:** Steps into Tom's hands, rockets into a triple-twisting aerial layout, and drives her heels straight through the boss's shield.
* **Spoken lines:**
  * Grace: "Spot me on the triple, Ta-Ta! One, two, UP!"
  * Tom: "Got your back. Stick the dismount!"
* **Animation beats:**
  1. Gym mats unroll; Tom claps chalk dust and kneels with cupped hands while Grace takes a two-step run-up (1.0s).
  2. Grace steps into Tom's hands; Tom heave-launches her straight out of the top of the frame (`WHOOOOSH!`) (1.2s).
  3. IMPACT: Grace plummets like a shooting star onto the target (`2.9x KINETIC SPLASH + GUARANTEED CRIT + SHIELD BREAK!`), bounces back to Tom for a synchronized high-five, and links Tom with `Choreographed` for 2 turns (1.3s).
* **New assets:** poses: tom_stirrup_launch, grace_meteor_drop / props: blue_spotter_mat / scene effects: chalk_burst_star_trail / sounds: spring_heave_shatter_highfive
* **Not a mashup because:** It is a true physical partner stunt where Tom's sprite directly propels Grace's sprite into orbit.

#### The Golden Dumpling Wish (Grace Tier 3, `tb_grace_3`)
* **The shared activity:** Grace places her most prized possession into Tom's hands just like she did at the altar in Chapter 19, and the glowing golden dumpling expands into aprotective dome over the whole family.
* **What Tom does:** Catches the glowing squishy as he materializes from golden light, hugs Grace with one arm, and amplifies the wish across the stage.
* **What Grace does:** Holds her diamond-gold dumpling with both hands, makes a wish with her eyes shut, and passes it to Tom.
* **Spoken lines:**
  * Grace: "I don't need the squishy if I get you back, Ta-Ta!"
  * Tom: "You kept it safe for me, kiddo. Let's shine!"
* **Animation beats:**
  1. Letterbox bars slide in; the screen dims to twilight as Grace holds her glowing gold soup dumpling squishy against her heart (1.2s).
  2. She holds it out to Tom; as Tom's hands close around hers, a pillar of warm golden memory light erupts into the sky (1.3s).
  3. A colossal, radiant holographic gold soup dumpling descends over the battlefield, bouncing happily across every enemy (`3.8x SPARKLE ALL!`) (1.3s).
  4. IMPACT: The golden dome bursts into millions of warm diamond sparkles that revive any fallen allies at 75% HP, heal the living party 75%, cure all debuffs, and lock Grace's Trending Meter at `x1.5` for 3 turns (1.2s).
* **New assets:** poses: shared_treasure_hold, uncle_niece_side_hug / props: colossal_holo_dumpling / scene effects: golden_memory_pillar / sounds: music_box_to_orchestral_chime
* **Not a mashup because:** It dramatizes Chapter 19's sacrifice beat with a bespoke two-character embrace and colossal holographic prop.

---

### 2. Rose + Tom Tombos (Role: Turn-Order Hijacking, Stealth Ambush, and AoE Sleep/Goof Control)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Double-Decker Airplane | `tb_rose_1` | Ch 1: Rose demands her first shoulder ride | 25% | Kinetic | 2.2 | `splash` | `mount`, `row back t`, `st dizzy 2 t`, `kindFoe` | Instant Shoulder Ride mount + formation knockback |
| 2 | First-Class Stowaway | `tb_rose_2` | Ch 10: Rose stows away under Tom's business-class blanket | 50% | Cozy | 2.8 | `all` | `goof all`, `steal all`, `st evasive 2 both`, `kindFoe` | Unblockable party-wide Goof + mass buff theft |
| 3 | Headphones in the Dark | `tb_rose_3` | Ch 19: Rose listens to Tom's headphones in the dark to guide him home | 75% | Chatter | 4.0 | `all` | `pause 1 all`, `mount`, `heal .50 party`, `mile +3 tom`, `kindFoe` | Freezes ALL enemy CTB icons for 1 full turn + maxes Tom's Miles |

#### Double-Decker Airplane (Rose Tier 1, `tb_rose_1`)
* **The shared activity:** Tom hoists Rose onto his shoulders and sprints in a circle making airplane noises while Rose spreads her arms like wings and banks through the enemies.
* **What Tom does:** Holds Rose's ankles securely, tilts left and right like a banking 747, and makes jet-engine whoosh sounds.
* **What Rose does:** Wears plastic aviator goggles on Tom's shoulders, spreads her arms wide with Lamby as co-pilot, and bonks the enemies on the fly-by.
* **Spoken lines:**
  * Rose: "Ta-Ta, up! Put your wings out, we're flying!"
  * Tom: "Tower, we are cleared for takeoff. Hold on tight!"
* **Animation beats:**
  1. Rose vaults onto Tom's shoulders (`mount`) and snaps on oversized toy aviator goggles (0.7s).
  2. Both of them spread their arms out like biplane wings as paper-airplane contrails stream from Rose's fingertips (0.9s).
  3. IMPACT: Tom sprints a looping figure-eight right through the target and its neighbors (`2.2x KINETIC SPLASH`), knocking them into the back row (`Dizzy`) and ending with Rose still mounted on Tom's shoulders (0.9s).
* **New assets:** poses: biplane_shoulder_run / props: toy_aviator_goggles / scene effects: paper_plane_contrails / sounds: mouth_airplane_whoosh_giggle
* **Not a mashup because:** Replaces the old glued-together "hoist + pounce" with a continuous biplane flying game that leaves Rose mounted.

#### First-Class Stowaway (Rose Tier 2, `tb_rose_2`)
* **The shared activity:** Tom wheels his business-class carry-on and drapes his Delta One duvet over a "suspicious lump" that suddenly pops out as Rose and Lamby to ambush the whole enemy team.
* **What Tom does:** Casual-walks up to the enemy line sipping coffee and pulling a wheeled carry-on draped in a quilted blue airline blanket, acting like nothing is under it.
* **What Rose does:** Bursts out from under the blanket wearing three stolen hats, blows a massive raspberry, and snatches every enemy's buff on the way back.
* **Spoken lines:**
  * Tom: "Nothing to see here. Just my carry-on luggage."
  * Rose: "SURPRISE! I was under the blanket the whole time!"
* **Animation beats:**
  1. Tom strolls right into the middle of the enemy formation pulling a rolling suitcase covered by a plush blue airline duvet with two tiny sneakers sticking out the bottom (1.1s).
  2. The enemies lean in curiously (`?`); Tom taps his watch and pulls the blanket cord (1.1s).
  3. IMPACT: Rose and Lamby jack-in-the-box explode out of the blanket in a hurricane of feathers, toy confetti, and raspberries (`2.8x COZY ALL + GOOF ALL!`), swiping one buff from every enemy and retreating under the blanket (`Evasive`) (1.3s).
* **New assets:** poses: tom_casual_suitcase, rose_blanket_jackinbox / props: duvet_lump_suitcase / scene effects: feather_confetti_pop / sounds: zipper_pop_raspberry_horn
* **Not a mashup because:** Directly recreates Chapter 10's stowaway story beat as a Trojan-horse comedy routine.

#### Headphones in the Dark (Rose Tier 3, `tb_rose_3`)
* **The shared activity:** Rose wears Tom's oversized noise-canceling headphones in the dark, follows the 16-bit JRPG battle theme playing inside them, and takes Tom's hand to freeze the entire enemy team in time.
* **What Tom does:** Reaches out from a beam of console light, drops the bass on his battle track, and lifts Rose onto his shoulders with 3 instant Upgrade Miles.
* **What Rose does:** Wears Tom's giant silver headphones over her ears, hums the melody in the dark, and points the glowing ribbon chord across all foes.
* **Spoken lines:**
  * Rose: "I heard your video game song in the dark, Ta-Ta!"
  * Tom: "Best co-op partner in the world. Let's finish the level."
* **Animation beats:**
  1. Letterbox bars slide in; the stage goes pitch dark except for little Rose standing in the center wearing Tom's oversized silver headphones, which glow with pink and blue musical notes (1.3s).
  2. A warm golden 16-bit soundwave ribbon stretches across the dark; Tom steps out of the light, kneels to hug Rose, and hoists her onto his shoulders (`mount`) (1.3s).
  3. Together they press `PLAY` on the headphone earcup; a massive stereo wave of golden chiptune music and pink ribbons sweeps the entire screen (1.2s).
  4. IMPACT: The chiptune wave hits all enemies for `4.0x CHATTER` damage and locks EVERY enemy's CTB icon in place (`pause 1 all!`), while healing the party 50% HP and filling Tom to `3/3 Upgrade Miles` (1.2s).
* **New assets:** poses: rose_big_headphones, tom_kneel_embrace / props: glowing_anc_headphones / scene effects: dark_stage_chiptune_wave / sounds: muffled_16bit_theme_to_full_orchestra
* **Not a mashup because:** Built entirely around Chapter 19's emotional headphone-guiding scene and uniquely freezes all enemy turns at once.

---

### 3. Amy + Tom Tombos (Role: Multi-Hit Vulnerability Grading, Wing-Walk Wind Control, and Skyscraper Boss Execution)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Red-Pen Study Blitz | `tb_amy_1` | Ch 5: Tom helps Amy defend her classroom | 25% | Chatter | 2.3 | `enemy` | `grade 3 t`, `st see_me 2 t`, `reveal`, `vp +3 both` | Ultimate single-target damage amplifier (`See Me` + `Grade` + VP battery) |
| 2 | Turbulence on the Wing | `tb_amy_2` | Ch 10: Tom and Amy fight on the wing of the hijacked plane | 50% | Kinetic | 2.9 | `all` | `row back all`, `ct -0.5 all`, `st pep_up 3 party` | Full-screen wind knockback + huge CTB turn swing |
| 3 | Sixty-Story Sibling Pace | `tb_amy_3` | Ch 17: Scaling the 60-story Glass Tower side by side | 75% | Kinetic | 0.75 (x6) | `enemy` | `shieldBreak`, `crit 1`, `st personal_best 3 party` | 6-hit guaranteed-crit single-target boss delete button |

#### Red-Pen Study Blitz (Amy Tier 1, `tb_amy_1`)
* **The shared activity:** Brother and sister team up at the blackboard like the ultimate over-prepared teacher/product-director duo, drilling an enemy with flashcards while grading every flinch in red ink.
* **What Tom does:** Rapid-fires kanji flashcards that stick to the enemy's weak points like target markers.
* **What Amy does:** Slashes through every card with her red grading pen, stamping the enemy with `See Me` and a failing rubric.
* **Spoken lines:**
  * Amy: "Tom, hold up the cards! Let's test their comprehension!"
  * Tom: "Zero out of ten. Didn't even read the syllabus."
* **Animation beats:**
  1. A rolling chalkboard spins in behind the target; Tom and Amy adjust their glasses in unison (`GLINT!`) (0.7s).
  2. Tom flicks four glowing flashcards that pin the enemy's limbs to the board while Amy sprints in slashing giant red `X` marks across each card (1.0s).
  3. IMPACT: Amy and Tom cross their arms back-to-back as a giant red `SEE ME AFTER CLASS (F)` stamp explodes on the foe (`2.3x CHATTER + SEE ME + GRADE`), restoring +3 VP to both siblings (0.8s).
* **New assets:** poses: sibling_glasses_glint, back_to_back_cross_arms / props: pinned_flashcards / scene effects: double_red_x_slash / sounds: double_glasses_ting_slam
* **Not a mashup because:** Staged as a synchronized sibling classroom drill with a shared back-to-back pose and dual glasses glint.

#### Turbulence on the Wing (Amy Tier 2, `tb_amy_2`)
* **The shared activity:** Recreating their Chapter 10 battle on the wing of the hijacked airliner, Tom braces against the fuselage to hold the safety line while Amy sprints along the aluminum wing into a 200-mph jetstream kick.
* **What Tom does:** Clips a safety harness onto Amy, plants his boots against the jet engine cowling, and slingshots her across the wing.
* **What Amy does:** Sprints along the tilted airplane wing into the gale-force headwind and unleashes a supersonic slipstream blast across all enemies.
* **Spoken lines:**
  * Amy: "Hold the line, Tom! I'm taking the outside lane!"
  * Tom: "Watch the flaps! Three hundred knots of tailwind, GO!"
* **Animation beats:**
  1. An aluminum airliner wing with blinking red navigation lights slices across the stage floor as roaring jet-stream wind lines whip past (1.1s).
  2. Tom anchors a glowing tether cable with both hands and whips Amy forward like a roller-derby jammer (1.1s).
  3. IMPACT: Amy rockets down the wing and kicks a category-5 jet-wash gale across all enemies (`2.9x KINETIC ALL`), blowing every foe to the back row (`-50% CT`) while granting the party `PEP Up` (1.3s).
* **New assets:** poses: tom_cable_anchor, amy_wing_sprint / props: airliner_wing_stage, safety_tether / scene effects: jetstream_gale_lines / sounds: jet_wind_whip_boom
* **Not a mashup because:** Stages Chapter 10's iconic plane-wing setpiece with a roller-derby slingshot mechanic.

#### Sixty-Story Sibling Pace (Amy Tier 3, `tb_amy_3`)
* **The shared activity:** Tom and Amy sprint vertically up the exterior of a 60-story glass skyscraper side-by-side, matching each other stride for stride before diving down together onto the boss.
* **What Tom does:** Matches Amy's marathon cadence floor by floor, smashing through floors 10, 30, and 50 with kinetic strikes.
* **What Amy does:** Calls the pace splits on her stopwatch, smashing floors 20, 40, and 60 before they both drive the pinnacle spire through the target.
* **Spoken lines:**
  * Amy: "Sixty floors, Tom! Don't you dare drop behind my pace!"
  * Tom: "Right on your shoulder, sis! Top floor, NOW!"
* **Animation beats:**
  1. Letterbox bars slide in; the camera tilts 90 degrees as a towering blue-glass skyscraper (`FLOOR 01 -> FLOOR 60`) stretches behind the target enemy (1.2s).
  2. Tom and Amy click their watches in sync and sprint straight up the vertical glass wall side-by-side, trading 5 rapid alternating strikes as floor numbers flash (`10F! 20F! 30F! 40F! 50F!`) (1.5s).
  3. They burst through the clouds at `60F ROOFTOP`, exchange a mid-air sibling fist-bump against the sun, and dive together (1.1s).
  4. IMPACT: Hit 6 drives the enemy straight through the roof (`4.5x TOTAL DAMAGE + GUARANTEED CRIT + SHIELD BREAK!`), granting the entire party `Personal Best` for 3 turns (1.2s).
* **New assets:** poses: vertical_wall_run, midair_fist_bump / props: glass_tower_facade / scene effects: floor_counter_flash, cloud_break_dive / sounds: glass_shatter_ascend_sonic_impact
* **Not a mashup because:** A 6-hit vertical skyscraper ascent directly dramatizing Chapter 17's Glass Tower climb.

---

### 4. Deedee + Tom Tombos (Role: Upgraded Tray/Baking Sustenance, Vault Lantern Amber Purge, and Neighborhood Feast Overheal)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Four-Handed Baker's Dozen | `tb_deedee_1` | Ch 1: Recovering Deedee's stolen pie tin | 25% | Cozy | 2.0 | `all` | `crust +3`, `tray 3`, `heal .35 party`, `kindFoe` | Instant max 3 upgraded Hot Dishes on the tray + AoE Cozy hit |
| 2 | Library Vault Lantern | `tb_deedee_2` | Ch 7: Exploring the vault beneath the library together | 50% | Sparkle | 2.7 | `all` | `cure all party`, `cure amber party`, `st cool_up 3 party`, `st shushed 2 all` | Total party debuff/Amber purge + AoE enemy Silence |
| 3 | Feast on Jefferson Park | `tb_deedee_3` | Ch 19: Thawing Deedee from stone with the Jefferson Park feast | 75% | Cozy | 3.7 | `all` | `heal 1.0 party`, `st tucked_in 3 party`, `crust +3`, `tray 3`, `kindFoe` | 100% full-party HP restore + 3-turn Tucked In + max Hot Dishes |

#### Four-Handed Baker's Dozen (Deedee Tier 1, `tb_deedee_1`)
* **The shared activity:** Mother and son share an apron-string kitchen counter, folding Tom's sourdough starter and Deedee's rhubarb filling into a bubbling double-crust pie inside her recovered pie tin.
* **What Tom does:** Flours the counter, stretches a boule of Bready Mercury sourdough in the air, and crimps the top crust.
* **What Deedee does:** Pours ruby-red stewed rhubarb into her prized aluminum pie tin, pops it in the Dutch oven, and fans the steam across the stage.
* **Spoken lines:**
  * Deedee: "Nobody makes a crust like my registered nut and me!"
  * Tom: "Sourdough lattice top on a rhubarb pie. Patent pending."
* **Animation beats:**
  1. A butcher-block kitchen island rolls in; Tom tosses a spinning disk of sourdough dough up while Deedee catches it inside her shiny Chapter 1 pie tin (0.8s).
  2. Deedee ladles rhubarb in, Tom lattices the top in 3 rapid motions, and they slide it into a glowing cast-iron Dutch oven (0.9s).
  3. IMPACT: The lid pops off in a geyser of cinnamon-sourdough steam that scorches all enemies (`2.0x COZY ALL`), heals the party 35%, and stocks the tray with `3 Upgraded Hot Dishes` (0.8s).
* **New assets:** poses: dough_spin_toss, double_apron_fan / props: butcher_block_island, lattice_pie / scene effects: cinnamon_geyser / sounds: dough_slap_oven_bell_boom
* **Not a mashup because:** Replaces the old sequential Dutch-oven-then-Crisp reuse with a single choreographed kitchen island recipe that immediately upgrades the Crust tray.

#### Library Vault Lantern (Deedee Tier 2, `tb_deedee_2`)
* **The shared activity:** Exploring the dark Hush Library vault together (Chapter 7), Tom deciphers the ancient kanji seals on an archive tome while Deedee polishes the brass library lamp to banish all shadows and silence the room.
* **What Tom does:** Holds up an ancient archive book, translates the glowing script out loud, and snaps the book shut to project a barrier.
* **What Deedee does:** Buffs a tarnished brass library reading lamp with her handkerchief until it blazes like a lighthouse, scrubbing all debuffs and Amber away.
* **Spoken lines:**
  * Tom: "Mom, shine the lamp right here. I can read the seal!"
  * Deedee: "Wait till I buff this brass! Let's get some light in here!"
* **Animation beats:**
  1. Stone library arches frame the stage; Tom opens a dusty floating tome while Deedee vigorously spit-shines a green-shaded brass banker's lamp (1.1s).
  2. The lamp ignites with a blinding golden-white beam that Tom reflects off the open pages of the tome across the party (`CURE ALL + CURE AMBER + COOL UP!`) (1.2s).
  3. IMPACT: Tom slams the heavy tome shut (`THOOM!`) while Deedee gives a nurse "SHHH!" finger, sending a wave of golden library light across all foes (`2.7x SPARKLE ALL + SHUSHED 2T`) (1.2s).
* **New assets:** poses: tom_tome_hold, deedee_lamp_buff / props: green_bankers_lamp, archive_tome / scene effects: lighthouse_prism_sweep / sounds: page_flutter_glass_chime_thoom
* **Not a mashup because:** Built specifically around Chapter 7's mother-son library vault adventure.

#### Feast on Jefferson Park (Deedee Tier 3, `tb_deedee_3`)
* **The shared activity:** Tom and Deedee host a massive block-party potluck under the Jefferson Park string lights (with cameos from Miss Odette's gumbo pot and Dona Carmen's pupusa griddle!) that thaws stone and feeds the whole world.
* **What Tom does:** Strings golden café lights overhead and passes platters of warm sourdough and LA neighborhood dishes down the table.
* **What Deedee does:** Breaks free from grey stone cracks in a burst of warmth, rings the dinner bell, and ladles out a feast that restores 100% HP.
* **Spoken lines:**
  * Tom: "Welcome back, Mom. All of Jefferson Park cooked for you!"
  * Deedee: "Oh, look at this spread! Sit down, everybody, eat while it's hot!"
* **Animation beats:**
  1. Letterbox bars slide in; warm café string lights criss-cross the top of the screen against a twilight LA porch backdrop as Miss Odette and Dona Carmen wave from the wings (1.3s).
  2. Grey stone cracks shatter off Deedee's shoulders as Tom hands her a wooden spoon; together they lift the lid off a giant boiling neighborhood feast cauldron (1.2s).
  3. A tidal wave of `COZY` golden aroma, pupusas, gumbo steam, sourdough loaves, and rhubarb crisp rolls over the entire enemy formation (`3.7x COZY ALL!`) (1.3s).
  4. IMPACT: The aroma wave wraps the party in a warm golden glow that restores **100% HP**, applies `Tucked In` for 3 turns, and fills the tray with `3 Hot Dishes` (1.2s).
* **New assets:** poses: lid_lift_together / props: jefferson_park_string_lights, neighborhood_cauldron / scene effects: cameo_porch_silhouettes, golden_feast_wave / sounds: stone_shatter_sizzle_block_party_cheer
* **Not a mashup because:** Celebrates Chapter 8 and Chapter 19's Jefferson Park neighbor feast with neighborhood cameos and a full 100% party heal.

---

### 5. Boppy + Tom Tombos (Role: Back-Row Yank & Trap, Impenetrable Party Bastion, and Scoville Sneeze Nuke)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Quiet on Cattail Pier | `tb_boppy_1` | Ch 3: Fishing for Old Iron-Gill together at Cattail Pier | 25% | Splash | 2.3 | `all` | `row front all`, `st hooked 2 all`, `burn +2 boppy` | Pulls EVERY back-row enemy to the front row + Hooks all foes |
| 2 | Nobody Gets Past Us | `tb_boppy_2` | Ch 14: Redeeming Boppy | 50% | Chatter | 2.7 | `all` | `st nobody_gets_past 3 party`, `st bodyguarded 2 party`, `interrupt`, `kindFoe` | Ultimate party mitigation wall (40% DR + Bodyguard + Interrupt) |
| 3 | The Pepper-Broth Sneeze | `tb_boppy_3` | Ch 19: Boppy wakes from stone sneezing at the pepper broth | 75% | Cozy | 4.1 | `all` | `shieldBreak`, `st stunned 1 all`, `burn +3 boppy`, `cure amber party` | Highest raw AoE damage + shatters all shields + AoE Stun |

#### Quiet on Cattail Pier (Boppy Tier 1, `tb_boppy_1`)
* **The shared activity:** Father and son sit side-by-side on folding camp chairs on Cattail Pier; Tom tosses a sourdough-crust lure into the back row while Boppy hooks the whole school of monsters in one cast.
* **What Tom does:** Opens the green tackle box, baits Boppy's hook with a piece of sourdough crust, and points out the ripples in the back row.
* **What Boppy does:** Tells Tom to keep his voice down so he doesn't scare the fish, then double-hand casts a heavy net-line that drags every back-row enemy to the front.
* **Spoken lines:**
  * Boppy: "Shh! Keep it down, Tom, you're scaring the fish!"
  * Tom: "Dad, they're monsters, and they're right behind that bush."
* **Animation beats:**
  1. Wooden pier planks and cattail reeds pop up; Tom and Boppy sit in matching folding chairs as Tom clips a glowing sourdough lure onto Boppy's line (0.8s).
  2. Boppy stands up, mutters, and whips a massive wide-arc cast across the entire enemy back row (`ZIIIIIIP-SPLASH!`) (0.9s).
  3. IMPACT: Tom and Boppy both grab the rod and heave backward together (`YANK!`), dragging every back-row enemy into the front row (`2.3x SPLASH ALL + HOOKED ALL + 2 HEARTBURN`) (0.8s).
* **New assets:** poses: double_rod_heave, folding_chair_bait / props: green_tackle_box, pier_reeds / scene effects: wide_net_splash_drag / sounds: double_reel_crank_splash
* **Not a mashup because:** Staged as a two-man pier fishing scene where both sprites pull the same rod to yank the entire enemy back row forward.

#### Nobody Gets Past Us (Boppy Tier 2, `tb_boppy_2`)
* **The shared activity:** After redeeming Boppy in Chapter 14, father and son stand shoulder-to-shoulder at the front of the party, combining Rikers Warden authority with Tom's bodyguard stance into an unbreakable wall.
* **What Tom does:** Steps up beside his dad, puts a hand on Boppy's shoulder to steady him, and raises his open `DEFEND` palm.
* **What Boppy does:** Shakes off the villain's shadow, plants his feet next to his son, and barks the Rikers gate order that stops all enemy wind-ups cold.
* **Spoken lines:**
  * Boppy: "Nobody got past me then, and nobody gets past my son now!"
  * Tom: "You heard the Warden. Gate's closed."
* **Animation beats:**
  1. Purple shadow wisps try to cling to Boppy; Tom steps in and claps a warm hand onto his dad's shoulder, shattering the shadow into gold light (1.1s).
  2. Father and son step forward in locked unison and cross their arms side-by-side in front of the whole family (1.1s).
  3. IMPACT: A towering wrought-iron and diamond-glass fortress gate slams down in front of the party (`Nobody Gets Past 3t + Bodyguarded`) while a shockwave of pure authority blasts all foes (`2.7x CHATTER ALL + INTERRUPT!`) (1.3s).
* **New assets:** poses: father_son_shoulder_clasp, unison_guard_cross / props: fortress_warden_gate / scene effects: shadow_shatter_gold / sounds: heavy_iron_gate_lock_chime
* **Not a mashup because:** Celebrates Chapter 14's redemption arc with a custom father-son shoulder clasp and fortress gate summon.

#### The Pepper-Broth Sneeze (Boppy Tier 3, `tb_boppy_3`)
* **The shared activity:** Tom holds a steaming bowl of cayenne-spiked neighborhood broth under Boppy's nose to wake him from stone (Chapter 19), triggering a volcanic grandpa sneeze that obliterates every shield on screen.
* **What Tom does:** Wafts a steaming ceramic bowl of five-alarm cayenne broth under Boppy's petrified nose, then ducks behind an umbrella.
* **What Boppy does:** Thaws from head to toe as his nose turns bright red, inhales half the room's air, and sneezes a nuclear Scoville fireball across the stage.
* **Spoken lines:**
  * Tom: "Extra cayenne in the broth, Dad. Breathe deep!"
  * Boppy: "Ah... AHH... ACHOOOO! Ooh, that cleared my stomach right out!"
* **Animation beats:**
  1. Letterbox bars slide in; Boppy stands encased in grey Amber stone until Tom steps up holding a glowing red bowl of spicy pepper broth and fans the steam under Boppy's nose (1.3s).
  2. The stone cracks and glows molten orange from Boppy's belly upward (`CRACK-SIZZLE!`); Boppy bursts free, eyes watering, and inhales (`AH... AHHH...`) as the camera zooms in (1.3s).
  3. Tom calmly opens a fireproof umbrella and crouches behind it (0.8s).
  4. IMPACT: `ACHOOOOOOO!!` Boppy unleashes a screen-filling volcanic dragon-sneeze of ghost-pepper fire (`4.1x COZY ALL + SHIELD BREAK + STUN ALL!`), thawing all party Amber and filling Boppy to `+3 Heartburn` (1.6s).
* **New assets:** poses: stone_boppy_thaw, tom_umbrella_duck, mega_sneeze_blast / props: spicy_broth_bowl, fireproof_umbrella / scene effects: volcanic_sneeze_firestorm / sounds: stone_crack_giant_inhale_kaboom_sneeze
* **Not a mashup because:** Directly adapts the exact Chapter 19 joke ("Boppy wakes from stone sneezing at the pepper broth") into the game's biggest shield-breaking nuke.

---

### 6. TNB + Tom Tombos (Role: Smog-Clearing Buff/Debuff Swing, Express Ribbon Teleport, and Distance-Shattering Finale Breaker)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2nd Ave Window Wash | `tb_tnb_1` | Ch 2: Clearing the smog from 2nd Ave together | 25% | Splash | 2.2 | `all` | `cure all party`, `st cool_down 2 all`, `rack tom`, `kindFoe` | Full party cleanse + enemy COOL shred + dresses Tom |
| 2 | Red Line Transfer | `tb_tnb_2` | Ch 6: Riding the Metro tunnels | 50% | Kinetic | 2.9 | `all` | `ct +1.0 party`, `st evasive 2 party`, `st staggered 1 all` | Pulls the ENTIRE party to 100% CTB turn readiness at once |
| 3 | Cone Six Across the Miles | `tb_tnb_3` | Ch 19: TNB places his first hand-thrown cup on the altar to restore Tom | 75% | Cozy | 4.2 | `all` | `shieldBreak` (**Breaks Distance Barrier**), `continuity 2 party`, `heal .60 party`, `rack party` | Shatters the Finale Distance Barrier + grants party-wide Continuity |

#### 2nd Ave Window Wash (TNB Tier 1, `tb_tnb_1`)
* **The shared activity:** On their Jefferson Park porch in Chapter 2, Tom fans away the grey smog with a box-fan gadget while TNB longboard-carves past with a garden hose and pottery sponge to wash the whole screen sparkling clean.
* **What Tom does:** Unboxes a high-velocity turbo fan, plugs it in, and blows the enemy smog clouds backward.
* **What TNB does:** Skates a half-circle around Tom with a garden hose and giant yellow sponge, giving Tom a quick kiss on the pass-by and dressing him from the rack.
* **Spoken lines:**
  * TNB: "Well, well, well, let's clear the air on Second Ave, babe."
  * Tom: "Visibility restored. Spotless."
* **Animation beats:**
  1. Grey smog clouds drift across the screen; Tom sets up a sleek white turbo fan that blows the haze toward the enemies (0.8s).
  2. TNB carves across the stage on his longboard holding a pressurized garden hose, spraying a rainbow arc of water that washes all debuffs off the party (0.9s).
  3. IMPACT: TNB passes Tom with a quick cheek kiss (`rack` costume on Tom + floating heart) as the soapy tidal wave crashes through all enemies (`2.2x SPLASH ALL + COOL DOWN ALL`) (0.8s).
* **New assets:** poses: tom_fan_aim, tnb_hose_skate / props: white_turbo_fan, garden_hose / scene effects: rainbow_mist_wash / sounds: fan_whir_hose_splash_smooch
* **Not a mashup because:** Replaces the old "Dutch Oven + Kiln" duplicate with a Chapter 2 porch smog-clearing scene featuring TNB's signature kiss-and-heart greeting.

#### Red Line Transfer (TNB Tier 2, `tb_tnb_2`)
* **The shared activity:** Tom and TNB hop an LA Metro subway car together through the underground tunnels (Chapter 6); TNB rides his longboard on the roof while Tom operates the motorman's horn and express throttle.
* **What Tom does:** Leans out the front cab window of the subway car in conductor sunglasses, blows the horn, and pulls the express lever.
* **What TNB does:** Surfs the top of the speeding subway car on his longboard, tossing glowing Metro transfer tickets to the whole party.
* **Spoken lines:**
  * TNB: "Next stop: right through these guys! Hold the handrail, Tom!"
  * Tom: "Express service from Wilshire to Vermont. Stand clear of the closing doors!"
* **Animation beats:**
  1. Subway tunnel tiles and a glowing red `METRO` sign frame the stage; a silver subway train roars in from the left with Tom at the front controls and TNB longboard-surfing on the roof (1.2s).
  2. TNB flicks glowing golden `TRANSFER` tap-cards to every party member, pulling the entire party's CTB icons to `100% READY` (`ct +1.0 party + Evasive`) (1.1s).
  3. IMPACT: Tom pulls the air-horn cord (`HONK-HONK!`) as the train barrels straight through the entire enemy formation (`2.9x KINETIC ALL + STAGGER ALL!`) (1.2s).
* **New assets:** poses: tom_motorman_cab, tnb_roof_surf / props: subway_car_front / scene effects: tunnel_light_streaks / sounds: subway_horn_rail_clatter_boom
* **Not a mashup because:** A full subway-surfing setpiece built around Chapter 6's Metro tunnels.

#### Cone Six Across the Miles (TNB Tier 3, `tb_tnb_3` - **SHATTERS THE DISTANCE BARRIER**)
* **The shared activity:** Even when separated by 2,500 miles (or erased in Chapter 19), TNB places his very first hand-thrown ceramic cup on the kiln altar while Tom pours his morning coffee into the matching cup on the other coast, folding the map in half so there is zero distance between them.
* **What TNB does:** Holds his first rough, hand-thrown stoneware mug with both hands, fires the kiln to Cone Six, and steps across the folded map to embrace Tom.
* **What Tom does:** Holds the matching stoneware mug from an airplane window seat at the opposite edge of the screen, then meets TNB in the center as the distance shatters.
* **Spoken lines:**
  * TNB: "First cup I ever threw on the wheel. Always brings you home to me."
  * Tom: "Three thousand miles is nothing. I'm right here."
* **Animation beats:**
  1. Letterbox bars slide in; a split-screen map of the United States divides the stage with a cold blue `2,475 MILES` barrier wall down the middle. TNB stands in LA on the left; Tom stands on the East Coast on the right (1.3s).
  2. TNB holds up his first hand-thrown ceramic cup glowing with `CONE SIX` kiln fire; Tom holds up the matching cup filled with warm coffee. A golden thread of warmth connects the two mugs right through the barrier (1.3s).
  3. **BARRIER-BREAKER IMAGE:** Tom and TNB walk toward each other and clink their ceramic mugs together right through the center line; the entire US map folds together like origami so LA and the East Coast touch, shattering the **Distance Barrier** into a million golden shards (1.2s).
  4. IMPACT: They share a kiss with a giant pixel heart as a Cone Six solar flare sweeps all enemies (`4.2x COZY ALL + SHIELD BREAK`), heals the party 60% HP, dresses everyone (`rack party`), and records a 2-turn `Continuity` snapshot for the whole party (1.2s).
* **New assets:** poses: mug_clink_embrace / props: first_thrown_ceramic_cup, folding_us_map / scene effects: distance_barrier_shatter, golden_mug_tether / sounds: kiln_hum_porcelain_clink_glass_shatter_swell
* **Not a mashup because:** Directly embodies the defeat of Julian Vance's **Distance** resentment by folding the cross-country map in half around TNB's Chapter 19 ceramic cup.

---

### 7. Nara + Tom Tombos (Role: Scent-Marked Crit Fetch, Underground Tunnel Ambush, and Fear-Shattering Finale Breaker)

| Tier | Name | Key | Unlock Beat | HEART | Element | Mult | Target | Effects | Distinct Role |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Porch Welcome Boule | `tb_nara_1` | Ch 2: Nara greets Tom on the 2nd Ave porch | 25% | Kinetic | 2.4 | `splash` | `crit 1`, `scent 3 t`, `heal .30 both`, `kindFoe` | Guaranteed-crit splash hit + applies `Tracked Scent` + self-sustain |
| 2 | Gopher Hole Express | `tb_nara_2` | Ch 6: The underground tunnels | 50% | Kinetic | 2.8 | `all` | `interrupt`, `steal all`, `st grit_down 3 all`, `st pow_up 3 both` | Underground bypass that ignores front-row guards, steals all buffs, and shreds GRIT |
| 3 | The Dog Who Remembered | `tb_nara_3` | Ch 19: Nara tracks Tom's scent when the world forgets him | 75% | Sparkle | 4.2 | `all` | `shieldBreak` (**Breaks Fear Barrier**), `cure all party`, `st fearless (immune to debuffs) 2 party`, `scent 3 all`, `kindFoe` | Shatters the Finale Fear Barrier + grants party total debuff immunity |

#### Porch Welcome Boule (Nara Tier 1, `tb_nara_1`)
* **The shared activity:** Recreating their Chapter 2 first meeting on the 2nd Ave porch, Nara does a full-body excited jump into Tom's arms before Tom tosses a crusty sourdough boule dipped in chicken jerky for the ultimate mid-air fetch.
* **What Tom does:** Catches 40 pounds of flying Labradoodle with a laugh, then launches a golden sourdough boule wrapped in chicken jerky high over the enemies.
* **What Nara does:** Licks Tom's glasses, leaves a tiny happy sparkle, and rockets across the enemy group to chomp the boule in mid-air.
* **Spoken lines:**
  * Tom: "Whoa, hi Nara! Good girl! Go get the boule!"
  * Nara: "YIP! BARK! CHOMP-WOOF!"
* **Animation beats:**
  1. Nara bounds across the porch and leaps straight into Tom's chest (`BOOF!`); Tom catches her and laughs as she licks his glasses clean (0.8s).
  2. Tom winds up and hurls a steaming sourdough boule topped with a strip of chicken jerky in a high arc over the target enemy (0.8s).
  3. IMPACT: Nara launches like a black furry torpedo right through the target and its neighbors to snatch the boule mid-air (`2.4x KINETIC SPLASH + GUARANTEED CRIT + TRACKED SCENT`), sharing the snack to heal both 30% HP (0.9s).
* **New assets:** poses: tom_catch_dog, nara_glasses_lick / props: jerky_topped_boule / scene effects: porch_heart_burst / sounds: excited_bark_laugh_chomp
* **Not a mashup because:** Staged around their Chapter 2 porch greeting hug and glasses-lick before the fetch payoff.

#### Gopher Hole Express (Nara Tier 2, `tb_nara_2`)
* **The shared activity:** In the underground tunnels beneath Old Oak Park (Chapter 6), Nara digs a cartoon tunnel straight under the battlefield while Tom drops a flashlight beacon down the hole to guide her pop-up eruption under every enemy.
* **What Tom does:** Taps the ground with his shoe, shines a flashlight down the burrow entrance, and calls out the coordinates.
* **What Nara does:** Digs underground in a flying dirt geyser, pops up beneath every single enemy to snatch their buffs, and bursts out holding a golden acorn.
* **Spoken lines:**
  * Tom: "Tunnel two, right under their feet. Dig, Nara, dig!"
  * Nara: "SNUFFLE-DIG-DIG... BARK!"
* **Animation beats:**
  1. Nara's paws blur at 100 mph as she digs straight into the stage floor (`DIG-DIG-DIG-POOF!`), leaving a cartoon dirt mound; Tom kneels by the hole and shines a beam inside (1.1s).
  2. A rumbling periscope of curly black dog ears zips underground across the entire enemy formation (`RUMBLE-RUMBLE`) (1.1s).
  3. IMPACT: Nara erupts upward from beneath all enemies in five dirt geysers (`2.8x KINETIC ALL + INTERRUPT + STEAL ALL + GRIT DOWN 3T!`) and lands back beside Tom wagging her tail (1.3s).
* **New assets:** poses: dig_blur, tom_hole_flashlight / props: dirt_mound_hole / scene effects: underground_ear_periscope, dirt_geyser_row / sounds: cartoon_dig_subterranean_boom
* **Not a mashup because:** A bespoke underground tunnel ambush inspired by Chapter 6.

#### The Dog Who Remembered (Nara Tier 3, `tb_nara_3` - **SHATTERS THE FEAR BARRIER**)
* **The shared activity:** When the Unsent Dead-Letter Office erases Tom and freezes the world in fear of loss (Chapter 19), Nara charges headfirst into the terrifying dark void, grabs Tom's sleeve in her teeth, and pulls him back into the light.
* **What Nara does:** Barks defiantly at the giant shadow of Fear, sprints fearless into the pitch-black static void following her nose, and drags Tom back into color.
* **What Tom does:** Materializes from the erased static as Nara's nose touches his hand, kneels to hug her around the neck, and unleashes a wave of fearless pack light.
* **Spoken lines:**
  * Nara: "AROOOOOO! BARK! BARK! (Narration: 'I don't care if the whole world forgot! I know my friend!')"
  * Tom: "Goodest girl in the universe. Nothing scares us now."
* **Animation beats:**
  1. Letterbox bars slide in; a towering, trembling black-and-violet **Fear Barrier** of dark static and locks traps the screen while Tom's sprite flickers like an erased photograph (1.3s).
  2. Nara doesn't flinch; her tail goes up, she lets out a defiant `BARK!`, and she charges straight into the dark static wall following a single glowing golden scent ribbon (1.3s).
  3. **BARRIER-BREAKER IMAGE:** Inside the dark barrier, Nara's wet black nose boops Tom's fading hand; instant full-color golden light explodes outward from her nose, shattering the **Fear Barrier** like cheap glass as Tom comes back into 100% solid color and hugs her tight (1.2s).
  4. IMPACT: The pack-light shockwave hits all foes (`4.2x SPARKLE ALL + SHIELD BREAK + TRACKED SCENT ALL`), cures all debuffs, and makes the party completely immune to debuffs for 2 turns (1.2s).
* **New assets:** poses: fading_static_tom, nara_defiant_charge, nose_boop_restore / props: fear_static_wall / scene effects: color_restore_nova / sounds: static_hum_to_heroic_bark_shatter
* **Not a mashup because:** Dramatizes Chapter 19's miraculous scent-tracking rescue and visibly shatters the **Fear Barrier** with a wet dog nose boop in the dark.

---

### Family Finishes (4 Total - Unlock in Part 2, Cost 75% HEART)

| # | Name | Key | Participants | Unlock Ch | HEART | Element | Mult | Target | Barrier Broken | Effects |
|---|---|---|---|---|---|---|---|---|---|---|
| FF1 | Welcome to Jefferson Park | `ff_la_home` | Tom + TNB + Grace + Rose | Ch 11/12 | 75% | Sparkle | 4.3 | `all` | None (Midgame Showcase) | `heal .60 party`, `mount`, `trend lock 2`, `rack party`, `mile +2 tom`, `kindFoe` |
| FF2 | She Carries the Load | `ff_mom_girls` | Amy + Grace + Rose *(No Tom required!)* | Ch 12 | 75% | Kinetic | 4.4 | `all` | **Exhaustion Barrier** | `shieldBreak`, `cure all party`, `vp +5 party`, `st personal_best 3 party`, `ct +0.75 party` |
| FF3 | Fifty-One Years & Counting | `ff_grandparents` | Deedee + Boppy + Tom | Ch 15 | 75% | Cozy | 4.4 | `all` | **Aging Barrier** | `shieldBreak`, `revive 1.0 party`, `heal 1.0 party`, `st tucked_in 3 party`, `st nobody_gets_past 3 party`, `kindFoe` |
| FF4 | The Eight-Seat Dinner Table | `ff_all_eight` | All 8 Party Members | Ch 20 | 75% | Sparkle-Cozy | 5.0 | `all` | All / Finale Capstone | `shieldBreak`, `revive 1.0 party`, `heal 1.0 party`, `cure all party`, `refill party`, `kindFoe` |

#### FF1: Welcome to Jefferson Park (`ff_la_home` - Tom + TNB + Grace + Rose)
* **The shared activity:** When the girls finally visit Tom and TNB's LA home and pottery studio in Chapter 11/12, the four of them turn the backyard into an acro-pottery-unboxing block party.
* **Spoken lines:**
  * Grace & Rose: "Ta-Ta's house! Look what we made in the studio!"
  * Tom & TNB: "Best houseguests in Los Angeles. Take it away, girls!"
* **Animation beats:**
  1. Letterbox bars slide in; palm trees, string lights, and TNB's backyard pottery studio pop up as TNB spins two glowing ceramic bowls on the wheel and dresses everyone in fresh studio aprons (`rack party`) (1.5s).
  2. Tom hoists Rose onto his shoulders (`mount`) while spotting Grace's cartwheel off the porch steps; Grace and Rose toss sparkling gold dumpling squishies and Lamby into TNB's kiln (1.8s).
  3. IMPACT: The kiln erupts in a joyous LA sunset firework display of `SPARKLE` and `COZY` light across all enemies (`4.3x ALL`), healing the party 60% HP, locking Grace's Trending at `x1.5`, and giving Tom +2 Upgrade Miles (2.0s).
* **New assets:** poses: four_person_porch_pose / props: backyard_studio_set / scene effects: la_palm_sunset_fireworks / sounds: studio_wheel_giggle_fireworks
* **Not a mashup because:** A four-character backyard housewarming scene celebrating the East Coast nieces finally meeting Tom and TNB's LA world.

#### FF2: She Carries the Load (`ff_mom_girls` - Amy + Grace + Rose, Works WITHOUT Tom! - **SHATTERS THE EXHAUSTION BARRIER**)
* **The shared activity:** When Amy is weighed down by the crushing **Exhaustion Barrier** of doing everything alone (teaching, marathon training, raising two girls while Justin is at work), Grace and Rose grab their mom by both hands, put their own gold stars and ribbons on her, and pull her across the finish line together.
* **Spoken lines:**
  * Grace: "You don't have to carry us the whole way, Mom! Five, six, seven, eight!"
  * Rose: "We can carry you too! Run with us, Mommy!"
  * Amy: "My girls... alright, hands together! Nobody stops the three of us!"
* **Animation beats:**
  1. Letterbox bars slide in; a crushing grey leaden wall of clocks, ungraded papers, and heavy chains labeled **EXHAUSTION** presses down on Amy, forcing her to one knee (1.5s).
  2. Grace and Rose run in from both sides: Grace sticks a shiny `A+ GOLD STAR` on Amy's forehead and starts an eight-count beat, while Rose ties her pink shoulder-ride ribbon around Amy's wrist and hands her Lamby (1.6s).
  3. **BARRIER-BREAKER IMAGE:** Instead of Amy carrying the girls, Grace and Rose each take one of Amy's hands and pull their mom up into a three-abreast sprint; as all three pairs of sneakers hit full stride together, they smash straight through the grey **Exhaustion Barrier**, turning the heavy lead chains into fluttering yellow marathon finish tape (1.7s).
  4. IMPACT: The three-person mother-daughter charge obliterates all enemies (`4.4x KINETIC ALL + SHIELD BREAK!`), cures all debuffs, restores **+5 VP** to the entire party, and grants `Personal Best` and `+75% CT` (1.5s).
* **New assets:** poses: amy_kneel_exhausted, three_hand_linked_sprint / props: exhaustion_chain_wall / scene effects: chains_to_finish_tape_burst / sounds: heavy_tick_to_triumphant_strings_crash
* **Not a mashup because:** Works without Tom as required, and visually reverses Amy's burden by having Grace and Rose lift and pace their mother through the **Exhaustion Barrier**.

#### FF3: Fifty-One Years & Counting (`ff_grandparents` - Deedee + Boppy + Tom - **SHATTERS THE AGING BARRIER**)
* **The shared activity:** Facing Julian Vance's fear of growing old and saying goodbye (**Aging Barrier**), Deedee and Boppy hold hands across 51 years of marriage (from 1970 sepia youth to proud silver-haired grandparents) while Tom frames their portrait, proving that growing older together is the best part of the story.
* **Spoken lines:**
  * Deedee: "Fifty-one years, Boppy, and I'd do every single day over again!"
  * Boppy: "Even with my stomach? ...Yeah, me too, Deedee. Nobody got past us."
  * Tom: "Fifty-one years of showing up. That's how you beat time."
* **Animation beats:**
  1. Letterbox bars slide in; a cold amber hourglass wall labeled **AGING** tries to freeze Deedee and Boppy into grey statues (1.5s).
  2. Deedee and Boppy reach out and clasp hands just like they did in Chapter 16; as their fingers intertwine, a warm golden 1970 film reel spins around them, showing young 1970 Boppy and young Nurse Deedee dancing, then seamlessly morphing into their present-day selves laughing and stronger than ever with Tom standing proudly behind them (1.8s).
  3. **BARRIER-BREAKER IMAGE:** Deedee and Boppy swing their joined hands forward together, and a 51-year golden wedding-ring shockwave shatters the **Aging Barrier** hourglass into blooming garden roses and hot peppers (1.6s).
  4. IMPACT: The wave of generational love hits all foes (`4.4x COZY ALL + SHIELD BREAK`), revives and heals the entire party to **100% HP**, and grants both `Tucked In` and `Nobody Gets Past` for 3 turns (1.5s).
* **New assets:** poses: deedee_boppy_handclasp, young_1970_couple_silhouette / props: amber_hourglass_wall / scene effects: wedding_ring_gold_nova, roses_and_peppers_burst / sounds: hourglass_crack_big_band_swell_boom
* **Not a mashup because:** Directly answers Julian Vance's fear of aging by turning 51 years of marriage into the exact force that shatters the **Aging Barrier**.

#### FF4: The Eight-Seat Dinner Table (`ff_all_eight` - All 8 Characters - Chapter 20 Ultimate Combo)
* **The shared activity:** All eight family members (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, and Nara) pull up their chairs around the glowing eight-seat family dinner table right in the middle of the final battlefield, share one huge toast of love and laughter, and unleash a combined family supernova.
* **Spoken lines:**
  * Tom: "All eight seats full. Nobody gets left behind!"
  * Everyone: "TO THE MOON AND BACK! (Nara: AROOOO-WOOF!)"
* **Animation beats:**
  1. Letterbox bars slide in; the long oak Eight-Seat Dinner Table from Chapter 15 materializes across the center of the stage under Jefferson Park string lights and Little Elsewhere stars (1.5s).
  2. All 8 characters take their seats: Deedee sets down the rhubarb crisp, Tom slices the sourdough, Boppy passes the pepper jar to TNB, Amy pours oat milk for Grace and Rose (with Lamby in a booster seat!), and Nara sits at Tom's feet chomping chicken jerky (2.0s).
  3. All 8 raise their mugs, glasses, and paws in a massive family toast (`CLINK!`); each character's signature emblem (Medallion, Dumpling, Lamby, Stopwatch, Moon, Pepper, Kiln, Tennis Ball) orbits the table in a blinding rainbow ring (1.8s).
  4. IMPACT: The eight emblems fuse into a colossal heart-shaped `SPARKLE-COZY` beam that obliterates all enemies and shields (`5.0x DAMAGE ALL + SHIELD BREAK`), revives and heals all 8 family members to **100% HP**, cures all debuffs, and refills everyone's **VP to 10** (2.2s).
* **New assets:** poses: eight_seat_toast_table / props: full_eight_seat_table_scene / scene effects: eight_emblem_orbit_beam / sounds: eight_glass_clink_full_symphony_finale
* **Not a mashup because:** The ultimate 8-character thesis statement of the game: showing up at the table together defeats any villain.

---

## I4. The Four Barrier Breakers (Finale Summary Table)

In Chapter 20 Phase 1, Chronos-Leviathan / Julian Vance erects four **Resentment Barriers** (Distance, Aging, Exhaustion, Fear). Each is shattered by the specific Tier 3 Tombo or Family Finish designed for that theme:

| Resentment Barrier | Combo That Shatters It | Participants | The One Unmistakable Image in the Animation |
|---|---|---|---|
| **Distance Barrier** | **Cone Six Across the Miles** (`tb_tnb_3`, Tier 3 Tombo) | Tom + TNB | Tom (on the East Coast) and TNB (in LA) clink their matching hand-thrown ceramic mugs together across a split-screen US map, causing the map to fold in half like origami so the two coasts touch and shatter the 2,475-mile wall. |
| **Aging Barrier** | **Fifty-One Years & Counting** (`ff_grandparents`, Family Finish 3) | Deedee + Boppy + Tom | Deedee and Boppy clasp hands as their 1970 sepia-toned young selves morph proudly into their present-day silver-haired selves with Tom behind them, shattering the amber hourglass into garden roses and hot peppers. |
| **Exhaustion Barrier** | **She Carries the Load** (`ff_mom_girls`, Family Finish 2 - *No Tom required*) | Amy + Grace + Rose | When Amy is forced to one knee by heavy chains and clocks, Grace and Rose grab both of their mom's hands, stick a Gold Star and pink ribbon on her, and pull her up into a three-abreast sprint that turns the chains into yellow finish-line tape. |
| **Fear Barrier** | **The Dog Who Remembered** (`tb_nara_3`, Tier 3 Tombo) | Tom + Nara | Nara charges fearlessly into a pitch-black wall of erased static following a single golden scent ribbon and boops Tom's fading hand with her wet black nose, exploding the dark static into full vibrant color. |

---

## I5. Old-to-New Key Map

Use this migration table to update existing save files, dialogue triggers, and area Kindness "likes" lists from the old 8-skill kits (Part F) to the new 12-skill kits:

| Character | Old Move Name (Part F) | Old Key (Assumed) | New Move Name | New Key | Migration Status |
|---|---|---|---|---|---|
| **Tom** | Button Mash | `mash` | Button Mash | `mash` | Reworked animation |
| Tom | DEFEND | `defend` | DEFEND | `defend` | Kept (Signature) |
| Tom | Starter Splash | `starter` | Starter Splash | `starter` | Kept (A1) |
| Tom | Dutch Oven | `dutchoven` | Crumb Shot | `crumb` | Replaced by `crumb` (A2, `kindFoe`) |
| Tom | Unboxing | `unbox` | Mint Unboxing | `unbox` | Reworked (A3, `kindFoe`) |
| Tom | Delta One | `deltaone` | Boarding Group Zero | `delta_ult` | Promoted to A6 Ultimate |
| Tom | Flashcard Flurry | `flash` | Flashcard Flurry | `flash` | Kept (B1) |
| Tom | Kanji Strike | `kanji` | Kanji Counter | `kanji` | Reworked (B2) |
| Tom | *Study Streak (Passive)* | `studystreak` | 365-Day Streak | `streak` | Replaced passive with active B5 |
| Tom | Final Boss | `finalboss` | Cartridge Tilt | `cart_ult` | Replaced by B6 Ultimate |
| **Grace** | Cartwheel | `cartwheel` | Cartwheel Kick | `cartwheel` | Kept (Basic) |
| Grace | DANCE | `dance` | DANCE | `dance` | Kept (Signature) |
| Grace | Squishy Squeeze | `squishy` | Squishy Squeeze | `squishy` | Kept (A1, `kindFoe`) |
| Grace | Glitter Nails | `nails` | Glitter Nails | `nails` | Kept (A2, `kindFoe`) |
| Grace | Runway Walk | `runway` | Ring Light Check | `ringlight` | Replaced by `ringlight` (A3) |
| Grace | Like and Subscribe | `likesub` | Ten Million Subscribers | `viral_ult` | Promoted to A6 Ultimate (`kindFoe`) |
| Grace | Dance Battle | `battle` | Dance Battle | `battle` | Kept (B1) |
| Grace | Beam Dismount | `beam` | Beam Dismount | `beam` | Reworked (B3) |
| Grace | *Stick the Landing (Passive)* | `sticklanding` | Split Leap | `splitleap` | Replaced passive with active B4 |
| Grace | Perfect 10 | `perfect10` | Diamond Leotard Finale | `olympic_ult` | Promoted to B6 Ultimate |
| **Rose** | Boop | `boop` | Nose Boop | `boop` | Kept (Basic, `kindFoe`) |
| Rose | SILLY | `silly` | SILLY | `silly` | Kept (Signature, `kindFoe`) |
| Rose | Peekaboo | `peekaboo` | Peekaboo! | `peekaboo` | Kept (A1, `kindFoe`) |
| Rose | Twirl Tornado | `twirl` | Twirl Tornado | `twirl` | Kept (A2) |
| Rose | Dress-Up Day | `dressup` | Dress-Up Tiara | `dressup` | Reworked (A3, `kindFoe`) |
| Rose | Monster Under the Bed | `monsterbed` | Tea Party with Lamby | `teaparty_ult` | Replaced by A6 Ultimate (`kindFoe`) |
| Rose | Lamby Launch | `lamby` | Lamby Launch | `lamby` | Kept (B1) |
| Rose | Piggyback Pounce | `pounce` | Piggyback Pounce | `pounce` | Kept (B2) |
| Rose | *Big Kid Now (Passive)* | `bigkid` | Travel-Sized Tackle | `travelsize` | Replaced passive with active B3 |
| Rose | Lamby Stampede | `stampede` | Operation Shoulder Mecha | `mecha_ult` | Replaced by B6 Ultimate |
| **Amy** | Sprint Tackle | `sprint` | Sprint Tackle | `sprint` | Kept (Basic) |
| Amy | PEP TALK | `peptalk` | PEP TALK | `peptalk` | Kept (Signature, `kindFoe`) |
| Amy | Red Pen | `redpen` | Red Pen | `redpen` | Reworked with `grade` (A1) |
| Amy | Pop Quiz | `popquiz` | Pop Quiz | `popquiz` | Kept (A2) |
| Amy | *Lesson Plan (Passive)* | `lessonplan` | Gold Star Sticker | `goldstar` | Replaced passive with active A3 (`kindFoe`) |
| Amy | Personal Best | `personalbest` | Detention Forever | `detention_ult` | Replaced by A6 Ultimate (buff moved to B5/B6) |
| Amy | Burpee Blitz | `burpee` | Burpee Blitz | `burpee` | Kept (B1) |
| Amy | Hill Repeats | `hills` | Hill Repeats | `hills` | Kept (B2) |
| Amy | Marathon | `marathon` | Oat Milk Gel Pack | `oatgel` | Replaced by `oatgel` (B3, `kindFoe`) |
| Amy | Finish Line | `finishline` | Boston Qualifier | `marathon_ult` | Promoted to B6 Ultimate |
| **Deedee** | Spit Shine | `spitshine` | Spit Shine | `spitshine` | Kept (Basic, `kindFoe`) |
| Deedee | MOON & BACK | `moonback` | MOON & BACK | `moonback` | Kept (Signature, `kindFoe`) |
| Deedee | Registered Nut | `regnut` | Registered Nut | `regnut` | Reworked (A1, `kindFoe`) |
| Deedee | Rhubarb Crisp | `rhubarb` | Rhubarb Crisp | `rhubarb` | Kept (A2, `kindFoe`) |
| Deedee | Wet Floor | `wetfloor` | Wet Floor! | `wetfloor` | Kept (A3) |
| Deedee | Sunday Dinner | `sunday` | Sunday Roast Spread | `sunday_ult` | Promoted to A6 Ultimate (`kindFoe`) |
| Deedee | Power Walk | `powerwalk` | Power Walk | `powerwalk` | Kept (B1) |
| Deedee | Wine O'Clock | `wine` | Wine O'Clock | `wine` | Reworked (B3) |
| Deedee | *Garden Fresh (Passive)* | `gardenfresh` | Prune the Bushes | `prune` | Replaced passive with active B2 |
| Deedee | To the Moon & Back | `tothemoon` | To the Moon and Back | `moon_ult` | Promoted to B6 Ultimate (`kindFoe`) |
| **Boppy** | Cap Swat | `capswat` | Cap Swat | `capswat` | Kept (Basic) |
| Boppy | GRUMBLE | `grumble` | GRUMBLE | `grumble` | Kept (Signature) |
| Boppy | Cast Line | `cast` | Cast Line | `cast` | Kept (A1) |
| Boppy | Recliner Drop | `recliner` | Recliner Drop | `recliner` | Kept (A2) |
| Boppy | Big Catch | `bigcatch` | Warden's Headcount | `headcount` | Replaced by `headcount` (A3) |
| Boppy | The One That Got Away | `gotaway` | The One That Got Away | `fish_ult` | Promoted to A6 Ultimate |
| Boppy | Pepper Breath | `pepperbreath` | Pepper Breath | `pepperbreath` | Kept (B1) |
| Boppy | Hot Pepper | `hotpepper` | Homegrown Habanero | `habanero` | Reworked (B2, `kindFoe`) |
| Boppy | Track Star Story | `trackstory` | Class of 1970 | `story1970` | Reworked (B4, `kindFoe`) |
| Boppy | Ghost Pepper | `ghostpepper` | Van Cortlandt Park '70 | `xc_ult` | Replaced by B6 Ultimate (peppers in B5 `pepperjar`) |
| **TNB** | Mug Toss | `mugtoss` | Mug Toss | `mugtoss` | Kept (Basic) |
| TNB | WARDROBE | `wardrobe` | WARDROBE | `wardrobe` | Kept (Signature, `kindFoe`) |
| TNB | Quick Change | `quickchange` | Quick Change | `quickchange` | Kept (A1, `kindFoe`) |
| TNB | Next Stop | `nextstop` | Metro Tap Card | `nextstop` | Reworked (A2) |
| TNB | Jump Scare | `jumpscare` | Slasher Jump Scare | `jumpscare` | Kept (A3) |
| TNB | That's a Wrap | `thatsawrap` | That's a Wrap! | `wrap_ult` | Promoted to A6 Ultimate |
| TNB | Carve | `carve` | Sunset Carve | `carve` | Kept (B1) |
| TNB | Kiln Blast | `kiln` | Cone Six Kiln | `kiln` | Reworked (B3) |
| TNB | *Cone Six (Passive)* | `conesix` | Center the Clay | `wheel` | Replaced passive with active B2 (`kindFoe`) |
| TNB | Bomb the Hill | `bombhill` | Baxter Street Bomb | `hillbomb_ult` | Promoted to B6 Ultimate |
| **Nara** | Jump Up | `jumpup` | Jump Up | `jumpup` | Kept (Basic, `kindFoe`) |
| Nara | PUPPY EYES | `puppyeyes` | PUPPY EYES | `puppyeyes` | Kept (Signature, `kindFoe`) |
| Nara | Fetch | `fetch` | Tennis Ball Fetch | `fetch` | Kept (A1) |
| Nara | Zoomies | `zoomies` | Living-Room Zoomies | `zoomies` | Kept (A2) |
| Nara | Tug of War | `tug` | Tug of War | `tug` | Kept (A3) |
| Nara | SQUIRREL! | `squirrel` | CHAIRMAN CHEEKS! | `squirrel_ult` | Promoted to A6 Ultimate |
| Nara | Happy Puddle | `puddle` | Happy Puddle | `puddle` | Kept (B1) |
| Nara | Wet Dog Shake | `wetshake` | Wet Dog Shake | `wetshake` | Kept (B2) |
| Nara | *Pack Instinct (Passive)* | `packinstinct` | Chicken Jerky Snob | `jerky` | Replaced passive with active B3 (`kindFoe`) |
| Nara | Lonely Howl | `howl` | Lonely Howl | `howl` | Reworked (B5); B6 Ultimate is `pack_ult` |
| **Tombos** | Dumpling Unboxed | `tb_grace_old` | Unboxing Collab Live | `tb_grace_1` | Replaced mashup with new scene |
| Tombos | Double-Decker Boop | `tb_rose_old` | Double-Decker Airplane | `tb_rose_1` | Replaced mashup with new scene |
| Tombos | Sourdough & Rhubarb | `tb_deedee_old` | Four-Handed Baker's Dozen | `tb_deedee_1` | Replaced mashup with new scene |
| Tombos | Glaze & Bake | `tb_tnb_old` | 2nd Ave Window Wash | `tb_tnb_1` | Replaced mashup with new scene |
| Tombos | Boule Fetch | `tb_nara_old` | Porch Welcome Boule | `tb_nara_1` | Reworked into full porch scene |
| Tombos | Quiet on the Pier | `tb_boppy_old` | Quiet on Cattail Pier | `tb_boppy_1` | Reworked into shared rod-heave scene |
| Tombos | On Your Marks | `tb_amy_old` | Red-Pen Study Blitz | `tb_amy_1` | Replaced generic run with classroom blitz |

---

## I6. Self-Check

1. **Every path has 6 nodes (or a justified 5 or 7) and every node is an active skill or a justified passive.**
   * **Yes:** All 8 characters have exactly 6 nodes on Path A (A1 to A6) and 6 nodes on Path B (B1 to B6), totaling 96 path nodes, and 100% of them are active skills with zero passive-only nodes.
2. **At least two thirds of each character's path skills are NEW or REWORKED.**
   * **Yes:** Every character has only 2 to 4 `KEEP` path skills out of 12 (between 67% and 83% of every single character's path skills are marked `NEW` or `REWORKED`).
3. **All 21 Tombos, 4 Family Finishes and 16 Ultimates are new, and none reuses an existing animation as its core.**
   * **Yes:** All 16 Ultimates (A6 and B6 for all 8 characters), all 21 Tombos (`tb_<partner>_1/2/3`), and all 4 Family Finishes (`ff_*`) have brand-new 4-to-7-second multi-beat scene staging and custom props.
4. **No two abilities in the game share the same core animation idea.**
   * **Yes:** Every single ability across all 137 cards has a distinct visual hook (from blowing into a 16-bit game cartridge and folding a US map in half to a 1970 sepia cross-country film reel and a continuity Polaroid snapshot).
5. **Every character has at least three kindFoe moves.**
   * **Yes:** Tom has 3 (`crumb`, `unbox`, `pause_bite`), Grace has 5 (`dance`, `squishy`, `nails`, `dumpling`, `viral_ult`), Rose has 6 (`boop`, `silly`, `peekaboo`, `dressup`, `fort_build`, `boomerang`, `teaparty_ult`), Amy has 4 (`peptalk`, `goldstar`, `hallpass`, `oatgel`), Deedee has 6 (`spitshine`, `moonback`, `regnut`, `rhubarb`, `seconds`, `sunday_ult`, `moon_ult`), Boppy has 3 (`candy`, `habanero`, `story1970`), TNB has 5 (`wardrobe`, `quickchange`, `polaroid`, `wheel`, `fixit`), and Nara has 5 (`jumpup`, `puppyeyes`, `bellyrub`, `jerky`, `pack_ult`).
6. **Every character's kit meets the variety list in H1.**
   * **Yes:** Every character's 12 path skills include at least 2 single-target attacks, at least 2 multi-target (`row`/`splash`/`all`/`multi`) attacks, at least 2 support/control moves, at least 3 `kindFoe` moves, direct trait interactions, and 2 cross-family party synergy bonuses.
7. **Every ability has a unique spoken line that references it, with no em dashes.**
   * **Yes:** Every single ability card, Tombo, and Family Finish has a custom spoken line of 12 words or fewer, and the entire document contains zero em dashes.
8. **Grace and Rose say "Ta-Ta" only in spoken lines; all descriptions say "Tom."**
   * **Yes:** Verified across all Grace and Rose ability cards and Tombos (`"Point your toes, Ta-Ta, watch!"` in speech vs. `"puts Rose on Tom's shoulders"` in menu descriptions).
9. **Nara never speaks words.**
   * **Yes:** All 14 of Nara's ability cards and all 3 of her Tombos use only barks, whines, sniffs, and sound effects in her spoken lines, with human translations placed inside the battle message narration.
10. **Boppy never complains about joints or knees.**
    * **Yes:** Boppy's complaints in `GRUMBLE`, `Slow Down!`, `My Stomach's Acting Up`, and `The Pepper-Broth Sneeze` strictly reference his stomach and people walking too fast.
11. **Signature specials keep their names and core function.**
    * **Yes:** `DEFEND`, `DANCE`, `SILLY`, `PEP TALK`, `MOON & BACK`, `GRUMBLE`, `WARDROBE`, and `PUPPY EYES` all retain their exact names, VP costs, and core mechanics while receiving enhanced animation proposals.
12. **The number of NEW EFFECTS is about 12 or fewer.**
    * **Yes:** Exactly 10 `NEW EFFECT` operations (`mile`, `pause`, `trend`, `choreo`, `fort`, `grade`, `tray`, `pace`, `continuity`, `scent`) are defined in Section I1 and used consistently across all kits.