# Sprite baker (painted characters to game sprites)

The game draws every character from palette keys and row strings. This folder turns a painted character sheet into that format.

1. Get a sheet from an image AI (prompt below). Save it as `src/<name>-sheet.png`.
2. `python3 tools/sprite-bake/bake_tom.py` (Tom only so far; copy and adapt for the next character).
3. It writes `data/<name>-hires.js`. `data/tom-hires-use.js` shows how the result replaces the old sprite.
4. Run `python3 tools/smoke.py`, `python3 tools/kit_test.py <id> --speed2`, and look at the frames.

## Sheet rules (what the baker expects)

Flat magenta (#FF00FF) background, no shadows, no text. Six rows of poses:
1. Overworld facing down: stand, step, stand, step.
2. Overworld facing up: same.
3. Overworld facing left: same.
4. Battle, facing left: ready, wind-up, strike, run 1, run 2, leap.
5. Reactions, facing left: hurt, kneel (black eye), knocked out (lying flat, head to the left), win, defend, cast.
6. Face expressions, head and shoulders: neutral, happy, surprised, annoyed, proud, sad.

## Prompt (Tom)

Create a game character sheet of TOM, a chibi-proportioned adult man for a 32-bit era JRPG. Use the attached photo for his face and the attached pixel sprite for his outfit and proportions. Match the rendering style of the attached background and enemy art exactly: hand-painted pixel art, dense detail, crisp stair-stepped pixel edges, no blur, rich warm saturated colors, golden-hour lighting from the upper left, shading in clean color steps with no dithering noise, dark warm-brown outlines (never pure black).

CHARACTER: big head about 40 percent of total height, short dark brown hair thinning at the temples, full salt-and-pepper brown beard, black graphic t-shirt with a small colorful pixel logo, blue jeans, dark sneakers with white soles. Same outfit in every pose.

CANVAS: one image, flat solid pure magenta background (#FF00FF), no gradient, no ground, no cast shadows, no text, no labels. A grid of equal cells, 6 rows, feet on the same baseline, same size in every cell, nothing crossing into neighbouring cells. Rows as listed above.

For another character, swap the CHARACTER paragraph and use a background color that does not appear in their clothes.
