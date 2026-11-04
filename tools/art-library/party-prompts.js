// Party prompts for the Art Library (Phase C). Required by make-prompts.js: node tools/art-library/make-prompts.js
// One character = 4 entries, the method that worked for Grace (CHANGES (99) to (104)):
//   <id>-hero-scene  step 1, the character painted INSIDE the school yard painting (gets the brushwork), 4:3
//   <id>-hero-cut    step 2, the same picture with everything but the character replaced by flat magenta, 4:3
//   <id>-walk        3 x 3 walking sheet, 1:1, built from the cut
//   <id>-battle      4 x 4 battle sheet, 1:1, built from the cut
// The cut and walk refs point at art/raw/characters/<id>-hero-*-v1.png, which is where APPROVE puts a picture (art.html: art/raw/<tab>/<entry id>-v<n>.png).
// If Tom approves a later take (v2), change the ref's version here and rerun make-prompts.js.
// Real heights: docs/CANON.md and the height chart (docs/reference/height_chart_v1.png). A character with no height on record is NOT listed (ask Tom first).
const REF_YARD = 'docs/reference/school_style_ref.png';
const REF_KEY = 'docs/reference/style_key_v1.png';
const REF_CHART = 'docs/reference/height_chart_v1.png';
const RAW = 'art/raw/characters/';

// kind: 'adult' | 'child'. sig: the frame 16 pose. look: one line of what the likeness picture shows, used only for the scene prompt so the outfit stays the same.
const CAST = [
  { id: 'tom', name: 'TOM', he: 'he', him: 'him', his: 'his', who: 'a man in his forties', kind: 'adult', ft: '5 feet 11 inches', hero: 'tools/sprite-bake/src/tom-hero-v3.png',
    mood: 'dry, calm and a little deadpan, a gamer at heart: a relaxed half smile',
    sig: 'DEFEND: feet planted, one hand raised flat with the palm out toward the off-screen opponent like a polite stop sign, the other hand relaxed, chin slightly lifted, a calm, deadpan look that says "No touching, please."' },
  { id: 'tnb', name: 'TNB', he: 'he', him: 'him', his: 'his', who: 'a man in his thirties', kind: 'adult', ft: '5 feet 10 inches', hero: 'tools/sprite-bake/src/tnb-hero.png',
    mood: 'chill, easy-going and crafty: a relaxed, amused smile',
    sig: 'WARDROBE: one hand pinching the front of his own shirt to check how it hangs, the other hand on his hip, head tilted, an easy, amused, slightly critical look, like a wardrobe runner checking a fit.' },
  { id: 'rose', name: 'ROSE', he: 'she', him: 'her', his: 'her', who: 'a girl', kind: 'child', ft: '3 feet 4 inches', age: '6 year old', hero: 'tools/sprite-bake/src/rose-hero-v2.png', head: 'a little over a quarter',
    mood: 'silly, bouncy and earnest: a big, goofy, happy grin',
    sig: 'SILLY: knees bent and bouncing, both arms flapping out to the sides, tongue stuck out in a big silly raspberry, eyes squeezed into happy crescents.' },
  { id: 'amy', name: 'AMY', he: 'she', him: 'her', his: 'her', who: 'a woman in her forties', kind: 'adult', ft: '5 feet 5 inches', hero: 'tools/sprite-bake/src/amy-hero.png',
    mood: 'brisk, caring and competitive, a runner and a teacher: a bright, encouraging smile',
    sig: 'PEP TALK: leaning forward like a coach, both fists pumped in front of her chest, elbows in, mouth open mid-shout, bright eyes, a fierce but loving look.' },
  { id: 'justin', name: 'JUSTIN', he: 'he', him: 'him', his: 'his', who: 'a man in his forties', kind: 'adult', ft: '6 feet 4 inches', hero: 'tools/sprite-bake/src/justin-idle-v1.png',
    mood: 'direct, serious and steady, with a real laugh only when the moment is right: a calm, level look and a small smile',
    note: 'Attachment 2 shows him mid-stance in a work shirt and a tool belt. Take the face, hair, stubble, jeans, shoes, watch and tool belt from it, but he stands neutral and relaxed in this picture.',
    sig: 'DRYWALL: a wide, planted stance, both arms held out wide and low like a barrier, chest out, chin level, a serious, steady look that says "Everybody behind me."' },
  { id: 'deedee', name: 'DEEDEE', he: 'she', him: 'her', his: 'her', who: 'a woman in her seventies', kind: 'adult', ft: '5 feet 5 inches', hero: 'tools/sprite-bake/src/deedee-hero.png',
    mood: 'warm, bustling and no-nonsense, a retired nurse who bakes and gardens: a loving, firm smile',
    sig: 'TO THE MOON AND BACK: one arm sweeping high overhead toward the sky, the other hand pressed to her heart, head tilted back a little, a big, loving, proud smile.' },
  { id: 'boppy', name: 'BOPPY', he: 'he', him: 'him', his: 'his', who: 'a man in his seventies', kind: 'adult', ft: '5 feet 7 inches', hero: 'tools/sprite-bake/src/boppy-hero.png',
    mood: 'sweet, fun-loving and a joker, a born complainer: a twinkly, mischievous grin',
    sig: 'GRUMBLE: bent forward at the waist, one hand on his belly, the other hand out palm up, complaining, with a pained, comical, sulky face.' },
];

