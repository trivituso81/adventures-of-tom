# Changes

Baseline: live build version 1792766345-3d91, packaged 2026-10-23. Versions up to 189: claude/CHANGES-archive.md.

## 2026-10-27: Task B verdicts, Amy rewrite, contraction pass (PUBLISHED as v287, 1793073843-2c75)
- Task B: Button Mash replaced (controller throw, new line), Overpriced Gadget renamed Retail Therapy, Flashcard Flurry smaller kanji, Golden Dumpling Wish
  replaced by a bedazzle craft scene. Fixed a draft bug (overpriced_gadget merged into sourdough_snob in battle2-data.js).
- Amy: Special Education teacher canon, calmer battle and house lines, declines ch3/4/6, new house revisits 8 to 10; moves renamed Green Pen, Surprise Quiz, Nobody Leaves (keys unchanged).
- Contraction pass: 1,356 strings in about 34 files. New data/contraction-alias.js (CONTRACT_OLD, 762 entries) plus alias lookups in engine/speech.js say() and
  engine/dialog-voice.js dvClip so baked clips keep playing until re-baked. Script tag added to index.html before engine/speech.js.
- Tests: aliastest, kit_test amy/tom/grace --speed2, smoke IDS=amy,deedee: FAILS: []. rose.silly "no line" is pre-existing (not a regression).
- Not done: Task A townspeople, Deedee and Boppy verdict builds (see claude/next.md).

## 2026-10-25: Difficulty modes retuned so they actually differ, published as version 252
- Problem (Tom): switching Rose / Grace / Director felt the same. Cause: Director raised monster POW by 25%, but the damage formula
  (POW x2.5 minus GRIT x1.2) and PEP's +30 speed floor flattened it, and no mode touched monster HP. Common monsters hit for 5 to 7%
  of a member's HP in every mode, so nobody was ever in danger and fights lasted the same number of turns.
- engine/feel.js B7_DIFF now multiplies finished numbers: Rose taken .5, foeHp .75; Grace unchanged; Director taken 1.6, foeHp 1.3,
  foeSpeed 1.25 (plus its old shield, Tombo and snack rules). Option texts rewritten. b7FoeMult replaced by b7FoeHp and b7FoeSpeed.
- engine/battle2.js: b2FoeUnit scales HP (no more POW/WARMTH/PEP scaling); b2Delay divides a monster's wait by foeSpeed;
  b2HitParty comment. Live probe (party lvl 6, Clapper Snapper): HP 83/110/143, hit on Grace 11/21/34 of 168, turn wait 22/22/17.
- Tests: smoke.py, kit_test.py rose: FAILS: []; new claude/diffprobe.py. Grace Mode numbers are unchanged.

## 2026-10-25: Rose's mount line removed, published as version 249
- Decision (Tom): Rose no longer says "I am the tallest! Giddyup, TAta!" (her baked intro3 clip) when she mounts Tom in battle.
  It clashed with the custom line of the move before it. engine/battle2-traits.js b2Mount: removed say('rose','intro3',.15); the
  SHOULDER RIDE pop stays. intro3 is still used by the opening scene (data/scenes.js). Ride behavior unchanged.
- Tests: kit_test.py rose --only=lookout_lamby,piggyback_pounce (said has no rose.intro3, shoulder status still set), smoke.py rose,tnb: FAILS: [].

## 2026-10-25: Tombo menu shows only usable Tombos, with partner portraits, published as version 248
- engine/battle2-kind.js b2TomboRows(u,all): the menu hides Tombos the HEART meter cannot pay for yet (all=true keeps them, used
  only to tell NONE YET from not enough HEART), and always hides Tombos and Family Finishes the current character is not part of
  (the old greyed "Only Tom or X can start it" rows are gone). Each row gets `with`: the partner(s) to show (Tom's turn: the
  partner; partner's turn: Tom; Family Finish: the other members). Knocked out and Shushed rows still show, greyed.
- engine/battle2-ui.js: each Tombo row shows the partner's portrait (36px, 28px landscape; overlapping faces for a Family
  Finish); empty list says "Not enough HEART for a Tombo yet. The meter is at N%." (b2TomboEmpty); the cross's TOMBO button
  still says NONE YET only when the character has no unlocked Tombo.
