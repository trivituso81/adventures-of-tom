# Change log (newest first)

## 2026-10-28: Popcorn Jump couch no longer overlaps Tom and TNB
- The couch's rolled arms were drawn in front of Tom and TNB and covered parts of their bodies (Tom's left fist). All couch pieces now draw behind them (`engine/battle2-kind.js`, `couchBack` plus `couchFront` in the back scene).

## 2026-10-28: TNB existing-move feedback (Existing Moves Lab)
- Mug Toss: smaller mug (scale 3.2 to 2.0) with a detailed redraw (speckled clay, glaze drips, rim and inside, handle, sticker, foot ring).
- WARDROBE: detailed rack (steel tubes, slat shelf with shoes and a hat, casters, marquee sign with bulbs) and five costume pieces on wood hangers (blazer, dress, hoodie, striped shirt, trench coat). The costume that drops on the friend is the detailed blazer.
- Dad-Joke Pottery replaced by **Throw Down** (key `dadjoke_pottery` to `throw_down`, same numbers: 2 VP, hybrid, 1.4x, +15% crit): a detailed electric pottery wheel, he throws a bowl, the wheel runs away, the bowl flies off and lands on the enemy's head, then the pun.
- Kept: Metro Tap Card, Slasher Jump Scare, Kiln Door Policy, Baxter Street Bomb. Tombos untouched.
- Lines to bake: `tnb.throw_down: "I was throwing a bowl. Literally. ...Wait, come back, I have more!"` (replaces the dadjoke_pottery clay pigeon line; its old clip is dead).

