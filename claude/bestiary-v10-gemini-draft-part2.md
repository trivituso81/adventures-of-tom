- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/twigspy.webp` | Drop: `binoculars`
- **Traits:** Starts with strippable `Leaf Camo` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Branch Poke` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Quick jab.
  - `Stakeout Mark` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Exposes target (`+20%` incoming Crit Rate 2t).
  - `Leaf Storm` (`Clobber`, 1.1x, Rec 120, all allies, `[projectile, aoe]`): Whirling dead-leaf flurry.

#### 33. `cheekstuffer` | Cheek Stuffer
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 513, Atk 60, Def 40, Spd 94, Pep 0, Pips 4
- **Pet Peeves:** `Drench`, `Racket` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/cheekstuffer.webp` | Drop: `cheekpouch`
- **Acts:**
  - `Crumb Spray` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Muffled *mmmf* spray (`Blind` 1t).
  - `Cheek Bump` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Heavy pouch body-check.
  - `Snack Snatch` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, buff, charge_up]`): Steals `-1 Pep` and grants self `+20% Def` `[buff]` (2t).

#### 34. `acorncache` | Acorn Cache
- **Role & Row:** `Swarmer` (Summoned Stash Object) | `Back` | **Stats:** HP 150, Atk 0, Def 26, Spd 109, Pep 0, Pips 0
- **Pet Peeves:** `Clobber`, `Sizzle` | **Resists:** None
- **Assets & Drop:** `art/foes/acorncache.webp` | Drop: None (0 VP boss add)
- **Traits:** Summoned into `Back` row by `chairman`. Does not attack; if still alive on Chairman's 2nd turn after summon, Chairman devours it for `Winter Hoard` (`15% HP` heal + `+25% Atk/Def` `[buff]` 2t). Smashing it first bursts out **`+1 Pep` to all party members** and inflicts **`10% Max HP` emotional-damage recoil + `-1 Composure pip`** on `Chairman Cheeks`!
- **Acts:**
  - `Sit Pretty` (`Support`, 0.0x, Rec 100, self, `[]`): Wobbles temptingly in the Back row.

#### 35. `chairman` | Chairman Cheeks
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 1,220 *(3-Unit Squad Baseline; 1,465 HP if optional 4th-slot Olivia is active)*, Atk 65, Def 37, Spd 106, Pep 0, Pips 6
- **Pet Peeves:** `Drench`, `Sizzle` | **Resists:** `Racket`
- **Assets & Story Reward:** `art/foes/chairman.webp`, `chairman-end.webp` | Story Reward: `Picnic Basket Coin` + Tom's sourdough starter `Bready Mercury` (triggers Ch. 6 **The Discovery**!).
- **Mechanics & Kit Checks (Tuned for 3-Unit `Tom/TNB/Nara` Squad):**
  - **Back-Row `acorncache` Summon Race:** Summons an `acorncache` (150 HP) to the `Back` row every 3 rounds. Smashing it with ranged/AoE skills grants `+1 Party Pep` and deals `10% Max HP` recoil + `-1 Composure pip` to Chairman; if left alive, Chairman devours it for `Winter Hoard` (`15% HP` heal + `+25% Atk/Def` `[buff]` 2t).
  - **Buff-Steal Showcase (Nara Arch-Nemesis):** Starts battle with `Executive Monocle` (`+20% Crit Rate` & `+20% Atk` `[buff]`, 3t) and gains `Winter Hoard` if he eats a cache, feeding Nara's `"No Take, Only Throw!"`, `Weaponized Puppy Eyes`, and `Stunt-Double Squirrel Intercept`.
- **Acts:**
  - `Filibuster` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Pompous chittering (`Fatigue` 2t).
  - `Acorn Volley` (`Clobber`, 1.0x, Rec 100, 2 random allies, `[projectile]`): Rapid cap tosses.
  - `Cheek Slam` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Velvet-throne tail smash.
  - `Stash for Winter` (`Support`, 0.0x, Rec 80, field, `[buff]`): Summons 1 `acorncache` (150 HP) to `Back` row (or devours an existing cache for `15% HP` heal + `+25% Atk/Def` `[buff]` 2t).
  - `The Big Stash` (`Clobber`, 1.35x, Rec 120, all allies, `[projectile, ground_sweep, aoe, charge_up]`): Phase 2 (<50% HP) avalanche of stolen 2nd Ave shiny objects across the floor.

---

### Chapter 7: *The Whispering Stacks* (`stacks` / `readroom` - The Hush Library, LI)

#### 36. `shusher` | Shusher
- **Role & Row:** `Hexer` | `Back` (behind Front `dogear`, `cliffhanger`, or `popup`) | **Stats:** HP 280, Atk 56, Def 32, Spd 110, Pep 0, Pips 0
- **Pet Peeves:** `Razzle`, `Sizzle` | **Resists:** None
- **Assets & Drop:** `art/foes/shusher.webp` | Drop: `tassel`
- **Acts:**
  - `Tassel Flick` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Braided gold-cord snap.
  - `SHHH!` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Inflicts `Mental` Racket-skill lock (1t).
  - `Hush Hour` (`Racket`, 1.05x, Rec 120, all allies, `[aoe, charge_up]`): Dampens room volume (`-15% Atk` 2t).

