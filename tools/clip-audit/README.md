# Clip audit: does each baked clip say what the screen says?

Built 2026-10-28 after Tom heard Olivia say "She is going to eat the leaf" under the on-screen "She's going to eat the leaf".
Cause: the contraction re-record (2026-10-27) keyed clips under the new contracted text but ElevenLabs read the OLD scripts
(uncontracted wording, e.g. claude/dialogue-scripts-ch2.json). Rule from now on: a bake script is always rebuilt from the
current line text (tags may be kept, words may not).

Pipeline (scratch dir SP, model sherpa-onnx whisper base.en from the k2-fsa/sherpa-onnx GitHub release `asr-models`):
1. `pip install sherpa-onnx`; download `sherpa-onnx-whisper-base.en.tar.bz2` into SP and untar.
2. `node dump_clips.js REPO SP/wav` writes every clip whose text has a contraction as mp3 plus manifest.json.
3. `python3 asr.py SP` transcribes them (about 50 min for 1,000 clips on 2 cores) into SP/asr.json.
4. `python3 analyze.py SP N` writes SP/bad.json: clips whose audio says the long form of an on-screen contraction.
5. `python3 merge_list.py SP` (needs fixtext.py) adds lines whose wording was fixed, writes final.json; `python3 speakers.py` adds the on-screen speaker (merge effects depend on it).
6. Recover the hand-written scripts into orig-scripts.json ({index in final.json: {script, source}}) from the Project's claude/dialogue-scripts-*.json and voice-baker-scripts*.json. NEVER build a baker from auto-tags when a hand-written script exists: keepscript.py keeps every tag and pause and only swaps words that differ by a contraction (2026-10-28: the first baker lost Tom's directions; fixed).
7. `node baked_extract.js` then `python3 build.py final.json` builds out/Contraction-Fix-Baker.html; `python3 btest.py` runs it against a mocked ElevenLabs.
8. `python3 silence.py final.json REPO` removes the mismatched clips so those lines are silent until re-baked.
Paths inside the scripts point at /home/claude/bk and the scratch dir; adjust when rerunning.
