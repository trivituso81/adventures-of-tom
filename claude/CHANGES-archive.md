# Changes archive (versions up to 189)

Moved out of claude/CHANGES.md on 2026-10-24 (v209). Baseline: live build version 1792766345-3d91, packaged 2026-10-23.

## 2026-10-24: Task M, Tom's move review for TNB, published as version 189 (Task M complete)
- Spec: claude/move-review.md (TNB table, Tom's Slasher Jump Scare override). Every slot kept its numbers; names, lines and
  animations changed. WARDROBE and Rush-Hour Racks untouched.
- Edited data/battle2-data.js: B2_SKILLS.tnb.o3 basic is now Mug Toss `mug_toss`, A3 Metro Tap Card `metro_tap` (Lost-and-Found
  Warmth's numbers), A4 Slasher Jump Scare `slasher_scare` (Practical Effects' numbers).
- Edited engine/tnb-moves.js: third IIFE "Move review rebuilds" (prefix tv2_) with 9 set pieces: Mug Toss, Quick Change (clothes
  fly off the rack onto the friend), Continuity Pins (needle stitch, giant safety pins), Metro Tap Card (tap reader, light-rail car
  stops at the friend), Slasher Jump Scare (blackout with a flashlight face, masked figure lunges, scream, flash), Clay Pigeon (big
  flapping bird), Curb Appeal (faster carve, dust), Kiln Door Policy (big roaring brick kiln, fire blast). SC.tn_cone, SC.tn_glaze and
  SC.tn_platform redrawn larger for Cone Six and Fix the Wobble. New sfx scream, rumble, chime2, hiss, brakes.
- Edited data/abilities.js: TNB Primary basic, A3, A4 names and descriptions; like alias tnb.metro -> tnb.metro_tap.
- Edited data/lines.js: mug_toss, metro_tap, slasher_scare, all reusing baked words (legacy basic, metro, jumpscare). No re-bake.
- data/scenes.js unchanged (the Director's Cut tip already names Kiln Door Policy). data/voice-clips.js and demo/ untouched;
  index.html republished unchanged (wrapper stripped).

## 2026-10-24: Task M, Tom's move review for Boppy, published as version 188
- Spec: claude/move-review.md (Boppy table, Tom's Lockdown override). Every slot kept its numbers; names, lines and animations
  changed. GRUMBLE, Recliner Reservation and In Nineteen Seventy untouched.
- Edited data/battle2-data.js: B2_SKILLS.boppy.o3 basic is now Cap Swat `cap_swat`, A4 Lockdown `lockdown`, B1 Pepper Breath
  `pepper_breath`, B5 Five-Alarm Jar `five_alarm_jar` (replacing Cap Check, Closing Time, One Pepper Sensible Size, Jar-Lid
  Negotiations).
- Edited engine/boppy-moves.js: second IIFE "Move review rebuilds" (prefix bv_) with 7 new set pieces: Cap Swat (bald-head frames
  built from the rig, big cap, miss, miss, SWAT!), Patient Angler (SPLASH! column, yank, reel crank), Headcount Again (big numbered
  badges), Lockdown (cell bars, key ring, CLANG, CLICK), Pepper Breath (cayenne, red face, cone of fire), Seeds of Trouble (big spark
  bursts, SIZZLE!), Five-Alarm Jar (ghost-pepper jar, little ghost, siren, flame columns). SC.bp_ticket and SC.bp_pot redrawn larger
  for Everybody Waits and Mild for Company. New sfx clang, jangle, siren, crunch, flame.
- Edited data/abilities.js: Boppy Primary basic, A4, B1, B5 names and descriptions. No like-alias change.
- Edited data/scenes.js: Counter-Roar tip says Cap Swat; Sore Loser tip says Pepper Breath.
- Edited data/lines.js: Boppy lines for the new keys. Reused baked words: cap_swat (= basic), pepper_breath (= pepper),
  five_alarm_jar (= ghost). New (re-bake): lockdown.
- data/voice-clips.js and demo/ untouched; index.html republished unchanged (wrapper stripped).

## 2026-10-24: Task M, Tom's move review for Deedee, published as version 187
- Spec: claude/move-review.md (Deedee table, Tom's overrides). Every slot kept its numbers; names, lines and animations changed.
  MOON & BACK and Oven Mitt Ultimatum untouched.
- Edited data/battle2-data.js: B2_SKILLS.deedee.o3 A3 is now Wet Floor! `wet_floor`, A4 Wine O'Clock `wine`, B3 Rise and Shine
  `rise_and_shine`, B4 Beanie Master `beanie_master`, B5 Grandma Squeeze `grandma_squeeze` (replacing Pepper-Free Plate,
  Rolling-Pin Rounds, Windows Open, Spotless Record, Take a Breather).
- Edited engine/deedee-moves.js: third IIFE "Move review rebuilds" (prefix dv_) with 10 set pieces: Dish-Towel Flick (2.5x towel),
  Registered Nut (big stethoscope, BA-DUMP, bandage POP!), Corner-Piece (huge steaming pan), Wet Floor!, Wine O'Clock (D.wine hands
  o3 casts to D.wineShow), Brisk Means Brisk (pink hand weights), Garden Shower (big hose arc), Rise and Shine, Beanie Master,
  Grandma Squeeze. New sfx ting, heartbeat, toot (sound effect for Beanie Master; never speech).
- Edited data/abilities.js: Deedee Primary A3, A4, B3, B4, B5 names and descriptions; like alias deedee.dinner -> corner_piece.
- Edited data/lines.js: removed the five retired Deedee lines; added wet_floor ("I just mopped! Watch your step!", baked under mop),
  rise_and_shine, beanie_master ("Oh my!"), grandma_squeeze (re-bake). Wine O'Clock uses the baked `wine` line.
- data/scenes.js: no tips named the retired moves. data/voice-clips.js and demo/ untouched; index.html republished unchanged.
- Project: claude/kit_test.py takes BUFF=1 (monsters start with pow_up).

## 2026-10-24: Task M, Tom's move review for Nara, published as version 186
- Spec: claude/move-review.md (Nara table). Every slot kept its numbers; names, lines and animations changed. Not Leaving and
  Family Food Inspector untouched.
- Edited data/battle2-data.js: B2_SKILLS.nara.o3 is now Jump Up `jump_up`, HUMAN EYES (key puppy_eyes), Tennis Ball Fetch
  `tennis_ball_fetch`, Don't Leave Me! `dont_leave_me`, Just One Bite? `just_one_bite`, Counter Surfer `counter_surfer`, Stranger
  Alert `stranger_alert`, Doodle Fluff `doodle_fluff`, Shake It Off Everyone, Not Leaving, Happy Puddle `happy_puddle`, Family Food
  Inspector. The legacy special is named HUMAN EYES too.
- Edited engine/nara.js: third IIFE "Move review rebuilds" at the end of the file (prefix nv_) with 10 set pieces; N.puppyEyesShow
  replaced (close-up band on eerily human eyes with eyebrows and a blink, double take, melt); N.shake_everyone replaced (same beats
  plus a full-screen spray). Helpers nv_big, nv_text, nv_hearts, nv_glow, nv_dust, nv_flash, lift(), tomU(), homeOf().
- Edited data/abilities.js: Nara Primary names and descriptions; HUMAN EYES on Primary and Remix. No like-alias change.
- Edited data/scenes.js: three tips say HUMAN EYES / Human Eyes.
- Edited data/lines.js: Nara lines for the new keys (barks only) and LINES.tom.nara_no_jump ("Nara, no jumping!"). Reused baked
  words: jump_up (= greet "Arf! Arf!"), tennis_ball_fetch (= greet "Arf arf arf arf!"). New (re-bake): tom.nara_no_jump,
  nara.dont_leave_me, just_one_bite, counter_surfer, stranger_alert, doodle_fluff, happy_puddle.
- data/voice-clips.js and demo/ untouched; index.html republished unchanged (wrapper stripped).

## 2026-10-24: Task M, Tom's move review for Tom, published as version 185
- Spec: claude/move-review.md (Tom table). Every slot kept its numbers; names, lines and animations changed. DEFEND, Patch Notes
  and the Ultimates untouched.
- Edited data/battle2-data.js: B2_SKILLS.tom.o3 is now Button Mash `button_mash`, DEFEND, Starter Splash `starter_splash`, Crumb
  Shot `crumb_shot`, Mint Unboxing `mint_unboxing`, Noise-Canceling `noise_canceling`, Window Seat `window_seat`, Flashcard Flurry
  `flashcard_flurry`, Konami Code `konami_code`, Save Point Sandwich, Kanji Strike `kanji_strike`, Patch Notes.
- Edited engine/tom-moves.js: fifth IIFE "Move review rebuilds" (prefix tv_) with 10 set pieces; Tm.save_sandwich replaced (big
  spinning crystal with rings, save chime twice, bigger sandwich). Helpers tv_big, tv_text (dy lifts it), tv_burst, tv_ring,
  tv_glow, tv_flash, tv_hearts, tv_dust, pad() (big controller), phones(), card(), arrow()/glyph(), stroke-by-stroke kanji.
- Edited data/abilities.js: Tom Primary names and descriptions; like alias tom.starter -> tom.crumb_shot.
- Edited data/scenes.js: tips say Button Mash, Starter Splash (6 tips), Flashcard Flurry.
- Edited engine/battle2-kind.js: Inspect hint says Flashcard Flurry or Red Pen.
- Edited data/lines.js: Tom lines for the new keys. Reused baked words: button_mash (= mash), starter_splash (= starter),
  mint_unboxing (= unbox), flashcard_flurry (= flashcard), kanji_strike (= kanji). New (re-bake): crumb_shot, noise_canceling,
  window_seat, konami_code.
- data/voice-clips.js and demo/ untouched; index.html republished unchanged (wrapper stripped).

## 2026-10-24: Task M, Tom's move review for Amy, published as version 184
- Spec: claude/move-review.md (Amy table). Every slot kept its numbers; names, lines and animations changed.
- Edited data/battle2-data.js: B2_SKILLS.amy.o3 is now Kettlebell Swing `kettlebell_swing`, PEP TALK, Red Pen `red_pen`, Hot Lunch
  Tray `hot_lunch_tray`, Gold-Star Recess, Inside Voices! `inside_voices`, Pop Quiz `pop_quiz`, Burpee Blitz `burpee_blitz`, Hill
  Repeats `hill_repeats`, Oat Milk, Please `oat_milk_please`, False Start, Negative Split `negative_split`.
- Edited engine/amy-moves.js: second IIFE "Move review rebuilds" (prefix av_) with 11 set pieces; A.goldstar_recess and
  A.false_start replaced (bigger stars; big start line and blocks). Helpers av_big, av_text, av_burst, av_ring, av_dust, av_flash,
  av_hearts, lift(), dance().
- Edited data/abilities.js: Amy Primary names and descriptions. No like-alias change (no monster likes the renamed kind moves).
- Edited data/scenes.js: Long Line tip says Kettlebell Swing; FINAL GRADE tip also fires for inside_voices.
- Edited data/lines.js: Amy lines for the new keys. Reused baked words: red_pen (= redpen), pop_quiz (= quiz), burpee_blitz
  (= burpee), hill_repeats (= hills). New (re-bake): kettlebell_swing, hot_lunch_tray, inside_voices, oat_milk_please, negative_split.
- data/voice-clips.js, index.html and demo/ untouched.

## 2026-10-24: Task M, Tom's move review for Grace, published as version 183
- Spec: claude/move-review.md (Grace table). Every slot kept its numbers; names, lines and animations changed.
- Edited data/battle2-data.js: B2_SKILLS.grace.o3 is now Cartwheel `cartwheel`, DANCE, Squishy Squeeze `squishy_squeeze`, Glitter
  Nails `glitter_nails`, Welcome Back to My Channel `welcome_back`, Like and Subscribe `like_subscribe`, Dumpling Drop `dumpling_drop`,
  Dance Battle `dance_battle`, Beam Dismount `beam_dismount`, Handstand Contest `handstand_contest`, Split Leap `split_leap`, Chalk Up
  `chalk_up`.
- Edited engine/grace-moves.js: fourth IIFE "Move review rebuilds" (prefix gv_) with 12 set pieces; the o3 cast of the legacy
  G.cartwheel routes to G.cartwheelShow; G.danceShow replaced (bigger twirl, confetti, every party member dances on a simple path).
  New helper dance(u,dur,fn) moves a non-actor party member without the aim warp (used by DANCE and Handstand Contest).
- Edited data/abilities.js: Grace Primary names and descriptions; like aliases grace.squishy -> squishy_squeeze,
  grace.subscribe -> welcome_back.
- Edited data/scenes.js: tips say Cartwheel, Squishy Squeeze, Welcome Back to My Channel; the Shushed tip also fires for
  squishy_squeeze.
- Edited data/lines.js: Grace lines for the new keys. Reused baked words: cartwheel, squishy_squeeze (= squishy), glitter_nails
  (= polish), dance_battle (= dancebattle), beam_dismount (= beam). New (re-bake): welcome_back, like_subscribe, dumpling_drop,
  handstand_contest, split_leap, chalk_up.
- data/voice-clips.js, index.html and demo/ untouched.

## 2026-10-24: Task M, Tom's move review for Rose, published as version 182
- Spec: claude/move-review.md (Rose table). Every slot kept its numbers; names, lines and animations changed.
- Edited data/battle2-data.js: B2_SKILLS.rose.o3 is now Boop `boop`, RASPBERRY (key silly), Boo!! `boo`, Dress-Up Tiara
  `dress_up_tiara`, Giggle Storm `giggle_storm`, Lamby Hug `lamby_hug`, Floor Is Lava! `floor_is_lava`, Lookout Lamby, Piggyback
  Pounce `piggyback_pounce`, Bedtime Story `bedtime_story`, Lamby Boomerang `lamby_boomerang`, Pillow Fort `pillow_fort`. The
  legacy special is named RASPBERRY too.
- Edited engine/rose-moves.js: fourth IIFE "Move review rebuilds" (prefix rv_) with 11 set pieces and shared helpers (rv_big,
  rv_flash, rv_burst, rv_rings, rv_hearts, lift(), noseOf()).
- Edited engine/battle2-moves.js: RM.rose.boop hands Option 3 casts to RM.rose.boopShow.
- Edited data/abilities.js: Rose Primary names and descriptions; SILLY shown as RASPBERRY (Primary and Remix); like alias
  rose.peekaboo -> boo.
- Edited data/scenes.js: four tips say Rose's RASPBERRY.
- Edited data/lines.js: Rose lines for the new keys. Reused baked words: boop ("Boop!"), piggyback_pounce (= pounce). New (re-bake):
  boo, dress_up_tiara, giggle_storm, lamby_hug, floor_is_lava, bedtime_story, lamby_boomerang, pillow_fort.
- Project: claude/kit-recipe.md gained the move review rules. data/voice-clips.js, index.html and demo/ untouched.

## 2026-10-24: Option 3 phase 5a (Tom's Primary Ultimates), published as version 181
- Primaries per the brief (core rule 2): A6 Boarding Group Zero `delta_ult`, B6 Cartridge Tilt `cart_ult` (Option 2 cards).
- Edited data/battle2-data.js: both added to B2_SKILLS.tom.o3. Boarding Group Zero's "refill self" is +3 VP (brief's VP cap).
- Edited engine/tom-moves.js: fourth IIFE with the two 6 s cinematic set pieces (letterbox, jet, cartridge, whole-stage tilt).
  New sounds sfx.jet, sfx.chunk, sfx.blow.
- Edited engine/battle2-ui.js: monsters can be spun/shifted by a scene (f.spin, f.ox, f.oy, refreshed via f.spinAt).
- Edited engine/battle2.js: shieldBreak takes an optional message.
- Edited data/abilities.js: Boarding Group Zero description says +3 VP.
- Edited data/lines.js: tom.delta_ult, tom.cart_ult (re-bake).
- data/voice-clips.js, index.html and demo/ untouched.

## 2026-10-24: Option 3 phase 4b (Boppy's and Amy's Primary kits, set pieces), published as versions 179 and 180
- Merged on top of v178 (the Long Island rename from another session): three-way merge, no conflicts.
- New engine/boppy-moves.js (v179) and engine/amy-moves.js (v180), added to index.html after engine/deedee-moves.js, in that order.
  12 set pieces each (basic, signature show, A1-A5, B1-B5), 3.5 to 5 s, on engine/stage.js. Prefixes bp_, am_.
- Edited data/battle2-data.js: B2_SKILLS.boppy.o3 (Cap Check, GRUMBLE, A1-A5, B1-B5; pepper:true on the three pepper moves) and
  B2_SKILLS.amy.o3 (Starting Step, PEP TALK as `pep_talk`, A1-A5, B1-B5).
- Edited engine/battle2-moves.js: GRUMBLE and PEP TALK hand Option 3 casts to RECRUIT_MOVES.boppy.grumbleShow / amy.pepShow.
- Edited engine/battle2-kind.js (v180): B8_SIG_LEGACY maps renamed signatures to their legacy kindness keys
  (deedee.moon_back -> hug, nara.puppy_eyes -> puppy, amy.pep_talk -> pep). Fixes a regression since 3d/4a: Option 3 MOON & BACK and
  PUPPY EYES gave no Warmth to monsters and did not count as liked.
- Edited data/abilities.js: like aliases boppy.recliner -> recliner_reservation, boppy.trackstar -> nineteen_seventy, amy.pb -> goldstar_recess.
- Edited data/scenes.js: tips name Cap Check, Patient Angler, One Pepper Sensible Size, Starting Step; the FINAL GRADE tip fires for
  Eyes Up Front or False Start too.
- Edited data/lines.js: 11 Boppy and 11 Amy lines (re-bake), plus amy.pep_talk (same words as pep; already baked).
- data/voice-clips.js and demo/ untouched.

## 2026-10-24: Rename to The Adventures of Tom; hometown is Long Island, published as version 178
- Title: page title and iPhone home-screen name (apple-mobile-web-app-title) are "The Adventures of Tom"; title logo ribbon reads
  THE ADVENTURES OF; new/load prompt title too. Same in demo/index.html and demo/engine/splash.js.
- Every "Little Elsewhere" in game text, map names, HUD eyebrows, toasts, travel captions, song name, menu fallback and comments is now
  "Long Island". "in Little Elsewhere" became "on Long Island" (New York usage).
- Elsewhere Taxi Co. -> Long Island Taxi Co.; Elsewhere Elementary -> Long Island Elementary (pixel sign LONG ISLAND);
  Elsewhere Regional -> Long Island Regional; Moon Club sheet music MOON OVER LONG ISLAND; luggage tag says LONG ISLAND.
- Flight Zero's destination is now NOWHERE (boarding pass FROM: LONG ISLAND. TO: NOWHERE.; THANK YOU FOR FLYING NOWHERE).
- Internal ids unchanged (map ids, `le` region key, le-save-* keys, data/maps-le.js), so saves keep working.
- Files: index.html, engine/{world,school-render,town-render,chapter-select,followers,menu,travel,battle-draw,intro,shop,story,splash,la}.js,
  data/{scenes,battle2-data,school-monsters,maps-le,party,npc-sprites,songs,terminal-monsters}.js, and the matching demo/ files.
- index.html and demo/index.html: removed the doubled page wrapper the reader had baked in (first and last line).
- Spoken lines: none in LINES changed; no baked clips affected.

## 2026-10-24: Animation quality pass (Tom, Grace, Rose, Deedee set pieces), published as versions 174 to 177
- Edited engine/rose-moves.js (v174), engine/grace-moves.js (v175), engine/tom-moves.js (v176), engine/deedee-moves.js (v177): a third
  IIFE in each with 3.5 to 5 s set pieces for all 12 Option 3 Primary moves (basic, signature show, A1-A5, B1-B5), built on
  engine/stage.js like TNB's and Nara's. The phase-3 animations stay in the files but are superseded (later assignment wins).
  Signature hooks unchanged: RM.rose.sillyShow, RM.grace.danceShow, RECRUIT_MOVES.deedee.hugShow and moon_back,
  RECRUIT_MOVES.tom.defendShow (still a step list around b2DefendSteps).
- Edited engine/rose-moves.js first IIFE: exposes RFX.plush and RFX.lamb (Lamby drawing) for the set pieces.
- Edited engine/stage.js (v174): ST.keys `sc` can be a function of (u,t); fx.path gets `st:true`.
- No data, effect, line or index.html changes. Spoken lines: none added or changed.
- Project files: claude/kit_test.py (PARTY env override, per-move sheet name with --only), claude/smoke.py (IDS env: which characters
  to drive; last one uses the gamepad helper path). Not published. data/voice-clips.js and demo/ untouched.

## 2026-10-24: Option 3 phase 4a (TNB's and Nara's Primary kits, set-piece animations), published as version 173
- New engine/stage.js (choreography helpers RFX.ST), added to index.html after engine/recruit-fx.js.
- Edited data/battle2-data.js: B2_SKILLS.tnb.o3 (Clay Offcut, WARDROBE, A1-A5, B1-B5) and B2_SKILLS.nara.o3 (Happy Hip Check,
  PUPPY EYES as `puppy_eyes`, A1-A5, B1-B5).
- Edited engine/tnb-moves.js and engine/nara.js: second IIFE each, 3.3 to 4.9 s set pieces for all 22 moves, including the new
  WARDROBE and PUPPY EYES shows (WARDROBE's legacy function now routes Option 3 casts to the show).
- Edited engine/battle2-effects.js: new op ['ift',member,thenOps,elseOps].
- Edited data/abilities.js: like aliases for Quick Change, Next Stop, PUPPY EYES.
- Edited data/scenes.js: Director's Cut tip names Kiln Door Policy instead of Kiln Blast.
- Edited data/lines.js: 11 TNB lines and 11 Nara lines (re-bake), plus nara.puppy_eyes (same words as puppy; already baked).
- New claude/kit_test.py and claude/smoke.py in the Project (not published). data/voice-clips.js and demo/ untouched.

## 2026-10-23: Option 3 phases 3c and 3d (Rose's and Deedee's Primary kits), published to the live artifact
- Edited data/battle2-data.js: B2_SKILLS.rose.o3 (Tiny Tap, SILLY, A1-A5, B1-B5) and B2_SKILLS.deedee.o3 (Dish-Towel Flick, MOON & BACK as `moon_back`, A1-A5, B1-B5).
- Edited engine/rose-moves.js and engine/deedee-moves.js: second IIFE each, animations for 11 moves plus the new SILLY and MOON & BACK shows.
- Edited engine/battle2-moves.js: SILLY plays the new show for the Option 3 version.
- Edited engine/battle2-effects.js: new op ['ifup',member,thenOps,elseOps] (Lookout Lamby).
- Edited data/abilities.js: like aliases for Peekaboo, Registered Nut, Rhubarb Crisp, Sunday Dinner.
- Edited data/lines.js: 11 new Rose lines and 11 new Deedee lines (re-bake): rose.tiny_tap, where_did_i_go, royal_inspection, giggle_echo,
  lamby_appointment, floor_is_jelly, lookout_lamby, ribbon_rescue, lamby_ending, pocket_princess, princess_parasol; deedee.dish_towel_flick,
  registered_nut, corner_piece, pepper_free_plate, rolling_pin_rounds, oven_mitt_ultimatum, brisk_means_brisk, garden_shower, windows_open,
  spotless_record, take_a_breather. Also deedee.moon_back (same words as hug; already baked).
- New tools/phase3cd-test.py; edited tools/kit-test.py, tools/phase1-test.py, tools/phase3a-test.py. Not published.
- Published: every game file changed since the baseline (phases 1, 2, 3a, 3b, 3c, 3d) went to the live artifact in one update. data/voice-clips.js and demo/ untouched.

## 2026-10-23: Option 3 abilities, Phase 3a (Tom's Primary kit)
- Edited: data/battle2-data.js (Tom's 12 Primary moves), engine/tom-moves.js (their animations, new DEFEND beats), data/lines.js (11 lines),
  engine/progress.js (b8Move: kit plays each slot's equipped version), engine/battle2.js (DEFEND animation hook, crust only if a member is up,
  liked-move aliases), engine/battle2-effects.js (b8Likes, b8LikeShown), engine/battle2-kind.js (move names and Inspect hint), engine/feel.js
  (High-Five on Warmth packets), data/abilities.js (B8_LIKE_ALIAS), data/scenes.js (tip texts use the new move names), index.html (tall skill grid scrolls to the top).
- New (not published): tools/phase3a-test.py.
- Spoken lines added (need baking): tom.controller_tap, starter_inspection, proofing_drawer, toast_negotiations, warranty_void, crumb_barrier,
  five_minute_review, dpad_detour, save_sandwich, radical_solutions, patch_notes.

## 2026-10-23: Option 3 abilities, Phase 2 (effect registry, translations, tuning caps)
- New: engine/battle2-effects.js (warm, Close-Up, mile, trend, scent, tray, continuity; Option 2 translations; caps). Added to index.html after engine/battle2-traits.js.
- Edited: data/abilities.js (B8_FX, B8_ST_ALIAS), engine/battle2.js (hooks: damage, dodge, targeting, statuses, effects, end of turn), engine/battle2-traits.js (trend lock, Hot Dish), engine/battle2-kind.js (Tombo Mile counts toward the cap), engine/battle2-ui.js (Hot Dish tray and row), index.html (script tag, Hot Dish CSS).
- New (not published): tools/phase2-test.py.
- Spoken lines: none added or changed.

## 2026-10-23: Option 3 abilities, Phase 1 (data model, progression, saves)
- New: data/abilities.js (Primary and Remix for every slot, combos, legacy map). Added to index.html after data/progress.js.
- Edited: data/progress.js (old node lists and SP numbers removed; path names kept), engine/progress.js (new Stampcard, Polish, Remix Tickets, Loadouts, Mastery, save v4 migration), engine/battle2.js (Polish multiplier, reward list per level), engine/battle2-kind.js (Polish on Warmth), engine/feel.js (reward cards, Auto-Stamp spending option), engine/story.js (save v4), index.html (script tag, Stampcard and reward CSS).
- New (not published): claude/status.md, tools/phase1-test.py.
- Spoken lines: none added or changed.

## 2026-10-23: Option 3 abilities, Phase 3b (Grace's Primary kit)
- Edited data/battle2-data.js: B2_SKILLS.grace.o3 (Heel Click, DANCE, A1-A5, B1-B5).
- Edited engine/grace-moves.js: animations for the 11 moves plus DANCE's new show.
- Edited engine/battle2-moves.js: DANCE plays the new show for the Option 3 version.
- Edited engine/battle2.js: Shushed monsters skip Chatter acts; o3 own-action statuses on monsters last N actions.
- Edited engine/battle2-effects.js: effects can target a member by id (Rose).
- Edited data/abilities.js: like aliases for Squishy Squeeze and Like and Subscribe.
- Edited data/scenes.js: tips renamed to Grace's new moves.
- Edited data/lines.js: 11 new Grace lines (re-bake): heel_click, dumpling_consult, glitter_checkin, ringlight_rescue,
  comment_moderation, thumbnail_face, eight_count, beam_borders, warmup_lap, mat_patrol, spotlight_shuffle.
- New tools/phase3b-test.py; edited tools/phase1-test.py, tools/phase3a-test.py.
- New tools/kit-test.py (fast generic kit test) and claude/kit-recipe.md (build steps and gotchas). Not published.
