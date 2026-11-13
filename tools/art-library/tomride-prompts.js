// Tom carrying Rose on his shoulders: the frames the game still lacks (Tom 2026-11-12 17:07: "add them as a new character entry").
// Required by make-prompts.js. Group "Tom and Rose ride" in the Characters tab. Five entries, 29 frames, one Generate press each.
// What exists already: art/raw/characters/tomride-poses-v2.png (12 cells: climb on, stand up, tallest, hop down, jump on, ready, startled, tired, run A, run B, defend, proud), installed in `ride1` (CHANGES 322).
// What these add (CHANGES 322 "Kept old, no new picture exists"): Press Start (4), the toss off the shoulders (5), the four Tombo ride poses (7), the overworld walk with Rose up (12), the title pose (1).
// Source text: claude/tom-ride-prompts.txt sheets 3 to 7 (Tom 2026-11-01), rewritten for the Library: no left or right words (facing is copied from the attached ride sheet),
// no head pixel numbers (head sizes, scale and outfits are copied from the attached approved ride sheet, which carries Tom's NES tee outfit), no banned style words.
// Picture 1 of every entry is the approved ride sheet: it locks faces, outfits, head sizes, figure scale, the painted look and the viewing angle.
const R = 'art/raw/characters/';
const RIDE = R + 'tomride-poses-v2.png';
const TOM = R + 'tom-hero-v2.png';
const ROSE = R + 'rose-hero-v1.png';
const TOMWALK = R + 'tom-walking-sheet-v3.png';
const ROSEWALK = R + 'rose-walking-sheet-v2.png';

// Shared header. `extra` is the entry-specific picture description; `grid` the layout sentence.
function head(pics, grid, view) {
  return `Draw a pose sheet for a family role-playing game: Tom carrying his niece Rose on his shoulders, in the same hand-painted caricature style as the attached pictures.

${pics}
Copy them as exactly as possible in every frame: the same two people, faces, hair, beard, clothes, shoes, colors, painting style, level of detail, head size compared to the body, and the same size difference between Tom and Rose. Rose is a small child and is much smaller than Tom. Only the poses (and the objects a frame names) change. Do not redesign anything about either of them.

${grid}
Background: one flat solid magenta #FF00FF filling the whole image. No magenta anywhere on the characters or objects: pink shoes stay clearly pink. No grid lines, borders, numbers, labels, text, word balloons, shadows, dust, motion lines, sparkles or glow effects. Every figure is full body, from the top of the head to the soles of the shoes, well inside its cell with clear magenta margin; nothing touches a cell edge. Tom's soles rest on one ground line in every cell and the figures are the same size in every cell (never rescale a figure to fit a pose, and never change a head size).
${view}
Whenever Rose is on Tom's shoulders: she sits on the back of his shoulders behind his head, one leg down each side of his neck, her lower legs resting on the front of his chest, never in front of his face. Tom's hands hold her ankles and her hands rest on top of his head, unless the frame says otherwise. Both faces are fully visible unless the frame says seen from behind. Both heads turn the same way. Objects are painted in the same style, generic, with no brand names, no logos and no readable letters, and appear only in the frames that name them.`;
}

const TAIL = `

Do not add frames, merge frames, repeat a pose or invent props. Family friendly.`;

const FACE_REF = 'In every frame Tom and Rose face the same way as the figures in the second and third rows of picture 1 (a three-quarter view from slightly above, toward an off-screen opponent), unless a frame says otherwise.';

