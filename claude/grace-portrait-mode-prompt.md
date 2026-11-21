# Portrait Mode: Grace draws a monster (prompts, 2026-10-30)

Move key portrait_mode replaces split_leap in Grace's B4 primary slot (4 VP, kinetic): one enemy hit, cancel its wind-up, Guard the most hurt friend. Spoken line: "Hold that pose. Perfect, don't move." Two image requests: (1) a Grace 16-frame sheet, Tom attaches tools/sprite-bake/src/grace-battle-v2.png as the reference; (2) one prop sheet of 6 props, no reference needed.

## Build notes (when the images return)
- Grace frames (keys): pm_arrive, pm_open, pm_measure, pm_pose, pm_sketchA, pm_sketchB, pm_compare, pm_sketchC, pm_erase, pm_sign, pm_jab, pm_tear, pm_admire, pm_shield (faces RIGHT), pm_wink, pm_leave. Bake like bake_grace_poses.py, save as tools/sprite-bake/src/grace-portrait-v1.png.
- Props (keys): grace/portrait_page, grace/blank_page, grace/scribble_cloud, grace/eraser_crumbs, grace/pencil_shavings, grace/sketch_burst. Save as tools/sprite-bake/src/props/grace-portrait-sheet.png, cut with bake_prop_sheets.py.
- Sequence plan: pm_arrive walks in, pm_open, pm_measure, pm_pose (sketch_burst flashes on the target, its wind-up is cancelled here and it freezes), pm_sketchA and pm_sketchB (scribble_cloud over the page), pm_compare, pm_sketchC (pencil_shavings pop), pm_erase (eraser_crumbs), pm_sign, pm_jab (damage lands, sketch_burst on the foe), pm_tear (blank_page flies up), pm_admire (portrait_page shown large over her head), pm_shield (she turns right, portrait_page held in front of the most hurt friend, Guard applies), pm_wink, pm_leave, return.

## Prompt 1: Grace sheet

IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Grace, a bright, bossy, confident 9-year-old girl who loves to draw and is getting really good at it. The attached reference image shows Grace. Draw her EXACTLY like the reference in every frame: same face, hair, outfit, colors, proportions, art style and level of detail.

THE MOVE
"Portrait Mode": Grace whips out her sketchbook and pencil, orders a monster to hold still, and draws its portrait at lightning speed, measuring it with her pencil like a real artist, scribbling, squinting, erasing, and signing her name with a flourish. Then she jabs the pencil at the monster like a tiny fencer, rips the page out, admires it, and holds the drawing up like a shield in front of a friend. Bossy, focused and very proud of herself.