- index.html: .b2-tb, .b2-tbp, .b2-tbt styles. New project tool claude/tmenu.py (menu probe at HEART 0/25/50/75/100).
- Tests: tmenu.py, smoke.py (tnb, nara), kit_test.py grace: FAILS: [] each.

## 2026-10-25: Chapter 8, 9 and 10 dialogue voices merged (voices only), published as version 247
- Tom returned dialogue-ch8.json, dialogue-ch9.json and dialogue-ch10.json (19.9, 20.1, 18.1 MB). Merged with claude/voice-merge-dialog.js
  against claude/dialog-cast-ch1-10.js (live files did not exist, passed -): 157, 179 and 158 clips added, 0 skipped, 7.64, 7.73 and
  6.94 MB, no fx warnings. ch8 is 157 of 158 lines because Lukewarm and Leftover share the key mudling|Reheated! Round two! (not an error).
  Every clip's speaker maps to its voice in the cast (0 mismatches, 0 unknown speakers).
- Published data/voice/dialog-ch8.js, dialog-ch9.js and dialog-ch10.js only (index.html republished unchanged, wrapper stripped).
  Dialogue voices now live for ch1 to ch10: 1903 clips (1409 + 494), about 79 MB of voice files. The dialogue voice pipeline is complete.
- dvtest.py passed: 1542 clips (ch1 to ch5 + ch8 to ch10 in the local build), 36 voices, no orphan voices, real pages play, FAILS: [].
  Clip durations healthy (shortest 1.22 s).

## 2026-10-25: Chapter 6 and 7 dialogue voices merged (voices only), published as version 246
- Tom returned dialogue-ch6.json (195 of 195 clips) and dialogue-ch7.json (166 of 166) from the Chapter 6 and 7 Voice Bakers. Merged with
  claude/voice-merge-dialog.js against claude/dialog-cast-ch1-10.js (live dialog-ch6/7.js did not exist, passed -): 195 and 166 added,
  0 skipped, 7.51 MB and 6.74 MB, no fx warnings. Every clip's speaker maps to its voice in the cast (0 mismatches, 0 unknown speakers).
- Published data/voice/dialog-ch6.js and data/voice/dialog-ch7.js only (index.html republished unchanged, wrapper stripped). The live
  data/dialog-cast.js already had every ch6 and ch7 speaker (it matched claude/dialog-cast-ch1-10.js byte for byte in size).
- dvtest.py passed: 608 clips (ch1 + ch6 + ch7 in the local build), no orphan voices, real pages play for Tom, Bernadette, Twig Spy,
  Grace, Page and The Know-It-All; object silent; greet dropped; scene yields; FAST and mute stop it; no page errors.

## 2026-10-25: Chapter 4 and 5 dialogue voices merged (voices plus cast), published as version 245
- Tom returned dialogue-ch4.json (156 of 156 clips) and dialogue-ch5.json (176 of 176) from the Chapter 4 and 5 Voice Bakers. Merged with
  claude/voice-merge-dialog.js against claude/dialog-cast-ch1-10.js (no live file to merge into): 156 and 176 added, 0 skipped, 6.86 MB and
  7.33 MB, no fx warnings. Every clip's speaker maps to its voice in the cast (0 mismatches).
- Published data/dialog-cast.js (= claude/dialog-cast-ch1-10.js: files list ch1 to ch10, 40+ new speakers, speakerFx), data/voice/dialog-ch4.js
  and data/voice/dialog-ch5.js. index.html republished unchanged (wrapper stripped). No placeholders for ch6 to 10 (the engine skips missing files).
- dvtest.py passed: 1048 clips loaded, 36 voices, no orphan voices, real pages play for Ray, Cue Card Crab, Amy and Mrs. Kowalski.

## 2026-10-25: Chapter 3 dialogue voices merged (voices only), published as version 244
- Tom returned dialogue-ch3.json from the Chapter 3 Voice Baker: 178 of 178 clips, 16 voices. Merged with claude/voice-merge-dialog.js
  against the live placeholder: 178 added, 0 replaced, 0 skipped, 7.32 MB, no fx warnings.
- Published data/voice/dialog-ch3.js only (index.html republished unchanged, wrapper stripped). data/dialog-cast.js not touched: the live
  cast already maps every ch3 speaker (checked: 0 mismatches). dvtest.py passed (425 clips with ch1; Sal, Sol, Oolong, Reel, Grace, TNB
  pages play; object silent; greet dropped; scene yields; FAST and mute stop it; no page errors).
