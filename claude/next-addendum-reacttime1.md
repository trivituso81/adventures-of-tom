# reacttime1 (2026-11-13 22:30, main 139f3aa): reactions fire at the cue words; moods and reactions for the new chapter 1 and 2 dialogue. DONE and pushed, waiting on Tom's phone check.

Read with claude/next.md and claude/next-addendum-clips11.md (next.md not rewritten here so as not to clobber other sessions; fold this in at the next rewrite).

## What Tom asked (21:30)
1. The new chapter 1 and 2 dialogue has no emotion states: tag it.
2. Listener reactions must not start when the line starts, but when the line gets to the part that causes the reaction.

## Done (fact)
- Timing engine: docs/emotion-reactions.tsv has a new last column `at` = the exact words of the line that cause the reaction. `python3 tools/reaction-apply.py 1 2` turns it into a character position (third value in data/emotion-reactions.js). engine/emotions.js (`emoReact`, `emoCueTick`, `emoCueReached`, `emoCueWeights`, `EMO.pending`) poses the listener when the line reaches the END of those words. Clock: the spoken clip's own time (`DV.t0`, `DV.dur` in engine/dialog-voice.js), spread over the text with pauses for commas and sentence ends; the typewriter when there is no clip or sound is off. Empty `at` = line start. A cue at the very end fires 0.35 s before the clip ends (`EMO_CUE_TAIL`). The speaker's own mood is unchanged (from line start).
- Chapter 1: 39 new cast lines got speaker moods; all 110 scene lines have reactions with cue words. Tom is now surprised (was unimpressed) when the Mudling and The Big One first speak.
- Chapter 2: reactions switched ON (was chapter 1 only). The 114 new story lines are tagged ahead of the story build (106 cast moods, 3 townsfolk moods for Miss Odette and Dona Carmen, reactions on 109 lines). Their tsv rows use `file` = tools/voice-library/scripts/ch02-story-directions.json and `where` = the scene id; the lemon tree scene is filed as `ch2Lemon`. Keys are speaker plus exact text, so they apply as soon as the chapter 2 story is installed with the same words. The 55 lines kept from the live chapter 2 have cue words. Old chapter 2 lines that the story build will remove or reword keep their old rows with no cue.
- Rows of other chapters are short (no `at` field): the tools accept that.
- New test: `python3 tools/reaction_timing_test.py cases.json OUT` (sound on, same case format as reaction_test.py; `SHOTS=1` keeps a frame before and after the first cue of every page). Cases used: ch1Theft on map `grands` (party tom, grace, rose; unflag ch1-theft); ch1Mudling, ch1Skeeter, ch1Grump, ch1Spot on `hollow` start [6,19,"up"] with deedee; ch1Pond and ch1AfterBoss (pond case from next.md); ch1End on `grands` flags ch1-tin, unflag ch1-done; ch2Porch, ch2Smog, ch2End on `jpark`, party tom, tnb, nara, flags ch2-nara and ch2-starter.
- Tested: 291 reactions, none shown before its cue; smoke FAILS [], tag_check ok. Frames looked at in portrait (kitchen, dinner) and landscape (ch1Goal, ch1Mudling).

## Not done, known limits
- Nothing seen or heard on a phone.
- The clip clock is an estimate (clip length spread over the letters and pauses), not a word-by-word match of the audio. If Tom reports a reaction early or late on a line: first move its `at` words in the tsv; if lines are off across the board, the fix is real word timings per clip (ElevenLabs returns character timestamps when asked; store them beside each take in the Voice Library) and read them in `emoCueReached`.
- In `opening` the hug and ride choreography holds everyone's pose, so most reactions there do not show (as before). On Rose's mud blob line Tom and Grace are lying knocked over, so theirs do not show.
- Chapters 3 to 20 and Nine Scoops: reactions still off, no cue words.
- docs/REACTION_INDEX.md not rebuilt (tools/reaction-index.py still stops on the 32 old Vance rows).
- When the chapter 2 story is installed: change `file` on the 114 lines' rows to the scene file, rename `ch2Lemon` if the scene gets another id, delete the rows of removed old lines, rerun `tools/emotion-apply.py $(seq 1 21)`, `tools/npc-emotion-check.py --fix`, `tools/npc-emotion-apply.py`, `tools/reaction-apply.py 1 2`.

## Standing rule (Tom 2026-11-13 21:30)
A listener reacts at the point in the sentence that causes the reaction, never automatically at the start of the line. Every new reaction row gets `at` words.

## Waiting on Tom
Title stamp `build reacttime1` or later, sound on. Chapter 1 from the kitchen (Deedee's glasses, "EVERYTHING gives you gas") to the pond, then chapter 2 porch and 2nd Avenue. Check: each listener changes pose at the word that sets them off. Report any line where it comes early, late, or the mood is wrong (speaker or listener).

## Next session prompt
"Read claude/next.md, claude/next-addendum-clips11.md and claude/next-addendum-reacttime1.md and continue."
