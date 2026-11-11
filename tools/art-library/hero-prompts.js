// oldart1 (Tom 2026-11-11): the live entries in data/art-prompts.json reference only art the game uses now (newest heroes and walks, Tom's stance sheets, installed enemy sheets and plates, the house painting art/grands.webp for style). This builder may still name retired files (style key, underpaintings, hero-ref-v1, walk-sheet-v1, tom-battle-sheet); node tools/art-library/validate.js rejects them, so swap them per docs/CHANGES.md (oldart1) before splicing a new entry.
// Hero painting entries (Tom 2026-11-10: "in the character sheets, an entry item for the hero image"). One per character, first in
// that character's group. The approved picture is the hero Tom already supplied (art/raw/characters/<id>-hero-ref-v1.png), so the
// entries are approved from the start in data/art-prompts.json; GENERATE or UPLOAD MY OWN makes a replacement. The real-person photos
// stay on Tom's device (field `own`, three slots, sent first), never in the repo. Prompt: prompts/char-hero-pose.txt, same text for everyone.
const fs = require('fs'), path = require('path');
const prompt = fs.readFileSync(path.join(__dirname, 'prompts', 'char-hero-pose.txt'), 'utf8').trim();
const WHO = { tom: 'Tom', tnb: 'TNB', grace: 'Grace', rose: 'Rose', amy: 'Amy', justin: 'Justin', deedee: 'Deedee', boppy: 'Boppy', olivia: 'Olivia', ellie: 'Aunt Ellie', jojo: 'Jojo', michael: 'Michael', nara: 'Nara', 'boppy-young': 'Young Boppy' };
const entries = Object.keys(WHO).map(id => ({
  id: id + '-hero', tab: 'Characters',
  title: WHO[id] + ' hero painting: one full-body pose (the reference for every other picture of ' + (id === 'nara' ? 'her' : WHO[id]) + ')',
  ar: '2:3', refs: [], prompt,
  own: [{ slot: id + '-hero-photo1', label: 'Full body photo 1', at: 0 }, { slot: id + '-hero-photo2', label: 'Full body photo 2', at: 1 }, { slot: id + '-hero-photo3', label: 'Face close-up', at: 2 }]
}));
module.exports = { entries, WHO };
