# next addendum: Voice Library "Not in game yet" filter (2026-11-09, main at 3d38760, tag notingame1)

READ THIS WITH claude/next.md. It adds to the voice merge recipe; it overrides nothing.

- Built: `voices.html` Show > "Not in game yet" lists phone clips (Tom's re-records) whose fingerprint is not in `data/merged-takes.json`. Fingerprint = first 16 hex of SHA-1 of the clip's stored mp3 base64 text (the same text the export carries). Raw fingerprints are used because dialogue merges re-encode the audio (trim, speaker fx, Grace shrink), so comparing with the built-in clip would not match.
- `tools/voice-library/merge-local.js` now writes `<outdir>/data/merged-takes.json` (adds the fingerprint of every clip it processed). The existing recipe step "copy `<outdir>/data` over `data`" carries it. Filter stale clips out of the export BEFORE the run (the 38 stale battle takes): they must stay unrecorded so they keep showing as not in game.
- The ledger starts EMPTY (older merges were not recorded). Until the next export is merged, every phone clip shows as not in game and the page says so. After the next merge it is exact. When Tom next sends an export, merge it per the recipe (ledger is written automatically), push, and tell him the filter is now exact.
- Tested: merge-local on a one-clip export (fingerprint matches sha1), headless Chrome with two seeded clips (1 in ledger, 1 not): count and list right, portrait looked at. No `?v=` tags involved (voices.html is network-first).
- Incident: my first push carried conflict markers in docs/CHANGES.md (a failed assert did not stop the `git add` and `rebase --continue` after it). Fixed in 3d38760; git grep for markers is clean. Check markers with grep BEFORE `rebase --continue`.
