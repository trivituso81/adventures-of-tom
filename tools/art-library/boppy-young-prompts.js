// Young Boppy (Tom 2026-11-06 11:51): the Van Cortlandt Park '70 flashback needs its own character, not old Boppy.
// Canon: October 1970, about 20, college freshman, clean-shaven, full dark black hair, Italian American looking, skimpy vintage track
// uniform (tank top, short running shorts, socks, shoes), no cap, 5'7". No photo exists: aged down from the adult Boppy hero.
// Hero first; walk and battle sheets follow the approved-hero method (no left/right words). Not a recruit: flashback move only.
const R = 'art/raw/characters/';
const heroPrompt = `Paint one hero picture of a young man for a role-playing game. He is the same man as the older man in picture 1, shown as a college freshman about 45 years younger.

Picture 1 is a finished painting of the older man. Keep the family resemblance: the same face shape, jawline, long nose, brown eyes, eyebrow shape, ears and warm wry smile, the same slim build and the same head size compared to the body, the same painting style and level of detail. Make him a fit, lean twenty-year-old: smooth youthful skin without deep lines, a full thick head of dark black hair, clean-shaven with no mustache, no beard and no sideburns. He looks Italian American. Do not copy the older man's gray hair, white mustache, weathered skin or clothes.

OUTFIT: a skimpy vintage cross country track uniform from the early 1970s: a thin sleeveless tank top in a plain team color with a plain white stripe, very short running shorts with side slits, low white crew socks and old-fashioned flat running shoes. No cap, no hat, no number, no logo, no lettering.

ART STYLE
- A whimsical storybook illustration of a person, shown full body, painted by hand in a rich, dense, jewel-toned style with visible painted texture and fine, detailed brushwork, like picture 1. Gently simplified shapes.
- Adult caricature proportions with the head the same size compared to the body as the man in picture 1, a slim body, small hands and small feet, large expressive eyes and a warm, slightly exaggerated, cocky and cheerful expression.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp edges. No thick or black outlines.
- Painted and realistic, not pixel art, not photorealistic, not a 3D render, not anime, not flat cartoon shading.

ONE single image, one character, no grid, portrait orientation. Full body from head to feet, standing relaxed, body turned a little toward the viewer, a confident grin, face clear and readable, hands empty and relaxed at his sides, both feet flat and visible. A flat solid magenta #FF00FF background filling the whole image. No magenta anywhere on him, no glow or fringe in magenta. No text, no shadows on the ground, no props. Family friendly.`;

const walkPrompt = `Paint a walking sheet of one young man for a role-playing game.

Picture 1 is the finished painting of the character. Copy it as exactly as possible in every frame: the same person, face, black hair, clean-shaven face, tank top, shorts, socks, shoes, colors, painting style, level of detail, head size compared to the body and figure size. Picture 2 is the walking sheet of another character: copy only its layout, its figure size and its way of drawing walking steps, never the person.

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except a lifted foot mid-step), each figure well inside its cell with clear magenta margin, nothing touching a cell edge. Hands empty. No grid lines, numbers, text, effects or shadows. Clothing never uses magenta.

Row 1, facing the viewer:
1. Standing, feet together, arms at his sides, a confident easy grin.
2. A walking step, one foot forward, the opposite arm swinging forward.
3. The opposite step, the opposite arm swinging forward.

Row 2, seen from behind, walking away from the viewer, showing his full black hair and the back of his tank top:
4. Standing, feet together.
5. A walking step, one foot forward, the opposite arm swinging forward.
6. The opposite step.

Row 3, in profile, facing the same way as the profile row of picture 2:
7. Standing, feet together.
8. A walking step, front heel down, back heel lifted, near arm back, far arm forward.
9. The passing step, back foot lifted with a bent knee, body a little higher.

He walks with a light, springy runner's step: relaxed, arms swinging a little. The two step frames of a row mirror each other. Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

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
  { id: 'boppy-young-hero', tab: 'Characters', group: 'Boppy', title: 'Young Boppy hero pose (1970, about 20, 5\'7"; aged down from the Boppy hero; flashback only)', ar: '3:4',
    refs: [R + 'boppy-hero-ref-v1.png'], prompt: heroPrompt },
  { id: 'boppy-young-walk-sheet', tab: 'Characters', group: 'Boppy', title: 'Young Boppy walking sheet 3 x 3 (copies his approved hero; needs the hero approved)', ar: '1:1',
    refs: [R + 'boppy-young-hero-v1.png', R + 'boppy-walk-sheet-v1.png'], prompt: walkPrompt },
  { id: 'boppy-young-battle-sheet-1', tab: 'Characters', group: 'Boppy', title: 'Young Boppy battle sheet 1, 8 frames 4 x 2 (needs his hero and walk approved)', ar: '2:1',
    refs: [R + 'boppy-young-hero-v1.png', R + 'boppy-young-walk-sheet-v1.png', R + 'boppy-battle-sheet-1-v1.png'], prompt: battle1Prompt },
  { id: 'boppy-young-battle-sheet-2', tab: 'Characters', group: 'Boppy', title: 'Young Boppy battle sheet 2, 6 frames 3 x 2 (needs battle sheet 1 approved)', ar: '3:2',
    refs: [R + 'boppy-young-hero-v1.png', R + 'boppy-young-battle-sheet-1-v1.png'], prompt: battle2Prompt },
] };
