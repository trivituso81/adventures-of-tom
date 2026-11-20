# bern1b (2026-11-14 about 17:00, main dfd94b5): the Bernadette rewrite is BUILT AND PUSHED. Newer than claude/next.md and than the status line of claude/bernadette-rewrite.md

Tom 15:05: "Read claude/bernadette-rewrite.md and build it. Make sure to add nuance, not only to the sentences that you write for her in the voice library, but also like specific words or parts of the sentences to make her sound extra annoyed, bitchy, and resentful." That is his approval of the draft. claude/bernadette-rewrite.md still says "NOT approved, NOT built" at the top: that line is out of date. Its sections 1 and 3 are now canon and as built.

## What is live (build label bern1b)
- data/scenes.js `ch6Park` and `ch6End`, data/maps-la.js Old Oak Park: every built Bernadette line is the "After" column of claude/bernadette-rewrite.md section 3, plus Tom's and TNB's new and changed lines around her. New scene helper `lookBeat(a,b,back)` in data/scenes.js: two people turn to each other for a beat, then turn back (used once, after "You're the Other Tom.").
- Her voice: her own key `bernadette` in data/dialog-cast.js (Penny and Nickel keep `penny`). FACT: the draft named the `dolores` voice, but that ElevenLabs voice was deleted (404 since 11-08) and already falls back to Oolong's voice id. So `bernadette` is `from:'oolong'` with a small pitch lift at merge (FX `bernadette`, 1.04, tools/clip-audit/voice-merge-dialog.js). No accent words. Nobody has heard it.
- Directions: tools/voice-library/scripts/ch06-story-directions.json has 36 Bernadette scripts (184 tags) and 12 Tom and TNB scripts. Style: every tag says what she is doing to the other person (ordering, correcting, pulling rank, keeping score, rubbing it in, talking down, martyred), tags sit inside sentences on single words, `[emphasized]WORD` on the word that carries the grudge. Her fixed word reads: "3468" like a case number, "the OTHER Tom", NINETEEN years bitter, "the DOG" (refuses the name), CAPTAIN pulling rank.
- Clips: 21 purged (her 19 chapter 6 clips, TNB's 2). Her 7 potluck clips were moved to `bernadette|text` with the audio untouched (tools/voice-library/rekey-voice.js) and show under Show > Old voice.
- Voice Library chapter 6: the 170 queued lines from ch6assets1 had been missing since backlog1 (a harvest run dropped them). They are restored in tools/voice-library/harvest.json.

## Canon line (copy into claude/canon-addendum.md "Characters and tone" the next time that file is rewritten)
- 2026-11-14 15:05 (Tom): Captain Bernadette, 66, 5'4", Neighborhood Watch Captain of Old Oak Park for nineteen years, is bossy, short-fused and takes everything personally: nineteen years of being right and never thanked. She gives grown adults orders, never says thank you or sorry, and does not use names: Tom is "3468", TNB is "the Other Tom", Nara is "the dog". She is on the family's side and usually right. Rude, never cruel. Tom takes her with strained politeness, TNB with dry asides and half admiration, and the two trade looks. This is the one approved exception to "Tom is never annoyed": it is aimed at a neighbor, never at family or TNB.

## Voice sheet entry (copy into claude/voice-sheet.md "The people")
- Bernadette: voice key `bernadette` (Oolong's voice id, pitch 1.04). Clipped, commanding, sour. Tags: what she is doing to the listener, plus word-level stress on her grudge words. Never warm, never officious-polite. A grudging line still costs her something.

## Owed by other sessions
- Chapter 6 build conversation (stage 3): for scenes 4, 14 and 15, the "After" column of claude/bernadette-rewrite.md section 3 beats claude/story-ch06.md (that file was NOT edited). Her unbuilt lines are already queued with directions and harvest rows (`scene:ch6Park`, `scene:ch6Discovery`, `scene:ch6End`): the 5 picnic-table lines, "You were looking.", the 5 discovery lines, "Also in the report...", TNB "I wasn't going to touch it!" and "N, A, R, A.", Tom "Thank you, Bernadette." Two new actions to stage: [Tom opens his mouth. TNB puts a hand on his arm.] and [TNB looks at Tom. Tom looks at the sky.]. Speaker voice key is `bernadette`, not `penny`.
- Chapter 8 writing session: write her from claude/bernadette-rewrite.md section 1. Her seven built potluck lines are untouched and still in the old voice.
- Chapter 7 build conversation: ch7s3 left 17 cast mood rows and 2 townsfolk mood rows for lines it replaced (docs/emotion-index-lines.tsv, docs/npc-emotion-lines.tsv). They block tools/emotion-apply.py and tools/npc-emotion-apply.py. Also unused_voice.py check 4 lists 9 chapter 7 clips of replaced lines (61 in all, 52 before).
- Any session that runs tools/voice-library/harvest.py: it drops every queued line. Merge the old harvest.json rows whose text is in a scripts/ch0N-story-directions.json file back in afterwards (that is how the chapter 6 queue was lost at backlog1).

## Not done, not checked
- The look between Tom and TNB was checked by their tile positions (TNB one tile left of Tom), not seen in a frame: the test tool only photographs dialogue pages.
- claude/story-ch06.md, claude/canon-addendum.md, claude/voice-sheet.md and claude/next.md were not rewritten (each must be rewritten whole). This file carries what they need.
- Push history: a first push (265f91d) held only a broken tag commit with merge markers in index.html and engine/main.js. It was reverted within a few minutes (ab2e709). Lesson: never run `git rebase --skip` in a loop; check which commit stopped before skipping.

## Waiting on Tom
1. ADMIN > VOICE LIBRARY, Chapter 6, Show > No clip yet. Record these three Bernadette lines first and listen: "Stop right there. Neighborhood Watch. Names and house numbers.", "The squirrels are organized.", "I don't do initials. You're the Other Tom."
2. If the voice is right, record the rest of her lines and export pending. If she sounds too cozy, the one-line change is `from:'ellie'` (Aunt Ellie's dry, unimpressed voice, which carries a Long Island accent) in data/dialog-cast.js; if only too high or too low, change the 1.04.
