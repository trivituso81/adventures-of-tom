# Sprite baker (painted characters to game sprites)

Painted characters are drawn as bitmaps (`engine/painted.js`). Each frame also keeps a small quantized row-string copy, because the game's logic reads rows (hand points, Rose's seat, outfit keys, mirroring). Tagged rows draw their painted frame once the atlas has loaded; until then (or if it fails) the rows are drawn.

1. Get two sheets from an image AI: a battle sheet and a walk sheet (rules below). Save as `src/<name>-battle-v2.png` and `src/<name>-walk-v2.png`.
2. `python3 tools/sprite-bake/bake_tom_walk_v4.py` or `bake_grace.py` (copy `bake_grace.py` for the next character; it uses the robust cut for clothes close to magenta, adds the black eye and KO swirl, and has a `beg` frame). It uses `sheet.py` to cut the poses with soft edges and removes magenta fringe.
3. It writes `art/chars/<name>-battle.webp`, `-ko.webp`, `-ow.webp` (painted atlases) and `data/<name>-hires.js` (rows, palette, outfit keys, atlas rects).
4. `data/tom-hires-use.js` shows how the result replaces the old sprite (tags rows with `paintRows`).
5. Run `python3 tools/smoke.py`, `python3 tools/kit_test.py <id> --speed2`, and look at the frames.

## Sheet rules (what the baker expects)

