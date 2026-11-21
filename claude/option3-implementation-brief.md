# Brief: implement the Option 3 ability system (Little Elsewhere)

## What this is

A combined ability revamp for battle2. Option 3 merges two proposal documents:

| Source | File to attach | Used for |
|---|---|---|
| Option 1 | `adventures-of-tom-ability-revamp.md` | Rules contract, most Primary moves, voice |
| Option 2 | `adventures_of_tom_ability_revamp_plan.md` | Cinematic Ultimates, Remix moves, trait hooks |

**Attach both files with this brief and the latest build zip.** Every move's full card (menu text, spoken line, animation beats, assets) lives in its source document under its key. This brief decides which card goes where and what rules override the cards.

Follow the project instructions as usual (read `claude/status.md` first, test with `tools/`, hand back build.zip and publish.zip, never touch `demo/`, never read `data/voice-clips.js`).

## Core rules

1. **Two versions per node.** Each Stampcard node, Basic and Signature has a Primary and a Remix. One is equipped at a time. Both share the node's SP cost, level gate and Stampcard position.
2. **Primary sources.** Basic, Signature animation and path nodes 1 to 5: Option 1. Ultimates (node 6): Option 2. Remix is always the other document.
3. **Signature** keeps the existing legacy resolver (DEFEND, DANCE, SILLY, PEP TALK, MOON & BACK, GRUMBLE, WARDROBE, PUPPY EYES). Only the animation differs between versions.
4. **Combos.** Each Tombo tier and Family Finish has a Primary (picked per tier, see map) and a Director's Cut (the other document).
5. **Rules contract.** Option 1's "Shared implementation contract" and "Shared combo contract" are authoritative for ops, targeting, kindFoe, VP, HEART, barriers and finale. Option 2 cards are translated into those ops.
6. **Card numbers vs this brief.** Where a card's text disagrees with the tuning or translation tables here, this brief wins.

## Progression (per character)

| Reward | When | Effect |
|---|---|---|
| Stamp Point | Start with 2; +1 every even level | Buys nodes. Costs per path 1, 2, 2, 3, 3, 4. Gates: Lvl 2, 6, 10, 16, 22, 26 (first Ultimate), 40 (second Ultimate) |
| Polish Point | Every odd level from 3 (24 total) | Rank 2 "+": damage, numeric heals and Warmth x1.15, plus one flourish beat under 0.4 s. Rank 3 "Polished" (Lvl 20+): VP cost -1, minimum 1. Ranks belong to the node, shared by both versions. 28 possible ranks vs 24 points, so it is a choice |
| Loadouts | Lvl 27 | Two saved kit setups; swap at save points |
| Remix Ticket | Every even level from 28 (12), plus 2 from side quests | Unlocks the other version of an owned node, Basic or Signature |
| Director's Cut | Tier story-unlocked and both participants Lvl 30 | Unlocks the alternate combo |
| Mastery | Lvl 50 | Swap versions from the battle menu, once per battle |

Every level from 2 to 50 must give at least one reward. Show one level-up card per reward. Auto-Stamp also auto-spends Polish Points and Remix Tickets unless turned off in OPTIONS.

Flourish beats by character: Tom medallion glint, Grace ring-light flash, Rose Lamby peek, Amy stopwatch tick, Deedee steam puff, Boppy pepper spark, TNB clay curl, Nara tail-wag blur.

## Effect registry (6 new)

| Effect | From | Rule |
|---|---|---|
| `warm(p,t)` | Option 1 | Fill p% of a regular monster's Warmth; liked move x1.5, High-Five x1.15 |
| Close-Up status | Option 1 | Next damaging action on target is doubled, then expires |
| `mile` | Option 2 | +1 Upgrade Mile to Tom per action max, 3 held max |
| `trend` | Option 2 | Grace's Trending +1 step, or lock x1.5 for 2 turns |
| `scent` | Option 2 | Target cannot hide in back row or evade; +30% kinetic and combo damage, 3 turns |
| `tray` | Option 2 | Warm Crust tokens become Hot Dish (heal 30% and cure 1) |

Translate the other Option 2 effects to existing ops:

