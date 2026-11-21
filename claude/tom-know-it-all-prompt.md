# Know-It-All redo: Tom's 5 second fact check (prompts, 2026-10-31)

Move key know_it_all stays in Tom's B5 slot (6 VP, sparkle, all foes, interrupt). Spoken line unchanged: "Ummm... actually, you're wrong." Two image requests: (1) a Tom 16-frame sheet, Tom attaches tools/sprite-bake/src/tom-battle-v2.png as the reference; (2) one prop sheet of 8 props, no reference needed. Grace and Rose reactions reuse existing frames (face cover, point) so no sheet for them.

## Build notes (when the images return)
- Tom frames (keys): ki_arrive, ki_listen, ki_twitch, ki_finger1, ki_finger2, ki_finger3, ki_inhale, ki_ummm, ki_actually, ki_pen_draw, ki_pen_strike, ki_pen_write, ki_stamp_lift, ki_stamp_slam, ki_stamp_big, ki_pose. Bake like bake_tom_poses.py, save as tools/sprite-bake/src/tom-knowitall-v1.png.
- Props (keys): tom/red_pen, tom/strike_line, tom/correction_tag, tom/stamp_small, tom/stamp_big, tom/footnote_card, tom/eye_twitch, tom/finger_spot. Save as tools/sprite-bake/src/props/tom-knowitall-sheet.png, cut with bake_prop_sheets.py.
- Sequence plan (5.0 s): 0 to 1.2 s ki_arrive, ki_listen, ki_twitch, ki_finger1 to ki_finger3 as claim bubbles pop in (existing t3_claim), Grace face cover and Rose point behind him. 1.2 to 2.0 s ki_inhale, ki_ummm (stage dims, finger_spot), ki_actually (gold ACTUALLY). 2.0 to 4.0 s ki_pen_draw, then per bubble ki_pen_strike (strike_line over the claim) and ki_pen_write (correction_tag under it), then ki_stamp_lift and ki_stamp_slam (stamp_small, growing each time), last bubble ki_stamp_big (stamp_big fills most of the screen, shake). 4.0 to 5.0 s foes flatten and blush (existing t3_blush), WRONG!, footnote_card slides in at the bottom, ki_pose, return. Damage lands per stamp as now.

## Prompt 1: Tom sheet

IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Tom, a dry, calm adult man in his forties who cannot let a wrong fact go by. The attached reference image shows Tom. Draw him EXACTLY like the reference in every frame: same face, hair, glasses if he wears them in the reference, outfit, colors, proportions, art style and level of detail.

THE MOVE
"Know-It-All": the monsters are saying wrong things. Tom listens, his eye twitches, his index finger rises one notch per wrong fact until it is straight up. He takes a slow breath, says "Ummm... actually", pulls out a red pen, crosses out each wrong claim and writes the correction, then slams a big red FACT CHECK stamp on each one, each slam bigger than the last. He ends with a smug, satisfied pose. Polite, restrained, and completely insufferable about being right.

