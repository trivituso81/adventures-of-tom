# Night jobs: work that runs while Tom sleeps (plan of 2026-11-21)

Source: Tom, 2026-11-21 11:00: "I feel more could be done with automated tasks that you and i design together to get work done overnight. so while im sleeping tasks can go off that execute, test, file cleanup, code cleanup and refactoring". And 11:09: "i think we should do cleanup every night since we are in such an active development phase. create a card for each job in the board so that i can action it".

Planning chat: https://claude.ai/code/session_01RXeukD6Akpm4xQwBbn5y8k (repo read at commit a31af49). Nothing was built in it. This file is the design; the six cards in section 9 build it.

## 1. What is there today (facts on 2026-11-21, about 11:15)

| Fact | Number |
|---|---|
| GitHub jobs (`.github/workflows`) | 14. None runs the game's tests. The only one on a clock is `board-sync` (hourly, minute 17). |
| Test scripts | 205 `*_test.py` under `tools/` (176 at the top, 29 in folders), plus `tools/smoke.py` and `node tools/b3-sim.js check`. They run only when a session chooses to. |
| Tests failing on main with no card | 13, listed in `claude/next.md` under "Pre-existing test failures on main". |
| Tom's open cards | 35, of which 24 have ask play (play, look or try, then report). |
| Claude work that starts on a clock | None. A card starts by Tom's tap on START, by Copy prompt, or as a rescue (1 per card, 4 a day). |
| START routes that work | Sonnet 5.5 medium only (`routines` in `data/board.json`: opus-medium and sonnet-high are paused). |
| Files every session reads | `CLAUDE.md` 60 KB, `claude/next.md` 44 KB, `data/board.json` 1.5 MB (592 cards, 538 Done; the archive holds none yet because its rule waits 7 days), `claude/` 628 files, `index.html` 518 script tags. |

## 2. The rule

Nights do the work that needs no taste and no money, and Tom reads one card in the morning. A night never adds a conversation Tom has to track, never spends on a paid service, and never uses a model above Sonnet 5.5 medium.

## 3. The night, hour by hour (America/Los_Angeles; the board job already runs at minute 17 of every hour)

| Time | What | Runs on | Claude credits |
|---|---|---|---|
| 23:17 to 03:17 | Night shift: one card at a time. First the standing card Night cleanup, then the standing card Night QA, then fix cards made by last night's tests, then the oldest queued card START can run. | Board START task (Sonnet 5.5 medium) | Yes, capped (section 4) |
| 03:23 | Night test run on the main of that moment. | GitHub machines | None |
| After the tests | A test that newly fails becomes a Claude fix card and may start until 06:00. | Board START task | Yes, inside the same cap |
| 06:17 | The card Last night is rewritten for Tom. | Board job | None |

GitHub's clock is UTC and ignores daylight saving: the workflow crons are written for winter (PST) and the window test in `tools/board_sync.py` uses `zoneinfo` so the shift itself follows Los Angeles time.

## 4. Guard rails (every night session; job 1 writes them into CLAUDE.md as the section "Night runs")

| Rule | Detail |
|---|---|
| Cap | `night.max` starts a night (5 to begin with), rescues included. One at a time: the next card starts only when no card started by START is In progress. |
| Model | Sonnet 5.5 medium only. Never Opus, never Fable, never a raised effort. A card that needs more goes to Tom's morning card with its Copy prompt. |
| Never at night | Game dialogue, voice tags, picture, video or music prompts, anything Tom judges by taste (row D of `claude/handoff-rules.md`). Any paid run (xAI, ElevenLabs, fal): the standing rule "the first paid run is Tom's tap" holds. |
| Never touched | Voice clips and takes (Tom, 2026-11-05), `art/raw/`, `demo/`, Tom's saved files (`data/welcome-layout.json`, `data/pose-requests.json`, `data/script-edits.json`, `data/script-review.json`, `data/portrait-frame.json`), the branches `inbox`, `takes`, `generated`, `clipgen`, `artgen`, `voicetake`, `guidegen`, a card in the backlog. |
| Tests | Every night push passes `python3 tools/smoke.py` and the tests of what it touched, as in the day. |
| Stop-loss | Two misses the same way: stop, write "ended without shipping" with the reason, and the card goes to Tom's morning card. |
| Off switch | `night.enabled` in `data/board.json`, with a chip on the board page (Night shift ON or OFF). A single card opts out with `night: false`. |
| A red night | A test that newly fails is fixed forward by a fix card that names the commits since the test last passed. Commits are not reverted automatically: a revert of a stamped build breaks the cache tags and the build history. |

