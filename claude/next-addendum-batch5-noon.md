# Batch 5 addendum (11-08 noon session, clone at 165213b, NOTHING PUSHED)

Read this with claude/next.md ORDER NOW 2. It records what this session did and what is left. next.md itself was not rewritten (it is too large to rewrite safely here); this addendum is the handoff.

## Done in the clone (/home/claude/adventures-of-tom, uncommitted)
- Step (a) DONE: baker SETS and INSTALLED (five ids) and the three map hunks, by exact-text edits with count asserts. `python3 -I tools/sprite-bake/tombo_frames.py boppy3 tnb2 tnb3 nara2 nara3` exit 0. `git status`: 9 modified prop files, 7 new prop files, 10 new sheets, plus data/tombo-frames.js, tools/sprite-bake/tombo_frames_state.json, tools/sprite-bake/tombo_frames.py, tools/tombo_props_map.json. Expected.
- nara2 scene DONE: the LAST `B2_TOMBO_ANIM.nara2` (was line 1212, 63 lines) replaced by the painted version. Saved as `claude/batch5-nara2-scene-tested-11-08-noon.js.txt`. The two bookkeeping comment lines were removed from the engine file. `node --check` OK.
- boppy3 scene DONE: the LAST `B2_TOMBO_ANIM.boppy3` (about line 6228) rewritten with `TB()` painted frames, the same change as `claude/batch5-boppy3-rewrite.patch`. Applied by a whitespace-tolerant block replace, because the patch's context lines had one extra space. Check with `git diff` against the Project patch if in doubt.
- Tests: `tombo_test.py nara2 --speed2` FAILS: []; `tombo_test.py boppy3 --speed2` FAILS: []. Shots checked: tools/shots/tombo-nara2.png strip (tug, GRRR, YANK, THWUMP, WINNER read in order), tombo-nara2-2.png full size (the rope runs from Nara's mouth to Tom's hand: anchor OK); tombo-boppy3.png strip (stake, hole, water, other way, tomatoes read in order).
- Working diff saved in the clone only (`git diff` of the four engine and tool files plus the data file). If the clone is gone, redo steps (a), nara2 splice and boppy3 patch.

## NOT DONE
- tnb2 (only definition about line 1076), tnb3 (about 2203), nara3 (about 2294): scenes still the old drawn code. No saved scene for them yet. Use amy3 and boppy2 as the painted models; find each live definition with rindex.
- Before ANY push: remove `tnb2`, `tnb3`, `nara3` from INSTALLED in tombo_frames.py if their scenes are not rewritten (otherwise the baked frames play under old scene code). Or finish them first.
- Purge: `tombo/watering_can` (boppy3's painted can replaced the drawn one): remove from `PROPART.preload` in engine/prop-art.js (about line 28), from boppy3's `new` list in tools/tombo_props_map.json, and the file, after grep finds no other user.
- Old drawn code for nara2 (`nR`, the old `sp.act` path) is gone with the replaced scene; grep for `tombo/tug_rope` users before deleting anything.
- Tags: `bump_tags.py` to the next tag from `tombo9` in engine/battle2-kind.js and engine/prop-art.js. `tag_check.py`, `smoke.py` (FAILS: []), `unused_voice.py` (0), CHANGES entry, `in_game.py`, commit, fetch, rebase, push.

## Lessons (this session)
- Lesson 13: a patch's context lines can carry an indent difference; `git apply --check` fails with "patch failed". Fallback that worked: match each hunk line by stripped text, use the file's own text for context, and the patch's text for added lines, with a count assert.
- Lesson 14: a line-count splice moves every later line. Re-find definitions by content (rindex on `B2_TOMBO_ANIM.<id>=`) after each splice, not by the line numbers in notes.
- Lesson 15: the shared Project can gain patches while you work (boppy3 and nara2 pieces appeared from another session at 12:40 PT). Read the Project file list before writing a scene, and compare, do not duplicate blindly.

## NEXT SESSION
1. If `/home/claude/adventures-of-tom` exists and `git status` matches the list above, do NOT re-clone or re-bake. Start at tnb2.
2. Otherwise: fresh clone (add_repo, `git clone --depth 1`, register_repo_root), then step (a) (edits above), bake, then splice nara2 from the saved scene file (`claude/batch5-nara2-scene-tested-11-08-noon.js.txt`, written to a temp file with Write first: Lesson 11 in next.md), then `git apply` the boppy3 patch (or the block replace), then the tests.
3. Then tnb2, tnb3, nara3 one at a time, each rewritten, tested, and looked at (portrait and landscape shots).
4. Then the purges and the push procedure in next.md. Push only when all five are live and tested, or drop the unfinished ones from INSTALLED and tell Tom the batch is split.

## Prompt for Tom to paste next time
"Read claude/next-addendum-batch5-noon.md and continue."
