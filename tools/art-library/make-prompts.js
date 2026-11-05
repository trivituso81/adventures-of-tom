#!/usr/bin/env node
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
  { id: 'grace-hero-fresh', tab: 'Characters', title: 'Grace step 1: fresh stand from your photo (Tom\'s prompt, 11-03)', ar: '3:4', own: { slot: 'grace-photo', label: 'Photo of the real Grace (face clear)', at: 0 }, refs: [],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-hero-fresh.txt', 'utf8').trim() },
  { id: 'grace-hero-fresh-style', tab: 'Characters', title: 'Grace step 2: change the style of step 1 (approve step 1 first)', ar: '3:4', refs: ['art/raw/characters/grace-hero-fresh-v5.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-hero-fresh-style.txt', 'utf8').trim() },
  { id: 'grace-walk-front', tab: 'Characters', title: 'Grace walk sheet 1 of 3: facing you (Tom, 11-03)', ar: '16:9', refs: ['art/raw/characters/grace-hero-fresh-style-v4.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-front.txt', 'utf8').trim() },
  { id: 'grace-walk-back', tab: 'Characters', title: 'Grace walk sheet 2 of 3: from behind (Tom, 11-03)', ar: '16:9', refs: ['art/raw/characters/grace-hero-fresh-style-v4.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-back.txt', 'utf8').trim() },
  { id: 'grace-walk-side', tab: 'Characters', title: 'Grace walk sheet 3 of 3: side view (Tom, 11-03)', ar: '16:9', refs: ['art/raw/characters/grace-hero-fresh-style-v4.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-side.txt', 'utf8').trim() },
  { id: 'grace-walk-sheet-test', tab: 'Characters', title: 'Grace walk TEST: one 3 x 3 sheet, built like Tom\'s walk sheet (11-04)', ar: '1:1', refs: ['art/raw/characters/grace-hero-fresh-style-v4.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-sheet-test.txt', 'utf8').trim() },
];
ENTRIES.push(require('./enemy-prompts.js').gridTest('mudling'));   // test card: 2 x 2 grid over a soft underpainting (11-05 14:50)
// One module per tab group, each exports { entries }. A module that does not exist yet is skipped.
for (const m of ['party-prompts', 'party2-prompts', 'npc-prompts', 'npc-walk-prompts', 'enemy-prompts', 'area-prompts', 'room-prompts', 'prop-prompts', 'battle-prompts', 'title-prompts', 'portrait-prompts', 'flight-prompts']) {
  if (fs.existsSync(__dirname + '/' + m + '.js')) ENTRIES.push(...require('./' + m + '.js').entries);
}
// Every entry gets a `group` (the collapsible section inside its tab in art.html), derived by groups.js from its id and title. An entry that sets its own `group` keeps it.
const { groupOf } = require('./groups.js');
for (const e of ENTRIES) if (!e.group) e.group = groupOf(e);
const keep = Object.fromEntries(old.map(e => [e.id, e]));
const entries = ENTRIES.map(e => ({ status: 'draft', versions: [], rejects: [], ...(keep[e.id] ? { status: keep[e.id].status, versions: keep[e.id].versions || [], rejects: keep[e.id].rejects || [] } : {}), ...e, status: keep[e.id] ? keep[e.id].status : 'draft' }));
fs.writeFileSync(out, JSON.stringify({ version: 1, entries }, null, 1) + '\n');
console.log('wrote', out, entries.length, 'entries');
