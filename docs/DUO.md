# iPhone Duo mode (build duo1, 2026-11-11)

Tom's order (11-11): research the iPhone Duo's unfolded screen and design a viewport for it that suits the overworld, building interiors, menus, the welcome screen and every admin page (not the demo).

## What the Duo gives a web page (researched 11-11)

The Duo is Apple's folding iPhone (released 2026-10-23). Inner screen: 7.6 inch, 1878 x 2670 pixels, about 1.42 : 1. Outer screen: 5.4 inch, 1398 x 2034.
Apple has not published the page sizes. The numbers below were measured by developers on real phones; the early published guesses (890 x 626) are wrong.

| Pose | Home-screen app, CSS px | Safari, CSS px | Note |
|---|---|---|---|
| Folded, upright | 466 x 657 | 382 x 580 | A normal phone. |
| Folded, sideways | 678 x 445 | 594 x 368 | A normal phone in landscape. |
| Open, sideways | 951 x 648 (867 x 669 measured by others) | 951 x 589 | The main Duo pose. The crease runs top to bottom at the middle (x about 475). |
| Open, upright | 669 x 869 (930 tall if unfolded while the app is open) | 669 x 871 | Nearly square. |

- `screen.width` and `screen.height` say 466 x 678 in every pose. That is how the game knows it is on a Duo.
- Safari has no way to tell a page that the phone folded or where the crease is. Each fold or unfold fires a `resize`; unfolding upright shows a 951 wide page for about a second first.
- Safe-area insets (the space the system asks pages to keep clear) were reported as 0 in the home-screen app. The game already pads every edge with them, each side on its own.
- Sources: Apple tech specs (support.apple.com/en-us/148588), chadworks.co/iphone-duo-viewport-sizes (66 readings on a real Duo), github.com/drudge/sable/pull/480 (867 x 669).

## What the game does

| Piece | Where | Rule |
|---|---|---|
| Detect | `detectDuo`, `duoMode` in `engine/audio.js` | iPhone whose screen reports 466 x 678, or any iPhone page with a short side of 560 or more (`DUO_OPEN_MIN`; no flat iPhone passes 440). Unfolded = short side 560 or more, checked on every resize. Force with `?duo=1` / `?duo=0` or localStorage `le-duo` = `on` / `off`. |
| Classes | `applyLayout` | Unfolded sets `html.duo` and `html.tablet` (iPad mode: full screen, follows how the phone is held, rotate button hidden). Folded sets `html.duofold` only: the phone layouts, rotate toggle and all, with the title logo sized by height because the folded screen is short (657 tall). |
| UI scale | `--ts` | Sideways: page height / 520, between 1.1 and 1.3 (1.25 at 648). HUD, D-pad, A and menu buttons, dialogue box, title menu and battle strip are the phone landscape sizes times `--ts`. |
| Overworld, rooms | `resize` in `engine/overworld.js`, unchanged | Outdoor paintings cover the screen as before, so the Duo shows about half again as much of the map top to bottom as a phone in landscape. Square room paintings fill the width and show about 68% of their height (a phone in landscape shows 46%). Character size is unchanged. |
| Menus, shops | `menuZoom` in `engine/menu.js` | Sideways the menu lays out at about 800 x 500 and zooms to fit (1.19 at 951 x 648). Upright it lays out about 520 wide (1.24). |
| Welcome screen | `html.duo` block, end of the last `<style>` in `index.html` | Logo sized by height (31% sideways, 29% upright) so it clears the family's heads; the title menu scales with `--ts`. |
| Build stamp | `engine/main.js` | On a Duo the title stamp also shows the measured page size and pose, for example `build duo1 951x648 duo open`. |
| Admin pages | `voices.html`, `music.html` | The two-column layout now starts at 860 px wide (was 1000), with the left column at 34% of the width up to 400 px, so the Duo sideways gets it. Art Library, Area Builder, Portrait Crops, Head Sizes and Recast Deedee already fit both poses and were not changed. |

Battles (duo2, Tom 11-11: make the left side as big as possible, stack the characters on the right): sideways, the right strip is 188 px wide (`--b2pw` in the `html.duo` block), the party is one card per row, and the scene is 763 x 429 at 951 x 648 (it was 671 x 377 with the iPad strip). The scene is 16:9 and limited by width, so the strip width is the only knob for scene size; dark bands remain above and below. Turn order tiles are double size sideways (duo3, Tom 11-11: 44 px times `--ts`, the current one 52). Upright uses the phone portrait battle layout unchanged.

Not changed: the frozen demo, any art.

## Tested

Chromium only, with an iPhone user agent, touch, and `screen` faked to 466 x 678 (no real Duo, no Safari): 951 x 648, 867 x 669, 951 x 589, 669 x 869 and folded 466 x 657. Title, Admin list, the Square, Tom's house, pause menu, a battle, and all seven admin pages plus the Area Builder editor.

## Knobs if Tom reports something

| He says | Change |
|---|---|
| Controls or dialogue too big or small sideways | the `--ts` clamp for `duoMode.open` in `applyLayout` |
| Menu text too big or small | the 800 (sideways) or 520 (upright) in `menuZoom` |
| The stamp shows a size not in the table | add it to the table and the test poses; the layout follows the page size, so it should still fit |
| The game did not switch when unfolded | read the stamp: if it does not say `duo`, the screen fingerprint is wrong; lower `DUO_OPEN_MIN` or fix `detectDuo` |
| Black bar or a strip beside the game | the status bar style (`apple-mobile-web-app-status-bar-style` in `index.html`); iOS reads it when the app is added to the Home Screen, so it needs a remove and re-add |
