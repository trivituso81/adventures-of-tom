# Square overhangs fix (2026-11-06, CHANGES 397, `towncut2`, pushed to main)
- Tom: characters walked over (not behind) the Rivituso Row arch, Crumb Bakery awning, Kettle Cottage teapot, Snail Mail sign.
- Fact: Snail Mail sign and Kettle teapot were not in `art/town-fg.webp`. Now cut by `SIGN_CUTS` in `tools/make_town_fg.py` (polygon plus GrabCut). Cutoff lines raised with `BASE_FIX` (bakery awning 590, Snail and Kettle roofs and both signs 1350, arch 1672). Rerun `python3 -I tools/make_town_fg.py`, paste the printed `PLATE_BEHIND.town=` line into engine/plate.js, bump tags.
- Not touched (ask Tom only if he reports them): Penny's, Moon Club, taxi signs.
- Pitfall hit: `git stash pop` after a rebase left conflict markers in engine/main.js and I pushed them (fixed in towncut2). Never `git add -A` before grepping for `<<<<<<<` in changed files.
- Waits on Tom's phone verdict. next.md not edited (other sessions own it); merge this line into it next time.
