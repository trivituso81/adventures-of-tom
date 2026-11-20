# Chapter 1 handoff (updated 2026-11-13 ~19:20 PT). READ THIS FIRST, then claude/next.md for everything else. It supersedes section 9 and the chapter 1 row of claude/story-build.md.

Tom's prompt: "Read claude/ch01-handoff.md and continue."

## Status: chapter 1 BUILD IS LIVE on main with voice (a3e4095, tags voice3 then ch1fix1)
Done and pushed:
- ch1build1 (e562168): all 41 NEW and 2 CHANGED lines wired, scene ch1Spot, close-ups doorframe/coin/grin, The Big One with lure and coin (details docs/CHANGES.md `ch1build1`).
- voice3 (515c8c2): Tom's three exports merged: 43 chapter 1 lines, 32 Mr. Washington re-takes (Old voice marks cleared), 57 narr1 Narrator lines. unused_voice.py 0 on all five checks, smoke FAILS []. Export files were in /mnt/user-data/uploads this session (names ended local-clips-pending_4/5/6).
- ch1fix1 (a3e4095): Dragonfly Coin keepsake (`dragonflycoin`, data/party.js) given in ch1AfterBoss after Rose's "I'm keeping it"; Amy's "be nice to the slime" revisit line and Penny's "snacks for fights" intro line held back in chapter 1 until `ch1-theft` (when entry in data/maps-le.js, filter in engine/shop.js). closeup_ch1_test passes.
- Canon lines from story-ch01 were already in claude/canon-addendum.md (Cozy Rosie, Boppy health, gold teeth). Nothing to add.

## Not done (small, ordered)
1. New chapter 1 lines have no speaker moods or listener reactions (docs/emotion-index-lines.tsv, docs/emotion-reactions.tsv, then `python3 tools/emotion-apply.py $(seq 1 21)` (ALL chapters, never just 1) and `reaction-apply.py 1`). Needs the 41 new lines' moods written by hand.
2. Not looked at in frames: ch1Theft and ch1End in motion, ch1Pond in landscape, Duo for the spot scene, the unified playthrough from the chapter-select jump. Run `ROOT=$PWD python3 tools/reaction_test.py <cases> <out>` (cases in claude/next.md Tests; spot case: map hollow, scenes ["ch1Spot"], party tom grace rose deedee, start [15,11,"right"], flags ch1-tuts, unflag ch1-spot ch1-bulb).
3. Penny line check: the shop intro now drops the "snacks for fights" page before the theft; "things that go POP" was never a separate page in Penny's intro (it is in the same line), so it goes with it. Nickel in LA is untouched.
4. Boppy's grin frame as a real emotion-sheet face (chapters 13 and 14 reuse it) needs a Boppy sheet rebake: ask Tom first.
5. next.md was NOT rewritten this session (it is very large and other sessions edit it); its ORDER NOW list still stands: 4b bossbig1 leftovers, 3 Casa Alvarez, 4 close1 follow-up. The voice export waits in next.md are now done (narr1, washvoice1 lines merged in voice3; clipfix1 re-take list still open).

## Phone checks for Tom (title stamp `build ch1fix1` or later)
- START NEW or jump to chapter 1: door frame picture (press A), then Grace and Rose talk. Grump Hollow: walk east along the pond past the puddle fight: orange block on grey grass, pull, splash, the Big One with lure and coin. After the fight the coin picture appears, Rose keeps it (Rose's Keepsakes in the menu shows Dragonfly Coin). Kitchen table: Boppy's gold teeth picture.
- All new chapter 1 lines now play in your own recordings. Report any page that does not match its clip.
- Mr. Washington (chapter 12) and the narration boxes now play the new takes.
- Amy's house before the theft should not say "be nice to the slime"; Penny's first visit before the theft should not mention snacks for fights.
