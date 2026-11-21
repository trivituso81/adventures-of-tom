# headchin1 (2026-11-13 about 14:30 PT, main ade3cfe, tag headchin1): the HEAD SIZES factor lands on the head in every mood frame. DONE and pushed, waiting on Tom's phone check.

Read with claude/next.md (not edited there so as not to clobber other sessions; merge this in when next.md is next rewritten). ORDER NOW in next.md is unchanged.

## Fact
- Tom 13:00: "ensure that in each emotion frame, an NPC's head size is modified as per the head size feature in each emotion frame."
- Before: every strip was baked with the current factor (a full rebake reproduced all 63 files), but the head grew about ONE line per person (narrowest row, median of 8 frames, share of each frame's height). On sad, angry, scared the line sat inside the face (only part of the head grew). For people whose hair or hat hides the neck it sat at chest or waist (Dakota .42, Bun .40), so the torso grew too.
- Now: one measured chin row per frame. `tools/sprite-bake/emotion_chin.py` writes `tools/sprite-bake/emotion_chin.json`; `emotion_frames.py` `grow_frame_head` grows the head about that row. Raised hands and arms not joined to the head stay as painted. Old rule (`neck_share`, `NECK_*` in emotion_frames.py) removed. A new approved sheet is measured by itself on its first bake.
- Michael keeps his old line under all three heads (`GROUP_SHARE` in emotion_chin.py): a line at his chin cuts Lachlan's and Isla's faces (tried, looked bad).
- Covers everyone with a factor other than 1: 54 townsfolk, Jojo, Michael, and Amy, Boppy, Deedee, Ellie, Grace, Justin, Olivia, Rose, TNB. Unchanged: Tom, Nara, and Boomie, Marlowe, Nickel, Oolong, Penny (no saved factor).
- Rebaked: art/emotions (63), portraits/emo (504), data/emotions.js, data/story-poses.js, data/npc-poses.js, art/chars/*emo-story.webp. `EMO_V` = headchin1. Smoke FAILS [], tag_check ok.
- Looked at: chin line on all 504 frames, before and after strips of 9 people, all 504 faces, stand next to the 8 map poses (Dakota, Bun, Carmen), Carmen's chapter 12 scene in the game (portrait). Not looked at: landscape, Duo, a phone.

## Known, not changed
- On the map some people's mood head is still a little smaller than their standing head (Dakota, Carmen). Cause is the mood pose SIZE rule (`npc_emo_head` in bake_story_poses.py: mean of height match and face match), not the factor. If Tom says mood heads still look smaller than standing: change that rule to face match only for NPCs (the mood figure then stands a little shorter or taller than the walk), show him stand next to 8 moods for five people first.
- Chin rows a few pixels off by eye: TNB scared and surprised (high), Odette angry and Tony angry (low). Fix with `FIX[id][mood] = row` in emotion_chin.py, then the recipe below for that id.
- Bun's hat top is cut flat in angry (in the source sheet, was there before).

## Recipe (any head factor change, or a wrong chin line)
1. `CHECK=/tmp/chin.png python3 -I tools/sprite-bake/emotion_chin.py <ids>` and look at the green lines.
2. `python3 -I tools/sprite-bake/emotion_frames.py <ids>` (always pass ids), `python3 -I tools/sprite-bake/bake_emotion_faces.py <ids>`, `nohup python3 -I tools/sprite-bake/bake_story_poses.py` (about 11 min), set `EMO_V` in engine/emotions.js by hand, bump_tags, smoke, push.

## Waiting on Tom
- Title stamp `build headchin1` or later. Chapter 12, Pupuseria La Ceiba, thaw Doña Carmen: her head should be the same size on every mood page. Then talk to Dakota and Bun: body no longer swells when a mood shows.
