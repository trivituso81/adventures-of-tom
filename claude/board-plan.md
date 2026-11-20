# Status board (kanban) plan (2026-11-19, PLAN, not built; build tag board1)

Source: Tom 2026-11-19 10:05: "i would like a kanban style board that i can refer to at anytime, im even glad to have this be in the Admin part of the screen, with lanes for you, me, and each external dependencies. the purpose is to give me greater clarity on all the different items in flux so i can understand the status and ensure im not a blocker or that a thread dropped"

Everything below is a decision unless marked otherwise. The build session does not reopen these; it builds them.

## 1. Where it lives

| Piece | Decision | Why |
|---|---|---|
| Page | New admin page `board.html` in the repo, first entry in the ADMIN list on the Welcome screen ("BOARD"). Same header, admin music and look as the other admin pages | Tom asked for Admin; it works on his iPhone home screen like the rest |
| Data | One file, `data/board.json`, in the repo | Every session already clones and pushes the repo; the game page can read a repo file but cannot read Project docs |
| Single source | The board replaces `claude/pending-my-action.md` (Tom's lane is "pending my action"). When board1 ships, rewrite the "Pending-action list" section of `claude/handoff-rules.md` to point at the board and leave a one-line pointer in pending-my-action.md | Two lists drift apart |

## 2. Layout

Swimlanes are WHO has the next move. Columns are WHERE it stands.

| Lanes (rows, this order) | Covers |
|---|---|
| Tom | Play-tests, reviews, recording, generating images in the outside image AI, decisions, settings only he can change |
| Claude | Builds, fixes, merges, prompt writing: anything a session does next |
| xAI | Grok image and video generation (Art Library, clip-gen Action): credit, outages, price checks |
| ElevenLabs | Voice and music takes (voice-gen Action, Voice and Music Library): credits, voice slots (account full at 30) |
| Image generator | The outside image AI Tom uses from Claude's prompts (Nano Banana and others) |
| GitHub | Pages publish, Actions runs, tokens and secrets, repo access |

An external lane holds a card only while the item is waiting on that service (out of credit, a run in progress, an outage). Lanes always show, with "Nothing waiting" when empty, so Tom sees at a glance that no one is stuck. A new external dependency gets a new lane in `data/board.json` (`lanes` list), not a code change.

| Columns | Meaning |
|---|---|
| Up next | Agreed and ready; nobody has started |
| In progress | Someone is on it now (a session is building, a run is going, Tom is reviewing) |
| Waiting | Started but stopped on another lane. The card names that lane ("waiting on Tom") and the other lane gets its own linked card |
| Done | Finished in the last 7 days, then drops off the page (stays in the file with `done` date) |

## 3. A card

| Field | Shown | Notes |
|---|---|---|
| Title | Yes, one line, plain words | "Review chapter 1 battle clips" |
| Theme | Coloured tag | The nine themes in claude/pending-my-action.md (Voice Clips, Battle Animations, Battle System, Areas, Characters, Story and Dialogue, Game Shell, Tools, Project Ops). Filter chips by theme at the top |
| Next step | Yes, one or two lines | Exactly what the lane owner does next, with the screen path for Tom ("ADMIN > BATTLE LAB > CHAPTER 1 REVIEW, PLAY ALL, REDO with notes") |
| Blocks | Badge | Ids of cards that cannot move until this one does. A Tom card that blocks a Claude card shows "Blocking: <title>" in red |
| Age | Yes | Days since the card last changed. Amber at 3 days, red at 7: that is the "dropped thread" signal |
| Chat | Link | The session link (https://claude.ai/code/session_...) and the first words of the opening message, so Tom can find the chat |
| Prompt | Tap to copy | For Claude-lane cards: the exact prompt, model and effort per claude/handoff-rules.md, so Tom can start the next session from the card |
| History | Tap to expand | Dated one-line entries |

Top of the page, one line: "Waiting on you: N (oldest D days). Blocking Claude: M." Tapping it filters to those cards.

## 4. Tom's actions on the phone

- Tap a card: opens the detail. Buttons: "Done", "Move to..." (lane and column), "Note".
- Saves straight to `data/board.json` on main with the GitHub token from Art Library Setup (the same contents API path REDO and Heads use). No token: the button says so and points at Setup.
- No dragging (unreliable on a phone at this size). No editing titles from the phone; Claude owns the wording.

## 5. How sessions keep it current (rule for claude/handoff-rules.md once built)

- Start of every session: read `data/board.json` (from the clone, or `https://raw.githubusercontent.com/trivituso81/adventures-of-tom/main/data/board.json` when no clone is needed).
- End of every session: update the cards the session touched (move, add, mark done), push with the build, `docs/CHANGES.md` entry as usual. A session that does not otherwise push (a planning chat) still pushes the board change alone, tag `board-<short>`.
- Closing reply keeps its last line: "Theme: <theme>. Pending your action: yes/no." Yes means a card is in Tom's lane.
- `tools/board_check.py` (part of smoke): file is valid, every card has a lane, column, theme from the list, title and next step; a Waiting card names an existing lane; Blocks ids exist.

## 6. First fill (board1 does this)

Seed the board from claude/next.md: every bullet under "Waiting on Tom" becomes a Tom card; every ORDER NOW item with a next build becomes a Claude card (Up next) with its prompt, model and effort as next.md gives them, linked by Blocks where it waits on Tom (clipch1fix is blocked by Tom's chapter 1 clip review; chapter 2 build is blocked by Tom's chapter 1 play). Old phone checks that no build waits on go in Tom / Up next with their real age if known, else the date of their build in docs/CHANGES.md. Chat links are unknown for older items: leave blank, the opening-words field says "unknown".

## 7. Quality bar

Look at the page at 390 x 844 (portrait: lanes stacked, each lane's columns as one swipeable row, Tom's lane first and open) and 951 x 648 and 1440 x 900 (full grid). Test the Done and Move buttons against the stub GitHub server (tools/art-library/stub.py). Smoke passes, bump tags, CHANGES entry, push.
