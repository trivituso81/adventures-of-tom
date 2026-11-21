# next addendum: voice export 14 merged (2026-11-09, main at 0acce5e, tag voice14)

READ THIS WITH claude/next.md. It overrides these lines in next.md:
- ORDER NOW 1 (MB bake): DONE. Tom's export 14 carried the 17 `mirrorball` dialogue clips; merged into data/voice/dialog-ch28.js. The old `bigone` stand-ins for The Mirrorball were purged (17 clips: dialog-ch9 13, dialog-ch26 3, dialog-ch27 1). Recorded in docs/PURGED_VOICE.md and docs/CHANGES.md (voice14). Audit: unused_voice.py shows 0 on checks 3, 4, 5; make-index says 0 dialogue lines with no clip.
- Live state "Mirrorball voice fallback (445) with 17 lines unbaked": no longer true. Mirrorball is voiced by its own clips. The Oolong-versus-Odette risk note still stands if Tom dislikes the voice.
- Next tag: voice15 (or any new name).

Facts about the export (so nobody redoes the analysis):
- Export 14 held 597 clips: 540 matched what is installed byte for byte (battle clips pass through unchanged, dialogue re-encodes deterministically), 17 new mirrorball, and the same 38 stale battle takes as export 13 (amy hills, hurt, marathon, marathon_ult, tombo2; grace attack, chalk_up, ymamot; rose ymamot; tom controller_tap, crumb_shot, window_seat; tnb tombo, round_with_jojo; 24 Justin beats). Those 38 are for lines the game no longer plays or has reworded (for example live Amy hills text is "Up the hill, down the hill!", the baked take says slime). Merging them makes `unused_voice.py` fail check 3, so they were filtered out before merging. Tom's phone keeps re-exporting them; if he wants them gone from his export he must delete them in the Voice Library.
- Merge recipe that worked: filter the export JSON to drop battle clips that the first merge adds as `added` and that the audit then lists, re-run `merge-local.js` (about 40 s), copy `<outdir>/data` over `data`, `battle-scripts.py`, `make-index.js`, `bump_tags.py <tag> --base origin/main`, `unused_voice.py`, `tag_check.py`, smoke (FAILS: []).
- Push hit a conflict in docs/CHANGES.md and engine/main.js (build stamp) from another session; after resolving, bump_tags must be run again because the rebase brought back the other session's `?v=` for main.js.

Wake-up for Tom: nothing to do. If he hears the Mirrorball in the Moon Club on his phone and dislikes the voice, tell Claude which line.
