# voicetags1 (2026-11-13 19:15): chapter 1 to 5 voice directions retagged for Eleven v4 timing, intonation and accents. WRITTEN, NOT INSTALLED

Tom 19:02: go through the chapter 1 to 5 dialogue and tag it by ElevenLabs' documentation and best practice for their LATEST model only, for the humor style; timing and intonation are key. 19:04: do not forget the accents; optimize everyone who is supposed to have one.

## voicetags4, main 9d0ff94 (2026-11-13 21:05): chapters 1, 3, 4, 5 rewritten to the model below
- Tom 20:48 asked for the chapter 2 treatment on chapters 1, 3, 4 and 5. All 354 scripts rewritten in the style of his 13 lines and pushed. All are in retake.json (Show > New direction lists the 43 chapter 1 and 2 chapter 3 lines that have a baked clip; the other 309 are under No clip yet). Nobody has heard them. Deedee, Boppy, Amy, Grace and Rose have NO example from Tom yet: their tags are from canon plus his Tom and TNB lines.
- Found after clips10 (other session, 8dc5874): Tom had recorded and tuned the first 81 chapter 2 lines himself, in order, not 13. Only 13 of his scripts are on record (from screenshots). For the other 68 the repo script is voicetags3's guess, while the baked audio is his take from his own edit. TO DO in the next merge: copy the `script` of each take in his export (local-clips-pending_7.json, or ask him to re-send it) into ch02-story-directions.json, then read all 81 as the model before touching any script again. The last 34 chapter 2 lines have no clip and keep the voicetags3 scripts.
- `[punchline]` is used on about 110 of the 354 lines. Tom used it once in 13. If he says it is overused or flattens the jokes, cut it back to puns and true reveals first.
- STOP-LOSS for this style: if Tom rejects these by ear, do not rewrite again from the same 13 examples. Get his 81 scripts first (above), or have him tune 5 lines for each of Deedee, Boppy, Amy, Grace and Rose.

## TOM'S MODEL (2026-11-13 20:17), voicetags3, main 3c5a7ef. THIS IS THE STANDARD NOW. It beats every rule below.
Tom tuned the first 13 chapter 2 lines by ear in the Voice Library and sent them as the model ("you actually have to hear it"). They are in tools/voice-library/scripts/ch02-story-directions.json, lines 1 to 13, exactly as he wrote them. Read them before writing any script. The other 102 chapter 2 lines were rewritten to match (not yet heard by him). Chapters 1, 3, 4, 5 are still the second pass and are NOT to be redone until Tom has listened to chapter 2 and said what to change.

His lines:
- Tom: `[correcting] Um actually it's Two thousand four hundred and seventy-five. [reminding doting] Delta counts every one... [slowly, admitting with guilt] and so do I.`
- TNB: `[skeptical] How many SkyMiles is that now?`
- TNB: `[amused annoyed] Babe! What are you SAVING them for?`
- TNB: `[slightly skeptical] You said that at [emphasized]THREE [normal] hundred thousand.`
- TNB: `[touched] Zero miles. Babe. [sarcastic] That's the most romantic thing a Delta person can say.`
- Tom: `[alarmed] Wait, why is the sky [disbelief] PURPLE? [trailing, puzzled] It's two in the afternoon!`
- TNB: `[resigned, nonchalant] It's been like that since this morning. [investigating] I held my soda up to it. [pleasantly surprised] It's the EXACT same color.`
- TNB: `[nonchalant] I don't know what it is, babe. [punchline] But it's pretty GRAPE.`
- Tom: `[anxious, amused] Don't make me laugh, it's freaky! [admitting] ...Okay. [agreeing] It IS a little grape.`
- Kept as they were: Tom `[proud, precise] Four hundred and twelve THOUSAND.`, Tom `[dreamy, hushed] Something really special.`, Tom `[defensive] It has to be REALLY special. [warm, softly] But I'd have flown here for zero miles.`
- Tom's "All yours. I like that." he replaced with `...`: a quiet moment, no words.

What his lines teach (the difference from both earlier passes):
1. A tag names what the speaker is DOING to the other person with that sentence: correcting, admitting, agreeing, reminding, doting, investigating, bragging. Not a mood adjective (proud, warm, easy). This is what makes it funny: the joke is in the intention.
2. One tag per sentence or clause, and it changes with every beat. Three short sentences get three tags.
3. `[punchline]` goes before the pun or the turn. Notes about the joke's structure are allowed and work by ear (the first pass removed "pleased with the pun"; that was wrong).
4. One word is hit with `[emphasized]WORD [normal]`, or with CAPS. He uses both.
5. The humor of the people: Tom is nit picky and correcting, then admits things with guilt; he dotes on Delta. TNB is skeptical, nonchalant, resigned, sarcastic with affection, amused and annoyed at once. Neither is "warm" or "easy" as a default.
6. Tags are loose natural words, one or two, no comma needed ("amused annoyed", "reminding doting"), sometimes a short phrase ("slowly, admitting with guilt").
7. The ellipsis before a turn stays. No pause tags. Pace words only when needed (slowly, trailing).
8. He rewords lines to sound said, not written: "Um actually it's", "Wait,", "it's freaky" for "I'm scared of it". And he will cut a line to silence when the moment is better quiet.

