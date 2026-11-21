# Boppy character sheets: story mode (overworld) and battle mode (2026-10-30)

Reading of Tom's request "single and battle mode character sheets": single = the story-mode walking sheet used in the town and on maps (overworld), battle = the battle poses sheet. Each is one prompt, run separately in the external image AI with the Boppy reference attached. If Tom meant a single reference portrait instead, that is a separate small prompt.

Keys, story mode (3 columns by 3 rows, 768 x 768): ow_down_stand, ow_down_stepA, ow_down_stepB, ow_up_stand, ow_up_stepA, ow_up_stepB, ow_side_stand, ow_side_stepA, ow_side_stepB. Side faces LEFT (the game mirrors it for right).

Keys, battle mode (4 by 4, 1024 x 1024): bt_idleA, bt_idleB, bt_walkA, bt_walkB, bt_hip, bt_act, bt_wind, bt_swing, bt_spread, bt_guard, bt_hurt, bt_low, bt_ko, bt_cheerA, bt_cheerB, bt_grumble.

When the sheets return: check each cell against the list, cut cells by gaps (returned sheets are not exactly the requested size), save as tools/sprite-bake/src/boppy-story-v1.png and tools/sprite-bake/src/boppy-battle-v1.png, bake like the Rose sheets, then wire into data/recruit-sprites.js (OW set) and the Boppy battle sprite (data/boppy-poses.js). Pose names in the game today: idle, idle2, hip, act, wind, spread, amble, back, kneel, sit, cheer, KO. Sit stays as is (no sit frame in this sheet).

## Prompt 1: STORY MODE (overworld walk sheet)

IMAGE REQUEST: ONE SINGLE CHARACTER WALK SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Walking frames for the town exploration screens of "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Boppy, a grumpy but lovable grandfather. The attached reference image shows Boppy. Draw him EXACTLY like the reference in every frame: same face, mustache, cap, clothes, colors, proportions, art style and level of detail. His baseball cap stays on his head in every frame.

THE SHEET (strict)
- A grid of 3 columns by 3 rows of square cells, 256 x 256 pixels each, so the full image is 768 x 768. If your tool offers a different size, keep exactly 3 columns and 3 rows.
- Exactly 9 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Row 1 shows Boppy facing DOWN, toward the viewer. Row 2 shows him facing UP, away from the viewer, so we see his back. Row 3 shows him in profile facing LEFT.
- Camera: the classic top-down role-playing game field view, slightly from above, like a character walking around a town map.
- Same character at the same scale in every cell. Standing Boppy is about 180 pixels tall. Never rescale him per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame the soles of his feet rest on the same horizontal line, about 28 pixels above the bottom of the cell, except where a foot is lifted mid-step.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Boppy. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Boppy. His hands are empty in every frame. No ground shadow, dust, sparkles, speed lines, motion blur or any effect, no props, no text, no other people.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around his outer edge and a faint lighter highlight along his top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 9 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up.

WALK RULES
Arms swing opposite to the legs. The two STEP frames of each row are mirror images of each other in leg and arm position. The STAND frame is a neutral relaxed stance with both feet together and arms hanging at his sides.

THE 9 FRAMES (each must look clearly different from the others)
1. DOWN STAND: facing the viewer, relaxed, feet together, arms at his sides, eyes forward, a flat slightly grumpy mouth under the mustache.
2. DOWN STEP A: facing the viewer, the foot on the viewer's right steps forward and down, the arm on the viewer's left swings forward, body bobbing slightly lower.
3. DOWN STEP B: facing the viewer, the foot on the viewer's left steps forward and down, the arm on the viewer's right swings forward.
4. UP STAND: seen from behind, back of the cap, back of his head and shoulders, feet together, arms at his sides.
5. UP STEP A: seen from behind, the foot on the viewer's left steps forward (away from us), the arm on the viewer's right swings forward.
6. UP STEP B: seen from behind, the foot on the viewer's right steps forward, the arm on the viewer's left swings forward.
7. SIDE STAND: profile facing left, feet together, arms at his sides, relaxed grumpy face.
8. SIDE STEP A: profile facing left, front leg stretched forward with the heel down, back leg trailing with the heel lifted, the near arm swinging back and the far arm swinging forward.
9. SIDE STEP B: profile facing left, the passing moment of the stride: legs close together, the back foot lifted off the ground with a bent knee, body slightly higher, the near arm swinging forward and the far arm swinging back.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Boppy in the pose described.

