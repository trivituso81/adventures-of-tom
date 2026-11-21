# Battle stance sheets for every character (Tom 2026-11-06 15:47, CHANGES 396): Library entries

STATUS 2026-11-06 (CHANGES 411, push b67fa3a):
- TOM: INSTALLED. Approved `tom-battle-stance-1-v2.png` and `tom-battle-stance-2-v1.png` drive his battle set (`tools/sprite-bake/battle_sheet_frames.py` SOURCE_TAGS; `bake_tom_walk_v4.py`). All 14 `tom-ab-*` Library entries list both as pictures 3 and 4. The approved 14 ability sheets were not re-pressed.
- Everyone else: still DRAFT in data/art-prompts.json (grace, rose, tnb, deedee, boppy, olivia, justin, amy, nara, michael, jojo; sheets 1 and 2 each). Nothing installed.

Fact: 24 Art Library entries (Characters tab, top of each character's group), source `tools/art-library/battle-stance-prompts.js`.
- `<id>-battle-stance-1` (8 frames, 4 x 2, ar 2:1) and `<id>-battle-stance-2` (6 frames, 3 x 2, ar 3:2) for tom, tnb, grace, rose, amy, justin, deedee, boppy, olivia, nara (dog poses, no person layout picture), michael, jojo.
- Same pose order as the cutter's slots: sheet 1 ready, breath, hip, offer, wind, lunge, spread, guard; sheet 2 startled, tired, dizzy, cheer, bigcheer, power.
- Sheet 1 refs: hero, walk sheet, another character's current sheet 1 (grid, angle, figure size only). Sheet 2 refs: hero + the CURRENT `<id>-battle-sheet-1-v1.png`.
- Ids say "battle-stance" so an approved picture (saved as `<id>-v<n>.png`) never overwrites a painted `<id>-battle-sheet-N-v1.png`.
- Cost: 1 Generate press per entry; say so before he approves tests.

Install steps (repeat per character when Tom approves):
1. Show it and a head row. If he replaced sheet 1 only, offer to redo sheet 2 so the pair matches.
2. Point the cutter at the approved file via `SOURCE_TAGS` in `tools/sprite-bake/battle_sheet_frames.py` (`'<id>': {'battle-sheet-1': 'battle-stance-1-v2', 'battle-sheet-2': 'battle-stance-2-v1'}`, with the real version numbers). Sheets that come back on crimson are keyed automatically (`key_ground`, sampled from the sheet's border).
3. Rebake that character's baker, bump tags, kit_test one move per character, smoke, push. Purge the old sheet file only if Tom says so (other cutters read it).
4. Check the figure size: sheet 2 is scaled to sheet 1 by the area rule; look at the contact sheet.
- Moves cut from the old sheets (`ability_frames_<id>.py`) use the ability sheets, not the stance sheets, so they are unaffected.
- Michael and Jojo are not in the game as party members yet; their stance sheets feed the later installs (2f, 2j).
