# vclips1 (2026-11-12 ~19:15 to ~19:45, main 74a6029): phone clip export 6 merged, newer than claude/next.md

Read this together with claude/next.md (next.md was NOT rewritten this session; it is 40 KB and other sessions were writing it).

- Tom 18:51 sent `local-clips-export_6_.json` (2,144 clips, all voices, made 2026-11-13 02:47 UTC) after asking how to export. He named no voices and did not say "override everything", so stale clips were filtered.
- Fact (DONE, pushed, smoke FAILS []): merge run once, `unused_voice.py` listed 37 export clips with no live line (35 dialogue, 2 battle `deedee.hug` and `deedee.moon_back` "Group hug! Tommy, you too!"), those were dropped from the export, `data` reverted (`git checkout -- data`), merge re-run on 2,107 clips. `unused_voice.py` is 0 on all checks. Voice index 4,331 lines.
- Result: almost every clip was byte for byte what the game already had (only 4 data files changed). New: 59 dialogue clips in dialog-ch28.js for kid and walk-on voices that had no clip (dotkid 13, pagew 21, mosskid 8, beanw 7, pipkid 7, kitw 3); 2 Deedee battle clips (hug, moon_back). No existing clip was replaced.
- `data/merged-takes.json` now holds the fingerprint of every clip in this export (merge-local writes it), so the Voice Library "Not in game yet" filter is exact for everything in export 6. Clips recorded after that export show as not in game until the next export.
- Tags: `vclips1` on dialog-cast.js, deedee.js, dialog-ch28.js, main.js stamp. docs/CHANGES.md entry on top.
- Open for Tom: the 37 stale clips (old "Tommy" Deedee lines, a few Tom, TNB, Michael lines) are still on his phone and play nowhere. If he wants them back, the game text would have to change first (spoken-line rule). Deedee lines with "Tommy" are the bulk.
- Process note (fact): `/tmp/filt.js` method from gclips9 worked unchanged: parse check 3 and 4 of unused_voice.py, drop by `voice|text` (curly quotes normalized, prefix match because the report truncates at 140 chars). merge-local takes about 4 minutes on a 235 MB export; use `--max-old-space-size=8192`.
- Tom's check: title stamp `build vclips1` or later; open a kid or walk-on speaker in chapter 28 (Dot, Moss, Pip, Page, Bean, Kit) and hear their voice.
