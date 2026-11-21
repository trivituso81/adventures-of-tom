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

