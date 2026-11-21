# Deedee ability install: old frames still show (Tom 11-06 10:54)

## Why (fact)
- Tom: "I see the old graphics coming through the old frames and character models" in Dish-Towel Flick and Garden Shower.
- All 14 Art Library entries `deedee-ab-<move>` are approved (art/raw/characters/deedee-ab-*-v1/v2.png), and her fx props are installed (`dfx2`, `dfx3`, `dfx4`, props in art/props/deedee/). But the ability SHEETS were never installed: no `art/chars/deedee-ab.webp` exists. Her moves in engine/deedee-moves.js still pose her with the old battle frames (`x_fwalk`, `x_fspot`, `x_ftaut`, `x_fshake`, `x_fsnap` from deedee-extra / deedee-battle), so old Deedee shows with the new props.
- Same gap TNB had before `tnbinst1`.

## Build
Follow the TNB recipe (claude/next-addendum-tnb-install.md, claude/next-addendum-nara-install.md, claude/next-addendum-ability-rest.md): cut each approved sheet (newest approved version: dish-towel-flick v2, beanie-master v2, grandma-squeeze v2, rest v1) into frames `art/chars/deedee-ab.webp` (keys `ab_<short>_<n>`, prefix e.g. `deab_`), cutter `tools/sprite-bake/ability_frames_deedee.py` modeled on `ability_frames_tnb.py`, wire in her hires battle data, rewrite each move's Deedee poses to play the painted frames in engine/deedee-moves.js (new final IIFE; numbers, lines, VP, timing unchanged), purge the replaced old frames and the dead older duplicate definitions (`D.garden_shower` appears 4 times, `D.dish_towel_flick` several), grep 0.
Order inside the job: Dish-Towel Flick and Garden Shower FIRST (look at frames, then the other 12), kit_test all 14 FAILS: [], smoke, unused_voice 0, bump tags, CHANGES, push, ONE line to Tom.
Check first that the old `x_f*` frames are not used by non-ability scenes before deleting.