WORDS OWED (do this in the session that merges his next export, not before: a phone take is keyed by voice and text, so changing the game text first orphans his takes). Reword the game line (data/scenes.js), the script `text`, and the clip key together, and make the same changes in claude/story-ch02.md:
| Now in the game | Becomes |
|---|---|
| Tom: Two thousand four hundred and seventy-five. Delta counts every one, and so do I. | Um, actually, it's two thousand four hundred and seventy-five. Delta counts every one, and so do I. |
| Tom: Why is the sky PURPLE? It's two in the afternoon! | Wait, why is the sky PURPLE? It's two in the afternoon! |
| Tom: Don't make me laugh, I'm scared of it! ...Okay. It's a little grape. | Don't make me laugh, it's freaky! ...Okay. It IS a little grape. |
| Tom: All yours. I like that. | A silent page, "...". Drop its take. |

Queue: Show > New direction now works per line (retake.json `ats`; `it.rt` is the rewrite time). It lists the 102 rewritten chapter 2 lines for which Tom's phone take is older than the rewrite, plus the 43 chapter 1 lines. A pending export made before he re-records them would carry takes made from old directions: check take times against `ats` when merging.
The microphone error in his first screenshot ("AudioSession category is not compatible with audio capture") was fixed by another session in ab8841d.

## INSTALLED: voicetags2, main 8ff9798 (2026-11-13 20:05). Nothing below needs installing any more.
- Another session installed the first pass as voicetags1 (39d0d97, with the Deedee and Ellie accent rows and the pause-tag changes). This session then got push access and pushed the SECOND PASS over it as voicetags2: all five script files, the zz override for Boppy's "Tackle box" line, docs/CHANGES.md entry `voicetags2`.
- Tom 19:49: the chapter 1 lines were not in his queue. Cause (fact): all 43 already have his recordings (voice3), so they are not under Show > No clip yet. Fix: a new list, Show > New direction (voices.html `isRetake`; `rt` and `retakeAt` from tools/voice-library/retake.json via make-index.js). It lists a line that has a recording but whose direction was rewritten afterwards; the line leaves when Tom records a take after the rewrite, and for good once that take is merged. To add lines later: `node tools/voice-library/retake.js <scripts file>` then `node tools/voice-library/make-index.js`. The 43 keys are also in tools/voice-library/rewritten.json so the Library shows the new direction, not the one from ElevenLabs history.
- Tested: phone-size browser (New direction 43, all chapter 1; No clip yet 424), smoke FAILS [], tag check ok, unused_voice.py 0 on all five. NOT done: nobody has listened to a take; claude/next.md was not rewritten by this session (add a "Waiting on Tom" line there: record the 43 New direction lines and the 424 No clip yet lines, export pending, merge per "Phone clip exports").
- STOP-LOSS still stands (see below): if Tom rejects the second pass by ear, do not write a third; tune per voice from his notes on named lines.

## SECOND PASS (2026-11-13 19:50). The files in claude/voicetags1/ are now this pass. Read this section first; it beats anything below that disagrees.
- Tom 19:36, after sampling the first pass: "no good". His reasons, as rules: the first pass put a tag (usually two) only at the start of a sentence and never inside one; he wants a word stressed, or the tone changed, at the exact point in the sentence where it happens; "this is a key part of humor in storytelling"; it must be curated far more carefully.
- This is rejection 1 of the tagging. STOP-LOSS: if Tom rejects the second pass too, do not write a third. The likely cause then is that nobody writing the tags can hear the takes. Recommended change of method: Tom generates 10 named lines, says per line what he heard (too flat, too hammy, pause missing, word not stressed), and the tags are tuned to that voice from his notes, one voice at a time.
- What the second pass does differently (ElevenLabs: put the tag before the exact clause, and a new tag after it to change emotion mid-sentence; one emotion per sentence segment; ellipses slow a line; CAPS stress one word; Eleven v4 reads emotion from the text, so tags belong only where the delivery changes):
  1. The opening tag sets the baseline only, usually one word.
  2. The turn tag sits at the word where the voice changes, inside the sentence: `But it's pretty... [playful] GRAPE.` `He said... [deadpan] "Glub." [short pause] [brightening, proud] Then he gave Rose a gold coin.` `You're her... [amused] ONLY son, Tom.`
  3. An ellipsis right before the turn tag gives the beat (68 added). `[short pause]` only for a full stop-and-turn (13, never on an accent voice).
  4. One CAPS word per sentence on the stress word, also in lines whose on-screen text has no CAPS.
  5. Pace is tagged where it changes: slowly, slower, quicker, speeding up, drawn out, snappy.
  6. Lines that are one beat keep one tag (183 of 469). 168 lines have a tag inside a sentence. No fixed number of tags per line.
