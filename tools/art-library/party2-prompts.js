// Second batch of party characters: Olivia, Michael (carrying Lachlan and Isla), Jojo, Aunt Ellie, Nara (a dog).
// Same 4-step method as party-prompts.js (build(cast) is reused). Heights: Olivia 5'5" and Aunt Ellie 5'2" are ASSUMED (flagged in titles); Michael 6'4", Jojo 5'6".
const P = require('./party-prompts.js');
const { build, ART, STYLE_RULE, ATT, CLOSE } = P;
const S = 'tools/sprite-bake/src/';

const KIDS = 'Michael carries his two children in EVERY frame, one on each arm: LACHLAN (age 4, a small boy with the same oversized head share as Grace, about a quarter of his body height) on his left arm and ISLA (age 1, a baby with the same oversized head share as Rose, about a quarter or a little more) on his right arm. The children are part of his figure, painted by the same hand with the same texture and light, and they keep the same size and clothes in every frame. Their faces are friendly and calm. No other people.';
const MICHAEL_FRAMES = [
  ['standing, both hands on his hips, chin lifted', 'standing, a child held on each arm, chin lifted'],
  ['right arm extended to the left, palm up, presenting something, a small proud smile', 'a small proud nod toward the opponent, a child held on each arm, a small proud smile'],
  ['body twisted away from the opponent, arm cocked back, weight on the back leg, eyes narrowed', 'body twisted away from the opponent, both children held snugly, weight on the back leg, eyes narrowed'],
  ['lunging far forward to the left, arm at full extension, front knee bent, mouth open in a shout', 'a big forward step to the left, chest out, both children held tight, front knee bent, mouth open in a shout'],
  ['feet planted, both arms flung wide, chest out, chin up, announcing something with a big grin', 'feet planted, chest out, chin up, both children bouncing happily on his arms, announcing something with a big grin'],
  ['crouched low, forearms crossed in front of the chest and face, chin tucked, one eye peeking over the arms', 'standing, shoulder turned toward the opponent and both arms curled around the children to shield them, chin tucked, one eye peeking over the top'],
  ['kneeling on one knee, one hand resting on that knee, head hanging, a tired little pout', 'kneeling on one knee, the children cradled on his arms, head hanging, a tired little pout'],
  ['arms relaxed in his lap', 'the two children asleep in his lap, his arms around them'],
  ['one fist pumped high, the other hand on his hip, a big grin', 'chin up, a big grin, both children cheering on his arms'],
  ['both fists overhead, laughing, heels lifted', 'laughing, heels lifted, both children lifted up high on his arms'],
  ['hands loose', 'children held'],
];
const michaelFix = [
  ['Hands empty.', 'The children he carries are NOT props: draw them in every frame. Where a pose below mentions his hands or arms, his arms stay holding the children.'],
  ['hands empty and relaxed at his sides', 'his arms holding his two children, one on each arm'],
  ['is the only person in the picture', 'is the only adult in the picture, carrying his two children'],
  ['Draw ONLY MICHAEL.', 'Draw ONLY MICHAEL and the two children he carries (Lachlan and Isla).'],
  ['everything that is not the man', 'everything that is not the man or the two children he carries'],
  ['of a man standing', 'of a man carrying two small children, standing'],
  ['Keep the man EXACTLY', 'Keep the man and the two children EXACTLY'],
  ...MICHAEL_FRAMES,
];

