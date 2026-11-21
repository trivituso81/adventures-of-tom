# Grace voice takes and Voice Library cleanup (Tom 2026-11-09, gracevoice1 7065998, retired1 be442d2)

Merge this into claude/next.md Live state and session log at the next rewrite (next.md itself was not rewritten in this session).

## gracevoice1
- Tom sent local-clips-export_16.json (711 clips, all voices, made 2026-11-09 22:41 UTC) with "Grace voice fixes". Merged only Grace (159 clips) with `node tools/voice-library/merge-local.js` on a filtered copy.
- Result: 115 dialogue clips re-recorded (dialog-ch28 97, ch26 11, ch10 5, ch9 2); the 41 Grace battle takes were identical to the baked audio. Hash check: no non-Grace key changed, none added or removed. Tags: dialog-ch28.js and dialog-cast.js now gracevoice1.
- NOT merged (no-unused-voice rule): Grace takes for dead lines `attack` "Hi-yah!", `chalk_up`, `ymamot` old wording. Live Ymamot line is "Ketchup, pickles, cereal, sock. Ymamot Creation!" (data/lines.js line 79) and has no take yet.
- data/merged-takes.json had an empty hashes list before this merge, so an export cannot be diffed against earlier merges: filter by character and judge new takes by audio duration against the baked clip.
- Not merged: other voices in the export (tom, justin, amy, deedee, boppy, olivia, rose, tnb battle; narrator, deedee, justin, mirrorball, tom dialogue). Merge only if Tom names them.

## retired1 (Tom 14:53: "If the lines are not used they should not be in the voice library")
- Fact: the library list never held the purged lines; the phone's saved clips (IndexedDB aot-local-clips) did, and exports carried them (73 rows with no listed line).
- `data/retired-clips.json` (66 row ids from docs/PURGED_VOICE.md, none live). `voices.html` `purgeRetired` deletes matching saved clips and takes on load and `exportClips` skips them. To retire more lines: add rows to docs/PURGED_VOICE.md and regenerate that json (ids are battle|voice|kind|text).
- Olivia's 31 live battle lines were missing from the list (builder skipped her). `tools/voice-library/make-index.js` BASE, NAMES, ORDER now include olivia. Her takes on the phone now attach to lines. Her voice direction in the index is "fast, wry, newsroom" (my guess, change if Tom says).
- Left alone: `battle|justin||OUCH!!!!!!` and `battle|tnb|tombo|Well, well, well. Here comes the good part.` phone rows (old line kinds, not in the purge record).
- Tests: unused_voice 0, tag_check ok, `IDS=grace` smoke FAILS [], playwright seeded-clip test for the purge.
