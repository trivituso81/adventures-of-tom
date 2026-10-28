# Chapter 16 done: The Amber Eclipse

Status: built end to end, tested (smoke, bg_test, ch11, ch11b, ch12, ch13, ch14, ch15, ch16), not yet baked for voice.

## Flow
ch15-done > walk into the Square (trigger on the town map) > ch16Open (card 16; chapter 16; the family stands in the plaza facing the camera: Tom, Amy, Grace, Rose, TNB and Nara, with Deedee and Boppy beside them; Marlowe and a box camera on the sidewalk in front of the library; Vance's voice; the lens charges; the beam fires at the girls; Deedee and Boppy step in front, arms locked, and turn to stone; Vance "helps with Marlowe's notes" and Marlowe becomes an eclipse; Grace takes Rose and runs to Cab 7; Tom, Amy, TNB and Nara fight) > ch16Fight (talk to Marlowe to retry after a loss) > ch16After (silence and wind; Marlowe and the statues; "They're warm"; Vance's invitation, sixty floors; the glass comes down; the snow globe rises on a cable; card CHAPTER 16 COMPLETE) > Angel City cab stand, Tom, Amy, TNB and Nara, the girls waiting as home NPCs with new lines.

## Decisions
- Tom's brief put the statues "on Rivituso Row" and the scene "in the Square". Everything is in the Square, with the statues in front of the camera (north of the fountain, off the library door).
- The beam, the grey wash, the flash and the snow globe are drawn as screen effects over the scene (CH16FX, scenes-ch16.js). The globe is a procedural picture (glass sphere, little town, two grey figures, snow, a cable), not a scaled copy of the town.
- No victory jingle: b2Win is replaced for marlowe16 (data/ch16-battle.js). Sound is switched off from the win until the end of the aftermath (ch16QuietOn, ch16QuietOff); wind is a short filtered-noise burst (ch16Wind).
- Girls leave through setGirlsAway once they have run off screen; after the chapter they wait at the Angel City cab stand (ch16Girls reuses ch13Girls and swaps the lines).

## Flags
ch16-open, ch16-stone (Deedee and Boppy are statues; stays set), ch16-fight, battle:marlowe16, ch16-after, ch16-done.

## Files
New: data/ch16-monsters.js (Marlowe Transformed, Grey Note, glyphs L E N O), data/ch16-battle.js (boss numbers, silent win, quiet and wind helpers), data/scenes-ch16.js (scenes, screen effects, statue and camera world rules, retry), tools/ch16_test.py, docs/dialogue-scripts-ch16.json. Edited: index.html (three script tags), engine/story.js (CHAPTERS[16] rules, noFlight), engine/chapter-select.js (CHSEL_LAST=16, CHSEL_LEVEL[16]=21, chselSixteen), engine/town-render.js (object kinds statue and tripod).

## Rules to carry into ch17
- After ch16-done the party is Tom, Amy, TNB and Nara at the Angel City cab stand (lacab, 7,6). Grace and Rose are home NPCs at the cab stand (girlAtHome). Long Island is under glass: noFlight lines say so. The town map keeps the statue object (ch16-stone) but is not reachable.
- Deedee and Boppy are removed from the grands house while ch16-stone is set (STORY_WORLD rule, stash restores them if the flag is cleared in the same session).
- Chapter select to 17+ will not set ch16-stone by itself (it is set by an op, not a flag step); add it to the chapter 17 jump.
- Marlowe is despawned at the globe. Nobody knows where he went; chapter 17 can decide.
- Hint to remember: the statue is warm. Chapter 19 thaws them (Jefferson Park feast, Boppy sneezes at the cayenne).
- Vance has no spoken voice yet (talk name "Vance"); give him a cast entry before baking.
