# Welcome cast: Olivia, Michael and the kids added; sideways layout is two staggered rows with equal gaps (2026-11-11, CHANGES "cast2" to "cast5", tag cast5)

Read with claude/next.md and claude/next-addendum-castflip1.md.

- Tom 09:35: Olivia, Michael and the kids on the LA side. Michael's walk art carries Lachlan and Isla, so two figures were added (SPLASH_H olivia 282 = 5'5", michael 330 = 6'4"; SPLASH_W olivia .357, michael .566). bootReady list includes olivia and michael.
- Tom 09:51: TNB closer to Tom. Tom 10:15: everyone equally close, no horizontal overlap. Tom 11:43: keep the ROWS (cast4 made one flat line and he did not ask for that). Lesson: change only what Tom names; keep the layout's structure.
- SIDEWAYS (landscape, any wide window), fact: `SPLASH_LAND.order` = boppy, deedee, justin*, grace, amy*, rose, tom, tnb, olivia*, nara, michael* (* = back row, 50 design units higher, drawn first). Back-row people stand in the gaps between front-row people. Every neighbour pair has the same 12-unit gap between visible painted figures; widths from `splashCols` (painted frame drawn off screen, alpha > 160, bottom 6% skipped for the ground shadow). Tom at exact centre, sized by the wider half. Measured: 844 x 390 gaps 5 to 8 px, 951 x 648 gaps 7 to 9 px, no overlap.
- UPRIGHT (portrait), fact: two overlapping rows (front grace, rose, tom, tnb, nara with `frontGap` [1,1,.82,1.1]; back boppy, deedee, justin, amy, olivia, michael with `backGap` [.5,.7,.5,.4,1.05], `backPivot` amy/olivia). No-overlap upright would make Tom about 125 px tall instead of 195; if Tom asks for it, show him that trade first.
- Tests: smoke FAILS [], tag_check ok.
