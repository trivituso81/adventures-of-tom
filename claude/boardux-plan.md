# Board redesign plan (boardux), 2026-11-20

Source: Tom, 2026-11-19 23:01: "Do a UX and visual design assessment of the kanban page as if it were a standalone kanban app dedicated to this project then create instructions and cards to execute".

Planning chat: https://claude.ai/code/session_01RXeukFvqFwkYY6QshQt5jc. It could not push (the repo was not opened to it), so the first build session files the cards in section 6 and copies this file into the repo at `claude/boardux-plan.md` (copydocs rule).

How the assessment was done: `board.html` and `data/board.json` at commit dc258c3 were opened in headless Chrome at 390 x 844 (a flat iPhone), 669 x 869 (Duo open, upright), 951 x 648 (Duo open, sideways) and 1440 x 900. Every number below was measured on those pages. The browser had no GitHub token, so the red "can only look" bar was showing; Tom's phone does not show it.

## 1. Verdict

The plumbing is strong and the page is doing its job as a list: plain titles, one action per card, his cards grouped by what he is asked to do, and Something is wrong turning straight into Claude work. As a product it has three real problems.

1. It does not tell the truth about status. "Running" and "Stuck" both show things that are neither.
2. It is two different apps depending on screen width, with different words for the same states.
3. Every card shouts at the same volume, so nothing reads as the one thing to do next.

## 2. Findings

Severity: H = misleads him or hides the next action. M = costs time on every visit. L = polish.

### 2.1 Status and structure

| # | Sev | What is on the page | Why it is a problem |
|---|---|---|---|
| F1 | H | "Running 10". Of the 10 cards, 7 say Shipped, Done or Built in their own first line, 1 says "Stuck: the plan file ... is not in the repo", and 4 show "last push unknown". | The count he reads first is wrong. The cause is the sync job being stopped (card c-syncfix1), and the page gives no sign that its data is behind. |
| F2 | H | "Stuck 8" in red. All 8 are cards queued behind another card ("Waits on: ..."). None is late: every card on the board is 0 days old. | Red plus the word Stuck says something is broken. A normal queue looks like an emergency, so a real stall would not stand out. |
| F3 | H | The header says "Updated 11:04 PM". That is when the page last fetched. The data itself was last synced at 7:45 PM. | He cannot tell fresh from stale. |
| F4 | H | Below 860 px wide the page is a status list (Your move, Ready to start, Running now, Stuck, Conversations, Done). At 860 px and wider it is lanes by columns (Up next, In progress, Waiting). Turning the open Duo from upright (669) to sideways (951) swaps one for the other. | Two layouts, two vocabularies, two orders (Conversations is last in one and first in the other). In the wide view "Your move" is no longer first, Tom's In progress column is always empty, and the external lanes are mostly empty boxes. |
| F5 | M | The default phone page is 5,688 px tall: about 7 screens for 25 open cards. With the token bar showing, no card of his is fully visible on the first screen. | The answer to "what needs me" should fit one screen. |
| F6 | M | Done holds 206 cards under "closed in the last 3 days" in one flat list. Opened with Conversations it makes the page 40,531 px tall. | Unusable as a record. No grouping by day, no search. |
| F7 | M | No search anywhere. Theme chips scroll sideways with no counts and no cue that more are off screen. | With 232 cards, finding one card means scrolling. |
| F8 | M | Conversations (37) is a closed list at the bottom on a phone. | His stated biggest problem is losing track of parallel chats. That view is the hardest one to reach. |
| F9 | M | Nothing shows what changed since his last visit. | He re-reads the whole board to spot the difference. |

### 2.2 Cards

