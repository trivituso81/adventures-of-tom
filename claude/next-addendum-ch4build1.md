# ch4build1 (2026-11-14, main d6413eb): chapter 4 story build INSTALLED AND PUSHED. Newer than claude/next.md. Read with next-addendum-ch2build1.md and next-addendum-ch3build1.md (both still true).

Chapters 2, 3 and 4 are LIVE in the game: BUILT, waiting on Tom to play. Chapter 5 is not built. claude/story-build.md board (Live column) still says "waits" for 2, 3, 4: owed, change to "BUILT ch2build1 / ch3build1 / ch4build1, waiting on Tom to play". Neither next.md nor the board was rewritten (the Projects tool replaces a whole 25 to 40 KB file). The next session that edits next.md should fold in the ch2build1, ch3build1 and this note, then delete the three addenda.

## What was done (pushed; smoke FAILS [], tag_check ok, unused_voice.py 0)
- Every chapter 4 scene is the locked claude/story-ch04.md with the words of tools/voice-library/scripts/ch04-story-directions.json: ch4Arrive, ch4Nara, ch4Gate, ch4Snack, ch4Fetch, ch4Crab, ch4Clapper, ch4Moth, ch4Stage, ch4Rig, new ch4Hat (Stage 7: grey circle, hero hat in an orange block, TNB moves the table), ch4Boss, ch4AfterBoss (static `{if}` for the kindness branch so harvest.py sees both), new ch4Backup, ch4End. The boss trigger needs `ch4-hat`. Details: docs/CHANGES.md `ch4build1`.
- Close-ups `SCENE_OPS.ch4Reveal` (data/closeup-ch4-reveal.js: visitor badge, coin, crew, phone), baker tools/art-library/bake_story_ch4.py, test tools/closeup_ch4_story_test.py. Keepsake `hatcoin`. Departure flight lines for chapter 4 rewritten (engine/travel.js).
- Stage 7 drawing (engine/plate.js `drawStage7Spot`, `ch4Table`): grey circle, sliding table, block stand-in. Player-visible "amber" text on Stage 7 now says orange (internal ids unchanged).
- Talk poses (talk2 standard): 26 stale ch4 rows removed, 85 new rows added and hand-judged, talk-apply rerun.
- 4 stale clips purged (docs/PURGED_VOICE.md). About 80 chapter 4 lines have no clip yet.

## STAND-INS (say so to Tom)
- Director's Cut has no coin on its beret (approved art ch4-directorscut-coin v1/v2 not installed).
- Grey circle is the plate turned grey in code (ch4-stage7-grey NOT returned by Tom; Generate and approve in the Art Library).
- Table drawn in code. Tom kneeling, TNB pulling the table, Nara actions reuse existing frames plus sounds (approved ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1/2 not installed).
- Crab cards appear as toasts. STUNT DOUBLE badge art unused.
- NOT tested: landscape and Duo for the scenes, set and boss fights played through, a full chapter-select run, a phone. Chapter 4 listener reactions still off.

## NEXT SESSION (in order)
0. Talking sheets (ORDER NOW item 0 in next.md): six approved (tom, tnb, grace, rose, deedee, boppy). Install per docs/TALK_POSES.md. NOT DONE in the ch4build1 session.
1. Install newly approved art in the Art Library: ch4-directorscut-coin, ch4-tom-poses, ch4-tnb-poses, ch4-nara-story-1/2, ch3-tom-net, ch3-irongill-coin (replace the stand-ins), plus approved ch2 and ch5 pieces. ch4-megaphone-normal waits until after chapter 6.
2. Act on Tom's play report on chapters 2 to 4.
3. Update story-build.md board and fold addenda into next.md.

## Waiting on Tom (title stamp `build ch4build1` or later)
Settings > chapter select > 4. Walk: Delta flight, Nara at the porch, studio gate (lanyards), snack, fetch, crab of cue cards, clapper, moth, Stage 7 hat scene, the boss, backup hat, end. Report what is not funny, not clear, not him, anyone cut off or stuck.
