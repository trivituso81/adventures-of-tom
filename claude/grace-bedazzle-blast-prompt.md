# Bedazzle Blast: Grace's rhinestone gun (prompts, 2026-10-30)

Move key bedazzle_blast replaces chalk_up in Grace's B5 primary slot (5 VP, sparkle): row strike with extra crit chance. Spoken line: "Hold still, you need more sparkle!" Two image requests: (1) a Grace 16-frame sheet, Tom attaches tools/sprite-bake/src/grace-battle-v2.png as the reference; (2) one prop sheet of 8 props, no reference needed.

## Build notes (when the images return)
- Grace frames (keys): bz_arrive, bz_draw, bz_load, bz_safety, bz_aim, bz_fireA, bz_sweeplow, bz_sweephigh, bz_fireB, bz_onehand, bz_blow, bz_inspect, bz_notenough, bz_topup, bz_admire, bz_pose. Bake like bake_grace_poses.py, save as tools/sprite-bake/src/grace-bedazzle-v1.png.
- Props (keys): grace/gem_pink, grace/gem_blue, grace/gem_gold, grace/gem_sharp, grace/gem_spray, grace/gem_cluster, grace/sparkle_star, grace/gem_hopper. Save as tools/sprite-bake/src/props/grace-bedazzle-sheet.png, cut with bake_prop_sheets.py.
- Sequence plan: bz_arrive walks in, bz_draw, bz_load (gem_hopper clicks on), bz_safety, bz_aim, bz_fireA (gem_spray leaves the tip, pink/blue/gold gems arc across the row), bz_sweeplow and bz_sweephigh (more gems, every foe takes the row hit, gem_cluster sticks on each), bz_fireB, bz_onehand (gem_sharp flies at the foes that crit, lands point first with a big sparkle_star; non-crit foes get a small sparkle_star), bz_blow, bz_inspect, bz_notenough, bz_topup (one last gem_spray), bz_admire, bz_pose (line plays), return. Crit roll per foe decides sharp gem vs flat gem.

## Prompt 1: Grace sheet

IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Grace, a bright, bossy, confident 9-year-old girl who bedazzles everything she owns. The attached reference image shows Grace. Draw her EXACTLY like the reference in every frame: same face, hair, outfit, colors, proportions, art style and level of detail.

THE MOVE
"Bedazzle Blast": Grace pulls out her rhinestone gun (a toy craft tool that sticks gems onto things), loads it, flicks the safety off, and sprays a whole row of monsters with sparkly gems, sweeping left to right like a kid with a water gun. She blows on the tip, admires her work, decides the monsters still need more sparkle, and poses. Bossy, gleeful and a little unhinged about glitter.

