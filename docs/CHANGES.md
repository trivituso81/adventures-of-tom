# Change log (newest first)

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

None pending. Add any new or reworded spoken line here as `character.kind: "text"` (and the old text if reworded).

## Known gaps

- Barrier events not built: Distance (`tnb3`), Fear (`nara3`), Exhaustion (`ff2`), Aging (`ff3`).
- Remix versions of abilities, and "Polish rank 2" flourishes, are not built.
- Tier 3 Tombos and Family Finishes have no story unlock flag yet (chapters 11 to 20 do not exist); they play in the Battle Lab only (`B2.tombos='all'`).
- Cosmetic: some status pops crowd Ultimate words at the heal moment. Stale comments in `engine/battle2-traits.js` line 13 and `engine/battle2.js` line 609.
- `data/lines.js` `nara.low` second line "Whimper. Tom?" contains a word (Nara only barks). Left alone because changing it needs a re-bake.
- First launch on a phone may be slow with all voices loaded; in the live artifact the answer is to fetch clips on demand. Not relevant to the silent build in this repo.