## 5. Job 1, the night shift (card c-nightshift, build nightshift)

Everything below is in `tools/board_sync.py` (new rule R14, after R11 and before R9) with fixtures in `tools/board_sync_test.py`, plus the board page.

1. `night` object at the top of `data/board.json`: `{enabled: true, max: 5, from: 23, to: 3, fixes_until: 6, tz: "America/Los_Angeles", log: {}}`. `log[<date>]` lists what R14 started that night (card id, time, kind).
2. R14, on each run inside the window: skip when `enabled` is false, the cap is reached, or a card with `started_at` is still In progress and not quiet. Otherwise pick one card and set `start: true` on it (R9 fires it), with the history line "Started by the night shift." Order: standing cards (`nightly: true`) that have not run tonight, in board order; then open fix cards whose `fix_of` is a night test; then the oldest card in Claude's lane, column up, no backlog flag, no open blocker, `night` not false, whose prompt is Sonnet 5.5 medium (the route `routine_for` returns must be enabled).
3. Standing cards. A card with `nightly: true` never goes to Done. Its builds are named `<tag>-<mmdd>` (for example `nightclean-1122`). R3: a `## <tag>-<mmdd>` heading in docs/CHANGES.md sets `last_run` (date, build) on the card and returns it to Up next. `tools/board_check.py --push` accepts that build name for the card and needs no `after` on it. A run with nothing to do pushes only the board commit `night: ran <card id>` with one history line and `last_run`. The session rule in CLAUDE.md: a standing card's run keeps the newest 10 history lines.
4. The card Last night (`t-lastnight`, lane tom, ask setup, `fyi: true`). One card, rewritten each morning by `tools/night/lastnight.py` (called from R14 at the first run after `fixes_until`): Ran (each card started, and how it ended), Shipped (build names with their one line from docs/CHANGES.md), Tests (read from branch `night`, file `tests/latest.json`, when it exists), Closed for you, Needs you (cards that came to Tom's lane overnight, by title), Starts used (n of max). It reopens in Up next when there is something new and stays Done on a night when nothing ran. Tom's I did this with a note already becomes a Claude card (R10).
5. Board page (`board.html`): a chip beside the lane names, Night shift ON or OFF, two taps to change, commit `board: night on` or `board: night off`. A standing card shows "Runs every night. Last run <date>." in its details. `tools/board_test.py` gets cases for both.
6. CLAUDE.md: the section "Night runs" (section 4 of this file, shortened) and one paragraph in the board section. `claude/handoff-rules.md` is a Project mirror that a START run cannot write: put the same paragraph in the repo copy and say in the closing lines that the Project copy needs it.
7. Tests: `python3 tools/board_sync_test.py` (new cases: outside the window nothing starts; cap; one at a time; order; a backlog card and a `night: false` card never start; a standing card returns to Up next after its heading; the morning card text), `python3 tools/board_check.py`, `python3 tools/board_test.py /tmp/board`.

## 6. Job 2, the night test run (card c-nighttests, build nighttests)

1. `tools/night/tests.json`: one row per test: `id`, `cmd`, `group`, `minutes`, optional `env`, optional `known_fail` (a reason). Seed it from the "Tests" section of `claude/next.md` and a listing of every `*_test.py` under `tools/`. The 13 tests named there as failing start with `known_fail`. A top level `skip` list holds scripts that are not tests of the game or that need a paid key, each with a reason.
2. `tools/night/manifest_check.py`: fails when a `*_test.py` file is neither in the rows nor in `skip`. `tools/smoke.py` calls it, so a new test cannot be forgotten.
3. `tools/night/run_tests.py <group>`: runs the group's rows one after another (never two Playwright tests at once on one machine), each with a time limit of twice its `minutes`, re-runs a failing row once before it counts, and writes `result-<group>.json` (id, pass or fail, seconds, the last 60 lines of output) plus the new pictures from `tools/shots/`.
4. `.github/workflows/night-tests.yml`: `schedule: cron '23 11 * * *'` and `workflow_dispatch` (inputs `group`, `only`). A matrix over at most 6 groups with `fail-fast: false`, each under 4 hours; setup as in `voice-index.yml` (`pip install playwright pillow`, `python -m playwright install --with-deps chromium`, ffmpeg from apt). The job gets NO paid secret (no `XAI_API_KEY`, `ELEVENLABS_API_KEY`, `FAL_KEY`). Results and pictures are uploaded as artifacts.
5. Last job `report` (`tools/night/report.py`): merges the results, writes `tests/<date>.json` and `tests/latest.json` on the orphan branch `night` (made the way `takes` was; never merged), and compares with the night before. For each test that newly fails and has no open card: add a Claude card `c-nt-<test id>` (`fix: true`, `fix_of: "night:<test id>"`, Sonnet 5.5 medium, theme Tools) whose prompt holds the command, the output tail, the artifact link and the commits on main since that test last passed. A `known_fail` row that passes is listed as "passes now, remove the flag". A fix card whose test passes again gets a history line. The board change is one commit `night: tests <date>`, made the way `voiceboard.py` writes `vgen.run` (re-read, merge, `board_check.py`).
6. After the first real run: write the measured `minutes` back into the manifest and rebalance the groups.
7. Tests: `python3 tools/night/night_test.py` (a made-up manifest with a passing, a failing, a flaky and a known-failing row; the report's diff against a made-up yesterday; the card it writes passes `board_check.py`), then one real run started by hand with `gh api repos/trivituso81/adventures-of-tom/actions/workflows/night-tests.yml/dispatches -f ref=main` and its result read from branch `night`.

## 7. Job 3, the nightly cleanup (card c-nightclean, build nightclean; waits on job 1)

Tom, 11:09: every night, because development is this active. The build makes the report script, the checks, and the standing card Night cleanup (`c-night-clean`, `nightly: true`, tag `nightclean`), then does the first night's pass itself.

1. `tools/night/clean_report.py` (no AI; also a step of `night-tests.yml` when that exists, written to branch `night` as `clean/latest.json`): sizes with the change since yesterday (`CLAUDE.md`, `claude/next.md`, `claude/INDEX.md`, `data/board.json`, file counts of `claude/`, `tools/`, `docs/`, script tags in `index.html`); files nothing names (a `tools/` script named by no doc, workflow, card or other script; an `engine/` or `data/` script with no tag in any page; an `art/` file named by no data, engine or tool file; a `claude/` note named by no open card, CLAUDE.md, `claude/next.md` or other note and untouched for 3 days); files with identical content; tests marked `known_fail` for more than 7 nights.
2. `tools/night/rules_check.py` with `tools/night/rules.json`: the list of every heading in CLAUDE.md that holds "standing rule" or "standing fact" and every quoted sentence of Tom's in CLAUDE.md and `claude/handoff-rules.md`, taken from main on the day of the build. It fails when one is missing. A cleanup may shorten the story around a rule; it may never drop the rule or Tom's words. `tools/smoke.py` calls it.
3. Done cards leave the board after 2 days instead of 7 (`tools/board_archive.py`, R13), since 538 of 592 cards are Done and the file is 1.5 MB. `tools/board_archive_test.py` and `tools/board_big_test.py` updated.
4. The standing card's prompt, one bucket a night, in this rotation, each ending with smoke, the grep for zero references that the purge rule asks for, and a docs/CHANGES.md entry that lists what left:
   - A. Files nothing names: remove up to 40 from the report, oldest first, never from the "Never touched" row of section 4.
   - B. Notes: fold what is still true from finished `claude/next-addendum-*.md` and plan files into the doc that owns it (docs/ or CLAUDE.md), delete the rest, rebuild `claude/INDEX.md`.
   - C. Working agreement: shorten CLAUDE.md and `claude/next.md` (history and one-off stories go to docs/CHANGES.md or out), under `rules_check.py`. Neither file may end the night bigger than it began.
   - D. Tests: delete a test that has been `known_fail` for more than 7 nights and tests something that no longer exists; a test of something that still exists goes to a fix card instead.
5. Not in this job: voice (report only; `tools/clip-audit/unused_voice.py` keeps its own rule), and dead code inside `engine/` files (that is job 6).
6. Tests: `python3 tools/night/clean_test.py` (the report on a made-up tree; `rules_check.py` catches a dropped heading and a dropped quote), the board tests of step 3, smoke.

## 8. Job 4, the night QA of Tom's play cards (card c-nightqa, build nightqa; waits on job 3 only so builds do not collide)

Tom, 2026-11-19: his role is not QA and not double-checking Claude's work. 24 of his 35 open cards ask him to play and report.

1. The standing card Night QA (`c-night-qa`, `nightly: true`, tag `nightqa`). Each night it takes up to 4 open Tom cards with ask play and no `machine` field, oldest first, backlog included (checking a parked card moves nothing of Tom's except closing it on a pass).
2. For each card: read `next`, `first` and the history, and sort it. YES OR NO (a fact a test browser can see: a button is or is not on screen, a scene ends, a person stands on a roof, a fight restarts) or YOURS (how something looks, sounds or feels, timing of a joke, anything about the real phone, the Duo's fold, touch, or audio).
3. YES OR NO: reproduce the exact path with `tools/reaction_test.py` or a small Playwright script in portrait, landscape and the Duo size (`"vp":[951,648]`), with no SKIP or FAST when the card is about a scene, and LOOK at the frames. Pictures go to branch `night` under `qa/<card id>/<date>/`.
   - Pass: the card goes to Done with `machine: {at, verdict: "pass", saw, shots}` and the history line "Checked by the night QA: <what was seen>". It is listed under Closed for you on the Last night card.
   - Fail: what Something is wrong does today: a Claude fix card (`fix: true`, `reports` holds what the browser showed and the picture links, Sonnet 5.5 medium), and Tom's card waits behind it.
4. YOURS: `machine: {at, verdict: "yours", why}` so it is not looked at again; the card stays Tom's and its details show "Needs your eyes: <why>".
5. The rule that stops new ones (CLAUDE.md, board section): a session never hands Tom a play card for a yes or no fact. It tests the fact itself and puts the frames in docs/CHANGES.md. A play card is only for what a person must judge. `tools/board_check.py` cannot see this; the night QA is the backstop.
6. Board page: the two lines in a card's details ("Checked by the night QA" with the pictures, or "Needs your eyes"). `tools/board_test.py` cases.
7. Limits to say plainly on the Last night card: the test browser is Chromium on a server, not Safari on the iPhone. It cannot hear, cannot judge touch, and cannot see the Duo's fold.

## 9. The cards (all theme Project Ops; added by board-night)

| Order | Card | Title | Model, effort (logic of `claude/handoff-rules.md`) | How it starts |
|---|---|---|---|---|
| 1 | c-nightshift | Night shift: queued cards start by themselves overnight | Sonnet 5.5 (row B: the steps are section 5, the board tests catch mistakes), medium | START |
| 2 | c-nighttests | Night test run: every test, every night, on GitHub | Sonnet 5.5 (row B: section 6), medium | START |
| 3 | c-nightclean | Nightly cleanup: files, notes and the working agreement | Sonnet 5.5 (row B: section 7), medium | START once 1 ships (the night shift starts it that night if Tom does not) |
| 4 | c-nightqa | Night QA: the test browser plays your check cards | Sonnet 5.5 (row B: section 8), medium | START once 3 ships (or the night shift, the same way) |
| 5 | c-nightgreen | Fix the 13 tests that already fail | Sonnet 5.5 (row C: causes unknown), high | Copy prompt, after 2 ships |
| 6 | c-nightrefactor | Nightly refactoring, one small piece a night | Sonnet 5.5 (row C: the piece list is not written), high | Copy prompt, after 5 ships and 7 nights with no failing test |

## 10. Jobs 5 and 6 in short

- Job 5 (c-nightgreen): for each of the 13, find out whether the test or the game is wrong. Fix the one that is wrong, or delete a test of something that no longer exists, and remove its `known_fail`. Push after each (nightgreena, nightgreenb, and so on). Stop when the conversation is long and write the rest on the card.
- Job 6 (c-nightrefactor). Refactoring means rewriting working code to be tidier without changing what the game does. It is the riskiest night job: 117 engine files share one global scope and depend on load order (CLAUDE.md hard rule 1), and several wrap each other's functions (`claude/next.md`, Gotchas). So it starts only after 7 nights in a row with no failing test on branch `night`. The first session writes `claude/refactor-plan.md` (a list of small pieces, each naming its files, the tests that cover it and the frames to compare) and makes the standing card Night refactor. One piece a night; values, dialogue and data never change; a piece whose tests or frames differ is put back the same night.

## 11. What was decided against

| Idea | Why not |
|---|---|
| A separate Claude scheduled task per job | A task made by a session cannot be given a model, so a night could run on an expensive one. The Board START task is fixed to Sonnet 5.5 medium and already works. |
| Undoing a night's commits automatically when a test fails | Every build moves cache tags and the build history; an automatic revert breaks both. A fix card with the suspect commits is safer. |
| Weekly cleanup | Tom, 11:09: every night. |
| Unattended refactoring from night one | The tests do not yet prove the game works: 13 fail and none runs on a clock. |
