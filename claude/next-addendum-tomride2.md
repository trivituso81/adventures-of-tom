# tomride2 (2026-11-12 ~17:10 to ~17:30, main 4b464bb): Art Library entries for the missing Tom-carries-Rose frames. Waiting on Tom's 5 Generates

Tom 17:07: asked where the Rose-on-shoulders frames are in the Library, then "add them as a new character entry". Art Library entries only: no engine, scene, data or tag change.

## Fact
- Before: no Library entries existed for the ride (only `rose-ab-mecha-ult`, `rose-fx-mecha-ult`, `room-memrose`). The painted ride sheet is `art/raw/characters/tomride-poses-v2.png` (12 cells, installed in ride1, CHANGES 322). Prompt text for 7 sheets lived only in claude/tom-ride-prompts.txt.
- Now (pushed, validate OK 874 entries, smoke FAILS []): builder `tools/art-library/tomride-prompts.js` (in make-prompts.js module list), Characters tab, new group `Tom and Rose ride`:

| Entry id | Frames | Grid |
|---|---|---|
| tomride-press-start | 4: hold, annoyed, throw wind-up, follow-through | 4 x 1 |
| tomride-toss | 5: grab, lift, launch, Rose in the air, Rose lands (last two Rose alone) | 3 x 2 |
| tomride-combo | 7: hoist, airplane level, airplane banked, boop, cloud look, headphones, night-light | 4 x 2 |
| tomride-walk | 12: down, up, side, 4 each | 4 x 3 |
| tomride-title | 1 large title pose, Rose waving | single |

- Refs: picture 1 is the approved ride sheet `tomride-poses-v2.png` (locks faces, Tom's NES tee, head sizes, scale, angle), then tom-hero-v2, rose-hero-v1; the walk entry adds tom-walking-sheet-v3 and rose-walking-sheet-v2.
- Decisions (fact): no head pixel numbers (the old prompts' 146 px / 120 px numbers predate Tom's new outfit and head sizes; the approved sheet carries them); no left or right facing words (facing copied from picture 1); one sheet per entry as before.

## Next
- Tom presses Generate on the five entries and approves (5 presses). Then install per claude/tom-ride-build-notes.md "Install checklist" (bake to data/tomride-hires.js and art/chars/tomride-*.webp via a `bake_tomride.py` update; toss on every Tom ability except Press Start, DEFEND and the Rose-ride combos; wire Press Start poses and the combo skins; replace overworld walk with Rose up; title pose only if TITLE_TOM_RIDE is brought back). Rebake once with no change first and confirm byte for byte.
- If a sheet misses twice in a row (for example frames repeat or Rose faces away): stop-loss, say what is wrong; the likely different method is one entry per frame group with the previous approved sheet as a fourth picture.
