# Voice

## What is in this repo

The repo now holds the **full live voice audio** (about 170 MB, exported from artifact version `1792983007-0e46`, v252): `data/voice-clips.js` (settings and Nara's barks), `data/voice/<tom|grace|rose|amy|deedee|boppy|tnb>.js`, and `data/voice/dialog-ch1.js` to `dialog-ch10.js` (1903 dialogue clips). GitHub Pages serves them, so the game is fully voiced at https://trivituso81.github.io/adventures-of-tom/.

**Never hand-edit, regenerate or replace these files.** They change only when Tom sends a `voices.json` and asks for a merge (rules in the Project doc `claude/voice-baking.md`); then commit the merged files to `main` and publish them to the artifact in the same session so the two stay identical.

Test runs are slow with the real audio loaded. For quick tests copy the repo to a scratch folder, replace `data/voice-clips.js` with `const VOICE_CLIPS={clips:{}};` and empty `data/voice/*.js`, and point `BUILD` at it.

## How a spoken line works

- Battle and overworld barks: `data/lines.js` has `LINES` keyed by character and kind (a move key, `hurt`, `low`, `ko`, `win`, `special`). `say(id, kind)` picks a line, plays a baked clip if one matches, else falls back (browser speech synthesis in `engine/speech.js`, or silence for Nara and dialogue).
- Dialogue boxes: `data/dialog-cast.js` maps a speaker name to a voice; `engine/dialog-voice.js` plays the clip for the speaker and exact page text. Unbaked pages stay silent.
- **A clip plays only when its text exactly matches the line.** Rewording a line, even a comma, silences it until it is re-baked. Count of dialogue clips in the live game: 2253 (battle clips: 463), after the 2026-10-27 purge of stale clips.
- The 3x5 on-screen font cannot show some characters, but spoken text can. Scripts for voice baking spell "Ta-Ta" as "Tah Tah" and numbers as words.

## Rules for you

1. Avoid rewording existing spoken lines unless asked. If you must, list each changed line in `docs/CHANGES.md` under "Lines to bake" with the character, kind, old text and new text.
2. New moves need a spoken line each (`data/lines.js`). They will be silent until Tom bakes.
3. Nara never speaks words; her lines are barks, whines and sniffs (sound-effect clips).
4. Any new Boppy line: his voice direction always includes a thick New York accent.
5. Do not build voice bakers or ask Tom to bake. He decided (25 Oct 2026) to do all voice files himself once every ability update is complete.
6. Exception (2026-10-28, Tom asked for the Deedee and Aunt Ellie recast): `tools/voice-recast/` holds that baker (`build.js`, `template.html`, `dialogue-lines.json`), its mocked test (`test_baker.py`) and `merge-voice.js`. Build: `node tools/voice-recast/build.js out.html`. Merge each voice separately from Tom's `recast.json`: `node tools/voice-recast/merge-voice.js recast.json data out1 deedee`, copy `out1/data` over `data`, then the same with `ellie` into `out2`, copy over, run smoke, commit, push. Edit the briefs and directions in `build.js`, never in the page.