THE OBJECTS HE HOLDS
Tom's hands are empty in frames 1 to 9. In frames 10 to 12 he holds a red felt-tip marker pen. In frames 13 to 15 he holds a chunky wooden-handled rubber stamp with a red ink base. In frame 16 his hands are empty again. No other objects. Nothing leaves his hands in any frame (the strike lines, corrections, stamp marks and bubbles are added in the game).

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. Standing Tom is about 170 pixels tall. He gets wider when his arms are out, but never rescale him per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame where his feet are on the ground, the soles rest on the same horizontal line, about 28 pixels above the bottom of the cell.
- Tom faces LEFT (toward the viewer's left) in every frame, in a side or three-quarter view from slightly above, like a party member in a 16-bit battle scene facing an enemy off to the left.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Tom, the pen or the stamp. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Tom and the object named for that frame. No speech bubbles, text, strike lines, ink marks, stamp imprints, sparkles, sweat drops, motion lines, speed lines, blur, spotlight, ground shadow or any effect outside his body (effects are added in the game, so show everything through his pose, eyes and face alone). No monster, no other people.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around his outer edge and a faint lighter highlight along his top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 16 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up.

OUTFIT RULE
His clothes, hair and shoes are identical in every frame, exactly as in the reference. Only his pose and expression change.

THE 16 FRAMES (each must look clearly different from the others)
1. ARRIVE: mid-step walking left, arms relaxed at his sides, calm neutral face, eyes level.
2. LISTEN: feet planted, arms folded across his chest, head tilted slightly, polite listening face, eyebrows gently raised.
3. TWITCH: same folded arms, but one eye squeezed half shut in a visible twitch, the other eye wide, mouth a flat tight line, one eyebrow jumping up.
4. FINGER ONE: arms unfolding, one hand lifting to chest height with the index finger half raised, pointing at a 45 degree angle, lips pressed together, eyes narrowed at the left.
5. FINGER TWO: the index finger now raised to shoulder height, pointing almost straight up, head tilting the other way, nostrils flared, jaw set.
6. FINGER THREE: the index finger fully straight up beside his face, elbow bent, the other hand on his hip, eyes closed, chin lifted, the face of a man about to speak.
7. INHALE: chest puffed out, shoulders up, eyes closed, mouth slightly open taking a slow deep breath, the finger still up.
8. UMMM: eyes open and half lidded, head tilted back, mouth forming a small round "ummm", the finger up, the free hand palm out toward the left in a gentle "hold on" gesture.
9. ACTUALLY: leaning forward toward the left, both hands raised with palms up in a "well, you see" gesture, eyebrows high, a thin polite smile, eyes wide and bright.
10. PEN DRAW: pulling a red felt-tip marker from his pocket with one hand and pulling the cap off with his teeth, eyes glancing left, a sly look.
11. PEN STRIKE: arm fully extended toward the left holding the red pen sideways, slashing a horizontal line in the air, lips pursed, concentrating.
12. PEN WRITE: leaning left, writing in the air with small quick wrist movements, tongue poking out of the corner of his mouth, eyes focused.
13. STAMP LIFT: the pen gone, both hands raising a chunky wooden rubber stamp with a red ink base high above his head, feet apart, teeth gritted in a grin, eyes wide.
14. STAMP SLAM: both arms driven down and forward to the left, the stamp at waist height as if hitting a surface, knees bent, shoulders hunched, mouth open in a shout.
15. STAMP BIG: a huge wind-up: one foot back, the stamp held up behind his head with both hands, back arched, eyes blazing wide, mouth open in a wild grin, the biggest frame of the sheet.
16. POSE: standing tall, hands empty, arms folded, chin up, eyes closed, a small smug satisfied smile, one eyebrow raised.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Tom in the described pose.

## Prompt 2: Fact check prop sheet

IMAGE REQUEST: ONE SINGLE PROP SPRITE SHEET. Return exactly one image, nothing else. Follow the numbered list at the bottom exactly.

WHAT THIS IS
A prop sheet for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). This is the sheet for the character Tom's move "Know-It-All": it holds 8 standalone battle props that will be cut out and used in animations.

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
- Three-quarter view from slightly above, like objects seen in an SNES battle scene. Fun, friendly and a little silly. Family friendly for children aged 6 and up.
- Native pixel-art resolution only: draw at roughly 128 x 128 pixels per cell and upscale by a whole number (2x) with nearest-neighbor, so pixels stay hard-edged and square.
- Do not draw a ground shadow. At most a tiny soft contact shadow directly under an object that rests on the floor.

HARD RULES
- THE LIST IS COMPLETE AND DELIBERATE. Draw exactly the 8 objects described, one per numbered cell. Never substitute, swap in or add other objects, even ones that seem more typical, more common or related to the same theme. If a description is unusual, draw it as written. Every cell must match its numbered description.
- Props only. No people, no characters, no hands, no faces on anything.
- No real brands, logos, trademarks or copyrighted characters.
- Do not add extra objects, decorations, motion lines, glows, smoke or effects beyond what the list describes.
- Do not skip, merge or reorder any item.
- Any text on a prop is spelled EXACTLY as written in the list, in plain bold capital letters, nothing added.

THE 8 OBJECTS (cell number: name, what to draw)
1. Red pen: a red felt-tip marker pen, cap off, lying diagonally with the tip at the lower left, a small red ink dot at the tip.
2. Strike line: a thick, slightly wobbly horizontal red marker stroke, as if a word were crossed out by hand, wider at the start on the left and tapering a little at the right, with two tiny ink splatters.
3. Correction tag: a small torn-edged white paper note, slightly tilted, with the words SOURCE: MATH written on it in bold red capital marker letters, a red underline under the words.
4. Stamp small: a red rubber-stamp imprint of a rectangle with a double red border, the word FALSE in big red capital letters inside, a thin red line above the word, the ink slightly uneven and grainy the way a real stamp prints.
5. Stamp big: the same FALSE stamp imprint but drawn bolder and heavier, with thick borders, a red circular burst of ink splatter around it, and the words FACT CHECK in smaller red capitals above the word FALSE.
6. Footnote card: a long narrow cream index card seen straight on, with a small red superscript number 1 at the left and the words HE READ THE WHOLE ARTICLE in neat small dark capital letters, a thin red rule along the top edge.
7. Eye twitch: a small cartoon effect, three short dark zigzag lines in a tight cluster, like the tiny jitter marks drawn beside a twitching eye in a comic, drawn large to fill the cell.
8. Finger spot: a soft round pale yellow spotlight circle on the floor, seen in three-quarter view so it is a flattened oval, brighter at the center and fading to the rim, with a faint warm beam suggested above it.
