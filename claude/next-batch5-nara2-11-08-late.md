# Batch 5 handoff (11-08 late session, main at 165213b, NOTHING PUSHED)

Read with claude/next.md ORDER NOW 2. This doc supersedes the "NEXT SESSION" steps in next.md for batch 5 where they differ.

## Done in the clone (/home/claude/adventures-of-tom, uncommitted)
- Step (a) DONE: batch5-map-and-baker.patch applied with `git apply` (it applies cleanly to 165213b). Bake run: `python3 -I tools/sprite-bake/tombo_frames.py boppy3 tnb2 tnb3 nara2 nara3`, exit 0. `git status`: 9 modified prop files, 7 new prop files, 10 new sheets, plus data/tombo-frames.js, tombo_frames_state.json, tombo_props_map.json, tombo_frames.py. Expected; do not restore.
- nara2 scene DONE (step b for nara2): the saved scene `claude/batch5-nara2-scene.js.txt` spliced over the live `B2_TOMBO_ANIM.nara2` (old lines 1212 to 1274 replaced; now one definition). `node --check` OK.
- nara2 test: `python3 tools/tombo_test.py nara2 --speed2` gives FAILS: []. Contact strip (tools/shots/tombo-nara2.png) reads right: tug, YANK, THWUMP, sprawl, WINNER.
- NOT CHECKED at full size: rope start at Nara's mouth and tug_rope placement on the ground (PROPART anchor may need h or y tuning). Look at tools/shots/tombo-nara2-N.png frames before pushing.

## Not done
- Scene rewrites for boppy3 (live ~6226, last definition), tnb3 (~2203), nara3 (~2294), tnb2 (~1076). Use amy3 (~5781) and boppy2 (~6127) as the painted models. Find each with a `rindex` search. Keep dialogue lines and the steps schedule.
- Purge of replaced drawn code (grep 0 for replaced slugs), tag bumps (tombo9 to tombo10 in engine/battle2-kind.js and engine/prop-art.js), CHANGES entry, unused_voice 0, in_game.py, smoke (FAILS: []), commit, fetch, rebase, push.
- ff1, ff2, ff3, grace3 DC objects: spec first.

## Lessons this session
- Lesson 11: `project_read` of a file does NOT put it on disk. Batch scene code saved in the Project must be written to a temp file with Write before splicing.
- Lesson 12: the server log shows BrokenPipe traces from tombo_test.py. Harmless. The line that counts is `FAILS: []`.

## NEXT SESSION
1. Fresh clone check: `git -C /home/claude/adventures-of-tom status --short`. If the clone is gone, do the fresh-clone recipe, `git apply claude/batch5-map-and-baker.patch`, bake (step a).
2. Re-create nara2 from claude/batch5-nara2-scene.js.txt (write it to /home/claude/nara2_scene.js, splice lines of the live block by index, `node --check`). Look at the rope at full size, fix the anchor if needed.
3. Then boppy3, tnb3, nara3, tnb2 in that order, one at a time, each tested and looked at before the next.
4. Then the push procedure in next.md. Push only when all five are live and tested, or tell Tom the batch is split.

## Prompt for Tom to paste next time
"Read claude/next-batch5-nara2-11-08-late.md and continue."