const STYLE_RULE = (n, ps) => `STYLE RULE (the most important instruction)
Every frame must look painted by the same hand as attachments 1 and 2: dense painted texture, fine visible brushwork, deep saturated colors, crisp detail on hair strands, fabric folds and shoe edges. No airbrushed skin, no smooth gradients, no glossy plastic look, no soft-focus look, no 3D render look. Fabric keeps the woven texture of attachment 1.`;

function headLine(c, sheet) {
  const body = c.kind === 'child' ? 'a small body, small hands and small feet' : 'a slim body, small hands and small feet';
  const share = c.kind === 'child' ? `an oversized head ${c.head ? c.head + ' of' : 'a little under half of'} the full body height` : 'an oversized head about one fifth of the full body height, as large relative to the body as the adults in the style key';
  const kid = c.kind === 'child' ? ' for a child' : '';
  return `- Caricature proportions${kid}: ${share}, ${body}, large expressive eyes and a warm, slightly exaggerated expression.` + (sheet ? ` The head size in attachment 1 wins over any number in this paragraph: in every frame the head is exactly as large, compared with the body, as it is in attachment 1.` : '');
}

const ART = (c, sheet) => `ART STYLE
- A whimsical storybook illustration of a real person, shown full body, painted by hand in a rich, dense, jewel-toned style with visible painted texture and fine, detailed brushwork, like the illustrated school-yard painting the style key lives in. Gently simplified shapes. Slightly stylized features that keep a clear likeness. Clothing prints and patterns are drawn in clear detail so every motif is readable.
${headLine(c, sheet)}
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp edges with fine detail. No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette.`;

const WHO = c => `${c.name}
${c.age ? 'A ' + c.age + ' ' : 'A '}${c.kind === 'child' ? 'girl' : (c.he === 'she' ? 'woman' : 'man')}, real height ${c.ft}. ${c.mood.charAt(0).toUpperCase() + c.mood.slice(1)}.${c.whoExtra ? ' ' + c.whoExtra : ''}`;

