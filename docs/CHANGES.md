# Change log (newest first)

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
