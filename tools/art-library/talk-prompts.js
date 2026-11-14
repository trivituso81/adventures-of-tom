// Talking sheets (talk1, Tom 2026-11-13, docs/TALK_POSES.md): one entry `<id>-talk` per person with a mood sheet, tab Characters, in that person's group.
// Four full-body poses on one 4 x 1 sheet (ar 2:1, tall cells), left to right: tell, point, ask, answer. Shown on the map while that person says a plain line.
// Reference: the newest approved emotion sheet of that person (the mood poses the talking poses sit beside on the map: same face, proportions, colors, painting).
// One generic prompt for everyone (prompts/char-talk-sheet.txt). Nara is a dog and gets none. Install after approval: tools/sprite-bake/talk_frames.py <id>.
const fs = require('fs');
const P = fs.readFileSync(__dirname + '/prompts/char-talk-sheet.txt', 'utf8').replace(/\n$/, '');
const CAST = { tom: 'Tom', tnb: 'TNB', grace: 'Grace', rose: 'Rose', amy: 'Amy', justin: 'Justin', deedee: 'Deedee', boppy: 'Boppy', ellie: 'Aunt Ellie', olivia: 'Olivia' };
function newestEmotion(id) {
  try {
    const art = JSON.parse(fs.readFileSync(__dirname + '/../../data/art-prompts.json', 'utf8'));
    const e = art.entries.find(x => x.id === id + '-emotions');
    if (e && e.versions && e.versions.length) return e.versions[e.versions.length - 1].file;
  } catch (err) {}
  return 'art/raw/characters/' + id + '-emotions-v1.png';
}
const entries = Object.entries(CAST).map(([id, who]) => ({
  id: id + '-talk', tab: 'Characters', group: who,
  title: who + ' talking sheet: 4 everyday talking poses, full body (telling, pointing, asking, answering)',
  ar: '2:1', refs: [newestEmotion(id)], prompt: P,
}));
module.exports = { entries, CAST };
