// Item pictures for the Art Library (tab Props, group "Item pictures"). Required by make-prompts.js. (itembannerart1, 2026-11-20)
// Report r-20261120-142626-w74f: "missing art for all item banners". The ITEM GAINED banner (engine/party-banner.js itemBanner) showed the item's
// emoji; it now shows one painted picture per item. The game has 288 items (every key of `items`, data/party.js and the files that add to it), so
// the pictures come as 18 sheets of 16 objects, one Generate press each, like the Dungeon finds sheets. Approval bakes each sheet into one
// transparent picture per item, art/items/<id>.webp (`bake` -> tools/sprite-bake/bake_item_sheet.py), and rewrites data/item-art.js, the list the
// banner reads. An item with no picture yet keeps its emoji.
// The words for every item (id, name, what to paint) are in itemart-items.json, in the order of the items table; sheet N holds items 16N-15 to 16N.
// A miss on one cell is fixed with a redo sheet of only the missed items (see the Dungeon finds EDIT sheets), never by rewording an approved sheet.
// Run directly (node tools/art-library/itemart-prompts.js) to add or refresh only these entries in data/art-prompts.json: approved status, versions
// and rejects are kept and an approved prompt is never reworded.
const ITEMS = require('./itemart-items.json');
const REF_KEY = 'art/grands.webp';   // the installed painting of Deedee and Boppy's house, used for the painting style by the other prop sheets
const PER = 16;

function sheetPrompt(items) {
  const n = items.length;
  const list = items.map((it, i) => `${i + 1}. ${it.name}: ${it.note}`).join('\n');
  return `IMAGE REQUEST: ONE SINGLE ITEM SHEET. Return exactly one image, nothing else.

WHAT THIS IS
A sheet of ${n} small items for "The Adventures of Tom", a family role-playing game. The game shows each item in a banner when the player receives it, so each item is one clear object that reads at a glance. The attached picture shows the painting style: take only how it is painted, and paint only the objects in the list below.

LAYOUT
- A grid of 4 columns by 4 rows of equal square cells, filled left to right, top to bottom, in the order of the list. No grid lines, no borders, no numbers, no labels.
- Exactly ${n} objects, one per cell, each complete and centered, filling about 70 percent of its cell with at least 12 percent empty margin on every side. Nothing touches or crosses a cell edge, and nothing overlaps.
- Background: one flat solid #FF00FF magenta everywhere, with no magenta inside any object.

STYLE
- Hand-painted by hand: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges, gently simplified friendly shapes. Warm golden light from the upper left, shadow on the lower right of each form, no cast shadow on the ground.
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT glossy plastic.
- Three-quarter view from slightly above, unless the list says laid flat or standing. All objects share one lighting direction and one level of detail. Family friendly for children aged 6 and up.

RULES
- Draw exactly the ${n} objects in the list, one per cell, and never substitute, add or skip one. Where a list entry is unusual, draw it as written.
- Objects only: no people, no hands, no faces on anything unless the list says the object has them (a plush toy, a pot with eyes).
- No readable words or letters anywhere. Where an object normally carries print, paint soft blurred squiggles instead. A single bold numeral is allowed only where the list asks for it.
- No real brands, logos or copyrighted characters.

THE ${n} ITEMS (cell number: name, what to paint)
${list}`;
}

const sheets = [];
for (let i = 0; i < ITEMS.length; i += PER) sheets.push(ITEMS.slice(i, i + PER));
const pad = n => String(n).padStart(2, '0');
const entries = sheets.map((items, i) => ({
  id: `prop-item-${pad(i + 1)}`, tab: 'Props', group: 'Item pictures',
  title: `Item pictures, sheet ${i + 1} of ${sheets.length} (${items.length} items, ${items[0].name} to ${items[items.length - 1].name})`,
  ar: '1:1', refs: [REF_KEY], prompt: sheetPrompt(items),
  bake: { script: 'bake_item_sheet.py', args: [`item-${pad(i + 1)}`, ...items.map(it => it.id)], src: `tools/sprite-bake/src/items/item-${pad(i + 1)}.png`, key: 'corner' },
}));

if (require.main === module) {
  const fs = require('fs');
  const out = 'data/art-prompts.json', doc = JSON.parse(fs.readFileSync(out, 'utf8'));
  const changed = [];
  for (const e of entries) {
    const i = doc.entries.findIndex(x => x.id === e.id), old = i >= 0 ? doc.entries[i] : null;
    const n = { status: old ? old.status : 'draft', versions: old ? old.versions || [] : [], rejects: old ? old.rejects || [] : [], ...e };
    if (old) {
      if (old.prompt && old.prompt.trim() === n.prompt.trim()) n.prompt = old.prompt;
      else if (old.status === 'approved') { n.prompt = old.prompt; changed.push(e.id + ' (approved: prompt kept)'); }
      else { n.promptRev = (old.promptRev || 0) + 1; if (old.status === 'rejected') n.status = 'draft'; changed.push(e.id + ' (prompt changed)'); }
      doc.entries[i] = n; continue;
    }
    const j = doc.entries.map(x => x.group === 'Item pictures').lastIndexOf(true);
    doc.entries.splice(j >= 0 ? j + 1 : doc.entries.length, 0, n); changed.push(e.id + ' (new)');
  }
  fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  console.log('item picture entries in', out + ':', entries.length, changed.length ? '\n  ' + changed.join('\n  ') : '(no prompt changes)');
}
module.exports = { entries, ITEMS, sheetPrompt, PER };