#### 37. `dogear` | Dog-Ear
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 214, Atk 50, Def 28, Spd 110, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Sizzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/dogear.webp` | Drop: `flatpage`
- **Acts:**
  - `Page Nip` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Crisp paper-cut pounce (`Bleed` 2t).
  - `Corner Fold` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Creases armor (`-15% Def` 2t).
  - `Hard Crease` (`Clobber`, 1.1x, Rec 120, all allies, `[ground_sweep, aoe]`): Origami shockwave across Front/Back floor.

#### 38. `cliffhanger` | The Cliffhanger
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 379, Atk 65, Def 37, Spd 100, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Racket` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/cliffhanger.webp` | Drop: `sequel`
- **Acts:**
  - `Chain Swing` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Heavy hardback pendulum hit.
  - `Plot Twist!` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Pushes target 20% back on timeline.
  - `To Be Continued...` (`Racket`, 1.15x, Rec 120, all allies, `[aoe, charge_up]`): Leaves party hanging (`Slow` 2t).

#### 39. `knowitall` | The Know-It-All
- **Role & Row:** `Hexer` | `Back` (behind Front `dogear`) | **Stats:** HP 280, Atk 56, Def 32, Spd 110, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Razzle` | **Resists:** `Sizzle`
- **Assets & Drop:** `art/foes/knowitall.webp` | Drop: `readglasses`
- **Acts:**
  - `Pointer Tap` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Wooden pointer rap.
  - `"Actually..."` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Pedantic correction (`-20% Def` 2t).
  - `"Well, Technically"` (`Racket`, 1.1x, Rec 120, all allies, `[aoe, buff, charge_up]`): Lectures party (`Fatigue` 2t) and grants self `+20% Def` `[buff]` (2t).

#### 40. `popup` | Pop-Up Panic
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 594, Atk 68, Def 44, Spd 94, Pep 0, Pips 4
- **Pet Peeves:** `Clobber`, `Razzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/popup.webp` | Drop: `popcard`
- **Traits:** Starts with strippable `Coiled Paper Spring` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Spring Pop!` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Sudden cardboard lunge.
  - `Jump-Out Scare` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Mental` Spooked (`-20% Atk` 2t).
  - `Big Reveal` (`Clobber`, 1.25x, Rec 120, all allies, `[aoe, charge_up]`): Unfolds full two-page spread slam.

#### 41. `unread` | The Unread
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 1,914, Atk 74, Def 40, Spd 107, Pep 0, Pips 7
- **Pet Peeves:** `Racket`, `Sizzle` | **Resists:** `Clobber`
- **Assets & Story Reward:** `art/foes/unread.webp`, `unread-end.webp` | Story Reward: `Book Coin` (given to Grace, who unlocks the return-cart block on the spot).
- **Mechanics & Kit Checks:**
  - **100-Tick Pushback Check (`Shelved Since 1952` / `THE END`):** Specializes in heavy timeline knockbacks (`Turn Back the Page` = 45-tick push; Phase 2 `THE END` = AoE 35-tick push + `Slow`), directly testing Boppy's `Boppy Speed` pushback immunity, Grace's `Good-Scrunchie Pirouette` (`Poise`) + `NeeDoh Stretch Pass`, and Rose's `Sofa-Cushion Citadel` party pushback block!
  - **`Bookmark Ribbon` Buff & `Panic Boil!` Check:** Wraps itself in `Bookmark Ribbon` (`[guard_stance, buff]` -25% damage taken + `5% HP Mend`, 2t) before winding up `THE END`; broken immediately by **`Panic Boil!`** (`Toasty` + `Racket`), **`Shatter Glitz!`**, or Deedee/Amy buff-strips.
