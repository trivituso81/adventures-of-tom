// oldart1 (Tom 2026-11-11): the live entries in data/art-prompts.json reference only art the game uses now (newest heroes and walks, Tom's stance sheets, installed enemy sheets and plates, the house painting art/grands.webp for style). This builder may still name retired files (style key, underpaintings, hero-ref-v1, walk-sheet-v1, tom-battle-sheet); node tools/art-library/validate.js rejects them, so swap them per docs/CHANGES.md (oldart1) before splicing a new entry.
// Young Boppy (Tom 2026-11-06 11:51): the Van Cortlandt Park '70 flashback needs its own character, not old Boppy.
// Canon: October 1970, about 20, college freshman, clean-shaven, full dark black hair, Italian American looking, skimpy vintage track
// uniform (tank top, short running shorts, socks, shoes), no cap, 5'7". No photo exists: aged down from the adult Boppy hero.
// Hero: Tom painted it himself (art/raw/characters/boppy-young-hero-ref-v1.png), so there is no hero entry. Walk sheet: Tom made it too (boppy-young-walk-sheet-ref-v1.png), so no walk entry. Battle sheets follow the approved-hero method (no left/right words). Not a recruit: flashback move only.
const R = 'art/raw/characters/';
const battle1Prompt = `Draw one battle sheet of the character in the attached pictures, for a family role-playing game.

Picture 1 is the character. Picture 2 is his walk sheet. Picture 3 is a battle sheet of a different character: copy only its grid layout, its viewing angle (a three-quarter view from slightly above, facing an opponent), its figure size and its feet on one ground line, never the person. Copy picture 1 and picture 2 as exactly as possible in every frame: the same person, face, black hair, clean-shaven face, tank top, shorts, socks, shoes, colors, painting style, level of detail and head size compared to the body.

One image, a grid of 4 columns by 2 rows of equal square cells (8 frames, numbered left to right, top to bottom), on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on one ground line, each figure well inside its cell with clear magenta margin. In every frame he faces the same way as the character in picture 3. No grid lines, numbers, text, effects, shadows or props. Hands empty. Clothing never uses magenta.

1. Ready stance, feet shoulder width apart, knees slightly bent, hands loose, a cocky friendly look.
2. The same stance a moment later, chest risen with a breath, shoulders a little higher, one hand relaxed open.
3. Standing tall, both hands on his hips, chin lifted, a playful unimpressed look.
4. One arm stretched toward the opponent, palm up, presenting something, a small proud smile.
5. Body twisted away from the opponent, arm pulled back, weight on the back leg, eyes narrowed, about to spring.
6. Lunging far forward toward the opponent, arm at full reach, front knee bent, mouth open in a shout.
7. Feet planted, both arms flung wide, chest out, chin up, announcing something big.
8. Crouched low, forearms crossed in front of the chest and face, chin tucked, determined.

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

const battle2Prompt = `Draw a second battle sheet of the character in the attached pictures, for a family role-playing game.

Picture 1 is the character. Picture 2 is his first battle sheet: this sheet must look like it was painted at the same time, with the same viewing angle, the same figure size, the same feet ground line and the same head size compared to the body. Copy the person exactly: the same face, black hair, clean-shaven face, tank top, shorts, socks, shoes, colors, painting style and level of detail.

One image, a grid of 3 columns by 2 rows of equal square cells (6 frames, numbered left to right, top to bottom), on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on one ground line (except when he is in the air), each figure well inside its cell with clear magenta margin. In every frame he faces the same way as in picture 2. No grid lines, numbers, text, effects, shadows or props. Hands empty. Clothing never uses magenta.

1. Startled flinch: body leaning back, head pulled back, eyes squeezed shut, one foot lifted off the ground.
2. Tired: down on one knee, one hand resting on the knee, head lowered, out of breath, a weary but determined face.
3. Napping: sitting slumped on the ground with legs stretched out in front, leaning back on one hand, head tilted, eyes closed, dizzy and sleepy.
4. Cheering: one fist pumped high, the other hand on the hip, a big grin.
5. Cheering: both fists overhead, laughing, up on the toes.
6. Signature pose: arms crossed over his chest, chin up, one foot forward, a cocky champion grin, like a runner who just won.

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

module.exports = { entries: [
  { id: 'boppy-young-battle-sheet-1', tab: 'Characters', group: 'Boppy', title: 'Young Boppy battle sheet 1, 8 frames 4 x 2 (copies Tom\'s painted hero and walk sheet)', ar: '2:1',
    refs: [R + 'boppy-young-hero-ref-v1.png', R + 'boppy-young-walk-sheet-ref-v1.png', R + 'boppy-battle-sheet-1-v1.png'], prompt: battle1Prompt },
  { id: 'boppy-young-battle-sheet-2', tab: 'Characters', group: 'Boppy', title: 'Young Boppy battle sheet 2, 6 frames 3 x 2 (needs battle sheet 1 approved)', ar: '3:2',
    refs: [R + 'boppy-young-hero-ref-v1.png', R + 'boppy-young-battle-sheet-1-v2.png'], prompt: battle2Prompt },
] };
