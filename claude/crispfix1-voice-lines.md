# crispfix1: spoken lines changed from crisp to apple muffins (2026-11-22)

Card c-crispfix. Tom (11-22): the chapter 1 mud monster steals Deedee's apple muffins, and crisp was struck from the project. These are the 19 live spoken lines that still said crisp for her dessert. Each now says apple muffins, with the same joke and contractions. A changed line plays no recording until it is recorded again: the old recordings said "crisp", so 16 baked clips were removed (git history keeps the audio, see docs/PURGED_VOICE.md). The other 3 never had a recording.

| Who | Where | Old line | New line | Had a recording |
|---|---|---|---|---|
| Grace | ch3, data/scenes.js | Tata. At the crisp. | Tata. At the apple muffins. | yes, removed |
| Rose | ch5 staff room, data/scenes.js | Apple muffins! Deedee brings the teachers CRISP? | Apple muffins! Deedee brings the teachers APPLE MUFFINS? | never had one |
| Boppy | ch7 kitchen chart, data/scenes.js | Gracie, my crisp is under there. | Gracie, my apple muffins are under there. | yes, removed |
| Grace | ch7 kitchen chart, data/scenes.js | Your crisp is under California, Boppy. Don't move. I'm presenting. | Your apple muffins are under California, Boppy. Don't move. I'm presenting. | yes, removed |
| Boppy | ch7 kitchen chart, data/scenes.js | I'll stay here and guard the crisp, Deary. | I'll stay here and guard the apple muffins, Deary. | yes, removed |
| Deedee | ch9 Moon Club, data/scenes.js | Oh, honey. Nobody has to turn off the lights. We'll come back. Every full moon. I'll bring crisp. | Oh, honey. Nobody has to turn off the lights. We'll come back. Every full moon. I'll bring apple muffins. | yes, removed |
| Marlowe (voice kit) | ch12, data/scenes-ch12.js | Long Island is under glass now, you know. Mr. Vance put a dome over it. It’s very safe. Your mother is in her kitchen, making a crisp. | Long Island is under glass now, you know. Mr. Vance put a dome over it. It’s very safe. Your mother is in her kitchen, making apple muffins. | yes, removed |
| Boppy | ch13, data/scenes-ch13.js | Nobody gets hurt. Nobody gets old. Nobody gets left. Your mother’s inside. She’s fine. She’s making a crisp. | Nobody gets hurt. Nobody gets old. Nobody gets left. Your mother’s inside. She’s fine. She’s making apple muffins. | yes, removed |
| Boppy | ch14, data/scenes-ch14.js | Inside. She’s fine. She’s making a crisp. Don’t look at the porch. | Inside. She’s fine. She’s making apple muffins. Don’t look at the porch. | yes, removed |
| Tom | ch14, data/scenes-ch14.js | She’s looping. Look at the tray. It’s the same crisp. Every time. It’s fresh, it’s perfect, and nobody ever eats it. | She’s looping. Look at the tray. Same apple muffins. Every time. They’re fresh, they’re perfect, and nobody ever eats them. | yes, removed |
| Rose | ch14, data/scenes-ch14.js | Deedee. I’m going to eat the crisp now. Okay? Okay. | Deedee. I’m going to eat the apple muffins now. Okay? Okay. | yes, removed |
| Rose | ch16, data/scenes-ch16.js | I kept the crisp tin. I’m going to fill it for when Deedee wakes up. | I kept the apple muffin tin. I’m going to fill it for when Deedee wakes up. | never had one |
| Deedee | ch20 Garden Bridge, data/scenes-ch20.js | Do not. It is for the crisp. | Do not. It is for the apple muffins. | never had one |
| Boppy | ch20, data/scenes-ch20.js | And the crisp is excellent. | And the apple muffins are excellent. | yes, removed |
| Deedee | ch11, data/scenes-p2.js | Tom! Sit. Eat. I made a crisp. Yes, I know it's nine in the morning. Do not argue. | Tom! Sit. Eat. I made apple muffins. Yes, I know it's nine in the morning. Do not argue. | yes, removed |
| Deedee | ch11, data/scenes-p2.js | A layover! Where? Never mind. Take a sweater. Actually, take two. And take the crisp. | A layover! Where? Never mind. Take a sweater. Actually, take two. And take the apple muffins. | yes, removed |
| Tom | ch11, data/scenes-p2.js | Dad’s in his recliner. Mom has the crisp. They’re fine. They’re probably fine. | Dad’s in his recliner. Mom has the apple muffins. They’re fine. They’re probably fine. | yes, removed |
| Grace | ch1 fallen branch, data/maps-le.js | Crisp first, Tata. Monsters later. | Apple muffins first, Tata. Monsters later. | never had one |
| Sal | ch1 cab stand, engine/story.js | Besides, you just got here. Go see your mother. She made crisp. | Besides, you just got here. Go see your mother. She made apple muffins. | yes, removed |

Not changed on purpose:

- Marlowe's next line, "She's been making the same one for hours." It still reads right with apple muffins (one batch) and keeps its recording.
- Move keys and code names that are not words anyone reads or hears: `D.crisp`, `deedee.crisp`, `B2_SUPPORT.crisp`, `P.crisp` and `crisp:true` on the chart prop, the trace id `ch3-crisp`, `crispDish()`.
- The word as an adjective ("crisp cartwheel", "very crisp. Very wardrobe.", crisp voice directions) and "crispy".
- Dead lines no scene plays any more (old chapter 1 and 2 drafts kept as history in tools/voice-library/scripts, docs/dialogue-scripts-*.json, tools/voice-recast, docs/emotion-reactions-stale.tsv, claude/ planning notes, docs/CHANGES.md).
