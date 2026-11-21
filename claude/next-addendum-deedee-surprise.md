# Deedee surprised pose in the pie steal, chapter 1 (Tom 11-06 08:14: "Add to build instructions")

## Why (fact)
- Tom asked whether there is no surprise emotion because Deedee should look surprised when the Big Mudling steals her pie. The `surprised` mood exists (#6 of 8) and Deedee has `em_surprised` (STORY_POSES `deedeeemo`, frame `[1300,0,260,430]` in the source sheet).
- Cause: moods only fire on spoken lines. In the grab beat (data/scenes.js, scene after the shove, about lines 118 to 140 at 11-06 08:00) the only line is Rose's "Deedee! A mud blob is taking your PIE!" (tagged `scared`, Rose). Deedee's first line after it is "That's my GOOD tin!" (tagged `angry`, line ~145). In between she has no line, so she stays in her normal stand.

## Build (not started)
1. In the chapter 1 scene (SCENES entry holding `{pose:'Big Mudling',f:'mh_reach'...}` and `{pose:'Big Mudling',f:'mh_grab'...}`), right after `{place:'Deedee',at:[8,7],dir:'down'}` add `{pose:'Deedee',f:'em_surprised',dir:'down'}` so she is surprised from the blob's reach through the grab, Rose's line and the glance.
2. Clear it with `{pose:'Deedee'}` right before the all-block where the blob scurries off, so her next line ("That's my GOOD tin!") gets its angry mood through the normal mood system. A scenePose already on an actor wins over a mood pose, so the clear must come before that line.
3. Check the same shape elsewhere in chapter 1 and the rest of Part 1: any silent reaction beat (a reveal, a theft, a crash) where a character has no line but should react. List them to Tom in one line; fix only the ones that are clearly silent reactions.
4. No line text, voice or tsv change (unused_voice stays 0). `emotion-moods.js` is untouched.

## Tests
- `SCENE=<ch1 scene id> MAP=<map> CH=1 python3 tools/scene_frames.py`, portrait and landscape: Deedee in `em_surprised` with feet on her walk spot, size equal to her normal stand (41.7 rows), pose gone before her angry line, nothing left after SKIP (`#cut-skip`).
- `node --check data/scenes.js`, `python3 tools/tag_check.py` (move the `?v=` tag on data/scenes.js in index.html), `python3 tools/smoke.py` FAILS: [], CHANGES entry, push, ONE line to Tom: "Deedee now looks surprised when the blob grabs her pie."
