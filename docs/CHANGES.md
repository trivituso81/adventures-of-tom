## dash2 (2026-11-21): the Admin Dashboard has its strip under the game: a bar that says when a newer build is live, five screen sizes, chapter and test fight jumps, Story battles, Difficulty, Mute and Report

Card c-dash2. Tom answered the first try (t-dash1-try) with All good and no written note, so there was nothing to change from it. Only `dashboard.html` (and its docs and test) changed; the game's own files were not touched, apart from the build stamp every push carries. Plan section "dash2: the strip under the game", drawings in `claude/dashboard-mock/`; facts in docs/DASHBOARD.md "The strip under the game (dash2)".

| Part | Result |
|---|---|
| Newer build bar | Appears when the site's newest real build (housekeeping builds skipped) is newer than the game frame's `BUILD_TAG`; Reload game runs the game's own `splashReload()`. Never reloads by itself. |
| Screen sizes | Duo folded upright and sideways, Duo open sideways and upright, Desktop wide (switches to the Battle layout). The Duo layout is forced for the game frame only (`forceDuo`, never `le-duo`); the frame's address keeps the true `?duo=` after `go=` removes it, so the game's own RELOAD lays out right from the first frame. |
| Story battles, Difficulty | The same settings as admin.html and the Battle Lab (`aot-b3-story`, `aot-diff`); Difficulty uses the game's own `b7SetDiff`. |
| Chapters, test fights | Chapter 1 to 20 and BONUS use the game's `splashGo(chapterJump(n))` (from anywhere but the title the game starts fresh first); the five new test fights open `index.html?go=new&i=N`, Show all adds the old Battle Lab fights; the fight on screen is marked. |
| Mute, Report | Mute puts one gain node of the dashboard in front of each audio output of the game frame (and silences spoken lines), is not saved and holds through a reload; Report opens the game's pencil tab or says the Report tab is off. |
| Left for dash3 | The Next for you column. |

Test: `python3 tools/dashboard_test.py` (272 checks incl. every size at 3440 x 1328 and 3440 x 1440, a stand-in newer build, a chapter jump from the title and from mid-game, both kinds of test fight, Mute through a reload, Report on and off); `python3 tools/smoke.py`.
## costs2 (2026-11-21): AI Costs fills itself in: a daily balance read and every paying job writing what its run cost

Card c-costs2. Tom's notes on the first look (t-costs1look) were "all good", so nothing in the page's layout changed for them. Facts and the table of what each service lets a job read: docs/COSTS.md "How the page fills itself in".

| Part | Result |
|---|---|
| Daily balances | New Action `costs-sync` (`tools/costs_sync.py`, 06:23 Pacific) reads ElevenLabs credits left with the repo key. fal and xAI are read only when the repo has the keys their docs require (fal: an admin scope key `FAL_ADMIN_KEY`; xAI: a Management key and team id, `XAI_MANAGEMENT_KEY` and `XAI_TEAM_ID`); a service whose key is refused gets one dated note and a line under Needs a look. One row a day per service |
| Spend logging | New `tools/costlog.py`. art-gen (xAI and WAN, with the QA checks), clip-gen (videos and gate checks), the Battle Guide take step, clip-gate, voice-gen (credits, also the board's voice job), wan-gen and the QA replay append their run to `usage`. A repeat of one run writes nothing. It never touches a job's own checkout |
| The estimate | A balance read earlier less the dollar use logged after it ("About $X until the next read"). ElevenLabs use is shown as credits and never taken off dollars. The service page lists the newest 40 use rows, newest first |
| Data | `data/costs.json`: xAI gets `usage_logged_from` 2026-11-21, its two gaps are rewritten, ElevenLabs and fal key notes name the secrets |

Tests: new `tools/costs2_test.py` and `tools/costs_fixture.py` (stand-in git remotes and servers, no paid call), W12 in `wangen_test.py`, a credits check in `voicegen_test.py`, the xAI row in `artgen_test.py`. `costs_test.py` no longer hard-codes the fal estimate (jobs add use rows, so it is worked out from the file). Not caused by this build and failing the same way on main before it: `clipgen_test.py`, `vision_test.py`, and the 258-line check in `voicegen_test.py`. Run through with a stand-in: costlog, costs_sync, art-gen, wan-gen, voice-gen. Wiring checked only (the code path was not run with a stand-in): clip-gen, the take step, clip-gate vision, the QA replay. Nothing paid was run.

## nightgreenf (2026-11-21): the grandparents' house walk test follows the repainted room

Card c-nightgreen, test `grands_walk_test` (`python3 tools/grands_walk_test.py`; failed the sofa aisle, the furniture blocks, the loop walk and two dining table touches). The test was wrong and the game was right: the painting (checked with `tools/mask_overlay.py grands`) has the sofa ending at x11, the dining table at x13 to 15 and a free lane down x12 from the hall arch to the open floor, and the walk mask matches it. The test still had the old furniture tiles (a walkable sofa aisle behind the sofa, a dining table from x12).
- `tools/grands_walk_test.py`: the lanes are the east lane (x12, rows 3 to 7) in place of the sofa aisle; the blocks check expects the sofa, the floor behind it, the coffee table, the end table, the counter and the dining set (x13 to 15, plus (12,8) and (12,9)) closed; the key-press loop walks counter aisle, nook, east lane, arch and ends at (10,4) beside the TV; the dining table touches are made from (12,6) and (12,7); the three touches that stood on tiles nobody can reach now (behind the sofa) are made from reachable tiles, and every touch now also requires a walkable standing tile.
- `data/maps-le.js`: only the comment above the grands `plateMask` is rewritten to describe the room as painted (no behaviour change).
- `tools/night/tests.json`: `known_fail` removed from `grands_walk_test`. Passes twice in a row (about 80 seconds). Not done: the one-tile `noGo` list of the room still names a few tiles that are rock now; it blocks nothing.

## nightgreene (2026-11-21): the Griffith Park test follows the repainted trail map

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



