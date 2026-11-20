# calib3 build (2026-11-18 14:55 PT, main aaf6e27, build label calib3): 16 takes merged, 10 subtitles follow the voice, the scene 2b draft was NOT used, stop-loss on tag redrafting is back

Read with claude/next-addendum-calib3.md (rules 10 to 20, the tag bank per voice) and claude/next-addendum-calib2.md (merge procedure). This page wins over calib3.md in four places: its Status table, its scene 2b draft, its subtitle list and its "Next build session" list are all finished or replaced by what is below. Repo entry: `## calib3` in docs/CHANGES.md.

## What happened
Tom's prompt said the scene 2b draft was approved to go into the Voice Library. His export showed he had already tuned those same 12 lines by ear (41 takes, 22:14 to 22:28 UTC, starting from the older drafts that were in the Library since ch1rebuild1), one minute before he sent the prompt. Decision made in the build: his kept takes are the record (calib1 rule: a kept script is never retyped or overwritten), so the 12 calib3 draft scripts were not written. Tom was told.

## Done and pushed
| Item | Result |
|---|---|
| Pending export (made 22:29:02Z, 16 clips) | Merged into data/voice/dialog-ch1.js (4 replaced, 12 added). Lines: the 12 of ch1Ellie scene 2b, Aunt Ellie's opener (new take), Tom "Your mother says I'm slow.", Grace "You are slow.", Amy "I carried both of them". |
| Kept scripts | All 16 in tools/voice-library/scripts/ch01-story-directions.json and data/voice-index.json equal the export character for character. The three round 3 scripts equal the calib3 table. Two lines carry no takeId because merge-local.js writes one only when the script changed (Grace "You got new curtains.", Rose "Aunt Ellie, did you miss Tata?"). |
| Aunt Ellie line 12 | He changed "Fine." to "Sure." in the take he kept. Screen now: "Sure. The street was quieter without him, and I didn't care for it. Now go and see your mother, Tom, before I change my mind." |
| 9 older subtitles | Changed to the spoken words (list in docs/CHANGES.md `## calib3`). Each built-in clip was transcribed first (sherpa-onnx whisper small.en) and says the new words. Clips re-keyed, same bytes. Kenji "Tom-san" left alone (pronunciation spelling). data/script-review.json is empty: nothing was Locked. |
| New tool | `python3 tools/voice-library/retext-lines.py <spec.json> [--apply]` and `--merge-map=<out.json>`. Spec used: tools/voice-library/retext-calib3.json. It rewords a line in every tracked file, re-keys the baked clip, writes the kept script (dialogue: the script file read last for the line; battle: battle-overrides.json and the saved script in data/voice-clips.js), and rewrites reaction cue words (`cue`). Run make-index.js, then tools/script-index/build.py AFTER it (the script index copies scripts from the voice index). |
| Take history (made 22:29:04Z, 2,748 takes on 2,171 lines) | Only the part after the last one was read: 41 takes on 13 lines, all of them also in the pending export's trail. The other 2,707 takes are the file calib3.md was built from. |

## The scene 2b draft against what he kept (he never saw it in the Library, so this is a blind comparison, not a survival count)
| Set of drafts | Tag words | Same word on the same line in his kept take |
|---|---|---|
| calib3 draft (words borrowed from his other voices) | 24 | 3 (flat on "My CHAIRS don't.", informing on Grace, flat on Grace) |
| Older drafts already in the Library (ch1rebuild1, written from the scene) | 37 | 24. On the 9 lines he retuned by hand: 16 of 29. Three lines he left as generated (8 words). |
Round 2 baseline was 4 of 19. Time: 13 lines in 14 minutes (round 2: 5 lines in about 30).

## STOP-LOSS ON TAG REDRAFTING IS BACK (condition from calib3.md: no better than round 2)
What is going wrong: a word that works on one voice does not carry to another, and nobody here can hear. Aunt Ellie's voice keeps dry, firm, crisp, brisk, businesslike, level and composed, the words he deletes from Tom, Amy and Deedee. A bank built from other voices predicted 3 of her 14 words... none of hers, in fact: all 3 matches were on Tom's and Grace's lines.
Change of method (recommended to Tom in chat): no more redrafts. He tunes straight from the scripts already in the Voice Library, which he did faster and with fewer changes. Claude's job per round: merge, make the screen follow reworded lines, measure loudness, keep the bank as a record. Do not draft tags for ch1Theft or any other scene unless Tom asks for a draft by name.

## Corrections to the rules in calib3.md
| # | Rule | Evidence |
|---|---|---|
| 16 (NARROWED) | "Never firm, do not open with dry" holds for Tom, Amy and Deedee only. For Aunt Ellie he typed `firm` himself and kept `dry`. | Ellie line 2: `[dry, unhurried]` to `[dry]`, `[gracious]` to `[firm]`. |
| 18 (NARROWED) | "defensive is excusing" was Rose. On Tom he tried `excusing` three times, then kept `[defensive]` and `[sheepish]`. | Tom line 1, 5 takes. |
| 21 Words are per voice | A bank row is evidence for its own voice only. Borrowing across voices failed 17 times out of 17. | Table above. |
| 22 He changes one bracket | On a line he retunes he usually rewrites one bracket and leaves the others. The plain scene drafts are a good enough start. | 9 retuned lines: 16 of 29 draft words left in place. |
| 23 Grace alone | "Rose licked a muffin." on its own line is `[dry, flat, quick]`, not `[flat, deadpan]` (that form stays on the longer lines). | 2 takes. |
| 17 (one more kept) | `[emphasized]` before a CAPS word or the word to hit: kept again twice. | Tom `[emphasized] TRAVEL`, Ellie `stay up [emphasized] there`. He moved Ellie's tag between "up there" and "there" four times and ended before "there". |

