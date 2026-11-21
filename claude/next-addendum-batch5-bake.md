# Batch 5 bake checkpoint (11-08, main a94d312)

Supersedes ORDER NOW item 2 step (a) in claude/next.md. Do NOT run `git apply` on claude/batch5-map-and-baker.patch: its edits are already in the clone.

## Done (nothing pushed)
- tools/sprite-bake/tombo_frames.py: boppy3, tnb2, tnb3, nara2, nara3 added to SETS (split) and INSTALLED.
- tools/tombo_props_map.json: boppy3 new += red_cayenne_pepper; tnb2 new += second_gold_transfer_card, silver_subway_car, longboard, thick_braided_pull_rope, reuse []; tnb3 new += handmade_stoneware_mug, second_matching_stoneware_mug.
- Baked with `python3 -I tools/sprite-bake/tombo_frames.py boppy3 tnb2 tnb3 nara2 nara3` (exit 0, no "not saved" lines).
- git status after the bake: nine prop files modified (garden_stake, giant_tomato, gold_transfer_card, palm_tree, raised_garden_bed, tomato_seedling, tomato_vine, tug_rope, watering_can) and seven new (handmade_stoneware_mug, longboard, red_cayenne_pepper, second_gold_transfer_card, second_matching_stoneware_mug, silver_subway_car, thick_braided_pull_rope). All are batch 5 objects. Also data/tombo-frames.js and tools/sprite-bake/tombo_frames_state.json changed.

## Not done
- The five scene rewrites (last `B2_TOMBO_ANIM.<id>`, lines at the time: tnb2 1076, nara2 1212, boppy3 6226, tnb3 2203, nara3 2294; find them with rindex). Use amy3 (~5781) and boppy2 (~6127) as the painted models: tbf/tbfm, painted props, keep dialogue lines and steps.
- Tests, tag bumps, CHANGES entry, purge of replaced code, push.

## Rebuilding from scratch
The bake is reproducible from the repo raw sheets (art/raw/characters). A fresh clone at a94d312 plus the two tools edits above plus the bake command gives the same tree. The generated JSON is not stored in the Project.