## 2026-10-28: Part 2, Chapter 12 "Welcome to Jefferson Park, Girls"
- Gate Infinity now starts the chapter (LA opens). Jefferson Park: Tom's house (Bready Mercury, photo wall), TNB's Loft (Rose's bowl, Amy and TNB bond), Monochrome Marlowe greys the block and sets neighbors in amber, Doña Carmen thawed by a warm pupusa, Casa Alvarez thawed by Amy's laps (unlocks Tombo ff2 Run With Us, Mommy!), boss Gridlock Prime, colour returns, Marlowe hints at Long Island, Green Light keepsake.
- New couches and benches (Tom's couch, Parkway bench) swap the front party. Chapter select now has chapter 12.
- Files: see docs/C12-DONE.md. Tests: tools/ch12_test.py all ok; smoke, ch11, ch11b re-run.
- All new dialogue is unvoiced until baked (docs/dialogue-scripts-ch12.json).

## 2026-10-28: Part 2, Chapter 11 second half (C11b): Lost and Found, Julian Vance, FINAL CALL, the ending
- Lost and Found (concourse door, optional): the Lost Luggage lore, the ledger (UNCLAIMED 4,017,311, CLAIMED 0), a gold-ink card "FOUND: ONE TOM. HELD FOR PICKUP. NO RUSH." Rewards: the Gold Clock Tag keepsake and Airplane Pretzels.
- Gate Infinity: Julian Vance (the man in the long coat) explains the pause, offers everyone "the good part, forever", Tom says no, Vance makes the last announcement and FINAL CALL unfolds beside the door.
- FINAL CALL boss (level 15, `finalcall`): a departures board on robot legs. Reuses the Last Call rules (`b2BossOpen`, `b2CallTurn`, `b2CheckPhase`): it calls one person per turn, GATE CLOSED if they do not act, Tom can DEFEND. Below half HP two Lost Luggage roll in and it braces for CANCELLED (2 Kinetic or Sparkle hits, or any Tombo). Kind route: ▼ Bag, LET IT FLY x3.
- New move BENCH CALL (`engine/benchcall.js`): ▼ Bag in the FINAL CALL fight. Costs the caller's turn; the fourth member (not Tom, Grace or Rose) steps out and someone from the bench steps in and acts almost at once. Anyone who steps out can be called back.
- Ending: coin number nine, the board flaps, Gate 00 shows LONG ISLAND: CLOSED (the dome goes amber), Amy calls Deedee and it rings and rings, CHAPTER 11 COMPLETE, autosave, a toast that chapter 12 is still being built. Gate Infinity afterwards: LOS ANGELES: NOW BOARDING.
- Files: `data/scenes-p2.js`, `data/p2-monsters.js`, `data/p2-battle.js`, `engine/battle2.js` (finalcall branches, `B2_FINAL`, `B2_FLY_LINES`), `engine/benchcall.js` (new), `index.html`, `tools/ch11b_test.py` (new).
- All new C11b dialogue and the FINAL CALL kindness lines are unvoiced until Tom bakes them (`docs/dialogue-scripts-ch11.json` lists them).
- Tests: `tools/ch11b_test.py` (Lost and Found, Vance, boss with a BENCH CALL swap, win, ending, amber dome; no faults), `tools/ch11_test.py`, `tools/smoke.py` FAILS: [].

## 2026-10-28: voice clips that said the long form of an on-screen contraction
- Tom: clips still say "she is" where the screen says "she's" (Olivia's leaf line). Cause: the 2026-10-27 contraction re-record keyed clips under the contracted text, but ElevenLabs read the old, uncontracted scripts.
- Audit: all 991 clips whose text has a contraction were transcribed with speech recognition (Whisper base.en, offline) and compared word by word. 132 clips said the long form (131 dialogue, 1 battle). Tools and method: `tools/clip-audit/README.md`.
- Wording bugs from the contraction pass fixed in game text (24 lines): "X'll not" became "X won't", "X'd not" became "X wouldn't", "I've seven gold coins" became "I have seven", "Whoever it's has" became "Whoever it is has", "She won't let's open it" / "She let's hold it" became "let us".
- 138 clips removed (the 132 plus 6 whose wording changed), so those lines are silent until re-baked, per the exact-match rule. Dialogue clips 2253 to 2118; battle clips tom 2, tnb 1.
- Re-bake: `Contraction-Fix-Baker.html` (135 dialogue, 3 battle lines). Every script is the original hand-written one (all 138 recovered, every tag kept); only the words that differ by a contraction were changed. Merge: dialogue with `voice-merge-dialog.js` (each clip goes back to the chapter file it came from; Grace shrink and Boppy deepen as usual), battle with `voice-merge.js`.
- Tests: `tools/smoke.py` FAILS: []; page load with all voice files, no page errors; Olivia's leaf line has no clip, untouched lines still play.
- Same baker now also re-recasts Deedee (Tom: keep every emphasis): all 164 Deedee lines (44 battle, 120 dialogue). 130 use the original hand-written scripts (mostly the 2026-10-26 Deedee re-voice files), 34 that never had one got new hand-written directions; every on-screen CAPS word is in the script; banned frail words stripped from tags; "warm Long Island accent" goes inside every bracket and her direction leads the first. Voice: the current Deedee voice (AoT Deedee, Long Island, 2026-10-28).
## 2026-10-28: Part 2, Chapter 11 "The Layover Between Worlds", first half (C11a)
- Part 2 now opens for real: the Rivituso house morning (Deedee's crisp, Boppy's gold card, the boarding pass buzzing), then Flight Zero's cabin (Rose and Grace stowaway, Amy sprints in, the sky tears), then Terminal Infinity.
- New places: Flight Zero (`flightzero`), Gate 00 (`gate00`, two glass domes for Long Island and Los Angeles), the Endless Concourse (`concourse`, Gates 1 Boston to 9 Miami, all paused).
- New monsters: Lost Luggage, Red-Eye, Standby Sprite (a story fight at the checkpoint; WAIT LIST pushes someone down the turn ribbon).
- TNB and Nara arrive by the jet bridge. Unlocks the Sleepover at Tom's Tombo (`tombo:ff1`; Tom, TNB, Grace, Rose in front).
- New system, the bench (`engine/bench.js`): the fighting party stays 4. Anyone else along waits on the bench and walks with the party. Gold Boarding Gate benches swap who is out front. The bench rides along in saves.
- Gate Infinity and the Lost and Found stop at "Chapter 11 continues in the next update" (C11b: Lost and Found, Julian Vance, FINAL CALL boss, ending).
- Files: `data/p2-monsters.js`, `data/p2-battle.js`, `data/maps-p2.js`, `data/scenes-p2.js`, `engine/infinity-render.js`, `engine/bench.js`, `engine/story.js`, `engine/chapter-select.js`, `index.html`, `tools/ch11_test.py`. Load order: p2-monsters after terminal-monsters, maps-p2 after maps-le, p2-battle after battle2-data, infinity-render after terminal-render, bench after story, scenes-p2 after scenes.
- Tests: `tools/ch11_test.py` plays the chapter jump, cabin, arrival, concourse, Standby Sprite fight, TNB and Nara scene, bench swap, save and load.

## 2026-10-28: Aunt Ellie gets her own house on Rivituso Row; TNB revamp closed
- Tom approved the four reworked TNB moves (Foraged at Dawn, Tasting Menu, Just Around the Bend, Coffee Run). The TNB revamp is closed.
- Aunt Ellie moved out of the Rivituso house into a new house of her own on Rivituso Row (map id `elliehouse`, top left, purple roof, label ELLIE). Her room has a hat shelf, writing desk, wardrobe, tea tray, orchid and umbrella stand, all with Ellie jokes. Her spoken lines are unchanged, so every baked clip still plays.
- Chapters 9 and 10 still happen at the Rivituso house: while `ELLIE_VISIT` matches (chapter 9 from the invitation until the chapter ends; chapter 10 from the boss win until Sunday dinner), her house copy is `away` and a visiting copy stands in the Rivituso house. Outside the story the visiting copy is hidden (`syncAwayNpcs()` now also runs once at load in `data/scenes.js`).
- Row map: tag now says three houses; the community garden and corner sign moved to just below the road (two trees removed to make room); the family notice sign gained "Opinions at Ellie's".
- Known mismatch: Dot's lines still count "ten doors" (spoken, baked). Adding a house makes it eleven; fixing it needs a re-bake, so it is left until Tom asks.
- Files: `data/maps-le.js`, `data/scenes.js`, `docs/CANON.md`. Tests: `tools/smoke.py` FAILS: []; Ellie placement checked in demo, chapter 1, 9 (before, during, after) and 10 (before, during, after); screenshots of the Row (portrait and landscape) and her room.

## 2026-10-28: TNB move tweaks from Tom's Move Lab feedback
- Foraged at Dawn: gold-rimmed fine-china plate, glossy pea, herb-oil swoosh, microgreens, flower, glint.
- Tasting Menu: banquet tables (linen drape, gold trim, candle, rose vase); the pea courses are now plated food (seared scallop, beet rose, chocolate dome with gold leaf).
- Just Around the Bend: the trail now climbs a clear LA hill (Observatory on top, Hollywood sign, downtown skyline, palms, chaparral).
- Status: Green replaced by Coffee Run (key `coffee_run`, same numbers: 3 VP, ally, heals 20% + 2 VP, kind on a monster). Files: `engine/tnb-moves.js`, `data/battle2-data.js`, `data/abilities.js`, `data/lines.js`, `data/battle-icons.js`, `docs/MOVE_KEYS.md`, `docs/CANON.md`.
- Lines to bake: `tnb.coffee_run: "Coffee run. I got you the usual."`.

## 2026-10-27: purged dialogue audio for lines that were since replaced
- Tom asked for unused, replaced dialogue to be purged. Audit method: every baked clip's exact text was checked against every string the game source can still produce (plain strings, templates, `{n}`-style placeholders, concatenations). Scenes and `LINES` categories were also checked: every scene is still started somewhere and every `LINES` category is still used, so the dead material was audio only.
- Removed 139 clips whose text no longer exists anywhere: 87 battle clips (amy 12, boppy 15, deedee 3, grace 4, rose 17, tnb 19, tom 16, nara 1) and 52 dialogue clips (dialog-ch1 to ch8, ch10, ch21 to ch23). They were old audio for lines since reworded or contracted (for example "Good job, babies." became "Good job, girls.", old rose pogo and tickle shouts, Amy's "Thirty second-graders" lines). The 7 tnb clips are the old lines of the seven moves the TNB revamp just replaced (quick_change, continuity_pins, rush_hour_racks, wrap_ult, cone_six, curb_appeal, fix_wobble). Also removed 9 matching bake-script notes in `voices.*.scripts` of `data/voice-clips.js`.
- Result: battle clips 550 to 463, dialogue clips 2305 to 2253 (about 8 MB of audio). 0 live clips lost (every surviving clip is byte-identical to before); 0 orphans remain on re-audit.
- Kept on purpose: monster "Round {n}." lines and other templated dialogue (looks unmatched in a plain text search but is live), and `demo/` (reachable from the title screen).
- Not removed: lines that are live but now have no clip (reworded, waiting on Tom's re-bake). Those are silent, not dead.
- Tests: `tools/smoke.py` (tnb,nara) and `IDS=grace,rose` FAILS: []; page load with all voice files: no page errors, no 4xx, clip counts 463 and 2253.

## 2026-10-27: TNB ability revamp (seven moves, same numbers)
- Tom's direction: rebalance TNB's kit away from wardrobe toward horror, longboarding, pottery plus three new themes (PM in training, Michelin-star service, hiking) and one move for his sister Jojo (disc golf). Effects unchanged; only names and animations.
- Replaced (old key -> new key, `data/abilities.js` p cards, `data/battle2-data.js` o3 rows, `data/lines.js`, `data/battle-icons.js`): quick_change -> foraged_at_dawn (Foraged at Dawn), continuity_pins -> dont_split_up (Don't Split Up), rush_hour_racks -> scope_creep (Scope Creep), wrap_ult -> tasting_ult (Tasting Menu), cone_six -> around_the_bend (Just Around the Bend), curb_appeal -> round_with_jojo (Round with Jojo), fix_wobble -> status_green (Status: Green). Kept: Mug Toss, WARDROBE, Metro Tap Card, Slasher Jump Scare, Dad-Joke Pottery, Kiln Door Policy, Baxter Street Bomb.
- Animations: new IIFE `t6_` at the end of `engine/tnb-moves.js`; every move ends under 5 s. The seven new spoken lines have no baked clips yet (synth voice until a bake).
- Lesson: a scene's `s.t` starts at `-delay`, so any absolute move-ms timings inside a scene must be shifted by its creation time plus delay (the Gantt chart and the bubble words were late or invisible until this was fixed). `ST.group` has no `mid`; use `(top+base)/2`.

## 2026-10-27: Ymamot Creation timing, and the game can no longer freeze on one error
- Tom reported a freeze after Ymamot Creation (Tom + Amy) and off animation and voice timing. The freeze could not be reproduced in Chromium (all 58 monster types, the real fight with victory card, 8 turns after, 4x slower CPU), so it is treated as an iPhone-only fault and the engine was made fault-proof instead (below).
- Timing bug found: Amy's clip is 5.1 s and Tom's is 4.2 s, but the scene gave them about 1 s each, so they overlapped each other and ran past the end of the move. The scene is now timed to the speech inside the clips: ingredients fly on Amy's words (ketchup, pickles, cereal, sock), the title card lands on "Ymamot Creation!", Tom's line starts 160 ms after Amy finishes, the sling and SPLAT land on "We were six". Spans that wait on a voice scale with battle speed, so it also holds at 2x (measured within 10 ms at 1x and 2x). Both clips are preloaded at the first step. Messages moved to match. No lines were reworded, so no re-bake.
- Fail-safe: `nextStep` no longer stalls the whole move when a step throws; `RFX.draw` drops a scene that throws; `frame()` and the AUTO dialogue loop guard every stage so an error cannot stop the loop. New `gameFault()` shows "Hiccup in <where>: <message>" for 4 s and records `window.__faults`.
- New tools: `tools/speech_windows.py` (speech start and end inside a baked clip), `tools/fault_test.py` (fault injection).

## 2026-10-27: repo brought up to v335; GitHub is now the live app
- Decision (Tom): the GitHub Pages site is the real app; the claude.ai artifact means nothing to him. CLAUDE.md rule 8 and docs/WORKFLOW.md rewritten: finished work goes to `main`, the artifact is a scratch copy.
- Every changed file copied from artifact version `1793146014-5ae2` (v335): 59 files changed, 22 added. `index.html` had its wrapper stripped; `demo/` untouched (already identical).
- Brings the live site the new title screen (START NEW / LOAD / small ADMIN, Part / chapter lists under START NEW, BONUS under it), Rose Mode picture menus (`engine/battle-pictures.js`, `data/battle-icons.js`), the Amy, Deedee, Boppy and TNB pose files, `data/kid-sprites.js`, the Nine Scoops and level-up music (`music/ns_*.mp3`, `music/levelup.mp3`), and the contraction re-record (dialogue voice files `data/voice/dialog-ch1..8, 21..27`; 2305 dialogue clips).
- Voice files in the artifact are the source of truth for this push: dialogue clips now live in `dialog-ch25.js` to `dialog-ch27.js` (old copies were removed from `dialog-ch1..8, 21..24`), and `data/voice/<character>.js` hold the re-recorded battle clips.
- Tests: `tools/smoke.py` (tnb,nara) FAILS: []; title screen checked in portrait and landscape (START NEW / LOAD / ADMIN, then PART 1 / PART 2 / BONUS / BACK); all 24 voice files load with no 4xx and no page errors.

## 2026-10-27: repo brought up to live v1793076136-c38f, plus the title theme
- Every changed file copied from the live artifact (43 files). `index.html` had its artifact wrapper stripped. `demo/` and the unchanged voice files untouched.
- New since the last push: baked music (31 tracks in `music/<id>.mp3`, played by `engine/music-clips.js`; the synth song is the fallback), tap an enemy to target it (`engine/battle2-ui.js`), dialogue AUTO (`engine/dialog-auto.js`, T key), `data/contraction-alias.js`, and edits to abilities, battle2-data, lines, maps, scenes, story, travel, tom-moves and the monster files.
- `data/voice/grace.js` lost one stale clip (`cartwheel`, "Cartwheel! Watch my toes, Ta-Ta!"); the line was reworded in `data/lines.js`, so that clip no longer matched anything.
- Title Theme added: `music/title.mp3` (30 s loop, 96 kbps, -20 LUFS, from Tom's music.json). `MC_TRACKS` has `title`; `clipWanted()` returns it while `splash.active` (title, chapter select, Battle Lab menu) and no fight is on. Tested: loads, plays on the title screen, hands over to the battle track in a fight.
- Picked up from a later artifact version (`1793076136-c38f`): Rose Mode opens dialogue with AUTO on (`engine/dialog-auto.js`) and Pockets-screen null guards for unknown item ids (`engine/menu.js`).
- Not in the track list yet: flight, level-up jingle, Nine Scoops bonus chapter.

## 2026-10-26: repo brought up to live v280
- Every changed file copied from the live artifact, version `1793064753-9a63` (v280). 23 files changed; `demo/` untouched (frozen). index.html had its artifact wrapper stripped as before. Smoke test passes (grace,rose); title screen checked.
- New since v266: Nine Scoops bonus chapter 21 (data/bonus-nine-scoops.js, data/voice/dialog-ch21.js, BONUS button on the title screen), voice merges (tom, grace, rose, boppy, tnb), and edits to abilities, battle2, story, travel, intro, menu, splash, grace and rose moves.

## 2026-10-26: repo brought up to live v266
- Every file copied from the live artifact, version `1792993371-6dc3` (v266), voices and `demo/` included. Smoke tests pass (tnb,nara and grace,rose).
- Since v252: account saves (cloud-save.js), Grace's Cartwheel rebuild (data/grace-wheel.js, new), menu and dialog box layout, skill button labels, volume slider, Tom/TNB line edits, and the voice recast so far (Grace = Ivy, Amy Long Island accent, Boppy pitched up one semitone). Rose keeps her voice.
- Workflow change: the artifact is now the working copy; push to `main` only when Tom asks (CLAUDE.md rule 8, WORKFLOW.md steps 4 and 5).

## 2026-10-25: repo brought up to live v252 with full voices
- Real voice files added to the repo (identical to the artifact), so GitHub Pages plays the full game. Pages URL: https://trivituso81.github.io/adventures-of-tom/
- Source exported from the live artifact, version `1792983007-0e46` (v252). Voice audio and `demo/` left out (see `docs/VOICE.md`).
- v252 (last live change): difficulty retune. `B7_DIFF` in `engine/feel.js` and `b2FoeUnit`/`b2Delay` in `engine/battle2.js`. Rose mode: monsters hit x0.5, monster HP x0.75. Grace mode unchanged. Director mode: hits x1.6, monster HP x1.3, monster turns x1.25 faster, plus shield, Tombo and snack rules. If Tom says Grace mode is too easy, change the base monster POW in `data/battle2-data.js`, not the modes.
- v251: all 25 Director's Cut voice lines baked and live.
- v250: `rose.dc1` is now "No! It's Lamby!".
- Director's Cuts built so far: all tier 1 and tier 2, plus `grace3_dc` (Shadow Squishy) and `rose3_dc` (Lamby Night-Light). Still to build: `amy3_dc`, `deedee3_dc`, `boppy3_dc`, `tnb3_dc`, `nara3_dc`, then the four Family Finish Director's Cuts.
- All 21 Tombos and all four Family Finishes are animated.

## Lines to bake

- `tnb.throw_down: "I was throwing a bowl. Literally. ...Wait, come back, I have more!"` (new; replaces `tnb.dadjoke_pottery`).
- `tnb.coffee_run: "Coffee run. I got you the usual."` (new).

Add any new or reworded spoken line here as `character.kind: "text"` (and the old text if reworded).

## Known gaps

- Barrier events not built: Distance (`tnb3`), Fear (`nara3`), Exhaustion (`ff2`), Aging (`ff3`).
- Remix versions of abilities, and "Polish rank 2" flourishes, are not built.
- Tier 3 Tombos and Family Finishes have no story unlock flag yet (chapters 11 to 20 do not exist); they play in the Battle Lab only (`B2.tombos='all'`).
- Cosmetic: some status pops crowd Ultimate words at the heal moment. Stale comments in `engine/battle2-traits.js` line 13 and `engine/battle2.js` line 609.
- `data/lines.js` `nara.low` second line "Whimper. Tom?" contains a word (Nara only barks). Left alone because changing it needs a re-bake.
- First launch on a phone may be slow with all voices loaded; in the live artifact the answer is to fetch clips on demand. Not relevant to the silent build in this repo.

- C11b follow-up: Rose Mode picture UI now has a BENCH CALL icon (BI_ART x_bench, bpBag branch), so the bag row shows a bench picture instead of crashing.
