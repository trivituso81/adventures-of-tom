// Tombo split sheets (Tom 2026-11-07 01:45; spec claude/next-addendum-tombo-split-sheets.md): every Tombo is three pictures:
// a Tom sheet, a partner sheet and one object sheet. Content rows live in tombo-split/<partner>.js (and ff.js); this file builds the entries.
// Row shape (partner files; objectsOnly:true for the 7 approved pairs grace1 to 3, rose1, rose2, amy1, deedee1, which then need only objects, set tom and partner to []): { id:'grace1', name:'<live name>', beat:'<one line>', rides:false, tom:[6 frames], partner:[6 frames], objects:[[name, description], ...up to 12], reuses:'note or empty' }
// ff.js rows: { id:'ff1', name:'<finish name>', members:[{key:'tom', who:'Tom', frames:[6]}, ...], objects:[[name, description], ...] }
// Entries are copied into data/art-prompts.json by a node one-liner (never run make-prompts.js).
const fs = require('fs');
const P = f => fs.readFileSync(__dirname + '/prompts/' + f, 'utf8').trim();
const SOLO = P('char-tombo-solo-sheet.txt'), OBJ = P('tombo-objects-sheet.txt');
const R = 'art/raw/characters/', STYLE = 'docs/reference/style_key_v1.png';
const WHO = { tom: 'Tom', tnb: 'TNB', grace: 'Grace', rose: 'Rose', amy: 'Amy', deedee: 'Deedee', boppy: 'Boppy', nara: 'Nara' };
const list = a => a.map((f, i) => (i + 1) + '. ' + f).join('\n');

function personRefs(key, rides) {
  if (key === 'tom') return [R + 'tom-hero-ref-v1.png', R + 'tom-walk-sheet-v1.png', R + 'tom-battle-stance-1-v2.png', R + 'tom-battle-stance-2-v1.png'].concat(rides ? [R + 'tomride-poses-v2.png'] : []);
  return [R + key + '-hero-ref-v1.png', R + key + '-walk-sheet-v1.png', R + key + '-battle-sheet-1-v1.png', R + key + '-battle-sheet-2-v1.png'];
}
const personPrompt = (who, label, beat, frames) => SOLO + '\n\n' + label + '. ' + who + ' alone. ' + beat + '\n\nSix frames:\n' + list(frames);
const objPrompt = (objs) => OBJ + '\n\nThe objects, in reading order:\n' + objs.map((o, i) => (i + 1) + '. ' + o[0] + ': ' + o[1]).join('\n') + '\n\nDeliver the image itself.';

function tomboEntries(row, key, dc) {
  const W = WHO[key], g = 'Tombos, Tom + ' + W, base = 'tombo-' + row.id + (dc ? '-dc' : ''), t = (dc ? 'Director\'s Cut: ' : 'Tombo: ') + row.name;
  const label = (dc ? 'Director\'s Cut' : 'Tombo') + ': ' + row.name;
  const people = [
    { id: base + '-tom', tab: 'Characters', group: g, title: t + ' (Tom)', ar: '3:2', refs: personRefs('tom', row.rides), prompt: personPrompt('Tom', label, row.beat, row.tom) },
    { id: base + '-' + key, tab: 'Characters', group: g, title: t + ' (' + W + ')', ar: '3:2', refs: personRefs(key, false), prompt: personPrompt(W, label, row.beat, row.partner) },
    { id: base + '-objects', tab: 'Characters', group: g, title: t + ' (objects)', ar: '4:3', refs: [STYLE], prompt: objPrompt(row.objects) },
  ];
  const out = row.objectsOnly ? [people[2]] : people; return out.filter(e => !e.id.endsWith('-objects') || row.objects.length);
}
function finishEntries(row, dc) {
  const g = 'Finish, ' + row.name, out = [];
  const pre = dc ? '-dc' : '';
  for (const m of row.members) out.push({ id: row.id + pre + '-' + m.key, tab: 'Characters', group: g, title: (dc ? 'Director\'s Cut' : 'Family Finish') + ': ' + row.name + ' (' + m.who + ')', ar: '3:2', refs: personRefs(m.key, false), prompt: personPrompt(m.who, (dc ? 'Director\'s Cut' : 'Family Finish') + ': ' + row.name, row.beat || '', m.frames) });
  if (row.objects.length) out.push({ id: 'tombo-' + row.id + pre + '-objects', tab: 'Characters', group: g, title: (dc ? 'Director\'s Cut' : 'Family Finish') + ': ' + row.name + ' (objects)', ar: '4:3', refs: [STYLE], prompt: objPrompt(row.objects) });
  return out;
}
module.exports = { tomboEntries, finishEntries, personRefs, objPrompt, personPrompt, WHO };