| # | Sev | What is on the page | Why it is a problem |
|---|---|---|---|
| F10 | H | Titles average 79 characters, the longest is 140. Build names sit in the title: "(artgen1)", "(clipposesfix)". Fix cards read "Fix what you found on: Re-take Tom's line ..." over three lines. | Titles are for scanning. These are sentences with internal ids in them. |
| F11 | H | The body is cut at two lines, and his cards open with a precondition ("After the publish of build bannerhold1: RELOAD on the title, load a ..."). | The cut lands before the actual instruction. He must open every card to learn what to do. |
| F12 | M | One card can carry five pill styles (theme, ask, age, model, Starting) plus status lines in four colours (gold Unblocks, green When this ships, red quiet, grey Waits on). Every card shows "0d". | Too many signals of equal weight. "0d" says nothing. |
| F13 | M | Gold means: his cards' border, the ask pill, Copy prompt, counts, links, the Unblocks line, Back and Admin. Green means: All good, START, the model pill, the fix line. Red means: Something is wrong, the Stuck count, the Your move count, the token bar. | Colour carries no meaning when one colour means eight things. The red "3" on Your move reads as an error. |
| F14 | M | All good and Something is wrong are two full-colour buttons of equal size on every review card in the list. On a 390 px phone "Something is wrong" wraps to two lines and the pair is 88 px tall. All good closes the card in one tap and the page has no undo. | A stray thumb while scrolling closes a card. The buttons are a third of each card's height. |
| F15 | M | White text on the green (#2f9e63) is 3.39 to 1. The empty-column text is 3.66 to 1. Pills are 11 px. | Below the 4.5 to 1 reading standard, and small for a phone. |
| F16 | L | Nine theme colours as filled pastel pills. | The loudest thing on a card is its category, which is the least important fact. |

### 2.3 Card sheet (the panel that opens on a tap)

| # | Sev | What is on the page | Why it is a problem |
|---|---|---|---|
| F17 | H | On a Claude card the sheet is 861 px of content in a 758 px panel, and START and Copy prompt are at the bottom, off screen. | The main action is hidden under a scroll. |
| F18 | M | The sheet shows empty facts and internal words: "Started with: unknown", "No conversation yet", "0 days since last change", "Claude / Up next", "(row B: ...)". | Noise he has to read past. |
| F19 | M | Not needed, Note and Close share one row at the bottom with the same weight. There is no close control at the top. | The destructive choice sits beside the exit. |

### 2.4 Frame

| # | Sev | What is on the page | Why it is a problem |
|---|---|---|---|
| F20 | H | On a 390 px screen the page is 466 px wide. The header (Back, Board, Admin, Updated, "site copy", Music On, a volume slider) does not fit, so the whole page slides sideways. "Updated 11:04 PM" wraps to three lines. | A broken first impression on any flat phone and in Safari on the folded Duo (382). It only just fits the folded Duo home-screen app (466). |
| F21 | M | Music On and a volume slider sit in the board's header. "site copy" is a developer note. | Neither belongs on a board. |
| F22 | L | The page is titled "Board". No project name, and the counters are boxes inside a box. | It reads as an admin tab, not as its own app. |

### 2.5 What to keep

Plain-language titles and next steps. One action per card. His cards grouped by kind of ask. The Unblocks line. Something is wrong with a screenshot. START and Copy prompt. The one-minute refresh. 44 px touch targets. The dark palette.

## 3. The design

One rule decides everything: the page answers three questions in this order, on one screen. What needs me. What is Claude doing. What changed.

### 3.1 One layout at every width

Four views with the same names everywhere.

| View | Holds | Sections inside |
|---|---|---|
| For you | Tom's open cards | Grouped by ask (Play and report, Review pictures, and so on). Then "Coming back to you": his cards waiting on a Claude fix, closed by default, calm colours. |
| Claude | Claude's and the services' open cards | Start next (ready, with START or Copy prompt). Working now. Queued (waiting behind a named card). Needs attention (see 3.2). |
| Chats | Conversations of the last 3 days | Working, Waiting on you, Finished. Each row: title, state, last push, Open chat. |
| Shipped | Done cards | Grouped by day, newest first, 20 at a time with Show more. |

| Width | Layout |
|---|---|
| Under 860 px | One view at a time. A tab bar fixed to the bottom edge (above the safe area) with a count on For you and on Claude. The page opens on For you. |
| 860 px and wider | For you and Claude side by side as two columns, with a 32 px gutter centred on the screen (on the open Duo the fold runs down the middle at about x = 475, so no card may cross the centre line). Chats and Shipped stay as tabs above the columns. |

The lanes-by-columns grid is removed. A service lane (xAI, ElevenLabs, GitHub) appears only as a one-line row in Working now while it has a card.

### 3.2 Status words (page only; data columns keep their ids)

| Card in the data | Shown as | Colour |
|---|---|---|
| Tom, Up next | For you | accent |
| Tom, Waiting on Claude | Coming back to you | neutral |
| Claude, Up next, not blocked | Start next | neutral |
| Claude, In progress, or Up next with a session started | Working now | neutral |
| Claude, Waiting on another card or on Tom | Queued, with "After: <that card's title>" | neutral |
| Any open card with: no change for 1 day or more, a failed run, a session that ended without shipping, or In progress with no push for 6 hours | Needs attention | red, and only here |

"Stuck" is retired as a word. An ordinary queue is never red.

### 3.3 The top of the page

| Piece | Rule |
|---|---|
| Header | One row that never wraps: "Adventures of Tom" in small caps over "Board", then the sync light, then a menu button (three dots). The menu holds Game, Admin, and the GitHub token. Music controls and "site copy" are removed. |
| Sync light | Reads `synced_at` from the data. Green dot and "Synced 12 min ago" when recent. Amber dot and a one-line bar under the header when the newest commit on main is more than 15 minutes newer than `synced_at`, or the last board-sync run failed: "The board is behind. Sync stopped at 7:45 PM, so cards below may show as working after they shipped." |
| Since you last looked | The page stores the time of the last visit on the device. On return, one line under the header: "Since 6:04 PM: 3 shipped, 1 new for you, 2 started." Cards that changed since then carry a small dot. Tapping the line shows only those cards. It clears on the next visit. |
| Search | A search field under the header. It filters the cards of every view by title, next step and build name as he types. |
| Themes | One "Theme" button that opens a list of the nine themes with a count of open cards each, in place of the sideways chip row. |
| Token bar | Unchanged in wording, but shown inside the menu as a red dot on the menu button and as a blocking message only when he presses something that needs it. |

### 3.4 Card

Top to bottom, and nothing else.

| Line | Content | Rule |
|---|---|---|
| Kicker | A 10 px dot in the theme colour, the theme name, and for his cards the ask ("Play and report") | 12 px capitals, muted. Text, not filled pills. |
| Title | What happens, in plain words | 16 px bold, at most two lines on a 382 px screen. No build name. |
| Do | For his cards: the instruction, up to three lines. For Claude cards: one line saying what it builds. | 14 px. On his cards a "First: ..." line holds any precondition, separate from the instruction. A path such as ADMIN > BATTLE LAB is drawn as its own line in a monospace chip. |
| State | At most one line, picked in this order: Needs attention reason, After (what it waits on), Unblocks, Returns to you when fixed | 13 px. Red only for Needs attention. |
| Actions | His review cards: All good as an outline button and "Something is wrong" as a text button, one row, 48 px tall, never wrapping. Claude cards: START (solid) when it can start by itself, otherwise Copy prompt (solid), with "Sonnet 5.5, medium" as plain text beside it. | One solid button per card at most. |

Removed from the card: the age pill under 1 day (from 1 day it shows as "2 days quiet" in the State line), the "Starting..." pill (the card is simply in Working now), the model pill, the gold border on his cards (the view already says they are his).

All good shows a bar at the bottom for 8 seconds: "Marked all good. Undo". The save happens when the bar goes away.

### 3.5 Card sheet

| Piece | Rule |
|---|---|
| Top | Kicker, title, a close button (X) at the top right. Swiping the sheet down closes it. |
| Body order, his card | What to do (numbered when the next step has more than one action). Why it matters (what it unblocks). Chat. History (closed). |
| Body order, Claude card | What it builds. Before you paste (shown only when there is something to do). The prompt in a box cut to 6 lines with Show all. Model and effort on one line, with the reason behind a "Why" link. Chat. History (closed). |
| Action bar | Fixed to the bottom of the sheet, always visible: the card's one main action (All good and Something is wrong, or START, or Copy prompt). |
| Hidden | Any fact that is empty or unknown ("Started with: unknown", "No conversation yet"). Lane and column names. Row letters. |
| Not needed and Note | Inside a "More" button in the action bar, not beside Close. |

### 3.6 Colour and type

| Token | Value | Used for |
|---|---|---|
| Background | #14122b | page |
| Surface | #1d1a3d | sections, sheet |
| Card | #211d47 | cards |
| Line | #2c2852 | borders |
| Text | #f4f1ff | titles, body |
| Muted | #a9a3d6 | kickers, secondary text, empty states (6.7 to 1 on a card) |
| Accent (gold) | #ffd34d with #241b00 text | the one solid main action on a card, the active tab, the count on For you. Nothing else. |
| Good (green) | #1f7a4a with white text (5.3 to 1) | the Saved confirmation and the sync light only |
| Problem (red) | #b4414f fill with white text, #ff9aa5 as text | Needs attention, errors, "Something is wrong" text. Nothing else. |
| Theme dots | the nine current theme colours | the 10 px dot in the kicker only |

Links are white and underlined, not gold. Text sizes: 20 (view title), 16 (card title), 14 (body), 13 (state), 12 capitals (kicker). Nothing under 12. Every text and background pair is 4.5 to 1 or better.

### 3.7 Data rules (tools/board_check.py and the page's own card writer)

| Rule | Check |
|---|---|
| Title length | A new or changed open card's title is 60 characters or less. |
| No build name in a title | A title must not end in "(<tag>)" and must not contain the card's `tag`. The page shows the tag in the sheet's History area. |
| Fix card titles | The page writes "Fix: <first 50 characters of the tested card's title>" in place of "Fix what you found on: ...". |
| First line | An open Tom card whose next step starts with "After" must carry that part in a new optional field `first`, and `next` starts with the action. |

One clean-up pass rewrites the titles and next steps of the open cards to these rules, in the same push that turns the checks on. Done cards are left alone.

## 4. Acceptance checks (every phase runs the ones that apply before pushing)

A script, `tools/board_shots.py`, opens the board with the test data at 382 x 580, 466 x 657, 669 x 869, 951 x 648 and 1440 x 900 and saves a picture of each view and of an open sheet. The session looks at every picture before pushing, so obvious misses are caught before Tom's one test at the end.

| # | Check | How |
|---|---|---|
| A1 | No sideways scroll at any of the five sizes | page scroll width equals the window width |
| A2 | The header is one row at 382 | header height 56 px or less |
| A3 | At 466 x 657 the first screen of For you shows the count and at least one whole card of his | picture |
| A4 | With 25 open cards, For you is at most 3 screens tall at 466 x 657 | page height |
| A5 | No card or button crosses x = 475 at 951 x 648 | element boxes |
| A6 | Flipping between 669 and 951 keeps the same view names and the same card order inside each view | text of both pages |
| A7 | With today's data, no card that says Shipped, Done or Built is under Working now once the sync light is green; while sync is behind, the amber bar is showing | fixture with a stale `synced_at` |
| A8 | A queue of waiting cards shows no red | fixture |
| A9 | Every text and background pair is 4.5 to 1 or better | computed from the colour tokens |
| A10 | The sheet's main action is visible without scrolling on every card type at 382 x 580 | element box inside the window |
| A11 | All good can be undone for 8 seconds and saves once | board_test.py |
| A12 | Search finds an open card and a Done card by a word in the title | board_test.py |
| A13 | Everything the page did before still works: Something is wrong with a screenshot, START, Copy prompt, Generate all pictures, decide cards, I did this on setup cards, Note, Not needed, any Library link buttons on cards | the existing board_test.py and board_artgen_test.py pass unchanged in meaning |

## 5. Phases

One conversation per phase. Each fetches and rebases first, because other sessions change `board.html`. Each keeps every feature in A13.

| Phase | Build name | Scope | Sections | Fixes |
|---|---|---|---|---|
| 1 | boardux1 | The frame and the truth: header, menu, colour and type tokens applied to what exists, sync light and behind bar, new status words with Queued split from Needs attention, Since you last looked, `tools/board_shots.py`. No card or layout redesign yet. | 3.2, 3.3 (not search or themes), 3.6, checks A1, A2, A7, A8, A9, A13 | F1, F2, F3, F13 (in part), F15, F20, F21, F22, F9 |
| 2 | boardux2 | Cards and the sheet: card anatomy, buttons, undo, sheet order and fixed action bar, the data rules and the clean-up of open cards. | 3.4, 3.5, 3.7, checks A10, A11, A13 | F10 to F19 |
| 3 | boardux3 | Views and wide layout: the four views, bottom tab bar, two columns clear of the fold, Shipped by day, search, theme list, Chats. Removes the lanes grid. | 3.1, 3.3 (search, themes), checks A1 to A6, A12, A13 | F4 to F8 |
| Tom | (card t-boarduxtry) | He uses the finished board on his phone, folded and open. | | |

Tom tests once, after phase 3 (his rule of 2026-11-18: build to a milestone before he tests).

Model choice: phases 1 and 3 are Sonnet 5.5, medium (row B: the rules, tokens and checks are written here and tests catch mistakes). Phase 2 is Opus 5.5, medium (row D: how a card reads is judged by taste, and a miss costs him review time).

## 6. Cards to file

The cards are in the Project file `claude/boardux-cards.json`, already checked with `tools/board_check.py` against the board at dc258c3. The phase 1 session adds them to `data/board.json` in its first push (`board: start c-boardux1`), re-reading the board first and merging. The drafts leave out two things for Tom to decide when they are filed: auto-start on any card, and the closing permission sentence the handoff rules put at the end of a prompt.

| Card | Lane, column | Title |
|---|---|---|
| c-boardux1 | Claude, Up next | Board redesign 1: an honest header and status |
| c-boardux2 | Claude, Waiting on c-boardux1 | Board redesign 2: cards and the card panel |
| c-boardux3 | Claude, Waiting on c-boardux2 | Board redesign 3: four views, search and the wide layout |
| t-boarduxtry | Tom, Waiting on c-boardux3 | Try the redesigned board on your phone |

## Built

(Each phase writes what it built here, and anything that differs from this plan.)
