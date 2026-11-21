# Deedee Rebake Baker (built 2026-10-29)

Why: Tom heard Deedee clips repeating words or whole phrases. Speech recognition over her 141 first-checked clips found 78 that loop the line 3 to 10 times (battle and dialogue alike, any length). All 164 Deedee lines are rebaked.

What it does: one HTML (Deedee-Rebake-Baker.html). Every line starts from its hand-written script (tools/clip-audit/dd-orig-scripts.json through keepscript.py, contractions matched to current text, CAPS kept). After each take the page measures length and, if the key allows, transcribes it with ElevenLabs Scribe, then discards and retries (up to 5, new seed) on: too long or too short, repeated word or phrase, extra words, a direction read aloud, wording mismatch. Attempts 4 and 5 drop the voice direction prefix (labelled). Lines still failing are marked Listen with "Heard: ..." and a "Sounds fine" button. Offline check on the 164 broken clips: all 99 clear loops flagged, 50 clean clips not flagged.

Export: deedee-rebake.json, the format tools/voice-recast/merge-voice.js already reads (tested: 44 battle replaced, 120 dialogue replaced across chapter files).
Merge: node tools/voice-recast/merge-voice.js deedee-rebake.json data out deedee; copy out/data over data; python3 tools/smoke.py; commit; push. BEFORE merging, audit Tom's export with the sherpa-onnx Whisper base.en pipeline (tools/clip-audit/README.md; model downloads from the k2-fsa GitHub release) and re-send any line still looping.

Files (all in Project claude/): deedee-rebake-build.py (assembles HTML; paths point at the scratch dir bk/), deedee-rebake-scripts.py (builds scripts.json from the repo's tools/clip-audit files), deedee-rebake-tpl_head.html, deedee-rebake-tpl_body.js, deedee-rebake-test.py (Playwright with mocked ElevenLabs, scenarios full and nostt), deedee-rebake-judge-test.py (checks the checker against real clips plus asr.json).
Rebuild: copy tpl_head.html and tpl_body.js to a work dir as tpl_head.html and tpl_body.js, run scripts.py then build.py (needs the repo cloned at /home/claude/trivituso81/adventures-of-tom).
Calibration (build.py cal): 0.42 s per word, 0.2 s per sentence, flag when longer than 1.45x expected plus 0.8 s.
Unknown: why Deedee loops (stability 0.5, similarity 0.85, voice 9UrcxKDUU0pvcnFhdfTU, the picked voice in data/voice/dialog-ch28.js; battle lines still play IvqgM...). If retries still fail often, try stability 0.65 in the baker Settings.
