# board1 (2026-11-19, main a19ec9f): ADMIN > BOARD

Facts for any session that touches the board.

| Piece | Where |
|---|---|
| Page | `board.html` (repo root), ADMIN > BOARD on the Welcome screen (`openBoard` in engine/splash.js) |
| Data | `data/board.json`: `themes` (the nine), `columns` (up, prog, wait, done), `lanes` (id, name, covers), `cards` |
| Card fields | id, title, theme, lane, col, next, blocks (card ids), waiting_on (lane id, required in col wait), changed (YYYY-MM-DD, drives the age), created, done (date, required in col done), chat {url, opening}, prompt {what, before[], model, effort, text} (Claude-lane cards), history [{d,t}] |
| Check | `python3 tools/board_check.py` (in smoke) |
| Test | `python3 tools/board_test.py /tmp/board` (390x844, 951x648, 1440x900 screenshots; Note, Move and Done against `tools/art-library/stub.py`, which now seeds data/board.json) |
| Saving from the phone | Done, Move to and Note read the latest file from GitHub, change only that card, write it back (token `aot-gh-token` from ART LIBRARY > Setup). No token: the page says so. |

Rules as built: a card whose `changed` is 3 days old shows amber, 7 days red. Done cards drop off the page 7 days after `done` but stay in the file. A Tom card that blocks an open card shows "Blocking: <title>". A new external dependency is a new entry in `lanes`, no code change. Empty lanes show "Nothing waiting".

First fill: 15 Tom cards, 6 Claude cards, board1 done. Not carried over because nothing waits on anyone: the b3s5a to b3s7 "nothing asked until milestone A" note and the Voices (calib3) "nothing asked" note. A Gemini audit batch and the voice conversation (voicegen2 was done by another session) have no Claude card because they wait on input only Tom can give: add one when he sends it.

Known: ch2 build's model and effort (Sonnet 5.5, medium) were worked out by the handoff-rules logic, next.md did not give them. next.md itself was NOT edited by board1 (file too large to rewrite safely in this session); its "Waiting on Tom" section is now superseded by the board, and the cleanup session should replace it with a pointer.
