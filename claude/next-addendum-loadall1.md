# next-addendum: loadall1 (2026-11-11 12:40 to 13:00, main fbb6f5c)

Merge into claude/next.md at the next rewrite. Does not change THE ONE NEXT TASK.

- Tom: "the Load screen (wherever accessed) still only has 3 save files in view. since there are now 10 save slots, make any of the 10 that are used displayed in every load screen".
- Fact: there are two Load screens. (1) Title and welcome Load page (`loadMenu` in engine/intro.js, drawn by `titleAsk` in engine/splash.js): already listed every used slot (autosave plus 1 to 10) in a scrolling 2-column grid; unchanged. (2) In-game menu Load tab (`renderSaveTab` in engine/menu.js, tab id `saves`): listed all 11 rows including empty ones, so used saves sat below the fold. Changed to list used slots only, "No saved games yet" line when none, tighter rows (`.loadlist` CSS in index.html). The HUD save popup is the Save screen, not Load, and was left alone.
- Checked in Playwright with 10 seeded saves at 390 x 844, 375 x 667 and both landscapes: Slot 10 is reachable by scrolling in both screens. Note: title Load in landscape hides the per-save detail lines when the list has 9 or more entries (`html.landscape .sp-choices.grid:has(> :nth-child(9)) .sp-sub`, index.html); left as is, mention to Tom only if he asks for details there.
- Tag loadall1, smoke FAILS [], tag_check ok. Phone check for Tom: open menu > Load and scroll to Slot 10; title > LOAD.
- Test recipe: seed `localStorage` keys `aot-save-auto`, `aot-save-1`..`10` with `{"v":2,"when":..,"map":"square","party":[{"id":"tom","level":3,"xp":0,"hp":30,"maxHp":30}],"time":600,"coins":10,"bag":[],"visited":[]}` via an init script; title: `splashGo(loadMenu)`; menu: `intro.active=false; openMenu(); menuTab='saves'; renderMenu()`.