THE SKETCHBOOK AND PENCIL
Grace has a spiral-bound sketchbook (letter-size, white pages, a teal cover with a black spiral along the top edge) and a yellow pencil with a pink eraser. They appear in EVERY frame as described per frame. They are the ONLY objects allowed. The sketchbook pages are always BLANK white: never draw any picture, lines or marks on the page (the drawing is added in the game).

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. Standing Grace is about 150 pixels tall. She gets shorter when crouched and wider when her arms are out, but never rescale her per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame where her feet are on the ground, the soles rest on the same horizontal line, about 28 pixels above the bottom of the cell.
- Grace faces LEFT (toward the viewer's left) in every frame except frame 14, in a side or three-quarter view from slightly above, like a party member in a 16-bit battle scene facing an enemy off to the left.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Grace, the sketchbook or the pencil. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Grace with her sketchbook and pencil. No pencil marks in the air, no scribble clouds, eraser crumbs, shavings, sparkles, stars, sweat drops, motion lines, speed lines, blur, ground shadow or any effect outside her body (effects are added in the game, so show everything through her pose, eyes and face alone). No monster, no other people, no easel, no text, no word balloons.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around her outer edge and a faint lighter highlight along her top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 16 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up.

OUTFIT RULE
Her clothes, hair and shoes are identical in every frame, exactly as in the reference. Only her pose and expression change.

THE 16 FRAMES (each must look clearly different from the others)
1. ARRIVE: mid-step walking left, the closed sketchbook tucked under one arm, the pencil tucked behind her ear, chin up, a confident closed-mouth grin.
2. FLIP OPEN: feet planted, the sketchbook held open in one hand against her forearm, the other hand pulling the pencil from behind her ear, eyes on the left, eyebrows raised with interest.
3. MEASURE: the pencil held straight up at arm's length toward the left, one eye closed, the other eye sighting along the pencil, the open sketchbook held against her hip, lips pursed in concentration.
4. HOLD STILL: the pencil hand thrust out toward the left with the palm open in a firm stop gesture (pencil pinched between two fingers), sketchbook against her chest, chin down, a stern bossy frown, eyebrows low.
5. SKETCH A: head bent over the open sketchbook, pencil touching the page, the pencil hand a quick small motion, tongue poking out of the corner of her mouth, eyes narrowed.
6. SKETCH B: leaning in closer over the page, the sketchbook tilted up toward her, elbows out, hair falling forward, a focused scowl.
7. COMPARE: head lifted to look left at the monster, pencil held up beside her face, sketchbook open in the other hand, one eyebrow up, mouth pulled to the side, judging.
8. SKETCH C: furious drawing, the pencil hand high at the end of a big stroke, hair bouncing, cheeks puffed, eyes wide and excited.
9. ERASE: the pencil flipped around and the pink eraser rubbing the page, her other hand holding the sketchbook flat, lips pushed out as if blowing crumbs off the page, eyes half closed.
10. SIGN: a big sweeping final stroke, the pencil hand flung out to the side at the end of a flourish, head tilted, eyes closed, a satisfied little smile.
11. JAB: a fencing lunge toward the left, front knee bent, back leg straight, the pencil thrust straight forward at arm's length like a tiny sword, the sketchbook held behind her in the other hand, mouth open in a shout, eyes fierce.
12. TEAR: standing upright, both hands on the sketchbook, ripping the top page out along the spiral with a sharp pull, elbows out, teeth showing in a determined grin.
13. ADMIRE: holding the single torn-out blank page up with both hands in front of her face, looking at it, eyebrows raised high, mouth open in a delighted "ooh", the sketchbook tucked under one arm.
14. SHIELD: turned to face RIGHT, the page held out flat at arm's length toward the right side with both hands like a shield, feet planted wide, chin up, a brave protective look, eyes on something to the right.
15. WINK: facing left again, the page tucked under one arm with the sketchbook, the pencil hand giving a thumbs up, winking one eye, a cheeky smile.
16. WALK OFF: mid-step, the closed sketchbook under one arm, the pencil back behind her ear, head high, eyes closed, a smug proud smile.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Grace in the described pose holding her sketchbook and pencil with blank pages.

## Prompt 2: Prop sheet

IMAGE REQUEST: ONE SINGLE PROP SPRITE SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A prop sheet for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). This is the sheet for the character Grace's move "Portrait Mode": it holds 6 standalone battle props that will be cut out and used in animations.

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
- Props only. No people, no characters, no hands. The only face allowed is the pencil-sketched cartoon monster face on the portrait page in cell 1, which is a drawing on paper.
- No real brands, logos, trademarks or copyrighted characters.
- Do not add extra objects, decorations, sparkle bursts, motion lines, glows, smoke or effects beyond what the list describes. Small details the list names (a curl, a crumb, a glint) are fine.
- Do not skip, merge or reorder any item.

THE 6 OBJECTS (cell number: name, what to draw)
1. Portrait page: a single sheet of white sketchbook paper, seen straight on, with a ragged torn edge of small paper tabs along the top where it was ripped from a spiral. On it, a quick grey pencil sketch of a round goofy cartoon monster: a lumpy blob body, two big round eyes, a wide wobbly grin, a few sketchy hatching lines for shading, and a tiny scribbled signature in the bottom right corner. The sketch looks like a talented kid drew it fast.
2. Blank torn page: the same white sketchbook sheet, blank, with the ragged torn tabs along the top edge, slightly curled and tilted as if flying through the air.
3. Scribble cloud: a loose tangle of fast grey pencil squiggles and zigzags, bunched into a rough cloud shape, with a few short straight dashes shooting out from it, like a cartoon of frantic drawing.
4. Eraser crumbs: a small scattered cluster of pink and grey eraser crumbs, little rounded rolled bits of different sizes, with a faint smudge of grey graphite dust beneath them.
5. Pencil shavings: three curled wooden pencil shavings, each a thin spiral of pale blond wood with a yellow painted outer edge and a dark grey graphite stripe at the tip.
6. Sketch-mark burst: a ring of short grey pencil dashes radiating outward from an empty center, each dash slightly tapered, like a cartoon burst drawn in pencil to show something was captured in a flash.
