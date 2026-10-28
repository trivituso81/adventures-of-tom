# Chapter 19 done: The Unsent Dead-Letter Office

Status: built end to end, tested (ch19_test plus smoke, bg_test, ch11 to ch18), not yet baked for voice.

## Flow
Jefferson Park (TNB leads, Tom gone) > ch19Open (card 19, Nara at Tom's mailbox, which glows) > press A on the mailbox (7,20), GO DOWN > the Dead-Letter Office hub (deadletter, ch19Hub) > four doors, four solo rooms > Claim Desk bell (ch19Claim) > Oblivion Censor fight > ch19After (Tom is back, the Censor delivers Rose's pretzel) > ch19Feast (neighbors, cooking, Sal's cab 7) > ch19Thaw (snow globe in the Vault, Deedee and Boppy wake) > ch19-done.

## The memory rooms
- Rooms: memgrace (Gym Floor), memrose (Shoulder Hall), memamy (Finish Line), memtnb (Kiln Room). You walk each ALONE as that person (SOLO_SKIN in engine/tom-gone.js, followers hidden by STORY_WORLD).
- Each room: three memory pages (dlmem, flags mem-<who>1..3), then the pedestal (dlkeep) takes a keepsake (flag ks-<who>): Grace squishy, Rose pink ribbon, Amy stopwatch, TNB first cup.
- The Claim Desk (dlaltar) shows Tom as a growing light as keepsakes go in. All four: flag ch19-ready, press A on the desk.

## The fight
- Oblivion Censor (B2_SHAKE_STYLE.censor, data/ch19-battle.js): STRIKE IT OUT on everyone every third turn; below half HP two Dead Letters and a TOTAL REDACTION shield (2 Sparkle or Cozy hits, or any Tombo). Has a kind route (goal 520). Loss: press A on him to retry, everyone healed.
- Tom bursts back in at the Censor's first turn below half HP (b2TomReturns): full HP, takes Amy's slot, Amy sits on the bench (BENCH CALL swaps her back). If the party wins first (kind route, or one huge hit), ch19After calls tomBack() anyway.
- benchcall.js: bench reserves now also enabled for twinlens (a latent ch17 bug: it promised BENCH CALL but never had reserves) and censor.

## Tombos unlocked
grace3 (Grace keepsake), rose3 (Rose keepsake), tnb3 (TNB keepsake), nara3 (reunion), deedee3 and boppy3 (thaw).

## Flags
ch19-open, ch19-hub, mem-<who><1..3>, mem-<who>-done, ks-<who>, ch19-ready, ch19-claim, ch19-fight, battle:censor, ch19-tomback, ch19-after, ch19-feast, ch19-thaw, ch19-done. tom-gone is cleared by tomBack().

## Files
New: data/ch19-monsters.js, data/maps-ch19.js, data/ch19-battle.js, data/scenes-ch19.js, engine/ch19-render.js, tools/ch19_test.py, docs/dialogue-scripts-ch19.json.
Edited: index.html (5 script tags), engine/story.js (CHAPTERS[19]), engine/chapter-select.js (CHSEL_LAST=19, chselNineteen), engine/tom-gone.js (SOLO_SKIN, tomBack cap), engine/town-render.js (playerMember), engine/battle2.js (Nara Frantic with no Tom), engine/benchcall.js.

## Rules to carry into ch20
- Deedee and Boppy are awake but still barred from the party by CHAPTERS[19].party; ch20 decides. Tom is back (tomBack). Vance waits on floor 60, the sky has a stopped clock.
- Balance is checked by a scripted run only. If the Censor feels off on the phone, tune hp/mult in B2_FOES.censor in data/ch19-battle.js.
