# react1 (2026-11-12, main ce39a95): listener reactions tagged on every dialogue line. TAGGED, NOT WIRED

- Tom 08:08: "currently, emotion states are just flagged on a character based on their dialogue lines. i also want every other character in the conversation, whether it's Tom when talking to NPCs, or group conversations in cut scenes. inventory every possible scenario and tag other characters who should have a reaction for a given dialogue"
- Done (docs and one tool, no game file, no tag, nothing to phone-check): `docs/emotion-reactions.tsv`, 9,852 reactions on 3,094 lines, one row per line and listener (kind, chapter, file, where, speaker, text, listener, mood). Readable copy `docs/REACTION_INDEX.md` (too big for the Project). Check and rebuild: `python3 tools/reaction-index.py` (`--check` for check only).
- Full inventory, rules and wiring plan: docs/EMOTIONS.md, section "Listener reactions".

## Scenario inventory (fact)

| # | Scenario | Lines | Tagged |
|---|---|---|---|
| 1 | Story scenes ch 1 to 20 and Nine Scoops (cast, townsfolk, monsters, narration boxes) | 2,338 | 2,319 |
| 2 | Map talk with a person | 373 | 373 |
| 3 | Recruit ask, yes, no, swap, follower chatter | 46 | 46 |
| 4 | Penny and Nickel shop lines | 66 | 66 |
| 5 | Cab drivers Sal and Sol | 36 | 36 |
| 6 | Airport trips (goodbyes, who stays, arrivals, welcome home) | 220 | 166 (the other 54 are Tom alone) |
| 7 | Ch 19 memories and keepsakes, ch 20 doors | 59 | 59 |
| 8 | Aunt Ellie's bets | 29 | 29 |

Not tagged: 30 lines whose text is built at runtime (ch6 dig, ch7 card, ch8 pilot, ch9 mirror, ch10 hand, ch17 smash, ch19 "set down", ch20 door questions and wrong answers, 2 Tom lines via `ch16Say`); 161 monster map lines in chapters 1 to 20; signs and objects; battle lines. Mr. Pistachio has no emotion sheet (7 tags dropped).

## How it was tagged (fact)

- Scenarios 1 to 5: line by line, read in scene order. Scenarios 6 to 8: by rule (who speaks to whom) plus single-line corrections.
- Totals by mood: happy 3,347, surprised 1,393, unimpressed 1,307, loving 1,181, proud 915, scared 730, sad 635, angry 344. By listener: Tom 2,441, Grace 1,694, Rose 1,604, TNB 1,314, Amy 1,103, Nara 692, Deedee 387, Boppy 380, then 27 others.
- Listener ids are pose ids (tom, grace, washington, pruitt ...). A tag on someone absent is harmless: wiring only poses visible actors.
- 20 speaker and text pairs give a listener different moods in two places: wiring must key those by scene (`where`).
- First pass. It is generous: nearly every line has a reaction for nearly everyone present.

## Next (recommended, waiting on Tom's go)

Wire the chapter 1 pilot: `tools/reaction-apply.py` builds `data/emotion-reactions.js`; `emoApply` in engine/emotions.js gives each visible listener `scenePose={f:'em_'+mood,mid:id,emo:true}` and `emoClear` clears all of them (today `EMO.actor` is a single actor: make it a list). Skip listeners with a story pose, Rose riding, hidden actors. Townsfolk listeners use `<id>emo` in data/npc-poses.js. Look at ch1 opening, theft and pond scenes in portrait and landscape. If the screen looks busy, thin the tsv (drop plain "happy" rows first), not the engine. Then ask Tom one line and roll out in the same batches as the speaker moods.

How the working files were made (if a re-extract is needed): acorn over data/scenes*.js and bonus-nine-scoops.js for every `{talk:..,lines:[..]}` step grouped by `SCENES.<id>`; map rows from docs/npc-emotion-lines.tsv (where not starting with "scene"); tables `CH19_MEM`, `CH19_KEEP`, `CH20_DOORS`, `DEPARTURES`, `TRAVEL_POOLS`, `ARRIVALS`, `ELLIE_BETS` evaluated from source. The scripts were scratch and are not in the repo.
