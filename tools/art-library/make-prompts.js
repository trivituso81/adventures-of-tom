#!/usr/bin/env node
// oldart1 (Tom 2026-11-11): the live entries in data/art-prompts.json reference only art the game uses now (newest heroes and walks, Tom's stance sheets, installed enemy sheets and plates, the house painting art/grands.webp for style). This builder may still name retired files (style key, underpaintings, hero-ref-v1, walk-sheet-v1, tom-battle-sheet); node tools/art-library/validate.js rejects them, so swap them per docs/CHANGES.md (oldart1) before splicing a new entry.
// Builds data/art-prompts.json. Claude edits the ENTRIES list below (or adds files) and reruns: node tools/art-library/make-prompts.js
// Entry fields: id, tab (Characters|NPCs|Areas|Rooms|Props|Enemies|Battle|Title|Portraits|Flight), title, prompt, refs (repo paths, max 5), ar (aspect ratio), status, group (added here by groups.js; see that file).
// Existing statuses, versions and rejects in the current json are kept for ids that still exist.
// Optional `bake` (B5, read by tools/art-library/art_bake.py in the art-bake Action): { script: 'bake_foe.py', args: ['mudling'], src: 'tools/sprite-bake/src/foe-mudling-v1.png', key: 'corner' }.
// `src` must sit under tools/sprite-bake/src/; `key: 'corner'` makes the background transparent from the corner colour (the generator's magenta comes out crimson).
// Only add `bake` when an approval should REPLACE live art; an entry without it is just stored under art/raw/. The test entry has none on purpose.
const fs = require('fs');
const out = 'data/art-prompts.json';
const old = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')).entries : [];
const ENTRIES = [
  { id: 'test-mudling', tab: 'Enemies', title: 'Library test: the Mudling (style key look)', ar: '1:1', refs: ['docs/reference/style_key_v1.png'],
    prompt: 'IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image.\n\nThe attached picture is the style key. Paint one new picture in exactly its painting style: the same dense painted texture, fine brushwork, deep saturated colors, warm lamplight and crisp detail.\n\nA MUDLING, a small friendly mud monster, knee high: a rounded lump of brown mud with a puddle base, two stubby mud arms, big round shiny eyes, a small open mouth, and a little green sprout with two leaves on top of its head. It stands on a plain flat magenta background, full body, facing the viewer, a curious friendly look. No other characters, no text.' },
  // Characters (Tom 2026-11-05 23:24): battle sheets 1 and 2, then one sheet per ability, from tools/art-library/char-prompts.js.
  ...require('./char-prompts.js').entries,
];
ENTRIES.push(require('./enemy-prompts.js').gridTest('mudling'));
ENTRIES.push(require('./enemy-prompts.js').gridTest('grump', 'art/raw/enemies/test-one-mudling-stance-v1.png'));
ENTRIES.push(require('./enemy-prompts.js').gridShort('grump', 'art/raw/enemies/test-one-mudling-stance-v1.png'));   // short-prompt A/B (11-05 15:50)   // one sheet, matte finish copied from an approved picture (11-05 15:30)
ENTRIES.push(...[['mudling', 1], ['grump', 1], ['bigshake', 1]].map(([i, k]) => require('./enemy-prompts.js').buildOne(i, k)), require('./enemy-prompts.js').buildOne('mudling', 4, 'art/raw/enemies/test-one-mudling-stance-v1.png'));   // one pose per picture tests (11-05 14:55)   // test card: 2 x 2 grid over a soft underpainting (11-05 14:50)
// One module per tab group, each exports { entries }. A module that does not exist yet is skipped.
for (const m of ['party-prompts', 'party2-prompts', 'npc-prompts', 'enemy-prompts', 'area-prompts', 'room-prompts', 'dungeonfind-prompts', 'trail-prompts', 'bubble-prompts', 'gate-prompts', 'battle-prompts', 'walk-sheet-prompts', 'title-prompts', 'portrait-prompts', 'flight-prompts']) {
  if (fs.existsSync(__dirname + '/' + m + '.js')) ENTRIES.push(...require('./' + m + '.js').entries);
}
// Every entry gets a `group` (the collapsible section inside its tab in art.html), derived by groups.js from its id and title. An entry that sets its own `group` keeps it.
const { groupOf } = require('./groups.js');
for (const e of ENTRIES) if (!e.group) e.group = groupOf(e);
const keep = Object.fromEntries(old.map(e => [e.id, e]));
const entries = ENTRIES.map(e => ({ status: 'draft', versions: [], rejects: [], ...(keep[e.id] ? { status: keep[e.id].status, versions: keep[e.id].versions || [], rejects: keep[e.id].rejects || [] } : {}), ...e, status: keep[e.id] ? keep[e.id].status : 'draft' }));
fs.writeFileSync(out, JSON.stringify({ version: 1, entries }, null, 1) + '\n');
console.log('wrote', out, entries.length, 'entries');
