# Sound Library (queued load item, added 2026-11-03)

Status: queued in claude/build-plan.md (session SL). Starts only when Tom names it. Runs after the Art Library UX rebuild (claude/art-library-ux.md).

## Why
Every sound effect in the game is a synthesizer recipe (tones and noise bursts the phone makes on the spot), not an audio file. There is no page to hear them, see where they are used, or swap one. Shared effects (thud, whoosh, hitEnemy, ding) are used in dozens of places, so one tweak changes many moves. Tom asked on 2026-11-03 whether sound effects have a home: they do not.

## Facts (checked 2026-11-03)
| What | Where | Count |
|---|---|---|
| Named effects | `sfx` object in engine/audio.js, plus `Object.assign(sfx,{...})` blocks in the per-character move files (justin, boppy, tnb, grace, amy, deedee, nara and others) | about 126 |
| Call sites | `sfx.<name>()` across engine/ and data/ | about 3,000 |
| Most used | whoosh 283, ding 238, thud 224, select 187, bonk 154, levelChime 143, charge 130 | |
| Sibling pages that set the pattern | music.html (Music Library), voices.html (Voice Library), art.html (Art Library) | |

## Build spec (recommendation)
One page, sfx.html, in the same shape as music.html, plus a small generated index.
| Part | What |
|---|---|
| Index | `node tools/sound-library/make-index.js` scans engine/ and data/ for every `sfx.<name>` definition and call site and writes data/sfx-index.json: name, file it is defined in, group (battle hit, battle move, menu, overworld, character, boss), use count, the moves and scenes that call it (by move id or scene id where the file makes that clear) |
| List | Groups as tabs, one collapsed row per effect: name, group, use count, PLAY button (runs the real recipe through engine/audio.js so it sounds exactly as in the game), tap to expand |
| Expanded row | Where used (list), Keep / Tweak / Replace buttons, a note box; Tweak and Replace need a note. Decisions save to data/sfx-index.json through GitHub with the same token flow art.html uses |
| Replace | Lets a recorded or generated audio file stand in for the recipe: the row takes an uploaded .mp3 or .m4a, stores it under sfx/raw/<name>.<ext> on GitHub, and the game plays the file when `sfx.<name>` has a file (engine/audio.js checks data/sfx-index.json once at load). Recipe stays as the fallback |
| Filters | Status strip: All, Keep, Tweak, Replace, Undecided. Search by name |
| Phone | Portrait and landscape, same CSS as music.html |

Not in scope: writing new recipes, generating audio, or changing any call site. Those are later tasks that read the notes Tom leaves here.

## Tests
`node tools/sound-library/make-index.js` then a `tools/sound-library/test.py` that checks every `sfx.<name>` call has a definition and every definition appears in the index; `python3 tools/tag_check.py`; open sfx.html in portrait and landscape and look at tools/shots/. Bump `?v=` tags, CHANGES entry.