## Tag bank additions (his own typed words; calib3.md holds the rest)
| Voice | Added by him and kept | Tried by him and dropped | Deleted from the drafts | Draft words left in place on lines he retuned |
|---|---|---|---|---|
| Aunt Ellie (first evidence: 7 lines, 26 new takes) | greeting, skeptical, quick, firm, emphasized (before "there"), conditional, flat, very interested, not amused | leading x3, caveating, conditionally ok, interrogative x2, very curious, curious, nonplussed x2, emphasized before "up there" | cool, elegant, measured, faintly disappointed, unhurried, gracious, punchline (once), cool, mild interest, careful | dry, crisp, kind, calm, certain, one raised eyebrow, level, punchline (opener), clipped, reluctant, plain, quick, brisk, businesslike |
| Tom | defensive, sheepish, emphasized (before TRAVEL), informing, flat | excusing | warm, a little (from "a little defensive"), earnest, explaining | |
| Grace | stating plainly, informing, dry, quick | quickly (2 takes), dropping the comma after "Aunt Ellie" | reporting, important | bossy, flat |
| Rose | announcing, educating | | proud, loud | |
Never retuned, one take each, NOT approval: Grace "You got new curtains." `[plain, reading]`, Aunt Ellie "Then the curtains are three" `[crisp, final]` and `[punchline, composed]`, Rose "did you miss Tata?" `[loud, curious]`.
Grace's "You're number FOUR." take in use is not the last one he made (he tried quickly twice after it and went back).

## Loudness of the 16 merged clips (LUFS; 10 units is about half as loud). Nothing levelled.
| Voice | Lines |
|---|---|
| Aunt Ellie | -18.4, -18.9, -19.3, -19.3, -20.3, -20.7, -21.1 |
| Rose | -18.4, -18.5 |
| Amy | -18.9 |
| Tom | -23.6 (wrinkle), -24.7 (slow; the round 2 take was -27.0) |
| Grace | -23.5 (You are slow), -25.8 (number four), -26.6 (curtains), -28.6 (Rose licked a muffin) |
Grace sits 6 to 10 units under Aunt Ellie inside one scene. Tom was asked to listen. If he says she is too quiet: add leveling to merge-local.js with a ceiling on how far a quiet line is raised, and re-merge the Grace clips (they are in the game: raise them in place, or he attaches the export again).

## Next build session (calib4), in order
1. Clone with push. Read Tom's new pending export and its trail.
2. For each clip whose kept script has different words from its `text`: add an entry to a new spec (copy the shape of retext-calib3.json), `retext-lines.py <spec> --apply`, generators (gap-apply.py, talk-apply.py, reaction-apply.py 1 2), make-index.js, `retext-lines.py <spec> --merge-map=<map>`, then merge with `--retext=<map>` (calib2 procedure, both copies), make-index.js again, then tools/script-index/build.py. Check data/script-review.json for Locked first.
3. Check every exported script equals the script file character for character.
4. Loudness table. Level Grace only if Tom says she is too quiet.
5. Bank rows from the new trail (Deedee and Boppy if he tuned ch1Theft: Boppy has no bank yet). His own words only.
6. unused_voice.py (check 4 is 93 on main, none from calib builds), trail_test.py, pending_test.py, reaction_test on the changed scenes, smoke, CHANGES `## calib4`, bump tags, push.
No tag drafting (stop-loss above).

## Tests run for calib3
trail_test.py FAILS [], pending_test.py FAILS [], reaction_test ch1Ellie portrait and landscape (13 pages each, no page errors), unused_voice.py (check 4: 93, none new), smoke FAILS [], tag_check ok, node --check on every edited data file. The Voice Library page was opened and each scene 2b line shows under chapter 1 with "Just before".

## Seen, not caused by this build
- reaction_test case `ellie` (start [6,15,"down"]): on all 13 pages Tom and Grace stand up the path beside the house roof, away from Aunt Ellie at her door. Not touched. May be the test's start tile; check from a real approach before changing staging.
- `npc-emotion-check.py` fails on 223 rows (line moved in engine/travel.js and others, two Page lines) and `emotion-apply.py` on 56 (chapter 7). Both older. The mood files were changed by retext-lines.py directly; the other generators rewrote their files with no further difference.
- The recognizer heard "Your mother says I'm slow. Your mother says" on Tom's 1.8 second clip. The clip is too short to hold the words twice, so this is read as a recognizer error. Only Tom's ear settles it.
- Scratch tip: do not name a scratch file inspect.py (it breaks Playwright).

## Not known
- Whether Tom read the calib3 draft before tuning (his first tries on Tom's line used excusing and informing, which were in it).
- Whether the three untouched lines are takes he likes.
