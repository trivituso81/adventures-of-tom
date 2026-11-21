# gclips9 (2026-11-12 16:43 to ~17:20, main 1fb17a1): phone clip export merged, newer than claude/next.md

Read this together with claude/next.md (next.md was NOT rewritten this session; it still says main 3455fa5 and lists gclips8 as the latest clip merge).

- Tom 16:43: "update these voice clips" with `local-clips-export_5_.json` (2085 clips: 2038 dialogue, 47 battle, 37 voices, made 2026-11-13 00:43 UTC). He did NOT say "override everything", so the export was filtered (the unfiltered-override rule only applies when he says it).
- Fact (DONE, pushed, smoke FAILS []): `node tools/voice-library/merge-local.js <export> data /tmp/out`, copied over `data`, then battle-scripts.py, harvest.py, make-index.js, `unused_voice.py`.
- The unfiltered merge failed `unused_voice.py` (check 3: 2 battle clips, check 4: 35 dialogue clips). Those 41 export clips matched no live line (old "Tommy" Deedee lines, a few Tom, TNB and Michael lines, and Deedee `hug`/`moon_back` "Group hug! Tommy, you too!"). They were dropped from the export and the merge re-run: 2044 clips, 1994 replaced existing takes, 50 added (dialog-ch28.js, live lines that had no clip). `unused_voice.py` is 0 on all checks. Voice index: 4331 lines.
- Filter method (fact): run the merge once, run `unused_voice.py`, list its check 3 and 4 entries, drop clips from the export whose `voice|text` (curly apostrophes normalized, prefix match because the report truncates at 140 chars) or battle `voice`+`lineKind` match, revert `data` (`git checkout -- data`), re-merge the filtered export.
- Tags: `gclips9` (dialog-cast.js, voice files, main.js stamp). docs/CHANGES.md has the entry.
- Open for Tom: the stale "Tommy" clips are still on his phone (`aot-local-clips`); they play nowhere. If Tom wants Deedee's "Tommy" lines back, the game text would have to change first (spoken-line rule).
- Tom's check: title stamp `build gclips9` or later; hear any changed line. His phone's own clips win over built-in ones, so the repo copy matters for other devices and a cleared browser.
