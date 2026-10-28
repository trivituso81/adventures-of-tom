# Chapter 18 done: No Touching, Please.

Status: built end to end, tested (smoke, bg_test, ch11 to ch18 tests), not yet baked for voice. Pushed to main.

## Flow
Vault (towervault) > press A on the pinnacle lift (north wall) > ch18Open (card 18, chapter 18, party Tom, Grace, Rose, Amy out front, TNB and Nara on the bench, lift to floor 60) > Chronos Loom Chamber (towerpinnacle) > ch18Pinnacle (Vance talks) > ch18Fight (survival fight) > ch18After (Tom turns to light, whiteout) > Jefferson Park > ch18-done.

## The Tom exit (decided first)
- Tom stays the save-file hero. Nothing in the save format changed. Flag `tom-gone` plus engine/tom-gone.js (tomGone, tomGoneApply, tomBack) splice him out of `party` on load and on every applyPartyRules.
- TNB becomes the lead: he is moved from follower/bench into `party`, and the player sprite is drawn as TNB (playerSkinId). The menu roster shows no Tom.
- Loading a save from before the exit brings Tom back. Loading one after takes him out again (tested on the same page and a fresh page).
- ch19 plays as TNB, Amy, Grace, Rose, Nara. Return: call tomBack() (clears the flag and puts Tom first again).

## The fight
- Julian Vance, unwinnable (b2ApplyEntry resets his HP). He alternates AIM (shown on the turn ribbon) and FIRE. Rays 1 to 3 hit only Tom for 30, 36, 44 percent of his max HP (x0.6 if guarding), never below 1 HP. Ray 4 turns Tom's HP bar to light (unit.light) and ends the fight with result 'erased'. Nobody else is ever hit. No XP.
- Tom's DEFEND line "No touching, please." plays on every cover.

## Flags
ch18-open, ch18-pinnacle, battle:vance (lose = erased), ch18-after, tom-gone, ch18-done.

## Files
New: data/ch18-monsters.js, data/ch18-battle.js, data/maps-ch18.js, data/scenes-ch18.js, engine/ch18-render.js, engine/tom-gone.js, tools/ch18_test.py, docs/dialogue-scripts-ch18.json.
Edited: index.html (6 script tags, light-bar CSS), engine/story.js (CHAPTERS[18]), engine/chapter-select.js (CHSEL_LAST=18, chselEighteen), engine/battle2-ui.js (light bar), engine/battle-draw.js (glass-tower backdrop now wins over the Long Island pond image; fixes ch17 Twin Lenses too), engine/intro.js (intro.whiteout), engine/town-render.js (TNB skin), data/maps-ch17.js (lift text), data/maps-la.js and data/dialog-cast.js (Michael/Olivia lines).

## Rules to carry into ch19
- Balance is checked by a scripted run only. Tom can survive the three rays with DEFEND and a heal. If it feels too hard or too easy on a phone, tune CH18_PCT in data/ch18-battle.js.
- Deedee and Boppy are still stone in the globe on floor 60.
