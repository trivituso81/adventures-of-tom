# Almond Milk, Please: Amy kicks a milk carton (prompts, 2026-10-30)

Move key oat_milk_please (name now Almond Milk, Please; A.oat_milk_please, SC.av_dairy, SC.av_latte in engine/amy-moves.js, the LAST definition near line 950). Tom's change (21:47): instead of the grumpy pizza and milk pair rolling up, a carton of COW'S milk appears, Amy kicks it at the enemies and it splashes them. The second half stays as is: she hands the dairy-free latte and treats to the ally (hip, spread, aim, throw, celeb frames and the heal).

Two image requests: (1) an Amy 16-frame sheet, Tom attaches the painted battle Amy reference; (2) one prop sheet of 6 props, no reference needed.

## Build notes (when the images return)
- Pizza and grumpy pair are dropped. The carton has no face. Numbers, heal, line text and the latte half are unchanged. The kick is visual only (no new damage).
- Kindness on a monster (kindFoe): skip the kick, she just offers the latte, since the splash would hit the foe she is being kind to.
- Amy frames (keys): mk_spot, mk_glare, mk_nope, mk_line, mk_back, mk_windA, mk_windB, mk_kick, mk_follow, mk_balance, mk_watch, mk_goal, mk_dust, mk_hair, mk_laugh, mk_wink. Bake like Pepper Breath (tools/sprite-bake/bake_boppy_extra.py pattern, Amy head sizing per bake_amy.py), save as tools/sprite-bake/src/amy-milk-v1.png.
- Props (keys): amy/milk_carton, amy/milk_carton_dented, amy/milk_burst, amy/milk_splat, amy/milk_crown, amy/milk_puddle. Save as tools/sprite-bake/src/props/amy-milk-sheet.png, cut with bake_prop_sheets.py, draw with PROPART.draw.
- Sequence plan: jog over, mk_spot (carton pops in at her feet), mk_glare, mk_nope, mk_line, mk_back, mk_windA, mk_windB, mk_kick (carton launches, thrown arc to the foe row), mk_follow, mk_balance, mk_watch, hit: milk_burst plus a milk_crown and a milk_splat on each foe, puddle under them, mk_goal, mk_dust, mk_hair, then the existing latte half.

## Prompt 1: Amy sheet

IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Amy, a fit, competitive schoolteacher and runner and mom. The attached reference image shows Amy. Draw her EXACTLY like the reference in every frame: same face, hair, outfit, colors, proportions, art style and level of detail.