const entries = [
  {
    id: 'tomride-press-start', tab: 'Characters', group: 'Tom and Rose ride',
    title: 'Tom carries Rose: Press Start poses (4 frames, 4 x 1)', ar: '2:1', refs: [RIDE, TOM, ROSE],
    prompt: head(
      'Picture 1 is the approved ride sheet of Tom carrying Rose on his shoulders. Picture 2 is Tom. Picture 3 is Rose.',
      'One image, a grid of 4 columns by 1 row of equal tall cells (4 frames, numbered left to right).',
      FACE_REF) + `

The poses (Tom holds a classic game controller, cream-gray body, a plus-shaped D-pad on one side, one red button and one mustard yellow button on the other):
1. HOLD: Tom standing, both hands in front of his chest gripping the controller, thumbs on the buttons, head tilted down at it, a tense focused squint. Rose leans far over the top of his head to watch the controller, both hands on his head, eyes huge and eager.
2. ANNOYED: the same stance, one arm stretched forward holding the same controller out at arm's length by its middle, the other hand on his hip, head tipped back, a flat deadpan stare of disbelief. Rose points a finger at the controller helpfully, her other hand holding his head, a cheerful bossy look.
3. THROW WIND-UP: Tom's body twisted away from the opponent, throwing arm cocked far back with the controller gripped like a baseball, weight on the back leg, eyes narrowed at a target. Rose leans back with the wind-up, both arms wrapped tight around the top of his head, eyes wide and thrilled.
4. THROW FOLLOW-THROUGH: Tom lunging far forward toward the target, throwing arm at full extension with an empty open hand (the controller has just left it), back leg trailing, mouth open in a shout. Rose leans forward with the lunge, both arms up, mouth wide open in a delighted whee.` + TAIL
  },
  {
    id: 'tomride-toss', tab: 'Characters', group: 'Tom and Rose ride',
    title: 'Tom helps Rose off his shoulders: the gymnastics toss (5 frames, 3 x 2; frames 4 and 5 are Rose alone)', ar: '3:2', refs: [RIDE, TOM, ROSE],
    prompt: head(
      'Picture 1 is the approved ride sheet of Tom carrying Rose on his shoulders. Picture 2 is Tom. Picture 3 is Rose.',
      'One image, a grid of 3 columns by 2 rows of equal tall cells (5 frames, numbered left to right, top to bottom; the sixth cell stays empty magenta).',
      FACE_REF + ' Rose alone (frames 4 and 5) is drawn at her own standing size from picture 3, her head the same size as on picture 1.') + `

The move: a playful trick. Tom helps Rose off his shoulders like a gymnastics assist. He holds her at her sides, lifts her overhead, and she springs off with a happy somersault and lands neatly on her feet, laughing. Everyone is safe and having fun. Frames 1 to 3 show both of them; frames 4 and 5 show Rose alone, with no Tom in the cell.
1. GRAB: Tom, with Rose seated on his shoulders as in the ride, reaches both hands up and holds her securely at her sides, elbows bent, knees bending to get ready, a dry focused look. Rose, giggling, arms lifting up, ready for the trick.
2. LIFT: Tom standing tall, both arms straight overhead holding Rose up high at her sides like a gymnastics assist, her legs dangling, Tom with a proud amused grin. Rose delighted, mouth wide open in a laugh, arms up, looking down at him.
3. LAUNCH: a playful hop-off. Tom's arms swing up and forward toward the opponent, hands open and EMPTY just beneath her, weight on the front foot, a cheerful shout. Rose springs off his hands with a happy leap, only just above them, body curled forward, arms out, a delighted laugh.
4. ROSE IN THE AIR (Rose alone): a playful gymnastics somersault, tucked forward in a half flip, arms and legs loose, hair flying, laughing, eyes open and happy. Centered in the cell.
5. ROSE LANDS (Rose alone): landing on both feet, knees deeply bent, arms flung out wide for balance, a huge proud ta-da grin. Her soles rest on the same ground line as Tom's feet in frames 1 to 3.` + TAIL
  },
  {
    id: 'tomride-combo', tab: 'Characters', group: 'Tom and Rose ride',
    title: 'Tom carries Rose: team-move poses, airplane, boop, clouds, headphones, night-light (7 frames, 4 x 2)', ar: '2:1', refs: [RIDE, TOM, ROSE],
    prompt: head(
      'Picture 1 is the approved ride sheet of Tom carrying Rose on his shoulders. Picture 2 is Tom. Picture 3 is Rose.',
      'One image, a grid of 4 columns by 2 rows of equal tall cells (7 frames, numbered left to right, top to bottom; the eighth cell stays empty magenta).',
      FACE_REF) + `

These frames serve four team moves: a biplane (frames 1 to 4), looking at clouds (5), listening to music in the dark (6) and holding up a night-light (7). Goggles, headphones and the toy lamb are painted only in the frames that name them.
1. HOIST: Tom lifting Rose up from the ground to put her on his shoulders: both hands under her arms, her feet just off the ground and her legs dangling at about the height of his chest, Tom's arms rising, a strained happy grin. Rose small and delighted, arms up, looking up toward his shoulders.
2. AIRPLANE LEVEL: Tom is the lower wing of a biplane and Rose the upper wing. Tom's arms stretched straight out to both sides at shoulder height, palms down, leaning forward slightly, a determined grin. Rose seated on his shoulders with her arms straight out to both sides too, chin up, delighted. Both wear aviator goggles (round brown-rimmed lenses with a leather strap) pushed up over their eyes, their faces still clearly visible.
3. AIRPLANE BANKED: the same airplane pose, the whole pair banking into a turn, bodies tilting about 20 degrees to one side, one of Tom's arms angled down and the other up, Rose's arms matching, both laughing, goggles on.
4. BOOP: Rose leaning way forward and down off Tom's shoulder toward the opponent, one arm stretched out with a single index finger extended to boop something just in front of Tom's face (nothing is painted there), her face scrunched in glee. Tom braced with both hands holding her ankles and leaning back to balance, eyebrows raised, dry amusement. No goggles.
5. CLOUD LOOK: Tom with his head tilted back looking up toward the opponent's side of the cell, one arm pointing up with a finger, the other hand holding Rose's ankle, a smug certain look. Rose seated, pointing up the same way with her whole arm, mouth open, eyes sparkling, her other hand holding his head.
6. HEADPHONES: Rose seated with big silver over-ear headphones on her head, both hands pressed on the ear cups, eyes closed, a blissful smile, swaying slightly. Tom's head tilted back slightly toward her, eyes soft, a warm quiet smile, both hands holding her ankles. Tom wears no headphones.
7. NIGHT-LIGHT: Tom with one arm stretched straight up holding a small plush toy lamb (cream curly wool, pink inner ears, big button eyes, a tiny pink bow tie) high overhead like a lantern, the other hand holding Rose's ankle, looking up at it proudly. Rose seated with both arms wrapped around Tom's head, looking up at the lamb, a sleepy trusting smile.` + TAIL
  },
  {
    id: 'tomride-walk', tab: 'Characters', group: 'Tom and Rose ride',
    title: 'Tom carries Rose: overworld walk, down, up and side, 4 frames each (12 frames, 4 x 3)', ar: '2:3', refs: [RIDE, TOM, ROSE, TOMWALK, ROSEWALK],
    prompt: head(
      'Picture 1 is the approved ride sheet of Tom carrying Rose on his shoulders. Picture 2 is Tom. Picture 3 is Rose. Picture 4 is Tom\'s walk sheet and picture 5 is Rose\'s walk sheet: use them for how each of them looks while walking, and for the walking head size (slightly smaller compared to the body than on the battle poses in picture 1).',
      'One image, a grid of 4 columns by 3 rows of equal tall cells (12 frames, numbered left to right, top to bottom). The walk is gentle: small steps, small bounces, no big arm swings. In every frame Rose faces the same way as Tom.',
      'Rows 1 and 2 show Tom\'s body flat to the viewer (row 1 facing the viewer, row 2 seen from behind). Row 3 is a true side view, like a character walking across a town map, with both of them facing the same edge of the picture as the figures in the second and third rows of picture 1. Faces are visible in rows 1 and 3. In row 2 nobody\'s face shows, so keep the hair, clothes and head shapes exactly like the pictures.') + `

Row 1, facing the viewer:
1. STAND: Tom facing the viewer straight on, standing, hands holding Rose's ankles. Rose seated, facing the viewer, hands on top of his head, a happy little smile.
2. STEP 1: walking toward the viewer, one foot forward, body slightly lower, Rose bobbing a touch to one side.
3. PASSING: the moment between steps, Tom's feet together, body slightly higher, Rose upright.
4. STEP 2: the opposite step, the other foot forward, Rose bobbing a touch to the other side.

Row 2, seen from behind, walking away from the viewer (Tom's back and the back of his head; Rose's back and the back of her head and hair, her hands on top of his head):
5. STAND: standing, hands holding Rose's ankles at his sides.
6. STEP 1: one foot forward, Rose bobbing a touch to one side.
7. PASSING: feet together, body slightly higher.
8. STEP 2: the opposite step, the other foot forward, Rose bobbing a touch to the other side.

Row 3, side view:
9. STAND: Tom in profile, standing, hands holding Rose's ankles. Rose seated in profile, hands on top of his head, a happy little smile.
10. STEP 1: Tom walking, the near foot forward, Rose bobbing slightly.
11. PASSING: feet together, body slightly higher, Rose upright.
12. STEP 2: the opposite step, the back foot passing forward, Rose bobbing slightly the other way.` + TAIL
  },
  {
    id: 'tomride-title', tab: 'Characters', group: 'Tom and Rose ride',
    title: 'Tom carries Rose: title pose, one large picture, Rose waving', ar: '2:3', refs: [RIDE, TOM, ROSE],
    prompt: head(
      'Picture 1 is the approved ride sheet of Tom carrying Rose on his shoulders. Picture 2 is Tom. Picture 3 is Rose.',
      'ONE large portrait picture, not a grid. The pair is centered, drawn large and clear, from the soles of Tom\'s shoes to the top of Rose\'s head filling about 85 percent of the picture height, with clear magenta margin on every side. The head sizes keep the same proportions to the bodies as in picture 1.',
      'Both faces look toward the viewer (a slight turn is fine).') + `

The pose: Tom standing tall, full body, body turned slightly toward the opponent's side but his face and eyes looking out at the viewer, a warm dry half smile with one eyebrow a little raised, hands holding Rose's ankles. Rose seated on his shoulders, face toward the viewer, one arm raised high in a big wave, the other hand resting on top of Tom's head, a huge happy grin, her shoes resting on his chest.

Do not add figures or props. Family friendly.`
  },
];

module.exports = { entries };
