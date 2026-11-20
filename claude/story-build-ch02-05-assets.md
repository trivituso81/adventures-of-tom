
# Chapters 2 to 5 assets (2026-11-13, the assets-first step for chapters 2, 3, 4 and 5)

Status: ASSETS ADDED AND PUSHED to main (commit d9f42cd, tag ch25assets1). Nothing is built in the game. Chapter 5 is still DRAFT revision 3 in the docs; its assets were added anyway and may need a small redo if Tom changes it.

Art library (ADMIN > ART LIBRARY, groups "Chapter 2" to "Chapter 5", 55 draft entries; prompts in tools/art-library/ch02-05-prompts.js): Chapter 2 has 15, Chapter 3 has 8, Chapter 4 has 13, Chapter 5 has 19. Per chapter: orange block, coin close-up, grey-patch area or room, boss sheet with the coin, props, Nara story frames (3x2 sheets), Tom and TNB story frames, NPC poses, phone photos. Skipped because already built: the Vance walk, Boppy's pepper jar, the Snag boot, the sign-up sheet monster, the happy puddle.
- NOT WRITTEN: Clara (Grace's classmate). A real height in feet and inches is needed first.
- "Normal" versions (hill, Whisker Perch, megaphone, red pen) can wait for the return after chapter 6.

Voice library (ADMIN > VOICE LIBRARY, filter by chapter, Show > No clip yet): 426 lines listed (ch2 115, ch3 81, ch4 94, ch5 136), directions in tools/voice-library/scripts/ch02..ch05-story-directions.json; 2 already have clips or dedupe, so about 424 to record. Clara and Man in the long coat now have voices in data/dialog-cast.js (existing voices only, no new ElevenLabs voice).
- Same rule conflict as section 9: the build for each chapter must wire these lines into scenes in the same change, or remove them.

What Tom does: generate and approve the art, record the clips, Export pending, send the file back, and give Clara's height.
