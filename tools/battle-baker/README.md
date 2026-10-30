# Battle Voice Baker

One HTML file with a tab per character (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara) for every battle voice line.
Tom can play the clip in the game now, make a new ElevenLabs take, tick the ones he likes, and Save exports `voices.json` with ONLY the ticked lines.

Build:  `python3 tools/battle-baker/build.py`  (writes tools/battle-baker/out/Battle-Voice-Baker.html)
Test:   `export CHROMIUM=...; python3 tools/battle-baker/test.py`  (ElevenLabs mocked)
Merge:  `node tools/battle-baker/merge.js voices.json data /tmp/out` then copy /tmp/out/data over the repo and run `python3 tools/smoke.py`.

- Current clips are fetched from raw.githubusercontent.com (main), or `?base=URL/` for tests.
- Scripts: saved live script, else hand-written direction (handscripts.txt), else automatic direction. None are dropped.
- Merge: a new clip replaces every clip with the same text; Boppy is deepened (rubberband pitch 0.9); scripts and Nara prompts are merged, never replaced.
