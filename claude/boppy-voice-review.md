# Boppy voice review (2026-10-26)

Tom's note: Boppy sounds too gruff and mean. He is also kind, jokes when it fits, and gets frustrated with Deedee sometimes. Fix it with voice only (new baker, v4 bracket comments, finer voice settings, slightly higher pitch). No game text changes.

## Why he sounds mean (four gruff layers stacked)

| Layer | Today | Effect |
|---|---|---|
| ElevenLabs voice | Library voice "Jerry B. - New York Italian Mobster", similarity 1.0 | The source is a tough guy; similarity 1.0 keeps every bit of that grit |
| Character direction | "deep gravelly voice" (merged into every line's first bracket) | Tells v4 to add gravel on top |
| Per-line scripts | Every one of 51 battle scripts opens "[thick New York accent, gruff, ...]"; tags like roaring, furious, drill sergeant, territorial, ominous | Even the tender lines are read hard; v4 weights the first words of a tag most |
| Merge filter | voice-merge.js and voice-merge-dialog.js pitch Boppy down 2 semitones (rubberband pitch 0.9) | Deeper and darker; also muddies the chuckles |

What is missing: nothing in any script says warm, kind, fond, chuckling, teasing, proud, tender, sheepish. His comedy lines (sneaking a pepper, "The pond says otherwise", "I did? Sit down. I will tell you again.") are directed as grumbles.

## Decisions (build these; no questions)

| Setting | Old | New | Why |
|---|---|---|---|
| Voice ID | Jerry B (QzTKubutNn9TjrB7Xb2Q) | Keep | Tom picked it; the meanness comes from the layers on top. Fallback below if 5 test lines still sound mean |
| Character direction | deep gravelly voice | warm Long Island grandpa, kind, lightly amused | Sets the default read for every line; accent stays, gravel goes |
| Stability | 0.5 | 0.5 (Natural) | Keep; lower makes tags land harder but drifts off-voice |
| Similarity | 1.0 | 0.75 | Loosens the mobster texture while keeping him recognizable |
| Pitch at merge | 0.9 (down 2 semitones) | 1.0 (no shift) | Tom asked for slightly higher; dropping the shift is +2 semitones from today. Set in BOTH merge scripts |
| Scripts | thick New York accent, gruff | Per-line emotion only (claude/voice-baker-scripts-boppy.json, claude/dialogue-scripts-boppy.json) | Accent lives in the character direction once |
| Scope | | Re-bake all 51 battle lines and all 86 dialogue pages | Old clips cannot be un-pitched cleanly, and every old script was gruff |

Fallback if Jerry B still reads mean after the first 5 takes: design a new voice in the dialogue baker with this prompt and paste its ID into the battle baker too: "Man in his late seventies, Long Island accent, warm and dry, a grandpa who complains about his stomach as a joke and chuckles at himself. Kind, unhurried, slightly nasal, clear studio recording."

## Tone palette used in the new scripts

| Situation | Tag words | Example line |
|---|---|---|
| Greeting family | glad to see him, delighted, loving grandpa | Tom! Good. |
| Stomach and walking too fast | comic grumble, put-upon, fond exasperation, smiling under it | Everybody walks too fast! |
| Rikers and headcounts | playing warden, mock-stern, proud, a twinkle | Headcount, again. |
| Fish stories and 1970 | proud storyteller, nostalgic, settling in, vindicated, gleeful | I TOLD everybody! |
| Peppers | sly, grinning, enjoying himself, comic regret | That one's mild. Have another. |
| With Deedee, bickering | long-married fond exasperation, defensive, caught out | I am a sore WINNER. |
| With Deedee, tender | shy, sincere, softly | Deedee. May I. |
| Protecting the family | protective, proud, a grin in it (never furious) | Nobody gets past me! NOBODY! |
| Hurt and KO | winded, indignant, melodramatic, pitiful but funny | Tell Deedee I was brave. |

Banned in any Boppy script: gruff, gravelly, thick accent, furious, roaring, menacing, drill sergeant, territorial, ominous.

## Line counts

| Set | Lines | File | Baker |
|---|---|---|---|
| Battle (data/lines.js LINES.boppy, plus the pending Everybody Waits line) | 51 (+1) | claude/voice-baker-scripts-boppy.json | Battle Voice Baker, Boppy only |
| Dialogue pages (scenes ch1, ch3, ch9, ch10, Nine Scoops, his house NPC) | 86 | claude/dialogue-scripts-boppy.json | Dialogue baker, Boppy only, one file across chapters |

Keys are exact live text (version 1793064753-9a63). If the contraction build publishes first, re-key both files against the shipped text.
