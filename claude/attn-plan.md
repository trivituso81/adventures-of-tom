# Needs attention: automatic rescue (attn1), plan of 2026-11-20

Source: Tom, 2026-11-20 06:59: "Propose an automated solution for the Needs Attention section on the board how can we can them back to me or fix them without them sitting idle".

Planning chat: https://claude.ai/code/session_01RXeukEakjfNfU7vYXC5JcQ. It could read the repo (commit 898f261) but was not given push access, so the build session files the card `c-attn1` in its first push and copies this file into the repo (copydocs rule).

## 1. What is there today

Needs attention is only a label. `board.html` (function `attnWhy`) paints a Claude card red; nothing acts on it. Three cards at 898f261, all the same kind: a conversation claimed the card, pushed once, and stopped.

| Card | Flag | What actually happened |
|---|---|---|
| c-reports-2, Fix the report backlog (7 open) | Quiet 7 h | Its session pushed for 16 seconds at 07:45 UTC and stopped. 7 reports still open. |
| c-gatezero, Install the Gate Zero pictures | Quiet 6 h | Its session found the pictures do not match the plate and stopped. The card really waits on new pictures, which is a Tom step, but it still sits in Working now. |
| c-adminicons1, Own icons for BOARD and ADMIN | Quiet 7 h | Its session claimed the card and never pushed again. |

Next to turn red (tomorrow, by the 1 day rule): c-fix-artgen2look and c-b3s10 if their pasted conversations never push `board: start`.

## 2. The rule

Needs attention is never a parking place. Every flagged card gets one automatic move within the hour, and ends in exactly one of three places: Shipped, For you (one action, in plain words), or Start next. Red stays on the page only while that move is running.

## 3. What happens per reason

Free = done by the board-sync job (`tools/board_sync.py`), no AI, no credits. Rescue = one Claude session started by the job on the existing "Board START" scheduled task (Sonnet 5.5, medium).

| Reason on the card | Automatic move | Cost |
|---|---|---|
| Waits on a card that is already finished | Move to Up next. If the card has `auto`, start it. | Free |
| Note starts with Shipped, Done or Built but the card is open | If `## <tag>` is in docs/CHANGES.md, close it. If not, rescue. | Free, else rescue |
| START failed | Try START once more on the next run. Second failure: a For you card "Start this by hand" with Copy prompt. | Free |
| A service run failed (xAI, ElevenLabs, GitHub) | Re-run the job once. Second failure: rescue. Out of credit: a For you card naming the service. | Free, else rescue |
| Quiet (6 hours, or a day with no chat link) | Rescue. | Rescue |
| A session ended without shipping | Rescue. | Rescue |

## 4. The rescue session

The job sets `rescue: {at, n}` on the card and fires the START task with the card id. The task's standing prompt gains one branch: when the card has `rescue`, do not run the card's prompt from the top. Instead:

1. Read the card's history, its conversation's commits since `board: start`, and the tests.
2. Pick the one outcome that fits and write it on the card:

| Outcome | When | What the session does |
|---|---|---|
| Finish it | The work is half done and the steps are known (row B) | Finishes, tests, pushes. The card closes the usual way. |
| Back to you | It is blocked on something only Tom can give: a picture, a take, a decision, credit | Makes a For you card with one action and the exact screen path, sets this card to Queued behind it. |
| Start next | The work is taste work (row D, Opus) or too big for a rescue | Rewrites the prompt with what the stopped session learned, moves the card to Up next. |
| Retire | The work already shipped under another build, or is no longer wanted | Done, with a history line saying why. |

3. A rescue never ends with the card still in Working now.

## 5. Limits (credits and the stop-loss rule)

| Limit | Value | Why |
|---|---|---|
| Rescues per card | 1 | Stop-loss rule: a second stall is not retried. The job makes a For you card "Stuck twice: <title>" saying in two lines what was tried and what the rescue recommends, with Start again and Not needed. |
| Rescues per day | 4 | Caps Sonnet use if many cards stall at once. The rest wait for the next day, oldest first. |
| Model | Sonnet 5.5, medium only | The only START task that exists. A rescue triages; it does not do Opus or Fable work. |
| Quiet time for cards started by START | 2 hours (others stay 6) | A START session runs unattended and finishes in under an hour, so 2 quiet hours means it stopped. A pasted conversation may be Tom mid-chat. |
| No rescue while | A blocker is open, the card is in the backlog, or Tom wrote a note on it in the last 6 hours | Tom is already on it. |

## 6. Stopping cards from getting there

Two of today's three flags come from a session that ended without saying where the card goes. Add to claude/handoff-rules.md and the repo CLAUDE.md: a session that stops without shipping must, in its last push, either move the card to Queued behind a Tom card it creates, or write a history line containing "ended without shipping" with the reason. `tools/board_check.py` cannot see this, so the rescue is the backstop.

## 7. The page

| Piece | Change |
|---|---|
| Needs attention card, state line | "Rescue started 7:10 AM. Open chat" while it runs, in place of the red reason. |
| Needs attention count | Counts only cards with no rescue running. With the rules above it should read 0 most of the time. |
| For you | New ask group "Unstick" for "Stuck twice" and "Start this by hand" cards. |
| Since you last looked | Adds "N rescued". |

## 8. Build

Build name `attn1`, card `c-attn1` (Claude lane, theme Project Ops, title "Needs attention fixes itself or comes back to you"). One session, Sonnet 5.5, medium (row B: the rules are written here and tests catch mistakes).

Files: `tools/board_sync.py` (rule R10: the table in section 3, the limits in section 5), `tools/board_sync_test.py` (one fixture per reason, the two limits, the three cards of section 1), `board.html` (section 7), `tools/board_test.py`, claude/handoff-rules.md and CLAUDE.md (section 6), docs/CHANGES.md.

One step outside the repo: the standing prompt of the "Board START" scheduled task needs the rescue branch of section 4. The build session edits it if it has the scheduled-task tools; if not, it gives Tom the new text to paste into the task's settings as a For you card.

Acceptance:

| # | Check |
|---|---|
| R1 | Each reason in section 3 produces its move in a replayed fixture, with no AI call for the free rows. |
| R2 | A card rescued once and stalled again produces one "Stuck twice" For you card and no second fire. |
| R3 | A fifth stall in one day is not fired until the next day. |
| R4 | A card in the backlog, or with an open blocker, or with a Tom note under 6 hours old, is never fired. |
| R5 | Replaying today's board fires c-reports-2, c-gatezero and c-adminicons1 once each, and nothing else. |
| R6 | A queue of waiting cards still shows no red (A8 of the board redesign). |
