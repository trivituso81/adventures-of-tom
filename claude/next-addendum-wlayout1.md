# wlayout1 and wlayout2 (2026-11-11 23:26 to 11-12 07:35, main ceff236): WELCOME LAYOUT editor

Read with claude/next.md. Waiting on Tom: his phone report on the editor.

## Facts
- Tom 11-11 23:26: "Design feature to allow sizing and position of characters on the welcome screen for each layout type." Built, tag wlayout1.
- Tom 11-12 07:10 and 07:12: a top button to hide the bottom controls (they covered the feet), and a way to send the picked character back or front. Built, tag wlayout2.
- ADMIN > WELCOME LAYOUT (`engine/splash-edit.js`, loaded after engine/splash.js). Edits the real welcome screen in the layout type on screen.
- Layout types (`SPLASH_LAYOUTS`, `splashLayoutKey` in engine/splash.js): `port` Phone upright, `land` Phone sideways, `duoland` Duo open sideways, `duoport` Duo open upright. iPad uses port and land.
- Data: `data/welcome-layout.json`, `{t, type:{id:{dx,dy,k,z}}}`: dx right, dy down in design units, k size multiplier about the feet, z layer (0 standard, lower is behind), on top of `SPLASH_LINEUP`. Draw order: layer, then feet (lower on screen in front).
- Controls: tap to pick, drag to move, minus and plus 2% size, arrows 1 px, BACK and FRONT one layer a press, ALL (group about Tom's spot), RESET, TURN (`toggleLayout`, off on iPad and open Duo), SAVE, DONE or CANCEL. HIDE CONTROLS / SHOW CONTROLS at the top left (`#spe-hide`, `splashEditBar`); drag still works while hidden.
- SAVE: GitHub commit of the json with the device token `aot-gh-token` plus a device copy in localStorage `aot-welcome-layout`; the newer `t` wins at start-up. CONFIRMED WORKING: Tom's saves landed on main on 11-12 (commits "Welcome layout saved from the editor"). His saves are commits on main: fetch and rebase as usual. Never overwrite his saved json with an older copy.
- Test: `python3 tools/serve.py 8011 &` then `python3 tools/welcome_layout_test.py [port land duoland duoport]`, shots in /tmp/wl.

## Not done
- Real phone and real Duo not seen by Claude. No pinch to size.
- The welcome heights in `SPLASH_H` are still typed there, not read from data/heights.json (heights1 open question (c)).

## Found on the way (fact)
- bounce1 (11-11 23:09, "characters bounce less") changed `SPLASH_HOP_H`, which only the old drawn scene uses (`SPLASH_ART=false`). The painted welcome screen's only motion is `SPLASH_BREATH` (amp .011 of the figure height, about 1 px on a phone). So bounce1 changed nothing visible. If Tom still sees bouncing, lower `SPLASH_BREATH.amp` or set it to 0, and purge the dead drawn-scene code (SPLASH_CAST, splashScene, hop, Nara ball) under the purge rule after asking him.

## If Tom reports
| He says | Do |
|---|---|
| Save said "this device only" | No token on that device: he sets it on the Art Library page, then SAVE again |
| Layers confusing (one press jumps past everyone) | switch `splashEditLayer` to swap with the nearest overlapping neighbour in draw order |
| Wants finer or coarser size steps | the 1.02 in the click handler and `splashEditKey` |
| Wants the logo or menu movable too | new entries in the same json; the logo is CSS background on `#splash-art` (index.html lines near 504, 1193, 1205) |
