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

function sheetPrompt(items, redo, solo) {
  const n = items.length, g = solo ? 1 : redo ? 3 : 4;
  const list = items.map((it, i) => `${solo ? '' : `${i + 1}. `}${it.name}: ${it.note}`).join('\n');
  return `IMAGE REQUEST: ONE SINGLE ITEM ${solo ? 'PICTURE' : 'SHEET'}. Return exactly one image, nothing else.

WHAT THIS IS
${solo ? 'A picture of one small item' : `A sheet of ${n} small items`} for "The Adventures of Tom", a family role-playing game. The game shows each item in a banner when the player receives it, so each item is one clear object that reads at a glance. The attached picture shows the painting style: take only how it is painted, and paint only ${solo ? 'the object' : 'the objects in the list'} below.

LAYOUT
${solo ? '- One object only, complete and centered, filling about 70 percent of the picture with at least 12 percent empty margin on every side. No borders, no numbers, no labels.' : `- A grid of ${g} columns by ${g} rows of equal square cells, filled left to right, top to bottom, in the order of the list. No grid lines, no borders, no numbers, no labels.
- Exactly ${n} objects, one per cell, each complete and centered, filling about 70 percent of its cell with at least 12 percent empty margin on every side. Nothing touches or crosses a cell edge, and nothing overlaps.`}
- Background: one flat solid #FF00FF magenta everywhere, with no magenta inside any object.

STYLE
- Hand-painted by hand: visible brushwork, matte painted surfaces, rich warm colors, crisp painted edges, gently simplified friendly shapes. Warm golden light from the upper left, shadow on the lower right of each form, no cast shadow on the ground.
- No thick or black outlines. NOT pixel art, NOT retro game art, NOT photorealistic, NOT a 3D render, NOT glossy plastic.
- Three-quarter view from slightly above, unless the list says laid flat or standing.${solo ? '' : ' All objects share one lighting direction and one level of detail.'} Family friendly for children aged 6 and up.

RULES
- ${solo ? 'Draw exactly this one object and nothing else.' : `Draw exactly the ${n} objects in the list, one per cell, and never substitute, add or skip one.`} Where a list entry is unusual, draw it as written.
- Objects only: no people, no hands, no faces on anything unless the list says the object has them (a plush toy, a pot with eyes).
${redo ? '- No words, letters, numbers or print anywhere, not even blurred: where an object normally carries print, leave that surface plain.' : '- No readable words or letters anywhere. Where an object normally carries print, paint soft blurred squiggles instead. A single bold numeral is allowed only where the list asks for it.'}
- No real brands, logos or copyrighted characters.

${solo ? 'THE ITEM (name, what to paint)' : `THE ${n} ITEMS (cell number: name, what to paint)`}
${list}`;
}