THE MOVE
"Almond Milk, Please": a carton of cow's milk appears on the ground in front of Amy. She does not do dairy. She spots it, glares at it, wags a finger no, lines up like a soccer player taking a penalty kick, winds up, and boots it as hard as she can at the monsters. She watches it fly, pumps her fist, dusts off her hands, flips her hair, laughs, and winks. Funny and proud, a little smug, never mean.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. Standing Amy is about 176 pixels tall. She gets shorter when crouched and wider when kicking, but never rescale her per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame where her feet are on the ground, the soles rest on the same horizontal line, about 28 pixels above the bottom of the cell.
- Amy faces LEFT (toward the viewer's left) in every frame, in a side or three-quarter view from slightly above, like a party member in a 16-bit battle scene facing an enemy off to the left.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Amy. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Amy. No milk carton, no milk, no splashes, no ground shadow, dust, speed lines, motion blur, sparkles, stars, sweat drops or any effect outside her body (effects and props are added in the game, so show everything through her pose, eyes and face alone). When she looks at or kicks the carton, the carton is NOT drawn: her foot kicks empty air. No monster, no other people, no objects of any kind, no text, no word balloons.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around her outer edge and a faint lighter highlight along her top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 16 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up.

OUTFIT RULE
Her clothes, hair, lanyard and shoes are identical in every frame, exactly as in the reference. Only her pose and expression change.

THE 16 FRAMES (each must look clearly different from the others)
1. SPOT: stopped mid-jog, weight on one foot, head turned down toward the ground in front of her on the left, eyebrows raised, mouth slightly open in surprise, both arms still bent from running.
2. GLARE: standing with feet apart, arms crossed over her chest, chin down, a flat unimpressed stare at the ground ahead, one eyebrow arched, lips pressed tight.
3. NOPE: one hand held up palm out in a firm stop gesture, the other hand on her hip, eyes closed, head turned slightly away, a firm straight mouth, as if saying "absolutely not".
4. LINE UP: both hands on her hips, one foot stepped slightly forward, head tilted down, eyes narrowed and measuring the ground ahead, a small determined smirk, like a soccer player lining up a penalty kick.
5. STEP BACK: leaning back, back foot stretched behind her, arms loose at her sides, eyes locked on the spot ahead, the smirk growing, rolling her shoulders.
6. WIND UP A: kicking leg swung back with the knee bent and the sole of the shoe facing up behind her, arms out wide for balance, torso leaning forward, eyes locked on the target.
7. WIND UP B: the peak of the backswing, kicking leg pulled as far back as it goes, body coiled, one arm stretched forward and the other back, jaw clenched, hair swinging behind her.
8. KICK: the instant of contact, kicking leg whipping forward and up with the foot extended pointing left at hip height, standing leg straight, torso leaning back, arms flung out, mouth wide open in a shout, hair flying.
9. FOLLOW THROUGH: the kicking leg high in front of her with toes pointing, body leaning back, standing foot up on tiptoe, arms spread wide, hair streaming, eyes following the shot.
10. BALANCE: balanced on one leg with the kicking leg still raised, arms out, head turned left, eyes wide and thrilled, mouth open in an excited "ooh".
11. WATCH: both feet back on the ground, one flat palm shading her eyes like a visor, leaning forward, squinting after the shot, lips parted.
12. GOAL: one fist thrust up high, the other fist pulled in at her hip, mouth wide open yelling, a huge triumphant grin, up on her toes.
13. DUST OFF: rubbing her palms together as if brushing off dust, chin lifted, a smug satisfied smirk, eyes half closed.
14. HAIR FLIP: one hand tossing her hair back over her shoulder, the other hand on her hip, hip popped out, a pleased closed-eye smile.
15. LAUGH: head thrown back laughing, both hands on her hips, chest out, mouth wide open, eyes crinkled shut.
16. WINK: standing tall, one hand on her hip, the other hand giving a thumbs up, winking one eye, a warm cheeky smile.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Amy in the described pose.

## Prompt 2: Milk prop sheet

IMAGE REQUEST: ONE SINGLE PROP SPRITE SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A prop sheet for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). This is the sheet for the character Amy: it holds 6 standalone battle props that will be cut out and used in animations.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024 pixels. If your tool offers a different size, keep exactly 4 columns and 4 rows and use the largest size available.
- Exactly 6 objects, one per cell, filled left to right, top to bottom, in the order of the numbered list below. The final cells (numbers 7 to 16) must stay completely empty and transparent, with no number.
- Each object is drawn complete, centered in its own cell, fully inside it, with at least 12 percent empty margin on every side. Nothing touches or crosses a cell edge. Nothing overlaps a neighbouring cell.
- Scale every object to fill about 70 to 80 percent of its cell, regardless of its real-world size. Small things are enlarged to the same footprint.
- Background: fully transparent (PNG with alpha). No grid lines, no borders, no frames, no cell backgrounds, no checkerboard pattern. If your tool cannot output transparency, fill the entire background with one flat solid color, pure magenta #FF00FF, and use no magenta anywhere inside the objects.
- In the top-left corner of every cell, put a small plain white pixel-font number (with a thin dark outline) matching the list number. These numbers are a guide only and will be cropped off. Do not put any other labels, captions or titles on the sheet. The only text allowed is the text that is part of the prop itself, spelled exactly as given in the list.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 16 to 24 colors per object, clean readable silhouettes, no anti-aliasing blur, no gradients that break the pixel look, no outlines thicker than one pixel.
- A crisp one-pixel darker rim around each object's outer edge and a faint lighter highlight along its top edge, so it pops on a painted background.
- Soft key light from the upper left on every object, with shadow on the lower right of each form. Warm, slightly desaturated painterly palette, but each object keeps its natural colors. All objects share one consistent look, one lighting direction and one level of detail.
- Three-quarter view from slightly above, like objects seen in an SNES battle scene. Fun, friendly and a little silly. Family friendly for children aged 6 and up: nothing gory, scary or grim.
- Native pixel-art resolution only: draw at roughly 128 x 128 pixels per cell and upscale by a whole number (2x) with nearest-neighbor, so pixels stay hard-edged and square.
- Do not draw a ground shadow. At most a tiny soft contact shadow directly under an object that rests on the floor.

HARD RULES
- THE LIST IS COMPLETE AND DELIBERATE. Draw exactly the 6 objects described, one per numbered cell. Never substitute, swap in or add other objects, even ones that seem more typical, more common or related to the same theme. If a description is unusual, draw it as written. Every cell must match its numbered description.
- Props only. No people, no characters, no hands, no faces on anything.
- No real brands, logos, trademarks or copyrighted characters.
- Do not add extra objects, decorations, sparkle bursts, motion lines, glows, smoke or effects beyond what the list describes. Small details the list names (a drip, a droplet, a glint) are fine.
- Do not skip, merge or reorder any item.

THE 6 OBJECTS (cell number: name, what to draw)
1. Milk carton: a glossy one-quart gable-top carton of cow's milk standing upright, white with a wide blue band across the middle and black-and-white cow spots on the sides, the word MILK in bold blue capital letters on the front, the pouring spout folded flat on top. No face.
2. Kicked milk carton: the same carton after a hard kick, tilted, one corner dented and squashed in, the spout popped open at the top with a thin stream of white milk leaking out. The word MILK still readable. No face.
3. Burst milk carton: the same carton at the moment of impact, the sides split open and bulging, white milk bursting out of the split in a starburst of ribbons and round droplets, the carton shape and a bit of the blue band still recognizable.
4. Milk splat: a big blob of white milk splattered flat against a wall, seen straight on, a thick round middle with ragged splash arms, a few droplets around it and three long drips running down from the bottom edge, glossy highlights, pale blue shading.
5. Milk crown splash: the classic milk-drop crown, a ring of white milk leaping up from a small pool in a coronet shape with round-tipped droplets at the top of each spike, pale blue shading, glossy highlights.
6. Milk puddle: a wide flat puddle of white milk seen from slightly above, wobbly rippled edges, two small drops nearby, a glossy highlight streak and pale blue shading.
