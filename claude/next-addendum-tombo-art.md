> SUPERSEDED 2026-11-07 01:45 by claude/next-addendum-tombo-split-sheets.md (Tom: pair sheets did not work; every Tombo now gets a Tom sheet, a partner sheet and an object sheet, built in two big pushes). Where this file disagrees, the split-sheets file wins. Kept for the entry shape, refs and facts below.

# TOMBO ART LIBRARY PROMPTS (Tom 11-06 10:17: "Add to the building instructions to put in prompts for the art library for all of the combos for each character ... I defer to you on where in the art library ... individual character as part of their combo or combined sheet ... combining characters into one sheet is risky")

Build nothing from this file until it is the next task in claude/next.md. It adds Art Library entries only: no game files, no tag bump, no Generate presses until Tom presses them.

## Facts (checked in the docs; verify against the repo before writing entries)
- 21 Tombos: Tom plus one partner, 3 per partner. Partners: Grace, Rose, Amy, Deedee, Boppy, TNB, Nara. Ids in `B2_TOMBOS` (data/battle2-data.js): `grace1` to `grace3`, `rose1` to `rose3`, `amy1` to `amy3`, `deedee1` to `deedee3`, `boppy1` to `boppy3`, `tnb1` to `tnb3`, `nara1` to `nara3`.
- 4 Family Finishes: `ff1` Sleepover at Tom's (Tom, TNB, Grace, Rose), `ff2` Run With Us, Mommy! (Amy, Grace, Rose, no Tom), `ff3` Fifty-One Years & Counting (Deedee, Boppy, Tom), `ff4` The Extra Place (whole party, 3 or more).
- 25 Director's Cuts: one alternate version of every Tombo and Family Finish, ids `<id>_dc`.
- What each person does in each Tombo (the two columns Tom's design table lists, plus unlock beat and battle effect): claude/battle-design.md "Complete Tombo Table" (STALE, see next.md 2h). Live names and animation beats: last definition of each `B2_TOMBO_ANIM.<id>` in engine/battle2-kind.js (later definitions win), names in B2_TOMBOS.
- The old 138 Tombo props are painted and cut (art/props/tombo/<slug>.webp, claude/tombo-prop-sheets.md) in the old style; the split-sheets spec replaces them with new object sheets. Bursts, flashes and confetti stay drawn in code.

## Entry shape (copy the ability and fx pattern; json edited directly)
- Fields: `{status:'draft', id, tab, group, title, ar, refs, prompt}`, no versions key. Group names max 40 characters, no colon, no ampersand.
- Refs cap 5. Rose-rides entries add `tomride-poses-v2.png`. Nara: dog wording (no hands, tail and ears carry the feeling).
- Rules in every prompt: no left or right words; FLINCH, TIRED, NAP, never hurt, KO or "knocked"; never 16-bit, 32-bit, SNES, Final Fantasy, pixel art, retro, sprite; no em dashes; spoken lines are not drawn; heights Tom 5'11, TNB 5'10, Boppy 5'7, Amy and Deedee 5'5, Grace 4'2, Rose 3'4, Nara a medium dog. Adult heads one size, kids follow Grace and Rose.
- Do NOT install anything. Approved is not installed.

## What the old version of this spec said and why it changed
It put Tom and the partner in one 3 x 2 picture per Tombo (and held props in hands). Pressed sheets drifted (fused people, invented scenery, cropped seated bodies, props). The pre-written fallback (split into `-tom` and `-<partner>`) is now the main method, plus a separate object sheet.
