# linegap1 (2026-11-18 07:40, main a5e70c9): pause between speakers, story scenes on AUTO

Read with claude/next-addendum-ch1tags1.md (voice tags) when working on chapter 1 voice or humor timing. Repo entry: `## linegap1` in docs/CHANGES.md.

Tom 07:26: "What about the pacing between when different characters speak?" 07:31: "Go".

## What exists now
- docs/line-gaps.tsv: hand-judged, one row per story line in play order (ch, scene, speaker, after, text). `after` is the hold once that line's clip has ended: snap 0.15 s, normal 0.65 s, beat 1.25 s. All 95 chapter 1 lines have a row (24 snap, 14 beat, 57 normal). No rows for other chapters: they stay at 0.65.
- `python3 tools/gap-apply.py` writes data/line-gaps.js (never hand-edit). `--check` runs in smoke. Seconds: `DA_GAP` in engine/dialog-auto.js.
- Story scenes (cutsceneOn) open with AUTO ON; own saved setting `le-scene-auto`. Ordinary conversations keep `le-dialog-auto` (starts OFF). Rose Mode unchanged.
- Lines with no clip keep their read time; a beat adds to it, a snap does not shorten it.
- Test: `python3 tools/linegap_test.py` (FAILS: []).

## Not done, not known
- Nobody has heard the gaps with real clips: chapter 1's 95 lines are unrecorded. The three lengths and all 38 marks are first guesses from the script.
- The real silence between two voices is the gap PLUS the game's own overhead (dialog closes, the next talk step opens, text types out, clip decodes). Not measured. When chapter 1 clips are merged, measure clip end to next clip start on three lines (one of each kind) and correct DA_GAP if snap is not actually short. If the typewriter outlasts a short clip, the gap starts late: check Deedee "Three." and Rose "BOO!".
- No overlap: a line cannot start before the one before it ends.
- Chapters 2 and 3 (locked scripts) need rows when they are built: add them in the same build as the scene, by reading each line against the next one.

## How Tom corrects a gap
REPORT tab while playing ("too slow after Rose's BOO"). Fix: change that row's `after` in docs/line-gaps.tsv, run gap-apply.py, push. No re-recording.

## Still owed from the tagging thread (claude/next-addendum-ch1tags1.md)
- Tom records 12 calibration lines and sends the pending export. Read each take's `script` from the export (voices.html writes `script:take.script` into every pending row) to learn his tag edits. Confirm the exported script is the kept take's.
- tools/voice-library/merge-local.js drops `script`: make the merge write each take's script into the matching scripts/chNN-story-directions.json line so his edits are the record. Recover the 68 chapter 2 scripts from local-clips-pending_7.json if he re-sends it.
- Tom (11-18): every next-conversation prompt comes with a recommended Claude model.
