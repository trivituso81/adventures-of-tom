# nightgreen: what is known (session of 2026-11-21, parts a to d shipped)

Card c-nightgreen. 12 rows of `tools/night/tests.json` carried `known_fail` (make-prompts.js was already in `skip`, so 12 not 13). There was no branch `night` yet (no night run had happened), so every failure was reproduced by hand with `CHROMIUM=$(ls /opt/pw-browsers/chromium*/chrome-linux*/chrome|head -1) PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 -I tools/<test>.py`.

## Done (known_fail removed, each pushed with its own build)

| Part | Test | Who was wrong | What it was |
|---|---|---|---|
| nightgreena | art-library__validate | test | the "no bake field" rule is for new modules only (39 built entries carry `bake` on purpose); item ids may use an underscore |
| nightgreenb | sw_test | test | hard-coded `data/monsters.js?v=size1`; reads the live tag now. Cold-load wait widened to 15 s (one run missed 10 late images) |
| nightgreenc | quest_test | test | a party banner ("Rose joined the party!") swallows all input after `chapterJump` (`engine/party-banner.js`): a test that clicks must press Enter until `partyBannerHeld()` is false AND the chapter intro scene is over; wiping `STORY.flags` restarts the chapter intro (copy the flags instead); `questPhrase` now says "Go to ..." |
| nightgreend | terminal_test | game | a Carry-On spawn at (6,10) stood inside the painted bench; moved to (6,8) |

## Still marked known_fail (8), cheapest first, with what was seen

| Test | Seen on 2026-11-21 | Guess (not tested) |
|---|---|---|
| griffith_test | FAIL "walked up the trail", "south exit leads to the Boulevard" (2 checks, about 1 min) | map exit or walk mask changed; compare with `python3 tools/reach_test.py <map>` and the Griffith map in `data/maps-la.js` |
| grands_walk_test | FAIL sofa aisle walkable, sofa/coffee table/end table blocks, a route ended at (5,6), two press-A checks (about 1 min) | the grandparents' room was repainted (room paintings rule) and the test still has the old furniture tiles: the test is probably stale, check the room's `solid` grid against the painting like terminal_test's debug did (crop `art/<room>.webp` with a tile grid) |
| rooms_test | not run | the `tomsuite` part; run it |
| art-library__test | `TimeoutError: Page.click ... waiting for locator [data-grp="Enemies|Test card"]` | the Library's group names changed; the test is probably stale |
| clip_kinds_test | not run (notes: fails before and after b3s8) | |
| clip_review_test | not run (notes: fails before and after b3s8) | |
| ch17_test | killed after 170 s: needs a longer limit (the manifest says 2 minutes; measure it, then write `minutes` back) | |
| ch20_test | FAIL from "door rose opens" onward (tom and grace doors pass); then core, lift, Leviathan, relays, Julian, epilogue, complete flag all fail | the test drives Battle 2 internals (`B2.foes`, `b2Do relay`); first find whether chapter 20 still runs on Battle 2 and why the Rose door does not open (the door answer dialog), before deciding test or game; if the chapter moved to Battle 3 the fight half of the test is of something that no longer exists (purge rule) |

## How a fix went, in order (so the next session does not rediscover it)

1. Run the test, read which checks fail, look at `tools/shots/` pictures.
2. When a Playwright click does nothing, log events at `window` capture and look for a capture-phase `stopImmediatePropagation` (`grep -rn stopImmediatePropagation engine/*.js`): that is how the party banner was found.
3. `python3 tools/night/manifest_check.py` after editing `tools/night/tests.json`; remove a `known_fail` by deleting only that line (the file is not in `json.dumps` format, edit as text).
4. Push: `## nightgreenX` heading in docs/CHANGES.md first, commit, `git fetch --depth=50 origin main`, `git rebase origin/main`, THEN `python3 tools/art-library/bump_tags.py nightgreenX --base origin/main`, commit, push. Main moves every few minutes (board-sync, other sessions): expect to drop the bump commit (`git reset --hard HEAD~1`), rebase and bump again. A conflict in docs/CHANGES.md: keep both, mine on top. A conflict in data/board.json: `git checkout --ours data/board.json` (that is upstream during a rebase) and add your card history line again. A refused push prints `! [rejected] HEAD -> main`: the text "HEAD -> main" is in that line too, so check for `<sha>..<sha>  HEAD -> main`.
5. A card history line per part goes in the same push.