- claude/dvtest.py updated (waits for all clip files, orphan-voice check, optional LINES json of pages to play).

## 2026-10-25: Director's Cuts part 8 (grace3 and rose3 Director's Cuts; tier 3 started), published as version 242
- data/battle2-data.js B2_TOMBOS: grace3_dc Shadow Squishy (after grace3; tier 3, HEART 75, Sparkle 3.6 enemy warmth, kindV 300,
  fx closeup 2 t; ability-revamp.md No Props Needed tombo_grace_no_props) and rose3_dc Lamby Night-Light (after rose3; Chatter, no
  damage, all, kindV 300, fx ct +.4 t, interrupt t, cure mental party, mount; Left Ear, Right Here tombo_rose_headphones).
- engine/battle2-kind.js, after nara2_dc: shadowSq(), shBunny(), readLamp(), grace3_dc; rose3_dc (built-as details in status.md
  Known gaps).
- data/lines.js (bake later): grace.dc3, tom.dcgrace3, rose.dc3, tom.dcrose3. Directions added to
  claude/voice-baker-scripts-tombo.json (72). No baker built.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 7 (tnb2 and nara2 Director's Cuts; tier 2 done), published as version 241
- data/battle2-data.js B2_TOMBOS: tnb2_dc Last Train Home (after tnb2; tier 2, HEART 50, Cozy, no damage, party, kindV 300, fx
  cure debuff party, ct -.25 both; ability-revamp.md Transfer Together tombo_tnb_transfer) and nara2_dc Nara, No! (after nara2;
  Kinetic 2.8 all pow, fx interrupt t; the tombo-review Nara row's Effect, multiplier from revamp plan Gopher Hole Express).
- data/font.js: a comma glyph (the banner and big words print "NARA, NO." instead of "NARA  NO.").
- engine/battle2-kind.js, after boppy2_dc: DOORC, tnb2_dc (subway car with sliding doors, uses SILVER, METRO_RED, longboard());
  nara2_dc (elliptical zoomies laps). Built-as details in status.md Known gaps.
- data/lines.js (bake later): tnb.dc2, tom.dctnb2, tom.dcnara2, nara.dc2. Directions added to claude/voice-baker-scripts-tombo.json
  (68). No baker built.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 6 (deedee2 and boppy2 Director's Cuts), published as version 240
- data/battle2-data.js B2_TOMBOS: deedee2_dc Library Vault Lantern (after deedee2; tier 2, HEART 50, Cozy, no damage, party,
  kindV 300, fx st tucked 3 party, crust 2; ability-revamp.md Recipe in the Margins tombo_deedee_recipe) and boppy2_dc Bird's Nest
  (after boppy2; Splash 2.8 enemy pow, fx steal t; Untangle the Line tombo_boppy_untangle). The Primaries use the revamp plan
  tb_deedee_2 / tb_boppy_2 numbers, so the DCs take the other designed rows (status.md Number source rule).
- engine/battle2-kind.js, after amy2_dc: lantern(), lighthouse(), deedee2_dc; nest(), boppy2_dc (built-as details in status.md
  Known gaps).
- data/lines.js (bake later): deedee.dc2, tom.dcdeedee2, boppy.dc2, tom.dcboppy2. Directions added to
  claude/voice-baker-scripts-tombo.json (64). No baker built.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 5 (rose2 and amy2 Director's Cuts), published as version 239
- data/battle2-data.js B2_TOMBOS: rose2_dc Princess and Her Bodyguard (after rose2; tier 2, HEART 50, Cozy, no damage, party,
  kindV 300, fx st evade 2 party, cure mental partner, mount; ability-revamp.md Blanket Customs tombo_rose_customs) and amy2_dc
  Spot Me, Tom (after amy2; Kinetic, no damage, party, fx refill both, st brace 1 party; Carry the Other Bag tombo_amy_other_bag).
  The Primaries already use the dc_tb_rose_2 / dc_tb_amy_2 numbers, so the DCs take the other designed rows (status.md).
- engine/battle2-kind.js, after grace2_dc: shades(), carpet(), rose2_dc; kbell(), amy2_dc (built-as details in status.md
  Known gaps).
- data/lines.js (bake later): rose.dc2, tom.dcrose2, amy.dc2, tom.dcamy2. Directions added to
  claude/voice-baker-scripts-tombo.json (60). No baker built: Tom bakes all voices once the ability updates are done.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 4 (nara1 and grace2 Director's Cuts), published as version 238
- data/battle2-data.js B2_TOMBOS: nara1_dc Puzzle Toy (after nara1; Kinetic 2.2 enemy pow, fx take t; option 3 brief Which Hand?
  tombo_nara_which_hand; the tombo-review Nara row's Effect) and grace2_dc Judge Grace (after grace2; tier 2, HEART 50, Kinetic 2.8
  row pow, crit .25, fx st pinned 2 t; Trust the Spotter tombo_grace_spotter). Same flags as their Primaries.
- engine/battle2-kind.js, after tnb1_dc: puzzleToy(), nara1_dc; scoreCard(), judgeDesk(), grace2_dc (built-as details in
  status.md Known gaps).
- data/lines.js (bake): tom.dcnara1, nara.dc1, grace.dc2, tom.dcgrace2. Directions added to claude/voice-baker-scripts-tombo.json
  (56). claude/voice-baker-template.html v14 (DOG.dc1, DOG_LEN.dc1, v14 block). Baker rebuilt with the 8 silent DC lines and sent.
- v237 (another session, voices only) landed while this was built; none of the three files overlapped.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 3 (boppy1 and tnb1 Director's Cuts), published as version 236
- data/battle2-data.js B2_TOMBOS: boppy1_dc Quiet on Cattail Pier (after boppy1; Splash 2.3 all, fx row front t, st pinned 2 t,
  burn 2 boppy; revamp plan tb_boppy_1) and tnb1_dc 2nd Ave Window Wash (after tnb1; Splash 2.2 all hybrid, kindV 250, fx cure debuff
  party, st cooldown 2 t, rack tom; tb_tnb_1). Same flag and HEART 25 as their Primaries.
- engine/battle2-kind.js, after deedee1_dc: campChair(), tackleBox(), cattail(), boppy1_dc; turboFan(), fanBox(), smog(), tnb1_dc
  (built-as details in status.md Known gaps).
- engine/battle2-traits.js: b2Burn pops BURN +n (was always BURN +1).
- data/lines.js (bake): boppy.dc1, tom.dcboppy1, tnb.dc1, tom.dctnb1. Directions added to claude/voice-baker-scripts-tombo.json
  (52). Baker rebuilt with the 12 unbaked Director's Cut lines (on the v236 voice files) and sent.
- v235 (another session, voices only) landed while this was built; none of the four files overlapped.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 2 (amy1 and deedee1 Director's Cuts), published as version 234
- data/battle2-data.js B2_TOMBOS: amy1_dc Field Day (after amy1; Sparkle, no damage, party, kindV 250, fx vp 2 party, cure one amy;
  option 3 brief tombo_amy_dismissal) and deedee1_dc Clean As You Go (after deedee1; Splash, no damage, party, kindV 250, fx heal
  .25 party, cure one party; tombo_deedee_clean). Same flag and HEART 25 as their Primaries.
- engine/battle2-kind.js, after rose1_dc: egg(), spoon(), whistle(), splat(), amy1_dc; plateEdge(), plateFace(), deedee1_dc
  (built-as details in status.md Known gaps).
- data/lines.js (bake): amy.dc1, tom.dcamy1, deedee.dc1, tom.dcdeedee1. Directions added to claude/voice-baker-scripts-tombo.json
  (48). Baker rebuilt with 50 lines and sent.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Director's Cuts part 1 (the switch, grace1 and rose1 Director's Cuts), published as version 233
- Decision (the switch): a Director's Cut is its own row in the Tombo menu, directly under its Primary, labelled
  DIRECTOR'S CUT · TOM + GRACE, with a DIRECTOR'S CUT! banner. No toggle. It shows once the Primary's story flag is set and Tom and
  the partner are level 30 (b8DcOpen); the Battle Lab (B2.tombos='all') shows them all.
- data/battle2-data.js B2_TOMBOS: grace1_dc Smash That Like Button (after grace1; Sparkle 2.1 row, kindV 250, fx critup 3 party,
  reveal t, trend +1; numbers from revamp plan tb_grace_1) and rose1_dc That Cloud Is Lamby (after rose1; Chatter, no damage, enemy,
  kindV 250, fx interrupt t, ct +.25 t, mount; numbers from option 3 brief tombo_rose_clouds). Both `dc` = their Primary id, same
  flag and HEART 25.
- engine/battle2-kind.js: b2TomboOpen honors T.dc (flag plus b8DcOpen); b2TomboRows label prefix; b2RunTombo banner head; new
  "Director's Cuts" section at the end of the Tombo IIFE: rr(), thumbsUp(), likeBtn(), grace1_dc; lambyHair(), CLOUDP/LAMBP puffs,
  rose1_dc (built-as details in status.md Known gaps).
- data/abilities.js B8_COMBOS: every Director's Cut r name now the tombo-review.md name (19 renamed; keys unchanged).
- data/lines.js (bake): grace.dc1, tom.dcgrace1, tom.dcrose1, rose.dc1. Directions added to claude/voice-baker-scripts-tombo.json
  (44). Baker rebuilt with 46 lines and sent.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Family Finishes part 2 (ff3 and ff4 animated), published as version 232
- Spec: claude/tombo-review.md FF3 and FF4 rows; revamp plan cards "#### FF3:" and "#### FF4:". Effects as in B2_TOMBOS (unchanged).
- engine/battle2-kind.js, after ff2: flower(), pepper(), bloom() (seeded burst of roses and peppers), hourglass() (amber wall);
  ff3 Fifty-One Years & Counting and ff4 The Extra Place (built-as details in status.md Known gaps).
- data/lines.js (bake): deedee.ff3, boppy.ff3, tom.ff4, grace.ff4. Directions added to claude/voice-baker-scripts-tombo.json (40).
  Baker rebuilt with 42 lines and sent.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: SLEEPOVER Battle Lab fight, published as version 231
- data/battle2-data.js B2_LAB: SLEEPOVER (Tom, TNB, Grace, Rose, level 12, LA monsters) so ff1 can be played on the phone.

## 2026-10-25: Family Finishes part 1 (ff1..ff4 as data, group runner, ff1 and ff2 animated), published as version 230
- Spec: claude/tombo-review.md "Family Finishes"; revamp plan I3 "Family Finishes (4 Total" table and FF1/FF2 cards.
- data/battle2-data.js B2_TOMBOS: ff1 Sleepover at Tom's, ff2 Run With Us, Mommy!, ff3 Fifty-One Years & Counting, ff4 The Extra
  Place (tier 'ff', 75% HEART, `who` list, numbers capped: heal .6, revive .5, VP 3; table in status.md). Flags tombo:ff1..ff4.
- data/abilities.js B8_COMBOS: ff1 who tom, tnb, grace, rose and Primary name Sleepover at Tom's; ff2 Primary name Run With Us, Mommy!.
- engine/battle2-kind.js: b2FinishMembers(), finish rows in b2TomboRows (every row gets r.label), b2RunFinish() (group average,
  Mile only with Tom, FAMILY FINISH! banner), b2FinishPlain(); "Family Finishes" section after nara3 with startOf(), ffHop(),
  snackBag(), fortCastle(), chainLine(), clockFace(), paperStack(); ff1 and ff2 animations (built-as details in status.md).
- engine/battle2-ui.js: the Tombo menu prints r.label; the banner takes a `head` (default TOMBO!).
- data/lines.js (bake): rose.ff1, tnb.ff1, rose.ff2, amy.ff2. Directions added to claude/voice-baker-scripts-tombo.json (36). Baker
  rebuilt with 38 lines and sent. New project tools: claude/fprobe.py, claude/menu.py.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## 2026-10-25: Task T tier 3 part 3 (boppy3, tnb3, nara3 animated; all 21 Tombos done), published as version 229
- Spec: claude/tombo-review.md Boppy, TNB and Nara tier-3 rows; revamp plan cards "(Boppy Tier 3", "(TNB Tier 3", "(Nara Tier 3".
  Effects as in B2_TOMBOS (unchanged). Barrier events (Distance, Fear) still out of scope.
- engine/battle2-kind.js, after deedee3: shared helpers drawAt(), tintOf(), order3(), split100(); brothBowl(), umbrella() (boppy3);
  mug() (tnb3). Built-as details per Tombo in status.md Known gaps.
  - boppy3 The Pepper-Broth Sneeze: stone Boppy, broth and steam, orange cracks from the stomach up, CRACK!, red face, AH...
    AHHH..., Tom's umbrella and crouch, ACHOOO! fire cone across every monster, belly pat.
  - tnb3 Cone Six Across the Miles: LA/NY split tint, palm and skyline, cold wall with a 2475 MILES countdown, glowing and steaming
    cups with a gold thread, the fold, wall shatter, CLINK!, kiss heart, CONE SIX! heat arcs.
  - nara3 Cuddle: violet dark with static, Tom kneeling grey and flickering, SNFF SNFF and a gold scent trail, Nara in his lap with a
    cream rim, color returns, gold cracks, COLOR! shards and rainbow rings.
- data/lines.js (bake): tom.tomboboppy3, boppy.tombo3, tnb.tombo3 (trimmed to 10 words), tom.tombotnb3, tom.tombonara3,
  nara.tombo3. Directions added to claude/voice-baker-scripts-tombo.json (32).
- claude/voice-baker-template.html v11: DOG.tombo3, DOG_LEN.tombo3, v11 block. Baker rebuilt with all 34 unbaked Tombo lines and sent.
- No voice files or demo/ published; index.html republished unchanged (wrapper stripped).

## Versions 224 to 227 (condensed on 2026-10-25 with v230)
- v227 Task T amy3 Sixty-Story Sibling Pace and deedee3 Tom Cooks for Mom (glassPane(), shards(), stoneOf(), boule(), towel()).
- v226 tier-3 Tombos as data; B8_COMBOS names deedee3 and nara3; status fearless; ['burn',n,memberId]; party pop text clamped;
  grace3 The Golden Dumpling Wish and rose3 Headphones in the Dark (bars(), dim(), memory(), ghostDumpling(), note8(), darkC).
- v225 Task T amy2 Wing Walk and boppy2 Nobody Gets Past Us.
- v224 spoken dialogue for chapters 2 and 3 (another session: data/dialog-cast.js, placeholder dialog-ch2/ch3.js, three bakers).

## Versions 217 to 223 (condensed on 2026-10-25 with v226; the code comments in each IIFE describe what each scene draws)
- v223 Task T deedee2 Pick the Rhubarb (helpers rhubarb(), rootHairs(), crustTin()) and rose2 Seat 1A Stowaway (carryOn()).
- v222 Task T tnb2 Red Line Transfer (transferCard(), longboard(), train drawn twice through gapX) and nara2 Tug of War.
- v221 Task T tier 2 part 1: tier-2 Tombos as data, B8_COMBOS names, unlock flags and toasts in data/scenes.js, grace2 Uncle
  Spotter Toss (SC.tb_mat).
- v220 spoken dialogue boxes, chapter 1 (another session). v219 Task T amy1 I Called It!. v218 Rose sits on Tom's shoulders
  (data/rose-ride.js, engine/rose-ride.js). v217 Boppy's New York voice (another session).

## Versions 191 to 216 (condensed on 2026-10-25 with v225)
- v216 nara1 Sit. Paw. Treat. and boppy1 You Hold the Net (treat(), bigPaw(), pawPrint()); voice-baker-build.js takes several
  scripts files. v214 deedee1 Wine and Gossip and tnb1 Popcorn Jump (battle2-ui.js spin scales by f.fsc). v213 grace1 and rose1
  (Task T IIFE, prefix tb_; tprobe.py). v208 to v212 Deedee's, Boppy's, TNB's and Nara's Ultimates (v211 Michael and Justin height,
  another session). v198 to v207 Task P polish pass; v201 dialogue portraits (another session); v196/v197 Task R; v194 Tom's dark
  brown hair; v191 to v193 Grace's, Rose's and Amy's Ultimates.

## Older entries (versions 173 to 189, phases 1 to 4b, Task M, the rename)
- See claude/CHANGES-archive.md. Task M (v182 to v189) new keys in claude/status.md "Current Primary keys"; v181 Phase 5a; v179/v180
  Phase 4b; v178 rename to The Adventures of Tom / Long Island; v174 to v177 animation pass; v173 Phase 4a (engine/stage.js).
