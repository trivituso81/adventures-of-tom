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

