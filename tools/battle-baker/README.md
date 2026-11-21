# Battle voice scripts (the baker page is retired)

The Battle Voice Baker page (one tab per character, new ElevenLabs takes with a pasted key) was retired in keysecrets5 (2026-11-21).
What stays: `build.py` (finds the script ElevenLabs reads for each battle line; `tools/voice-library/battle-scripts.py` runs it),
`dump.js` (reads the live game files for it) and `handscripts.txt` (hand-written directions, never dropped).
Order: the script saved with the live clip, else `handscripts.txt` / `tools/clip-audit/extra-battle.json`, else an automatic direction.
