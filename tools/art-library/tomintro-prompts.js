// Chapter 1 opening and every arrival: the pictures the intro plays that had no Art Library entry (Tom 2026-11-12 21:42:
// "where is the art gallery stuff for Tom crouching and hugging the girls" and "the whole intro should use the newest art").
// Required by make-prompts.js. Group "Tom" in the Characters tab, four entries.
// 1, 2 and the kneel are Tom's approved pictures, already baked into the game (bake_story_poses.py set `hug`): stored approved with the existing file as the version,
//   no `bake` field, so Generate or approve cannot replace live art by itself.
// 3 is NEW and a draft: the six shoulder-ride frames of the opening (kneel, lift, cheer, laugh, hop off, sit). They are still baked from the old sheet
//   tomride-poses-v2.png (set `tomride`), which shows the older Tom. This entry is drawn from the newer approved ride picture tomride-title-v1.png.
const R = 'art/raw/characters/';
const TOM = R + 'tom-hero-v2.png', GRACE = R + 'grace-hero-v1.png', ROSE = R + 'rose-hero-v1.png';
const RIDE_NEW = R + 'tomride-title-v1.png';

const STYLE = `Copy the attached pictures as exactly as possible in every frame: the same people, faces, hair, beard, clothes, shoes, colors, linework, painting style, level of detail and head size compared to the body. Only the poses change. Do not redesign anything.`;
const BG = `Background: one flat solid magenta #FF00FF filling the whole image. No magenta anywhere on the characters: pink shoes stay clearly pink. No grid lines, borders, numbers, labels, text, shadows, dust, motion lines, sparkles or glow effects. Nothing touches a cell edge. Family friendly.`;

const entries = [
  {
    id: 'tom-greeting-crouch', tab: 'Characters', group: 'Tom',
    title: 'Tom greeting crouch: Tom alone in profile, crouched with his arms open (your approved picture, already in the game)',
    ar: '1:1', refs: [TOM],
    prompt: `Draw the man in the attached picture crouching to greet children who run toward him.

${STYLE}

ONE large picture of him alone, not a grid. A side view: his body in profile and his face turned in a three-quarter view toward the viewer, looking at the children who are just outside the picture on the side he faces. He crouches low on bent knees with his feet flat, leaning forward, both arms stretched wide open in front of him with open palms, a huge delighted smile. Full body from his hair to the soles of his shoes, centered, filling about 80 percent of the picture height.

${BG}`,
  },
  {
    id: 'tom-greeting-kneel', tab: 'Characters', group: 'Tom',
    title: 'Tom greeting kneel: Tom alone on one knee with his arms open wide (your picture, already in the game)',
    ar: '1:1', refs: [TOM],
    prompt: `Draw the man in the attached picture kneeling to welcome children who run toward him.

${STYLE}

ONE large picture of him alone, not a grid. A side view: his body turned to one side and his face turned in a three-quarter view toward the viewer, looking at the children who are just outside the picture on the side he faces. He kneels on one knee with the other foot flat on the ground, leaning forward, both arms stretched wide open with open palms, a huge delighted smile. Full body from his hair to the soles of his shoes, centered, filling about 80 percent of the picture height.

${BG}`,
  },
  {
    id: 'tom-grace-rose-greeting-hug', tab: 'Characters', group: 'Tom',
    title: 'Greeting hug sheet: Tom hears the girls, crouches, Grace and Rose run in and hug him (8 frames, 4 x 2; your approved sheet, already in the game)',
    ar: '2:1', refs: [TOM, GRACE, ROSE],
    prompt: `Draw Tom (first attached picture), Grace (second) and Rose (third) as a greeting pose sheet. Grace is the older girl and Rose the little one; keep the size difference between all three exactly as in the pictures.

${STYLE}

One image, a grid of 4 columns by 2 rows of equal square cells (8 frames, numbered left to right, top to bottom), the same scale in every cell, feet on the same ground line in every cell.

1. Hearing them. Tom alone, standing, eyebrows raised, head lifted as if he just heard his name called.
2. Delighted. Tom alone, a huge smile, arms starting to open.
3. Crouching. Tom alone, crouched low, arms wide open.
4. Girls running in. Tom crouched with arms open, Grace running in on one side and Rose on the other, both beaming.
5. Crash hug. Both girls throw their arms around Tom at once.
6. Group hug. The three of them in one tight hug, eyes closed, big smiles.
7. Squeeze. The same hug, Rose's feet just off the ground.
8. Looking up. A loose hug, all three looking at each other, laughing.

${BG}`,
  },
  {
    id: 'tomride-intro', tab: 'Characters', group: 'Tom and Rose ride',
    title: 'Tom carries Rose: the opening scene, kneel, lift, cheer, laugh, hop off, sit (6 frames, 3 x 2; redo of the old ride poses in the chapter 1 opening)',
    ar: '3:2', refs: [RIDE_NEW, TOM, ROSE],
    prompt: `Draw a pose sheet of Tom and his little niece Rose for the scene where she climbs onto his shoulders.

Picture 1 is the approved picture of Tom carrying Rose on his shoulders. Picture 2 is Tom. Picture 3 is Rose.
${STYLE} Rose is a small child, much smaller than Tom, and keeps the same size difference in every frame.

One image, a grid of 3 columns by 2 rows of equal tall cells (6 frames, numbered left to right, top to bottom), the same scale in every cell, Tom's soles on one ground line in every cell. In every frame the bodies and both faces point toward the viewer; a slight turn is fine. Rose's two shoes always show.

Row 1:
1. KNEEL. Tom kneels on one knee and leans forward slightly with a warm smile, hands gripping Rose's ankles. Rose is already seated on his shoulders, hands on top of his head, a happy little smile.
2. LIFT. Tom half way up from a deep squat, back straight, feet wide, hands gripping Rose's ankles, face straining slightly but smiling. Rose seated on his shoulders, mouth open in an excited gasp, hands on his head.
3. CHEER. Tom standing tall, feet apart, hands holding Rose's ankles, a proud grin. Rose seated on his shoulders with both arms thrown straight up, eyes squeezed shut, mouth wide open, cheering.

Row 2:
4. LAUGH. Tom standing and holding Rose at his side by her waist, her legs dangling, both of them laughing, Tom's head tipped toward her, Rose's head thrown back.
5. HOP OFF. Tom in a half crouch, both hands out open at his sides to catch her, grinning up. Rose already in the air above him, springing off his shoulders, both arms flung wide, a delighted open-mouth smile, one shoe lifted.
6. SIT. Tom standing straight, hands holding Rose's ankles, a dry half smile with one eyebrow slightly raised. Rose seated on his shoulders, hands resting on top of his head, a pleased small smile.

Rose sits on the back of Tom's shoulders behind his head, one leg down each side of his neck, her lower legs on the front of his chest, never in front of his face.
${BG} No other figures or objects.`,
  },
];
module.exports = { entries };
