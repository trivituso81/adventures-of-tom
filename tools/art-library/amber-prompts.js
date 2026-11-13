// Chapter 12 amber figures (Tom 2026-11-12: "a custom image for each of them", then "use the emotion the character had when they were frozen",
// and "Doña Carmen needs a couple of states as she breaks free"). Required by make-prompts.js.
// One picture per frozen neighbour: the same painted person caught in the moment the story says they were frozen, inside a block of amber,
// from that person's approved hero picture. Doña Carmen has three (frozen, cracking, breaking away): the only neighbour whose thaw is a scene
// (SCENES.ch12Carmen); the Alvarez family thaws on a ding while Amy runs laps, so they have one picture each.
// Each prompt is its own complete text (no fill-in fields). The moments come from the frozen lines in data/scenes-ch12.js ("What the neighbors say while amber").
// Install after approval: tools/sprite-bake/bake_amber.py <id> (art/amber/<id>.webp); engine/ch12-render.js draws it while they are frozen. No `bake` field (validate.js refuses it).
const fs = require('fs');
const live = fs.existsSync('data/art-prompts.json') ? JSON.parse(fs.readFileSync('data/art-prompts.json', 'utf8')).entries : [];
const hero = id => {
  const e = live.find(x => x.id === 'npc-photo-' + id);
  const v = e && (e.versions || []).filter(x => x.file).pop();
  if (!v) throw new Error('no approved hero picture for ' + id);
  return v.file;
};
const HEAD = `IMAGE REQUEST: ONE SINGLE IMAGE. Return exactly one image, nothing else. The attached picture is a painted game character.

Paint this same person, unchanged: the same face, hair, skin, clothes, colors, proportions and anything they carry. Full length, facing the viewer, feet visible. The person is frozen mid-moment, standing completely still inside one tall, solid block of warm, glowing amber, like honey-colored glass. The person stays clearly visible and recognizable through the amber, with the face fully readable.`;
const TAIL = `The amber block is a simple upright slab, a little wider and taller than the person, with a flat base, softly rounded top edges, a glossy bright edge along the upper left, and a few tiny gold flakes and bubbles caught inside. The amber is slightly deeper in color at the bottom. Warm golden light from the upper left, smooth soft shading.

Style: hand-painted, realistic caricature with an oversized head and a slim body, exactly the painting style of the attached picture, no thick outlines. Not pixel art, not 16-bit. No text, no frame, no floor, no cast shadow on the background.

Background: one flat solid #FF00FF magenta, with nothing else in the picture. Keep a small margin of magenta around the block on every side.`;
const moment = m => `${HEAD}\n\nThe moment they are frozen in: ${m}\n\n${TAIL}`;
const PEOPLE = {
  washington: ['Mr. Washington', 'He is in the middle of a long, favorite story: one finger raised, mouth open mid-sentence, eyes bright, a warm, amused, storyteller look. A tiny chip of gold sits on the brim of his hat.'],
  marisol: ['Marisol', 'She is out walking her dog. The amber covers her from the shoulders down to her sneakers, and her head and face stay clear above it, relaxed and cheerful, mid-stride. One hand holds a leash that runs out of the amber to her loyal dog, who is not frozen: he sits calmly beside the block, free, looking up at her. The dog is part of this picture, standing outside the amber on the same ground line.'],
  larry: ['Larry', 'He is blowing leaves, holding a handheld leaf blower raised and pointed forward, with a stubborn, quietly satisfied look of deep concentration. One single dry leaf hangs in the air in front of him, perfectly still, inside the amber.'],
  carmen: ['Doña Carmen', 'She is in the middle of a sentence, one arm out and one finger pointing at something to her left (a photo on the wall, not shown), mouth open, eyebrows up, an emphatic, warm, scolding-with-love expression.'],
  alvarez: ['Mrs. Alvarez', 'She is in the middle of saying NO: one finger out, chin lifted, eyebrows firm, mouth open mid-word, the stern but loving look of a grandmother who has decided.'],
  beto: ['Don Beto', 'He is standing and yelling at a television off to one side: one fist raised in the air, mouth wide open mid-shout, eyes wide, the indignant face of a man calling a foul.'],
  tony: ['Tony', 'He is carrying dinner, caught mid-step with one foot lifted, a plate in each hand. A single tortilla hangs in the air above his head, inside the amber. His look is cheerful, busy and a little distracted.'],
  yesenia: ['Yesenia', 'She is caught mid eye-roll: one earbud pulled out of one ear and held in her hand, her eyes rolled up toward the ceiling, her mouth flat, a deeply unimpressed expression.'],
  claudia: ['Claudia', 'She is looking down at a phone held in one hand at chest height, her thumb mid-scroll, with the tired, overwhelmed, scrolling look of someone coming off a night shift.'],
  kevin: ['Kevin', 'He is an eleven-year-old boy caught mid-yawn: mouth wide open, eyes squeezed shut, one fist half raised toward his face, shoulders loose, the peaceful, sleepy look of a kid who sleeps wherever there is room.'],
};
const entries = Object.entries(PEOPLE).map(([id, [name, m]]) => ({
  id: 'amber-' + id, tab: 'NPCs', group: 'Chapter 12 amber',
  title: name + ': frozen in an amber block, in the moment she or he froze (chapter 12, hero attached)'.replace('she or he', 'they'),
  ar: '2:3', refs: [hero(id)], prompt: moment(m),
}));
// Doña Carmen's break: the same figure, same size and place, two more states. Each carries the frozen picture (chained ref: it must be
// generated and approved first) so the figure does not drift between the three.
const FROZEN = 'art/raw/npcs/amber-carmen-v1.png';
const chain = `The first attached picture is the painted game character; the second attached picture is her frozen in amber. Keep the second picture EXACTLY as it is: the same figure, face, pose, size, position and canvas, the same block of amber at the same place. Change only what is described below.`;
const carmen = (id, title, change) => ({
  id: 'amber-' + id, tab: 'NPCs', group: 'Chapter 12 amber', title, ar: '2:3', refs: [hero('carmen'), FROZEN],
  prompt: `IMAGE REQUEST: ONE SINGLE IMAGE. Return exactly one image, nothing else.\n\n${chain}\n\n${change}\n\nSame hand-painted style, warm golden light from the upper left, smooth soft shading, no thick outlines, not pixel art, not 16-bit. No text, no frame, no floor, no cast shadow on the background. Background: one flat solid #FF00FF magenta, with nothing else in the picture, with the same margin of magenta around the block.`,
});
entries.push(
  carmen('carmen-crack', 'Doña Carmen: the amber cracking, same figure (chapter 12, second state, needs amber-carmen approved first)',
    'Change: a web of fine cracks has spread up through the amber from the base, like cracked sugar glass, with bright warm light shining out through the cracks. The amber is still whole and still holds her. Her pose and face are unchanged except that her eyes have a first flicker of surprise.'),
  carmen('carmen-break', 'Doña Carmen: the amber breaking away in flakes, same figure (chapter 12, third state, needs amber-carmen approved first)',
    'Change: the amber is breaking apart and falling away in warm gold flakes and small shards that drift down around her, caught in mid-air, with a bright golden glow. Her face, arms and upper body are already free of the amber; the last of it still clings around her feet. She is still pointing and still mid-sentence, and now her face is lit up and alive, as if she is about to finish her sentence.'));
module.exports = { entries };
