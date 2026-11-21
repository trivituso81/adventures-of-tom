# Voice rules (standing, updated 2026-10-28)

## Hand-written directions are never dropped (2026-10-28)
- Tom (2026-10-28): "last time you did this you lost all the baker annotations." Any re-bake of an existing line MUST start from its hand-written script (claude/dialogue-scripts-*.json, claude/voice-baker-scripts*.json, claude/pending-baker-scripts.js). Auto-tags are only for lines that never had a script.
- To fix wording, use repo tools/clip-audit/keepscript.py: it keeps every tag and pause and swaps only the words that differ by a contraction. Check tag counts against the original before sending a baker.

## Spoken words must match the line text (2026-10-28)
- Tom (2026-10-28): clips still said "she is" under an on-screen "she's". Cause: the 2026-10-27 contraction re-record keyed clips under the contracted text, but ElevenLabs read the OLD scripts with uncontracted words. Tags are kept; the spoken words must equal the line text (numbers spelled out, Tata as Tah Tah).
- Audit tool: repo tools/clip-audit/README.md. Offline speech recognition (sherpa-onnx Whisper base.en from the k2-fsa/sherpa-onnx GitHub release; HuggingFace is blocked) flags clips whose audio says the long form of an on-screen contraction. Run it after any big bake merge.
- 2026-10-28 run: 132 mismatched clips plus 6 reworded lines removed (silent until re-baked). Re-bake: Contraction-Fix-Baker.html v2 (all 138 original scripts kept; sent to Tom; source in repo tools/clip-audit, scripts in tools/clip-audit/orig-scripts.json). Merge: dialogue-pending.json with voice-merge-dialog.js into the chapter file each key came from (dialog-ch22, 24, 25, 26, 27), Grace shrink and Boppy deepen as usual; voices.json with voice-merge.js.
- Contraction pass bugs fixed in text: "X'll not" -> "X won't", "X'd not" -> "X wouldn't", possessive "I've seven" -> "I have seven", "let us" never becomes "let's" mid-sentence (tools/clip-audit/fixtext.py).

## TNB "Well, well, well"
- Tom (2026-10-27): TNB's "Well, well, well" is ALWAYS faster paced than it was baked.
- Live now: the 6 existing clips were time-stretched 1.3x (1.25x for the dialogue line), pitch kept, trailing silence trimmed. Tool: claude/speedup-clips.py FILE TEMPO.
- New bakes: scripts go through claude/voice-script-overrides.py (first tag [quick, snappy, rolling, amused], ellipsis after the phrase becomes a comma, [beat] after it). Game text never changes. Any NEW TNB line with "Well, well, well" gets the same treatment.

## Boomie (retired voice id 'boomie', new id 'boomie2')
- Tom (2026-10-27): Boomie does not talk about food or eating. She talks about where she is touring next, when Tom will see her perform, and she sings something gospel. Voice: warm, young, deeper-voiced African American woman.
- Game: Boomie speaks voice id boomie2 (data/dialog-cast.js). Her 14 lines are silent until the voice pass (claude/dialogue-scripts-boomie.json).
