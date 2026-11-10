// Walking sheets for every playable person (Tom 2026-11-09 16:54: "i dont think i see the 3 walking sheet for Tom or others").
// Fact behind it: Tom's painted walk sheets were sent to Claude as files (art/raw/characters/<id>-walk-sheet-v1.png) and never had Library entries, so nothing could be generated or uploaded for them. Jojo's entry (jojo-prompts.js) was the only one.
// Same idea as battle-stance-prompts.js: the entry id is "<id>-walking-sheet" (NOT "-walk-sheet") so an approved picture saves as <id>-walking-sheet-v<n>.png and never overwrites Tom's painted original. Installing an approved replacement is a separate step (Claude rebakes from the approved file when Tom asks).
// Picture 1 = the hero painting (likeness), picture 2 = the CURRENT walk sheet (layout, figure size, way of drawing steps, clothes). No left/right words: profile facing is copied from picture 2.
const R = 'art/raw/characters/';
// id, display name, he/she
const PEOPLE = [['tom', 'Tom', 'he'], ['tnb', 'TNB', 'he'], ['grace', 'Grace', 'she'], ['rose', 'Rose', 'she'], ['amy', 'Amy', 'she'],
  ['justin', 'Justin', 'he'], ['deedee', 'Deedee', 'she'], ['boppy', 'Boppy', 'he'], ['olivia', 'Olivia', 'she'], ['michael', 'Michael', 'he']];
const sheet = ([id, name, he]) => {
  const His = he === 'he' ? 'his' : 'her', Him = he === 'he' ? 'him' : 'her', He = he === 'he' ? 'He' : 'She', hes = he === 'he' ? 'he' : 'she', kids = id === 'michael';
  return `Paint a walking sheet of ${name} for a family role-playing game.

Picture 1 is the finished painting of the character, ${name}. Picture 2 is ${His} current walking sheet. Copy both as exactly as possible in every frame: the same person, face, age, body, hair, clothes, shoes, colors, painting style, level of detail, head size compared to the body and figure size. Use picture 2 for the layout, the figure size and the way the walking steps are drawn.${kids ? ' He carries his two young children, Lachlan and Isla, in every frame, exactly as in picture 2.' : ''}

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except a lifted foot mid-step), each figure well inside its cell with clear magenta margin, nothing touching a cell edge.${kids ? '' : ' Hands empty.'} No grid lines, numbers, text, effects or shadows. Clothing never uses magenta.

Row 1, facing the viewer:
1. Standing, feet together, arms at ${His} sides, a calm easy look.
2. A walking step, one foot forward, the opposite arm swinging forward.
3. The opposite step, the opposite arm swinging forward.

Row 2, seen from behind, walking away from the viewer, showing the full hair and the back of the outfit:
4. Standing, feet together.
5. A walking step, one foot forward, the opposite arm swinging forward.
6. The opposite step.

Row 3, in profile, facing the same way as the profile row of picture 2:
7. Standing, feet together.
8. A walking step, front heel down, back heel lifted, near arm back, far arm forward.
9. The passing step, back foot lifted with a bent knee, body a little higher.

${He} walks easily, never in a hurry: small relaxed steps, arms swinging a little. The two step frames of a row mirror each other. Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;
};
const entries = PEOPLE.map(p => ({ id: p[0] + '-walking-sheet', tab: 'Characters', title: p[1] + ' walking sheet 3 x 3 (replaces your painted sheet; copies ' + (p[2] === 'he' ? 'his' : 'her') + ' hero painting and current walk)', ar: '1:1',
  refs: [R + p[0] + '-hero-ref-v1.png', R + p[0] + '-walk-sheet-v1.png'], prompt: sheet(p) }));
module.exports = { entries };
