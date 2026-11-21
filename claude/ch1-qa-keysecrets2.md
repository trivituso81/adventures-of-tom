# Chapter 1 QA report (build keysecrets2): check against main

Tom (2026-11-20 19:05): "assess this bug report, ensure the bug/improvement is valid, and add each one to the kanban board". Checked on main 2026-11-20 evening (after reports-2026-11-20). The report itself follows below, unchanged.

| Item | Verdict | Card |
|---|---|---|
| BUG-01 | Valid, confirmed in code (lowercase "it's" slips past the gem-bug06 check) | c-qa-bug01 |
| BUG-02 | Layout valid; the pictures are covered by t-itembannerart-pics | c-qa-bug02 |
| BUG-03 | Valid on screen, not reproduced | c-qa-bug03 |
| BUG-04 | Row props valid on screen; pan part to recheck (scene rewritten) | c-qa-bug04 |
| BUG-05 | Valid in code, old battle: check at stage 15 | c-qa-battle2 |
| BUG-06 | Valid on screen, old battle: check at stage 15 | c-qa-battle2 |
| BUG-07 | Valid on screen | c-qa-bug07 |
| BUG-08 | Valid on screen, gem-bug10 did not see it: reproduce first | c-qa-bug08 |
| BUG-09 | Valid on screen, old battle: check at stage 15 | c-qa-battle2 |
| BUG-10 | Valid in code, old battle: check at stage 15 | c-qa-battle2 |
| BUG-11 | Sign margins valid; the "slider" by SCHOOL is the locked fence, report on c-reports-7 | c-qa-bug11 |
| BUG-12 | (a), (b) valid on screen; (c) cap lettering is art | c-qa-bug12, c-qa-bug12c |
| COH-01 | Valid, confirmed in code (frog text on a fish) | c-qa-coh01 |
| COH-02 | Valid, confirmed in code | c-qa-coh02 |
| COH-03 | Valid, confirmed (chair line, bench prop); canon keeps the chair line | c-qa-coh03 |
| COH-04 | Valid, confirmed (follower line used everywhere) | c-qa-coh04 |
| COH-05 | Valid, confirmed (pond backdrop is the fallback) | c-qa-coh05 |
| COH-06 | Cube re-look valid; pan toast not needed (not a bag item, scene shows the pan) | c-qa-coh06 |
| COH-07 | Valid on screen, may predate the heist redo: recheck | c-qa-coh07 |
| COH-08 | Not added: the code queues Grace's then Rose's banner, each held until dismissed; the suggested combined banner goes against Tom's rule (partybanner1: never combined) | none |
| COH-09 | Valid in code, old battle: check at stage 15 | c-qa-battle2 |
| TXT-01 | Not added: Tom chose this line himself (t-gem-polish06, "i like him throwing in boss knowledge") | none |
| TXT-02 | Not added: the game spells grey everywhere (65 uses, a story motif; canon also says colour) and rewording a voiced line silences its clip | none |
| TXT-03 | Valid on screen, cause not found yet | c-qa-txt03 |
| TXT-04 | Valid, confirmed in code (draw.js lowercases every name) | c-qa-txt04 |
| TXT-05 | Not added: Sunday Dinner and Sunday Roast Spread are two different moves, and a Hot Dish is an upgraded Warm Crust; the text is right | none |

Old battle items: chapter 1 still runs the old battle, which is replaced at stage 15, not fixed (c-gem-pillar-hp), so they are one checklist card for that stage.

---

# Chapter 1 Playtest & QA Audit Report — *The Adventures of Tom*

## Build & Run Metadata

