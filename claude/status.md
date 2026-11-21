# Status (The Adventures of Tom, first town Long Island; formerly Little Elsewhere)
- 2026-10-27 (PUBLISHED as v327, 1793131941-e819; v325, v326 were the earlier steps): TOM DIALOGUE TONE PASS. Audit of all 215 non-battle Tom lines (data/scenes.js, engine/travel.js); battle lines untouched. Four Tom lines (and one TNB reply) changed in data/scenes.js only; Tom kept the Deedee gas line and the Justin store-bought exchange as they were. Page unchanged. Tested: load with no page errors, both split lines fit the portrait dialogue box.
  Lines to bake (DIALOGUE, add to the next pending baker; the old clips stop playing, text match only):
  | Ch | Speaker | New text |
  |---|---|---|
  | ch2 loft (SCENES.ch2Loft) | Tom | I flew three thousand miles to see you. The starter is the bonus. |
  | ch2 loft | TNB | Main event. I'll take it. Sounds premium. Like your seat. |
  | ch2 starter (SCENES.ch2Starter) | Tom | The jar gets fifty grams of flour. You get the whole week. |
  | ch2 starter | Tom | ...And you steamed my shirts for the flight. You win. You always win. |
  | ch2 Griffith boss intro | Tom | Everybody says goodbye. Then they come back. That's what planes are for. |
  | ch2 Griffith boss intro | Tom | Things have to move. |
  | ch8 car barn (SCENES.ch8Barn) | Tom | It's beautiful. You can cry a little. I'll wait. |
  | ch8 car barn | Tom | ...It's also freezing in here, and it's seventy-four degrees outside. |
  Retired texts (clips in dialog-ch2.js / dialog-ch8.js are now orphans; prune at merge): "I flew three thousand miles to see my sourdough starter. You're a bonus.", "I'll take bonus. Bonus sounds premium. Like your seat.", "The jar never leaves wet towels on the bed.", "...The jar also never steamed my shirts for my flight. You win.", "Some of us have a six AM flight out of LAX. Things have to move.", "It's beautiful. It's also freezing. It's seventy-four degrees outside."
- 2026-10-27 (PUBLISHED as v303, 1793082950-f713): BOPPY AND DEEDEE VERDICT BUILDS MERGED after Tom's "keep everything". Server-side copy from the review viewer (PJvSU5G6S7FkZowaqUAJYC) into the game link of engine/boppy-moves.js (IIFE bf_), engine/deedee-moves.js (IIFE df_), data/lines.js, data/battle2-data.js, data/abilities.js; page unchanged (v302 page, wrapper-stripped). Live files were v302 and differed from my base only by my edits; live sha256 of all five now equals the tested build (boppy-moves 76bc2ea8, deedee-moves 07b22f10, lines 17a2c270, battle2-data 6754ad86, abilities c50d0fae).
  BOPPY: Cap Swat = real baseball cap drawn at final size (bigCap) over a bare head (bare_* frames); Van Cortlandt Park '70 = young Boppy (dark hair, tank top, shorts, socks) swapped in for the flashback and restored (xc_ult wrapper injects youngOn/youngOff via ST.play); Everybody Waits line is now "Everybody slow down. My family goes first!" (key unchanged).
  DEEDEE: Dish-Towel Flick whiplash + checked towel (SC.df_towel); MOON & BACK moonbeams (SC.df_moon, df_tuck); Registered Nut stethoscope (SC.df_steth); Oven Mitt Ultimatum quilted mitts (SC.df_mitts); Brisk Means Brisk renamed BRISK WALK (key brisk_means_brisk) with weights (SC.df_weights); Garden Shower spray (SC.df_hose); Beanie Master opening line beanie_master_open "I am the Beanie Master!"; Rise and Shine voice direction only.
  Tests before merge: kit_test boppy and deedee --speed2 FAILS: [], smoke IDS=boppy,deedee FAILS: [], viewer portrait+landscape FAILS: [], frames checked.
  Lines to bake (scripts in claude/voice-baker-scripts-tombo.json): boppy.everybody_waits (new text; old clip stops playing), deedee.beanie_master_open (new, silent), deedee.rise_and_shine (sing-song; old clip plays until re-baked).
