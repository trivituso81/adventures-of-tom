## nightclean (2026-11-21): the nightly cleanup is built, and the first pass removed 6 unused tool scripts

Card c-nightclean, `claude/night-plan.md` section 7, steps 1 to 6 (no rule of the plan changed).
- `tools/night/clean_report.py`: sizes with change since the last report, files nothing names (161 today), identical files (15 groups), tests `known_fail` over 7 nights. No AI, no network. `known_since` on a `tests.json` row sets the age; none is recorded yet, so the count is 0 for now.
- `tools/night/rules_check.py` and `tools/night/rules.json`: 26 standing headings and 54 quoted sentences of CLAUDE.md and `claude/handoff-rules.md`, taken from main today. `tools/smoke.py` runs it; a cleanup can shorten the story around a rule, never drop the rule or Tom's words.
- `tools/board_archive.py`: Done cards leave the board after 2 days (was 7). `tools/board_archive_test.py` updated (the edge case is now 2 days).
- Standing card `c-night-clean` (nightly, tag `nightclean`, Sonnet 5.5 medium): one bucket a night, A to D by days since 2026-11-21 modulo 4, with the "Never touched" row in its prompt.
- Tests: `python3 tools/night/clean_test.py` (new, in `tools/night/tests.json`; also added the missing row for `dashboard_test`), `board_archive_test.py`.
- Tonight's pass, bucket A. The report listed 161 files; 118 have no reference anywhere by `git grep -IF` of the file name and of the name without extension. Of those, 104 are art files in `art/props/` and `art/closeup/` (names are built at run time by prefix) and 8 are `tools/art-library/tombo-split/dc-*.js` (loaded by directory listing): all left alone. Removed 6 tools scripts, none from the "Never touched" row:
  - proof: `for f in blvd_behind_shots row_behind_shots town_behind_shots cut_grace_from_ai cut_grace_hero baked_extract; do git grep -IF "$f"; done` printed nothing outside the files themselves (each also checked with its extension).
  - `tools/blvd_behind_shots.py`, `tools/row_behind_shots.py`, `tools/town_behind_shots.py` (one-off screenshot checks of old map plates), `tools/cut_grace_from_ai.py`, `tools/cut_grace_hero.py` (one-off cutters), `tools/clip-audit/baked_extract.js` (a byte-identical copy of `dump_clips.js` with a path of another machine).
  - Not touched though unnamed: bakers `bake_*.py` and `sheet_loose.py` (imported by name), `tools/art-library/*-prompts.js` (read by the Library page).
  - Voice: report only.

## win3skip (2026-11-21): the WIN NOW button is back in battle screens

Tom: "when the option to auto win is turned on i dont see the corresponding button in batle screens anymore." The button only existed in the old battle screen (Battle 2); Battle 3 had none.
- `engine/b3-ui.js`: WIN NOW button next to the speed button, shown only when OPTIONS > WIN NOW BUTTON is ON and the fight is real (not the Battle Lab). It ends the fight on the normal win screen at the next safe moment (between actions), so rewards are paid as usual (`b3SkipFight`, `b3DoSkip`).
- `tools/b3_skip_test.py`: button shows only with option on and not in the Lab; pressing it ends in a win and calls onEnd. Passed.

## board-deedee-dodge-r4 (2026-11-21): Deedee's Dodge try with her figure at 80% missed (arms off the frame again), not shown to you; the duck wording is staged next

Card c-anim-deedee-dodge-y4m3. Wan job `deedee-dodge` rev 4 (prompt `wan-deedee-dodge-v3.txt` word for word, `pad: 0.8`), wan-gen run 44946098349, $0.50 (ledger $48.59).
- Plan 4.4: feet on one row (1,122 to 1,123) in all 150 pictures, same woman, flat magenta, no flying object (nothing detached over 12 px). FAILED: her front hand runs off the left edge in 25 pictures (25 to 50), and she lunges forward into a wide squat toward the monster instead of leaning back (head 179 px to the left). Measured clip gate: `edge` 25, `dodge_forward` 0.178 (limit 0.04).
- Stop-loss: arms off the frame three tries in a row (rev 2, 3, 4), the last with room around her. Not baked, not handed to Tom. Her dodge still slides her idle video (`b3cStandIn`).
- Staged next (one change from v3, taken from two passes): `wan-deedee-dodge-v4.txt` is Rose's passed duck prompt (`wan-rose-dodge-v2.txt`) word for word, job rev 5, `pad: 0.8` kept. Not run.

## nightshift (2026-11-21): queued cards start by themselves between 11 pm and 3 am, and Tom reads one card each morning

Card c-nightshift, `claude/night-plan.md` section 5, steps 1 to 7 as written (no rule of the plan changed).
- `data/board.json`: the `night` object (`enabled`, `max` 5, `from` 23, `to` 3, `fixes_until` 6, `tz` America/Los_Angeles, `log`).
- `tools/board_sync.py` rule R14 (`r14_night`, `night_ok`, `r14_ran`, `r14_report`): window by Los Angeles clock (`zoneinfo`, so daylight saving is right), cap, one at a time, order standing then night-test fix then oldest queued; never Opus, a raised effort, backlog, `night: false`, an open blocker or a paid run. Standing cards (`nightly: true`): the heading `<tag>-<mmdd>` sets `last_run` and returns the card to Up next; `night: ran <id>` does the same for a run with nothing to do; 10 history lines kept.
- `tools/night/lastnight.py` writes the card `t-lastnight` (Ran, Shipped, Tests, Closed for you, Needs you, Starts used) at the first run after 06:00; it reopens when something is new and stays Done on a quiet night.
- `board.html`: Night shift ON or OFF chip (two taps, commits `board: night on` and `board: night off`) and "Runs every night. Last run ..." in a standing card's details.
- CLAUDE.md section "Night runs" and a board paragraph; the same paragraph in `claude/handoff-rules.md` (the Project copy needs it).
- Tests: `tools/board_sync_test.py` (new R14 cases, one per row of the plan's table), `tools/board_test.py` (chip and standing card line). `board_check.py` passes. Two older cases already failed before this build and still do (R5 replay of 2026-11-20 and the unstick card check) and `board_test.py` has live-board drift failures (top line counts, copy prompt of the live first ready card).

## nightgreend (2026-11-21): a Carry-On in Terminal Zero no longer stands inside a bench

Card c-nightgreen, test `terminal_test` (`python3 tools/terminal_test.py`; failed "every monster on reachable floor"). The Carry-On spawn at tile (6,10) is inside the painted blue bench on the left of the terminal (a solid tile no one can walk onto), so a monster stood in furniture. The test was right and the game was wrong.
- `data/terminal-monsters.js`: that Carry-On spawn moves to (6,8), open floor just above the bench. The other seven spawns are unchanged.
- `tools/night/tests.json`: `known_fail` removed from `terminal_test`. All checks pass (reachable objects, monsters, wing triggers, exits, Gate Zero return). Look: the first Carry-On in the Terminal now waits above the left bench.

## hitspeed1 (2026-11-21): getting-hit animations in a fight keep real-time speed on a slow phone

Card c-hitspeed1. Tom (11-21): "the speed of the getting hit animations in the battle guide look good but in the game they are too slow - can they match the guide?"
- Cause: the clip data and the 1x playback are the same in the Guide and the game, but the game counted at most 0.05 s per frame, so a phone under 20 frames a second played every clip and beat in slow motion. The Guide's own cap is 0.1 s.
- `engine/main.js`: while a fight is on, one frame may count up to 0.1 s (0.05 s everywhere else).
- Measured in a real browser: with the CPU slowed 4x, Grace's hit clip (933 ms) took 1473 ms before and 1081 ms after; Rose's (2044 ms) 2490 ms before and 2369 ms after. A fast computer already matched (933 and 2084 ms). Not measured: a real phone. A phone under about 10 frames a second will still play slower than the Guide.
- Tests: `python3 tools/b3_test.py s8` passes (FAILS: []). Tom card: t-hitspeed1-try.
## nightgreenc (2026-11-21): the quest tracker test knows about the party banner, the kept flags and the "Go to" wording

Card c-nightgreen, test `quest_test` (`python3 tools/quest_test.py`). The tracker itself works; three things in the test were stale:
- After the chapter jump the game shows "Rose joined the party!" and that banner holds all input until dismissed (`engine/party-banner.js`), so the test's clicks never reached the page. `skip_intro` now presses Enter until nothing has been active for 1.5 s (banner, then the chapter's intro scene).
- The baseline wiped `STORY.flags`, which restarts the chapter's intro scene and hides the quest button. It now copies the flags (a new object is still a fresh baseline for the tracker) and clears only the Art, Music, Gym and done flags.
- `questPhrase` turns a bare place into an instruction, so the log now reads "Go into the school" and the tracker "Go to the Cafetorium, at the east end of the hall." Two expectations updated.
- `tools/night/tests.json`: `known_fail` removed from `quest_test`. All 16 checks pass. Nothing in the game changed.
## fix-itemdefplay (2026-11-21): item banners no longer name old battle stats, and a banner can't close half faded in

Gemini ch1 run, C11 (card t-itemdefplay): "On the Dragonfly Coin (KEY ITEM) banner ... the card began fading in over the map ... and auto-dismissed mid-fade-in" and "IN BATTLE is wrong/unclear for Battle 3 because it names removed Battle 2 stats ... Wear it: +18 HP, +4 GRIT, +1 COOL" (Pond Hoodie), "Wear it: +5 POW" (Bark Slab); related X-07, Boppy's Cap "GRIT +10%".
- `data/item-defs.js`: Battle 3 reads no worn gear stats, so every Wear it line of a piece that only had old stats or a stat perk now says it doesn't change a fight yet (`ITEM_BATTLE_OLDSTATS`); the Pond Hoodie, Bark Slab and Boppy's Cap have their own joke lines in `ITEM_BATTLE`. Lines for other perks (heals, coins, immunities) are unchanged; I did not check that Battle 3 plays those.
- `engine/party-banner.js`: `PB_MIN` 450 to 800 ms. The fade-in is 350 ms, so a press landing just after it could close the card before it read. I could not reproduce Gemini's exact auto-dismiss; this is the likely cause.
- Cookie (decision): the expectation was outdated, not the game. Deedee stands in her kitchen only while she is not in the party; the cookie is reachable then (before recruiting her, or after she leaves). Card t-itemdefplay now says so.
- Not changed: the Menu > ITEMS line for Boppy's Cap still shows the Battle 2 stat (Battle 2 still runs chapters 5 to 10). In-game pencil report r-20261121-120404-lwe8 is about toads, not this, left open.
- `tools/itemdef_test.py`: waits longer than 800 ms before presses; new D7 fails if a Wear it line names a Battle 2 stat. Passed.
## anim-deedee-dodge-y4m3a (2026-11-21): Deedee's Dodge: one more Wan video ordered, the same prompt with her figure at 80% of the frame (video being made)

Card c-anim-deedee-dodge-y4m3, part a. Wan job `deedee-dodge` rev 4: prompt `wan-deedee-dodge-v3.txt` word for word, one change `pad: 0.8` (the change that kept her spread hands inside the frame on her victory). The video and the bake follow in build anim-deedee-dodge-y4m3.

## anim-tom-loungepass-ding (2026-11-21): a short ding plays on the sparkle of Tom's Lounge Pass Flex

