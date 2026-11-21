# Mudling pie heist: 16-frame sheet prompt (2026-10-30)

Scene `ch1Theft` (data/scenes.js), chapter 1, Rivituso house. The "Big Mudling" (the regular Mudling drawn at 2x) sneaks in, charges up the middle, bowls over Tom, Grace and Rose, squelches to the counter, grabs Deedee's pie tin, and squelches back out. Today the game moves the plain Mudling sprite along a path with no body language. The sheet gives it the acting. The game draws only the sheet's blob; no effects are in the sheet. Tom attaches the painted Mudling (tools/sprite-bake/src/foe-mudling-v1.png, stance frame) as the reference.

Frame keys in order (left to right, top to bottom): mh_ooze_a, mh_ooze_b, mh_spot, mh_windup, mh_charge, mh_shove, mh_barrel, mh_wobble, mh_reach, mh_grab, mh_hug, mh_glance, mh_scurry_a, mh_scurry_b, mh_giggle, mh_sneak.

## Prompt text

IMAGE REQUEST: ONE SINGLE CHARACTER ANIMATION SHEET. Return exactly one image, nothing else.

WHAT THIS IS
Animation frames for "The Adventures of Tom", a family role-playing game in the style of a 16-bit Super Nintendo game (Final Fantasy VI, Chrono Trigger). The character is the Mudling, a small, silly, sulky monster made of mud with a little green sprout on top of its head. The attached reference image shows the Mudling. Draw it EXACTLY like the reference in every frame: same mud colors, same wet glossy highlights, same sprout, same big eyes, same proportions, art style and level of detail. The sprout stays on its head in every frame.

