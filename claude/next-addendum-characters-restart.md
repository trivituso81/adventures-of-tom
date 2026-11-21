# Characters tab (Tom 11-05 23:24 and 23:46, `abil1` CHANGES 290, `abil2` CHANGES 291, main b84a148). READ THIS FIRST for Art Library character work.

- Tom 23:24: per character, a sheet prompt for every ability, with hero, walk, battle sheet 1 and battle sheet 2 as reference pictures. Tom 23:46: "i will be providing the 2 battle sheets for each character to claude ... no need for creation of those with prompts".
- So Tom SENDS Claude all four pictures per character. Save them as:
  art/raw/characters/<id>-hero-ref-v1.png, <id>-walk-sheet-v1.png, <id>-battle-sheet-1-v1.png (8 frames), <id>-battle-sheet-2-v1.png (6 frames). Commit and push; the ability entries unblock by themselves (art.html HEAD-checks them).
- Exists now: hero for tom, grace, rose, ellie; walk for tom, grace, rose, deedee, boppy, ellie. NO battle sheets yet (Tom's 14 abilities show Blocked "Waiting for a picture you send to Claude: tom battle sheet 1.").
- Library entries: only `<id>-ab-<move>`, one per Primary-kit ability (data/abilities.js B8_KITS p versions), 3 x 2, 6 frames, ar 3:2, refs hero, walk, battle sheet 1, battle sheet 2. Prompt = prompts/char-ability-sheet.txt header + "The move: <name>" + 6 frames from the move's beats in engine/<id>-moves.js.
- Tom done (14 entries). Next character: add their list to ABILITIES and GROUP in tools/art-library/char-prompts.js, splice the entries into data/art-prompts.json directly (do NOT run make-prompts.js), validate, push.
- No left/right words in prompts; name only what should appear. Rose on Tom's shoulders is NOT in these sheets. Remix versions and Tombos not included.
- Battle sheets Tom sends replace the old battle art only when he asks for an install (bake script still to write against the first sheet; frame order = storybook battle prompt order: sheet 1 ready, ready breathing, hands on hips, offering, wind-up, lunge, arms wide, guard; sheet 2 startled, tired, dizzy, cheer, big cheer, power pose).