Flat magenta (#FF00FF) background, no shadows, no text, one pose per figure with clear gaps.
- Battle sheet, 2 rows of 6, facing left: ready, wind-up, strike, run 1, run 2, leap / hurt, kneel (black eye), knocked out (lying flat, head to the left), win, defend, cast.
- Walk sheet, 3 rows of 4: facing down, up, left; each stand, step, stand, step.
- Painted look: no outlines, 3 heads tall caricature, warm key light, camera about 25 to 30 degrees down. Use the approved Tom hero image as the reference for the next character.

## Old v1 prompt (Tom, single sheet, superseded)

Create a game character sheet of TOM, a chibi-proportioned adult man for a 32-bit era JRPG. Use the attached photo for his face and the attached pixel sprite for his outfit and proportions. Match the rendering style of the attached background and enemy art exactly: hand-painted pixel art, dense detail, crisp stair-stepped pixel edges, no blur, rich warm saturated colors, golden-hour lighting from the upper left, shading in clean color steps with no dithering noise, dark warm-brown outlines (never pure black).

CHARACTER: big head about 40 percent of total height, short dark brown hair thinning at the temples, full salt-and-pepper brown beard, black graphic t-shirt with a small colorful pixel logo, blue jeans, dark sneakers with white soles. Same outfit in every pose.

CANVAS: one image, flat solid pure magenta background (#FF00FF), no gradient, no ground, no cast shadows, no text, no labels. A grid of equal cells, 6 rows, feet on the same baseline, same size in every cell, nothing crossing into neighbouring cells. Rows as listed above.

For another character, swap the CHARACTER paragraph and use a background color that does not appear in their clothes.

## Ride set: Tom carrying Rose (2026-10-29)

One painted figure for every moment Rose sits on Tom's shoulders. Sheets: `src/tomride-battle-v2.png` (2x6, same cell order as above), `src/tomride-walk-v2.png` (3x4), `src/tomride-hero.png` (reference). `python3 tools/sprite-bake/bake_tomride.py` writes `art/chars/tomride-*.webp` and `data/tomride-hires.js`; `data/tomride-use.js` builds `OW.tomRide` and `TOMRIDE.bt`. Sizes: the baked idle is 138 rows so Tom's body is 100 rows (his own scale); walk is 57 rows so Tom's body is 43. No outfit recolour. The black eye is painted on Tom's kneel frame. Used by: splash (engine/splash.js), overworld (drawSheetActor in engine/town-render.js), battle (rideBodyDraw in engine/rose-ride.js maps each Tom frame to its ride frame; poses with no ride frame fall back to the old layered pixel Rose). The napping frame (`tomrideKo`) is baked but not wired yet.

## Amy (2026-10-29)

Sheets: `src/amy-hero.png`, `src/amy-battle-v2.png` (2x6), `art/raw/characters/amy-walk-sheet-v1.png` (walk, as painted since walksheet3). `python3 tools/sprite-bake/bake_amy.py` writes `art/chars/amy-*.webp` and `data/amy-hires.js`; `data/amy-hires-use.js` (overworld) and `data/amy-hires-battle.js` (battle, loads after `data/amy-poses.js`, before `data/battle-size.js`) wire it in. Her painted head is about 25 percent of battle height (Deedee 28), so HEAD_KB is 2.1 (walk heads are bigger already, HEAD_KW 1.8). The head grows about the neck (`_neck_x`), not the middle of the hair, or profile faces stretch. Head boxes (top, chin, x0, x1) are hand-set in HEAD_BOX from zoomed rulers; `DUMP=<dir> python3 ...` saves every warped pose for checking. The win pose keeps the raised arms unmoved on top of the bigger head (arm pieces are cut out before the warp). Her moves' stock stances (hip, clap, spread, point, aim, throw, pump, flex, wave) point at the nearest painted pose; story poses (sit, toast, hug, carry, shrug, whisper) and the burpee frames stay pixel.
## TNB (2026-10-29)

Painted from `src/tnb-hero.png`, `art/raw/characters/tnb-battle-sheet-1-v1.png` and `-2-v1.png` (battle, as painted since `battlesheet5`: no head sizing or body widening) and `tnb-walk-sheet-v1.png` (walk, as painted). The head sizing and body widening below now apply to the extra pose sheets only (`OLD_IDLE_H` 469, `_Hb` 469 and `_idle_body` 260 are pinned from the old battle idle so every extra frame keeps its size). `python3 tools/sprite-bake/bake_tnb.py` (copy of `bake_deedee.py`) writes `art/chars/tnb-*.webp` and `data/tnb-hires.js`; `HEADSHEET=<png>` saves a grey contact sheet of the head-warped frames for checking. TNB is sized exactly like Tom: the baker solves a head factor per frame (`TARGET_BT` 0.445 battle, `TARGET_OW` 18.2/42 front and back, `TARGET_OWL` 17.5/42 side, all hair-to-chin over height, measured from Tom) using the hand-set chin rows in `HEAD_BOX`. Only hair and skin are scaled; sleeves and mugs inside the head box keep their size (small slivers can remain on windup, strike, leap, win, kneel). The baker also pulls the pink halo off the hair tips (`despill_pink`). Wiring: `data/tnb-hires-use.js` (overworld, before recruit-sprites.js), `data/tnb-hires-battle.js` (battle, after `data/tnb-poses.js`; maps his move-only frames aim, throw, wind, spread, point, hip, clap, carry, shrug to the nearest painted pose so a move never mixes sizes). Size: baked at Tom's 100 battle rows and 42 overworld rows, `BATTLE_SIZE.tnb` 1.3. Extra poses (2026-10-29): `src/tnb-extra-battle.png` (2x6) and `src/tnb-extra-story.png` (3x4) are baked by the same script into `art/chars/tnb-poses.webp` (`TNB_HIRES.pose`). Each sheet is first scaled so the chin-to-sole body equals the ready pose's, then each head is solved to Tom's head size. Head boxes are in `EX_BOX` (hand-set, sheet pixels). `data/tnb-hires-battle.js` maps them: Mug Toss (mugPull, mugWind, mugRel), point/aim, spread, hip, clap, carry, shrug, heave, crouch, dodge, and the story poses sit, toast, sitR, sitToastR, hug, whisper, wave, cheers, talk, talkR, laugh, lookDown. Every TNB pose is now painted.

## Nara (dog), 2026-10-29

Painted Labradoodle from the same three-image set (hero `src/nara-hero.png`, battle `art/raw/characters/nara-battle-sheet-1-v1.png` and `-2-v1.png` (through `battle_sheet_frames.py`, 15 slots, KO = the dizzy frame mirrored to face left), walk `art/raw/characters/nara-walk-sheet-v1.png` (as painted, OW_K 9 since walksheet3)). `python3 tools/sprite-bake/bake_nara.py` writes `art/chars/nara-*.webp` and `data/nara-hires.js`; `data/nara-hires-use.js` (loaded right after `data/nara.js`) swaps the painted frames into `NARA_OW`, `BATTLE_SPRITES.nara` and `KO_SPRITES.nara`. A dog, so no head enlargement and no clothes. Her mouth point (what she carries) and eye are hand-set per pose in `MARK` inside `bake_nara.py`. Battle idle is 84 rows tall (scale 1, not in BATTLE_SIZE); overworld front stand is 31 rows. Her KO sprite is stored facing left (battle-draw mirrors everyone else's, not hers). idle2, hip, spread and point are their own painted frames; throw, wind, aim, clap and sit alias other frames. Set `NARA_HIRES_OFF=true` before `data/nara-hires-use.js` to get the pixel Nara back.

## Boppy (2026-10-29)

Sheets: `src/boppy-hero.png`, `art/raw/characters/boppy-battle-sheet-1-v1.png` and `-2-v1.png` (battle, as painted since `battlesheet3`: no head warp, no body narrowing; idle at 66.7 rows), `boppy-walk-sheet-v1.png` (walk, as painted). `python3 tools/sprite-bake/bake_boppy.py` writes `art/chars/boppy-{battle,ko,ow}.webp` and `data/boppy-hires.js`. The head warp and body narrowing (HEAD_KB 1.563, BODY_W .80, `OLD_IDLE_H` 431, both pinned from the old battle idle) now only serve `bake_boppy_extra.py`, which runs this file up to the battle set so every extra sheet keeps its exact size. Wiring: `data/boppy-hires-use.js` (overworld, loads before recruit-sprites.js), `data/boppy-hires-battle.js` (battle; loads AFTER data/boppy-poses.js, which would otherwise overwrite his run, cheer and expr frames; reads BATTLE_SIZE.boppy). Stock stances: hip and idle2 painted from battle sheet 1; aim, throw, spread, toast, point, clap, shrug come from his stock sheet; story-only poses (sit, hug, carry, whisper) are still the old pixel Boppy.


Ride set update (2026-10-29): the sheets were re-rendered with Tom holding Rose's feet and a smaller Rose. The leg-squash and Rose-shrink workarounds were removed from bake_tomride.py; battle-h is now 128 (Tom body stays 100 rows) and the kneel black eye is painted at (98,164).
Amy head warp, fixed 2026-10-29 after Tom saw a distorted lower face and neck hair: the blend back to scale 1 now happens BELOW the chin (TAPER 30 rows, same idea as Deedee and TNB) so the jaw is not squashed; the warp box is widened to the hair's right edge through the blend rows (`_hair_right`, not for the win pose); head factors lowered to 1.8 battle and 1.45 walk (goal about 37 percent of height like Deedee and TNB).

Combo skins (2026-10-29): src/tomride-combo.png (3x2: biplane, biplane2, cloud, cloud2, phones, night) baked into the ride battle atlas; moves ask for one with rideSkin(key,fallback) (engine/rose-ride.js). Used by Double-Decker Airplane, That Cloud Is Lamby, Headphones in the Dark, Lamby Night-Light. Sleeping pose not used (Tom: no use case).
Amy sized to Tom EXACTLY (2026-10-29): bake_amy.py solves the head factor per set so her head (hair to chin) is 0.445 of her height like Tom's (battle 2.7x, walk 2.1x), and bakes her at Tom's measured figure heights (battle idle 99.5 rows, walk down_stand 41.7 rows; checked from the alpha of both atlases). Battle scale is BATTLE_SIZE.amy 1.3 (Tom 1.3); overworld OW.amy.k is 1. Shirt, sleeves and lanyard are only stretched vertically (not widened) so the shoulders do not flare; poses with arms beside the head (leap, defend, hurt, win, kneel) and the walk-left frames use the single-layer warp. Working canvas pad is 420 px (a bigger head clips at 160).

Boppy size fix and extra poses (2026-10-29): painted battle rows are now 62 high (KB 3, `sp.scale=2*SZ`, `BATTLE_SIZE.boppy` .97) so they match his pixel frames. `bake_boppy_extra.py` bakes `src/boppy-attack-v1.png` (Sheet A) into `art/chars/boppy-extra.webp` + `data/boppy-extra.js`; frames register as `sp.x_<name>` in `data/boppy-hires-battle.js`. Wired: Cap Swat (x_swat, x_follow). Baked but not wired: castb (mirrored), castf, reel (figures too small, need head boxes and a size factor), pepper, fire, seed, jar, marks, sprint. capoff skipped (two caps). Sheet C (`src/boppy-extra-v1.png`, overworld loops) is not baked yet.

## Deedee extra poses
`bake_deedee_extra.py` bakes two ChatGPT sheets (`src/deedee-attack-v1.png`, `src/deedee-story-v1.png`) into `art/chars/deedee-extra.webp` and `data/deedee-extra.js`.
It reuses `bake_deedee.py`'s head warp (`HEAD_K` 1.45, taper below the chin, `KOV` per-pose factor, `KEEP` paste-back) so heads match her core set. Hand points are set by eye in `HANDS`.
Attack frames are `x_*` (used via `DD_XF` in `engine/deedee-moves.js`, falls back to the old frame); story frames replace sit, toast, sitR, whisper, point, spread, carry, hug, shrug, hip, clap in `data/deedee-hires-battle.js`.
Amy head ratio lowered to 0.40 of height (was 0.445) and hair blend lengthened to 55 rows (2026-10-29, Tom: head too big, hair by body shrunk).
Deedee battle (`battlesheet7`, 2026-11-06): the core battle frames are her two painted sheets, `art/raw/characters/deedee-battle-sheet-1-v1.png` and `-2-v1.png`, as painted (no head warp), cut by `battle_sheet_frames.py`; KO is the dizzy sit. The head warp and size below now apply only to her extra sheets, which keep the old idle's measurements pinned (`HEAD_KB` 2.356, `OLD_IDLE_H` 539) and came back byte for byte.

Deedee sized to Tom (2026-10-29): bake_deedee.py solves the head factor (ratio 0.40; battle 1.58x, walk 1.65x), heights 99.5 battle / 41.7 walk, BATTLE_SIZE 1.3, OW k 1. Extras follow via x_ frames (KOVM multiplier for heave).

Boppy matched to Deedee (2026-10-29): bake_boppy.py now solves the head factor per set so hair-to-chin is 0.40 of height (battle 1.45, walk 1.115), and bakes at Deedee's size: battle idle 66.7 rows x sp.scale 1.94 = 129 px (Deedee 99.5 x 1.3), overworld 41.7 rows, OW.boppy.k 1. Measured from the atlas alpha. Front-view chin is row 126 (`w_down*`).

Boppy fishing poses (2026-10-29): `bake_boppy_extra.py` also bakes Sheet C fish1-4, sit1, sit2 into `art/chars/boppy-fish.webp` (BOPPY_FISH in data/boppy-extra.js, feet-anchored, rod kept: `_drop_slivers` is skipped for f_ poses; `tip` = rod tip used as the hand point). Patient Angler uses x_fish1, x_sit1/2, x_fish4 (hook set), x_fish2/3 (reel). The code-drawn rod and crank are skipped when painted (SC.bv_rod). Sheet A poses are baked at the same scale as the idle (battle_h 66.7).

TNB body build (2026-10-29, Tom: body proportions still did not match Tom): head and height already equalled Tom's, but the painted TNB is slim and Tom is stocky (torso width about 0.39 vs 0.50 of height). bake_tnb.py now stretches every row below the chin sideways about the body centre (BODY_KX 1.26 battle/front/back, BODY_KXL 1.16 side view, blended in over 22 rows; env vars override), after the head warp, for every pose including KO (thickness) and the extra sheets. Height and head ratio are unchanged. Torso width is now about 0.45 of height vs Tom's 0.48. Known: thin sleeve slivers beside the head on raised-arm poses (act, celeb, leap) predate this change.

Boppy Sheet B and young runner (2026-10-29): `bake_boppy_extra.py` also bakes `src/boppy-stock-v1.png` (aim, throw, spread, toast, point, clap, shrug; sitc is baked but unused because moves draw their own chair) into `art/chars/boppy-stock.webp` (BOPPY_STOCK) and `src/boppy-young-v1.png` (ready, run1, run2, wind, strike, celebr; no head warp, tallest frame 76 rows) into `art/chars/boppy-young.webp` (BOPPY_YOUNG). Wiring in data/boppy-hires-battle.js: stock poses replace sp.aim/throw/spread/toast/point/clap/shrug; young frames are sp.yg_*; youngOn() in engine/boppy-moves.js maps wind=yg_ready, spread=yg_wind, hip=yg_celebr, run=yg_run1/2. Head factor for f_ and s_ poses now uses the battle factor (was the walk factor). Still pixel: `sit` (Grumble, Nineteen Seventy, Recliner Reservation self): needs a chairless seated pose.

TNB ability frames (2026-11-06): `ability_frames_tnb.py` cuts the 14 approved `art/raw/characters/tnb-ab-<move>-v*.png` sheets (sized so the median upright figure equals the ready pose) and `bake_tnb.py` bakes them into `art/chars/tnb-ab.webp` (`TNB_HIRES.ab`, frames `ab_<short>_<n>`). Objects and effects sheets (`tnb-fx-*`) are cut by `bake_tnb_fx.py` into `art/props/tnb/`.
Deedee ability frames: ability_frames_deedee.py (the 14 approved Art Library sheets, grid cut per sheet) and bake_deedee_ab.py -> art/chars/deedee-ab.webp + data/deedee-ab.js; engine/deedee-moves.js plays f:'ab_<move>_<n>' (trailing F = facing right). Her old towel, nurse and brisk-walk frames were purged by purge_deedee_extra.py (Nov 2026).


## Justin (2026-10-29)

Overworld only. `art/raw/characters/justin-walk-sheet-v1.png` (3 x 3, as painted since walksheet3) -> `python3 tools/sprite-bake/bake_justin.py [--ow-h 53]` writes `art/chars/justin-ow.webp` and `data/justin-hires.js`; `data/justin-hires-use.js` builds `OW.justin`. 53 rows tall, `--contact PATH` saves a contact sheet.

## Battle props (2026-10-30)

Single painted props are cut from the AI prop sheets in `src/props/` by `python3 tools/sprite-bake/bake_prop_sheets.py [--check]` into `art/props/<char>/<slug>.webp`. Details, the hook for using them in a move, and what is wired: `docs/PROP_ART.md`.


## Sharper battle sheets (`sharp1`, 2026-11-05)

The bake scripts write battle sheets at K 2 (Boppy and Justin K 3). A phone stretches K 2 up to 1.45x, which looked blurry, so the sheets in the repo are a larger, sharpened re-build. After ANY battle rebake of a character, run this again for that character (repo root), or its sheets go back to K 2:

```
HIRES=1.5 HIRES_SHARP=80 HIRES_OUT=/tmp/hires python3 tools/sprite-bake/hires.py tools/sprite-bake/bake_amy.py
git checkout art/chars/amy-ow.webp data/amy-hires.js        # hires.py also runs the script's own outputs; keep only what you meant to rebake
python3 tools/sprite-bake/hires_install.py /tmp/hires 1.5 amy-battle amy-ko
```

| Script | HIRES | Sheets to install |
|---|---|---|
| bake_tom_walk_v4.py | 1.5 | tom-battle, tom-ko, tom-poses |
| bake_grace_walk_v4.py, bake_grace_poses.py | 1.5 | grace-battle, grace-ko, grace-wheel |
| bake_grace_ab.py | 1.5 | grace-ab (her 14 ability sheets, 93 frames; cut by grace_ability_frames.py) |
| bake_rose.py | 1.5 | rose-battle, rose-battle-x, rose-battle-tk, rose-battle-bm, rose-ko, rose-ride-bt |
| bake_amy.py, bake_amy_extra.py | 1.5 | amy-battle, amy-ko, amy-ba, amy-bs, amy-bp, amy-mk |
| bake_deedee.py, bake_deedee_extra.py, bake_deedee_ab.py | 1.5 | deedee-battle, deedee-ko, deedee-extra, deedee-ab |
| bake_tnb.py | 1.5 | tnb-battle, tnb-ab, tnb-poses, tnb-ko |
| bake_nara.py | 1.5 | nara-battle, nara-ko |
| bake_olivia_battle.py | 1.5 | olivia-battle, olivia-ko and the 12 move sheets |
| bake_tomride.py | 1.5 | tomride-battle, tomride-rose |
| bake_boppy.py, bake_boppy_extra.py | 1.3333333333333333 (boppy-ko: 1.5) | boppy-battle, boppy-extra, boppy-fish, boppy-stock, boppy-young, boppy-pepper, boppy-ko |
| bake_justin_battle.py, bake_jojo.py, bake_kids.py | 1 (sharpen only) | justin-*, jojo-bt; copy kids.webp by hand (its data file has its own format) |

hires.py prints, per sheet, how much it had to copy back from the small sheet (edits painted after scaling). "NOT tracked" means it found no larger source and skipped the sheet. Then bump `ART_V` (`python3 tools/art-library/bump_tags.py <TAG>`), smoke, and look at a fight.

## Walk sheets (`walksheet1`, 2026-11-05)

Tom, Grace, Rose (walksheet1), Deedee, Boppy, Aunt Ellie (walksheet2), Amy, Justin, Olivia, TNB and Nara (walksheet3) walk and stand with the nine figures of one painted 3 x 3 sheet each: `art/raw/characters/<id>-walk-sheet-v1.png` (rows front, back, side facing screen-left; columns stand, step A, step B; flat magenta). `tools/sprite-bake/walk_sheet_frames.py <id>` cuts them (magenta unmixed on the rim only, enclosed holes cleared) and writes a check strip to /tmp/w/. Used as painted: no head or body resizing, no mirroring; the pass frame is the stand. Bakes: `bake_tom_walk_v4.py`, `bake_grace_walk_v4.py`, `bake_rose.py`, `bake_deedee.py`, `bake_boppy.py`, `bake_ellie.py`, `bake_amy.py`, `bake_justin.py`, `bake_olivia.py`, `bake_tnb.py`, `bake_nara.py` (each OW_K default is the repo value). Head warps and Boppy's body narrowing apply to battle poses only. Because these scripts also write battle sheets at K 2, run them through hires.py and hires_install.py (table above) and confirm every battle sheet comes back byte for byte unchanged. The next character's sheet works the same way: save the sheet under that name and call `build('<id>')` from its bake.

## Battle sheets (`battlesheet2`, 2026-11-05)

Tom, Grace and Rose fight with the 14 figures of two painted battle sheets each (the Art Library Characters prompts `char-battle-sheet-1.txt` and `-2.txt`): `art/raw/characters/<id>-battle-sheet-1-v1.png` (4 x 2: ready, breath, hip, offer / wind, lunge, spread, guard) and `<id>-battle-sheet-2-v1.png` (3 x 2: startled, tired, dizzy / cheer, bigcheer, power). `tools/sprite-bake/battle_sheet_frames.py <id>` cuts them (same magenta key as the walk sheets) and writes a check strip to /tmp/bs/. Used as painted: no head or body warp, no mirroring. Sheet 2 comes back at its own size, so it is scaled by the square root of the area ratio of its cheer to sheet 1's hands-on-hips pose. The sheets have no run frames: run1 and run2 are the walk sheet's two side steps, scaled so the side stand is as tall as the ready pose.

Game slots (`SLOTS`): idle ready, idle2 breath, hip, cast offer, windup wind, act lunge, spread, defend guard, hurt startled, kneel tired, celeb cheer, leap bigcheer, point power, run1, run2; knocked out = the dizzy sit (own atlas). Each bake keeps the idle at its old visible height (Tom 100 rows, Grace 90, Rose 83) so sizes in a fight do not move. Extra sheets sized against the old battle sheets keep pinned scales (Tom `FB_CUSTOM`, `HEAD_KB`; Rose `OLD_IDLE_H`, `OLD_DEF_H`) and come back byte for byte. Then run hires.py and hires_install.py as in the table above. Next character: save its two sheets under those names and call `build('<id>')` from its bake (`run_from_walk=False` if its walk sheet is still the old style).

## Story poses (`storypose1`, 2026-11-06)

Painted front-facing cutscene poses on a 4 x 2 magenta sheet (art/raw/characters/<sheet>). `python3 tools/sprite-bake/bake_story_poses.py` cuts every sheet in its SETS table (walk_sheet_frames.grid), sizes each so its reference standing frame equals the walk stand, and writes art/chars/<id>-story.webp and data/story-poses.js. A scene shows a frame with `{pose:'<actor>', f:'<frame>'}` and clears it with `{pose:'<actor>'}`. Add a new sheet by adding a SETS entry (frame names must be unique per character).

## Rose's ability frames and objects (2026-11-06)

Poses: `art/raw/characters/rose-ab-*.png` (14 sheets, magenta, mostly 3 x 2; Bedtime Story and Tea Party 3 x 3) are cut by `ability_frames_rose.py` (same method as Tom's `ability_frames.py`; Tea Party frame 4 clears the painted "DRINK UP" lettering). `bake_rose.py` puts the 90 frames in their own atlas `art/chars/rose-poses.webp` (`ROSE_HIRES.ab`, drawn as `ab_<short>_<n>`; `data/rose-hires-use.js` adds right-facing `ab_<short>_<n>F`). Install: hires.py then `hires_install.py /tmp/hires 1.5 rose-battle rose-battle-x rose-ko rose-ride-bt rose-poses`. Rose's old Tickle Storm and Boomerang pose atlases are gone (the boomerang sheet is still read for the two lambs, `art/props/rose/lamby_fly.webp`).
Objects: `bake_rose_fx.py` cuts `rose-fx-<move>-vN.png` and writes the approved item over the old prop of the same shape (`INSTALL` table); other items are not installed yet (effects the scenes still draw: hearts, stars, poofs, sparkles, steam, flames, glows, feathers, cookie, juice box, helmet, levers, tape, Lamby variants).
## Ride poses (`ride1`, 2026-11-06)

Tom carrying Rose now uses one painted 4 x 3 sheet, `art/raw/characters/tomride-poses-v2.png` (cells in reading order: kneel, lift, cheer, laugh, hop off, sit, wobble, tired, walk, run, hand out, hand on hip). `bake_tomride.py` cuts it with `battle_sheet_frames._cut` and bakes cells 6, 9, 10, 7, 8, 11, 12, 3, 5 as the battle frames idle, run1, run2, hurt, kneel, defend, proud, celeb, leap (one scale: Tom's body 366 px = 100 rows); act and cast use the hand-out frame. Kept from the older sheets s3 to s7: hold, annoyed, tw_windup, tw_follow (Press Start), grab, rlift, toss, Rose in the air, the combo skins, and every overworld walk frame (the new sheet has no front or back walk). Old sheets s1 and s2 purged (the old idle height is the constant `H0b` 689 so the kept frames bake as before). `bake_story_poses.py` set `tomride` (stored under member `tom`) bakes cells 1 to 6 as the chapter 1 opening poses tr_kneel, tr_lift, tr_cheer, tr_laugh, tr_hopoff, tr_sit at Tom's walk size. Battle: `hires.py` on bake_tomride.py, then `hires_install.py /tmp/h 1.5 tomride-battle tomride-rose` (the overworld atlas is not hires-installed: restore art/chars/tomride-ow.webp with git checkout after a run).