// ---- Nara: a dog, so she has her own scene, walk and battle text (cut is reused with the word "dog") ----
const DOG = c => `NARA
A 7 year old, 40 pound Labradoodle with a soft wavy cream and apricot coat, real shoulder height about 1 foot 10 inches. Warm, loyal and gently goofy. She has strikingly human-like, soulful eyes, and her signature look is PUPPY DOG EYES: big, shining, pleading eyes with the brows tilted up in the middle.`;
const DOG_ART = `ART STYLE
- A whimsical storybook illustration of a real dog, shown full body, painted by hand in a rich, dense, jewel-toned style with visible painted texture and fine, detailed brushwork, like the illustrated school-yard painting the style key lives in. Gently simplified shapes. Slightly stylized features that keep a clear likeness. Every curl of the coat reads as painted fur, not a smooth gradient.
- Caricature proportions: a slightly oversized head, big expressive eyes and a warm, slightly exaggerated expression; the body, legs and tail keep real Labradoodle proportions.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp edges with fine detail. No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette.`;
const dogAtt = c => `ATTACHED IMAGES (in this order)
1. NARA's master picture: a finished picture of her on a flat magenta background. This is the ONLY source for her face, coat color and curl, collar, colors, painted texture and brushwork. Draw her EXACTLY like this in every frame: same face, same coat, same collar, same painted look and level of detail. The magenta in this picture is the background to use here too.
2. The STYLE KEY, a finished painting of the family in a school yard. It shows how this game paints. Match its dense, jewel-toned painted texture and fine visible brushwork on every part of Nara: fur, eyes, collar and paws.
3. A HEIGHT CHART of grey shapes. It shows SIZE ONLY. Do not copy the grey shapes, the grid or the text. Use it to keep Nara about 1 foot 10 inches tall at the shoulder, about as tall as Rose's hip.`;
const dogClose = `Family friendly for ages 6 and up.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw Nara in the pose described, with the face, coat and collar exactly as in attachment 1.`;
const dogScene = c => `IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.

WHAT THIS IS
A painting of NARA, a Labradoodle, standing alone in the school yard, for "The Adventures of Tom", a family role-playing game. She is painted INSIDE the school yard scene, in the same sitting by the same artist, so that she has exactly the same painted texture as the scene around her.

ATTACHED IMAGES (in this order)
1. The school yard painting. This is the BACKGROUND and the STYLE TO MATCH. Keep the school building, paths, signs, lamps, parking area and playground exactly as painted, same framing, nothing removed. Match its dense, jewel-toned painted texture, its fine visible brushwork, its deep saturated colors, its warm lamplight and its level of detail on the dog.
2. Nara's older reference picture. Use it for her FACE, coat color and curl, collar and body shape ONLY. Do not copy how it is rendered: it is smooth and glossy, and the new picture must not be. The magenta background in it is not part of the picture, ignore it.
3. The STYLE KEY, a finished painting of the family in this same school yard. Match how it paints living things.
4. A HEIGHT CHART of grey shapes. It shows SIZE ONLY. Do not copy the grey shapes, the grid or the text.

${STYLE_RULE()}
Attachment 2 is for LIKENESS ONLY. Repaint Nara from scratch in the exact painting style of attachment 1, as if the same artist painted the whole canvas in one sitting.

THE SCENE
Use the school yard painting as the whole background. Nara is the only living thing in the picture. She stands large and centered on the wide paved walkway in the middle of the picture, full body from the top of her head to her paws, all four paws on the paving, body turned a little (three quarter) toward the viewer, head up, tail relaxed, a soft open-mouth happy look with the soulful eyes clearly readable. She is big in the frame, so that the face, curls, collar and paws can be seen in fine detail, while the school yard stays recognizable behind her. She casts a soft shadow on the paving.

${DOG(c)}

${DOG_ART}
- She is lit by the SAME light as the background: warm orange lamplight from the nearby lamp posts and the school windows, cool blue-violet dusk sky light as fill, with warm rim light on the fur.

LIKENESS
Keep the face of attachment 2: the exact muzzle, nose, eye shape and color, ear shape and fall, coat color, curl and length, markings and collar. Exaggerate only the head size slightly and the expression. Never invent a new accessory or color.

NEVER substitute. Draw only Nara. No people, no text, no labels, no captions, no speech balloons. Family friendly for ages 6 and up.`;
const dogWalk = c => `IMAGE REQUEST: ONE SINGLE CHARACTER WALKING SHEET. Return exactly one image, nothing else.

WHAT THIS IS
The walking sheet of NARA, a Labradoodle, for "The Adventures of Tom", a family role-playing game: nine walking frames, a 3 by 3 grid, used to walk her around a town beside the family.

${dogAtt(c)}

${STYLE_RULE()}

${DOG_ART}

${DOG(c)} Keep every detail of attachment 1 in every frame.

THE SHEET (strict)
- A grid of 3 columns by 3 rows of equal square cells, 256 x 256 pixels each, so the full image is 768 x 768. If your tool offers a larger square size, keep exactly 3 columns and 3 rows.
- Exactly 9 frames, one per cell, filled left to right, top to bottom, in the numbered order below.
- Camera: a character turnaround at about chest height of a person, full body, straight on for the front and back rows and a true side profile for the third row. No top-down angle.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on Nara. No magenta glow, spill, tint or fringe on the fur. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour.
- Same scale in every cell. The standing dog is about 110 pixels tall from the top of her head to her paws. Her paws on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY Nara. No effects, shadows, dust, motion lines, sparkles, props, other animals, people, text or word balloons.
- The same head size, the same coat and the same collar in every frame.

THE 9 FRAMES
Row 1, facing the viewer:
1. DOWN STAND: facing the viewer, all four paws planted, head up, tail relaxed, a soft happy look.
2. DOWN STEP A: facing the viewer, the front paw on the viewer's right steps forward.
3. DOWN STEP B: the mirror of frame 2.
Row 2, seen from behind:
4. UP STAND: seen from behind, all four paws planted, the tail and the back of the coat fully visible.
5. UP STEP A: seen from behind, a rear paw steps away from us.
6. UP STEP B: the mirror of frame 5.
Row 3, a true side profile facing LEFT:
7. SIDE STAND: profile facing left, all four paws planted, head up.
8. SIDE STEP A: profile facing left, the near front paw and far rear paw forward, the opposite pair trailing.
9. SIDE STEP B: profile facing left, the passing moment of the trot, the body slightly higher.

The two STEP frames of a row mirror each other. Dog legs move in diagonal pairs. STAND frames are neutral.

${dogClose}`;
const dogBattle = c => `IMAGE REQUEST: ONE SINGLE CHARACTER BATTLE SHEET. Return exactly one image, nothing else.

WHAT THIS IS
The standard battle pose sheet of NARA, a Labradoodle, for "The Adventures of Tom", a family role-playing game: sixteen poses, a 4 by 4 grid. Nara is warm, loyal and gently goofy, and the poses show it.

${dogAtt(c)}

${STYLE_RULE()}

${DOG_ART}

${DOG(c)} Keep every detail of attachment 1 in every frame, including crouched, leaning and sitting poses.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of equal square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a larger square size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the numbered order below.
- NARA FACES LEFT in every frame: a side or three-quarter view from slightly above, a loyal companion facing an off-screen opponent on the left in a family-friendly fantasy game. Her face stays visible and turned toward the left, except where a frame says the head is lowered.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on Nara. No magenta glow, spill, tint or fringe on the fur. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour.
- Same scale in every cell. Never rescale a frame to fit a pose: crouched poses get shorter and leaps get wider. Paws on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY Nara. No effects, shadows, dust, motion lines, sparkles, props, other animals, people, text or word balloons.
- The same head size, coat and collar in every frame.

THE 16 FRAMES (each clearly different from the others)
1. IDLE A: battle stance, all four paws planted, weight forward, ears up, eyes aimed at the off-screen opponent.
2. IDLE B: the same stance a moment later, chest risen with a breath, tail lifted in a small wag.
3. WALK A: trotting left, near front paw forward.
4. WALK B: the opposite step.
5. SIT: sitting tall and proud, chin lifted, tail swept to one side.
6. PAW: one front paw raised toward the left, offering a paw, a small proud look.
7. WIND-UP: crouched low and coiled back on the hind legs, head low, eyes narrowed.
8. POUNCE: leaping far forward to the left, front paws reaching, ears flying back, mouth open.
9. BARK: planted wide, chest out, head thrown up, mouth open in a big bark.
10. GUARD: crouched low, ears flat, head tucked behind the front paws, one eye peeking over them.
11. FLINCH: startled, recoiling, leaning back and to the right, ears flung up, eyes squeezed shut, one front paw lifted.
12. TIRED: lying on her belly, chin resting on her front paws, a tired little droop.
13. NAP: curled up on the ground in a round nap, nose tucked toward her tail, eyes closed.
14. CHEER A: victory, front paws up on an imaginary ledge, tongue out, a big happy grin.
15. CHEER B: a happy spin, all four paws off the ground, tail whipping, laughing.
16. SIGNATURE, PUPPY DOG EYES: sitting facing the viewer's left in three quarter view, head tilted, brows tilted up in the middle, huge shining pleading eyes, ears relaxed, one paw tucked in.

${dogClose}`;
const dogCut = c => `IMAGE REQUEST: ONE SINGLE EDIT. Return exactly one image, nothing else.

The attached picture is a finished painting of a dog standing in a school yard. Keep the dog EXACTLY as painted: do not redraw, repaint, restyle, sharpen or smooth anything about her. Keep the face, curls, collar, paws, pose, size, position, colors, lighting and the visible painted brushwork and texture exactly as they are, pixel for pixel in feel.

Change ONLY the background: replace everything that is not the dog (the school, the paving, the sky, the lamps, the planters, every shadow on the ground) with one flat solid pure magenta #FF00FF filling the whole rest of the image. No ground, no shadow, no gradient, no border, no text, no labels.

No magenta on the dog. No magenta glow, spill, tint or fringe on the edges of the fur. Keep the edges clean and crisp. Draw nothing new and no one else.`;

