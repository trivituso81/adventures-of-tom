# clips12 (2026-11-14 14:30): 7 chapter 2 phone takes merged, pushed (main 701e55f)

- Export: local-clips-pending.json made 2026-11-14 14:10 on Tom's phone, 7 clips, all live lines, none had a clip before. Merged with merge-local.js into data/voice/dialog-ch29.js (7 added). Carmen "And YOU. Who touched my griddle?"; TNB "Mud in the kitchen and a talking fish..."; Tom "Doña Carmen, I'm so sorry..."; Tom "I want to take you home to Jefferson Park..."; Tom "Okay. One down" (Doña Carmen scene, line 510 of scenes.js, and Miss Odette scene, line 525, both live); Tom "The one at the pond has a bite out of it too...".
- Scripts in the export equal the repo's ch02-story-directions.json for 5 of 7. The two "One down" takes have no direction entry (export script: `[dry, calm] ...`); nothing was added.
- `unused_voice.py` check 4 (dialogue clips not in harvest or source) shows 52 on main both before and after this merge. Not from these clips. Likely cause: other sessions' queued lines or clips; next session that touches voice should look at the list.
- Still owed from voicetags1 notes: copy the `script` of every chapter 2 take Tom exports into ch02-story-directions.json (done for these 5 already matching) and the WORDS OWED rewording. Not touched here.
- Rebase notes: another session (ch7assets1) pushed during the work; the tag commit was skipped and bump_tags rerun, as the rules say.
- Claude/next.md was NOT edited (concurrent edits by other sessions); add "clips12 (701e55f)" to its Recent builds line when next convenient.
