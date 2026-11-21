## projclean1b (2026-11-21): Project docs moved into the repo: 115 more docs copied into claude/ (second part of the second run)

- Card c-projclean: copied 115 more Project docs word for word to the same path in claude/ (art prompts, area and room kits, storybook and move sheet prompts, addenda, canon addenda). No game file changed.
- Left in the Project on purpose, not copied: next-addendum-michael.md (the write was stopped by a safety classifier); the held docs listed under projclean1a.

## projclean1a (2026-11-21): Project docs moved into the repo: 151 docs copied into claude/ (first part of the second run)

- Card c-projclean: the repo is now the one home for Claude working docs; the Project keeps only four mirrors. This part copied 151 Project docs word for word to the same path in claude/ (story, dialogue, next-addendum, tone and voice notes, the story bible, CHANGES-archive). No game file changed.
- Left in the Project on purpose, not copied: comedy-bible.md, story-ch08.md, story-ch08-rejected.md, story-ch08-brief.md, story-ch06.md, bernadette-rewrite.md (they spell out a full street address), costs1-handoff.md (a personal spending ledger), dialogue-clarity-rewrite.json (the write was stopped by a safety classifier; its .md twin copied in full).

## b3s14b (2026-11-20): New battle: balance pass follow-up, bosses checked at Rank 2 and Rank 5, no numbers changed

- Tom's card c-b3s14b (the open items of c-b3s14). Plain player, 100 fights per boss: at Rank 2 (the Lab default) all 11 bosses stay at 5.07 to 6.32 rounds; at Rank 5 eight stay at 4.98 to 5.94 and three fall under 5 (Big Shake 3.72, Iron-Gill 4.04, Old Ironbelly 4.98). Call: not retuned, since raising HP would push Rank 2 past 7. Table in docs/BATTLE3.md.
- `python3 tools/b3_test.py s13` passes (portrait and landscape), `node tools/b3-sim.js check` 2154 checks, 0 fails. Docs only: no data, engine or art file changed.

## b3s14 (2026-11-21): New battle: balance pass on Part 1, eight short bosses lengthened to 5 to 7 rounds (stage 14 complete)

- Tom's card c-b3s14: every Part 1 boss takes 5 to 7 rounds for the plain player, normal fights stay short. Data only, no engine file changed.
- Measured all 66 Lab fights first (100 simulated each, all won). Eleven bosses: three were already 5 to 7 (The Red Pen 5.8, The Unread 5.1, Old Ironbelly 5.1), eight were short. Normal fights and elites were left alone (0.7 to 5.7 rounds).
- The one change per boss was its HP (both sizes, scaled together; rounds grow about in step with HP): The Big One 420/320 to 610/460, The Big Shake 380/510 to 460/620, Old Iron-Gill 650/490 to 900/680, The Director's Cut 470/630 to 610/820, Chairman Cheeks 660/880 to 1130/1500, The Mirrorball 1590/1190 to 2380/1780, The Last Call 1800/1350 to 2230/1670, Brain Freeze 680/910 to 930/1250. Attack, Defense, Speed, pips and act power kept as the bestiary prints them.
- Rounds before to after: new6 3.5 to 5.78, new16 4.71 to 5.61, new21 4.14 to 5.64, new27 4.39 to 5.71, new38 3.33 to 6.32, new56 3.79 to 5.92, new62 4.61 to 5.8, new66 4.16 to 5.95. The two Big One fights with bigger parties (new9, new10) went 3.71 to 6.06 and 3.14 to 4.1.
- Checks moved with the numbers (old values in this entry): `b3-check-s3.js`, `s11`, `s12`, `s13`. The Big One's support-every-4th-action guard was widened from 7 to 9.5 rounds because that player is slower than the plain one (9.31 was measured at 1.63 times HP; at the chosen 1.45 times it is lower).
- Not done: Vibes at Rank 2 and Rank 5 were not re-measured; bosses may run shorter with Rank 5 Quirks. Browser test s13 not run in this session (data-only change, simulator and rule checks pass).

## qa-bug03 (2026-11-21): Townsfolk in the Square and the Row no longer stand on roof edges

- Chapter 1 QA report BUG-03 (build keysecrets2): people walk onto the SNAIL MAIL sign and roofs in the Square and over building edges on Rivituso Row. Fact: the roof lists were complete at the 50% rule of `tools/npc_roof_tiles.py`, but a 25 second headless run showed townsfolk standing on tiles where 30% to 50% of the feet box is painted foreground. Change: 6 such tiles added to `noGoRoof` in `town` and 8 in `row` (only tiles an NPC actually reached). Not reproduced: Boppy's feet over the railing in `grands` (a stationary scene actor, not a wanderer), left open.

