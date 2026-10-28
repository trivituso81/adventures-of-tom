# Chapter 14 done: The Rikers Wall of Rivituso Row

Status: built end to end, tested (smoke, ch11, ch11b, ch12, ch13, ch14), not yet baked for voice.

## Flow
ch13-done on Rivituso Row > ch14Open (card 14; TNB and Nara go to hold the breach against Auditors; Grace and Rose arrive from Sol's handcar and rejoin) > Deedee on the porch (amber to the waist, looping a rhubarb crisp) > ch14Deedee (Rose eats the crisp, the loop breaks, Deedee tells them how to reach Boppy) > ch14Gate (talk to armored Boppy) > Warden Boppy (non-violent) > ch14After (the plate melts, "I just didn't want to get too old to keep you all safe.", Deedee "You big nut, we keep each other safe.", Tombo Nobody Gets Past Us unlocks, Boppy and Deedee go back inside) > ch14-done.

## Flags
ch14-open, ch14-deedee, ch14-gate, battle:warden, ch14-after, ch14-done, tombo:boppy2.

## Files
data/ch14-monsters.js, data/ch14-battle.js, data/scenes-ch14.js, tools/ch14_test.py, docs/dialogue-scripts-ch14.json. Edited: index.html, engine/story.js (CHAPTERS[14]), engine/chapter-select.js (CHSEL_LAST=14, chselFourteen), engine/battle2.js (praise pool: warden), data/scenes-ch13.js (armored Boppy stays through chapter 14; two toast lines).

## Rules to carry into ch15
- Party in chapter 14: Tom, Amy, Grace, Rose (TNB and Nara hold the breach; Deedee and Boppy barred). Chapter 15 brings all eight to the table.
- The Warden fight is the Un-Grump system with three hooks (data/ch14-battle.js): hitting him heals the armor and costs warmth (b2ApplyEntry wrapper); DEFEND warms him (b2DefendSteps wrapper); the calm waits for Deedee's beat (b2Calm wrapper, b2WardenTurn). Every third turn: Gate Slam, telegraphed.
- Tom's Warden line to Vance's offer is canon: "We always make our connection."
- Item: Warden's Bucket keepsake (Rose calls it Sir Bucket).
