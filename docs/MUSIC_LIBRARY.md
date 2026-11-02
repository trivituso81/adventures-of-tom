# Music Library (build spec, written 2026-11-02; NOT built yet)

Tom (11-02 12:32): "make a file called music library, same as voice library with filters etc. it's for all the music in the game. add it to the build instructions once the art library is done."

Status: spec only. Build order: after the Art Library (Phase B5 pushed), before Phase C art regeneration. One session, one push. Everything below is a call made for the build; Tom changes nothing by hand.

## 1. What Tom gets

Title screen > ADMIN > MUSIC LIBRARY opens `music.html` inside the app (fifth entry, after ART LIBRARY). Every track the game plays is one row. Tom finds a track, hears it, edits its prompt, makes a new take with ElevenLabs Music, and the newest take plays in the game on his phone at once. Export sends the takes to Claude, who merges them into the repo.

| Action | How (mirrors the Voice Library) |
|---|---|
| Find a track | Search box, plus chip rows: Group (Core, Long Island, Los Angeles, Nine Scoops), Kind (Loop, Jingle), Use (Area, Boss room, Battle, Title, Jingle), Show (All, No take on this phone, Re-made on this phone, Built-in track). Each chip shows its count. |
| Hear it | Play on any row plays what the game plays now (his phone take if he picked one, else the built-in mp3). Loop test plays the last 10 s crossfading into the first 10 s, the way the game loops it. |
| Re-make | Every row IS a text box holding the prompt ElevenLabs reads; the fixed style suffix (loop or jingle wording) shows greyed below it and is added at send time. Length in seconds is a small field (loops 60, 75 or 90; jingles 4 to 12). Takes and make opens New take. |
| Choose | The newest take plays in the game on this phone at once. Use on any older take, or on Built into the game, switches. Takes are never lost unless he deletes one. |
| Many at once | Checkbox per row, Select all N shown, bottom bar N selected, Clear, Remake N (two at a time, Stop works). Before any remake the page shows the credit estimate (about 11 to 14 ElevenLabs credits per second of music, so a 60 s loop is roughly 700 to 850) and asks once. |
| Keep for good | Export music takes shares `local-music-export.json` (`{tracks:[{id,mp3,prompt,len,model,dur}]}`). Claude merges it (section 4). |

Rules carried over: the key (localStorage `aot-el-key`, the same one the Voice Library uses) is never in the repo or a log; the page shows "key set" or "no key". The track id and where it plays cannot be edited on the page (ids are wired into `MC_TRACKS` and the map tables).

## 2. The tracks (38 today, music/<id>.mp3)

| Group | Loops | Jingles |
|---|---|---|
| Core | title (30 s), battle (75 s), boss (90 s) | victory, defeat, levelup |
| Long Island | town, row, hollow, pier, reeds, sundial, schoolyard, school, cafetorium, stacks, readroom, moonclub, dome, terminal, gatezero (75 s) | |
| Los Angeles | blvd, jpark, griffith, studio, backlot, stage7, stageset, oakpark, oak, crown, carbarn, boiler | |
| Nine Scoops | ns_party, ns_hunt, ns_frozen, ns_boss (90 s) | ns_win |

Where each plays is decided in `engine/music-clips.js`: `clipWanted()` (title, battle, boss, jingles) and `mcAreaTrack()` (a map id that matches a track id, else the house's area; Nine Scoops by `mcNsArea()`). Prompts: the 31 originals are in the Project file `claude/music-scripts.json` (prompt, group, name, kind, len, where, and the two style suffixes). The 7 later tracks (title, ns_*, levelup) have no prompt on file: the build writes one each from the track's job, marked `auto` until Tom edits it.

## 3. How it is built

| Piece | File | Notes |
|---|---|---|
| Page | `music.html` next to `voices.html` | Same shell, filters, key card, take list and bottom bar as the Voice Library; copy the structure, do not share code. |
| Track list | `tools/music-library/tracks.json` | One entry per track: id, group, name, kind, len, where, prompt, auto. Claude edits prompts here, never on the page; the page edits text in place on the phone (localStorage `aot-ml-prompts`). Seeded from `claude/music-scripts.json` plus the 7 new entries. |
| Index | `data/music-index.json` | `node tools/music-library/make-index.js` joins tracks.json with `music/manifest.json` (real duration, bytes) and `MC_TRACKS`. Fetched with no cache, so no `?v=`. |
| Phone takes | IndexedDB `aot-music-library` | Every take: id, trackId, mp3 (blob), prompt sent, len, model, date, use flag. |
| Game hook | `engine/music-clips.js` `mcFetch(id)` | Before fetching `music/<id>.mp3` it asks IndexedDB for the take marked Use for that id (a small `engine/local-music.js`, the twin of `engine/local-clips.js`, loaded after music-clips.js). A phone take plays raw: no loudness match, no silence trim, so it may sit louder or softer than the built-in tracks until merged. The card says so. |
| ADMIN entry | `engine/splash.js` `SPLASH_MODES.admin` | DEMO, VOICE LIBRARY, ART LIBRARY, MUSIC LIBRARY, BATTLE LAB, BACK. |
| ElevenLabs | `POST https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128`, body `{prompt, music_length_ms, model_id, force_instrumental:true}` | The same call the desktop music baker used (claude/music-baker-template.html, `makeMusic`); its error hints (403 = key lacks Music permission, quota, 401) carry over. A loop that comes back shorter than asked is kept and flagged. |
| Stub and test | `tools/music-library/stub.py`, `tools/music-library/test.py` | Playwright against the stub (fake /v1/music returns a 3 s mp3; no real key). Checks: index loads, every chip count adds up, a take is made and Used, the game's `mcFetch` picks the Used take, Export produces the file, both orientations screenshotted. smoke must stay green. |

Tags on the push: `music.html` is a page (always from the network); `music-clips.js`, `local-music.js`, `splash.js`, `main.js` move their `?v=`; the stamp is `build music1`.

## 4. Getting phone takes into the repo (Claude)

`python3 -I tools/music-library/merge-local.py <export.json> music` (the Project's `claude/music-merge.py` moved into the repo and pointed at the export shape): two-pass loudnorm to -20 LUFS and -1.5 dBTP, leading silence over 0.12 s trimmed, trailing silence trimmed on jingles only, 96 kbps stereo 44.1 kHz, writes `music/<id>.mp3` and updates `music/manifest.json`; then `node tools/music-library/make-index.js` rewrites `MC_TRACKS` in `engine/music-clips.js` (kind and real seconds) and the index. The mp3 files carry no `?v=` (the service worker asks the server about them), so only `music-clips.js` needs its tag moved. Listen to the loop seam of every merged loop before pushing (`tools/music-library/seam.py <id>` writes a 20 s wav of tail into head).

## 5. Not in scope

Per-battle or per-boss unique tracks, dynamic layers, and new track ids need a map or engine change first (ask Tom, then add the id to `MC_TRACKS` and tracks.json in the same push). The synth fallback in `engine/music.js` stays as it is.