- **Acts:**
  - `Dust Cloud` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Seventy-year shelf dust (`Blind` 1t).
  - `Cover Slam` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Cracked leather binding thud.
  - `Turn Back the Page` (`Racket`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Shoves target **45 ticks** back on the timeline (up to 100-tick round boundary).
  - `Bookmark Ribbon` (`Support`, 0.0x, Rec 80, self, `[guard_stance, buff]`): Enters `Guard Stance` (-25% damage taken) + `5% HP Mend` (2t).
  - `Dead-Quiet Reading Room` (`Racket`, 1.05x, Rec 100, all allies, `[aoe]`): Applies `Fatigue` (2t).
  - `THE END` (`Racket`, 1.35x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 2 (<50% HP) massive book-closing floor shockwave; pushes all unshielded allies back **35 ticks** and applies `Slow` (2t).

---

### Chapter 8: *Feast on Jefferson Park* (`carbarn` / `boiler` - Division Nine Car Barn, LA)

#### 42. `lukewarm` | Lukewarm
- **Role & Row:** `Swarmer` | `Front` (or `Back` behind `wetblanket`) | **Stats:** HP 244, Atk 56, Def 31, Spd 111, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/lukewarm.webp` | Drop: `tepidcoffee`
- **Acts:**
  - `Tepid Slosh` (`Drench`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `Drenched` (2t).
  - `Cold Shoulder` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Forgotten-mug sigh (`Slow` 2t).
  - `Room Temperature` (`Drench`, 1.05x, Rec 120, all allies, `[aoe]`): Stale coffee splash (`Drenched` 2t).

#### 43. `leftover` | Leftover
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 244, Atk 56, Def 31, Spd 111, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Clobber` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/leftover.webp` | Drop: `leftovers`
- **Acts:**
  - `Snap-Lid Flip` (`Clobber`, 0.8x, Rec 80, 1 ally, `[projectile]`): Plastic lid frisbee.
  - `Mystery Tupperware` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): March potluck whiff (`Blind` 1t).
  - `Freezer Burn` (`Clobber`, 1.1x, Rec 120, all allies, `[ground_sweep, aoe]`): Frosty ice-crystal slide (`Slow` 1t).

#### 44. `wetblanket` | Wet Blanket
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 431, Atk 73, Def 41, Spd 101, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Clobber` | **Resists:** `Drench`
- **Assets & Drop:** `art/foes/wetblanket.webp` | Drop: `warmblanket`
- **Acts:**
  - `"Why Bother?"` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `-20% Atk` (2t).
  - `Damp Smother` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Heavy soaked wool drape (`Drenched` 2t).
  - `Dampen Spirits` (`Drench`, 1.15x, Rec 120, all allies, `[aoe, charge_up]`): Wrings cold puddle across party (`Fatigue` + `Drenched` 2t).

#### 45. `thedraft` | The Draft
- **Role & Row:** `Skirmisher` | `Back` (behind Front `leftover`) | **Stats:** HP 300, Atk 69, Def 33, Spd 127, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/thedraft.webp` | Drop: `draftstopper`
- **Traits:** Starts with strippable `Crosswind` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `Pilot-Light Gust` (`Clobber`, 0.8x, Rec 80, 1 ally, `[projectile]`): Chilly draft nip; strips 1 `Sizzle`/shield buff if unguarded.
  - `Hallway Chill` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Applies `Slow` (2t).
  - `Slam the Door!` (`Clobber`, 1.15x, Rec 120, all allies, `[aoe]`): Rattling wind tunnel blast.

#### 46. `pickyeater` | The Picky Eater
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 675, Atk 76, Def 49, Spd 95, Pep 0, Pips 4
- **Pet Peeves:** `Racket`, `Drench` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/pickyeater.webp` | Drop: `hotsauce`
- **Traits:** Starts in `Tin Lunchbox Lid` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `"EW, It Touched!"` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Scornful lunch rejection (`-15% Def` 2t).
  - `Lid Snap` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Metal latch bite.
  - `Push It Away` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Shoves tray back; inflicts `-1 Pep`, `Fatigue` (2t), and 20% timeline pushback.

#### 47. `ironbelly` | Old Ironbelly
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 1,850 *(3-Unit Squad Baseline; 2,220 HP if optional 4th-slot Olivia is active)*, Atk 82, Def 45, Spd 108, Pep 0, Pips 7
- **Pet Peeves:** `Drench` | **Resists:** `Sizzle`
- **Assets & Story Reward:** `art/foes/ironbelly.webp`, `ironbelly-end.webp` | Story Reward: `Rosebush Coin` (bakes 40 potluck loaves in post-fight cutscene).
- **Mechanics & Kit Checks (Tuned for 3-Unit `Tom/TNB/Nara` Squad):**
  - **`BROIL` Clay-Shield Synergy:** `Hot Coal` and `BROIL` deal outgoing `Sizzle` damage, which **automatically vitrifies TNB's `Center the Bowl` wet-clay shields into `Fired Glaze`** (reflecting 30% damage right back into Ironbelly!).
  - **`Red-Hot Firebox` Self-`Toasty` -> `Steam Cloud!` Check:** Whenever Ironbelly fires `BROIL` or `Full Furnace`, its cast-iron grate glows with **`Red-Hot Firebox` (self-`Toasty` Prime for 2 turns)**. Answering with `Drench` (Tom's `Starter Splash` or Nara's `Startled Water-Bowl Flip` / `Jittery Shake-It-Off`) detonates **`Steam Cloud!`** (`-2 Pips` + `-1 Pet Peeve Pip` = **-3 Pips** and `Blind` on Ironbelly's heavy `Belly Bump`!).
- **Acts:**
  - `Soot Puff` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Chimney ash (`Blind` 1t).
  - `Belly Bump` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee, ground_sweep]`): Heavy cast-iron stove check.
  - `Hot Coal` (`Sizzle`, 1.0x, Rec 100, 1 ally, `[projectile]`): Spits glowing ember (`Toasty` 2t; vitrifies TNB clay shield).
  - `BROIL` (`Sizzle`, 1.25x, Rec 120, all allies, `[aoe, charge_up]`): Roaring oven wave (`Toasty` 2t on allies + self-`Toasty` 2t; vitrifies all active TNB clay shields into `Fired Glaze`!).
  - `Full Furnace` (`Sizzle`, 1.35x, Rec 120, all allies, `[aoe, buff, charge_up]`): Phase 2 (<50% HP) 1912 night-shift blaze + self-`Toasty` (2t) + grants self `+20% Atk` `[buff]` (2t).

---

### Chapter 9: *The Moon Club Invitation* (`moonclub` / `dome` - The Moon Club, LI)

#### 48. `velvetrope` | Velvet Rope
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 273, Atk 63, Def 34, Spd 112, Pep 0, Pips 0
- **Pet Peeves:** `Clobber`, `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/velvetrope.webp` | Drop: `velvetbow`
- **Acts:**
  - `Rope Lash` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Braided velvet cord snap.
  - `"Not On The List"` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Pushes target 15% back on timeline.
  - `Members Only` (`Racket`, 1.05x, Rec 120, all allies, `[aoe, buff]`): Grants Front foes `VIP Cord` (`+15% Def` `[buff]` 2t).

#### 49. `stuffedshirt` | Stuffed Shirt
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 483, Atk 81, Def 44, Spd 102, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Drench` | **Resists:** `Razzle`
- **Assets & Drop:** `art/foes/stuffedshirt.webp` | Drop: `cufflink`
- **Acts:**
  - `"Hmph."` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Snooty tuxedo scoff (`-15% Def` 2t).
  - `Stiff Arm` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Starched cuff shove.
  - `"How Gauche!"` (`Racket`, 1.15x, Rec 120, all allies, `[aoe, charge_up]`): Scandalized ballroom gasp (`-15% Atk` 2t).

#### 50. `coathanger` | The Hanger-On
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 483, Atk 81, Def 44, Spd 102, Pep 0, Pips 0
- **Pet Peeves:** `Clobber`, `Drench` | **Resists:** `Sizzle`
- **Assets & Drop:** `art/foes/coathanger.webp` | Drop: `coatticket`
- **Acts:**
  - `Wire Hook` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Collar tug.
  - `1971 Coat Cling` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Heavy purple coat wrap (`Slow` 2t).
  - `Hang On Tight` (`Clobber`, 1.15x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Sweeping coat-rack tangle (`Slow` 1t).

#### 51. `soreloser` | The Sore Loser
- **Role & Row:** `Hexer` | `Back` (behind Front `stuffedshirt`) | **Stats:** HP 357, Atk 70, Def 38, Spd 112, Pep 0, Pips 0
- **Pet Peeves:** `Sizzle`, `Razzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/soreloser.webp` | Drop: `luckychip`
- **Acts:**
  - `Card Flick` (`Clobber`, 0.8x, Rec 80, 1 ally, `[projectile]`): Sharp playing-card edge (`Bleed` 2t).
  - `"Cheater!"` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Accusatory jester shout (`Mental` taunt 1t).
  - `Fifty-Two Pickup` (`Clobber`, 1.15x, Rec 120, all allies, `[projectile, aoe]`): Scatters deck; inflicts `-1 Pep` and `Fatigue` (2t) on primary target.

#### 52. `wallflower` | The Wallflower
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 756, Atk 85, Def 52, Spd 96, Pep 0, Pips 4
- **Pet Peeves:** `Razzle`, `Sizzle` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/wallflower.webp` | Drop: `corsage`
- **Traits:** Starts with strippable `Wall Hug` `[buff]` (`+20% Evasion`, 2t).
- **Acts:**
  - `"Sorry!"` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Terracotta pot bump.
  - `"Do Not Look At Me"` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile, buff]`): Applies `Blind` (1t) and refreshes `+20% Evasion` (2t).
  - `Petal Storm` (`Razzle`, 1.2x, Rec 120, all allies, `[projectile, aoe, charge_up]`): Shimmering pink-petal whirlwind (`Dazzled` visual / `-15% Spd` 1t).

#### 53. `mirrorball` | The Mirrorball
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 2,436, Atk 92, Def 48, Spd 109, Pep 0, Pips 7
- **Pet Peeves:** `Racket`, `Clobber` | **Resists:** `Razzle`
- **Assets & Story Reward:** `art/foes/mirrorball.webp`, `mirrorball-end.webp` | Story Reward: `Piano Coin` + Ch. 9 Meteor Entity warning (*"Color wants to move. Only the cold rock in the dark wants things kept on a shelf forever"*). Legacy `deedee.crisp` reference completely purged.
- **Mechanics & Kit Checks:**
  - **High-Evasion Facet Spin + Self-`Dazzled` Detonation Check:** Starts battle with `Facet Spin` `[buff]` (`+25% Evasion`, refreshed via `Facet Dazzle`). Whenever Mirrorball fires `Facet Dazzle` or `Spotlight Solo`, her own 1,000-facet glare leaves her **self-`Dazzled` (2t)**! Answering with her `Clobber` Pet Peeve triggers **`Shatter Glitz!`** (stripping `Facet Spin` + `-2 Pips`), while answering with her `Racket` Pet Peeve triggers **`Sensory Overload!`** (`-25%` outgoing damage + `-2 Pips`), and Deedee's `Windex Spritz` / `"Hand Me My Glasses" Scrub` (`Fifty-Year Dust Tsunami`) scrubs her shine clean.
- **Acts:**
  - `Chain Swing` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee, ground_sweep]`): Swooping low ceiling-chain arc.
  - `Facet Dazzle` (`Razzle`, 1.0x, Rec 100, 1 ally, `[projectile, buff]`): Applies `Blind` (1t), refreshes `Facet Spin` (`+25% Evasion` `[buff]` 2t), and leaves self `Dazzled` (2t).
  - `Glitter Beam` (`Razzle`, 1.1x, Rec 100, all allies, `[projectile, aoe]`): Sweeping disco-dome prisms.
  - `Spotlight Solo` (`Razzle`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Concentrates 1,000 mirror facets onto 1 target (leaves self `Dazzled` 2t).
  - `LAST DANCE` (`Razzle`, 1.35x, Rec 120, all allies, `[aoe, charge_up]`): Phase 2 (<50% HP) full-dome 1971 finale burst.

---

### Chapter 10: *Boarding Group Zero* (`terminal` - Long Island Regional Airport, Gate B4, LI)

#### 54. `carryon` | Carry-On
- **Role & Row:** `Swarmer` | `Front` | **Stats:** HP 318, Atk 71, Def 37, Spd 113, Pep 0, Pips 0
- **Pet Peeves:** `Razzle`, `Drench` | **Resists:** None
- **Assets & Drop:** `art/foes/carryon.webp` | Drop: `pretzels`
- **Acts:**
  - `Four-Wheel Roll` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee, ground_sweep]`): Toe-crushing caster roll.
  - `Overhead Bin Drop` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Shifts in flight (`-15% Def` 2t).
  - `Sizer Frame Check` (`Clobber`, 1.1x, Rec 120, all allies, `[ground_sweep, aoe]`): Rattles down the boarding lane.

