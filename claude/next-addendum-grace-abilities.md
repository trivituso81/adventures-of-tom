# Grace's approved abilities and objects: INSTALLED (2026-11-06, CHANGES 316 and 317, tags gab1)

Read this with claude/next.md. next.md itself was not rewritten (it is over its size cap and other sessions edit it); fold this into it at the next rewrite.

## Done
- 316 (`gab1`): all 14 Grace ability sheets drive her battle moves as painted. Cutter `tools/sprite-bake/grace_ability_frames.py`, bake `tools/sprite-bake/bake_grace_ab.py` -> art/chars/grace-ab.webp, data/grace-ab.js (frames `ab_<short>_<n>`, mirrored `..R`). Old grace-extra files, rig pose table and drawn brush, bottle, trophy helpers purged. Wheel data (GRACE_WHEEL) stays: her Tombos in engine/battle2-kind.js still use it.
- 317 (`gab1`): 18 objects from the 13 grace-fx sheets replace the older props of the same name (`tools/sprite-bake/bake_grace_fx.py`, MAP table; `bake_prop_sheets.py` skips those slugs via GRACE_FX_SLUGS). Purged hairbrush_microphone, pink_nail_polish_bottle, gold_trophy_cup.

## Known caveats (tell Tom if he asks)
- Squishy Squeeze, Welcome Back, Olympic came back as 3 x 3 sheets with smaller figures: upscaled more (softer). Squishy frame 3 is cut at the thigh, frames 4 to 6 borrow legs. Fix = regenerate those three at 3 x 2 in the Art Library.
- Handstand frames use a head anchor; may need x/y tuning if Tom says feet float.
- Props still old style (no counterpart swapped): gem_blue/pink/gold/hopper/cluster, sparkle_star, ear_rings, snapped_string, blank_page, pencil_shavings, plush_squishies, gold_dumpling_hero. fx sheets also hold items no move uses yet (spotlight cones, trophy, LIVE badge, REC, hearts, backpacks, cat/panda/peach squishies).

## Next (when Tom asks)
- Same install for Rose and Deedee (their ab sheets and fx sheets) following this recipe.
- Not done: no phone verdict yet. Ask ONE line: do Grace's 14 moves look right on the phone?
