# Handoff: NPC delivery emphasis (2026-11-09)

Read first: claude/npc-voice-audit-11-09.md (audit record and palette), docs/VOICE_LIBRARY.md (sections "Comedy directions" and "Rewriting directions").

## Status
- 410 NPC directions rewritten (npcvoice1, npcvoice2). Words unchanged. Existing clips still play the old delivery until a take is recorded and merged.
- Aunt Ellie "outlived": Tom's take sounds drier and haughtier.
- Sal bucket: take 4 worked; takes 1 to 3 sounded the same as the built-in clip.
- Bernadette (penny) "The squirrels are organized": ALL CAPS on ORGANIZED had no audible effect (two script versions). Tom reports that `[emphasis]` placed before "organized" sounds right.

## Correction to the earlier analysis
The claim that caps are a weak emphasis signal was my inference and is NOT in ElevenLabs' docs. Sources read on 2026-11-09:
- ElevenLabs v3 prompting guide (elevenlabs.io docs, best-practices/prompting): "Capitalization increases emphasis."
- Runware Eleven v3 guide: capitalization "stresses individual words."
- Morphic Eleven v4 guide: capital letters for emphasis on one word.
- ElevenLabs v4 prompting guide: "Use Capital letters for emphasis" in its tag list (per Morphic).
ElevenLabs' stated advice is to combine caps, punctuation and tags. So a caps failure on one line is an unexplained result, not proof that caps don't work.

## Next step (decision for Tom)
1. Confirm the exact Penny line Tom tested with `[emphasis]`, and whether the caps stayed in.
2. If it worked, change the Penny script to the tested form (words unchanged) and rebuild the index. Ask first before any new take, since each take costs ElevenLabs credits.
3. Only if the test form does not help: run one controlled batch of 4 forms (tags only; ellipsis; caps; `[emphasis]` tag) on the same line, with Tom picking the best.

## Do NOT
- Do not send another caps-only wording for the penny line.
- Do not regenerate takes without Tom's go-ahead (ElevenLabs credits).

## Files
- tools/voice-library/scripts/directions-20261101.json (penny squirrels line currently `[hushed, dead serious] The squirrels... are ORGANIZED.`)
- data/voice-index.json (rebuilt; Library fetches it with no-store)
- tools/voice-library/make-index.js, voices.html

## Next session prompt
"Read claude/next-voice-npc-stoploss-11-09.md and continue."
