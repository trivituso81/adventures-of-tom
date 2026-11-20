# calib2 (2026-11-18 11:35 PT, main f42bab1, build label calib2): the 10 tuned takes are merged, the take history can be exported

Read with claude/next-addendum-calib1.md. calib1 stays the record of Tom's corrections, rules version 2 and the tag bank. Its section "Next build session, in order" is finished except step 7: this page is the status. Repo entry: `## calib2` in docs/CHANGES.md.

## STOP-LOSS ON TAG DRAFTING STILL HOLDS
No tags were drafted in calib2. Do not draft any until Tom's take history file (below) has been read.

## Done and pushed
| calib1 step | What exists now |
|---|---|
| 1 Both exports merged | 10 chapter 1 lines have built-in clips in data/voice/dialog-ch1.js (Grace 3, Tom 3, Amy 2, Rose 1, Aunt Ellie 1). Round 2's Amy "Brother!" take replaced round 1's. |
| 2 The trail | voices.html: Export pending clips now carries `trail` (for every exported line, every take still saved: `{line, takeId, t, label, script, kept, deleted?}`, words only, oldest first). New button at the bottom of the Voice Library: Export take history, file `take-history.json`, shape `{made, kind:'take-history', lines, trail:[...]}`, every take on the device, including takes saved under a line's OLD words. `line` is `d|voice|screen text`. A deleted take keeps its words from now on (localStorage `aot-vl-dropped`); takes he deleted before calib2 are gone. |
| 3 Merge keeps scripts | merge-local.js writes each kept take's `script`, unchanged, plus its `takeId`, into the script file the index reads last for that line (ch01-story-directions.json here; a line no file holds goes to scripts/zzzz-kept-takes.json). Checked: all 10 scripts in the file and in data/voice-index.json equal the exports character for character. |
| 4 Screen words | Lines 3, 6, 8 changed in the scene and every companion file. Map: tools/voice-library/retext-calib2.json. NOT changed: claude/story-ch01-draft2.md still shows the old words of these three lines (and the old tags). The repo wins. |
| 5 Loudness | Measured, nothing levelled (table below). Waiting for Tom's ears. |
| 6 Line before | Every story line in docs/line-gaps.tsv (chapter 1 only so far) shows "Just before, <speaker>: <words>" with a play button above its script, and a link "Play with the line before" that plays both clips with the game's pause between them. Index field `pv` = [speaker, words, pause, item index] or 0 for a scene's first line (make-index.js). A chapter gets this when its rows are added to docs/line-gaps.tsv. |

Also changed in merge-local.js: several exports at once (comma separated, newest take wins); `--retext=<map.json>` for reworded lines; a new line goes to its own chapter's voice file (chapters 1 to 10) instead of dialog-ch29.js, which the game loads last after the 95 MB file. Run make-index.js BEFORE the merge when words changed (the merge reads chapters from the index).

## Merge procedure now (replaces the one-export form)
`node tools/voice-library/merge-local.js <export.json[,export2.json]> data <outdir> [--retext=<map.json>]`, then `cp -r <outdir>/data/. data/` AND `cp -r <outdir>/tools/. tools/` (the second copy carries his scripts: skipping it throws his tags away), then make-index.js, bump_tags, unused_voice.py, smoke, push.

## Loudness of the merged clips (LUFS; 10 units is about half as loud)
| Line | LUFS |
|---|---|
| Amy "Brother!" / "I carried both" | -16.9 / -17.9 |
| Rose "I licked one." | -17.4 |
| Aunt Ellie "Tom. They gave you a seat" | -22.3 |
| Grace "Number two." / "You are slow." | -22.8 / -24.0 |
| Tom "Thank you for telling me" / "I'm carrying a child" | -24.1 / -22.8 |
| Tom "Your mother says I'm slow." (under his breath) | -27.0 |
| Grace "Number three. Rose licked a muffin." | -31.2 |
For scale: 80 chapter 2 clips already in the game have a middle value of -21.1, one in ten is quieter than -25.8, the quietest -37. If Tom says a line is too quiet: add leveling to merge-local.js with a ceiling on how far a quiet line is raised (so quiet stays quieter than its neighbours), re-merge from the two exports (he must attach them again) or raise only the named clips.

## Fact about what Tom hears on his own phone
The game plays the takes saved on his phone before the built-in clips (engine/local-clips.js), matched by the line's words. So on his phone 7 lines play his raw takes, and the 3 reworded lines play the built-in clips (his phone copies are saved under the old words). Grace's built-in clips carry her voice effect (merge-local.js GRACE chain); her phone takes do not.

## Next session, in order
1. Read the attached `take-history.json`. For each line group by `line`, order by `t`: list the tag words he tried and dropped per voice, and which survived into the kept take. Add a "tried and dropped" column to the tag bank in calib1 (rewrite that table in this page or a calib3 page; do not lose the kept-word bank). Lines 3, 6 and 8 appear under their OLD words.
2. If Tom reports a line too quiet: leveling as above.
3. Only then draft tags for the next conversation unit of chapter 1 (scene 2b, Aunt Ellie's door: 12 lines, Aunt Ellie 6, Grace 3, Rose 2, Tom 1; Aunt Ellie has no tag bank and her line 11 is not approval), using rules version 2 and the bank, with the goal sentence and the preceding line on top. Show Tom the block in chat first (his rule: nothing goes into the repo until he says so), then write the drafts into scripts/ch01-story-directions.json so he tunes them in the Voice Library. Track the survival number per round (round 2 baseline: 4 of 19).
4. Add docs/line-gaps.tsv rows for chapters 2 and 3 when those chapters are built (linegap1), which also turns the line-before display on for them.

## Tests
`python3 tools/voice-library/trail_test.py` (server: `python3 tools/serve.py 8011`; 16 checks, FAILS: []), tools/voice-library/pending_test.py (FAILS: []), smoke FAILS: [], tag_check ok, unused_voice.py check 4 still 93 (same as before calib2, none new), reaction_test on ch1Goal and ch1Amy in portrait and landscape (the longer Amy line fits: three rows in portrait, one in landscape).

## Seen, not caused by this build
- In ch1Amy (portrait and landscape) Tom stands on the Square steps with his head under the painted "Long Island Square" arch sign. Not touched.
- ch01-story-directions.json had no final newline; the merge writes one (one-byte difference).

## Not known
- Whether any take history exists for rounds 1 and 2 beyond the kept takes: only takes he did not delete are on the phone.
- Everything in calib1's "Not known" list.
