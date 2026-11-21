# next-addendum-boppy2 (2026-11-11 ~19:30, main 8be36b8, CHANGES "boppy2"; read with claude/next.md)

- Tom 18:49: Boppy's newest approved hero v2, walking v4, emotions v6 installed with the tomboppy1 recipe (`walk_splice.py boppy`, `emotion_frames.py boppy`, `bake_emotion_faces.py boppy`, `bake_story_poses.py`, `bake_talk_faces.py boppy`, `bake_portraits.py boppy`, `head_adjust.py manifest`; tags `boppy2`, `EMO_V` and `TALK_V` by hand).
- Fact: `bake_story_poses.py` rewrites ALL NPC pose atlases and `data/npc-poses.js` with different bytes than the repo (not reproducible). Reverted every non-Boppy file with `git checkout`; `data/story-poses.js` differed only in Boppy's rows. Do this again after any story-pose bake.
- Fact: a new walking sheet needs a new chin reading: `chin_ruler.py boppy`, then `chin_lines.json` (Boppy now `boppy-walking-sheet-v4.png`, .345), then `head_adjust.py manifest` again (about 5 min each run, run in background). Without it the manifest warns and uses the bake anchor.
- Menu portrait keeps Tom's saved Boppy crop (looks right on hero v2).
- NOT changed: Boppy's battle sheets and battle atlas (battle still shows the old Big Fish cap), ability sheets. NOT looked at: landscape, an in-game dialogue with Boppy, his NPC pose size on a map.
- Tom's phone checks: Boppy walking, his mood poses, his dialogue face, menu portrait, HEAD SIZES row.
- Open question for Tom: battle art for Boppy still has the old cap; regenerate battle sheets in the Library if he wants it to match.
