# Chapter 8 build tracker (Forty Loaves by Six)

Started 2026-11-14 18:12 by the chapter 8 build conversation. This is the one file the chapter 8 build reads first and rewrites last. It also holds the chapter 8 section that claude/story-build.md would carry (section 13). NOTE: the board row for chapter 8 in claude/story-build.md still says "Not started" and is stale. The chapter 8 build did not rewrite that 60 KB file, to avoid overwriting another session's edits. The next story-build.md writer should change the chapter 8 Live cell to: "Its own build conversation, see claude/ch08-build.md. Stage 1 (assets first) DONE and pushed as ch8assets1." and add this file to its section list.

Tom's prompt for every chapter 8 build session: "Read claude/ch08-build.md and claude/story-ch08.md. Continue the chapter 8 build at stage N." (Stage 2 is next.)

## Stages (each one finished and reported to Tom before the next starts)

| Stage | What | Status |
|---|---|---|
| 1 | ASSETS FIRST: every new picture into the Art Library (group "Chapter 8"), every line into the Voice Library with a direction | DONE, pushed 2026-11-14 18:23 as ch8assets1 (main bb65c51) |
| 2 | Reusable work and the teardown map: the walking pilot flame (leaves the stove through the dog door, marches down the boulevard, slides under the barn door, follows a party member up to three at a time, walks home down the street), the group line (four neighbors speaking as one), and a written list of every built chapter 8 story line to remove, mapped to its scene. Show Tom the flame walking on 2nd Avenue | NEXT |
| 3 | Scenes 1 to 7: plane texts, Tom's kitchen, the grey yard and the minivan block with the notice, the call to Grace and Rose, the pilot light leaving, the boulevard and the chained door, inside the Car Barn (Damp Blanket, Draft, Picky Lunchbox, the turntable). Test and push. Tom plays it | not started |
| 4 | Scenes 8 to 11: Boiler Room and Old Ironbelly (three fight lines, the pension talk, forty loaves baked on screen), opening the block (reuses engine/block-break.js), the potluck, the night scene with four texts, new battle barks for the four barn monsters, built text and the optional Nara plate and lunch pail scenes removed, tools/ch8_test.py (copy tools/ch7_test.py), push | not started |

## Stage 1 result (what Tom has to do now)

1. Art Library (ADMIN > ART LIBRARY), group "Chapter 8", 26 entries, all draft. Press Generate, then Approve. Start with ch8-flame-sheet (stage 2 needs it), then ch8-orange-block, ch8-coin and ch8-yard-grey.
2. Voice Library (ADMIN > VOICE LIBRARY), Chapter 8, Show > No clip yet. 178 lines with directions. Two of them ("BOO!" Rose and "Thank you, Bernadette." TNB) are word for word the same as chapter 7 and 6 lines and reuse those clips, so 176 need recording. Keep the bracket directions. Export pending and send the file to this conversation.
3. Or tell the chapter 8 build to go on with stand-ins (stage 2 does not need pictures except the flame).

Art entries (tools/art-library/ch08-prompts.js, spliced into data/art-prompts.json): Areas ch8-yard-grey, ch8-potluck-day, ch8-potluck-night. Props ch8-orange-block, ch8-coin, ch8-notice, ch8-rosebush, ch8-dough-counter, ch8-spinner, ch8-loaves, ch8-barn-door, ch8-blanket-states, ch8-draft-states, ch8-lunchbox-states, ch8-call-grace, ch8-call-rose. Enemies ch8-flame-sheet, ch8-ironbelly-sheet. Characters ch8-tom-poses, ch8-tnb-poses, ch8-bernadette-poses, ch8-washington-poses, ch8-cooks-poses, ch8-michael-carry, ch8-olivia-quote, ch8-nara-story.

Checked against the built art and NOT asked for again: the Jefferson Park plate (art/jpark.webp, 2nd Avenue is its lower half), Tom's house room, the Car Barn room with its turntable pit and bridge (art/carbarn.webp, bridge turned in code, data/scenes.js ch8SetBridge), the Boiler Room, the Wet Blanket, Draft and Picky Eater sheets, the Old Ironbelly boss and ending sheets (nothing in the art reads female), the neighbors' hero, walk and emotion sheets, the block-crack effect, the plain coin, the flashbulb, grape soda, the video call corner frame, Grace's chart, ch7-phone-girls (the flight-west photo).

