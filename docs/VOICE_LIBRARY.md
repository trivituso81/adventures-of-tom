# Voice Library (browse and re-record any line on the phone)

Built 2026-10-31 at Tom's request ("a way to navigate and filter through all existing sounds and re-record them as I wish").
Title screen > ADMIN > VOICE LIBRARY opens `voices.html` inside the app.

## What Tom can do

| Action | How |
|---|---|
| Find a line | Search box, plus chip rows: Who (every voice), Type (Battle, Dialogue), Chapter (1 to 20, Bonus, No chapter), Show (All lines, No clip yet, Re-recorded on this phone, Built-in clip). Chips in a row widen, rows narrow. Each chip shows its count. |
| Hear it | Play on any row plays what the game plays now (his phone take if he picked one, else the built-in clip). |
| Re-record | Every row IS a text box holding what ElevenLabs reads (words and [directions]); edits save as you type (Undo edits restores). Takes and record opens New take (ElevenLabs, same voice and settings as the game, best of three if a take loops) or Record my voice (speech to speech). Nara uses Sound Effects with a description and length. |
| Choose | The newest take plays in the game on this phone at once. Use on any older take, or on Built into the game, switches. Takes are never lost unless he deletes one. |
| Many at once | Every row has a checkbox; Select all N shown (under the filters) ticks everything the filters show. The bottom bar then reads N selected, Clear, Regenerate N (a new take for each, two at a time; Stop works). |
| Keep for good | Export phone clips shares `local-clips-export.json` (`{clips:[{kind,voice,lineKind,text,mp3,script}]}`). Merge it as the section "Getting phone clips into the repo" below says. |

## How it works

| Piece | File | Notes |
|---|---|---|
| Page | `voices.html` | Loads `data/voice-index.json`. Built-in audio is loaded on first play from the clip file named in the index (one file at a time, into its own table). |
| Index | `data/voice-index.json` | Built by `node tools/voice-library/make-index.js` (run `python3 tools/voice-library/battle-scripts.py` and `python3 tools/voice-library/harvest.py` first). Lines with no clip come from `tools/voice-library/harvest.json` (every line the game can show, collected in headless Chromium with tools/clip-audit/harvest.js); speakers with no cast voice are listed with `nv` (cannot be recorded until a voice is cast); Nara's dialogue is skipped (her bark sound). No audio. One item per battle line (character + words; kinds sharing the words go together) and per dialogue clip (`voice|text`). Fields: t (b/d), v (voice), k (battle kinds), x (text), ty (battle/dialogue type), c (chapters), w (where), f (clip file index), s (script), p/d (Nara prompt, seconds), sp (speaker), fx (gets a merge effect), auto (no hand-written script yet), mv (battle lines only: `[[type, name, with]]`, the ability or combo the clip belongs to, shown as a green or pink chip on the row). |
| Phone clips | IndexedDB `aot-local-clips` (the page keeps only the small fields in memory; audio is read per line) | Row shape: (id `battle|voice|kind|text` or `dialog|voice||text`), plus `takeId`. `engine/local-clips.js` loads them at startup; a phone clip wins over the built-in one. Battle lines write one row per kind that uses the words. |
| Takes | IndexedDB `aot-voice-library` | Every take (line key `b|voice|text` or `d|voice|text`). |
| Script edits | localStorage `aot-vl-scripts` | Per line. Filters: `aot-vl-filters`. Key: `aot-el-key`. |

## Narration boxes (2026-11-03, `narr1`)
A scene box labeled with a place, object or moment ("Little silver door", "Sunday dinner") is narration. Map the label to `narrator` in `DIALOG_CAST.speakers`. The Narrator uses Mr. Washington's voice id (override in make-index.js) and the delivery direction "theatrical storyteller, lively pace" (narr1). Its description in data/dialog-cast.js says the same. Characters (monsters, Whispers, Long coat) get a character voice instead.

## Old voice (recast leftovers, `oldvoice1`, 2026-11-05)
Show > Old voice lists lines of a recast voice that still play the pre-recast audio (Deedee: 80 at the start). Data: `tools/voice-library/old-voice.json` from `node tools/voice-library/old-voice.js <voice> <commit before the recast> <recast ISO time>`; `make-index.js` sets `ov:1` and `recast`. Run old-voice.js once for every future recast. A merged new take clears its line on the next index rebuild; a phone take made after the recast clears it on that device at once.

## Rebuild the index (Claude)

Whenever clips are merged, lines change or scripts are added: `python3 tools/voice-library/battle-scripts.py && python3 tools/voice-library/harvest.py && node tools/voice-library/make-index.js`, bump nothing else (the page fetches the index with no cache), commit.

