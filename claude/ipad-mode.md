# iPad mode (`tab1`, 2026-11-02, 97c6439 on main, CHANGES (106))

Tom (11-02 22:04): on iPad Pro landscape the game sat in a frame instead of going to the screen edges; he asked for an iPad landscape optimized mode.

Cause (fact): `#game` had `max-width:1100px`, and any screen of 1140 x 650 or more got the desktop frame (border, rounded corners, shadow, 900 px height cap). Both iPad Pro sizes in landscape matched.

What was built
- `detectTablet()` and `applyLayout()` in engine/audio.js set `html.tablet` and the CSS variable `--ts` (screen height / 620, clamped 1.25 to 1.6). iPad = user agent says iPad, or iPadOS posing as a Mac with touch; or any coarse pointer; short side at least 700 px. Overrides: `?tablet=1` / `?tablet=0`, or localStorage `le-tablet` = `on` / `off`.
- In tablet mode the layout follows how the device is held; `toggleLayout()` does nothing and the rotate buttons are hidden.
- CSS block `html.tablet ...` is the last thing in the last `<style>` of index.html. `#game` is full-bleed. In landscape, HUD, quest card, minimap, toast, hint, D-pad, A and menu buttons, dialog, title menu and the battle command strip use the phone landscape values times `--ts`. Battle strip width is `--b2pw` = clamp(280px, 224px x --ts, 360px).
- Not changed: pause menu and shop (already fine), iPad portrait, the 16:9 battle scene (dark bands above and below on a 4:3 iPad).

Tested in Chromium with touch and mobile emulation only (no real iPad, no Safari): 1376 x 1032 and 1194 x 834 landscape, title, Square, house, battle, pause menu, shop; iPad portrait; desktop keeps its frame; phones unchanged; smoke, tag check, camera_clamp all clean.

Look first on the iPad: RELOAD once (title shows `build tab1`). Are the controls and dialog the right size, does the battle strip read well, does anything overlap. Knobs: the `--ts` clamp in `applyLayout`, `--b2pw` in the CSS block. Nested `calc()` is used; Safari should handle it but it is unverified.

Possible follow-up if Tom wants the battle to use the iPad's 4:3 shape: move the command strip under the scene (portrait-style) or crop the painting. Bigger redesign, ask first.

Note: claude/next.md in this Project was NOT rewritten this session (it is about 160 KB and already behind the repo: the repo is at `tab1` on `music1`; the Music Library appears to be built). Next session: check `git log` and the top of docs/CHANGES.md first.
