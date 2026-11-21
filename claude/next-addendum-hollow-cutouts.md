# Grump Hollow v3 cutout masks: check (2026-11-06 13:50)

Painting: new storybook Hollow Tom sent 13:41 (1310 x 1200, plate 1536 x 1408, same 12:11 aspect). Prompts: claude/hollow-v3-cutout-prompts.txt. Masks from the same generator chat, all 1310 x 1200, no resize needed. Method as Square (claude/square-v3-install.md): key magenta (distance over 90 from 255,0,255, open 1 px), per-piece scale and shift search, cut pixels from the ORIGINAL only.

| Mask | Verdict | Fit (per piece) | Notes |
|---|---|---|---|
| 1 Trees, ferns, tall plants | USE, drop 1 | scale 1.00, shift 0 on the big frame piece and the right/bottom-right piece; cattail clumps 1.00, 0 | Drop the tiny reed tuft at x 935 to 1009, y 483 to 547 (match error 42, partly invented). Cattail clumps stand in water (player never walks there): harmless, keep. Left and bottom edge bushes included. |
| 2 Exit arch and fences | USE | scale 1.00, shift 2 px down (error 28.8 to 21.9) | One piece: board, log posts with rope, both fences. Lettering matches. Edges clean at 2x on checkerboard. |
| 3 Boulders and stump | USE | 16 pieces at 0.94 to 1.00, 0 to 2 px | Small pond-edge stones in water are harmless. Stump includes its mushrooms. |
| 4 Benches and props | USE | scale 1.00, shift 0 (mushrooms 0.98) | Left bench, Boppy's bench with thermos, bucket, rod; two mushroom clumps. Rod tip carries a few pond pixels (fishing line): cosmetic. |

## Install (not started; waits on Tom's go)
- Needs the painting plus 4 masks re-attached if a new session (file order Tom sent: arch, trees, boulders, props).
- Replace art/hollow.webp and art/hollow-fg.webp and its pieces (`PLATE_BEHIND.hollow`, 31 pieces today); template tools/make_row_layers_v2.py and claude/square-v3-install.md.
- New painting layout differs from the installed one: re-derive `plateMask` for map `hollow` in data/maps-le.js, exit tiles under the arch (bottom, to the Square), spawn, `border.open`, `pools` water cells (pond now top right), MONSTER_SPOTS, tap objects (Soggy bench on the left bench, Boppy's fishing spot on the right bench), scene starts. Run mask_overlay.py and reach_test.py (0 fails).
- Contact sheet of every piece on checkerboard plus in-game shots (behind a tree, under the arch, behind a boulder, behind Boppy's bench) in portrait 393 x 852 and landscape 852 x 393 to Tom before pushing.
