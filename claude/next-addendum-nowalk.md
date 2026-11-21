# No walking in battle (Tom 11-06 07:18, `noWalk1`, CHANGES 340, pushed)

- Rule from Tom: when a character steps up for an ability or steps back, no walk frames. Stance frozen, body shifts forward quickly, then shifts back still facing the enemies (never turns around).
- Where: `engine/battle-draw.js` party draw. `APPR_SLIDE` = .18 s (was .7 in, .35 out) for `fx.appr`; approach never draws `sp.run`. Any `fx.path` frame that is in `sp.run` or `sp.runFlip` is drawn as `sp.idle` unless `fx.run` (shuttle runs, Amy's running moves) is on. `B2_STAGE.ms` 460 to 200 in `engine/battle2-kind.js` (Tombo stage in and out).
- Not changed: enemy lunges, the `fx.run` shuttle moves, Tom's block slide timing, move-internal run frames drawn outside the generic path (battle2-kind.js `runFr` Tombo beats, deedee-moves.js line ~296 reads `sp.runFlip` directly but passes through `fx.path`, so it is covered).
- Tested: smoke FAILS: []; Rose Boop contact sheet. NOT played move by move. If Tom still sees walking in a specific move, ask which move and look for a frame drawn outside `fx.path` (grep `sp.run`).