Voice lines: tools/voice-library/scripts/ch08-story-directions.json (178), listed in tools/voice-library/harvest.json as scene:ch8Plane, ch8Kitchen, ch8Yard, ch8Call, ch8Flame, ch8Boulevard, ch8BarnInside, ch8Boiler, ch8Open, ch8Potluck, ch8Night. Scene names are PLACEHOLDERS: the build names its scenes whatever it likes but must make harvest.json match (patch it by hand, do not run harvest.py before the scenes exist, it would drop the queued lines). Voices: Old Ironbelly bigone, Damp Blanket log, The Draft skeeter, Picky Lunchbox toad, group line odette, Bernadette bernadette, Mr. Washington washington (accent added by the index builder). data/dialog-cast.js got the new names Damp Blanket, Picky Lunchbox, The Neighbors. TNB directions follow the ch2fix1 rule: mellow, no capitals, no exclamation marks.

## Things the build must know (found in stage 1)

- THE PLATE MISMATCH: art/jpark.webp has no house for Mr. Washington. The built map puts him at x8,y19 beside the RIVITUSO house (data/maps-la.js around line 279, and the chapter 8 block at line 846). ch8-yard-grey paints a grey circle on the lower-left lawn and adds a hose and three porch steps inside it. Stage 3 decides where the block stands and how the overworld shows the minivan block over that lawn. Look at the plate and the walk mask before placing it.
- NAMES: the script says Damp Blanket and Picky Lunchbox. The built monsters are ids wetblanket and pickyeater (data/barn-monsters.js), named "Wet Blanket" and "The Picky Eater". The sprites stay. Change the displayed names, intro and talk text. Keep the ids.
- OLD IRONBELLY IS "HE". Built text says "her" and "she": data/barn-monsters.js lines about 386 to 394 (comment, attacks "bumps {t} with her belly", die text), data/battle2-data.js around 887 to 894 (react lines), and any menu text. The boss voice id is bigone (built cast). The built fight (Bake three times, Heat steps WARM, HOT) is kept and gets the three new fight lines, one after each loaf.
- BUILT CHAPTER 8 TEXT TO REMOVE (script was written without reading it): data/scenes.js lines about 3905 to 4100 (SCENES.ch8Arrive, ch8Block, ch8Barn, ch8Paint, ch8Shop, ch8Lunch, ch8Plate, ch8Pail, the ch8PilotSteps helper, CH8_SHOPS; plus the boss, after-boss and feast scenes below), the neighbors' chapter 8 `when` lines in data/maps-la.js (around lines 846 to 860 and the barn objects around 838 to 843), the cab driver lines for ch8-sal and ch9-sol in engine/story.js (about 1366 to 1372), DEPARTURES[8] and ARRIVALS[8] in engine/travel.js, battle messages for the troublemakers in data/barn-monsters.js and data/battle2-data.js, the tutorial popups ch8blanket, ch8draft, ch8picky, and every line about the man in the long coat, the clock-face coin, earlier coin finds and the Moon Club clock seal. Build-order note: the flags (ch8-block, ch8-barn, ch8-paint and so on) drive quest goals and map gates (data/maps-la.js line 238 school gate, the Car Barn gate). Keep or rename them on purpose and test the jump.
- The built chapter also has the optional Nara plate and lunch pail scenes (ch8Plate, ch8Pail) and the Heart-Trace trace. The locked script has neither. Remove them unless Tom says otherwise (say so in the report).
- The block-breaking work is already on main (engine/block-break.js, tools/blockbreak_test.py). Scene 9 reuses it. Silence from the click until the color is back.
- Rule from the script: nobody speaks from the click until the color has finished returning; the troublemakers and the oven become ordinary things and cannot talk. Encounters in the barn are off after the block opens.
- The oven's door coin: the coin sits on his door in both the frosted and the warm states until Tom takes it (ch8-ironbelly-sheet poses 1 to 3).
- Chapter-select jump: engine/chapter-select.js now plays ARRIVALS[n] (ch7t1), so the new chapter 8 landing text must live in ARRIVALS[8].
- Battle barks for the four barn monsters are owed new lines at build time, in the same voices (the script lists them as "Also changes"). Write them in stage 4 and add them to the Voice Library then.
- make-prompts.js stops in this sandbox (npc-prompts.js reads a missing color). Splice new Art Library entries into data/art-prompts.json by hand: the file round-trips with json.dumps(indent=1, ensure_ascii=False) plus a newline.

## Push log
- ch8assets1 (2026-11-14 18:23, main bb65c51): stage 1. Smoke FAILS [], unused_voice all zeros, tag check ok.