| Field | Value |
| :--- | :--- |
| **Live Deployment** | [The Adventures of Tom](https://trivituso81.github.io/adventures-of-tom/) (`↻ RELOAD` clicked and verified on Welcome Screen) |
| **Build Label & Timestamp** | `build keysecrets2` · `Nov 20, 1:50 PM` |
| **Chapter Tested** | `CH 1: The Soup Dumpling Protocol` (**New Game** → **`CHAPTER 1 COMPLETE`**) |
| **Difficulty & Options** | **Medium** (`GRACE` — *"Classic, the standard game"*); **Rose Mode** `OFF`; Dialogue **`AUTO OFF`** throughout (two-tap advancement) |
| **Movement & Controls** | Passed — 100% of overworld navigation completed via tap-to-walk and on-screen D-pad (`HOLD + SLIDE`); physical keyboard arrow keys were never required |
| **Completion Status** | **100% Complete (`CHAPTER 1 COMPLETE`)** — Zero softlocks, zero party KOs (`Lv 2`, `94/100 XP`, `115 Pocket Coins`, `12` inventory items audited) |

## Section 1: Master Issue & Coherence Tracker

### 1.1 Gameplay, Softlock, Asset, Collision & UI/UX Bugs

| ID | Severity | Location | Issue Observed | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | High | `Deedee and Boppy's House` (`[!]` Quest Log After Return Scene) | After completing the post-boss return scene inside `Deedee and Boppy's House`, the active Quest Log (`[!]`) objective concatenates `"Go to "` directly onto a sentence starting with `"It's Sunday"`: `"► Go to it's Sunday. Head out the front door. Cab 7 is waiting at the Square."` | Strip or bypass the automatic `"Go to "` verb prefix when an objective string already begins with a complete sentence (`"It's Sunday. Head out the front door. Cab 7 is waiting at the Square."`). |
| **BUG-02** | Medium | Overworld Item Pickups (`Boppy's Pepper`, `Boppy's Cap`, `Mud Pie`, `Dragonfly Coin`) | On overworld reward banners, the item icon renders tiny in the upper-left corner while the large right-side circular frame renders blank (only a faint horizontal line near the bottom; `Got Dragonfly Coin!` shows no coin graphic inside the gold circle), `"Tap or press A to continue"` slightly overlaps the bottom border (`Got Mud Pie!`), and overworld `[...]` speech bubbles bleed behind the translucent card. | Center and scale the acquired item's artwork inside the right-hand circular frame (or hide the empty portrait circle on item-only banners), add bottom card padding below the prompt, and hide overworld speech bubbles while modal banners are open. |
| **BUG-03** | Medium | `The Square`, `Rivituso Row` & `Deedee and Boppy's House` (NPC Collision & Z-Sorting) | Multiple NPCs violate walk-mesh or depth-sorting bounds: in `The Square`, a boy in green walks onto the `SNAIL MAIL` sign/roof and a straw-hat NPC walks across `KETTLE COTTAGE`'s roof/chimney; in `Rivituso Row`, a boy NPC walks over the right roof/wall edge of `Aunt Ellie's House` and an NPC on the left stands on top of the `CATTAIL PIER` signpost/wall; inside `Deedee and Boppy's House`, Boppy's feet render over the interior railing/plant on the right. | Tighten NPC wander-bounds and collision masks around building footprints, walls, and signposts in `town` and `row`, and adjust Y-sort baseline anchors for interior foreground props in `grands`. |
| **BUG-04** | Medium | `Rivituso Row` & `Grump Hollow` (Cutscene Prop Layering) | In `Rivituso Row`, green/brown horizontal bar/planter sprite artifacts float at the `GREGORI` steps (overlapping Tom's face during the cutscene) and beneath the `CATTAIL PIER` sign; in `Grump Hollow` post-boss cutscene Lines 1–3, the 12-cup muffin pan floats behind Tom's head/hand before snapping onto the dirt path on Line 4. | Fix prop coordinates and Z-order layers on `Rivituso Row`, and keep the 12-cup pan hidden (or anchored to The Big One) until Line 4 in `Grump Hollow`. |
| **BUG-05** | Medium | Battle UI (`BAG 8 ITEMS` Counter Mismatch) | Before obtaining `Mud Pie`, the battle `BAG` button displays `BAG 8 ITEMS` (counting non-consumable keepsakes, charms, and outfits), yet opening `BAG` in battle shows **zero** usable items—only `Run: Back away slowly` and `Back B / Esc`. | Count only battle-usable consumables in the combat `BAG` counter (e.g., `BAG 0 ITEMS` or hiding the item count when only keepsakes/gear are held). |
| **BUG-06** | Medium | Battle UI (Status Badges & Floating Callout Clipping/Overlap) | Multiple combat UI badges collide or clip: `GOOFED` + `STUN` and `STAGGER` + `STUN` overlap directly on top of one another above `The Big One`'s head; floating `"STUN!"` clips at the upper edge of the battle canvas; `"CRACK! 6"` overlaps `"UGH."` in regular encounters; and dual party buffs on Tom/Grace truncate into `GUAR TUCK`, `TUCKI` / `GUAR`, and `GUA TUC` next to `Lv1`. | Offset multiple enemy status pills so they never stack on the same coordinates, clamp floating combat callouts within top viewport margins, stagger multi-line hit text, and widen or iconify party status badges. |
| **BUG-07** | Medium | `Menu > STAMPS` (Grace Skill Button Truncation) | On Grace's `STAMPS` card (`Influencer Cleric`), the skill button label `"Welcome Back to My Channel"` is clipped at the right edge to `"Welcome Back to My Chan"`. | Allow two-line wrapping, slightly reduce font size on long Stampcard labels, or widen the Stampcard node button container so `"Channel"` renders in full. |
| **BUG-08** | Low | `Grump Hollow` Cutscenes & `CHAPTER 1 COMPLETE` Screen (HUD Bleed-Through) | (a) Between lines in the post-boss `Grump Hollow` cutscene, the overworld `HOLD + SLIDE` D-pad control flashes for 1 frame; (b) top-left HUD buttons remain active during cutscenes, and tapping `[!]` mid-cutscene reveals `HOLD + SLIDE` and lets roaming monsters move in the background; (c) on the final `CHAPTER 1 COMPLETE` screen, the top-left HUD icons (`[!]`, Menu/Phone with orange dot, Save) and bottom-right `HOLD + SLIDE` indicator remain visible over the end card. | Hide all overworld HUD controls (`[!]`, Menu, Save, `HOLD + SLIDE`) continuously from cutscene start through cutscene end and on chapter-complete title cards, and pause background entities whenever a modal opens. |
| **BUG-09** | Low | Battle `VICTORY` Modal (Scrollbar & `"UP +"` Border Bleed) | Across all Chapter 1 fights (`Mudling`, `The Big One`, `Skeeter Swarm`, `Log Lump`), the `VICTORY` modal shows an unnecessary horizontal scrollbar along the bottom, and `"UP +"` level-up text peeks out from behind the right border of `The Big One`'s Victory card. | Set `overflow-x: hidden` with proper internal width/padding on the `VICTORY` modal and constrain level-up callouts inside the card frame. |
| **BUG-10** | Low | Battle UI Prompts & Button Padding (`RASPBERRY`, `DEFEND`, `INSPECT`, Tombo Card Icon) | (a) Battle log prints `Rose's RASPBERRY ( ► )` even though `WARMTH` sits on the left (`◄`); (b) `DEFEND` prompts `"Tap an enemy or a name..."` despite guarding an ally; (c) battle prompt says `"B to Inspect."` while `INSPECT` is a center pad button; (d) `TOM + ROSE · 25% HEART` touches the right-edge card icon on `Double-Decker Airplane`. | Flip the `RASPBERRY` hint arrow to `◄`, update `DEFEND` targeting copy to `"Tap an ally..."`, match the `Inspect` hint to its actual control binding, and add right-side text padding on Tombo buttons. |
| **BUG-11** | Low | `The Square` & `Rivituso Row` (Viewport Clipping & Slider Artifact) | In `The Square`, the top-left `HOLLOW` archway sign is partially clipped at the top viewport edge, a vertical white/red/gray slider/track artifact appears above the `SCHOOL` sign on the right, and expanding `[!]` overlaps the right-side zoom slider; in `Rivituso Row`, cutscene `FAST »` / `SKIP »|` buttons overlap the `LONG ISLAND SQUARE` sign. | Add viewport/HUD safe-zone margins around top/right signs, anchor the `[!]` panel clear of the zoom bar, and hide or reposition the stray slider track above `SCHOOL`. |
| **BUG-12** | Low | `Deedee and Boppy's House` (HUD Hitbox Priority, Sprite Filtering & Cap Art) | (a) Tapping the top-left Menu icon just as Tom walks into range of `Cookie counter` triggers the counter inspection instead of opening Menu; (b) Boppy's overworld sprite briefly pixelates during dialogue transition; (c) on Boppy's shocked portrait / `BOPPY'S GOLD TEETH` splash art, his cap lettering (`Paso Robles`) appears garbled/mirrored. | Give HUD buttons `stopPropagation` priority over world proximity triggers, preserve sprite filtering on transitions, and clean up the mirrored cap lettering on Boppy's shocked/splash artwork. |

### 1.2 In-Game Dialogue, Visual & Storyline Coherence Issues

| ID | Severity | Location | Issue Observed | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| **COH-01** | Medium | `Grump Hollow` (`The Big One` Cutscene vs. Battle `INSPECT`) | In the pre-boss and post-boss scenes, **The Big One** is visibly a giant blue pond fish (`"GLUB. I was small at breakfast"`, `"Thank you, fish!"`, and `Boppy's Lost Lure` notes `"Twenty years in a fish's lip"`). However, its battle `INSPECT` description reads: `"The Big One: The biggest, coldest, muddiest one. Nobody has laughed at its croaks in a hundred years."` — describing a 100-year-old croaking frog/toad instead of the pond fish on screen. | Rewrite `The Big One`'s `INSPECT` text so it describes the newly enlarged 20-year pond fish wearing Deedee's muffin tin rather than a century-old croaking amphibian. |
| **COH-02** | Medium | `Grump Hollow` (`The Big One` Victory Modal vs. Post-Boss Cutscene) | `The Big One`'s `VICTORY` screen reads: `"It flips back into the pond with a splash you can hear from the Square."` Immediately afterward, the post-boss cutscene begins with **The Big One** still surfaced in the pond holding a 9-line conversation with Rose, Grace, Tom, and Deedee before departing. | Change the `VICTORY` subtitle to an in-pond beat (e.g., `"The Big One stops thrashing and blinks up at the shore."`) so its splash back into the pond happens only after the post-boss dialogue finishes. |
| **COH-03** | Medium | `Grump Hollow` (Folding Chair Dialogue vs. Wooden Bench Map Prop) | In the post-boss scene, **The Big One** asks: `"The man in the folding chair. Will he be back?"` However, inspecting `Boppy's fishing spot` directly beside the pond shows a flat wooden park bench next to Boppy's thermos, bucket, and rod—no folding chair exists on the map. | Swap the wooden bench sprite at `Boppy's fishing spot` for a folding chair sprite so the map prop matches The Big One's line. |
| **COH-04** | Low | `Rivituso Row` (Departure Piggyback Dialogue vs. Overworld Rose NPC) | During the departure cutscene outside `Deedee and Boppy's House`, **Rose** says `"One more ride, Tata! To the cab! Go the LONG way!"` and **Tom** agrees (`"The long way. That's all the way around the Square. Twice."`). Immediately afterward in overworld control on `Rivituso Row`, Rose is standing separately on the street (`Talk to Rose`, `1/3–3/3`) where her third line asks `"Tata, piggyback?"` as if the departure piggyback beat hadn't just played. | Either place Rose on Tom's shoulders for the walk to Cab 7 or adjust Rose's optional street lines so they don't re-request the piggyback ride just agreed to in the cutscene. |
| **COH-05** | Low | `Grump Hollow` (Battle Backdrop vs. Forest Map Setting) | Roaming forest encounters in `Grump Hollow` (`Skeeter Swarm`, `Log Lump`) display an open town-pond battle background featuring a church steeple and houses across the water rather than the wooded `Grump Hollow` setting. | Use a wooded pond/marsh battle backdrop for `Grump Hollow` encounters instead of the town-facing steeple skyline. |
| **COH-06** | Low | `Grump Hollow` (Post-Boss Orange Cube Re-Inspection & Missing Pan Pickup Toast) | (a) Re-inspecting the orange cube after defeating `The Big One` replays the first-time discovery exchange (`"He's stuck! Tata, get him out!"` / `"It's the size of a plum..."`) as if Tom hasn't already tried lifting it; (b) `The Big One` says `"Take the pan"` and the Quest Log updates to `"Take the pan home to Rivituso Row"`, but the pan disappears at cutscene end without a pickup banner confirming recovery (unlike `Dragonfly Coin` and `Boppy's Lost Lure`). | Provide a short post-cutscene inspection state for the immovable orange cube and add a brief pickup toast (or explicit recovery beat) when Deedee reclaims her 12-cup pan. |
| **COH-07** | Low | `Deedee and Boppy's House` (Kitchen Island Pre-Heist Prop) | Entering `Deedee and Boppy's House` in the overworld prior to talking to Deedee shows a bare kitchen island; the 12-cup muffin pan only pops into existence when the cutscene begins. | Render the 12-cup muffin pan on the kitchen island upon pre-heist map entry so it matches Deedee's opening dialogue (`"I made twelve and they're all still there"`). |
| **COH-08** | Low | `The Square` (Party Join Notification) | Following the reunion scene in `The Square`, only `"Grace joined the party!"` pops up, even though opening `PARTY` immediately lists both **Grace** and **Rose** as active party members alongside **Tom**. | Update the banner to `"Grace and Rose joined the party!"` (or display consecutive join cards for both nieces). |
| **COH-09** | Low | `Grump Hollow` Battle `INSPECT` (Shared Boilerplate & Masked `???` Hint) | All four `Grump Hollow` enemies (`Mudling`, `Skeeter Swarm`, `Log Lump`, `The Big One`) repeat the identical hint string: `"Cheer it up with RASPBERRY, Peekaboo, Apple Muffins, MOON & BACK. Weak to ??? (Flashcard Flurry or Red Pen)."` Masking the weakness category as `???` while naming locked/unobtained moves (`Flashcard Flurry` is still locked on Tom's Stampcard and `Red Pen` belongs to an unrecruited character) reads confusingly to a Chapter 1 player. | Either hide unlearned move names behind `???` until unlocked or display the actual readable weakness name alongside moves currently usable by the party. |

### 1.3 Text Hygiene, Typos & Cut-String Leaks

| ID | Severity | Location | Issue Observed | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| **TXT-01** | Medium | `Grump Hollow` (Pre-Boss Cutscene — Tom) | Immediately before `The Big One` battle, **Tom** uses explicit video-game fourth-wall phrasing that breaks scene logic: `"Mom, wait. Bosses hit in a pattern. Watch what he does twice, then go."` | Rewrite Tom's caution in grounded everyday speech (e.g., warning Deedee to watch how the giant fish swings twice before stepping close) without calling it `"Bosses"`. |
| **TXT-02** | Low | `Grump Hollow` & `Rivituso Row` Dialogue (`"grey"` British Spelling) | **Grace** uses the British spelling `"grey"` twice in spoken dialogue: `"It's grey, Rose. Just that one spot."` (`Grump Hollow` freeze site) and `"If you see anything grey in California, or an orange cube, you write it down and text me."` (`Rivituso Row` departure). | Replace `"grey"` with American spelling `"gray"` across dialogue lines for consistent US English (`"color"` is already Americanized). |
| **TXT-03** | Low | `Grump Hollow` (Post-Boss Cutscene Speaker Casing) | Within the same 9-line post-boss cutscene, speaker labels switch mid-scene from ALL-CAPS (`THE BIG ONE`, `ROSE`) on Lines 1–6 to Title Case (`Grace`, `The Big One`, `Deedee`) on Lines 7–9. | Standardize speaker-label capitalization consistently across all dialogue entries. |
| **TXT-04** | Low | `Grump Hollow` Overworld Prompt (`boppy's`) | Approaching Boppy's pond spot displays `A · Inspect boppy's fishing spot` with lowercase `"boppy's"`, whereas the opened inspection header reads `"Boppy's fishing spot"`. | Capitalize `"Boppy's"` in the interaction prompt (`A · Inspect Boppy's fishing spot`). |
| **TXT-05** | Low | `Menu > STATUS` vs. `Menu > STAMPS` (Deedee) | Deedee's `STATUS` trait (`Warm Crust Tokens`) refers to `"Sunday Dinner"` putting `"Warm Crusts"` on the tray, whereas her `STAMPS` Lv 26 skill is named `"Sunday Roast Spread ★"` and describes `"3 Hot Dishes"`. *(Full-run check confirmed zero `"Rhubarb Crisp"` strings and zero spoken text emoticons anywhere in Chapter 1.)* | Align ability and token names between Deedee's `STATUS` trait text and `STAMPS` tooltips. |

## Section 2: Scene-by-Scene Playtest Log

### Checkpoint 1: Welcome Screen → `Deedee and Boppy's House` (`grands`)

1. **Welcome Screen, Reload & New Game Setup**
   * Loaded [The Adventures of Tom](https://trivituso81.github.io/adventures-of-tom/), clicked `↻ RELOAD`, and recorded top-left build label `build keysecrets2` / `Nov 20, 1:50 PM`.
   * Started **New Game** → `CH 1: The Soup Dumpling Protocol` → **MEDIUM** (`GRACE` — *"As designed"*). Verified in **OPTIONS** that `DIFFICULTY` is `GRACE` (**Rose Mode** `OFF`) and kept dialogue `AUTO OFF` with two-tap advancement throughout.
2. **`Long Island Taxi Co.` (`taxi`)**
   * Interior scene with **Tom** and **Sal** behind the counter.
   * **Tom** *(beaming/laughing)*: `"Oof, I'm finally here! At least the 6 hours went by fast on Delta One!"` Exchanges quick thanks with **Sal** *(smiling in flat cap)* and exits to `The Square`.
3. **`The Square` (`town`) — Reunion & `GRACE'S LIST`**
   * **Grace** and **Rose** rush in shouting `"TATA!!!"`, hug Tom, and Tom lifts Rose onto his shoulders.
   * **Grace** *(happy)*: `"TATA! You're BACK!"` / `"We waited for you for a hundred years."`
   * **Rose** *(happy)*: `"A hundred MILLION years!"` / `"Tata, up! Up up up!"` / `"I'm the tallest! Giddyup, Tata!"`
   * **Tom** *(deadpan/raised-brow)*: `"Hello, Rose. Please keep your arms and legs inside the uncle at all times."`
   * **Item Showcase (`SPARKLING DIAMOND GOLD SOUP DUMPLING SQUISHY`):** **Grace** *(happy)* shows off her limited-edition squishy (`"There are only two in the whole world. You can squeeze it!"`); **Tom** *(laughing)*: `"That's the shiniest dumpling I've ever seen. And I've seen a LOT of dumplings."`
   * **Clue List Beat:** Grace reads items 1–2 (`Boppy saw the Big One again` for twenty years; `Deedee made apple muffins` for Tom); **Rose** *(happy)* confesses `"I licked one. Only the top!"`; **Grace** *(unimpressed side-eye)* adds `"Number three. Rose licked a muffin."` → Splash card **`GRACE'S LIST`** (`1. BOPPY SAW THE BIG ONE`, `2. DEEDEE MADE APPLE MUFFINS`, `3. ROSE LICKED A MUFFIN`).
   * **Party & Quest State:** `"Grace joined the party!"` banner; `PARTY` shows **Tom** (Lv 1, 118 HP), **Grace** (Lv 1, 98 HP), and **Rose** (Lv 1, 92 HP), `25 COINS`. Inspected `Wish fountain` (`"A coin reads: 'Please don't wish for more coins.'"`). Quest Log: `"Go to Deedee and Boppy's house. Rivituso Row, south of the Square."`
4. **`Rivituso Row` (`row`)**
   * **Amy** *(beaming)* leans out the `GREGORI` attic window (`"Brother! I'm watching you from the window. I've seen people move faster walking on the sand at Robert Moses."`); **Tom** *(deadpan)*: `"I'm carrying a child and receiving a news report."`; **Amy**: `"Go see Mom. I'm coming over after my run."`; **Grace** *(unimpressed)*: `"You are slow. I've been on number four since the taxi place."`
5. **`Deedee and Boppy's House` (`grands`) — Muffin Theft & Party Join**
   * **Tom** *(happy)* asks about the cinnamon topping; **Deedee** *(happy)* says all twelve muffins are still there because she has stood between the pan and Boppy since 6 AM; **Boppy** *(grumpy → beaming)* tells a Rikers story about a steaming hat.
   * **Muffin Theft:** A sprout-headed **Mudling** bursts in, knocks Tom, Grace, and Rose down, and steals the 12-cup muffin pan. **Rose** *(scared)*: `"AHHH! DEEDEE!"`; **Deedee** *(angry)*: `"Excuse me! I just washed that floor."` / `"That thing took my good twelve-cup pan! I don't even put that pan in the DISHWASHER."`; **Boppy** *(sad)*: `"The mud gets a muffin and I don't?"`
   * **Party Join & House Audit:** **Deedee** *(smiling)* (`"Girls, sneakers. Tom, hold the door. Hubby, you stay right there."`) → `"Deedee joined the party!"` (Lv 1, 96 HP) + `"Got Boppy's Pepper!"` (`POW +10%`). Inspected `Plaid sofa`, `Cookie counter`, and 4-line talk with **Boppy** → `"Got Boppy's Cap!"` (`GRIT +10%`). Audited `ITEMS` (8 starting/house gear & keepsakes), `GEAR`, `STATUS`, `STAMPS`, and `VIBES`. Quest Log: `"Follow the thief into Grump Hollow, north of the Square."`

### Checkpoint 2: `Grump Hollow` (`hollow`) & `The Big One` Boss Fight

6. **`Grump Hollow` Entrance & Battle 1 (`3x Mudling`)**
   * Cornered `Mudling` *(surprised)*: `"No. Ours"`; **Rose** *(angry)* protests; **Tom** *(stern)*: `"She did."`; **Deedee** *(smiling → unamused)* counts to `"Three."`
   * **Battle 1 (`Mudling A, B, C`):** Audited all 4 characters' battle skills, `TOMBO` tooltips (`Squishy Delivery`, `Double-Decker Airplane`, `Wine and Gossip`), `BAG`, and `INSPECT`. Won cleanly (`+36 XP` each, `+12 Pocket Coins`, `Got Mud Pie!`, `HEART 45%`).
   * **Post-Fight Beat:** **Grace** *(smiling)* counts nine wrappers (`"So the one with the pan still has three."`); **Deedee** *(unamused)*: `"Then it has three of my muffins and my pan. Keep walking."` Quest Log: `"Head east, around the pond, to Boppy's fishing spot. The Hollow's monsters are awake now."`
7. **Freeze-Site Inspection & Pre-Boss Cutscene**
   * **Rose** *(happy)*: `"The grass is Boppy color!"`; **Grace** *(smiling)* notes the grey spot and orange cube with a dragonfly inside; **Rose** *(worried)*: `"He's stuck! Tata, get him out!"`; **Tom** *(smiling)* fails to budge the plum-sized cube (**Rose**: `"Your face is RED, Tata!"`; **Tom**: `"Grace. I couldn't even make it wobble."`).
   * **Deedee** *(serious)* inspects a burnt flashbulb filled with purple-black sparkles; **Grace** *(excited)* starts a new clue list in pencil (`"Because I don't know what any of it means yet."`).
   * **Boss Entrance:** **The Big One** surfaces wearing Deedee's 12-cup pan with a lure in its lip (`"GLUB. I was small at breakfast."` / `"It's my crown. A little muddy one brought it. I'm keeping it."`); **Deedee** *(deadpan → angry → smiling)*: `"For once in his life he rounded down."` / `"I worked the night shift, Tom. I've walked up to worse. Mister, take off my pan."`
8. **Boss Fight — `The Big One` (`HP 560/560 · WARMTH 0/350`)**
   * Used Tom's `Defend` to protect `Grace` on `Swamp Chomp` lock-on, broke shield with `Double-Decker Airplane`, healed as needed, and defeated `The Big One` plus two summoned `Mudlings` with zero KOs.
   * **Rewards:** `+100 XP` each, `+50 Pocket Coins`, `Got Boppy's Lost Lure!` (`Coins from fights +25%`), Stamp Points prompt.
9. **Post-Boss Cutscene & `Grump Hollow` Overworld Sweep**
   * **Rose** *(laughing)*: `"BOO!"`; **The Big One** *(surprised)*: `"GLUB! HA! You got me! I see everybody."`; **Tom** *(smirking)*: `"Nobody does. She's gotten me in an empty room."`
   * **The Big One** returns the pan and gives Rose **`A SMALL GOLD COIN`** → `"Got Dragonfly Coin!"` (**Rose** *(grinning)*: `"Thank you, fish! There's a bug on my money!"`). **The Big One** asks if `"The man in the folding chair"` will be back to finish his race story; **Deedee** *(deadpan)*: `"He's been in the middle of that one for fifty-one years."`
   * Inspected orange cube/grey grass and `Boppy's fishing spot` (`"A thermos, a bucket, one bass. Boppy will tell you it was two feet long. It was not."`), and cleared roaming fights against **`Skeeter Swarm`** (`HP 70`, `+24 XP`, `+10 Coins`) and **`Log Lump`** (`HP 240`, `+34 XP`, `+18 Coins`, `Bark Slab` `+5 POW`, party reaching `Lv 2`).

### Checkpoint 3: Return Home, Departure, Back-Seat Text & `CHAPTER 1 COMPLETE`

10. **Menu & Tooltip Final Audit**
    * Verified all 12 `ITEMS` (`Mud Pie`, `Bark Slab`, `Boppy's Lost Lure`, `Dragonfly Coin`, plus 8 initial/house items) and audited `STATUS` and `STAMPS` across **Tom** (`Home Baker` / `Polyglot Gamer`), **Grace** (`Influencer Cleric` / `Acro-Star`), **Rose** (`Giggle Gremlin` / `Piggyback Kid`), and **Deedee** (`Lv 2`, `3 SP` each). Confirmed zero `"Rhubarb Crisp"` strings anywhere.
11. **Return-Home Scene (`Deedee and Boppy's House`)**
    * **Rose** *(happy)*: `"Boppy! Your fish is REAL! He's CAR size and he gave me money!"`
    * **Boppy** *(shocked → happy)*: `"CAR size? Cozy Rosie, I told everybody a couch. Twenty years! I didn't want to brag!"` / `"Now that's real gold. Same as these. Look."` → Splash card **`BOPPY'S GOLD TEETH`**.
    * **Rose** *(shocked → happy)*: `"You've got money in your TEETH!"` → promises to hide the coin `"Under Lamby! Nobody looks under Lamby!"`
    * **Grace** *(smiling)* tells **Boppy** `"The fish ate them, Boppy. The last three."`; **Boppy** *(sad)*: `"The fish gets THREE?"`; **Deedee** *(happy)*: `"Twelve more. Forty minutes. The first one's still yours."`; **Boppy** *(happy)*: `"Girls, you heard that. Forty minutes. Somebody watch the clock."`
12. **Departure Sequence (`Rivituso Row` → `The Square`)**
    * **Grace** *(smiling → sly side-eye)* gives Tom his California assignment (`"If you see anything grey in California, or an orange cube, you write it down and text me."`) and lends him her `"second best"` pencil; **Tom** *(smiling)* puts it `"in the pocket with the zipper."`
    * **Rose** *(happy)*: `"One more ride, Tata! To the cab! Go the LONG way!"`; **Tom** *(smiling)*: `"The long way. That's all the way around the Square. Twice."` Also checked optional 3-line talk with Rose on `Rivituso Row` before walking north to Cab 7 in `The Square`.
13. **Back-Seat Phone Text & `CHAPTER 1 COMPLETE`**
    * Splash card **`A PHONE ON THE SEAT`** (`CONTINUE`) → **TNB** *(smiling)*: `"hey babe. safe flight. the smog over 2nd ave turned purple this morning. it'll probably blow over."`
    * Transitioned cleanly to the **`CHAPTER 1 COMPLETE` / `THE SOUP DUMPLING PROTOCOL`** completion screen.