function scene(c) {
  return `IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.

WHAT THIS IS
A painting of ${c.name} standing alone in the school yard, for "The Adventures of Tom", a family role-playing game. ${c.he === 'she' ? 'She' : 'He'} is painted INSIDE the school yard scene, in the same sitting by the same artist, so that ${c.he} has exactly the same painted texture as the scene around ${c.him}.

ATTACHED IMAGES (in this order)
1. The school yard painting. This is the BACKGROUND and the STYLE TO MATCH. Keep the school building, paths, signs, lamps, parking area and playground exactly as painted, same framing, nothing removed. Match its dense, jewel-toned painted texture, its fine visible brushwork, its deep saturated colors, its warm lamplight and its level of detail in the character.
2. ${c.name}'s older reference picture. Use it for ${c.his} FACE, hair, build and the exact outfit, shoes and accessories ONLY. Do not copy how it is rendered: it is smooth and glossy, and the new picture must not be. The magenta background in it is not part of the picture, ignore it.${c.note ? ' ' + c.note : ''}
3. The STYLE KEY, a finished painting of the family in this same school yard. Match how it paints people${c.kind === 'child' ? ' and how it draws a child, including the head size and body proportions of the children' : ', including the head size and body proportions of the adults'}.
4. A HEIGHT CHART of grey shapes. It shows SIZE ONLY. Do not copy the grey shapes, the grid or the text. Use it to check that ${c.name} is ${c.ft} tall.

${STYLE_RULE()}
Attachment 2 is for LIKENESS ONLY. Repaint ${c.name} from scratch in the exact painting style of attachment 1, as if the same artist painted the whole canvas in one sitting: the same dense painted texture on skin, hair and fabric, the same fine visible brushwork, the same crisp dark-edged detail on fabric folds, hair strands and shoe edges, the same deep saturated colors and rich contrast, the same fine detail as the foliage and brick. ${c.he === 'she' ? 'Her' : 'His'} face keeps the likeness but is painted with the same brushwork as the rest of the picture.

THE SCENE
Use the school yard painting as the whole background. ${c.name} is the only person in the picture. ${c.he === 'she' ? 'She' : 'He'} stands large and centered on the wide paved walkway in the middle of the picture, full body from the top of ${c.his} hair to the soles of ${c.his} shoes, feet on the paving. ${c.he === 'she' ? 'She' : 'He'} stands neutral and relaxed, body turned a little (three quarter) toward the viewer, a warm natural smile, face clear and readable, hands empty and relaxed at ${c.his} sides, both feet flat and fully visible. ${c.he === 'she' ? 'She' : 'He'} is big in the frame, so that the face, hair, fabric weave and shoes can be seen in fine detail, while the school yard stays recognizable behind ${c.him}. ${c.he === 'she' ? 'She' : 'He'} casts a soft shadow on the paving.

${WHO(c)}

${ART(c, false)}
- ${c.he === 'she' ? 'She is' : 'He is'} lit by the SAME light as the background: warm orange lamplight from the nearby lamp posts and the school windows, cool blue-violet dusk sky light as fill, with warm rim light on hair and shoulders.

LIKENESS
Keep the face of attachment 2: the exact face shape, cheeks, nose, lips, smile, eyebrows, eye shape and color, skin tone, glasses or facial hair if any, and the hair color, length, parting, volume and texture. Exaggerate only the head size and the expression, never the individual features. Do not beautify, age up or age down ${c.him}. Keep the outfit exactly as in attachment 2: every color, print, pattern, trim and accessory. Never invent a new accessory, hairstyle or color.

NEVER substitute. Draw only ${c.name}. No other people, no text, no labels, no captions, no speech balloons. Family friendly for ages 6 and up. If anything is unclear, draw ${c.him} standing relaxed and smiling in the school yard as described.`;
}

function cut(c) {
  const p = c.kind === 'child' ? 'girl' : (c.he === 'she' ? 'woman' : 'man');
  return `IMAGE REQUEST: ONE SINGLE EDIT. Return exactly one image, nothing else.

The attached picture is a finished painting of a ${p} standing in a school yard. Keep the ${p} EXACTLY as painted: do not redraw, repaint, restyle, sharpen or smooth anything about ${c.him}. Keep the face, hair strands, clothes, shoes, accessories, pose, size, position, colors, lighting and the visible painted brushwork and texture exactly as they are, pixel for pixel in feel.

Change ONLY the background: replace everything that is not the ${p} (the school, the paving, the sky, the lamps, the planters, every shadow on the ground) with one flat solid pure magenta #FF00FF filling the whole rest of the image. No ground, no shadow, no gradient, no border, no text, no labels.

No magenta on the ${p}. No magenta glow, spill, tint or fringe on the edges or hair strands. Keep the edges clean and crisp. Draw nothing new and no one else.`;
}

const ATT = (c, what) => `ATTACHED IMAGES (in this order)
1. ${c.name}'s master picture: a finished painting of ${c.him} on a flat magenta background. This is the ONLY source for ${c.his} face, hair, outfit, colors, painted texture and brushwork. Draw ${c.him} EXACTLY like this in every frame: same face, same hair, same clothes, same prints and fabric texture, same colors, same painted look and level of detail. The magenta in this picture is the background to use here too.
2. The STYLE KEY, a finished painting of the family in a school yard. It shows how this game paints people and how it draws ${c.kind === 'child' ? 'a child' : 'an adult'}. Match its dense, jewel-toned painted texture and fine visible brushwork on every part of ${c.name}: skin, hair, fabric and shoes.
3. A HEIGHT CHART of grey shapes. It shows SIZE ONLY. Do not copy the grey shapes, the grid or the text. Use it to keep ${c.name} ${c.ft} tall.`;

const LOOK = c => `${c.name}
${c.age ? 'A ' + c.age + ' ' : 'A '}${c.kind === 'child' ? 'girl' : (c.he === 'she' ? 'woman' : 'man')}. Keep every detail of attachment 1: face, hair, outfit, shoes and accessories. Never invent a new accessory, hairstyle or color. For the back view, extend the outfit plainly and consistently with the front; hair falls as it does in attachment 1.`;

