# Sprite baker (painted characters to game sprites)

Painted characters are drawn as bitmaps (`engine/painted.js`). Each frame also keeps a small quantized row-string copy, because the game's logic reads rows (hand points, Rose's seat, outfit keys, mirroring). Tagged rows draw their painted frame once the atlas has loaded; until then (or if it fails) the rows are drawn.

1. Get two sheets from an image AI: a battle sheet and a walk sheet (rules below). Save as `src/<name>-battle-v2.png` and `src/<name>-walk-v2.png`.
2. `python3 tools/sprite-bake/bake_tom.py` or `bake_grace.py` (copy `bake_grace.py` for the next character; it uses the robust cut for clothes close to magenta, adds the black eye and KO swirl, and has a `beg` frame). It uses `sheet.py` to cut the poses with soft edges and removes magenta fringe.
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
