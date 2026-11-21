# Open Strings: Grace's violin screech (prompts, 2026-10-30)

Move key open_strings replaces beam_dismount in Grace's B2 primary slot (3 VP, kinetic): row hit plus evasion down. Spoken line: "I've only had six lessons, okay?" Two image requests: (1) a Grace 16-frame sheet, Tom attaches tools/sprite-bake/src/grace-battle-v2.png as the reference; (2) one prop sheet of 6 effect props, no reference needed.

## Build notes (when the images return)
- Grace frames (keys): os_arrive, os_tuck, os_breath, os_stroke, os_wince, os_sawup, os_sawdown, os_screech, os_slip, os_push, os_finish, os_listen, os_shrug, os_lessons, os_bow, os_proud. Bake like bake_grace_poses.py, save as tools/sprite-bake/src/grace-violin-v1.png.
- Props (keys): grace/screech_burst, grace/sour_note, grace/wobbly_notes, grace/cracked_note, grace/snapped_string, grace/ear_rings. Save as tools/sprite-bake/src/props/grace-violin-sheet.png, cut with bake_prop_sheets.py.
- Sequence plan: os_arrive walks in, os_tuck, os_breath, os_stroke (sour_note floats left), os_wince, os_sawup and os_sawdown alternate twice (wobbly_notes and cracked_note fly at the row), os_screech (screech_burst at the row, every foe shakes, ear_rings over each foe, damage and evasion down apply here), os_slip (snapped_string pops off the violin), os_push, os_finish, os_listen, os_shrug, os_lessons (line plays), os_bow, os_proud, return.

## Prompt 1: Grace sheet

IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Grace, a bright, bossy, confident 9-year-old girl. The attached reference image shows Grace. Draw her EXACTLY like the reference in every frame: same face, hair, outfit, colors, proportions, art style and level of detail.

THE MOVE
"Open Strings": Grace is in her first year of violin lessons. She marches up with her violin, tucks it under her chin like a pro, takes a big breath, and saws out a screeching beginner scale as loud as she can at the monsters. She winces at her own sound, pushes through it anyway, finishes with a dramatic flourish, listens for applause, shrugs, explains that she has only had six lessons, takes a formal recital bow, and walks off proud. Funny, confident and a little sheepish, never sad.

THE VIOLIN
Grace holds a child-size violin (warm honey-brown wood, black chin rest, four strings) and a bow (wooden stick, white horsehair) in EVERY frame. The violin and bow are part of her, drawn in every frame exactly as described per frame. They are the ONLY objects allowed.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. Standing Grace is about 150 pixels tall. She gets shorter when bowing and wider when her arms are out, but never rescale her per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame where her feet are on the ground, the soles rest on the same horizontal line, about 28 pixels above the bottom of the cell.
- Grace faces LEFT (toward the viewer's left) in every frame, in a side or three-quarter view from slightly above, like a party member in a 16-bit battle scene facing an enemy off to the left. The violin scroll points left, toward the monsters.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Grace or the violin. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Grace with her violin and bow. No sound waves, music notes, sparkles, stars, sweat drops, motion lines, speed lines, blur, ground shadow or any effect outside her body (effects are added in the game, so show everything through her pose, eyes and face alone). No monster, no other people, no music stand, no case, no text, no word balloons.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around her outer edge and a faint lighter highlight along her top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 16 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up.

OUTFIT RULE
Her clothes, hair and shoes are identical in every frame, exactly as in the reference. Only her pose and expression change.

THE 16 FRAMES (each must look clearly different from the others)
1. ARRIVE: mid-step walking left, violin held by the neck down at her side in one hand, bow in the other hand, chin up, a confident closed-mouth grin.
2. TUCK: feet planted, violin tucked under her chin with the scroll pointing left, left hand on the neck, bow hand resting at her hip holding the bow, a serious professional face, eyebrows level.
3. BREATH: same violin position, bow lifted and hovering just above the strings, eyes closed, cheeks puffed with a deep breath, shoulders raised.
4. FIRST STROKE: the bow halfway across the strings on a down-bow, elbow out, eyes squeezed shut, teeth gritted in a wide grimace.
5. WINCE: the bow at the very tip of the stroke, one eye open and one squeezed shut, nose wrinkled, mouth pulled to one side, flinching at her own sound.
6. SAW UP: a hard up-bow, bow arm high with the elbow above her shoulder, hair swinging, tongue poking out of the corner of her mouth in concentration.
7. SAW DOWN: a hard down-bow, leaning into it with her torso tilted left, knees slightly bent, cheeks puffed, eyebrows knitted.
8. SCREECH: the loudest moment, bow pressed hard into the strings mid-stroke, whole body leaning forward toward the left, up on her toes, mouth wide open in a shout, eyes shut tight.
9. SLIP: her fingering hand slipping down the neck, violin still under her chin, bow arm frozen mid-stroke, eyes wide, mouth a small round "oops".
10. PUSH THROUGH: back at it, bow sawing fast, chin jutting forward, a fierce determined scowl, hair flying.
11. BIG FINISH: the bow flung straight up in the air above her head at the end of the last stroke, violin still under her chin, eyes open wide, a huge proud grin.
12. LISTEN: bow lowered to her side, violin lowered to her chest, head tilted with one ear turned left toward the monsters, lips pressed together, eyebrows raised, waiting for applause.
13. SHRUG: violin and bow both held in one hand down at her side, the other hand raised in a palm-up shrug, a sheepish lopsided smile, eyes half closed.
14. SIX LESSONS: violin tucked under one arm, the bow hand holding up one index finger as if explaining, eyebrows raised high, mouth open mid-sentence.
15. RECITAL BOW: a formal deep bow from the waist, violin held out to one side and the bow held out to the other side, both arms straight, head down, eyes closed, a small smile.
16. PROUD: standing tall, violin tucked under her arm, bow hand on her hip, chin up, eyes closed, a smug satisfied smile.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Grace in the described pose holding her violin.

## Prompt 2: Effect prop sheet

IMAGE REQUEST: ONE SINGLE PROP SPRITE SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A prop sheet for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). This is the sheet for the character Grace's move "Open Strings": it holds 6 standalone battle effect props that will be cut out and used in animations.

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
- Do not add extra objects, decorations, sparkle bursts, motion lines, glows, smoke or effects beyond what the list describes. Small details the list names (a crack, a wobble, a glint) are fine.
- Do not skip, merge or reorder any item.

THE 6 OBJECTS (cell number: name, what to draw)
1. Screech burst: a jagged sound burst pointing left, a fan of three thick zigzag lightning-shaped lines in bright yellow with orange edges, spreading out from a single point on the right side of the cell, like a cartoon loud noise.
2. Sour note: a single fat eighth note, sickly lime green with a darker green outline, bent and wobbly as if it were melting, with two small sweat drops beside its head.
3. Wobbly note pair: two beamed eighth notes joined by one bar, sky blue, drawn with wavy trembling edges as if vibrating, slightly tilted.
4. Cracked note: a single quarter note in deep purple with a jagged crack running through its stem and head, one small chip of the note flying off to the side.
5. Snapped string: a short curl of steel-grey violin string, broken at one end, coiled into a loose spiral with a tiny frayed tip and a bright glint on the curve.
6. Ear-ringing rings: three concentric rings in pale yellow, each ring broken into dashes, growing from a small center outward, like a cartoon ringing-in-the-ears effect.
