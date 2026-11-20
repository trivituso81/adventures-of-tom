# Admin hub: one address for the board, one for all admin tools (adminhub plan, 2026-11-19)

Written by the planning session `board-artgen` (Fable 5.2) for a Sonnet 5.5 session to build as `adminhub1` (card c-adminhub1). Also in the Project as claude/adminhub-plan.md: change both copies together.

## 1. What Tom asked for (11-19 22:39, his words)

"Can you also cards with instructions for creating unique URLs for the following: a landing page for the kanban board; a landing page for admin with only: voice library script editor, art library, music library, area builder, portrait crops head sizes pose editor welcome layout report tab on; labs: battle lab, block break lab. For the admin page, group and reorganize the links based on functionality for the kanban board as well as a unique url containing link/buttons for all admin functionality except the demo"

## 2. What exists today (facts, checked in the repo)

- ADMIN is a list inside the game's welcome screen (`engine/splash.js`, the `admin` mode, lines near 144 to 159): DEMO, BOARD, VOICE LIBRARY, SCRIPT EDITOR, ART LIBRARY, MUSIC LIBRARY, AREA BUILDER, PORTRAIT CROPS, HEAD SIZES, POSE EDITOR, WELCOME LAYOUT, the report tab switch (`brpAdminItem()` in engine/report.js), BLOCK BREAK LAB, BATTLE LAB. To reach any of them Tom loads the whole game first (about 50 MB before the title).
- Nine of them are their own pages already: board.html, voices.html, script.html, art.html, music.html, areas.html, portraits.html, heads.html, poses.html. Four live inside the game: WELCOME LAYOUT (`splashEditOpen`), the report tab switch, BLOCK BREAK LAB (`splashGo(bbLabStart)`), BATTLE LAB (`splashDifficulty(...)` then `splashOpen('lab')`).
- The only address parameter the welcome screen reads is `index.html?admin=1` (opens the ADMIN list).
- The Project doc claude/admin-ux-plan.md planned a hub and was never built. This plan replaces its hub part; the rest of it is untouched.

## 3. The calls made

| Piece | Call |
|---|---|
| Admin address | New page `admin.html`: https://trivituso81.github.io/adventures-of-tom/admin.html. It loads no game code, so it opens in a second. |
| Board address | `board.html` stays the board's own address: https://trivituso81.github.io/adventures-of-tom/board.html. It gets a home screen icon and name of its own and one "Admin" link in its header. |
| What is on admin.html | Every admin function except DEMO, as large buttons with the same one-line descriptions the game's list uses, grouped as in section 4. |
| The four in-game tools | New parameter `index.html?go=<name>` opens the tool directly after the game loads: `welcome-layout`, `battle-lab`, `block-break-lab`. The report tab switch is a button on admin.html itself (it flips the same saved setting the game reads; read `brpAdminItem` to find the key) and shows On or Off. |
| The game's own ADMIN list | Kept (DEMO stays there), reordered to the same groups, with a first row ADMIN PAGE that opens admin.html. |
| Way back | Every admin page's Exit or Back goes where it goes today. admin.html has one link "Back to the game" (index.html). |

## 4. Groups on admin.html, in this order

| Group | Buttons |
|---|---|
| What is next | Board |
| Libraries (make and approve) | Art Library, Voice Library, Music Library |
| Story | Script Editor |
| Characters | Pose Editor, Head Sizes, Portrait Crops |
| World and screens | Area Builder, Welcome Layout (opens in the game) |
| Labs | Battle Lab (opens in the game), Block Break Lab (opens in the game) |
| Reporting | Report tab: On or Off |

Under the Board button, one live line read from data/board.json: how many cards wait on Tom (open cards in lane tom that are not in Waiting). Nothing else dynamic.

## 5. Build notes

- admin.html: one self-contained file in the look of board.html (same fonts, colors, button sizes; copy its head block, not its scripts). Phone first, 390 px wide, buttons at least 56 px tall, two columns from 700 px. Title "Admin: The Adventures of Tom". Home screen: `apple-touch-icon` (reuse icon-v10.png), `apple-mobile-web-app-title` "AoT Admin"; board.html gets the same with title "AoT Board".
- `?go=`: handle it where `?admin=1` is handled in engine/splash.js (line near 43), after the welcome screen is wired. Battle Lab still asks for the difficulty first, as from the list. Remove the parameter from the address with `history.replaceState` as `?admin=1` does. An unknown name opens the ADMIN list.
- Check that the publish workflow serves the new page (`.github/workflows/publish.yml`: see how the other html pages are included) and that sw.js treats it like the other admin pages.
- board.html: only the header link and the two head tags. Other sessions are changing board.html (artgen1, cardlinks1): on a rebase conflict take upstream and add the link and tags again.
- Docs in the same push: repo CLAUDE.md "Where things live" gets a row for admin.html and `?go=`; docs/CHANGES.md; this file's Built section.

## 6. Tests

New `tools/admin_hub_test.py` (Playwright, 390x844 and 951x648, screenshots in tools/shots/, looked at): every button of section 4 is present and no DEMO; each page link answers 200 from the local server; the waiting count equals the count computed from data/board.json; the report switch flips the saved setting and the game then shows or hides the pencil tab; `index.html?go=welcome-layout`, `?go=battle-lab` and `?go=block-break-lab` each land on the right screen; `?go=nonsense` lands on the ADMIN list; the game's ADMIN list starts with ADMIN PAGE and still has DEMO. Then `python3 tools/board_test.py /tmp/board`, `python3 tools/smoke.py`.

## 7. Card at the end

`after` of c-adminhub1 = Tom card `t-adminhub1try` (ask play, fyi, theme Tools). Next step: "On your iPhone open https://trivituso81.github.io/adventures-of-tom/admin.html in Safari, tap Share, Add to Home Screen. Tap each button once: each should open its tool, and Battle Lab, Block Break Lab and Welcome Layout should open inside the game without going through the menu. Do the same for https://trivituso81.github.io/adventures-of-tom/board.html. All good, or Something is wrong with the button that missed."

## 8. Built

(The build session writes here: what exists and what differs from this plan and why.)
