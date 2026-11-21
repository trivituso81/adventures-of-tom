# Girls greeting hug (Tom 2026-11-06 09:45)

Tom: "We need custom art for when Rose and Grace greet Tom when he gets to Long Island to cover that animation. As he hears their voices he has a happy emotion, then crouches down and they both hug him simultaneously."

## Fact (state)
- Art Library draft entry `tom-grace-rose-greeting-hug` (CHANGES 358, json 655 entries, Characters 248, group Tom). 4 x 2 grid of square cells, ar 2:1, refs = tom, grace, rose hero pictures. Tom presses Generate (1 press), then Approve or Reject. Nothing installed.
- Frames in order: 1 hearing them (Tom alone, eyebrows up), 2 delighted (alone, arms starting to open), 3 crouching (alone, arms wide open), 4 girls running in (Grace one side, Rose the other), 5 crash hug, 6 group hug, 7 squeeze (Rose's feet just off the ground), 8 looking up (loose hug).
- The scene it covers: the chapter 1 opening, data/scenes.js line 14 to 36 (`SCENES.ch1...` intro). Today: Tom says "Oof, I'm finally here!", `stretchStep()`, the girls shout TATA off screen (`introshout`), run in (`walk` grace and rose), then `{step:hugStep()}` and the greeting lines. The hug today is `hugStep()` (find it with grep) drawn from the older art.

## Install (only after Tom approves the sheet; no Generate presses)
1. Save the approved picture as the Library does (art/raw/characters/tom-grace-rose-greeting-hug-v1.png). Cut the 8 frames (pattern: tools/sprite-bake/emotion_frames.py or story-pose cutters; figures used as painted, feet on the bottom edge, no resize or flip).
2. Build it as ONE group story pose that replaces the three actors while it plays (the girls and Tom are in one picture, so hide the three map actors, show the group frame at Tom's tile, scale so Tom matches his map height; see `bake_story_poses.py` and STORY_POSES, and how `hugStep()` and `stretchStep()` hide actors).
3. Sequence (keep timing close to today): frames 1 and 2 play while Tom hears TATA (the shout bubble, `introshout` sounds), frame 3 as he crouches, then swap to the group art when the girls arrive: frames 4, 5, 6 while they run in and crash, 7 and 8 under the greeting lines. Girls' lines, voices and order unchanged (no voice changes, no new lines). Tom's `happy` mood face on the dialogue portrait for the line he speaks, if any.
4. Frame 4 shows both girls already beside Tom, so cut from the running walk to frame 4 on the step where they reach their tiles, not before.
5. Purge the old `hugStep()` drawing and anything only it used (standing rule), grep 0 references. Test chapter 1 start to finish from the chapter-select jump, portrait and landscape frames (`SCENE`/scene_frames or chapterJump(1)), unused_voice 0, tags, CHANGES, push, ONE line to Tom: does the hug read right on the phone.
- If the generated sheet drifts (girls the wrong size, Rose too big, Tom not crouched), stop-loss applies after two misses: try adding the two girls' battle sheet 1 as extra refs (cap 5) or split into two entries (Tom alone, then group).
