// Art asked for in Tom's in-game reports of 2026-11-14 (ch2fix1). Required by make-prompts.js (group "Report fixes").
// Every prompt is self-contained (no fill-in fields). Per-character info comes from the attached approved pictures.
// Install notes for each entry are in docs/CHANGES.md "ch2fix1b" and claude/next-addendum-ch2fix1.md.

const ART = `ART STYLE
- Painted by hand in the style of the attached paintings: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges, realistic caricature proportions (a large head on a slim body, as in the attachments).
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT anime, NOT flat cartoon shading. No pixelation, no dithering, no glossy plastic look.
- Warm golden light from the upper left, soft shadow falling to the lower right.
- Family friendly for children aged 6 and up.`;

const MAGENTA = 'Background: one flat solid color, pure magenta #FF00FF, edge to edge, with no gradient, no floor, no shadow shape and no magenta anywhere on the figure. The game cuts the figure out of this color.';

// One full-body pose of a person, copied from their approved pictures.
function pose(who, refs, what, keep) {
  return `IMAGE REQUEST: ONE SINGLE PAINTING. Return exactly one image, nothing else. Generate it now. Do not make a plan, a sheet or several poses.

ATTACHED IMAGES
${refs.map((r, i) => `${i + 1}) ${r}`).join('\n')}

PAINT THIS ONE POSE
${who}, alone, standing, full body from the top of the head to the shoes, facing the viewer at a slight three-quarter angle. ${what}
- Keep the face, hair, build, age, clothes and colors exactly as in the attachments.${keep ? ' ' + keep : ''}
- The figure fills about 85 percent of the picture height, centered, with an even empty margin all round.
- ${MAGENTA}
- No words, letters or numbers anywhere.

${ART}`;
}

const HERO = n => `The approved full-body hero painting of ${n} from "The Adventures of Tom", a family role-playing game. This is exactly how ${n} looks.`;
const TALK = n => `The approved talking sheet of ${n}, for the size of the head against the body and the painted finish.`;
const NPC = n => `The approved painting of ${n}, a neighbour in "The Adventures of Tom", a family role-playing game. This is exactly how ${n} looks.`;

const CAST = [
  ['tom', 'Tom', 'art/raw/characters/tom-hero-ref-v1.png', 'art/raw/characters/tom-talk-v2.png'],
  ['tnb', 'TNB', 'art/raw/characters/tnb-hero-ref-v1.png', 'art/raw/characters/tnb-talk-v2.png'],
  ['grace', 'Grace', 'art/raw/characters/grace-hero-ref-v1.png', 'art/raw/characters/grace-talk-v2.png'],
  ['rose', 'Rose', 'art/raw/characters/rose-hero-ref-v1.png', 'art/raw/characters/rose-talk-v2.png'],
  ['deedee', 'Deedee', 'art/raw/characters/deedee-hero-ref-v1.png', 'art/raw/characters/deedee-talk-v4.png'],
  ['boppy', 'Boppy', 'art/raw/characters/boppy-hero-ref-v1.png', 'art/raw/characters/boppy-talk-v3.png'],
  ['amy', 'Amy', 'art/raw/characters/amy-hero-ref-v1.png', 'art/raw/characters/amy-talk-v1.png'],
  ['justin', 'Justin', 'art/raw/characters/justin-hero-ref-v1.png', 'art/raw/characters/justin-talk-v1.png'],
  ['ellie', 'Aunt Ellie', 'art/raw/characters/ellie-hero-ref-v1.png', 'art/raw/characters/ellie-talk-v1.png'],
  ['olivia', 'Olivia', 'art/raw/characters/olivia-hero-ref-v1.png', 'art/raw/characters/olivia-talk-v1.png'],
];