| Option 2 effect | Implement as |
|---|---|
| `pause N t` | `ct(+.50,t)` |
| `choreo N ally` | `vp(1,ally); ct(-.20,ally)` |
| `fort N party` | `st(guard,N,party)` |
| `grade N t` | `st(spotted,N,t)` |
| `pace N` | `ct(+.35)` on enemies faster than Boppy |
| `continuity N ally` | `heal(.25,ally)` at end of its next turn if hurt |

## Tuning caps on Option 2 content

| Cap | Value |
|---|---|
| Revive | 50% HP (The Eight-Seat Dinner Table: 75%) |
| Party heal | 60% |
| Miles granted | +1 per action |
| VP granted | +3 |

Already-tuned entries (use these Effects lines):

| Owner | Move | Changes | Effects to implement |
|---|---|---|---|
| Tom | Pause for a Bite `rx_pause_bite` | pause is not in the Option 3 registry; translated to existing ops | `ct(+.50,t)`, `heal .35 self`, `cure all self` |
| Grace | Five-Six-Seven-Eight! `rx_choreo_count` | choreo is not in the Option 3 registry; translated to existing ops | `vp(1,ally); ct(-.20,ally)`, `st pep_up 2 ally` |
| Rose | Operation Shoulder Mecha `mecha_ult` | Miles capped at +1 per action | `mount`, `st stunned 1 all`, `mile +1 tom` |
| Rose | Pillow Fort `rx_fort_build` | fort is not in the Option 3 registry; translated to existing ops | `st(guard,2,party)`, `heal .20 party` (if Grace in party: `trend +1`) |
| Amy | Red Pen `rx_redpen` | grade is not in the Option 3 registry; translated to existing ops | `reveal`, `st(spotted,3,t)`, `st grit_down 2 t` |
| Boppy | Slow Down! `rx_slowdown` | pace is not in the Option 3 registry; translated to a turn delay | `ct(+.35, enemies faster than Boppy)`, `ct -0.4 t` |
| TNB | Continuity Polaroid `rx_polaroid` | continuity is not in the Option 3 registry; translated to existing ops | `heal(.25,ally) at end of its next turn if hurt`, `st cool_up 2 ally`, `cure 1 ally` |
| Nara | The Unsent Scent `pack_ult` | Revive capped at 50% | `revive .50 tom`, `heal .45 party`, `scent 3 all` |
| Tom + Grace | Uncle Spotter Toss `tb_grace_2` | choreo is not in the Option 3 registry; translated to existing ops | `shieldBreak`, `crit 1`, `vp(1,tom); ct(-.20,tom)` |
| Tom + Grace | The Golden Dumpling Wish `tb_grace_3` | Revive capped at 50%; Party heal capped at 60% | `revive .50 party`, `heal .60 party`, `trend lock 3`, `cure all party`, `kindFoe` |
| Tom + Rose | Headphones in the Dark `tb_rose_3` | pause is not in the Option 3 registry; translated to existing ops; Miles capped at +1 per action | `ct(+.50,all)`, `mount`, `heal .50 party`, `mile +1 tom`, `kindFoe` |
| Tom + Amy | Red-Pen Study Blitz `tb_amy_1` | grade is not in the Option 3 registry; translated to existing ops | `st(spotted,3,t)`, `st see_me 2 t`, `reveal`, `vp +3 both` |
| Tom + Deedee | Feast on Jefferson Park `dc_tb_deedee_3` | Party heal capped at 60% | `heal .60 party`, `st tucked_in 3 party`, `crust +3`, `tray 3`, `kindFoe` |
| Tom + TNB | Cone Six Across the Miles `tb_tnb_3` | continuity is not in the Option 3 registry; translated to existing ops | `shieldBreak` (**Breaks Distance Barrier**), `heal(.25,party) at end of its next turn if hurt`, `heal .60 party`, `rack party` |
| Family Finishes | She Carries the Load `ff_mom_girls` | VP grants capped at +3 | `shieldBreak`, `cure all party`, `vp +3 party`, `st personal_best 3 party`, `ct +0.75 party` |
| Family Finishes | Fifty-One Years & Counting `ff_grandparents` | Revive capped at 50%; Party heal capped at 60% | `shieldBreak`, `revive .50 party`, `heal .60 party`, `st tucked_in 3 party`, `st nobody_gets_past 3 party`, `kindFoe` |
| Family Finishes | Welcome to Jefferson Park `dc_ff_la_home` | Miles capped at +1 per action | `heal .60 party`, `mount`, `trend lock 2`, `rack party`, `mile +1 tom`, `kindFoe` |
| Family Finishes | The Eight-Seat Dinner Table `dc_ff_all_eight` | Revive capped at 75%; Party heal capped at 60% | `shieldBreak`, `revive .75 party`, `heal .60 party`, `cure all party`, `refill party`, `kindFoe` |

