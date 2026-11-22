# nightgreen: DONE (parts a to m shipped, 2026-11-22; no row has known_fail)

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

| nightgreenm | ch20_test | test | two mistakes after the Leviathan fight: with all four barriers down the test pressed the first skill row, which does no damage to the Leviathan for Amy and Grace, so the boss sat at 5 HP and the fight ran out its 400 turns still open; then it forced `battle:leviathan` to win during the live battle. The plain Attack (cross up, then the target) ends the fight, and the game sets the flags, plays the shatter scene and starts Julian by itself. Run time 16 min to 223 s; `minutes` 5 |

## How a fix went, in order (so the next session does not rediscover it)

1. Run the test, read which checks fail, look at `tools/shots/` pictures.
2. When a Playwright click does nothing, log events at `window` capture and look for a capture-phase `stopImmediatePropagation` (`grep -rn stopImmediatePropagation engine/*.js`): that is how the party banner was found. When a scene seems stuck, print `intro.cur` (its `moves` list shows who is still walking) before blaming the game.
3. A test that teleports the player (`player.x=...`) must call `placeFollowers()`; a flag set is not a scene over (wait for no dialog, no intro, no transition, no step).
4. `python3 tools/night/manifest_check.py` after editing `tools/night/tests.json`; remove a `known_fail` by deleting only that line (and the comma before it; the file is not in `json.dumps` format, edit as text). `minutes` for a row is measured seconds / 60 * 1.2 rounded up (`tools/night/report.py`); the runner's limit is twice `minutes`, at least 3.
5. Push: `## nightgreenX` heading in docs/CHANGES.md first, commit, `git fetch --depth=50 origin main`, `git rebase origin/main`, THEN `python3 tools/art-library/bump_tags.py nightgreenX --base origin/main`, commit, push. Main moves every 10 to 30 seconds (board-sync, night jobs, other sessions), faster than the bump takes: after the bump commit, loop `fetch`, `rebase origin/main`, `push` at once (the bump commit rebases cleanly unless another session shipped a build, then `git rebase --skip` it and bump again). A conflict in docs/CHANGES.md: keep both, mine on top. A conflict in data/board.json: `git checkout --ours data/board.json` (that is upstream during a rebase) and add the card history line again; the file round-trips with `json.dumps(b, indent=1, ensure_ascii=False)` plus a newline. Rejected push: look for `<sha>..<sha>  HEAD -> main` in the output, not just the words HEAD -> main.
6. A card history line per part goes in the same push.
7. `python3 tools/smoke.py` fails today on `board_sync_test` (the test's made-up Last night card collides with the real `t-lastnight`, and the R5 replay of today) on a clean main too; not caused by this card.
