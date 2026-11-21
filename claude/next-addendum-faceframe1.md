# faceframe1 (2026-11-12 ~22:45 PT, main 6418bb2): NPC dialogue faces zoomed out. Merge into claude/next.md when it is next rewritten.

- Tom's report: NPC portraits in the dialogue box (Doña Carmen shown) were cropped too tight and cut off the face.
- Fact (pushed; smoke FAILS [], tag_check ok): NPC mood faces were cut at `PUPIL_SHARE` .30 and `EYE_AT` .54 (tools/sprite-bake/bake_npc_portraits.py). Now .22 and .47; all 59 NPC mood faces in portraits/emo/ rebaked with `bake_emotion_faces.py <npc ids>`. Cast faces (Tom, Grace, Amy and so on) were not touched. Pip and Luna plain talk faces reframed (`NECK_SET` in bake_talk_faces.py: pip .47, luna .40). `EMO_V` and `TALK_V` are `faceframe1`.
- Looked at: contact sheet of 10 NPCs (all 8 moods), all 59 talk faces, Carmen's box in portrait and landscape. Not looked at: every NPC in every mood in the live game; the angry and sad poses of a few NPCs sit slightly low in the square.
- If Tom says one NPC is still cut off: add an `OVERRIDE[id][mood]` in bake_emotion_faces.py or a `NECK_SET` entry in bake_talk_faces.py, rebake only that id, bump `EMO_V`/`TALK_V`.
- Note for the next session: next.md was not rewritten (it is large and another session edited it minutes earlier); this file holds the change. ORDER NOW in next.md is unchanged.