#### 55. `jetlag` | Jet Lag
- **Role & Row:** `Hexer` | `Back` (behind Front `carryon`, `longline`, or `armresthog`) | **Stats:** HP 416, Atk 80, Def 41, Spd 113, Pep 0, Pips 0
- **Pet Peeves:** `Clobber`, `Sizzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/jetlag.webp` | Drop: `coldbrew`
- **Acts:**
  - `Contagious Yawn` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `Fatigue` (2t).
  - `3 AM Glare` (`Razzle`, 1.0x, Rec 100, 1 ally, `[projectile]`): Phone-screen flash in dark cabin (`Blind` 1t).
  - `Three-Hour Time Diff` (`Racket`, 1.1x, Rec 120, all allies, `[aoe, charge_up]`): Applies `Slow` (2t).

#### 56. `longline` | The Long Line
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 564, Atk 92, Def 48, Spd 103, Pep 0, Pips 0
- **Pet Peeves:** `Clobber`, `Razzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/longline.webp` | Drop: `prioritytag`
- **Acts:**
  - `Retractable Belt Snap` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Blue nylon belt sting.
  - `"Step Back Behind Yellow"` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Pushes target 20% back on timeline.
  - `Random Screening` (`Racket`, 1.15x, Rec 120, all allies, `[aoe, charge_up]`): Shoes-off TSA delay (`Slow` 2t).

