# NPC voice direction audit (2026-11-09, tag npcvoice1, main at 5c6f4e8)

Read with claude/next.md. next.md was not rewritten for this (other sessions were writing it at the same time); nothing in its ORDER NOW changes.

## What was done (fact)
- Tom: "audit all NPC character dialogue to create more emphasis, more personality, more dry humor", annotations to follow ElevenLabs best practice from the documentation and from other users.
- Scope: the 58 townspeople and walk-ons, 532 dialogue lines, every one already baked. 410 scripts rewritten, 122 left as they were (already right, or narration boxes).
- Not in scope: party members (Tom, TNB, Grace, Rose, Amy, Deedee, Boppy, Justin, Olivia, Michael, Nara), monsters, the Narrator, Vance and Marlowe.
- No spoken word changed. Every baked clip still plays. A line sounds new only after Tom records a new take in the Voice Library and exports it.
- Files: tools/voice-library/scripts/directions-20261101.json, scripts/zz-v4-overrides.json, data/voice-index.json. Rules written into docs/VOICE_LIBRARY.md ("Comedy directions"). CHANGES entry "npcvoice1".

## The call on words (recommendation, made)
Rewording a baked line silences it until it is re-recorded (CLAUDE.md hard rule 5, and the Project rule "never edit a baked line"). All 532 lines are baked, so the words stayed and the delivery carries the change. If Tom wants the words themselves made drier, he names the characters and that becomes a second pass where each reworded line goes silent until its new take.

## What the research said, and what it changed

| Finding | Source | What I did |
|---|---|---|
| Eleven v4 (model id eleven_v4, out since 2026-09-28) is the current model and follows tags more reliably than v3. The Library already records on it. | ElevenLabs prompting guide, Text to Speech product guide | No model change needed |
| A tag is free text that describes the voice. Tags that read like a sound or an action get misread. | ElevenLabs prompting guide | Kept the house rule (voice words only). Removed vague descriptors ("emphasizing", "recounting", "brightly hollow") |
| Place the tag right before the words it should change. One tag per beat. Stacked tags make it worse. | ElevenLabs guide, creator write-ups | The punchline gets its own tag right before it. Short lines lost a tag |
| Tags must suit the voice. A calm voice told to shout, or a bubbly voice told to be flat, ignores the tag or loses its character. | ElevenLabs guide, several user reports | My first draft put "deadpan" on 304 of 410 lines. I threw that out. Each character now underplays in their own way (table below). "deadpan" stays only on voices that are deadpan already |
| CAPS add emphasis. Ellipses add a pause and weight. v4 and v3 ignore break tags. | ElevenLabs guide | One CAPS word per line on the stressed word. An ellipsis before the turn |
| Short inputs are the least stable. Very low stability adds stray breaths and laughs. | User reports on v3, ElevenLabs v3 notes | Fewer tags on short lines. Voices stay at stability 0.5 |
| [pause], [long pause], [sighs], [laughs] are documented tags. Users report pause tags cause glitches when overused. | ElevenLabs guide, user reports | Not used. The house rule bans them and ellipses do the same job |
| Compare a tagged take with the old one before doing a whole batch. Tags are not exact commands. | Creator write-ups | See "Pilot" below |

## How each voice underplays a punchline

| Voice type | Characters | Punchline words |
|---|---|---|
| Dry already | Principal Pruitt, Tony, Ray, Larry, Gus, Reel, Marisol, Dana, Mr. Halverson, Claudia, Kevin, Yesenia | deadpan, flat, dry |
| Grand and arch | Aunt Ellie, Dolores | arch, cool, withering, dry |
| Whispered | Page, Wes | grave, flat, hushed |
| Officious | Bernadette | grave, officious, prim |
| Fast patter | Sal, Sol, Penny, Nickel | offhand, matter-of-fact, flat |
| Sincere oddballs | Pip, Bev, Sam, Luna, Juniper | sincere, solemn, earnest |
| Mellow | Moss, Dash, Don Beto, Fern, Sage | serene, mellow, unbothered |
| Sunny | Bean, Chet, Bun, Skye, Kit | unbothered, matter-of-fact, casual |
| Precise | Dot, Kiki, Priya, Dakota | flat, matter-of-fact, precise |
| Firm | Doña Carmen, Mrs. Alvarez | blunt, matter-of-fact, flat |
| Warm elders | Mr. Washington, Miss Odette, Grandpa Ike | unhurried, dry, knowing |

## Not checked (fact)
- No take was generated, so nothing was heard. Generating spends Tom's ElevenLabs credits.
- tools/voice-library/test.py fails at the Clear button with and without this change.
- About 9 narration boxes are voiced by an NPC's voice ("Mr. Washington is solid amber..."). Left alone. If Tom wants them read by the Narrator, that is a recast of those lines.

## Pilot before a full re-record (recommendation)
All 410 new scripts total about 46,600 characters. Record a small set first, one per voice type, and compare each with the built-in clip:
- Sal: "Airport? Tom. Your father is standing in the gate in a bucket. Go and see him first."
- Aunt Ellie: "Somebody once told me I was too much. I outlived him. I dressed beautifully at the funeral."
- Page: "Technically correct. Deeply concerning."
- Pip: "He gets nervous around cake. He'll be fine. He's a rock."
- Bernadette: "The squirrels are organized."
- Principal Pruitt: "Set every clock in the hall to seven. Seven o'clock. Not seven-thirty. Not six-fifty-nine. Seven."

## For the next session
- If Tom sends an export with new NPC takes, merge only the new takes the usual way (next.md, Mirrorball entry), then hash-check that only those keys changed.
- If he says a character sounds wrong after the pilot (too flat, CAPS too loud, pauses too long), fix that character's palette, not one line: edit the scripts with tools/voice-library/apply-scripts.py and rebuild the index. If the same complaint comes back twice, stop and follow the stop-loss rule.
- If he asks for drier words, do it per character, list the reworded lines for him first, and remember each one is silent until re-recorded.

## Sources
- ElevenLabs, Prompting guide (best practices): https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices
- ElevenLabs, Text to Speech product guide: https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech
- ElevenLabs, audio tags and character direction: https://elevenlabs.io/blog/v3-audiotags and https://elevenlabs.io/blog/eleven-v3-character-direction
- User and creator reports: https://jackrighteous.com/blogs/ai-creator-tools/eleven-v3-audio-tags-best-practices , https://oguzhankocakli.medium.com/t-4my-experience-with-elevenlabs-v3-what-actually-works-421e7308ddb1 , https://blog.picassoia.com/elevenlabs-v3-best-practices-settings-tags-voice-choice-fixing-odd-results , https://www.eesel.ai/blog/eleven-v4 , https://morphic.com/resources/how-to/eleven-v4-guide