## Barriers

| Barrier | Slot | Unlock |
|---|---|---|
| Exhaustion | Family Finish 2 (Amy, Grace, Rose; Tom not required) | Chapter 12 |
| Aging | Family Finish 3 (Deedee, Boppy, Tom) | Chapter 15 |
| Distance | Tom + TNB tier 3 | Chapter 19 |
| Fear | Tom + Nara tier 3 | Chapter 19 |

Either version in a barrier slot emits the barrier event at its impact beat. Nothing else changes a barrier flag.

## Voice and canon fixes before baking

- Trim any spoken line over 12 words (several Option 2 lines run to 16).
- Option 2 Family Finish "Welcome to Jefferson Park" calls the girls "East Coast nieces". Rewrite to fit Little Elsewhere canon.
- No em dashes in game text. Girls say "Tata" in speech only; UI says Tom.
- Every move keeps its own spoken line in `data/lines.js`. New or changed lines are silent until clips are re-baked; list them in status.md for Tom.

## Keys and saves

Content keys come from the source doc. Remix keys get `rx_`, Director's Cut keys get `dc_`. Legacy save IDs are not known: read the real move IDs from `data/battle2-data.js` and `data/progress.js` first, map each old move to the Option 3 Primary in the same slot, refund SP for removed passives, and bump the save format with a migration.

## Build phases (one per session; confirm scope with Tom at the start)

| Phase | Work | Done when |
|---|---|---|
| 1 | Data model: two versions per node, ranks, Polish Points, Remix Tickets, Loadouts; progression numbers above; save migration | Stampcard shows both versions; levels 1 to 50 each grant a reward; old saves load |
| 2 | Effect registry and translations; tuning caps | Unit-style checks in tools/ for each effect |
| 3 | Primary kits for Tom, Grace, Rose, Deedee (chapter 1 party) incl. lines and animations | Every Primary move playable in Battle Lab with its line |
| 4 | Primary kits for TNB, Nara, Boppy, Amy | Same |
| 5 | Primary Tombos and Ultimates | Each plays, breaks a shield, barrier events fire |
| 6+ | Remix moves and Director's Cuts, one or two characters per session | Ticket unlock and swap work in both layouts |

Reuse queue steps, `fx`, RFX.SC scenes, held items and PROP2 before adding new animation systems. Test portrait and landscape, a gamepad path, and the usual smoke test each phase.

When done with a phase, give Tom the updated "Battle rules (battle2)" section for the project instructions.

## Complete map

Source: (1) = Option 1, (2) = Option 2. Look up each key in that document for the full card.

#### Tom