## Baked directions from ElevenLabs history (`vlib5`)

The key card has "Load the directions used for the baked clips". It reads the account's ElevenLabs history (`GET /v1/history`, 1,000 per page, text only), keeps requests that contain [tags], indexes them by voice id and canonical words (tags stripped, contractions expanded, numbers and Tah Tah spelled out, stretched vowels folded), and for each line takes the newest exact match, else the best LCS match at 85% or more. `retag()` then rebuilds the script on the CURRENT line words: each old tag goes before the line word its next old word matched; matching words keep the old spelling (CAPS). Boppy gets "thick New York accent". Stored in localStorage `aot-vl-hist`; order of use: Tom's edit, history direction, index script. Needs the key to allow History (read).

## Directions (written 2026-11-01, `vdir1`)

Every dialogue line now has a written direction in `tools/voice-library/scripts/directions-20261101.json` (and every battle line whose stock tag did not fit its move has one in `tools/voice-library/battle-overrides.json`). They were written scene by scene with the neighbouring lines as context, not generated from punctuation. To rewrite or add some: build packets (id, voice, speaker, text, scene, previous and next lines) from `data/voice-index.json`, write `{id: script}`, check the spoken words still equal the line text, then run `python3 tools/voice-library/merge-directions.py <workdir> <tag>` followed by the rebuild command above. New lines with no script get a fallback (speaker base plus punctuation and caps cues) and show as "plain direction" until written. The original hand-written chapter scripts (`claude/dialogue-scripts-ch1..10.json` and others in the Project) cannot be copied to disk through the Project tool; ElevenLabs history ("Load the directions used for the baked clips") still shows what the baked clips were actually made from and wins over these on Tom's phone.

## v4 tag rules and how to change a script (2026-11-01, `vtag2`)

Every script in the Library now follows ElevenLabs' "Prompting Eleven v4" guidance as Tom set it: a tag describes the voice only (emotion, delivery, voice quality: [low, gravelly], [flat, patient], [shrill, urgent]); never a gesture, expression, posture, action, prop, place, role or accent word in a script (one exception, below); no sound nouns ([yelp], [beat], [pause], [chime]) and no [sighs] or [laughs]; 1 tag for lines of 4 words or fewer, 2 up to about 14 words, 3 at most beyond; 1 or 2 descriptors of 1 or 2 words per tag; ellipses and CAPS for pacing; the spoken words equal the line text (Tah Tah, spelled-out numbers, stretched vowels and an added ellipsis are the only differences); no em dashes. Deadpan stays deadpan; a monster's rematch lines are more worked up than its first-meeting lines.

