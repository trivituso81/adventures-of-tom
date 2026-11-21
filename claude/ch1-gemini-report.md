# Chapter 1 Verification Report — The Adventures of Tom

### 6.1 Run metadata

| Field | Value | 
| ----- | ----- | 
| Date and time of the run | 2026-11-21, 07:36 AM – 09:50 AM PST | 
| Build chip (name and time, exact) | `build voicepurge221` / `Nov 21, 6:59 AM` | 
| Browser and viewport size | Chrome (in-game Portrait phone layout by default via `L` / rotate toggle; Landscape toggled only for C9, C11, and M-B checks; DevTools window resize blocked by browser policy) | 
| Difficulty | MEDIUM | 
| Reached the end (landed in Los Angeles)? | yes (landed in Los Angeles — Chapter 2 opening at `JEFFERSON PARK` / `Downtown LA`) | 
| Total play time | `1:04` in-game (`TIME 1:04` on landing in Los Angeles; \~2h 14m total QA session including save/load checks) | 

### 6.2 Verdicts (one row per card, in this order)

| Card | Board card | Verdict | What I saw (one or two lines, exact text quoted) | Screenshots | 
| ----- | ----- | ----- | ----- | ----- | 
| C1 | t-hollowtrail-play | FAIL | Leg 1: 4 wrappers, from `"THE SQUARE SHOPS"` gate to top-left bench before Bog Toad; Leg 2: 4 wrappers (Leg 1 cleared), from below top-left bench to middle clearing; Leg 3: blocked pre-boss twice because walking into the middle clearing toward Log Lump triggered Stop 9's pond scene early, and beating Log Lump post-boss gave no Grace line or new wrappers (also no `"Goal: ..."` popups appeared on any leg; Pond Grump changed nothing); Grace's words: `"3 wrappers, let's follow them!"` | `c1_leg1_map`, `c1_leg1_end`, `c1_leg2_map`, `c1_leg3_early_pond_trigger`, `c1_postboss_loglump` | 
| C2 | t-ch1flight | FAIL | Sal said `"Tom! Cab seven is at your service. Where to?"` (`TO THE AIRPORT` / `JUST VISITING`) and `"Los Angeles? You got it."`, faded to `"A PHONE ON THE SEAT"` (`CONTINUE`) with **no** TNB text shown, showed `"CHAPTER 1 COMPLETE"` / `"THE SOUP DUMPLING PROTOCOL"`, then returned inside Long Island Taxi Co. for full goodbyes from Sal, Grace (`"Pie!"`), Rose (`"Bye Tata! Save me the... never mind, pie!"`), Tom, and Deedee (`"Take a sweater, honey. I packed one. It's in the bag."`) before `LEAVING LONG ISLAND` takeoff, `LONG ISLAND > LOS ANGELES` map, and `LOS ANGELES` landing (no cabin seat stage). | `c2_sal_choices`, `c2_phone_no_text`, `c2_ch1_card`, `c2_taxi_goodbyes`, `c2_flight_takeoff`, `c2_flight_map`, `c2_la_landing` | 
| C3 | t-qa-bug12c-play | PASS | Whenever Boppy faced left, looked shocked, or pointed during the kitchen theft scene, his cap read `"Paso Robles"` left-to-right (not mirrored) on both his map sprite and dialogue portrait, with crisp talk-start frames. | `c3_boppy_left`, `c3_boppy_shocked`, `c3_boppy_pointing` | 
| C4 | t-qa-bug08play | PASS | Throughout the entire after-boss scene (including between dialogue lines after Rose's `"BOO!"`), no `"HOLD + SLIDE"` label flashed and top-left `!`, `Menu`, and `Save` stayed off screen, returning immediately when free movement resumed. | `c4_mid1_coin_float`, `c4_mid2_between_lines`, `c4_mid3_coin_overlay`, `c4_post_scene_hud` | 
| C5 | t-qa-coh06play | PASS | Facing the orange cube after the boss (`A · Inspect Orange block`) and pressing A showed only one box spoken by `TOM`: `"Still stuck. The fish got the pan out, but the cube won't budge."` with no other speaker or second box. | `c5_orange_cube_tom` | 
| C6 | t-bug12play | PASS | Tapping the Cookie counter from \~4 steps away and clicking `Menu` before Tom arrived opened `Menu`, stopped Tom's walk immediately, and opened no `"A cookie jar labeled DO NOT..."` box before or after closing; `Save` behaved identically. | `c6_menu_walk_cancel`, `c6_save_walk_cancel` | 
| C7 | t-qa-txt04-play | PASS | Boppy's spot prompt read `"A · Inspect Boppy's fishing spot"` (capital B) and pressing A showed `"A folding chair with a thermos on the seat, a bucket, one bass. Boppy will tell you it was two feet long. It was not."`; `"the"` prompts stayed lowercase (`"A · Inspect the oven"` in Crumb Bakery; `"A · Inspect the other bench"` on Rivituso Row). | `c7_boppys_spot_prompt`, `c7_boppys_spot_text`, `c7_the_oven_prompt`, `c7_the_other_bench_prompt` | 
| C8 | t-qa-bug01play | PASS | After the Stop 11 home scene (`"Alright, time for me to head back to LA. Let's head to Sal's!"`), `!` read `"It's Sunday. Head out the front door. Cab 7 is waiting at the Square."` (did not start with `"Go to"`). | `c8_stop11_questlog` | 
| C9 | t-qa-coh07play | PASS | portrait: 12-cup (3x4) muffin pan with 12 muffins was on the kitchen island on frame 1 before dialogue, lifted over the Big Mudling's head leaving two crumbs, with no pan/muffins left afterward; landscape: same 12-cup pan on frame 1, clean lift leaving crumbs and empty island afterward, with Deedee's head and the island fully visible without edge clipping. | `c9_portrait_frame1`, `c9_portrait_lift`, `c9_portrait_after`, `c9_landscape_frame1`, `c9_landscape_after` | 
| C10 | t-qa-coh03play | PASS | Grey metal folding chair stood cleanly with no wooden bench or pond-edge smear, thermos on seat, bucket on ground to the left, fishing rod leaning on chair back, natural scale and shading next to characters, and `THE BIG ONE` said `"The man in the folding chair. Will he be back?"` | `c10_pre_boss_spot`, `c10_post_boss_spot`, `c10_bigone_chair_line` | 
| C11 | t-itemdefplay | FAIL | items read: `Mud Pie`, `Lily Pad Hat` (landscape), `Pond Hoodie`, `Boppy's Lost Lure`, `Dragonfly Coin` (`KEY ITEM`), `Bark Slab` (`Cookie` unreachable because Deedee stayed in the active party and never stood in her kitchen as a townsperson); `Dragonfly Coin` auto-dismissed mid-fade-in before full opacity, and `Pond Hoodie` (`"Wear it: +18 HP, +4 GRIT, +1 COOL."`) and `Bark Slab` (`"Wear it: +5 POW."`) cite obsolete Battle 2 stats. | `c11_mudpie`, `c11_lilypadhat_landscape`, `c11_pondhoodie`, `c11_boppyslure`, `c11_dragonflycoin_fade`, `c11_barkslab` | 
| C12 | t-qa-bug03-look | FAIL | In The Square (Stop 2), two townspeople stood directly on top of the `SNAIL MAIL` sign (nobody walked onto `KETTLE COTTAGE`'s roof); on Rivituso Row (Stop 3), the brown-haired NPC walked onto the right edge of `Aunt Ellie's House`. | `c12_square_0s_snailmail`, `c12_square_45s`, `c12_row_0s_ellie_edge`, `c12_row_45s` | 
| M-B | t-milestoneb | (ratings) | Q1 5/5 · Q2 4/5 · Q3 4/5 · Q4 5/5 (6 rounds, 0 KOs) · Q5 5/5 · Q6 4/5 · Q7 4/5 | `mb_fight1_portrait`, `mb_fight2_landscape`, `mb_bigone_landscape`, `mb_bigone_break`, `mb_bigone_victory` | 
| A1 | t-wanch1-watch | NOT RUN | Optional Battle Lab check not run because clicking `ADMIN` on the live game was blocked by the browser safety check enforcing the `ADMIN` operating restriction. | n/a | 

#### FAIL Breakdowns (Exact Failed Checkboxes & What Was Seen Instead)

* **Card C1 (`t-hollowtrail-play`):**

  * **Failed expected item 1:** `- [ ] After the Log Lump: Grace says the same line again; **4 new** wrappers lead **east** to **Boppy's fishing spot**. The earlier legs are no longer shown.`

    * **What I saw instead:** On two separate runs (initial run and Save Slot 2 replay), walking into the middle clearing toward Log Lump triggered Stop 9's east-pond cutscene before Log Lump could be fought (with 3 wrappers visible toward the east pond during the cutscene); when Log Lump was fought right after the boss in Stop 10, Grace spoke no line and the 4 ground wrappers behind Tom did not clear or update.

    * **Screenshot:** `c1_leg3_early_pond_trigger`, `c1_postboss_loglump`

  * **Failed expected item 2:** `- [ ] The goal popups match: after leg 1 "Goal: follow the muffin wrappers up to the top left corner...", then "...to the middle of the clearing, to the Log Lump.", then "...east, around the pond, to Boppy's fishing spot."`

    * **What I saw instead:** No on-screen `"Goal: ..."` popup banner appeared after any leg; goals updated silently inside the `!` quest log (`▸ Follow the muffin wrappers up to the top left corner. The Hollow's monsters are awake now.` after Leg 1, and `▸ Follow the wrappers to the middle of the clearing, to the Log Lump.` after Leg 2).

    * **Screenshot:** `c1_leg1_map`, `c1_leg2_map`

* **Card C2 (`t-ch1flight`):**

  * **Failed expected item 1:** `- [ ] The screen fades; a picture of a phone lighting up on the cab seat appears, and it **stays on screen while** TNB's text is shown: hey babe. safe flight. the smog over 2nd ave turned purple this morning. it'll probably blow over.`

    * **What I saw instead:** After Sal said `"Los Angeles? You got it."`, the screen faded to the cab-seat phone illustration captioned `"A PHONE ON THE SEAT"` with only a `CONTINUE` button; TNB's text message never appeared on that screen or anywhere before landing.

    * **Screenshot:** `c2_phone_no_text`

  * **Failed expected item 2:** `- [ ] Then the flight plays straight on: seat, takeoff, map, landing.`

    * **What I saw instead:** After `"CHAPTER 1 COMPLETE"` / `"THE SOUP DUMPLING PROTOCOL"`, the game went back inside Long Island Taxi Co. before starting the flight, and when the flight finally played it showed `LEAVING LONG ISLAND` (takeoff) -> `LONG ISLAND > LOS ANGELES` (map, where Tom spoke `"Lie flat, warm nuts, no sibling clipboards. Why does that feel suspicious?"` at `0H 17M TO GO`) -> `LOS ANGELES` (landing), with no cabin seat shot.

    * **Screenshot:** `c2_taxi_goodbyes`, `c2_flight_takeoff`, `c2_flight_map`, `c2_la_landing`

  * **Failed expected item 3:** `- [ ] **No** dialogue from Grace, Rose or Deedee (no goodbyes) anywhere between TNB's text and the landing. No stop or walk in the Square.`

    * **What I saw instead:** Between the `"CHAPTER 1 COMPLETE"` card and the plane takeoff, a multi-box goodbye scene played inside Long Island Taxi Co. with Sal (`"Airport. You've got the look of a man who packed light."` / `"Girls, back to the house. Your grandmother has pie. That's not a rumor."`), Grace (`"Pie!"`), Rose (`"Bye Tata! Save me the... never mind, pie!"`), Tom (`"Great. I just got outcompeted by pie."` / `"Enjoy it, you two. Save me a slice."`), and Deedee (`"Los Angeles is too bright for me. Everything shines and nobody has a sweater."` / `"Take a sweater, honey. I packed one. It's in the bag."`).

    * **Screenshot:** `c2_taxi_goodbyes`

* **Card C11 (`t-itemdefplay`):**

  * **Failed expected item 1 (Steps / Scope):** `Read at least **five** different banners, including one KEY ITEM (Dragonfly Coin) and the Cookie.`

    * **What I saw instead:** Six banners were captured (`Mud Pie`, `Lily Pad Hat`, `Pond Hoodie`, `Boppy's Lost Lure`, `Dragonfly Coin`, `Bark Slab`), but `Cookie` could not be obtained at Stop 11 or Stop 12 because Deedee remained in Tom's active 4-person party (`Menu > PARTY`) and never stood in her kitchen or on Rivituso Row as a townsperson NPC.

    * **Screenshot:** `c11_stop11_kitchen_no_deedee_npc`

  * **Failed expected item 2:** `- [ ] Then an **IN BATTLE** section and an **IN STORY** section.` and `- [ ] Tap or press A to continue **inside** the card.`

    * **What I saw instead:** On the `Dragonfly Coin` (`KEY ITEM`) banner in the Stop 9 after-boss scene, the card began fading in over the map (showing the dragonfly coin square icon, `Dragonfly Coin`, `KEY ITEM`, and italic `"Gold, stamped with a dragonfly. The Big One gave it to Rose, and Rose is keeping it in her pocket."`) and auto-dismissed mid-fade-in before reaching full opacity or waiting for `Tap or press A to continue`.

    * **Screenshot:** `c11_dragonflycoin_fade`

  * **Failed expected item 3:** `- [ ] Text reads well: no line cut off, nothing overlapping, no placeholder text. For each banner write the item name and say whether each line is clear and whether the jokes land (Tom asked: "Something is wrong if any line is wrong, unclear or not funny (say which item)"). Copy any line you flag word for word.`

    * **What I saw instead (per-banner line & humor audit across all 6 banners read):**

      1. **`Mud Pie` (`RECOVERY ITEM`, Portrait):** Picture in top-left square; italic `"Mostly mud. Some pie. Rose insists."`; `IN BATTLE`: `"Use it: Heals 32 HP. Works outside fights too."`; `IN STORY`: `"None. It's a snack. A good one."`; footer `"The Mudling left a mud pie behind. Rose put it in a pocket."`; `"Tap or press A to continue"` inside card. Clear and funny; jokes land cleanly.

      2. **`Lily Pad Hat` (`KEEPSAKE CHARM`, Landscape):** Picture in left square (briefly blank on first fade-in frame before icon appeared); italic `"Slid off a Bog Toad. Still damp. Grace says it's a crown."`; `IN BATTLE`: `"Wear it: Heals 5% HP each turn."`; `IN STORY`: `"None. It just quietly helps."`; footer `"A lily pad slid off the toad's head. It's a hat now. Grace claimed it instantly."`; `"Tap or press A to continue"` inside card. Clear and funny; fits Grace well.

      3. **`Pond Hoodie` (`OUTFIT`, Portrait) — FLAGGED:** Italic `"The Grump dropped it. It smells like the pond. He wants it back."`, `IN STORY`: `"None. It's for wearing, and it's working."`, and footer `"The Grump left a soggy green hoodie behind. It went in a pocket."` are funny, **but `IN BATTLE` is wrong/unclear for Battle 3** because it names removed Battle 2 stats — exact flagged line: `Wear it: +18 HP, +4 GRIT, +1 COOL.`

      4. **`Boppy's Lost Lure` (`KEEPSAKE CHARM`, Portrait):** Picture in top-left square; italic `"Twenty years in a fish’s lip. Still shiny. Boppy will want to hear about this."`; `IN BATTLE`: `"Wear it: Coins from fights +25%."`; `IN STORY`: `"Bring it home. Boppy's told everyone about the one that got away. For twenty years."`; footer `"Boppy's lost lure fell out of its lip. Twenty years late. Still shiny."`; `"Tap or press A to continue"` inside card. Every line is clear and lands well.

      5. **`Dragonfly Coin` (`KEY ITEM`, Portrait) — FLAGGED:** Italic `"Gold, stamped with a dragonfly. The Big One gave it to Rose, and Rose is keeping it in her pocket."` is clear, **but the banner auto-dismissed mid-fade-in** before `IN BATTLE`, `IN STORY`, and `Tap or press A to continue` could be read on the card.

      6. **`Bark Slab` (`SIGNATURE TOOL`, Portrait) — FLAGGED:** Italic `"Came off a Log Lump. Heavy, mossy, and surprisingly good at stopping things."`, `IN STORY`: `"None. It's for wearing, and it's working."`, and footer `"A slab of bark came loose. Sturdy. It went in a pocket, barely."` read nicely, **but `IN BATTLE` uses an obsolete Battle 2 stat (`POW`) that also contradicts the defensive `"good at stopping things"` description** — exact flagged line: `Wear it: +5 POW.`

    * **Screenshot:** `c11_pondhoodie`, `c11_dragonflycoin_fade`, `c11_barkslab`

* **Card C12 (`t-qa-bug03-look`):**

  * **Failed expected item 1:** `- [ ] Nobody walks onto the **SNAIL MAIL** sign.`

    * **What I saw instead:** During the 1-minute Square watch at Stop 2 (Check 1 / 0s), two townspeople (the brown-haired boy and straw-hat boy) stood directly on top of the `SNAIL MAIL` sign.

    * **Screenshot:** `c12_square_0s_snailmail`

  * **Failed expected item 2:** `- [ ] Nobody walks onto the edge of **Aunt Ellie's House**.`

    * **What I saw instead:** On Rivituso Row at Stop 3 (0s check), the brown-haired NPC walked directly onto the right wall/edge of `Aunt Ellie's House`.

    * **Screenshot:** `c12_row_0s_ellie_edge`

### 6.3 Milestone B fight log

| \# | Fight (enemies) | Where | Rounds | Knock-outs | Minutes | Notes | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| 1 | 3 Mudlings (`Mudling A`, `Mudling B`, `Mudling C` — 60 HP each) | Grump Hollow (gate) | 3 | 0 | \~3.0 | Portrait; Battle 3 tutorial prompts shown; top `TURN` label clipped vertically in Portrait; dropped `Mud Pie` | 
| 2 | Bog Toad (`106 HP`), Skeeter Swarm (`78 HP`, `Jitterflight`) | Grump Hollow (top left) | 3 | 0 | \~2.0 | Landscape check (`2x` speed): `TURN` bar unclipped, right HP/PEP sidebar & command pad crisp; dropped `Lily Pad Hat` | 
| 3 | Pond Grump, Mudling | Grump Hollow (near middle clearing) | 3 | 0 | \~2.0 | Portrait (`2x` speed); smooth Pep build & Drench setups; dropped `Pond Hoodie` | 
| 4 | The Big One (`610 HP`, `6` Composure pips, `Muffin-Tin Crown`) | Grump Hollow (east pond) | 6 | 0 | \~4.0 | Portrait + Round 2 Landscape check; `Full Family Ruckus` (100%), `Wet-Floor Hazard` -> `Hydro-Slip!` Break (`Flustered` cancelled `!! Swamp Chomp` for 0 dmg), `Double Team`; dropped `Boppy's Lost Lure` | 
| 5 | Log Lump (`166 HP`, `4` Composure pips, `Mossy Brace`), Skeeter Swarm (`78 HP`) | Grump Hollow (middle clearing, post-boss) | 3 | 0 | \~2.0 | Portrait (`2x` speed); Guard Stance & Composure pips readable; dropped `Bark Slab` | 

#### Milestone B Ratings & Notes (Q1–Q7)

* **Q1 — Fun & Turn-by-Turn Choice: 5/5.** Every turn offered genuine tactical choices rather than spamming a single button because Basic Actions (`0 Pep`, `+2 Pep`) set up Flavors, Primes, and positioning for Skills (`2–4 Pep`) and Family Ruckus pairs. Against The Big One, pairing Deedee's `Wet-Floor Hazard` / `Windex Spritz` with Grace's `Open-String Violin Screech` (hitting its Racket Pet Peeve) and triggering `Full Family Ruckus` and `Double Team` created satisfying chain reactions instead of repetitive basic attacks.

* **Q2 — Pace & Turn Flow: 4/5.** Normal 3-round encounters (`Mudlings`, `Bog Toad + Skeeter Swarm`, `Pond Grump + Mudling`, `Log Lump + Skeeter Swarm`) wrapped briskly in \~2–3 minutes without dragging, and the `2x` battle speed toggle kept animations snappy. At `1x` speed in the opening gate fight, multi-enemy turn transitions felt slightly measured, whereas `2x` speed hit an ideal rhythm.

* **Q3 — Screen Readability (Portrait & Landscape): 4/5.** In Landscape (checked in `Bog Toad + Skeeter Swarm` and Round 2 of `The Big One`), HP bars, blue Pep pips, the `TURN` bar with `| 2` / `| 3` round dividers and `!!` telegraphs, the 6 square Composure pips, status chips (`CROWN`, `WINDEX`, `MARKED`, `!! SWAMP CHOMP`, `WET FLOOR X2`), and the cross-pad menu were completely legible with zero overlap. In Portrait, everything remained readable except the `TURN` label at the very top edge of the viewport, which was vertically clipped in half (`X-04`).

* **Q4 — The Big One Round Count & Length: 5/5.** Even with `610 HP` in live build `voicepurge221`, The Big One took **exactly 6 rounds** with **0 knock-outs** on a natural unground playthrough—landing squarely inside the 5-to-7-round design target. Breaking all 6 Composure pips in Round 3 via `Wet-Floor Hazard` + `Hydro-Slip!` to cancel `!! Swamp Chomp` into `Flustered` (+35% damage window for `Double Team`) made the boss fight feel dramatic and earned without overstaying its welcome.

* **Q5 — Character Voice in Moves: 5/5.** Every kit felt unmistakably tailored to its owner: Tom's `Lounge Pass Flex` (`EYES ON ME` aggro) and `Controller Toss` fit his Frequent Flier / Gamer Geek personality, Grace's `Soup-Dumpling Squeeze` and `Open-String Violin Screech` captured her squishy-obsessed craft/music energy, Rose's `Lamb-Tuck Ankle Tackle` and `"Give Lamby Back!"` boomerang follow-up felt playfully six-year-old, and Deedee's `Windex Spritz` and `Wet-Floor Hazard` nailed her neat-freak matriarch persona. None of the moves felt out of character.

* **Q6 — First-Fight Tutorial Clarity: 4/5.** The gate fight against the 3 Mudlings cleanly explained the core economy in two short callouts (`"Tap a Skill to use it. Tap the i to see what it does."` and `"Tom's turn. ▲ BASIC is free and gives +2 Pep. Skills (▶) spend Pep, and everyone starts with 4."`), and The Big One added a clear Composure tooltip (`6 OF 6 Composure`). Only `BAG Not YET` appeared without a brief note explaining when bag items unlock, though `i` inspection covered everything else.

* **Q7 — Battle Bugs & Mechanical Stability: 4/5.** Across all five Chapter 1 fights, zero softlocks, missing turns, stuck menus, or nonsensical damage/Pep calculations occurred—turn order, round dividers, Composure Breaks, `Flustered` telegraph cancellation, and `Rank Up` rewards at Lv 2 all resolved cleanly. The only battle-adjacent defect is that dropped equipment cards (`Pond Hoodie`, `Bark Slab`, and `Boppy's Cap`) still display legacy Battle 2 stat names (`GRIT`, `COOL`, `POW`) instead of Battle 3 stats.

### 6.4 Quest log texts seen

| Stop | Exact ! text | 
| ----- | ----- | 
| Stop 2 (The Square, after opening) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Go to Deedee and Boppy's house. Rivituso Row, south of the Square.` | 
| Stop 3 (Rivituso Row, after Amy's window scene) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Go to Deedee and Boppy's house. Rivituso Row, south of the Square.` | 
| Stop 4 (Deedee and Boppy's House, after theft scene) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Follow the thief into Grump Hollow, north of the Square.` | 
| Stop 5 (Grump Hollow, after 3-Mudling gate fight) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Follow the muffin wrappers up to the top left corner. The Hollow's monsters are awake now.` | 
| Stop 6 (Grump Hollow, after Bog Toad fight) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Follow the wrappers to the middle of the clearing, to the Log Lump.` | 
| Stop 10 (Grump Hollow, after The Big One) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Take the pan home to Rivituso Row.` | 
| Stop 11 (Deedee and Boppy's House, after home scene) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ It's Sunday. Head out the front door. Cab 7 is waiting at the Square.` | 
| Stop 12 (Rivituso Row, after Grace's pencil scene) | `CHAPTER 1: THE SOUP DUMPLING PROTOCOL` / `▸ Go to Cab 7, at the Square. Talk to Sal.` | 
| Stop 13 (Long Island Taxi Co., before talking to Sal) | `CHAPTER I: THE SOUP DUMPLING PROTOCOL` / `▶ Go to Cab 7, at the Square. Talk to Sal.` | 

## 7. Other issues

| ID | Severity (P0 softlock or crash, P1 wrong or broken, P2 cosmetic) | Where (map and moment) | What I saw | Screenshot | 
| ----- | ----- | ----- | ----- | ----- | 
| X-01 | P2 cosmetic | The Square (Stop 2 free movement) | A brown-haired boy NPC walked onto the snail weathervane on top of the `SNAIL MAIL` building roof. | `c12_square_weathervane` | 
| X-02 | P2 cosmetic | The Square (Stop 2 free movement) | A purple-haired NPC walked onto the `SCHOOL` sign plaque. | `c12_square_check5` | 
| X-03 | P1 wrong or broken | Deedee and Boppy's House (Stop 4 in-game Save modal) | Clicking `LOAD IT?` on Save Slot 1 and Save Slot 2 inside the in-game `Save` modal did not reload the saved state on repeat attempts. | `x03_save_loadit` | 
| X-04 | P2 cosmetic | Grump Hollow (Stop 5 gate battle in Portrait) | The `TURN` label at the top edge of the Battle 3 turn bar is vertically clipped in half in Portrait mode. | `mb_fight1_portrait` | 
| X-05 | P1 wrong or broken | Grump Hollow (Stops 5 and 6 after Mudling and Bog Toad fights) | Grace says `"3 wrappers, let's follow them!"` while 4 muffin wrappers lie on the ground. | `c1_leg1_map` | 
| X-06 | P1 wrong or broken | Grump Hollow (Stop 7 / Stop 9 middle clearing) | Walking into the middle clearing toward Log Lump triggers Stop 9's Boppy's fishing spot cutscene before Log Lump can be engaged. | `c1_leg3_early_pond_trigger` | 
| X-07 | P1 wrong or broken | Deedee and Boppy's House (Stop 11 `Menu > ITEMS`) | `Boppy's Cap` displays `"Keepsake Charm · GRIT +10%"` in `Menu > ITEMS` using the removed `GRIT` stat name. | `x07_boppys_cap_grit` | 
