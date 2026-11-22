## fix-wanstop-gen (2026-11-21): the Generate videos button comes back after a stopped video is fixed, and the card says why nothing was made

Card c-fix-wanstop-gen, from Tom on t-wanstop-gen: "the button says nothing to make right now. but there is no video made". Fact: the run (44971778287) did make both videos and spent $1.58, but both failed their checks and were stopped, so nothing went into the game. The card then said "Every video of this card is made" and "Nothing to make right now", which read as if nothing had run. Second fault found while reproducing: the page counted a stopped job as finished by its name alone, so even after a fix session raised the job's rev the button would have stayed off.

| Change | Where |
|---|---|
| A stopped (or merged, passed, already) job counts as finished only at the rev it was made at; a raised rev lists it again. The rev comes from `run.revs`, else from the stop card id `c-wanstop-<job>-r<rev>` | `board.html` `wanRunRev`, `wanDone`, `wanLeft` |
| With nothing left and stopped jobs still at their rev: "No video passed the checks yet. Stopped by the checks and being fixed by Claude: <job> (card <id>)" and the button "Waiting for Claude to fix the stopped videos. This button comes back then." | `board.html` `wanStoppedOpen`, `wanHtml` |
| The run writes each job's rev (`wgen.run.revs`) | `tools/art-library/wanbulk.py` |
| New checks: stopped at the current rev waits; a raised rev (Tom's card exactly) shows Generate all 2 videos (about $1.57); `run.revs` below the job's rev lists the job again | `tools/board_wan_test.py` |

- Pencil reports filed since 2026-11-22T01:45:21Z: none about this (the 8 open ones are chapter 2 story notes, left open).
- Tests: `board_wan_test.py` (portrait and landscape, FAILS: []), `wanbulk_test.py`, `wangen_test.py` pass. `guidegen/build_map_test.py` fails "Lounge Pass Flex ..." on unchanged main too (tom-loungepass, not touched here).

## wanstop-rose-giddyup-r7 (2026-11-21): Rose's Giddyup asks for an upright cannonball, because the last one flipped upside down

Card c-wanstop-rose-giddyup-r7. The bulk run 44971778287 stopped r7 on bg and edge (look checks not run). By eye the hand circle is right now, but the cannonball became a backward somersault: upside down at video frame 54, arm flung out to the left on landing. Both misses are that flip: the background spread over the limit is in frame 54 only (23.8, every other frame under 15), and the left edge touches are frames 58 and 59. One change, rev 8: prompt `wan-rose-giddyup-v5.txt` = v4 with "a tight cannonball" changed to "a tight upright cannonball". Kept: every other word, Kling 4.0, the start picture, 720x1280, 5 s, pad 0.65, airborne, bake and wire.

## wanstop-deedee-wetfloor-r6 (2026-11-21): Deedee's Wet-Floor drops the line that kept the mop on the floor the whole time

Card c-wanstop-deedee-wetfloor-r6. The bulk run 44971778287 stopped r6 on the look checks p1 and p2; every measurement passed (the short sweep cleared both edges). By eye she still strokes back and forth 2 or 3 times (video frames 36 to 90), and the mop shows up at her side rather than from behind her back. One change, rev 7: prompt `wan-deedee-wetfloor-v4.txt` = v3 with ", the mop head staying on top of the floor the whole time" deleted. That clause asks for a long stretch of floor contact, which the repeated strokes fill; it was only there to keep the mop above her feet, which Tom said is fine and the feet limit 0.10 allows. "Behind her back" is kept: the mop has to leave the picture for the last picture to match the first, and her baked Windex and scrub use the same words. Kept: every other word, Kling 4.0, the start picture, 720x1280, 5 s, pad 0.65, feet limit 0.10, bake and wire.

## fix-dash3-try (2026-11-22): the dashboard's Duo folded, upright size stays upright

Tom, on t-dash3-try: "duo folded upright is the wrong orientation". Cause: a folded Duo is not a tablet, so the game follows the landscape choice saved by its own rotate button (`le-layout`, shared by every game tab in the browser) and sat sideways inside the upright 466 x 657 frame. Fix: at the four Duo sizes `forceDuo` in `dashboard.html` sets the game frame's `layout.mode` to auto (frame only, nothing saved), so the layout follows how the pane is held. `tools/dashboard_test.py` now saves a landscape choice, switches sizes and checks the folded upright frame is not rotated. Reproduced and checked in the browser at 466 x 657 before and after.
## reports-2026-11-21 (2026-11-22): chapter 2 opening zoomed in and purple from the landing, the loft talk rewritten, Carmen gets a Tom reaction, two scene spots moved

Seven of the eight reports (all on build wanch5). The eighth stays open (see below).

| Report and Tom's note | Fix |
|---|---|
| r-20261121-172826-9r47: "should be zoomed in on Tom - this should be the case at the beginning of every chapter" | `arriveLA` (`engine/travel.js`) pushes the camera in on Tom (zoom 2) from the landing line and, like the Long Island arrival, hands the zoom to `SCENES.ch2Arrive`, which zooms out after its line. Chapters that arrive by the Long Island route already did this (ch3, ch7, ch9 arrival scenes). Chapters 4 to 6, 8 and 10 have no arrival scene and are not changed. |
| r-20261121-172850-q5km: "it should be purple as soon as the chapter begins ... after this comment he should immediately note the purple sky since TNB had texted him about it" | Downtown (`blvd`) is under the haze from the landing, not after the goal flag (`STORY_MAPFX`, `data/scenes.js`). New Tom line in `ch2Arrive`: "And there's the purple. TNB texted about it in the cab. It looks even better than it sounded." |
| r-20261121-173524-egdf: "the entire intro dialogue between Tom and TNB is not funny. Tom is rude and condescending ... are you using the humor engine?" | The loft scene (`SCENES.ch2Loft`) now uses the three-things list (mud ball, muffins, fish the size of a cab) from the approved sample `claude/story-ch02-sample-loft.md` (docs/humor-brief.md voice notes): Tom is warm and flustered instead of "go first, I can wait", TNB's deadpan answers carry the jokes. Spoken lines changed: they need a new voice bake. No humor engine tool exists in this repo; the lines were written to docs/humor-brief.md. |
| r-20261121-174051-vxq1: "Tom should have some sort of funny reaction to this" (Doña Carmen, "The pupusas are fine") | New NPC field `tomReply` (also as a `when` variant): Tom speaks after the NPC's lines (`engine/overworld.js`). Used on Carmen in the smog (`data/maps-la.js`). |
| r-20261121-174119-0522: "party is standing in a weird spot - NPC not relevant to cut scenes must move out of the way" | `ch2Odette` places Tom, TNB and Nara on the street (13 to 14, 8 to 9) before the scene. |
| r-20261121-174358-pwub: "the scene should happen further up, so they are not covered by the sign" | `ch2Flurry` first walks the party up to the clearing (12,13) when Tom is south of row 14. |
| r-20261121-173717-wjou: "the sky suddenly turns purple after talking to Nara, is this correct?" | Answer: yes by the script (Nara growls, smog rolls down 2nd Ave in `ch2Smog`). Downtown is now purple from the start, so only Jefferson Park turns at that moment. |
| r-20261121-173628-97ha: "need a cut out for this so tom and party dont overlap it" | Left open: no pin and nothing in the picture overlaps. Needs Tom to say which object. |

Not checked on a phone. Smoke ran: the remaining failures (board_sync_test, night manifest, heights) were failing before this build.

## board-menuux2 (2026-11-22): the menu proposal's skill rows name the flavor in words, like the approved battle screen

Card c-menuux-plan. The battle screen proposal Tom approved on 11-21 has the rule "every icon has its word"; the menu drawings showed a flavor as a coloured dot alone. Every skill row now reads "Racket basic", "Clobber skill" (drawings Vibes, Duo and phone; `claude/menuux-mock/gen/kit.py`), and `claude/menuux-plan.md` section 4 says how the dark battle panels and the paper menu sit together and which flavor symbols are the one set. Nothing in the game changed.

## menuux-plan (2026-11-22): a proposal for a new main menu, with drawings; nothing in the game changed

Card c-menuux-plan. Tom (11-21 17:28): "The main menu needs a complete overhaul - i originally wanted it like odl school JRPG style but im now finding it dated and hard to read. and im not sure its optimized for the new battle system." The proposal is `claude/menuux-plan.md`: what is wrong today (8 findings from screenshots of every screen), what the best menus do (Persona 3 Reload, Metaphor, Clair Obscur, Bayonetta Origins and others, with sources), the direction "Golden Hour" (the paused world goes to dusk, a paper sketchbook opens, the family stands in a line-up at real heights, five tabs instead of nine commands, Vibes as a first-class screen with every skill described), how it fits the new battle system, and a four-card build plan. Drawings: 13 artboards on a Design canvas and the same screens as pictures in `claude/menuux-mock/shots/`; their generator is `claude/menuux-mock/gen/`. The hero paintings are shown without cutouts (paper divided to white, drawn with the multiply blend). Tom decides on card t-menuux-decide; card c-menuux-cards then creates the build cards. Nothing in the game changed.

## board-battleux (2026-11-21): the battle screen redesign is approved; its three build cards and your play card are on the board

Tom approved the battle screen redesign as shown (card t-battleux-decide). No change to the plan or the mock. Nothing in the game changed.

| Card | Build | Model, effort | Waits on |
|---|---|---|---|
| Build the new battle screen (c-battleux1) | battleux1 | Sonnet 5.5, high (row C) | nothing |
| Write the one-line move descriptions (c-battleux2) | battleux2 | Opus 5.5, medium (row D) | c-battleux1 |
| Add the scene marks and remove the proposal page (c-battleux3) | battleux3 | Sonnet 5.5, medium (row B) | c-battleux2 |
| Play the new battle screen on the Duo and iPhone (t-battleuxplay) | | Tom, play, on the phone | c-battleux3 |

- The cards run in order because battleux2 writes words into tables battleux1 builds, and battleux3 hooks into both. `claude/battleux-plan.md` status is now APPROVED.

## takes-2026-11-21 (2026-11-22): 3 of Tom's new voice takes are in the game (Tom's Hello Rose, Deedee's Three, Tom's I do have news)

Merged from branch `takes` with `merge-local.js` (the kept takes of sessions 20261122T014818-vsj and 20261122T015428-cdp; 20261121T015156-llm held no kept take). All three replaced a clip the line already had (dialog-ch1.js 2, dialog-ch2.js 1), so no new line and no unused voice; the kept scripts went into the ch01 and ch02 story-directions files. NOT merged, left on the branch for Tom: Grace's "Nine wrappers. There were twelve..." (that line is no longer in any scene, so a clip would be unused voice) and Tom's "A FISH was wearing my mom's muffin pan" (the take says "A massive FISH ... as a crown", which differs from the screen line; rewording a scene line is Tom's call). `unused_voice.py` could not run here (no Python playwright); the voice index rebuilds by the voice-index Action.

## voicefast1 (2026-11-21): Voice Library takes arrive in about 30 seconds again, and a crashed job now says so

Tom: takes took over 2 minutes. Cause: `tools/art-library/artgen.py` now imports `falq.py` (the WAN fallback) and `tools/costlog.py` (costs2), but the `voice-take` and `music-gen` Actions check out only `artgen.py`, so both crashed with ModuleNotFoundError about 10 seconds after the request (runs 44971818231 and 44971930950), wrote no report, and the page waited with no answer. The key stays on GitHub; no page holds it.

| Change | Where |
|---|---|
| Sparse checkout now holds all of `tools/art-library/` and `tools/costlog.py` | `.github/workflows/voice-take.yml`, `music-gen.yml` |
| A fresh request is checked every 4 s for 4 minutes, then every 20 s (was 20 s) | `engine/voice-take.js` |
| A run that failed before writing its report is shown on the line within about 15 s, with the run link (was 8 hours) | `engine/voice-take.js` `crashedRun` |
| New test: each job's script starts from only its sparse files (fails on the old lists) | `tools/voice-library/sparse_files_test.py` |

- A working take is about 20 s in the Action plus up to 4 s of polling. It cannot be instant while GitHub makes it; a hosted proxy that holds the key would be, and needs an account of Tom's.
- Tests: `sparse_files_test.py`, `keysecrets3_test.py` pass. `voicetake_test.py` fails "two doubled takes then a clean one" on unmodified main too (not caused here).

## battleux-plan (2026-11-21): a proposal for a new battle screen, with a mock you can tap (nothing in the game changed)

Card c-battleux-plan. Tom (11-21 16:59): "i think we need a total overhaul of the UX, especially for the lower half with actions ... id like to see a proposal before moving forward." And 17:01: it must also work on a desktop browser, the Duo folded and a standard iPhone.

| What | Where |
|---|---|
| The proposal page and the mock | `battle-ux.html` (ADMIN > Battle system > Battle screen redesign (proposal)); pictures in `battle-ux/`. Under 1000 px wide or 700 px tall it opens as the mock itself. |
| The plan the build cards will read | `claude/battleux-plan.md` |
| Mock source and drawings of the six screen sizes | `claude/battleux-mock/` |

The design in one line: one flat list of moves, the first tap shows what a move does and what it will do to the target, the second tap does it; the words sit in a wide strip under the scene; DETAILS adds one line to every move. No game file changed except `admin.html` (one new button). Checked: the mock's taps, aim, use, Details, Ruckus and keys by script at the Duo size and on a desktop (FAILS: []), and a picture of each of the six sizes looked at. When the new screen ships, `battle-ux.html`, `battle-ux/` and the button are removed.

## wanstop-deedee-wetfloor-r5 (2026-11-21): Deedee's Wet-Floor asks for one short sweep instead of one wide sweep

Card c-wanstop-deedee-wetfloor-r5. The bulk run 44967949648 stopped r5 (edge, p1, p2). By eye she sweeps left, right, left, right, left (video frames 32 to 91) and the mop head reaches the left or right edge at each stroke end; the 23 edge frames are exactly those. One change, rev 6: prompt `wan-deedee-wetfloor-v3.txt` = v2 with "one wide sweep" changed to "one short sweep". Kept: everything else (Kling 4.0, start picture, 5 s, pad 0.65, feet limit 0.10, bake, wire). No video made in the session; Tom taps Generate on t-wanstop-gen. Plan: claude/video-battle-plan.md 4.14.

## wanstop-rose-giddyup-r6 (2026-11-21): Rose's Giddyup asks her to circle her hand instead of twirl

Card c-wanstop-rose-giddyup-r6. The bulk run 44967949648 stopped r6 on the look checks only (p1, p2; every measurement passed). By eye the jump is right (one, straight up, knees tucked, clean return), but "twirls one hand above her head" became a full body spin: her back is to the camera at video frames 32 to 42. One change, rev 7: prompt `wan-rose-giddyup-v4.txt` = v3 with "twirls one hand" changed to "circles one hand". Kept: everything else (Kling 4.0, start picture, 5 s, pad 0.65, airborne, bake, wire). data/guide-anims.json rebuilt for both jobs. New Tom card t-wanstop-gen holds both jobs (t-wanch5-gen is Done, so its button no longer shows). No video made in the session. Plan: claude/video-battle-plan.md 4.14.

## reports-2026-11-22b (2026-11-22): Boppy's fishing spot in chapter 1 (grey grass, orange block, bulb) now shows only after the Log is beaten

Report r-20261121-172017-kfe3 (change, build wanch5, Grump Hollow): "the block/bulb/gray grass shouldnt show up until after the log is defeated." While the family follows the wrappers (`ch1-trail`) the painted spot and its solid tile are hidden; they appear when scene `ch1Spot` plays (flag `ch1-spot`, which fires after the Log). `hollowSpotHidden` in `engine/plate.js` is read by `drawHollowSpot` and by the amber spot in `engine/amber-spots.js`. Later chapters, saves past the scene and non-story modes are unchanged. Test: `tools/hollow_spot_test.py` (passes). The full smoke run could not start here (no default browser), not run.

## reports-2026-11-22 (2026-11-22): in the chapter 1 mud scene Grace now jumps in first with "Tata, look! There's the mud blob holding the muffins!"

Report r-20261121-165412-a75h (dialogue, build wanch5, scene ch1Mudling): "before this, we need a line where Grace jumps up and says \"Tata, look! There's the mud blob holding the muffins!\"" The line is a new first step of `SCENES.ch1Mudling` (before Rose's "Hello, mud!"). Nothing else changed. It has no recording yet, so it shows under No clip yet in the Voice Library (the list rebuilds itself). `data/script-index.json` rebuilt, the two `ch1Mudling` rows of `docs/script-convos.tsv` moved one step down. `unused_voice.py` reports 0 for all four checks.

## wanch5 (2026-11-21): Rose's Giddyup and Deedee's Wet-Floor are ready for one Generate tap

Card c-wanch5. No video was made and nothing was spent in this session; the first paid bulk run is Tom's tap on t-wanch5-gen (cap $2 above the ledger of $53.815).

| Job | One change | Bake (copied from) | Wire |
|---|---|---|---|
| rose-giddyup rev 6 (Kling 4.0) | Prompt v3 = v2 with "leaps up and forward to the left once" changed to "leaps straight up once" (r5 tumbled forward into the left edge). Pad stays 0.65, `airborne` stays true | strike, fps 24, step 2, 1.5x, fig_rows 83, from rose-tackle (her other Kling strike at pad 0.65; data/clips/rose-giddyup.js does not exist yet) | giddyup_tata_launch in data/b3-kit-rose.js, shape strike |
| deedee-wetfloor rev 5 (Kling 4.0) | Pad 0.65 (was 0.8), prompt v2 unchanged, per Tom's Yes on t-wanch4-wetfloor. `limits: {feet: 0.10}` with a why: the free replay of r4 measured the mop head 122 px, 9.5 percent of the frame, below her feet row (the other 4.4 checks hold) | strike, fps 24, step 3, 1.5x, fig_rows 99.3, from deedee-windex (her other cast-shaped move; data/clips/deedee-wetfloor.js does not exist yet) | wet_floor_hazard in data/b3-kit-deedee.js, shape cast |

- data/guide-anims.json rebuilt (`node tools/guidegen/build_map.js`): the Battle Guide shows the new prompt and revs.
- With a $2 cap the two first tries (about $0.79 each) fit; an edge retry (another $0.79) would pass the cap and is left for the next tap.
- Tests: board_check, wanbulk_test (B8 run with the stored r4 videos; its Wet-Floor line now expects edge only, feet 9.5 percent inside the new 10 percent limit), board_wan_test. Plan: claude/video-battle-plan.md 4.13.

## wanbulk (2026-11-21): battle videos are made, checked and put in the game by one board button

Card c-wanbulk. Tom (14:51, during c-wanch4): "Why do we have to do an opus prompt for every individual animation? This seems wasteful of my Claude usage. Can we do a bulk generation ?" The Action now does what the Opus session did by eye and by hand: it measures every video, has a vision model check the motion and the person, makes the one known retry, stops at the second miss, and bakes and wires what passes. Nothing was made or paid for in this session.

| Part | What it is |
|---|---|
| Checks (`tools/art-library/wanqa.py`) | Plan 4.4 checks 3 to 5 as measurements: standing height first against last within 2 percent; the lowest row of the figure in every picture within 1 percent of the frame height of the first picture's (a jump: the first and last picture only, job flag `airborne`); the background far from the figure stays flat magenta; the figure never touches an edge; last picture against first under 3 of 255. Checks 1 and 2 as a vision checklist made the way `artqa.py` works: one question per sentence of the MOTION part of the job's prompt plus "same person", three runs, majority, an unsure or missing answer counts as no. A job may carry `returns: false` (ends in a held pose: a knock-out), `skip_checks` or `limits` (with a plain `why` on the job) |
| One retry (`wanbulk.py`) | A video that fails ONLY the edge check is made once more with the next smaller pad of `_bulk.pads` in the job file (none, 0.8, 0.65). Any other failure, or a second miss, STOPS the job: nothing is sent again at that rev, and one Claude card (`c-wanstop-<job>-r<rev>`, Opus 5.5, medium) carries the numbers and the look-check answers. The look checker is asked only when every measurement passed or only the edge failed (a video that already failed costs nothing more) |
| Bake and wire (`wanbake.py`) | A job that passes is baked by the `bake` settings stored on the job (`bake_clip.py`: kind, fps, step, speed, fig_rows; marks found the way `clipmarks.py` finds them) and wired from its `wire` field (a row of a kit or foe file, or `B3_BODY_CLIPS[owner][state]`), the data file is syntax-checked, and all the passed jobs of a run are one commit on main with a heading named `wanbulk-<card>-<run>` |
| The card | `wan: {jobs, cap}` and `wgen: {want, run}` on a Tom card (ask animations). `board.html`: Videos on this card lists the jobs left to make and the dollar estimate, two taps (the second saves `wgen` with the commit `board: wan generate <id>`); the `wan-gen` Action starts on that commit (or by hand with `card`), sets `want` false before any spend, runs `wangen.py --bulk --card <id>` and writes `wgen.run` (merged, retried, stopped, capped, unchecked, errors, build, spent) plus one Tom card (ask animations, fyi) that lists every new clip. The run cap is the card's `wan.cap` and never above `_bulk.cap` (20 dollars) in the job file; retries count; a job the cap would pass is left for the next tap |
| Safety | A video that cannot be checked (no `XAI_API_KEY`) is kept and checked again at the next tap with no new charge. A job whose bake cannot be done (no marks found) is reported on the card and does not stop the others. `board_check.py` checks the shape of `wan` (jobs exist in the job file, `bake` and `wire` are well formed, cap within `_bulk.cap`). `board_sync.py` counts `wgen` as a paid run (never started at night) |

What the checks say about the stored videos (measurements only, free; the job flags above applied): the two plan 4.10 cases fail the way the plan says (`rose-giddyup` r4: the edge check only; `deedee-wetfloor` r4: the feet check at 9.5 percent and the edge check). Of the 46 videos (the final rev of each job) on branch `wangen`, 12 pass every measurement as they are, 2 files are not readable, and 32 fail at least one (feet 23, edge 11, background 8, last against first 6, height 2): mostly the feet rule at 1 percent (Deedee's idle drifts 2.7 percent and Tom approved it) and the end rule for moves that do not return (victory, run). The thresholds are the plan's numbers and live in one table (`LIMITS` in `wanqa.py`); a job that is judged by its own looser number says so in `limits` with a `why`. Nothing was changed on the strength of this table.

Files: `tools/art-library/wanqa.py`, `wanbake.py`, `wanbulk.py` (new), `wangen.py` (`--bulk`, `--replay-checks`), `wangen-jobs.json` (`_bulk`, `airborne` on rose-giddyup, `returns: false` on the four knock-outs), `.github/workflows/wan-gen.yml`, `board.html`, `tools/board_check.py`, `tools/board_sync.py`. Tests: `python3 tools/art-library/wanbulk_test.py` (a stand-in fal that answers with real ffmpeg videos, the stand-in xAI, a local git remote; pass, edge retry, stop, cap, bake and wire into a copy of the real kit files, the cards, a second tap, no check key, the r4 replay), `python3 tools/art-library/wangen_test.py` (W1 to W13), `python3 tools/board_wan_test.py` (the card on the page, portrait and landscape). Not exercised in a session: a real fal call, the real `bump_tags.py` inside the Action (its own tests are `tag_check` and `buildlog_test`), and the full game smoke after a merge (the first bulk card's watch card is the check).
## nighttestsb (2026-11-21): first real night test run read; the runner no longer crashes on a folder; minutes measured and groups rebalanced

Card c-nighttests, part b. First real run (GitHub run 44942942208): 197 of 210 rows ran, 306 measured minutes. 4 groups finished in 41 to 79 minutes, g3 crashed on a folder inside `tools/shots` (fixed: only files are scanned), g1 (which holds `b3_test.py`) hit the 4 hour job limit and was cancelled, so 13 rows have no result yet. 79 rows failed on main (the baseline: the next nights compare with it and add a card only for a test that was passing); 11 of them hit the time limit.
- `tools/night/tests.json`: measured minutes written back (x1.2, at least 1; rows that timed out 5; `b3_test` 70) and the groups rebalanced (`seed.py --rebalance`): `b3_test` is in g1, about 85 estimated minutes in every group.
- `tools/night/run_tests.py`: the picture scan lists files only.
- Not done: the second real run (the next night does it at 3:23 am).

## wanch4 (2026-11-21): Rose's Giddyup missed again (a somersault into the left edge); Deedee's Wet-Floor goes to Tom as a question

Card c-wanch4. Tom's answer on t-wanch3-watch was All good with no note, so nothing changed on the Skeeter's Darting Bite.

| Video | One change | Result |
|---|---|---|
| Rose Giddyup | Kling r5, pad 0.65 (was 0.8), prompt `wan-rose-giddyup-v2.txt` unchanged | Missed: top edge now clear, but the jump turned into a forward somersault and her hair touches the left edge upside down (video frames 70 to 74). Edge miss twice in a row, so stop-loss: not baked, not wired. Next one change: "leaps straight up" (the prompt also asks for planted feet), card c-wanch5 |
| Deedee Wet-Floor | none: stop-loss from wanch3 | Decision card t-wanch4-wetfloor (pictures `claude/wanch4/wetfloor-r4.jpg`) |

Also: new card c-wanbulk (Tom 14:51: one Opus session per animation is wasteful; the Action will check and retry videos itself). Nothing in the game changed, nothing purged. Notes: claude/video-battle-plan.md 4.11. Spent: fal $0.785 (ledger $53.81). Tests: `wanproof_test.py` FAILS [], `video_only_test.py` FAILS [], `b3_test.py s8` FAILS [], smoke (portrait and landscape) passes except `board_sync_test` (R5 replay, unstick card, Last night: duplicate `t-lastnight`), which fails the same way on main's board without this change.

## anim-deedee-dodge-y4m3 (2026-11-21): Deedee's Dodge is a Wan 3.0 video now: she ducks straight down with both hands on her head and stands back up

Card c-anim-deedee-dodge-y4m3, Tom's note "Make". Wan 3.0 through the wan-gen Action, job `deedee-dodge` rev 5 (run 44958736507, $0.50; the run's cap was set to $75 by Tom).
- Kept: Rose's passed duck prompt word for word (`tools/art-library/prompts/wan-deedee-dodge-v4.txt`), start picture `art/clips/start/deedee-hero.png`, figure at 80% (pad 0.8), seed 81.
- Changed from the three earlier tries (the lean wording missed three times, arms off the frame): only the MOTION, to the duck.
- Checks (plan 4.4) on all 150 pictures: reads as a duck, hands on head; same girl; feet on one row (drop 0.2% of her height); standing height first against last 1.00; no picture touches an edge; background flat; back in her stance at the end.
- Baked `data/clips/deedee-dodge.js`, `art/clips/deedee-dodge.webp`, source `art/raw/clips/wan-deedee-dodge-v1.mp4` (frames 28 to 92, every 2, 1.5x, kind state, 99.3 rows). `B3_BODY_CLIPS.deedee.dodge = 'deedee_dodge'` (before, her dodge slid her idle video); `data/guide-anims.json` rebuilt.

## b3s18bonusa (2026-11-21): Battle 3 can run a scripted story fight (midpoint end, boss starting HP, adds, Frozen, the sash); the bonus chapter is not switched yet

Card c-b3s18bonus, part 1 of 2. Rules and data only: no scene changed and chapter 21 still plays on battle 2. The bonus chapter's Brain Freeze fights needed things a plain formation does not have, so they are now data a fight carries (`cfg.setup`), read by one new rules file, `engine/b3-script.js`. The story's rows are `B3_STORY.setup` in `data/b3-story.js`, keyed by the scene step's `tut`.
- Scripted midpoint (`setup.midpoint`): the first time Brain Freeze begins a turn at or below the HP point, its steps play (a line, a big word, a status on a family member, the Deep Freeze that takes a share of everyone's HP and never below `leave`) and the fight ends with the named result, `flee` (run 1) or `shell` (run 2), not win or lose. `hold` is an HP floor under the monster for the whole fight (`hpFloor`, applied in `b3Hurt`), so the point is reached and he is never knocked out first. The end screen says the scripted word and line; CONTINUE ends the fight with that result, and `b3sEnd` writes it to `B2.result` as `flee` or `shell` so the scene steps that read it work as they did on battle 2.
- Starting HP (`setup.foeHp`): phase 2 starts Brain Freeze at half HP (Frosted Lid and Deep Freeze are open to him from his first turn).
- Adds (`setup.adds`): from round 3, every third round, Sprinkle Gremlins skitter in from the freezer up to 2 at a time, at the usual half HP.
- Frozen (new status): the holder loses every turn for its length, then acts. Not used up like a Stun (`skipTurn`). Shown as FROZEN.
- Birthday Girl (new status, `setup.start`): Grace's Birthday Sash, +75% Attack, +50% Defense, +25% crit and Skills cost 1 less Pep for her first two turns. The story layer (`b3sBegin`) adds it when the sash is on Grace; the rules apply what they are given.
- Chapter 21 floors (`B3_STORY.bonus[21]`): the story's level floor table ends at chapter 10 and its Vibe Point pool counts finished chapters, so chapter 21 would have started at level 25 with every Vibe at mastery; it gets level 5 and a pool of one chapter's worth instead (`b3sMigrate`). Vibe Points paid: 15 for each of the four normal fights and 30 for the Brain Freeze win (90 in all, the bestiary's chapter total); the flee and shell runs pay nothing.
- Balance fact: Brain Freeze phase 2 wins about 1 in 30 at level 5, about half at level 6 and nearly always at level 7 with the recommended moves. The chapter's four earlier fights pay XP, so the party should reach him near level 7; the chapter test (part 2) reads the real level.
- Checks: `tools/b3-check-s18bonus.js` (58 checks: setup rows, the 90 VP total, the floor, both scripted ends on 12 seeds each, Rose frozen in run 1 and not in run 2, the HP floor, phase 2 start HP and adds, Frozen's length, the sash's numbers and length). `node tools/b3-sim.js check`: 3329 checks, FAILS [].

## board-nightgreen3 (2026-11-21): next.md no longer says the two clip tests fail

Card c-nightgreen. `claude/next.md` (repo and Project copy) listed `clip_review_test` and `clip_kinds_test` as failing before and after b3s8; both pass today (nightgreeni, nightgreenj). Nothing in the game changed.

## board-nightgreen2 (2026-11-21): nightgreen handoff 2, 11 of 12 tests fixed or retired, the last one is ch20_test

Card c-nightgreen. The card's title, next step and prompt now name the one test left (`ch20_test`), with Sonnet 5.5 at medium effort and a cheap way to reproduce written in `claude/next-addendum-nightgreen.md` (the nightgreenl push had lost these edits in a board.json merge). Nothing in the game changed.

## nightgreenl (2026-11-21): the chapter 20 test gets past the eight doors; it still fails after the Leviathan fight (notes written)

Card c-nightgreen, test `ch20_test` (`python3 tools/ch20_test.py`). Part fixed, the row keeps `known_fail`.
- Cause of the old failure from "door rose opens" on: the test teleports the player to each door, so the seven followers stay behind, and each door scene first walks the whole party to the player in single file (about 33 tiles, about 10 seconds). The test's key presses ran out before the first line. The game is right (a player's followers trail him). `tools/ch20_test.py` now calls `placeFollowers()` after each teleport, as the other tests do. The eight doors, the Core, the lift and the whole Leviathan fight (four relays) now pass.
- Still failing: "shatter scene to Julian", "calm and epilogue to the end", "game complete flag". Checked by hand: with chapter 20 set and the flags set, the game plays the shatter scene and starts the Julian fight in about 11 seconds, so the scene and the fight work. What differs after the real fight is not found yet.
- `tools/night/tests.json`: `ch20_test` `minutes` 2 to 20 (the whole test takes about 16 minutes, 960 seconds times 1.2), `known_fail` text now says where it stops. Nothing in the game changed.

## dash3 (2026-11-21): a play card can name the place to check, and the dashboard's Next for you takes you there with one click

Card c-dash3; plan section "dash3: Take me there", facts in docs/DASHBOARD.md "Take me there (dash3)". Tom's prompt had no notes on it, so there was nothing to apply first. The game's own files were not touched, apart from the build stamp.

| Part | Result |
|---|---|
| Card fields | A Tom card with ask play may carry `jump` (`{chapter: N}`, `{chapter: N, map, flags}` or `{fight: "new"|"lab", i}`) or `where: "phone"` (touch, sound timing or speed). `tools/board_check.py` holds the shape (a bad chapter, a fight `i` the lab index does not have, both chapter and fight, a phone card with a jump, `jump` on a card that is not a Tom play card). Rule in the board section of CLAUDE.md. |
| Strip | Next for you, from the board, as drawn: the first three open play cards with a jump (theme, Play and report, the build that hands it to you, Take me there). All four: column 3 above the keyboard help, stacked; Battle: column 4, side by side, and the keyboard help moved under the screen sizes. Read from `data/board.json` on the site every 60 seconds. |
| Board pane | Take me there on the card (list and details) only when the Board runs inside the dashboard; On your phone on a `where: "phone"` card everywhere. |
| What it does | `__DASH.take(jump)`: the chapter jump, test fight and fresh start the strip already used; for a map it waits until the chapter is up, then `__LE.go(map)` and `setFlag` for each flag. |
| Backfill | Open Tom play cards: t-guardwinplay `jump {fight: "new", i: 0}` (NEW 1: TWO MUDLINGS has Tom in the party; proven in the game); t-ch2play `where: "phone"` (the real voice takes and the gaps between lines are sound timing); t-dash3-try and t-dash4-try are checks of the dashboard itself and need neither. The six cards parked in the backlog were not touched. |
| Proof | `tools/dashboard_test.py` (298 checks pass) takes every open play card's jump from the real board and checks where the game lands, then a stand-in board with three jump cards and cards that must not be listed (phone, a fourth, waiting, parked) checks the strip, Take me there from the strip and from the Board pane, and the Board on its own. Screenshots: `tools/shots/dashboard-next-1328.png`, `dashboard-board-take-1328.png`. |
| Test fixes | The test counted 27 new test fights; `data/battle-lab-index.json` has 66 now, so the counts come from the file. Two waits named nothing (a header that had not updated yet, the old Battle Lab fight mark) and now wait for what they check. |

## staletests1 (2026-11-21): three tests that failed on main now follow the data that changed under them

Card c-stale-tests. In all three the code was right and the test assumed data that has since moved; no game file changed and no paid call was made.
- `tools/art-library/clipgen_test.py`: the kept video is named by the entry's own `promptRev` (`clip-tom-give-rev1.mp4` now, the test expected rev0), so the test reads the rev from the entry. Its "main moved" check used `clip-bigone-glare`, which is approved now (the code correctly leaves an approved entry alone), so it uses `clip-grace-squeeze`, which is still a draft.
- `tools/clip-gate/vision_test.py`: `clip-tom-guard` and `clip-tom-ko` left the Art Library when the painted family battle states were purged (WAN videos are not Library entries). It now uses `clip-tom-cast` (a person move, flagged on `p_same`, a question under `hold`), `clip-grump-idle` and `clip-toad-idle` (monsters, never flagged). The advisory check runs on its own stand-in server answering no only to `n_name`. The header check uses `clip-toad-idle` in place of the rejected cast clip, whose baked header is an older cut.
- `tools/voice-learn/voicegen_test.py`: the dry run counted exactly 258 lines; it now counts the lines with no clip from `data/voice-index.json` (18 today). The long-first-tag check picked a `tom` line with no clip, so it picks the voice of the first line that has one.

## anim-rose-lava-xftr (2026-11-21): Rose's The Floor Is Lava! is a new Kling video (cushion toss, hop, two bounces) and the game draws the lava under her

Card c-anim-rose-lava-xftr. Tom's note: "Lava starts to form beneath her. She throws down a couch cushion on top of the lava, and then she jumps on top of the couch cushion, and then jumps up and down a couple of times".

| Try | What | Result |
|---|---|---|
| Kling 4.0 with lava (job rose-lava-kling, $0.78) | Only the model changed from Wan rev 4: start picture rose-cushion, prompt wan-rose-lava-v3.txt word for word, pad 0.8, start frame only | Story right, size steady (0.97 to 1.07 apart from one spike at the toss). FAIL: the lava touched the left edge in 66 of 121 pictures (Wan rev 4: 81 of 150). Job removed; video on branch wangen |
| Kling 4.0, no lava (job rose-cushion-kling, $0.79) | The fallback the card named: the same job with the lava taken out of the prompt (tools/art-library/prompts/wan-rose-cushion-hop-v1.txt = v3 minus the lava) | PASS: nothing enters from an edge, no edge touched, head size within 8% by eye. Faults left: she turns toward the viewer while bouncing and ends slightly turned |

Spent $1.57 (Tom OK'd going $0.07 past the $1.50; the cap went to 52.55 because another session's run spent $1.72 on the shared ledger at the same time). fal ledger now $52.53.

- Baked from art/raw/clips/kling-rose-lava-v1.mp4: kind strike, frames 9 to 108 every 3rd, impact 48 (she lands on the cushion), 1.5x, --fig-rows 83, --fps 24 (Kling makes 24 pictures a second), --below 10.
- `tools/clip-bake/bake_clip.py --below ROWS`: the frame keeps that many rows under the feet line (the cushion lies lower than her feet; without it the cushion was cut off). Written as `below`; `engine/clips.js` puts it on the frame as `_below` and Battle 3 (`engine/b3-play.js`) lowers the frame by it; the mirror keeps it.
- `--ground lava:F0:F1:F2`: the game draws a lava pool under her from video frame 12, full at 42 (the cushion lands), gone at 100 (she hops off). New `engine/clip-ground.js` (`bclipGround`, sizes in `CLIP_GROUND`), drawn in a clip move under the fighter and in the Battle Guide player (it loads the file from the game page). An effect, not a pose.
- `tools/guidegen/build_map.js`: the Wan job named in a clip's "Baked from" stamp wins over the job named like the clip, so the Guide shows the prompt that made the clip now (rose-cushion-kling).
- Looked at: the Battle Guide player in portrait and landscape, and the move in a Battle 3 fight in portrait and landscape. Tests: b3_test s8 pass; battle_guide_test and build_map_test each have one failure that was there before this change (the test's own sample board; Lounge Pass Flex later tries).

## nightgreenk (2026-11-21): the chapter 17 test waits for the game instead of guessing times, and gets its real time limit

Card c-nightgreen, test `ch17_test` (`python3 tools/ch17_test.py`; last time it was killed at 170 seconds, with `minutes` 2 the night runner stops it at 4 minutes). The game is right: chapter 17 plays start to finish (cab stand, tower lobby, landing, six shelves, regroup, race, vault, Twin Lenses fight, after scene). The test was wrong in two ways, both of timing:
- Sol's opening scene sets `ch17-open` to `pending` about 0.4 seconds after the tap, but the test checked after a fixed 300 ms. It now waits up to 5 seconds for the flag.
- After the six shelves, the regroup at the hatch and the start of the race press A while the previous scene can still be playing on a slow browser (its flag is set before it ends), and `pressAction` ignores a press during a scene, so the whole second half failed on some runs ("back at the stairs", then every later check). A new `idle` wait (no dialog, no scene, no transition, no step) runs before those two presses.
- `tools/ch17_test.py` has the two changes. `tools/night/tests.json`: `known_fail` removed from `ch17_test`; `minutes` 2 to 5 (measured about 205 seconds times 1.2), so the runner's limit is 10 minutes. Passes twice in a row (206 and 205 seconds). Nothing in the game changed.

## hollowfencec (2026-11-21): a comment swallowed a line in the scene clear-out search, so monsters cleared out of a scene picture lost their route

Card c-hollowfence follow-up, no new card. Cause (fact): in `hollowfenceb` the new fence check on `stageShooOut`'s search line ended with a `//` comment that also swallowed `prev.set(k,c);` from the same line, so the search never recorded where it came from and the route back to the goal came out as one tile. Fix: `prev.set(k,c);` is back before the comment. Nothing else changed.

## battleguide2 (2026-11-21): the Battle Guide opens a real fight for any move or attack, and shows everything planned but not built, marked PLANNED

Card c-battleguide2. Tom's notes on the guide: none (his card Try the Battle Guide on the Duo: "all good"). Parts 2 to 4 of the card:

| Part | What changed |
|---|---|
| In a fight | A gold-outlined **In a fight** button beside Play on every family move and every monster attack opens `index.html?go=new&i=<fight>&move=<move>` or `&act=<monster>:<act>`: a Battle Lab fight on the new battle whose family holds the owner (or whose formation holds the monster), the owner at the Rank that unlocks the move, and the move used first, once; then the fight is Tom's. Game side: `b3LabFirstOpt` and `b3LabFirst` (`engine/b3-lab.js`), `splashGoTool` (`engine/splash.js`), `b3FirstSet` and `b3FirstTurn` (`engine/b3-ui.js`), `e.force` in `b3FoePick` (`engine/b3-foe.js`). No animation was built, tuned or judged. |
| Third Vibes | Each person's third Vibe is a dashed button after their two in the Family tab: name, titles, Lean, Trait, Basic, Skills and Quirks as `claude/battle-spec-v11.md` words them, PLANNED, no Play or fight button. |
| Everything else planned | 26 Part 2 monsters and bosses (chapters 11 to 20, `claude/bestiary-v11.md`) under their own PLANNED chapter headings in the Monsters tab; a Rules topic **What is coming** (stages 16, 19 to 21, 22 and 23 in order, which chapters play on the new battle, the BAG and Run, Tombo skins, Casual Mode, knocked-out members standing at 1 HP, gear, helper links, the Twin Lenses, phase lines, picking the four again); the cheat sheet says the BAG is planned; moves named in `B3_SOON` show as planned when there are any. Search has a **Planned** chip. |
| Where the list comes from | `python3 tools/guide_planned.py` reads the plan documents and writes `data/guide-planned.json` (hashes of the sources; `--check` says when one changed). Each item carries a `when` rule the page checks against the game's own `data/b3-*.js`, so a third Vibe, a monster, a chapter or a rule in the game makes the planned item vanish and the real one show by itself. What the list was built from, row by row: docs/BATTLE_GUIDE.md "Planned, not built yet". |

Also: `data/battle-lab-index.json` was stale (27 of the 66 fights; the Battle Lab page listed too few), regenerated with `node tools/battle_lab_index.js`. docs/BATTLE3.md "Where it is played today" said chapters 2 to 20 still use battle 2; it now says chapters 1 to 10 are on the new battle (`B3_STORY.chapters`). Tests: `tools/battle_guide_test.py` (new checks listed in docs/BATTLE_GUIDE.md "Test"), `b3_test.py new1`, `node tools/b3-sim.js check`; the guide test's stand-in board now drops the guide's note cards together with their Tom cards, so its two `board_check` checks pass again.
## nightgreenj (2026-11-21): the chapter clip review test is taken off the known failures: it already passes

Card c-nightgreen, test `clip_review_test` (`python3 tools/clip_review_test.py`; the list said "failing since b3s8"). Neither the test nor the game is wrong today: on current main it passes three times in a row (about 75 seconds each) in portrait and landscape: the review panel lists the three clips, PLAY and PLAY ALL draw them in order, only the clip that plays is loaded and it is let go afterwards, REDO saves a rejection with the note, and leaving the fight removes the panel. Whatever broke it at b3s8 was fixed by a later build.
- `tools/night/tests.json`: `known_fail` removed from `clip_review_test` (its `minutes` 5 already fits). Nothing in the game changed.

## wanch3 (2026-11-21): the Skeeter Swarm's Darting Bite is a video; Rose's Giddyup and Deedee's Wet-Floor missed again and are listed

Card c-wanch3. Tom's answer on t-wanch2-watch was All good with no note, so there was nothing to apply. One try each, one change each, checked by claude/video-battle-plan.md 4.4 (details in its section 4.10).

| Video | One change | Result |
|---|---|---|
| Skeeter Darting Bite | Wan 3.0 (job `skeeter-bite` r1) with the start picture as first and last frame, the Art Library entry's prompt word for word | Passed: one jab, the small mosquitoes stay, back to its start pose. `data/clips/skeeter-bite.js`, `art/clips/skeeter-bite.webp`, source `art/raw/clips/wan-skeeter-bite-v1.mp4`; `darting_bite` in data/b3-foes-ch01.js plays `skeeter_bite` |
| Rose Giddyup | Kling r4, prompt `wan-rose-giddyup-v2.txt` (second hop dropped) | Missed, new fault: one jump now, but her hair is cut at the top edge and her hand leaves the left edge. Next: pad 0.65 (card c-wanch4) |
| Deedee Wet-Floor | Kling r4, prompt `wan-deedee-wetfloor-v2.txt` ("beside her feet, level with them") | Missed the same way a third time (mop head 114 px below her feet row) and swept twice. Stop-loss on wording: c-wanch4 asks Tom first |

Nothing was replaced, so nothing was purged. `tools/guidegen/build_map.js`: a monster now gets its Wan job in the Battle Guide when that job made its clip (the guide shows the Wan prompt for the bite). Spent: fal $1.72 (ledger $50.96). Tests: `wanproof_test.py` FAILS [], `video_only_test.py` FAILS [], `b3_test.py s8`, `guidegen/build_map_test.py` (only its earlier Lounge Pass failure), `guidegen/take_test.py`, smoke (portrait and landscape).
## voices-t-ch1voices-334 (2026-11-21): 10 voice takes made from board card t-ch1voices and merged into the game

The voice-gen Action made the takes (voiceboard1, tools/voice-learn/voiceboard.py) and merged them with merge-local.js: 10 clips, 0 lines on needs-human (silent, not merged), about 0 credits. Nobody has listened to these takes yet; the card asks Tom to.

## nightgreeni (2026-11-21): the clip kinds test is taken off the known failures: it already passes

Card c-nightgreen, test `clip_kinds_test` (`python3 tools/clip_kinds_test.py`; the list said "failing since b3s8"). Neither the test nor the game is wrong today: on current main it passes three times in a row (about 65 seconds each): the Mudling idle loop runs forward then backward with no jump (21 of 21 pictures), and Rose's knock-out plays the state clip in order and holds the last picture (39 of 39 in portrait, 37 to 38 of 39 in landscape, inside the test's allowance). Whatever broke it at b3s8 was fixed by a later build.
- `tools/night/tests.json`: `known_fail` removed from `clip_kinds_test` (its `minutes` 2 already fits). Nothing in the game changed.

## hollowfenceb (2026-11-21): a story scene clearing monsters out of its picture can no longer put one inside the Grump Hollow fence

Card c-hollowfence (second cause; the first, monsters' home spot, shipped as hollowfence). Cause (fact): when a story scene starts, every ordinary monster in the picture is walked or placed on the nearest free tile outside it (`stageShooOut`, `engine/story.js`), and that search never looked at the Hollow's `monsterFence`, so a monster could end up east of x 13 by Boppy's fishing spot. Fix: the search skips fenced tiles for monsters. `tools/hollow_trail_test.py` has a new check that clears a monster out of a picture whose nearest exit is the fence (it failed before the fix, passes after).

## nightgreenh (2026-11-21): the old Art Library page test is deleted (it tested a pasted-key page that no longer exists)

Card c-nightgreen, test `art-library/test.py` (failed at the data counts, then at a click on the "Test card" group). The test was of something that is gone, so the purge rule deletes it. Facts: it counted 560 entries by tab and one-group tabs (the library has 1,123 entries and many groups now), checked that the Test card group sits alone, drove a pasted xAI key box (`#kx`, `#sx`, "Paste the xAI key") that keysecrets1 removed (GENERATE now asks an Action), and approved and rejected through the first version of the Review viewer. What covers the same ground today: `node tools/art-library/validate.js` (data rules, banned words, ref chains; fixed in nightgreena), `python3 tools/art-library/review_test.py` (the Review viewer), `keysecrets_test.py` and `keysecrets2_test.py` (requests to the Actions), `artgen_test.py`, `upload_test.py`.
- Deleted: `tools/art-library/test.py` (`stub.py` stays, five other tests use it). `tools/night/tests.json`: the `art-library__test` row is gone. `claude/build-plan.md`: the line that listed it as a test to run no longer does. Nothing in the game changed. Older addenda in `claude/` that name it are history and are left as written.

## nightgreeng (2026-11-21): the rooms test is taken off the known failures: it already passes

Card c-nightgreen, test `rooms_test` (`python3 tools/rooms_test.py`; the list said "tomsuite"). Neither the test nor the game was wrong: the test covers bakery, library, greenhouse, post and tea (not `tomsuite`), and on today's main all five rooms pass (plate drawn, square plate, every object and NPC reachable, the door leads out, the library staff door and the Stacks stairs), twice in a row, about 117 seconds each. The `known_fail` note was a guess carried from the b3s8 list.
- `tools/night/tests.json`: `known_fail` removed from `rooms_test`; `minutes` 2 to 3 (measured 117 seconds times 1.2, the rule `tools/night/report.py` uses), so the night runner's limit (twice `minutes`, at least 3) is 4 minutes. Nothing in the game changed.

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



