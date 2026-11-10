// NPC emotion sheets for the Art Library (Tom 2026-11-10: "create the prompts in art library for the emotions sheet for all npcs").
// One entry per person with tagged lines in docs/npc-emotion-lines.tsv: `npc-emotions-<id>` (tab NPCs) for the 56 townspeople,
// `michael-emotions` and `jojo-emotions` (tab Characters) for the two family members without a sheet. Each attaches that person's
// newest approved hero picture and uses ONE generic prompt (prompts/npc-emotion-sheet.txt): the look comes from the attached picture.
// People whose hero is not approved yet get refs [] and a WAIT title; `--refresh` attaches the hero once it is approved.
// Not in make-prompts.js: entries are appended to data/art-prompts.json as text (`node tools/art-library/npc-emotion-prompts.js --append`).
const fs = require('fs');
const PROMPT = fs.readFileSync(__dirname + '/prompts/npc-emotion-sheet.txt', 'utf8').replace(/\n$/, '');
const FAMILY = { michael: { hero: 'michael-hero', who: 'Michael' }, jojo: { hero: 'jojo-hero', who: 'Jojo' } };
const WAIT = ' - WAIT: hero not approved yet, approve the hero first';
// Only an APPROVED hero is attached (the newest version): a draft hero may be a picture Tom has not accepted.
function heroFile(art, id) { const h = art.entries.find(e => e.id === id); return h && h.status === 'approved' && h.versions && h.versions.length ? h.versions[h.versions.length - 1].file : null; }
function build(art) {
  const out = [];
  const mk = (e, id, tab, who, group, heroId) => {
    const f = heroFile(art, heroId);
    return { status: 'draft', versions: [], rejects: [], id, tab, title: `${who}: emotion sheet, 8 feelings, full body (happy, loving, sad, angry, scared, surprised, proud, unimpressed)${f ? ' (hero attached)' : WAIT}`, ar: '2:1', refs: f ? [f] : [], prompt: PROMPT, group };
  };
  for (const h of art.entries.filter(e => e.id.startsWith('npc-photo-'))) {
    const k = h.id.slice(10);
    out.push(mk(h, 'npc-emotions-' + k, 'NPCs', h.title.split(':')[0], h.group, h.id));
  }
  for (const [k, f] of Object.entries(FAMILY)) { const he = art.entries.find(e => e.id === f.hero); out.push(mk(he, k + '-emotions', 'Characters', f.who, he ? he.group : f.who, f.hero)); }
  return out;
}
module.exports = { build, PROMPT };
if (require.main === module) {
  const file = 'data/art-prompts.json', txt = fs.readFileSync(file, 'utf8'), art = JSON.parse(txt);
  const all = build(art), have = new Set(art.entries.map(e => e.id)), add = all.filter(e => !have.has(e.id));
  console.log(all.length, 'wanted,', add.length, 'new');
  if (process.argv.includes('--refresh')) {   // untouched drafts only: new prompt text, hero ref and title
    const want = new Map(all.map(e => [e.id, e])); let n = 0;
    for (const e of art.entries) { const w = want.get(e.id); if (w && e.status === 'draft' && !e.versions.length && !(e.rejects || []).length) { e.prompt = w.prompt; e.refs = w.refs; e.title = w.title; n++; } }
    if (JSON.stringify(JSON.parse(txt), null, 1) !== txt.replace(/\n$/, '')) throw new Error('json does not round-trip');
    fs.writeFileSync(file, JSON.stringify(art, null, 1) + (txt.endsWith('\n') ? '\n' : '')); console.log(n, 'entries refreshed'); process.exit(0);
  }
  if (process.argv.includes('--append')) {
    const tail = '\n ]\n}', body = txt.replace(/\n$/, '');
    if (!body.endsWith(tail)) throw new Error('unexpected json tail');
    const chunk = add.map(e => JSON.stringify(e, null, 1).split('\n').map(l => '  ' + l).join('\n')).join(',\n');
    fs.writeFileSync(file, body.slice(0, -tail.length) + ',\n' + chunk + '\n ]\n}' + (txt.endsWith('\n') ? '\n' : '')); console.log('appended', add.length);
  }
}
