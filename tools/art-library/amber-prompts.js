// Chapter 12 amber figures (Tom 2026-11-12: "we need to generate custom images for each of them"). Required by make-prompts.js.
// One picture per frozen neighbour: the same painted person, set inside a block of amber, from that person's approved hero picture.
// The prompt is generic and reusable (no fill-in fields); the person comes from the attached hero picture. After approval, the next session runs
// tools/sprite-bake/bake_amber.py <id> (art/raw picture keyed on magenta, copied to tools/sprite-bake/src/amber-<id>-v1.png) to write art/amber/<id>.webp;
// engine/ch12-render.js then draws it while they are frozen. No `bake` field: the bulk load does not allow one.
const fs = require('fs');
const PEOPLE = {
  washington: 'Mr. Washington', marisol: 'Marisol', larry: 'Larry', carmen: 'Doña Carmen',
  alvarez: 'Mrs. Alvarez', beto: 'Don Beto', tony: 'Tony', yesenia: 'Yesenia', claudia: 'Claudia', kevin: 'Kevin',
};
// The newest approved hero picture of each person (the live json keeps the versions list).
const live = fs.existsSync('data/art-prompts.json') ? JSON.parse(fs.readFileSync('data/art-prompts.json', 'utf8')).entries : [];
const hero = id => {
  const e = live.find(x => x.id === 'npc-photo-' + id);
  const v = e && (e.versions || []).filter(x => x.file).pop();
  if (!v) throw new Error('no approved hero picture for ' + id);
  return v.file;
};
const PROMPT = `IMAGE REQUEST: ONE SINGLE IMAGE. Return exactly one image, nothing else. The attached picture is a painted game character.

Paint this same person, unchanged: the same face, hair, skin, clothes, colors, proportions, pose, expression and anything held in the hands. Full length, facing the viewer, feet visible. The person is frozen mid-moment, standing completely still inside one tall, solid block of warm, glowing amber, like honey-colored glass. The person stays clearly visible and recognizable through the amber, with the face fully readable.

The amber block is a simple upright slab, a little wider and taller than the person, with a flat base, softly rounded top edges, a glossy bright edge along the upper left, and a few tiny gold flakes and bubbles caught inside. The amber is slightly deeper in color at the bottom. Warm golden light from the upper left, smooth soft shading.

Style: hand-painted, realistic caricature with an oversized head and a slim body, exactly the painting style of the attached picture, no thick outlines. Not pixel art, not 16-bit. No text, no frame, no floor, no cast shadow on the background.

Background: one flat solid #FF00FF magenta, with nothing else in the picture. Keep a small margin of magenta around the block on every side.`;

module.exports = { entries: Object.entries(PEOPLE).map(([id, name]) => ({
  id: 'amber-' + id, tab: 'NPCs', group: 'Chapter 12 amber',
  title: name + ': frozen in an amber block, painted (chapter 12, hero attached)',
  ar: '2:3', refs: [hero(id)], prompt: PROMPT,
})) };
