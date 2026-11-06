// Battle stance sheets for every playable character (Tom 2026-11-06 15:47): two Library entries each, so any current sheet can be replaced by pressing Generate.
// Sheet 1 = 8 frames, 4 x 2 (ready stances, gestures, wind-up, lunge, announce, brace). Sheet 2 = 6 frames, 3 x 2 (flinch, tired, nap, two cheers, signature pose).
// These are the same two sheets the game bakes from (art/raw/characters/<id>-battle-sheet-1-v1.png and -2-v1.png) and the same method that made the Young Boppy sheets.
// Entry ids use "battle-stance" (not "battle-sheet") on purpose: an approved picture is saved as <entry id>-v<n>.png, and the id "<id>-battle-sheet-1" would overwrite
// Tom's painted original of the same name. Installing an approved replacement is a separate step: Claude rebakes from the approved file when Tom asks.
// Sheet 2 attaches the CURRENT sheet 1 so the pair matches; if Tom replaces sheet 1, he should replace sheet 2 too. Michael and Jojo have no battle sheets yet: their sheet 2 waits for their sheet 1.
// No left/right words (the generator mixes them up): facing is copied from the attached sheet.
const R = 'art/raw/characters/';

// id, display name, he/she, mood for the ready stance, layout picture (another character's current sheet 1: grid, angle, figure size, ground line only)
const PEOPLE = [
  ['tom', 'Tom', 'he', 'a dry, calm look', 'tnb'],
  ['tnb', 'TNB', 'he', 'a relaxed, easygoing look', 'tom'],
  ['grace', 'Grace', 'she', 'a bright, bossy look', 'rose'],
  ['rose', 'Rose', 'she', 'a silly, bouncy look', 'grace'],
  ['amy', 'Amy', 'she', 'a caring but competitive look', 'tom'],
  ['justin', 'Justin', 'he', 'an easygoing, sporty look', 'tom'],
  ['deedee', 'Deedee', 'she', 'a warm, loving look', 'tom'],
  ['boppy', 'Boppy', 'he', 'a gruff but cheerful look', 'tom'],
  ['olivia', 'Olivia', 'she', 'a warm, capable look', 'tom'],
  ['michael', 'Michael', 'he', 'a friendly, easygoing look', 'tom'],
  ['jojo', 'Jojo', 'she', 'a friendly, playful look', 'tom'],
];
const NEW = new Set(['michael', 'jojo']);   // no battle sheets painted yet

const sheet1 = (p) => {
  const [id, name, he, mood, lay] = p, His = he === 'he' ? 'his' : 'her', Him = he === 'he' ? 'him' : 'her';
  return `Draw one battle sheet of the character in the attached pictures, for a family role-playing game.

Picture 1 is the character, ${name}. Picture 2 is ${His} walk sheet. Picture 3 is a battle sheet of a different character: copy only its grid layout, its viewing angle (a three-quarter view from slightly above, facing an opponent), its figure size and its feet on one ground line, never the person. Copy picture 1 and picture 2 as exactly as possible in every frame: the same person, face, age, body, hair, clothes, shoes, colors, painting style, level of detail and head size compared to the body.

One image, a grid of 4 columns by 2 rows of equal square cells (8 frames, numbered left to right, top to bottom), on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on one ground line, each figure well inside its cell with clear magenta margin. Every figure is full body, from the top of the hair to the soles of both shoes. In every frame ${he} faces the same way as the character in picture 3. No grid lines, numbers, text, effects, shadows or props. Hands empty. Clothing never uses magenta.

1. Ready stance, feet shoulder width apart, knees slightly bent, hands loose, ${mood}.
2. The same stance a moment later, chest risen with a breath, shoulders a little higher, one hand relaxed open.
3. Standing tall, both hands on ${His} hips, chin lifted, a playful unimpressed look.
4. One arm stretched toward the opponent, palm up, presenting something, a small proud smile.
5. Body twisted away from the opponent, arm pulled back, weight on the back leg, eyes narrowed, about to spring.
6. Lunging far forward toward the opponent, arm at full reach, front knee bent, mouth open in a shout.
7. Feet planted, both arms flung wide, chest out, chin up, announcing something big.
8. Crouched low, forearms crossed in front of the chest and face, chin tucked, determined.

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;
};

const sheet2 = (p) => {
  const [id, name, he] = p, His = he === 'he' ? 'his' : 'her';
  return `Draw a second battle sheet of the character in the attached pictures, for a family role-playing game.

Picture 1 is the character, ${name}. Picture 2 is ${His} first battle sheet: this sheet must look like it was painted at the same time, with the same viewing angle, the same figure size, the same feet ground line and the same head size compared to the body. Copy the person exactly: the same face, age, body, hair, clothes, shoes, colors, painting style and level of detail.

One image, a grid of 3 columns by 2 rows of equal square cells (6 frames, numbered left to right, top to bottom), on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on one ground line (except when ${he} is in the air), each figure well inside its cell with clear magenta margin. Every figure is complete, never cropped. In every frame ${he} faces the same way as in picture 2. No grid lines, numbers, text, effects, shadows or props. Hands empty. Clothing never uses magenta.

1. Startled flinch: body leaning back, head pulled back, eyes squeezed shut, one foot lifted off the ground.
2. Tired: down on one knee, one hand resting on the knee, head lowered, out of breath, a weary but determined face.
3. Napping: sitting slumped on the ground with legs stretched out in front, leaning back on one hand, head tilted, eyes closed, dizzy and sleepy.
4. Cheering: one fist pumped high, the other hand on the hip, a big grin.
5. Cheering: both fists overhead, laughing, up on the toes.
6. Signature pose: one arm pointing straight at the opponent, the other hand on the hip, feet planted wide, a confident determined smile.

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;
};