Amy joined this exception on 2026-11-12 (`amyaccent1`) with "heavy Long Island accent": her accent came and went because the voice direction alone only reaches the first bracket. The list is the `ACCENT` table in `tools/voice-library/make-index.js`; it sets `accent` on the voice entry, and `accentAll` in `voices.html` shows and sends it in every bracket for any script source (Tom's edit, history, index). To add a character, add one row to `ACCENT` and `ACCENT_HAS` and rebuild the index.

Exception, Boppy and Justin (Tom, 2026-11-01 20:34, changed 21:08 and 21:25): every take for these two carries "thick New York accent" at the start of EVERY [bracket] (the baked takes that kept the accent did exactly that; the first bracket alone did not carry it for Justin). `make-index.js` writes it into every bracket of every Boppy and Justin script, so it shows in the script box (`[thick New York accent, grumbling] ... [thick New York accent, softening] ...`), and the voice direction repeats it (`tools/voice-library/make-index.js`). Boppy's voice direction is `thick New York accent, deep voice` and his similarity is the voice entry's 1.0: at 21:08 I dropped "deep gravelly voice", set similarity 0.75 and removed the 0.9 pitch deepening from the merge tools, and Tom heard him too high at 21:25, so deep voice, 1.0 and the deepening are back (gravelly stays out). `finalText` in `voices.html` adds only direction parts a script lacks, so "deep voice" lands once in the first bracket. To give another character an accent the same way, add them to the lists in the two builders.

Personas (Tom, 21:08). Boppy: sweet, fun-loving, a joker and a complainer; never gruff or gravelly (no "gruff", "gravelly" descriptors; use playful, hearty, complaining, grumbling, wry). Justin: direct and serious, not warm (no "warm", "easy", "fond" descriptors; use direct, level, matter-of-fact, dry), laughing out loud only when the moment is right.

Where scripts live, in the order the index applies them (later wins):

| Layer | File | Notes |
|---|---|---|
| Battle, baked record | `tools/voice-library/battle-scripts.json` | The scripts the baked clips were made with. Never edited. |
| Battle, current | `tools/voice-library/battle-overrides.json` | `"voice\|text": script`. Wins over the record. |
| Dialogue, baked record | `tools/voice-library/scripts/justin-dialogue.json` and the Project chapter scripts | Never edited. |
| Dialogue, current | `tools/voice-library/scripts/directions-20261101.json`, then `scripts/zz-v4-overrides.json` | Files load in name order and the last wins, so `zz-` beats the record. |

To change scripts: write a JSON list of `{t: 'b' or 'd', voice, text, script}` and run `python3 -I tools/voice-library/apply-scripts.py <list.json>` (add `--check` to validate without writing). It rejects any script that breaks the rules (words differ, too many tags, too many descriptors, body, prop or sound words, em dash), then writes into the current-layer files above. Follow with `python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js`. Baked audio never changes: a line only sounds new after Tom records a new take.

## Getting phone clips into the repo (Claude)

The clips live only on Tom's phone until merged. Merge with `node tools/voice-library/merge-local.js <export.json> data <outdir>`: dialogue clips go into the right `data/voice/dialog-ch<N>.js`, battle clips into `data/voice/<id>.js` (silence trim and speaker effects as `tools/clip-audit/merge.py` does; Boppy is deepened with rubberband pitch 0.9, which the phone page does NOT do). Copy `<outdir>/data` over `data`, bump the `?v=` of each changed voice file, rebuild the index, run `python3 tools/clip-audit/unused_voice.py`, push. Filter the export first (method in claude/next.md, `gclips7`). The merge also writes `data/merged-takes.json` (fingerprints of every clip it processed, first 16 hex of SHA-1 of the export's mp3 text); copying `<outdir>/data` over `data` carries it. The page's Show > Not in game yet filter compares each phone clip's fingerprint with that list, so filter stale clips out of the export BEFORE the run: they stay listed as not in game, which is correct. Phone clips are raw ElevenLabs output: no silence trim, no Boppy deepening.

A line is baked from the Library like any other: find it with the "No clip yet" filter, make a take, Use it. There is no separate bake list (the Bake Voices page was removed 2026-11-02). New lines reach the Library through `data/lines.js`, scenes and dialogue (`tools/voice-library/harvest.js` reads the known sources) and `tools/voice-library/battle-scripts.json` or `battle-overrides.json` for their scripts.

## Comedy directions (2026-11-09, `npcvoice1`)

How a dry or funny line is directed, on top of the v4 tag rules above (source list in the Project doc `claude/npc-voice-audit-11-09.md`):

| Rule | Why |
|---|---|
| The punchline gets its own tag, placed right before it | ElevenLabs: a tag steers what follows it; one tag per beat is easier for the model than several stacked |
| Underplay it in the character's own way (arch, grave, sincere, serene, offhand, flat, deadpan), not one stock word for everyone | ElevenLabs: tags must suit the voice; a bubbly voice told to be deadpan either ignores it or loses its character |
| One CAPS word per line, on the word that carries the stress | CAPS adds emphasis; more than one reads as shouting |
| An ellipsis before the turn | v4 and v3 have no break tags; an ellipsis is the documented pause |
| Fewer tags on short lines | Short inputs are the least stable; every extra tag adds risk |
| Never a tag the words do not support | A direction the line cannot carry sounds forced |

## Rewriting directions of baked lines (`npcvoice2`)

The row shows, in order: Tom's edit on the phone, the direction from his ElevenLabs history (what the baked clip was made with), then the written one. So a rewritten direction for a baked line is invisible on his phone unless the line's key is added to `tools/voice-library/rewritten.json` (`voice|text`, quotes straightened), which sets `rw` in the index. Do this for every batch of rewritten directions, and test the page with a seeded `aot-vl-hist` entry, not a fresh browser.

## Limits

- Phone takes are raw ElevenLabs output: no silence trim, no merge effects (Boppy deepening, Grace shrink, monster and walk-on filters). The card says so for voices that get one; Claude applies them when merging an export.
- Chapters 11 to 20 have no dialogue clips yet: their lines show under No clip yet. 323 lines belong to characters with no voice cast (Vance, Marlowe, the Part 2 monsters); they are listed but cannot be recorded until Claude casts a voice.
- The words cannot be edited here (a changed word silences the line in the game). Word changes go through the desktop Voice Baker v2 or a request to Claude.
- ElevenLabs allows 30 custom voices and Tom's account is full (2026-11-02). A recast must delete the voice it replaces first. Deedee: `recast-deedee.html` (`tools/voice-recast/build-deedee.js`).
