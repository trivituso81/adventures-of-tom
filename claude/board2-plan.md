# Board audit and the automatic board (2026-11-19; audit done, board2 and board3 are PLANS, not built)

Source: Tom 2026-11-19 15:31: "Audit the Kennan board and make sure it actually makes sense for how you and work with each other. I want to create a seamless flow where cards are on the board and moved automatically and there are easy ways for me to initiate next steps with you. The issue is I'm losing track of all the conversations we have going in parallel"

Audit chat: https://claude.ai/code/session_01RXeukFc3ANMLuB2qSqohxj. Everything in sections 2 to 8 is a decision. The build session builds it and does not reopen it.

NOT APPLIED: the audit chat was refused push access (Tom's opening message did not name the repo). The data fixes are in `claude/board-audit/apply_audit.py`. It was run on a copy of the live board (main at ch1takes1): `board ok (27 cards, 5 lanes)`, and a second run changes nothing. Run it first: `python3 -I apply_audit.py data/board.json && python3 tools/board_check.py`. Each step skips itself if the card has moved on.

## 1. What the audit found (board at main ch1takes1, 21 cards)

The cause behind every row: the board is kept current by a rule sessions must remember and by Tom tapping. Nothing reads what actually happened in the repo. The repo already records all of it.

| # | Finding | Evidence | Fix |
|---|---|---|---|
| 1 | The board said Tom was blocking Claude when he had already done his part | Commit "Art Library: ch1-kitchen-empty-island approved (v0)". Card t-kitchenempty still Tom / Up next, c-cutpolish4b still Waiting on Tom | Audit script; rule R2 |
| 2 | Finishing a card did not move the cards it blocks | Tom tapped Done on t-ch1play and t-milestonea. c-ch2build and c-b3s9 stayed Waiting on Tom | Audit script; rule R1 |
| 3 | "Move to" lets Tom say "your turn" but nothing turns that into a job | After his Art Library pass (5 approved, 4 rejected with notes) he moved t-ch1art, t-narr and t-ch1clips to Claude. t-ch1art sat in Claude / Up next with his own instructions, no prompt, and no session picked it up | Audit script; section 5 buttons |
| 4 | In progress was empty all day while many conversations ran | 0 cards in In progress. Sessions update the board only when they finish | Rule R4 (claim on the first push) |
| 5 | The board cannot answer "which conversations do I have open" | 12 conversations pushed to main on 11-19 (from the `Claude-Session:` line on each commit). The board links 5. 12 of 21 cards say "Link unknown" | Rule R5, the Conversations strip |
| 6 | Builds ship without touching the board | scene1fix1 and ch1takes1 have no card. clipgate2a shipped half of c-clipgate2 and the card did not change. ch1takes1 found t-narr stale and left it ("Tom has not said to") | Rule R3; the push check in section 4 |
| 7 | A prompt on a card had a blank for Tom to fill in | c-ch2build: "Chapter 1 play feedback: <what Tom saw>" (handoff rules: nothing to fill in) | Audit script; check in section 4 |
| 8 | Tom's feedback has nowhere to go when he taps Done | t-milestonea said "send your notes to the stage 9 session". That session did not exist yet | "I did this" takes a note (section 5) |
| 9 | Two lists of open work | claude/next.md is about 45,000 bytes (its own limit is 20,000) and still has ORDER NOW prompts and a "Waiting on Tom" section that names items boardclean1 removed | Card c-nextclean; section 6 |
| 10 | The Project instructions never mention the board | They say every session starts with "Read claude/next.md and continue". A chat Tom opens any other way only finds the board rule if it happens to read handoff-rules.md | Section 7 (only Tom can paste it) |
| 11 | Four service lanes, always empty, and one of them is ruled out | xAI, ElevenLabs, Image generator, GitHub: 0 cards ever. "Image generator" is the outside image AI Tom ruled out on 11-02 | Lane removed by the audit script; rule R6; section 5 |
| 12 | Half the page is finished work | 11 of 21 cards are Done and stay 7 days | Section 5 |
| 13 | Every board tap starts a full site publish | publish.yml runs on every push to main. Tom's 7 board taps on 11-19 each queued one | Section 3, last line |

## 2. The principle

The board follows the repo. A card moves because something happened (a commit, an approval, a job), not because someone remembered to move it. Sessions and Tom still can move cards; they should rarely need to.

## 3. `board-sync`: the job that moves cards (no AI, no credits)

`tools/board_sync.py` plus `.github/workflows/board-sync.yml`. Runs on every push to main, and as the last step of clip-gen, voice-gen, clip-gate and art-bake (a push made with the Actions token does not start other workflows: known gotcha in claude/next.md). It reads the new commits since its last run (`synced` field in data/board.json holds the last commit it saw), applies the rules, and commits data/board.json only if something changed, message `board-sync: <what moved>`. It never touches a card's title, next step or prompt.

| Rule | When this happens in the repo | The job does |
|---|---|---|
| R1 Unblock | A card goes to Done (by anyone) | Every Waiting card whose blockers are now all Done moves to Up next in its own lane, `waiting_on` removed, history "Unblocked: <title> is done." Tom's note from "I did this" is copied into its history |
| R2 Tom's work seen | A phone commit matches a card's `done_when` | Card goes to Done with a history line. Kinds: `{"art_approved":["<entry id>",...]}` (all listed entries approved in data/art-prompts.json). When some listed entries are rejected and none are undecided, the card also goes to Done and the history lists approved and rejected |
| R3 Build shipped | docs/CHANGES.md gains a heading `## <tag>` | A card whose `tag` equals it goes to Done. A heading that is the tag plus a letter (clipgate2a for clipgate2) moves the card to In progress with history "Part shipped as <tag>". A heading with no card adds a Done card titled with the heading's plain line, so the conversation is on the board |
| R4 Claimed | A commit message starts `board: start <card id>` | Card moves to In progress, `chat.url` set from that commit's `Claude-Session:` line |
| R5 Conversations | Any commit with a `Claude-Session:` line | Updates the `sessions` list in data/board.json: url, first seen, last push, tags shipped, card ids touched. Also fills a blank `chat.url` on a card when a commit names its tag or id |
| R6 Service runs | clip-gen, voice-gen, clip-gate or art-bake starts, fails or ends | Start: a card in that service's lane, In progress ("clip-gen is making chapter 2 clips"). Fail: the card moves to Waiting on Claude with the failed step. Success: the card is removed. `needs-human.*` output adds a Tom card |
| R7 Reports and takes | New files on branch `inbox` (a REPORT) or `takes` | A Claude card "Fix report <id>: <first words of the note>" or "Merge N new voice takes", Up next, with the standing prompt for that kind |
| R8 Quiet | An In progress card with no push from its conversation for 24 hours | Flag `quiet: true` (the page shows "Quiet for N days: the conversation may have stopped") |

New card fields: `tag` (required on Claude cards from now on), `done_when` (optional, Tom cards), `note` (Tom's words from "I did this"), `quiet`. New top-level fields: `sessions`, `synced`.

Board-only commits must not start a site publish: add data/board.json to publish.yml's ignored paths for pushes that change nothing else (the page reads the live file from GitHub when the token is set).

## 4. Checks that make skipping the board impossible

Add to `tools/board_check.py` (already in smoke):
- A Claude card not in Done has `tag` and a complete prompt, and the prompt text holds no `<` blank for Tom to fill in.
- A Tom card that blocks a card names that card in its `next` in plain words.
- New mode `--push <tag>` (called by bump_tags or smoke): the build being pushed must be on a card (`tag` equal, or the tag in a history line). A push that fails this stops. This replaces "remember to update the board".
- A card in Claude's lane with no prompt fails (this is what t-ch1art was).

Add `tools/board_sync_test.py`: replays a recorded list of commits (the real 11-19 ones: the Art Library approvals and rejects, the three `board: done`, clipgate2a, scene1fix1) against the pre-audit board and expects rows 1, 2, 5 and 6 of section 1 to come out right without any hand fix.

## 5. The page (`board.html`)

Phone layout: sections by what Tom does next, top to bottom. The wide layout keeps the lane grid.

| Section | Holds | On each card |
|---|---|---|
| YOUR MOVE | Tom's lane, open cards | Screen path, what it unblocks, buttons below |
| READY TO START | Claude, Up next | What it does in one line, model and effort on the card face, COPY PROMPT (START after board3) |
| RUNNING NOW | In progress, any lane, plus service runs | "Open chat" link, time since its last push, quiet flag |
| STUCK | Waiting cards and quiet cards | What it waits on, in words |
| CONVERSATIONS | The `sessions` list, last 3 days, newest push first | Title (card title or build line), state (running, waiting on you, finished), "Open chat" |
| DONE | Closed, last 3 days (was 7), closed by default | |

Top line: "Your move: N. Ready to start: N. Running: N. Stuck: N." Each number filters.

Tom's buttons say what he means. "Move to" is removed.

| Button | On | Does |
|---|---|---|
| I did this | Tom cards | Optional box "Anything Claude should know?". Card to Done, note saved; R1 does the rest |
| Claude takes this | Tom cards | One line "What do you want done?". The card becomes a Claude card in Up next with a standing prompt: "Read claude/handoff-rules.md. Tom handed you board card <id> with this note: <note>. Work out what is needed, rewrite the card, and do it. You have my full permission to access the repo." Model Claude Sonnet 5.5, effort medium |
| Not needed | Any card | One line why. Card retired (kept in the file) |
| Note | Any card | As now |

Service lanes show only when they hold a card. Theme chips stay.

## 6. Rules and docs to rewrite when board2 ships

- claude/handoff-rules.md, section "The board": the session's first push is `board: start <card id>` (R4), before any work. End of session: write the card's result and the next card; the job moves them. A session that finds a stale card retires it and says so (it does not wait for Tom to say so).
- Repo CLAUDE.md: the same, short.
- claude/next-addendum-board1.md: new fields, the job, the tests.
- claude/next.md (card c-nextclean, its own session): every item under ORDER NOW and "Waiting on Tom" becomes a card or is dropped; next.md keeps rules, tests, gotchas and the push steps. Each "Prompt:" line in it goes to its card.

## 7. Project instructions: paragraph for Tom to paste (replaces the bullet "Session handoff (standing rule)")

```
- Session handoff (standing rule): the board is the one list of open work (ADMIN > BOARD in the game; the file data/board.json in the repo trivituso81/adventures-of-tom). Whatever Tom's first message is, start by reading the board and claude/handoff-rules.md, and say in the first line which card the request updates, or that it is a new card, or no change. Make the session's first push the card's move to In progress with this conversation's link. End by writing the result and the next step onto the cards, then tell Tom in two lines what happens next and where: the card to tap, or the exact prompt to paste with its model and effort. claude/next.md holds rules, tests and push steps only. Tom gives every session in this Project standing permission to clone and push to trivituso81/adventures-of-tom.
```

The last sentence is meant to stop the push refusal that hit the audit chat. Whether the permission check accepts a standing sentence in Project instructions is not proven; card prompts keep "You have my full permission to access the repo." until it is.

## 8. board3: the START button (after board2)

Goal: Tom taps START on a Claude card. A conversation starts on the card's model and effort, its link lands on the card, the card moves to In progress. No copying, no model picking.

How (checked on 2026-11-19 against https://code.claude.com/docs/en/routines.md; the feature is a research preview):

| Fact from the docs | Used for |
|---|---|
| A cloud scheduled task (formerly "routine") has a saved prompt, repos, one model and one effort level | One task per model and effort pair in use. Start with ONE: Claude Sonnet 5.5, medium (8 of the 11 open Claude cards after the audit; the other 3 are Opus). Opus cards keep COPY PROMPT until a second task is added. Fable is never started automatically |
| It can have an API trigger: POST to its `/fire` address with a bearer token and a `text` field; the answer holds `claude_code_session_url` | START |
| The `text` arrives marked as untrusted data; the saved prompt must say to act on it | The saved prompt is fixed: "The routine-fire-payload holds one board card id. Read data/board.json on main, find that card, and carry out its prompt exactly as if Tom had pasted it. If the id is not an open Claude card, stop." Only the card id is sent; the prompt text comes from the repo |
| A run pushes to a `claude/` branch unless the prompt says another branch | The saved prompt says push to main, per the repo CLAUDE.md |
| 30 API starts an hour per task; runs use subscription usage like any session | No cost until Tom taps |

Flow: START commits `start: true` on the card (same save path as the other buttons) -> board-sync sees it, calls `/fire` with the task's address and token from repo secrets (`CLAUDE_TASK_SONNET_MEDIUM_URL`, `..._TOKEN`), writes the returned link to `chat.url`, moves the card to In progress. The token never reaches the phone.

Tom's one-time setup, written as one Tom card when board3 is ready (about 10 minutes at a computer): create the task at claude.ai/code/routines with the given prompt, the repo, Sonnet 5.5 and medium; add an API trigger; copy its address and token into two repo secrets (the same screen he used for ELEVENLABS_API_KEY).

Not proven, test each with one real card before anything else is built on it:
1. A started run is not in this Project, so it may not be able to read the claude/ Project docs or the Project instructions. If it cannot, stop: the fix is copying the docs a card needs into the repo, which is its own decision.
2. A started run can push to main without a person approving (the docs say the fired prompt "can't act as approval").
3. The GitHub job can reach the `/fire` address.

If any of the three fails twice: stop (stop-loss rule). Fallback, which needs none of the above: START copies the prompt, shows model and effort in large type, and opens the Project in Claude.

## 9. Quality bar (both builds)

Look at the page at 390 x 844, 951 x 648 and 1440 x 900. `tools/board_test.py` drives every button against the stub server. `board_sync_test.py` passes. Smoke passes, tags bumped, CHANGES entry, push. board2's closing reply tells Tom the two things that changed for him: he never moves a card again, and the Conversations strip is where every chat is listed.
