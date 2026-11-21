# nightgreen: what is known (session of 2026-11-21, parts a to l shipped)

Card c-nightgreen. 12 rows of `tools/night/tests.json` carried `known_fail` (make-prompts.js was already in `skip`, so 12 not 13). No night run had happened, so every failure was reproduced by hand with `CHROMIUM=$(ls /opt/pw-browsers/chromium*/chrome-linux*/chrome|head -1) PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 -I tools/<test>.py`.

## Done (known_fail removed, each pushed with its own build)

| Part | Test | Who was wrong | What it was |
|---|---|---|---|
| nightgreena | art-library__validate | test | the "no bake field" rule is for new modules only; item ids may use an underscore |
| nightgreenb | sw_test | test | hard-coded `data/monsters.js?v=size1`; reads the live tag now; cold-load wait widened to 15 s |
| nightgreenc | quest_test | test | a party banner swallows all input after `chapterJump` (`engine/party-banner.js`): press Enter until `partyBannerHeld()` is false AND the chapter intro scene is over; wiping `STORY.flags` restarts the intro; `questPhrase` says "Go to ..." |
| nightgreend | terminal_test | game | a Carry-On spawn at (6,10) stood inside the painted bench; moved to (6,8) |
| nightgreene | griffith_test | test | the Griffith plate was repainted (`griffith2`): spawn (11,17), exit on row 18, rock below; the test stood at (11,19) and did not clear the party banner |
| nightgreenf | grands_walk_test | test | the room was repainted: sofa aisle closed, dining table at x13 to 15, new east lane at x12; three touches stood on unreachable tiles. Left alone: the room's `noGo` list names a few tiles that are rock now |
| nightgreeng | rooms_test | neither | already passes (5 rooms, twice); `minutes` 2 to 3 |
| nightgreenh | art-library__test | gone | deleted by the purge rule: it tested the pasted-key page (keysecrets1) and old entry counts; validate.js, review_test, keysecrets_test cover what is live |
| nightgreeni | clip_kinds_test | neither | already passes (3 runs) |
| nightgreenj | clip_review_test | neither | already passes (3 runs) |
| nightgreenk | ch17_test | test | two timing spots: a fixed 300 ms wait for the opening flag, and A pressed while the previous scene still played (`idle` wait added); `minutes` 2 to 5 |
| nightgreenl | ch20_test (part) | test | teleports left the followers behind, so each door scene first walked the party about 10 s (`placeFollowers()` after each teleport) |

## Still marked known_fail (1): ch20_test

It takes about 16 minutes (960 s); `minutes` is 20 now. Passing: the eight doors, the Core, the lift, the Leviathan boss in the fight, the four relays (chapter 20 still runs fight 1 and 2 on Battle 2: `B2.foes`, `b2Do relay` work, so the purge rule does not apply). Failing, in this order: `shatter scene to Julian` (waits for `ch20-shatter` true and a battle active, 500 Enter presses), `calm and epilogue to the end`, `game complete flag`.

Found so far:
- With chapter 20 set (`setChapter(20,{apply:false})`), the flags `ch20-open`, `door-*` (8), `ch20-core`, `ch20-heart`, `ch20-fight` set, the party placed with `ch17Place('foreverheart',10,12,'up')` and `setFlag('battle:leviathan','win')`, the game plays ch20Shatter (about 9 lines), sets `ch20-shatter`, `ch20-julian`, `ch20-fight2` and the Julian battle is active about 11 s later. So the scene, the trigger (`data/scenes-ch20.js` line 308) and the Julian fight work. Without `setChapter(20)` nothing fires (chapter stays 19): that was a wrong repro, not a bug.
- So the difference is in the state after a real Battle 2 fight 1: suspects are the victory card still open, `ch20Fight1`'s own scene still waiting on its `battle` op or running its defeat branch (heal and "Up. Everybody up"), `intro.active` held, or the test forcing `battle:leviathan` to win when the fight ended another way. Not checked yet.
- Cheap way to find it: do not run the whole test. Write a temporary script that copies the head of `tools/ch20_test.py` through the lift, plays only fight 1 with the test's `fight(pg,'levi')` (about 8 minutes), then prints `flag('battle:leviathan')`, `flag('ch20-shatter')`, `intro.active`, `intro.sid`, `dialog.active`, `battle.active` and the victory card state every second for 20 seconds with an Enter press each time, before any forced flag. Delete the script afterwards.

## How a fix went, in order (so the next session does not rediscover it)

1. Run the test, read which checks fail, look at `tools/shots/` pictures.
2. When a Playwright click does nothing, log events at `window` capture and look for a capture-phase `stopImmediatePropagation` (`grep -rn stopImmediatePropagation engine/*.js`): that is how the party banner was found. When a scene seems stuck, print `intro.cur` (its `moves` list shows who is still walking) before blaming the game.
3. A test that teleports the player (`player.x=...`) must call `placeFollowers()`; a flag set is not a scene over (wait for no dialog, no intro, no transition, no step).
4. `python3 tools/night/manifest_check.py` after editing `tools/night/tests.json`; remove a `known_fail` by deleting only that line (and the comma before it; the file is not in `json.dumps` format, edit as text). `minutes` for a row is measured seconds / 60 * 1.2 rounded up (`tools/night/report.py`); the runner's limit is twice `minutes`, at least 3.
5. Push: `## nightgreenX` heading in docs/CHANGES.md first, commit, `git fetch --depth=50 origin main`, `git rebase origin/main`, THEN `python3 tools/art-library/bump_tags.py nightgreenX --base origin/main`, commit, push. Main moves every 10 to 30 seconds (board-sync, night jobs, other sessions), faster than the bump takes: after the bump commit, loop `fetch`, `rebase origin/main`, `push` at once (the bump commit rebases cleanly unless another session shipped a build, then `git rebase --skip` it and bump again). A conflict in docs/CHANGES.md: keep both, mine on top. A conflict in data/board.json: `git checkout --ours data/board.json` (that is upstream during a rebase) and add the card history line again; the file round-trips with `json.dumps(b, indent=1, ensure_ascii=False)` plus a newline. Rejected push: look for `<sha>..<sha>  HEAD -> main` in the output, not just the words HEAD -> main.
6. A card history line per part goes in the same push.
7. `python3 tools/smoke.py` fails today on `board_sync_test` (the test's made-up Last night card collides with the real `t-lastnight`, and the R5 replay of today) on a clean main too; not caused by this card.