- Counts: 437 of 469 scripts differ from the repo's. Validated the same way as the first pass (words equal the line, accent in every Deedee, Odette and Carmen bracket, no pause tag on accent voices, at most two descriptors per tag, no body or prop words).
- Extra source: elevenlabs.io/blog/emotional-text-to-speech-with-eleven-v4.
- Because accent voices get the accent written into EVERY bracket, a mid-sentence tag on Amy or Boppy is sent as `[heavy Long Island accent, dry]`. That is intended (it also refreshes the accent mid-line), but listen for it on the first Amy and Boppy takes.

## Status (first pass, kept for the record)
- DONE: all 469 scripts in the five files tools/voice-library/scripts/ch01..ch05-story-directions.json were re-read against the current ElevenLabs pages and rewritten where needed (404 changed, 65 already fine). The five finished files are in this Project: claude/voicetags1/ch01-story-directions.json to ch05-story-directions.json. Same structure, same `text`, `voice`, `speaker`, `ctx`; only `script` changed. Based on repo main 515c8c2 (voice3).
- NOT DONE: nothing is in the repo or the live Voice Library. This session was refused push access to the repo (add_repo with access push was denied), so it worked from a read-only clone. No audio was heard: nobody has listened to a take made from these scripts.
- Checked by script on all 469: spoken words equal the line text (same `canon` rule as tools/voice-library/apply-scripts.py), no em dash, every script starts with a tag, at most two descriptors of at most two words per tag (accent not counted), no body, prop or sound words, no pause tag on an accent voice, the accent present in every bracket for Deedee, Miss Odette and Doña Carmen.

## Facts checked today (ElevenLabs, 2026-11-13)
- Latest text to speech model: Eleven v4 (`eleven_v4`, released 2026-09-28). voices.html already sends `model_id: eleven_v4` for every voice in these chapters. Nothing was tagged for v3 or older.
- v4 has no Style or Speed slider and no SSML (no break tags). Delivery is steered only by audio tags in square brackets, punctuation and text structure.
- A tag goes before the words it affects and carries on until the next tag. A new tag goes where the delivery changes. Cues in one bracket are separated by commas. One tag per clause; contrasting cues on the same words blur the read.
- Tags must describe something you can hear in the voice. ElevenLabs' own examples of what not to write: standing, grinning, pacing, music.
- Timing: ellipses add a pause and weight; CAPS add emphasis; `[short pause]`, `[long pause]` and pacing words (slowly, rushed, snappy, drawn out, speeding up) are documented.
- Accents: the documented form is `[strong X accent]`, marked as less consistent across voices ("results may vary", test per voice). Tags amplify a voice, they do not replace it.
- Sources: elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices (Prompting Eleven v4), elevenlabs.io/docs/overview/capabilities/text-to-speech/eleven-v4, elevenlabs.io/blog/elevenlabs-audio-tags-list.

## What was wrong in the old scripts and what changed
| Problem (count is approximate) | Fix |
|---|---|
| Chapters 2 to 5 had one tag at the front of nearly every line, so the set-up and the punchline were read in one tone | The punchline or turn gets its own tag right before it (208 lines now have two or more tags, was 30) |
| No timing marks | An ellipsis before a turn (14 added); `[short pause]` before the biggest in-line reveals (14, never on an accent voice); pacing words (slowly, rushed, snappy, quick, speeding up) |
| Stress left to chance | One CAPS word on the word that carries the joke or the pun (GRAPE, FISHY, CRUST, BOUND, HANGING). Lines that already had CAPS keep them |
| Words that are not a voice quality: grinning (16), bouncing, typing, "to the dog", "pleased with the pun" (13), "perfect timing", "adding to the list", "a craftsman's curiosity", "nervous laugh", "building to a huge sneeze" | Replaced by something audible: playful, dry, deadpan, cheerful, precise, steady, building, louder |
| Three or four cues in one bracket | Split over two tags at the point the delivery changes |
| Deedee carried no accent words at all (her voice entry has no `accent`; canon says Long Island) | `warm Long Island accent` at the start of every bracket of her 21 lines (the wording her 10-28 recast used) |
| Miss Odette (1 line) and Doña Carmen (2 lines) rely on the designed voice only | `light Louisiana Creole accent` and `light Salvadoran accent` in every bracket, matching their voice descriptions in data/dialog-cast.js |

