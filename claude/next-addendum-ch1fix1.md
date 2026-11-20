# ch1fix1 (2026-11-14, main abf0555): chapter 1 feedback from Tom's reports. Pushed, waiting on Tom's phone check and re-takes

Read with claude/next.md. Per-report detail and Tom's quoted notes are in docs/CHANGES.md "ch1fix1".

## Chapter 1 lines that changed (the game wins over claude/story-ch01.md, which still shows the old words)

| Scene | Speaker | Old | New |
|---|---|---|---|
| ch1Theft | Deedee | Tom, you must be starving! ... | Tom you must be starving! Sit. The crisp needs ten minutes on the counter. (comma removed) |
| ch1Theft | Rose | Deedee! A mud blob just climbed in the window, and it's running off with your crisp! | Oh no! The mud blob is stealing Deedee's crisp! |
| ch1Theft | Tom | (after Grace's poop line) That was UNCALLED for! | Moved: Tom speaks first after the blob leaves (same line, keeps its clip) |
| ch1Theft | Deedee | A WHAT climbed in my window? | What in goodness sake was THAT? |
| ch1Theft | Rose | It has EYES! The mud has EYES! | It had EYES! The mud had EYES! |
| ch1Theft | Deedee | Forty years in this kitchen. I've had ants... | Ants, I can handle. A raccoon, I can handle. Your father at midnight with a serving spoon, I've handled for forty years. But a MUD BLOB? |
| ch1Theft | Grace | A very fancy poop. | A very sneaky poop. (mood happy, giggling) |
| ch1Mudling | Deedee | one line "...so we can follow the trail." | two lines: "Look, rhubarb crumbs on the path. The little thief must have dropped them as it ran." / "That means we can follow the trail!" |

The 7 old clips are purged. The 8 new lines have no clip: Voice Library > Chapter 1 > Show > No clip yet.

## Other things built
- Boppy waits at (12,4) facing right from map load until `ch1-theft` (STORY_WORLD rule in data/scenes.js).
- Dialog faces for talking poses: `tools/sprite-bake/bake_talkpose_faces.py` writes portraits/talk/pose/<id>-<type>.webp and data/talkpose-faces.js (Tom, TNB, Grace, Rose, Deedee, Boppy). `engine/emotions.js` shows it on a talk-pose line. Rerun after any change to art/talk/<id>.webp or a head-size rebake (DY and HS env vars tune the crop).
- Grey patch v3 baked (`bake_closeup_ch1.py`; it always uses the newest version); prop tag in engine/prop-art.js.
- Gus: speed 1.15 in make-index.js, 14 lines retagged brisk and quick (they show under Rewritten in the Voice Library).
- ch1-doorframe prompt rewritten (ages only, red marker names beside a ruler, uneven spacing, Grace 5 lower than Rose 6, four or five GRACE 9 marks). Entry is back to draft.

## Still open (not fixed, named for Tom)
| Report | What is needed |
|---|---|
| 4sgz door frame picture | Tom: Art Library > Props > Chapter 1 > ch1-doorframe, GENERATE then APPROVE; then `python3 tools/art-library/bake_closeup_ch1.py` and bump tags (it picks the newest version file) |
| 7v5z Deedee glasses-on-head frame | art: a special dialog and map frame (Art Library entry to write) |
| mxvd mud blob does not match the style | art: new heist frames (Art Library) |
| 1a2w Boppy pose missing mustache | art: which pose sheet (talk or ability frame) needs checking, then a re-generate |
| c5no thinking and examining poses | build: tag every line where a person looks at or thinks about something another person says, then art for the pose and wiring (a new talking-pose type) |
| nre4 grass, bulb and cube together | art: one combined picture entry |
| a0r8 "facing the wrong way" at Dot's line (town 25,11) | could not tell which character; Dot's mood pose is front-facing by design. Ask Tom who |
| 9h7v Moss re-record, kuq6 Oolong accent | already changed in make-index.js by another session; Tom re-takes the lines |
| ch2 reports (es1t, fmss, ux5f, g4gl, 4dlv, oed4, w82d) | chapter 2, not touched |

## Gotchas hit in this build
- `harvest.py` drops the queued chapter 7 lines: patch harvest.json by hand (remove old keys, add new) instead of running it.
- `emotion-apply.py` stops on chapter 7 rows that no scene plays yet, so data/emotion-moods.js was edited by hand for the 8 lines (the tsv rows are right; regenerate once chapter 7 scenes land).
- Other sessions pushed three times during this build: after each rebase take upstream for generated files (voice-index.json, dialog-ch28.js, harvest.json, moods, talk-types), reapply by script, rerun make-index.js.