// Nara is a dog: her own poses, and no other character's sheet as a layout picture (a person's sheet would pull her toward a person).
const naraSheet1 = `Draw one battle sheet of the dog in the attached pictures, for a family role-playing game.

Picture 1 is the dog, Nara. Picture 2 is her walk sheet. Copy them as exactly as possible in every frame: the same dog, face, brown curly coat, collar, colors, painting style, level of detail and head size compared to the body.

One image, a grid of 4 columns by 2 rows of equal square cells (8 frames, numbered left to right, top to bottom), on a flat solid magenta #FF00FF background. One dog per cell, the same size in every cell, paws on one ground line, each dog well inside its cell with clear magenta margin. Every dog is complete, never cropped. In every frame she faces the same way as in picture 2's side-facing frames, in a three-quarter view from slightly above, facing an opponent. No grid lines, numbers, text, effects, shadows or props.

1. Ready stance, all four paws planted, weight forward, ears up, a loyal, alert look.
2. The same stance a moment later, mouth open and tongue out, chest risen with a breath, tail raised.
3. Sitting upright, head high, calm and attentive.
4. Sitting upright with one front paw raised, a friendly look.
5. Play bow: front legs stretched low, rear end high, tail up, eyes bright.
6. Leaping forward through the air, all four legs stretched, ears flying back.
7. Standing up on the hind legs, both front paws raised, ears up.
8. Crouched low to the ground, shoulders down, ready to pounce, eyes locked ahead.

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

const naraSheet2 = `Draw a second battle sheet of the dog in the attached pictures, for a family role-playing game.

Picture 1 is the dog, Nara. Picture 2 is her first battle sheet: this sheet must look like it was painted at the same time, with the same viewing angle, the same figure size, the same paw ground line and the same head size compared to the body. Copy the dog exactly: the same face, brown curly coat, collar, colors, painting style and level of detail.

One image, a grid of 3 columns by 2 rows of equal square cells (6 frames, numbered left to right, top to bottom), on a flat solid magenta #FF00FF background. One dog per cell, the same size in every cell, paws on one ground line (except when she is in the air), each dog well inside its cell with clear magenta margin. Every dog is complete, never cropped. In every frame she faces the same way as in picture 2. No grid lines, numbers, text, effects, shadows or props.

1. Startled flinch: up on the hind legs, front paws tucked, ears blown back, eyes squeezed shut.
2. Tired: lying flat on her belly, chin resting on the front paws, ears drooping, big sad eyes.
3. Napping: lying on her side, eyes closed, tongue sticking out a little.
4. Cheering: sitting upright with the head tilted up, mouth open in a happy bark.
5. Cheering: bouncing up off the ground on all four paws, tongue out, ears flying, tail wagging high.
6. Signature pose: rolled onto her back with all four paws in the air, tongue out, a goofy happy look.

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

const entries = [];
for (const p of PEOPLE) {
  const [id, name, he, mood, lay] = p, His = he === 'he' ? 'his' : 'her';
  const isNew = NEW.has(id);
  entries.push({ id: id + '-battle-stance-1', tab: 'Characters', title: name + ' battle stance sheet 1, 8 frames 4 x 2 (' + (isNew ? 'new; ' : 'replaces your painted sheet; ') + 'copies ' + His + ' hero and walk sheet)', ar: '2:1',
    refs: [R + id + '-hero-ref-v1.png', R + id + '-walk-sheet-v1.png', R + lay + '-battle-sheet-1-v1.png'], prompt: sheet1(p) });
  entries.push({ id: id + '-battle-stance-2', tab: 'Characters', title: name + ' battle stance sheet 2, 6 frames 3 x 2 (' + (isNew ? 'new; needs stance sheet 1 approved' : 'replaces your painted sheet; matches your current sheet 1') + ')', ar: '3:2',
    refs: [R + id + '-hero-ref-v1.png', isNew ? R + id + '-battle-stance-1-v1.png' : R + id + '-battle-sheet-1-v1.png'], prompt: sheet2(p) });
}
entries.push({ id: 'nara-battle-stance-1', tab: 'Characters', title: 'Nara battle stance sheet 1, 8 frames 4 x 2 (replaces your painted sheet; copies her hero and walk sheet)', ar: '2:1',
  refs: [R + 'nara-hero-ref-v1.png', R + 'nara-walk-sheet-v1.png'], prompt: naraSheet1 });
entries.push({ id: 'nara-battle-stance-2', tab: 'Characters', title: 'Nara battle stance sheet 2, 6 frames 3 x 2 (replaces your painted sheet; matches your current sheet 1)', ar: '3:2',
  refs: [R + 'nara-hero-ref-v1.png', R + 'nara-battle-sheet-1-v1.png'], prompt: naraSheet2 });

module.exports = { entries };
