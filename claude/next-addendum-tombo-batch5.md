# Tombo batch 5 (boppy3, tnb2, tnb3, nara2, nara3): state at 11-08 (session "continue")

Read this with claude/next.md ORDER NOW 2. Nothing pushed. The clone at /home/claude/adventures-of-tom may be gone; it is rebuilt by add_repo and `git clone --depth 1` (head was ac609d5).

## Done in the clone (uncommitted)
- tools/tombo_props_map.json: the six slugs from the handoff added to `new`. Added: red_cayenne_pepper (boppy3); silver_subway_car, thick_braided_pull_rope (tnb2); handmade_stoneware_mug, second_matching_stoneware_mug (tnb3). NOT added: longboard (tnb2) because it is a reuse slug (tnb's own longboard); adding it to `new` would overwrite it.
- tools/sprite-bake/tombo_frames.py: the five split sets added to SETS (the lost clone had this edit; re-added), and all five added to INSTALLED.
- Baked: art/tombo/<id>-tom.webp and -p.webp for all five; data/tombo-frames.js regenerated; tools/sprite-bake/tombo_frames_state.json updated. Contact sheets (tools/shots/tombo-<id>.png) read clean as painted for all five.
- Shared prop files changed by the bake: garden_stake, giant_tomato, gold_transfer_card, palm_tree, raised_garden_bed, tomato_seedling, tomato_vine, tug_rope, watering_can. All are on the new lists, so they are kept (they are the approved painted objects). The old drawn code for them is still in engine/prop-art.js and engine/battle2-kind.js and must be purged.
- engine/battle2-kind.js: LAST B2_TOMBO_ANIM.nara2 rewritten to painted frames (tbf for Tom, tbfm for Nara). Splice was by line index with verified start and `};` end; `node --check` OK.
  - Tom: frame 1 idle, 2 lean-back during the tug line, 3 into the yank, 4 flying, 5 sprawl on the slide, 6 sitting dizzy, back to 1 after the win.
  - Nara: 2 bow to take the rope, 3 the tug, 4 wind-up, 1 after the hit, 6 victory jump.
  - Mouth point is now fixed (sN.x+NW*.3, sN.b-NH*.8); the ground rope after the win is PROPART.draw('tombo/tug_rope').
  - tools/tombo_test.py nara2 --speed2: FAILS: []. Strip checked at low resolution: the flight, THWUMP and win frames read right. NOT yet checked at full size: rope start point at Nara's mouth, and tug_rope placement on the ground (PROPART anchor may need h or y tuning).

## Not done (the rest of the batch)
1. nara3 (live anim near line 2294 of engine/battle2-kind.js, ~97 lines): rewrite to painted frames. Tom sheet: kneeling frames 1-6; Nara sheet: 1 sit-tilt, 2 play-bow, 3 pounce, 4 jump-paw, 5 lying down, 6 happy jump. Check the sheet before mapping.
2. boppy3 (live anim near line 6226, 52 lines; the dead one at 2109 must stay until purge): Tom frames 1 to 6 (Big Fish cap is Boppy's; Tom is the kneeling man). Keys and cell door are props.
3. tnb3 (live anim near line 2203, ~91 lines): Tom frames (clapping, waving, dancing), TNB frames (hair-flip, waving). Mugs and palm are painted props.
4. tnb2 (live anim near line 1076, 127 lines): the subway ride. Painted silver_subway_car, longboard (reuse) and gold_transfer_card. Biggest scene; do last.
5. For each: remove the drawn sprite code it replaced (grep the old helper names; purge drawn code for the replaced props: grep 0 for `garden_stake` etc. outside art/ and data/; keep prop names the engine loads).
6. Dead duplicates B2_TOMBO_ANIM.boppy3 (~2109) and the dead tnb/nara ids stay for the deferred cleanup (report, do not start).
7. Then the rest of ORDER NOW 2 (f): bump tags (engine/battle2-kind.js `tombo9` -> `tombo10`, data/tombo-frames.js tag if the loader uses one), tag_check, smoke (FAILS: []), unused_voice 0, CHANGES entry, `python3 -I tools/art-library/in_game.py` (commit data/art-ingame.json), push. Phone checks for Tom: nara2 tug and the win frame; the rest as each scene lands.

## Tool notes learned this session
- tools/tombo_test.py needs CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome and PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers. It writes tools/shots/tombo-<id>.png (contact strip) and tombo-<id>-N.png frames. Serve with `python3 tools/serve.py` in the background first.
- The baker only saves object slugs listed in tools/tombo_props_map.json `new` for that id; a reuse slug must NOT be in `new`.
- The Tombo split loop in tombo_frames.py SETS must list every set in INSTALLED or the bake raises KeyError.
