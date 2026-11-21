## NEXT TASK BOPPY NEW EMOTION SHEET (Tom 11-06 08:25: "I just approved a new emotion for Bobby. It's a new emotion sheet incorporated into the game in the building instructions."): DO AFTER TNB INSTALL (small, no Generate presses)

- Reading (my call, stated as such): "Bobby" is Boppy (Tom's father). Bobby is Olivia's unseen brother and has no sheets. "New emotion sheet" = a new approved version of the Art Library entry `boppy-emotions`. If the approved picture turns out to be a ninth emotion or a different grid (not 4 x 2, 8 moods), stop and ask Tom ONE line which mood it is and what lines should use it. Do not invent a ninth mood key.
- Fact: approved is not installed. The game still uses art/raw/characters/boppy-emotions-v1.png (cut into art/emotions/boppy.webp, faces art/emotions/boppy-faces.webp, story poses set `boppyemo` in tools/sprite-bake/bake_story_poses.py).
- Steps:
  1. `git fetch`, read the `boppy-emotions` entry in data/art-prompts.json (Tom's approvals commit there): which version is approved, and whether that picture is a different IMAGE from boppy-emotions-v1.png (compare pixels, not names). Save the approved one as art/raw/characters/boppy-emotions-v2.png (keep v1, approved sources are exempt from the purge rule).
  2. Re-cut: `python3 tools/sprite-bake/emotion_frames.py boppy` (point it at v2), `CHECK=/tmp/x.png python3 tools/sprite-bake/bake_emotion_faces.py boppy` (look at the head row next to his hero portrait), rebake the `boppyemo` story poses. Figures as painted, no resize or flip.
  3. Purge what v2 replaces (old boppy emotion atlas, faces, pose frames), grep 0 references.
  4. No mood calls change unless Tom names a line (corrections go in docs/emotion-index-lines.tsv, rerun `python3 tools/emotion-apply.py $(seq 1 21)`).
  5. Tests: `SCENE=<id> MAP=<map> CH=<n> python3 tools/scene_frames.py` on 3 Boppy scenes with mood changes (ch1 Boppy lines, a Boppy sad or scared line, a Boppy angry line), portrait and landscape; tag_check, smoke FAILS: [], unused_voice 0. Bump `EMO_V` (face images changed), ART_V and the story-pose tag, CHANGES entry, push.
  6. ONE line to Tom: "Boppy's new emotion sheet is in: his faces and poses use it now."