const CAST2 = [
  { id: 'olivia', name: 'OLIVIA', he: 'she', him: 'her', his: 'her', who: 'a woman in her thirties', kind: 'adult', ft: '5 feet 5 inches', hero: S + 'olivia-hero-v1.png', title: ' (height 5 ft 5 assumed, ask Tom)',
    mood: 'bright, quick and chatty, always documenting life for LivNews: an easy, camera-ready smile',
    sig: 'LIVE REPORT: one arm held out in front holding a phone up at arm length as if filming, the other hand gesturing, eyebrows raised, mouth open mid-broadcast, a bright on-camera smile.' },
  { id: 'michael', name: 'MICHAEL', he: 'he', him: 'him', his: 'his', who: 'a man in his thirties', kind: 'adult', ft: '6 feet 4 inches', hero: S + 'michael-walk-v1.png', title: ' (carrying Lachlan and Isla)',
    mood: 'gentle, steady and patient, a devoted dad: a warm, tired-but-happy smile',
    note: 'Attachment 2 is an older walking sheet of him: take the face, hair, build and clothes from its front-facing frames, and ignore the sheet layout and the magenta.',
    whoExtra: KIDS, fix: michaelFix,
    sig: 'LULLABY SWAY: swaying gently to one side with a child on each arm, head tilted down toward them, a soft, loving smile.' },
  { id: 'jojo', name: 'JOJO', he: 'she', him: 'her', his: 'her', who: 'a woman in her thirties', kind: 'adult', ft: '5 feet 6 inches', hero: S + 'jojo-sheet-v2.png',
    mood: 'warm, easy-going and a little wry, TNB\'s sister: a relaxed, friendly smile',
    note: 'Attachment 2 is an older sheet of her: take the face (a long face), rectangular glasses, long straight light brown hair, build and clothes from it, and ignore the sheet layout and the magenta. Her head is the same size as the other adults.',
    sig: 'SIBLING SHRUG: both shoulders raised, both palms turned up, head tilted, a wry, knowing smile, one eyebrow lifted.' },
  { id: 'ellie', name: 'AUNT ELLIE', label: 'Aunt Ellie', he: 'she', him: 'her', his: 'her', who: 'an elderly woman', kind: 'adult', ft: '5 feet 2 inches', hero: S + 'ellie-hero.png', title: ' (height 5 ft 2 assumed, ask Tom)',
    mood: 'glamorous, sly and sharp, Deedee\'s aunt, a lover of card games and a bold bettor, always in purple: a knowing, mischievous smile',
    sig: 'ALL IN: one hand holding a fan of playing cards close to her face, the other hand pushing a small stack forward, one eyebrow arched, a sly poker-face smile.' },
  { id: 'nara', name: 'NARA', label: 'Nara', he: 'she', him: 'her', his: 'her', who: 'a dog', kind: 'dog', ft: '1 foot 10 inches at the shoulder', hero: S + 'nara-hero.png', title: ' (a dog, about 1 ft 10 at the shoulder)',
    mood: 'warm, loyal and gently goofy', sig: 'x', fns: { scene: dogScene, cut: dogCut, walk: dogWalk, battle: dogBattle } },
];
module.exports = { CAST2, entries: build(CAST2) };
