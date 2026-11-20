# Chapter 6 build, stage 2 handoff (2026-11-14 12:10, chapter 6 build conversation)

Read this together with claude/story-build.md (section 11) and claude/story-ch06.md. It does not replace claude/next.md.

## Done this session
- clips12 (main 017d7c7): Tom's `local-clips-pending_10.json` (228 takes, made 2026-11-14T19:22Z) merged. Chapter 4 about 90, chapter 5 about 135, chapter 1 two. All new keys in data/voice/dialog-ch28.js; none older than its script rewrite (retake.json `ats`); unused_voice.py check 4 stays 51 (same as before); smoke FAILS []. Not listened to. The `script` text on each take was NOT copied into ch04/ch05-story-directions.json (clips11 note says a later merge should).
- NO chapter 6 takes were in that export. Chapter 6 art is almost all approved by Tom (31 of 33 entries). Not approved yet: `ch6-picnic-grey` (still draft, no versions) and the two Nara story sheets are approved (v1).

## Waiting on Tom: nothing for stage 2 to start.

## RISK to fix first next session (fact)
data/voice/dialog-ch28.js is now 93.29 MB. GitHub refuses files over 100 MB. The next export merge that lands there can fail the push. Before the next merge: split new dialogue keys into a new file (for example data/voice/dialog-ch29.js), add it to the loader where dialog-ch28.js is listed (grep `dialog-ch28` in index.html, sw.js, tools/voice-library/*.js, tools/clip-audit/*), and make merge-local.js write to it. Check tools/clip-audit/unused_voice.py still finds it.

## STAGE 2 NOT STARTED (the engine work). What the next session does
Build the reusable block-breaking work and show it on the picnic table (story-ch06.md scene 14 beats 3 to 12):
1. Coin roll along the table groove, click into the round hole, coin close-up (reuse engine/closeup.js `closeupSwitch` style; art: art/raw/props/ch6-coin-clean-v1.png, ch6-orange-block-v1.png, ch6-block-crack-v1.png are approved in the Art Library).
2. Gold cracks over the block, block falls apart into pieces that fade.
3. Colour ring spreading from the block across the whole map (grey patch to colour).
4. Boss and monsters shrinking back to ordinary things (ch6-chairman-shrink, ch6-peanut-normal, ch6-twig-plain, ch6-squirrel-ordinary are approved).
5. Encounters off in a freed area (flag per area; `ch6-clear` is the existing name, see engine/amber-spots.js).
Look first at: engine/oak-render.js (Old Oak Park is drawn from tiles, ground `park`, prop `picnic`), engine/amber-spots.js (how a left-behind block is drawn and made solid), engine/plate.js (grey patch draw functions, SUNDIAL_GREY is the model for a grey area drawn in code), engine/closeup.js. `ch6-picnic-grey` is not approved, so draw the grey circle in code from the park's own ground (like SUNDIAL_GREY) and say it is a stand-in.
Test: portrait and landscape with reaction_test.py (add a case on the Old Oak Park map), look at frames, smoke, push, tell Tom.

## Prompt for the next session
"Read claude/story-build.md and claude/next-addendum-ch6stage2.md. Continue the chapter 6 build at stage 2."
