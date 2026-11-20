# facing1 (2026-11-14): painted mood and talking poses face the right way. DONE and pushed (main 93ec112, tag facing1). The BLOCKED note of the earlier sessions is resolved: push access was granted on a retry.

Status, files, tests and the correction path are in claude/next.md, section "facing1". This addendum keeps the method notes.

## Tom's report
Tom 08:39, chapter 1 pond (Deedee "Look at the grass. It's grey."): only Grace faced the right way; Tom, Rose and Deedee should have been mirrored.

## Cause (fact)
`scenePoseDraw` (engine/story.js, story-pose branch) drew painted story poses as painted and never mirrored them; each painting leans whichever way the generator drew it, mixed per person and pose.

## What was built (differences from the plan)
- docs/pose-facing.tsv (id, frame, lean l/r/f; 584 rows: 11 cast mood sets, 6 talk sets, 59 townsfolk sets = 472 townsfolk frames, not 944 as the plan guessed), tools/pose-facing-apply.py (writes data/pose-facing.js; `--check` run by smoke, so new frames without a row fail smoke instead of stopping the cutters), `poseFacingWant` in engine/story.js, `EMO.spk` in engine/emotions.js, `LATE=1` frames in tools/reaction_test.py.
- st_ story poses are NOT mirrored (scenes choose those on purpose). The optional ADMIN Flip page was not built: corrections are one cell in the tsv.

## How the leans were judged (repeat this for new sheets)
- Build a head-crop contact sheet: for each frame, crop the atlas rect, crop to the alpha bounding box, keep the top 55 to 62 percent (head and shoulders), thumbnail about 150 to 300 px wide, 4 to 8 per row, label `<set> <frame>` under each. Atlases and rects come from `atlas` in data/story-poses.js and data/npc-poses.js.
- Rule: the screen side the face (and for tk_point, the pointing arm) is turned to. Most reliable cue: an ear showing on one side means the face is turned to the OTHER side (ear on screen left = lean r). Eyes and nose shifted toward a side = that side.
- Near-front with closed eyes or a head tilt only: f. When unsure between r and f, r is safe (mirroring a near-front frame does no harm except lettering); never tag l or r against what you see.
- Calibration: Tom said Grace em_surprised faced correctly standing left of the block, and Tom, Rose and Deedee em_surprised (all r) needed mirroring standing right of it.

## Lettering
Boppy's cap, Carmen's apron and Olivia's PRESS badge read backward when mirrored. Accepted; set that frame to f if Tom objects.
