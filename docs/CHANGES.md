## board-nightqa2 (2026-11-21): the night QA closed one more of your play cards, t-gem-bug01play, with pictures

Card c-night-qa, a second hand run after build nightqa (which another session had already shipped, so this push adds no code). Tom's play card t-gem-bug01play ("Lose to The Big One on purpose and check you are not stuck") is a yes or no fact, so it is closed with `machine.verdict` pass instead of waiting for Tom. Seen in a test browser in portrait, landscape and the Duo size (951x648): after a lost fight Deedee says "Up, up. Everybody up. Deedee will make it better.", the Big One fight starts again at once with no button pressed, and the third try (a win) runs the after-boss scene. Limit: the fight result was set the way the game sets it after a loss (`battle:bigone` = lose), the real fight screen was not played, and the browser is Chromium on a server, not the iPhone. Pictures: branch `night`, `qa/t-gem-bug01play/2026-11-21/`. Nothing else changed.

## hollowfence (2026-11-21): Grump Hollow monsters no longer slip past the boss fence after a story scene

- Cause (facts, measured by printing each monster's spot and home): a monster's `home` was set lazily on its first tick (`engine/feel.js` `b7MonsterTick`). The Mudling scene moves the other monsters around first (story staging), so Skeeter and Grump took their staged spot as home (for example Skeeter at 9,9 instead of 9,13). Wander and chase ranges are measured from home, so a displaced monster could stand or wander in places the fence test did not expect.
- Fix: `placeMonsters` (`engine/world.js`) sets `home` to the placed spot, so monsters walk back to their own spot after a scene. Nothing on the fence itself changed.
- Checked: `python3 tools/hollow_trail_test.py` 10 runs in a row.

## ch3lessons (2026-11-21): chapter 3's script cut by the chapter 1 and 2 lessons before it is built: 148 lines became 124 (24 cut, 4 rewritten, one orphan fixed), every voice script retagged
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