| Slot | Lvl | SP | Primary (source) | Remix (source) |
|---|---|---|---|---|
| Basic | 1 | 0 | Controller Tap `controller_tap` (1) | Button Mash `rx_mash` (2) |
| Signature | 1 | 0 | DEFEND `defend` (1) | DEFEND `rx_defend` (2) |
| A1 | 2 | 1 | Starter Inspection `starter_inspection` (1) | Starter Splash `rx_starter` (2) |
| A2 | 6 | 2 | Proofing Drawer `proofing_drawer` (1) | Crumb Shot `rx_crumb` (2) |
| A3 | 10 | 2 | Toast Negotiations `toast_negotiations` (1) | Mint Unboxing `rx_unbox` (2) |
| A4 | 16 | 3 | Warranty Void `warranty_void` (1) | Noise-Canceling `rx_anc` (2) |
| A5 | 22 | 3 | Crumb Barrier `crumb_barrier` (1) | Window Seat `rx_window` (2) |
| A6 | 26 / 40 | 4 | Boarding Group Zero `delta_ult` (2) | The House Is Awake `rx_house_awake` (1) |
| B1 | 2 | 1 | Five-Minute Review `five_minute_review` (1) | Flashcard Flurry `rx_flash` (2) |
| B2 | 6 | 2 | D-Pad Detour `dpad_detour` (1) | Kanji Counter `rx_kanji` (2) |
| B3 | 10 | 2 | Save Point Sandwich `save_sandwich` (1) | Pause for a Bite `rx_pause_bite` (2) |
| B4 | 16 | 3 | Radical Solutions `radical_solutions` (1) | Scope Creep `rx_scope` (2) |
| B5 | 22 | 3 | Patch Notes `patch_notes` (1) | 365-Day Streak `rx_streak` (2) |
| B6 | 26 / 40 | 4 | Cartridge Tilt `cart_ult` (2) | Player One Is Not Alone `rx_not_alone` (1) |

#### Grace

| Slot | Lvl | SP | Primary (source) | Remix (source) |
|---|---|---|---|---|
| Basic | 1 | 0 | Heel Click `heel_click` (1) | Cartwheel Kick `rx_cartwheel` (2) |
| Signature | 1 | 0 | DANCE `dance` (1) | DANCE `rx_dance` (2) |
| A1 | 2 | 1 | Dumpling Consult `dumpling_consult` (1) | Squishy Squeeze `rx_squishy` (2) |
| A2 | 6 | 2 | Glitter Check-In `glitter_checkin` (1) | Glitter Nails `rx_nails` (2) |
| A3 | 10 | 2 | Ring-Light Rescue `ringlight_rescue` (1) | Ring Light Check `rx_ringlight` (2) |
| A4 | 16 | 3 | Comment Moderation `comment_moderation` (1) | Dumpling Drop `rx_dumpling` (2) |
| A5 | 22 | 3 | Thumbnail Face `thumbnail_face` (1) | Collab Tag `rx_collab` (2) |
| A6 | 26 / 40 | 4 | Ten Million Subscribers `viral_ult` (2) | Keep the Bloopers `rx_keep_bloopers` (1) |
| B1 | 2 | 1 | Eight-Count Reset `eight_count` (1) | Dance Battle `rx_battle` (2) |
| B2 | 6 | 2 | Balance-Beam Borders `beam_borders` (1) | Five-Six-Seven-Eight! `rx_choreo_count` (2) |
| B3 | 10 | 2 | Warm-Up Lap `warmup_lap` (1) | Beam Dismount `rx_beam` (2) |
| B4 | 16 | 3 | Mat Patrol `mat_patrol` (1) | Split Leap `rx_splitleap` (2) |
| B5 | 22 | 3 | Spotlight Shuffle `spotlight_shuffle` (1) | Chalk Up `rx_chalk` (2) |
| B6 | 26 / 40 | 4 | Diamond Leotard Finale `olympic_ult` (2) | Gravity Needs Permission `rx_gravity_permission` (1) |

#### Rose

