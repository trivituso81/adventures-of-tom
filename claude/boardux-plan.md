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

### boardux1 (2026-11-20): the frame and the truth

Sections 3.2, 3.3 (not search or themes) and 3.6, checks A1, A2, A7, A8, A9, A13. Files: `board.html`, `tools/board_shots.py` (new), `tools/board_ux1_test.py` (new), `tools/board_test.py` (new words, same checks), `tools/art-library/stub.py` (two GitHub endpoints for the sync light).

| Built | Notes |
|---|---|
| Header | One row at 382 px (56 px tall): "Adventures of Tom" over "Board", the sync light, a three dot menu. The menu holds Game, Admin, the GitHub token box and a "Data: live / site copy" line. Music controls and "site copy" are gone from the header (the admin-music script is no longer loaded on this page). A red dot on the menu button means no token; the old red token bar is gone. |
| Sync light | Green dot and "Synced 12 min ago", or an amber dot, "Sync behind" and the one-line bar under the header. The page asks GitHub for the newest commit on main and the board-sync runs (every 5 minutes at most, 2 calls). Behind = the last run failed, or the newest commit is more than 15 minutes newer than the last good sync. |
| Status words | FOR YOU, COMING BACK TO YOU (closed), START NEXT, WORKING NOW, QUEUED (each with "After: <card>"), NEEDS ATTENTION (red, only there). "Stuck" is gone. The wide lanes view keeps its columns but its cards use the same words. |
| Since you last looked | The device keeps the board as it stood when you left (column and history length per card). On return one line says what changed ("Since 8:43 PM: 1 shipped, 1 new for you, 1 started."); changed cards carry a gold dot; tapping the line shows only those cards. First visit shows no line. |
| Colour and type | The tokens of 3.6 as CSS variables. Gold only for the one solid action, the active chip or count and the For you count. Green is #1f7a4a (5.3 to 1). Links are white and underlined. Red only for Needs attention, errors and Something is wrong. Nothing under 12 px. A9 is checked by scanning every drawn text and background pair in the browser (phone, wide, menu open, sheet open, behind bar showing). |
| `tools/board_shots.py` | The five sizes, a picture of the page, of an open sheet and (at 382) of the open menu. |

Differences from the plan, and why:

1. **Needs attention and "no change for 1 day".** The plan says any open card with no change for a day. Taken literally every card queued behind a long build, or waiting for Tom to press START, turns red the next morning, which breaks the plan's own rule that an ordinary queue is never red. Built: the day rule applies to Working now cards only (In progress with no push for 6 hours when a conversation is linked, a day when none is). Other triggers as planned (says Shipped, Done or Built while open; failed run; START failed; session ended without shipping), plus one: a card that waits on a card that is already finished. Tom's own cards stay under For you and keep their age pill.
2. **Sync light reference time.** The plan compares the newest commit with `synced_at`. The sync job only writes `synced_at` when it moves a card, so a push that moves nothing would turn the light amber 15 minutes later for no reason. Built: the reference is the later of `synced_at` and the last good board-sync run, and a commit younger than 5 minutes is not judged yet.
3. **Start next** counts only Claude cards in Up next that nothing waits on (a blocked Up next card is Queued, as the table in 3.2 says). The count buttons are still the same boxes (F22 is left for phase 3); there are five now.
4. **Extra tokens**: `--btn` (#3a3566, neutral buttons and borders), `--well` (#0f0d24, inputs) and `--amber` (the behind light) next to the plan's tokens.
5. Card age pills are now neutral grey (no amber or red) until phase 2 removes them; the card layout itself is untouched.

Tests: `python3 tools/board_test.py /tmp/board`, `python3 tools/board_artgen_test.py`, `python3 tools/board_ux1_test.py`, `python3 tools/board_shots.py /tmp/boardshots`, `python3 tools/board_sync_test.py`. board_test.py kept every check and changed only the words (For you, Start next, Working now, Queued, Needs attention) and the token check (menu and red dot instead of the red bar).

### boardux2 (2026-11-20): cards and the card panel

Sections 3.4, 3.5 and 3.7, checks A10, A11, A13. Files: `board.html`, `tools/board_check.py` (data rules), `tools/board_sync.py` (the note card's title), `tools/board_ux2_test.py` (new: A10 and the card and sheet rules), `tools/board_shots.py` (one open sheet per section at 382), `tools/board_test.py` (A11, new selectors, same checks), `tools/board_backlog_test.py` (Send to backlog is behind More), `data/board.json` (the clean-up).

| Built | Notes |
|---|---|
| Card | Kicker (10 px theme dot, theme, and on his cards the ask) as muted 12 px capitals; title 16 px bold, at most two lines; on his cards a "First: ..." line, then the instruction (three lines); on Claude cards what it builds (two lines); one state line; one row of actions. Gone: the theme, age, model, ask and "Starting..." pills, the gold border. |
| State line | One line, in the plan's order: Needs attention reason (red, the only red), After: <card>, Unblocks: <card>, Returns to you when fixed: <card>. Working now cards show "Open chat · last push 20 min ago". His cards add "N days quiet" from one day on. |
| Actions | His review cards: All good (outline) and Something is wrong (red text button), one row, 48 px, never wrapping. Claude cards: START (solid) with "Copy prompt" as a text button, or Copy prompt (solid; outline when the card is queued), with "Sonnet 5.5, medium" as plain text. Pictures cards: Generate all is the solid one. Backlog cards (backlog1): Add to <lane>'s to-do. |
| Undo | All good takes the card off the list and shows "Marked all good. Undo" at the bottom for 8 seconds; the save happens once, when the bar goes away (at once if he taps All good on another card or leaves the page). Then the hand-back screen opens when the card unblocks something, otherwise a "Saved" toast. Undo puts the card back and saves nothing. |
| Sheet | Three parts: the top (kicker, title, close X; swipe the top down to close; Escape closes), a body that scrolls, an action bar fixed to the bottom. His card: What to do (the screen path on its own line, numbered steps when the next step has 1) 2) 3)), links, pictures, Why it matters, Chat, History. Claude card: What it builds, Where it stands, Before you paste (only when there is something to do), the prompt cut to 6 lines with Show all, model and effort on one line with Why, Chat, History. History holds the build name. Not shown: empty chat, "Started with: unknown", lane and column names, row letters, "Nothing to do first". |
| Action bar | All good and Something is wrong, I did this and Claude takes this, START and Copy prompt, or Copy prompt with the model; decide cards have their choices there. More holds Send to backlog, Not needed and Note. |
| Data rules | `board_check.py`: a new or changed open title is 60 characters or less and holds no build name; an open Tom card's new or changed next step does not start with "After" (the precondition goes in `first`). The page writes fix cards as "Fix: <tested title, cut at a word within 50 characters>"; board-sync writes "Your note on: <46 characters>". |
| Clean-up | 14 open titles shortened (12 rewritten, 2 fix cards renamed "Fix: ..."; build names out). t-boarduxtry: precondition moved to `first`. t-heistart, t-reportcheck, t-cardlinks1try: precondition dropped because it already happened (c-heistart shipped, builds reports-2026-11-19c and cardlinks1 are live). The four optional checks and the reload step on t-ch1starving moved to `first`. Next steps that named an old title follow the new one. Done cards untouched. |

Differences from the plan, and why:

1. **Path chips.** On a card the path is a chip inside the text, not its own line: the instruction is cut at three lines, and a block line inside it breaks the cut. In the sheet the first path is shown on its own line above the instruction and stays a chip in the text, because a block in the middle of a sentence left lines starting with a comma.
2. **Claude cards' Do line is two lines, not one.** One line on a 382 px screen cut most "what it builds" texts after six words.
3. **Working now cards** have none of the plan's four states, so their state line is "Open chat · last push". Service cards show none.
4. **START cards keep Copy prompt** as a text button next to START (one solid button still), so a card START can run can also be pasted by hand. A queued card's Copy prompt is an outline: it is not ready.
5. **In the sheet All good is solid gold** (it is a deliberate place); on the list it is an outline. On a pictures card Generate all is the gold one and All good stays an outline.
6. **Decide cards** keep their choices in the action bar: the choice is the main action.
7. **Extra sheet section "Where it stands"** (the card's current next step, "Result" on a Done card) on Claude cards: what it builds and where it is now are different facts. A Done card's prompt is not shown.
8. **Send to backlog** (backlog1, shipped while this was built) sits behind More with Not needed and Note: two taps instead of one.
9. **Data rules only bite on new or changed titles and next steps**, judged against origin/main: the sync job writes cards with long titles, and other sessions' checks must not fail on them. Without origin/main (a file path given) every open card is checked. The build-name rule applies to tags that look like build names (a digit or a hyphen) or to any tag in brackets, so "Casa Alvarez" (tag alvarez) passes.
10. **Fix card titles are cut at a word** within 50 characters, not mid-word.
11. **Old Done cards' "(tag)" endings** are hidden on the page; the data is left alone.
12. The toast now sits above the action bar and the undo bar.

Tests: `python3 tools/board_ux2_test.py`, `python3 tools/board_test.py /tmp/board`, `python3 tools/board_artgen_test.py`, `python3 tools/board_backlog_test.py`, `python3 tools/board_ux1_test.py`, `python3 tools/board_shots.py /tmp/boardshots`, `python3 tools/board_sync_test.py`, `python3 tools/board_check.py`.

### boardux3 (2026-11-20): four views, search and the wide layout

Sections 3.1 and 3.3 (search, themes), checks A1 to A6, A12, A13. Files: `board.html`, `tools/board_shots.py` (A1 to A6 on every view at the five sizes), `tools/board_test.py` (A12, tabs, two columns, Show more), `tools/board_backlog_test.py`, `tools/board_ux1_test.py` (A9 on every view), `tools/board_ux2_test.py`, `data/board.json` (card t-boarduxtry's next step).

| Built | Notes |
|---|---|
| Views | `#views` holds `#vFor`, `#vClaude`, `#vChats`, `#vShipped`; the tab bar `#tabs` (`data-view`) picks one. The last view is remembered on the device (the page opens on For you on a first visit). For you holds FOR YOU and COMING BACK TO YOU. Claude holds START NEXT, WORKING NOW, QUEUED, NEEDS ATTENTION (service runs sit in WORKING NOW). |
| Wide | From 860 px, For you and Claude are two equal columns with a 32 px gutter, so at 951 px the fold at x = 475 is inside the gutter. The tab bar moves to the top; For you and Claude both show as selected. Chats and Shipped replace the columns. |
| Chats | Three sections open by default: WORKING, WAITING ON YOU, FINISHED (last 3 days, newest push first). |
| Shipped | All finished cards (not retired) grouped by day (Today, Yesterday, weekday and date), newest first, 20 at a time with Show more. BACKLOG is the last section, closed. |
| Search and Theme | `#q` filters open, Done and parked cards and conversations by title, next step, build name, id and theme; the Theme button lists the themes with counts of open cards. |
| Since you last looked | Tapping the line shows every changed card across all views (the tabs are bypassed until the second tap). |
| Tab counts | For you and Claude carry a count; `#tabs[data-text]` holds the full line the test reads. The five count boxes are gone (F22). |

Differences from the plan, and why:

1. **BACKLOG lives at the bottom of Shipped.** The plan does not place it; it is archive-like and the lanes grid it used to follow is gone.
2. **Plan 3.1 keeps Needs attention last in Claude**, so the tab count is the whole Claude view's open cards, not just attention. The red stays only inside Needs attention.
3. **The page remembers the last tab** on the device (not in the plan).
4. **The Project copy of this file is not updated here** (a scheduled run has no Project access); copy this section there by hand when convenient.

Test changes: board_test.py and board_backlog_test.py did not count parked cards as open before; they do now. board_test.py uses its own hand-back fixture card, because the live board's first Claude card in Up next changes every day. `tools/cardlinks_test.py` fails once in a while on "art unknown id shows no message" with or without this build (it did before it too).
