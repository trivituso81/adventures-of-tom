# NPCs walked backwards: fixed (npcface1, main at 0c05c21; CHANGES "npcface1")

Read with claude/next.md; fold into it at the next rewrite.

- Tom 11-10 13:59: the new NPC walking frames look like they move backwards.
- Cause (fact): bake_townsfolk.py mirrored every Library sheet's side row, assuming the generator draws it facing RIGHT (true only for Gus v3). All 21 sheets in LIBRARY_WALK (Gus v5, Pip, Moss, Dot, and 17 more) face LEFT, so the baked `left` frames faced right. Pip, Moss and Dot were wrong too.
- Fix: side rows used as drawn. `SIDE_FACES_RIGHT` (empty set) in the baker lists any sheet that faces right. `SIDE_SWAP` and `swap_legs` removed (Gus v5 side steps already differ).
- Rule for every new NPC walk sheet: look at the side row and say which way it faces before adding it to LIBRARY_WALK. Do not trust the doc line "faces RIGHT" (npcwalk addendum is outdated on this).
- Tests: no-change rebake byte for byte first; contact sheet of 21 baked left frames looked at; smoke FAILS []; tag_check ok. Not checked on a phone or in a live game screenshot.
- Waiting on Tom: phone check that NPCs face the way they walk (left, right) and that legs alternate.
