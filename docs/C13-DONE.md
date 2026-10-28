# Chapter 13 done: The Subway Beneath the Sea of Clouds

Status: built end to end, tested (smoke, ch11, ch11b, ch12, ch13), not yet baked for voice.

## Flow
Sol at the cab stand (after ch12-done) > ch13Open: the cousins' Network, Grace and Rose take the radio > Sub-Rail depot (Nickel confesses, gives gold) > tunnel (HUSH-9 debuts, cuts the radio) > chamber: Dual-Coast Drill Worm > coins melt the amber plate, Sal and Penny walk out > Rivituso Row: Boppy in glowing armor, "I made a deal." ch13-done.

## Flags
ch13-open, ch13-depot, ch13-hush, ch13-worm, battle:drillworm, ch13-after, ch13-clear, ch13-melt, ch13-melted, ch13-gate, ch13-done.

## Files
data/ch13-monsters.js, data/ch13-battle.js, data/maps-ch13.js, data/scenes-ch13.js, engine/ch13-render.js, tools/ch13_test.py. Edited: index.html, engine/story.js, engine/chapter-select.js (CHSEL_LAST=13), engine/battle2.js (praise pool).

## Rules to carry into ch14
- Party is Tom, Amy, TNB, Nara. The girls are NPCs (girlAtHome) at the cab stand. Calling setGirlsAway(false) now clears them from every world so they can rejoin.
- Armored Boppy (armor:true NPC) is re-spawned on Rivituso Row by STORY_WORLD while chapter 13 and ch13-done.
- Metro stairs on the boulevard re-enter the depot during ch13.
- The Drill Worm: Cave-In every third turn, Hushling adds, TAKE FIVE x3 un-grump route.
- Item: hardhat keepsake.
