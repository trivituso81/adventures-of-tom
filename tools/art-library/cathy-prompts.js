// Ms. Cathy (Rose's sitter, adult, 5'4"). Tom 2026-11-12 08:05: "add Ms Cathy to character sheets so she appears for Rose's
// ability Ms Cathys Snack Attack". Tom's answers: height 5'4"; no photos, so her hero is painted from the canon description
// (about 60, shoulder-length blonde hair, glasses, teal dress). Three Characters entries, group "Ms. Cathy", in order:
// hero (description + 5 approved heroes for style and scale), walk sheet 3 x 3 (copies the hero), Snack Attack frames 3 x 2
// (copies hero and walk; Rose's approved move sheet gives the facing). The walk and move entries stay blocked in art.html until
// the pictures they attach exist. Spliced into data/art-prompts.json after the Jojo entries (oldart1: no full rebuild).
// Install when approved: bake her frames, replace the recolored-Deedee stand-in in engine/rose-moves.js (cathy(), drawCathy)
// and purge it (CLAUDE.md "Purge replaced files completely").
const R = 'art/raw/characters/';

const heroPrompt = `Paint a new character for a family role-playing game as one hero painting: a single full-body character picture. This picture becomes the reference for every other picture of this person in the game, so the details matter more than anything else.

THE PERSON
Ms. Cathy, a little girl's babysitter. A woman of about 60, 5 feet 4 inches tall, with a kind, cheerful, grandmotherly warmth and the look of someone who always comes prepared with snacks. Shoulder-length blonde hair, softly styled. Glasses. A teal dress. Simple comfortable flat shoes. Fair skin with the natural lines of her age around the eyes and mouth. No other accessories.

STYLE REFERENCES
The attached pictures are main characters of this game. Paint the new character by the same hand: the same painting style, texture, brushwork, light, level of detail, head size compared to the body and figure scale. Her head is the same size as the other adults' heads. Do not copy their faces, hair or clothes. Paint only the new character, alone.

ART STYLE
- A whimsical storybook illustration of a person, shown full body, painted by hand in a rich, dense, jewel-toned style with visible painted texture and fine, detailed brushwork. Gently simplified shapes. Slightly stylized features.
- Caricature proportions: an oversized head, a slim body, small hands and small feet, large expressive eyes behind the glasses and a warm, slightly exaggerated expression.
- Warm golden light from the upper left, a soft warm glow, a gentle rim light, deep saturated colors with rich contrast and fine surface texture.
- Clean, crisp edges with fine detail. No thick or black outlines.
- NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no limited color palette.

THE PICTURE (strict)
- One single image with one character and no grid. Portrait orientation, the biggest size you can make.
- Full body from the top of the head to the feet, all inside the frame with a little space around. Standing neutral and relaxed, the body turned a little (three-quarter) toward the viewer, a warm natural smile, the face clear and readable, hands empty and relaxed at the sides, both feet flat and fully visible.
- This is the highest-detail picture of the set: hair strands, glasses, skin, the fabric of the dress and the shoes all painted with care.
- Background: one flat solid pure magenta #FF00FF filling the whole image. The dress is teal, never magenta or pink. No magenta glow, tint or fringe on edges or hair. No ground shadow, no props, no other people, no text, no border.
- Family friendly for ages 6 and up.`;

const walkPrompt = `Paint a walking sheet of one woman for a role-playing game.

Picture 1 is the finished painting of the character. Copy it as exactly as possible in every frame: the same person, face, glasses, hair, clothes, colors, painting style, level of detail, head size compared to the body and figure size. Picture 2 is the walking sheet of another character: copy only its layout, its figure size and its way of drawing walking steps, never the person.

One image, a grid of 3 columns by 3 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line (except a lifted foot mid-step), each figure well inside its cell with clear magenta margin, nothing touching a cell edge. Hands empty. No grid lines, numbers, text, effects or shadows. Clothing never uses magenta.

Row 1, facing the viewer:
1. Standing, feet together, arms at her sides, a warm smile.
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

She walks briskly and cheerfully, a woman on her way with snacks: steady medium steps, arms swinging easily. The two step frames of a row mirror each other. Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

const abilityPrompt = `Draw the character in the attached pictures as one battle move sheet.

Picture 1 is the character. Picture 2 is her walk sheet. Picture 3 is a battle move sheet of another character, a little girl, calling for her. Copy picture 1 and picture 2 as exactly as possible in every frame: the same person, face, glasses, age, body, head size compared to the body, hair, clothes, colors, painting style, level of detail and figure size. From picture 3 copy only the viewing angle and which way the figure faces, never the person.

One image, a grid of 3 columns by 2 rows of equal square cells, on a flat solid magenta #FF00FF background. One figure per cell, the same size in every cell, feet on the same ground line, each figure well inside its cell. The tray and the treats she holds are painted in the same style as the character: a round silver tray piled with chocolate chip cookies, pink frosted cupcakes, sprinkled donuts and wrapped candies. Draw only her, no other people. No effects, no text.

In every frame she faces the same way as the girl does in picture 3, in the same three-quarter view, unless a frame says she looks at the viewer.

The move: a snack attack. She always comes prepared.

Row 1:
1. Standing, the full tray of treats balanced on one flat palm at shoulder height, the other hand on her hip, a warm, ready smile.
2. Wind-up: the tray steady in one hand, the other arm pulled back behind her shoulder holding a cookie, weight on the back foot, eyes bright.
3. Throw: the free arm swung fully forward, a cupcake just leaving her open fingers, front knee bent, mouth open in a cheerful call.

Row 2:
4. The tray lifted high overhead in one hand, the other fist raised, a big delighted laugh.
5. Looking at the viewer, the tray tucked under one arm, the other hand raised in a friendly goodbye wave, a loving smile.
6. Standing tall, the empty tray held against her hip, the other hand brushing crumbs off the front of her dress, a proud, satisfied smile.`;

module.exports = { entries: [
  { id: 'cathy-hero', tab: 'Characters', group: 'Ms. Cathy', title: 'Ms. Cathy hero painting: one full-body pose, painted from her description, 5 ft 4 (the reference for every other picture of Ms. Cathy)', ar: '2:3',
    refs: [R + 'deedee-hero-v1.png', R + 'ellie-hero-v1.png', R + 'amy-hero-v2.png', R + 'tom-hero-v2.png', R + 'rose-hero-v1.png'], prompt: heroPrompt },
  { id: 'cathy-walk-sheet', tab: 'Characters', group: 'Ms. Cathy', title: 'Ms. Cathy walking sheet 3 x 3 (copies her hero painting; needs the hero approved)', ar: '1:1',
    refs: [R + 'cathy-hero-v1.png', R + 'deedee-walking-sheet-v2.png'], prompt: walkPrompt },
  { id: 'cathy-ab-snack-attack', tab: 'Characters', group: 'Ms. Cathy', title: 'Ms. Cathy ability: Ms. Cathy\'s Snack Attack, her frames (6 frames; needs the hero and walk approved)', ar: '3:2',
    refs: [R + 'cathy-hero-v1.png', R + 'cathy-walk-sheet-v1.png', R + 'rose-ab-lamby-boomerang-v1.png'], prompt: abilityPrompt },
] };
