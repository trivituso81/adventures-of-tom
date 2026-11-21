# Nine Scoops, the 80-minute version (built 2026-10-27, live in game v320, version id 1793109577-fc29)

Tom asked: double the story, no new monsters, five quests that fit the theme, the dungeon run twice (the boss wins at the midpoint
and the family runs; the second half is finding a way to beat him), a big birthday party with all of Grace's friends, and three free
birthday things for Grace at the store (white fuzzy-cuff shirt, cozy brown pants, gold sparkly HAPPY BIRTHDAY sash with a dramatic
two-turn stat boost). All in data/bonus-nine-scoops.js except the small engine edits listed at the bottom.

## Story order (flags in brackets)

| # | Where | Beat | Flag |
|---|---|---|---|
| 1 | Taxi depot | Opening, unchanged | ns-open, ns-goal |
| 2 | Creamery (SCOOPS) | 3 Sprinkle Gremlins, Mr. Pistachio out of the cube | ns-creamery |
| 3 | Fountain | Slushie Slug, scoops 1 to 3 | ns-fountain |
| Q1 | The Square | THE INVITATIONS. Amy phones: Justin never mailed them. Hand three to Pip, Moss and Dot (Grace's friends). The way north is gated (Grace: "Invitations FIRST") until all three | ns-invite, ns-inv-pip/moss/dot, ns-invites |
| 4 | Hollow trail | 2 Cone Heads, Moo-rielle taken and won back, scoops 4 to 6 | ns-trail |
| 5 | Pond, RUN 1 (midpoint) | Brain Freeze. At half HP: ICE SHELL, Rose frozen mid Boo, DEEP FREEZE on everyone (35% HP each). Fight ends with result 'flee'. He keeps the six scoops and Moo-rielle. Tom and Grace push frozen Rose back to the Square ("She's SLIDING." "She's frozen, not broken."). North is gated until ns-ready | ns-pond, ns-fled, ns-rosefrozen, ns-cow-stolen, ns-scoops 0 |
| Q2 | RIVITUSO house | WARM HER UP. Deedee thaws Rose with a hug (cube cracks, "I was in the MIDDLE of a boo."). Glasses gag: in the oven mitt, on her hand; Boppy notices. "Cold doesn't beat cold. Warm beats cold." Boppy: my peppers | ns-thaw |
| Q3 | Rivituso Row garden | BOPPY'S PEPPERS. Press A on the pepper planter (20,16): 3 gremlins stealing warm things. Reward: 3 Boppy's Pepper (battle item, 90 damage, Cozy: cracks the ICE SHELL). Boppy from the window: leave the ghost one. Rose pockets a little one | ns-peppers |
| Q4 | Creamery | THE OLD FREEZER. Mr. Pistachio: Brain Freeze was his first chest freezer, 20 years, replaced in spring, never said goodbye, never had a birthday. "The door is the soft part. Nobody ever stuck one thing on him." Tom looks at his bag. 2 Hot Cocoa | ns-pistachio |
| Q5 | GREGORI house | PARTY HEADQUARTERS. Amy's plan: bring the party to him. Justin's light-up banner (key item). "Hang it ON him." Friends come at four | ns-banner, ns-ready |
| 6 | Pond, RUN 2 | Brain Freeze with Moo-rielle on his lid. Fight (tut nsBoss1b, peppers in the Bag). At half HP: shell again, he aims the cold at Rose, Rose is spicy ("I ate a pepper. Half a pepper.") and stays thawed. Result 'shell'. Grace works out the door; Tom: presents before cake; the Instax, the cab photo on his door, the banner lit. Phase 2 fight (BIRTHDAY WISH, peppers crack the shell) | ns-pond2, ns-printer, tombo:wish, ns-banner-hung |
| 7 | Pond | Scoops 7 to 9, Moo-rielle back, Pistachio's happy birthday relayed, the invitation | ns-clear |
| 8 | GREGORI house | THE PARTY: Amy, Justin, Deedee, Boppy, Pip, Moss, Dot, Mr. Pistachio, Brain Freeze. Sundae, cake, Rose blows the candles, Dot counts. Amy: Penny has three birthday things, on the house. BONUS CHAPTER COMPLETE | ns-done, ns-sash-shelf |
| post | Penny's Pockets | Grace's tab opens first: Birthday Sash, Fuzzy-Cuff Shirt, Cozy Brown Pants, all FREE | |

## The three free items (data/party.js items, defined in the bonus file)

| Item | Slot | Does |
|---|---|---|
| g_bshirt Fuzzy-Cuff Shirt | Outfit (white, recolors her top) | +14 HP, +4 WARMTH, +2 COOL |
| g_bpants Cozy Brown Pants | Charm | heals 5% HP each turn, COOL +10% |
| g_bsash Birthday Sash | Sash (a fourth slot Grace gets only after ns-done) | +2 WARMTH, +2 COOL, and the Birthday Girl status for her first 2 turns of every fight: POW, WARMTH +75%, GRIT, COOL +50%, PEP +50%, crits +25%. B2_STATUS.bdaysash, set in a b2Start wrapper, turns:3 so it ticks off at the start of her third turn |

The Sash slot: data/party.js `wearSlots(m)` = SLOTS plus m.extraSlots; grace.extraSlots is set by a STORY_WORLD rule while in the bonus with ns-done. engine/menu.js and engine/progress.js loop wearSlots(m) instead of SLOTS. Outside the bonus nothing changes (sashslot_test.py checks chapter 3 shows three slots).

## Engine edits outside the bonus file (keep in mind when merging)
- data/party.js: SLOT_LABEL/SLOT_SHORT Sash, wearSlots, statBonus uses it.
- engine/menu.js: five SLOTS loops use wearSlots(m). engine/progress.js b6Perks loop too.
- engine/shop.js: price 0 shows FREE; buyItem says "on the house"; PENNY.free lines.
- engine/splash.js: the bonus blurb says about 80 minutes.
- v320 also carries the verify session's Slushie Slug eye marks and the Cone Head scale 2.5 (merged from live v319 before publishing).

## Tests
- claude/ns_test.py (rewritten): the whole chapter end to end, every quest, both runs, the party, the shelf, the sash in a fight. About 12 minutes. BUILD=/home/claude/live2 python3 claude/ns_test.py
- claude/sashslot_test.py: slots and shop in chapter 3, Rose Mode icons for nspepper and grace.instax.
- smoke.py IDS=grace,rose and kit_test.py grace tom were green on this build.

## New spoken lines (unbaked, speech synthesis): tom.run_away, rose.spicy. Scene dialogue is synthesized as always.