const CLOSE = c => `Family friendly for ages 6 and up.

NEVER substitute. Do not add extra frames, merge two frames, repeat a pose, or invent props. If anything is unclear, draw ${c.name} in the pose described, with the face, hair and outfit exactly as in attachment 1 and the head size exactly as in attachment 1.`;

function walk(c) {
  const px = c.kind === 'child' ? 150 : 180;
  return `IMAGE REQUEST: ONE SINGLE CHARACTER WALKING SHEET. Return exactly one image, nothing else.

WHAT THIS IS
The walking sheet of ${c.name} for "The Adventures of Tom", a family role-playing game: nine walking frames, a 3 by 3 grid, used to walk ${c.him} around a town.

${ATT(c)}

${STYLE_RULE()}

${ART(c, true)}

${LOOK(c)}

THE SHEET (strict)
- A grid of 3 columns by 3 rows of equal square cells, 256 x 256 pixels each, so the full image is 768 x 768. If your tool offers a larger square size, keep exactly 3 columns and 3 rows.
- Exactly 9 frames, one per cell, filled left to right, top to bottom, in the numbered order below.
- Camera: a character turnaround at about chest height, full body, straight on for the front and back rows and a true side profile for the third row. No top-down angle.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on ${c.name}. No magenta glow, spill, tint or fringe on the edges or hair strands. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour.
- Same scale in every cell. The standing figure is about ${px} pixels tall in its cell, from the top of the hair to the soles of the shoes. Feet on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY ${c.name}. Hands empty. No effects, shadows, dust, motion lines, sparkles, props, other people, text or word balloons.
- The same head size, the same hair volume and the same outfit in every frame. The head is never redrawn smaller or larger from frame to frame.

THE 9 FRAMES
Row 1, facing the viewer:
1. DOWN STAND: facing the viewer, feet together, arms relaxed at ${c.his} sides, a warm natural smile.
2. DOWN STEP A: facing the viewer, the foot on the viewer's right steps forward, the arm on the viewer's left swings forward.
3. DOWN STEP B: the mirror of frame 2.
Row 2, seen from behind:
4. UP STAND: seen from behind, feet together, arms at ${c.his} sides, the hair and the back of the outfit fully visible.
5. UP STEP A: seen from behind, the foot on the viewer's left steps away from us, the arm on the viewer's right swings forward.
6. UP STEP B: the mirror of frame 5.
Row 3, a true side profile facing LEFT:
7. SIDE STAND: profile facing left, feet together, arms relaxed.
8. SIDE STEP A: profile facing left, the front leg forward with the heel down, the back leg trailing with the heel lifted, the near arm back and the far arm forward.
9. SIDE STEP B: profile facing left, the passing moment of the stride, the back foot lifted with a bent knee, the body slightly higher.

The two STEP frames of a row mirror each other. Arms always swing opposite to the legs. STAND frames are neutral.

${CLOSE(c)}`;
}

