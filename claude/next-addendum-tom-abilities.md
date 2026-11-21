# Tom's ability frames and objects installed (2026-11-06, `ab1` CHANGES 305, `ab2` CHANGES 306)

Read this with claude/next.md (its NEXT TASK ABILITY section says "when Tom asks to install" for Tom: that is DONE).

## Frames (ab1)
- 84 painted frames (14 moves x 6) baked as `ab_<short>_<n>` (short: mash defend splash snob gadget anc seat delta cards konami skin kanji fact cart). Cutter tools/sprite-bake/ability_frames.py (per-sheet size by median height; DEFEND frame 3 loses its painted speech bubble; skincare busts get the battle idle's legs). Bake: bake_tom_walk_v4.py (BT_PAL pinned so gear.js still finds meta.bt.keys ['n']; pack_shelf atlas). Frames are used in a move with `f:'ab_<short>_<n>'` in ST.keys. `<name>R` is the mirrored copy.
- Kept old poses: proud, bowlsit, spook, scream, cower (horror-movie Tombo in battle2-kind.js; sources tom-xposes-3 and 5). Everything else old (`c_` frames, tom-xposes-1,2,4,6,7,8) purged.
- While Rose rides Tom's shoulders the new frames fall back to the old layered Rose (NEXT TASK RIDE).

## Objects (ab2)
- tools/sprite-bake/bake_tom_fx.py cuts the 14 tom-fx sheets to art/props/tom/<move>_<slug>.webp (123 props). Wired: mash controller, no-signal, dizzy stars; painted kanji cards and question tile; seat sign, cabin door, duvet; delta scanner, gate, pod, jet, towel, mask; konami floor controller; skincare lit mask; know-it-all FALSE mark; defend placard.
- Not installed: skin timer (generator drew a second pause), kanji strokes 1, 3, 4 (came back as the whole kanji): redo in the Library if Tom wants painted strokes. Cartridge and console keep old art (live-battle window mapped to old geometry). Effect items (swoosh, bursts, steam, hearts, glows, ink, flames, embers) are cut but the shared code effects still draw those moments: next step is swapping them in move by move.
- Flashcard Flurry: Tom stays where he stands (Tom 01:20).
- Boarding sign (seat) draws larger than before and its old code stake still shows: tune in SC.t3_group5.
