# Addendum to next.md (2026-11-05, enemy sessions): boss prompts. Fold into the ENEMY ART section of next.md, then delete this file.

Read next.md first. This only adds what happened after its 17:20 rewrite. CORRECTION to earlier text of this file: LEAD is no longer used (see 17:00 fix below).

## What changed (all Art Library prompts only, no game files, no tag)
- CHANGES 242 to 244: Acorn Cache poses; Ironbelly and Mirrorball richer look. Then all other bosses: `FLAIR` (richer look) and six-pose `POSES` in tools/art-library/enemy-prompts.js.
- 17:00 FIX (Tom: bosses did not come out handbrushed like regular enemies): approved boss sheets were smooth digital renders. Cause: my boss wording ("grand, richly detailed boss painting", gleaming, glossy, polished, glittering). Now every boss prompt opens with the exact regular sentence "Repaint attachment 2 as a handbrushed painting.", the richness is one separate sentence ("Make the forms grander and more dramatic, with more detail painted in the shapes: <FLAIR>"), gloss words removed, "thick visible brush strokes everywhere including the background, not a smooth digital render" added. If bosses still come out smooth after regeneration: STOP-LOSS, recommend the NPC method.
- Old Big One: moved to the short boss method (3 x 2, guide, tiny pie tin one sixth of height, giant that fills the cell, Big Glare poses). Tom's long edited prompt was replaced; v1 stays in versions.
- Red Pen pose 2 (hit) made dramatic. Chairman: throne in all six poses, pose 6 stays seated (the approved sheet had it leap off).
- `LIKENESS` map in `sheetShort`: Warden Boppy gets `docs/reference/boppy-face.png` (face close-up cropped from boppy-hero.png) plus boppy-hero.png as refs 4 and 5, open-faced helmet. Fact: at 3 x 2 the face is only about 50 px wide; if the likeness is still weak, ask for one larger picture of the Warden.
- Avoid the soft word "knocked" (validate.js fails on it): use "thrown back", "rocked back".

## Julian Vance (two Library entries, one man)
- Facts: `vance` (chapter 18, loom, level 26) and `julian` (chapter 20, core, level 28) are the SAME man fought twice. The game uses ONE old sheet for both (alias at the top of data/foes/use.js). Two Library entries make two independent pictures, so faces differ; `julian` also has no guide picture (description only).
- Plan (Tom's question 17:09, answer pending): approve `vance` first (first appearance, sets his face). Then rewire `julian`: refs = [style key, the approved vance sheet or a crop of its stance frame, finish], prompt "same man as attachment 2: same face, coat, hat and build, only softer expression, warmer light, loose gun", and the six poses from POSES.julian. Alternative: keep the alias so both fights use the one Vance sheet. Do this only after Tom approves a Vance sheet.
- Same pattern for any enemy that appears twice (check gridlock vs gridlockprime, lastcall vs finalcall).

## Waiting on Tom
- Generating and approving boss sheets in the Library (bosses are 3 x 2). Read each approved picture before baking: design kept, matte, six poses distinct, pose 6 not a copy of pose 1.
- Unanswered: one picture per pose for bosses (tested on Old Ironbelly or the Warden). Ask once, as one short question, only after the regular enemy bake is installed.
