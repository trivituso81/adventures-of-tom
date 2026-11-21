# Emotion pose size match (Tom 15:43, CHANGES 399, `emo15`, pushed to main)

Tom: emotion frames must be sized like the standard states, bodies and heads, so characters do not seem to grow when a mood line starts. Not all characters or states did it; the angry states showed the pattern.

## Fact
- Frame heights already matched the overworld stand frame. The painted emotion figures have bigger heads (TNB, Justin, Boppy 20 to 37 percent over; Tom, Deedee, Olivia 5 to 15; Grace, Rose, Ellie, Amy within a few). Angry, proud, surprised, unimpressed are broad poses (wide stance, arms out) that read 5 to 10 percent bigger overall.
- Fix lives in `tools/sprite-bake/bake_story_poses.py` `match_standing` (emotion strips only): head band over 1.06 of standing shrinks the head about the chin (`kidhead.grow_head`); silhouette-area root over 1.03 shrinks the whole frame (floor .9). Nara (dog) untouched. `STAND_CHIN` table holds the standing chin row per character (read by eye from rulers).
- Rebuild: `python3 -I tools/sprite-bake/bake_story_poses.py`, then `python3 tools/art-library/bump_tags.py <TAG> --base origin/main`, smoke, tag_check.
- After: heads 0.89 to 1.11 of standing (most within 5 percent), figure area 0.88 to 1.02, angry figure 1.00 to 1.02.

## Watch / next
- Justin, TNB, Boppy mood frames are 3 to 9 percent shorter than standing. If Tom says they look small, the real fix is regenerating those emotion sheets with a smaller head (Art Library, 1 Generate press each), then rerun `emotion_frames.py <id>` (always pass ids) and the story-pose bake.
- Tell Tom to judge on the phone: Justin, TNB, Boppy (shrunk most), and all angry frames.
- Note: another session left conflict markers in engine/main.js on main (towncut1) and fixed it (ef73381) while this push was in flight.
