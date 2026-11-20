# board4 (2026-11-19, pushed as board4): facts for sessions

Source: Tom 2026-11-19 18:04, on "Look at the chapter 1 pictures in the game" (t-cutpolish4b): he found several issues and could not tell what to do next. The pencil tab, come back, "I did this" then "Done" flow was confusing, and an fyi card felt like nothing waited on the result. He wants one tap from the card to report, and the report to become Claude work.

Design call: the board page itself writes the fix card when Tom sends a problem (no job round trip), and the tested card waits on that fix card, so R1 hands it back to Tom when the fix ships.

## What the page does (board.html)
| Piece | Fact |
|---|---|
| Which cards | Open Tom cards with ask play, pictures, animations, voice or script. Setup and decide cards are unchanged. |
| Buttons | All good and Something is wrong, on the card in the list and near the top of its sheet. I did this and Claude takes this are gone from these cards. |
| All good | One tap: card Done, history "Tom: all good.", the Saved screen shows what it unblocked. No note, so R10 does not fire. |
| Something is wrong | Form: what you saw (required), Add a screenshot (optional, shrunk to 1280 px JPEG), Send to Claude. |
| Screenshot | Branch inbox, `board-shots/<card id>-<stamp>.jpg` (not `reports/`, so R7's backlog card does not count it). |
| Fix card | `c-fix-<card>` with tag `fix-<card>`, `fix: true`, `reports` [{at, card, title, ask, words, shot, asked}], blocks the tested card, `after` = the tested card. A second problem in the same theme and model joins a fix card that is still Up next and not started. |
| Model | play: Sonnet 5.5 medium (row C), `auto` and `start` set, so R9 starts it. pictures, animations, voice, script: Opus 5.5 medium (row D), prompt shown to copy. |
| Tested card | Column Waiting, `waiting_on: claude`. Not in YOUR MOVE, not counted as Stuck; the fix card shows "When this ships, you check again: ...". When the fix build ships, R1 puts it back in Tom's Up next. |
| After Send | One sentence: starts by itself, or paste on the named model and effort, or added to the fix not started yet. |

## Rules for a fix session
1. First push `board: start <fix id>`. Read the fix card's `reports` and the tested card's history.
2. Screenshot: `git fetch --depth=1 origin inbox`, `git show origin/inbox:board-shots/...` into /tmp, look at it.
3. Run `python3 tools/reports.py list`: pencil reports filed since the first report's time about the same thing belong to the fix; mark them done.
4. Before pushing: rewrite the tested card's `next` to exactly what to look at again; keep `after` on it; CHANGES heading `## fix-<card>` quotes his words.
5. The generated prompt names repo files only. A START run cannot read the Project's claude/ docs (card c-copydocs covers copying them into the repo).

## R10 (note card)
Code unchanged. Review cards now end with All good (no note) or Something is wrong (fix card), so R10 fires only for setup cards finished with I did this and a note.

## Checks and tests
- board_check: a Tom card in Waiting that an open Claude card blocks passes the fyi rule.
- board_test.py: All good, I did this on a setup card, Something is wrong with a screenshot (Opus, copy), merge into the same fix, play report (Sonnet, auto-start), board_check on what the page wrote.
- board_sync_test.py: the tested card waits while the fix is open and returns to Up next when `## fix-...` ships.
