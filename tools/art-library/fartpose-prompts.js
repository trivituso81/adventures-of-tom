// Deedee's four fart poses (fartpose1, card c-deedeefart, Tom 2026-11-26: "create 4 pose entries of deedee making a fart in the art library ...
// they will be used at a later point in the game that we haven't decided on yet"). Required by make-prompts.js. Group Deedee (groups.js, by id).
// Tom supplied the four pictures himself and approved them (versions with `up`), so GENERATE is only for a remake. Nothing in the game uses them yet:
// no `bake` field, no wiring. Prompts reuse the approved pose() frame of ch2fix-prompts.js (references, magenta background, painted finish), pose sentence changed.
const { pose, HERO, TALK } = require('./ch2fix-prompts.js');

const REFS = [HERO('Deedee'), TALK('Deedee')];
const FILES = ['art/raw/characters/deedee-hero-ref-v1.png', 'art/raw/characters/deedee-talk-v4.png'];
const PUFF = 'a small soft cartoon puff cloud of dust drifting out behind her, with two or three short speed lines';

// pose() paints ONE standing figure. These poses are not plain standing, so the standing sentence and the facing sentence are replaced.
function one(what) {
  const base = pose('Deedee', REFS, what);
  return base.replace('alone, standing, full body from the top of the head to the shoes, facing the viewer at a slight three-quarter angle. ', 'alone, full body from the top of the head to the shoes. ');
}

const entries = [
  { id: 'deedee-fart-bend', title: 'Deedee fart pose 1: bent over laughing, hands on her knees (for a later scene)',
    what: `Bent forward at the waist with both hands resting on her knees, eyes squeezed shut, laughing hard with her mouth wide open and a big smile. The body turns to the side, the head is turned toward the viewer. ${PUFF[0].toUpperCase() + PUFF.slice(1)}. The cloud is part of the picture.` },
  { id: 'deedee-fart-hop', title: 'Deedee fart pose 2: giggling with a hand over her mouth, one foot kicked up (for a later scene)',
    what: `Standing on one foot with the other foot kicked up behind her, one hand pressed over her smiling mouth, the other hand held out behind her, eyes bright and amused, a shy giggle. Facing the viewer at a slight three-quarter angle. ${PUFF[0].toUpperCase() + PUFF.slice(1)}. The cloud is part of the picture.` },
  { id: 'deedee-fart-shock', title: 'Deedee fart pose 3: shocked, both hands out, mouth open in an O (for a later scene)',
    what: `Standing with her feet apart and both arms out to the sides with the fingers spread, eyes wide open, eyebrows raised, mouth open in a round O of surprise. Facing the viewer straight on. ${PUFF[0].toUpperCase() + PUFF.slice(1)}. The cloud is part of the picture.` },
].map(({ id, title, what }) => ({ id, tab: 'Characters', ar: '2:3', refs: FILES, title, prompt: one(what) }));

// Pose 4 is one sheet of three battle poses, so it keeps the sheet shape of the other battle sheets.
const sheetBase = pose('Deedee', REFS, 'x');
const art = sheetBase.split('\n\n').pop();
const magenta = sheetBase.match(/- (Background: one flat solid color[^\n]*)/)[1];
entries.push({ id: 'deedee-fart-battle', tab: 'Characters', ar: '1:1', refs: FILES,
  title: 'Deedee fart pose 4: sheet of three angry poses, the last a big blast (for a later scene)',
  prompt: `IMAGE REQUEST: ONE SINGLE PICTURE that holds a sheet of exactly three poses of the same person. Return exactly one image, nothing else. Generate it now.

ATTACHED IMAGES
1) ${REFS[0]}
2) ${REFS[1]}

PAINT THIS SHEET OF THREE POSES, all full body from the top of the head to the shoes, all the same size, none touching or overlapping, in this layout: two poses side by side on top, one centered underneath.
- Top left: Deedee standing with her feet apart and both hands clenched in fists at her sides, eyebrows pulled down, teeth clenched in a fierce scowl, facing the viewer at a slight three-quarter angle.
- Top right: Deedee bent forward at the waist with one fist held up by her chest, seen from the side with her head turned toward the viewer and the same fierce scowl. A medium soft cartoon puff cloud of dust bursts out behind her with a few short speed lines.
- Bottom: Deedee in a wide low stance with one fist at her waist and the other arm stretched out to the right with the fingers spread, shouting with her mouth open and the same scowl. A very large soft cartoon cloud of dust blasts out to the right across the picture from her back, with long speed lines, and a few small puffs trail behind it.
- Keep the face, hair, build, age, clothes and colors exactly as in the attachments.
- ${magenta}
- No words, letters or numbers anywhere.

${art}` });

module.exports = { entries };
