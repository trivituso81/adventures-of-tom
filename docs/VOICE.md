# Voice

## What is and is not in this repo

The live game has about 170 MB of baked ElevenLabs audio, stored as base64 inside JavaScript files. This repo holds only an **older partial snapshot** of the per-character files (`data/voice-clips.js`, `data/voice/<character>.js`, from before v252). Newer lines, and all dialogue-box clips (`data/voice/dialog-ch*.js`), are missing, so those lines are silent here. In a fresh checkout without any voice files, these stubs would make the game boot silent:

- `data/voice-clips.js` is `const VOICE_CLIPS={clips:{}};`
- `data/voice/<tom|grace|rose|amy|deedee|boppy|tnb>.js` are empty files.
- The ten chapter dialogue files `data/voice/dialog-ch1.js` to `dialog-ch10.js` are simply absent. `engine/dialog-voice.js` loads them after startup and skips a missing file quietly.

**Never replace, regenerate or hand-edit the voice files, and never add new audio,** unless Tom sends a `voices.json` and asks for a merge. The live audio stays in the claude.ai artifact.

## How a spoken line works

- Battle and overworld barks: `data/lines.js` has `LINES` keyed by character and kind (a move key, `hurt`, `low`, `ko`, `win`, `special`). `say(id, kind)` picks a line, plays a baked clip if one matches, else falls back (browser speech synthesis in `engine/speech.js`, or silence for Nara and dialogue).
- Dialogue boxes: `data/dialog-cast.js` maps a speaker name to a voice; `engine/dialog-voice.js` plays the clip for the speaker and exact page text. Unbaked pages stay silent.
- **A clip plays only when its text exactly matches the line.** Rewording a line, even a comma, silences it until it is re-baked. Count of dialogue clips in the live game: 1903.
- The 3x5 on-screen font cannot show some characters, but spoken text can. Scripts for voice baking spell "Ta-Ta" as "Tah Tah" and numbers as words.

## Rules for you

1. Avoid rewording existing spoken lines unless asked. If you must, list each changed line in `docs/CHANGES.md` under "Lines to bake" with the character, kind, old text and new text.
2. New moves need a spoken line each (`data/lines.js`). They will be silent until Tom bakes.
3. Nara never speaks words; her lines are barks, whines and sniffs (sound-effect clips).
4. Any new Boppy line: his voice direction always includes a thick New York accent.
5. Do not build voice bakers or ask Tom to bake. He decided (25 Oct 2026) to do all voice files himself once every ability update is complete.
