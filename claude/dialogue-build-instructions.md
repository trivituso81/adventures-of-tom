# Dialogue rewrite: build instructions (2026-11-12, tag `dialogclear1`)

Tom's decision (2026-11-12 19:08): the storyline must tie together through dialogue, heavier-handed is fine, humor and personality stay, and he is fine re-recording lines. He asked for one final comprehensive set and these instructions. He will not review line by line. Do not send him the list again and do not ask him what a line means.

## Inputs
| File | What it is |
|---|---|
| `claude/dialogue-clarity-rewrite.json` | The final set: 329 rows. 288 `replace`, 41 `insert_after`. Fields: id, chapter, scene, file, speaker, kind, old, after, new, inferred, thread, contraction, voiced. |
| `claude/dialogue-clarity-rewrite.md` | The same set as tables by chapter, plus the story it now tells. |
| claude.ai artifact "Dialogue rewrite: before and after" | Tom's reading copy (script view). Not the game. |

## The story the lines now tell (canon from this change)
Add these, one dated line each, to `claude/canon-addendum.md` and `docs/CANON.md`. They replace the "coins are a trail, he needed Tom to open Gate Zero" reading in `claude/part2-map.md`.
1. A gold clock coin can hold one warm moment still for as long as something lonely is willing to hold it.
2. Every Part 1 boss from chapter 2 to 10 is one of Julian Vance's tries to stop a piece of Long Island or Los Angeles. He gave each a coin and a promise that nobody ever has to leave. Each boss says so. The chapter 2 smog was his first try (he plugged the Big Shake's vents; no coin).
3. Kindness breaks it: the coin only works on something lonely, so it lets go when the family befriends the holder. That is why Tom finds a coin after each boss.
4. Chapter 1 seed: Boppy met a man in a long coat at the pond who asked how long the Big One had been alone. The same man later sells Boppy the Warden deal.
5. The Moon Club invitation (chapter 9) was written by Vance to keep Tom, Deedee and Boppy dancing forever.
6. After eight failed tries he sends for Tom himself (boarding pass, layover).
7. The coins came out of the Gate Zero clock; putting them back gives the time back.
8. Chapter 11: TNB got his own gold boarding pass; Vance slips away during the FINAL CALL fight.
9. Amber (chapter 12): when Marlowe takes the color and sound out of a place, the warmth of the moment has nowhere to go and sets hard around people. It is warm to the touch, cannot be cracked, and melts when someone brings warmth the person loves. The family learns this at Mr. Washington, proves it at Doña Carmen's and the Alvarez house, and Tom says they will use it for Deedee.
10. The Unread was checked out in 1952 by a man in a long coat who never read it. His age is left unexplained on purpose.

## Phase 1: put the lines in the game (one Claude session, no Tom input needed)
1. Clone main, read CLAUDE.md, then the json.
2. Apply every row.
   - `replace`: find the line by scene plus exact `old` text and swap in `new`.
   - `insert_after`: add the new line right after the line whose text is `after`. Same speaker: add a string to that `lines` array. Different speaker: add a new `{talk:'<speaker>',lines:[...]}` step. Several rows can share one `after`; keep json order.
   - Keep each file's quote style: `data/scenes.js` uses straight apostrophes escaped as `\'`; the Part 2 files use curly apostrophes. The json uses straight ones.
   - The `scene.N` ids are extraction order, not a code index. Rows labelled ch3End, ch6End, ch7End, ch8End, ch9End that carry a later chapter number are loss-recovery or puzzle lines stored after that scene in `data/scenes.js`.
   - Where an old line exists twice (kind and not-kind boss endings; `ch11Stby` and `ch11StbyAfter`), change both.
   - A few `old` strings are built from template pieces in the source; if an exact match fails, open the scene and edit by hand. Never drop a row silently: list any row that could not be applied.
