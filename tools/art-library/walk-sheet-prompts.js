// oldart1 (Tom 2026-11-11): the live entries in data/art-prompts.json reference only art the game uses now (newest heroes and walks, Tom's stance sheets, installed enemy sheets and plates, the house painting art/grands.webp for style). This builder may still name retired files (style key, underpaintings, hero-ref-v1, walk-sheet-v1, tom-battle-sheet); node tools/art-library/validate.js rejects them, so swap them per docs/CHANGES.md (oldart1) before splicing a new entry.
// Walking sheets for every playable person (Tom 2026-11-09 16:54: "i dont think i see the 3 walking sheet for Tom or others").
// Fact behind it: Tom's painted walk sheets were sent to Claude as files (art/raw/characters/<id>-walk-sheet-v1.png) and never had Library entries, so nothing could be generated or uploaded for them. Jojo's entry (jojo-prompts.js) was the only one.
// Same idea as battle-stance-prompts.js: the entry id is "<id>-walking-sheet" (NOT "-walk-sheet") so an approved picture saves as <id>-walking-sheet-v<n>.png and never overwrites Tom's painted original. Installing an approved replacement is a separate step (Claude rebakes from the approved file when Tom asks).
// Since 11-09 23:15 every person uses Tom's walk prompt (walk-prompt.js) with only the hero painting attached.
const R = 'art/raw/characters/';
// id, display name (he/she no longer used by the prompt)
const PEOPLE = [['tom', 'Tom', 'he'], ['tnb', 'TNB', 'he'], ['grace', 'Grace', 'she'], ['rose', 'Rose', 'she'], ['amy', 'Amy', 'she'],
  ['justin', 'Justin', 'he'], ['deedee', 'Deedee', 'she'], ['boppy', 'Boppy', 'he'], ['olivia', 'Olivia', 'she'], ['michael', 'Michael', 'he'], ['ellie', 'Aunt Ellie', 'she']];
const sheet = () => require('./walk-prompt.js').PROMPT;   // Tom's one walk prompt (walk-prompt.js); the hero painting is the only attachment

// Nara is a dog: her own wording, four legs, no person's sheet involved.
const naraSheet = `Paint a walking sheet of the dog Nara for a family role-playing game.

Picture 1 is the finished painting of the dog, Nara. Picture 2 is her current walking sheet. Copy both as exactly as possible in every frame: the same dog, face, brown curly coat, collar, colors, painting style, level of detail, head size compared to the body and figure size. Use picture 2 for the layout, the figure size and the way the walking steps are drawn.

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One dog per cell, the same size in every cell, paws on the same ground line (except a lifted paw mid-step), each dog well inside its cell with clear magenta margin, nothing touching a cell edge. Every dog is complete, never cropped. No grid lines, numbers, text, effects or shadows.

Row 1, facing the viewer:
1. Standing on all four paws, ears up, a happy easy look.
2. A walking step, one front paw forward.
3. The opposite step, the other front paw forward.

Row 2, seen from behind, walking away from the viewer:
4. Standing on all four paws.
5. A walking step, one hind paw forward.
6. The opposite step.

Row 3, in profile, facing the same way as the profile row of picture 2:
7. Standing on all four paws.
8. A walking step, near front paw forward, far hind paw forward.
9. The passing step, one paw lifted, body a little higher.

She walks easily and happily, tail up, never in a hurry. The two step frames of a row mirror each other. Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;
const entries = PEOPLE.map(p => ({ id: p[0] + '-walking-sheet', tab: 'Characters', title: p[1] + ' walking sheet 3 x 3 (walk prompt; copies the hero painting)', ar: '1:1',
  refs: [R + p[0] + '-hero-ref-v1.png'], prompt: sheet() }));
entries.push({ id: 'nara-walking-sheet', tab: 'Characters', title: 'Nara walking sheet 3 x 3 (replaces your painted sheet; copies her hero painting and current walk)', ar: '1:1', refs: [R + 'nara-hero-ref-v1.png', R + 'nara-walk-sheet-v1.png'], prompt: naraSheet });
module.exports = { entries };
