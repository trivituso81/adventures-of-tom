# next-addendum-upload1 (2026-11-09 ~17:10; upload1 at 1e72c1b, walksheets1 at bbeb5ca; CHANGES "upload1" and "walksheets1"; no game tag)

Read this together with claude/next.md. It is not yet merged into next.md (Project docs have no partial edit; next.md is 40 KB and another session was active).

## What was built
- Tom asked for each character's walk, battle stance 1 and battle stance 2 to be either generated or his own uploaded image, and said every picture is fine too. Choice made: ALL Art Library entries get an UPLOAD MY OWN button beside GENERATE (`uploadOwn` in art.html).
- Flow: file picked, re-saved as a real PNG (long side capped at 4096 px), stored in the phone's IndexedDB as the next result (`up:true`, chip "my upload"), then the normal tap, APPROVE or REJECT. APPROVE commits `art/raw/<tab>/<id>-vK.png` exactly like a generated picture, so bakers and installs see no difference. The entry's prompt is kept (APPROVE does not wipe it). No xAI key, no spend, works on blocked entries.
- Not checked by the Library: grid layout. A walk or battle sheet upload must match the generated layout (walk 3 x 3, battle stance entries use their own grid, see each entry's title) or the bakers will cut wrong cells. Judge an uploaded sheet against the bake requirements before installing.

## walksheets1 (17:10): the walking sheets were missing
- Tom 16:54: "i dont think i see the 3 walking sheet for Tom or others". Correct: only `jojo-walk-sheet` had an entry. Painted walk sheets for the others were sent to Claude as files (`art/raw/characters/<id>-walk-sheet-v1.png`), so there was no Generate or Upload for them.
- Added `<id>-walking-sheet` entries (3 x 3, ar 1:1, refs = hero-ref + current walk sheet) for tom, tnb, grace, rose, amy, justin, deedee, boppy, olivia, michael, placed above each person's battle stance entries. Module `tools/art-library/walk-sheet-prompts.js` (listed in make-prompts.js; never run make-prompts.js on the real json, spliced as text). Id is `-walking-sheet` so approvals save `<id>-walking-sheet-vN.png` and never overwrite the painted original.
- Not added: Ellie and Nara walks (not in the stance list either). Add if Tom asks (Nara needs dog wording, see `naraSheet1` in battle-stance-prompts.js).
- INSTALL IS A SEPARATE STEP: nothing reads `-walking-sheet-vN.png` yet. When Tom approves or uploads one and asks for it in game, rebake that character's walk from the approved file (`tools/sprite-bake/bake_<id>_walk*.py`, rebake with no change first, byte for byte; painted frames are used as painted; ask Tom first because the look may change), tags, smoke.

## Tests
- `python3 tools/art-library/upload_test.py` (ports 8831, 8832): every entry has the button; upload on `tom-walking-sheet` and a blocked entry; PNG at original size; approve commits one PNG and keeps the prompt; FAILS: []. `review_test.py` FAILS: [], `validate.js` OK (708 entries).
- NOT tested: the real iOS photo picker (HEIC converts through createImageBitmap in Safari; if it fails the message says try PNG or JPG).

## Waiting on Tom
- Phone check: Art Library, Characters, Tom, Tom walking sheet, UPLOAD MY OWN (or GENERATE), tap the result, APPROVE. Then ask whether to install it.
- If the upload fails on iPhone: check `uploadOwn` error text in the entry's message line (createImageBitmap on HEIC is the likely cause; fallback is an `<img>` decode via object URL).
