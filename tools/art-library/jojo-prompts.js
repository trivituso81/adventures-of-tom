// Jojo (TNB's sister, 5'6", adult). Tom 2026-11-06 11:19: she needs her own Characters entries, built from his photos.
// Hero: Tom adds his Jojo photos in the Library (own slots, kept on his device); pictures 1 and 2 are the photos, picture 3 is an
// approved painted adult for style and head size. Walk and ability follow the approved-hero method (no left/right words).
const R = 'art/raw/characters/';
const heroPrompt = `Paint one hero picture of a real woman for a role-playing game, from the attached photos.

Picture 1 is a full body photo of the real person. Picture 2 is a close-up photo of her face. Picture 3 is a finished painting of a different character: copy only its painting style, its level of detail and the size of its head compared to its body, never the person.

PHOTO FIDELITY
- The FACE must be a faithful likeness of picture 2: the exact face shape, jawline, cheeks, forehead, nose, lips, smile, eyebrows, eye shape and spacing, skin tone, and her glasses exactly as they are. Exaggerate only the head size and the expression, never the individual features. Do not beautify, slim, age up or age down the face.
- The HAIR must match the photos exactly: color, length, parting, volume, texture and how it falls.
- The BODY must match picture 1: build, shoulder width, arm and leg proportions, posture. Caricature only by enlarging the head and shrinking the hands and feet slightly.
- The OUTFIT and shoes must match picture 1 exactly: every color, print, pattern, trim and seam. Do not simplify or invent clothing details. If something is not visible, extend it plausibly. Never invent an accessory.
- If the two photos disagree, picture 2 decides the face and picture 1 decides the body and outfit.
- Do not copy the photo background, shadows or lighting color cast. Only the person.

ART STYLE
- A whimsical storybook illustration of a real person, shown full body, painted by hand in a rich, dense, jewel-toned style with visible painted texture and fine, detailed brushwork, like picture 3. Gently simplified shapes. Slightly stylized features that keep a clear likeness.
- Adult caricature proportions with the head the same size compared to the body as the adult in picture 3, a slim body, small hands and small feet, large expressive eyes and a warm, slightly exaggerated expression.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp edges. No thick or black outlines.
- Painted and realistic, not pixel art, not photorealistic, not a 3D render, not anime, not flat cartoon shading.

ONE single image, one character, no grid, portrait orientation. Full body from head to feet, standing relaxed, body turned a little toward the viewer, a warm natural smile, face clear and readable, hands empty and relaxed at her sides, both feet flat and visible. A flat solid magenta #FF00FF background filling the whole image. No magenta anywhere on her, no glow or fringe in magenta. No text, no shadows on the ground, no props. Family friendly.`;

const walkPrompt = `Paint a walking sheet of one woman for a role-playing game.

Picture 1 is the finished painting of the character. Copy it as exactly as possible in every frame: the same person, face, glasses, hair, clothes, colors, painting style, level of detail, head size compared to the body and figure size. Picture 2 is the walking sheet of another character: copy only its layout, its figure size and its way of drawing walking steps, never the person.

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except a lifted foot mid-step), each figure well inside its cell with clear magenta margin, nothing touching a cell edge. Hands empty. No grid lines, numbers, text, effects or shadows. Clothing never uses magenta.

Row 1, facing the viewer:
1. Standing, feet together, arms at her sides, a calm easy smile.
2. A walking step, one foot forward, the opposite arm swinging forward.
3. The opposite step, the opposite arm swinging forward.

Row 2, seen from behind, walking away from the viewer, showing her full hair and the back of her outfit:
4. Standing, feet together.
5. A walking step, one foot forward, the opposite arm swinging forward.
6. The opposite step.

Row 3, in profile, facing the same way as the profile row of picture 2:
7. Standing, feet together.
8. A walking step, front heel down, back heel lifted, near arm back, far arm forward.
9. The passing step, back foot lifted with a bent knee, body a little higher.

She walks slowly and easily, never in a hurry: small relaxed steps, arms swinging a little. The two step frames of a row mirror each other. Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

const abilityPrompt = `Draw the character in the attached pictures as one battle move sheet.

Picture 1 is the character. Picture 2 is her walk sheet. Picture 3 is a battle move sheet of another character, TNB, throwing a flying disc to her. Copy picture 1 and picture 2 as exactly as possible in every frame: the same person, face, glasses, age, body, head size compared to the body, hair, clothes, colors, painting style, level of detail and figure size. From picture 3 copy only the viewing angle, the figure size and the feet on one ground line, never the person.

One image, a grid of 3 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except when she is in the air), each figure well inside its cell. A held flying disc is painted in the same style as the character, white with a thin colored rim. Draw only her, no other people.

In every frame she faces the same way as TNB does in picture 3, in the same three-quarter view, unless a frame says she looks at the viewer.

The move: Frisbee Golf. She is in no hurry, ever.

Row 1:
1. Standing, turning toward someone off to the side, one hand lifted in a small easy wave, relaxed.
2. Jogging backwards with long easy steps, eyes up on something flying toward her, both hands rising to catch.
3. Leaping off the ground, one arm stretched up high with the fingers open, eyes on the disc, mouth open.

Row 2:
4. Landing, the disc caught in one hand held close to her face, a big surprised grin.
5. Hopping with joy, the disc held high in one raised hand, the other fist pumped, a big laugh.
6. Standing relaxed, the disc tucked under one arm, the other hand giving a calm thumbs up, a small satisfied smile.`;

module.exports = { entries: [
  { id: 'jojo-hero', tab: 'Characters', group: 'Jojo', title: 'Jojo hero pose (5\'6"; add her full body photo and a face close-up first; copies a painted adult for style and head size)', ar: '3:4',
    own: [{ slot: 'jojo-photo-body', label: 'Jojo full body photo', at: 0 }, { slot: 'jojo-photo-face', label: 'Jojo face close-up', at: 1 }],
    refs: [R + 'justin-hero-ref-v1.png'], prompt: heroPrompt },
  { id: 'jojo-walk-sheet', tab: 'Characters', group: 'Jojo', title: 'Jojo walking sheet 3 x 3 (copies her approved hero; needs the hero approved)', ar: '1:1',
    refs: [R + 'jojo-hero-v1.png', R + 'justin-walk-sheet-v1.png'], prompt: walkPrompt },
  { id: 'jojo-ab-round-with-jojo', tab: 'Characters', group: 'Jojo', title: 'Jojo ability: Frisbee Golf, her frames (6 frames; needs her hero and walk approved)', ar: '3:2',
    refs: [R + 'jojo-hero-v1.png', R + 'jojo-walk-sheet-v1.png', R + 'tnb-ab-round-with-jojo-v1.png'], prompt: abilityPrompt },
] };