- 2026-10-27 (PUBLISHED as v299, 1793080067-6b11): TASK A TOWNSPEOPLE. claude/npc-sprites-ch3-6-append.js appended to data/npc-sprites.js (REEL_NPC, RAY_NPC, TONI_NPC,
  KIKI_NPC, DANA_NPC, PRUITT_NPC, DELGADO_NPC, KOWALSKI_NPC, IKE_NPC, HALVERSON_NPC, BERNADETTE_NPC, LONGCOAT_NPC; OW.<look> via prepOW at 1). engine/town-render.js
  drawActor: after the sheet branch, `if(!v&&OW[a.paletteName]) drawSheetActor(a,OW[a.paletteName])`, so the 12 looks (data/maps-le.js pier, schoolyard, school;
  data/maps-la.js studio, oakpark; scene spawns pruitt, bernadette, longcoat in data/scenes.js) draw from their sheets with no map edits. VILLAGERS still wins for any
  look that has an entry. Tests: claude/npcprobe.py (new: finds each npc, stands Tom beside it, crops a contact sheet shots/npc-sheet.png; all 12 at Tom's height,
  FAILS: []), smoke IDS=grace,rose, kit_test grace --speed2: FAILS: []. Tombos SKIPPED to the end of the queue by Tom (27 Oct). The six Griffith Park drop
  items are defined in engine/la.js (next.md's "missing items" note was wrong).
- 2026-10-27 (PUBLISHED as v287, version 1793073843-2c75; built on v286 1793073658-331f, which differed only by a blank line): ONE BUILD = Task B verdicts + AMY REWRITE + CONTRACTION PASS. 39 files published (list = the 'Files changed' line below plus the monster data files touched by contractions: data/monsters.js, la-monsters.js, backlot-, barn-, club-, marsh-, oak-, school-, library-, terminal-monsters.js, data/maps-la.js, data/bonus-nine-scoops.js, engine/nara.js, shop.js, la.js, rose-, tnb-, deedee-, grace-, boppy-moves.js). No voice files or demo/ published. Tom has not yet seen it on his phone.
  Task B (Tom's 26 Oct night instructions): Button Mash REPLACED (Tom presses a button, says "Ugh, it's not connecting!", throws the controller from his spot);
  Overpriced Gadget renamed RETAIL THERAPY (key overpriced_gadget, desc matches the animation); Flashcard Flurry smaller real kanji; grace3 Golden Dumpling Wish
  REPLACED by a bedazzle craft scene (rhinestones, glue gun, glitter; same numbers); every other move KEPT. Draft bug fixed: the overpriced_gadget entry had merged into
  sourdough_snob in battle2-data.js.
  Amy rewrite (claude/amy-dialogue-review.md A to F; canon: Amy is Long Island Elementary's SPECIAL EDUCATION teacher, resource room, twelve kids from every grade; "thirty
  parents" on conference night stays): calmer lines in data/lines.js (join, burpee/burpee_blitz, redpen/red_pen, quiz/pop_quiz, pep line 1, detention_ult, hurt 1 and 3, win 3,
  praise 3, dc2); data/maps-le.js house revisits 2, 8, 9, 10 and the bulletin board; engine/story.js declines ch3, ch4, ch6; data/scenes.js 1514, 3406, podium line;
  engine/followers.js, engine/travel.js, engine/battle2-moves.js, engine/recruit-moves.js, engine/amy-moves.js messages. Renames (keys unchanged): Red Pen -> GREEN PEN
  (also item a_redpen), Pop Quiz -> SURPRISE QUIZ, Detention Forever -> NOBODY LEAVES (data/party.js, data/abilities.js, data/battle2-data.js, data/progress.js, engine/battle2-kind.js,
  engine/battle2.js). The red F / SEE ME AFTER CLASS visuals were left as they are.
  CONTRACTION PASS (Tom, 26 Oct 22:51): 1,356 strings in about 34 files now use contractions (scenes 478, maps-la 160, maps-le 110, lines 55, bonus-nine-scoops 53, travel 44, nara 40,
  battle2 36, ...). Skipped: dialog-cast.js, abilities.js, cloud-save.js, menu.js, battle2-ui.js, feel.js and desc strings in battle2-data (rules text). Tools: /home/claude/tools/contraction_scan.py,
  contract_apply.py (BUILD BAKED_JSON OUT_DIR), baked-texts.json. VOICE SAFETY: new data/contraction-alias.js (CONTRACT_OLD = {newText: oldText}, 762 entries covering all
  774 baked rows), script tag in index.html right before engine/speech.js; say() in engine/speech.js allows the old text; dvClip in engine/dialog-voice.js falls back to the old key.
  Tested: aliastest.py (both paths play), amy/tom/grace kit_test --speed2 and smoke IDS=amy,deedee (FAILS: []), frames of Nobody Leaves and Surprise Quiz fit. Rose kit: only
  rose.silly "no line", which is PRE-EXISTING (LINES.rose has no silly key; RASPBERRY speaks no words), not a regression.
  Files changed (all now live in v287): index.html, data/contraction-alias.js (new), engine/speech.js, engine/dialog-voice.js,
  engine/tom-moves.js, engine/battle2-kind.js, engine/battle2.js, engine/battle2-moves.js, engine/amy-moves.js, engine/recruit-moves.js, engine/followers.js, engine/travel.js,
  engine/story.js, data/lines.js, data/scenes.js, data/maps-le.js, data/party.js, data/abilities.js, data/battle2-data.js, data/progress.js, plus the contraction files
  (/home/claude/tools/contract_out/changes.tsv lists every file and line). Never publish data/voice-clips.js, voice files or demo/.
  Known small things: Tom's seat_1a line says "lying flat" but the animation is upright (voiced, left); Amy house bulletin line is silent until baked.
  Lines to bake: scripts are in claude/voice-baker-scripts-tombo.json (118) and claude/dialogue-scripts-amy-rewrite.json (9 dialogue lines, {chapter, lines:[{voice, speaker, text,
  ctx, after, script}]}). Battle: tom.button_mash "Ugh, it's not connecting!", grace.tombo3 "Ta-Ta, you hold the glue gun! I do the rhinestones!", tom.tombograce3 "This glitter
  will be in my house until 2031.", amy.join, amy.burpee + burpee_blitz, amy.redpen + red_pen, amy.quiz + pop_quiz, amy.pep + pep_talk line 1, amy.detention_ult, amy.hurt 1 and 3,
  amy.win 3, amy.praise 3, amy.dc2. The old clips for these stop playing. Contraction: the 762 aliased lines play their old clips until re-baked; drop CONTRACT_OLD entries as real
  clips arrive.
- 2026-10-26 (DRAFT, game NOT published, live stays v279/v280 per next.md): TASK B built Tom's 10 verdicts in /home/claude/build and published TWO REVIEW VIEWERS.
  Tom viewer v2 (1793068697-6f0d, collection tom-feedback2): Button Mash line only; Sourdough Snob renamed Seven-Tier Showstopper (key sourdough_snob);
  Seat 1A upright; Flashcard Flurry real kanji; Kanji Strike rebuilt video-game style with big fire. Tombo viewer v2 (1793068703-3554, collection
  tombo-feedback2): grace1 Squishy Delivery (dice squishy); grace1_dc duet; grace2_dc Tom faceplant + OW + one Grace combo; grace3 new lines and funnier scene;
  rose2_dc eye-cover bug fixed. Files changed vs live: engine/tom-moves.js, engine/battle2-kind.js, data/lines.js, data/battle2-data.js, data/abilities.js,
  data/scenes.js, data/bonus-nine-scoops.js. smoke passed, frames checked, no page errors. MERGE only after Tom's OK: compare sha256 of live files first.

- 2026-10-26 (latest, live v279 1793064622-145f): TOMBO MISSING LINES VOICES MERGED (voices__23_.json, 26 clips). 22 live: Tom 6
  (dcboppy3, dcdeedee3, dcamy3, dcnara3, dcff4, dctnb3), Rose 11 (lamby_hug, boo, giggle_storm, lamby_boomerang, bedtime_story, lookout_lamby,
  dcff1, teaparty_ult, dcff2, dcff4, dress_up_tiara), Boppy 2 (dc3, dcff3; pitched with rubberband pitch=0.9535, 44100 Hz, 128k), TNB 2 (dc3,
  dcff1), Nara dc3 (sound effect). 4 HELD because the baker's export carried PRE-RECAST voice ids for grace, amy and deedee (the baker used
  stale voices saved in Tom's browser): grace.dcff2 "It's dairy-free, Mom! Don't get up!", amy.dc3 "Shortcuts don't COUNT, Tom!",
  deedee.dcff3 "Keep up, honey! Arms at ninety!", deedee.dc3 "Everybody eat! Wait, the gumbo goes HERE. Elbows off!". Live recast voices
  were kept (VC.voices untouched). Merge script claude/merge-tombo.js (live data dir + voices.json + outdir; skips any character whose voice_id
  differs from the live one, merges Nara prompts only, replaces clips by text in any kind). Published only data/voice-clips.js and
  data/voice/{tom,rose,boppy,tnb}.js; page unchanged. Tested: every clip's text is in LINES, a clip with that text exists under the same kind,
  decodes via AudioContext, no page errors (tools/vtest.py). NEXT: bake the 4 held lines with the live voices (small baker:
  `MISSING=1 node build.js <vdir> voice-baker-scripts-tombo.json out.html` from the live files) and tell Tom to open it in a browser where the
  baker voices are the recast ones (clear the stale saved voices).
- 2026-10-26 (latest, live v277 1793063215-45cc): BONUS CHAPTER NINE SCOOPS (claude/bonus-chapter-nine-scoops.md), selectable on the
  title screen (BONUS > NINE SCOOPS). New data/bonus-nine-scoops.js (script tag after engine/chapter-select.js): CHAPTERS[21] Nine Scoops
  (bonus:true, allow [], noFlight), beginBonus/confirmBonus (resetStory full 21, flag bonus, Tom+Grace+Rose at level 5 via b6Prep, 60 coins,
  bag bandage x2 juice lemonade, tombo:grace1/rose1), four monsters (MONSTERS + B2_FOES + B2_GRUMP + B6_XP: gremlin x3 formation, slushslug,
  conehead x2, brainfreeze boss in B2_SHAKE_STYLE with adds gremlin and an ICE SHELL brace), phase-1 cutoff (b2CheckPhase/b2BossTurn wrappers:
  at half HP the lid slams, Rose is frozen, b2End('shell'); HP floor 45% until the printer scene), items present/instax/nsphoto, sfx quack
  shutter printWhir blow birthdayChime, PROP2 nsduck/nscow/nsdice/nsphoto/nsinstax, 29 LINES (tom/grace/rose, unbaked), B2_TOMBOS row `wish`
  (who tom/grace/rose, 75% HEART, sparkle+cozy hybrid 6.0 all, goof 1 t, heal .25 party, kindV 300; B2_TOMBO_ANIM.wish: Rose's BOO behind the
  monsters, a black-and-white cookie cake drops, nine candles lit, Grace handsprings onto it, nine candle hits then WISH!, confetti, an Instax
  print at the end when ns-printer), Grace's INSTAX skill (b6Kit wrapper, 4 VP, goof all, kind 160; RECRUIT_MOVES.grace.instax flash + print),
  scenes nsOpening (the Chapter 1 opening tuned for the birthday: duck/cow/dice squishies, showcases, selfie), nsGoal, nsCreamery (bakery room,
  Mr. Pistachio in an ice cube, 3 gremlins), nsFountain (Rose Boos the Slushie Slug: goofed setup), nsTrail (Cone Heads, one takes Moo-rielle),
  nsPond (Grump cameo, dice, Brain Freeze phase 1, the printer scene, phase 2 via SCENES.nsBoss2 at 60% HP and HEART 75), nsRetry, nsAfterBoss,
  nsEnd (Amy's house party, BONUS CHAPTER COMPLETE card), 8 TRIGGERS, STORY_WORLD (bakery renamed Sprinkle Street Creamery / SCOOPS in chapter 21,
  hollow monsters hidden), HOLD_RULES, Bun away, gates (school, pier), STORY_MAPFX (carried duck/cow, the gift on Tom, ice cubes, creamery frost,
  camera flash), TUTORIALS nsGremlin/nsSlug/nsCone/nsBoss1/nsBoss2. Engine edits: engine/splash.js (5-choice launch grid: PART 1, PART 2, BONUS,
  DEMO, BATTLE LAB; bonus panel NINE SCOOPS / LOAD / BACK; splashMove grid nav for any n), engine/intro.js (intro.squishy and intro.showcase take
  {sprite,pal,lines,who,plain}; drawIntroWorld gets r from IA), engine/story.js (card head BONUS CHAPTER [COMPLETE] for a bonus chapter; save
  summary "Bonus · Nine Scoops"). Tests: tools/ns_test.py (title, opening, every scene, every fight, the shell cutoff, the printer scene,
  BIRTHDAY WISH from the Tombo menu, INSTAX in Grace's kit, the ending, landscape; FAILS: []), smoke IDS=grace,rose,tom (pass), kit_test grace
  --speed2 (pass), frames checked. Known: BIRTHDAY WISH can finish Brain Freeze's phase 2 outright (about 9x30 + 140 at level 5-6); the cake
  hides the boss while it sits on it; Deedee and Boppy at the party are scripted spawns with their sheets; the creamery fight uses the hollow
  battle background. Repo NOT pushed.
- 2026-10-26 (latest, live v276 1793048038-09d2): ROSE APPROVED AND LIVE. Tom approved Rose rounds 1 to 3 (with Grace, already live).
  engine/rose-moves.js, data/battle2-data.js, data/abilities.js, data/lines.js copied server side from the Rose viewer (v5) into the game,
  page unchanged. Pre-check: game was still v275 and the viewer's three data files differed from it only in Rose rows. Tests: smoke
  IDS=grace,rose (pass, before and after publish), kit_test rose --speed2 (all 18 runs pass; rose.silly 'no line' intended), frames checked.
  Live sha256 of all four files matched the tested build. Rose's 8 new lines added to claude/voice-baker-scripts-tombo.json (98 scripts).
  project-instructions.md Rose line now lists the final kit. Both kid kits are final; Tom viewer still unreviewed.
- 2026-10-26 (round 3, game still v275): ROSE ROUND 3 in the Rose viewer only (v5 1793045158-307a). engine/rose-moves.js new IIFE prefix rh_
  at the end: Floor Is Lava (SC.rh_lava, back layer, added by a wrapper at 1250 ms; SC.rv_cush now empty): Rose stands on a 3/4-view couch
  seat cushion (puffy top, piped front band, dent under her feet) floating in a blobby lava sheet that runs from the cushion to the monsters'
  feet. Pillow Fort (SC.rv_fort replaced): walls of upright tan couch back cushions (puff() bulging outline, gradient, piping, tufted
  buttons, corner creases), 2 or 3 per side, throw pillows on the roof corners. Cushion fabric is tan (SOFA consts in the rh_ IIFE) in both.
  engine/rose-viewer.js flags only these two; feedback collection rose-feedback-r4. Tests: kit_test rose --only=floor_is_lava,pillow_fort
  (pass), smoke IDS=grace,rose (pass), gvtest LKEYS=floor_is_lava,pillow_fort (pass), frames checked with 3 and 4 members.
- 2026-10-26 (latest, live v275 1793041326-5b30): GRACE APPROVED AND LIVE. Tom approved all of Grace; engine/grace-moves.js and
  data/grace-wheel.js copied server side from the Grace viewer into the game (page unchanged). project-instructions.md Grace line updated.
  ROSE ROUND 2 in the Rose viewer only (v4 1793042168-7a0c; NOT in the game): engine/rose-moves.js new IIFE prefix rg_ at the end,
  data/battle2-data.js and data/abilities.js (dress_up_tiara renamed), data/lines.js (4 Rose lines), engine/rose-viewer.js (only the 7
  round-2 moves flagged; feedback collection rose-feedback-r3, localStorage rose-viewer-feedback-r3). Changes (details in
  claude/rose-moves-feedback.md "Round 2"): Boo!! (vanishes at home, no approach), Rainbow Unicorn Cut-Out replaces Macaroni Crown (draws,
  cuts, sticks it on the monster), Lamby Hug (one lamb per hand, no overlap), Tea Party (Backup Lamby pours from a teapot, chairs apart),
  Lamby Boomerang (thrown from her home spot, loops back, then she rides Tom), Bedtime Story (line), Pillow Fort (cushion walls outside the
  party, roof above every head; checked with 3 and 4 members). Tests: kit_test rose --speed2 (pass, rose.silly no line intended), smoke
  IDS=grace,rose (pass), gvtest.py VB=/home/claude/vb ID=rose (0 fails, portrait 14 + landscape 7).
  TO PUBLISH ROSE (on Tom's approval): copy engine/rose-moves.js, data/battle2-data.js, data/abilities.js, data/lines.js server side from the
  Rose viewer into the game, page unchanged, then smoke. Check first that the game's battle2-data.js / abilities.js / lines.js did not change
  after v274 (sha256 vs the viewer's base), or merge.
- 2026-10-26 (later, game still v274; NOT published to the game): TOM'S MOVE FEEDBACK BUILT, Grace and Rose, live in the two viewers only.
  Grace viewer v2 (1793034446-be6d) carries engine/grace-moves.js and data/grace-wheel.js. Rose viewer v3 (1793035951-517e) carries
  engine/rose-moves.js, data/battle2-data.js, data/abilities.js, data/lines.js. Every other file in both viewers equals v274.
  GRACE (claude/grace-moves-feedback.md; the other 11 moves untouched): engine/grace-moves.js new IIFE "Tom's move feedback (2026-10-26)",
  prefix gf_. DANCE = choreographed 8-count on the GRACE_WHEEL rig (claps, grapevine, sways, spin, final pose; spot left of the party),
  Dance Battle = strut, YOU., COME ON!, shimmy, POP!, spin, vogue, the monster tries and falls, SERVED!, steals a buff; Handstand Contest =
  true handstand pose (hanging hair via hangBody), the others wobble and topple, straddle, trophy. data/grace-wheel.js: hangBody(), arm
  fold/elbow/length and knee options, mirror(). Same numbers, lines and closing messages.
  ROSE (claude/rose-moves-feedback.md): engine/rose-moves.js new IIFE prefix rf_. Lamby is now worn and dingy by default; plush(...,{v:'backup'})
  draws the bright Backup Lamby. New sounds sfx.pbbt (synth raspberry), sfx.poof, sfx.poke. Key mapping (KEYS KEPT, names changed):
  | Key | Now |
  |---|---|
  | boop | finger poke on the nose (3 pokes) |
  | silly (RASPBERRY) | real raspberry sound + tongue, no spoken words |
  | boo | poofs out, poofs in behind the monster, BOOOO!! |
  | dress_up_tiara | Macaroni Crown (arts and crafts) |
  | giggle_storm | Tickle Storm (feathers) |
  | lamby_hug / bedtime_story / teaparty_ult | Backup Lamby added |
  | lookout_lamby | Lamby Boomerang (both lambs; Rose still rides Tom) |
  | lamby_boomerang | Ms. Cathy's Snack Attack (Ms. Cathy = Deedee sprite recolored blonde, teal dress, glasses) |
  | pillow_fort | couch cushions |
  Names and descs changed in data/battle2-data.js (rose o3) and data/abilities.js (B8_KITS.rose); numbers unchanged.
  Tests: kit_test grace and rose --speed2 (pass; rose.silly reports "no line", intended), smoke default and IDS=grace,rose (pass),
  gvtest.py both viewers (all 14 portrait + landscape samples, 0 errors), frames checked.
  TO PUBLISH TO THE GAME (on Tom's approval): copy those six files server side from the viewers into the game link
  (files:{path:{artifact:<viewer url>,path}}), page unchanged, then smoke.
- 2026-10-26 (live v274, version 1793022409-0050): DIRECTOR'S CUTS PART 11, THE FOUR FINISH DCs: ff1_dc Pottery Lesson, ff2_dc Breakfast in Bed,
  ff3_dc The Family Walk, ff4_dc The Eight-Seat Dinner Table. ALL 25 Director's Cuts are built. data/battle2-data.js: four rows at the end of
  B2_TOMBOS (after ff4; `who`, dc:'ffN', tier 'ff', cost 75, flag tombo:ffN, no stat/mult = no damage). data/lines.js: appended block at the
  end (tnb.dcff1, rose.dcff1, grace.dcff2, rose.dcff2, boppy.dcff3, deedee.dcff3, tom.dcff4, rose.dcff4; silent until the all-voices bake;
  scripts added to claude/voice-baker-scripts-tombo.json, 90 scripts; Boppy brackets say thick New York accent, Deedee Long Island).
  engine/battle2-kind.js: b2TomboRows finish label gets "DIRECTOR’S CUT · " when T.dc; b2RunFinish banner head DIRECTOR'S CUT! when act.dc;
  b2FinishPlain message likewise; new section "Family Finish Director's Cuts" at the end of the Tombo IIFE. Shared helpers: dcRun(E2,spot,P,pose)
  (walks every member to spot[id], calls pose(u,ms,sp,S0,s2) until P.home, then runs them home; returns st[id]={x,b,f}), dcShow(P), dcHeights(E2),
  dcGlow(E2,st,H,color), dcFoeBurst(steps,o3,t0,gap,sfx,color,firstFn), dcHeartPath, dcPot (a pot from stacked rows), dcFr.
  Numbers (option 3 rows): ff1_dc goof t + st brace 1 party, kindV 300 (sparkle); ff2_dc refill party, cure debuff party, ct -.25 amy (cozy, party);
  ff3_dc heal .35 party, st tucked 3, cure amber (cozy, party); ff4_dc heal .4, cure debuff, vp 3 party (cozy, all, kindV 300).
  Scenes (about 6.3 to 7.7 s plus the closing message): ff1_dc four wheels at fc-92/-34/+24/+84 (fc = clamp(GR.x1+150, GR.x1+120, 420)) and a brick
  kiln at min(fc+156,548); pots grow, Rose's flies at the first monster, Grace's becomes a pink squishy, Tom's collapses, pots go to the kiln,
  fireworks burst over each monster. ff2_dc Amy asleep in a bed (Zs, window light), Grace stacks pancakes on a tray, Rose pours syrup, Amy wakes,
  the tower leans (TIMBER!) and pancakes splat on the monsters. ff3_dc night street with lamps lighting up and scrolling, Deedee/Tom/Boppy walk
  slowly (Boppy hunched), fireflies swirl, a heart over Tom, fireflies drift to the monsters and the party. ff4_dc a long table (x1 = 546, 300 wide,
  eight seats; the party sit at seats 1,3,5,7 with 4 members or 1,4,6 with 3), each seat lights an orb, orbs rise into a rainbow ring, fold
  into one heart and fire it at the monsters (not the ff4 Primary's CLINK). Tests: fprobe each DC (ff2_dc amy,grace,rose,tom; ff3_dc
  deedee,boppy,tom,grace; ff4_dc 4 members, 3 members, Nara; ff1_dc and ff4_dc with foe 3 dead), menu2.py (rows ff1_dc and ff4_dc show for tnb),
  smoke IDS=tnb,amy (pass), kit_test tnb --speed2 (pass; the flag is --speed2). Live sha256 of the three files matched. Repo NOT pushed.
- 2026-10-26 (09:35, v273 1793021042-178e): DIRECTOR'S CUTS PART 10: boppy3_dc Pepper Contest, tnb3_dc Golden Repair, nara3_dc Under the
  Table (data/battle2-data.js rows after boppy3 / tnb3 / nara3, data/lines.js 6 lines, engine/battle2-kind.js animations after
  deedee3_dc). Numbers: One Tiny Taste (tombo_boppy_taste), One Cup, Two Coasts (tombo_tnb_two_coasts, no barrier), nara3_dc = the
  tombo-review Effect (pinned 2 t on every enemy) at the tombo_nara_there multiplier 4.0 (sparkle, hybrid). ENGINE FIX: tintOf in
  battle2-kind.js cached by the string sp.pal+'|'... which is always '[object Object]', so two sprites tinted with the same color shared
  one palette (Boppy came out with Tom's colors; ff3's sepia film gave Deedee and Boppy the same palette). Now cached per palette object.
  6 new lines are silent until the all-voices bake (scripts added to claude/voice-baker-scripts-tombo.json, 82 scripts). Tier 3 DCs done.
  Tests below. Repo NOT pushed.
- 2026-10-26 (09:30, v272 1793019378-ed0e): DIRECTOR'S CUTS PART 9: amy3_dc Elevator Cheat and deedee3_dc Feast on Jefferson Park
  (data/battle2-data.js rows after amy3 / deedee3, data/lines.js 4 lines, engine/battle2-kind.js animations after rose3_dc). Numbers:
  amy3 and deedee3 Primaries carry the revamp plan tb_amy_3 / tb_deedee_3 numbers, so the DCs took the option 3 brief rows One Landing at
  a Time (tombo_amy_landings) and The Door Stays Open (tombo_deedee_open_door). 4 new lines are silent until the all-voices bake (scripts
  added to claude/voice-baker-scripts-tombo.json, 76 scripts; Amy and Deedee brackets say Long Island accent). Tests below. Repo NOT pushed.
- 2026-10-26 (08:55, v271 1793018157-1c17): QUIET AUTOSAVE (approved 25 Oct). engine/battle2.js: b2End autosaves quietly after every real fight
  (B2.cfg.npc set: win, lose or run; Battle Lab fights have no npc so never save); the old save on the victory card's close was removed (b2End
  covers it). engine/menu.js: menuLeaveStamps() saves quietly when leaving the Stamps tab (another tab, Back to the roster, or closing the menu).
  Shop close already saved quietly (engine/shop.js closeShop), unchanged. Tests: claude/savetest.py (wraps saveGame: win, lose, run 1 quiet save
  each, lab 0; stamps->items, stamps->back, stamps->close 1 each, other tabs 0; no loud saves), smoke IDS=grace,rose (pass). Live sha256 checked.
  Voice recast moved to the END of the queue (Tom, 26 Oct).
- 2026-10-26 (08:40, v270 1793017828-a093): DAMAGE RETUNE (claude/damage-balance.md "Problems found", all 11 rows). data/battle2-data.js
  (o3 rows): Rose floor_is_lava warmth x1.6; Tom know_it_all x1.4; Grace dance_battle hybrid x1.4, beam_dismount hybrid, split_leap hybrid,
  chalk_up hybrid x1.8; Deedee wine (o3) warmth x1.6, beanie_master x1.6, moon_ult x3.4; Amy pop_quiz hybrid x2.0; TNB rush_hour_racks warmth,
  curb_appeal hybrid; Rose piggyback_pounce x1.7; Nara dont_leave_me vp 3; Boppy seeds_of_trouble vp 3. data/abilities.js: Stampcard vp for
  seeds_of_trouble and dont_leave_me 4 -> 3. dmgprobe L30 matches the doc's expected numbers exactly. Live engine check (claude/dmglive.py, old vs
  new build, Math.random fixed): every changed move moved the expected way. Tests: smoke IDS=grace,rose (pass), kit_test grace (4 moves),
  rose (2), deedee (2) --speed2 (pass, frames checked). Live sha256 of both files matches. No lines changed (no re-bake). Repo NOT pushed.
- 2026-10-26 (02:05, v269): PER-CHAPTER AIRPORT GOODBYES (Tom: departure dialogue repeated every chapter). engine/travel.js only:
  DEPARTURES keyed by the chapter a flight starts (4 to 9) + departureNow() (full story, ch<N>-done set). Overrides Sal/Sol, Grace/Rose/Tom
  goodbye, TNB line and toast, recruit stay lines (boppy ch4, amy ch6, nara ch5/7/9) and Tom's in-flight pages; chapters 2-3 and demo keep
  the old voiced lines. New pages are silent until baked (list in claude/next.md). Tested: scripted departure run for chapters 1-8 (every
  trip played and advanced the chapter), text-fit frames, smoke IDS=grace,rose (pass). Built on v268 (1792993371-6dc3). Repo NOT pushed.
- 2026-10-26 (01:50, v267+v268): VOICE RECAST COMPLETE. From Tom's recast.json (recast r1): Deedee's Long Island voice (AoT Deedee (Long Island)
  3atomJkX2UWSHPSg86Z0: 41 battle clips in data/voice/deedee.js + 85 dialogue in ch1,2,3,5,7,9,10), Justin's (Pp9gl3BrnVq62dIWU2sx: 20 dialogue,
  13 Justin + 7 Mr. Halverson, ch1,5,10) and Aunt Ellie's (5nPpmcfu7pDFPztXuQIJ: 25 dialogue, ch1,9,10). Merged one voice at a time with
  claude/merge-one.js (all replaced, none added). Dolores (Starlite projectionist, ch2) keeps the OLD Ellie voice rnhEc2YmD7cQEaA4v9MM: new cast
  voice `dolores` in data/dialog-cast.js (old Ellie desc), speakers Dolores:'dolores', her 3 ch2 keys renamed ellie| -> dolores|, ch2 voices.dolores.
  dialog-cast.js desc edits live: Justin "and a Long Island New York accent" (no twang), Ellie "an old-school Long Island New York accent".
  Rose and Grace clips in the json were NOT merged (Rose keeps Lulu Lolipop; Grace already live). Published in two calls under 64 MB:
  v267 page + voice-clips.js, dialog-cast.js, voice/deedee.js, dialog-ch1,2,3,5; v268 dialog-ch7,9,10. Tests: voicecheck.py deedee/justin/ellie/
  dolores (all FAILS: []), smoke IDS=grace,deedee (pass, Deedee battle frame checked). Live file sizes match the local build.
- 2026-10-26 00:40: VOICE RECAST baker sent to Tom (voice-recast-baker.html; 550 lines: Grace, Rose, Amy, Deedee battle + dialogue ch1-10, Justin and Aunt Ellie dialogue).
Last session: 2026-10-26 (00:45, v260): SHORTER DIALOGUE BOX in portrait (Tom: it took too much of the iPhone screen). index.html only,
three rules after the dialogue-portrait block: html:not(.landscape) #dialog{min-height:0} (was 292px), html:not(.landscape) #dialog-text
{min-height: portrait face height} so the face always sits above the footer line, and main:has(#dialog:not([hidden])) #controls
{visibility:hidden} (the shorter box no longer covers the D-pad). Box is about 176px with a face, 163px without (390x844 test),
grows for long text and choices. Landscape untouched. Tested: portrait/landscape screenshots (face, plain NPC, yes/no choice), smoke
IDS=grace,rose. Repo NOT pushed.
Before that: 2026-10-26 (00:50, v259): BATTLE COMMAND CROSS REWORK (Tom's call). ▲ SKILLS opens the grid with the free basic move FIRST
(row 0, tag +1 VP, gold-edged), then every skill with its VP cost on the name line. ▶ is the character's signature (button shows its name,
VP and role, e.g. DANCE 3 VP · HEAL) and fires it directly (target picker if it needs one). ▼ BAG: COMPLIMENT-style row (when a monster
wants one), Warm Crust / Hot Dish, every pocket item (role tag + effect + count), RUN. ◀ Tombo unchanged. A on the cross opens Skills; the
cursor starts on the last move used (basic by default) or the Rose Mode tip. The old 'care' UI is gone (b2CareRows -> b2BagList).
Role tags, worked out from the move data (engine/battle2-ui.js b2Roles; an act may set roles:[...] to override): DMG (stat+mult),
HEAL (heal/revive/cure/cont on an ally), BUFF (ally st that is not a debuff, vp, refill, rack, defend, ally ct/negative ctq), DEBUFF
(debuff st, goof, smit, ctq, interrupt, steal, shieldBreak, scent, ct on foes). Solid chips = role; outlined colored chips = element.
Info line: "<name> (<cost>). <ROLES>. <desc> <Elem> = <plain meaning>. Monsters weak to it take +50%." (B2_ELEM_WHAT: Kinetic body moves,
Cozy warm homey comfort, Splash water, Sparkle shiny showy glam, Chatter words and noise, Amber sticky sap). Tombo rows get role chips too.
Also: engine/feel.js b7RecFor remaps b7Recommend (down->right, right i->up i+1); engine/story.js tutorial glow for praise rows in the Bag;
data/scenes.js 30+ tips retargeted (signature tips dir 'right', skill tips dir 'up', praise tips stay 'down' care:1, texts say ▶ / ▲ Skills /
▼ Bag); "Care & Bag" text removed from battle2-traits, menu, battle2 comment, backlot hints. index.html CSS .b2-role .b2-top .b2-cost
.b2-gain .b2-basic, .b2-el outlined. claude/smoke.py updated (ArrowUp, ArrowRight, Enter, Enter). Merged v256 tap-preview and v258
story.js mid-session. Tested: tools/ui_test.py and ui_flow.py (portrait, landscape, signature with/without target, bag item, compliment),
smoke IDS=grace,rose, kit_test grace dance,cartwheel. Repo NOT pushed.
Before that: 2026-10-26 (00:30, v258): NO DECLINE LINES. engine/story.js offerRecruit only: when canBeHere(m) is false (the chapter bars
them, allow excludes them, or they are out of their home town) it now returns silently, so the member's normal talk (and any item gift)
plays and nothing follows. Before, a decline line from CHAPTERS party.decline (or 'Not this time, Tom. Come find me later.') opened after
the talk. The decline data and declineLine() stay in story.js, unused. Allowed recruits still get the join line and YES / NO.
Tested: scratch recruit test (Amy barred via STORY.override: talk ends with no extra page; allowed: YES / NO offer opens), smoke
IDS=grace,rose. Built on v256; v257 (Cartwheel, below) landed mid-session and did not touch story.js (sha256 matched). Repo NOT pushed.
Before that: 2026-10-26 (00:40, v257): GRACE CARTWHEEL REBUILT. engine/grace-moves.js (G.cartwheelShow, gv_ section: SC.gv_dust,
SC.gv_shadow), new data/grace-wheel.js (GRACE_WHEEL; script tag right after engine/stage.js), index.html. Two real cartwheels per
claude/cartwheel-preview.html: lunge 0-250, wheels 250-1500 (rolls over the planted limb; contact order L hand, R hand, R foot, L foot;
dust per touchdown, gold burst at each upside-down), land 1500, side kick 1650-1800 (impact 1800, HI-YAH! .3 s), TA-DA! (gv_big sc 3)
2100-2900 with one hop, hops home 2900-3500 (flip frame), end 3450. Custom fx.path (not ST.keys): poses are 65x65 hip-centred frames,
so rot is the body rotation about the hip and base = hipY + 65 (scale 2). Front poses keep the celeb frame head/torso (arms cut by
FRONT_ARMS row ranges, legs cut at row 28), kick poses keep the idle frame (its own guard arms); limbs redrawn with two-bone IK
(arm 12.5, leg 11.5 sprite px). Pose table GRACE_WHEEL.P: stand, lunge, star, land, chamber, kick, sstand; blends snapped to 2-4 steps
and cached. Natural roll is about 428 px for two wheels and the gap is about 200, so x is scaled by K = gap/428 (clamped .35-1.15):
the planted limb drifts a little. Same line, damage, closing message. Tested: kit_test grace --only=cartwheel --speed2, smoke
IDS=grace,rose, frame grabs at 1x in portrait and landscape (claude scratch frames.py). Repo NOT pushed.
Before that: 2026-10-26 (00:15, v256): TAP TO PREVIEW in battle menus. engine/battle2-ui.js only. On touch, the first tap on a row in
Skills, Care & Bag, Bag or Tombo only highlights it and shows its description in the message box with "Tap again to use."; a tap on the
highlighted row uses it. Mouse, keyboard, D-pad and gamepad unchanged (cursor moves preview, A uses). Mechanism: pointerdown records
B2.ptr (pointerType); click on a non-selected row with B2.ptr!=='mouse' calls b2Preview(i) (B2_PREVIEW_LISTS); pointerover hover now mouse
only (on iPhone it fired before the click and moved the cursor, so the tap acted at once). Target picking still acts on one tap.
Tested: tools/touch_test.py (has_touch phone context, portrait and landscape, plus mouse), smoke IDS=grace,rose, kit_test grace. Repo NOT pushed.
Before that: 2026-10-25 (23:40, v253): SOUND VOLUME in Options. Two 1-10 sliders at the top of menu > Options: MUSIC VOLUME and
EFFECTS AND VOICES VOLUME (minus/plus buttons reachable by D-pad, tap a pip to jump). engine/audio.js: sound.vol {music,fx} (localStorage
le-vol-music / le-vol-fx), volGain(n)=(n/10)^1.7, setVolume(kind,n); sound.master is now the effects+voices bus (.45*volGain(fx)) and a new
sound.musicBus (.45*volGain(music)) feeds music (engine/music.js musicEngine). Speech-synthesis fallback volume follows fx. Levels ride in saves
(b7Opts volMusic/volFx in engine/feel.js). CSS .b7-vrow/.b7-vbar/.b7-vpip in index.html. Mute toggles unchanged. Repo NOT pushed (local edits in clone).
Before that: 2026-10-25 (late, v251): Tom's 25-line Director's Cut voices.json merged and live (nothing left to bake); Cartwheel rebuild NOT started (Tom asked for the clips only).
Before that: 2026-10-25 (late, v247). Chapter 8 (157 clips), Chapter 9 (179) and Chapter 10 (158) dialogue voices merged and published: only
data/voice/dialog-ch8.js (7.6 MB), dialog-ch9.js (7.7 MB) and dialog-ch10.js (6.9 MB); page republished unchanged. 0 speaker/voice mismatches;
dvtest passed (1542 clips locally). Live: v247 (1792980251-133c). All ten chapters now have spoken dialogue (1903 clips). Nothing pending with Tom's bakers.
Before that: 2026-10-25 (night, v246). Chapter 6 (195 clips) and Chapter 7 (166 clips) dialogue voices merged and published: only
data/voice/dialog-ch6.js (7.5 MB) and dialog-ch7.js (6.7 MB); page republished unchanged. 0 speaker/voice mismatches; dvtest passed.
Live then: v246 (1792980044-fa67): v245 plus ch6 and ch7 dialogue voices.
Before that: 2026-10-25 (late night, v245). Chapter 4 (156 clips) and Chapter 5 (176 clips) dialogue voices merged and published, with
the full ch1-10 cast (data/dialog-cast.js). 0 speaker/voice mismatches; dvtest passed with 1048 clips (ch1 to ch5). Published only
data/dialog-cast.js, data/voice/dialog-ch4.js (6.9 MB) and dialog-ch5.js (7.3 MB); page republished unchanged.
Live: v245 (1792979835-9c01): v244 plus ch4 and ch5 dialogue voices and the ch1-10 cast. Chapters 6 to 10 bakers are with Tom (see claude/next.md).
Before that: 2026-10-25 (late night, v244). Chapter 3 dialogue voices merged and published (178/178 clips, data/voice/dialog-ch3.js
7.3 MB; 0 speaker/voice mismatches; dvtest passed with ch1 + ch3). Only that file was published (page republished unchanged).
Live: v244 (1792979082-9a49): v243 plus data/voice/dialog-ch3.js. Chapters 4 to 10 bakers are with Tom (see claude/next.md).
Before that: 2026-10-25 (night). v242 Director's Cuts part 8: grace3_dc Shadow Squishy and rose3_dc Lamby Night-Light animated
(tier 3 started); 4 new lines (silent until Tom bakes ALL voices once the ability updates are done: no baker sent).
Next: Director's Cuts part 9, amy3 and deedee3 (claude/next.md).
Live: v242 (1792975110-e6fd): v241 plus Director's Cuts part 8 (data/battle2-data.js, data/lines.js, engine/battle2-kind.js).
v241 (1792974089-5422): v240 plus Director's Cuts part 7 (data/battle2-data.js, data/lines.js, data/font.js,
engine/battle2-kind.js).
v240 (1792972101-a749): v239 plus Director's Cuts part 6 (data/battle2-data.js, data/lines.js, engine/battle2-kind.js).
v239 (1792970915-8b23): v238 plus Director's Cuts part 5 (data/battle2-data.js, data/lines.js, engine/battle2-kind.js).
v238 (1792969703-b07b): v237 plus Director's Cuts part 4 (data/battle2-data.js, data/lines.js, engine/battle2-kind.js).
v237 (1792965278-2af0, another session): voices only (8 DC lines, dialogue ch1 all, ch2 256 of 291). v236 (1792964960-09e9): v235 plus Director's Cuts part 3 (data/battle2-data.js, data/lines.js, engine/battle2-kind.js,
engine/battle2-traits.js). v235 (1792964387-70db, another session): voices only (42 Tombo + Family Finish lines merged).
v234 (1792962903-837c): v233 plus Director's Cuts part 2 (data/battle2-data.js, data/lines.js, engine/battle2-kind.js).
v233 (1792961621-6a59): v232 plus Director's Cuts part 1 (data/battle2-data.js, data/abilities.js, data/lines.js,
engine/battle2-kind.js). v232 (1792960331-06f3): v231 plus ff3/ff4 animations (engine/battle2-kind.js, data/lines.js). v231 (1792957557-89ec): v230 plus a SLEEPOVER Battle Lab fight (Tom, TNB, Grace, Rose; data/battle2-data.js B2_LAB) so ff1
can be tried. v230 (1792957063-1901): v229 plus Family Finishes (data/battle2-data.js, data/abilities.js, data/lines.js,
engine/battle2-kind.js, engine/battle2-ui.js).
Earlier: v229 boppy3/tnb3/nara3 animations (all 21 Tombos animated). v228 was another session's publish. v227 amy3/deedee3
animations. v226 tier-3 data + grace3/rose3 animations, Fearless status, ['burn',n,memberId], party pop text clamped. v225
amy2/boppy2 animations, v224 spoken-dialogue cast for chapters 2 and 3 (another session: data/dialog-cast.js, placeholder
data/voice/dialog-ch2.js and dialog-ch3.js), v223 deedee2 Pick the Rhubarb + rose2 Seat 1A Stowaway, v222 tnb2 Red Line Transfer +
nara2 Tug of War, v221 tier-2 Tombos as data + grace2 Uncle Spotter Toss, v220 spoken dialogue boxes (another session:
data/dialog-cast.js, engine/dialog-voice.js, two script tags in index.html after engine/chapter-select.js), v219 amy1 I Called It!
(Task T tier 1 complete), v218 Rose sits on Tom's shoulders, v217 Boppy's new New York voice (another session), v216 Task T nara1
(Sit. Paw. Treat.) and boppy1 (You Hold the Net), v215 new Eleven v4 voices (another session), v214 deedee1/tnb1 Tombos, v213
grace1/rose1 Tombos, v212 Nara's Ultimates (phase 5b complete), v211 Michael/Justin height (another session, data/npc-sprites.js),
v210 TNB's Ultimates, v209 Boppy's, v208 Deedee's. v205 Boppy, v206 TNB, v207 Nara polish (Task P done). v202 Rose, v203 Amy, v204
Deedee polish. v201 dialogue portraits (another session; index.html and engine/overworld.js). v200 Grace polish, v198 Tom polish
and Nara's HUMAN EYES line, v196/v197 Task R (Tom's and TNB's round 3 overrides). v195 and v199 page-only changes from another
session. v194 Tom's dark brown hair. v193 Amy's Ultimates, v192 Rose's, v191 Grace's. Task M v182 to v189. v181 Phase 5a. v179,
v180 Phase 4b. v178 rename. v174 to v177 animation pass. v173 Phase 4a.

## Family Finishes (v230; spec claude/tombo-review.md "Family Finishes", numbers revamp plan I3 "Family Finishes (4 Total")
| Id | Live name | Who | Elem / mult / target | fx | State |
|---|---|---|---|---|---|
| ff1 | Sleepover at Tom's | tom, tnb, grace, rose | sparkle 4.3 all, kindV 300 | heal .6 party, mount, trend lock 2, rack party | ANIMATED |
| ff2 | Run With Us, Mommy! | amy, grace, rose (no Tom) | kinetic 4.4 all | cure debuff party, vp 3 party, st best 3 party, ct -.75 party | ANIMATED |
| ff3 | Fifty-One Years & Counting | deedee, boppy, tom | cozy 4.4 all, kindV 300 | revive .5 party, heal .6 party, st tucked 3 party, st shield 3 party | ANIMATED v232 |
| ff4 | The Extra Place | 'all' (whole party, 3 or more) | sparkle+cozy hybrid 5.0 all, kindV 300 | revive .5, heal .6, cure debuff, refill party | ANIMATED v232 |
- Caps applied in the data (Tombos are not o3, b8Cap does not run): plan's heal 1.0 -> .6, revive 1.0 -> .5, vp +5 -> 3. ff1's
  "mile +2 tom" dropped (every finish with Tom gives the 1 Mile the cap allows). Barrier events (Exhaustion on ff2, Aging on ff3)
  not built.
- Flags tombo:ff1..ff4 (same as B8_COMBOS); no story beat sets them yet (chapters 11 to 20), so Battle Lab only (B2.tombos='all').
  Lab fights per finish: ff1 SLEEPOVER (v231), ff2 SCHOOL NIGHT / TERMINAL CREW, ff3 MOON CLUB CREW, ff4 any 3+ party.
- Rows sit at the end of B2_TOMBOS with tier:'ff' and `who` instead of `partner` (T.tombo=true like every Tombo: shield break,
  kindness, no traits). b2FinishMembers(T) gives the members (null when one is missing). b2TomboRows lists them after the Tombos;
  every row now carries r.label (Tombo 'TOM + GRACE', finish 'FAMILY · TOM + TNB + GRACE + ROSE'); the menu (battle2-ui.js) prints
  r.label. Any member can start it; why texts: not a member, someone knocked out, Shushed, HEART short.
- Runner b2RunFinish (engine/battle2-kind.js, after b2RunTombo; b2RunTombo hands rows with `who` to it): stats are the group
  average, lead = Tom if in it else the starter, M.members, M.tom = lead (High-Five sprite), M.pt = null, Mile only with Tom.
  Banner head 'FAMILY FINISH!' (b2Fx banner takes `head`, default 'TOMBO!'; banner text uses the 3x5 font, so names use a straight
  apostrophe: "Sleepover at Tom's"). Animation gets E={tom (or null),mem,fx (members' battle.fx, same order),M,act,targets,result,
  apply}; no anim falls back to b2FinishPlain (all members hop).
- Animations live at the end of the tier-3 IIFE ("Family Finishes" header after nara3): startOf(u) (a body's last drawn spot, so
  Rose riding Tom walks off his shoulders), ffHop (bounce while gliding: Tom, Grace, Rose have no run frames), snackBag(),
  fortCastle(px,by,W,H,{k,rot,sq,disco,ms}) (quilt fort with a lit doorway; k grows it into a castle with turrets; drawn about its
  left bottom corner), chainLine(), clockFace(), paperStack().
- Lines: rose.ff1 "No grown-ups in the fort! Except Ta-Ta!", tnb.ff1 "And then... the door... creaked... open...", rose.ff2 "We can
  carry you too! Run with us, Mommy!", amy.ff2 "My girls. Okay, hands together! Nobody stops the three of us!". Grace's count in ff2
  is on-screen words 5 6 7 8! (no voice). v232: deedee.ff3 "Fifty-one years, Boppy. I'd do every single day again!", boppy.ff3
  "Even with my stomach? Yeah. Me too, Deedee.", tom.ff4 "All the seats are full. Nobody gets left behind.", grace.ff4 "Everybody
  raise your glass! You too, monster! CHEERS!" (ff4 says each only if that member is in the party and standing).
- v232 helpers (after ff2): flower(x,y,s,rot), pepper(x,y,s,rot), bloom(x,y,k,n,dx,spread) (seeded burst, k 0..1), hourglass(x,b,H,ms,sand).
- ff4 seats only living non-Nara members (Tom first); knocked-out members stay home and get up at apply. The guest is the front
  (rightmost) monster: its f.ox/f.oy are set every frame from the tb_draw front scene and cleared in the 'end' step.

## Director's Cuts (v233; spec claude/tombo-review.md DC rows; build order: after Family Finishes)
- The switch (decided v233): a Director's Cut is its own row in the Tombo menu, directly under its Primary in B2_TOMBOS, with
  label DIRECTOR'S CUT · TOM + <PARTNER> and banner head DIRECTOR'S CUT! (straight apostrophe: 3x5 font). No toggle.
- Row shape: id = Primary id + '_dc', `dc` = the Primary id, same partner, tier, cost (HEART) and flag. b2TomboOpen: Lab
  (B2.tombos='all') or the flag plus b8DcOpen(B8_COMBOS row) (every participant level 30, memberById levels). Checked with a gate
  test: flag set and levels 12 hides both; Tom and Grace at 30 shows only grace1_dc.
- Numbers: from the designed Director's Cut row (revamp plan tb_* for source 2, option 3 brief tombo_* for source 1), mapped to
  engine ops; the tombo-review row changes only name, scene, lines and animation unless it says Effect. Kind values: tier 1 250.
| Id | Live name | Elem / mult / target | fx | State |
|---|---|---|---|---|
| grace1_dc | Smash That Like Button | sparkle 2.1 row (stat warmth), kindV 250 | st critup 3 party, reveal t, trend +1 | ANIMATED v233 |
| rose1_dc | That Cloud Is Lamby | chatter, no damage, enemy, kindV 250 | interrupt t, ct +.25 t, mount | ANIMATED v233 |
| amy1_dc | Field Day | sparkle, no damage, party, kindV 250 | vp 2 party, cure one amy | ANIMATED v234 |
| deedee1_dc | Clean As You Go | splash, no damage, party, kindV 250 | heal .25 party, cure one party | ANIMATED v234 |
| boppy1_dc | Quiet on Cattail Pier | splash 2.3 all (pow) | row front t, st pinned 2 t (Hooked), burn 2 boppy | ANIMATED v236 |
| tnb1_dc | 2nd Ave Window Wash | splash 2.2 all (hybrid), kindV 250 | cure debuff party, st cooldown 2 t, rack tom | ANIMATED v236 |
| nara1_dc | Puzzle Toy | kinetic 2.2 enemy (pow) | take t (its drop item, else coins) | ANIMATED v238 |
| grace2_dc | Judge Grace | kinetic 2.8 row (pow), crit .25 | st pinned 2 t (Hooked) | ANIMATED v238 (tier 2, HEART 50) |
| rose2_dc | Princess and Her Bodyguard | cozy, no damage, party, kindV 300 | st evade 2 party, cure mental partner, mount | ANIMATED v239 |
| amy2_dc | Spot Me, Tom | kinetic, no damage, party (no kindness) | refill both, st brace 1 party (GUARD, half damage) | ANIMATED v239 |
| deedee2_dc | Library Vault Lantern | cozy, no damage, party, kindV 300 | st tucked 3 party, crust 2 | ANIMATED v240 |
| boppy2_dc | Bird's Nest | splash 2.8 enemy (pow) | steal t (one buff; shield break is automatic) | ANIMATED v240 |
| tnb2_dc | Last Train Home | cozy, no damage, party, kindV 300 | cure debuff party, ct -.25 both | ANIMATED v241 |
| nara2_dc | Nara, No! | kinetic 2.8 all (pow) | interrupt t | ANIMATED v241 |
| grace3_dc | Shadow Squishy | sparkle 3.6 enemy (warmth), kindV 300 | closeup 2 t (CLOSE-UP: next damaging hit x2) | ANIMATED v242 (tier 3, HEART 75) |
| rose3_dc | Lamby Night-Light | chatter, no damage, all, kindV 300 | ct +.4 t, interrupt t, cure mental party, mount | ANIMATED v242 |
| amy3_dc | Elevator Cheat | cozy, no damage, party (no kindness) | ct -.55 party, st pepup 2 party (PEP +30%), cure amber party | ANIMATED v272 |
| deedee3_dc | Feast on Jefferson Park | cozy, no damage, party, kindV 300 | revive .35 party, heal .6 party, cure debuff party, crust 3 | ANIMATED v272 |
| boppy3_dc | Pepper Contest | cozy 3.5 row (pow) | st gritdown 3 t, steal t, burn 1 boppy | ANIMATED v273 |
| tnb3_dc | Golden Repair | sparkle 3.5 enemy (warmth), no kindness | st brace 2 party (GUARD), cure amber party | ANIMATED v273 |
| nara3_dc | Under the Table | sparkle 4.0 all (hybrid) | st pinned 2 t (HOOKED: no dodging) | ANIMATED v273 |
| ff1_dc | Pottery Lesson | sparkle, no damage, all, kindV 300 | goof t, st brace 1 party | ANIMATED v274 (finish, HEART 75, who tom/tnb/grace/rose) |
| ff2_dc | Breakfast in Bed | cozy, no damage, party, kindV 300 | refill party, cure debuff party, ct -.25 amy | ANIMATED v274 (who amy/grace/rose) |
| ff3_dc | The Family Walk | cozy, no damage, party, kindV 300 | heal .35 party, st tucked 3, cure amber | ANIMATED v274 (who deedee/boppy/tom) |
| ff4_dc | The Eight-Seat Dinner Table | cozy, no damage, all, kindV 300 | heal .4 party, cure debuff, vp 3 party | ANIMATED v274 (who 'all') |
- Number source rule (decided v239): the tier-2 Primaries rose2 and amy2 already carry the revamp plan's dc_tb_rose_2 /
  dc_tb_amy_2 card numbers (First-Class Stowaway, Turbulence on the Wing), because tombo-review swapped those scenes into the
  Primary. So their DCs take the OTHER designed row: ability-revamp.md Blanket Customs (tombo_rose_customs) and Carry the Other
  Bag (tombo_amy_other_bag). General rule: compare the live Primary's fx with both designed rows; the DC takes the one not used.
  v240: deedee2 and boppy2 Primaries carry the revamp plan tb_deedee_2 / tb_boppy_2 numbers, so deedee2_dc takes Recipe in the
  Margins (tombo_deedee_recipe) and boppy2_dc Untangle the Line (tombo_boppy_untangle). v241: tnb2 Primary = tb_tnb_2, so tnb2_dc
  took Transfer Together (tombo_tnb_transfer); nara2_dc took the tombo-review Effect with the Gopher Hole Express multiplier.
  v242: grace3 / rose3 Primaries = tb_grace_3 / tb_rose_3, so grace3_dc took No Props Needed (tombo_grace_no_props) and rose3_dc
  Left Ear, Right Here (tombo_rose_headphones). v272: amy3 / deedee3 Primaries = tb_amy_3 / tb_deedee_3 (Feast numbers), so amy3_dc
  took One Landing at a Time (tombo_amy_landings) and deedee3_dc The Door Stays Open (tombo_deedee_open_door; its K65 kindness = kindV
  300, the tier-3 value). Tier-3 DCs: the option 3 brief tier-3 rows (ability-revamp.md table under each
  pair's heading), unless the Primary carries option 3 numbers (then the revamp plan dc_tb_<id>_3 card).
  Doc 'guard' = engine 'brace' (B8_ST_ALIAS). A brace of 1 turn expires at the next party member's turn start (seen in tests).
- Lines: grace.dc1 "Say it with me! Smash that like button!", tom.dcgrace1 "Smashing it. Respectfully.", tom.dcrose1 "That cloud is
  clearly a sourdough loaf.", rose.dc1 "No! It's Lamby with YOUR hair!" (changed v250 to "No! It's Lamby!"). v234: amy.dc1 "Field day! Eggs on spoons! GO!", tom.dcamy1
  "I am protecting this egg with my life.", deedee.dc1 "Faster, honey! Clean as you go!", tom.dcdeedee1 "I am drying at maximum
  speed.". v236: boppy.dc1 "Shh! Keep it down, Tom, you're scaring the fish!", tom.dcboppy1 "Dad, they're monsters. They're
  right behind those reeds.", tnb.dc1 "Well, well, well. Let's clear the air on Second Ave, babe.", tom.dctnb1 "Visibility
  restored. Spotless." (revamp plan cards tb_boppy_1 / tb_tnb_1; Tom's line says reeds, not bush, to match the pier scene).
  v238: tom.dcnara1 "Find it. Use the nose. No, not the paw.", nara.dc1 "Snff snff snff... ARF!" (bark: DOG.dc1 in the baker),
  grace.dc2 "That was a two, Ta-Ta. Watch me.", tom.dcgrace2 "I demand a recount.".
  v239: rose.dc2 "Make way for the princess!", tom.dcrose2 "No touching the princess, please.", amy.dc2 "Three more! Squeeze!
  Don't you DARE quit!", tom.dcamy2 "I quit. Gravity has the kettlebell now.".
  v240: deedee.dc2 "Wait till I buff this brass! Let's get some light in here!" (revamp plan card line), tom.dcdeedee2 "Mom, I'm
  just holding it. That is a LIGHTHOUSE now." (the card's line mentions the seal, which tombo-review cut), boppy.dc2 "What did you
  DO to my reel?", tom.dcboppy2 "I improved it. Aggressively.".
  v241: tnb.dc2 "Mind the gap, babe! Go go go!", tom.dctnb2 "Running is not in my skincare routine.", tom.dcnara2 "Nara, no.
  Nara. NO. ...Okay, good girl.", nara.dc2 "Yip! Yip! ARF!" (bark: needs DOG.dc2 and a v15 template block when baking).
  v242: grace.dc3 "No, Ta-Ta, like THIS.", tom.dcgrace3 "Mine was a very modern bunny.", rose.dc3 "Lamby is NOT scared. Lamby is
  brave.", tom.dcrose3 "Lamby is very brave. Lamby is glowing.".
  v272: tom.dcamy3 "Elevator. I'm a gamer. It's a shortcut.", amy.dc3 "Shortcuts don't COUNT, Tom!", deedee.dc3 "Everybody eat!
  Wait, the gumbo goes HERE. Elbows off!", tom.dcdeedee3 "Mom. Sit down. You are the GUEST tonight." (Deedee is the joke: she cannot
  stop fussing).
  v273: boppy.dc3 "That one's mild. Have another.", tom.dcboppy3 "I can no longer feel my face.", tnb.dc3 "Broken is fine. Now it's
  ours.", tom.dctnb3 "Kintsugi. I know the word. I'm very proud.", tom.dcnara3 "Shh. Don't tell your mom.", nara.dc3 "Snff! ...Wuff!"
  (bark: needs DOG.dc3 and a v16 template block when baking).
  Key pattern: partner dcN, Tom dc<partner>N (ff: dcffN). N is the tier (grace.dc2 for grace2_dc).
- Code: "Director's Cuts" section at the end of the Tombo IIFE in engine/battle2-kind.js (after ff4): rr(x,y,w,h,r,c,o) (outlined
  rounded rect), thumbsUp(x,y,s,rot,sq,badge), likeBtn(x,by,press,glow); TOMHAIR, lambyHair(x,y,sc) (Tom's hair on Lamby in plush
  coordinates), CLOUDP/LAMBP (cloud puffs and where they sit around Lamby), grace1_dc, rose1_dc. RFX.plush(x,y,sc,{pose,rot,glow})
  draws Lamby at any size (sc 3.3 is the giant cloud Lamby). v234: egg(x,y,s,rot), spoon(x,y,rot,full), whistle(x,y,s), splat(x,y,k,a)
  (egg splat with drips), amy1_dc; plateEdge(x,y,s) (plate seen edge-on, for stacks), plateFace(x,y,rot,s), deedee1_dc. v236:
  CANVAS/ALU, campChair(x,b,sh,bh,part) (part 'front' = near X legs only), tackleBox(x,b,open), cattail(x,b,h,sway), boppy1_dc;
  HOSE/RAIN, turboFan(x,b,spin,rise), fanBox(x,b,open), smog(x,y,r,a), tnb1_dc. v238: WOOD/LIDC, puzzleToy(cx,b,lids,shake)
  (lids[i] = {open,treat,pop}), nara1_dc; scoreCard(x,y,num,s,rot) ('2' red, '10' gold), judgeDesk(x,b), grace2_dc. v239: shades(sp,fk,x,b) (Tom's sunglasses and
  earpiece over his drawn body; fk = frame name idle/act/expr/celeb/flip; skips kneel), carpet(x0,x1,y,k) (red carpet unrolling
  left), rose2_dc; kbell(x,y,s,rot) (50 lb kettlebell), amy2_dc. v240: BRASS/TARN, lantern(x,y,s,shine,lit) (hangs from its handle at x,y),
  lighthouse(x,b,yT,lit) (lamp centre yT-17), deedee2_dc; nest(x,y,rx,ry,t,seed,a) (seeded tangle of fishing line), boppy2_dc.
  v241: DOORC, tnb2_dc (local car(off,ms), win(), gapOf(ms) door gap; reuses SILVER, METRO_RED, longboard() from tnb2); nara2_dc
  (ellipse laps, hits sampled every 5 ms along the laps). v242: shadowSq() (SQUISHY art as a solid shadow with its eyes and mouth
  left open, cached), SHADE/LAMPLIT, shBunny(x,y,s,wob,a) (Tom's floppy shadow bunny with a wrist trailing lower right),
  readLamp(x,b,on) (reading lamp on the floor, 1.35x; returns where the light comes out), grace3_dc (wall light patch and shadows
  in the back layer, clipped to the patch; the dark is a front-layer darkC with elliptical soft holes); rose3_dc (darkC with a hole
  that grows from Lamby, glowing monster eyes, shadow wisps, Lamby halo and rays; monsters run 140 px left when the light reaches
  them, then creep back). v272: stopwatch(x,y,s,txt) (txt shows a green time on its face, null = a ticking hand), angerVein(x,y,s),
  amy3_dc; gumboPot, pupusaPlate, crispPan, breadDish (boule at .85), DISHES (in slot order), stringLights(ms,t0,k) (two catenary
  strands of bulbs that switch on left to right from t0), deedee3_dc. v273: PEPC, hotPepper(x,y,s,rot,i) (i 0 red, 1 orange, 2 green, 3 glowing
  black), PEPB (bowl spots), FLUSH (per palette: only skin colors pushed to red, the rest transparent; boppy3_dc faceRed draws it over the
  top 40% of a body for a red face that keeps the hair), boppy3_dc; CUPC/CUPG/KGOLD, CRK_A/CRK_B (crack polylines), polyPart(pts,k)
  (partial polyline path, returns the end point), kCup(x,y,s,rot,split,seam,glow) (tea bowl in three clipped pieces; split pushes them
  apart, seam paints gold along the cracks, returns the brush tip), tnb3_dc; clothPath/cloth(c,ms,a) (gingham tablecloth from
  {x0,x1,yT,yB,peak,flare,wave}), lerpC (blend two cloth shapes), nara3_dc. New Director's Cuts (the four finish DCs) go after nara3_dc,
  before the IIFE's closing.
  Gotcha (v241): a kind DC whose pair is offscreen at the impact (inside the train) should call landHit(100) when they are visible
  again, or the CURED/HURRY UP pops land on empty home spots (tnb2_dc lands everything at P.apply, hearts at the slam).
  data/font.js has a comma since v241 (banner and word() can print commas).
  Gotcha (v239): a kind no-damage Tombo's FIRST landHit lands all fx and kindness at once: call landHit(100) once, at the last
  beat (rose2_dc knights each monster but only the last calls it). A no-damage Tombo with no kindV needs no landHit at all
  (amy2_dc applies at its own apply step). Gotcha (v236): a damage Tombo's last landHit does NOT apply fx on the spot; call E2.apply() right after it when
  the scene needs the result at once (boppy1_dc slides the reeled monsters from their old row spot to the new one: S0 holds
  ST.foe before, ST.foe after apply is the new home, f.ox/f.oy ease the difference to 0). Kind (no-damage) DCs still call landHit(100) at the impact (warmth
  lands there) and E2.apply() later; glows for the pair go at their stage spots (sT/sA), glowOn only for the others.
- B8_COMBOS r names all follow tombo-review.md now (keys unchanged).
- Tier 1 DCs complete (v238). Tier 2 complete: grace2 (v238), rose2, amy2 (v239), deedee2, boppy2 (v240), tnb2, nara2 (v241).
  Tier 3 complete: grace3, rose3 (v242), amy3, deedee3 (v272), boppy3, tnb3, nara3 (v273). Finish DCs ff1_dc to ff4_dc (v274): ALL Director's Cuts done. Kind values: tier 2 300 (only for kind moves). Gotcha (v238): a small monster under a partner who walks onto it
  is hidden by the partner (party draws after monsters); stop at the monster's edge (nara1_dc: nose at F.x+F.w/2+4).
- Engine (v236): b2Burn's party pop says BURN +n (it always said BURN +1).

## Rose on Tom's shoulders (v218; canon: she SITS, legs down the sides of his head, shoes on his shoulders)
- data/rose-ride.js ROSE_RIDE: bt_idle, bt_celeb (battle, left-facing, Rose scale 1.75), ow_down, ow_up, ow_left (overworld scale 1;
  right = ow_left mirrored). Each pose: back rows (upper body cut at the hem + legs) and front rows (shoes); ax/ay = the pixel on
  Tom's anchor (centre column, top of his sprite); sx/sy shift for her eye (black eye). Regenerate with claude/rose-ride-gen.py.
- engine/rose-ride.js: roseRide(pose,layer,cx,top,s,flip) draws one layer. Battle: roseSeatBattle (Rose's turn, drawn just before
  Tom by b2RideOrder), roseSeatFront (after Tom), roseSeatNear (a move path parked on the old ride spot, Tom's cx+2 and top+20,
  counts as seated). Overworld: an actor with .seat is skipped by drawSheetActor; the player draws roseRider() via drawOwRider
  before and after himself (up: back layer after Tom, shoes before). The opening scene sets and clears r.seat; endIntro clears it.
  Title screen (engine/splash.js) uses ow_down.
- Set pieces with their own ride choreography still draw her standing up top: Double-Decker Airplane (rose1), Operation Shoulder
  Mecha, Piggyback Pounce launch. A new move that puts Rose on Tom: park her path on the ride spot and she sits automatically
  (rose3 and ff1 do this: path cx = battle.drawnAt[tom.idx].cx+2, base = d.base-d.h+20, read each frame). Her seated head top is
  seat base - 20 - ROSE_RIDE.bt_idle.ay*1.75; ear height about top + 9*1.75 (rose3 draws headphones there).

## Tombos (Task T; spec claude/tombo-review.md, APPROVED by Tom 24 Oct)
| Id | Live name | Unlock (data/scenes.js) | State |
|---|---|---|---|
| grace1 | Hi Guys, Welcome Back! | ch1 opening | v213 rebuilt (Primary) |
| rose1 | Double-Decker Airplane | ch1 opening | v213 rebuilt (Primary) |
| deedee1 | Wine and Gossip | ch1 theft | v214 rebuilt; party heal capped to 60% (was 65%) |
| tnb1 | Popcorn Jump | ch2 lawn | v214 rebuilt |
| nara1 | Sit. Paw. Treat. | ch2 porch | v216 rebuilt; fx scent 3 t, heal 20% Tom and 20% Nara |
| boppy1 | You Hold the Net | ch3 | v216 rebuilt; effects unchanged |
| amy1 | I Called It! | ch5 goal | v219 rebuilt; effects unchanged |
| grace2 | Uncle Spotter Toss | ch5Clocks (school cleared) | v221 data + ANIMATED |
| tnb2 | Red Line Transfer | ch6Kitchen (TNB joins) | v222 ANIMATED |
| nara2 | Tug of War | ch6Nara (Nara joins) | v222 ANIMATED |
| deedee2 | Pick the Rhubarb | ch7 end (before the chapter card) | v223 ANIMATED |
| rose2 | Seat 1A Stowaway | ch10Term | v223 ANIMATED |
| amy2 | Wing Walk | ch10Term | v225 ANIMATED |
| boppy2 | Nobody Gets Past Us | NOT SET: I3 says chapter 14, which does not exist yet (Battle Lab only) | v225 ANIMATED |
| grace3 | The Golden Dumpling Wish | NOT SET (ch19) | v226 ANIMATED |
| rose3 | Headphones in the Dark | NOT SET (ch19) | v226 ANIMATED |
| amy3 | Sixty-Story Sibling Pace | NOT SET (ch17) | v227 ANIMATED |
| deedee3 | Tom Cooks for Mom | NOT SET (ch19) | v227 ANIMATED |
| boppy3 | The Pepper-Broth Sneeze | NOT SET (ch19) | v229 ANIMATED |
| tnb3 | Cone Six Across the Miles | NOT SET (ch19; Distance barrier) | v229 ANIMATED |
| nara3 | Cuddle | NOT SET (ch19; Fear barrier) | v229 ANIMATED |
- Story chapters stop at 10, so no tier-3 unlock flags exist; tier 3 plays only in the Battle Lab (B2.tombos='all'). When chapters
  17 and 19 are written, set tombo:amy3 at the Glass Tower climb and the rest at the chapter 19 beats (revamp plan I3 tables).
- Tier-2 numbers (HEART 50, B2_TOMBOS in data/battle2-data.js after amy1), mapped from revamp plan I3 tier-2 rows onto real ops.
  Tombo fx are not o3: 'st' takes ENGINE status ids (evade, shield, gritdown, coolup, pepup, staggered, shushed), not doc names.
  | Id | Elem / mult / target | fx | Notes |
  |---|---|---|---|
  | grace2 | kinetic 2.9 splash, crit:1 | choreo 2 tom (= +1 VP, ctq -0.2 Tom) | shieldBreak is automatic for every Tombo |
  | rose2 | cozy 2.8 all, kindV 300 | goof 1 t, steal t, st evade 2 both | |
  | amy2 | kinetic 2.9 all | row back t, ct +.5 t, st pepup 3 party | |
  | deedee2 | sparkle 2.7 all | cure debuff party, st coolup 3 party, st shushed 2 t, crust 2 | crust 2 ADDED (the scene bakes Warm Crusts); cure amber covered by cure debuff |
  | boppy2 | chatter 2.7 all, kindV 300 | interrupt t, st shield 3 party | bodyguarded 2 party SKIPPED: 'guarded' only covers when its by is Tom, a Tombo's source is the pair |
  | tnb2 | kinetic 2.9 all | ct -1 party, st evade 2 party, st staggered 1 t | |
  | nara2 | kinetic 2.8 enemy | steal t x3, st gritdown 3 t | effect from the tombo-review Nara row |
- Tier-3 numbers (HEART 75, v226), same mapping rules, caps revive 50% and party heal 60% applied in the data:
  | Id | Elem / mult / target | fx | Notes |
  |---|---|---|---|
  | grace3 | sparkle 3.8 all, kindV 300 | revive .5 party, heal .6 party, cure debuff party, trend lock 3 | plan's 75/75 capped |
  | rose3 | chatter 4.0 all, kindV 300 | pause 1 t (= ctq .5 t), heal .5 party, mount | mile +3 dropped: every Tombo gives the 1 Mile the cap allows |
  | amy3 | kinetic .75 x6 (hits:6) enemy, crit:1 | st best 3 party | animated with 6 landHit steps (5 x 12 + 40) |
  | deedee3 | cozy 3.7 all, kindV 300 | heal .6 party, st tucked 3 party, crust 3, tray 3 | Feast numbers (row changed name and scene only), heal capped |
  | boppy3 | cozy 4.1 all | st stunned 1 t, cure amber party, burn 3 boppy | NEW op form ['burn',n,memberId]: a Tombo's actor is the pair, so burn names Boppy |
  | tnb3 | cozy hybrid 4.2 all | heal .6 party, rack party, continuity 2 party (= cont .25 party) | Distance barrier event not built |
  | nara3 | sparkle 4.2 all, kindV 300 | cure debuff party, st fearless 2 party | NEW status fearless (engine/battle2-effects.js): debuffs bounce off (pop FEARLESS), no revive; Fear barrier event not built |
- Tier-3 lines: grace.tombo3 "I don't need the squishy if I get you back, Ta-Ta!", tom.tombograce3 "You kept it safe for me, kiddo.
  Let's shine!", rose.tombo3 "I heard your video game song in the dark, Ta-Ta!", tom.tomborose3 "Best co-op partner in the world.
  Let's finish the level.", amy.tombo3 "Sixty floors, Tom! Don't you dare drop behind my pace!", tom.tomboamy3 "On your shoulder
  the whole way. Roof. NOW!", tom.tombodeedee3 "I made it myself, Mom. Forty-eight hours.", deedee.tombo3 "Needs salt. Who cleaned
  this counter?!", tom.tomboboppy3 "Extra cayenne in the broth, Dad. Breathe deep!", boppy.tombo3 "Ah... AHH... ACHOOOO! Ooh, that
  cleared my stomach right out!", tnb.tombo3 "First cup I ever threw. It always brings you home." (trimmed from the plan card's 14
  words), tom.tombotnb3 "Three thousand miles is nothing. I'm right here.", tom.tombonara3 "There you are. I've got you.",
  nara.tombo3 "Mmmf. ...Huff.".
- B8_COMBOS (data/abilities.js) Primary names now match: deedee3 Tom Cooks for Mom (was The Door Stays Open), nara3 Cuddle (was The
  Dog Who Remembered), ff1 Sleepover at Tom's (was Four Corners, One Sheet; who now tom, tnb, grace, rose), ff2 Run With Us, Mommy!
  (was She Carries the Load). Director's Cut names follow tombo-review.md since v233.
- Live Tombos: B2_TOMBOS in data/battle2-data.js (partner, tier, cost, flag, numbers, fx, desc). Animation: B2_TOMBO_ANIM[id] in
  engine/battle2-kind.js (no anim falls back to b2TomboPlain). Fired by b2RunTombo(u,act,opt): E={tom,pt,fxT,fxP,M,act,targets,
  result,apply}; fx ops may target 'partner', 'tom' or 'both'. B2.tombos='all' unlocks all. The Tombo menu lists the array in order
  and scrolls. Story mentions in data/scenes.js (unlock toasts and battle tips: grep the Tombo's name); engine/battle2.js brace
  message names tnb1.
- The first anim IIFE of engine/battle2-kind.js holds no Tombo; tier 1 is in the "Task T" IIFE at the end (prefix tb_), tier 2
  under "Task T: tier-2 Primary Tombos" (grace2, tnb2, nara2, deedee2, rose2, amy2, boppy2), tier 3 under "Task T: tier-3 Primary
  Tombos" after boppy2 (grace3, rose3, amy3, deedee3, then "shared by boppy3, tnb3, nara3" helpers, boppy3, tnb3, nara3), then
  "Family Finishes" (ff1, ff2; new set pieces go after ff2, before the IIFE's closing `})();`).
  B2.aim=null at the start (no aim warp; real coordinates from ST.unit/ST.foe/ST.group). pathOf(fx,ms,fn) sets a body path in ms
  (return {cx,base,frame,rot,sc,hide,noShadow}; sc scales the body about its middle, rot rotates about its middle, hide skips it);
  paths work on ANY member's battle.fx (finishes drive 3 or 4 bodies). Both bodies write a shared state that SC.tb_draw scenes read
  each frame; word() (big outlined pop word), tb_rings, glowOn (draws at the member's HOME spot: for a moved body draw
  scene('glow',...) at its state x). ST.play for the timeline ('hf' at the impact; 'end' message may be a function). SC.tb_mat
  (v221): a blue gym mat back scene. A single-target Tombo's foe is E2.targets.find(t=>t.side==='foe') (amy3).
- Helpers in that IIFE: handPt(sp,frame,x,base,dir), bubble(), badHair(), glass(), popcorn(), popBowl(), slasher() (v214); treat(),
  bigPaw(), pawPrint() (v216); vein() (anger vein, inside amy1, v219); transferCard(), longboard(), rope(ax,ay,bx,by,sag,t) (v222);
  rhubarb(bx,by,hx,hy,s,t), rootHairs(x,y,w,l,t), crustTin(x,y,s), carryOn(x,by,hx,hy,lump,wig,t) (v223).
  v225 (inside amy2/boppy2, local): sky/plane-wing backdrop, lie-flat pod, local rope(); door(top,ms) jail-cell door. Colors SKY,
  HULL, WINGC, STEEL consts.
  v226 tier-3 helpers (IIFE scope, after boppy2): BARH 22 and bars(k) (letterbox, sets alpha 1 first), dim(k,c,a) (whole-stage tint;
  use in a back scene), ghostDumpling()/memory(x,y,sc,a,sq) (the gold squishy as a see-through memory: SQUISHY pixel art washed pale
  gold, cached canvas, halo and live glints), note8(x,y,u,c,rot) (an outlined 8-bit eighth note, u = pixel size), darkC (an
  offscreen canvas: rose3, nara3 and ff1 paint the dark there and cut soft holes with destination-out, then draw it over the stage;
  never cut holes on the main canvas).
  v227: glassPane(x,y,s,rot), shards(x,y,k,n) (a burst of glass triangles, k 0..1); stoneOf(sp) (cached grey palette for any
  sprite: draw a frame with drawSprite(rows,stoneOf(sp),x,y,sp.scale,{alpha}) over the normal one to turn someone to stone),
  boule(x,y,s,bite) (sourdough loaf; bite cuts a round bite with an evenodd clip), towel(x,y,rot) (striped dish towel).
  v229: drawAt(sp,frame,cx,base,pal,alpha,scale) (draw any frame by hand at a body spot, any palette and scale); tintOf(sp,hex,amt)
  (cached palette blended toward a color: red face, faded ghost, cream rim); order3(list) (monsters sorted right to left with
  ST.foe); split100(i,n) (landHit shares totalling 100); brothBowl(x,y,s), umbrella(x,y,k,rot) (boppy3); mug(x,y,glow,steam,ms)
  (stoneware cup, optional kiln glow and coffee steam; tnb3).
  v230: startOf, ffHop, snackBag, fortCastle, chainLine, clockFace, paperStack (Family Finishes section).
  mirrorRowsCached(sp,'act') gives a right-facing copy of any frame. drawSprite(rows,pal,x,y,scale,{alpha}) draws any frame by hand
  (tnb2 draws Tom inside the cab window with a clip). PROP2.lamby({flip},0) draws Lamby (global; scale .85 = about 2x prop size;
  ff2 uses .45 for Lamby in Amy's hand).
  Frames: Tom idle, act, celeb, expr, kneel, flip, celebFlip (run maps to idle; kneel is the hurt pose; near eye col 13 row 12 at
  scale 2.6). Grace the same set. Rose idle, act, celeb, expr, kneel, flip, celebFlip (mouth col 9 row 16, BATTLE_SPRITES.rose.mouth).
  Amy, Boppy, Deedee, TNB and Nara: idle, idle2, run1/2, act, wind, throw, celeb, celeb2, aim, spread, clap, hip, kneel, sit,
  celebFlip, expr, flip (checked with frames.py). All of them face left; Nara's sit frame is front-facing.
- Readability (v229 nara3): to show Nara in Tom's lap, hide both bodies and draw them in a front scene (Tom first, then Nara at .8
  scale in front of his knees) with a cream rim (tintOf cream drawn at 4 one-pixel offsets) so her black fur reads on his dark shirt.
  Hand-drawn arms around her read as tentacles; leave them out.
- Two-layer trick (v222 tnb2): to pass a big prop in front of the monsters but behind the party, draw it whole in a back scene and
  again in a front scene clipped to x < gapX, the empty gap between the monster group's right edge and the party's left edge. ff1
  uses the plain version: the fort is a back scene while it stands (the four stand in front of its doorway) and a front scene once
  it topples.
- No sfx.clap in the main build: use S(sfx.clap?'clap':'bump'). S(name) is silent for a missing sound. Sounds that exist: toot,
  brakes, rumble, chime2, jet, crash, ding, clang, jangle, bang, reel, step; dog: bark, howl, whine, sniff; also boo, raspberry,
  flame, creak, squeak; audio.js: heal, whoosh, boing, fanfare, levelChime, bonk, thud, slideWhistle, giggle, kiss, stun, boop.
- Moving monsters in a set piece (v214, v216): engine/battle2-ui.js honors f.ox, f.oy, f.spin and f.fsc while f.spinAt is refreshed
  every frame (feet stay put with f.oy = h/2 x (1-s)); clear them in the 'end' step. If the move's fx changes rows (['row',...]),
  b2FoeCanvasPos moves on apply: compute the wanted real position and set f.ox = wantX - ST.foe(f).x each frame (boppy1, amy2).
  A spun monster still flashes white on its hit (ST.jolt sets f.flash); deedee3 sets only f.shake for its sweep so the monster
  stays visible as it flies off.
- Back-layer scenes ({back:true}) draw after the background and before the monsters and party; front scenes draw over everyone.
  Deedee, TNB and Nara have a sit frame; Tom does not (deedee2 uses Tom's kneel for "landed on his bottom"; nara3 for kneeling).
- Big words over a monster collide with its damage numbers: put them at the top band (y 40 to 66, under the letterbox) or well
  above the monster (top - 80). Several monsters hit 340 ms apart: alternate y 40/66 and keep each word short (dur .4). Status pops
  from E2.apply rise over the party's heads: keep big words away from there at apply time. Two words at the same spot within
  ~400 ms leave a ghost (amy3 delays 60F ROOFTOP! 300 ms after 50F!; ff2's 5 6 7 8! sit 40 px apart). Labels at the top band during
  the first 1.8 s collide with the Tombo name banner: start them after 1.6 s (tnb3, ff2 EXHAUSTION).
- With 4 party members Tom's home is high and overlaps others: put a lying or seated Tom ABOVE the party (amy2's cabin window,
  podY = min party top - 6, clamped 128 to 190), not at his home spot. Tier-3 set pieces move Tom and the partner to a stage spot
  right of the monsters (mx = clamp(GR.x1+150, GR.x1+110, 470)), which works with 3 or 4 members; with 4 the second member's home
  still overlaps Tom a little at mx+30 (deedee3 uses mx-42 / mx+18 to keep the loaf clear). ff1 lines four bodies up at fc-62, -18,
  +30, +80 (fc = clamp(GR.x1+170, GR.x1+140, 450)), bases stepped +8/+4/0/-4 so the order reads as depth.
- Apply when the bodies are home if they run across the monsters (ff2): glows drawn at a running body's spot land on the monsters.
- Party pop text (b2PopParty, engine/battle-draw.js) is clamped inside the canvas (v226).
- Build order (tombo-review.md): tiers 2 and 3 as chapters unlock (DONE: all 21 Tombos animated), then Family Finishes (ff1, ff2
  done v230; ff3, ff4 done v232), then Director's Cuts (part 1 v233: grace1_dc, rose1_dc). Keys, HEART cost and multiplier stay; name, scene, lines and animation change.

## Phase 5b Ultimates built (v191 Grace, v192 Rose, v193 Amy, v208 Deedee, v209 Boppy, v210 TNB, v212 Nara); 5a Tom (v181)
| Who | A6 | B6 |
|---|---|---|
| Tom | Boarding Group Zero delta_ult | Cartridge Tilt cart_ult |
| Grace | Ten Million Subscribers viral_ult | Diamond Leotard Finale olympic_ult |
| Rose | Tea Party with Lamby teaparty_ult | Operation Shoulder Mecha mecha_ult |
| Amy | Detention Forever detention_ult | Boston Qualifier marathon_ult |
| Deedee | Sunday Roast Spread sunday_ult | To the Moon and Back moon_ult |
| Boppy | The One That Got Away fish_ult | Van Cortlandt Park '70 xc_ult |
| TNB | That's a Wrap! wrap_ult | Baxter Street Bomb hillbomb_ult |
| Nara | CHAIRMAN CHEEKS! squirrel_ult | The Unsent Scent pack_ult |
- Numbers and built-as details in claude/CHANGES.md. Prefixes g5_, r5_, a5_, d5_, b5_, t5_, nu_; BAR=24 letterbox and inBox(); jog()
  (Amy, Deedee), foilBox() (Amy), quiltBox() (Deedee); catfish(), b5_sepia, b5_spin (Boppy); shirt(), mug(), rackAt(), heart() (TNB);
  cheeks() (Chairman Cheeks, the squirrel), trailPath() (smooth path with arc length), pawPrint() (Nara).
- ST.group() returns x, x0, x1, top, base, w, list: NO mid. Use (Gp.top+Gp.base)/2.
- ST.keys path gotcha (v212): a segment's dx/dy is added ON TOP of the straight line from its key to the next key. To follow a
  custom path P(u), use ease:'lin' and dx:u=>P(u).x-lerp(a.x,b.x,u) where a and b are that segment's key and the NEXT key.
- Readability (v212): Nara's black fur over Tom's dark shirt reads as "translucent"; land her beside him, not on top. Draw order is
  party index (Nara last), not depth; Rose riding Tom is the exception (drawn just before Tom, v218).
- A big word fading out under the next big word at the same spot leaves a ghost letter; shorten the first.
- bigWord at sc 3 with a dark fill merges into its own outline (THAT read as TMAT); use label() for dark text inside bubbles.
- Letterbox gotcha (v210): the first front-layer scene inherits whatever globalAlpha a fading pop left behind; bars scenes set
  gfx.globalAlpha=1 themselves. Boppy's b5_bars (and earlier ones) still have the latent issue.
- Greyscale and sepia (nu_grey, b5_sepia): composite fills tint everything drawn before them; scenes created later stay in color.
- Scene draw order = creation order within a layer.
- E2.apply() before the final landHit applies effects early; otherwise the last landHit applies them.
- Member-id targets work in ops (['ct',-.5,'tom'], ['revive',.5,'tom'], ['heal',.2,0,'tom']); skipped silently if that member is
  not in the party.
- Revive gotcha: b2Effect skips a friend revived by the same move for every later op (M.revived).
- Party members moved by jog() are not at ST.unit(p): scenes drawn on them during the move must add the jog offset.
- Aim warp gotcha (v218): while B2.aim is set, the actor's drawn position is b2WarpPt(cx,base), not the path's cx/base.
- Canon kept: Boppy's complaints are his stomach, his back and people walking too fast. TNB is a wardrobe runner (his chair says
  WARDROBE). Michael and Justin are the same height, about 10% taller than the other adults (v211). Chairman Cheeks: a smug squirrel
  in a top hat and monocle, Nara's arch-nemesis in Old Oak Park (v212). Boppy speaks with a thick New York accent and a deep voice
  (2026-10-25). Rose rides Tom sitting on his shoulders (v218). Tom and Amy's birth order is not on record: never write "older" or
  "younger".

## Dialogue portraits (v201, another session)
- index.html #dialog-portrait (64 px art at 4/3; 68 px in landscape). engine/overworld.js DIALOG_PORTRAIT_IDS and
  setDialogPortrait(name) from openDialog; images from PORTRAITS in engine/menu.js. Party members' faces show; others do not.

## Spoken dialogue boxes (v220 chapter 1, v224 chapters 2 and 3; another session; claude/voice-baking.md "Dialogue")
- v247: ch8 (157 clips), ch9 (179) and ch10 (158) live. Clips in the game: 1903 (247 + 291 + 178 + 156 + 176 + 195 + 166 + 157 + 179 + 158).
  Dialogue voice files total about 79 MB. The pipeline for chapters 1 to 10 is complete; any new or reworded line needs a re-bake
  (clips play only on exact text match). Merges ran in parallel, about 18 s each; ch8 key collision mudling|Reheated! Round two! is expected.
- v246: ch6 (195 clips, 16 speakers: Tom, TNB, Olivia, Michael, Bernadette, Peanut Gallery, Twig Spy, Cheek Stuffer, Chairman Cheeks,
  Mr. Washington, Marisol, Larry, Acorn Agent, Sticky Sap, Acorn Cache, Sol) and ch7 (166 clips, 14 speakers: Tom, Grace, Rose, Amy, Deedee,
  Boppy, Sal, Page, The Cliffhanger, The Know-It-All, Pop-Up Panic, The Unread, Shusher, Dog-Ear) live. Clips in the game: 1409
  (247 + 291 + 178 + 156 + 176 + 195 + 166). Dialogue voice files now about 58 MB; ch8 to ch10 add about 20 MB more. Each merge took
  about 18 s (ch6 and ch7 ran in parallel into the same outdir, different files).
- v245: ch4 (156 clips, 13 speakers: Tom, TNB, Ray, Kiki, Dana, Toni, Cue Card Crab, Clapper Snapper, Boom Mic Moth, The Director’s Cut, Extra Extra,
  Fog Wisp, Sol) and ch5 (176 clips, 18 speakers) live; data/dialog-cast.js is now claude/dialog-cast-ch1-10.js (files list ch1 to ch10, all new
  speakers and speakerFx). The engine skips the not-yet-published dialog-ch6..10.js quietly (script onerror). Merge ch6 to ch10 the same way;
  the cast is already live, so publish only data/voice/dialog-chN.js. Clips loaded in the game: 1048 (247 + 291 + 178 + 156 + 176).
  Dialogue voice files now total about 44 MB (ch1 9.6, ch2 12.7, ch3 7.3, ch4 6.9, ch5 7.3); ch6 to ch10 will add about 35 MB more.
- v244: ch3 clips live (178 lines; 17 speakers: Tom, Grace, Rose, Deedee, Boppy, Amy, TNB, Sal, Sol, Oolong, Bean, Reel, Bobber, Soggy
  Sock, Tangle, Snag, Old Iron-Gill). The 20 'Round {n}.' lines (n = 2 to 5) are templated, so they are not verbatim in the source: expected.
  File sizes now: dialog-ch1 9.6 MB, ch2 12.7 MB, ch3 7.3 MB (plus about 33 MB of battle voices); ch4 to ch10 will add roughly 5 to 8 MB
  each. If first launch on the phone gets slow, move clips to the asset store and fetch on demand.
  Merge check that worked: speakers in the json vs DIALOG_CAST.speakers (must be 0 mismatches), then dvtest.py (now also checks that
  every clip voice has a speaker and plays real pages from an optional LINES json of [speaker, text] pairs).
- data/dialog-cast.js and engine/dialog-voice.js (wraps say, loadDialogLine, advanceDialog, S.talk...). Session builds: copy both
  from the live artifact into the build (they load after engine/chapter-select.js); the clip files data/voice/dialog-ch<N>.js are
  voice files: skip them like data/voice/*.js (stub data/voice/dialog-ch1/2/3.js empty too).
- Bakers sent to Tom 2026-10-25 (fixed casting retry the same day): chapter1/2/3-voice-baker.html. He opens 1, 2, 3 in the same
  browser; 34 designed voices (21 + 12 + 1). Merge each dialogue-chN.json he sends (voice-baking.md "Dialogue"). On v229 the live
  data/voice/dialog-ch1.js is 6.6 MB (chapter 1 clips merged by another session); dialog-ch2/3.js are still placeholders.

## Task P: polish pass (done: v198 to v207)
- Built-as details per move in claude/CHANGES.md and CHANGES-archive.md. Code: a "Polish pass" IIFE at the end of each move file.
  Prefixes: Tom tp_, Grace gp_, Rose rp_, Amy ap_, Deedee dp_, Boppy bp2_, TNB tp2_, Nara np_.
- Gotcha: a move IIFE captures `scene` at load (const {scene}=RFX), so wrapping RFX.scene later does nothing.

## Task R: Tom's round 3 overrides (v196 Tom, v197 TNB)
| Who | Slot | Was | Now | Key |
|---|---|---|---|---|
| Tom | A2 | Crumb Shot | Sourdough Snob | sourdough_snob |
| Tom | A3 | Mint Unboxing | Overpriced Gadget | overpriced_gadget |
| Tom | A5 | Window Seat | Seat 1A, Peasants | seat_1a |
| Tom | B3 | Save Point Sandwich | 10-Step Skincare | skincare_10 |
| Tom | B5 | Patch Notes | Know-It-All | know_it_all |
| TNB | B1 | Clay Pigeon, Literally | Dad-Joke Pottery | dadjoke_pottery |
- Code: tom-moves.js IIFE t3_, tnb-moves.js IIFE t3n_. Tom facing right uses the 'flip' frame; lying flat: rot PI/2 with dy = TH()/2 - 16.

## Current Primary keys (Task M plus Task R)
| Who | Basic | Sig | A1 | A2 | A3 | A4 | A5 | B1 | B2 | B3 | B4 | B5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Tom | button_mash | defend | starter_splash | sourdough_snob | overpriced_gadget | noise_canceling | seat_1a | flashcard_flurry | konami_code | skincare_10 | kanji_strike | know_it_all |
| Grace | cartwheel | dance | squishy_squeeze | glitter_nails | welcome_back | like_subscribe | dumpling_drop | dance_battle | beam_dismount | handstand_contest | split_leap | chalk_up |
| Rose | boop | silly (RASPBERRY) | boo | dress_up_tiara | giggle_storm | lamby_hug | floor_is_lava | lookout_lamby | piggyback_pounce | bedtime_story | lamby_boomerang | pillow_fort |
| Amy | kettlebell_swing | pep_talk | red_pen | hot_lunch_tray | goldstar_recess | inside_voices | pop_quiz | burpee_blitz | hill_repeats | oat_milk_please | false_start | negative_split |
| Deedee | dish_towel_flick | moon_back | registered_nut | corner_piece | wet_floor | wine | oven_mitt_ultimatum | brisk_means_brisk | garden_shower | rise_and_shine | beanie_master | grandma_squeeze |
| Boppy | cap_swat | grumble | patient_angler | recliner_reservation | headcount_again | lockdown | everybody_waits | pepper_breath | seeds_of_trouble | mild_for_company | nineteen_seventy | five_alarm_jar |
| TNB | mug_toss | wardrobe | quick_change | continuity_pins | metro_tap | slasher_scare | rush_hour_racks | dadjoke_pottery | cone_six | curb_appeal | fix_wobble | kiln_door_policy |
| Nara | jump_up | puppy_eyes (HUMAN EYES) | tennis_ball_fetch | dont_leave_me | just_one_bite | counter_surfer | stranger_alert | doodle_fluff | shake_everyone | not_leaving | happy_puddle | food_inspector |
- IIFE prefixes, newest last: Tom tv_, t3_, tp_; Grace gv_, g5_, gp_; Rose rv_, r5_, rp_; Amy av_, a5_, ap_; Deedee dd_, dv_, dp_,
  d5_; Boppy bp_, bv_, bp2_, b5_; TNB tn_, tv2_, t3n_, tp2_, t5_; Nara na_, nv_, np_, nu_; Tombos tb_. The latest assignment wins.
- Likes (B8_LIKE_ALIAS): tom.starter -> sourdough_snob; grace.squishy -> squishy_squeeze; grace.subscribe -> welcome_back;
  rose.peekaboo -> boo; deedee.nurse -> registered_nut; deedee.crisp and deedee.dinner -> corner_piece; tnb.quickchange ->
  quick_change; tnb.metro -> metro_tap; nara.puppy -> puppy_eyes; boppy.recliner -> recliner_reservation; boppy.trackstar ->
  nineteen_seventy; amy.pb -> goldstar_recess.
- Remix name clashes to fix in the Remix phase (data/abilities.js r): see claude/CHANGES-archive.md (Task M).
- Nara speaks only barks and whines; 3x5 font has no comma or slash. It does have a colon, a period, a question mark and a straight
  apostrophe (curly ’ draws as a space).

## Voices (v215: every line re-voiced on Eleven v4; v217: Boppy re-voiced with his New York accent; claude/voice-baking.md)
- Clips are split: data/voice-clips.js (voice settings and Nara's barks, about 1 MB) plus data/voice/<id>.js for tom, grace, rose,
  amy, deedee, boppy, tnb (2 to 5 MB each; each sets VOICE_CLIPS.clips.<id>). index.html loads them right after voice-clips.js.
  Session builds: skip data/voice/*.js like voice-clips.js (stub with empty files); never publish them except in a voices.json merge.
- Merge with claude/voice-merge.js (rules in voice-baking.md). Boppy's v4 clips are pitched down 2 semitones at merge (rubberband).
- Boppy: every bracket in his scripts starts "thick New York accent"; similarity 1.0. All 43 of his lines re-baked and merged (v217).
- v235 (another session) merged voices__19_.json: every Tombo and Family Finish line is baked.
- v237 (another session) merged the v233/v234 DC lines (8).
- DECIDED by Tom 2026-10-25: he does ALL voice files once every ability update is complete. Do not build or send bakers until
  then; keep adding scripts to claude/voice-baker-scripts-tombo.json and lines to this list.
- Lines to bake (OLDER Task B list, superseded by the 2026-10-27 entry at the top): tom.button_mash "Smashing all the buttons always works!",
  tom.sourdough_snob "Seven tiers, structurally sound. Everybody gets a slice.", grace.tombo "Ta-Ta, I need a new squishy! Pleeease!", tom.tombograce "Fine. One squishy. Just one.",
  grace.tombo3 "Ta-Ta, make a wish on my dumpling! A BIG one!", tom.tombograce3 "I wish everybody gets back up. And snacks.", tom.dcgrace2ow "OW!". Old grace.tombo3 and tom.tombograce3 clips stop playing.
- Lines to bake (v279): ONLY the 4 held lines in the top entry (grace.dcff2, amy.dc3, deedee.dcff3, deedee.dc3). The Rose, v274, v272 and v273 lists below were
  baked and merged in v279 EXCEPT those four (kept for history).
- Lines to bake (Rose kit, live v276; scripts IN claude/voice-baker-scripts-tombo.json): rose.boo "BOOOO!! Did I scare you? I did!",
  rose.dress_up_tiara "I drew you a unicorn on a rainbow! Snip snip!", rose.giggle_storm "Tickle storm! Everybody laugh! HA HA HA!",
  rose.lamby_hug "A hug from Lamby AND Backup Lamby!", rose.lookout_lamby "Lamby boomerang! Backup Lamby too! Come back, both of you!",
  rose.bedtime_story "Bedtime story! Once upon a time, there was a Lamby. Then came Backup Lamby!", rose.lamby_boomerang "Ms. Cathy! Snack
  attack! Bring the cookies!", rose.teaparty_ult "Tea party! Lamby made the tea and Backup Lamby serves it!". rose.silly lost "Nyeh nyeh nyeh!"
  (no new clip; RASPBERRY speaks no words).
- Lines to bake (v274, silent until the all-voices bake; scripts in claude/voice-baker-scripts-tombo.json): tnb.dcff1, rose.dcff1, grace.dcff2, rose.dcff2, boppy.dcff3, deedee.dcff3, tom.dcff4, rose.dcff4. Before that (v272, v273): tom.dcamy3, amy.dc3,
  deedee.dc3, tom.dcdeedee3, boppy.dc3, tom.dcboppy3, tnb.dc3, tom.dctnb3, tom.dcnara3, nara.dc3 (Nara: add DOG.dc3 "one quick sniff, a
  pause, one soft muffled woof" + DOG_LEN.dc3 and a v16 template block). Before that: none. v251 (2026-10-25 late) merged Tom's voices.json from directors-cuts-voice-baker.html: all 25 Director's Cut lines (v236 to v242, plus rose.dc1 "No! It's Lamby!") are baked and live; the stale rose.dc1 clip was removed. Only data/voice-clips.js and data/voice/*.js were published (page unchanged). Scripts for them stay in claude/voice-baker-scripts-tombo.json. New or reworded lines need a re-bake (clips play only on exact text match).
  Template history: v14 (v238): DOG.dc1 (puzzle toy: three quick sniffs, a pause, a loud triumphant bark), DOG_LEN.dc1 2.4. v15: DOG.dc2 (two excited yips, one big bark).
- Template v14 (v238): DOG.dc1 (puzzle toy: three quick sniffs, a pause, a loud triumphant bark), DOG_LEN.dc1 2.4, v14 block (same
  reset as v11 plus Nara's dc1 sound). The next new Nara line needs its own DOG.<kind> and a v15 block.
- Template v11 (claude/voice-baker-template.html, 2026-10-25): DOG.tombo3 (lap snuggle: a soft muffled mmf, a pause, a long happy
  nose sigh), DOG_LEN.tombo3 2.4, and a v11 block that un-ticks takes already in the game and sets Nara's tombo3 sound (v10 did the
  same for tombo2). A new Nara line needs its own DOG.<kind> entry plus a v12 block like v11. The v230 rebuild needed no template
  change (no Nara line).
- 2026-10-25 (22:3x): Tom asked for a baker of just the 24 silent DC lines above, so one was built and sent (directors-cuts-voice-baker.html,
  70 KB, template v15; re-sent with rose.dc1 added, 25 lines, 23 voice calls). Template v15: DOG.dc2 + DOG_LEN.dc2 (2), v15 block (Nara dc1 and dc2 sounds, TNB dc1 script reset), charCfg now starts
  from the live voices' saved settings (Boppy similarity 1 and direction), Save voices.json only exports takes for lines in the baker (older
  takes in the browser's IndexedDB can no longer overwrite clips already in the game). claude/voice-baker-build.js: MISSING=1 keeps only
  lines with no baked clip (same test as engine/speech.js) and drops all clip audio. Build: `MISSING=1 node build.js <vdir> voice-baker-scripts-tombo.json out.html`.
  tnb.dc1's script spells out Second Avenue (game text still says Ave). Checked headless with the API mocked: 24 lines, 22 voice calls
  (model eleven_v4, voice_settings stability + similarity_boost only, seed) and 2 Nara sound calls. WHEN Tom sends its voices.json: merge with
  voice-merge.js (voice-baking.md "Merging"), publish only the voice files, then clear the Lines to bake list above.
- Baker build: copy claude/voice-baker-build.js to <dir>/build.js and claude/voice-baker-template.html to <dir>/template.html (the
  build reads template.html NEXT TO ITSELF; project_read returns both inline, so Write them out verbatim), then node build.js <vdir>
  <scripts.json[,more]> <out.html>. vdir holds lines.js (the build copy with the new lines), voice-clips.js and voice/<id>.js for
  tom, grace, rose, amy, deedee, boppy, tnb (Artifact read them with out_dir; they land under data/, move them up; no dialog-ch
  files). The v233 build used only voice-baker-scripts-tombo.json; 44 scripts. ONLY=<id,...> builds a smaller baker. Check:
  claude/bakertest.py or open the html headless, set S.filter='needv4' and print allLines().filter(todo) (38 on v230). Scripts spell
  Ta-Ta as Tah Tah. Any new Boppy line: "thick New York accent" in every bracket.

## Known gaps
- Barrier events (Distance on tnb3, Fear on nara3, Exhaustion on
  ff2, Aging on ff3), Remix versions, Polish
  rank 2 flourishes not built.
- Pepper Contest (v273): about 7.6 s plus the closing message. Kitchen dusk, letterbox, a lamp glow; a little round table with a bowl of
  peppers drops in at mx (mx = clamp(GR.x1+150, GR.x1+110, 470)); Boppy at mx-44 facing right, Tom at mx+44. Four rounds 560 ms apart
  (red, orange, green, glowing black): a pepper flies from the bowl to each mouth (Boppy first, mirrored act; Tom 160 ms later, act),
  crunch crumbs; HOT. HOTTER. HOTTEST. HELP. over Tom; Tom's face goes redder each round (skin-only flush), sweat drops fly off his head
  and a puddle grows at his feet, steam from his ears; Boppy stays calm (hip), says his line after round 2; Tom's line after round 4.
  RUMBLE... over Boppy, rumble lines at his belly, his face reddens; the table slides away; Tom hops in just behind him (bx+10, 12 px up),
  Boppy steps left; both lean back, then FWOOOSH! (top band 52): two fire cones (Tom's above Boppy's) across the target row, the room
  flushes orange, each row monster jolts (landHit split); E2.apply (GRIT-, STOLE, BURN +1), orange glows; TIE. over them; home. With 4
  members Tom's spot overlaps the second member's home (same as other stage-spot Tombos).
- Golden Repair (v273): about 7.5 s plus the closing message. Studio at night (back layer: work-lamp glow, a shelf of six pots above the
  pair). TNB at mx-40 facing right hands Tom a tea bowl (2.2x); it slips, falls, CRACK!, three pieces on the floor; Tom kneels, the pieces
  float up to his hands (split .6); TNB's line; TNB steps in and brushes (act/aim): the pieces close up and gold runs along the cracks
  (brush tip follows the seam); Tom's line; the bowl rises to y 112 and grows to 5.2x, seams glowing; GOLDEN! (top band 40); three gold
  zigzag beams from the seams into the target: MENDED! (66), landHit 100, gold seams flash across the monster; E2.apply (GUARD for the
  party, Amber cleared), gold glows; the bowl shrinks back into TNB's hand; kiss heart; home.
- Under the Table (v273): about 7.3 s plus the closing message. Warm dining room (hanging lamp). A table with a red gingham cloth drops in
  (tL = fc-50 .. fc+80, fc = clamp(GR.x1+120, GR.x1+100, 430)); Tom stands behind it at tL+30 (6 px up); dishes: sourdough, Tom's bitten
  loaf, a candle, a juice glass. Nara runs to the left end, ducks under (her body is hidden and drawn clipped to x < tL, so only what
  pokes out past the end shows); Tom's line; three bits of sourdough fall from his hand to her as she pokes her head out (sniff, crunch,
  hearts); her line; WAG WAG: she scoots under to the middle, the table jiggles and the dishes hop. POP!: she leaps straight up, the
  cloth lifts over her like a sheet, flies off (the plates stay put), sails left over the room flapping and drops over every monster
  (FLUMP! at 40), which wriggle under it; landHit split (HOOKED pops at E2.apply); Nara lands at the table's left end and sits (drawn in
  front of the cloth), sparkles; Tom slips her one more bit, heart; the cloth fades at home. With 4 members she sits clear of the others.
- Elevator Cheat (v272): about 7.6 s plus the closing message. Dusk, letterbox; a blue tower cutaway rises at wx = clamp(GR.x1+84,
  GR.x1+70, 400) (stairwell left with three zigzag flights, glass elevator shaft right, a machine hut over the shaft, a roof ledge
  reaching left over the monsters to GR.x0-18). Amy and Tom walk to its doors shrinking to .5 (into the distance). Amy clicks her
  stopwatch (aim), Tom presses the call button (act), his line; GO!: Amy sprints the flights (run frames, speed lines, floor counter
  01F..60F over the stairwell); Tom rides the glass car up calmly (idle bob, elevator-music notes; his own counter on the hut). Amy
  reaches the roof first (1ST! at 40), waits tapping her foot (hip). DING! (66): the glass doors open, Tom steps out (celeb). Amy holds
  up the stopwatch (0:58), her line (expr/act, anger vein), stomps three times (STOMP! 40, 66; the third is CRUNCH! at 40): a crack runs
  along the ledge a third at a time, then the ledge breaks into one slab per monster that falls on its head (squash .8, stars, it stays
  until home) and small bits that fall past. Apply at its own beat (no damage, no kindness, no landHit): HURRY UP and PEP+ pops, green
  glows; they hop down home as the tower sinks. The white blob at the first slab landing is the High-Five prompt.
- Feast on Jefferson Park (v272): about 7.5 s plus the closing message. Dusk tint with a warm horizon, two strands of string lights that
  switch on left to right, letterbox. A long yellow polka-dot party table drops in (front layer; its cloth hides the pair's legs) at
  fc = clamp(GR.x1+110, GR.x1+90, 420); Deedee at fc-40 (faces right), Tom at fc+40. Four dishes fly in from the upper right into slots
  (sourdough, gumbo pot, pupusa plate, rhubarb crisp, 1.2x, steaming) while Tom places them (act); Deedee's line; she moves every dish
  to a new slot (hops); WIPE!: her towel sweeps the table three times, each dish lifts as it passes, sparkles; Tom's line; Deedee sits
  (sit frame, behind the table) for one beat, NOPE., pops up (celebFlip hop) and moves the gumbo to the middle again. FEAST! (40 over
  the table): golden aroma ribbons with food bits roll left over the monsters; each leans toward it as it arrives (pink rings, hearts,
  YUM! alternating 40/66); the last one calls landHit(100) (warmth). E2.apply: UP for the fallen (35%), heal and CURED pops, +3 CRUST;
  gold glows; home. With 4 members the table's right end sits just left of the third member.
- Shadow Squishy (v242): about 6.8 s plus the closing message. Lights out (dim wall, front-layer dark with soft holes around the
  pair and the lamp). Tom at tx = mx+30, Grace at mx-30 (mx = clamp(GR.x1+150, GR.x1+110, 470)), a green reading lamp on the floor
  at tx+44 clicks on; a beam to a lit patch on the wall over the monsters. Tom raises his hand (act): a wobbly shadow bunny with one
  bent ear, BUNNY? over his head; Grace turns, hops (celeb), her line, raises her hands (act): the bunny fades into a perfect shadow
  dumpling (light shines through its eyes and smile), PERFECT! (top band 40), sparkles; Tom's line (expr). The light patch spreads
  over the whole stage and the shadow dumpling grows huge over the target; the target shakes and sweats (!), then ducks small and
  scoots left (EEK! at 66); the shadow rears up and squishes down: SQUISH! (40), landHit 100 (damage and hearts), E2.apply (CLOSE-UP
  pop); lights back on, the target pulls itself together; home. The wrist shadow under the dumpling fades as it grows.
- Lamby Night-Light (v242): about 7.5 s with 3 monsters plus the closing message. Night (moon and stars behind a near-black dark).
  Rose walks to the stage spot (rose3 layout) and huddles in her kneel frame, shivering, hugging a small Lamby, in a little patch
  of light; glowing yellow monster eyes blink in the dark; she stands to say her line (act). Tom walks over in his own patch of light,
  kneels, Rose hops onto his shoulders (seated via the ride spot) and hands Lamby up; Tom holds it up and forward (act frame), his
  line; Lamby grows, its eyes glow, a halo and rotating gold rays; the light hole grows from Lamby to the whole stage (GLOW! at 40),
  shadow wisps with eyes scurry off left, and each monster runs 140 px left the moment the light reaches it (SHOO! at 66). They
  creep back; pink rings and hearts as they arrive: landHit 100, then E2.apply (DELAYED and INTERRUPTED pops, CURED for the party,
  SHOULDER RIDE: rose.intro3 is said, intended); gold glows; Lamby goes back to Rose on Tom's shoulders; home seated. With 4
  members the SHOULDER RIDE pop sits at the very top of the canvas (same as rose3).
- Last Train Home (v241): about 6.7 s plus the closing message. Subway platform (back layer): tile wall, METRO sign at the top left,
  a long silver car (LAST TRAIN) behind the monsters with its sliding doors at dX = clamp(GR.x1+56, GR.x1+44, 460), platform with
  a yellow edge in front. DING DONG; the doors start closing (red door light); Tom and TNB run from home (Tom slow, sweating, act
  frame); TNB jams his longboard in the gap (CLUNK!, doors shove at it), his line; Tom's line on the jog; TNB crouches (kneel,
  only a slight crouch in his sprite); DIVE! (top band 40): Tom dives head first through the doors (the doors bounce open a bit),
  hidden inside; TNB yanks the board and hops in; the monsters rush the doors; SLAM! (66): doors shut in their faces, they squash,
  stars and hearts, bounce back. Tom and TNB wave from two car windows, kiss heart; the train pulls out left; NEXT STOP: HOME; they
  pop back home with a hop; then the warmth numbers, CURED and HURRY UP land together (landHit 100 + E2.apply), pink rings on the
  monsters, glows. The SLAM! word sits next to the METRO sign at the top. With 4 members both runners pass in front of the others.
- Nara, No! (v241): about 6.6 s plus the closing message. Tom walks to tx = clamp(GR.x1+150, GR.x1+120, 470); Nara trots to the
  bottom-right of an ellipse that circles the monsters and Tom (bottom edge in front of the lowest feet, top edge at the back row's
  feet), play-bows (wind frame, wiggle), her line; ZOOMIES! (top band 40, after the banner) and two laps in 3 s: dust trail and
  speed lines, each monster spins and hops as she passes its feet (lap 1 does the damage: landHit split per monster, lap 2 is bonks
  only); Tom turns to follow her (flip/idle) and points as she passes him: NARA, NO. / NARA. / NO. / NARA! over his head; his line;
  she brakes, trots to tx-46 and sits (front-facing sit frame) with gold sparkles: E2.apply (INTERRUPTED pops); GOOD GIRL.; Tom
  kneels, heart; home. A spun monster flashes white on its hit (standard). Nara runs over the party at the right of the loop.
- Library Vault Lantern (v240): about 7 s plus the closing message. The library vault: stone arches full of books and a flagstone
  floor (back layer) under a near-black dark (darkC) with soft holes. Tom walks to tx = clamp(GR.x1+120, GR.x1+96, 430) facing
  right (mirrored act) and holds out a tarnished brass lantern between him and Deedee (lx = his hand +6; Deedee at lx+18 minus her act
  hand offset). She pulls out a pink hankie and polishes in circles, faster and faster (rub period 230 to 70 ms, act/aim frames),
  her line; SQUEAK! and SHINE! over the lantern; the brass shines, the flame grows, the light hole grows. Flare (white flash): a red
  and white lighthouse rises from the floor behind Tom's hand with the lamp room up at yT 84 (back layer; only the lamp room is
  redrawn over the dark), LIGHTHOUSE! (top band 40, left of the tower); Deedee celebrates; Tom's line (he never lets go). The beam
  sweeps left across the monsters (each warms as the beam's end passes: chime, rings, hearts; the last one calls landHit(100)),
  then right across the family: E2.apply (TUCKED pops, +2 CRUST), warm glows, two crust tins steam at Deedee's feet. The
  lighthouse sinks back into the lantern, the vault lights up, home (the lantern follows Tom's hand and fades). With 4 members the
  party is crowded behind the tower (Deedee in front of the third and fourth members).
- Bird's Nest (v240): about 6.7 s plus the closing message. Cattail Pier (lake under the monsters, reeds, pier under the pair, same
  palette as boppy1_dc). Tom at tx = clamp(GR.x1+190, GR.x1+150, 530) with Boppy's rod; Boppy left of him facing right (flip), never
  left of the pier edge (bMin). Tom winds back and casts: SPROING! (top band 40), the reel explodes into a white tangle at his
  hand. Boppy's line (expr, then hip); he grabs it (mirrored act) and tugs three times, each tug grows it (16, 26, 38, 52 px) and
  pushes him back a step: WORSE., WORSER. over Boppy. Tom's line (celeb hop). The tangle rolls off the rod in an arc onto the
  target, wraps it tight (squash .9, wriggle): WRAPPED! (40), landHit 100 + E2.apply at once (damage, STOLE pop if it had a buff);
  Boppy celebrates then sulks; home, the net fades as the monster pops back. With 4 members Tom's spot overlaps the second member's
  home (same as other stage-spot Tombos). The giant tangle covers Tom's front for about a second (intended: it is huge).
- Princess and Her Bodyguard (v239): about 7.4 s with 3 monsters (640 ms per extra monster) plus the closing message. Tom
  (sunglasses and earpiece the whole time) at tx = clamp(GR.x1+120, GR.x1+96, 440), Rose at tx+62; a tiara drops onto her head,
  a red carpet unrolls left from her to past the monsters (back layer); her line (celeb hop); the monsters lean in (?); Tom talks
  into his earpiece (blue crackle), his line; DEFEND (top band 40): he steps in front to tx-46 and the monsters back off. Rose
  processes right to left: stops at each monster's right edge, taps it twice with Lamby on a gold stick (boop boop), it bows
  (tilts, slides back, stars), KNIGHTED! on the first (40) and BOW! on the rest (alternating 40/66), hearts; the last knighting
  lands warmth and the fx (EVADE x party, CURED, SHOULDER RIDE pops pile up there; rose.intro3 is said, intended). Tom kneels, she
  hops onto his shoulders (seat spot) and they walk home seated; the monsters straighten up. With 4 members Rose's start spot
  overlaps the second member's home.
- Spot Me, Tom (v239): about 7.0 s plus the closing message. Dark rubber gym floor with yellow lines under the pair (back layer);
  Tom at tx = clamp(GR.x1+150, GR.x1+124, 448), Amy at tx+92. Amy rolls a 50 lb kettlebell to his feet; her line (act/clap
  frames, pointing); three swings on a pivot at his chest (kneel frame low, act frame high; ONE! TWO! THREE! over Amy), rep 2
  wobbly with sweat, rep 3 goes overhead (celeb) and wobbles; his line; NOPE. (40) and he lets go: it arcs high and drops onto the
  front monster's head, CLANG! (66), the monster squashes (fsc .72) with stars, the bell stays on it until home; Tom kneels
  (spent), Amy stares (hip, then expr); water break: E2.apply (VP MAX for both, GUARD for the party), blue glows; home. No damage
  and no kindness (Carry the Other Bag numbers), so the CLANG shows no number (intended). With 4 members Amy's spot sits in front of
  the third and fourth members' homes.
- Puzzle Toy (v238): about 6.9 s plus the closing message. Tom walks to tx = clamp(GR.x1+200, GR.x1+170, 512), kneels and slides a
  wooden puzzle toy (three colored lids) to px = tx-122 on the floor (front layer, Nara's legs behind it). Nara (aim frame = nose
  down) works right to left: sniffs, the lid pops up, a treat pops out, crunch; on the middle lid she raises her paw first (act frame):
  BONK, the toy rattles, Tom's expr frame; Tom's line runs over the first two lids. The left hole is empty: ? over her, whine. Her line;
  a gold scent trail grows from the empty hole to under the target with a glint; she runs to the monster's right edge, noses under
  it: FLIP! (top band 40), the monster spins upside down with a hop (landHit 100 and E2.apply at once: STOLE <item> or STOLE COINS
  pops), a big glowing treat sits where it stood; she grabs it and trots back beside Tom (celeb), heart; the monster rolls back
  upright; home. With 4 members Tom's spot overlaps the second member's home (same as other stage-spot Tombos).
- Judge Grace (v238): about 7.2 s plus the closing message. Blue gym mat (SC.tb_mat); Tom at tx = clamp(GR.x1+150, GR.x1+124, 448),
  Grace behind a little blue JUDGE desk at gx = tx+104 (front layer, hides her legs). Tom (celeb) tries a cartwheel: tips sideways
  with a wobble (act frame, rot to -1.15), flops flat (rot -PI/2): FLOP. with stars over his head; Grace (celeb) holds up a red 2
  scorecard, her line; the monsters laugh (wobble, tears; HA HA HA! at 40, LOL at 66); Tom sits up (kneel), his line; Grace hops over
  the desk (it fades), cartwheels twice (the second one right over Tom: OVER!), flip-kicks the front monster of the row in the face
  (FLIP KICK! at 40, landHit 100 + E2.apply: HOOKED pops), bounces back to tx+16 and holds up a gold 10, fanfare and confetti; Tom
  gets up and claps; home. With 4 members the third member's home sits behind the desk.
- Quiet on Cattail Pier (v236): about 6.4 s plus the closing message. Back layer: lake under the monsters with cattails behind them,
  the pier under the pair, a green folding camp chair at bx = clamp(GR.x1+112, GR.x1+92, 452) (front layer adds its near X legs while
  Boppy sits); Tom at bx+88 with the green tackle box at his feet. Boppy sits (sit frame); Tom clips a glowing sourdough-crust lure
  (boule with a bite) onto the rod tip; SHHH! and Boppy's line; ripples behind the back row; Tom points (act), his line; Boppy stands,
  winds back and casts; ZIIIP! (top band 40), the hook arcs over everyone, SPLASH! (66); the line lies across every monster's head
  to the hook beyond the back row; the monsters tug; Tom steps in (bx+36) and grabs the rod (two fists); YANK! (40): both lean back,
  landHit 100 and E2.apply at once, the back row slides forward into its new front spots; MY BACK. (Boppy kneel, canon); line slack;
  home. Pops (PULLED IN, HOOKED, BURN +2, damage) crowd the yank moment. The row change needs room: front row max 3.
- 2nd Ave Window Wash (v236): about 6.5 s plus the closing message. Grey 2nd Ave tint (lifts after the wave); smog puffs everywhere,
  over the party too. Tom at tx = clamp(GR.x1+160, GR.x1+136, 460); a TURBO box drops at tx-50, opens, a white turbo fan rises (back
  layer) and spins up: WHIRRR!, wind lines, the smog drifts onto the monsters. TNB (tx+84, hose to the right edge) says his line,
  carves a half-circle in front of Tom on his longboard spraying a rainbow arc over the party (drops on each member), glides to
  tx-52 facing right: kiss heart, E2.apply (CURED, COOL-, warmth, Tom's costume pops), cyan glows. He turns the hose on the
  monsters: a jet, then a soapy wave (clipped left of x0 = tx-100, foam column at the clip edge) rolls left over every monster
  (landHit split as the crest passes, hearts), SPLOOSH! (40), smog washed away; a window shine sweeps the screen, glints,
  SQUEAKY CLEAN! (66); Tom celebrates, his line; home. With 4 members TNB's start spot overlaps the third member's home. Unlock flags for boppy2, every tier 3
  and every finish wait for their chapters.
- Field Day (v234): about 6.3 s plus the closing message. Back layer: green lanes with chalk lines, a START line and bunting along
  the top; front: FINISH posts and a red tape at fin = clamp(GR.x1+72, 150, 480). Tom walks to tx0 = clamp(GR.x1+210, GR.x1+170, 520)
  in the upper lane (sb), Amy to tx0+60 in the lower lane (sb+14); TWEET! with a whistle at Amy's mouth, her line, GO!; Tom (act
  frame) inches forward with an egg on a spoon, sweat drop, his line; Amy sprints past (run frames), BUMP! (Tom expr frame, jolts),
  the egg arcs into the front monster's face (order3 first), SPLAT! at the top band, egg splat with drips stays to the end; Amy
  breaks the tape, 1ST! over her, confetti; Tom kneels briefly; apply: +2 VP pops and CURED on Amy; home. With 4 members Amy's
  start spot overlaps the third member's home.
- Clean As You Go (v234): about 6.7 s plus the closing message. Back layer: tile splashback; front: a small sink with suds and a tap
  in front of Deedee's hands. Tom at tx = clamp(GR.x1+92, GR.x1+80, 440) facing right, Deedee at tx+80; plates fly from her hands
  to the top of the stack in his arms, the gap shrinking 420 to 90 ms (about 20 plates); towel wipes; FASTER! and her line, his
  line; the stack sways, UH OH. (top band); it topples left about its foot onto the front monster, CRASH! (y 66), plates scatter
  and spin away; SPOTLESS! at the top band; apply: heal and CURED pops (busy, like every party Tombo); home. Tom's expr frame
  faces left while the stack grows past 6 plates.
- Smash That Like Button (v233): about 6 s plus the closing message. REC frame (SC.tb_rec, no thumb); Tom walks to tx =
  clamp(GR.x1+190, GR.x1+150, 520), Grace to tx-112; OUTRO! and Grace's line; a red arcade LIKE button falls in front of Tom
  (tx-40) and glows; Tom raises both hands (celeb), his line; SMASH! (act frame, two fists on the dome); a giant thumbs-up badge
  arcs out of the button, peaks near the top, and slams onto the target row's middle (row monsters shrink to .76 and pop back),
  LIKED! at the top band, a 0 to 1M LIKES counter under the timecode, hearts; apply: CRIT+, WEAK reveal labels and TRENDING pop
  (busy). Front row is two monsters stacked vertically in this formation, so the badge covers both. With 4 members Tom's spot
  overlaps the third member's home a little. The MILE +1 pop overlaps the banner (same as every Tombo).
- That Cloud Is Lamby (v233): about 6.7 s plus the closing message. Rose hops onto Tom's shoulders (seated via the ride spot) and
  stays there; Tom walks to tx = clamp(GR.x1+140, GR.x1+110, 500); soft sky gradient; a cloud drifts in over the target; Tom points
  (act), his line, a thought bubble with a big sourdough boule; Rose's line, a bubble with Lamby wearing Tom's hair; the cloud's
  puffs slide into Lamby's outline while a giant cloud Lamby (plush sc 3.3, Tom's hair) fades in, IT'S LAMBY! (top band 40); it
  floats down and sits on the monster (squash .84), FLUMP! (top band 66), hearts; apply: warmth, INTERRUPTED if winding up,
  DELAYED, SHOULDER RIDE (rose.intro3 is said at mount, intended); Lamby puffs back into a cloud and floats off; home. No damage
  numbers (kind move). The DELAYED and warmth pops land on Lamby's body.
- Fifty-One Years & Counting (v232): about 8.3 s plus the closing message (3 monsters). Letterbox, warm dim; Boppy at fc-30, Deedee
  at fc+16, Tom behind at fc+72 (fc = clamp(GR.x1+175, GR.x1+145, 450)); an amber hourglass rises at wx (sand runs until the
  shatter), AGING at the top band; Deedee and Boppy fade to stone; Boppy turns (flip frame) and takes her hand: joined hands, a
  heart, the stone falls away; Deedee's line; a film screen with two spinning spools above them shows young Boppy and Nurse Deedee
  (white cap with a red cross) dancing in sepia, then the picture turns to color; Boppy's line; Tom (act frame) frames them with a
  gold picture frame, camera flash, 51 YEARS!; both swing forward (act frames) and a gold wedding-ring band with a diamond rolls
  left, shatters the hourglass into amber shards, ROSES & PEPPERS! and a burst of roses and peppers, each monster jolts as the
  ring passes; apply glows; home. With 4 members the fourth stays home and overlaps Tom a little. ff3 does not cure debuffs (data).
- The Extra Place (v232): about 7.2 s plus the closing message. Letterbox, evening dim, string lights; a long checked table drops
  in at tL..560 (tL = min(GR.x1+26, ...)) with chair backs behind; members walk to seats behind it (Tom first); Tom (act) sets an
  extra place at the left end (plate, cup, GUEST card, sparkles); Tom's line; the front monster hops over and sits at the end, head
  above the table; everyone raises a glass (celeb; the girls get cups), the monster too; Grace's line; CLINK!: white flash and a
  screen-wide ring shockwave from the table, each monster jolts as the ring reaches it (landHit split by distance), hearts drift
  over the monsters; apply glows; the monster slides back; home. Nara (if present) is drawn under a lifted tablecloth hem,
  begging, with hearts; her body is hidden while seated. Rose's head is just above the table.
- Sleepover at Tom's (v230): about 7.8 s plus the closing message (3 monsters). Night tint and letterbox; the four line up in front
  of a quilt fort's lit doorway (fort drops in while Rose builds, pillows fly in), Rose's line; DANCE PARTY! with disco spots on the
  doorway, Grace and Rose bouncing, Tom tosses popcorn bags to the other three; lights out, a flashlight cone under TNB's chin, his
  line, CREAK and EEK! (the girls jump); the fort grows into a castle (turrets with pennants), wobbles and topples left onto the
  monsters, squashing into a soft heap (FLUMP!, feathers, each monster jolts as the castle reaches its head); heal glows and
  costume/Trending/SHOULDER RIDE pops at apply; home, Rose walks onto Tom's shoulders. The fort is small next to the bodies (they
  stand in front of it, heads above the wall). Status pops pile up at apply (4 costumes + Trending + ride). The MILE +1 pop overlaps
  the banner (same as every Tombo).
- Run With Us, Mommy! (v230): about 7.4 s plus the closing message. Grey tint; Amy walks to ax; a grey wall of ticking clocks rises
  at ax-78, chains from it drape over her shoulders and a stack of papers lands on her back; she kneels; EXHAUSTION at the top band;
  Grace and Rose run in; Grace's gold star flies to Mom's forehead (stays until home), 5 6 7 8! words; Rose ties a pink ribbon and
  Lamby appears in Amy's hand; Rose's line; they pull, Amy stands (papers slide off), Amy's line; the three sprint left, smash the
  wall (FINISH LINE!, shards, the chains become yellow tape ends streaming behind), on through every monster (each jolts as Amy
  passes), then jog home; effects apply once home. Status pops pile up at apply (BEST + HURRY UP for four). Grace and Rose sprint
  in their act frame (no run frames).
- The Pepper-Broth Sneeze (v229): about 6.7 s plus the closing message (3 monsters). Letterbox, dim kitchen tint; Tom at mx+36 and
  Boppy at mx-40; Boppy turns stone (his flip frame drawn by a front scene with a grey copy faded over it); Tom brings the broth
  bowl (act), his line, wafts it under Boppy's nose with orange steam ribbons; orange glowing cracks climb from his stomach to his
  head; CRACK! and he hops free; his face goes red from the chin up (tintOf red, clipped to the top 36% of his sprite) with steam
  from his ears; Boppy's line; AH... (top band 40) and AHHH... (66) while he leans back; Tom opens a red and cream umbrella toward
  him and crouches (kneel frame); ACHOOO! (y 52): Boppy turns left (act frame) and a three-layer fire cone with fireballs sweeps from
  his nose across the whole monster side, the stage flushes orange, each monster jolts (landHit split, right to left); stuns and
  HEARTBURN pop at apply; Boppy pats his stomach (hip frame); both walk home. The fire cone covers the monsters for about 0.8 s
  (intended). The apply glows are orange though boppy3 heals nobody (it marks the effects landing).
- Cone Six Across the Miles (v229): about 6.9 s plus the closing message. Letterbox, night tint; the stage is tinted LA orange left
  of mx and New York blue right of it; a palm (left) and a little skyline (right); a cold blue wall at mx; LA and NY and
  "2475 MILES" at the top band from 1.6 s (after the banner); TNB at mx-52 facing right, Tom at mx+52; both raise cups (TNB's glows
  orange from the kiln, Tom's steams); TNB's line; a gold thread joins the cups through the wall; Tom's line; they walk toward each
  other while the miles count down to 0 and the palm and skyline slide to the middle (crease shadow); the wall shatters into gold and
  ice shards, CLINK!, a kiss heart; CONE SIX! (top band) and orange-white heat arcs roll left over the monsters (landHit split);
  heal glows and costume/snapshot pops at apply; home. With 4 members Tom's spot overlaps the second member's home.
- Cuddle (v229): about 7.4 s plus the closing message. Letterbox and a violet-black dark with flickering static (darkC with holes);
  Tom walks to tx = clamp(GR.x1+130, GR.x1+100, 450), kneels and fades (hidden body; a front scene draws his kneel frame grey and
  flickering); a soft hole of light around Nara at home; SNFF SNFF; a gold scent trail on the floor from her to Tom; she runs to
  him, hops into his lap (sit frame at .8 scale in front of his knees, cream rim, warm glow behind); her line; Tom's color comes
  back; his line; hearts; the light hole around them grows; gold cracks run out through the dark; COLOR!: dark shards fly out and
  rainbow rings sweep across the stage, each monster jolts with a colored ring (landHit split); FEARLESS and CURED pop at apply;
  Nara hops beside him; home. Tom's kneel frame reads as a crouch more than a hug (no sit frame for Tom).
- Sixty-Story Sibling Pace (v227): about 7.1 s plus the closing message. The climb is short on screen (feet from the ground to the
  roof at y 112, bodies shrink to .62); the floor counter reads 01F..60F. The first hits make the target flash white (standard hit
  flash on a crit). With 4 members Amy's lane overlaps the tower's right windows and Tom's lane the second member's home a little.
  The 60F ROOFTOP! word and the dive's CRASH! word sit close for a moment.
- Tom Cooks for Mom (v227): about 7.3 s plus the closing message (sweep at .6 px/ms; length grows a little with the spot). While
  stone, Deedee is drawn by a front scene, so she draws over Tom's loaf arm briefly. The swept monsters vanish off the left edge and
  their damage numbers stay where they stood. The tray of Hot Dishes is not drawn (the 3 HOT DISH pop shows it).
- The Golden Dumpling Wish (v226): about 6.8 s plus the closing message with 3 monsters (340 ms per extra monster). Twilight back
  tint and letterbox; Tom and Grace walk to a spot right of the monsters; Grace holds the see-through memory dumpling (sc .7),
  holds it out (mirrored act), Tom reaches (act), a gold pillar and WISH; it rises, grows to 2.2x and bounces on each monster (BOING
  words at the top band), bursts into SHINE! and diamond sparkles that rain over the family; apply heals and revives; side hug
  with hearts; home. The giant memory covers the monsters while it bounces (intended). TRENDING LOCKED shows only when Grace is in
  the party (she always is for grace3).
- Headphones in the Dark (v226): about 7 s plus the closing message (280 ms per extra monster). The dark is a front layer with soft
  holes around Rose and, from the sound ribbon on, around Tom; monsters and the rest of the party are near black until PLAY. Rose
  wears silver headphones (drawn on her seated head too, fading as Tom walks home). Tom walks along the gold ribbon, lifts her
  (she sits via the ride spot), PLAY, a gold stereo wave sweeps left, three giant 8-bit notes land on and around each monster and
  stay until the end (jolt on the middle note). mount at apply says rose.intro3 ("I am the tallest! Giddyup...") after Tom's line:
  intended. The SHOULDER RIDE pop can sit under the top letterbox bar with 4 members.
- Wing Walk (v225): about 7 to 7.4 s with the closing message. Tom's lying body is mostly under the duvet; with 4 members the window
  sits near the top (y 46 to 136). SPLIT times read 0:00.3 to 0:01.x (fast). The monsters blow back in at the back row after apply.
- Nobody Gets Past Us (v225): about 8.2 s (3 monsters; 480 ms per bonk). Back-row monsters bonk at their own (higher) row. Boppy's
  "MY BACK." uses his kneel frame.
- Pick the Rhubarb (v223): about 7 s. Deedee draws over Tom while she pulls him (party draw order); Tom's "sit" is his kneel pose.
- Seat 1A Stowaway (v223): about 7 s. Rose is hidden from her hop until BOO; goofed monsters wobble until the end step.
- Red Line Transfer (v222): about 6.6 s. The EVADE / HURRY UP / STAGGER pops at apply time are busy.
- Tug of War (v222): about 6.1 s. Tom's tug spot can sit partly behind the second party member; capped at x 552.
- Uncle Spotter Toss: about 6.8 s. The stirrup hands are a small skin oval left of Tom; Grace glides with two hops.
- Tombo lengths: Hi Guys about 6.8 s, Wine and Gossip, Popcorn Jump and Sit. Paw. Treat. about 7 s, You Hold the Net about 7.5 s,
  I Called It! 6.9 to 7.6 s; trim if Tom finds them long. Double-Decker Airplane: Rose stands on Tom during it (sits again after).
- Seated Rose (v218): her legs are mostly hidden behind Tom's head; Lamby's lookout hat sits a few pixels off her head while seated.
- Popcorn Jump: Tom's shoes show under the couch; the bowl lands on the first monster as a hat. Wine and Gossip: bubbles cross.
- You Hold the Net: the dumped monsters overlap in a tight pile; status pops crowd the FLOP! word.
- Superseded IIFEs in the move files can be deleted once Tom signs off.
- kit_test picks another friend for ally moves; self-target branches were not filmed.
- Cosmetic: status pops crowd the Ultimate words at the heal and status moment; Baxter Street Bomb's EVADE pop shows at TNB's home.
- Doc follow-up: battle-design.md and story-bible.md still say PUPPY EYES (and SILLY); rename to HUMAN EYES (and RASPBERRY).
- engine/battle2-traits.js comment line 13 still says Sourdough & Rhubarb (cosmetic). engine/battle2.js line 609 comment still says
  Comment Moderation (cosmetic).
- data/lines.js nara.low second line "Whimper. Tom?" has a word in it (Nara barks only). Left alone: Nara's clips are matched by
  text, so changing it needs a re-bake; fix it in a session that bakes Nara anyway.
- Voice files total about 33 MB (dialog-ch1.js added 6.6 MB); if first launch on the phone feels slow, move clips to the artifact
  asset store and fetch on demand.

## Testing
- 2026-10-26 (v274 ff1_dc to ff4_dc): see the top entry. Edge probes: PRE="window.__LE.B2.foes[2].hp=0;window.__LE.B2.foes[2].dead=true;" for 2 monsters. With 3 members ff4_dc seats at 1,4,6.
- 2026-10-26 (v273 boppy3_dc, tnb3_dc, nara3_dc): tprobe each with tom,<partner>,grace (3 monsters) and tom,grace,rose,<partner> (2,
  PRE kills foe 3); nara3 and boppy3 Primaries re-run after the tintOf fix (frames fine); menu2.py PARTY=tom,nara DOWN=5 and
  PARTY=tnb,boppy,tom DOWN=11 showed Under the Table and the tnb3_dc row with the DIRECTOR'S CUT label; smoke IDS=boppy,tnb (pass),
  kit_test boppy, tnb, nara --speed2 (pass). Live sha256 of the three files matched after publishing. evalpage.py (one-off: prints
  the result of a JS expression in the build) helped inspect sprite palettes.
- 2026-10-26 (v272 amy3_dc, deedee3_dc): tprobe amy3_dc with tom,amy,grace (3 monsters) and tom,grace,rose,amy (2); deedee3_dc with
  tom,deedee,grace (3) and tom,grace,rose,deedee (2) with Grace knocked out (revived at 35% = 177/506, heal skipped her as expected);
  menu2.py (menu.py with DOWN env) PARTY=tom,amy,deedee,grace DOWN=5 and PARTY=deedee,tom DOWN=5 showed Elevator Cheat under
  Sixty-Story Sibling Pace and Feast on Jefferson Park under Tom Cooks for Mom with the DIRECTOR'S CUT label; smoke IDS=amy,deedee
  (pass), kit_test amy and deedee --speed2 (pass). Live sha256 of the three files matched after publishing. tools/geo.py (prints
  RFX.ST unit/foe/group geometry for a party) helped place the tower and table.
- 2026-10-25 (v242 grace3_dc, rose3_dc): tprobe grace3_dc with tom,grace,rose (3 monsters) and tom,grace,rose,amy (2); rose3_dc
  with tom,grace,rose (3) and tom,grace,rose,deedee (2); menu.py / menu2.py (PARTY=tom,grace,rose,amy DOWN=14) showed Shadow
  Squishy under The Golden Dumpling Wish and Lamby Night-Light under Headphones in the Dark with the DIRECTOR'S CUT label; smoke
  IDS=grace,rose (pass), kit_test grace and rose --speed2 (pass). Live file sha256 checked after publishing.
- 2026-10-25 (v241 tnb2_dc, nara2_dc): tprobe tnb2_dc with tom,tnb,grace (3 monsters) and tom,grace,rose,tnb (2); nara2_dc with
  tom,nara,grace (3) and tom,grace,rose,nara (2); menu2.py (PARTY=tom,tnb,nara,grace DOWN=10) showed Last Train Home under Red
  Line Transfer with the DIRECTOR'S CUT label and nara2_dc after nara2; smoke IDS=tnb,nara (pass), kit_test tnb and nara --speed2
  (pass). Docs extracted byte-exact from the transcript before editing (claude/*.md via project_read strings).
- 2026-10-25 (v240 deedee2_dc, boppy2_dc): tprobe deedee2_dc with tom,deedee,grace (3 monsters) and tom,grace,rose,deedee (2);
  boppy2_dc with tom,boppy,grace (3), tom,grace,rose,boppy (2), and with PRE giving every foe st.powup (the target's buff was
  stolen; the engine id is powup, not pow_up); menu2.py (PARTY=tom,deedee,boppy,grace DOWN=10 and 12) showed both rows with the
  DIRECTOR'S CUT label; smoke IDS=deedee,boppy (pass), kit_test deedee and boppy --speed2 (pass).
- 2026-10-25 (v239 rose2_dc, amy2_dc): tprobe rose2_dc with tom,rose,grace (3 monsters) and tom,grace,rose,amy (2); amy2_dc with
  tom,amy,grace (3) and tom,grace,rose,amy (2); menu2.py (PARTY=tom,rose,amy,grace DOWN=9) showed Princess and Her Bodyguard
  under Seat 1A Stowaway with the DIRECTOR'S CUT label; smoke IDS=rose,amy (pass), kit_test rose and amy --speed2 (pass). Tools
  extracted from the transcript with a small getdoc helper (project_read strings, byte-exact).
- 2026-10-25 (v238 nara1_dc, grace2_dc): tprobe nara1_dc with tom,nara,grace (3 monsters) and tom,grace,rose,nara (2); grace2_dc
  with tom,grace,rose (3) and tom,grace,rose,amy (2); menu2.py (PARTY=tom,nara,grace,rose DOWN=7) showed Puzzle Toy and Judge Grace
  with the DIRECTOR'S CUT label; smoke IDS=nara,grace (pass), kit_test nara and grace --speed2 (pass). Baker: 8 to do (checked
  headless). The v237 publish landed mid-session (page only gained a blank line); sha256 of the three changed files matched.
- 2026-10-25 (v236 boppy1_dc, tnb1_dc): tprobe boppy1_dc with tom,boppy,grace (3 monsters) and tom,boppy,grace,rose (2 monsters,
  PRE kills a FRONT foe so the back one has room to come forward); tnb1_dc with tom,tnb,grace (3) and tom,grace,rose,tnb (2);
  menu2.py (PARTY=tom,boppy,tnb,grace DOWN=7) showed both rows with the DIRECTOR'S CUT label; smoke IDS=boppy,tnb (pass), kit_test
  boppy and tnb --speed2 (pass). Baker: 12 to do (checked headless). tprobe2.py (tprobe printing foe rows and px) helped find the
  apply gotcha.
- 2026-10-25 (v234 amy1_dc, deedee1_dc): tprobe amy1_dc with tom,amy,grace (3 monsters) and tom,amy,grace,rose (2 monsters);
  deedee1_dc with tom,grace,rose,deedee (3) and tom,grace,deedee (2); menu2.py (PARTY=tom,amy,grace,deedee DOWN=9) showed Field Day
  under I Called It! with the DIRECTOR'S CUT label; smoke IDS=amy,deedee (pass), kit_test amy and deedee --speed2 (pass).
  Baker: 50 to do (checked headless: S.filter='needv4', allLines().filter(todo)).
- 2026-10-25 (v233 grace1_dc, rose1_dc): tprobe with PARTY=tom,grace,rose (3 monsters) and with 4 members (amy, deedee) and 2
  monsters; grace1 Primary re-run (TOMBO! banner); menu2.py (menu.py with DOWN=1) showed both DC rows and labels; gate test (flag +
  level 30); smoke IDS=grace,rose (pass), kit_test grace and rose --speed2 (pass). Baker: 46 to do.
- 2026-10-25 (v232 ff3, ff4): fprobe ff3 with PARTY=deedee,boppy,tom (3 monsters) and tom,deedee,boppy,grace (2 monsters); ff4
  with tom,grace,rose,amy, tom,nara,grace,rose and tom,grace,rose (2 monsters); ff1, ff2 re-run clean; smoke IDS=deedee,boppy
  (pass), kit_test deedee and boppy --speed2 (pass), menu.py (ff1, ff4 rows). Baker: 42 to do.
- Session setup trick (v232): project_read returns docs inline, but they are also in the session transcript
  (/root/.claude/projects/-home-claude/<session>.jsonl): parse it for '{"method":"project_read"' strings and write the content out
  byte-exact (used for the baker template and build.js).
- 2026-10-25 (v230 ff1, ff2): claude/fprobe.py (tprobe that fires a Family Finish as its first member: `PARTY=... ID=ff1 python3
  fprobe.py 0.5,1.2,...`) with PARTY=tom,tnb,grace,rose (ff1) and PARTY=amy,grace,rose,tom (ff2), 3 monsters and 2 (PRE killing foe
  3); ff3 (deedee,boppy,tom) and ff4 (tom,grace,amy) plain fallback ran clean with their effects. claude/menu.py (opens the Tombo
  menu with every Tombo unlocked, scrolls to the end, screenshots) showed both rows and their labels. smoke IDS=tnb,amy (pass),
  kit_test tnb and amy --speed2 (pass). Baker: 38 to do.
- 2026-10-25 (v229 boppy3, tnb3, nara3), (v227 amy3, deedee3) and (v226 grace3, rose3): tprobe with 3 and 4 members; smoke and
  kit_test passed.
- claude/tprobe.py: `PARTY=tom,grace,rose ID=grace1 python3 tprobe.py 0.5,1.2,2,3.1` fires one Tombo (B2.tombos='all', HEART 100;
  party at 50% HP and Dizzy) and grabs the canvas at those seconds (shots/t-<id>-N.png), then prints errors, lines said, party and
  foe HP/status. PRE env runs js first: PRE="()=>{const f=window.__LE.B2.foes[2]; f.hp=0; f.dead=true;}" for 2 monsters (the
  printout can still list foe 3 with damage; look at the frames).
  Delete old shots/t-<id>-*.png before a run with fewer frames (grid.py globs them all). A gold TAP! star in some frames is the
  High-Five prompt, not a bug.
- claude/grid.py 'shots/t-ID-*.png' out.png COLS makes a contact sheet; claude/frames.py id,id renders every battle frame of those
  members into shots/frames-<id>.png (to pick poses).
- claude/kit_test.py and claude/smoke.py (BUILD env, default /home/claude/live, so export BUILD=/home/claude/build IN THE SAME
  Bash command: shell state does not persist between calls, and the unstubbed live copy times out; PARTY env; --speed2;
  --only=key,key; IDS env for smoke; BUFF=1; KO=<id>). One suite per command (300 s limit). Local data/voice-clips.js is a stub
  (data/voice/*.js empty locally). Chromium executable_path /opt/pw-browsers/chromium-1243/chrome-linux64/chrome, args
  --headless=new --no-proxy-server. Both ignore "Failed to load resource" console errors.
- claude/probe.py: `ID=<member> python3 probe.py <key> 1,2.5,4 ["()=>{ js before the move }"] [party]` fires one move.
- Debug trick: push values to window.__x from a scene function and print them from Playwright.
- Session setup gotcha: project_read returns docs inline (no file on disk), so the tools (tprobe, fprobe, grid, smoke, kit_test,
  frames, menu) must be written to /home/claude/tools with Write each session; keep them byte-identical to the project copies.
- Publishing: the Artifact tool refuses until the page file from a fresh read (no path) has been Read in full, in chunks (v230 page:
  1-370, 371 alone, 372-1019; line 371 is a 24 KB base64 image). Strip the service wrapper (sed '1d;$d') before publishing it as
  file_path, and pass file_path as an ABSOLUTE path (/home/claude/pub/index.html) with root=/home/claude/pub. If the read was long
  ago in the session, do a fresh read and Read the page again right before publishing.
- Parallel sessions: a publish is refused when the live version moved on; then Artifact read the files you changed (paths) and
  compare sha256 with your starting copies: if they match, take the saved new page (sed '1d;$d') as index.html and publish again
  (the refusal's diff counts as viewing it). If a game file you changed also changed, merge it before publishing. Keep every script
  tag other sessions added (v215: 7 for data/voice/*.js; v218: 2 after engine/battle2-traits.js; v220: data/dialog-cast.js and
  engine/dialog-voice.js after engine/chapter-select.js).
- Session gotcha: the first project_read of claude/next.md can return a stale copy; check its "updated" line against status.md.
- Project docs written by two sessions at once: re-read a doc right before project_write and merge.