#### 57. `unclaimed` | The Unclaimed
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 564, Atk 92, Def 48, Spd 103, Pep 0, Pips 0
- **Pet Peeves:** `Drench`, `Sizzle` | **Resists:** `Clobber`
- **Assets & Drop:** `art/foes/unclaimed.webp` | Drop: `bagtag`
- **Acts:**
  - `Carousel Spin` (`Racket`, 0.8x, Rec 80, 1 ally, `[ground_sweep]`): Dizzying belt loop (`-15%` accuracy 1t).
  - `Overweight Trunk` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Brass-latched leather thud.
  - `Excess Baggage` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Crushing 70-lb suitcase drop; inflicts `Fatigue` (2t) and `-1 Pep`.

#### 58. `armresthog` | The Armrest Hog
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 882, Atk 97, Def 58, Spd 97, Pep 0, Pips 4
- **Pet Peeves:** `Racket`, `Razzle` | **Resists:** `Sizzle`
- **Assets & Drop:** `art/foes/armresthog.webp` | Drop: `eyemask`
- **Traits:** Starts in `Both Armrests Claimed` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `Middle-Seat Elbow` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Crowds space (`-20% Atk` 2t).
  - `Neck-Pillow Squeeze` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Smug plushie shove.
  - `Full Recline` (`Clobber`, 1.25x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Crushes legroom across the row (`Fatigue` 2t).

#### 59. `lastcall` | The Last Call
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 2,842, Atk 105, Def 53, Spd 110, Pep 0, Pips 7
- **Pet Peeves:** `Drench`, `Sizzle` | **Resists:** `Racket`
- **Assets & Story Reward:** `art/foes/lastcall.webp`, `lastcall-end.webp` | Location: `terminal` (**Long Island Regional Airport, Gate B4**; legacy `gatezero` and "Flight Zero" lore purged) | Story Reward: `Airliner Coin`.
- **Mechanics & Kit Checks (Single-Target Boarding-Order Enforcer):**
  - **`Boarding Group Nine` -> `GATE CLOSED` Intercept Check:** Stamps a non-tank ally with `Boarding Group Nine` (`[charge_up, buff]` granting self `+20% Atk`, 1t) and follows with `GATE CLOSED`, a 1.5x single-target iron jet-bridge slam that locks that character's Pocket Vibe skills (2t) unless intercepted by Tom's `Suite Door Slide` / `Zone One Blockade` or interrupted!
- **Acts:**
  - `DELAYED` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Clattering split-flaps push target **25 ticks** back on timeline.
  - `Split-Flap Slap` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Mechanical spider-leg strike.
  - `Boarding Group Nine` (`Support`, 0.0x, Rec 80, 1 non-tank ally, `[charge_up, buff]`): Marks target for `GATE CLOSED` next turn and grants self `+20% Atk` `[buff]` (1t).
  - `PA Static` (`Razzle`, 1.05x, Rec 100, all allies, `[projectile, aoe]`): Crackling Gate B4 speaker burst.
  - `GATE CLOSED` (`Clobber`, 1.5x, Rec 120, marked ally, `[melee, charge_up]`): Heavy jet-bridge slam; locks target's Pocket Vibe (2t) unless Tom intercepts (`-35%` damage, stamps `Upgrade Certificate`, prevents lock) or Broken.
  - `FINAL BOARDING` (`Razzle`, 1.35x, Rec 120, all allies, `[aoe, charge_up]`): Phase 2 (<50% HP) departure-board strobe surge (`Fatigue` 2t).

---

### Chapter 11: *Part 2 Start - LAX Diversion Chaos* (`concourse` - LAX Diversion Concourse, LA)

*(Note: All legacy `infinity` / `Terminal Infinity` / `Layover` lore is permanently cut. These encounters represent chaotic midnight flight-diversion pandemonium at LAX after Long Island is domed.)*

#### 60. `lostluggage` | Lost Luggage
- **Role & Row:** `Bruiser` | `Front` | **Stats:** HP 638, Atk 101, Def 51, Spd 104, Pep 0, Pips 0
- **Pet Peeves:** `Clobber`, `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/lostluggage.webp` | Drop: `pretzels`
- **Acts:**
  - `Handle Swing` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Telescoping handle whack.
  - `Caster Wheelie` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee, ground_sweep]`): Teal hard-shell ram.
  - `Frantic Rummage` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Flings mismatched socks (`-20% Def` 2t).

#### 61. `redeye` | Red-Eye
- **Role & Row:** `Hexer` | `Back` (behind Front `lostluggage` or `standbysprite`) | **Stats:** HP 472, Atk 87, Def 44, Spd 116, Pep 0, Pips 0
- **Pet Peeves:** `Razzle`, `Sizzle` | **Resists:** `Racket`
- **Assets & Drop:** `art/foes/redeye.webp` | Drop: `coldbrew`
- **Acts:**
  - `Sleepy Yawn` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Applies `Fatigue` (2t).
  - `Midnight Contrail` (`Razzle`, 1.0x, Rec 100, 1 ally, `[projectile]`): Wingtip strobe (`Blind` 1t).
  - `Cabin Lights Dim` (`Racket`, 1.1x, Rec 120, all allies, `[aoe, charge_up]`): Applies `Slow` (2t) across party.

#### 62. `standbysprite` | Standby Sprite
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 999, Atk 106, Def 61, Spd 99, Pep 0, Pips 4
- **Pet Peeves:** `Drench`, `Clobber` | **Resists:** None
- **Assets & Drop:** `art/foes/standbysprite.webp` | Drop: `prioritytag`
- **Traits:** Starts in `Podium Counter` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `Paddle Swat` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Gate-paddle smack.
  - `Seat Seventeen` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Bumps target to middle row (`-15% Spd` 2t).
  - `Waitlist Bump` (`Racket`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Pushes target **30 ticks** back on timeline + `Fatigue` (2t).

#### 63. `finalcall` | FINAL CALL
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 3,219, Atk 115, Def 56, Spd 112, Pep 0, Pips 7
- **Pet Peeves:** `Razzle`, `Racket` | **Resists:** `Clobber`
- **Assets & Story Context:** `art/foes/finalcall.webp`, `finalcall-end.webp` | Location: `concourse` (**LAX Diversion Terminal Concourse**; panicked diverted LI/JFK arrivals board).
- **Mechanics & Kit Checks (Midnight LAX Row- & Timeline-Scrambler):**
  - **`Gate Change: Terminal 4 to B!` Row & Timeline Scramble:** Unlike Gate B4's orderly `lastcall`, LAX's panicked `finalcall` scrambles **2 allies' Front/Back row positions** and swaps their timeline slots while leaving itself self-`Dazzled` (1t) from flashing red concourse strobes!
  - **`Rebooking Stampede` Adds & Baggage Sweep:** At <=60% HP, summons 1–2 Front `lostluggage` blockers (0 VP) with `Rebooking Frenzy` (`+20% Spd` `[buff]` 2t) and unleashes `Baggage-Claim Avalanche` (`[ground_sweep, aoe]`), rewarding Tom's `Tarmac Porsche Transfer`, Amy's `Classroom Lights-Out Reset` / `Mom-Arm Seatbelt Stop`, and Grace's `Airborne` / `NeeDoh Stretch Pass`.
- **Acts:**
  - `Gate Change: Terminal 4 to B!` (`Racket`, 0.85x, Rec 80, 2 allies, `[projectile]`): Swaps 2 allies between `Front` and `Back` rows, pushes them **20 ticks** back, and leaves self `Dazzled` (1t).
  - `Rebooking Stampede` (`Support`, 0.0x, Rec 80, all foes, `[buff]`): Used at <=60% HP; summons 1–2 Front `lostluggage` adds (0 VP) and grants all foes `+20% Spd` `[buff]` (2t).
  - `Concourse Strobe Arc` (`Razzle`, 1.05x, Rec 100, all allies, `[projectile, aoe]`): Emergency diversion ticker flare (`Blind` 1t on 1 random ally).
  - `Baggage-Claim Avalanche` (`Clobber`, 1.25x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Cascading mountain of diverted suitcases across the floor (`Slow` 1t).
  - `ALL FLIGHTS CANCELLED` (`Razzle`, 1.35x, Rec 120, all allies, `[aoe, charge_up]`): Phase 2 (<50% HP) full-board red-alert discharge (`-1 Pep` and `Fatigue` 2t).

---

### Chapter 12: *Welcome to Jefferson Park, Girls* (`jpark` - 2nd Ave, LA)

#### 64. `gridlockprime` | Gridlock Prime
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 3,596, Atk 125, Def 60, Spd 113, Pep 0, Pips 7
- **Pet Peeves:** `Drench`, `Racket` | **Resists:** None
- **Assets & Story Reward:** `art/foes/gridlockprime.webp`, `gridlockprime-end.webp` | Location: `jpark` (**Jefferson Park / 2nd Ave**; woken by Julian's Cycle 2 rapid triple-shot that froze Mr. Washington, Doña Carmen, and the Alvarez family; all `Marlowe` / "greying" barks purged) | Story Reward: 3 Neighbor Coins.
- **Mechanics & Kit Checks:**
  - **`Gridlocked Intersection` Guard & Buff-Inversion Check:** Raises `Four-Way Red Light` (`[guard_stance]` -30% damage taken + `+30% Def` & `+25% Atk` `[buff]` 2t) and summons 1 `gridlock` add (scaled to Ch. 12 `Bruiser`: 713 HP, 110 Atk, 55 Def, 105 Spd; 0 VP). Directly showcases Olivia's `"Is This Real?" Fact-Check` (inverting `+30% Def` into `-30% Def`!) and TNB's `Baxter Hill Longboard Express` / `No Car, No Tickets`!
  - **`Overheated Radiator` Self-`Toasty` -> `Steam Cloud!` & `Panic Boil!` Check:** Firing `Exhaust Heatwave` leaves Gridlock Prime in **`Overheated Radiator` (self-`Toasty` Prime for 2t)**, so answering with `Drench` triggers **`Steam Cloud!`** (`-2 Pips` + `-1 Pet Peeve Pip` = **-3 Pips** + `Blind`), or answering with `Racket` triggers **`Panic Boil!`** (instantly dropping `Four-Way Red Light`!).
- **Acts:**
  - `Air-Horn Honk` (`Racket`, 0.8x, Rec 80, 1 ally, `[projectile]`): Rattling transit-bus blast.
  - `No-Signal Merge` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Heavy bumper check (`Slow` 2t).
  - `Exhaust Heatwave` (`Sizzle`, 1.1x, Rec 100, all allies, `[aoe]`): Roaring diesel smog wave (`Toasty` 2t on allies + self-`Toasty` 2t).
  - `Gridlocked Intersection` (`Support`, 0.0x, Rec 80, all foes, `[guard_stance, buff]`): Enters `Guard Stance` + grants `+30% Def` / `+25% Atk` `[buff]` (2t) + calls 1 Ch. 12 `gridlock` (once per phase).
  - `Total Gridlock` (`Clobber`, 1.35x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 2 (<50% HP) multi-lane pileup charge.

---

### Chapter 13: *Under the Orange Sky* (`subtunnel` / `subchamber` - LI Dome Service Tunnel, LI)

#### 65. `hushling` | Hushling
- **Role & Row:** `Hexer` | `Back` (behind Front `signalfault`, `turnstile`, `drillworm`, or `hush9final`) | **Stats:** HP 586, Atk 104, Def 50, Spd 119, Pep 0, Pips 0
- **Pet Peeves:** `Racket`, `Clobber` | **Resists:** None
- **Assets & Drop:** `art/foes/hushling.webp` | Drop: `pretzels`
- **Acts:**
  - `Static Drift` (`Clobber`, 0.8x, Rec 80, 1 ally, `[projectile]`): Speaker-box bump.
  - `Tinny Shush` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Inflicts `Mental` Skill Lock on Target's Pocket Vibe (2t; 2-turn cooldown per unit).
  - `Dead-Channel Hum` (`Racket`, 1.0x, Rec 100, 1 ally, `[projectile]`): Inflicts `Fatigue` (2t) and `-1 Pep`.

#### 66. `signalfault` | Signal Fault
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 1,242, Atk 125, Def 69, Spd 102, Pep 0, Pips 4
- **Pet Peeves:** `Drench`, `Clobber` | **Resists:** None
- **Assets & Drop:** `art/foes/signalfault.webp` | Drop: `coldbrew`
- **Traits:** Starts in `Track-Block Arm` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `Amber Strobe` (`Razzle`, 0.8x, Rec 80, 1 ally, `[projectile]`): Signal flash (`Blind` 1t).
  - `Crossing-Arm Drop` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Striped metal bar smack.
  - `Eleven-Year Red Light` (`Racket`, 1.5x, Rec 120, 1 ally, `[projectile, charge_up]`): Pushes target **30 ticks** back on timeline + `Slow` (2t).

#### 67. `turnstile` | Turnstile Grump
- **Role & Row:** `Bulwark Elite` | `Front` | **Stats:** HP 1,242, Atk 125, Def 69, Spd 102, Pep 0, Pips 4
- **Pet Peeves:** `Clobber`, `Racket` | **Resists:** None
- **Assets & Drop:** `art/foes/turnstile.webp` | Drop: `prioritytag`
- **Traits:** Starts in `Locked Tripod` `[guard_stance]` (-25% damage taken, 2t).
- **Acts:**
  - `Hip Clip` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Sudden steel-bar lock on waist.
  - `Three-Bar Spin` (`Clobber`, 1.0x, Rec 100, 1 ally, `[melee]`): Bruising turnstile whack.
  - `Tap Out!` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Fare-error slam (`-20% Def` 2t).

#### 68. `drillworm` | Dual-Coast Drill Worm
- **Role & Row:** `Boss` (`noRun`) | `Front` | **Stats:** HP 4,002, Atk 136, Def 63, Spd 115, Pep 0, Pips 7
- **Pet Peeves:** `Racket`, `Clobber` | **Resists:** `Drench`
- **Assets & Story Context:** `art/foes/drillworm.webp`, `drillworm-end.webp` | Location: `subchamber` (LI Dome Service Chamber).
- **Mechanics & Kit Checks:**
  - **Wired Relay Link & Justin Showcase:** Starts with (and re-calls via `Relay Call`) 1 armored **`Wired Relay Hushling`** in the `Back` row (**HP 950, Atk 104, Def 60, Spd 115, 3 Composure Pips, 0 VP**), granting Drill Worm `-25%` damage taken while the Relay is unbroken. Breaking or KO'ing the Relay arcs feedback voltage into Drill Worm for **`-2 Composure pips` and `Dazzled` (2t)**! If Justin is in the party, his `"Don't Touch the Copper!" Banner` links both targets so shaving Composure on one shaves the other simultaneously.
- **Acts:**
  - `Bit Grind` (`Clobber`, 0.8x, Rec 80, 1 ally, `[melee]`): Spinning two-tone nose scrape (`Bleed` 2t).
  - `Tunnel Friction Spark` (`Sizzle`, 1.0x, Rec 100, 2 random allies, `[projectile]`): Grinding drill-head sparks (`Toasty` 2t on allies + self-`Toasty` 1t, enabling `Panic Boil!`).
  - `Gravel Spray` (`Clobber`, 1.05x, Rec 100, all allies, `[projectile, aoe]`): Pelts tunnel rubble across party.
  - `Deep Bore` (`Clobber`, 1.5x, Rec 120, 1 ally, `[melee, charge_up]`): Cracks `-20% Def` (2t).
  - `Relay Call` (`Support`, 0.0x, Rec 80, field, `[buff]`): Summons 1 `Wired Relay Hushling` (950 HP, 3 pips) to `Back` row if absent.
  - `Full Bore Cave-In` (`Clobber`, 1.35x, Rec 120, all allies, `[ground_sweep, aoe, charge_up]`): Phase 2 (<50% HP) ceiling-shaking tunnel tremor.

---