THE SCENE
"The pie heist": the Mudling sneaks up to a family kitchen to steal a freshly baked rhubarb pie in a tin. It oozes in, spots the pie, crouches, charges straight through a row of people and shoves them aside with two mud arms, squeezes through, wobbles, stretches out one long mud arm to the counter, grabs the pie tin, hugs it, glances back, scurries away, giggles with triumph, and sneaks out. Funny and cute, never scary or mean.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a different size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the order of the numbered list below.
- Same character at the same scale in every cell. The Mudling resting is about 170 pixels wide and 140 pixels tall. It gets longer, flatter, taller or narrower in the squash and stretch poses (it is mud), but its volume stays believable and never rescale it per frame.
- Every frame sits fully inside its cell with at least 10 percent empty margin on every side. Nothing touches or crosses a cell edge or overlaps a neighbouring cell.
- In every frame the lowest part of the body rests on the same horizontal line, about 28 pixels above the bottom of the cell. In frames where it is in the air, the body is clearly above that line.
- The Mudling faces LEFT (toward the viewer's left) in every frame, in a three-quarter front view from slightly above, like the reference.
- Background: one flat solid color, pure magenta #FF00FF, filling the whole image. No magenta anywhere in the Mudling. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Draw ONLY the Mudling. No speed lines, dust, mud splatters or flying droplets outside its body, sparkles, stars, sweat drops, ground shadow, motion blur or any effect (effects are added in the game, so show everything through its body shape, eyes and mouth alone). No people, no furniture, no counter, no text, no word balloons.
- The only object allowed is one round silver pie tin holding a rhubarb crisp (pink-red filling with a crumbly golden-brown topping), and only in frames 10 to 16. The tin is the same size in every frame it appears, about 70 pixels across.
- Its mud arms are short thick stubs of mud that grow out of its body only when needed, and melt back into the body in other frames. No hands with fingers, no legs.

ART STYLE
- Match the reference painting exactly: same brushwork, same palette, same outline weight, same lighting. All 16 frames share one look and one lighting direction (soft key light from the upper left, shadow on the lower right).
- Clean readable silhouette, no blurry edges. Family friendly for children aged 6 and up.

EXPRESSION RULE
The eyes are the reference's big white eyes. Its mood in this scene is sneaky, determined and proud of itself, with a tiny mischievous grin. Never angry, never scary.

THE 16 FRAMES (each must look clearly different from the others)
1. OOZE A: sliding forward to the left, body stretched long and low, its front edge pushed ahead, the sprout bent back, sly half-lidded eyes, a small sneaky smile.
2. OOZE B: the next part of the squelch, body squashed shorter and wider, the front edge lifted slightly off the ground, the sprout bounced forward, the same sly look.
3. SPOT: stopped and upright, body tall and round, eyes wide open and fixed on something off to the left, a tiny "ooh" mouth, the sprout standing straight up.
4. WINDUP: crouched and squashed flat and wide like a pressed ball of dough, sprout pushed down flat, two short mud arms pulled back behind it, eyes narrowed in determination, gritted little smile.
5. CHARGE: launched forward, stretched long and low and leaning far to the left, off the ground, the sprout swept back, eyes wide and thrilled, mouth open in a cheerful "BLUB!".
6. SHOVE: the moment of impact, front of the body slightly flattened, two thick mud arms thrust straight out to the left side and right side at shoulder height with flat blobby palms, eyes squeezed shut, teeth gritted, the sprout squashed down.
7. BARREL: squeezing through a tight gap, body squeezed tall and narrow like toothpaste, arms pulled in tight against the body, eyes darting to the side, the sprout flattened, cheeks puffed.
8. WOBBLE: just came through, body jiggling and tilted to one side like jelly, one eye bigger than the other, the sprout bent over, a dizzy but pleased grin.
9. REACH: one long mud arm stretched far out to the left at chest height with a flat open palm, the other arm tucked in, body leaning hard toward the left, tongue poking out in concentration, eyes locked on the target.
10. GRAB: the long mud arm curled around the round silver pie tin, holding it out at arm's length and tilted slightly up so the rhubarb crisp shows, eyes sparkling, a delighted open smile.
11. HUG: the pie tin clutched against its front with both mud arms, the crisp on top clearly visible, cheeks bulging, eyes closed in bliss, a huge smug smile, the sprout perky.
12. GLANCE: the tin tucked under one arm, body leaning left but the eyes turned all the way to the viewer's right in a mischievous side-eye, one eyebrow-like bump raised, a sneaky closed-mouth grin.
13. SCURRY A: tin clutched in both arms, body stretched forward and low, hopping, off the ground, leaning left, the sprout bent back, eyes wide with glee.
14. SCURRY B: tin clutched, body squashed on landing and wider, touching the ground line, the sprout bounced forward, a gleeful toothy grin.
15. GIGGLE: standing tall and stretched upward, the tin held high overhead in both arms like a trophy, eyes closed and cheeks up, a huge laughing open mouth, the sprout wiggling.
16. SNEAK: body flattened low and long and sliding away to the left, the tin held up over its top with both arms, half-lidded sly eyes glancing back to the right, a small proud smirk.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw the Mudling in the described pose.

## Notes for the build (when the sheet returns)

- Check each cell against the list. Cut cells by gaps (returned sheets are not exactly 1024). Save as tools/sprite-bake/src/foe-mudling-heist-v1.png and bake like Grace's extra frames (tools/sprite-bake/bake_grace_extra.py pattern), frames `mh_*`.
- The scene needs the pose step to work on a monster actor (today `{pose}` is for Tom, Grace and Rose): add a monster branch in `scenePoseDraw` (engine/story.js) that draws `mh_*` frames at the blob's `mscale`, mirrored for rightward travel (it has no writing on it). Then map the scene (data/scenes.js `ch1Theft`): mh_ooze_a/b alternating while it walks in; mh_spot at the corridor mouth (the 0.4 s beat); mh_windup then mh_charge on the charge; mh_shove at impact (sfx bonk); mh_barrel while it crosses the knocked-down family; mh_wobble on arrival; mh_reach, mh_grab at the counter (replace `carry='tin'`); mh_hug while Rose speaks; mh_glance on the turn; mh_scurry_a/b on the way out; mh_giggle once it is past the corridor; mh_sneak for the last tile before the door. Frames 10 to 16 already contain the tin, so skip the game's own tin prop (`STORY_PROPS.tin`) while those frames show.
- The family choreography (knock, getup, camera hold) stays as built; only timings may need a nudge to match the new frames.
