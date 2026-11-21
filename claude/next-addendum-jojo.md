# Jojo: walk sheet and her frisbee golf ability sheet (Tom 2026-11-06): Art Library entries only

LATEST (Tom 12:36, CHANGES 373): Tom made Jojo's hero painting himself in another generator and it is saved as `art/raw/characters/jojo-hero-ref-v1.png` (the reference for everything, like Michael's). The `jojo-hero` Library entry is REMOVED (this overrides claude/next.md item 2j and its "3 Generate presses"). Two entries remain, both drafts attaching the hero: `jojo-walk-sheet` (3 x 3, 1 press) then `jojo-ab-round-with-jojo` (3 x 2, 1 press; needs the walk approved first). Source tools/art-library/jojo-prompts.js. Waiting on Tom to generate and approve.

CORRECTION (Tom 11:55, checked in data/maps-la.js): Jojo already wanders TNB's loft in any chapter after chapter 2 (`away:[{until:2}]`, first seen chapter 3). No apartment scene is needed and none should be proposed. Her new walk sheet replaces the walking set of that loft NPC (`sheet:'jojo'`, older frames in data/jojo-hires*.js, art/chars/jojo-ow.webp).

Hero look (fact, from the painting): long straight light brown hair pulled loosely back with loose strands, tortoiseshell rectangular glasses, gold hoop earrings, blue "Hermosa Beach CA Endless Summer" tee with a sunset-wave logo, baggy purple drawstring pants, cream chunky sneakers, black smartwatch on one wrist, pink crossbody bag on a long strap. Her head size matches Justin, TNB and Boppy's heroes. The pink bag stays in every frame (walk and ability) because it is part of the hero.

Fact: the only other Jojo ids are `tnb-ab-round-with-jojo` and `tnb-fx-round-with-jojo` (TNB's sheets for that move, approved and installed in `tnbinst1`). Her battle cameo today draws `JOJO_BT` frames `b_release`, `b_follow`, `b_celeb2`, `b_high` plus walk steps (`SC.t6_jojo` in engine/tnb-moves.js).

## Install (later, only after Tom approves each sheet)
- Walk: replace the old Jojo overworld set (data/jojo-hires*.js, art/chars/jojo-ow.webp, bake_jojo.py) with the new walk; follow CHARACTER_PIPELINE section 6; show Tom a head row first (adult head share about .21 to .22); purge the old files completely and grep for 0 references.
- Ability: replace the `JOJO_BT` frames in `T.round_with_jojo` (engine/tnb-moves.js) with her new six frames (TNB recipe, claude/next-addendum-tnb-install.md); kit_test, smoke, unused_voice 0. No spoken line for Jojo exists; add none.
- Do not add a `-fx-` sheet (the frisbee and basket are in `tnb-fx-round-with-jojo`).
- Library json edits: edit data/art-prompts.json directly, assert other entries unchanged, validate.js (make-prompts.js currently crashes on main).
