# closeup1 / closeup2 (2026-11-12, main cc5806a then e0d7fa8): chapter 10 coin close-up screen, LIVE

Spec: claude/coin-closeup-spec.md. closeup1 built the engine (12:55 to 13:40). closeup2 (14:26 to ~15:00) installed Tom's approved art and turned it on.

## Fact: what is on main
| Piece | Where |
|---|---|
| Reusable engine (DOM overlay inside #game, JS layout, tap / keyboard / gamepad / on-screen pad, world paused) | `engine/closeup.js` (`CLOSEUP_DEFS`, `closeupOpen(id,hooks)`, `closeupPad`) |
| Chapter 10 script (ring of 7 slots, `ready:true`, hooks: wrong pick = `ch10-fails` +1 and Grace's two hints, done = `playScene('ch10Door')`) | `data/closeup-ch10.js` (`CH10_RING`, `ch10Closeup()`) |
| Hook into the gate | `ch10Gate` in data/scenes.js: PUT THE COINS IN runs `ch10Closeup()`. `ch10Slot` text menus are purged. |
| Pause the world | `update()` in engine/overworld.js, `pollGamepad` in engine/main.js |
| Art Library entries (tab Props, group "Close-ups"), both approved v1 | `tools/art-library/closeup-prompts.js`: `closeup-ch10-clock`, `closeup-ch10-coins` |
| Baker (plate rebuild plus coin cut; read its header) | `python3 tools/art-library/bake_closeup.py ch10` -> `art/closeup/ch10-clock.webp`, `ch10-coin-1..7.webp` |
| Test | `python3 tools/closeup_test.py` (real art; shots `tools/shots/closeup-*.png`) |

## Why the baker rebuilds things
The approved plate painted six ring slots and no center slot (hands over two of them); the approved coin sheet drew eight coins (the 1952 book twice). The baker erases slots and hands, fills a smooth face, places seven copies of one clean painted slot plus a larger empty center slot, and lays the approved hands (`prop-find-ch10-v5` cells 2 to 4) between the slots. Coins come from cells 1 to 4, 6, 7, 8. Ring numbers: baker `CX,CY=512,495`, `RR=290` match `CH10_RING` (.5, .4834, .2832) in data/closeup-ch10.js; change both together.

## Look at on Tom's phone
Build `closeup2`. Chapter 10, three hands found, walk into the Gate Zero doors, PUT THE COINS IN: coins fly to the slots, wrong coin rattle and return with Grace's hint, seventh coin shiver then the doors open; NOT YET and B leave; the on-screen pad (left, right, A, NOT YET) in portrait.

## Later chapters (only when Tom names them)
Order from the spec: coin finds in chapters 3 to 9 (players must know the coins by sight), then 13 (eleven coins melt the amber doorway), then 19 (keepsakes on pedestals) and 17 (snow globe). The engine is ordered placement only; a different interaction (turning mirrors, spelling SHH, setting clocks) needs a new mode in `engine/closeup.js`. Method for new art: Art Library entries first, parts method (each part alone), count the parts on the approved picture before installing.
