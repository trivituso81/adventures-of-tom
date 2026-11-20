# board3 plan (2026-11-19 16:25; PLAN, not built). Adds to claude/board2-plan.md section 8, which still holds for the START button.

Source: Tom 2026-11-19 16:25, after board2 shipped: (1) his cards should be sorted by what he is asked to do ("Am I supposed to test something? review art? review sound clips? make a decision? Whatever the exhaustive set of things are"); (2) "I don't get how ... the feedback gets back to you from the card ... should I respond in the original thread? Should I create a new thread?"; (3) "when you're done working on something, I would expect it to no longer be in progress and then move to my queue".

Everything below is a decision. Build in this order; parts A to C need nothing from Tom and ship even if part D stops.

## A. Ask types on Tom's cards

New required field `ask` on every Tom card. The YOUR MOVE section is grouped by it, in this order, with a count per group; the top line reads "Your move: N (2 play, 1 pictures, ...)".

| `ask` | Shown as | Tom does | Where his answer is recorded |
|---|---|---|---|
| play | PLAY AND REPORT | Plays a build on the phone | REPORT tab for anything wrong, then "I did this" |
| pictures | REVIEW PICTURES | Generate, Approve or Reject in the Art Library | The Library (the card closes itself, rule R2) |
| animations | REVIEW ANIMATIONS | PLAY ALL and REDO in a Battle Lab review | The REDO notes (new `done_when {"clips_reviewed":"Chapter N"}`: every clip in the group approved or sent back) |
| voice | VOICE | Records, listens to or sends takes in the Voice Library | The takes branch or the export (rule R7 makes the Claude card) |
| script | READ A SCRIPT | Reads a chapter or lines in the Script Review page or Script Editor | Note on the card |
| decide | DECIDE | Picks one answer | Buttons on the card (below) |
| setup | SET UP | A setting, token, secret or paste only he can do | "I did this" |

`board_check.py`: a Tom card without a valid `ask` fails. Give every open Tom card one in the same push. One ask per card, as now.

DECIDE cards: field `choices` (2 to 4 short labels, Claude's recommendation first and marked). The card shows one button per choice plus "Something else" (a text box). The tap saves `answer`, closes the card, and R1 copies the answer to the cards it unblocks. A decide card must say in one line what each choice leads to.

## B. Feedback travels on the card (the rule, and what the page says)

- Tom never goes back to the conversation that made a card. Everything he wants Claude to know goes on the card ("I did this" note, a choice, or the tool the card points to). Then the next conversation is always a NEW one, started from the card his action unblocked.
- The page says so: after "I did this" or a choice, the confirmation reads "Saved. Next: <title of the unblocked card>" with that card's Copy prompt (START after part D) right there, so the hand-back is one screen, not a hunt.
- Every Claude card's prompt gets one fixed line appended by the page when copied or started: "Board card <id>. Read its history first: my notes and answers are there." Sessions read `note`, `answer` and the history of the card and of the Tom cards that blocked it before doing anything (add to claude/handoff-rules.md and repo CLAUDE.md).
- "I did this" on a Tom card that blocks nothing and has a non-empty note: the job creates a Claude card "Handle Tom's note on <title>" (Up next, standing prompt, Sonnet 5.5 medium) so a note is never left with no reader.
- Every Tom card must block a Claude card, or be marked `fyi: true`. `board_check.py` fails otherwise. (This is what makes "my part is done" always land somewhere.)

## C. "Done working" always lands in Tom's queue

- `board_check.py --push <tag>`: the card being shipped must have `after` set to either a Tom card id (created in the same push, with its `ask`) or the text `nothing for Tom` plus the next Claude card id or `end`. A build cannot be pushed without saying what happens next.
- The page auto-reloads the live file every 60 seconds while open and on return to the tab, and shows "Updated <time>".
- Quiet flag after 6 hours, not 24.
- A session that is working pushes `board: start <id>` first (already the rule); a session that ends without shipping writes one history line saying why and moves the card to Stuck with what it waits on.

## D. START and auto-start (claude/board2-plan.md section 8, plus this)

- START as planned there.
- Auto-start: a Claude card may carry `auto: true`. When R1 unblocks it because Tom tapped "I did this" or a choice, the job starts it at once (same `/fire` call) instead of waiting for a tap. Set `auto` only on cards that are row B work on the task's model (Sonnet 5.5 medium). This is the "acting on the card goes straight back to Claude" path.
- The three unproven points and the fallback in section 8 apply unchanged. If START cannot be made to work, parts A to C still give: note on the card, one-screen hand-back, new conversation from the card.

## Quality bar

As board2: page at 390 x 844, 951 x 648, 1440 x 900; `board_test.py` drives the choice buttons and the confirmation screen against the stub; `board_sync_test.py` gets cases for clips_reviewed, the note card, and auto-start (stubbed fire); smoke, tags, CHANGES, push.
