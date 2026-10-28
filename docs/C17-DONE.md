# Chapter 17 done: Ascent of the Glass Tower

Status: built end to end, tested (smoke, bg_test, ch11, ch11b, ch12 to ch17), not yet baked for voice.

## Flow
Talk to Sol at the Angel City cab stand (lacab) after ch16-done > ch17Open (card 17; chapter 17; Grace and Rose rejoin; party lands on the boulevard) > press A on THE TOWER doors (north alley between Ramen Ramen and The Starlite, blvd 14,3 facing up) > Lobby (ch17Lobby) > east door to the Stairwell (floors 2 to 30, 7 Stillness guards, 3 coffee restore points) > landing 30 (ch17Landing) > service hatch (2,2) swaps the strike team > Shelf Hall: smash six shelves (face the shelf, A, SMASH IT) > ch17Locks (Archivist PA, locks 0 of 6) > hatch back, seal door (8,2) > ch17Race (Amy and Tom, floors 31 to 59, photo finish; sets tombo:amy3) > Vault: ch17Vault, Twin Lenses fight > ch17After (globe rises on its cable) > ch17-done.

## Decisions
- "Two strike teams of 3" with a player who is always Tom: Tom is the runner between the teams. TEAM STAIRS = Tom, Grace, Rose. TEAM SHELVES = Tom, Amy, TNB, Nara. The hatch on landing 30 swaps who is out front (ch17Team in scenes-ch17.js). Whoever is not out front waits: Amy, TNB and Nara on the bench, Grace and Rose as NPCs on the landing (they are NEVER benched: a bench save would make the loader treat them as at home and break). After the locks drop, the regroup is Tom, Grace, Rose, Amy out front and TNB, Nara on the bench; that is the Vault fight party.
- Shelves are an area objective inside the dungeon (towershelf props, flags shelf-0..5, counter ch17-smashed) instead of a server room; each is a town paused on its happiest afternoon and each smash finishes the moment.
- The express lift is "withdrawn" by the Archivist, which is what makes the stair race happen. The race is a screen overlay (CH17FX.race) ending in a tie; the Tombo is Tom + Amy amy3 "Sixty-Story Sibling Pace".
- The Twin Lenses are a Shake-style boss (like HUSH-9 and Marlowe): LONG EXPOSURE every third turn (all, Slow), Curators below half HP, TOTAL ARCHIVE behind an amber lens (2 Kinetic or Sparkle hits or a Tombo). No kind route.
- The Archivist is not cruel. It files. Rose tells it what to do with a day that is allowed to end.

## Flags
ch17-open, ch17-team (stairs, shelves, final), ch17-lobby, ch17-landing, ch17-hatch, shelf-0 to shelf-5, ch17-smashed (count), ch17-locks, ch17-race, tombo:amy3, ch17-vault, ch17-fight, battle:twinlens, ch17-after, ch17-done.

## Files
New: data/ch17-monsters.js, data/ch17-battle.js, data/maps-ch17.js (towerlobby, towerstairs, towershelves, towervault), data/scenes-ch17.js, engine/ch17-render.js, tools/ch17_test.py, docs/dialogue-scripts-ch17.json.
Edited: index.html (5 script tags), engine/story.js (CHAPTERS[17]), engine/chapter-select.js (CHSEL_LAST=17, chselSeventeen, level 22), data/scenes-ch16.js (end toasts).

## Rules to carry into ch18
- After ch17-done: party Tom, Grace, Rose, Amy out front, TNB and Nara on the bench, in the Vault (towervault). The pinnacle lift (north wall, 9,1) says FLOOR 60, BY INVITATION. Chapter 18 starts there.
- Deedee and Boppy are still stone; Long Island is the snow globe, now on its cable to floor 60.
- Vance has no spoken voice yet; the Archivist neither. Both need cast entries before baking.
