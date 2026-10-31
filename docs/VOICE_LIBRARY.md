# Voice Library (browse and re-record any line on the phone)

Built 2026-10-31 at Tom's request ("a way to navigate and filter through all existing sounds and re-record them as I wish").
Title screen > ADMIN > VOICE LIBRARY opens `voices.html` inside the app.

## What Tom can do

| Action | How |
|---|---|
| Find a line | Search box, plus chip rows: Who (every voice), Type (Battle, Dialogue), Chapter (1 to 20, Bonus, No chapter), Show (All lines, No clip yet, Re-recorded on this phone, Built-in clip). Chips in a row widen, rows narrow. Each chip shows its count. |
| Hear it | Play on any row plays what the game plays now (his phone take if he picked one, else the built-in clip). |
| Re-record | Tap the line: edit the direction (brackets), then New take (ElevenLabs, same voice and settings as the game, best of three if a take loops) or Record my voice (speech to speech). Nara uses Sound Effects with a description and length. |
| Choose | The newest take plays in the game on this phone at once. Use on any older take, or on Built into the game, switches. Takes are never lost unless he deletes one. |
| Many at once | Every row has a checkbox; Select all N shown (under the filters) ticks everything the filters show. The bottom bar then reads N selected, Clear, Regenerate N (a new take for each, two at a time; Stop works). |
| Keep for good | Export phone clips shares `local-clips-export.json` (same format as the Bake page). Merge it as `docs/BAKE_PAGE.md` says. |

## How it works

| Piece | File | Notes |
|---|---|---|
| Page | `voices.html` | Loads `data/voice-index.json`. Built-in audio is loaded on first play from the clip file named in the index (one file at a time, into its own table). |
| Index | `data/voice-index.json` | Built by `node tools/voice-library/make-index.js` (run `python3 tools/voice-library/battle-scripts.py` and `python3 tools/voice-library/harvest.py` first). Lines with no clip come from `tools/voice-library/harvest.json` (every line the game can show, collected in headless Chromium with tools/clip-audit/harvest.js); speakers with no cast voice are listed with `nv` (cannot be recorded until a voice is cast); Nara's dialogue is skipped (her bark sound). No audio. One item per battle line (character + words; kinds sharing the words go together) and per dialogue clip (`voice|text`). Fields: t (b/d), v (voice), k (battle kinds), x (text), ty (battle/dialogue type), c (chapters), w (where), f (clip file index), s (script), p/d (Nara prompt, seconds), sp (speaker), fx (gets a merge effect), auto (no hand-written script yet). |
| Phone clips | IndexedDB `aot-local-clips` | Same store and row shape as `bake.html` (id `battle|voice|kind|text` or `dialog|voice||text`), plus `takeId`. `engine/local-clips.js` loads them at startup; a phone clip wins over the built-in one. Battle lines write one row per kind that uses the words. |
| Takes | IndexedDB `aot-voice-library` | Every take (line key `b|voice|text` or `d|voice|text`). |
| Script edits | localStorage `aot-vl-scripts` | Per line. Filters: `aot-vl-filters`. Key: `aot-el-key` (shared with the Bake page). |

## Rebuild the index (Claude)

Whenever clips are merged, lines change or scripts are added: `python3 tools/voice-library/battle-scripts.py && python3 tools/voice-library/harvest.py && node tools/voice-library/make-index.js`, bump nothing else (the page fetches the index with no cache), commit.

## Open item

Dialogue scripts: only battle lines have hand-written directions in the index so far. The Project holds the hand-written dialogue scripts (`claude/dialogue-scripts-ch1..10.json`, `-ch21`, `-arrivals`, `-boppy`, `-deedee`, `-amy-rewrite`, `-scene-lines`, `-boomie`; format `{chapter, lines:[{voice,speaker,text,ctx,script}]}`). Copy them into `tools/voice-library/scripts/` and rebuild: make-index matches them by voice and text (contraction-tolerant matching still to add, see `tools/clip-audit/keepscript.py`; the rule is always rebuild the words from the current line text, keep the tags). Until then dialogue lines start from a plain direction and say so on the card.

## Limits

- Phone takes are raw ElevenLabs output: no silence trim, no merge effects (Boppy deepening, Grace shrink, monster and walk-on filters). The card says so for voices that get one; Claude applies them when merging an export.
- Chapters 11 to 20 have no dialogue clips yet: their lines show under No clip yet. 323 lines belong to characters with no voice cast (Vance, Marlowe, the Part 2 monsters); they are listed but cannot be recorded until Claude casts a voice.
- The words cannot be edited here (a changed word silences the line in the game). Word changes go through the desktop Voice Baker v2 or a request to Claude.
