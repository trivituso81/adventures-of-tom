# Batch 5 addendum (11-08 session after noon, clone re-made at 0093376, NOTHING PUSHED)

Read with claude/next.md ORDER NOW 2. Supersedes the head and clone details in claude/next-addendum-batch5-noon.md.

## State of /home/claude/adventures-of-tom (uncommitted)
- Head on main is now 0093376 ("Art Library: tombo-boppy2-dc-tom approved (v0)"). Live definitions are at the same lines as before: tnb2 1076, nara2 1212 (now painted), boppy3 6226 (now painted), tnb3 2203, nara3 2294.
- Step (a) DONE: baker hunk applied with `git apply` (claude/batch5-map-and-baker.patch, baker part). Map edits made by exact-text edits with count asserts (JSON parses). Bake re-run, exit 0. `git status`: 9 modified prop files, 7 new prop files, 10 new sheets, plus data/tombo-frames.js, tools/sprite-bake/tombo_frames_state.json, tools/sprite-bake/tombo_frames.py, tools/tombo_props_map.json. Expected; do not restore.
- boppy3 DONE: engine patch applied with `git apply --recount --ignore-whitespace` (strict apply fails on context whitespace, Lesson 13). `node --check` OK. Diff touches only the intended lines.
- nara2 DONE: scene spliced by content (old block 1212 to 1274, 63 lines, replaced by the saved painted scene, 65 lines). `node --check` OK.
- Tests: `tombo_test.py boppy3 --speed2` FAILS: []; `tombo_test.py nara2 --speed2` FAILS: [].
- Shots looked at: tools/shots/tombo-nara2.png (tug, GRRR, YANK, THWUMP, WINNER in order: reads correctly). tools/shots/tombo-boppy3.png (stake, HOLE, water, fix, tomatoes in order: reads correctly). Portrait and landscape shots for each are NOT yet checked (tombo-<id>-N.png exist).

## NOT DONE
- tnb2 (1076), tnb3 (2203), nara3 (2294): scenes still drawn code. These three are IN `INSTALLED` in tombo_frames.py, so their baked frames already sit in data/tombo-frames.js. DO NOT PUSH until each scene is rewritten, or remove them from INSTALLED.
- Purge `tombo/watering_can` (boppy3 painted can replaces it): remove from PROPART.preload (engine/prop-art.js, about line 28) and from boppy3's `new` list in tools/tombo_props_map.json (check first whether that list also feeds the baker); delete the file only after grep finds no other user.
- Tags: `bump_tags.py` tombo9 to the next tag in engine/battle2-kind.js and engine/prop-art.js; `tag_check.py`; `smoke.py` (FAILS: []); `unused_voice.py` (must show 0); CHANGES entry; `in_game.py`; commit; fetch; rebase; push.

## Next session
1. If the clone exists and `git status` matches above, do NOT re-clone or re-bake. Start at tnb2: read the live definition at its line in full, view art/tombo/tnb2-tom.webp and tnb2-p.webp, write the painted version (copy the structure of boppy3 and nara2 in this session), splice by content with a count assert, node --check, tombo_test tnb2 --speed2, look at the shots in portrait and landscape.
2. Then tnb3, then nara3 the same way.
3. Then the purge, tags, CHANGES, checks, commit, fetch, rebase, push. Push only when all five are live and tested, or remove unfinished ids from INSTALLED and tell Tom the batch is split.
4. If the clone is gone: add_repo (push access), clone --depth 1 (10-minute timeout), register_repo_root, then the map edits and baker hunk (claude/batch5-map-and-baker.patch), the boppy3 patch with --ignore-whitespace, the nara2 splice, bake, tests.

## Lessons (this session)
- Lesson 16: the head moved (0093376). Re-check git log and the live definition lines before splicing, every session.
- Lesson 17: `git apply` of the boppy3 hunk needs `--recount --ignore-whitespace`. Verify with `git diff -U0` afterwards.

## Prompt for Tom to paste next time
"Read claude/next-addendum-batch5-late-1140.md and continue."
