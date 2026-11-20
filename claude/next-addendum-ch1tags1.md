# ch1tags1 (2026-11-17 19:40, main 33f803f): chapter 1 voice tags checked against Gemini's ElevenLabs v4 research

Read this with claude/next-addendum-ch1rebuild1.md. Its line "ch01-story-directions.json holds the 95 locked scripts verbatim" is now true for 85 lines; the 10 below differ in tags only.

Tom 19:32: check the chapter 1 voice tags against Gemini's research (uploaded text, not saved in the Project), change only tags the research says will sound worse, no spoken word changes, update the Voice Library, show only the changed lines.

## THE REPO FILE WINS
tools/voice-library/scripts/ch01-story-directions.json is the record for chapter 1 tags. The "Voice scripts" section of claude/story-ch01-draft2.md still shows the OLD tags on these 10 lines (the doc was not rewritten). Never copy tags from that section back over the repo file.

## The 10 changes
| Line | Was | Now | Reason from the research |
|---|---|---|---|
| Grace "Number three. Rose licked a muffin." | [flat, writing as she talks] [punchline] | [flat, writing as she talks, punchline] | a tag acts only on the words after it; two brackets back to back means the first acts on nothing, and extra tags cause instability |
| Boppy "The MUD gets a muffin and I don't?" | [hurt, baffled] [punchline] | [hurt, baffled, punchline] | same |
| Deedee "Three." | [flat, immediate] [punchline] | [flat, immediate, punchline] | same |
| Deedee "For once in his life he rounded DOWN." | [dry, staring up at it] [punchline] | [dry, staring up at it, punchline] | same |
| Deedee "He's been in the middle of that one for FIFTY-ONE years." | [dry, level] [punchline] | [dry, level, punchline] | same |
| Boppy "The FISH gets THREE?" | [hurt, baffled, louder than before] [punchline] | [hurt, baffled, louder than before, punchline] | same |
| Amy "Brother! ..." | [loud, teasing, Long Island] | [loud, teasing] | an accent tag must be repeated with the same wording on every line; the bare "Long Island" blocked make-index.js from writing "heavy Long Island accent" in that bracket |
| Aunt Ellie "Tom. They gave you a seat..." | [cool, elegant, Long Island] | [cool, elegant] | same |
| Deedee "There he is! ..." | [bright, thrilled, Long Island] | [bright, thrilled] | same ("warm Long Island accent") |
| Tom "... [beat] TWICE." | [beat] | [pause] | [pause] is the documented tag for a beat before a punchline |

None of the 10 had a clip, so no retake.json entry was needed.

## Left alone on purpose (the research does not say these sound worse)
- Body and action words in tags (pointing, staring up at it, not looking up, one raised eyebrow, running, looking around, sniffing, writing) and the sound nouns "real yelp" and "real scream". The research says v4 takes open-ended stage directions. They do break Tom's older rule of 2026-11-01 (voice only, no "yelp"); change them only if he says so after listening.
- Lines with three or four tags where each tag marks a real change of delivery (Tom's own tuned chapter 2 lines have three).
- Not tags, so not touched: TNB's script says "2nd ave" (the research says spell out digits and abbreviations: "second avenue"); voices.html still sends `speed` for some voices (kids 1.12) though the research says v4 has no Speed control.

## Seen, not caused by this build
`python3 tools/clip-audit/unused_voice.py` check 4 lists 93 dialogue clips not in harvest or source, including old chapter 1 lines (Deedee "rhubarb crumbs", Rose "The mud had EYES!"). ch1rebuild1 reported 0. Not purged here: find out which push brought them back before purging.

## Tests
make-index.js rebuilt data/voice-index.json (4 changed lines in the diff, the 10 scripts confirmed in the index with the accent in every bracket). smoke FAILS: []. tag_check ok. Nobody has heard a take.
