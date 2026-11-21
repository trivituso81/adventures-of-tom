# NPC hero prompts, Final Fantasy IX style (Tom 2026-11-09 00:01; main at d772b95)

Read this with claude/next.md. It is not in next.md because that file was rewritten by another session at the same time.

## Facts
- Every NPC (56) has ONE Art Library entry `npc-photo-<id>` (tab NPCs, 2:3, no reference images). Source: tools/art-library/npc-prompts.js (`FF9_TEMPLATE`, `details`, `FF9_REMINDER`). The template is Tom's text, word for word: never edit it. Only the details block changes.
- Each prompt repeats "Final Fantasy IX" and "hand drawn" about 12 and 11 times (Tom asked for as many as possible), and has a PORTRAIT USE paragraph: head large near the top, whole face visible. Poses that covered the face were moved to chest height (Page, Daisy, Ryan, Skye, Moss).
- validate.js allows "Final Fantasy IX" and "Final Fantasy 9" in any prompt. Every other banned style word, and other Final Fantasy titles, stay banned.
- The old group scene, cut and walk entries were purged except the approved Pip, Moss and Dot ones (installed art).

## Decision from Tom (00:01)
Each NPC's hero picture is also the source of that NPC's dialog portrait.

## NOT built yet
- A baker that crops the head from an approved NPC hero into `portraits/<id>.png`, plus `DIALOG_PORTRAIT_IDS` (engine/overworld.js line 28) and the PORTRAITS data. No NPC hero is approved yet, so there is nothing to crop. When the first one is approved: pilot on that one, look at the crop, then batch. Follow the monster-portrait pattern (tools/sprite-bake/bake_foe_portraits.py, docs/MONSTER_PORTRAITS.md).
- NPC walk sheets in this style (the old ones were purged). They need the approved heroes as references.
- The FF9 look is unproven: if the first generated NPC comes out pixelated or flat, reword the template's first line with Tom's OK, not before.

## Waiting on Tom
Generate one NPC (Page is a good test) in the Art Library and say whether the style lands.