3. Check staging for the 41 new lines: the speaker must be in the scene at that moment and facing sensibly. The new boss lines sit inside each boss's existing pre-fight speech. Boppy's new chapter 1 line is at the dinner table. The four new lines in `part2Open` are Tom and Boppy at the Rivituso house. The chapter 12 amber lines at Mr. Washington need him visible on screen (use `{cam}`) and TNB next to him for the touch line.
4. New lines need no new speakers (Tom, Grace, Amy, TNB, Boppy, Deedee, Julian Vance, and the bosses, who all already speak). Confirm each has a talk face and a voice in `data/dialog-cast.js`.
5. Text fit: look at the ten longest new pages in the dialogue box, portrait and landscape (chapter 16 narration 259 characters, chapter 10 coin recap, the Unread's new line, TNB's chapter 11 arrival). Split a page in two at a sentence break if it overflows; do not shorten the wording.
6. Emotion tags key on line text: update `docs/emotion-index-lines.tsv`, `docs/npc-emotion-lines.tsv` and `docs/emotion-reactions.tsv` rows for reworded lines, regenerate, run `tools/reaction-index.py --check`.
7. Voice housekeeping (this is where 281 recorded clips stop matching):
   - Run `python3 tools/clip-audit/unused_voice.py`. The clips for the old wording are now unused. Purge them per the No unused voice rule (`node tools/clip-audit/purge_unused.js <spec> --apply`), record in `docs/PURGED_VOICE.md`.
   - Rebuild the Voice Library index: `python3 tools/voice-library/battle-scripts.py && python3 tools/voice-library/harvest.py && node tools/voice-library/make-index.js`.
   - Write voice directions for the new and reworded lines the same way existing lines have them (docs/VOICE_LIBRARY.md "Directions" and "Comedy directions"). Boppy: thick New York accent. Amy, Deedee: Long Island accents. Grace: Ivy. Vance, HUSH-9, the Archivist and the Censor stay formal with no contractions.
   - `docs/CHANGES.md`: entry `dialogclear1` with a "Lines to bake" table (speaker, chapter, old, new) generated from the json.
8. Tests: `node --check` on every edited file; `python3 tools/smoke.py` (FAILS []); play chapters 2, 5, 9, 10 and 11 from the chapter-select jump through the boss and the after-boss scene; `tools/scene_stage_audit.py` on the edited scenes. Bump tags, fetch, rebase, push.
9. Tell Tom, in one table: lines now waiting for a recording, per voice and per chapter.

## Phase 2: Tom records (Tom, on his phone)
| Step | Where |
|---|---|
| Open ADMIN > VOICE LIBRARY | In the game |
| Tap Show: "No clip yet" | Every reworded or new line appears here; until recorded, it is silent in the game |
| Narrow with the Who chip (one voice at a time) or the Chapter chip | Largest sets: Tom about 106 lines, TNB 33, Amy 32, Boppy 23, Grace 14, Deedee 12 |
| Make a take, then Use it | Same as any other line |
| When done (or at any stopping point): Export phone clips | Sends `local-clips-export.json`; drop that file into a Claude conversation |

Fact: the game keeps playing his phone's own recordings straight away on his phone. The export and merge only matter for other devices and for a cleared browser.

## Phase 3: when Tom sends the export file (one Claude session)
1. `node tools/voice-library/merge-local.js <export.json> data <outdir>`, copy `<outdir>/data` over `data`. Do not filter the export.
2. `node tools/voice-library/make-index.js`; `python3 tools/clip-audit/unused_voice.py` must show 0 on all checks.
3. Count what is still under "No clip yet" for dialogue and report it to Tom per voice. If the export came in parts, repeat for each part.
4. Bump tags (the changed `data/voice/dialog-ch*.js`, `data/dialog-cast.js`, the stamp in `engine/main.js`), smoke, push.
5. Never print a voice file line. Sanity one-liners are in claude/next.md, section gclips8.

## Not covered by this set
| Item | Status |
|---|---|
| Nine Scoops (bonus chapter) | Not reviewed |
| Town NPC chatter in `data/maps-*.js` | Not reviewed. A good follow-up: one townsperson per chapter mentions a man in a long coat. |
| Battle barks in `data/lines.js` | Not reviewed |
| Grace's chapter 7 after-a-loss tip ("Mystery, Chatter. Adventure, Kinetic.") | Unclear; check the Unread's chapter rule in `data/battle2-data.js` and reword in the same session |
| Stale "still being built" toasts after chapters 1, 7, 8, 11 to 19 | Already listed in claude/next.md (part2flow1) |
| claude/next.md | NOT updated by the session that wrote this file. The build session must merge a `dialogclear1` section into it. |