// fix-itembannerart-pics (2026-11-20). Tom on the 18 first sheets: "fix only those that failed". Claude checked the 9 sheets QA flagged cell by cell
// (QA's numeral flags on clocks, stopwatches, Perfect Ten and No. 7 are not misses: those numbers belong on the object). The cells below missed; each
// gets a rewritten note (only what the miss named changes) on one of two 3 x 3 redo sheets, and its first sheet's bake skips it (`-`), so the first
// sheet stays as made and can be approved for its other cells. Sheets 4 and 5 had no real miss.
const REDO = [
  [3, 9, 'A big round gold coin with a round kickball (a playground ball with panel seams) stamped in the middle and a beaded rim, standing on its edge at a tilt. No person on the coin.'],
  [6, 4, 'A purple velvet coat with a smooth shiny satin collar (no fur anywhere) and one single big button, laid flat.'],
  [11, 11, 'A sleek pair of noise-cancelling over-ear headphones in matte black, a headband joining two big padded ear cups, with a soft glow on the cups.'],
  [12, 6, 'A bright green rain slicker (an empty raincoat, no animal in it) with webbed pockets and two round frog eyes on top of the hood, laid flat.'],
  [12, 13, 'A pair of fluffy slippers shaped like puffy clouds in white and pale blue, with puffy tops and no faces.'],
  [12, 15, 'A light race tempo singlet in teal with a plain white bib pinned on the chest, laid flat. No logo.'],
  [12, 16, 'A pair of pro racing flats in neon with paper-thin soles and plain sides. No logo or swoosh.'],
  [13, 3, 'A sporty split-time wristwatch with a bright strap and a plain face with tick marks only.'],
  [13, 15, 'A silver locket shaped like a crescent moon on a chain, open to show a tiny heart inside.'],
  [17, 2, 'A small rough bar of pale yellow skate wax, scuffed, with deep grooves rubbed into its top and edges.'],
  [17, 3, 'A tiny clay sculpture of a taco, handmade pottery with speckled glaze (not real food), with a paperclip stuck in it.'],
  [17, 13, 'A round flat golden pupusa (a thick stuffed corn tortilla) with melting cheese oozing from its edge and a side of curtido slaw on a small plate.'],
  [18, 1, 'An oat milk latte in a plain ceramic cup with a heart in the foam.'],
  [18, 2, 'A gold medal on a bright ribbon with a simple zigzag crack stamped on the gold.'],
  [18, 5, 'A plain yellow hard hat with a few dents, two tiny scribbles inside the brim.'],
  [18, 7, 'A small computer chip with a plain dark top, cracked in half, with gold traces along the crack.'],
  [18, 14, 'A plain white birthday shirt with puffy fuzzy cuffs, laid flat.'],
  [18, 16, 'A plain gold sparkly birthday sash with a big gold bow, draped.'],
].map(([sheet, cell, note]) => ({ sheet, cell, note, item: ITEMS[(sheet - 1) * PER + cell - 1] }));
const SKIP = new Set(REDO.map(r => r.item.id));
const RPER = 9;
// fix-itembannerart-pics-2 (2026-11-20). Tom: "make sure you only regenerate those than failed and approve those where nothing failed". On the redo
// sheets these three missed the same way as on their first sheets (football cleats with a swoosh again, a real taco again, a bow with no sash).
// Stop-loss: the note is not reworded a third time; the method changes instead. Each is one object alone in its own picture (`prop-item-solo-<id>`,
// the same note, cut with --grid=1), and its redo sheet's bake skips its cell (`-`), so the redo sheets are approved for their other cells.
const SOLO = new Set(['amy_chm1', 'claytaco', 'g_bsash']);

const sheets = [];
for (let i = 0; i < ITEMS.length; i += PER) sheets.push(ITEMS.slice(i, i + PER));
const pad = n => String(n).padStart(2, '0');
const entries = sheets.map((items, i) => ({
  id: `prop-item-${pad(i + 1)}`, tab: 'Props', group: 'Item pictures',
  title: `Item pictures, sheet ${i + 1} of ${sheets.length} (${items.length} items, ${items[0].name} to ${items[items.length - 1].name})`,
  ar: '1:1', refs: [REF_KEY], prompt: sheetPrompt(items),
  bake: { script: 'bake_item_sheet.py', args: [`item-${pad(i + 1)}`, ...items.map(it => SKIP.has(it.id) ? '-' : it.id)], src: `tools/sprite-bake/src/items/item-${pad(i + 1)}.png`, key: 'corner' },
}));
for (let i = 0; i < REDO.length; i += RPER) {
  const k = i / RPER + 1, rs = REDO.slice(i, i + RPER), items = rs.map(r => ({ id: r.item.id, name: r.item.name, note: r.note }));
  entries.push({
    id: `prop-item-redo-${k}`, tab: 'Props', group: 'Item pictures',
    title: `Item pictures, redo sheet ${k} (${items.length} items that missed on sheets ${[...new Set(rs.map(r => r.sheet))].join(', ')})`,
    ar: '1:1', refs: [REF_KEY], prompt: sheetPrompt(items, true),
    bake: { script: 'bake_item_sheet.py', args: [`item-redo-${k}`, '--grid=3', ...items.map(it => SOLO.has(it.id) ? '-' : it.id)], src: `tools/sprite-bake/src/items/item-redo-${k}.png`, key: 'corner' },
  });
}
for (const r of REDO.filter(r => SOLO.has(r.item.id))) {
  const it = { id: r.item.id, name: r.item.name, note: r.note };
  entries.push({
    id: `prop-item-solo-${it.id}`, tab: 'Props', group: 'Item pictures',
    title: `Item picture: ${it.name} alone (missed on sheet ${r.sheet} and on its redo sheet)`,
    ar: '1:1', refs: [REF_KEY], prompt: sheetPrompt([it], true, true),
    bake: { script: 'bake_item_sheet.py', args: [`item-solo-${it.id}`, '--grid=1', it.id], src: `tools/sprite-bake/src/items/item-solo-${it.id}.png`, key: 'corner' },
  });
}

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
module.exports = { entries, ITEMS, sheetPrompt, PER, REDO, SOLO };
