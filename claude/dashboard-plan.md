# Admin Dashboard plan (board-dashboard, 2026-11-21)

One page, `dashboard.html`, made for Tom's wide monitor (3440 x 1440) in Chrome on his MacBook Pro. It shows the Board, the game, the Battle Guide and the Admin tools side by side, so he can act on a change and check it without switching pages. Cards: c-dash1 to c-dash4 and Tom's cards t-dash1-try, t-dash3-try, t-dash4-try (theme Tools).

## Tom's words

- 2026-11-21 10:56: "design a view for my extra wide monitor (3440x1440) when im using chrome (or whichever browser you recommend on my new macbook pro), so that i can maximize the browser window to full screen on the monitor and use it view the battle guide, admin panel, kanban board, and maybe even the game all at the same time, making it easier and faster for me to act on changes and then check them... if you think of bells and whistles or use cases that i haven't mentioned, incorporate those as well. it could be a dedicated view/url called Admin Dashboard that really only needs to be supported for this viewport an no others."
- 2026-11-21 11:19, after seeing both drawings: "ok looks good, create the kanban cards we need ot execute this properly".

## What Tom approved

The two drawings in `claude/dashboard-mock/`:

| File | What it is |
|---|---|
| `layout-1-all-four.jpg` | The default layout at 3440 x 1440. Look at this first. |
| `layout-2-battle.jpg` | The Battle layout at 3440 x 1440. |
| `layout-1-all-four.html`, `layout-2-battle.html` | The markup of the drawn parts (top bar, pane headers, the strip under the game) with every size and colour inline. The real pages are labelled boxes. Lift sizes and colours from here; it is a drawing, not code to ship. |

In the drawings the Board, game, Battle Guide, Admin and Builds panes are pictures of the real pages at the pane sizes. The top bar, the pane headers and the strip under the game are drawn and are the new work.

