# coinfinds1 (2026-11-12 ~16:50, main 09d7dbf): coin close-up reveal at the seven coin finds, chapters 3 to 9

Spec: claude/closeup-coinfinds-spec.md. Waiting on Tom's phone check (title stamp `build coinfinds1`).

## Fact: what is on main
| Piece | Where |
|---|---|
| REVEAL mode (one object large over the dimmed, blurred game; rises, turns once, glints, settles; caption; A, tap, Enter, Esc, gamepad A or B continues) | `closeupReveal(img,label,onDone,v)` in engine/closeup.js |
| Scene step `{coinFind:N}` (N 1..7 = order of `CH10_COINS`); holds the scene until A | data/closeup-coinfinds.js (`SCENE_OPS.coinFind`) |
| Where each is inserted (one line, right before Tom's "A gold coin" line) | 1 ch3Hollow (sundial), 2 ch4AfterBoss (steamer), 3 ch5AfterBoss (sign-up sheet), 4 ch6AfterBoss (Bready's jar), 5 ch7AfterBoss (1952 book), 6 ch8AfterBoss (1963 oven), 7 ch9AfterBoss (Mirrorball), all in data/scenes.js |
| Art | the chapter 10 coins `art/closeup/ch10-coin-N.webp` (256 px) |
| Test | `python3 tools/coinfinds_test.py` (find scenes and order, 21 shown-and-held, 21 continue, layout inside screen, world paused; portrait, landscape, Duo; shots tools/shots/coinfind-*.png); `tools/closeup_test.py` still passes |

## Facts to know
- The coins are 256 px (cells of a 1024 sheet), so on a 3x phone they are enlarged and a little soft. Frames look fine in the browser. If Tom says they look soft: an Art Library entry for larger coins (parts method), then rebake `bake_closeup.py` at 512.
- FAST and SKIP scene buttons stay visible above the reveal; SKIP ends the scene but the reveal still waits for A. Harmless.
- Old saves already past a find never see that reveal.
- Next close-ups only when Tom names them: chapter 13 (eleven coins melt the amber doorway), 19 (keepsakes on pedestals), 17 (snow globe; reuse REVEAL). 13 and 19 need new art through the Art Library.