## b3s13 (2026-11-20): New battle: the Nine Scoops monsters and Brain Freeze join the Battle Lab (stage 13 complete)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This last part is the bonus chapter, built from `claude/bestiary-v11.md`: Sprinkle Gremlin, Slushie Slug (Elite), Cone Head and the boss Brain Freeze in `data/b3-foes-ch11bonus.js`, with four formations (10 VP each, 30 for the boss). The foe ids match the old `MONSTERS` ids in `data/bonus-nine-scoops.js` (gremlin, slushslug, conehead, brainfreeze), so a Lab fight never crashes the old tables.
- Lab: NEW 63 to NEW 66 (Tom, Grace and Rose at level 12, the chapter 5 baseline; the Square backdrop because the bonus chapter has no creamery picture, my call).
- Brain Freeze as data: Frosted Lid goes up once below 50% HP (Guard Stance, 25% less damage, plus +15% Defense, 2 turns), then Deep Freeze (wind-up, all three Drenched and Slow). Ice-Cube Pitch winds up and Stuns one target; Temple Throb winds up and Fatigues all three. A Break cancels each wind-up.
- Two small seams: the act condition `allyHurt` (the act is usable only while another monster is below full HP) and the target `lowestOtherAlly`, both for Cone Head's Scoop Pass, which heals the lowest other monster 20% and gives it +15% Defense.
- Three new statuses (blue_ice, scoop_pass, frosted_lid). The Slushie Slug starts in Blue-Ice Glaze (25% less damage); it resists Drench.
- No picture or clip work, no voice lines added. Balance is stage 14.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, bonus section; 2154 checks, FAILS: []); the four new Lab fights each 100 simulated, all won, 0 errors; `python3 tools/b3_test.py s13` (portrait and landscape). Stage 13 is done: chapters 8, 9, 10 and the bonus are in the Battle Lab (b3s13a, b3s13b, b3s13c, b3s13).

## wanch1 (2026-11-20): chapter 1 battles are videos: the whole family idles with breathing, guards, gets hit, falls, cheers and runs on Wan 3.0, plus Rose's knock-out and Deedee's victory; the stop-loss list goes to c-wanch2

Card c-wanch1 (last part; parts a to h above). This part: Rose's knock-out retry 2 (seated 2.8% above the feet line, was 5%) and Deedee's victory retry 2 (picture shrunk to 80% inside the video: her spread hands stay in the frame) are baked and wired; their painted rows are purged. Wan-gen run 44865404539 ($3).
| Fighter | Videos in every NEW BATTLE fight | Still painted or default (stop-loss, card c-wanch2) |
|---|---|---|
| Tom | idle, guard, hit, ko, victory, run; Lounge Pass Flex, Zone One Blockade | dodge, cast |
| Grace | idle, guard, hit, ko, victory, run; Soup-Dumpling Squeeze, Crunchy Sugar-Cube Pop | dodge, cast |
| Rose | idle, guard, hit, ko, run, victory (her approved clip); The Floor Is Lava! | dodge, cast; Lamb-Tuck Ankle Tackle (a second lamb appeared), "Giddyup, Tata!" Launch (a lasso ring appeared) |
| Deedee | idle, guard, hit, victory, run; "Hand Me My Glasses" Scrub | dodge, cast, ko (floats above the ground twice); Wet-Floor Hazard (the mop dips below her feet) |
| Monsters | Grump: grumble, splash, slap and wind-up; Toad: croak, tongue and wind-up; Log: roll, jab, Timber! and wind-up; Skeeter: idle, Buzz Cloud | Toad Body Slam, Skeeter Darting Bite and Mosquito Whine |
- Spend: fal $22.95 (cap $35), xAI $1.59 (cap $3).
- Tests this part: `wanproof_test.py rose,deedee` FAILS [], `b3_test.py s8` FAILS [] (peak 15 clip pictures in NEW 6, limit 16), smoke.
- Plan notes: `claude/video-battle-plan.md` 4.8 (repo copy and Project). docs/BATTLE3.md "Painted body states" says what is still painted.
- Tom's card: t-wanch1-watch (play NEW 1 to NEW 6 once). Next Claude card: c-wanch2 (the stop-loss list on a different video model, then the full purge of the painted states).

## b3s13c (2026-11-20): New battle: the chapter 10 airport monsters and The Last Call join the Battle Lab (stage 13, part c of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This part is chapter 10, built from `claude/bestiary-v11.md`: Carry-On, Jet Lag, The Long Line, The Unclaimed, The Armrest Hog (Elite) and the boss The Last Call in `data/b3-foes-ch10.js`, with six formations (8 VP each, 26 for the boss).
- Lab: NEW 57 to NEW 62, one fight for every formation and the boss (Tom, Grace, Rose and Amy at level 25; the terminal backdrop).
- The Last Call as data: Boarding Group Nine is the wind-up of GATE CLOSED, the same Mark pattern as The Big One's Big Glare and Swamp Chomp (`then` and `after`, `hits:'marked'`). It Marks a Back-row ally and gives the monster +20% Attack for 1 turn (the bestiary says only "It gains"; I read "it" as the monster, as with the Director's Spotlight Lock), then slams the Marked ally with Skill Lock for 2 turns on the next turn. A shield (Suite Door Slide) soaks the slam and the lock; an interrupt or a Break cancels it and drops the Mark. FINAL BOARDING only below 50% HP. 1,800 HP for 4, 1,350 for 3.
- No new engine seams. Four new statuses (bin_drop, middle_seat, both_armrests, boarding_group).
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, chapter 10 section; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (The Last Call 4.6 rounds, the Armrest Hog 2.9, normal fights 1.9 to 2.9); `python3 tools/b3_test.py s13c` (portrait and landscape). The bonus chapter follows as the final b3s13.