| Slot | Lvl | SP | Primary (source) | Remix (source) |
|---|---|---|---|---|
| Basic | 1 | 0 | Tiny Tap `tiny_tap` (1) | Nose Boop `rx_boop` (2) |
| Signature | 1 | 0 | SILLY `silly` (1) | SILLY `rx_silly` (2) |
| A1 | 2 | 1 | Where Did I Go? `where_did_i_go` (1) | Peekaboo! `rx_peekaboo` (2) |
| A2 | 6 | 2 | Royal Inspection `royal_inspection` (1) | Twirl Tornado `rx_twirl` (2) |
| A3 | 10 | 2 | Giggle Echo `giggle_echo` (1) | Dress-Up Tiara `rx_dressup` (2) |
| A4 | 16 | 3 | Lamby's Appointment `lamby_appointment` (1) | Floor Is Lava! `rx_lava` (2) |
| A5 | 22 | 3 | The Floor Is Jelly `floor_is_jelly` (1) | Pillow Fort `rx_fort_build` (2) |
| A6 | 26 / 40 | 4 | Tea Party with Lamby `teaparty_ult` (2) | Your Pretend Birthday `rx_pretend_birthday` (1) |
| B1 | 2 | 1 | Lookout Lamby `lookout_lamby` (1) | Lamby Launch `rx_lamby` (2) |
| B2 | 6 | 2 | Ribbon Rescue `ribbon_rescue` (1) | Piggyback Pounce `rx_pounce` (2) |
| B3 | 10 | 2 | Lamby Fixes the Ending `lamby_ending` (1) | Travel-Sized Tackle `rx_travelsize` (2) |
| B4 | 16 | 3 | Pocket Princess `pocket_princess` (1) | Lamby Boomerang `rx_boomerang` (2) |
| B5 | 22 | 3 | Princess Parasol `princess_parasol` (1) | Tallest Kid in School `rx_totem` (2) |
| B6 | 26 / 40 | 4 | Operation Shoulder Mecha `mecha_ult` (2) | Travel-Size Kingdom `rx_travel_kingdom` (1) |

#### Amy

| Slot | Lvl | SP | Primary (source) | Remix (source) |
|---|---|---|---|---|
| Basic | 1 | 0 | Starting Step `starting_step` (1) | Sprint Tackle `rx_sprint` (2) |
| Signature | 1 | 0 | PEP TALK `pep_talk` (1) | PEP TALK `rx_peptalk` (2) |
| A1 | 2 | 1 | Margin Notes `margin_notes` (1) | Red Pen `rx_redpen` (2) |
| A2 | 6 | 2 | Hall Pass Home `hall_pass_home` (1) | Pop Quiz `rx_popquiz` (2) |
| A3 | 10 | 2 | Gold-Star Recess `goldstar_recess` (1) | Gold Star Sticker `rx_goldstar` (2) |
| A4 | 16 | 3 | Eyes Up Front `eyes_up_front` (1) | Inside Voices! `rx_voices` (2) |
| A5 | 22 | 3 | A Better Question `better_question` (1) | Hall Pass `rx_hallpass` (2) |
| A6 | 26 / 40 | 4 | Detention Forever `detention_ult` (2) | Everybody Gets a Turn `rx_everybody_turn` (1) |
| B1 | 2 | 1 | Lace, Then Race `lace_then_race` (1) | Burpee Blitz `rx_burpee` (2) |
| B2 | 6 | 2 | Hill Math `hill_math` (1) | Hill Repeats `rx_hills` (2) |
| B3 | 10 | 2 | Water-Station Truce `water_truce` (1) | Oat Milk Gel Pack `rx_oatgel` (2) |
| B4 | 16 | 3 | False Start `false_start` (1) | Stroller Stride `rx_stroller` (2) |
| B5 | 22 | 3 | Shakeout Mile `shakeout_mile` (1) | Negative Split `rx_negsplit` (2) |
| B6 | 26 / 40 | 4 | Boston Qualifier `marathon_ult` (2) | The Stopwatch Can't Keep Up `rx_stopwatch_cant` (1) |

#### Deedee

| Slot | Lvl | SP | Primary (source) | Remix (source) |
|---|---|---|---|---|
| Basic | 1 | 0 | Dish-Towel Flick `dish_towel_flick` (1) | Spit Shine `rx_spitshine` (2) |
| Signature | 1 | 0 | MOON & BACK `moon_back` (1) | MOON & BACK `rx_moonback` (2) |
| A1 | 2 | 1 | Registered Nut, Reporting `registered_nut` (1) | Registered Nut `rx_regnut` (2) |
| A2 | 6 | 2 | Corner-Piece Privilege `corner_piece` (1) | Rhubarb Crisp `rx_rhubarb` (2) |
| A3 | 10 | 2 | Pepper-Free Plate `pepper_free_plate` (1) | Wet Floor! `rx_wetfloor` (2) |
| A4 | 16 | 3 | Rolling-Pin Rounds `rolling_pin_rounds` (1) | Triage