## Prompt 2: BATTLE MODE (battle poses sheet)

IMAGE REQUEST: ONE SINGLE CHARACTER BATTLE SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Battle poses for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is Boppy, a grumpy but lovable grandfather who fights with attitude, complaints and a stubborn streak. The attached reference image shows Boppy. Draw him EXACTLY like the reference in every frame: same face, mustache, cap, clothes, colors, proportions, art style and level of detail. His baseball cap stays on his head in every frame.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. Standing Boppy is about 180 pixels tall. He gets shorter when crouched or kneeling and wider when lunging, but never rescale him per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame where his feet are on the ground, the soles rest on the same horizontal line, about 28 pixels above the bottom of the cell.
- Boppy faces LEFT (toward the viewer's left) in every frame, in a side or three-quarter view from slightly above, like a party member in a 16-bit battle scene facing an enemy off to the left.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in Boppy. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY Boppy. His hands are empty in every frame, even where a pose looks like holding something. No props, no ground shadow, dust, speed lines, sparkles, stars, motion blur or any effect floating outside his body (effects are added in the game, so show everything through his pose and face alone). No monster, no other people, no text, no word balloons.

ART STYLE
- 32-bit era high-detail pixel art (late SNES, Saturn, PlayStation quality): rich shading, 24 to 32 colors, clean readable silhouette, no anti-aliasing blur, no outline thicker than one pixel.
- A crisp one-pixel darker rim around his outer edge and a faint lighter highlight along his top edge.
- Soft key light from the upper left, shadow on the lower right, warm slightly desaturated painterly palette. All 16 frames share one look and one lighting direction.
- Family friendly for children aged 6 and up.

THE 16 FRAMES (each must look clearly different from the others)
1. IDLE A: battle stance facing left, feet shoulder width apart, knees slightly bent, fists loose at his sides, scowling at the enemy, chest relaxed.
2. IDLE B: the same stance a moment later, chest risen with a deep sigh, shoulders lifted, one hand drifting toward his belly, eyes rolling slightly upward in complaint.
3. WALK A: striding toward the left, left foot forward, right arm swinging, hands empty, a grumpy walking face.
4. WALK B: the opposite step, right foot forward, left arm swinging, chin lifted.
5. HIP: standing, both hands on his hips with elbows out, chin lifted, an impatient frown, one foot slightly forward.
6. ACT: right arm raised and extended to the left with the palm open and fingers curled as if presenting something small, left hand on his hip, a proud smirk, eyebrows raised.
7. WIND-UP: body twisted away from the enemy, right arm cocked far back over his shoulder with a clenched fist, weight on the back leg, teeth bared, eyes narrowed.
8. SWING: follow-through, body lunging far forward to the left, right arm swung down and out across his body at full extension with an open swatting hand, front knee bent, cap tilting back, mouth open in a shout.
9. SPREAD: feet planted, both arms flung wide to the sides with open palms, chest out, chin up, mouth open as if announcing something loudly.
10. GUARD: crouched low, feet wide, both forearms crossed in front of his chest and face to block, chin tucked, eyes narrowed, jaw set. A stubborn grumpy bodyguard.
11. HURT: flinching, body knocked back and leaning away to the right with his head thrown back, one arm flung out, eyes squeezed shut, mouth open in a yelp, one foot lifted.
12. LOW HEALTH: kneeling on one knee, one hand pressed on his knee, the other hand clutching his belly, head hanging, a black eye around the visible eye, a tired grimace, cap slightly askew.
13. KNOCKED OUT: down on his hands and knees facing left, head bowed low, eyes shut, a black eye and a bruised look, back rounded, cap still on, a defeated slump.
14. CHEER A: victory, right fist pumped high, left hand on his hip, one foot forward, a big proud grin, cap straight.
15. CHEER B: both fists up overhead, mouth open in a hearty laugh, chest out, heels lifted off the ground.
16. GRUMBLE: standing bent slightly forward, one hand clutching his belly, the other hand held out palm up in a complaining gesture, a grimace with the mouth turned down, eyebrows drawn together.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Boppy in the pose described.