Amy (46 lines) and Boppy (38 lines) are written WITHOUT accent words on purpose: make-index.js `ACCENT` and voices.html `accentAll` add "heavy Long Island accent" and "thick New York accent" to every bracket by themselves. Because of that, a bare `[short pause]` on those voices would be sent as `[heavy Long Island accent, short pause]`, so their timing uses ellipses and a new delivery tag instead.

## Rules for every script from now on (replaces the tag section of docs/VOICE_LIBRARY.md where they differ)
1. Model: Eleven v4 only. Check the ElevenLabs model page before a big tagging pass; if a newer model exists, re-check these rules first.
2. A tag is a voice direction: emotion, delivery, volume, pace. Never a face, gesture, action, prop, or a note to the actor about the joke.
3. One or two descriptors per tag, one or two words each. Accent words come first and do not count.
4. First tag opens the line. A second tag goes exactly where the delivery turns: before the punchline, the pun, the admission, the scare. Three tags only on long lines with three beats.
5. Timing: ellipsis before a turn; `[short pause]` only before a real reveal, only on voices with no accent, never at the end of a line. Pauses between two people are the game's job, not the clip's.
6. One CAPS word per line on the stress word. Puns: CAPS on the pun word and a `[playful]` or `[deadpan]` tag before the pun clause.
7. Underplay in the character's own way: Tom earnest, precise, proud; TNB easy, playful; Amy brisk, dry; Deedee dry, sharp, firm; Boppy playful, boastful, complaining; Grace matter-of-fact, precise; Rose bright, shrill, flat.
8. Accents: every bracket, same wording every time. Table is `ACCENT` in tools/voice-library/make-index.js.
9. Spoken words always equal the on-screen line. Only CAPS and ellipses may differ.
10. `[short pause]` and `[long pause]` are now allowed (ElevenLabs lists them for v4). tools/voice-library/apply-scripts.py still rejects the word "pause": change its BAD list when installing.

## Install (next build session, about 20 minutes)
1. Clone the repo with push access. Copy the five files from claude/voicetags1/ over tools/voice-library/scripts/ch0N-story-directions.json. If those files changed on main since 515c8c2, do not overwrite: apply only the `script` of lines whose `voice` and `text` still match.
2. In tools/voice-library/make-index.js add to `ACCENT`: `deedee:'warm Long Island accent'` and `ellie:'heavy Long Island accent'`; to `ACCENT_HAS`: `deedee:/long island/i, ellie:/long island/i`. This puts the accent on every Deedee and Aunt Ellie script in the whole game for new takes (canon: both have Long Island accents; today neither sends any accent words). Ask Tom nothing; tell him it was done.
3. In voices.html `accentAll` and in make-index.js, skip brackets that are exactly `short pause` or `long pause`, so accent voices can use pause tags later.
4. In tools/voice-library/apply-scripts.py remove `pause` from BAD and count pause tags outside the tag limit.
5. One line, Boppy "Tom. Tackle box. We do this the old way.", also exists in scripts/directions-20261101.json, which loads later and wins. If the new script should win, add it to scripts/zz-v4-overrides.json.
6. `node tools/voice-library/make-index.js`, `python3 tools/clip-audit/unused_voice.py` (0 on all five), smoke, bump tags, docs/CHANGES.md entry `voicetags1`, push.
7. Baked audio does not change. Chapter 1's 43 lines already have Tom's recordings (voice3): they sound new only if he makes a new take. Chapters 2 to 5 (426 lines): check which have no clip yet; those get the new scripts on first recording.

## For Tom after the install
- ADMIN > VOICE LIBRARY, Chapter 2, Show > No clip yet. Generate five lines first and listen before doing the rest: TNB "But it's pretty GRAPE.", Tom "He said "Glub." ... Then he gave Rose a gold coin.", Deedee "I PAID for those teeth." (chapter 3), Amy "Tab four says "Ask Tom." I wrote it in PEN." (chapter 5), Miss Odette "Sit DOWN. You're too skinny!". If a pause is spoken aloud or an accent sounds like a cartoon, say which line; that decides whether `[short pause]` and the three new accents stay.
- Not changed, on purpose: Stability stays at 0.5 for the family voices. ElevenLabs says lower Stability gives a more expressive, more varied read. If the new takes still sound flat, the next thing to try is Stability 0.35 on one voice, not more tags.

## Not covered
- The chapter 1 to 5 lines that were kept from the old game are not in these five files. They have Tom's recordings and his own annotations and were not touched.
- Chapters 6 to 20, battle lines, NPC small talk.
