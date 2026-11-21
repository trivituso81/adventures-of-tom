# next.md addendum: painted battle meters (2026-11-05 21:45, `meter1`, CHANGES 287, main ddc0345)

Written as an addendum because claude/next.md was being rewritten by another session at the same time. Next session that rewrites next.md: fold this in as "NEXT TASK METERS", add `meter1` to the tags list (battle2-ui.js and main.js moved from `warmth1` / `sharp1` to `meter1`), set the build stamp to `build meter1`, then delete this file.

- Tom (21:14): "redo the meters in battle so they blend more with the painted aesthetic and color pallete and design elements."
- Done, one look for every battle meter: rounded well, the window frame's bronze rim (#b8914a), fill shaded top to bottom with a soft sheen. Colors [light, mid, deep]: HP meadow green, honey at half, terracotta at a quarter; Warmth and HEART rose; VP lake blue.
- Stage (canvas): `b2Meter(x,y,w,h,q,C)`, `b2MeterTag` (enemy letter medallion, Georgia), palette `B2_METER` in engine/battle2-ui.js. Meters of an enemy at the bottom edge are clamped onto the stage (logical stage is 576 x 324).
- Party window (index.html, theme-slate block): `.b2-bar`, `.b2-vp`, `.b2-tray`, `.bp-hp` (Rose Mode); the hearts are a painted svg built in `b2HeartRow`. Fill colors are CSS variables `--m1/--m2/--m3`. Old flat rules and rect drawing removed. No rule, number or layout changed.
- Not restyled (not meters, Tom did not ask): TURN ribbon tiles, status tags over heads, trait badges, target arrows, the menu-screen HP bars (`.mbar`, `.stat-bar`). If he wants the menu bars to match, reuse the `.b2-bar` rule.
- Tested: smoke FAILS [], cross_test FAILS [], portrait and landscape screenshots (393 x 852 and 852 x 393 at 3x). Rose Mode `.bp-hp` restyled but not looked at. Not seen on a real phone.
- Meter screenshot recipe: start a fight with `__LE.b2Start`, set `B2.party[i].hp`, `.vp`, `B2.heart`, `B2.crust`, `B2.foes[i].hp/.warm`, then `b2Open('cross')`.
- Push note: a docs/CHANGES.md conflict block can carry a `|||||||` base part; cut it by marker lines, not a regex.
- Ask Tom ONE line: do the meters fit the paintings now, or should anything be bigger, warmer or quieter?