## b3s13b (2026-11-20): New battle: the chapter 9 ballroom monsters and The Mirrorball join the Battle Lab (stage 13, part b of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This part is chapter 9, built from `claude/bestiary-v11.md`: Velvet Rope, Stuffed Shirt, The Hanger-On, The Sore Loser, The Wallflower (Elite) and the boss The Mirrorball in `data/b3-foes-ch09.js`, with six formations (9 VP each, 27 for the boss).
- Lab: NEW 51 to NEW 56, one fight for every formation and the boss (Tom, Grace, Rose and Deedee at level 22; the dome backdrop).
- The Mirrorball as data: she starts in a Facet Spin (+25% Evasion buff); Facet Dazzle and Spotlight Solo leave her Dazzled, so a Clobber hit sets off Shatter Glitz! (strips Facet Spin) and a Racket hit sets off Sensory Overload!, both already built; LAST DANCE only below 50% HP. 1,590 HP for 4, 1,190 for 3.
- No new engine seams: Members Only uses `frontAllies` and Fifty-Two Pickup uses `firstTarget` (both added in b3s13a); "Cheater!" is a Mental status with the existing `foeTaunt` flag, the same one SEE ME uses. Six new statuses (members_only, hmph, gauche, cheater, wall_hug, facet_spin).
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, chapter 9 section; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (The Wallflower 5.7 rounds, The Mirrorball 3.8, normal fights 1.2 to 2.1); `python3 tools/b3_test.py s13b` (portrait and landscape). Chapter 10 and the bonus chapter follow as b3s13c and b3s13.

## wanch1h (2026-11-20): Rose and Deedee fight in Wan videos too (idle with breathing, guard, hit, run), The Floor Is Lava!, the Glasses Scrub and Zone One Blockade are videos, Grace's knock-out sits on the ground