const entries = [
  // r-20261114-100555-mxvd: the heist frames are a cute cartoon blob with a sprout; they must be the Mudling of the fights.
  { id: 'ch1-mudling-heist', tab: 'Enemies', group: 'Report fixes', ar: '1:1', refs: ['art/raw/enemies/enemy-mudling-v2.png', 'art/raw/enemies/enemy-grump-v3.png'],
    title: 'Chapter 1: the Mudling steals the crisp, 16 frames 4 x 4, facing left (replaces the cartoon heist frames)',
    prompt: `IMAGE REQUEST: ONE SINGLE SHEET. Return exactly one square image, nothing else. Generate it now.

ATTACHED IMAGES
1) The approved painting of the Mudling, a blob of pond mud with eyes and a small green sprout on top, from "The Adventures of Tom", a family role-playing game. Keep this exact creature: the same dripping mud body, the same sprout, colors, eyes and mouth, and above all the same rich painted finish and light. Not a flat cartoon, not a simpler drawing: it must look like the same painting as attachment 1.
2) The approved painting of the Pond Grump, for the hand-brushed finish only.

PAINT THIS SHEET
16 poses of the same Mudling in a 4 by 4 grid, read left to right, top row first. Every pose faces to the LEFT of the picture. Each pose fills most of its cell; nothing touches or overlaps the next cell. The same size of creature in every cell.
Row 1: 1 oozing forward low and flat. 2 oozing forward, a little taller. 3 stopping, eyes wide, spotting something tasty. 4 winding up, leaning back.
Row 2: 5 charging forward. 6 shoving with its whole body. 7 squeezing tall and thin to fit through a gap. 8 wobbling after the squeeze.
Row 3: 9 stretching one muddy arm out to reach. 10 grabbing a round metal pie tin full of rhubarb crisp. 11 hugging the pie tin to its body. 12 glancing back over its shoulder, holding the tin.
Row 4: 13 scurrying away holding the tin. 14 scurrying, the other step. 15 a sneaky giggle, tin held tight. 16 sneaking off on tiptoe, low, tin held tight.
From pose 10 on, the pie tin of rhubarb crisp is in every pose, held by the Mudling.
Matte, thick visible brush strokes on the mud, canvas grain, crisp painted edges, no gloss, not a smooth digital render.
- ${MAGENTA}
- No words, letters or numbers anywhere.` },

  // r-20261114-100352-7v5z: Deedee asks where her reading glasses are while they sit on top of her head.
  { id: 'ch1-deedee-glasses-head', tab: 'Characters', group: 'Report fixes', ar: '2:3', refs: ['art/raw/characters/deedee-hero-ref-v1.png', 'art/raw/characters/deedee-talk-v4.png'],
    title: 'Chapter 1: Deedee looking for the reading glasses that are on top of her head (one full-body pose, for the map and her dialogue face)',
    prompt: pose('Deedee, a grandmother', [HERO('Deedee'), TALK('Deedee')],
      'A pair of reading glasses is pushed up on TOP of her head, resting in her hair, clearly visible. She is patting the pockets of her clothes with both hands, looking down and to the side, puzzled, searching for the glasses she cannot see are on her own head. Funny and warm.',
      'Her face must be clearly visible from the front so it can be cropped for a portrait.') },

  // r-20261114-101538-nre4: the grey grass, the orange block and the bulb overlap strangely as three pictures; one painting of all three.
  { id: 'ch1-spot-together', tab: 'Props', group: 'Report fixes', ar: '1:1', refs: ['art/hollow.webp', 'art/raw/props/ch1-grey-patch-v3.png', 'art/raw/props/ch1-orange-block-v1.png', 'art/raw/props/ch1-flashbulb-v1.png'],
    title: 'Chapter 1: the fishing spot as one picture: grey grass patch with the orange block and the burnt bulb in it (one object)',
    prompt: `IMAGE REQUEST: ONE SINGLE OBJECT. Return exactly one square image, nothing else. Generate it now. Do not make a plan, a sheet or several states.

ATTACHED IMAGES
1) The finished painting of Grump Hollow from "The Adventures of Tom", a family role-playing game, for the view, light and brushwork only.
2) The approved grey grass patch. 3) The approved orange block with a dragonfly inside. 4) The approved burnt-out flashbulb.

PAINT THIS ONE OBJECT
The grey grass patch of attachment 2, seen from the same high, angled view as attachment 1, so it lies flat on the ground and is about twice as wide as it is tall. Sitting IN the grass, a little left of the middle, is the orange block of attachment 3, the size of a plum, with the dragonfly inside and a small round dent facing the viewer; its bottom sinks into the grass so it clearly rests on the ground. Lying on its side in the grass to the right of the block, small, is the burnt-out flashbulb of attachment 4. All three are painted together as one picture with one light, so nothing looks pasted on: the block and the bulb cast soft grey shadows on the grass to the lower right. Only the grass and its earth are drained of colour; the block stays orange and the bulb keeps its dark metal base.
- Exactly ONE patch, alone, centered, large: it fills about 80 percent of the width of the picture. Nothing else: no pond, no path, no trees.
- ${MAGENTA}
- No people, no words, letters or numbers.

${ART}` },

  // r-20261114-100734-1a2w: Boppy's unimpressed mood frame lost his mustache; this one frame replaces cell 8 of his mood strip.
  { id: 'boppy-em-unimpressed', tab: 'Characters', group: 'Report fixes', ar: '2:3', refs: ['art/raw/characters/boppy-hero-ref-v1.png', 'art/raw/characters/boppy-emotions-v6.png'],
    title: 'Boppy unimpressed WITH his mustache (one full-body pose; replaces the 8th frame of his emotion sheet)',
    prompt: pose('Boppy, a grandfather in his sixties', [HERO('Boppy'), 'The approved emotion sheet of Boppy. Copy the LAST pose (unimpressed: leaning on one hip, one hand on the hip, eyes half closed, mouth turned down, his fishing rod over his shoulder).'],
      'Copy the last pose of attachment 2 exactly: unimpressed, leaning on one hip, one hand on the hip, eyelids half closed, mouth turned down, the fishing rod over his shoulder.',
      'He has his thick white mustache, exactly as in attachment 1. The mustache must be clearly visible.') },

  // r-20261114-162358-jykk: a dedicated frame of each person who finds a flashbulb, holding it up (Tom already has c4t_bulb, used in chapters 2, 4 and 5).
  { id: 'ch1-deedee-bulb', tab: 'Characters', group: 'Report fixes', ar: '2:3', refs: ['art/raw/characters/deedee-hero-ref-v1.png', 'art/raw/characters/deedee-talk-v4.png', 'art/raw/props/ch1-flashbulb-v1.png'],
    title: 'Chapter 1: Deedee holding up the burnt flashbulb she found at the pond (one full-body pose)',
    prompt: pose('Deedee, a grandmother', [HERO('Deedee'), TALK('Deedee'), 'The approved burnt-out flashbulb. She holds exactly this bulb.'],
      'She holds the burnt-out flashbulb of attachment 3 up between her thumb and finger at shoulder height, looking at it with a frown, disapproving, like someone found litter at her pond. The bulb is small but clearly visible.') },
  { id: 'ch3-rose-bulb', tab: 'Characters', group: 'Report fixes', ar: '2:3', refs: ['art/raw/characters/rose-hero-ref-v1.png', 'art/raw/characters/rose-talk-v2.png', 'art/raw/props/ch1-flashbulb-v1.png'],
    title: 'Chapter 3: Rose holding up the burnt flashbulb she found on the sundial (one full-body pose)',
    prompt: pose('Rose, a girl of six', [HERO('Rose'), TALK('Rose'), 'The approved burnt-out flashbulb. She holds exactly this bulb.'],
      'She holds the burnt-out flashbulb of attachment 3 up high over her head with one hand, proud, on her tiptoes, big grin, showing everyone what she found. The bulb is small but clearly visible.') },

  // r-20261114-104915-g4gl: everyone in the smog's daze gets a dazed frame: glassy unfocused eyes, slack dreamy smile.
  ...[['washington', 'Mr. Washington', 'he stands with one hand resting on his belly'],
      ['odette', 'Miss Odette', 'she holds a long wooden spoon loosely, as if stirring the air'],
      ['carmen', 'Doña Carmen', 'she holds a griddle spatula loosely at her side'],
      ['marisol', 'Marisol', 'she holds a dog leash loosely in one hand, the leash hanging slack'],
      ['larry', 'Larry', 'he holds his leaf blower loosely, pointing at the ground, switched off']].map(([id, n, held]) => ({
    id: 'ch2-dazed-' + id, tab: 'Characters', group: 'Report fixes', ar: '2:3', refs: ['art/raw/npcs/npc-photo-' + id + '-v2.png'],
    title: `Chapter 2: ${n} in the smog's daze (one full-body pose: glassy eyes, dreamy smile)`,
    prompt: pose(n, [NPC(n)], `${n} is in a trance: the eyes are glassy, half closed and unfocused, looking at nothing far away, the eyebrows slightly raised, a slack, dreamy little smile, the head tilted a little to one side, the shoulders loose. Arms hang relaxed; ${held}. Calm and a little funny, never scary.`) })),

  // r-20261114-101501-c5no: a thinking or examining pose for lines where someone looks at or thinks about what another person is saying.
  ...CAST.map(([id, n, hero, talk]) => ({
    id: id + '-think', tab: 'Characters', group: 'Report fixes', ar: '2:3', refs: [hero, talk],
    title: `${n} thinking and listening (one full-body pose; the fifth talking pose, for lines where someone thinks about what another person says)`,
    prompt: pose(n, [HERO(n), TALK(n)],
      'Thinking hard about what someone else is saying: one hand on the chin, the other arm folded across the body supporting that elbow, the head tilted a little, eyes looking up and to the side, the mouth closed in a thoughtful little line. Curious and attentive, not sad.',
      'The pose matches the attached talking sheet in size and finish, so it can sit next to those four poses.') })),
];

module.exports = { entries };
