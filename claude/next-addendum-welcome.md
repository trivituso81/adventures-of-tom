# Welcome screen layout (`welcome2` to `welcome4`, main 8d8e0fd, 2026-11-06 01:50)

- engine/splash.js `splashCastDraw` draws in SCREEN space. Heights for both orientations: one table `SPLASH_H` (real heights, 4.34 units per inch, Tom 308; Nara 130 as a 40 lb labradoodle). Figure widths for spacing: `SPLASH_W`.
- iPhone portrait (Tom 01:32): TWO ROWS, `SPLASH_PORT` + `splashPortLayout`: front Nara, TNB, Tom, Rose, Grace; back row in the gaps behind (Deedee, Boppy flank Tom; Amy between Rose and Grace; Justin just past Grace). Scale is width-limited (gap 1.0, fracW .97) and gives about +40% over the old single line. Knobs: gap, depth, fracH, feetY.
- iPad landscape: single spread line (`SPLASH_LAND`, `SPLASH_SPOTS`), unchanged apart from the shared heights.
- Tom and Rose are separate figures from their own painted stand frames; the welcome page no longer uses Rose-on-shoulders art (drop it from NEXT TASK RIDE; ride frames stay for chapter 1 and battle).
- Bounce = battle idle breath (`SPLASH_BREATH` .012, scale from the feet).
- Tested at 393x852, 1180x820, 1090x890 (serve.py 8123, wait 7 s, add class `landscape` to html for landscape). Smoke FAILS: [].
- Ask Tom ONE line: iPhone two-row layout right (order, sizes, heights)?
