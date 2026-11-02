#!/usr/bin/env node
// Builds data/art-prompts.json. Claude edits the ENTRIES list below (or adds files) and reruns: node tools/art-library/make-prompts.js
// Entry fields: id, tab (Characters|Areas|Rooms|Props|Enemies), title, prompt, refs (repo paths, max 5), ar (aspect ratio), status.
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
];
const keep = Object.fromEntries(old.map(e => [e.id, e]));
const entries = ENTRIES.map(e => ({ status: 'draft', versions: [], rejects: [], ...(keep[e.id] ? { status: keep[e.id].status, versions: keep[e.id].versions || [], rejects: keep[e.id].rejects || [] } : {}), ...e, status: keep[e.id] ? keep[e.id].status : 'draft' }));
fs.writeFileSync(out, JSON.stringify({ version: 1, entries }, null, 1) + '\n');
console.log('wrote', out, entries.length, 'entries');
