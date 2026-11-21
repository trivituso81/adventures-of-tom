# Tom + Rose ride sheets: build notes (2026-11-01, v2 prompts with fixed proportions)

Prompts: claude/tom-ride-prompts.txt (7 sheets, 38 frames; also one txt per sheet) and claude/tom-rose-solo-battle-prompts.txt (Tom alone, Rose alone, 16 frames each). Tom attaches Tom's reference as picture 1, Rose's as picture 2, and sheet 1 as picture 3 for sheets 2 to 7. Sources go to `tools/sprite-bake/src/tomride-<name>-v3.png`; `bake_tomride.py` needs its sheet lists changed (the old v2 sheets are 6-per-row, 4-per-row walk).

## Proportions baked into the prompts (docs/CHARACTER_PIPELINE.md section 7)
| Thing | Battle, ride and hero sheets | Walk sheet |
|---|---|---|
| Head share (top of hair to chin / standing height) | 43 percent, Tom and Rose | 37.3 percent, Tom and Rose |
| Tom standing (ride cells 400 x 640) | 340 px, head 146 px | 340 px, head 127 px |
| Rose standing | 279 px (82 percent of Tom, as in game: Tom 130, Rose 106 battle px), head 120 px | 279 px, head 104 px |
| Pair with Rose seated | 435 px (1.28 x Tom, as the old ride art) | same |
| Solo sheets (256 cells) | Tom 200 px, head 86 px; Rose 164 px, head 70 px | |
The first prompts (sent 15:12 and 15:22) left the head sizes out, drew Rose at 66 percent of Tom and had no style block: replaced. The extra-pose sheets (tomposes1) were run before this and were scaled in the bake only (Tom's head there is the sheet's own, about 0.3).
After baking, run section 7 step 4: head row with Amy, Deedee and Justin, show Tom before and after.

## Tom's rule (2026-11-01)
- Rose STAYS on Tom's shoulders for: Press Start, DEFEND (and the proud intro), and every team move that needs her up there (Double-Decker Airplane, Headphones in the Dark, That Cloud Is Lamby, Lamby Night-Light, Princess and Her Bodyguard ending, Operation Shoulder Mecha).
- For EVERY OTHER Tom ability: Tom tosses Rose off (sheet 4), she lands on her feet at her home spot, `st.shoulder` ends (RIDE badge gone). Same hook as `b2Dismount()` in engine/battle2-kind.js, but with the toss poses instead of her hop.
- Call made: no ride frames for windup, act, leap, cast, spread (no ability keeps her up while those play). Tom KO'd while she rides: she hops off with the existing dismount; no ride KO frame.

## Frames in order (keys), where they land
| Sheet | Cells | Keys | Slot |
|---|---|---|---|
| 1 | 5 | rd_idle, rd_run1, rd_run2, rd_hurt, rd_kneel | idle, run[0], run[1], hurtPose, kneel |
| 2 | 4 | rd_defend, rd_proud, rd_win1, rd_win2 | defend, proud, celeb, leap (celebFlip) |
| 3 | 4 | rd_hold, rd_annoyed, rd_tw_windup, rd_tw_follow | custom poses for Press Start |
| 4 | 5 | rd_grab, rd_lift, rd_toss (Tom + Rose); rose_air, rose_land (Rose alone, her scale) | toss sequence; Rose alone frames replace her leap and landing during the toss |
| 5 | 7 (4 x 2, last cell empty) | rd_hoist, rd_plane, rd_bank, rd_boop, rd_cloud, rd_phones, rd_night | Airplane (1 to 4), Clouds (5), Headphones (6), Night-Light (7); goggles, headphones and Lamby are painted in |
| 6 | 12 (4 x 3) | down, up, left x stand, step1, stand2, step2 | overworld OW.tomRide |
| 7 | 1 | rd_title | welcome screen (set `TITLE_TOM_RIDE=true` in engine/splash.js again) |

## Install checklist
1. Bake sheets to `data/tomride-hires.js` and `art/chars/tomride-*.webp` (face crop check: both faces visible, Rose faces left like Tom, no Rose mirroring needed; delete the ROSE_FLIP table in bake_tomride.py once she is drawn facing left).
2. Add the toss to every Tom ability except Press Start, DEFEND and the Rose-ride combos (gate in the start of Tom's move, before his own animation).
3. Wire rd_hold, rd_annoyed, rd_tw_windup, rd_tw_follow into Press Start when Rose rides; rd_defend and rd_proud into DEFEND.
4. Old Tom-Rose art is the previous black-tee Tom: the new sheets replace all of it.
5. Test: kit_test tom (several moves with Rose riding first), tombo_test rose1/rose3, smoke, overworld walk, title screen.