Decisions (Tom's "looks good" was taken as yes to the four recommended options put to him):

| # | Decision |
|---|---|
| 1 | Pane order, left to right, in every layout: Board, Game, Battle Guide, fourth pane. |
| 2 | The game pane starts at the Duo open, sideways size (951 x 648), because it matches what he plays on. |
| 3 | The Admin page is the fourth pane, and a tool opened from it opens in that pane. No icon strip. |
| 4 | A look, text or rules check done in the dashboard counts as All good. Touch, sound timing and speed stay phone checks (the phone runs Safari's engine; the dashboard runs Chrome's). |
| 5 | Browser: Chrome. The repo's page tests already run in Chrome's engine, and Chrome can run a page as its own app window. |

## Facts proven on 2026-11-21 (a throwaway test, nothing in the repo)

A page served from the repo root held four frames (a frame, `<iframe>`, is a page shown inside another page) with `board.html`, `index.html?go=new&i=0`, `battle-guide.html#family/tom` and `art.html`, in headless Chromium at 3440 x 1328. All four ran with no page errors.

| Fact | Detail |
|---|---|
| No existing page needs a change to sit in a pane | Each page reads its own pane's width, so its own breakpoints pick the layout. |
| Board at 1000 wide | For you and Claude side by side (its 860 breakpoint). At 520 wide: one column with the tab bar at the bottom. |
| Battle Guide at 829 or 860 wide | List and detail side by side (its 560 by 560 breakpoint). |
| Admin at 620 wide | One column of buttons (its two columns start at 700). |
| Game at 951 x 648 with Duo forced | `html` gets `tablet duo landscape`, the same layout as his unfolded Duo. |
| Game at 1600 x 900, Duo off | The desktop battle screen of build deskhud1 (wide landscape, 1100 or wider). |
| All panes share one origin | So they share `localStorage`: the GitHub token (`aot-gh-token`), difficulty (`aot-diff`), Story battles (`aot-b3-story`), this browser's build (`aot-build`). One token paste serves every pane. |

Not proven: the live site (GitHub Pages must not forbid frames; nothing in the repo sets such a header), Safari, his real monitor.

## Traps found while reading the code

| Trap | Where | What to do |
|---|---|---|
| Forcing the Duo layout with `le-duo` in `localStorage` hits every game pane and tab in that browser | `detectDuo`, `engine/audio.js` | Force it per frame, not in shared storage. |
| `?duo=1` in the address is lost when `?go=` is also there | `engine/splash.js` line with `history.replaceState(null,'',location.pathname)` after reading `go` | dash2 adds a per-frame way that survives (the session picks the smallest change) and keeps `?duo=1`, `?duo=0` and `le-duo` working. |
| The game takes the keyboard only while its frame has focus | Browser rule | The gold frame and Ctrl 1 to 4 (below). Arrow keys must never scroll the Board while he thinks he is playing. |
| Sound starts only after a click inside the game frame | Browser rule | Nothing to build; say it in the try card. |
| Two game panes would write the same saves | `localStorage` saves | One game pane only. Never add a second. |
| The title screen waits for about 51 MB of scripts | CLAUDE.md, Load time | The service worker already keeps them. If opening the dashboard is slow, load the game frame after the other three. |
| claude.ai conversations cannot be shown in a frame (not tested; that site is expected to forbid it) | Other site | Links to other sites open a new tab. |
| `data/board.json` is over 1 MiB | bigboard1 in CLAUDE.md | Read it from the site (`data/board.json?t=`) as `admin.html` does, or with the blob fallback as `ghBoard` in `board.html` does. |

## The layout, in CSS px (one size only)

The page is fixed at 3440 wide. Height flexes from 1290 to 1440: a maximized Chrome window gives about 1300 to 1330, macOS full screen gives 1440. Widths never change with height; pane bodies take the height that is left and scroll inside. Narrower than 3000: show one line, "The Admin Dashboard is made for the wide monitor", and a link to Admin. No other support.

| Piece | Size |
|---|---|
| Top bar | 44 tall |
| Padding around the panes, gap between panes | 8 |
| Pane header | 40 tall |
| Pane body at 1440 | 1340 tall |

| Layout | Pane 1 | Pane 2 | Pane 3 | Pane 4 |
|---|---|---|---|---|
| All four (default) | Board 1000 | Game 951: the game at 951 x 648, the strip below | Battle Guide 829 | Admin 620 |
| Battle | Board 520 | Game 1600: the game at 1600 x 900, the strip below | Battle Guide 860 | Builds 420 |
| Art review (dash4) | Board 520 | Game 951 | Art Library, the rest | none |
| Story (dash4) | Board 520 | Game 951 | Script Editor 760 | Voice Library, the rest |

Pane widths in a layout add to 3400. The dash4 session checks the Art Library, Script Editor and Voice Library breakpoints and may move the two dash4 layouts' widths; pane order stays.

Colours are the Board's (`board.html` `:root`): page behind the panes `#0b0a18`, pane `#14122b`, header `#1d1a3d`, line `#2c2852`, text `#f4f1ff`, muted `#a9a3d6`, gold `#ffd34d` with `#241b00` text. Font: the admin pages' system font. No em dashes in any text.

## dash1: the page and its four panes

| Part | Rule |
|---|---|
| File | `dashboard.html` at the repo root, classic script, loads no game code itself. Title "Admin Dashboard". |
| Way in | A button "Admin Dashboard" first in the group What is next on `admin.html` ("Board, game, Battle Guide and Admin side by side. Made for the wide monitor."). Update `tools/admin_hub_test.py`. |
| Panes | Four frames of the existing pages. Do not change those pages in dash1. |
| Layout switch | All four and Battle, in the top bar. The choice is kept in `localStorage` (`aot-dash-layout`). Art review and Story are not shown until dash4. |
| Pane header | Number (1 to 4), name, what is showing, then Change page (every tool of `admin.html`'s `GROUPS`; not on the game pane), Reload this pane, Open in its own tab, Make this pane big (the pane grows over its neighbours, Esc or the same button puts it back). |
| Links stay home | A link clicked in any pane opens in the pane that owns that page: `board.html` in pane 1; `index.html` and `battle-lab.html` in the game pane; `battle-guide.html` in pane 3; every other page of this site in pane 4; another site in a new tab. The Board never leaves pane 1 and the game pane only ever shows the game or the Battle Lab list. Same origin, so the dashboard can watch clicks and page loads in its frames from outside; a pane that still ends up on another pane's page is moved back when it loads. |
| Keys | The pane with the keyboard has a 2 px gold frame and the tag KEYS HERE. Ctrl 1 to 4 moves the keyboard to that pane, from anywhere, including from inside a frame. Clicking a pane moves it too. |
| Top bar | "Admin Dashboard", the layout switch, For you and Claude counts (the Board's own tab numbers; a click shows that tab in pane 1), the live build (newest entry of the site's `data/build-history.js`, checked every 60 seconds, with its time), and GitHub token saved or missing (`aot-gh-token`). The search box is dash4. |
| Under the game | Until dash2, the Builds page (`builds.html`) fills the space under the game. |
| Game pane | The game at the layout's size: 951 x 648 with the Duo layout forced for that frame, or 1600 x 900 with the Duo off. |
| Docs | `docs/DASHBOARD.md` (what it is, sizes, how links and keys work, how to add a layout), a row in CLAUDE.md "Where things live". |
| Test | `tools/dashboard_test.py`: 3440 x 1328 and 3440 x 1440; four panes load with no page error; no pane or the page scrolls sideways; a Board link to the Battle Guide lands in pane 3; an Admin tool opens in pane 4; Ctrl 2 gives the game the keys and an arrow key moves the menu; Battle layout sizes. Look at the screenshots. |
| Live check | After the publish, load the live `dashboard.html` and confirm the frames show (if GitHub Pages forbids frames, stop and write that on the card). |

## dash2: the strip under the game

As drawn. It replaces the Builds page under the game.

| Part | Rule |
|---|---|
| Tom's notes | First apply his notes on t-dash1-try, each by the smallest change. |
| Build watch | The bar on top of the strip. When the site's newest build is newer than the one the game pane is running (`BUILD_TAG` in the frame), it says "A newer build is live: NAME, TIME. This pane is still on NAME." with Reload game, which reloads the way the title screen's RELOAD does. Housekeeping builds (`kind: house`) do not raise the bar. Never reload the game by itself. |
| Screen size of this pane | Duo folded, upright 466 x 657; Duo folded, sideways 678 x 445; Duo open, sideways 951 x 648; Duo open, upright 669 x 869 (sizes from docs/DUO.md); Desktop wide 1600 x 900 (switches to the Battle layout). The game is centred in its pane; a size taller than the space pushes the strip down and the pane scrolls. |
| Story battles, Difficulty | The same settings and keys as `admin.html` (`aot-b3-story`) and `battle-lab.html` (`aot-diff`). |
| Jump to a chapter | 1 to 20 and BONUS, by the game's own chapter select (`chapterJump`). |
| New battle test fights | The `b3` list of `data/battle-lab-index.json` (first five, then Show all, which also lists the old Lab's `b2` fights); a click opens `index.html?go=new&i=N` (or `go=lab`) in the game pane. The one on screen is marked. |
| Mute game, Report | Mute silences this pane only and is not saved. Report opens the game's pencil tab (it needs the Report tab on). |
| Next for you | Not in dash2: the third column shows the keyboard help only. dash3 adds it. |
| Test | Extend `tools/dashboard_test.py`: each size, the bar appears with a stand-in newer build, a chapter jump, a test fight, mute. `python3 tools/smoke.py` because the game changes. |

## dash3: Take me there

| Part | Rule |
|---|---|
| Card field | A Tom card with ask play may carry `jump`: where the game should be put for the check (a chapter, and when the game can do it, a map, the story flags the spot needs, or a test fight). Use the game's own means (`chapterJump`, `__LE.go`, `__LE.setFlag`, `?go=`). The session designs the smallest shape that covers the open play cards. |
| Where it shows | In the strip: Next for you, the first three open play cards with a `jump`, each with Take me there. On the card in the Board pane too, only when the Board runs inside the dashboard. |
| Phone checks | Decision 4. A play card whose check needs touch, sound timing or speed carries `where: "phone"`; the Board shows "On your phone" on it and the dashboard offers no Take me there for it. |
| Rules | `tools/board_check.py` checks the shape of `jump` and `where`. CLAUDE.md, the board section, gains the rule: a new Tom play card gets a `jump` when its check starts at a place the game can open, and `where: "phone"` when it needs the phone. |
| Backfill | Every open Tom play card gets its `jump` or `where` in the same push; read each card's `next` to find the spot. |
| Test | A stand-in board with three play cards; Take me there puts the game on the named map. |

## dash4: search and two more layouts

| Part | Rule |
|---|---|
| Tom's notes | First apply his notes on t-dash3-try. |
| Search everything | The box in the top bar, also Cmd K. It searches open cards (title, next step, id), builds (name and line), the Battle Guide's entries (family, monsters, statuses, animations), the admin tools, chapters and test fights. Enter opens the result in its home pane: `board.html?card=ID`, `builds.html?build=NAME`, the guide's `#` address, the tool's page, or the jump. |
| Layouts | Art review and Story, as in the table above. |
| Test | Extend `tools/dashboard_test.py`: one search of each kind lands in the right pane; both layouts at 3440 x 1328. |

## Left out on purpose

A second game pane; Claude conversations inside the page; any size other than the wide monitor; Safari; a count on the Dock icon. Each is a new card if Tom asks.
