# vance1 (2026-11-12 ~18:07 to ~18:55, main ce673e7): Julian Vance shows only the painted art. DONE and pushed, waiting on Tom's phone check

Tom 18:07: "julian vance images flip back and forth between old anime art and the hand drawn ff9 art. it should be ff9 art only".

## Cause (fact)
- Painted (kept): walk sheet `art/chars/vance-ow.webp`, plain talk face `portraits/talk/vance.webp`.
- Old sketch/anime style (removed): his eight mood faces `portraits/emo/vance-*.webp`, mood poses `vanceemo` (`art/chars/vanceemo-story.webp`), both cut from `art/emotions/vance.webp`, which came from the approved raw sheet `art/raw/npcs/npc-emotions-vance-v1.png`. Every mood-tagged Julian line (about 11, chapter 11 Gate Infinity and later) swapped him between the two looks.

## Fix (fact)
- Julian is excluded from the mood system: `NO_MOOD = {'vance'}` in tools/sprite-bake/emotion_frames.py and bake_emotion_faces.py, and an exclusion in bake_story_poses.py (`NPC_EMO`). Purged art/emotions/vance.webp, portraits/emo/vance-*.webp, art/chars/vanceemo-story.webp and the vance entries in data/emotions.js, emotion-faces.js, npc-poses.js (grep 0). The rebuild changed no other bytes. Tag `vance1` (EMO_V, npc-poses, emotion-faces, emotions.js, main.js stamp). smoke FAILS []; a Julian mood line resolves to `portraits/talk/vance.webp`, 0 page errors.
- Kept: the raw sheet in art/raw/npcs (Library source), the mood tags in docs/npc-emotion-lines.tsv (ignored until painted mood art exists).
- Not touched: boss Vance (chapter 18 and Julian ch20), a separate painted battle sheet.

## Open (needs Tom)
- Painted mood faces and poses for Julian need a new Art Library entry (same method as other painted townsfolk, real height 6'1"). Until then he has no mood poses. When approved: add it back to the raw list, run `emotion_frames.py vance`, `bake_emotion_faces.py vance`, `bake_story_poses.py` (background, about 11 min), remove `NO_MOOD`, bump EMO_V.
- Tom's check: title stamp `build vance1` or later; chapter 11 Gate Infinity, Julian Vance's lines: the dialogue face should stay the same painted face on every line.