function battle(c) {
  return `IMAGE REQUEST: ONE SINGLE CHARACTER BATTLE SHEET. Return exactly one image, nothing else.

WHAT THIS IS
The standard battle pose sheet of ${c.name} for "The Adventures of Tom", a family role-playing game: sixteen poses, a 4 by 4 grid. ${c.name} is ${c.mood}, and the poses show it.

${ATT(c)}

${STYLE_RULE()}

${ART(c, true)}

${LOOK(c)} Keep every detail of attachment 1 in every frame, including crouched, leaning and sitting poses.

THE SHEET (strict)
- A grid of 4 columns by 4 rows of equal square cells, 256 x 256 pixels each, so the full image is 1024 x 1024. If your tool offers a larger square size, keep exactly 4 columns and 4 rows.
- Exactly 16 frames, one per cell, filled left to right, top to bottom, in the numbered order below.
- ${c.name} FACES LEFT in every frame: a side or three-quarter view from slightly above, a hero facing an off-screen opponent on the left in a family-friendly fantasy game. The face stays visible and turned toward the left, except where a frame says the head is bowed or tilted back.
- Background: one flat solid pure magenta #FF00FF filling the whole image. No magenta anywhere on ${c.name}. No magenta glow, spill, tint or fringe on the edges or hair strands. No grid lines, borders, cell backgrounds, numbers, labels, captions or titles.
- Each frame sits fully inside its cell with at least 10 percent margin. Nothing touches a cell edge or overlaps a neighbour.
- Same scale in every cell. Never rescale a frame to fit a pose: crouched poses get shorter and lunges get wider. Feet on the ground rest on one horizontal line about 24 pixels above the cell bottom.
- Draw ONLY ${c.name}. Hands empty. No effects, shadows, dust, motion lines, sparkles, props, other people, text or word balloons.
- The same head size, the same hair volume and the same outfit in every frame. The head is never redrawn smaller or larger from frame to frame, whatever the pose.

THE 16 FRAMES (each clearly different from the others)
1. IDLE A: battle stance, feet shoulder width apart, knees slightly bent, hands loose, ${c.name}'s own expression aimed at the off-screen opponent.
2. IDLE B: the same stance a moment later, chest risen with a breath, a small gesture that fits ${c.his} personality.
3. WALK A: striding left, the near foot forward, the opposite arm swinging.
4. WALK B: the opposite step.
5. HIP: standing, both hands on ${c.his} hips, chin lifted, a look that fits ${c.his} personality.
6. ACT: right arm extended to the left, palm up, presenting something, a small proud smile.
7. WIND-UP: body twisted away from the opponent, arm cocked back, weight on the back leg, eyes narrowed.
8. SWING: follow-through, lunging far forward to the left, arm at full extension, front knee bent, mouth open in a shout.
9. SPREAD: feet planted, both arms flung wide, chest out, chin up, announcing something with a big grin.
10. GUARD: crouched low, forearms crossed in front of the chest and face, chin tucked, one eye peeking over the arms.
11. FLINCH: startled, recoiling, leaning back and to the right, head tilted back, eyes squeezed shut, one foot lifted.
12. TIRED: kneeling on one knee, one hand resting on that knee, head hanging, a tired little pout.
13. NAP: sitting on the ground facing left, legs out in front, head drooping and eyes closed as if taking a nap, arms relaxed in ${c.his} lap.
14. CHEER A: victory, one fist pumped high, the other hand on ${c.his} hip, a big grin.
15. CHEER B: both fists overhead, laughing, heels lifted.
16. SIGNATURE, ${c.sig}

${CLOSE(c)}`;
}

// build(cast) makes the 4 entries per character. Optional per-character fields: label (display name), title (suffix note),
// whoExtra (added to the WHO block), fix ([find, replace] pairs applied to every prompt of that character), fns ({scene,cut,walk,battle} overrides).
function build(cast) {
  const out = [];
  for (const c of cast) {
    const scenePath = RAW + c.id + '-hero-scene-v1.png', cutPath = RAW + c.id + '-hero-cut-v1.png';
    const f = c.fns || { scene, cut, walk, battle };
    const post = t => (c.fix || []).reduce((x, [a, b]) => x.split(a).join(b), t);
    const nm = c.label || (c.name[0] + c.name.slice(1).toLowerCase()), sfx = c.title || '';
    out.push({ id: c.id + '-hero-scene', tab: 'Characters', title: `${nm}: hero pose step 1, painted in the school yard${sfx}`, ar: '4:3', refs: [REF_YARD, c.hero, REF_KEY, REF_CHART], prompt: post(f.scene(c)) });
    out.push({ id: c.id + '-hero-cut', tab: 'Characters', title: `${nm}: hero pose step 2, cut out on magenta (needs step 1 approved)`, ar: '4:3', refs: [scenePath], prompt: post(f.cut(c)) });
    out.push({ id: c.id + '-walk', tab: 'Characters', title: `${nm}: walking sheet 3 x 3 (needs step 2 approved)`, ar: '1:1', refs: [cutPath, REF_KEY, REF_CHART], prompt: post(f.walk(c)) });
    out.push({ id: c.id + '-battle', tab: 'Characters', title: `${nm}: battle sheet 4 x 4 (needs step 2 approved)`, ar: '1:1', refs: [cutPath, REF_KEY, REF_CHART], prompt: post(f.battle(c)) });
  }
  return out;
}
// Wiped 2026-11-03 (Tom): no character entries are listed. Each character is added with Tom in chat, two steps first (see claude/next.md).
const entries = [];
module.exports = { CAST, entries, build, scene, cut, walk, battle, ART, STYLE_RULE, ATT, LOOK, CLOSE, WHO, REF_YARD, REF_KEY, REF_CHART, RAW };