THE RHINESTONE GUN
Grace holds a rhinestone gun in EVERY frame: a chunky pink plastic craft tool shaped like a hot-glue gun, with a purple trigger, a clear round gem hopper on top filled with tiny colorful gems, and a narrow silver tip. It is the ONLY object allowed. No gems leave the gun in any frame (the flying gems are added in the game).

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. Standing Grace is about 150 pixels tall. She gets shorter when crouched and wider when her arms are out, but never rescale her per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame where her feet are on the ground, the soles rest on the same horizontal line, about 28 pixels above the bottom of the cell.
- Grace faces LEFT (toward the viewer's left) in every frame, in a side or three-quarter view from slightly above, like a party member in a 16-bit battle scene facing an enemy off to the left. The gun's tip points left when aimed.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Grace or the gun (the gun is pink, not magenta: use a softer bubblegum pink like #FF8AC2). No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Grace with her rhinestone gun. No flying gems, gem trails, sparkles, stars, glints, light rays, muzzle flash, sweat drops, motion lines, speed lines, blur, ground shadow or any effect outside her body (effects are added in the game, so show everything through her pose, eyes and face alone). No monster, no other people, no gem bag, no text, no word balloons.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around her outer edge and a faint lighter highlight along her top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 16 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up. The gun is clearly a chunky pink craft toy, never a real weapon.

OUTFIT RULE
Her clothes, hair and shoes are identical in every frame, exactly as in the reference. Only her pose and expression change.

THE 16 FRAMES (each must look clearly different from the others)
1. ARRIVE: mid-step walking left, the rhinestone gun held down at her side in one hand, the other arm swinging, chin up, a confident closed-mouth grin.
2. DRAW: feet planted, whipping the gun up to chest height with both hands, elbows bent, eyes narrowed at the left, a sly smirk.
3. LOAD: the gun held sideways in front of her, one hand twisting the clear hopper on top as if locking it in, head tilted down to look at it, tongue poking out of the corner of her mouth.
4. SAFETY OFF: the gun held up beside her face pointing straight up, the free hand flicking a thumb at the trigger, one eyebrow raised, a cocky half smile.
5. AIM: a wide stance, both arms straight out toward the left holding the gun with both hands, one eye squeezed shut, the other sighting down the tip, lips pressed tight.
6. FIRE A: the gun kicking up slightly, both arms still extended left, shoulders hunched, mouth wide open in a gleeful shout, eyes wide.
7. SWEEP LOW: leaning left with the gun aimed low toward the ground on the left, knees bent, hair swinging, a huge grin, eyes wide and wild.
8. SWEEP HIGH: leaning back with the gun aimed high toward the upper left, up on her toes, one arm back for balance, mouth open laughing.
9. FIRE B: squared up again, gun aimed straight left with one hand, the other hand on her hip, chin down, a satisfied smirk, eyes half closed.
10. ONE HANDED: the gun held in one hand aimed left with the arm fully straight, the other arm flung out wide behind her, hip popped, head tilted, a bossy grin.
11. BLOW: the gun raised in front of her face with the tip near her lips, blowing on the tip like a cowboy, eyes closed, cheeks puffed.
12. INSPECT: the gun lowered to her side, the free hand shading her eyes like a visor, leaning forward squinting at the left, lips pursed, judging her work.
13. NOT ENOUGH: a frown of disapproval at the left, the gun hand raised with the tip pointing up, the other hand wagging a finger no, eyebrows low.
14. TOP UP: both arms straight out left again firing one more burst, feet apart, teeth gritted in a determined grin, hair flying back.
15. ADMIRE: the gun hugged against her chest with both arms, eyes sparkling wide, mouth open in a delighted gasp, up on her toes.
16. POSE: standing tall, the gun held up beside her face pointing up, the other hand on her hip, winking one eye, a cheeky proud smile.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Grace in the described pose holding her pink rhinestone gun.

## Prompt 2: Gem prop sheet

IMAGE REQUEST: ONE SINGLE PROP SPRITE SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A prop sheet for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). This is the sheet for the character Grace's move "Bedazzle Blast": it holds 8 standalone battle props that will be cut out and used in animations.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024 pixels. If your tool offers a different size, keep exactly 4 columns and 4 rows and use the largest size available.
- Exactly 8 objects, one per cell, filled left to right, top to bottom, in the order of the numbered list below. The final cells (numbers 9 to 16) must stay completely empty and transparent, with no number.
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
- THE LIST IS COMPLETE AND DELIBERATE. Draw exactly the 8 objects described, one per numbered cell. Never substitute, swap in or add other objects, even ones that seem more typical, more common or related to the same theme. If a description is unusual, draw it as written. Every cell must match its numbered description.
- Props only. No people, no characters, no hands, no faces on anything.
- No real brands, logos, trademarks or copyrighted characters.
- Do not add extra objects, decorations, motion lines, glows, smoke or effects beyond what the list describes. Small details the list names (a facet, a glint, a sparkle point) are fine.
- Do not skip, merge or reorder any item.

THE 8 OBJECTS (cell number: name, what to draw)
1. Pink gem: a single round flat-backed rhinestone seen from above, hot pink, with cut facets around the edge and a bright white glint in the upper left.
2. Blue gem: the same round rhinestone shape in sapphire blue, facets and glint.
3. Gold gem: the same round rhinestone shape in warm gold, facets and glint.
4. Sharp gem: a pointed teardrop rhinestone in icy clear white with a hint of blue, tip pointing down, long facets, a strong glint. This is the gem that lands point first.
5. Gem spray: a loose fan of eight small rhinestones in mixed colors (pink, blue, gold, clear) spreading out from a single point on the right side of the cell toward the left, bigger ones in front, like a burst of gems leaving a nozzle.
6. Gem cluster: a tight clump of five rhinestones in mixed colors stuck flat side by side on a surface, seen from above, each with its own facets and glint, as if glued onto a monster.
7. Sparkle star: a four-point sparkle, white in the center fading to pale pink at the tips, thin and sharp, with a tiny second sparkle beside it.
8. Gem hopper: the clear round plastic gem reservoir from a rhinestone gun, seen on its own, a see-through dome with a pink plastic ring at the base, filled with a heap of tiny mixed-color rhinestones visible through the plastic.
