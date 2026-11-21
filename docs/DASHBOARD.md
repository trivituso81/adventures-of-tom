# Admin Dashboard (dash1, 2026-11-21)

`dashboard.html` is one page made for Tom's wide monitor (3440 x 1440) in Chrome on his MacBook Pro. It shows the Board, the game, the Battle Guide and the Admin tools side by side, so he can act on a change and check it without switching pages. Plan and Tom's words: `claude/dashboard-plan.md`. Approved drawings: `claude/dashboard-mock/` (the `.html` files hold every drawn size and colour). Cards c-dash1 to c-dash4.

Open it from ADMIN > Admin Dashboard (first button in What is next) or at https://trivituso81.github.io/adventures-of-tom/dashboard.html. It loads no game code itself: each pane is a frame (an `<iframe>`, a page shown inside another page) of the real page.

## What dash1 built

| Part | Fact |
|---|---|
| Panes, left to right, in every layout | 1 Board, 2 Game, 3 Battle Guide, 4 Admin (Builds in the Battle layout). |
| Layouts (top bar) | All four: pane widths 1000, 951, 829, 620; the game at 951 x 648 (the unfolded Duo, sideways). Battle: 520, 1600, 860, 420; the game at 1600 x 900, Duo off; Builds in pane 4. The choice is kept in `localStorage` as `aot-dash-layout`. Switching layout never restarts the game. Pane 4 takes the new layout's page. Art review and Story come in dash4. |
| Page size | Fixed 3440 wide. Height follows the window (1328 maximized, 1440 macOS full screen); panes take the height that is left and scroll inside, the page itself never scrolls. Pane 4 takes whatever width is left of 3400, so a few pixels of scrollbar cannot push the page sideways. Narrower than 3000: one line, "The Admin Dashboard is made for the wide monitor", and a link to Admin; no frames load. |
| Sizes | Top bar 44 tall. 8 px around and between panes. Pane header 40 tall. Colours are the Board's. |
| Pane header | Number, name, what is showing, KEYS HERE tag, Change page (every tool of `admin.html`'s `GROUPS`, read from that page when the menu opens so it cannot drift; not on the game pane), Reload this pane, Open in its own tab, Make this pane big (grows over the neighbours; Esc or the same button puts it back). |
| Under the game | The Builds page (`builds.html`) fills the space under the game until dash2 replaces it. |
| Top bar | Layout switch; For you and Claude counts (read from the Board's own tab numbers, a click shows that tab in pane 1); the live build (newest entry of `data/build-history.js`, re-read every 60 seconds); GitHub token saved or missing (`aot-gh-token`). Search comes in dash4. |

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

The game decides its layout from the page size and `detectDuo` (`engine/audio.js`). The dashboard must not use `le-duo` in `localStorage` (it would hit every game tab in this browser). `?duo=1` in the address works for the first load, but `engine/splash.js` drops the whole query string when `go=` is in it. So the dashboard puts `?duo=1` or `?duo=0` in the address for the first load and, on every page load in the game frame, replaces that frame's `detectDuo` with one that answers for the layout and asks the game to lay out again (`forceDuo`). Nothing else is changed in the game. The game frame loads after the other three, because the title screen waits for about 51 MB of scripts.

Proven in `tools/dashboard_test.py`: `html` gets `tablet duo landscape` at 951 x 648; the Battle layout has none of them at 1600 x 900; `le-duo` is never set; `index.html?go=` keeps the Duo layout.

## Facts and limits

- One game pane only. Two would write the same saves.
- All panes share `localStorage`: the GitHub token (`aot-gh-token`), difficulty (`aot-diff`), Story battles (`aot-b3-story`), this browser's build (`aot-build`). One token paste in the Board pane serves every pane. Chrome on the Mac is a new browser, so the token must be pasted there once.
- Claude conversations cannot be shown in a frame; "Open chat" links open a new tab.
- A look, text or rules check done in the dashboard counts as All good. Touch, sound timing and speed stay phone checks (the phone runs Safari's engine, the dashboard Chrome's).
- Not supported: any size other than the wide monitor, Safari, a second game pane.

## Run it as its own window (Chrome on the Mac)

Open the dashboard in Chrome, then More (the three dots at the top right) > Cast, save, and share > Install page as app... > Install. Chrome opens the dashboard in its own window, with no tabs, and puts it in the Applications folder under Chrome Apps; keep it in the Dock from there. It shares this Chrome profile's storage, so the token and layout carry over. (Create shortcut... in the same menu only makes a link that opens a tab; it is not the app window.) Source: Google's "Use web apps" help page, checked 2026-11-21.

## How to add a layout

Add a row to `LAYOUTS` in `dashboard.html`: `id`, `label`, `w` (four pane widths; the first three are exact, pane 4 takes the rest, together 3400), `game` (`w`, `h`, `duo` 1 or 0, `size` as named in the header) and `p4` (page and name of pane 4). The top bar shows it by itself. Extend `tools/dashboard_test.py` with its widths.

## Tests

`python3 tools/dashboard_test.py` (own server on 8873; screenshots `tools/shots/dashboard-1328.png`, `dashboard-1440.png`, `dashboard-battle-1328.png`, `dashboard-narrow.png`). It checks, at 3440 x 1328 and 3440 x 1440: four panes load with no page error, every size above, no sideways scroll in the page or any pane, counts and live build, link routing (Board to Battle Guide, Admin tool in pane 4, Board link from pane 4, game link without restart, Battle Lab, `go=` trap, other site, a script that moves a pane), Change page, Reload, Make big, Open in its own tab, Ctrl 1 to 4 from the page and from inside the game, an arrow key moving the title menu, the Battle layout and that it survives a reload. `python3 tools/admin_hub_test.py` checks the new Admin button.

## Next

dash2 (the strip under the game: newer-build bar, screen sizes, chapter and test fight jumps, Story battles, Difficulty, Mute, Report), dash3 (Take me there), dash4 (search, Art review and Story layouts). Plan sections of the same names.
