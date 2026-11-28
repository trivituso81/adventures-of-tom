# Admin Dashboard (dash1 to dash3, 2026-11-21)

`dashboard.html` is one page made for Tom's wide monitor (3440 x 1440) in Chrome on his MacBook Pro. It shows the Board, the game, the Battle Guide and the Admin tools side by side, so he can act on a change and check it without switching pages. Plan and Tom's words: `claude/dashboard-plan.md`. Approved drawings: `claude/dashboard-mock/` (the `.html` files hold every drawn size and colour). Cards c-dash1 to c-dash4.

Open it from ADMIN > Admin Dashboard (first button in What is next) or at https://trivituso81.github.io/adventures-of-tom/dashboard.html. It loads no game code itself: each pane is a frame (an `<iframe>`, a page shown inside another page) of the real page.

## What dash1 built

| Part | Fact |
|---|---|
| Panes, left to right, in every layout | 1 Board, 2 Game, 3 Battle Guide, 4 Admin (Builds in the Battle layout). |
| Layouts (top bar) | All four: pane widths 1000, 951, 829, 620; the game at 951 x 648 (the unfolded Duo, sideways). Battle: 520, 1600, 860, 420; the game at 1600 x 900, Duo off; Builds in pane 4. The choice is kept in `localStorage` as `aot-dash-layout`. Switching layout never restarts the game. Pane 4 takes the new layout's page. Art review and Story come in dash4. | Animations (movebench16): 420, 951, 1589, 440; the game stays 951 x 648 with the All four strip, pane 3 is the Battle Guide opened on its Animations tab with the keys, pane 4 is Admin; the Move Workbench shows its wide layout there (docs/BATTLE_GUIDE.md).
| Page size | Fixed 3440 wide. Height follows the window (1328 maximized, 1440 macOS full screen); panes take the height that is left and scroll inside, the page itself never scrolls. Pane 4 takes whatever width is left of 3400, so a few pixels of scrollbar cannot push the page sideways. Narrower than 3000: one line, "The Admin Dashboard is made for the wide monitor", and a link to Admin; no frames load. |
| Sizes | Top bar 44 tall. 8 px around and between panes. Pane header 40 tall. Colours are the Board's. |
| Pane header | Number, name, what is showing, KEYS HERE tag, Change page (every tool of `admin.html`'s `GROUPS`, read from that page when the menu opens so it cannot drift; not on the game pane), Reload this pane, Open in its own tab, Make this pane big (grows over the neighbours; Esc or the same button puts it back). |
| Under the game | The strip (dash2, below). It replaced the Builds page that filled this space in dash1; Builds is pane 4 in the Battle layout. |
| Top bar | Layout switch; For you and Claude counts (read from the Board's own tab numbers, a click shows that tab in pane 1); the live build (newest entry of `data/build-history.js`, re-read every 60 seconds); GitHub token saved or missing (`aot-gh-token`). Search comes in dash4. |

## The strip under the game (dash2)

Part of `dashboard.html` itself (not a frame): it reaches into the game frame from outside because every pane is the same origin. As drawn in `claude/dashboard-mock/`. The strip is at least 280 tall and its columns scroll inside it; a game size taller than the space pushes the strip down and the game pane scrolls.

| Part | What it does |
|---|---|
| Newer build bar | 48 tall, on top of the strip, shown only when the site's newest real build (`data/build-history.js`, read every 60 seconds, builds with `kind: house` skipped) is newer than the build the game frame runs (`BUILD_TAG` in the frame; older than it, or not in the list at all). It says "A newer build is live: NAME, TIME. This pane is still on NAME." with Reload game, which calls the game's own `splashReload()` (the title screen's RELOAD: it re-downloads every script, then reloads on a fresh address; saves are kept). The game is never reloaded by itself. |
| Screen size of this pane | Duo folded upright 466 x 657, Duo folded sideways 678 x 445, Duo open sideways 951 x 648 (the default of All four), Duo open upright 669 x 869, Desktop wide 1600 x 900 (picking it switches to the Battle layout, which starts on it; picking a Duo size inside the Battle layout stays there). The game is centred in its pane. The Duo layout is forced for the game frame only (below). |
| Story battles | Old, By chapter, New: the same `aot-b3-story` setting as `admin.html`; the game reads it every time (`b3sMode`), and a change made in the Admin pane shows here within half a second. |
| Difficulty | EASY, MEDIUM, HARD: the game's own `b7SetDiff` (so Rose Mode spends and gears as the title screen's toggle does), which saves `aot-diff`; when the game frame is not the game, the setting is written directly. The marked one is read from the running game. |
| Mute game | Silences this game frame only and is never saved. Every game sound reaches the output through an audio node `connect()` call, so the dashboard puts one gain node of its own in front of each audio output of the frame (`installMute`, installed as the new page starts, so it also holds after a reload of the game); spoken lines still run but at volume 0, so the game's timing does not change. The button says Unmute game while muted. |
| Report | Opens the game's pencil tab (`brpOpen`) and gives the game the keys. When the Report tab is off (ADMIN > Report tab) it says so under the buttons. |
| Jump to a chapter | 1 to 20 and BONUS (Nine Scoops). From the title screen it calls the game's own `splashGo(chapterJump(n))`, the same call as the title's chapter list; from anywhere else it first starts the game fresh (a clean state is the only safe start) and runs the same call when the title is up. A chapter the game cannot open yet (`splashBuilt`) is dimmed. The chapter the game is in has a gold ring. Part 2 chapter 11 is the test jump (as if Part 1 were done), not "from your clear data". |
| New battle test fights | The `b3` list of `data/battle-lab-index.json`: the first five, then Show all 27 test fights, which also lists the old Battle Lab fights (`b2`) under their own heading. A click opens `index.html?go=new&i=N` (`go=lab` for an old fight) in the game pane. The fight on screen is marked ON SCREEN and named in the pane header. |
| Keyboard help | The text from the drawing (All four: third column under Next for you; Battle: first column under the screen sizes). |

Which part sits in which column is the layout's `place` list; moving a part keeps its state.

## Take me there (dash3)

A Tom card with ask play can say where the game should be for the check. `tools/board_check.py` holds the shape; the strip and the Board act on it.

| Field | Meaning |
|---|---|
| `jump: {chapter: N}` | N is 1 to 20 or "B" (the bonus). The game's own chapter jump, the same call as the strip's chapter buttons. |
| `jump: {chapter: N, map: "id", flags: ["a", "b"]}` | The chapter jump, then (once the chapter is up) the game is put on that map (`__LE.go`) with those story flags set (`setFlag`). `map` is a key of the game's `worlds`; `flags` is a list of names. Not for "B". |
| `jump: {fight: "new", i: N}` | A test fight: N is an `i` of `data/battle-lab-index.json` (b3 for new, b2 for `"lab"`). The same `index.html?go=` address as the strip's fight list, so the fight is marked ON SCREEN. |
| `where: "phone"` | The check needs touch, sound timing or speed (the dashboard runs Chrome, the phone runs Safari). The Board shows On your phone on the card; the dashboard offers no Take me there. A card with it has no `jump`. |
| neither | A card whose spot the game cannot open, or a check of the dashboard itself. |

| Where it shows | Rule |
|---|---|
| Strip, Next for you | The first three open play cards (Tom's, not Done, not Waiting, not in the backlog) that carry a `jump`, in board order, each with its theme, Play and report, the build that hands it to you (the Board's own rule) and Take me there. The list is read from `data/board.json` on the site every 60 seconds. All four: column 3 above the keyboard help, cards stacked. Battle: column 4, cards side by side. With none it says "No open play card has a place to take you to." |
| Board pane | Take me there on the card (list and details) when the Board runs inside the dashboard (`window.parent.__DASH.take`); the Board on its own never shows it. On your phone shows in both. |
| What it does | `__DASH.take(jump)` (`takeMeThere` in `dashboard.html`): starts the game fresh the way the chapter buttons and fight list do, gives it the keys and, for a map, waits until the chapter is up before placing the game. It never reloads the game by itself. |

Proof: `python3 tools/dashboard_test.py` takes the jump of every open play card of the real `data/board.json` and checks the game's chapter, map or test fight (for t-guardwinplay also that Tom is in the party), then a stand-in board with three jump cards and cards that must not be listed (phone, fourth, waiting, parked) checks the strip and the Board pane. A new jump is proven the same way before it is kept.

## Links stay home

Every pane is the same origin, so the dashboard reads each frame's page from outside.

| Page | Pane |
|---|---|
| `board.html` | 1 |
| `index.html`, `battle-lab.html` | 2 (the game pane only ever shows the game or the Battle Lab list) |
| `battle-guide.html` | 3 |
| every other page of this site | 4 |
| another site | a new tab |

- A click on a link in any frame that points at another pane's page is stopped and the page opens in the pane that owns it. A link to the game while the game is already running only gives it the keys; it never restarts it.
- A script that moves a pane onto another pane's page (`location.href = ...`) is caught when the page loads: the page goes to its own pane and this pane goes back to where it was.
- Change page is the one way to put a tool in a pane that does not own it. That page stays until a link moves it.
- Ctrl click, Cmd click and a link with `target="_blank"` to another site are left to the browser.

## Keys

The pane with the keyboard has a 2 px gold frame and the KEYS HERE tag. Click a pane, or press Ctrl 1 to 4, from anywhere, including from inside a frame, to move the keys. The game takes the keyboard only while its frame has focus, so Arrow keys, WASD, Enter, M and L play the game when its frame is gold and never scroll the Board.

How Ctrl 1 to 4 works inside a frame: the game's title screen stops every key at the window in the capture phase (`engine/splash.js`), so a listener added after the game has loaded would never run. The dashboard watches each frame every 4 ms and adds its key listener to each new page as soon as that page's window exists, before the page's scripts do (`watchKeys`). If Ctrl and a number does something else on the Mac (a Mission Control shortcut that switches desktops), click the pane instead, or turn that shortcut off in System Settings > Keyboard > Keyboard Shortcuts > Mission Control.

Sound starts only after a first click inside the game frame (browser rule, nothing to build).

## The game frame and the Duo layout

The game decides its layout from the page size and `detectDuo` (`engine/audio.js`). The dashboard must not use `le-duo` in `localStorage` (it would hit every game tab in this browser). `?duo=1` in the address works for the first load, but `engine/splash.js` drops the whole query string when `go=` is in it. So the dashboard puts `?duo=1` or `?duo=0` in the address for the first load and, on every page load in the game frame and every time the size changes, replaces that frame's `detectDuo` with one that answers for the chosen screen size (Duo on for the four Duo sizes, off for Desktop wide) and asks the game to lay out again (`forceDuo`). It also writes the true `?duo=` back into the frame's address (`duoAddress`), so the game's own RELOAD, which reloads the frame's current address, lays out right from the first frame even after `go=` removed the query. Nothing else is changed in the game. The game frame loads after the other three, because the title screen waits for about 51 MB of scripts.

Proven in `tools/dashboard_test.py`: `html` gets `tablet duo landscape` at 951 x 648, `duo tablet` upright at 669 x 869, `duofold` at 466 x 657 and `duofold landscape` at 678 x 445; the Battle layout has none of them at 1600 x 900; `le-duo` is never set; `index.html?go=` (a chapter-less link and a test fight from the strip) keeps the Duo layout and the address keeps the right `?duo=`.

## Facts and limits

- One game pane only. Two would write the same saves.
- All panes share `localStorage`: the GitHub token (`aot-gh-token`), difficulty (`aot-diff`), Story battles (`aot-b3-story`), this browser's build (`aot-build`). One token paste in the Board pane serves every pane. Chrome on the Mac is a new browser, so the token must be pasted there once.
- Claude conversations cannot be shown in a frame; "Open chat" links open a new tab.
- A look, text or rules check done in the dashboard counts as All good. Touch, sound timing and speed stay phone checks (the phone runs Safari's engine, the dashboard Chrome's).
- Not supported: any size other than the wide monitor, Safari, a second game pane.

## Run it as its own window (Chrome on the Mac)

Open the dashboard in Chrome, then More (the three dots at the top right) > Cast, save, and share > Install page as app... > Install. Chrome opens the dashboard in its own window, with no tabs, and puts it in the Applications folder under Chrome Apps; keep it in the Dock from there. It shares this Chrome profile's storage, so the token and layout carry over. (Create shortcut... in the same menu only makes a link that opens a tab; it is not the app window.) Source: Google's "Use web apps" help page, checked 2026-11-21.

## How to add a layout

Add a row to `LAYOUTS` in `dashboard.html`: `id`, `label`, `w` (four pane widths; the first three are exact, pane 4 takes the rest, together 3400), `size` (the id of the game's screen size it starts on, a row of `SIZES`), `p4` (page and name of pane 4), `cols` (the strip's grid columns) and `place` (which strip parts sit in each column: `sizes`, `story`, `diff`, `mrow`, `chap`, `fights`, `keys`). The top bar shows it by itself. To add a screen size, add a row to `SIZES` (`id`, `label`, `w`, `h`, `duo`); the strip lists it by itself. Extend `tools/dashboard_test.py` with its widths.

## Tests

`python3 tools/dashboard_test.py` (own server on 8873; screenshots `tools/shots/dashboard-1328.png`, `dashboard-1440.png`, `dashboard-battle-1328.png`, `dashboard-narrow.png`, and for the strip `dashboard-strip-<height>.png`, `dashboard-strip-upright-<height>.png`, `dashboard-strip-battle-<height>.png`, `dashboard-strip-bar-1328.png`, `dashboard-strip-fight-1328.png`). The strip's checks (dash2): at both heights, the drawn parts and columns, every screen size (frame size, the layout the game picks, centred, the strip below, no sideways scroll, `le-duo` untouched, the address carries `?duo=`), Desktop wide switching to the Battle layout with four strip columns; at 3440 x 1328, Story battles and Difficulty, Mute (also through a reload), the newer-build bar with a stand-in newer build (a newer housekeeping build must not raise it, the game must not reload by itself, Reload game must reload it with the size and keys kept), a chapter jump from the title and from the middle of the game, BONUS, a new test fight and an old one with the ON SCREEN mark, Show all, and Report with the tab off and on. It also checks, at 3440 x 1328 and 3440 x 1440: four panes load with no page error, every size above, no sideways scroll in the page or any pane, counts and live build, link routing (Board to Battle Guide, Admin tool in pane 4, Board link from pane 4, game link without restart, Battle Lab, `go=` trap, other site, a script that moves a pane), Change page, Reload, Make big, Open in its own tab, Ctrl 1 to 4 from the page and from inside the game, an arrow key moving the title menu, the Battle layout and that it survives a reload. dash3 adds: every open play card's jump from the real board lands the game (chapter, map or test fight), the stand-in board's three cards in the strip (order, build line, skipped phone, fourth, waiting and parked cards), Take me there from the strip and from the Board pane, On your phone, and the Board on its own showing no Take me there; screenshots `dashboard-next-1328.png`, `dashboard-board-take-1328.png`. `python3 tools/admin_hub_test.py` checks the new Admin button.

## Next

dash4 (search, Art review and Story layouts). Plan section of the same name.
