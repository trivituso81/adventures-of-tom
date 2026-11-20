# board2 (2026-11-19, tag board2): the board that keeps itself current

Built from claude/board2-plan.md sections 2 to 6. Facts for any session that touches the board.

| Piece | Where |
|---|---|
| Job | `tools/board_sync.py` and `.github/workflows/board-sync.yml`. Runs on every push to main and on the start and end of clip-gen, voice-gen, clip-gate, art-bake. Commits data/board.json only when a card moved, message `board-sync: <what moved>` (made with the Actions token, so it starts no other workflow). First run only starts tracking (`synced` commit, `synced_at`). |
| Rules | R1 unblock (a Waiting card whose blockers are all Done goes to Up next; Tom's `note` is copied into its history). R2 `done_when {"art_approved":[ids]}` on a Tom card (Done when all approved, or all decided with some rejected). R3 a `## <tag> (date): ...` heading in docs/CHANGES.md closes the card with that `tag`; tag plus one letter moves it to In progress; a heading with no card adds a Done card `b-<tag>`. R4 a commit subject `board: start <card id>` moves it to In progress and sets `chat.url` from `Claude-Session:`. R5 `sessions` list (url, title, first, last, tags, cards; kept 14 days). R6 service runs: card `svc-<name>` in the service lane while running, Waiting on Claude with a prompt when it fails, removed on success, `needs-human` adds a Tom card. R7 new files on branch `inbox` (reports) or `takes` become Claude cards; a report gone from the inbox closes its card. R8 In progress for 24 hours with no push from its conversation: `quiet: true`. |
| New fields | card: `tag` (required on Claude cards not Done), `done_when`, `note`, `quiet`, `retired`, `service`, `run`, `count`. Top level: `sessions`, `synced`, `synced_at`, `seen`. |
| Checks | `tools/board_check.py`: a Claude card not Done has `tag` and a full prompt with no `<` blank; an open Tom card that blocks an open card names it in `next`; `--push <tag>` (called by `bump_tags.py`, not in Actions) stops a build that is on no card (tags starting `board` are exempt). |
| Tests | `python3 tools/board_sync_test.py` (replays the real 11-19 commits in `tools/board_sync_fixtures/` against the pre-audit board; in smoke). `python3 tools/board_test.py /tmp/board` (page at 390x844, 951x648, 1440x900 against the stub with a test board via `STUB_BOARD`). |
| Page | `board.html`: top line counts (Your move, Ready to start, Running, Stuck) that filter; sections YOUR MOVE, READY TO START (model and effort on the card, Copy prompt), RUNNING NOW (Open chat, last push), STUCK (waiting or quiet), CONVERSATIONS (last 3 days), DONE (3 days, closed). 860 px and wider keep the lane grid (service lanes only when they hold a card) with the Conversations strip on top. Buttons: I did this (optional note, card Done), Claude takes this (becomes a Claude card in Up next with a standing prompt, Sonnet 5.5 medium), Not needed (reason, card retired and kept in the file), Note. "Move to" and plain Done are gone. |
| publish.yml | ignores pushes that change only data/board.json. |

Not built here (board3): the START button. Nothing needs Tom's setup for board2: the workflow uses no secret.

Known: the first board-sync run in GitHub had not been seen when this was written (Actions cannot be run from a session). If it fails, the run log says why; the pure rules are covered by board_sync_test.py. Check Actions > board-sync after the push.
