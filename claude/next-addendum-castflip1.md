# Welcome screen cast order (2026-11-11 09:00, main 02a809d, CHANGES "castflip1")

Read with claude/next.md.

- Tom 09:00: reverse the people so each stands on the side of the welcome painting they come from (Long Island left: lighthouse, cottages; Los Angeles right: palms, skyline, observatory). Tom 09:03 (standing rule): Tom is always at the centre of the screen in every viewport.
- Fact: `engine/splash.js`. Landscape `SPLASH_SPOTS` mirrored (Boppy, Deedee, Grace, Rose, TOM, TNB, Nara front; Justin, Amy behind). Portrait `SPLASH_PORT` front Grace, Rose, TOM, TNB, Nara; back Justin, Amy, Boppy, Deedee. `splashPortLayout` and `splashLandLayout` now centre on Tom's spot and size the group by its wider half (`SPLASH_LAND.cx` removed).
- Checked: Tom's x equals half the screen width at 390 x 844, 375 x 667, 844 x 390, iPad both ways, Duo 951 x 648, 669 x 869, 466 x 657, desktop. Screenshots looked at. smoke FAILS [], tag castflip1.
- Known: in portrait the back row is a plain reversal, so Boppy and Deedee now stand behind TNB on the LA side. If Tom wants the grandparents on the Long Island side too, swap the two back-row pairs in `SPLASH_PORT.back` (one line).
- Rule for any future welcome change: keep Tom centred (place around Tom, never around the group middle).
