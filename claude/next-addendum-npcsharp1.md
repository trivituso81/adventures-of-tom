# next-addendum: NPCs too blurry (npcsharp1, main at cca7f7d, 2026-11-10 evening)

Read with claude/next.md (not edited: fold into the next rewrite).

- Tom 11-10 19:38 (phone screenshot, Sal in the taxi office): "NPCs are too blurry, fix it."
- Cause (fact): painted townsfolk atlases (`art/chars/<id>-ow.webp`) were baked at 3 px per grid pixel (Sal 126 px tall) and drawn about 1.6x bigger in rooms (`owHouseParty`) plus screen zoom. The cast atlases are far larger, so NPCs looked soft beside them.
- Fix: `tools/sprite-bake/bake_townsfolk.py` `HI = 2` (atlas 6 px per grid pixel, `k:6` in `data/townsfolk-hires.js`). On-screen size unchanged. Baseline rebake reproduced the repo byte for byte first. Tag npcsharp1, CHANGES entry written.
- Tests: Sal's taxi room looked at in portrait (crisp). Smoke FAILS [], tag_check ok. Landscape screenshot taken but not opened (smoke covers both).
- Cost: townsfolk `*-ow.webp` total 15 MB to 27 MB (lossless). If load or memory complaints follow, try lossy webp quality 95 in `pack()` for townsfolk only.
- Not covered: pixel villagers (`drawNpc`, `villagerSet`) are still low-res by design; Jojo, Michael, Nara and the cast were not touched (they were already large).
- If Tom still says an NPC is soft: check that person's atlas size in `art/chars` and whether he is a pixel villager before rebaking anything.
- Next task is unchanged: NPC emotion install (NEWEST M in claude/next.md). Prompt: "Read claude/next.md and continue."
