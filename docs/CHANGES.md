## board-ch1voices (2026-11-21): a board card makes chapter 1's 10 missing voices with one tap

Tom (13:08): after playing chapter 1, voices were still missing; he asked for a card that generates them all. Every chapter 1 line the game can show (scenes, NPC houses, the six monsters, the cab trip pools) was checked against the baked clips in a real browser: 10 dialogue lines have no clip (Tom x2, Deedee x3, Boppy, Grace, Rose, Sal, Aunt Ellie; 1,313 characters, about 578 credits). New Tom card `t-ch1voices` carries them as `voices`, so Generate all voices (voiceboard1) makes them. Not in the card: Deedee's 3 battle barks (the voice job makes dialogue lines only, and Battle 3 plays no spoken move lines). No credits spent; the first paid run is Tom's tap.

## reports-2026-11-21 (2026-11-21): the phone picture under TNB's text in the chapter 1 cab scene now stays up until the scene closes it

Card c-reports-10, report r-20261121-125831-qvon. Tom: "the car in phone image should still be displayed while TNB is talking".
- Cause (stated as likely: I could not replay Tom's exact tap, only the state it left): a picture kept up with `keep:true` could be closed by any tap, click or A press in the moment between the picture settling and TNB's line opening. His report shows the picture gone while the line was on screen.
- Fix: a kept picture closes only when the scene closes it (`closeupRevealEnd(true)` from `ch1RevealEnd`); `engine/closeup.js`, `data/closeup-ch1.js`.
- Checked: replayed `ch1Sunday` in the browser (tablet size with Duo, and phone landscape): picture shown under TNB's line; calling the close at every 50 ms before the line appeared did not close it; the scene ended and the picture closed. Not looked at: Firefox, python smoke.

## guardwin1 (2026-11-21): Tom now does the victory celebration when a fight is won while his guard is up, instead of staying in the guard pose
## nightqa (2026-11-21): the night QA exists: a standing card that sorts Tom's play cards each night, two detail lines on the board page, and the rule that stops yes or no checks reaching Tom

Card c-nightqa (plan claude/night-plan.md section 8). Built: the standing card `c-night-qa` (nightly, Sonnet 5.5 medium, prompt holds steps 2 to 4 and the limits word for word); the `machine` field shown in a card's details as "Checked by the night QA" (what was seen, picture links to branch `night` under `qa/`) or "Needs your eyes" (why), with cases in `tools/board_test.py`; the Last night card ends with "Limits of the night QA" (`tools/night/lastnight.py`); the nightqa1 rule in CLAUDE.md. First night, run by hand on the 4 oldest play cards: t-alvarezplay, t-ch2play, t-ch6play, t-gatezeroplay all sorted YOURS (looks, sound, motion, timing); none closed, none failed, no pictures because no check was a provable fact. Tests: board_check ok; night_test ok; board_test's new cases pass (the run stops later at an old `#bcopy` wait that also fails without this change here); board_sync_test R5 and smoke's heights check fail with and without this change.



