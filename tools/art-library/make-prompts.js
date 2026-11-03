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
  { id: 'grace-hero', tab: 'Characters', title: 'Grace: hero pose (cozy sweats, new style)', ar: '2:3', refs: ['docs/reference/style_key_v1.png', 'docs/reference/school_style_ref.png', 'docs/reference/height_chart_v1.png', 'tools/sprite-bake/src/grace-hero-v2.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-hero.txt', 'utf8').trim() },
  { id: 'grace-hero-scene', tab: 'Characters', title: 'Grace: hero pose step 1, painted in the school yard', ar: '4:3', refs: ['docs/reference/school_style_ref.png', 'tools/sprite-bake/src/grace-hero-v2.png', 'docs/reference/style_key_v1.png', 'docs/reference/height_chart_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-hero-scene.txt', 'utf8').trim() },
  { id: 'grace-hero-cut', tab: 'Characters', title: 'Grace: hero pose step 2, cut out on magenta (needs step 1 approved)', ar: '4:3', refs: ['tools/sprite-bake/src/grace-hero-scene-v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-hero-cut.txt', 'utf8').trim() },
  { id: 'grace-walk', tab: 'Characters', title: 'Grace: walking sheet 3 x 3 (painted, on magenta)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-hero-cutai-v1.png', 'docs/reference/style_key_v1.png', 'docs/reference/height_chart_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk.txt', 'utf8').trim() },
  { id: 'grace-walk-side', tab: 'Characters', title: 'Grace: walking strip, side view, facing left (3 frames)', ar: '2:1', refs: ['tools/sprite-bake/src/grace-hero-cutai-v1.png', 'docs/reference/style_key_v1.png', 'docs/reference/height_chart_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-side.txt', 'utf8').trim() },
  { id: 'grace-walk-front', tab: 'Characters', title: 'Grace: walking strip, front view (3 frames)', ar: '2:1', refs: ['tools/sprite-bake/src/grace-hero-cutai-v1.png', 'docs/reference/style_key_v1.png', 'docs/reference/height_chart_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-front.txt', 'utf8').trim() },
  { id: 'grace-walk-back', tab: 'Characters', title: 'Grace: walking strip, back view (3 frames)', ar: '2:1', refs: ['tools/sprite-bake/src/grace-hero-cutai-v1.png', 'docs/reference/style_key_v1.png', 'docs/reference/height_chart_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-walk-back.txt', 'utf8').trim() },
  { id: 'grace-stand-front-straight', tab: 'Characters', title: 'Grace walk 0: front stand, face turned straight to camera (run before the front step)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-stand-front-level.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-stand-front-straight.txt', 'utf8').trim() },
  { id: 'grace-step-front', tab: 'Characters', title: 'Grace walk 1 of 4: front step (edit of her straight front stand)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-stand-front-straight.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-step-front.txt', 'utf8').trim() },
  { id: 'grace-step-front-b', tab: 'Characters', title: 'Grace walk 1b: second front step, other leg (edit of front step 1)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-step-front-a.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-step-front-b.txt', 'utf8').trim() },
  { id: 'grace-step-back', tab: 'Characters', title: 'Grace walk 2 of 4: back step (edit of her back stand)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-stand-back.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-step-back.txt', 'utf8').trim() },
  { id: 'grace-step-side-a', tab: 'Characters', title: 'Grace walk 3 of 4: side step A, heel down (edit of her side stand)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-stand-side.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-step-side-a.txt', 'utf8').trim() },
  { id: 'grace-step-side-b', tab: 'Characters', title: 'Grace walk 4 of 4: side step B, legs passing (edit of her side stand)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-stand-side.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-step-side-b.txt', 'utf8').trim() },
  { id: 'grace-stand-front-bighead', tab: 'Characters', title: 'Grace walk 0 TEST: front stand with a bigger head, about 30 percent of her height (edit of her straight front stand)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-walk-v3-stand-front-straight.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-stand-front-bighead.txt', 'utf8').trim() },
  { id: 'grace-stand-front-bighead-paint', tab: 'Characters', title: 'Grace walk 0 TEST 2: repaint the big-head stand in the painted style (the big-head picture first, her painted hero as the style guide)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-stand-front-bighead-v1.jpg', 'tools/sprite-bake/src/grace-hero-cutai-v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-stand-front-bighead-paint.txt', 'utf8').trim() },
  { id: 'grace-stand-front-bighead-fresh', tab: 'Characters', title: 'Grace walk 0 TEST 3: fresh big-head stand from her real photo and her painted hero (add her photo first)', ar: '1:1', own: { slot: 'grace-photo', label: 'Photo of the real Grace (face clear)' }, refs: ['tools/sprite-bake/src/grace-hero-scene-v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-stand-front-bighead-fresh.txt', 'utf8').trim() },
  { id: 'grace-stand-front-bighead-style', tab: 'Characters', title: 'Grace walk 0 TEST 4: like TEST 3 plus the game style key as a painting-style guide (uses the photo you added)', ar: '1:1', own: { slot: 'grace-photo', label: 'Photo of the real Grace (face clear)' }, refs: ['tools/sprite-bake/src/grace-hero-scene-v1.png', 'docs/reference/style_key_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-stand-front-bighead-fresh-style.txt', 'utf8').trim() },
  { id: 'grace-stand-front-scene', tab: 'Characters', title: 'Grace walk 0 TEST 5 step 1: big-head front stand painted inside the school yard (uses the photo you added)', ar: '4:3', own: { slot: 'grace-photo', label: 'Photo of the real Grace (face clear)', at: 1 }, refs: ['docs/reference/school_style_ref.png', 'tools/sprite-bake/src/grace-hero-scene-v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-stand-front-scene.txt', 'utf8').trim() },
  { id: 'grace-stand-front-scene-cut', tab: 'Characters', title: 'Grace walk 0 TEST 5 step 2: cut her out onto magenta (approve step 1 first)', ar: '4:3', refs: ['art/raw/characters/grace-stand-front-scene-v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-hero-cut.txt', 'utf8').trim() },
  { id: 'grace-battle', tab: 'Characters', title: 'Grace: battle sheet 4 x 4 (painted, on magenta)', ar: '1:1', refs: ['tools/sprite-bake/src/grace-hero-cutai-v1.png', 'docs/reference/style_key_v1.png', 'docs/reference/height_chart_v1.png'],
    prompt: fs.readFileSync('tools/art-library/prompts/grace-battle.txt', 'utf8').trim() },
];
// One module per tab group, each exports { entries }. A module that does not exist yet is skipped.
for (const m of ['party-prompts', 'party2-prompts', 'npc-prompts', 'enemy-prompts', 'area-prompts', 'room-prompts', 'prop-prompts', 'battle-prompts', 'title-prompts', 'portrait-prompts', 'flight-prompts']) {
  if (fs.existsSync(__dirname + '/' + m + '.js')) ENTRIES.push(...require('./' + m + '.js').entries);
}
// Every entry gets a `group` (the collapsible section inside its tab in art.html), derived by groups.js from its id and title. An entry that sets its own `group` keeps it.
const { groupOf } = require('./groups.js');
for (const e of ENTRIES) if (!e.group) e.group = groupOf(e);
const keep = Object.fromEntries(old.map(e => [e.id, e]));
const entries = ENTRIES.map(e => ({ status: 'draft', versions: [], rejects: [], ...(keep[e.id] ? { status: keep[e.id].status, versions: keep[e.id].versions || [], rejects: keep[e.id].rejects || [] } : {}), ...e, status: keep[e.id] ? keep[e.id].status : 'draft' }));
fs.writeFileSync(out, JSON.stringify({ version: 1, entries }, null, 1) + '\n');
console.log('wrote', out, entries.length, 'entries');
