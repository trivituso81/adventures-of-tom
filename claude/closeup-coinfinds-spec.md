# Close-up 2: the seven coin finds, chapters 3 to 9 (2026-11-12 14:51, Tom: "clock was implemented well, how do we move on to the next element")

Read first: claude/next-addendum-closeup1.md (what is on main), then claude/coin-closeup-spec.md (the ranked list).

## Goal
Each time the party finds one of the seven gold coins in chapters 3 to 9, a short close-up shows that coin, large and detailed, so the player knows the coins by sight before the chapter 10 clock.

## Design (recommendation, decided so Tom has nothing to choose)
| Part | Design |
|---|---|
| Art | Reuse the seven approved painted coins already baked for chapter 10 (`art/closeup/ch10-coin-1..7.webp`). No new art from Tom for this step. Check each coin holds up at large size on a phone; if one is soft, say which and write one Art Library entry for a larger version of only that coin |
| Backdrop | The game view behind, dimmed and softened, with warm light on the coin. No new painting |
| Motion | Coin rises in, turns once, glints, settles. Caption with the coin's name (same names as `CH10_COINS`). A to continue |
| Engine | `engine/closeup.js` today does ordered placement only. Add a second mode, "reveal" (one object shown, no picking), so later single-object moments (chapter 17 snow globe) can reuse it |
| Where | At the existing moment each coin is found in chapters 3 to 9 (sundial, steamer, sign-up sheet, Bready's jar, 1952 book, 1963 oven, Mirrorball). Find each scene in data/scenes.js; do not move or rewrite the scene, insert the close-up at the find |
| Voice | No baked line edited. No new lines needed |
| Old saves | A save already past a find never sees that reveal; that is fine, the chapter 10 screen shows captions on focus |

## Not verified (do before building)
- The exact scene step where each of the seven coins is found was not read; the list comes from `CH10_COINS`.

## Quality bar
Each of the seven reveals looked at in portrait, landscape and Duo (951 x 648) from the chapter-select jump; `tools/closeup_test.py` extended to cover reveal mode; smoke passes; CHANGES entry and tag bump.

## After this (only when Tom names it)
Chapter 13 (eleven coins melt the amber doorway), then 19 (keepsakes on pedestals), then 17 (snow globe). 13 and 19 need new art through the Art Library, parts method.
