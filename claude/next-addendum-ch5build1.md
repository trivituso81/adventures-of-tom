# ch5build1 (2026-11-14, main d9613f3, tag ch5build1): chapter 5 story build INSTALLED AND PUSHED. Newer than claude/next.md. Read with next-addendum-ch4build1.md, next-addendum-ch3build1.md, next-addendum-ch2build1.md and next-addendum-coinart2.md (all still true).

Chapters 2, 3, 4 and 5 are LIVE: BUILT, waiting on Tom to play. claude/story-build.md board (Live column) still says "waits" for 2 to 4 and has no BUILT for 5: owed ("BUILT ch2build1 / ch3build1 / ch4build1 / ch5build1, waiting on Tom to play"). Neither next.md nor the board was rewritten. The next session that edits next.md should fold in the addenda and delete them. Chapter 6 is next to build.

## What was done (pushed; smoke FAILS [], tag_check ok)
- Every chapter 5 scene is the locked claude/story-ch05.md rev 3 with the words of tools/voice-library/scripts/ch05-story-directions.json: ch5Arrive, ch5Pruitt (Clara, Mrs. Kowalski, sticker, Clara's dad), NEW ch5Field (trigger ch5-field; cones, grey circle, block, binder poses, Tom lifts Grace; Tombo Uncle Spotter Toss moved here), ch5Hall (needs ch5-field), ch5Art/Music/Gym, ch5Clocks, ch5Boss, ch5AfterBoss (kickcoin keepsake, tab three, Mr. Delgado), ch5End (walk past the block). Flight lines and landing in engine/travel.js.
- Schoolyard drawing: engine/plate.js drawSchoolSpot (grey circle and cones in code, block art/props/schoolyard/ch5_block.webp); engine/amber-spots.js entry ch5 (solid, A replays).
- Installed art: tomch5, tomlift, narach5 pose strips (bake_story_poses.py), Red Pen coin sheet, close-ups via data/closeup-ch5-reveal.js (`{ch5Reveal:...}`), baker tools/art-library/bake_story_ch5.py.
- Voice index, 10 clips purged, emotion rows (121 new first-pass), talk rows (131 new, not all hand-read). Details: docs/CHANGES.md ch5build1.

## STAND-INS (say so to Tom)
- Clara (4'4") uses the pip kid look; her dad the vance look; both need Art Library entries (height for Clara is decided: 4'4"). Kowalski and Delgado use their NPC looks.
- Kickball field: the built schoolyard plate has no field. Grey circle and cones are drawn in code. Needs an Art Library picture `ch5-field-grey` (day and night).
- Close-ups of Rose's grin, the gummy note and the phone photo are baked but no scene shows them. Nara's six frames are baked and unused (the goodbye is Tom's lines plus two toasts).
- The sign-up sheet does not visibly walk back to the clipboard.
- School NPC lines that treat the grumpy things as ordinary still play before the first fight (story-ch05 "Also changes", last row): NOT done.
- unused_voice.py check 4 lists 28 clips that were already on origin/main before this change (not chapter 5); look at them in the next voice session.
- NOT tested: Duo, the three room fights and the boss played through, a full chapter-select run, a phone.

## NEXT SESSION
1. Build chapter 6 (propose to Tom first per story-build.md) or act on Tom's play report on chapters 2 to 5.
2. Art Library: Clara and her dad (height first for the dad), ch5-field-grey.
3. Update the story-build.md board and fold the addenda into next.md.

## Waiting on Tom (title stamp `build ch5build1` or later)
Settings > chapter select > 5. Walk: Delta flight and Nara goodbye, landing (tabs, note, Rose's tooth), Square (Amy, coffee, binder), schoolyard (Clara, sticker, Pruitt, the long-coat dad), the kickball field (walk in through the gate at the east side), hallway, the three rooms, clocks, Red Pen, conference night, the walk past the block. Report what is not funny, not clear, not him, anyone cut off or stuck.