Card c-wanch1 (part h). Videos: wan-gen runs 44859585429 and 44859840350 (18 clips, $9). Checked against plan 4.4 before baking.
| Fighter | Now a video | Not yet |
|---|---|---|
| Rose | idle, guard, hit, run, The Floor Is Lava! (points at the floor, hops, points a warning; Tom's note "shouldnt just be her jumping") | ko floats 5% above the ground: remade with the change that fixed Grace's; Lamb-Tuck Ankle Tackle (her hand left the frame) and "Giddyup, Tata!" Launch (her hair left the top of the frame): remade with the picture shrunk to 80% inside the video (`pad`); dodge and cast not made (stop-loss on Grace) |
| Deedee | idle, guard, hit, run, "Hand Me My Glasses" Scrub (small thin reading glasses, her own eyes, a scrub brush; Tom's notes "clown glasses", "rolling pin") | ko floats 6%: remade as Rose's; victory (her spread hands left the frame) and Wet-Floor Hazard (the mop head touched the frame edge): remade with `pad`; dodge and cast not made |
| Tom | Zone One Blockade (retry 2, elbows bent: his palms stay inside the frame except the fingertips for 13 pictures) | |
| Grace | ko retry 2 ("sinks straight down ... right where she stood"): seated 1.5% of the frame above the standing feet line (was 4%) | |
- Painted rows purged: Rose keeps only dodge and ko, Deedee dodge, ko and victory (until their videos pass).
- Accepted with a known small fault: Rose's hit rocks her onto her toes for 1.5 battle px (1.4% of the frame, the plan allows 1%); the test allows 2 px in a hit.
- `wangen.py`: a job may carry `pad` (the start picture shrunk inside the 720 x 1280 frame); test W10. W9 no longer depends on which jobs the cap let through first (it was flaky).
- Engine: a guard video that is still loading shows the idle video instead of the painted standing picture (`b3cMemberFrame`).
- Fixed: index.html carried Grace's guard script tag twice (a rebase in wanch1g).
- Tests: `wanproof_test.py` (all four, W1 to W5 and P6; the painted baseline is measured with the code breath off) FAILS []; `b3_test.py s8` (peak 14 clip pictures) and `paint_state_test.py` FAILS [], portrait and landscape.

## qa-bug12c (2026-11-21): Boppy's Paso Robles cap reads the right way round when a scene turns him to face left
Chapter 1 QA BUG-12 (c) (keysecrets2): on Boppy's shocked pose and the BOPPY'S GOLD TEETH close-up the cap lettering looked garbled or mirrored.
- Checked on main (facts): the paintings are right. The Art Library mood sheet (boppy-emotions, baked to art/chars/boppyemo-story.webp and portraits/emo/boppy-*.webp) and the grin close-up (ch1-boppy-grin-v1, art/closeup/ch1-grin.webp, drawn as painted by closeupReveal) all read "Paso Robles". The fault is facing1 (2026-11-14): `scenePoseDraw` mirrors a leaning mood or talking painting so the person faces who they look at, and Boppy's surprised, scared, proud and loving poses and his tell, point and answer poses lean right, so whenever he looks left his cap writing is drawn backwards (facing1 had listed it as known). A new prompt could not fix this, so no Art Library entry was changed.
- Fix: data/pose-unflip.js (new, after data/pose-facing.js) lists a box around the lettering in each of those 8 frames; `paintedUnflip` (engine/painted.js, called by `paintedCanvas` on a mirrored frame) paints each box from the unmirrored painting at its mirrored place, only over the figure (source-atop), with the box edge faded over 5 px so no seam shows. The outline, the face and everything else stay mirrored. Boxes measured by eye on zoomed frames; a rebake of boppyemo or boppytalk that moves the figure needs them measured again.
- Found, not fixed: his unimpressed mood pose still wears the old Big Fish cap (Library entry boppy-em-unimpressed-v1); card c-boppy-bigfish. Carmen's apron and Olivia's PRESS badge are still reversed when mirrored (facing1 known list); they can get boxes the same way.
- Tests: new tools/pose_unflip_test.py (renders the 8 frames in the game: inside each box the unmirrored lettering, the outline unchanged, nothing changed outside the boxes; sheet tools/shots/pose-unflip.png), chapter 1 kitchen with Boppy surprised, scared and pointing while facing left, portrait and landscape, before and after; smoke. NOT done: a real iPhone.

## itemdef-css (2026-11-20): the item definition banner's look and words are back (itemdef1 lost them on the way in)

Card c-itemdef1. While itemdef1 was rebased onto a busy main, the conflict step kept main's `index.html` and `tools/itembanner_test.py`, so the live build had the new banner code with no styles and without `data/item-defs.js`. This puts back the banner styles, the `data/item-defs.js` script tag (after `data/item-art.js`, whose newer tag is kept) and the test. No other change.

## fix-gatelayer-pics-2 (2026-11-21): gate pictures checked by Claude: three ready for Tom, three rewritten to a method that works

Card c-fix-gatelayer-pics-2 (parts a and b above). Tom on t-gatelayer-pics: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images".
| Picture | Round 1 | Round 2 | Now |
|---|---|---|---|
| Amy's door locked | pass | | waits for Tom's approve |
| Amy's door open | pass | | waits for Tom's approve |
| Stage 7 open | narrow gap, lamp lit | pass | waits for Tom's approve |
| School gate open | still shut | still shut | leaf taken off (posts and top rail only) |
| Car Barn open | only ajar | plate floating across the gap | plate fixed to the left leaf |
| Studio gate open | arm missing | arm lowered (closed) | arm taken away (two posts only) |
- Spent $0.74 on xAI (two art-gen runs). Stopped after round 2 (stop-loss: the school gate missed twice the same way). Evidence for the new method: with the locked picture attached, every removal worked (chain, padlock, sign, the studio arm in round 1) and every swing or raise failed. The third paid try is Tom's Generate tap on the card.
- Checked in the game, portrait and landscape: Amy's locked door picture (previewed locally, not committed) sits exactly on the painted door in the new arch rectangle; the school gate stands under the SCHOOL sign between its posts. `python3 tools/gate_art_test.py` ok.
- `board_sync_test` R5 fails on main before this build too (it replays the live board, which has moved on); not changed here.

## itemdef1 (2026-11-20): every item banner reads like a JRPG item definition: picture, name and type, description, In battle, In story

Card c-itemdef1. Tom (11-20): "change every item banner in The Adventures of Tom so it reads like a JRPG item definition with four parts: item name and type, a short description of the item, its effect in battle, and its effect in story (key items, gifts, unlocks)."

- Banner (`itemBanner` in `engine/party-banner.js`, styles in `index.html`): ITEM GAINED on top, the item's picture in a square tile (painted picture, or its emoji until the painting is approved), the name with a type chip (KEY ITEM, RECOVERY ITEM, BATTLE ITEM, SIGNATURE TOOL, OUTFIT, KEEPSAKE CHARM, BIRTHDAY SASH, SOUVENIR, ODDS AND ENDS; "TNB ONLY" for gear one person can wear), the description in italics, then IN BATTLE and IN STORY rows, the source line (a monster's drop line or the auto-gear note) and "Tap or press A to continue" inside the card. Landscape puts the tile on the left.
- Several items from one source stay one banner, one page per item ("1 of 2"); tap or A turns the page ("Tap or press A for the next item"), the last page closes it. Duplicates show as "Juice Box x2" on one page.
- Data: `data/item-defs.js` (new, loads after `data/item-art.js`). `itemDef(id)` builds the four parts: name and description from the items table, type and IN BATTLE worked out from each item's own fields (the same `bonusText` and `effectText` the menus use, so they can't disagree), IN STORY from `ITEM_STORY` for the 62 key items and story gifts (coins, Bready Mercury, Boppy's jar, the Part 2 keepsakes, family gifts, chapter rewards, Aunt Ellie's prizes, everyone's own tool, Nine Scoops) and a line by kind for the rest (snack, gear, charm, souvenir, junk with its sell price). Every line was written in the game's voice (contractions, no em dashes) and checked against the scene that hands the item out.
- Built on top of qa-bug02, which shipped in parallel: its picture ring is replaced by the square tile (the item banner's prompt now sits inside the card), its dark-pill prompt stays for party banners, and its rule that hides the overworld "..." pips while a banner is up is kept (`drawLifePip` in `engine/emotions.js`).
- Tests: `tools/itemdef_test.py` (new: all 288 items have four non-empty parts; every key item and story gift has its own story line; no em dash; contractions; the banner fits on screen for all 288 items with the longest drop line, portrait and landscape; pages turn and close). `tools/itembanner_test.py` updated to the new layout (pages instead of a row of icons). Also checked by hand in the turned-phone landscape (portrait phone with the landscape toggle). `tools/board_sync_test.py` R5 fails on main before this change too (not touched here).


## qa-coh03 (2026-11-20): Boppy's fishing spot shows his folding chair, not a wooden bench

Chapter 1 QA COH-03 (build keysecrets2, `claude/ch1-qa-keysecrets2.md`), card c-qa-coh03. The Big One asks "The man in the folding chair. Will he be back?" (`data/scenes.js` ch1AfterBoss, kept: canon c-gem-canon03 and the locked chapter 1 script put the cube beside Boppy's folding chair), but the pond painting had a wooden bench with the thermos, bucket and rod on it.
- Checked on main first: line and bench both still there, no standing rule against it.
- Call made: no new Library picture. The painted folding chair already exists (`art/props/boppy/folding_chair.webp`, "already built" in `claude/story-build.md`), and a new generated chair would still have needed the bench painted out of the plate. The bench is removed and the chair set down by script, so nothing is generated and nothing costs credit.
- `tools/hollow_chair.py` (called from `tools/make_hollow_fg.py`; the raw painting and masks are never edited): the bench, its shadow and the fishing line are removed (water above the shoreline is the water just above it mirrored, the ground below is the clear dirt to the left mirrored and tiled, shore edge feathered; FSR and Telea inpainting smeared and were not used). The thermos, bucket and rod are cut from the ORIGINAL painting with GrabCut so they keep the plate's brushwork, then set down again: thermos on the seat (the same thermos-on-the-chair motif as the gym in chapter 19), bucket on the ground to its left, rod flipped to lean on the chair back. The chair is the approved prop, lightened and warmed to the plate's light, with a soft contact shadow. The props mask loses the bench and gains these, so `art/hollow-fg.webp` and the depth zones follow.
- Files: `art/hollow.webp`, `art/hollow-fg.webp`, `art/hollow-trail1..3.webp` (rebaked by `bake_hollow_trail.py` from the new plate, with the trail's three stages of fix-hollowtrail-play-2; wrappers unchanged) and `data/hollow-trail.js`, the zones line `PLATE_BEHIND.hollow` in `engine/plate.js` (one zone now covers chair, thermos, bucket and rod, base at the chair's feet), the spot's text in `data/maps-le.js` (now "A folding chair with a thermos on the seat, a bucket, one bass...", not voiced). Before the change, an unchanged `make_hollow_fg.py` run reproduced the repo files pixel for pixel.
- To redo: `python3 tools/make_hollow_fg.py`, paste `tools/shots/hollow-zones.js` over the `PLATE_BEHIND.hollow=` line in `engine/plate.js`, `python3 tools/sprite-bake/bake_hollow_trail.py`, bump tags.
- Tests: new `tools/hollow_chair_test.py` (reproduces from the script, changes only the spot, bench gone, chair, thermos and bucket there, foreground layer and one depth zone, trail paintings match, line and text name the chair), `hollow_trail_test.py`, `smoke.py`. Looked at in the game in portrait and landscape (base plate and the last trail stage), `tools/shots/chair-*.png`.
- Limit: the chair is a battle prop with a slightly darker outline than the soft plate; it sits right, but if it looks pasted on at phone size, the fix is a Library picture of the chair painted from the plate's look (a new card).

## fix-itembannerart-pics-2 (2026-11-20): 285 item pictures are in the game; 3 that missed twice are made alone; the cutter no longer drops cells or leaves crimson shadows

Card c-fix-itembannerart-pics-2. Tom on t-itembannerart-pics: "some failed. make sure you only regenerate those than failed and approve those where nothing failed".
- Only the failed cells were made again: the 2 redo sheets (18 items), board commit `board: generate t-itembannerart-pics`, run 44861903466, $0.12. The 18 first sheets were not made again.
- Approved on his word, cells that failed left out: the 18 first sheets and the 2 redo sheets (`data/art-prompts.json`, files `art/raw/props/prop-item-*-v1.png`). A cell named `-` in an entry's `bake` is skipped, so only pictures where nothing failed are installed: 270 from the first sheets and 15 from the redo sheets, so 285 of 288 items show their own picture; the other 3 keep their emoji until their single pictures are approved.
- Redo sheet check, cell by cell: redo 1 cell 7 (Pro Racing Flats) came back as football cleats with a swoosh again; redo 2 cell 2 (Tiny Clay Taco) a real taco again, cell 9 (Birthday Sash) a bow with no sash. Stop-loss (two misses the same way): the notes are not reworded a third time; the method changes. Each is one object alone in its own picture, `prop-item-solo-amy_chm1`, `-claytaco`, `-g_bsash` (same note, `--grid=1`; `SOLO` in `tools/art-library/itemart-prompts.js`), and the redo sheets skip those cells. The hard hat keeps its scribble (the item is the hat with initials).
- Bug found while approving: `tools/sprite-bake/bake_item_sheet.py` stopped on 12 of the 18 first sheets ("nothing drawn in cell ..."), so approving them in the Art Library would have installed nothing. Cause: two objects in neighbouring cells painted closer than the merge distance became one blob and were given to one cell. Fix: a merged blob whose drawn pieces sit in different cells is split back into those pieces. Second fix: the generator paints a soft drop shadow in a darker shade of the magenta that the key could not reach, so each picture had a crimson smear under it; a pixel that is a darker shade of the key colour and joins the background is now cleared (nothing inside an object is touched).
- Tests: `python3 tools/itemart_test.py` (two new checks, both fail on the old cutter), `itembanner_test.py`.
- Pencil reports: none filed since 03:14 about item pictures (the two open ones are chapter 1 scene notes, left open).


## b3s13a (2026-11-20): New battle: the chapter 8 car barn monsters and Old Ironbelly join the Battle Lab (stage 13, part a of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts so a stalled session loses at most one chapter. This part is chapter 8, built from `claude/bestiary-v11.md`: Lukewarm, Leftover, Wet Blanket, The Draft, The Picky Eater (Elite) and the boss Old Ironbelly in `data/b3-foes-ch08.js`, with six formations (9 VP each, 27 for the boss).
- Lab: NEW 45 to NEW 50, one fight for every formation and the boss (Tom, TNB and Nara at level 19; the car barn backdrop, the boiler room for the boss).
- Old Ironbelly as data: BROIL (announced one turn ahead, then Toasty on all three and on itself) and Full Furnace (below 50% HP, same, plus the buff status `full_furnace`, +20% Attack). Its Sizzle acts (Hot Coal, BROIL) fire TNB's stone clay shields into Fired Glaze, which was already built; a Drench hit on the Toasty boss sets off Steam Cloud!. 1,040 HP for 3, 1,390 for 4.
- Two small seams: the strip kind `shieldOrBuff` (Pilot-Light Gust takes the target's biggest shield, or one buff when there is no shield) and the targets `frontAllies` and `firstTarget` in `b3Who` (first used in chapter 9). Five new statuses (crosswind, tin_lid, why_bother, it_touched, full_furnace) in `data/b3-status.js`.
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, new; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (Old Ironbelly 5.1 rounds, The Picky Eater 5.3, normal fights 1.9 to 2.4); `python3 tools/b3_test.py s13a` (portrait and landscape; frames `tools/shots/b3-s13*.png`). Chapters 9, 10 and the bonus chapter follow as b3s13b, b3s13c and b3s13.
## fix-gatelayer-pics-2b (2026-11-21): gate pictures round 2: two doors pass, four open states rejected with details and reworded

Card c-fix-gatelayer-pics-2, part b. Tom: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images". Claude ran the six (art-gen, $0.44) and looked at each against its reference.
- Pass, waiting for Tom: Amy's door locked (same arch and door, shoe doodle note, no words) and open (same door swung open on a lit hallway).
- Rejected with details: school gate open (still shut across the lane), Car Barn open (only ajar), studio arm raised (arm missing), Stage 7 open (narrow gap, lamp lit).
- One change each in `gate-prompts.js`: each open state now says how far it opens and where the moved part hangs. The Stage 7 lamp-off ask missed twice the same way, so it is dropped (stop-loss): the lamp stays as in the locked picture.

## qa-coh05 (2026-11-20): Grump Hollow gets its own woodland battle backdrop in the Art Library; fights there switch to it once Tom approves the picture

Card c-qa-coh05 (chapter 1 QA report on keysecrets2, COH-05: Skeeter Swarm and Log Lump fights in Grump Hollow showed the town pond with a church steeple). Checked on main first: `battleBgKey` in `engine/battle-draw.js` still fell back to `pond` for map `hollow`.
- New Art Library entry `bg-29-grump-hollow` (Battle tab, New backgrounds; `tools/art-library/battle-prompts.js`, spliced into `data/art-prompts.json`). Written from the approved `01-pond-town` prompt with only the scene and floor changed: the same pond band and framing oaks, now deep woods (mossy boulders, ferns, lily pads, a mossy log, twisted oaks, no buildings, church, houses or dock) and a damp brown earth floor. The shared rules block is unchanged.
- Its `bake` runs the new `tools/sprite-bake/bake_battle_bg.py 29-grump-hollow` (approved picture to `bgs/29-grump-hollow.webp`, 1152 x 648, cropped to 16:9 from the middle if needed); art_bake then moves BG_V. The other 29 backdrops keep no bake.
- `BG_FILES.hollow` and a rule in `battleBgKey`: map `hollow` uses `hollow` when that picture has loaded, otherwise the pond (so nothing changes until the approval). The missing file is a 404 the service worker never stores.
- Tested with a stand-in picture (a crop of the Grump Hollow map painting, deleted, not pushed): `bg_test.py` saw `hollow` loaded at 1152 x 648, and a Skeeter Swarm and Log Lump fight showed it in portrait and landscape; without it the key stays `pond`. An `art_bake.py --dry` run on an approved copy routes the picture to the new script.
- Not done: the builder `node tools/art-library/make-prompts.js` fails on main in `npc-prompts.js` (an undefined colour), which is why the entry was spliced; not fixed here. Other Long Island maps with no rule (the Square, the marsh, the pier) still use the pond picture; not in this card.
- Board: hands to Tom card t-qa-coh05-pic (generate and approve the picture).
- Tests: `tools/bg_test.py` (expects `hollow` once the picture exists, plus a check of the bake script on 16:9, square and tall pictures), `tools/smoke.py`.


## voiceboard1 (2026-11-21): Generate all N voices on the board: one tap makes the voices and puts them in the game

Tom: "make a kanban card that will autgenerate and save to github the voices". A Tom card with ask voice and `voices` or `voice_chapter` now has Generate all N voices (board.html: `voicesHtml`, `vgenTap`; about 0.44 credits per character, second tap confirms). The tap commits `board: vgen <card id>`; the `voice-gen` Action runs `tools/voice-learn/voiceboard.py`: it makes a checked take for each line of the card that has no clip (`voicegen.py` gained `--lines-file` and `--chapter`), keeps them on branch `generated`, merges them into `data/voice/dialog-ch*.js` with `merge-local.js`, rebuilds the Voice Library list, runs `unused_voice.py`, writes a CHANGES entry `voices-<card>-<run>`, bumps tags and pushes to main, then writes `vgen.run` on the card and rewrites its next step to "listen in the Voice Library". Needs-human lines are listed on the card and not merged. `voice-gen.yml` also gained manual inputs `card`, `chapter`, `max_chars` (dry_run still defaults to true). First card: `t-ch2voices` (chapter 2, 90 lines with no clip), waiting on `t-ch2play`. No ElevenLabs credits were spent; tested with the stand-in server (`python3 tools/voiceboard_test.py`: 59 checks). Not covered: the retry against a main that moved. Facts: `claude/next-addendum-voiceboard1.md`.


## fix-gatelayer-pics-2a (2026-11-21): gate pictures: detailed rejects, Amy's door matched to the painted arch, door crop fixed

Card c-fix-gatelayer-pics-2, part a. Tom on card t-gatelayer-pics: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images".
- The six rejected pictures now carry what was wrong with each, not only "All failed" (`data/art-prompts.json` rejects).
- Amy's door: the reference crop (`art/raw/props/gate-row-amyhouse-door-ref.png`) and the game rectangle (`GATE_ART['row-amyhouse']`, now `[5.94,4.45,1.78,2.14]`) are exactly the stone arch; both had taken in the shoe shelf and window. Both door prompts ask for the arch and door only, 3:4, with a margin (the bake trims; "edge to edge" fought the margin rule).
- Stage 7 open: the lamp is "switched off: dark red glass, no glow" (it came back lit).
- Found on main: build qa-bug01 had pushed unresolved conflict markers into `engine/main.js` and `index.html` (the game stopped at load, `BUILD_HISTORY` declared twice); fix-hollowtrail-play-2 cleared them first, this build keeps its version.

## fix-hollowtrail-play-2 (2026-11-21): Grump Hollow wrapper trail is now three legs of four wrappers: Mudling to the top left Toad, Toad to the Log, Log to the fishing spot

Tom (t-hollowtrail-play): "youre not understanding - you created several images where the wrappers are scattered haphazardly across the area... after defeating the mudling, there should be 4 wrappers that lead to the top left corner... after defeating that monster, there should 4 more wrappers that lead to the center of the aera, where the party must defeat the log... after defeating the log, there should be 4 more wrappers that lead to the big one activiation spot / after each monster is defeated... Grace should say 3 wrappers, let's follow them! / only 3 monster should trigger this: the mudling, the toad looking thing in the top left and the log that sits in the middle".
- Facts: 12 wrappers (`WRAPPERS` in `tools/sprite-bake/bake_hollow_trail.py`), 3 paintings, each shows only its own leg of four in a line from one monster to the next. `art/hollow-trail4.webp` is gone (purged). Only the Toad and the Log set a `ch1-beat:` flag; the Skeeter Swarm and Pond Grump no longer do. `ch1-spot` shows the leg 3 painting.
- Grace's line "3 wrappers, let's follow them!" replaces the old "Nine wrappers. There were twelve..." and Deedee's reply in `ch1Mudling`, and plays after the Toad and the Log (`ch1FolToad`, `ch1FolLog`). These lines need a recording.
- Test: `python3 tools/hollow_trail_test.py` passed (bake, game, portrait and landscape shots in tools/shots).

## board-qa2 (2026-11-20): board only: 19 cards from the second chapter 1 QA report, 5 items not added

## qa-coh07 (2026-11-21): the twelve-cup muffin pan sits on Deedee's island from the moment Tom walks in
Chapter 1 QA COH-07 (keysecrets2): walking into Deedee and Boppy's House showed a bare island until the theft scene started. Cause: the pan was only a scene prop, created when the scene began, and the painting is always drawn bare (fix-cutpolish4b). `scenePropsDraw` (`engine/scene-props.js`) now draws the same pan at the same spot on map `grands` in chapter 1 until flag `ch1-theft` is set; from there the scene's own pan prop takes over and the Mudling still takes it.

## wanch1g (2026-11-20): three leftover script tags of the removed monster clips taken out of index.html

Card c-wanch1 (part g). wanch1f removed `data/clips/toad-slam.js`, `skeeter-bite.js` and `skeeter-whine.js`, but a rebase kept their script tags (the art-bake job had retagged them), so the page asked for three missing files. Tags removed; `grep` for the three ids is 0 outside the Art Library entries.

## fix-ch1flight (2026-11-21): chapter 1's cab scene goes straight from TNB's text to the flight, with the phone picture up while TNB's text is read

Card c-fix-ch1flight (Tom's Something is wrong note on t-ch1flight, and pencil report r-20261120-192121-ynen).
- Tom: "didn't work, after TNB's text there was dialog between Tom and the girl's and Deedee. it should go straight to the airplane animation from the cab animation with TNB's text." Cause: the cab scene chained into the full airport run (`tripSteps`), which plays Sal's line, the girls' goodbye with Tom, and Deedee's goodbye. Fix: `{trip:'west',quiet:true}` (`tripSteps(dir,quiet)` in `engine/travel.js`) sends the girls and recruits home silently and plays only the chapter start and the flight.
- Report ynen, Tom: "when TNB is speaking the phone image should still be displayed". `{ch1Reveal:'phone',keep:true}` keeps the picture up under TNB's dialog (`closeup.keep`, `engine/closeup.js`, `engine/overworld.js`, `engine/main.js`); `{ch1RevealEnd:true}` closes it after the text.
- Kept: Sal's "Los Angeles? You got it.", the fade, the chapter 1 card, the flight lines. Changed: only the goodbyes and the picture timing.
- Checked in the browser (portrait): Sal, phone with TNB's text, chapter card, flight lines, Los Angeles, no girls or Deedee dialogue. Python smoke could not run here (no playwright for python).

## wanch1f (2026-11-20): the Pond Grump, Bog Toad, Log Lump and Skeeter Swarm attack and wind up in videos in NEW 2 to NEW 6

Card c-wanch1 (part f). Monster clips on xAI Grok lite (clip-gen runs 44853328032 and 44854697368, $1.59 in all), each looked at picture by picture before wiring.
| Monster | Now a video (data/b3-foes-ch01.js) | Left out |
|---|---|---|
| Pond Grump | Puddle Grumble, Bog Splash, Soggy Slap with its wind-up held while it charges | |
| Bog Toad | Night Croak (retry 2: the throat swells like a balloon), Tongue Lash with its wind-up | Body Slam: leapt out of the frame and lost its lily pad twice (stop-loss) |
| Log Lump | Low Roll, Branch Jab, Timber! with its wind-up | |
| Skeeter Swarm | its first idle (B3_BODY_CLIPS.skeeter), Buzz Cloud | Darting Bite and Mosquito Whine: the small mosquitoes vanished halfway twice (stop-loss) |
- The three stop-loss entries are set back to rejected in the Art Library with the reason; their baked files and script tags are removed (`data/clips/toad-slam.js`, `skeeter-bite.js`, `skeeter-whine.js` and their pictures). Those three acts keep the default animation.
- Checked by playing NEW 2 to NEW 5 at 2x (a test script): every wired act and wind-up played from its clip, no page errors, at most 12 clip pictures held at once.

## qa-bug01 (2026-11-21): quest log no longer says "Go to it's Sunday" after the trip home

Card c-qa-bug01 (BUG-01 of the chapter 1 QA report). `questPhrase` (`engine/story.js`) now treats a plain statement case-insensitively, so "it's Sunday..." is left as written and capitalized. "picked" also counts as a statement, which fixes the same slip in the Grump Hollow wrapper goals. All Goal toasts in `data/scenes.js` were run through it. Browser tests were not run in this session (the Playwright browser did not match).

## qa-txt04 (2026-11-21): the Inspect prompt keeps a name's capital letters (Boppy's fishing spot)

- Chapter 1 QA report TXT-04 (claude/ch1-qa-keysecrets2.md): near the pond the prompt read "A · Inspect boppy's fishing spot" while the opened box said "Boppy's fishing spot". `engine/draw.js` lowercased the whole name. It now lowercases only a leading The, A or An, so proper names keep their capital. Nothing else changed.

## qa-coh02 (2026-11-21): The Big One's win line no longer has it splash away before its talk
Chapter 1 QA COH-02 (keysecrets2). `data/monsters.js` The Big One `die` line (the VICTORY card, old battle) now reads "It stops thrashing and blinks up at the shore." so it is still at the surface for the after-boss scene. Not a spoken line (no clip, voice audit unaffected).

## qa-bug02 (2026-11-21): item banners: the picture fills its circle, the prompt sits on a dark pill below the card, speech pips hide while a banner is up

- BUG-02 of the chapter 1 QA report (keysecrets2). Fact: the painted pictures arrived in itembannerart1; this build is the layout. `index.html` `.pb-pic` fills the ring (one item full size, several 46% each); `.pb-hint` has a dark pill so it reads on any map; `drawLifePip` (`engine/emotions.js`) draws nothing while `partyBannerHeld()`.

## qa-bug12 (2026-11-21): tapping the Menu or Save button cancels a pending tap-walk, so it can no longer inspect the Cookie counter instead

Card c-qa-bug12 (BUG-12 a, chapter 1 QA report on build keysecrets2).
- Cause (from the code): a tap-walk toward the counter ends with an automatic A press on arrival. A tap on the Menu button did not cancel that walk, so the press landed on the counter, opened its dialogue and the Menu was refused (`!dialog.active`).
- Fix: `hudTapStopsWorld` in `engine/draw.js` drops the pending tap-walk and any queued A press on every Menu and Save button tap.
- Not done: BUG-12 (b), Boppy going blocky as a talk starts, was not reproduced and has no cause yet; BUG-12 (c), the cap lettering, is card c-qa-bug12c.
## qa-bug08 (2026-11-21): no HOLD + SLIDE, ! Menu or Save over a cutscene or the CHAPTER COMPLETE card
Chapter 1 QA BUG-08 (keysecrets2). Cause: the cutscene class hid the arrows and the A button but not the HOLD + SLIDE caption or the top-left buttons, so the caption showed between lines and the buttons stayed tappable (opening ! let monsters roam). Fix: one CSS rule in `index.html` hides `#hud-btns`, `.pad-caption` and `.pad-center` while `html.cutscene` is set (the class already covers the chapter cards).