Card c-anim-tom-loungepass-ding (Tom: "a little like ding sound with like a sparkle"). The video is untouched. New `data/b3-sfx.js` (`B3_SFX_NOTES.ding`, three short bell notes); `engine/audio.js` `sfx.ding` plays it; the move row in `data/b3-kit-tom.js` has `anim.sound={at:9,sfx:'ding'}` (clip picture index 9 = baked picture 10, 600 ms in); `engine/b3-play.js` fires it when a clip move starts (timed from the clip's own `ms`); the Battle Guide player (`battle-guide.html`, `playNotes`, `soundOf`) plays the same notes when that picture shows. Any other move can use `anim.sound` the same way.

## dash1 (2026-11-21): the Admin Dashboard page for the wide monitor: Board, game, Battle Guide and Admin side by side

Card c-dash1 (plan `claude/dashboard-plan.md`, drawings `claude/dashboard-mock/`). New page `dashboard.html`, opened from ADMIN > Admin Dashboard (first button in What is next). No existing page changed except `admin.html` (the button) and `tools/admin_hub_test.py`.
- Four frames of the real pages: Board 1000, game 951 (at 951 x 648 with the Duo layout), Battle Guide 829, Admin 620; Battle layout 520, 1600 (game at 1600 x 900, Duo off), 860, Builds 420. Top bar 44, pane header 40, 8 px gaps, the Board's colours. Builds fills the space under the game until dash2.
- Links stay in the pane that owns the page (also when a script moves a pane), Ctrl 1 to 4 and a click move the keys (gold frame and KEYS HERE), Change page lists every tool of `admin.html`, Reload, Open in its own tab, Make this pane big (Esc puts it back). Top bar shows the For you and Claude counts, the live build and the token state.
- The game frame gets the Duo layout without touching the shared `le-duo` setting: the dashboard answers `detectDuo` for that frame only. Ctrl 1 to 4 works from inside the game because the dashboard adds its key listener to each new page before the page's scripts run.
- `python3 tools/dashboard_test.py` passes at 3440 x 1328 and 3440 x 1440 (screenshots in `tools/shots/dashboard-*.png`). `docs/DASHBOARD.md` and a row in CLAUDE.md "Where things live" written.
- The first push of this session (`board: start c-dash1`) found `claude/dashboard-plan.md` and `claude/dashboard-mock/` missing from main: the push `guidestatus1-restore` had deleted them (it restored other files from an older base). They were back on main again before this push.










## reports-2026-11-21 (2026-11-21): the Hollow's toad is drawn in front of the foliage, not behind it

Report r-20261121-120404-lwe8, Tom: "the large toads in the upper left corner should not be behind the cutout in this case".
- `engine/world.js` (`placeMonsters`): the toad in Grump Hollow gets `plateTop`, so the painted foliage cutout no longer pulls over it (same flag the Mudling used on the baking island).
- Looked at: Grump Hollow in landscape after the change, the toad sits clear of the leaves. Not looked at: the toad while it wanders to other tiles.
## nightgreenb (2026-11-21): the service worker test reads the game's live tag instead of the old ?v=size1

Card c-nightgreen, test `sw_test` (checks 3 and 4a failed). The test replaced `data/monsters.js?v=size1` in a copy of index.html, but the game's tag for that file is now `qa-coh02`, so the replace matched nothing, the "bumped tag" page never asked for a new file, and 4a and 4b failed (3 passed on a rerun). The worker was right; the test was stale.
- `tools/sw_test.py`: reads the current tag of `data/monsters.js` from index.html (`MON_TAG`) for checks 3, 4 and 6. One cold-load run missed 10 late prop images with a 7.5 s quiet window, so the wait for the worker to finish saving is now 15 s of no new file.
- `tools/night/tests.json`: `known_fail` removed from `sw_test`. Four full runs: three clean, one flake of check 1 and 2a that the wider window removed (a fifth run clean). Nothing in the game changed.
## guideprompts1 (2026-11-21): every battle animation in the Battle Guide now has a prompt written for that move

Card c-guideprompts. Tom (11-21): "why is this the prompt for cartridge blow, it seems generic".
- `data/guide-prompts.json` holds 267 model-written prompts (family 70, monsters 197) that replace the rule-made starter drafts; `data/guide-anims.json` was rebuilt, so the Battle Guide shows them as written by the model. Jobs, entries and used prompts are untouched: the 79 animations that already had a real prompt are the same.
- Cartridge Blow now reads: he brings a game cartridge out from behind his back, raises it to his mouth, and blows into it once. (Before: both palms thrust forward as if casting a spell.)
- Every prompt keeps the approved shape (the part before MOTION word for word, two to four sentences, once, without repeating, a held pose) and passed the code checks. Cost of the three paid runs about $0.41 of text calls, no video made.
- Looked at: Cartridge Blow and 14 sampled prompts (family and monsters). Not looked at: all 267 one by one; each video you make from the guide is the check, and Update the prompt on the page changes one.
- `python3 tools/guidegen/build_map_test.py` now counts model drafts as drafts. One check there already failed before this build and still does: "Lounge Pass Flex: its prompt is its job's current rev file" (the tom-loungepass job is at rev 6 and the guide picks v3); not touched here.

## buildpill2 (2026-11-21): the build name is a tappable pill in the Battle Guide header and on the Board cards and card details

Card c-buildpill2. Tom (11:53): "in the battle guide, remove the build name from above the page title and put it to the right of the title, in a our standard build pill treatment, click/tap should open the existing build modal." And (11:55): "in the kanban board, the build name treatment should be the in the pill as well, and displayed more prominently in both the board card and the card details in any relevant card".
- `battle-guide.html`: the "Game build ..." line above the title is gone; the build is a green pill (the Builds screen's live pill) right of "Battle Guide". Tapping opens `builds.html?build=<name>`, the existing build details sheet. Narrow screens (480 px and under, a folded Duo): Search is an icon and Lab is reached through Admin so the pill keeps room.
- `board.html`: `buildPillOf` and `buildHtml`. The build is the same pill, larger, right under the card title and in the details header (it moved up from the bottom bar), with a short state beside it. Colors as on the Builds screen: red your test, amber being built or not shipped yet, green shipped. Shown on a Tom play card (as before) and on a Claude card that is in progress or shipped. Tapping opens the build's details.
- Test: `python3 tools/board_build_test.py` (now looks for the pill in the card and the sheet header), `python3 tools/battle_guide_test.py`.
- Tom card: t-buildpill2-try.

## guideprompts1c (2026-11-21): the prompt writer no longer turns the game's hit-type labels into props

Card c-guideprompts. Looking at the 267 prompts from the first run, 92 used a game label as if it were an object or action (a monster "holds a racket behind its back" because its hit type is Racket, "as if performing a ground sweep").
- `tools/guidegen/draft.py`: the model is told that racket, clobber, drench, razzle, sizzle, melee, ground sweep, guard stance and announced are labels for the kind of hit, and no longer sees the flavor and tag lists; the same words are refused in code unless they are in the move's own name or its starter. The script now rebuilds the starter drafts itself (`load_guide`), so it works whatever `data/guide-prompts.json` holds.
- `python3 tools/guidegen/draft_test.py` covers a label used as a prop and a label that is in the move's name. Those 92 are written again; the other 175 are kept.
- Nothing in the game changed.

## nightgreena (2026-11-21): the Art Library check no longer fails on gate and item pictures that carry a bake field

Card c-nightgreen, test `art-library__validate` (`node tools/art-library/validate.js`). It failed with 41 problems, not only the clip-rose-strike one the old note named: 39 entries (14 story gates, 18 item sheets, 2 item redos, 3 solo items, one background) carry a `bake` field on purpose, and 2 solo item ids use an underscore because they are game item ids (`amy_chm1`, `g_bsash`). The game was right; the check was wrong.
- `tools/art-library/validate.js`: the "no bake field" rule applies only to a new module (`--module`), where it guards the bulk load; the built json may carry `bake`. The id pattern allows an underscore.
- `tools/night/tests.json`: `known_fail` removed from `art-library__validate`. It passes (1123 entries, OK). Nothing in the game changed.

## guideprompts1b (2026-11-21): the prompt writer keeps each character's own pronoun, including Nara's "it"

Card c-guideprompts. The first full run wrote 258 of 267 prompts for $0.27; nine came back as "check this one": eight were Nara (the starter says "From its starting relaxed stance" and the model wrote him or her) and one was a TNB move.
- `tools/guidegen/draft.py`: the pronoun rule now says exactly what is wrong ("uses she but this character is his") so the one retry can fix it; "it" and "its" stay free for a prop; the prompt tells the model to copy the starter's own pronoun and that Nara is a dog (paws, mouth, head and tail, no arms).
- `python3 tools/guidegen/draft_test.py` covers a dog motion that keeps "its" and one that says "her".
- All 258 prompts already written still pass the new check. Nothing in the game changed.

## anim-tom-loungepass-fix1 (2026-11-21): Tom's Lounge Pass Flex again: a quick take-out and sparkle, then most of the clip is his arm held out and a snooty limp-wrist swat

Card c-anim-tom-loungepass-fix1. Tom (10:33): "Lounge pass him taking it out and the sparkle should be very fast, the main part of the animation should be him extending his arm and swatting with it"; then "yes" (11:27) to the recommended next try.
- Kept: prompt `wan-tom-loungepass-v3.txt` word for word (written in anim-tom-loungepass-fix1's first try, see anim-tom-dodge-ner3), `pad: 0.8`, Wan 3.0, 720p, 9:16, 5 s, seed 81, the start picture as first and last frame.
- Changed (one change, the fault of rev 4 and rev 5: the outstretched arm ran off the left edge): new job option `shift` in `tools/art-library/wangen.py` (`shift_frame`; test W11 in `wangen_test.py`) moves the framed figure right by a share of the frame width, never closer than 3% to the right edge. Job `tom-loungepass` rev 6 uses `shift: 0.2` (144 px): the figure spans 296 to 676 of 720, so the room on his left doubled from 152 px to 296 px.
- Video: wan-gen run 44941351339, `art/raw/clips/wan-tom-loungepass-v3.mp4`. Plan 4.4: quick take-out, card flashed up by his face with a smile and the sparkle on its top right corner, arm held straight out with the card, wrist flicks the card down, back into the pocket; the same Tom; standing height first 991, last 991; feet on row 1,135 in every picture; no picture touches an edge; background flat; last against first 0.72 of 255. His face is a smug sideways glance with the chin a little up, not the half-closed eyes of the lf2z clip. Measured clip gate: no flags.
- Bake (the take-out still used about 1.8 s of the video, so the bake sets the pace): video 12 to 72 every 4th at 2x, 74 to 110 every 3rd at 1x (the arm and the swat), 113 to 132 every 4th at 1.5x; 34 pictures, 2.8 s, HIT on video 98 (the swat). `data/clips/tom-loungepass.js`, `art/clips/tom-loungepass.webp` (11.2 MB in phone memory). Purged: `art/raw/clips/wan-tom-loungepass-v2.mp4`. `data/guide-anims.json` rebuilt.
- Spent: $0.50 (one video). The card in all: $1.50.
- Tom card: t-anim-tom-loungepass-lf2z-watch (back to you). Card c-anim-tom-loungepass-ding now times the ding to baked pictures 9 to 11.

## fix-hollowtrail-play-3 (2026-11-21): Grump Hollow: the fishing-spot scene no longer starts before the Log Lump is beaten

Card c-fix-hollowtrail-play-3 (Gemini C1, X-06). The ch1-spot trigger covers x 14 to 22 and needed only ch1-tuts, so walking into the middle clearing started Boppy's fishing-spot scene early; that set ch1-spot, which blocked Grace's second line and the third leg of wrappers. It now also waits for the Log Lump to be beaten (saves from before the trail existed are unaffected). Not changed: the Goal popups. Goals update in the quest log only; a popup banner per leg is a separate decision for Tom.

## nighttests (2026-11-21): every test of the game runs each night on GitHub, and a test that newly fails becomes a fix card

Card c-nighttests, plan `claude/night-plan.md` section 6. Tom (11-21): "tasks ... that execute, test, file cleanup, code cleanup and refactoring" while he sleeps.
- `tools/night/tests.json`: one row per test (210 rows: every `*_test.py` and `test.py` under tools/, `smoke.py`, `b3-sim.js check`, `validate.js`), six groups balanced by estimated minutes, 11 rows `known_fail` from the failing list in `claude/next.md`, 4 scripts in `skip` with a reason. `tools/night/seed.py` made it (`--rebalance` redoes the groups).
- `tools/night/manifest_check.py` (called from `tools/smoke.py`): fails when a test script is in neither the rows nor `skip`.
- `tools/night/run_tests.py <group>`: one row after another, time limit twice its minutes, a failing row is run again once (passes the second time = flaky, never a card), `FAILS: [..]` counts as a failure even with exit 0, paid keys removed from the environment.
- `.github/workflows/night-tests.yml`: cron `23 11 * * *` (3:23 am in winter), `workflow_dispatch` (inputs `group`, `only`), 6 machines at once (`fail-fast: false`, 4 hours each), no paid secret, then the `report` job.
- `tools/night/report.py`: writes `tests/<date>.json` and `tests/latest.json` on the orphan branch `night` (never merge it), compares with the night before and adds one Sonnet 5.5 medium fix card `c-nt-<test id>` (`fix_of: night:<id>`) per test that newly fails with no open card; the first night is a baseline and adds no cards.
- Test: `python3 tools/night/night_test.py` (made-up manifest with a passing, a failing, a flaky and a known-failing row; the diff; the card passes `board_check.py`; a full report against a local remote).

## fix-qa-bug03-look (2026-11-21): Townsfolk in the Square and the Row stay off every roof, sign, weathervane and house edge, checked by a 5 minute watch

- Gemini's chapter 1 run (build voicepurge221, C12 FAIL): "two townspeople (the brown-haired boy and straw-hat boy) stood directly on top of the SNAIL MAIL sign" at 0 s, "the brown-haired NPC walked directly onto the right wall/edge of Aunt Ellie's House", plus X-01 (snail weathervane) and X-02 (SCHOOL sign plaque).
- Facts: qa-bug03 only listed tiles reached in a 25 second run. A headless watch (the game's own `updateNPCs`, 10 runs of 300 simulated seconds per map) still reached 21 more tiles in `town` and 16 in `row` where painted foreground covers more than 2% of the feet box (weathervane, sign brackets, SCHOOL plaque, house edges). Pip also started on the weathervane tile (4,12), which is the "at 0 s" case.
- Change: all 21 and 16 tiles added to `noGoRoof` (`town`, `row`, `data/maps-le.js`); Pip's start moved from (4,12) to (3,12).
- Test: after the change a watch of 40 runs of 300 simulated seconds (200 minutes per map) reaches 53 tiles in `town` and 25 in `row`, none with more than 2% foreground; every starting tile is clear too. No in-game pencil reports were open.

## wanch2a (2026-11-21): the old painted battle poses are gone from the code; the Bog Toad's Body Slam and the Skeeter's Mosquito Whine are videos

Card c-wanch2, part a. Tom's words on c-idea-tomgrace: "For Tom Grace and Rose and Deedee ensure that no old painted frames are ever used in battle. Only new video animations". The painted states had stopped being drawn for the four in idea-tomgrace; this build removes them from the code (CLAUDE.md purge rule).

| What | Change |
|---|---|
| Purged | `B3_BODY_PAINT` (data/b3-clips.js); `b3PaintState`, `B3_GUARD`, `b3GuardDraw`, `b3GetUp`, `b3DrawScaled`, the painted hit, dodge, run, victory, fidget and ko parts of `b3DrawMember` and `b3KoDraw`, `B3P.gd`, `B3P.fidAt`, `B3P.stage` (engine/b3-play.js); the Lab row PAINTED STATES: CHAPTER 1 (`b3LabPaintedStates`, engine/b3-lab.js), its link in battle-lab.html and engine/splash.js; `engine/pose-review.js`, `data/pose-review.json`, the board rule `poses_reviewed` (tools/board_sync.py and its test); docs/BATTLE3.md "Painted body states" (replaced by "Family body states are videos only"). |
| Kept | The dodge slide the stand-in uses, renamed `B3_DODGE` and `b3Slide`; `b3KoDraw` for a fighter who is not video-only. |
| Battle Guide | A video-only member lists all seven family states; one with no video says NO VIDEO YET (the OLD PAINTED POSE badge is gone). `tools/guidegen/build_map.js` writes no `painted` field. |
| Monster videos (full Grok, prompts word for word, wanch1 stop-loss) | Bog Toad Body Slam (`toad_slam`, v3: stays in the frame, the lily pad stays on) and Skeeter Swarm Mosquito Whine (`skeeter_whine`, v3: the small mosquitoes stay) are wired in data/b3-foes-ch01.js. |
| Not made | Skeeter Swarm Darting Bite: full Grok v3 kept the small mosquitoes but the big one darted left, turned side-on and never came back; the one retry (MOTION without "darts forward once and") grew the big one, lost half the swarm and again did not come back. Stop-loss: listed. Its baked v3 file and script tag were removed. |
| Spend so far | xAI $1.00 (4 videos). fal: see wanch2. |
| Tests | `video_only_test.py` FAILS [] (V2 now checks the painted-state code is gone), `wanproof_test.py` FAILS [], `b3_test.py s8` FAILS [], `guidegen/build_map_test.py` FAILS [], smoke (portrait and landscape). `board_sync_test.py` has 3 failures that were there before this change (R5 replay and the unstick card). |
## fix-ch1flight-2 (2026-11-21): the chapter 1 cab scene edit of fix-ch1flight is back in data/scenes.js

Card c-fix-ch1flight-2 (Gemini's chapter 1 test, C2 FAIL). Checked on main first: `SCENES.ch1Sunday` had lost the edit (a later push overwrote it).
- Re-applied: `{ch1Reveal:'phone',keep:true}` (picture stays up under TNB's text), `{ch1RevealEnd:true}` after the text, `{trip:'west',quiet:true}` (no girls or Deedee goodbye, straight to the flight). Nothing else touched.
- Checked: scene loads in the browser with those steps and no page errors. Not played end to end here (no Python playwright for smoke).

## guidestatus1-restore2 (2026-11-21): housekeeping: undoes the guidestatus1-restore push, which reverted other sessions' work, and puts back three change notes

Card c-guidestatus. Two pushes of mine were rebased badly. guidestatus1 dropped the docs/CHANGES.md entries fix-anim-grace-squeeze-qxim, board-night and b3s18b and re-added the purged `art/raw/clips/wan-grace-squeeze-v3.mp4` and its prompt; guidestatus1-restore then reverted 19 files of other sessions (the dashboard plan and mocks, chapter 8 and 9 story fights b3s18c and b3s18d, wangen-jobs.json, voice and script indexes). This push puts every one of those files back exactly as they were before guidestatus1-restore, removes the v3 files again and restores the three notes below guidestatus1.

## board-dashboard (2026-11-21): seven cards to build the Admin Dashboard for your wide monitor, with the plan and the two drawings you approved

Tom (10:56): "design a view for my extra wide monitor (3440x1440) when im using chrome... view the battle guide, admin panel, kanban board, and maybe even the game all at the same time". He saw two to-scale drawings and said (11:19): "ok looks good, create the kanban cards we need ot execute this properly".

| Card | What |
|---|---|
| c-dash1 (Up next) | `dashboard.html`: four panes, the All four and Battle layouts, pane buttons, the keyboard frame, links that open in the pane that owns the page. Sonnet 5.5, high. |
| t-dash1-try | Tom tries it on the monitor and pastes the GitHub token once in Chrome on the Mac. Blocks c-dash2. |
| c-dash2 | The strip under the game: newer build bar with Reload game, screen sizes, jumps, Story battles, Difficulty, Mute, Report. Sonnet 5.5, high. |
| c-dash3 | Take me there: a play card carries its place; On your phone for checks that need the phone. Sonnet 5.5, high. |
| t-dash3-try | Tom tries the strip and Take me there. Blocks c-dash4, which then starts by itself. |
| c-dash4 | Search across cards, builds, the Battle Guide and tools; the Art review and Story layouts. Sonnet 5.5, medium, auto. |
| t-dash4-try | Tom tries search and the two layouts. |

- Plan, the facts proven with the real pages side by side at 3440 wide, and the traps found: `claude/dashboard-plan.md`. Drawings and their markup: `claude/dashboard-mock/`.
- Decisions taken from his "looks good" (the four recommended options): pane order Board, Game, Battle Guide, fourth pane; the game starts at the Duo open size; Admin is the fourth pane; a look, text or rules check in the dashboard counts as All good, touch, sound and speed stay phone checks.
- Board and notes only; no page or game file changed.

## b3s18d (2026-11-21): chapter 9's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s18, part d. Chapter 9 (the Moon Club) joins chapters 1 to 8: the Hanger-On, the Sore Loser, the Wallflower and The Mirrorball play on Battle 3 with the bestiary's Vibe Points (9 each, 27 for the boss) and tips for Battle 3 (`ch9coat`, `ch9cards`, `ch9ball`, `mirrorball`): Pet Peeves and Resists, Hang On Tight, How Gauche! and Cheater!, the Wallflower's Wall Hug and Petal Storm, Facet Spin, Dazzled with Shatter Glitz! and Sensory Overload!, Spotlight Solo and LAST DANCE. No Warmth bar and no WARMTH command in these fights; OLD still plays them on battle 2 on the same save.
- Scene change: Deedee's coaching after a loss to The Mirrorball has a Battle 3 version (`B3_CH_ON(9)`): the first line is the same so its clip still plays, the next two lines are new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old lines. Chapter 9 has no Tombo toast to skip.
- Left alone on purpose: the Deedee Signature Tool toast that lists a WARMTH number (an equipment stat, not the bar).
- Checks: `node tools/b3-sim.js check` (`tools/b3-check-s18.js`), `unused_voice.py` 0 on all checks. No browser tests this stage (Tom's request), so `smoke.py` and a chapter 9 test were not run.
- Not looked at: any chapter 9 fight in a browser.

## b3s18c (2026-11-21): chapter 8's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s18, part c. Chapter 8 (the Car Barn) joins chapters 1 to 7: the Wet Blanket, the Draft, the Picky Eater and Old Ironbelly play on Battle 3 with the bestiary's Vibe Points (9 each, 27 for the boss) and tips for Battle 3 (`ch8blanket`, `ch8draft`, `ch8picky`, `ironbelly`): Pet Peeves and Resists, Dampen Spirits and Why Bother?, Crosswind and Pilot-Light Gust, the Tin Lid and Push It Away, Toasty with Steam Cloud!, BROIL and Full Furnace. No Warmth bar and no WARMTH command in these fights; OLD still plays them on battle 2 on the same save.
- Scene change: TNB's coaching after a loss to Old Ironbelly has a Battle 3 version (`B3_CH_ON(8)`): the first line is the same so its clip still plays, the next two lines are new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old lines. Chapter 8 has no Tombo toast to skip.
- Left alone on purpose: the Tom Signature Tool toast that lists a WARMTH number (an equipment stat, not the bar).
- Checks: `node tools/b3-sim.js check` (`tools/b3-check-s18.js`), `unused_voice.py` 0 on all checks. No browser tests this stage (Tom's request), so `smoke.py` and a chapter 8 test were not run.
- Not looked at: any chapter 8 fight in a browser.

## gem1v (2026-11-21): Gemini's chapter 1 test applied to the board: 8 cards closed, 4 fix cards written

Tom had Gemini play chapter 1 with the brief `claude/ch1-gemini-verify.md`; its report is saved as `claude/ch1-gemini-report.md` (build voicepurge221, MEDIUM, landed in Los Angeles, 1:04 in game).

| Gemini row | Tom card | Result on the board |
|---|---|---|
| C3 to C10 | t-qa-bug12c-play, t-qa-bug08play, t-qa-coh06play, t-bug12play, t-qa-txt04-play, t-qa-bug01play, t-qa-coh07play, t-qa-coh03play | PASS: moved to Done with Gemini's evidence in the history |
| C1 | t-hollowtrail-play | FAIL: c-fix-hollowtrail-play-3 (includes X-06; X-05 is Tom's own wording, not a bug) |
| C2 | t-ch1flight | FAIL: c-fix-ch1flight-2 (the fix-ch1flight scene edit is missing from `data/scenes.js` on main) |
| C11 | t-itemdefplay | FAIL: c-fix-itemdefplay (includes X-07, old Battle 2 stat names on equipment) |
| C12 | t-qa-bug03-look | FAIL: c-fix-qa-bug03-look (includes X-01 and X-02) |
| M-B | t-milestoneb | Ratings 5/4/4/5/5/4/4 and the fight log added to its history and to c-b3s17 and c-b3s18; left open for Tom |
| A1 | t-wanch1-watch | NOT RUN by Gemini; already done by Tom |

- Section 7 checked against main: X-03 (LOAD IT? in the Save modal) and X-04 (TURN label clipped in portrait) were not reproduced (the Save popup has no LOAD IT? button; the TURN label is whole in a 430x860 Battle 3 frame), so no card.
- Board and notes only: no game file changed.

## b3s18 (2026-11-21): stage 18 closes: chapters 6 to 10 play on the new battle; the bonus chapter waits

Card c-b3s18. Chapters 6 to 10 (Old Oak Park, the Library, the Car Barn, the Moon Club, the airport) run their story fights and map monsters on Battle 3 behind the same switch (BY CHAPTER, default), pushed as `b3s18a` to `b3s18e`. Docs: `docs/BATTLE3.md` "What stage 18 holds" (the battle 2 reference table by kind, what was built, the bonus chapter facts), `docs/handoff/b3s18.md`, `claude/next-addendum-b3s18.md`, `claude/battle-build.md` (stage board, results, calls, next conversation).
- Not switched: the bonus chapter (Nine Scoops). Its two Brain Freeze fights end at half HP with results `flee` and `shell` in battle 2 code that Battle 3 cannot yet express, so it stays on battle 2; board card `c-b3s18bonus` builds the seams and switches it.
- Test file change: `tools/b3_story_test.py` moved its "not switched yet" cases from chapter 6 to chapter 11 (pool 1350 split 800 and 550, level floor 25). It was not run.
- Not run, by Tom's request: browser chapter tests, `smoke.py`, `b3_story_test.py`. Run: `node tools/b3-sim.js check`, `unused_voice.py`.
- Board: Tom's next card is Milestone D (`t-milestoned`, play chapters 6 to 10).

## guidestatus1-restore (2026-11-21): housekeeping: puts back three change notes and the Grace squeeze cleanup that the guidestatus1 push undid by mistake

Card c-guidestatus. The guidestatus1 push was rebased badly: it dropped the docs/CHANGES.md entries fix-anim-grace-squeeze-qxim, board-night and b3s18b (put back below guidestatus1, where they were), and re-added `art/raw/clips/wan-grace-squeeze-v3.mp4` and `tools/art-library/prompts/wan-grace-squeeze-v3.txt`, which fix-anim-grace-squeeze-qxim had purged (v4 replaced them). No game file changed.

## b3s18e (2026-11-21): chapter 10's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s18, part e. Chapter 10 (the airport, the end of Part 1) joins chapters 1 to 9: the Long Line, the Unclaimed, the Armrest Hog and The Last Call play on Battle 3 with the bestiary's Vibe Points (8 each, 26 for the boss) and tips for Battle 3 (`ch10sec`, `ch10bag`, `ch10lounge`, `lastcall`): Pet Peeves and Resists, Random Screening, Excess Baggage, Both Armrests Claimed and Full Recline, Boarding Group Nine with GATE CLOSED, and FINAL BOARDING. No Warmth bar and no WARMTH command in these fights; OLD still plays them on battle 2 on the same save.
- Scene change: the Seat 1A Stowaway and Wing Walk toast is skipped under Battle 3 (`B3_CH_ON(10)`). Amy's coaching after a loss to The Last Call has a Battle 3 version: the first line is the same so its clip still plays, the next two lines are new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old lines.
- Left alone on purpose: the Rose Signature Tool toast that lists a WARMTH number (an equipment stat, not the bar).
- Checks: `node tools/b3-sim.js check` (`tools/b3-check-s18.js`), `unused_voice.py` 0 on all checks. No browser tests this stage (Tom's request), so `smoke.py` and a chapter 10 test were not run.
- Not looked at: any chapter 10 fight in a browser.

## guideprompts1a (2026-11-21): a script and an Action that write a real prompt for every starter-draft battle animation

Card c-guideprompts. Tom (11-21): "why is this the prompt for cartridge blow, it seems generic". 267 of the 346 prompts in the Battle Guide were rule-made starter drafts (every move of one shape got the same canned gesture, so Cartridge Blow read as a spell cast). The model-draft step of claude/guidegen-plan.md 3.1 had never been built.
- `tools/guidegen/draft.py`: for each animation whose prompt is a starter draft it asks the xAI text model (repo secret XAI_API_KEY, same client and model pick as reconcile.py) for a new MOTION from the move's own data, three approved examples and, for a monster, its LOOK. Everything before MOTION and a monster's closing tail are copied in code. Each answer is checked in code (two to four sentences, how many times, "Without repeating", held pose, pronoun, no sound, camera, left or right, banned words or dashes), a broken one is sent back once, a second failure is left as the starter draft and listed.
- `.github/workflows/guide-draft.yml`: manual only, inputs `ids`, `cap` (default $1.00), `dry_run` (default true). The result is kept as `guide-prompts.json` on the branch `guidegen`; a second run adds to it.
- Nothing paid was run in this build, no prompt of the game changed. Test: `python3 tools/guidegen/draft_test.py` (stand-in xAI, no key).

## guidestatus1 (2026-11-21): the Battle Guide list shows where each new video is: Requested, In line, Making, Checking, Ready to review

Card c-guidestatus. Tom (11:17): "when im scanning the animations list i need better transparency to where a new video is in the creation process".
- Five stage labels replace VIDEO or NO VIDEO YET on an Animations row while a new video is on its way; IN LINE, MAKING and CHECKING show the minutes since they started. New filter In the works. Table in docs/BATTLE_GUIDE.md.
- Only what the services report is used: fal (family) gives IN_QUEUE and IN_PROGRESS; xAI (monsters) only says pending, so monsters skip IN LINE.
- `tools/guidegen/progress.py` writes `status.json` on branch `guidegen` (through `keep.py`, merged by animation); `falq.Fal.wait` reports each status; `wan-gen` and `clip-gen` turn it on (`GUIDE_STATUS=1`); Use this one marks the take `used`.
- A video requested before this build was running with the old job code: it shows REQUESTED until its take is READY TO REVIEW.
- Tests: `tools/battle_guide_test.py` (stage labels, the filter, a stage moving by itself, four Duo sizes), `tools/guidegen/take_test.py` T6, `wangen_test.py`, `artgen_test.py` (falq is shared). Not seen on the phone yet.

## fix-anim-grace-squeeze-qxim (2026-11-21): Grace's Soup-Dumpling Squeeze: the dumpling has a cute face and bursts into fluff on the hit

Card c-fix-anim-grace-squeeze-qxim (from t-anim-grace-squeeze-qxim). Tom on the card: "Left a comment". The comment, his Battle Guide note (18:51): "The dumpling should explode on hit. Also, the dumpling should have a really cute face, just like the popular dumpling squishes have."
| | |
|---|---|
| Kept | Every word of `wan-grace-squeeze-v3.txt` outside the MOTION clauses his note names, the start picture, every Wan setting, the bake shape (strike, every 3rd picture, 1.5x, figure 90 rows) |
| Changed | MOTION: the squishy gets "with a cute face of two black dot eyes, rosy cheeks and a tiny smile"; "until it squishes flat" became "until it bursts apart in a puff of white fluff"; "She lets it puff back up, tucks it back into her hoodie pocket and returns" became "She lowers her empty hands and returns" (a burst toy cannot go back in the pocket) |
- Why not the Battle Guide's own answer: the reconcile Action's edit (branch guidegen) said the dumpling explodes and then puffs back up and is tucked away, which contradicts itself.
- Video: wan-gen run 44938307197, $0.50. Source `art/raw/clips/wan-grace-squeeze-v4.mp4` (v3 video and prompt removed), baked pictures 18 to 144, the hit at picture 108 where the dumpling bursts (43 pictures, 2.9 s in the game, hit at 2.0 s).
- Checks: same girl and outfit; standing height 1,035 px first, 1,037 last; feet on row 1,153 in every picture; nearest edge 14 px (the fluff); the fluff is gone before the last picture. Looked at in the Battle Guide player in portrait and landscape: HIT shows on the burst, Prompt v4.
- Tests: `b3_test.py s8` FAILS []. `data/guide-anims.json` rebuilt.
- No in-game pencil report was filed since 18:48.
- Tom's card: t-anim-grace-squeeze-qxim.

## board-night (2026-11-21): board only: six cards for the night jobs (night shift, night tests, nightly cleanup, night QA, the 13 failing tests, nightly refactoring)

Tom (11:00): "I feel more could be done with automated tasks that you and i design together to get work done overnight." Tom (11:09): "i think we should do cleanup every night since we are in such an active development phase. create a card for each job in the board so that i can action it". Design: `claude/night-plan.md` (new; index rebuilt). Board change and that plan only; no page, tool or game file changed, and nothing is scheduled yet.
| Card | Starts | Model, effort |
|---|---|---|
| c-nightshift, Night shift: queued cards start by themselves overnight | START now | Sonnet 5.5, medium |
| c-nighttests, Night test run: every test, every night, on GitHub | START now | Sonnet 5.5, medium |
| c-nightclean, Nightly cleanup: files, notes and the working agreement | START once c-nightshift ships | Sonnet 5.5, medium |
| c-nightqa, Night QA: the test browser plays your check cards | START once c-nightclean ships | Sonnet 5.5, medium |
| c-nightgreen, Fix the 13 tests that already fail | Copy prompt once c-nighttests ships | Sonnet 5.5, high |
| c-nightrefactor, Nightly refactoring, one small piece a night | Copy prompt once c-nightgreen ships and 7 nights pass with no failing test | Sonnet 5.5, high |
- Checked: `python3 tools/board_check.py` ok; the board page opened locally in portrait shows both Up next cards under Start next with START and Sonnet 5.5, medium.

## b3s18b (2026-11-21): chapter 7's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s18, part b. Chapter 7 (the Library) joins chapters 1 to 6: the Cliffhanger, the Know-It-All, Pop-Up Panic and The Unread play on Battle 3 with the bestiary's Vibe Points (9 each, 27 for the boss) and tips for Battle 3 (`ch7cliff`, `ch7know`, `ch7pop`, `unread`): Pet Peeves and Resists, To Be Continued..., SHHH! and Skill Lock, Well, Technically and Actually..., Big Reveal, Turn Back the Page, the Bookmark Ribbon and THE END. No Warmth bar and no WARMTH command in these fights; OLD still plays them on battle 2 on the same save.
- Scene change: the Pick the Rhubarb toast is skipped under Battle 3 (`B3_CH_ON(7)`). Grace's coaching after a loss to The Unread has a Battle 3 version: the first line is the same so its clip still plays, the second line is new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old line.
- Left alone on purpose: the Grace Signature Tool toast that lists a WARMTH number (an equipment stat, not the bar).
- Checks: `node tools/b3-sim.js check` (`tools/b3-check-s18.js`), `unused_voice.py` 0 on all checks. No browser tests this stage (Tom's request), so `smoke.py` and a chapter 7 test were not run.
- Not looked at: any chapter 7 fight in a browser.

## buildpill1 (2026-11-21): the build name on the Builds screen is a status-colored pill

Card c-buildpill1. Tom (11-21): "in the builds screen, the build name must be more prominent. put it in a pill same style as publishing building etc with the color coding corresponding to that status."
- Every row on Recent, Archive, search and In the works now starts with the build name in a pill, the same pill style as PUBLISHING and BUILDING but larger and bold. The color follows the build's status: purple publishing, red your test, green live, amber being built, grey queued (a queued card with no build name yet shows "no build name yet" in grey). The status chip stays on the right.
- The small line under the sentence no longer repeats the build name (it was the first item there); it shows theme and time.
- `engine/build-history.js` (`buildNamePill`, `buildNameClass`, `buildRowHtml`, `cardRow` in `buildWorksHtml`), `build-history.css` (`.bl-chip.bl-name`). Test: `python3 tools/buildlog_test.py` now checks the pill order, color per status and size (B16), FAILS [].
- Looked at portrait and landscape screenshots of Recent and In the works. Not seen on the phone yet.
## 2026-11-21 (7): Art Library bake, clip-skeeter-bite, clip-skeeter-whine (`artbake1573`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- clip-skeeter-bite: clip `skeeter-bite` cut from art/raw/clips/clip-skeeter-bite-v4.mp4 (24 pictures a second; video frames 0 to 72, every 2, hit at frame 10; 37 pictures kept; played at 1.5x). skeeter_bite frames 37 frame px 560 368 rows 70 46 sheet (997, 6251) in memory mb 24.9 (as a grid 30.5) kb 997 dur ms 2056 kind strike impact ms 278 reach [28.2, 21.4]
- clip-skeeter-whine: clip `skeeter-whine` cut from art/raw/clips/clip-skeeter-whine-v3.mp4 (24 pictures a second; video frames 0 to 72, every 2, state; 37 pictures kept; played at 1.5x). skeeter_whine frames 37 frame px 544 376 rows 68 47 sheet (2455, 2415) in memory mb 23.7 (as a grid 30.3) kb 957 dur ms 2056 kind state impact ms 0 reach [22.2, 21.0]
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## portraits2 (2026-11-21): Portraits baked from your saved crops: rose (made by the portrait-bake Action)

- Tom saved crops in ADMIN > PORTRAIT CROPS (or approved a new hero painting); the Action baked `portraits/<id>.png` and moved `PORTRAIT_V` in `data/portrait-ver.js`, the one stamp every status screen, turn order, battle panel and the Battle Guide use for those pictures (tools/sprite-bake/portrait_autobake.py).

## b3s18a (2026-11-21): chapter 6's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s18, part a. Chapter 6 (Old Oak Park) joins chapters 1 to 5: the Peanut Gallery, the Twig Spy, the Cheek Stuffer and Chairman Cheeks play on Battle 3 with the bestiary's Vibe Points (6 each, 30 for the boss) and tips for Battle 3 (`ch6gallery`, `ch6spy`, `ch6stuffer`, `chairman`): Pet Peeves and Resists, Standing Boo-vation, Leaf Camo and Stakeout Mark, Snack Snatch, the Acorn Cache and Cheek Slam. No Warmth bar and no WARMTH command in these fights; OLD still plays them on battle 2 on the same save.
- Scene change: the two Tombo toasts of chapter 6 (Red Line Transfer, Tug of War) are skipped under Battle 3 (`B3_CH_ON(6)`). TNB's coaching after a loss to Chairman Cheeks has a Battle 3 version: the first line is the same so its clip still plays, the next two lines are new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old lines.
- Left alone on purpose: the Nara Signature Tool toast that lists a WARMTH number (it is an equipment stat, not the bar).
- Checks: `node tools/b3-sim.js check` (new file `tools/b3-check-s18.js` for chapters 6 to 10 and the bonus chapter), `unused_voice.py` 0 on all checks. Tom asked for no browser tests this stage, so `tools/ch6_b3_test.py` was not written or run and `smoke.py` was not run.
- Not looked at: any chapter 6 fight in a browser.

## guidegen1 (2026-11-21): the Battle Guide can make a video, show it next to the one in the game, and put it in the game

Card c-guidegen part 3 (plan `claude/guidegen-plan.md`, facts `docs/BATTLE_GUIDE.md` "Making a video from the guide"). Nothing paid was run in this session: every test used a stand-in fal, a stand-in xAI and synthetic videos; the first real generation is Tom's tap.
- **Generate this video** (page): the button shows the price ($0.50 Wan 3.0 for the family, $0.07 xAI Grok lite for monsters); the first tap asks, the second commits a request (`data/wan-requests.json`, message `wan: generate <id>`, or `data/clip-requests.json` with a `guide` field, message `clip: generate guide <id>`). Caps: $1 a request, $10 a day for the guide (`guide_days` on the Wan ledger), $0.15 a monster request.
- **The takes** (`tools/guidegen/make_take.py`, run by `wan-gen` and `clip-gen` after the video is made): marks from the video, the clip gate (`hold.py`), a preview cut exactly as the game plays it, all kept on branch `guidegen` (`takes.json`, `takes/<slug>/t<n>.*`). The Action approves nothing. `tools/guidegen/keep.py` adds to the newest copy of the branch so two jobs never overwrite each other.
- **Compare** (page): the take plays next to the clip now in the game with the gate's words; Use this one, Try again with a note, Keep the old one. Per animation the sheet shows the prompt version, takes made and dollars spent.
- **Use this one** (`guide-use` Action, `tools/guidegen/use_take.py`, request file `data/guide-use.json`, message `guide: use <id>`): cuts the clip, adds the script tag, points the row (`B3_BODY_CLIPS`, `anim:{kind:'clip'}` or `wind:`), removes the painted pose it replaces, raises the Wan job rev (family) or the Library entry's promptRev (monster), records the prompt (`data/guide-prompts.json`), rebuilds `data/guide-anims.json`, names the build `guideuse-<run>`, pushes to `main` and starts the publish.
- **Stop rule**: the last two takes held by the gate for one fault, or two tries with nearly the same note, stop Generate and offer the note to Claude.
- Also in this push (guidegen1b follow-up): a note no wording can carry comes back as `nochange` instead of "check this one" (`reconcile.py`, page); `data/wan-requests.json` and `data/guide-use.json` join the publish paths-ignore; `tools/guidegen/fixtures/` freeze the two prompts the reconcile tests use.
- Tests: `tools/guidegen/take_test.py`, `guidegen_test.py`, `build_map_test.py`, `tools/battle_guide_test.py` (the page at the four Duo sizes, FAILS []), `tools/art-library/wangen_test.py` (ALL PASS), `python3 tools/b3_test.py s8` (FAILS []), `board_check.py`. Not mine and failing on main before this push: `tools/board_sync_test.py` (R5 and the board4 line), `tools/art-library/clipgen_test.py` (`clip-tom-give-rev0.mp4` missing).
- Real replay of the reconcile step (guidegen1b, 2026-11-21): 24 notes, $0.0447 of a $0.48 cap; 6 new prompts, 13 questions, 5 unchanged (now `nochange`).
- Not seen on the phone yet.

## anim-tom-dodge-ner3 (2026-11-21): Tom's Dodge is a Wan 3.0 video now: he ducks straight down with both hands on his head and pops back up

Card c-anim-tom-dodge-ner3. Tom, from the Battle Guide: "Needs to be generated"; then in chat (10:33): "But Roses dodge came out good. Maybe it should be ducking motion instead."
- Prompt `tools/art-library/prompts/wan-tom-dodge-v2.txt`: Rose's passed dodge prompt (`wan-rose-dodge-v2.txt`, anim-rose-dodge-v89r) word for word with only her/she changed to his/he. Job `tom-dodge` rev 2 with `pad: 0.8`, as Rose's. Nothing else changed (Wan 3.0, 720p, 9:16, 5 s, seed 81, start picture `art/clips/start/tom-hero.png` first and last).
- First try passed (wan-gen run 44936470814, `art/raw/clips/wan-tom-dodge-v1.mp4`). Plan 4.4: reads as a duck, hands on his head, feet flat; the same Tom; standing height first 991 px, last 991; feet on row 1,135 in every picture; never touches an edge; background flat (std under 3.5); last against first 0.71 of 255. He turns his body toward the viewer for a few pictures going down and coming up, as Rose does. Measured clip gate: no flags. The vision gate was not run (xAI key).
- Bake: video pictures 30 to 88, every 2nd, 30 pictures at 1.5x (1.3 s), kind state, figure 99 rows. `data/clips/tom-dodge.js`, `art/clips/tom-dodge.webp`. `B3_BODY_CLIPS.tom.dodge = 'tom_dodge'`; Tom's painted dodge row is purged from `B3_BODY_PAINT` (docs/BATTLE3.md updated); `data/guide-anims.json` rebuilt.
- Spent: $0.50 (one video).
- Same session, Lounge Pass Flex fix (card c-anim-tom-loungepass-fix1), not shipped. Tom (10:33): "Lounge pass him taking it out and the sparkle should be very fast, the main part of the animation should be him extending his arm and swatting with it". Prompt v3 (`wan-tom-loungepass-v3.txt`) changed only MOTION from v2: he "quickly pulls" the card out and "flashes it up beside his face" for the smile and sparkle, then "extends his arm out straight toward the left at full length" before the swat and "holds that pose". Try 1 (rev 4, pad 0.8) and try 2 (rev 5, pad 0.65, the one change): the quick take-out and the long outstretched arm came out as asked, but both times the arm and card ran past the left edge of the video for 12 to 17 pictures, the main part of the clip. Stop-loss: shrinking him does not help, because the model stretches the arm out to the frame edge whatever room there is. Next try is a different method: place him right of centre in the frame so the arm has room on the left. Neither try showed the snooty chin-up, half-closed eyes that the anim-tom-loungepass-lf2z clip had. The game keeps the anim-tom-loungepass-lf2z clip until then. Spent $1.00 (runs 44936470814, 44937030752).
- Tom card: t-anim-tom-dodge-ner3-watch.

## 2026-11-21 (6): Art Library bake, clip-toad-slam, clip-skeeter-bite, clip-skeeter-whine (`artbake1570`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- clip-toad-slam: clip `toad-slam` cut from art/raw/clips/clip-toad-slam-v3.mp4 (24 pictures a second; video frames 0 to 54, every 2, hit at frame 28; 28 pictures kept; played at 1.5x). toad_slam frames 28 frame px 576 392 rows 72 49 sheet (2310, 1565) in memory mb 14.5 (as a grid 25.3) kb 725 dur ms 1556 kind strike impact ms 778 reach [30.1, 4.6]
- clip-skeeter-bite: clip `skeeter-bite` cut from art/raw/clips/clip-skeeter-bite-v3.mp4 (24 pictures a second; video frames 0 to 72, every 2, hit at frame 14; 37 pictures kept; played at 1.5x). skeeter_bite frames 37 frame px 640 352 rows 80 44 sheet (2314, 2532) in memory mb 23.4 (as a grid 33.3) kb 951 dur ms 2056 kind strike impact ms 389 reach [33.2, 20.9]
- clip-skeeter-whine: clip `skeeter-whine` cut from art/raw/clips/clip-skeeter-whine-v3.mp4 (24 pictures a second; video frames 0 to 72, every 2, state; 37 pictures kept; played at 1.5x). skeeter_whine frames 37 frame px 544 376 rows 68 47 sheet (2455, 2415) in memory mb 23.7 (as a grid 30.3) kb 957 dur ms 2056 kind state impact ms 0 reach [22.2, 21.0]
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## artgen3 (2026-11-21): a second button on a pictures card approves what passes QA for you

- The board's pictures card has Generate and auto-approve what passes QA (`gen.mode: "auto"`, workflow input `auto`, `artgen.py --auto`) with the rule in plain words above it.
- `artgen.auto_verdict`: approved by the job only when QA ran 3 times, every must-pass (`hold`) check that was asked is yes, the score reaches the policy threshold (0.9), the entry has no earlier reject and no `own`. Anything else waits for review as before, with its reason on the card (`gen.run.held`).
- An approval writes the file `art/raw/<tab>/<id>-v<k>.png` and the entry record (`from: artgen`, `qa`, `qaFail`, `srv`, `svc`, `try`) in one commit on main, starts art-bake with the files, and makes entries that waited on it in the same run.
- Board card lines: Approved by QA (11 of 12) with Not this one; the record line counts pictures you rejected that QA would have approved. The Art Library offers NOT THIS ONE (a reject with a note) on a picture the job approved. `board_sync` r2_art names who approved what.
- Tests: `tools/art-library/artgen3_test.py`, `board_artgen_test.py`, `board_sync_test.py`. Nothing was sent to xAI.
- Also: shortened the title of c-b3s18 (it stopped board_check).

## fix-anim-grace-squeeze-qxima (2026-11-21): Grace's Soup-Dumpling Squeeze prompt v4: the dumpling has a cute face and bursts on the hit (video being made)

Card c-fix-anim-grace-squeeze-qxim, part a. Tom (Battle Guide note, 18:51): "The dumpling should explode on hit. Also, the dumpling should have a really cute face, just like the popular dumpling squishes have." Prompt `tools/art-library/prompts/wan-grace-squeeze-v4.txt`, Wan job `grace-squeeze` rev 4; the video follows in build fix-anim-grace-squeeze-qxim.

## idea-savedportraits (2026-11-21): Your saved portrait crops now reach the Party, Status, turn order, battle panels and Battle Guide, and every future save does it by itself

Card c-idea-savedportraits. Tom's words: "I saved new portraits in admin - how do I ensure they are used appropriately in status screens turn order and the battle guide"

What was wrong (facts, checked by baking again and comparing pixels): all 12 crops he saved in ADMIN > PORTRAIT CROPS (`data/portrait-crops.json`) had never been baked, so every `portraits/<id>.png` was still the old crop; Michael was the one face with no saved crop. Saving only commits the json; nothing turned it into the pictures the game draws. Second problem: each face's address carried its own hand-typed tag (`portraits/tom.png?v=posefaces1`, `amy1`, `walkv2` ...), and the service worker never asks again for a tagged file, so a rebaked face would not have reached his phone. Third: Michael and Jojo had pictures but no entry in the game's face list, and the Battle Guide used no tag at all.

- `tools/sprite-bake/bake_portraits.py` also writes `data/portrait-ver.js`: `PORTRAIT_IDS` (everyone with a face, 13) and `PORTRAIT_V` (a stamp of the pictures' pixels). A picture whose pixels did not change is not rewritten. `--stamp` rewrites only the stamp.
- `engine/menu.js` builds `PORTRAITS` from those two, so status screens, the Party roster, the turn order bar, the battle party and command panels, the title cast strip and the Battle Guide all use the same pictures and the same tag. `index.html` loads `data/portrait-ver.js` before `engine/menu.js`; `battle-guide.html` loads it too and tags its Family list; `engine/splash.js` fallback is tagged.
- New Action `.github/workflows/portrait-bake.yml` (script `tools/sprite-bake/portrait_autobake.py`): after any push touching `data/portrait-crops.json`, a hero painting or the baker, it bakes, moves the stamp, stamps a build, logs here and commits; `publish.yml` runs after it. So a save in Portrait Crops reaches the phone in a few minutes with nobody in the loop. The Portrait Crops page now says so.
- `tools/tag_check.py` and `tools/art-library/bump_tags.py` know the stamp: a changed `portraits/<id>.png` with `PORTRAIT_V` unmoved fails the check; the bump asks the baker for the new stamp.
- Baked now: the 12 saved crops (Michael unchanged). Faces look tighter on the head than before.
- Tests: new `python3 tools/portrait_test.py` (baked equals saved crops; ids and stamp match; no screen types its own address; Party menu, Status menu, a Battle 3 fight and the Battle Guide show the baked faces with the stamp at 256 x 256 in portrait and landscape; the tag check and autobake in a scratch copy). `portraits_test.py` now expects all 13 ids (it still said eight); `art-library/bake_test.py` checks the stamp and sets `GITHUB_ACTIONS` as the Action does (it failed outside the Action since board2).
- Not done: the Art Library hero-painting approval already ran `bake_portraits.py`; it now also moves the stamp the same way, nothing else changed there. Dialogue faces (`portraits/emo`, `talk`) are separate pictures and keep their own tags.
## 2026-11-21 (5): Art Library bake, prop-item-solo-g_bsash (`artbake1569`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-item-solo-g_bsash: background keyed from the corner colour rgb(213, 14, 101)
- prop-item-solo-g_bsash: `bake_item_sheet.py item-solo-g_bsash --grid=1 g_bsash` ran from art/raw/props/prop-item-solo-g_bsash-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## 2026-11-21 (4): Art Library bake, 7 entries (`artbake1563`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-gate-town-school-open: background keyed from the corner colour rgb(193, 16, 94)
- prop-gate-town-school-open: `bake_gate_art.py town-school open` ran from art/raw/props/prop-gate-town-school-open-v1.png
- prop-gate-jpark-barn-open: background keyed from the corner colour rgb(213, 14, 102)
- prop-gate-jpark-barn-open: `bake_gate_art.py jpark-barn open` ran from art/raw/props/prop-gate-jpark-barn-open-v1.png
- prop-gate-blvd-studio-open: background keyed from the corner colour rgb(218, 10, 101)
- prop-gate-blvd-studio-open: `bake_gate_art.py blvd-studio open` ran from art/raw/props/prop-gate-blvd-studio-open-v1.png
- prop-gate-backlot-stage7-open: background keyed from the corner colour rgb(209, 3, 87)
- prop-gate-backlot-stage7-open: `bake_gate_art.py backlot-stage7 open` ran from art/raw/props/prop-gate-backlot-stage7-open-v1.png
- prop-item-solo-amy_chm1: background keyed from the corner colour rgb(232, 16, 103)
- prop-item-solo-amy_chm1: `bake_item_sheet.py item-solo-amy_chm1 --grid=1 amy_chm1` ran from art/raw/props/prop-item-solo-amy_chm1-v1.png
- prop-item-solo-claytaco: background keyed from the corner colour rgb(219, 7, 104)
- prop-item-solo-claytaco: `bake_item_sheet.py item-solo-claytaco --grid=1 claytaco` ran from art/raw/props/prop-item-solo-claytaco-v1.png
- prop-item-solo-g_bsash: background keyed from the corner colour rgb(213, 14, 101)
- prop-item-solo-g_bsash: `bake_item_sheet.py item-solo-g_bsash --grid=1 g_bsash` ran from art/raw/props/prop-item-solo-g_bsash-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## idea-tomgrace (2026-11-21): Tom, Grace, Rose and Deedee never show an old painted frame in the new battle; a moment with no video of its own shows one of their videos

Card c-idea-tomgrace. Tom: "For Tom Grace and Rose and Deedee ensure that no old painted frames are ver used in battle. Only new video animations".

What still drew a painted frame for them before this build (facts, from engine/b3-play.js): the dodge (the windup picture), low HP (the kneel picture), a hit or knock-out whose video had not loaded yet (the hurt picture, the knocked-out picture), every move with no video of its own (the strike, cast and give pictures, and the windup before a run), and the standing picture for the first moments of a fight while the idle video loads. (Deedee's painted knock-out was replaced by her video in anim-deedee-ko-yes1 an hour earlier.)

| Moment | Now shows |
|---|---|
| A move with no video (strike, cast, throw, give, the Basic, a reaction) | their give video, once from the move's start (Tom has no give video, so his idle or guard video) |
| Dodge | their idle video, sliding away and back as before |
| Low HP, a hit before its video loads | their idle or guard video |
| A knock-out before its video loads | their hit video held at its deepest wince, dimmed, with circling stars |
| Before a video is loaded | nothing drawn for them (the turn arrows still show) |

- Code: `B3_VIDEO_ONLY` in data/b3-clips.js; `b3cVideoOnly`, `b3cStandIn`, `b3cKoStandIn` in engine/b3-clips.js; `b3PaintState` is null for them and `b3DrawMember` swaps in the stand-in (engine/b3-play.js). The Battle Guide no longer marks their states OLD PAINTED POSE.
- Retired: tools/paint_state_test.py (its subject, the painted states of these four, is no longer drawn). The rest of the painted-state code (B3_BODY_PAINT, B3_PAINT, b3GuardDraw, the Lab row PAINTED STATES, engine/pose-review.js) is now unreachable for everyone and is purged by card c-wanch2.
- Not covered: battle 2, which chapters 5 to 10 still use until they move to the new battle (b3s17d onward). Its fights are drawn from painted frames.
- Tests: new `python3 -I tools/video_only_test.py` (every moment for each of the four, then a whole fight with all four, portrait and landscape: 0 painted frames) FAILS []; `wanproof_test.py` FAILS [] (its painted size measure switches video-only off for that one measure); `b3_test.py s8` FAILS [] (its painted check now expects never painted for them); smoke FAILS only board_sync_test R5, which replays the live board at a fixed past date and fails the same way without this change; `battle_guide_test.py` has 4 failures about the note card that fail the same way without this change.


## artfallback1 (2026-11-21): Art Library pictures go to xAI first, to WAN after 2 misses, and stop after 4

Card c-artfallback. Tom (11-21 09:49): "we should use XAI as the default for images, but then if there are more than two failed attempts with XAI, then we should switch the image service to WAN." Plan: claude/art-fallback-plan.md (its Built section lists the decisions).
| | |
|---|---|
| Rule | Counted on the entry's `rejects`: 2 xAI failures, then WAN 2.7 on fal with the last prompt word for word and the same reference pictures, then after 2 WAN failures the entry stops. A failure is Tom's reject of a result or a generator refusal or error with no picture; his own upload rejects never count; old rejects with no `svc` count as xAI. |
| Built | `plan_service` and the `stopped` state in `artgen.py`; the fal queue code moved to one shared module `tools/art-library/falq.py` (`wangen.py` imports it, nothing copied); `svc` and `try` on every result and reject; refusals written to the entry as `auto` rejects; one Tom card and one Claude card per stopped entry (`t-artstop-<id>`, `c-artstop-<id>`); `FAL_KEY` passed to the `art-gen` Action; WAN spend appended to `usage` in `data/costs.json`. |
| Library | "made by xAI" or "made by WAN (try n)" on each result and in the review; a banner on a stopped entry; `svc` and `try` written next to approve and reject. |
| Report | `python3 tools/art-library/artsvc_report.py`: approved, rejected, refused and share approved, by service and try number. |
| Tests | `artgen_test.py` section 7 (every row of the plan's rule table, the ladder in `art.html` run in node, stand-in xAI and fal, stop cards checked by `board_check.py`), `wangen_test.py` and `artgen_lib_test.py` still pass. No paid call was made; the first real WAN picture is Tom's tap. |
## anim-rose-hit-uy5r (2026-11-21): Rose's Getting hit is a Wan 3.0 video that stumbles back and steps into place, with room in the frame so she stays on screen

Card c-anim-rose-hit-uy5r (rescue session). Tom's note (Battle Guide, build b3s17a): "Should be flinching backwards".
- One change from the stop-loss tries: job `rose-hit` rev 5, `pad: 0.65` (start picture shrunk to 65% inside the frame); prompt `tools/art-library/prompts/wan-rose-hit-v3.txt` unchanged (rev 4 was pad 0.8, both ran off the right edge).
- Video: wan-gen, `art/raw/clips/wan-rose-hit-v2.mp4` (720 x 1280, 150 pictures). Plan 4.4: she winces and stumbles one step back to the right, then steps back into place and holds the stance; same girl; flat magenta; no picture touches the left or right edge (0 of 150). Measured clip gate (`hit_no_stumble` and the rest): no flags.
- Bake: pictures 20 to 110 (the first kept picture is the standing pose, which sets her middle; then the stumble and the step back into place), every 2nd, 46 pictures at 1.5x, kind state, figure 83 rows. A first try starting at 28 (already mid-stumble) put her 4.5 battle px off the idle; starting at 20 fixed it. `data/clips/rose-hit.js`, `art/clips/rose-hit.webp`. Purged: `art/raw/clips/wan-rose-hit-v1.mp4`.
- `tools/wanproof_test.py`: the hit's feet limit is 3 battle px (was 2): a step back lifts a foot 2.8. Rose passes it (FAILS []). `b3_test.py s8` passes. `battle_guide_test.py` and `board_sync_test.py` show the board_check failures already on main (R5 replay, unstick card, no-video note), none from this build.
- Spend: $0.50 on fal (one video; ledger 33.1).
- Tom card: t-anim-rose-hit-uy5r.

## anim-tom-loungepass-lf2z (2026-11-21): Tom's Lounge Pass Flex is a new video: he holds the card up, smiles at you, it sparkles, then he swats the monster with it like a snooty fancy lady

Card c-anim-tom-loungepass-lf2z. Tom's note (Battle Guide, build b3s17a): "He should hold it up and look to the viewer and smile, and there should be like a little like ding sound with like a sparkle or reflection of light or something, like in a cartoon in the top right corner of the card, and then he should, and like sort of a fancy lady like way, swat the monster with the card like he's being extra snooty".

- Prompt `tools/art-library/prompts/wan-tom-loungepass-v2.txt`, job `tom-loungepass` rev 2 in `wangen-jobs.json`. KEPT from v1: every word of WHAT THIS IS, the camera, facing, feet and magenta background; the start picture `art/clips/start/tom-hero.png` as first and last frame; Wan 3.0, 720p, 9:16, 5 s, seed 81; in MOTION the small gold lounge pass card, taking it out of his pocket, tucking it back and returning to the stance. CHANGED (only what the note names): MOTION now holds the card up beside his face, turns his head to the viewer and smiles, one small white star-shaped sparkle twinkles once on the card's top right corner, then chin raised and eyes half closed "like a snooty fancy lady" he swats the card once toward the left with a limp flick of the wrist. The showing-off-to-a-doorman line was dropped (the note replaces it). The camera line's "no visual effects" gained "except the card's sparkle".
- Video: wan-gen run 44929359366, `art/raw/clips/wan-tom-loungepass-v2.mp4` (720 x 1280, 150 pictures). Plan 4.4: reads as asked (card up, big smile and a wink at the viewer, sparkle on the top right corner in pictures 66 to 78, card pinched up with the chin raised, swat down to the left at 92 to 96); same Tom; standing height first 1,237 px, last 1,238 (0.08%); feet on row 1,259 in all 150 pictures; background flat (std under 4.4); last against first 1.03 of 255. One miss: the card's corner touches the left edge of the video for pictures 93 to 95 (about 5 px, under half a game pixel). The bake takes every 4th picture from 12, which skips 93 to 95, so no picture the game plays touches an edge. Measured clip gate (`gate.judge` on the baked stretch): no flags. The vision gate was not run (it cannot judge his invented moves, CLAUDE.md "Clip quality gate").
- A retry with the picture shrunk inside the frame (rev 3, `pad: 0.9`) was refused by the shared $ cap after another session's runs (nothing sent), and re-sending it at a higher cap was not allowed in this session. The job stays at rev 3 with `pad` so the next try, if Tom wants one, is that one change.
- Bake: 12 to 132 every 4th, 31 pictures, impact at 96 (the swat down to the left), 1x, figure 99 rows. `data/clips/tom-loungepass.js`, `art/clips/tom-loungepass.webp`. The row `lounge_pass_flex` already pointed at clip `tom_loungepass` (anim kind clip). Purged: `art/raw/clips/wan-tom-loungepass-v1.mp4`.
- Not done: the "ding" sound. The video is silent by rule; a sound at the sparkle is a game sound effect, card c-anim-tom-loungepass-ding.
- Spent: $0.50 on fal (one video).
- Tom card: t-anim-tom-loungepass-lf2z-watch.
- Dodge (card c-anim-tom-dodge-ner3): not made. Wan 3.0 missed the dodge twice the same way on Grace in wanch1 (turns to the viewer and hops sideways, feet off the ground; checked grace-dodge r1 and r2), and the tom-dodge job is the same prompt, so a Wan try would be a third miss. The card waits on c-wanch2 (Kling 4 for every family dodge). $0 spent.
- `tools/battle_guide_test.py`: its stand-in board also drops other cards' pointers to the note cards it removes (c-wanch2 now blocks the Dodge card). Known on main, not from this build: `board_sync_test` R5 replay and "board_check accepts an unstick card".

## anim-rose-dodge-v89r (2026-11-21): Rose's Dodge is a Wan 3.0 video now: she ducks straight down with her hands on her head and pops back up

Card c-anim-rose-dodge-v89r. Tom, from the Battle Guide: "Make" (it was still a painted pose).
- Prompt (`tools/art-library/prompts/wan-rose-dodge-v2.txt`): her approved Wan clips' pattern, word for word outside MOTION. MOTION is a duck, not the sideways lean of v1: on Wan the lean made Grace hop sideways off the ground twice (the wanch1 stop-loss), while the straight-down wording fixed the knock-outs. "She quickly squats straight down once right where she stands, both hands on top of her head, as if something is flying over her, while both feet stay flat on the ground", then pops back up and holds the stance.
- Try 1 (rev 2): the duck was right, but her arms swung out past both sides of the frame for 13 pictures. Try 2 (rev 3), one change: `pad: 0.8` (the picture shrunk to 80% inside the frame, the fix used for Deedee's victory). Passed.
- Checks (plan 4.4): reads as a duck, hands on her head, feet flat; the same girl; standing height last 0.999 of first, feet on the same row (1,131) in every picture; flat magenta; ends where it began. Known small faults: fingertips touch the left edge in 2 video pictures (1 baked), and fast-moving hands have a faint yellow-green tint from the magenta key in about 6 of 29 pictures. Measured clip gate: flags `dodge_forward` 7% (the head leans over the knees in the squat; the whole body moves forward only 2.2% and the feet do not move) and the 2-picture edge; both read as above. The vision part needs the xAI key and was not run.
- Bake: video pictures 38 to 94, every 2nd, 29 pictures at 1.5x (1.3 s), `data/clips/rose-dodge.js`, `art/clips/rose-dodge.webp`, source `art/raw/clips/wan-rose-dodge-v1.mp4`. `B3_BODY_CLIPS.rose.dodge = 'rose_dodge'`; Rose's painted dodge row is purged from `B3_BODY_PAINT` (docs/BATTLE3.md updated). `data/guide-anims.json` rebuilt (`node tools/guidegen/build_map.js`).
- Spend: wan-gen runs 44929736650 and 44930962153, booked $1.00 (live price $0.45).
- Tests: `b3_test.py s8`, `battle_guide_test.py`, `paint_state_test.py`, `wanproof_test.py rose` FAILS []; smoke; the Battle Guide player looked at in portrait and landscape.

## b3s17 (2026-11-21): chapter 5's story fights now run on the new battle (BY CHAPTER); stage 17 is complete: chapters 2 to 5 play on Battle 3

Card c-b3s17, final part. Chapter 5 joins chapters 1 to 4: the Tardy Bell, the Glitter Glue, Dodgeball Dread (with their Pop Quizzes) and The Red Pen play on Battle 3 with the bestiary's Vibe Points (12 each, 30 for the boss) and tips for Battle 3 (`ch5bell`, `ch5glue`, `ch5dodge`, `redpen`): Pet Peeves and Resists, You're Late!, First-Bell Ring, Glitter Burst and Blind, Gym Bounce, SEE ME (single-target attacks can only go at the pen), Strict Grading (a Mix or a Break ends it) and Final Grade. No Warmth bar, no HEART, no Tombo. A win over The Red Pen sets `kind:redpen`, so the kind ending plays.
- Scene changes: the two chapter 5 "New Tombo" toasts (I Called It!, Uncle Spotter Toss) show under OLD only. Amy's coaching after a loss has a Battle 3 version (`B3_CH_ON(5)`); the first line is the old text so its clip still plays, the second and third lines are new and not recorded yet (they play by speech synthesis and show under No clip yet in the Voice Library). OLD keeps the old line.
- Tests: `tools/ch5_b3_test.py` in portrait and landscape (9 steps from Chapter Select to the schoolyard; every fight on Battle 3, no Warmth words, tips once each, Vibe Points paid). `tools/b3_chapter_lib.py` now plays any open battle menu, not only the cross: Amy's Burpee Blitz opens a second menu for its mini turn, and the first run of the Red Pen test sat on it for 20 minutes. `tools/b3-check-s17.js` covers chapters 1 to 5 (2668 checks, none fail).
- Stage 17 overall: chapters 2 to 5 on Battle 3 (`b3s17a`, `b3s17b`, `b3s17c`, `b3s17`), 16 fights with tips, `kind:<boss>` set on a boss win from chapter 2 on, five Tombo toasts and three retry lines made OLD-only or Battle 3 aware. Docs: `docs/BATTLE3.md` "What stage 17 holds", `docs/handoff/b3s17.md`, `claude/next-addendum-b3s17.md`, `claude/battle-build.md`.
- Board: created Milestone C for Tom (`t-milestonec`, play chapters 2 to 5) and the next Claude card `c-b3s18`. Closed two Tom picture cards (`t-boppy-bigfish-pic`, `t-boppy-bigfish-pic2`) whose picture `boppy-em-unimpressed` was already approved; `board_check.py` refused every push while they were open.
- Not looked at: chapters 2 to 5 as Tom plays them (Milestone C); the three unrecorded retry lines spoken aloud.

## boardsubfold1 (2026-11-21): on the board, each group under For you folds and unfolds with a tap, all open by default

Card c-boardsubfold1. Tom: "I wanna be able to collapse those subcategories as well, and of course expand them back whenever I want to. but by default they should all be expanded."
- `mineGroups` in `board.html` draws each For you group (PLAY AND REPORT, REVIEW PICTURES, ...) as its own `details` (`data-sec` `mine-<ask>`), open by default, with the same arrow as the sections. What Tom folds stays folded through the 60 second reload (`secOpen`, in memory, like the sections). The Claude tab's sections already fold and have no groups inside.
- Test: `tools/board_test.py` checks every group starts open, folds on a tap, stays folded after a redraw, unfolds on a second tap. Its other failures (top line, Queued 11 not 12, START click) fail the same way on main before this build: the stub replays live data. Looked at in portrait and landscape, folded and open.

## anim-grace-cubepop-tvik (2026-11-21): Grace's Crunchy Sugar-Cube Pop is a punch now, with a neon blue cube

Card c-anim-grace-cubepop-tvik. Tom (Battle Guide, b3s17a): "She should essentially punch the monster with it. And it should be neon blue".
| | |
|---|---|
| Kept | Everything in `wan-grace-cubepop-v2.txt` the note does not name (the three parts, the pocket, the cube shape, crushing it so it squishes out between her fingers, the grin, opening her hand, tucking it away, the return), the start picture, every Wan setting, the bake shape (strike, every 3rd picture, 1.5x, figure 90 rows) |
| Changed | The two things the note names, nothing else. Colour: "clear" became "neon blue". Gesture: "holds it out toward the left in one hand at chest height and closes her fingers tight around it once" became "grips it in one fist and punches it forward toward the left once at chest height" (`wan-grace-cubepop-v3.txt`, job `grace-cubepop` rev 3) |
- Video: wan-gen run 44929359366, $0.50. Source `art/raw/clips/wan-grace-cubepop-v3.mp4` (v2 removed), baked pictures 18 to 132, the hit at picture 69 where the punch lands (39 pictures, 2.6 s in the game, hit at 1.1 s).
- Plan 4.4 checks: neon blue cube, one straight punch to the left, the cube bursts into blue goo in her fist, she opens her hand and returns; same girl; standing height 1,037 px first and last; feet on row 1,153 in all 150 pictures; last against first 1.04 of 255. Edge: a few flying goo drops cross the left edge of the video in 8 pictures (never her hand or body); the bake box cuts them, so none shows in the game. Clip gate (measured part): no flags.
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke (its board_sync_test fails the same two checks on main before these builds). Looked at in the Battle Guide player at the hit, portrait and landscape.
- Tom's card: t-anim-grace-cubepop-tvik.

## anim-deedee-scrub-1irj (2026-11-21): Deedee's "Hand Me My Glasses" Scrub brushes longer, arm out toward the monster

Card c-anim-deedee-scrub-1irj. Tom (Battle Guide, b3s17a): "Longer brushing, outward towards monster".
| | |
|---|---|
| Kept | The rev 1 Wan prompt word for word except one MOTION phrase, the start picture `art/clips/start/deedee-hero.png`, every setting (720p, 9:16, 5 s, first frame only so the glasses stay on), the bake shape (strike, every 3rd picture, 1.5x, figure 99.3 rows) |
| Changed | "scrubs it forward to the left once in one firm stroke at chest height. Without repeating the stroke," became "reaches it far out forward to the left at chest height, and scrubs back and forth three times in long firm strokes. Without scrubbing again," (`tools/art-library/prompts/wan-deedee-scrub-v2.txt`, job deedee-scrub rev 2) |
- Video: wan-gen run 44930655300, $0.50. Source `art/raw/clips/wan-deedee-scrub-v2.mp4`, baked pictures 9 to 132, hit at 81 (42 pictures, 2.8 s in the game; was 1 stroke, 2.0 s). Her arm stays out toward the monster for about 1.3 s while the brush goes out and back three times.
- Plan 4.4: glasses on her own eyes, a scrub brush, same woman and style; standing height the same first and last; feet within 0.8% of the frame height; background flat, cutout clean, never touches an edge. Measured clip gate: pass. Rev 1 files purged (`wan-deedee-scrub-v1.mp4`, `wan-deedee-scrub-v1.txt`).
- Tom's card: t-anim-deedee-scrub-1irj.

## anim-deedee-windex-z9p8 (2026-11-21): Deedee's Windex Spritz is a Wan 3.0 video now, made from the same prompt

Card c-anim-deedee-windex-z9p8. Tom (Battle Guide, b3s17a): "Remake with wan".
| | |
|---|---|
| Kept | The prompt of the approved Grok clip clip-deedee-windex, word for word (now `tools/art-library/prompts/wan-deedee-windex-v1.txt`), and the bake shape (strike with a hit picture, 1.5x, figure 99.3 rows) |
| Changed | Only what the note names: the video model (Wan 3.0 on fal instead of grok-imagine-video-1.5-lite) and with it the family route's start picture and settings (`art/clips/start/deedee-hero.png`, 720p, 9:16, 5 s, same first and last frame) |
- Video: wan-gen run 44930655300, $0.50. Source `art/raw/clips/wan-deedee-windex-v1.mp4`, baked pictures 21 to 117 every 3rd, hit at 69 where the mist leaves the nozzle (33 pictures, 2.2 s). First cut ended at 105 with her hand still on her hip; recut to 117 so it ends in her stance.
- Plan 4.4: a blue spray bottle from behind her back, one squeeze with a small mist, tucked away; same woman and style; height and feet unchanged throughout; last picture against first 0.96 of 255; cutout clean. Measured clip gate: pass.
- The Art Library entry clip-deedee-windex is set to rejected with Tom's note (as anim-grace-give-q4es did), so the art-bake job does not cut the old Grok video over the new one.
- Tom's card: t-anim-deedee-windex-z9p8.

## anim-deedee-give-yy1o (2026-11-21): Deedee's Giving (support moves) is a Wan 3.0 video now, made from the same prompt

Card c-anim-deedee-give-yy1o. Tom (Battle Guide, b3s17a): "Remake with wan".
| | |
|---|---|
| Kept | The prompt of the approved Grok clip clip-deedee-give, word for word (now `tools/art-library/prompts/wan-deedee-give-v1.txt`), and the bake shape (kind state, every 2nd picture, 1.5x, figure 99.3 rows) |
| Changed | Only what the note names: the video model (Wan 3.0 instead of Grok lite) and with it the family route's start picture and settings (`art/clips/start/deedee-hero.png`, 720p, 9:16, 5 s, same first and last frame) |
- Video: wan-gen run 44930655300, $0.50. Source `art/raw/clips/wan-deedee-give-v1.mp4`, baked pictures 18 to 84 (34 pictures, 1.5 s).
- Plan 4.4: one open palm held out to the left, pulled back, still; same woman and style; height and feet unchanged; last against first 0.96 of 255; cutout clean, hand never reaches the edge. Measured clip gate: pass.
- The Art Library entry clip-deedee-give is set to rejected with Tom's note, so the art-bake job does not cut the old Grok video over the new one.
- Tom's card: t-anim-deedee-give-yy1o.

## anim-deedee-ko-yes1 (2026-11-21): Deedee's knock-out is a video now: she wobbles and sits down on the ground

Card c-anim-deedee-ko-yes1. Tom (Battle Guide, b3s17a): "Make".
- No new video was paid for. Her second Wan knock-out video from wanch1 (job deedee-ko rev 2, prompt `wan-deedee-ko-v2.txt`, already paid) was measured again the way Rose's approved knock-out was: her lowest drawn point sits 32 px of 1,280 (2.5%) above her standing feet, Rose's 28 px (2.2%). wanch1 had counted it as floating; by the same measure it is level with the clip Tom approved, and it shows a drawn shadow under her, as Rose's does.
- Plan 4.4: dizzy, a wobble, sinks straight down to sit on the ground with eyes closed and head drooping, held; same woman and style; background flat (a slight tint shift, keyed out clean: 28 stray pixels in 1.26 million); never touches an edge. Measured clip gate (ko: no hop, does not fall forward): pass.
- Bake: `art/raw/clips/wan-deedee-ko-v2.mp4`, pictures 34 to 112 every 2nd (40 pictures, 1.8 s), `data/clips/deedee-ko.js`. `B3_BODY_CLIPS.deedee.ko` points at it; her painted ko row (hurt pose, kneel) is purged from `B3_BODY_PAINT`. Deedee's dodge is now her only painted state.
- Deedee, Dodge (card c-anim-deedee-dodge-y4m3): two Wan tries, $1.00, not handed to Tom (stop-loss). Retry 1 (prompt without "away to the right") kept her feet down but she ducked forward to the left and her arm left the frame; retry 2 (one change: "back to the right") went the right way, feet down, but her flung arms ran off both edges and Wan drew a small object flying past. Arms out of the frame twice is the stop-loss. Next: the same prompt with the figure shrunk to 80% inside the video (`pad`, the change that kept her spread hands in frame on her victory); written on the card.
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py`, smoke. Looked at in the Battle Guide player, portrait and landscape. Spend this session: $2.50 on fal (ledger $30.60).
- Tom's card: t-anim-deedee-ko-yes1.

## board-artfallback (2026-11-21): new card to build the picture fallback rule (xAI first, WAN after 2 misses, stop after 4)

Tom (09:49): "we should use XAI as the default for images, but then if there are more than two failed attempts with XAI, then we should switch the image service to WAN." Approved 09:54. Plan with the five refinements: claude/art-fallback-plan.md. Card c-artfallback (Sonnet 5.5, medium). Board only, no game change.

## anim-grace-squeeze-qxim (2026-11-21): Grace's Soup-Dumpling Squeeze is an attack now: she pushes the dumpling at the monster with both hands and squeezes it

Card c-anim-grace-squeeze-qxim. Tom (Battle Guide, b3s17a): "This is an attack move, so she needs to hold the squishy out and basically essentially hold it with both hands and kind of push the monster with it and squeeze it while she does so".
| | |
|---|---|
| Kept | Everything in `wan-grace-squeeze-v2.txt` outside the one MOTION sentence the note names (the three parts, the pocket, the round white dumpling squishy, the grin, puffing back up, tucking it away, the return), the start picture, every Wan setting, the bake shape (strike, every 3rd picture, 1.5x, figure 90 rows) |
| Changed | One MOTION clause. Was: "holds it out toward the left in both hands at chest height and squeezes it hard once between her palms until it squishes flat". Now: "holds it in both hands at chest height and pushes it forward toward the left once, straightening both arms as she squeezes it hard between her palms until it squishes flat" (`wan-grace-squeeze-v3.txt`, job `grace-squeeze` rev 3) |
- Video: wan-gen run 44929359366, $0.50. Source `art/raw/clips/wan-grace-squeeze-v3.mp4` (v2 removed), baked pictures 18 to 132, the hit at picture 81 where her arms are straight out (39 pictures, 2.6 s in the game, hit at 1.4 s).
- Plan 4.4 checks: both arms push straight out to the left with the dumpling pressed into a flat oval, then it comes back; same girl; standing height 1,037 px first and last; feet on row 1,153 in all 150 pictures; never touches an edge; last against first 1.00 of 255. Clip gate (measured part): no flags (squeeze is an invented move: Tom's watch is the look check).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke (its board_sync_test fails the same two checks on main before this build: R5 replays the live board at a fixed time). Looked at in the Battle Guide player at the hit, portrait and landscape.
- Fixed on the way: main carried unresolved merge markers at the top of this file (the artbake1554 and guidegen1a entries); both entries kept, markers removed.
- Tom's card: t-anim-grace-squeeze-qxim.

## guidegen1b (2026-11-21): the Battle Guide folds your note into an animation's prompt and shows what changed

Card c-guidegen part 2. In the player sheet, a video has a box "What should change" and a no-video animation has "Anything to add"; Update the prompt commits `data/guide-reconcile.json` (message `guide: reconcile <animation id>`) and the `guide-reconcile` Action (`tools/guidegen/reconcile.py`, xAI text model, the existing repo secret XAI_API_KEY, no new key) returns the new prompt plus three plain lines (kept, changed, could not use and why), or one question when the note is contradictory, impossible or says nothing to change. The answer is checked in code first (parts in order, untouched parts identical, 70% of the words kept, length within 20%, one action once, no banned words); a broken answer is sent back once, a second failure is marked Check this one. He can edit the prompt by hand and Keep it (kept in this browser until a video is made). Nothing is generated yet. Tests: `python3 tools/guidegen/guidegen_test.py`, `python3 tools/battle_guide_test.py`. Plan: `claude/guidegen-plan.md`.

## anim-rose-give-w5ws (2026-11-21): Rose's Giving (support moves) is a Wan 3.0 video now, made from the same prompt

Card c-anim-rose-give-w5ws. Tom, from the Battle Guide: "Remake with wan".
- Kept: the prompt of the approved Grok clip, word for word (`clip-rose-give` in `data/art-prompts.json`, now `tools/art-library/prompts/wan-rose-give-v1.txt`): one open hand reached forward at chest height, palm up, once, then back to the stance and held.
- Changed: the video model (Wan 3.0 on fal, 720 x 1280, 5 s, job `rose-give` rev 1) and so the start picture (her large left-facing hero `art/clips/start/rose-hero.png`), sent as first and last frame as Grace's Wan give.
- Checks (plan 4.4): reads as a hand-over, palm up, then back; the same girl; standing height last 0.999 of first, feet on the same row in every picture; flat magenta, no halo, never touches an edge; ends where it began. Measured clip gate: no flags. The vision part needs the xAI key and was not run.
- Bake: video pictures 22 to 92, every 2nd, 36 pictures at 1.5x (1.6 s), `data/clips/rose-give.js`, `art/clips/rose-give.webp`, source `art/raw/clips/wan-rose-give-v1.mp4`. The Grok entry `clip-rose-give` is set to rejected with the reason, so the art-bake job does not cut the old video over this one.
- Spend: wan-gen run 44929736650, booked $0.50 (live price $0.23).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke; portrait and landscape looked at.

## anim-rose-victory-vqjc (2026-11-21): Rose's Victory is a Wan 3.0 video now, made from the same prompt

Card c-anim-rose-victory-vqjc. Tom, from the Battle Guide: "Remake with wan".
- Kept: the prompt of the approved Grok clip, word for word (`clip-rose-victory` in `data/art-prompts.json`, now `tools/art-library/prompts/wan-rose-victory-v1.txt`): she giggles, jumps straight up once with both arms high, lands on the same spot and holds the arms-up grin. Kept the start-picture-only setting of the other Wan victories (the clip ends in the held pose).
- Changed: the video model (Wan 3.0 on fal, 720 x 1280, 5 s, job `rose-victory` rev 1) and so the start picture (her large left-facing hero `art/clips/start/rose-hero.png`, as every Wan clip of hers). Also `pad: 0.8` (the picture shrunk to 80% inside the frame), the fix that kept Deedee's raised hands and Rose's Giddyup hair inside the frame.
- Checks (plan 4.4, every 5th picture plus measurements): reads as a victory jump and a held arms-up grin; the same girl; standing height last 0.98 of first, feet back on the start row within 0.6% of her height in the hold; flat magenta, no halo, never touches an edge; no return needed (state clip). Measured clip gate: one flag, size 1.09x, only in the airborne pictures where the size fit has under 80 matched details (0.99 to 1.04 in the hold): read as a false reading. The vision part of the gate needs the xAI key and was not run.
- Bake: video pictures 18 to 110, every 2nd, 47 pictures at 1.5x (2.1 s), `data/clips/rose-victory.js`, `art/clips/rose-victory.webp`, source `art/raw/clips/wan-rose-victory-v1.mp4`. The Grok entry `clip-rose-victory` is set to rejected with the reason, so the art-bake job does not cut the old video over this one.
- Spend: wan-gen run 44929736650, booked $0.50 (fal's live price $0.045 a second, $0.23).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke; portrait and landscape looked at.

## 2026-11-21 (3): Art Library bake, bg-29-grump-hollow (`artbake1554`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- bg-29-grump-hollow: `bake_battle_bg.py 29-grump-hollow` ran from art/raw/battle/bg-29-grump-hollow-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## guidegen1a (2026-11-21): the Battle Guide now shows a prompt for every animation, and says what is missing before one can be made

Card c-guidegen part 1. `tools/guidegen/build_map.js` writes `data/guide-anims.json`: for each of the 346 guide animations its Wan job or Art Library entry, the prompt (the real one where a video exists, otherwise a starter draft that keeps the same person's approved prompt and changes only MOTION), start picture, price, and what is missing. The player sheet shows it under the video: version, route, price a try, where the prompt came from, and "Cannot be made yet" for someone with no start picture. Nothing is generated and no key is on the page yet. Tests: `python3 tools/guidegen/build_map_test.py`, `python3 tools/battle_guide_test.py` (the stand-in board now starts without Tom's real animation notes). Plan: `claude/guidegen-plan.md`.

## board-guidegen (2026-11-21): new card to make and remake battle videos from the Battle Guide

Card c-guidegen. Tom (09:25): generate a missing video, or give feedback on one, have it merged into the prompt and regenerate, all from the Battle Guide. The card holds the full prompt (Sonnet 5.5, high). Board change only; no page or game file changed.

## anim-grace-give-q4es (2026-11-21): Grace's Giving (support moves) is a Wan 3.0 video now, made from the same prompt

Card c-anim-grace-give-q4es. Tom (Battle Guide, b3s17a): "Redo with wan".
| | |
|---|---|
| Kept | The prompt of the approved Grok clip clip-grace-give, word for word (now `tools/art-library/prompts/wan-grace-give-v1.txt`), and the bake shape (kind state, every 2nd picture, 1.5x, figure 90 rows) |
| Changed | Only what the note names: the video model (Wan 3.0 on fal instead of grok-imagine-video-1.5-lite) and with it the family route's start picture and settings (`art/clips/start/grace-hero.png`, 720 x 1280, 5 s, first and last frame, seed 81), job `grace-give` in `tools/art-library/wangen-jobs.json` |
- Video: wan-gen run 44929359366, $0.50 (fal ledger $25.10). Source `art/raw/clips/wan-grace-give-v1.mp4`, baked pictures 27 to 89 (32 pictures, 1.4 s in the game).
- Plan 4.4 checks: reads as a give (one open palm offered to the left, pulled back, still); same girl, face, outfit and style; standing height 1,037 px first and last; feet on row 1,153 in all 150 pictures; background flat, never touches an edge; last picture against first 1.03 of 255. Clip gate (measured part): no flags. The vision part only advises on give (an invented move, CLAUDE.md "Clip quality gate"), so Tom's watch is the look check.
- The Art Library entry clip-grace-give is set to rejected with Tom's note, so the art-bake job does not cut the old Grok video over the new one (as wanch1f did for its replaced entries). Its approved source `art/raw/clips/clip-grace-give-v1.mp4` stays (Library history).
- Grace, Dodge (card c-anim-grace-dodge-p7wh): not made, $0. Wan missed it twice the same way in wanch1 (her feet leave the ground), so a third Wan try is past the stop-loss; the card is retired into c-wanch2 (dodge on Kling 4) with Tom's note.
- `tools/battle_guide_test.py`: its stand-in board drops real note cards on the two animations it sends notes on (Tom's real Lounge Pass card made 4 of its checks fail on main).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke. Looked at in the Battle Guide player, portrait and landscape.
- Tom's card: t-anim-grace-give-q4es.

## board-guideplanned (2026-11-21): the Battle Guide's next card now shows everything planned but not built, marked PLANNED

Card c-battleguide2. Tom (09:21): "Can you do the same thing with anything else that's planned but not built yet". The card's prompt gained Part 4 (unbuilt moves, the BAG, Tombo skins, which chapters are on the new battle, Part 2 monsters, missing rules, a What is coming topic), its effort went from medium to high, and its title changed. Board change only; no page or game file changed.

## board-guidevibe3 (2026-11-21): the Battle Guide's next card now also shows each person's third Vibe, marked as planned

Card c-battleguide2. Tom (09:19): "How come I'm not seeing the third vibe for each character". Fact: the guide shows what the game holds, and the game has 20 of the spec's 30 Vibes; the third of each person is battle stages 19 to 21. Board change only; no page or game file changed.

## b3s17c (2026-11-21): chapter 4's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s17, part c. Chapter 4 joins chapters 1 to 3: the Cue Card Crab, the Clapper Snapper, the Boom Mic Moth (with their Extra Extras) and The Director's Cut play on Battle 3 with the bestiary's Vibe Points (8 each, 26 for the boss) and tips for Battle 3 (`ch4crab`, `ch4clapper`, `ch4moth`, `directorscut`): Pet Peeves and Resists, Posterboard Shell, Card Toss and Bleed, Scene One Marker!, Skill Lock (only Pocket Vibe Skills), CUT! (a Break, an interrupt, Blind or Tom's Suite Door Slide stops it) and ACTION! (strip the speed buff). No Warmth bar, no HEART, no Tombo. A win over The Director's Cut sets `kind:directorscut`, so the kind ending plays.
- Scene change: TNB's coaching after a loss has a Battle 3 version (`B3_CH_ON(4)`); the first line is the same as before so its clip still plays, the second line is new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old line.
- Tests: `tools/ch4_b3_test.py` in portrait and landscape (11 steps from Chapter Select to the studio; every fight on Battle 3, no Warmth words, tips once each, Vibe Points paid), `tools/b3-check-s17.js` (chapters 1 to 4), `unused_voice.py` 0 on all checks. `tools/b3_story_test.py` failed once on its "a save made on Battle 3 loads with the switch on Old" step after a long run and passed on every re-run on its own; the chapter 1 scene fight in that step had not started after 30 seconds (an intro card was still up). Not changed.
- Not looked at: the chapter 5 fights (last part).

## costsduo1 (2026-11-21): AI Costs has a folded and an unfolded iPhone Duo layout

Card c-costsduo1, from Tom's answer "Build it as drawn" on t-costsduo-go. costs.html now picks one of three layouts by width and re-picks when the width changes (unfolding the phone), so no reload is needed. Both parts of the plan (a: pocket, b: open book) went out in this one build.

- Pocket (under 900 px: folded 382 and 466, open upright 669): tabs at the bottom, a filter pill that opens a sheet (Dates, Show; on Ledger also Service, Kind, Subtotal by, tick boxes, CSV), the first Overview screen shows the total, four tiles and the next renewal at 382 x 580, two-line charges, a charge opens in a sheet with its reference, services open as a screen with a back arrow, Totals has a By month / By service list. A finger replaces hover: tap a month bar, the share bar or the running total for the split.
- Open book (900 to 1,099: open sideways 951): a rail of the four screens, the list on the left half and what was tapped on the right half (a service on Overview and Services; subtotals as tap-to-filter bars plus the charge details on Ledger; the month grid, kind and billed-through on Totals).
- Desktop (1,100 and up) is unchanged: `tools/costs_test.py` passes. The viewport is now `width=device-width`.
- Call made: the two parts shipped as one build instead of costsduo1a then costsduo1, because the shared pieces (filter sheet, details, tap in place of hover) are the same code.
- Test: `tools/costs_duo_test.py` (382 x 580, 466 x 657, 669 x 869, 951 x 648; every screen; no sideways scroll, totals equal the file, no text under 12 px, no tap target under 36 px, tabs, rail, taps, resize 382 to 951 without a reload). Every picture looked at.
- Purged: `docs/costs-duo-mock.html` (the drawing) and its mentions in docs/COSTS.md and claude/costs-duo-plan.md.
- Not looked at: a real Duo (a desktop browser with touch emulation was used).

## 2026-11-21 (2): Art Library bake, prop-gate-row-amyhouse-open (`artbake1553`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-gate-row-amyhouse-open: background keyed from the corner colour rgb(208, 10, 122)
- prop-gate-row-amyhouse-open: `bake_gate_art.py row-amyhouse open` ran from art/raw/props/prop-gate-row-amyhouse-open-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## 2026-11-21 (1): Art Library bake, prop-gate-row-amyhouse, prop-gate-row-amyhouse-open (`artbake1552`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-gate-row-amyhouse: background keyed from the corner colour rgb(226, 5, 106)
- prop-gate-row-amyhouse: `bake_gate_art.py row-amyhouse locked` ran from art/raw/props/prop-gate-row-amyhouse-v1.png
- prop-gate-row-amyhouse-open: background keyed from the corner colour rgb(208, 10, 122)
- prop-gate-row-amyhouse-open: `bake_gate_art.py row-amyhouse open` ran from art/raw/props/prop-gate-row-amyhouse-open-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## b3s17b (2026-11-21): chapter 3's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s17, part b. Chapter 3 joins chapters 1 and 2: the Soggy Socks, the Tangle and the Bobber, the Snag and Old Iron-Gill play on Battle 3 with the bestiary's Vibe Points (9 each, 27 for the boss) and tips for Battle 3 (`ch3sock`, `ch3tangle`, `ch3snag`, `irongill`): Pet Peeves, Resists, the wind-ups (Squelch, Big Knot, Undertow, Pepper Belch, Deep Dive), the Sock Iron-Gill hides behind, Toasty and Steam Cloud!. No Warmth bar, no HEART, no Tombo. A win over Iron-Gill sets `kind:irongill`, so the kind ending plays.
- Scene changes: the "New Tombo: You Hold the Net" toast is skipped on Battle 3 (the flag stays). Boppy's coaching after a loss has a Battle 3 version (`B3_CH_ON(3)`); its first line is the same as before so the recorded clip still plays, the second line is new and not recorded yet (it plays by speech synthesis and shows under No clip yet in the Voice Library). OLD keeps the old line.
- Tests: `tools/ch3_b3_test.py` in portrait and landscape (12 steps from Chapter Select to home; every fight on Battle 3, no Warmth words, tips shown once each, Vibe Points paid), `tools/b3-check-s17.js` (chapters 1 to 3), `unused_voice.py` 0 on all checks. `tools/b3_chapter_lib.py` now presses Enter through a close-up inside a scene.
- Not looked at: the chapter 4 and 5 fights (next parts).

## costsduoplan (2026-11-21): AI Costs on the iPhone Duo: assessment, design and a drawing to open on the phone

Card c-costsduoplan. Tom: "Assess the user experience and come up with an idea for supplemental design that supports layout for iPhone duo folded and unfolded views ... create the necessary Kanban cards to kick off this process via the board".

- Assessment (measured on the live page): the desktop layout is fixed at 1,280 wide, so the folded Duo shows it at 30% (table text 4.2 px, filter buttons 9 px tall), open upright at 52%, open sideways at 74%. The split of a month and the reason behind "Confirm amount" only show on hover.
- Design, in `claude/costs-duo-plan.md`: one page, three layouts by width. Pocket (under 900 px): one column, the total, four tiles and the next renewals on the first screen, four tabs at the bottom, two-line charges, details in a sheet. Open book (900 to 1,099 px, the Duo open sideways): two panes that meet at the fold, the list on the left and what was tapped on the right; on Ledger the charges sit beside their subtotals. Desktop unchanged.
- Drawing: `docs/costs-duo-mock.html`, four frames at the real sizes with typed numbers. On the Duo it fills the screen and follows fold and unfold; Overview and Ledger switch. It is deleted when the real page matches it.
- Nothing in costs.html changed. Cards: Tom's decide card t-costsduo-go starts the build card c-costsduo1 (Sonnet 5.5, medium) by itself.

## b3s17a (2026-11-21): chapter 2's story fights now run on the new battle (BY CHAPTER), with Vibe Points and new tips

Card c-b3s17, part a. Chapter 2 joins chapter 1 in `B3_STORY.chapters`: the two Smoglets (new row `smoglet2`, 10 VP), the Ticket Flurry, the Coyote and The Big Shake play on Battle 3 with the bestiary's Vibe Points (10 each, 30 for the boss) and tips written for Battle 3 (`ch2lawn`, `ch2flurry`, `ch2coyote`, `bigshake`; no Warmth, no HEART, no Tombo). OLD still plays chapter 2 on battle 2 on the same save.
- Two calls made: (1) `b3sEnd` sets the `kind:<boss>` flag on a boss win from chapter 2 on, because chapters 3 to 5's after-boss scenes branch on it and Battle 3 has no Warmth bar to set it (chapter 1 is unchanged, so Milestone B is not disturbed). (2) The two chapter 2 "New Tombo" toasts are skipped on Battle 3 (`B3_CH_ON(n)` replaces `B3_CH1_ON` in `data/scenes.js`); the Tombo flags stay, Tombos return in stage 16.
- Test: `tools/ch2_b3_test.py` (portrait and landscape, shared helpers in `tools/b3_chapter_lib.py`; checks per fight: Battle 3, no Warmth words, tips shown once each, Vibe Points paid). Simulator checks: `tools/b3-check-s17.js` (2323 checks, none fail). `tools/b3_story_test.py` moved to chapter 6 for "not switched".
- Not looked at: the chapter 3 to 5 fights (parts b, c and the last push).

## costs1icon (2026-11-21): the AI Costs page has its own browser tab icon

Card c-costs1icon. Tom: "Give it a unique favicon". The page used the Admin gear. It now has a gold receipt with a dollar sign on the admin icons' dark background: `icon-costs-32.png` (browser tab) and `icon-costs-180.png` (home screen), drawn by `tools/make_costs_icon.py`. `tools/costs_test.py` checks the page links both and that they differ from the Admin icon (FAILS: []).

## battleguide1 (2026-11-21): Battle Guide, a reference page for the new battle system that fits the Duo folded and unfolded, with a player for every battle video and a note to Claude on any animation

Card c-battleguide. Tom (11-21 07:15): "create an iPhone Duo folder and unfolded optimized page for the latest version of the battle system... a reference guide for me as i test... a way to preview each animation and provide feedback on the animation directly Claude which opens a new ticket to regenerate the animation based on the feedback." And 07:26: "It's favicon should be something related to the battle system library different from the battle lab favucon."

| Piece | What it is |
|---|---|
| Page | `battle-guide.html` (ADMIN > Battle system > Battle Guide). Five tabs: Rules, Family, Monsters, Statuses, Animations, plus Search. No game engine is loaded. |
| Always the latest | It reads `index.html`, loads the game's own `data/b3-*.js` in the game's order and renders from them: 10 family members, 20 Vibes, 81 moves, 63 monsters, 129 statuses and 3 hazards today. Rule numbers in the Rules tab come from `B3_RULES`. The header shows the game build. |
| Duo | One column with a bottom tab bar when folded (466 x 657, 678 x 445); list and detail side by side when unfolded (951 x 648, 669 x 869). The switch is both sides at least 560 px, the game's own number (docs/DUO.md). |
| Animations | 346 listed (body states, family moves, monster attacks and wind-ups); 68 are videos today. A video plays from the same packed picture the game uses (pause, frame slider, 1x, half and quarter speed, the HIT frame marked). A move with no video says so. |
| Note to Claude | The player has Send to Claude. It saves a Claude card on the board (`c-anim-...`, theme Battle Animations, Opus 5.5 medium, fields `anim` and `notes`) with the full prompt; a second note on the same animation joins the open card. The sent screen shows the five handoff items and Copy prompt. It uses the GitHub token the Board page saved. |
| Icon | `icon-battleguide-180.png`, `icon-battleguide-32.png`: an open book with a gold star on teal (the Battle Lab's is crossed swords on maroon). |
| Test | `python3 tools/battle_guide_test.py` (4 Duo sizes, about 1 minute, FAILS: []); pictures `tools/shots/battleguide-*.png`. Facts: `docs/BATTLE_GUIDE.md`. |

Calls made: the third Vibe of each person is not shown because its data is not built; the game's own tips are shown word for word; character one-liners are written in the page (`WHO`) from docs/CANON.md and the spec's headings. Not done: a move with no video cannot be played in the page (it has no animation of its own, only the standard motion); card c-battleguide2 adds a way to see it in a real fight. Nothing in the game changed.

## costs1 (2026-11-21): ADMIN > AI COSTS, a desktop page for what every AI service costs

Tom: "come up with an admin screen for all the AI services we are connected to, the subscription type i have, what it allows, what my balance is, how much ive spent so far ... a complete history of my spend with dates for each transaction so i can total and subtotal in any way that i want. as well as a final cost total screen ... including with claude".

- New page `costs.html` (its own address, button AI Costs on admin.html, no game code): Overview, Services, a screen per service, Ledger and Totals. Laid out for a desktop browser in landscape only.
- New data file `data/costs.json`: 8 services (Claude, Google AI, xAI API, X Premium, ElevenLabs, fal.ai, Sorceress, GitHub) and 29 charges read from the receipts in Tom's email, Jul 30 to Nov 20, $975.44 in all. Every row has its date, Pacific time, kind, where it was billed and the order or invoice number. Three amounts are marked to confirm.
- Ledger: search, service chips, kind, sort, subtotal by service, month, week, kind or paid through, tick rows to add them up, CSV of the rows shown. Totals: grand total, running total, service by month (a figure opens its charges).
- What each plan allows is written with where it was read (provider pages read Nov 20, receipts, repo docs). Holes are listed under Needs a look (Apple sends no renewal receipts, one ElevenLabs invoice has no email, xAI and ElevenLabs balances not read).
- Not done: balances are not read automatically and the jobs do not log their spend into the ledger yet (card c-costs2, steps in docs/COSTS.md). "Add a charge" and "Record the balance" save to the browser only.
- Docs: docs/COSTS.md. Test: `python3 tools/costs_test.py` (FAILS: []).

## qa-battle2 (2026-11-21): old battle screen problems checked on the new battle; none exist there, nothing changed

- Card c-qa-battle2 (chapter 1 QA report, build keysecrets2). Ran `tools/ch1_b3_test.py` in portrait and landscape and looked at the battle and victory card frames, and searched the Battle 3 files for the old texts.
- BUG-05 (BAG count): Battle 3 shows BAG as "Not yet", no count. BUG-06 (status pills): statuses stack 13 px apart over the head; the one shown fit. BUG-09 (victory card): no scrollbar, LEVEL UP! inside the card. BUG-10 (Raspberry arrow, Defend and Inspect copy, Tombo icon): none of that text or those buttons exists in Battle 3. COH-09 (Inspect names Flashcard Flurry and Red Pen): no such hint in Battle 3.
- Not looked at: several status tags at once on one enemy (the code stacks them; none came up in the test fights). No game file changed.

## voicepurge221 (2026-11-21): 221 old dialogue clips that nothing plays were purged

Card c-voicepurge221. Check 4 of `tools/clip-audit/unused_voice.py` listed 221 baked dialogue clips with no scene, harvest line or source (old chapter 1, 3 and 6 lines). Removed with `purge_unused.js` (spec `tools/clip-audit/purge-voicepurge221.json`), Voice Library list rebuilt (221 removed), all four checks 0. List in docs/PURGED_VOICE.md.

## ch2lessons (2026-11-21): chapter 2 cut by the chapter 1 lessons: 93 lines became 73 (20 cut, 4 rewritten, two orphans fixed), every voice script retagged in Tom's style

Card c-ch2lessons. Tom (2026-11-20): apply the lessons of his day of chapter 1 cuts to chapter 2, which he has not played yet. A fresh reviewer that read only claude/tom-line-edits.md, claude/story-line-rules.md and the 93 lines marked every line KEEP, CUT or REWRITE with a rule number. Claude applied all of it (no line replaced after a cut; each scene was read again and still makes sense).

| Count | |
|---|---|
| Lines before | 93 (9 scenes) |
| Cut | 20 (one in 4.7): Tom 11, TNB 7, the Big Shake 1, Doña Carmen 1 |
| Rewritten (rule 4, from what the character wants) | 4: Tom 3, Grace 1 |
| Lines now | 73 (70 distinct recordings; Mr. Washington's greeting repeats 4 times) |
| Kept as Tom wrote it | "Poke it. Yes. But maybe just gently." |

| Scene | Before | After | Rule |
|---|---|---|---|
| Scene 1 | Tom: Ha! It WOULD. Okay. Your turn. Toast. | CUT | 7, 9 |
| Scene 1 | Tom: That is a very purple sky. Okay. Hills first. Then bread. | CUT | 7 |
| Scene 2 | Tom: Ha! I am. Right after we gently poke a cloud. | CUT | 7, 8 |
| Scene 3 | TNB: Babe. He's stuck. You're just keeping him company. | CUT | 7 |
| Scene 3 | TNB: Huh. So that's a monster. Smaller than I pictured. | CUT | 7 |
| Scene 4 | Tom: It's coming out of the Observatory. But the Observatory's so nice. | Tom: Oh, Observatory. Not you. | 7 (rule 4 rewrite) |
| Scene 4 | TNB: It's always the nice ones. | CUT | 8 |
| Scene 5 | Tom: Denied? | CUT | 7 |
| Scene 5 | Tom: She's standing on my feet. Both of them. I'm going to hold very still. | CUT | 7 |
| Scene 6 | Tom: Excuse me. Sorry. I had to check. | CUT | 2, 7 |
| Scene 6 | Tom: Thank you, Nara. A burnt flashbulb. Grace has one just like it on her clue list. | CUT | 7 |
| Scene 6 | Tom (text, to Grace): Grace, I'm on the job. There's a lemon stuck in an orange block up here, and Nara just found a burnt flashbulb next to it. I wrote it all down. It's on page nine. | Tom (text, to Grace): Grace, reporting in. There's a lemon stuck in an orange block, and Nara found a burnt flashbulb right next to it. I wrote it down. | 10 (orphan "page nine") |
| Scene 6 | Grace (text): Tata, step away from the block. You left fingerprints on the last one. Send me a picture with the lemon AND the bulb in it. I'm writing them both down. In pencil. | Grace (text): Tata, don't touch it! Send me a picture of both. And don't let Nara lick it. | 10 (orphan "fingerprints", "In pencil") |
| Scene 6 | Tom: Picture taken. Not touching. I'm two feet back. Two and a half. | CUT | 8 |
| Scene 7 | Tom: GAH! I've picked up Nara. I don't remember deciding to. | Tom: GAH! I've got you, Nara. We're fine. We're both fine. | 7 (rule 4 rewrite) |
| Scene 7 | TNB: Well, well, well... look who's up. | CUT | 13 |
| Scene 7 | The Big Shake: RUMBLE. Stay back. I shake. | CUT | 2, 7 |
| Scene 8 | Tom: Ha! I'm keeping that too. | CUT | 8 |
| Scene 8 | TNB: Sky's blue again. Shame. The purple was growing on me. | CUT | 7, 8 |
| Scene 8 | Tom: Still grey. Sorry, tree. We'll come back. | CUT | 10, 8 |
| Scene 9 | Tom: A second sentence! Welcome back, Mr. Washington. | CUT | 7 |
| Scene 9 | TNB: You said it. I was there. | CUT | 7 |
| Scene 9 | Doña Carmen: Then I wasn't feeling well. | CUT | 8 |
| Scene 9 | TNB: Hills, then bread. | CUT | 8 |

The rewrites, checked by the three tests (no other character could say them unchanged; each cares about someone else: the Observatory, Grace's case, the evidence, Nara; no trait word) and the copy check (0 hits against bank.txt and old.txt; the only hits against the game are the old line each replaces). The two orphans are gone: Grace's text no longer mentions fingerprints or the pencil (both cut from chapter 1), and Tom's text no longer plants "page nine" for chapter 3.

**Retag.** All 70 voice scripts were written again from scratch by claude/voice-tag-style.md (WHY W1 to W8, the five-step method), after reading Tom's kept chapter 1 lines for Tom, TNB and Grace in tools/voice-library/scripts/ch01-story-directions.json: a tag directs the sound of the next words, pushed to the extreme, one idea per bracket, a new bracket where the sound turns, quick on jokes, [emphasized] before the stressed word. TNB carries "mellow, laid-back, low-key" in every bracket. The accent goes in every bracket for Mr. Washington (thick Louisiana drawl), Miss Odette (thick Louisiana Creole accent) and Doña Carmen (heavy Salvadoran accent); chapter 2 has none of the Long Island speakers. A second fresh reviewer read only the brackets and flagged 14 (mild words, two directions in one bracket, Tom too bright); all 14 were fixed. Five before and after:

| Line | Before (ch2build) | After (ch2lessons) |
|---|---|---|
| Tom, scene 1 | [agreeing at once, earnest] Poke it. Yes. [small, concerned for the cloud] But maybe just GENTLY. | [agreeing, quick] Poke it. Yes. [pause] [hesitant, softer] But maybe just [emphasized] gently. |
| Tom, scene 3 | [uneasy, careful] She's... [flat, certain] CONSISTENTLY well. | [hesitant, slow] She's... [pause] [very very deadpan] [emphasized] consistently well. |
| Smoglet, scene 3 | [wet cough, then flat and rude] Ahem. You're in my way. | [wet cough] Ahem. [rude, very flat] You're in my way. |
| TNB, scene 1 | [mellow, mild interest] huh. [punchline, level] that'd tip the scales. | [mellow, laid-back, low-key, pause] huh. [mellow, laid-back, low-key, deadpan] that'd tip the scales. |
| Doña Carmen, scene 9 | [flat, final] I never said that. | [heavy Salvadoran accent, very dismissive] I never said that. |

tools/voice-library/apply-scripts.py: three limits Tom's own tagging breaks were removed (at most 2 descriptors per bracket, at most 2 words per descriptor, and the bracket count by line length, which 21 of his 95 kept chapter 1 scripts break), and "sigh" left the sound-noun list because Tom writes it himself. The body, prop and sound word check stays. All 70 chapter 2 scripts pass it.

**Recordings needed (none of chapter 2 was recorded before either):** 70 lines: Tom 31, TNB 20, Doña Carmen 4, the Big Shake 4, Miss Odette 3, Mr. Washington 2, Smoglet 2, Ticket Flurry 2, Canyon Coyote 1, Grace 1. Card t-ch2voices makes them with one tap after t-ch2play.

In the game: data/scenes.js (chapter 2 talk steps cut or reworded; no stage directions changed), tools/voice-library/scripts/ch02-story-directions.json, claude/story-ch02-draft4.md (repo copy, header and voice scripts rewritten), docs/script-convos.tsv (ch2Boss row follows its new first line; purposes written for the three chapter 2 conversations that had none), data/script-index.json and the Voice Library list rebuilt. Lessons added to claude/story-line-rules.md (rules 14 to 16).

Tests: tools/ch2_lines_test.py ok (73 of 73). tools/ch2_test.py in portrait and landscape: all 19 story checks pass, frames looked at (every rewritten line on screen); its one fail is a 404 for bgs/29-grump-hollow.webp, the Grump Hollow battle background that waits on Tom's approval (qa-coh05), present on main before this build. unused_voice.py: checks 1, 2, 3 and 5 at 0; check 4 lists 221 old dialogue clips nothing plays (chapters 1, 3 and 6 rebuilds), the same 221 as on main before this build and none from chapter 2; left for card c-voicepurge221 so this build stays on its card.

## b3s15 (2026-11-21): chapter 1's story fights now play on the new battle system, with a switch in ADMIN to go back to the old one

- Build: stage 15 of the new battle system ("Battle 3"). Plain list of chapter 1's old-battle references by kind: `docs/BATTLE3.md` "What stage 15 holds". Only chapter 1's share was replaced.
- The switch: ADMIN > Battle system > Story battles has OLD, BY CHAPTER (default) and NEW. It is kept on the phone. OLD plays chapter 1 on the old battle with the same save. NEW beyond chapter 1 is not finished: only chapters 1 to 10 have Battle 3 formations, and their story hand-offs are not built.
- One door: `startBattle` is wrapped by `engine/b3-story.js`, so scene fights and map monsters both route there. `B2.result`, the `battle:<id>` flags, `monsterFall` (the Hollow trail) and the Tombo unlock flags work as before.
- Story fights pay XP, coins and a drop as before, plus Vibe Points (15 each for the 3 Mudlings, 10 for a formation, 30 for the Big One). The victory card shows a "+n VP" line per person and the Ruckus gauge in its footer (no HEART).
- HP carries between fights as a share of Max HP. A loss leaves everyone at 1 HP and Deedee's line plays as before.
- Saves gain `b3:{v:1,ruckus}`; nothing is removed. Existing saves get a level floor and a pool of 135 Vibe Points per chapter finished (idempotent, never lowers anything). TNB, Nara and Boppy get a loadout when the story recruits them.
- New battle tips replace the old ones for these fights (Battle 3 words only). No Warmth bar, WARMTH command or HEART line in any chapter 1 fight; the two Tombo toasts show under OLD only.
- Tests: `node tools/b3-sim.js check` CHECKS 2205, FAILS []; `tools/b3_story_test.py` (52 checks); `tools/ch1_b3_test.py` (chapter 1 from Chapter Select to the job scene, portrait and landscape, no page errors); `tools/b3_test.py s4` (one stale expectation updated: late joiners have no loadout until recruited). `tools/smoke.py` passes except `board_sync_test` R5, which fails the same way before this build.
- Fact for Milestone B: a new save is at Rank 1 in chapter 1 and the plain player needs 7.83 rounds for the Big One at Rank 1 (5.78 at Rank 2); target 5 to 7. Left as is. XP needed no change: clearing the Hollow pays 250 XP, 2.5 levels.
- Not done: Rose Mode's emergency muffin (`b7Pie`) has no Battle 3 form.

## fix-itembannerart-pics-4 (2026-11-21): the last 2 item pictures (racing flats, birthday sash) remade with one phrase changed each; all 3 are ready for your review

- Tom (card t-itembannerart-pics): "2 more images failed, which is major improvement. We're getting close. He's feedback to adjust the prompt". The Tiny Clay Taco passed (QA 15 of 15), so it was not touched.
- Smallest change, from the QA lines: the flats came back as slippers (no laces, open heel), so "so each shoe looks almost like a slipper" became "laced up like a running shoe with a closed heel"; the sash came back as a big crossed bow, so "a big gold bow" became "a small gold bow". Everything else in both notes, and the solo prompt, kept word for word (`SOLO_NOTE` in `tools/art-library/itemart-prompts.js`, promptRev 2).
- Made the 2 again through the board (commit `board: generate t-itembannerart-pics`, $0.12). Looked at (fact): the flats are low neon yellow laced running shoes on a thin sole (QA 13 of 15: paint style, sole "not paper-thin"); the sash is a wide gold band in a loop with a small bow near the bottom (QA 12 of 15: paint style, plus "laid flat" and "three-quarter view", which contradict each other). The paint-style line was also raised on the taco's earlier runs and on approved sheets, so it is not a reason to hold them.
- Card c-itemart-refs (reference photos) retired: no photos are needed now. No in-game report was filed since 08:38. Nothing in the game changes until Tom approves; the 3 items show their emoji until then.

## projclean1 (2026-11-21): Project docs move finished: working notes live in the repo's claude/ folder, the Project keeps four mirrors

- Card c-projclean: copied project-instructions.md, status.md and build-plan.md into claude/ word for word; 28 compare-group docs matched the repo copy and were deleted from the Project; story-build.md takes the Project text (one missing period).
- Stop the regrowth: claude/README.md rewritten (the repo copy is the original), CLAUDE.md rule projclean1, claude/handoff-rules.md 'Where notes go' (also written to the Project mirror, with next.md, which was stale there), claude/INDEX.md written by tools/claude_index.py, and publish.yml leaves claude/ off the game site (no game file loads from it).
- Project: 1,941,747 bytes on 2026-11-20, 577,628 now; Tom cards t-projinstr2 (two lines of the Project instructions) and t-projdelete (two docs the session was not allowed to delete). Docs only: no game file changed.

## board-itemart-refs (2026-11-20): board only: the 3 remade item pictures missed again; stop-loss, card c-itemart-refs waits on 3 reference photos from Tom

- Ran the fix-itembannerart-pics-3 prompts for the 3 items ($0.18). Results (looked at, fact): Pro Racing Flats came back as plain yellow slippers (the words "almost like a slipper" were taken literally), Tiny Clay Taco as a real taco again (QA 15 of 15 but it is food), Birthday Sash as a ribbon bow again. Fourth miss: stop-loss, no fifth text-only try.
- Next: Tom sends one photo of each object; c-itemart-refs adds them as shape references and remakes the 3. Tom's words that started this: "Based on the feedback adjust the prompts for the failed images and regenerate".

## fix-itembannerart-pics-3 (2026-11-20): the 3 item pictures that missed get new prompts and are made again

- Card c-fix-itembannerart-pics-3, on t-itembannerart-pics. Tom: "Based on the feedback adjust the prompts for the failed images and regenerate".
- Looked at the 3 solo pictures (fact): Pro Racing Flats had a "JC" logo, stripes and normal soles; Tiny Clay Taco was filling in a shell, food rather than pottery; Birthday Sash was a ribbon with a bow, no long band. QA called the taco and the sash a 3D render.
- Changed only the 3 solo prompts (`SOLO_NOTE` in tools/art-library/itemart-prompts.js): each note now describes the shape to paint (flats: one smooth color, sole as thin as paper, seen from the side; taco: one glazed clay ornament, filling is glazed bumps; sash: a long wide gold band in a loop, bow on it). One STYLE line added for solo pictures: broad color areas, few strokes, no airbrushed finish. Kept: the rest of the prompt, the reference picture, the redo sheets' notes (approved). promptRev 1 on all 3, so the pictures are made again.
- No report was filed since the card was made (reports.py list: 0 open).

## projclean1f (2026-11-21): Project docs moved into the repo: the last 10 large docs copied into claude/ (ability revamp plans, battle design, old changes and status notes)

- Card c-projclean: copied word for word to the same path in claude/: adventures-of-tom-ability-revamp.md, adventures_of_tom_ability_revamp_plan.md, battle-design.md, ability-revamp-brief.md, CHANGES.md (the old October change log, not docs/CHANGES.md), tombo-review.md, kit-recipe.md, voice-baker-scripts.txt, voice-baking.md, portrait-style.md. Docs only: no game file changed.
## fix-conflictmarks (2026-11-20): the game would not start: merge conflict markers on main removed from engine/main.js and index.html

- Fact: the board-sync commit 25f41e6 ("part shipped projclean1e") committed unresolved merge markers (`<<<<<<< HEAD` ... `>>>>>>> 7cbde07`) into `engine/main.js` (the build stamp line) and `index.html` (the build-history and main.js script tags). A browser stops reading `engine/main.js` at `<<<`, so a fresh load of the live game did not start; `data/build-history.js` also loaded twice.
- Fix: kept one copy of each line (both sides held the same text apart from the build name; the newer side is kept). Nothing else changed. Found by the c-b3s15 session when its test page would not load.
- Not looked at: how the markers reached main (a rebase conflict the board-sync job committed instead of stopping on). `git grep -n '^<<<<<<< '` is clean after this build.

## board-boppy-bigfish (2026-11-20): board only: Boppy cap card waits on Tom's picture approval

- Card c-boppy-bigfish moved to Waiting behind t-boppy-bigfish-pic (generate and approve Boppy's unimpressed pose). No game file changed.

## boppy-bigfisha (2026-11-20): Boppy's unimpressed pose prompt now uses his Paso Robles reference, back under To do in the Art Library

- Card c-boppy-bigfish. Checked on main (fact): art/chars/boppyemo-story.webp frame em_unimpressed and portraits/emo/boppy-unimpressed.webp still show the retired Big Fish cap. They come from Art Library entry boppy-em-unimpressed (v1), whose attachment 1 was boppy-hero-ref-v1, the old hero painting in the Big Fish cap; attachment 2 (boppy-emotions-v6) already wears Paso Robles.
- Changed one thing: attachment 1 is now art/raw/characters/boppy-hero-v2.png (Paso Robles cap, same mustache, vest, rod and basket as his mood sheet). Prompt text kept word for word. promptRev 1, status back to draft, so the entry is under To do.
- Tom card t-boppy-bigfish-pic: generate and approve. Then c-boppy-bigfish rebakes his mood frames and faces (ships as boppy-bigfish). No game picture changed in this build.
- Found, not fixed: `node tools/art-library/make-prompts.js` fails on main (npc-prompts.js line 15, a colour lookup gets undefined), so data/art-prompts.json was patched for this one entry only.

## projclean1e (2026-11-21): Project docs move: progress and next steps written on card c-projclean (second run paused, 444 docs moved)

- Card c-projclean: 444 Project docs are now in claude/ and gone from the Project (692,867 of 2,000,000 left in use). The card lists the 12 docs still to copy, the compare group, the docs held back on purpose, and steps 6 to 9. Docs only: no game file changed.

## board-b3s15 (2026-11-20): board only: stage 15 card and handoff notes added

- Tom's request: the stage 15 prompt and its board card. Added card c-b3s15 (Claude Sonnet 5.5, effort high, tag b3s15) in Up next and `claude/next-addendum-b3s14.md` (stage 14 results, what stage 15 must do, tests, git warning). No game file changed.

## projclean1d (2026-11-21): Project docs moved into the repo: 61 more docs copied into claude/ (fourth part of the second run)

- Card c-projclean: copied 61 more Project docs word for word to the same path in claude/ (area, tombo, ability, status and plan notes, the 46_tomhouse set, baker status notes). No game file changed.
- Not copied: monster-codex-build.md (a safety classifier stopped the write) and 46_tomhouse_geometry.json (it could only be rebuilt by script, not copied byte for byte); both stay in the Project.

## projclean1c (2026-11-21): Project docs moved into the repo: 118 more docs copied into claude/ (third part of the second run)

- Card c-projclean: copied 118 more Project docs word for word to the same path in claude/ (area QC notes, tom, olivia and justin character prompts, square and area kits, nara and boppy prompts, ability feedback notes, voice and battle notes). No game file changed.
- Not byte-checked against the Project text: claude/battle-background-prompts.txt (171 KB, assembled by a script from the shared blocks); it stays in the Project until compared.

## projclean2b (2026-11-21): Project docs move: build name 2a put on its card, no files copied

- Card c-projclean: the previous push named build projclean2a before it was on the card; this push records it. No game file changed.

## projclean2a (2026-11-21): Project docs move paused at a safe point: progress and next steps written on card c-projclean

- Card c-projclean: 267 Project docs are now in claude/ and gone from the Project; the card lists what is left and the rules for the next run. No game file changed.

## projclean1b (2026-11-21): Project docs moved into the repo: 116 more docs copied into claude/ (second part of the second run)

- Card c-projclean: copied 116 more Project docs word for word to the same path in claude/ (art prompts, area and room kits, storybook and move sheet prompts, addenda, canon addenda). No game file changed.
- Left in the Project on purpose, not copied: next-addendum-michael.md (the write was stopped by a safety classifier); the held docs listed under projclean1a.

## projclean1a (2026-11-21): Project docs moved into the repo: 151 docs copied into claude/ (first part of the second run)

- Card c-projclean: the repo is now the one home for Claude working docs; the Project keeps only four mirrors. This part copied 151 Project docs word for word to the same path in claude/ (story, dialogue, next-addendum, tone and voice notes, the story bible, CHANGES-archive). No game file changed.
- Left in the Project on purpose, not copied: comedy-bible.md, story-ch08.md, story-ch08-rejected.md, story-ch08-brief.md, story-ch06.md, bernadette-rewrite.md (they spell out a full street address), costs1-handoff.md (a personal spending ledger), dialogue-clarity-rewrite.json (the write was stopped by a safety classifier; its .md twin copied in full).

## b3s14b (2026-11-20): New battle: balance pass follow-up, bosses checked at Rank 2 and Rank 5, no numbers changed

- Tom's card c-b3s14b (the open items of c-b3s14). Plain player, 100 fights per boss: at Rank 2 (the Lab default) all 11 bosses stay at 5.07 to 6.32 rounds; at Rank 5 eight stay at 4.98 to 5.94 and three fall under 5 (Big Shake 3.72, Iron-Gill 4.04, Old Ironbelly 4.98). Call: not retuned, since raising HP would push Rank 2 past 7. Table in docs/BATTLE3.md.
- `python3 tools/b3_test.py s13` passes (portrait and landscape), `node tools/b3-sim.js check` 2154 checks, 0 fails. Docs only: no data, engine or art file changed.

## b3s14 (2026-11-21): New battle: balance pass on Part 1, eight short bosses lengthened to 5 to 7 rounds (stage 14 complete)

- Tom's card c-b3s14: every Part 1 boss takes 5 to 7 rounds for the plain player, normal fights stay short. Data only, no engine file changed.
- Measured all 66 Lab fights first (100 simulated each, all won). Eleven bosses: three were already 5 to 7 (The Red Pen 5.8, The Unread 5.1, Old Ironbelly 5.1), eight were short. Normal fights and elites were left alone (0.7 to 5.7 rounds).
- The one change per boss was its HP (both sizes, scaled together; rounds grow about in step with HP): The Big One 420/320 to 610/460, The Big Shake 380/510 to 460/620, Old Iron-Gill 650/490 to 900/680, The Director's Cut 470/630 to 610/820, Chairman Cheeks 660/880 to 1130/1500, The Mirrorball 1590/1190 to 2380/1780, The Last Call 1800/1350 to 2230/1670, Brain Freeze 680/910 to 930/1250. Attack, Defense, Speed, pips and act power kept as the bestiary prints them.
- Rounds before to after: new6 3.5 to 5.78, new16 4.71 to 5.61, new21 4.14 to 5.64, new27 4.39 to 5.71, new38 3.33 to 6.32, new56 3.79 to 5.92, new62 4.61 to 5.8, new66 4.16 to 5.95. The two Big One fights with bigger parties (new9, new10) went 3.71 to 6.06 and 3.14 to 4.1.
- Checks moved with the numbers (old values in this entry): `b3-check-s3.js`, `s11`, `s12`, `s13`. The Big One's support-every-4th-action guard was widened from 7 to 9.5 rounds because that player is slower than the plain one (9.31 was measured at 1.63 times HP; at the chosen 1.45 times it is lower).
- Not done: Vibes at Rank 2 and Rank 5 were not re-measured; bosses may run shorter with Rank 5 Quirks. Browser test s13 not run in this session (data-only change, simulator and rule checks pass).

## qa-bug03 (2026-11-21): Townsfolk in the Square and the Row no longer stand on roof edges

- Chapter 1 QA report BUG-03 (build keysecrets2): people walk onto the SNAIL MAIL sign and roofs in the Square and over building edges on Rivituso Row. Fact: the roof lists were complete at the 50% rule of `tools/npc_roof_tiles.py`, but a 25 second headless run showed townsfolk standing on tiles where 30% to 50% of the feet box is painted foreground. Change: 6 such tiles added to `noGoRoof` in `town` and 8 in `row` (only tiles an NPC actually reached). Not reproduced: Boppy's feet over the railing in `grands` (a stationary scene actor, not a wanderer), left open.

## b3s13 (2026-11-20): New battle: the Nine Scoops monsters and Brain Freeze join the Battle Lab (stage 13 complete)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This last part is the bonus chapter, built from `claude/bestiary-v11.md`: Sprinkle Gremlin, Slushie Slug (Elite), Cone Head and the boss Brain Freeze in `data/b3-foes-ch11bonus.js`, with four formations (10 VP each, 30 for the boss). The foe ids match the old `MONSTERS` ids in `data/bonus-nine-scoops.js` (gremlin, slushslug, conehead, brainfreeze), so a Lab fight never crashes the old tables.
- Lab: NEW 63 to NEW 66 (Tom, Grace and Rose at level 12, the chapter 5 baseline; the Square backdrop because the bonus chapter has no creamery picture, my call).
- Brain Freeze as data: Frosted Lid goes up once below 50% HP (Guard Stance, 25% less damage, plus +15% Defense, 2 turns), then Deep Freeze (wind-up, all three Drenched and Slow). Ice-Cube Pitch winds up and Stuns one target; Temple Throb winds up and Fatigues all three. A Break cancels each wind-up.
- Two small seams: the act condition `allyHurt` (the act is usable only while another monster is below full HP) and the target `lowestOtherAlly`, both for Cone Head's Scoop Pass, which heals the lowest other monster 20% and gives it +15% Defense.
- Three new statuses (blue_ice, scoop_pass, frosted_lid). The Slushie Slug starts in Blue-Ice Glaze (25% less damage); it resists Drench.
- No picture or clip work, no voice lines added. Balance is stage 14.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, bonus section; 2154 checks, FAILS: []); the four new Lab fights each 100 simulated, all won, 0 errors; `python3 tools/b3_test.py s13` (portrait and landscape). Stage 13 is done: chapters 8, 9, 10 and the bonus are in the Battle Lab (b3s13a, b3s13b, b3s13c, b3s13).

## wanch1 (2026-11-20): chapter 1 battles are videos: the whole family idles with breathing, guards, gets hit, falls, cheers and runs on Wan 3.0, plus Rose's knock-out and Deedee's victory; the stop-loss list goes to c-wanch2

Card c-wanch1 (last part; parts a to h above). This part: Rose's knock-out retry 2 (seated 2.8% above the feet line, was 5%) and Deedee's victory retry 2 (picture shrunk to 80% inside the video: her spread hands stay in the frame) are baked and wired; their painted rows are purged. Wan-gen run 44865404539 ($3).
| Fighter | Videos in every NEW BATTLE fight | Still painted or default (stop-loss, card c-wanch2) |
|---|---|---|
| Tom | idle, guard, hit, ko, victory, run; Lounge Pass Flex, Zone One Blockade | dodge, cast |
| Grace | idle, guard, hit, ko, victory, run; Soup-Dumpling Squeeze, Crunchy Sugar-Cube Pop | dodge, cast |
| Rose | idle, guard, hit, ko, run, victory (her approved clip); The Floor Is Lava! | dodge, cast; Lamb-Tuck Ankle Tackle (a second lamb appeared), "Giddyup, Tata!" Launch (a lasso ring appeared) |
| Deedee | idle, guard, hit, victory, run; "Hand Me My Glasses" Scrub | dodge, cast, ko (floats above the ground twice); Wet-Floor Hazard (the mop dips below her feet) |
| Monsters | Grump: grumble, splash, slap and wind-up; Toad: croak, tongue and wind-up; Log: roll, jab, Timber! and wind-up; Skeeter: idle, Buzz Cloud | Toad Body Slam, Skeeter Darting Bite and Mosquito Whine |
- Spend: fal $22.95 (cap $35), xAI $1.59 (cap $3).
- Tests this part: `wanproof_test.py rose,deedee` FAILS [], `b3_test.py s8` FAILS [] (peak 15 clip pictures in NEW 6, limit 16), smoke.
- Plan notes: `claude/video-battle-plan.md` 4.8 (repo copy and Project). docs/BATTLE3.md "Painted body states" says what is still painted.
- Tom's card: t-wanch1-watch (play NEW 1 to NEW 6 once). Next Claude card: c-wanch2 (the stop-loss list on a different video model, then the full purge of the painted states).

## b3s13c (2026-11-20): New battle: the chapter 10 airport monsters and The Last Call join the Battle Lab (stage 13, part c of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This part is chapter 10, built from `claude/bestiary-v11.md`: Carry-On, Jet Lag, The Long Line, The Unclaimed, The Armrest Hog (Elite) and the boss The Last Call in `data/b3-foes-ch10.js`, with six formations (8 VP each, 26 for the boss).
- Lab: NEW 57 to NEW 62, one fight for every formation and the boss (Tom, Grace, Rose and Amy at level 25; the terminal backdrop).
- The Last Call as data: Boarding Group Nine is the wind-up of GATE CLOSED, the same Mark pattern as The Big One's Big Glare and Swamp Chomp (`then` and `after`, `hits:'marked'`). It Marks a Back-row ally and gives the monster +20% Attack for 1 turn (the bestiary says only "It gains"; I read "it" as the monster, as with the Director's Spotlight Lock), then slams the Marked ally with Skill Lock for 2 turns on the next turn. A shield (Suite Door Slide) soaks the slam and the lock; an interrupt or a Break cancels it and drops the Mark. FINAL BOARDING only below 50% HP. 1,800 HP for 4, 1,350 for 3.
- No new engine seams. Four new statuses (bin_drop, middle_seat, both_armrests, boarding_group).
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, chapter 10 section; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (The Last Call 4.6 rounds, the Armrest Hog 2.9, normal fights 1.9 to 2.9); `python3 tools/b3_test.py s13c` (portrait and landscape). The bonus chapter follows as the final b3s13.

## b3s13b (2026-11-20): New battle: the chapter 9 ballroom monsters and The Mirrorball join the Battle Lab (stage 13, part b of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This part is chapter 9, built from `claude/bestiary-v11.md`: Velvet Rope, Stuffed Shirt, The Hanger-On, The Sore Loser, The Wallflower (Elite) and the boss The Mirrorball in `data/b3-foes-ch09.js`, with six formations (9 VP each, 27 for the boss).
- Lab: NEW 51 to NEW 56, one fight for every formation and the boss (Tom, Grace, Rose and Deedee at level 22; the dome backdrop).
- The Mirrorball as data: she starts in a Facet Spin (+25% Evasion buff); Facet Dazzle and Spotlight Solo leave her Dazzled, so a Clobber hit sets off Shatter Glitz! (strips Facet Spin) and a Racket hit sets off Sensory Overload!, both already built; LAST DANCE only below 50% HP. 1,590 HP for 4, 1,190 for 3.
- No new engine seams: Members Only uses `frontAllies` and Fifty-Two Pickup uses `firstTarget` (both added in b3s13a); "Cheater!" is a Mental status with the existing `foeTaunt` flag, the same one SEE ME uses. Six new statuses (members_only, hmph, gauche, cheater, wall_hug, facet_spin).
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, chapter 9 section; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (The Wallflower 5.7 rounds, The Mirrorball 3.8, normal fights 1.2 to 2.1); `python3 tools/b3_test.py s13b` (portrait and landscape). Chapter 10 and the bonus chapter follow as b3s13c and b3s13.

## wanch1h (2026-11-20): Rose and Deedee fight in Wan videos too (idle with breathing, guard, hit, run), The Floor Is Lava!, the Glasses Scrub and Zone One Blockade are videos, Grace's knock-out sits on the ground

Card c-wanch1 (part h). Videos: wan-gen runs 44859585429 and 44859840350 (18 clips, $9). Checked against plan 4.4 before baking.
| Fighter | Now a video | Not yet |
|---|---|---|
| Rose | idle, guard, hit, run, The Floor Is Lava! (points at the floor, hops, points a warning; Tom's note "shouldnt just be her jumping") | ko floats 5% above the ground: remade with the change that fixed Grace's; Lamb-Tuck Ankle Tackle (her hand left the frame) and "Giddyup, Tata!" Launch (her hair left the top of the frame): remade with the picture shrunk to 80% inside the video (`pad`); dodge and cast not made (stop-loss on Grace) |
| Deedee | idle, guard, hit, run, "Hand Me My Glasses" Scrub (small thin reading glasses, her own eyes, a scrub brush; Tom's notes "clown glasses", "rolling pin") | ko floats 6%: remade as Rose's; victory (her spread hands left the frame) and Wet-Floor Hazard (the mop head touched the frame edge): remade with `pad`; dodge and cast not made |
| Tom | Zone One Blockade (retry 2, elbows bent: his palms stay inside the frame except the fingertips for 13 pictures) | |
| Grace | ko retry 2 ("sinks straight down ... right where she stood"): seated 1.5% of the frame above the standing feet line (was 4%) | |
- Painted rows purged: Rose keeps only dodge and ko, Deedee dodge, ko and victory (until their videos pass).
- Accepted with a known small fault: Rose's hit rocks her onto her toes for 1.5 battle px (1.4% of the frame, the plan allows 1%); the test allows 2 px in a hit.
- `wangen.py`: a job may carry `pad` (the start picture shrunk inside the 720 x 1280 frame); test W10. W9 no longer depends on which jobs the cap let through first (it was flaky).
- Engine: a guard video that is still loading shows the idle video instead of the painted standing picture (`b3cMemberFrame`).
- Fixed: index.html carried Grace's guard script tag twice (a rebase in wanch1g).
- Tests: `wanproof_test.py` (all four, W1 to W5 and P6; the painted baseline is measured with the code breath off) FAILS []; `b3_test.py s8` (peak 14 clip pictures) and `paint_state_test.py` FAILS [], portrait and landscape.

## qa-bug12c (2026-11-21): Boppy's Paso Robles cap reads the right way round when a scene turns him to face left
Chapter 1 QA BUG-12 (c) (keysecrets2): on Boppy's shocked pose and the BOPPY'S GOLD TEETH close-up the cap lettering looked garbled or mirrored.
- Checked on main (facts): the paintings are right. The Art Library mood sheet (boppy-emotions, baked to art/chars/boppyemo-story.webp and portraits/emo/boppy-*.webp) and the grin close-up (ch1-boppy-grin-v1, art/closeup/ch1-grin.webp, drawn as painted by closeupReveal) all read "Paso Robles". The fault is facing1 (2026-11-14): `scenePoseDraw` mirrors a leaning mood or talking painting so the person faces who they look at, and Boppy's surprised, scared, proud and loving poses and his tell, point and answer poses lean right, so whenever he looks left his cap writing is drawn backwards (facing1 had listed it as known). A new prompt could not fix this, so no Art Library entry was changed.
- Fix: data/pose-unflip.js (new, after data/pose-facing.js) lists a box around the lettering in each of those 8 frames; `paintedUnflip` (engine/painted.js, called by `paintedCanvas` on a mirrored frame) paints each box from the unmirrored painting at its mirrored place, only over the figure (source-atop), with the box edge faded over 5 px so no seam shows. The outline, the face and everything else stay mirrored. Boxes measured by eye on zoomed frames; a rebake of boppyemo or boppytalk that moves the figure needs them measured again.
- Found, not fixed: his unimpressed mood pose still wears the old Big Fish cap (Library entry boppy-em-unimpressed-v1); card c-boppy-bigfish. Carmen's apron and Olivia's PRESS badge are still reversed when mirrored (facing1 known list); they can get boxes the same way.
- Tests: new tools/pose_unflip_test.py (renders the 8 frames in the game: inside each box the unmirrored lettering, the outline unchanged, nothing changed outside the boxes; sheet tools/shots/pose-unflip.png), chapter 1 kitchen with Boppy surprised, scared and pointing while facing left, portrait and landscape, before and after; smoke. NOT done: a real iPhone.

## itemdef-css (2026-11-20): the item definition banner's look and words are back (itemdef1 lost them on the way in)

Card c-itemdef1. While itemdef1 was rebased onto a busy main, the conflict step kept main's `index.html` and `tools/itembanner_test.py`, so the live build had the new banner code with no styles and without `data/item-defs.js`. This puts back the banner styles, the `data/item-defs.js` script tag (after `data/item-art.js`, whose newer tag is kept) and the test. No other change.

## fix-gatelayer-pics-2 (2026-11-21): gate pictures checked by Claude: three ready for Tom, three rewritten to a method that works

Card c-fix-gatelayer-pics-2 (parts a and b above). Tom on t-gatelayer-pics: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images".
| Picture | Round 1 | Round 2 | Now |
|---|---|---|---|
| Amy's door locked | pass | | waits for Tom's approve |
| Amy's door open | pass | | waits for Tom's approve |
| Stage 7 open | narrow gap, lamp lit | pass | waits for Tom's approve |
| School gate open | still shut | still shut | leaf taken off (posts and top rail only) |
| Car Barn open | only ajar | plate floating across the gap | plate fixed to the left leaf |
| Studio gate open | arm missing | arm lowered (closed) | arm taken away (two posts only) |
- Spent $0.74 on xAI (two art-gen runs). Stopped after round 2 (stop-loss: the school gate missed twice the same way). Evidence for the new method: with the locked picture attached, every removal worked (chain, padlock, sign, the studio arm in round 1) and every swing or raise failed. The third paid try is Tom's Generate tap on the card.
- Checked in the game, portrait and landscape: Amy's locked door picture (previewed locally, not committed) sits exactly on the painted door in the new arch rectangle; the school gate stands under the SCHOOL sign between its posts. `python3 tools/gate_art_test.py` ok.
- `board_sync_test` R5 fails on main before this build too (it replays the live board, which has moved on); not changed here.

## itemdef1 (2026-11-20): every item banner reads like a JRPG item definition: picture, name and type, description, In battle, In story

Card c-itemdef1. Tom (11-20): "change every item banner in The Adventures of Tom so it reads like a JRPG item definition with four parts: item name and type, a short description of the item, its effect in battle, and its effect in story (key items, gifts, unlocks)."

- Banner (`itemBanner` in `engine/party-banner.js`, styles in `index.html`): ITEM GAINED on top, the item's picture in a square tile (painted picture, or its emoji until the painting is approved), the name with a type chip (KEY ITEM, RECOVERY ITEM, BATTLE ITEM, SIGNATURE TOOL, OUTFIT, KEEPSAKE CHARM, BIRTHDAY SASH, SOUVENIR, ODDS AND ENDS; "TNB ONLY" for gear one person can wear), the description in italics, then IN BATTLE and IN STORY rows, the source line (a monster's drop line or the auto-gear note) and "Tap or press A to continue" inside the card. Landscape puts the tile on the left.
- Several items from one source stay one banner, one page per item ("1 of 2"); tap or A turns the page ("Tap or press A for the next item"), the last page closes it. Duplicates show as "Juice Box x2" on one page.
- Data: `data/item-defs.js` (new, loads after `data/item-art.js`). `itemDef(id)` builds the four parts: name and description from the items table, type and IN BATTLE worked out from each item's own fields (the same `bonusText` and `effectText` the menus use, so they can't disagree), IN STORY from `ITEM_STORY` for the 62 key items and story gifts (coins, Bready Mercury, Boppy's jar, the Part 2 keepsakes, family gifts, chapter rewards, Aunt Ellie's prizes, everyone's own tool, Nine Scoops) and a line by kind for the rest (snack, gear, charm, souvenir, junk with its sell price). Every line was written in the game's voice (contractions, no em dashes) and checked against the scene that hands the item out.
- Built on top of qa-bug02, which shipped in parallel: its picture ring is replaced by the square tile (the item banner's prompt now sits inside the card), its dark-pill prompt stays for party banners, and its rule that hides the overworld "..." pips while a banner is up is kept (`drawLifePip` in `engine/emotions.js`).
- Tests: `tools/itemdef_test.py` (new: all 288 items have four non-empty parts; every key item and story gift has its own story line; no em dash; contractions; the banner fits on screen for all 288 items with the longest drop line, portrait and landscape; pages turn and close). `tools/itembanner_test.py` updated to the new layout (pages instead of a row of icons). Also checked by hand in the turned-phone landscape (portrait phone with the landscape toggle). `tools/board_sync_test.py` R5 fails on main before this change too (not touched here).


## qa-coh03 (2026-11-20): Boppy's fishing spot shows his folding chair, not a wooden bench

Chapter 1 QA COH-03 (build keysecrets2, `claude/ch1-qa-keysecrets2.md`), card c-qa-coh03. The Big One asks "The man in the folding chair. Will he be back?" (`data/scenes.js` ch1AfterBoss, kept: canon c-gem-canon03 and the locked chapter 1 script put the cube beside Boppy's folding chair), but the pond painting had a wooden bench with the thermos, bucket and rod on it.
- Checked on main first: line and bench both still there, no standing rule against it.
- Call made: no new Library picture. The painted folding chair already exists (`art/props/boppy/folding_chair.webp`, "already built" in `claude/story-build.md`), and a new generated chair would still have needed the bench painted out of the plate. The bench is removed and the chair set down by script, so nothing is generated and nothing costs credit.
- `tools/hollow_chair.py` (called from `tools/make_hollow_fg.py`; the raw painting and masks are never edited): the bench, its shadow and the fishing line are removed (water above the shoreline is the water just above it mirrored, the ground below is the clear dirt to the left mirrored and tiled, shore edge feathered; FSR and Telea inpainting smeared and were not used). The thermos, bucket and rod are cut from the ORIGINAL painting with GrabCut so they keep the plate's brushwork, then set down again: thermos on the seat (the same thermos-on-the-chair motif as the gym in chapter 19), bucket on the ground to its left, rod flipped to lean on the chair back. The chair is the approved prop, lightened and warmed to the plate's light, with a soft contact shadow. The props mask loses the bench and gains these, so `art/hollow-fg.webp` and the depth zones follow.
- Files: `art/hollow.webp`, `art/hollow-fg.webp`, `art/hollow-trail1..3.webp` (rebaked by `bake_hollow_trail.py` from the new plate, with the trail's three stages of fix-hollowtrail-play-2; wrappers unchanged) and `data/hollow-trail.js`, the zones line `PLATE_BEHIND.hollow` in `engine/plate.js` (one zone now covers chair, thermos, bucket and rod, base at the chair's feet), the spot's text in `data/maps-le.js` (now "A folding chair with a thermos on the seat, a bucket, one bass...", not voiced). Before the change, an unchanged `make_hollow_fg.py` run reproduced the repo files pixel for pixel.
- To redo: `python3 tools/make_hollow_fg.py`, paste `tools/shots/hollow-zones.js` over the `PLATE_BEHIND.hollow=` line in `engine/plate.js`, `python3 tools/sprite-bake/bake_hollow_trail.py`, bump tags.
- Tests: new `tools/hollow_chair_test.py` (reproduces from the script, changes only the spot, bench gone, chair, thermos and bucket there, foreground layer and one depth zone, trail paintings match, line and text name the chair), `hollow_trail_test.py`, `smoke.py`. Looked at in the game in portrait and landscape (base plate and the last trail stage), `tools/shots/chair-*.png`.
- Limit: the chair is a battle prop with a slightly darker outline than the soft plate; it sits right, but if it looks pasted on at phone size, the fix is a Library picture of the chair painted from the plate's look (a new card).

## fix-itembannerart-pics-2 (2026-11-20): 285 item pictures are in the game; 3 that missed twice are made alone; the cutter no longer drops cells or leaves crimson shadows

Card c-fix-itembannerart-pics-2. Tom on t-itembannerart-pics: "some failed. make sure you only regenerate those than failed and approve those where nothing failed".
- Only the failed cells were made again: the 2 redo sheets (18 items), board commit `board: generate t-itembannerart-pics`, run 44861903466, $0.12. The 18 first sheets were not made again.
- Approved on his word, cells that failed left out: the 18 first sheets and the 2 redo sheets (`data/art-prompts.json`, files `art/raw/props/prop-item-*-v1.png`). A cell named `-` in an entry's `bake` is skipped, so only pictures where nothing failed are installed: 270 from the first sheets and 15 from the redo sheets, so 285 of 288 items show their own picture; the other 3 keep their emoji until their single pictures are approved.
- Redo sheet check, cell by cell: redo 1 cell 7 (Pro Racing Flats) came back as football cleats with a swoosh again; redo 2 cell 2 (Tiny Clay Taco) a real taco again, cell 9 (Birthday Sash) a bow with no sash. Stop-loss (two misses the same way): the notes are not reworded a third time; the method changes. Each is one object alone in its own picture, `prop-item-solo-amy_chm1`, `-claytaco`, `-g_bsash` (same note, `--grid=1`; `SOLO` in `tools/art-library/itemart-prompts.js`), and the redo sheets skip those cells. The hard hat keeps its scribble (the item is the hat with initials).
- Bug found while approving: `tools/sprite-bake/bake_item_sheet.py` stopped on 12 of the 18 first sheets ("nothing drawn in cell ..."), so approving them in the Art Library would have installed nothing. Cause: two objects in neighbouring cells painted closer than the merge distance became one blob and were given to one cell. Fix: a merged blob whose drawn pieces sit in different cells is split back into those pieces. Second fix: the generator paints a soft drop shadow in a darker shade of the magenta that the key could not reach, so each picture had a crimson smear under it; a pixel that is a darker shade of the key colour and joins the background is now cleared (nothing inside an object is touched).
- Tests: `python3 tools/itemart_test.py` (two new checks, both fail on the old cutter), `itembanner_test.py`.
- Pencil reports: none filed since 03:14 about item pictures (the two open ones are chapter 1 scene notes, left open).


## b3s13a (2026-11-20): New battle: the chapter 8 car barn monsters and Old Ironbelly join the Battle Lab (stage 13, part a of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts so a stalled session loses at most one chapter. This part is chapter 8, built from `claude/bestiary-v11.md`: Lukewarm, Leftover, Wet Blanket, The Draft, The Picky Eater (Elite) and the boss Old Ironbelly in `data/b3-foes-ch08.js`, with six formations (9 VP each, 27 for the boss).
- Lab: NEW 45 to NEW 50, one fight for every formation and the boss (Tom, TNB and Nara at level 19; the car barn backdrop, the boiler room for the boss).
- Old Ironbelly as data: BROIL (announced one turn ahead, then Toasty on all three and on itself) and Full Furnace (below 50% HP, same, plus the buff status `full_furnace`, +20% Attack). Its Sizzle acts (Hot Coal, BROIL) fire TNB's stone clay shields into Fired Glaze, which was already built; a Drench hit on the Toasty boss sets off Steam Cloud!. 1,040 HP for 3, 1,390 for 4.
- Two small seams: the strip kind `shieldOrBuff` (Pilot-Light Gust takes the target's biggest shield, or one buff when there is no shield) and the targets `frontAllies` and `firstTarget` in `b3Who` (first used in chapter 9). Five new statuses (crosswind, tin_lid, why_bother, it_touched, full_furnace) in `data/b3-status.js`.
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, new; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (Old Ironbelly 5.1 rounds, The Picky Eater 5.3, normal fights 1.9 to 2.4); `python3 tools/b3_test.py s13a` (portrait and landscape; frames `tools/shots/b3-s13*.png`). Chapters 9, 10 and the bonus chapter follow as b3s13b, b3s13c and b3s13.
## fix-gatelayer-pics-2b (2026-11-21): gate pictures round 2: two doors pass, four open states rejected with details and reworded

Card c-fix-gatelayer-pics-2, part b. Tom: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images". Claude ran the six (art-gen, $0.44) and looked at each against its reference.
- Pass, waiting for Tom: Amy's door locked (same arch and door, shoe doodle note, no words) and open (same door swung open on a lit hallway).
- Rejected with details: school gate open (still shut across the lane), Car Barn open (only ajar), studio arm raised (arm missing), Stage 7 open (narrow gap, lamp lit).
- One change each in `gate-prompts.js`: each open state now says how far it opens and where the moved part hangs. The Stage 7 lamp-off ask missed twice the same way, so it is dropped (stop-loss): the lamp stays as in the locked picture.

## qa-coh05 (2026-11-20): Grump Hollow gets its own woodland battle backdrop in the Art Library; fights there switch to it once Tom approves the picture

Card c-qa-coh05 (chapter 1 QA report on keysecrets2, COH-05: Skeeter Swarm and Log Lump fights in Grump Hollow showed the town pond with a church steeple). Checked on main first: `battleBgKey` in `engine/battle-draw.js` still fell back to `pond` for map `hollow`.
- New Art Library entry `bg-29-grump-hollow` (Battle tab, New backgrounds; `tools/art-library/battle-prompts.js`, spliced into `data/art-prompts.json`). Written from the approved `01-pond-town` prompt with only the scene and floor changed: the same pond band and framing oaks, now deep woods (mossy boulders, ferns, lily pads, a mossy log, twisted oaks, no buildings, church, houses or dock) and a damp brown earth floor. The shared rules block is unchanged.
- Its `bake` runs the new `tools/sprite-bake/bake_battle_bg.py 29-grump-hollow` (approved picture to `bgs/29-grump-hollow.webp`, 1152 x 648, cropped to 16:9 from the middle if needed); art_bake then moves BG_V. The other 29 backdrops keep no bake.
- `BG_FILES.hollow` and a rule in `battleBgKey`: map `hollow` uses `hollow` when that picture has loaded, otherwise the pond (so nothing changes until the approval). The missing file is a 404 the service worker never stores.
- Tested with a stand-in picture (a crop of the Grump Hollow map painting, deleted, not pushed): `bg_test.py` saw `hollow` loaded at 1152 x 648, and a Skeeter Swarm and Log Lump fight showed it in portrait and landscape; without it the key stays `pond`. An `art_bake.py --dry` run on an approved copy routes the picture to the new script.
- Not done: the builder `node tools/art-library/make-prompts.js` fails on main in `npc-prompts.js` (an undefined colour), which is why the entry was spliced; not fixed here. Other Long Island maps with no rule (the Square, the marsh, the pier) still use the pond picture; not in this card.
- Board: hands to Tom card t-qa-coh05-pic (generate and approve the picture).
- Tests: `tools/bg_test.py` (expects `hollow` once the picture exists, plus a check of the bake script on 16:9, square and tall pictures), `tools/smoke.py`.


## voiceboard1 (2026-11-21): Generate all N voices on the board: one tap makes the voices and puts them in the game

Tom: "make a kanban card that will autgenerate and save to github the voices". A Tom card with ask voice and `voices` or `voice_chapter` now has Generate all N voices (board.html: `voicesHtml`, `vgenTap`; about 0.44 credits per character, second tap confirms). The tap commits `board: vgen <card id>`; the `voice-gen` Action runs `tools/voice-learn/voiceboard.py`: it makes a checked take for each line of the card that has no clip (`voicegen.py` gained `--lines-file` and `--chapter`), keeps them on branch `generated`, merges them into `data/voice/dialog-ch*.js` with `merge-local.js`, rebuilds the Voice Library list, runs `unused_voice.py`, writes a CHANGES entry `voices-<card>-<run>`, bumps tags and pushes to main, then writes `vgen.run` on the card and rewrites its next step to "listen in the Voice Library". Needs-human lines are listed on the card and not merged. `voice-gen.yml` also gained manual inputs `card`, `chapter`, `max_chars` (dry_run still defaults to true). First card: `t-ch2voices` (chapter 2, 90 lines with no clip), waiting on `t-ch2play`. No ElevenLabs credits were spent; tested with the stand-in server (`python3 tools/voiceboard_test.py`: 59 checks). Not covered: the retry against a main that moved. Facts: `claude/next-addendum-voiceboard1.md`.


## fix-gatelayer-pics-2a (2026-11-21): gate pictures: detailed rejects, Amy's door matched to the painted arch, door crop fixed

Card c-fix-gatelayer-pics-2, part a. Tom on card t-gatelayer-pics: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images".
- The six rejected pictures now carry what was wrong with each, not only "All failed" (`data/art-prompts.json` rejects).
- Amy's door: the reference crop (`art/raw/props/gate-row-amyhouse-door-ref.png`) and the game rectangle (`GATE_ART['row-amyhouse']`, now `[5.94,4.45,1.78,2.14]`) are exactly the stone arch; both had taken in the shoe shelf and window. Both door prompts ask for the arch and door only, 3:4, with a margin (the bake trims; "edge to edge" fought the margin rule).
- Stage 7 open: the lamp is "switched off: dark red glass, no glow" (it came back lit).
- Found on main: build qa-bug01 had pushed unresolved conflict markers into `engine/main.js` and `index.html` (the game stopped at load, `BUILD_HISTORY` declared twice); fix-hollowtrail-play-2 cleared them first, this build keeps its version.

## fix-hollowtrail-play-2 (2026-11-21): Grump Hollow wrapper trail is now three legs of four wrappers: Mudling to the top left Toad, Toad to the Log, Log to the fishing spot

Tom (t-hollowtrail-play): "youre not understanding - you created several images where the wrappers are scattered haphazardly across the area... after defeating the mudling, there should be 4 wrappers that lead to the top left corner... after defeating that monster, there should 4 more wrappers that lead to the center of the aera, where the party must defeat the log... after defeating the log, there should be 4 more wrappers that lead to the big one activiation spot / after each monster is defeated... Grace should say 3 wrappers, let's follow them! / only 3 monster should trigger this: the mudling, the toad looking thing in the top left and the log that sits in the middle".
- Facts: 12 wrappers (`WRAPPERS` in `tools/sprite-bake/bake_hollow_trail.py`), 3 paintings, each shows only its own leg of four in a line from one monster to the next. `art/hollow-trail4.webp` is gone (purged). Only the Toad and the Log set a `ch1-beat:` flag; the Skeeter Swarm and Pond Grump no longer do. `ch1-spot` shows the leg 3 painting.
- Grace's line "3 wrappers, let's follow them!" replaces the old "Nine wrappers. There were twelve..." and Deedee's reply in `ch1Mudling`, and plays after the Toad and the Log (`ch1FolToad`, `ch1FolLog`). These lines need a recording.
- Test: `python3 tools/hollow_trail_test.py` passed (bake, game, portrait and landscape shots in tools/shots).

## board-qa2 (2026-11-20): board only: 19 cards from the second chapter 1 QA report, 5 items not added

## qa-coh07 (2026-11-21): the twelve-cup muffin pan sits on Deedee's island from the moment Tom walks in
Chapter 1 QA COH-07 (keysecrets2): walking into Deedee and Boppy's House showed a bare island until the theft scene started. Cause: the pan was only a scene prop, created when the scene began, and the painting is always drawn bare (fix-cutpolish4b). `scenePropsDraw` (`engine/scene-props.js`) now draws the same pan at the same spot on map `grands` in chapter 1 until flag `ch1-theft` is set; from there the scene's own pan prop takes over and the Mudling still takes it.

## wanch1g (2026-11-20): three leftover script tags of the removed monster clips taken out of index.html

Card c-wanch1 (part g). wanch1f removed `data/clips/toad-slam.js`, `skeeter-bite.js` and `skeeter-whine.js`, but a rebase kept their script tags (the art-bake job had retagged them), so the page asked for three missing files. Tags removed; `grep` for the three ids is 0 outside the Art Library entries.

## fix-ch1flight (2026-11-21): chapter 1's cab scene goes straight from TNB's text to the flight, with the phone picture up while TNB's text is read

Card c-fix-ch1flight (Tom's Something is wrong note on t-ch1flight, and pencil report r-20261120-192121-ynen).
- Tom: "didn't work, after TNB's text there was dialog between Tom and the girl's and Deedee. it should go straight to the airplane animation from the cab animation with TNB's text." Cause: the cab scene chained into the full airport run (`tripSteps`), which plays Sal's line, the girls' goodbye with Tom, and Deedee's goodbye. Fix: `{trip:'west',quiet:true}` (`tripSteps(dir,quiet)` in `engine/travel.js`) sends the girls and recruits home silently and plays only the chapter start and the flight.
- Report ynen, Tom: "when TNB is speaking the phone image should still be displayed". `{ch1Reveal:'phone',keep:true}` keeps the picture up under TNB's dialog (`closeup.keep`, `engine/closeup.js`, `engine/overworld.js`, `engine/main.js`); `{ch1RevealEnd:true}` closes it after the text.
- Kept: Sal's "Los Angeles? You got it.", the fade, the chapter 1 card, the flight lines. Changed: only the goodbyes and the picture timing.
- Checked in the browser (portrait): Sal, phone with TNB's text, chapter card, flight lines, Los Angeles, no girls or Deedee dialogue. Python smoke could not run here (no playwright for python).

## wanch1f (2026-11-20): the Pond Grump, Bog Toad, Log Lump and Skeeter Swarm attack and wind up in videos in NEW 2 to NEW 6

Card c-wanch1 (part f). Monster clips on xAI Grok lite (clip-gen runs 44853328032 and 44854697368, $1.59 in all), each looked at picture by picture before wiring.
| Monster | Now a video (data/b3-foes-ch01.js) | Left out |
|---|---|---|
| Pond Grump | Puddle Grumble, Bog Splash, Soggy Slap with its wind-up held while it charges | |
| Bog Toad | Night Croak (retry 2: the throat swells like a balloon), Tongue Lash with its wind-up | Body Slam: leapt out of the frame and lost its lily pad twice (stop-loss) |
| Log Lump | Low Roll, Branch Jab, Timber! with its wind-up | |
| Skeeter Swarm | its first idle (B3_BODY_CLIPS.skeeter), Buzz Cloud | Darting Bite and Mosquito Whine: the small mosquitoes vanished halfway twice (stop-loss) |
- The three stop-loss entries are set back to rejected in the Art Library with the reason; their baked files and script tags are removed (`data/clips/toad-slam.js`, `skeeter-bite.js`, `skeeter-whine.js` and their pictures). Those three acts keep the default animation.
- Checked by playing NEW 2 to NEW 5 at 2x (a test script): every wired act and wind-up played from its clip, no page errors, at most 12 clip pictures held at once.

## qa-bug01 (2026-11-21): quest log no longer says "Go to it's Sunday" after the trip home

Card c-qa-bug01 (BUG-01 of the chapter 1 QA report). `questPhrase` (`engine/story.js`) now treats a plain statement case-insensitively, so "it's Sunday..." is left as written and capitalized. "picked" also counts as a statement, which fixes the same slip in the Grump Hollow wrapper goals. All Goal toasts in `data/scenes.js` were run through it. Browser tests were not run in this session (the Playwright browser did not match).

## qa-txt04 (2026-11-21): the Inspect prompt keeps a name's capital letters (Boppy's fishing spot)

- Chapter 1 QA report TXT-04 (claude/ch1-qa-keysecrets2.md): near the pond the prompt read "A · Inspect boppy's fishing spot" while the opened box said "Boppy's fishing spot". `engine/draw.js` lowercased the whole name. It now lowercases only a leading The, A or An, so proper names keep their capital. Nothing else changed.

## qa-coh02 (2026-11-21): The Big One's win line no longer has it splash away before its talk
Chapter 1 QA COH-02 (keysecrets2). `data/monsters.js` The Big One `die` line (the VICTORY card, old battle) now reads "It stops thrashing and blinks up at the shore." so it is still at the surface for the after-boss scene. Not a spoken line (no clip, voice audit unaffected).

## qa-bug02 (2026-11-21): item banners: the picture fills its circle, the prompt sits on a dark pill below the card, speech pips hide while a banner is up

- BUG-02 of the chapter 1 QA report (keysecrets2). Fact: the painted pictures arrived in itembannerart1; this build is the layout. `index.html` `.pb-pic` fills the ring (one item full size, several 46% each); `.pb-hint` has a dark pill so it reads on any map; `drawLifePip` (`engine/emotions.js`) draws nothing while `partyBannerHeld()`.

## qa-bug12 (2026-11-21): tapping the Menu or Save button cancels a pending tap-walk, so it can no longer inspect the Cookie counter instead

Card c-qa-bug12 (BUG-12 a, chapter 1 QA report on build keysecrets2).
- Cause (from the code): a tap-walk toward the counter ends with an automatic A press on arrival. A tap on the Menu button did not cancel that walk, so the press landed on the counter, opened its dialogue and the Menu was refused (`!dialog.active`).
- Fix: `hudTapStopsWorld` in `engine/draw.js` drops the pending tap-walk and any queued A press on every Menu and Save button tap.
- Not done: BUG-12 (b), Boppy going blocky as a talk starts, was not reproduced and has no cause yet; BUG-12 (c), the cap lettering, is card c-qa-bug12c.
## qa-bug08 (2026-11-21): no HOLD + SLIDE, ! Menu or Save over a cutscene or the CHAPTER COMPLETE card
Chapter 1 QA BUG-08 (keysecrets2). Cause: the cutscene class hid the arrows and the A button but not the HOLD + SLIDE caption or the top-left buttons, so the caption showed between lines and the buttons stayed tappable (opening ! let monsters roam). Fix: one CSS rule in `index.html` hides `#hud-btns`, `.pad-caption` and `.pad-center` while `html.cutscene` is set (the class already covers the chapter cards).

